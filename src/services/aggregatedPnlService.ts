import { supabase } from './supabaseClient';
import { classifyTransactionWithContext, type TransactionAction } from './transactionTypeMapper';

export interface TokenPosition {
  walletAddress: string;
  tokenMint: string;
  tokenSymbol: string;
  tokenName?: string;

  // Buy data
  totalBought: number;
  totalBuyValue: number;
  averageEntryPrice: number;
  buyCount: number;
  firstBuyTime: string;

  // Sell data
  totalSold: number;
  totalSellValue: number;
  averageExitPrice: number;
  sellCount: number;
  lastSellTime?: string;

  // Position status
  remainingTokens: number;
  isFullySold: boolean;

  // P&L breakdown
  realizedPnl: number;          // From completed sells
  realizedPnlPercentage: number;
  unrealizedPnl: number;         // From remaining tokens
  unrealizedPnlPercentage: number;
  totalPnl: number;              // Total P&L
  totalPnlPercentage: number;

  // Current market data
  currentPrice: number;
  marketCap: number;

  // Trade history
  allTrades: Array<{
    type: 'BUY' | 'SELL';
    amount: number;
    price: number;
    value: number;
    pnl?: number;
    timestamp: string;
    signature: string;
  }>;
}

export interface WalletPositionSummary {
  walletAddress: string;
  totalPositions: number;
  openPositions: number;
  closedPositions: number;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnl: number;
  winRate: number;
  positions: TokenPosition[];
}

