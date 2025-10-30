# Transaction Processing Logic

## Overview

This document explains how the system processes different transaction types (BUY, SELL, SWAP) and calculates P&L for each trader.

---

## Transaction Types

### 1. BUY Transaction

**Purpose:** Initial entry into a token position

**Logic:**
```typescript
if (transactionType === "BUY") {
  entryPrice = currentPrice;
  tokenPnl = 0;
  tokenPnlPercentage = 0;
}
```

**Behavior:**
- Sets entry price to current token price
- P&L is $0 (no profit/loss on initial buy)
- This price is stored for future SELL/SWAP calculations

**Example:**
```
BUY 1000 BONK @ $0.50
Entry Price: $0.50
P&L: $0
```

---

### 2. SELL Transaction

**Purpose:** Exit from a token position (realized P&L)

**Logic:**
```typescript
if (transactionType === "SELL") {
  entryPrice = await getEntryPrice(wallet, token); // Get first BUY price
  exitPrice = currentPrice;
  tokenPnl = amount * (exitPrice - entryPrice);
  tokenPnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
}
```

**Behavior:**
- Retrieves original BUY entry price from database
- Calculates realized P&L based on price difference
- Uses actual sale price at time of transaction

**Example:**
```
Previous: BUY 1000 BONK @ $0.50
Now: SELL 1000 BONK @ $0.75

Entry Price: $0.50
Exit Price: $0.75
P&L: 1000 * ($0.75 - $0.50) = +$250 (realized)
P&L %: (($0.75 - $0.50) / $0.50) * 100 = +50%
```

---

### 3. SWAP Transaction (NEW LOGIC)

**Purpose:** Exchange one token for another (unrealized P&L)

**Logic:**
```typescript
if (transactionType === "SWAP") {
  const balance = await getTokenBalance(wallet, token);
  const currentHolding = balance.totalBought - balance.totalSold;

  if (currentHolding > 0 && balance.avgEntryPrice > 0) {
    entryPrice = balance.avgEntryPrice;
    unrealizedPnl = currentHolding * (currentPrice - avgEntryPrice);
    tokenPnl = unrealizedPnl;
    tokenPnlPercentage = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;
  } else {
    entryPrice = currentPrice;
    tokenPnl = 0;
    tokenPnlPercentage = 0;
  }
}
```

**Behavior:**
- Calculates average entry price from all BUY transactions
- Determines current holding (bought - sold)
- Shows UNREALIZED P&L based on current market price
- If no previous position, P&L is $0

**Example 1: Existing Position**
```
Previous trades:
- BUY 1000 BONK @ $0.40
- BUY 500 BONK @ $0.60
Total: 1500 BONK, Avg Entry: $0.47

Now: SWAP for BONK (current price: $0.75)

Current Holding: 1500 BONK
Avg Entry Price: $0.47
Current Price: $0.75
Unrealized P&L: 1500 * ($0.75 - $0.47) = +$420 (unrealized)
P&L %: (($0.75 - $0.47) / $0.47) * 100 = +59.6%
```

**Example 2: New Position**
```
No previous BUY for this token
SWAP for BONK (current price: $0.50)

Entry Price: $0.50
P&L: $0 (new position)
```

---

## Key Differences

### OLD Logic (INCORRECT)
```typescript
// SWAP was treated same as BUY
if (transactionType === "BUY" || transactionType === "SWAP") {
  entryPrice = await getEntryPrice(); // Wrong for SWAP
  tokenPnl = amount * ((currentPrice - previousEntry) / previousEntry);
}
```

**Problems:**
- SWAP treated as BUY/SELL
- Incorrect P&L calculations
- Didn't account for current holdings
- No distinction between realized/unrealized

### NEW Logic (CORRECT)
```typescript
// Each type handled separately
if (transactionType === "BUY") { ... }
else if (transactionType === "SELL") { ... }
else if (transactionType === "SWAP") {
  // Calculate unrealized P&L on current holdings
}
```

**Improvements:**
- Clear separation of transaction types
- SWAP shows unrealized P&L on holdings
- Accurate average entry price calculation
- Proper realized vs unrealized distinction

---

## P&L Calculation Functions

### `getEntryPrice()`
```typescript
// Gets FIRST BUY price for a token
async function getEntryPrice(wallet, tokenMint) {
  return await db
    .select("entry_price")
    .eq("transaction_type", "BUY")  // Only BUY, not SWAP
    .order("block_time", "asc")
    .limit(1);
}
```

**Used for:** SELL transactions (realized P&L)

---

### `getTokenBalance()`
```typescript
// Calculates holdings and average entry
async function getTokenBalance(wallet, tokenMint) {
  const buyData = await db.getBuyTransactions();
  const sellData = await db.getSellTransactions();

  const totalBought = sum(buyData.amounts);
  const totalSold = sum(sellData.amounts);
  const totalCost = sum(buyData.amount * price);
  const avgEntryPrice = totalCost / totalBought;

  return { totalBought, totalSold, avgEntryPrice };
}
```

**Used for:** SWAP transactions (unrealized P&L)

---

## Transaction Flow

### Complete Example: Multiple Transactions

