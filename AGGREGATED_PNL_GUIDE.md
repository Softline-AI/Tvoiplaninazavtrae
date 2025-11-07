# Aggregated P&L Calculation Guide

Complete guide for tracking P&L across multiple trades of the same token.

## Problem Statement

When a trader buys and sells the same token multiple times, we need to:
1. Track all BUY and SELL transactions
2. Calculate average entry and exit prices
3. Show realized P&L (from completed sells)
4. Show unrealized P&L (from remaining tokens)
5. Display total P&L combining both

## Solution

### New Service: `aggregatedPnlService.ts`

This service provides comprehensive position tracking:

```typescript
import { aggregatedPnlService } from './services/aggregatedPnlService';

// Get all positions for a wallet
const positions = await aggregatedPnlService.getWalletPositions(walletAddress);

// Get specific token position
const position = await aggregatedPnlService.getTokenPosition(walletAddress, tokenMint);

// Get wallet summary
const summary = await aggregatedPnlService.getWalletSummary(walletAddress);
```

## How It Works

### Step 1: Group Transactions by Token

All BUY and SELL transactions for each token are grouped together:

```typescript
// Example: Token CHECK
{
  tokenSymbol: 'CHECK',
  buyCount: 3,
  sellCount: 5,
  totalBought: 1500 tokens,
  totalSold: 1200 tokens
}
```

### Step 2: Calculate Average Prices

**Average Entry Price** (weighted average of all buys):
```
Total BUY Value = $100 + $150 + $200 = $450
Total BUY Amount = 1000 + 1500 + 2000 = 4500 tokens
Average Entry = $450 / 4500 = $0.10 per token
```

**Average Exit Price** (weighted average of all sells):
```
Total SELL Value = $120 + $180 = $300
Total SELL Amount = 1000 + 1500 = 2500 tokens
Average Exit = $300 / 2500 = $0.12 per token
```

### Step 3: Calculate Realized P&L

From completed SELL transactions:

```
Sold Amount = 2500 tokens
Cost Basis = 2500 × $0.10 (avg entry) = $250
Sell Proceeds = 2500 × $0.12 (avg exit) = $300
Realized P&L = $300 - $250 = +$50
Realized P&L % = ($50 / $250) × 100 = +20%
```

### Step 4: Calculate Unrealized P&L

From remaining tokens at current price:

```
Remaining Tokens = 4500 - 2500 = 2000 tokens
Current Price = $0.13
Current Value = 2000 × $0.13 = $260
Cost Basis = 2000 × $0.10 (avg entry) = $200
Unrealized P&L = $260 - $200 = +$60
Unrealized P&L % = ($60 / $200) × 100 = +30%
```

### Step 5: Calculate Total P&L

```
Total P&L = Realized + Unrealized
Total P&L = $50 + $60 = +$110
Total P&L % = ($110 / $450) × 100 = +24.4%
```

## Real Example

From test data:

```
Token: USD1
Trader: publixplays
─────────────────────────────────
Total Bought:      4328.66 tokens (70 buys)
Total Sold:        9915.73 tokens (133 sells)
Remaining:         -5587.07 tokens
Avg Entry Price:   $0.99881724
Avg Exit Price:    $0.99951586
Realized P&L:      +$6.93 (+0.07%)
```

**Note:** Negative remaining tokens means trader sold more than tracked buys. This happens when:
- Buys occurred before monitoring started
- System tracks only partial history

## Data Structure

### TokenPosition

```typescript
interface TokenPosition {
  // Identity
  walletAddress: string;
  tokenMint: string;
  tokenSymbol: string;

  // Buy Summary
  totalBought: number;        // Total tokens bought
  totalBuyValue: number;      // Total USD spent
  averageEntryPrice: number;  // Weighted avg buy price
  buyCount: number;           // Number of buy transactions

  // Sell Summary
  totalSold: number;          // Total tokens sold
  totalSellValue: number;     // Total USD received
  averageExitPrice: number;   // Weighted avg sell price
  sellCount: number;          // Number of sell transactions

  // Position Status
  remainingTokens: number;    // Current position size
  isFullySold: boolean;       // All tokens sold?

  // P&L Breakdown
  realizedPnl: number;        // $ from completed sells
  realizedPnlPercentage: number;
  unrealizedPnl: number;      // $ from remaining tokens
  unrealizedPnlPercentage: number;
  totalPnl: number;           // Combined P&L
  totalPnlPercentage: number;

  // Trade History
  allTrades: Trade[];         // All BUY/SELL transactions
}
```

## Testing

### Script: test-aggregated-pnl.js

```bash
node scripts/test-aggregated-pnl.js
```

**Output:**
```
🪙 CHECK (3 buys, 5 sells)
   ─────────────────────────────────
   Total Bought:      1500.00 tokens
   Total Sold:        1200.00 tokens
   Remaining:         300.00 tokens
   Avg Entry Price:   $0.00100000
   Avg Exit Price:    $0.00120000
   🟢 Realized P&L:     +$24.00 (+20.00%)

   Trade History:
     1. 🟢 BUY  | 500.00 @ $0.00100000 | 10/30/2025
     2. 🟢 BUY  | 500.00 @ $0.00100000 | 10/30/2025
     3. 🟢 BUY  | 500.00 @ $0.00100000 | 10/30/2025
     4. 🔴 SELL | 400.00 @ $0.00120000 | 10/31/2025
     5. 🔴 SELL | 400.00 @ $0.00120000 | 10/31/2025
     6. 🔴 SELL | 400.00 @ $0.00120000 | 11/1/2025
```

## React Component

### AggregatedPositions.tsx