class AggregatedPnlService {
  /**
   * Get all token positions for a wallet with aggregated P&L
   */
  async getWalletPositions(walletAddress: string): Promise<TokenPosition[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .eq('from_address', walletAddress)
        .order('block_time', { ascending: true });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      if (!transactions || transactions.length === 0) {
        return [];
      }

      // Group by token
      const tokenMap = new Map<string, TokenPosition>();

      for (const tx of transactions) {
        // Classify transaction type using the mapper
        const action = classifyTransactionWithContext(tx);

        // Skip UNKNOWN transactions
        if (action === 'UNKNOWN') {
          console.warn(`Unknown transaction type: ${tx.transaction_type} for ${tx.transaction_signature}`);
          continue;
        }

        const tokenMint = tx.token_mint;

        if (!tokenMap.has(tokenMint)) {
          tokenMap.set(tokenMint, {
            walletAddress,
            tokenMint,
            tokenSymbol: tx.token_symbol,
            tokenName: tx.token_name,
            totalBought: 0,
            totalBuyValue: 0,
            averageEntryPrice: 0,
            buyCount: 0,
            firstBuyTime: tx.block_time,
            totalSold: 0,
            totalSellValue: 0,
            averageExitPrice: 0,
            sellCount: 0,
            remainingTokens: 0,
            isFullySold: false,
            realizedPnl: 0,
            realizedPnlPercentage: 0,
            unrealizedPnl: 0,
            unrealizedPnlPercentage: 0,
            totalPnl: 0,
            totalPnlPercentage: 0,
            currentPrice: parseFloat(tx.current_token_price || '0'),
            marketCap: parseFloat(tx.market_cap || '0'),
            allTrades: []
          });
        }

        const position = tokenMap.get(tokenMint)!;
        const amount = parseFloat(tx.amount || '0');
        const price = parseFloat(tx.current_token_price || '0');
        const value = amount * price;

        // Add to trade history with classified action
        position.allTrades.push({
          type: action,
          amount,
          price,
          value,
          timestamp: tx.block_time,
          signature: tx.transaction_signature
        });

        if (action === 'BUY') {
          position.totalBought += amount;
          position.totalBuyValue += value;
          position.buyCount++;
          position.remainingTokens += amount;

          // Update average entry price (weighted average)
          position.averageEntryPrice = position.totalBuyValue / position.totalBought;
        } else if (action === 'SELL') {
          position.totalSold += amount;
          position.totalSellValue += value;
          position.sellCount++;
          position.remainingTokens -= amount;
          position.lastSellTime = tx.block_time;

          // Update average exit price (weighted average)
          if (position.totalSold > 0) {
            position.averageExitPrice = position.totalSellValue / position.totalSold;
          }

          // Calculate realized P&L for this sell
          const costBasis = amount * position.averageEntryPrice;
          const sellProceeds = value;
          const tradePnl = sellProceeds - costBasis;

          position.realizedPnl += tradePnl;

          // Add P&L to trade history
          position.allTrades[position.allTrades.length - 1].pnl = tradePnl;
        }

        // Update current price and market cap to latest
        position.currentPrice = price;
        position.marketCap = parseFloat(tx.market_cap || '0');
      }

      // Calculate final P&L metrics for each position
      const positions = Array.from(tokenMap.values());

      for (const position of positions) {
        // Check if fully sold
        position.isFullySold = Math.abs(position.remainingTokens) < 0.0001;

        // Calculate realized P&L percentage
        if (position.totalBuyValue > 0) {
          position.realizedPnlPercentage = (position.realizedPnl / position.totalBuyValue) * 100;
        }

        // Calculate unrealized P&L from remaining tokens
        if (position.remainingTokens > 0) {
          const currentValue = position.remainingTokens * position.currentPrice;
          const costBasis = position.remainingTokens * position.averageEntryPrice;
          position.unrealizedPnl = currentValue - costBasis;

          if (costBasis > 0) {
            position.unrealizedPnlPercentage = (position.unrealizedPnl / costBasis) * 100;
          }
        }

        // Total P&L
        position.totalPnl = position.realizedPnl + position.unrealizedPnl;

        // Total P&L percentage (based on total investment)
        if (position.totalBuyValue > 0) {
          position.totalPnlPercentage = (position.totalPnl / position.totalBuyValue) * 100;
        }
      }

      // Sort by total P&L (descending)
      return positions.sort((a, b) => b.totalPnl - a.totalPnl);

    } catch (error) {
      console.error('Error calculating positions:', error);
      return [];
    }
  }

  /**
   * Get position for a specific token
   */
  async getTokenPosition(walletAddress: string, tokenMint: string): Promise<TokenPosition | null> {
    const positions = await this.getWalletPositions(walletAddress);
    return positions.find(p => p.tokenMint === tokenMint) || null;
  }

  /**
   * Get wallet summary with all positions
   */
  async getWalletSummary(walletAddress: string): Promise<WalletPositionSummary> {
    const positions = await this.getWalletPositions(walletAddress);

    const openPositions = positions.filter(p => !p.isFullySold);
    const closedPositions = positions.filter(p => p.isFullySold);

    const totalRealizedPnl = positions.reduce((sum, p) => sum + p.realizedPnl, 0);
    const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    const totalPnl = totalRealizedPnl + totalUnrealizedPnl;

    // Calculate win rate (from closed positions)
    const profitablePositions = closedPositions.filter(p => p.realizedPnl > 0);
    const winRate = closedPositions.length > 0
      ? (profitablePositions.length / closedPositions.length) * 100
      : 0;

    return {
      walletAddress,
      totalPositions: positions.length,
      openPositions: openPositions.length,
      closedPositions: closedPositions.length,
      totalRealizedPnl,
      totalUnrealizedPnl,
      totalPnl,
      winRate,
      positions
    };
  }

  /**
   * Get aggregated position across multiple wallets (for KOL leaderboard)
   */
  async getAggregatedPositionsForMultipleWallets(walletAddresses: string[]): Promise<Map<string, TokenPosition[]>> {
    const results = new Map<string, TokenPosition[]>();

    for (const wallet of walletAddresses) {
      const positions = await this.getWalletPositions(wallet);
      results.set(wallet, positions);
    }

    return results;
  }

  /**
   * Get top performing tokens across all wallets
   */
  async getTopPerformingTokens(limit: number = 10): Promise<TokenPosition[]> {
    try {
      const { data: wallets, error } = await supabase
        .from('monitored_wallets')
        .select('wallet_address');

      if (error || !wallets) {
        return [];
      }

      const allPositions: TokenPosition[] = [];

      for (const wallet of wallets) {
        const positions = await this.getWalletPositions(wallet.wallet_address);
        allPositions.push(...positions);
      }

      // Group by token and sum P&L
      const tokenPnlMap = new Map<string, {
        totalPnl: number;
        position: TokenPosition;
        tradeCount: number;
      }>();

      for (const position of allPositions) {
        const key = position.tokenMint;
        if (!tokenPnlMap.has(key)) {
          tokenPnlMap.set(key, {
            totalPnl: position.totalPnl,
            position,
            tradeCount: position.buyCount + position.sellCount
          });
        } else {
          const existing = tokenPnlMap.get(key)!;
          existing.totalPnl += position.totalPnl;
          existing.tradeCount += position.buyCount + position.sellCount;
        }
      }

      // Sort and return top performers
      return Array.from(tokenPnlMap.values())
        .sort((a, b) => b.totalPnl - a.totalPnl)
        .slice(0, limit)
        .map(item => item.position);

    } catch (error) {
      console.error('Error getting top performing tokens:', error);
      return [];
    }
  }
}

export const aggregatedPnlService = new AggregatedPnlService();
