import { birdeyeService } from './birdeyeApi';
import { isMemecoin, classifyToken } from './memecoinFilter';

interface PriceAlert {
  tokenAddress: string;
  tokenSymbol: string;
  previousPrice: number;
  currentPrice: number;
  changePercent: number;
  timestamp: Date;
  alertType: 'pump' | 'dump' | 'volatility';
}

interface TokenPriceHistory {
  tokenAddress: string;
  tokenSymbol: string;
  prices: Array<{
    price: number;
    timestamp: number;
  }>;
  lastChecked: number;
}

class PriceMonitorService {
  private priceHistory: Map<string, TokenPriceHistory> = new Map();
  private alerts: PriceAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(alert: PriceAlert) => void> = [];

  private readonly PRICE_CHECK_INTERVAL = 30000;
  private readonly PUMP_THRESHOLD = 10;
  private readonly DUMP_THRESHOLD = -10;
  private readonly VOLATILITY_THRESHOLD = 20;
  private readonly MAX_HISTORY_POINTS = 100;

  startMonitoring(tokens: Array<{ address: string; symbol: string }>) {
    console.log(`🚀 Starting price monitor for ${tokens.length} tokens...`);

    tokens.forEach(token => {
      if (!this.priceHistory.has(token.address)) {
        this.priceHistory.set(token.address, {
          tokenAddress: token.address,
          tokenSymbol: token.symbol,
          prices: [],
          lastChecked: 0
        });
      }
    });

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.checkPrices();

    this.monitoringInterval = setInterval(() => {
      this.checkPrices();
    }, this.PRICE_CHECK_INTERVAL);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️  Price monitoring stopped');
    }
  }

  private async checkPrices() {
    const now = Date.now();
    const tokensToCheck = Array.from(this.priceHistory.keys());

    if (tokensToCheck.length === 0) return;

    console.log(`🔍 Checking prices for ${tokensToCheck.length} tokens...`);

    try {
      const prices = await birdeyeService.getMultipleTokenPrices(tokensToCheck);

      for (const [address, priceData] of Object.entries(prices)) {
        const history = this.priceHistory.get(address);
        if (!history) continue;

        const currentPrice = priceData.value;
        if (!currentPrice || currentPrice <= 0) continue;

        history.prices.push({
          price: currentPrice,
          timestamp: now
        });

        if (history.prices.length > this.MAX_HISTORY_POINTS) {
          history.prices.shift();
        }

        if (history.prices.length >= 2) {
          const previousPrice = history.prices[history.prices.length - 2].price;
          const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

          if (Math.abs(changePercent) >= 5) {
            this.checkForAlert(history, previousPrice, currentPrice, changePercent);
          }
        }

        history.lastChecked = now;
      }
    } catch (error) {
      console.error('❌ Error checking prices:', error);
    }
  }

  private checkForAlert(
    history: TokenPriceHistory,
    previousPrice: number,
    currentPrice: number,
    changePercent: number
  ) {
    const classification = classifyToken(history.tokenSymbol);

    if (!classification.isMemecoin) return;

    let alertType: 'pump' | 'dump' | 'volatility';

    if (changePercent >= this.PUMP_THRESHOLD) {
      alertType = 'pump';
    } else if (changePercent <= this.DUMP_THRESHOLD) {
      alertType = 'dump';
    } else if (Math.abs(changePercent) >= this.VOLATILITY_THRESHOLD) {
      alertType = 'volatility';
    } else {
      return;
    }

    const alert: PriceAlert = {
      tokenAddress: history.tokenAddress,
      tokenSymbol: history.tokenSymbol,
      previousPrice,
      currentPrice,
      changePercent,
      timestamp: new Date(),
      alertType
    };

    this.alerts.push(alert);

    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    this.notifyListeners(alert);

    this.logAlert(alert);
  }

  private logAlert(alert: PriceAlert) {
    const emoji = alert.alertType === 'pump' ? '🚀' : alert.alertType === 'dump' ? '📉' : '⚡';
    const sign = alert.changePercent > 0 ? '+' : '';

    console.log(`\n${emoji} PRICE ALERT: ${alert.tokenSymbol}`);
    console.log(`   Type: ${alert.alertType.toUpperCase()}`);
    console.log(`   Previous: $${alert.previousPrice.toFixed(8)}`);
    console.log(`   Current: $${alert.currentPrice.toFixed(8)}`);
    console.log(`   Change: ${sign}${alert.changePercent.toFixed(2)}%`);
    console.log(`   Time: ${alert.timestamp.toLocaleString()}`);
  }

  onPriceAlert(callback: (alert: PriceAlert) => void) {
    this.listeners.push(callback);
  }

  private notifyListeners(alert: PriceAlert) {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  getRecentAlerts(count: number = 20): PriceAlert[] {
    return this.alerts.slice(-count).reverse();
  }

  getTokenPriceHistory(tokenAddress: string): TokenPriceHistory | null {
    return this.priceHistory.get(tokenAddress) || null;
  }

  addToken(address: string, symbol: string) {
    if (!this.priceHistory.has(address)) {
      this.priceHistory.set(address, {
        tokenAddress: address,
        tokenSymbol: symbol,
        prices: [],
        lastChecked: 0
      });
      console.log(`➕ Added ${symbol} to price monitoring`);
    }
  }

  removeToken(address: string) {
    if (this.priceHistory.delete(address)) {
      console.log(`➖ Removed token from price monitoring`);
    }
  }

  getMonitoredTokens(): Array<{ address: string; symbol: string }> {
    return Array.from(this.priceHistory.values()).map(history => ({
      address: history.tokenAddress,
      symbol: history.tokenSymbol
    }));
  }

  clearHistory() {
    this.priceHistory.clear();
    this.alerts = [];
    console.log('🗑️  Price history and alerts cleared');
  }
}

export const priceMonitor = new PriceMonitorService();
export type { PriceAlert, TokenPriceHistory };