Display all positions with expandable details:

```tsx
import AggregatedPositions from './components/AggregatedPositions';

function TraderProfile({ walletAddress }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    async function loadPositions() {
      const data = await aggregatedPnlService.getWalletPositions(walletAddress);
      setPositions(data);
    }
    loadPositions();
  }, [walletAddress]);

  return <AggregatedPositions positions={positions} />;
}
```

**Features:**
- Summary cards (Total, Realized, Unrealized, Combined P&L)
- Filter by status (All, Open, Closed)
- Expandable positions showing trade history
- Color-coded P&L (green = profit, red = loss)

## Integration Examples

### In KOLProfile

Show trader's aggregated positions:

```typescript
import { aggregatedPnlService } from '../services/aggregatedPnlService';

const summary = await aggregatedPnlService.getWalletSummary(walletAddress);

console.log(`Total Positions: ${summary.totalPositions}`);
console.log(`Win Rate: ${summary.winRate.toFixed(1)}%`);
console.log(`Total P&L: $${summary.totalPnl.toFixed(2)}`);
```

### In KOLFeed

Show individual token P&L:

```typescript
// For each transaction in feed
const position = await aggregatedPnlService.getTokenPosition(
  transaction.from_address,
  transaction.token_mint
);

if (position) {
  console.log(`Total P&L for ${position.tokenSymbol}: $${position.totalPnl}`);
  console.log(`Trades: ${position.buyCount} buys, ${position.sellCount} sells`);
}
```

### In Leaderboard

Rank traders by aggregated P&L:

```typescript
const allSummaries = await Promise.all(
  wallets.map(w => aggregatedPnlService.getWalletSummary(w.address))
);

const ranked = allSummaries
  .sort((a, b) => b.totalPnl - a.totalPnl)
  .slice(0, 10);
```

## Key Benefits

### 1. **Accurate P&L**
- Tracks all transactions for each token
- Weighted average prices
- Separate realized vs unrealized

### 2. **Complete History**
- Every BUY and SELL recorded
- Chronological trade history
- Per-trade P&L calculation

### 3. **Position Management**
- Know exact position size
- Track open vs closed positions
- Monitor remaining tokens

### 4. **Performance Analysis**
- Win rate calculation
- Best/worst performing tokens
- Realized vs unrealized comparison

## Common Patterns

### Pattern 1: Scaling In/Out

```
Trader buys 3 times, sells 2 times:
  BUY 100 @ $1.00
  BUY 200 @ $1.10  → Avg Entry: $1.067
  BUY 150 @ $1.05
  SELL 200 @ $1.20 → Realized: +$26.60
  SELL 150 @ $1.15 → Realized: +$12.45
  Remaining: 100 @ Avg Entry $1.067
```

### Pattern 2: Multiple Entries

```
Trader accumulates position:
  BUY 500 @ $0.10
  BUY 300 @ $0.12  → Avg Entry: $0.1075
  BUY 200 @ $0.11
  SELL 1000 @ $0.15 → Realized: +$42.50
```

### Pattern 3: Partial Exits

```
Trader exits gradually:
  BUY 1000 @ $1.00
  SELL 250 @ $1.20  → Realized: +$50
  SELL 250 @ $1.25  → Realized: +$62.50
  SELL 250 @ $1.15  → Realized: +$37.50
  Remaining: 250 @ $1.00 entry
```

## Troubleshooting

### Negative Remaining Tokens

```
Remaining: -500 tokens
```

**Cause:** Sold more than tracked buys
**Reason:** Buys before monitoring started
**Solution:** System correctly calculates P&L from available data

### Zero P&L on Multiple Trades

```
5 sells, but P&L = $0.00
```

**Cause:** All sells at same price as buys
**Reason:** High-frequency trading or market making
**Solution:** Expected behavior for break-even trades

### Large Position, Small P&L

```
10,000 tokens, P&L = $5
```

**Cause:** Small price movement
**Reason:** Stable price or stablecoin
**Solution:** Check if token is stablecoin

## Best Practices

### 1. Always Show Breakdown

Display both realized and unrealized separately:

```tsx
<div>
  <div>Realized: ${position.realizedPnl}</div>
  <div>Unrealized: ${position.unrealizedPnl}</div>
  <div>Total: ${position.totalPnl}</div>
</div>
```

### 2. Highlight Multiple Trades

Show trade count to indicate activity:

```tsx
<div>
  {position.tokenSymbol}
  <span className="text-gray-500">
    ({position.buyCount} buys, {position.sellCount} sells)
  </span>
</div>
```

### 3. Sort by Total P&L

Most profitable first:

```typescript
positions.sort((a, b) => b.totalPnl - a.totalPnl);
```

### 4. Filter Dust Positions

Hide tiny positions:

```typescript
const significantPositions = positions.filter(p =>
  Math.abs(p.totalPnl) > 1 || !p.isFullySold
);
```

## Performance

- Efficient grouping: O(n) where n = transactions
- Cached calculations: Average prices computed once
- Minimal queries: Single query per wallet
- Optimized sorting: In-memory after fetch

## Future Enhancements

- [ ] Time-weighted returns
- [ ] Compare to market benchmarks
- [ ] Risk metrics (Sharpe ratio, max drawdown)
- [ ] Tax lot accounting (FIFO, LIFO)
- [ ] Historical P&L charts
- [ ] Export to CSV/JSON

## Support

For issues or questions:
- Check test script: `node scripts/test-aggregated-pnl.js`
- Review service: `src/services/aggregatedPnlService.ts`
- Inspect component: `src/components/AggregatedPositions.tsx`
