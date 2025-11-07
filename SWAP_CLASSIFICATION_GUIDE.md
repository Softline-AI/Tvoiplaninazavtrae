# SWAP Transaction Classification Guide

## Overview

This guide explains how the system correctly identifies BUY and SELL operations in SWAP transactions on Solana using a comprehensive multi-layered classification approach with validation, detailed logging, and fallback logic.

## Classification Rules (Priority Order)

### PRIMARY RULES (Highest Confidence - SOL Amount Based)

#### 1. SWAP SOL → Token = BUY
**Indicators:**
- Trader spends SOL: `sol_amount` < 0 (negative)
- Trader receives token: `amount` > 0 (positive)

**Example:**
```
SOL Amount: -5.0 (spent 5 SOL)
Token Amount: +1000 (received 1000 POPCAT)
Classification: BUY
Confidence: HIGH
```

**Real Transaction Example:**
```typescript
{
  transaction_type: "SWAP",
  token_mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  amount: 1000,        // Received 1000 POPCAT
  sol_amount: -5.0,    // Spent 5 SOL
  // Result: BUY
}
```

#### 2. SWAP Token → SOL = SELL
**Indicators:**
- Trader sends token: `amount` < 0 (negative)
- Trader receives SOL: `sol_amount` > 0 (positive)

**Example:**
```
Token Amount: -1000 (sent 1000 POPCAT)
SOL Amount: +5.0 (received 5 SOL)
Classification: SELL
Confidence: HIGH
```

**Real Transaction Example:**
```typescript
{
  transaction_type: "SWAP",
  token_mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  amount: -1000,       // Sent 1000 POPCAT
  sol_amount: 5.0,     // Received 5 SOL
  // Result: SELL
}
```

#### 3. Edge Cases (Unusual Patterns)

**Both Positive (Receiving SOL + Tokens):**
```typescript
sol_amount: +2.0
amount: +500
// Classification: BUY (favor token reception)
// Confidence: MEDIUM
```

**Both Negative (Sending SOL + Tokens):**
```typescript
sol_amount: -2.0
amount: -500
// Classification: SELL (favor token disposition)
// Confidence: MEDIUM
```

### SECONDARY RULES (Native Balance Change)

Used when `sol_amount` is not available but `native_balance_change` is present.

#### 4. Balance Decrease + Token Increase = BUY
```typescript
{
  native_balance_change: -5.0,  // SOL balance decreased
  amount: +1000,                 // Tokens increased
  // Classification: BUY
  // Confidence: MEDIUM
}
```

#### 5. Balance Increase + Token Decrease = SELL
```typescript
{
  native_balance_change: +5.0,  // SOL balance increased
  amount: -1000,                 // Tokens decreased
  // Classification: SELL
  // Confidence: MEDIUM
}
```

#### 6. Inconsistent Patterns

**Both Decreased:**
```typescript
native_balance_change: -2.0
amount: -500
// Classification: SELL (both going out)
// Confidence: LOW
```

**Both Increased:**
```typescript
native_balance_change: +2.0
amount: +500
// Classification: BUY (both coming in)
// Confidence: LOW
```

### FALLBACK RULES (Amount-Based Only)

Used when no SOL information is available.

#### 7. Positive Token Amount = BUY
```typescript
amount: +1000
// Classification: BUY (receiving tokens)
// Confidence: LOW
```

#### 8. Negative Token Amount = SELL
```typescript
amount: -1000
// Classification: SELL (sending tokens)
// Confidence: LOW
```

## Implementation Details

### Database Schema

**New Fields in `webhook_transactions` table:**

```sql
ALTER TABLE webhook_transactions
  ADD COLUMN sol_amount numeric,
  ADD COLUMN native_balance_change numeric;
```

**Field Descriptions:**
- `sol_amount` - Net SOL movement for the wallet
  - Negative = SOL spent (buying tokens)
  - Positive = SOL received (selling tokens)
  - Zero = No SOL involved (token-to-token swap)

- `native_balance_change` - Wallet's native SOL balance change
  - Includes SOL spent/received plus fees

### Transaction Type Mapper

**File:** `src/services/transactionTypeMapper.ts`

#### Key Functions

**1. classifySwapTransaction()**
Primary classification logic with detailed logging:

```typescript
export function classifySwapTransaction(
  tokenMint: string,
  amount: number,
  solAmount?: number,
  nativeBalanceChange?: number
): TransactionAction {
  // PRIMARY: Check SOL amount
  if (solAmount !== undefined && solAmount !== 0) {
    if (solAmount < 0 && amount > 0) return 'BUY';
    if (solAmount > 0 && amount < 0) return 'SELL';
    // Edge cases...
  }

  // SECONDARY: Check native balance change
  if (nativeBalanceChange !== undefined && nativeBalanceChange !== 0) {
    if (nativeBalanceChange < 0 && amount > 0) return 'BUY';
    if (nativeBalanceChange > 0 && amount < 0) return 'SELL';
    // Inconsistencies...
  }

  // FALLBACK: Amount-based
  if (amount > 0) return 'BUY';
  if (amount < 0) return 'SELL';

  return 'UNKNOWN';
}
```

**2. mapTransactionType()**
Routes transactions to appropriate classification logic:

```typescript
export function mapTransactionType(
  transactionType: string,
  tokenMint?: string,
  amount?: number,
  additionalContext?: any
): TransactionAction {
  // Check for explicit BUY/SELL labels
  if (isBuyType(type)) return 'BUY';
  if (isSellType(type)) return 'SELL';

  // Analyze SWAP transactions
  if (isSwapType(type)) {
    return classifySwapTransaction(
      tokenMint,
      amount,
      context.solAmount,
      context.nativeBalanceChange
    );
  }

  // Handle TRANSFERs and unknown types
  // ...
}
```

**3. classifyTransactionWithContext()**
Validates and parses complete transaction data:

```typescript
export function classifyTransactionWithContext(transaction: {
  transaction_type: string;
  token_mint: string;
  amount: string | number;
  sol_amount?: string | number;
  native_balance_change?: number;
  // ...
}): TransactionAction {
  // Validate required fields
  // Parse numeric values
  // Build context
  // Call mapper
  // Return result with logging
}
```

### Edge Function

**File:** `supabase/functions/helius-webhook/index.ts`

#### SOL Extraction Logic

**1. Extract from Native Transfers:**
```typescript
if (data.nativeTransfers && data.nativeTransfers.length > 0) {
  for (const transfer of data.nativeTransfers) {
    const solValue = transfer.amount / 1_000_000_000;

    if (transfer.fromUserAccount === walletAddress) {
      solAmount -= solValue;  // Spent
    }
    if (transfer.toUserAccount === walletAddress) {
      solAmount += solValue;  // Received
    }
  }
}
```

**2. Extract from Account Data:**
```typescript
if (data.accountData && data.accountData.length > 0) {
  const walletAccount = data.accountData.find(
    acc => acc.account === walletAddress
  );

  if (walletAccount?.nativeBalanceChange) {
    nativeBalanceChange = walletAccount.nativeBalanceChange / 1_000_000_000;
  }
}
```

**3. Store in Database:**
```typescript
const transactionData = {
  // ... other fields
  sol_amount: solAmount.toString(),
  native_balance_change: nativeBalanceChange.toString(),
  // ...
};
```

### Frontend Integration

**File:** `src/services/aggregatedPnlService.ts`

Automatic classification during P&L calculation:

```typescript
for (const tx of transactions) {
  // Classify using enhanced context
  const action = classifyTransactionWithContext(tx);

  if (action === 'BUY') {
    position.totalBought += amount;
    position.totalBuyValue += value;
    position.remainingTokens += amount;
  } else if (action === 'SELL') {
    position.totalSold += amount;
    position.totalSellValue += value;
    position.remainingTokens -= amount;
  }
}
```

## Logging and Debugging

### Console Logs

The system provides detailed logging at each step:

**1. SWAP Classification:**
```
[SWAP Classification] Token: 7GCihg..., Amount: 1000, SOL: -5.0, Balance Change: -5.1
[SWAP Classification] ✓ BUY: Spending 5.0 SOL to get 1000 tokens
```

**2. Type Mapper:**
```
[Type Mapper] Input: SWAP, Token: 7GCihg..., Amount: 1000
[Type Mapper] SWAP detected, analyzing...
[Type Mapper] ✓ SWAP classified as: BUY
```

**3. Context Classifier:**
```
[Context Classifier] Processing transaction from DHgA2hF...
[Context Classifier] Parsed: Amount=1000, SOL=-5.0, NativeChange=-5.1
[Context Classifier] ✓ Final classification: BUY
```

