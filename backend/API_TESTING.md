# API Testing Guide

## Base URL
```
http://localhost:5000
```

## Available Endpoints

### 1. Health Check
**GET** `/api/health`

Returns the status of the API and all available endpoints.

**Example:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Flask API is running",
  "redis": "unavailable",
  "endpoints": {
    "transactions": "/api/transactions",
    "kol_feed": "/api/kol-feed",
    "insider_scan": "/api/insider-scan",
    "wallet_transactions": "/api/wallet/<address>/transactions",
    "token_price": "/api/token/<address>/price"
  }
}
```

---

### 2. Get Transactions
**GET** `/api/transactions`

Retrieves transactions from Supabase with optional filtering.

**Query Parameters:**
- `timeRange` (optional): `24h`, `7d`, `30d` - Default: `24h`
- `type` (optional): `all`, `buy`, `sell`, `swap` - Default: `all`

**Examples:**
```bash
# Get all transactions from last 24 hours
curl "http://localhost:5000/api/transactions?timeRange=24h&type=all"

# Get only buy transactions
curl "http://localhost:5000/api/transactions?type=buy"

# Get last 7 days transactions
curl "http://localhost:5000/api/transactions?timeRange=7d"
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "timeRange": "24h",
  "type": "all"
}
```

---

### 3. KOL Feed
**GET** `/api/kol-feed`

Returns KOL (Key Opinion Leader) profiles and their trading activity.

**Query Parameters:**
- `timeRange` (optional): `24h`, `7d`, `30d` - Default: `24h`

**Example:**
```bash
curl "http://localhost:5000/api/kol-feed?timeRange=24h"
```

**Response:**
```json
{
  "success": true,
  "timeRange": "24h",
  "data": [
    {
      "id": "...",
      "wallet_address": "...",
      "name": "Ga__ke",
      "twitter_handle": "Ga__ke",
      "bio": "Professional Solana trader and market analyst",
      "total_pnl": 0,
      "total_trades": 0,
      "win_rate": 0,
      "total_volume": 0,
      "followers_count": 0,
      "is_verified": true,
      "rank": 1
    }
  ]
}
```

---

### 4. Insider Scan
**GET** `/api/insider-scan`

Scans for large transactions that might indicate insider activity.

**Query Parameters:**
- `minAmount` (optional): Minimum transaction amount - Default: `10000`

**Example:**
```bash
curl "http://localhost:5000/api/insider-scan?minAmount=5000"
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

---

### 5. Wallet Transactions
**GET** `/api/wallet/<address>/transactions`

Fetches transaction history for a specific wallet address using Helius API.

**Path Parameters:**
- `address`: Solana wallet address

**Example:**
```bash
curl "http://localhost:5000/api/wallet/DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm/transactions"
```

**Response:**
```json
{
  "success": true,
  "wallet": "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm",
  "data": [...]
}
```

---

### 6. Token Price
**GET** `/api/token/<address>/price`

Gets current price for a token using Birdeye API.

**Path Parameters:**
- `address`: Token mint address

**Example:**
```bash
curl "http://localhost:5000/api/token/So11111111111111111111111111111111111111112/price"
```

**Response:**
```json
{
  "success": true,
  "token": "So11111111111111111111111111111111111111112",
  "data": {
    "price": 123.45,
    ...
  }
}
```

---

## API Keys Configuration

All API keys are loaded from `.env` file:

```env
VITE_ABLY_API_KEY=NcOLFw:mtjgthY-_QXnkLbykTGIPasZBPeKy5mjDUqJXzNzJUo
VITE_BIRDEYE_API_KEY=a6296c5f82664e92aadffe9e99773d73
VITE_HELIUS_API_KEY_1=23820805-b04f-45a2-9d4b-e70d588bd406
VITE_HELIUS_API_KEY_2=e8716d73-d001-4b9a-9370-0a4ef7ac8d28
VITE_HELIUS_API_KEY_3=cc0ea229-5dc8-4e7d-9707-7c2692eeefbb
VITE_SUPABASE_URL=https://swugviyjmqchbriosjoa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Testing with Postman

1. Import the following collection:

**Base URL:** `http://localhost:5000`

**Collection Structure:**
- Health Check → GET `/api/health`
- Transactions → GET `/api/transactions?timeRange=24h&type=all`
- KOL Feed → GET `/api/kol-feed?timeRange=24h`
- Insider Scan → GET `/api/insider-scan?minAmount=10000`
- Wallet Transactions → GET `/api/wallet/{address}/transactions`
- Token Price → GET `/api/token/{address}/price`

2. Set environment variables in Postman:
   - `base_url`: `http://localhost:5000`
   - `test_wallet`: `DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm`
   - `test_token`: `So11111111111111111111111111111111111111112`

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `504 Gateway Timeout` - External API timeout

---

## Caching

- Redis caching is enabled but falls back gracefully if Redis is unavailable
- Cache TTL:
  - Transactions: 5 minutes
  - KOL Feed: 10 minutes
  - Insider Scan: 3 minutes
  - Token Prices: 1 minute

---

## Rate Limiting

- Multiple Helius API keys are configured for rate limit handling
- Automatic key rotation on rate limit errors
- Birdeye API has its own rate limits (check their documentation)
