# Memecoin Tracking System

Complete documentation for the memecoin monitoring and tracking system.

## Overview

This system provides comprehensive memecoin tracking with:
- Real-time price monitoring
- Automatic classification (memecoins vs stablecoins vs blue chips)
- P&L tracking with category breakdown
- Price alerts and notifications
- Multi-chain support via Birdeye API

## Architecture

### Services

#### 1. **memecoinFilter.ts**
Token classification service that categorizes tokens into:

**Memecoin Categories:**
- Dog Memes: DOGE, SHIB, FLOKI, BONK, WIF, MYRO
- Frog Memes: PEPE, APU, BOBO, WOJAK, PONKE
- Cat Memes: POPCAT, MEW, CATCOIN
- Political Memes: TRUMP, BIDEN, MAGA
- AI/Tech Memes: TURBO, GROK, GPT
- Solana Memes: WEN, SILLY, SLERF, SMOG

**Other Classifications:**
- Stablecoins: USDT, USDC, DAI, USD1
- Blue Chips: BTC, ETH, SOL, BNB

```typescript
import { classifyToken, isMemecoin } from './services/memecoinFilter';

const classification = classifyToken('PEPE');
// { isMemecoin: true, category: 'Frog Memes', riskLevel: 'extreme' }

if (isMemecoin('DOGE')) {
  console.log('This is a memecoin!');
}
```

#### 2. **priceMonitor.ts**
Real-time price monitoring with configurable alerts:

```typescript
import { priceMonitor } from './services/priceMonitor';

// Start monitoring tokens
priceMonitor.startMonitoring([
  { address: 'EPjFWdd...', symbol: 'PEPE' },
  { address: 'So11111...', symbol: 'WIF' }
]);

// Listen for price alerts
priceMonitor.onPriceAlert((alert) => {
  console.log(`${alert.tokenSymbol}: ${alert.changePercent}%`);
  // Trigger notifications, sounds, etc.
});
```

**Alert Types:**
- `pump`: Price increased > 10%
- `dump`: Price decreased > 10%
- `volatility`: Price changed > 20%

#### 3. **memecoinPnlTracker.ts**
Track P&L for memecoin positions:

```typescript
import { memecoinPnlTracker } from './services/memecoinPnlTracker';

// Get all memecoin positions for a wallet
const positions = await memecoinPnlTracker.getMemecoinPositions(walletAddress);

// positions = [
//   {
//     tokenSymbol: 'PEPE',
//     category: 'Frog Memes',
//     totalPnl: 523.45,
//     pnlPercentage: 52.3,
//     realizedPnl: 200.00,
//     unrealizedPnl: 323.45
//   }
// ]
```

#### 4. **birdeyeApi.ts** (Enhanced)
Multi-chain token data via Birdeye:

```typescript
import { birdeyeService } from './services/birdeyeApi';

// Get single token price
const price = await birdeyeService.getTokenPrice(tokenAddress);

// Get multiple token prices (batch)
const prices = await birdeyeService.getMultipleTokenPrices([addr1, addr2]);

// Get trending tokens
const trending = await birdeyeService.getTrendingTokens('v24hChangePercent', 'desc', 0, 50);
```

## Components

### MemecoinMonitor.tsx

React component for monitoring memecoin prices with alerts:

```tsx
import MemecoinMonitor from './components/MemecoinMonitor';

function App() {
  return <MemecoinMonitor />;
}
```

**Features:**
- Wallet-based position tracking
- Real-time price updates (30s interval)
- Browser notifications
- Sound alerts
- Price change history

## Scripts

### test-memecoin-system.js

Analyze memecoin transactions and generate statistics:

```bash
node scripts/test-memecoin-system.js
```

**Output:**
```
📊 TRANSACTION BREAKDOWN
Total Transactions: 500
Memecoins: 249 (49.8%)
Stablecoins: 108 (21.6%)

🎯 MEMECOIN CATEGORIES
Dog Memes            45 (18.1%)
Frog Memes           23 (9.2%)
Political Memes      15 (6.0%)

🏆 TOP 10 MEMECOINS BY ACTIVITY
PEPE         | Frog Memes         | Trades:  36 | P&L: +$523.45
BONK         | Dog Memes          | Trades:  28 | P&L: +$312.20

👥 TRADERS & MEMECOIN DIVERSITY
CyaE1Vxv... | 35 different memecoins
  └─ PEPE, BONK, WIF, TRUMP, DOGE

💰 MEMECOIN P&L ANALYSIS
Total Memecoin P&L: $1,234.56
Profitable: 42 (35.0%)
Losing: 78 (65.0%)
```

### monitor-transactions.js

Real-time transaction monitoring (still works with new filters):

```bash
node scripts/monitor-transactions.js
```

### check-buy-transactions.js

Analyze BUY transactions with memecoin filtering:

```bash
node scripts/check-buy-transactions.js
```

## Configuration

### Price Monitor Settings