## Benefits

1. **High Accuracy:** Multi-layered approach with fallbacks
2. **Detailed Validation:** Checks for inconsistencies and edge cases
3. **Comprehensive Logging:** Easy debugging with detailed console output
4. **Better P&L:** Accurate position tracking leads to correct profit/loss
5. **Historical Compatibility:** Works with both old and new data
6. **Edge Case Handling:** Manages unusual transaction patterns

## Testing

### Verification Steps

1. **Check Edge Function Logs:**
   ```
   View logs in Supabase Dashboard > Edge Functions > helius-webhook
   Look for "SOL Amount:" and classification results
   ```

2. **Query Database:**
   ```sql
   SELECT
     transaction_signature,
     transaction_type,
     amount,
     sol_amount,
     native_balance_change
   FROM webhook_transactions
   WHERE transaction_type = 'SWAP'
   ORDER BY block_time DESC
   LIMIT 10;
   ```

3. **Verify UI Display:**
   - Open KOL Profile or transaction feed
   - Check that SWAP transactions show correct BUY/SELL labels
   - Verify P&L calculations are accurate

### Test Cases

**Case 1: Simple SOL to Token BUY**
```typescript
Input: {
  transaction_type: "SWAP",
  amount: 1000,
  sol_amount: -5.0
}
Expected: BUY
```

**Case 2: Simple Token to SOL SELL**
```typescript
Input: {
  transaction_type: "SWAP",
  amount: -1000,
  sol_amount: 5.0
}
Expected: SELL
```

**Case 3: Missing SOL Data (Fallback)**
```typescript
Input: {
  transaction_type: "SWAP",
  amount: 1000,
  sol_amount: null
}
Expected: BUY (from positive amount)
```

**Case 4: Token-to-Token Swap**
```typescript
Input: {
  transaction_type: "SWAP",
  amount: 500,        // Received Token A
  sol_amount: 0,      // No SOL involved
  // (Token B was sent)
}
Expected: BUY (for Token A)
```

## Troubleshooting

### Common Issues

**1. Transactions showing as UNKNOWN:**
- Check if `sol_amount` is being extracted correctly
- Verify amount field is not null or zero
- Review Edge Function logs for errors

**2. Incorrect BUY/SELL classification:**
- Verify SOL amount sign (negative = spent, positive = received)
- Check token amount sign matches expectation
- Look for unusual edge cases in logs

**3. Missing classification data:**
- Ensure webhook is receiving complete transaction data from Helius
- Verify database migration applied successfully
- Check Edge Function is deployed with latest code

### Debug Commands

**View recent SWAP transactions:**
```sql
SELECT
  transaction_signature,
  transaction_type,
  amount::numeric,
  sol_amount::numeric,
  token_symbol,
  block_time
FROM webhook_transactions
WHERE transaction_type = 'SWAP'
ORDER BY block_time DESC
LIMIT 20;
```

**Check classification distribution:**
```sql
SELECT
  transaction_type,
  CASE
    WHEN sol_amount::numeric < 0 AND amount::numeric > 0 THEN 'BUY'
    WHEN sol_amount::numeric > 0 AND amount::numeric < 0 THEN 'SELL'
    ELSE 'OTHER'
  END as classification,
  COUNT(*) as count
FROM webhook_transactions
WHERE transaction_type = 'SWAP'
GROUP BY transaction_type, classification;
```

## Migration

**Migration File:** `supabase/migrations/add_sol_amount_to_transactions.sql`

Safely adds new columns without affecting existing data:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webhook_transactions'
    AND column_name = 'sol_amount'
  ) THEN
    ALTER TABLE webhook_transactions
    ADD COLUMN sol_amount numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webhook_transactions'
    AND column_name = 'native_balance_change'
  ) THEN
    ALTER TABLE webhook_transactions
    ADD COLUMN native_balance_change numeric;
  END IF;
END $$;
```

## Future Improvements

1. **Machine Learning:** Train model on historical data for better classification
2. **Confidence Scores:** Return confidence level with each classification
3. **Multi-Token Swaps:** Better handling of complex multi-leg swaps
4. **Historical Reclassification:** Batch update old transactions with new logic
5. **Performance Metrics:** Track classification accuracy over time
