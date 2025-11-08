# Helius API Integration Guide

## Overview

This project uses Helius API for real-time Solana transaction data. The integration includes:

- **Webhook** for real-time transaction streaming
- **RPC API** for on-demand queries
- **Transaction History API** for address-based queries
- **3 API keys** with automatic rotation

## API Keys

Configured in `.env`:
```
VITE_HELIUS_API_KEY_1=23820805-b04f-45a2-9d4b-e70d588bd406
VITE_HELIUS_API_KEY_2=e8716d73-d001-4b9a-9370-0a4ef7ac8d28
VITE_HELIUS_API_KEY_3=cc0ea229-5dc8-4e7d-9707-7c2692eeefbb
```

## Available Methods

### 1. Get Transaction History by Address

Fetch all transactions for a specific Solana address:

```typescript
import { heliusService } from './services/heliusApi';

const address = '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR';

// Get raw transaction history
const transactions = await heliusService.getAddressTransactionHistory(address, 100);

// Get parsed transactions with full details
const parsedTxs = await heliusService.getParsedTransactionHistory(address, 100);
```

**Response Format:**
```typescript
{
  signature: string;
  timestamp: number;
  type: string; // "SWAP", "TRANSFER", etc.
  fee: number;
  status: string;
  slot: number;
  nativeTransfers?: Array<...>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
  accountData?: Array<...>;
  description: string;
}
```

### 2. Get Enhanced Transactions (Legacy)

Uses RPC method for transaction signatures:

```typescript
const transactions = await heliusService.getEnhancedTransactions(walletAddress, 50);
```

### 3. Get Real-Time KOL Data

Fetch recent trades from monitored KOL wallets:

```typescript
const kolTrades = await heliusService.getRealTimeKOLData();
```

### 4. Get KOL Leaderboard

Get aggregated stats for all monitored KOLs:

```typescript
const leaderboard = await heliusService.getKOLLeaderboardData();
```

### 5. Get Token Metadata

```typescript
const metadata = await heliusService.getTokenMetadata(mintAddress);
```

### 6. Get Token Prices

```typescript
const prices = await heliusService.getTokenPrices([mint1, mint2, mint3]);
```

## API Endpoints Used

### 1. Transaction History API
```
GET https://api.helius.xyz/v0/addresses/{address}/transactions?api-key={key}&limit={limit}
```

**Parameters:**
- `address` - Solana wallet address
- `limit` - Number of transactions (default: 100, max: 1000)
- `type` - Optional filter: "SWAP", "TRANSFER", etc.

### 2. RPC API
```
POST https://rpc.helius.xyz/?api-key={key}
```

**Methods:**
- `getSignaturesForAddress`
- `getAccountInfo`
- `getBalance`
- `getSlot`

## Rate Limiting

The service includes automatic:
- **Key rotation** every 50 requests
- **Rate limiting** with 200ms delay between requests
- **Retry logic** with exponential backoff
- **Error tracking** per key

## Testing

Test the integration:

```bash
node scripts/test-helius-history.cjs
```

This will:
- Fetch transaction history for a test address
- Display transaction types and counts
- Show detailed SWAP transaction data

## Webhook Integration

Real-time transactions are received via Supabase Edge Function:

**Webhook URL:**
```
https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook
```

**Setup in Helius Dashboard:**
1. Go to https://dev.helius.xyz/dashboard
2. Create webhook with the URL above
3. Select monitored addresses (40 KOL wallets)
4. Choose transaction types: SWAP, TRANSFER

## Example Usage

### Fetch Recent Swaps for a Wallet

```typescript
async function getRecentSwaps(address: string) {
  const transactions = await heliusService.getParsedTransactionHistory(address, 50);

  const swaps = transactions.filter(tx => tx.type === 'SWAP');

  swaps.forEach(swap => {
    console.log(`Swap: ${swap.signature}`);
    console.log(`Time: ${new Date(swap.timestamp * 1000).toLocaleString()}`);
    console.log(`Tokens:`, swap.tokenTransfers);
  });

  return swaps;
}
```

### Analyze Token Flow

```typescript
async function analyzeTokenFlow(address: string, tokenMint: string) {
  const transactions = await heliusService.getParsedTransactionHistory(address, 200);

  const tokenTxs = transactions.filter(tx =>
    tx.tokenTransfers?.some(t => t.mint === tokenMint)
  );

  let totalBought = 0;
  let totalSold = 0;

  tokenTxs.forEach(tx => {
    tx.tokenTransfers?.forEach(transfer => {
      if (transfer.mint === tokenMint) {
        if (transfer.toUserAccount === address) {
          totalBought += transfer.tokenAmount;
        } else if (transfer.fromUserAccount === address) {
          totalSold += transfer.tokenAmount;
        }
      }
    });
  });

  return {
    transactions: tokenTxs.length,
    bought: totalBought,
    sold: totalSold,
    holding: totalBought - totalSold
  };
}
```

## Error Handling

The service automatically handles:
- Rate limit errors (429) - rotates to next key
- Server errors (5xx) - retries with backoff
- Network errors - retries up to 3 times
- Invalid responses - returns empty array

## Monitoring

Check API status in browser console:
```typescript
heliusService.testConnection(); // Test connectivity
heliusService.isApiConnected(); // Check status
```

## Resources

- [Helius API Documentation](https://docs.helius.dev/)
- [Helius Dashboard](https://dev.helius.xyz/dashboard)
- [Transaction Types](https://docs.helius.dev/webhooks-and-websockets/webhook-types)
