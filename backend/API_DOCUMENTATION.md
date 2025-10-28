# Backend API Documentation

## 🎯 Overview

Complete API documentation for the SmartChain KOL Tracker backend system.

**Base URL:** `http://localhost:5000`

---

## 📡 Endpoints

### 1. Health Check

**GET** `/api/health`

Check API status and available endpoints.

**Response:**
```json
{
  "status": "ok",
  "message": "Flask API is running",
  "redis": "connected",
  "endpoints": {
    "transactions": "/api/transactions",
    "kol_feed": "/api/kol-feed",
    "trader_profile": "/api/trader/<wallet_address>",
    "insider_scan": "/api/insider-scan",
    "wallet_transactions": "/api/wallet/<address>/transactions",
    "token_price": "/api/token/<address>/price"
  }
}
```

---

### 2. KOL Feed

**GET** `/api/kol-feed`

Get filtered and sorted trades from KOL traders.

**Query Parameters:**
- `timeRange` (string): Time period - `1h`, `24h`, `7d`, `30d` (default: `24h`)
- `type` (string): Transaction type - `all`, `buy`, `sell` (default: `all`)
- `sortBy` (string): Sort method - `time`, `pnl`, `volume` (default: `time`)
- `limit` (integer): Max results (default: `50`)

**Example Request:**
```bash
curl "http://localhost:5000/api/kol-feed?timeRange=24h&type=buy&sortBy=volume&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "lastTx": "buy",
      "timeAgo": "5m",
      "kolName": "Frosty",
      "kolAvatar": "https://...",
      "walletAddress": "EAnB5151L8ejp3SM6haLgyv3snk6oqc8acKgWEg9T5J",
      "twitterHandle": "frosty",
      "token": "POPCAT",
      "tokenContract": "TokenMint5",
      "bought": "$5,600.90",
      "sold": "$0.00",
      "holding": "$5,600.90",
      "pnl": "+$0.00",
      "pnlPercentage": "+0.00%",
      "timestamp": "2025-10-28T14:31:12.451301+00:00"
    }
  ],
  "timeRange": "24h",
  "type": "buy",
  "sortBy": "volume"
}
```

---

### 3. Trader Profile

**GET** `/api/trader/<wallet_address>`

Get detailed profile and statistics for a specific trader.

**Path Parameters:**
- `wallet_address` (string): Solana wallet address

**Example Request:**
```bash
curl "http://localhost:5000/api/trader/DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm"
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "wallet_address": "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm",
    "name": "Ga__ke",
    "avatar_url": "https://...",
    "twitter_handle": "Ga__ke",
    "bio": "Professional Solana trader and market analyst",
    "total_pnl": 0.0,
    "total_trades": 0,
    "win_rate": 0.0,
    "total_volume": 0.0,
    "followers_count": 0,
    "is_verified": true,
    "rank": 1,
    "created_at": "2025-10-25T05:33:11.290312+00:00",
    "updated_at": "2025-10-25T05:33:11.290312+00:00"
  },
  "recent_trades": [
    {
      "id": "uuid",
      "type": "buy",
      "token": "BONK",
      "tokenContract": "TokenMint1",
      "amount": 1250.5,
      "timestamp": "2025-10-28T14:27:12.451301+00:00",
      "timeAgo": "15m"
    }
  ],
  "stats": {
    "total_transactions": 2,
    "buy_count": 2,
    "sell_count": 0,
    "total_volume_30d": 4651.25
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Trader not found"
}
```

---

### 4. Transactions

**GET** `/api/transactions`

Get recent transactions from monitored wallets.

**Query Parameters:**
- `timeRange` (string): Time period - `1h`, `24h`, `7d` (default: `24h`)
- `type` (string): Transaction type filter - `all`, `buy`, `sell` (default: `all`)

**Example Request:**
```bash
curl "http://localhost:5000/api/transactions?timeRange=24h&type=all"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "transaction_signature": "...",
      "block_time": "2025-10-28T14:31:12.451301+00:00",
      "from_address": "...",
      "to_address": "...",
      "amount": 1250.5,
      "token_mint": "...",
      "token_symbol": "BONK",
      "transaction_type": "SWAP",
      "fee": 0.000005
    }
  ],
  "timeRange": "24h",
  "type": "all"
}
```

---

### 5. Insider Scan

**GET** `/api/insider-scan`

Detect large transactions and whale movements.

**Query Parameters:**
- `timeRange` (string): Time period - `1h`, `24h`, `7d` (default: `1h`)
- `alertLevel` (string): Confidence filter - `all`, `high`, `medium` (default: `all`)

