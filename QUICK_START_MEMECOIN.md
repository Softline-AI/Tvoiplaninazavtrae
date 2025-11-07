# Quick Start: Memecoin Tracking

Get started with memecoin tracking in 5 minutes.

## What's New

✅ **Automatic Memecoin Detection** - System automatically identifies and classifies memecoins
✅ **Real-time Price Monitoring** - Track price changes every 30 seconds
✅ **Smart Alerts** - Get notified of pumps (>10%), dumps (>10%), and volatility (>20%)
✅ **P&L by Category** - See performance by memecoin type (Dog, Frog, Political, etc.)
✅ **Browser Notifications** - Desktop alerts for major price moves
✅ **Sound Alerts** - Audio notifications for important events

## Quick Test

### 1. Analyze Your Transactions

See which memecoins you're trading:

```bash
node scripts/test-memecoin-system.js
```

This will show:
- % of transactions that are memecoins
- Breakdown by category (Dog Memes, Frog Memes, etc.)
- Top memecoins by activity
- Your memecoin diversity
- Total P&L by memecoin

### 2. Check BUY Transactions

See detailed memecoin purchases:

```bash
node scripts/check-buy-transactions.js
```

### 3. Monitor Real-time

Watch for new memecoin transactions:

```bash
node scripts/monitor-transactions.js
```

## In Your App

### Filter to Show Only Memecoins

```typescript
import { filterMemecoinsOnly } from './services/memecoinFilter';

// In any component
const transactions = await fetchTransactions();
const memecoinsOnly = filterMemecoinsOnly(transactions);
```

### Check if Token is a Memecoin

```typescript
import { isMemecoin, classifyToken } from './services/memecoinFilter';

// Simple check
if (isMemecoin('PEPE')) {
  console.log('This is a memecoin!');
}

// Detailed info
const info = classifyToken('BONK');
console.log(info);
// {
//   isMemecoin: true,
//   category: 'Dog Memes',
//   isStablecoin: false,
//   riskLevel: 'extreme'
// }
```

### Monitor Prices with Alerts

```typescript
import { priceMonitor } from './services/priceMonitor';

// Start monitoring
priceMonitor.startMonitoring([
  { address: 'EPjFWdd...', symbol: 'PEPE' },
  { address: 'DezXAZ8...', symbol: 'BONK' }
]);

// Get alerts
priceMonitor.onPriceAlert((alert) => {
  console.log(`🚀 ${alert.tokenSymbol} ${alert.changePercent}%`);
});
```

### Track Memecoin P&L

```typescript
import { memecoinPnlTracker } from './services/memecoinPnlTracker';

const positions = await memecoinPnlTracker.getMemecoinPositions(
  'YOUR_WALLET_ADDRESS'
);

positions.forEach(position => {
  console.log(`${position.tokenSymbol}: $${position.totalPnl}`);
});
```

## Memecoin Categories

The system recognizes these categories:

### 🐕 Dog Memes
DOGE, SHIB, FLOKI, BONK, WIF, MYRO, SAMO, CHEEMS

### 🐸 Frog Memes
PEPE, APU, BOBO, WOJAK, PONKE, BOME

### 🐱 Cat Memes
POPCAT, MEW, CATCOIN, NEKO, SMOL

### 🎭 Political Memes
TRUMP, BIDEN, MAGA, TREMP, BODEN

### 🤖 AI/Tech Memes
TURBO, GROK, AI, GPT, CHATGPT, TRUTH

### ⚡ Solana Memes
WEN, SILLY, SLERF, SMOG, BOOK, HARAMBE

## Examples

### Filter KOL Feed to Memecoins Only

```typescript
// In KOLFeed.tsx or similar
import { isMemecoin } from '../services/memecoinFilter';

const filteredTransactions = transactions.filter(tx =>
  isMemecoin(tx.token_symbol)
);
```

### Show Category Badge

```tsx
import { classifyToken } from '../services/memecoinFilter';

function TokenBadge({ symbol }) {
  const classification = classifyToken(symbol);

  if (!classification.isMemecoin) return null;

  return (
    <span className="badge">
      {classification.category}
    </span>
  );
}
```

### Alert on Big Memecoin Moves

```typescript
priceMonitor.onPriceAlert((alert) => {
  const classification = classifyToken(alert.tokenSymbol);

  if (classification.isMemecoin && Math.abs(alert.changePercent) > 20) {
    // Big memecoin move!
    sendTelegramAlert(alert);
    playUrgentSound();
  }
});
```

## Statistics Example

From real data analysis:

```
📊 Last 500 Transactions:
- Memecoins: 249 (49.8%)
- Stablecoins: 108 (21.6%)
- Other: 143 (28.6%)

🏆 Most Active Memecoin: GTA6 (36 trades)
👤 Most Diverse Trader: 35 different memecoins
```

## Configuration

### Adjust Alert Thresholds

Edit `src/services/priceMonitor.ts`:

```typescript
private readonly PUMP_THRESHOLD = 10;    // % increase for alert
private readonly DUMP_THRESHOLD = -10;   // % decrease for alert
private readonly VOLATILITY_THRESHOLD = 20; // % volatility alert
```

### Add New Memecoins

Edit `src/services/memecoinFilter.ts`:

```typescript
const MEMECOIN_CATEGORIES: MemecoinCategory[] = [
  {
    category: 'Your Category',
    tokens: ['TOKEN1', 'TOKEN2', 'TOKEN3'],
    description: 'Your description'
  }
];
```

## Next Steps

1. **Read Full Documentation**: See `MEMECOIN_TRACKING.md`
2. **Test the System**: Run `node scripts/test-memecoin-system.js`
3. **Enable Notifications**: Allow browser notifications in your app
4. **Customize Alerts**: Adjust thresholds to your trading style
5. **Monitor Live**: Use `scripts/monitor-transactions.js`

## Tips

💡 **Focus on Memecoins**: Filter out stablecoins and blue chips for cleaner data
💡 **Watch Categories**: Different memecoin types have different patterns
💡 **Set Alerts Wisely**: Too sensitive = spam, too loose = miss opportunities
💡 **Track Diversity**: Traders with many different memecoins often perform better
💡 **Use Batch APIs**: Always use `getMultipleTokenPrices()` for efficiency

## Support

Need help? Check:
- Full docs: `MEMECOIN_TRACKING.md`
- Scripts: `scripts/README.md`
- API docs: Each service has JSDoc comments