```
Step 1: BUY 1000 BONK @ $0.40
├─ Entry: $0.40
├─ P&L: $0
└─ Status: Holding 1000 BONK

Step 2: BUY 500 BONK @ $0.60
├─ Entry: $0.60
├─ P&L: $0
└─ Status: Holding 1500 BONK (avg: $0.47)

Step 3: SWAP (price now $0.75)
├─ Avg Entry: $0.47
├─ Current: $0.75
├─ Unrealized P&L: +$420 (+59.6%)
└─ Status: Holding 1500 BONK

Step 4: SELL 1000 BONK @ $0.80
├─ Entry: $0.40 (from Step 1)
├─ Exit: $0.80
├─ Realized P&L: +$400 (+100%)
└─ Status: Holding 500 BONK

Step 5: SWAP (price now $0.70)
├─ Avg Entry: $0.60 (from Step 2)
├─ Current: $0.70
├─ Unrealized P&L: +$50 (+16.7%)
└─ Status: Holding 500 BONK
```

---

## Database Updates

### Transaction Record
```sql
INSERT INTO webhook_transactions (
  transaction_signature,
  from_address,
  token_mint,
  token_symbol,
  transaction_type,  -- BUY, SELL, or SWAP
  amount,
  token_pnl,
  token_pnl_percentage,
  current_token_price,
  entry_price,
  block_time
) VALUES (...);
```

### KOL Profile Update
```sql
UPDATE kol_profiles
SET
  total_pnl = total_pnl + NEW_PNL,
  total_trades = total_trades + 1,
  total_volume = total_volume + VOLUME,
  win_rate = (profitable_trades / total_trades) * 100,
  updated_at = NOW()
WHERE wallet_address = 'TRADER_WALLET';
```

---

## Win Rate Calculation

```typescript
// Count profitable trades (P&L > 0)
const profitableTrades = transactions.filter(tx => tx.token_pnl > 0);
const winRate = (profitableTrades.length / totalTrades) * 100;
```

**Important:**
- BUY transactions have P&L = $0 (not counted as win/loss)
- SELL transactions with P&L > 0 = WIN
- SWAP with unrealized P&L > 0 = WIN (current)

---

## Price Caching

To avoid excessive API calls, token prices are cached:

```typescript
// Cache duration: 5 minutes
const CACHE_DURATION_MINUTES = 5;

async function getTokenPriceWithCache(tokenMint) {
  const cached = await getCachedPrice(tokenMint);

  if (cached && !expired(cached)) {
    return cached.price;
  }

  const fresh = await fetchFromBirdeye(tokenMint);
  await updateCache(tokenMint, fresh);

  return fresh;
}
```

**Benefits:**
- Reduces Birdeye API calls
- Faster webhook processing
- More reliable for high-frequency traders

---

## Edge Cases

### 1. SELL Without Previous BUY
```
SELL 1000 BONK @ $0.50
No entry price found
→ P&L: $0 (cannot calculate)
```

### 2. SWAP Without Holdings
```
SWAP (never bought this token)
→ P&L: $0 (new position)
```

### 3. Multiple Partial SELLS
```
BUY 1000 BONK @ $0.50
SELL 500 BONK @ $0.75  → P&L: +$125
SELL 500 BONK @ $0.80  → P&L: +$150
Total Realized: +$275
```

### 4. Average Entry Calculation
```
BUY 100 @ $1.00 = $100
BUY 200 @ $2.00 = $400
Total: 300 tokens for $500
Avg Entry: $500 / 300 = $1.67
```

---

## Testing

### Test Case 1: Simple Buy-Sell
```javascript
// BUY
const tx1 = await processWebhook({
  type: "BUY",
  tokenMint: "BONK",
  amount: 1000,
  price: 0.50
});
// Expected: P&L = $0, Entry = $0.50

// SELL
const tx2 = await processWebhook({
  type: "SELL",
  tokenMint: "BONK",
  amount: 1000,
  price: 0.75
});
// Expected: P&L = +$250, Entry = $0.50
```

### Test Case 2: SWAP Unrealized
```javascript
// BUY
await processWebhook({ type: "BUY", amount: 1000, price: 0.40 });

// SWAP
const swap = await processWebhook({
  type: "SWAP",
  tokenMint: "BONK",
  amount: 0,  // Just checking price
  price: 0.75
});
// Expected: Unrealized P&L = +$350
```

---

## Summary

### Transaction Type Matrix

| Type | Entry Price | P&L Calculation | Status |
|------|-------------|-----------------|--------|
| **BUY** | Current price | $0 | New position |
| **SELL** | First BUY price | Realized (exit - entry) * amount | Closed position |
| **SWAP** | Average BUY price | Unrealized (current - avg) * holding | Open position |

### Key Points

1. **BUY** = Entry point, no P&L
2. **SELL** = Exit point, realized P&L
3. **SWAP** = Position check, unrealized P&L
4. Each type uses different calculation method
5. Win rate includes all profitable transactions
6. Price caching reduces API load

---

## Deployment

Edge function deployed to: `https://[project].supabase.co/functions/v1/helius-webhook`

Helius webhook configuration:
- Webhook Type: Enhanced
- Transaction Types: All (SWAP, TRANSFER, etc)
- Wallets: All monitored addresses
- Secret: Configured in Supabase environment