**Example Request:**
```bash
curl "http://localhost:5000/api/insider-scan?timeRange=1h&alertLevel=high"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "signature",
      "type": "large_buy",
      "wallet": "...",
      "walletName": "ABC123...",
      "token": "BONK",
      "tokenSymbol": "BONK",
      "amount": "1250.5 BONK",
      "value": "$125,000",
      "timestamp": "...",
      "confidence": "high",
      "description": "Large transaction detected",
      "contractAddress": "..."
    }
  ],
  "timeRange": "1h",
  "alertLevel": "high"
}
```

---

### 6. Wallet Transactions

**GET** `/api/wallet/<address>/transactions`

Get transaction history for a specific wallet.

**Path Parameters:**
- `address` (string): Solana wallet address

**Example Request:**
```bash
curl "http://localhost:5000/api/wallet/DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm/transactions"
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

---

### 7. Token Price

**GET** `/api/token/<address>/price`

Get current price data for a token.

**Path Parameters:**
- `address` (string): Token contract address

**Example Request:**
```bash
curl "http://localhost:5000/api/token/So11111111111111111111111111111111111111112/price"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "value": 150.25,
    "updateUnixTime": 1698765432,
    "updateHumanTime": "2025-10-28T14:30:32"
  }
}
```

---

## 🗄️ Database Schema

### Tables

#### `kol_profiles`
- `id` (uuid, PK)
- `wallet_address` (text, unique)
- `name` (text)
- `avatar_url` (text)
- `twitter_handle` (text)
- `bio` (text)
- `total_pnl` (numeric)
- `total_trades` (integer)
- `win_rate` (numeric)
- `total_volume` (numeric)
- `followers_count` (integer)
- `is_verified` (boolean)
- `rank` (integer)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `webhook_transactions`
- `id` (uuid, PK)
- `transaction_signature` (text, unique)
- `block_time` (timestamptz)
- `from_address` (text)
- `to_address` (text)
- `amount` (numeric)
- `token_mint` (text)
- `token_symbol` (text)
- `transaction_type` (text)
- `fee` (numeric)
- `raw_data` (jsonb)
- `created_at` (timestamptz)

#### `monitored_wallets`
- `id` (uuid, PK)
- `wallet_address` (text, unique)
- `label` (text)
- `is_active` (boolean)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

---

## 🔧 Caching

**Redis Caching:**
- Enabled when Redis is available
- Cache TTL varies by endpoint:
  - KOL Feed: 180 seconds (3 minutes)
  - Trader Profile: 300 seconds (5 minutes)
  - Transactions: 300 seconds (5 minutes)
  - Insider Scan: 180 seconds (3 minutes)
  - Token Price: 60 seconds (1 minute)

**Cache Keys:**
- `kol_feed_{timeRange}_{type}_{sortBy}_{limit}`
- `trader_profile_{wallet_address}`
- `transactions_{timeRange}_{type}`
- `insider_scan_{timeRange}_{alertLevel}`
- `token_price_{address}`

---

## 🔒 Security

**Row Level Security (RLS):**
- Enabled on all tables
- Public read access for `webhook_transactions` and `kol_profiles`
- Restricted write access (service role only)

**API Keys:**
- Helius API (3 keys with rotation support)
- Birdeye API
- Ably API
- Supabase (URL + Anon Key)

---

## ⚡ Performance

**Response Times (with cache):**
- Health Check: ~10ms
- KOL Feed: ~50-100ms
- Trader Profile: ~80-120ms
- Transactions: ~50ms
- Insider Scan: ~100ms

**Rate Limits:**
- No built-in rate limiting (consider adding for production)

---

## 🧪 Testing

### Test KOL Feed
```bash
# All trades, last 24h, sorted by time
curl "http://localhost:5000/api/kol-feed?timeRange=24h&type=all&sortBy=time&limit=10"

# Buy only, sorted by volume
curl "http://localhost:5000/api/kol-feed?timeRange=1h&type=buy&sortBy=volume&limit=10"

# Sell only, sorted by P&L
curl "http://localhost:5000/api/kol-feed?timeRange=7d&type=sell&sortBy=pnl&limit=10"
```

### Test Trader Profile
```bash
curl "http://localhost:5000/api/trader/DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm"
```

### Test Health Check
```bash
curl "http://localhost:5000/api/health"
```

---

## 📝 Error Handling

All endpoints return consistent error responses:

**Success:**
```json
{
  "success": true,
  "data": [...]
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message description",
  "data": [] // or {}
}
```

**HTTP Status Codes:**
- `200` - Success
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Deployment

See `PRODUCTION_GUIDE.md` for production deployment instructions.

---

**Last Updated:** October 28, 2025
**Version:** 2.0.0
**Maintainer:** SmartChain Team
