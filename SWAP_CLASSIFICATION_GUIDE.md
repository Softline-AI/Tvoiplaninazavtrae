# SWAP Transaction Classification Guide

## Overview

This guide explains how the system correctly identifies BUY and SELL operations in SWAP transactions on Solana.

## Key Logic

### SWAP Transaction Types

1. **SWAP SOL → Token = BUY**
   - Trader gives SOL (native currency)
   - Trader receives token
   - `sol_amount` < 0 (negative, SOL spent)
   - `amount` > 0 (positive, tokens received)

2. **SWAP Token → SOL = SELL**
   - Trader gives token
   - Trader receives SOL
   - `sol_amount` > 0 (positive, SOL received)
   - `amount` < 0 (negative, tokens sent)

## Implementation

### Database Schema

**New Fields in `webhook_transactions` table:**

- `sol_amount` (numeric, nullable) - Amount of SOL involved
  - Negative = SOL spent (buying tokens)
  - Positive = SOL received (selling tokens)

- `native_balance_change` (numeric, nullable) - Native SOL balance change for the wallet

### Transaction Type Mapper

**File:** `src/services/transactionTypeMapper.ts`

The `classifySwapTransaction()` function now uses SOL amount to determine transaction type:

```typescript
// Spending SOL (negative) to get tokens = BUY
if (solAmount < 0 && amount > 0) {
  return 'BUY';
}

// Receiving SOL (positive) by giving tokens = SELL
if (solAmount > 0 && amount < 0) {
  return 'SELL';
}
```

### Edge Function

**File:** `supabase/functions/helius-webhook/index.ts`

The webhook processor extracts SOL information from Helius data:

1. **Native Transfers:** Extracts SOL movements from `nativeTransfers` array
2. **Account Data:** Extracts `nativeBalanceChange` from wallet account data
3. **Conversion:** Converts lamports to SOL (1 SOL = 1,000,000,000 lamports)

### Frontend Integration

**File:** `src/services/aggregatedPnlService.ts`

The P&L service uses `classifyTransactionWithContext()` which automatically:
- Reads `sol_amount` and `native_balance_change` from database
- Passes them to the transaction type mapper
- Returns accurate BUY/SELL classification

## Benefits

1. **Accurate Classification:** Correctly identifies buy vs sell in SWAP transactions
2. **Better P&L:** Improves profit/loss calculations by accurately tracking position changes
3. **Enhanced Analytics:** Provides clearer insights into trading patterns
4. **Historical Data:** Works with new transactions as they come from webhooks

## Testing

To verify the system is working:

1. Check transaction logs in Edge Function for SOL amount values
2. Review transactions in the database for `sol_amount` field
3. Verify that SWAP transactions show correct BUY/SELL type in the UI

## Technical Details

### SOL Amount Calculation

```typescript
// For each native transfer
if (transfer.fromUserAccount === walletAddress) {
  solAmount -= transfer.amount / 1_000_000_000; // Spent SOL
}
if (transfer.toUserAccount === walletAddress) {
  solAmount += transfer.amount / 1_000_000_000; // Received SOL
}
```

### Fallback Logic

If SOL amount data is not available, the system falls back to simple amount-based logic:
- Positive token amount = BUY
- Negative token amount = SELL

## Migration

**Migration File:** `supabase/migrations/add_sol_amount_to_transactions.sql`

Adds the new columns to store SOL transaction data without affecting existing records.
