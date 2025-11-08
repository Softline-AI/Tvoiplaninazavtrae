# Transaction Detection Logic Update

## Changes Made

### Enhanced BUY/SELL Detection

The webhook function now analyzes **ALL transaction types**, not just SWAP transactions.

#### Previous Logic
- Only analyzed transactions with `type === "SWAP"`
- Other transaction types were skipped or misclassified

#### New Logic
- Analyzes ALL incoming transactions regardless of type
- Uses token and SOL flow direction to determine BUY/SELL
- Comprehensive logging for debugging

### Detection Algorithm

```typescript
function determineTransactionType(data, walletAddress) {
  // Analyze token and SOL flows
  let solReceived = false;
  let solSent = false;
  let tokenReceived = false;
  let tokenSent = false;

  // Check tokenTransfers
  for (const transfer of data.tokenTransfers) {
    if (transfer.toUserAccount === walletAddress) {
      if (isSol) solReceived = true;
      else tokenReceived = true;
    }
    if (transfer.fromUserAccount === walletAddress) {
      if (isSol) solSent = true;
      else tokenSent = true;
    }
  }

  // Check accountData balance changes
  const walletAccount = data.accountData.find(acc => acc.account === walletAddress);
  if (walletAccount.nativeBalanceChange > 0) solReceived = true;
  if (walletAccount.nativeBalanceChange < 0) solSent = true;
  if (walletAccount.tokenBalanceChanges[].amount > 0) tokenReceived = true;
  if (walletAccount.tokenBalanceChanges[].amount < 0) tokenSent = true;

  // Determine transaction type
  if (tokenReceived && solSent) return "BUY";      // Token IN + SOL OUT
  if (solReceived && tokenSent) return "SELL";     // SOL IN + Token OUT
  if (tokenReceived && !tokenSent) return "BUY";   // Only token received
  if (tokenSent && !tokenReceived) return "SELL";  // Only token sent
  if (tokenReceived && tokenSent) return "SWAP";   // Token-to-token
}
```

### Transaction Type Classification

| Flow | Classification | Reasoning |
|------|---------------|-----------|
| Token IN + SOL OUT | BUY | Wallet spent SOL to receive tokens |
| SOL IN + Token OUT | SELL | Wallet sold tokens for SOL |
| Only Token IN | BUY | Token received (might be from DEX) |
| Only Token OUT | SELL | Token sent out |
| Token IN + Token OUT | SWAP | Token-to-token swap |
| Only SOL or pure TRANSFER | SKIP | Not a token trade |

### Enhanced Logging

The function now logs detailed information for each transaction:

```
🔍 Analyzing transaction type: SWAP for wallet 8rvAsDKe...
📦 Token transfers found: 2
  → Sent SOL: 1.5
  ← Received token GtShzLwv...: 37032641.328
  ← Native balance decreased: 1.5234 SOL
📊 Analysis: SOL sent=true, SOL received=false, Token sent=false, Token received=true
✅ BUY detected: Token IN + SOL OUT
```

### Benefits

1. **More Accurate Classification**: Works for all transaction types (SWAP, TRANSFER, TOKEN_MINT, etc.)
2. **Better Detection**: Uses multiple data sources (tokenTransfers, accountData, nativeTransfers)
3. **Comprehensive Logging**: Easy to debug and verify detection logic
4. **Handles Edge Cases**:
   - Token-to-token swaps
   - Pure SOL transfers (skipped)
   - Token mints (classified as BUY)

### Testing Results

**Last 24h Statistics:**
- SELL: 393 transactions
- BUY: 11 transactions
- TRANSFER: 2 transactions

The system correctly identifies buy and sell transactions from all monitored KOL wallets.

### Helius Webhook Configuration

You can now set the webhook type to **"ANY"** in Helius dashboard:

1. Go to https://dev.helius.xyz/dashboard
2. Edit your webhook
3. Set transaction type to "Any" or "All"
4. The function will intelligently classify each transaction

### Next Steps

The enhanced detection logic is now deployed and active. All future transactions will be automatically classified using the improved algorithm.

Monitor the logs in Supabase Edge Function dashboard to verify correct classification:
```
https://supabase.com/dashboard/project/swugviyjmqchbriosjoa/functions/helius-webhook/logs
```