```typescript
// In priceMonitor.ts
private readonly PRICE_CHECK_INTERVAL = 30000; // 30 seconds
private readonly PUMP_THRESHOLD = 10;          // 10% increase
private readonly DUMP_THRESHOLD = -10;         // 10% decrease
private readonly VOLATILITY_THRESHOLD = 20;    // 20% change
```

### Alert Customization

```typescript
priceMonitor.onPriceAlert((alert) => {
  if (alert.alertType === 'pump' && alert.changePercent > 50) {
    // Mega pump alert!
    playUrgentSound();
    sendTelegramMessage(alert);
  }
});
```

## Integration with Helius

The webhook automatically classifies incoming transactions:

```typescript
// In helius-webhook/index.ts
import { classifyToken } from './memecoinFilter';

// When processing webhook data
const classification = classifyToken(tokenSymbol);

if (classification.isMemecoin) {
  // Store with category
  transactionData.category = classification.category;
  transactionData.risk_level = classification.riskLevel;
}
```

## API Reference

### memecoinFilter

```typescript
function classifyToken(symbol: string): MemecoinInfo
function isMemecoin(symbol: string): boolean
function isStablecoin(symbol: string): boolean
function filterMemecoinsOnly(tokens: any[]): any[]
function getAllKnownMemecoins(): string[]
function getMemecoinsInCategory(category: string): string[]
```

### priceMonitor

```typescript
function startMonitoring(tokens: Array<{ address: string; symbol: string }>): void
function stopMonitoring(): void
function onPriceAlert(callback: (alert: PriceAlert) => void): void
function getRecentAlerts(count?: number): PriceAlert[]
function addToken(address: string, symbol: string): void
function removeToken(address: string): void
```

### memecoinPnlTracker

```typescript
async function getMemecoinPositions(walletAddress: string): Promise<MemecoinPosition[]>
async function getMemecoinTrades(walletAddress: string, tokenMint?: string): Promise<MemecoinTrade[]>
async function getTopMemecoinTraders(limit?: number): Promise<TraderStats[]>
async function getMemecoinsOnlyFromFeed(): Promise<any[]>
```

## Best Practices

### 1. Filter Stablecoins

Always filter out stablecoins from memecoin analysis:

```typescript
const transactions = await fetchTransactions();
const memecoins = transactions.filter(tx => isMemecoin(tx.token_symbol));
```

### 2. Use Batch Price Fetching

For multiple tokens, use batch endpoint:

```typescript
// Good
const prices = await birdeyeService.getMultipleTokenPrices(tokenAddresses);

// Bad (rate limited)
for (const address of tokenAddresses) {
  const price = await birdeyeService.getTokenPrice(address);
}
```

### 3. Handle Notifications Properly

Request permission and handle errors:

```typescript
if (Notification.permission === 'default') {
  await Notification.requestPermission();
}

if (Notification.permission === 'granted') {
  new Notification('Price Alert', { body: message });
}
```

### 4. Monitor Performance

Use logging to track API performance:

```typescript
console.log('[Birdeye] ✅ Fetched 50 token prices in 245ms');
```

## Examples

### Complete Memecoin Dashboard

```typescript
import { memecoinPnlTracker } from './services/memecoinPnlTracker';
import { priceMonitor } from './services/priceMonitor';
import { classifyToken } from './services/memecoinFilter';

async function createDashboard(walletAddress: string) {
  // Get positions
  const positions = await memecoinPnlTracker.getMemecoinPositions(walletAddress);

  // Start price monitoring
  const tokens = positions.map(p => ({
    address: p.tokenMint,
    symbol: p.tokenSymbol
  }));
  priceMonitor.startMonitoring(tokens);

  // Setup alerts
  priceMonitor.onPriceAlert((alert) => {
    const classification = classifyToken(alert.tokenSymbol);
    console.log(`${classification.category} alert: ${alert.tokenSymbol} ${alert.changePercent}%`);
  });

  return {
    positions,
    totalPnl: positions.reduce((sum, p) => sum + p.totalPnl, 0),
    categories: positions.reduce((acc, p) => {
      acc[p.category!] = (acc[p.category!] || 0) + 1;
      return acc;
    }, {})
  };
}
```

## Troubleshooting

### No alerts triggering
- Check price check interval isn't too long
- Verify Birdeye API key is valid
- Ensure tokens are being monitored: `priceMonitor.getMonitoredTokens()`

### Classifications incorrect
- Add new tokens to appropriate category in `memecoinFilter.ts`
- Check token symbol matches exactly (case-sensitive)

### P&L calculations wrong
- Verify entry prices are stored correctly in database
- Check that BUY transactions are being captured
- Ensure current prices are fetching successfully

## Future Enhancements

- [ ] Add more memecoin categories (Gaming, Art, etc.)
- [ ] Multi-chain tracking (Ethereum, Base, etc.)
- [ ] Historical price charts
- [ ] Social sentiment analysis
- [ ] Liquidity pool monitoring
- [ ] Rug pull detection
- [ ] Whale movement alerts

## Support

For issues or questions:
- Check logs: `console.log` statements throughout services
- Test classification: `node scripts/test-memecoin-system.js`
- Monitor real-time: `node scripts/monitor-transactions.js`
