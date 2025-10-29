# SmartChain - Project Structure & Logic Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [Component Architecture](#component-architecture)
6. [Service Layer](#service-layer)
7. [Features & Logic](#features--logic)
8. [API Endpoints](#api-endpoints)
9. [Data Flow](#data-flow)

---

## 🎯 Project Overview

**SmartChain** is a Solana blockchain analytics platform that tracks and analyzes KOL (Key Opinion Leader) trader activities, providing real-time insights into their transactions, token purchases, and trading performance.

**Core Purpose:**
- Track KOL wallet transactions in real-time
- Display token-specific P&L for each trade
- Provide analytics on trending tokens and traders
- Enable users to discover profitable trading patterns

---

## 🛠 Technology Stack

### Frontend
- **React** 18.3.1 with TypeScript
- **Vite** 5.4.2 (build tool)
- **TailwindCSS** 3.4.1 (styling)
- **React Router DOM** 7.9.3 (routing)
- **Lucide React** (icons)

### Backend
- **Supabase** (PostgreSQL database + Auth + Edge Functions)
- **Python Flask** (optional REST API server)
- **Node.js/Express** (webhook server)

### APIs & Services
- **Helius API** - Solana transaction data
- **Birdeye API** - Token price data
- **Supabase Edge Functions** - Serverless functions
- **Webhook System** - Real-time transaction capture

---

## 📁 Directory Structure

```
project/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── Navigation.tsx        # Top navigation bar
│   │   ├── Sidebar.tsx           # Side navigation menu
│   │   ├── KOLFeed.tsx          # Main KOL activity feed
│   │   ├── KOLProfile.tsx       # Individual KOL profile page
│   │   ├── KOLLeaderboard.tsx   # KOL rankings
│   │   ├── TopKOLTokens.tsx     # Most traded tokens by KOLs
│   │   ├── TopTokens.tsx        # Overall trending tokens
│   │   ├── Transactions.tsx     # Transaction history
│   │   ├── WalletFinder.tsx     # Wallet search/discovery
│   │   ├── CabalFinder.tsx      # Connected wallet groups
│   │   ├── FreshWalletFeed.tsx  # New wallet activity
│   │   ├── InsiderScan.tsx      # Insider trading detection
│   │   ├── CopyTraders.tsx      # Copy trading feature
│   │   ├── MyStalks.tsx         # User's tracked wallets
│   │   ├── LiveDCAFeed.tsx      # DCA strategy feed
│   │   ├── TrendsAnalytics.tsx  # Analytics dashboard
│   │   ├── DailyTrends.tsx      # Daily market trends
│   │   ├── Futures.tsx          # Futures trading data
│   │   ├── FAQ.tsx              # Help & FAQ
│   │   ├── LearningCenter.tsx   # Educational content
│   │   └── LegendCommunity.tsx  # Community features
│   │
│   ├── services/                 # API & business logic
│   │   ├── supabaseClient.ts    # Supabase client setup
│   │   ├── kolFeedService.ts    # KOL feed data fetching
│   │   ├── heliusApi.ts         # Helius API integration
│   │   ├── heliusTransactions.ts # Transaction parsing
│   │   ├── birdeyeApi.ts        # Birdeye API integration
│   │   ├── flaskApi.ts          # Flask backend client
│   │   ├── walletService.ts     # Wallet data management
│   │   └── webhookApi.ts        # Webhook handling
│   │
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
│
├── backend/                      # Backend services
│   ├── app.py                    # Flask REST API server
│   ├── gunicorn_config.py        # Production server config
│   └── requirements.txt          # Python dependencies
│
├── supabase/
│   ├── migrations/               # Database migrations
│   │   ├── 20251007235302_create_webhook_transactions.sql
│   │   ├── 20251008003653_add_monitored_wallets_table.sql
│   │   ├── 20251014015915_create_kol_profiles_table.sql
│   │   ├── 20251028143436_add_anon_read_policy_webhook_transactions.sql
│   │   └── 20251029140020_add_token_pnl_to_transactions.sql
│   │
│   └── functions/                # Edge functions
│       └── helius-webhook/       # Webhook handler
│           └── index.ts
│
├── public/                       # Static assets
├── dist/                         # Production build
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── vite.config.ts               # Vite configuration
└── tailwind.config.js           # Tailwind configuration
```

---

## 🗄 Database Schema

### Tables

#### 1. **kol_profiles**
Stores information about tracked KOL traders.

```sql
CREATE TABLE kol_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  twitter_handle TEXT,
  avatar_url TEXT,
  total_pnl DECIMAL(20, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_volume DECIMAL(20, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Purpose:** Track KOL trader profiles and aggregate statistics.

**Key Fields:**
- `wallet_address` - Solana wallet address (unique identifier)
- `total_pnl` - Lifetime profit/loss across all tokens
- `win_rate` - Percentage of profitable trades
- `total_trades` - Total number of trades
- `total_volume` - Total USD volume traded

#### 2. **webhook_transactions**
Stores individual transactions captured via webhooks.

```sql
CREATE TABLE webhook_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_signature TEXT UNIQUE NOT NULL,
  block_time TIMESTAMPTZ NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT,
  amount DECIMAL(20, 2),
  token_mint TEXT,
  token_symbol TEXT,
  transaction_type TEXT,
  fee DECIMAL(20, 8),

  -- Token-specific P&L (NEW)
  token_pnl DECIMAL(20, 2) DEFAULT 0,
  token_pnl_percentage DECIMAL(10, 2) DEFAULT 0,
  current_token_price DECIMAL(20, 8) DEFAULT 0,
  entry_price DECIMAL(20, 8) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Purpose:** Store all KOL transactions with token-specific P&L.

**Key Fields:**
- `transaction_signature` - Unique Solana transaction ID
- `from_address` - Wallet that initiated the transaction
- `token_pnl` - **Profit/loss for THIS specific token trade**
- `token_pnl_percentage` - **P&L percentage for THIS token**
- `transaction_type` - BUY, SELL, SWAP, TRANSFER

**Important:** `token_pnl` shows the P&L for the specific token in this transaction, NOT the wallet's overall P&L.

#### 3. **monitored_wallets**
List of wallets to track for transactions.

```sql
CREATE TABLE monitored_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  added_at TIMESTAMPTZ DEFAULT now()
);
```

**Purpose:** Manage which wallets to monitor via webhooks.

### Row Level Security (RLS)

All tables have RLS enabled with policies that allow:
- **Public read access** (anon users can view data)
- **Authenticated write access** (only authenticated users can modify)

```sql
-- Example policy
CREATE POLICY "Allow public read access"
  ON webhook_transactions FOR SELECT
  TO anon
  USING (true);
```

---

## 🧩 Component Architecture

### Component Hierarchy

```
App.tsx
├── Navigation.tsx (top bar)
├── Sidebar.tsx (left menu)
└── <Routes>
    ├── HomePage (/)
    ├── KOLFeed (/kol-feed)
    ├── KOLProfile (/kol-profile/:address)
    ├── KOLLeaderboard (/kol-leaderboard)
    ├── TopKOLTokens (/top-kol-tokens)
    ├── TopTokens (/top-tokens)
    ├── Transactions (/transactions)
    ├── WalletFinder (/wallet-finder)
    └── ... (other routes)
```

### Component Details

#### **KOLFeed.tsx** (Main Feature)
**Purpose:** Display real-time feed of KOL transactions with token-specific P&L.

**State:**
```typescript
const [realTrades, setRealTrades] = useState<RealTimeKOLTrade[]>([]);
const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
const [sortBy, setSortBy] = useState<'time' | 'pnl' | 'volume'>('time');
const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
```

**Logic Flow:**
1. Fetch transactions from `kolFeedService.getKOLFeed()`
2. Filter by type (buy/sell/all)
3. Filter by time range (1h/24h/7d/30d)
4. Sort by time/pnl/volume
5. Display in card grid with token P&L
6. Auto-refresh every hour

**Key Features:**
- Click KOL name → Navigate to KOL Profile
- Click token → External link to token info
- Copy wallet address to clipboard
- Real-time P&L for each token trade

#### **KOLProfile.tsx**
**Purpose:** Display detailed profile of a single KOL trader.

**Displays:**
- KOL stats (total P&L, win rate, total trades)
- Recent transactions
- Top tokens traded
- Portfolio distribution
- Twitter profile link

#### **KOLLeaderboard.tsx**
**Purpose:** Ranking of KOL traders by performance.

**Sorting Options:**
- Total P&L
- Win Rate
- Total Volume
- Number of Trades

#### **TopKOLTokens.tsx**
**Purpose:** Most traded tokens by KOL traders.

**Metrics:**
- Token symbol
- Number of KOLs trading it
- Total volume
- Average P&L
- Win rate

---

## ⚙️ Service Layer

### 1. **kolFeedService.ts** (Primary Service)

**Purpose:** Fetch and format KOL transaction data from Supabase.

**Main Function:**
```typescript
async getKOLFeed(params: {
  timeRange: '1h' | '24h' | '7d' | '30d';
  type: 'all' | 'buy' | 'sell';
  sortBy: 'time' | 'pnl' | 'volume';
  limit: number;
}): Promise<{ success: boolean; data: KOLFeedItem[] }>
```

**Logic:**
1. Calculate time filter based on `timeRange`
2. Fetch all KOL profiles from `kol_profiles` table
3. Fetch transactions from `webhook_transactions` table where:
   - `from_address` is in KOL wallet list
   - `block_time` >= time filter
   - Order by `block_time DESC`
4. Transform data:
   - Map `transaction_type` to 'buy' or 'sell'
   - Extract `token_pnl` and `token_pnl_percentage`
   - Format time ago (28m, 2h, 3d)
   - Format amounts ($18,500.00)
5. Filter by type if needed
6. Sort by selected criteria
7. Limit results

**Key Data Transformation:**
```typescript
// OLD (wrong - showed wallet total P&L)
const totalPnl = parseFloat(profile.total_pnl || '0');
pnl: `${totalPnl >= 0 ? '+' : ''}$${totalPnl}`

// NEW (correct - shows token-specific P&L)
const tokenPnl = parseFloat(tx.token_pnl || '0');
pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl)}`
```

### 2. **supabaseClient.ts**

**Purpose:** Initialize Supabase client.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. **heliusApi.ts**

**Purpose:** Fetch transaction data from Helius API.

**Functions:**
- `getWalletTransactions(address)` - Get transaction history
- `getTokenInfo(mint)` - Get token metadata
- `subscribeToWallet(address)` - Real-time transaction monitoring

### 4. **birdeyeApi.ts**

**Purpose:** Fetch token price data from Birdeye API.

**Functions:**
- `getTokenPrice(address)` - Current token price
- `getTokenChart(address)` - Historical price data
- `getTokenInfo(address)` - Token metadata

### 5. **webhookApi.ts**

**Purpose:** Handle incoming webhook notifications.

**Flow:**
1. Receive transaction notification from Helius webhook
2. Parse transaction data
3. Store in `webhook_transactions` table
4. Update KOL profile statistics

---

## 🎯 Features & Logic

### Feature 1: Real-Time KOL Feed

**User Story:** As a user, I want to see the latest trades from top KOL traders with their token-specific P&L.

**Implementation:**
1. **Data Source:** `webhook_transactions` table filtered by KOL wallets
2. **Display:** Card grid showing:
   - KOL name and avatar
   - Twitter handle
   - Token symbol
   - Buy/Sell action
   - Amount traded
   - **Token P&L** (profit/loss for this specific token)
   - **Token P&L %** (percentage gain/loss for this token)
   - Time ago

**Logic:**
```typescript
// Fetch data
const result = await kolFeedService.getKOLFeed({
  timeRange: '24h',
  type: 'all',
  sortBy: 'time',
  limit: 50
});

// Display
result.data.map(trade => (
  <div className="trade-card">
    <div>{trade.kolName}</div>
    <div>{trade.token}</div>
    <div className={trade.lastTx === 'buy' ? 'green' : 'red'}>
      {trade.lastTx.toUpperCase()}
    </div>
    <div>{trade.bought || trade.sold}</div>
    <div className={trade.pnl.startsWith('+') ? 'green' : 'red'}>
      {trade.pnl} ({trade.pnlPercentage})
    </div>
  </div>
));
```

### Feature 2: Token-Specific P&L Calculation

**Problem:** Previously showed wallet's total P&L instead of the specific token's P&L.

**Solution:** Added `token_pnl` and `token_pnl_percentage` fields to `webhook_transactions`.

**Calculation Logic:**

**For BUY transactions:**
```python
# Show unrealized P&L (current profit if sold now)
token_pnl = amount * (current_price - entry_price) / entry_price
token_pnl_percentage = ((current_price - entry_price) / entry_price) * 100

# Example: Bought POPCAT for $18,500
# Current price: $0.875, Entry price: $0.60
# token_pnl = 18500 * 0.45 = $8,325
# token_pnl_percentage = 45%
```

**For SELL transactions:**
```python
# Show realized P&L (actual profit/loss from this sale)
token_pnl = amount * (exit_price - entry_price) / entry_price
token_pnl_percentage = ((exit_price - entry_price) / entry_price) * 100

# Example: Sold WIF for $850
# Exit price: $2.15, Entry price: $1.59
# token_pnl = 850 * 0.35 = $297.59
# token_pnl_percentage = 35%
```

**Data in Database:**
```sql
-- POPCAT buy example
UPDATE webhook_transactions SET
  token_pnl = 8325.00,              -- Profit for this POPCAT trade
  token_pnl_percentage = 45.00,     -- 45% gain on POPCAT
  current_token_price = 0.875,
  entry_price = 0.60
WHERE token_symbol = 'POPCAT' AND transaction_type = 'BUY';
```

### Feature 3: KOL Leaderboard

**Logic:**
1. Fetch all KOL profiles
2. Sort by selected metric (P&L, win rate, volume)
3. Display with rank numbers
4. Show aggregate statistics

### Feature 4: Wallet Monitoring

**Logic:**
1. User adds wallet to `monitored_wallets` table
2. Webhook system captures transactions from this wallet
3. Transactions stored in `webhook_transactions`
4. Display in user's "My Stalks" section

---

## 🔌 API Endpoints

### Supabase REST API

**Base URL:** `https://[project-ref].supabase.co/rest/v1`

#### GET /kol_profiles
```bash
GET /kol_profiles?select=*
Authorization: Bearer [SUPABASE_ANON_KEY]
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Ga__ke",
    "wallet_address": "DNfuF1L...",
    "twitter_handle": "@Ga__ke",
    "total_pnl": "125000",
    "win_rate": "68.5",
    "total_trades": 24
  }
]
```

#### GET /webhook_transactions
```bash
GET /webhook_transactions?select=*&from_address=in.(wallet1,wallet2)&block_time=gte.2025-10-28T00:00:00Z&order=block_time.desc&limit=50
Authorization: Bearer [SUPABASE_ANON_KEY]
```

**Response:**
```json
[
  {
    "id": "uuid",
    "transaction_signature": "5Kz...",
    "block_time": "2025-10-28T15:13:42.163345+00:00",
    "from_address": "34ZEH778zL8...",
    "token_symbol": "POPCAT",
    "transaction_type": "SWAP",
    "amount": "18500.00",
    "token_pnl": "8325.00",
    "token_pnl_percentage": "45.00"
  }
]
```

### Flask Backend API (Optional)

**Base URL:** `http://localhost:5000`

#### GET /api/kol-feed
```bash
GET /api/kol-feed?timeRange=24h&type=all&sortBy=time&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "lastTx": "buy",
      "timeAgo": "28m",
      "kolName": "Groovy",
      "twitterHandle": "@0xGroovy",
      "token": "POPCAT",
      "bought": "$18,500.00",
      "pnl": "+$8,325.00",
      "pnlPercentage": "+45.00%",
      "timestamp": "2025-10-28T15:13:42"
    }
  ],
  "timeRange": "24h",
  "cached_at": "2025-10-28T16:00:00"
}
```

---

## 🔄 Data Flow

### 1. Transaction Capture Flow

```
Solana Blockchain
    ↓
Helius Webhook → Supabase Edge Function
    ↓
Parse Transaction Data
    ↓
Calculate Token P&L
    ↓
Store in webhook_transactions table
    ↓
Update KOL Profile Statistics
```

### 2. Frontend Display Flow

```
User Opens KOL Feed Page
    ↓
KOLFeed.tsx Component Mounts
    ↓
Call kolFeedService.getKOLFeed()
    ↓
Fetch KOL Profiles from Supabase
    ↓
Fetch Transactions from Supabase (filtered by KOL wallets)
    ↓
Transform Data (format time, amounts, P&L)
    ↓
Apply Filters (time range, type)
    ↓
Apply Sort (time/pnl/volume)
    ↓
Render Transaction Cards
    ↓
Auto-refresh every hour
```

### 3. Real-Time Update Flow

```
New Transaction on Blockchain
    ↓
Webhook Triggered
    ↓
Edge Function Processes
    ↓
Database Updated
    ↓
Frontend Polls (every hour)
    ↓
New Data Displayed
```

---

## 🎨 UI/UX Patterns

### Color Coding

- **Green** - Buy transactions, positive P&L
- **Red** - Sell transactions, negative P&L
- **Blue** - Links, interactive elements
- **Gray** - Neutral text, borders

### Card Layout

```
┌─────────────────────────────────────┐
│ [Avatar] KOL Name (@twitter)        │
│                                     │
│ 🟢 BUY | POPCAT | 28m ago          │
│                                     │
│ Amount: $18,500.00                  │
│ Token P&L: +$8,325.00 (+45.00%)   │
│                                     │
│ [Copy] [View Profile] [Token Info] │
└─────────────────────────────────────┘
```

### Filter/Sort Controls

```
[All] [Buy] [Sell]  |  [1H] [24H] [7D] [30D]  |  [Time] [P&L] [Volume]
```

---

## 🔐 Environment Variables

```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_HELIUS_API_KEY=your-helius-key
VITE_BIRDEYE_API_KEY=your-birdeye-key

# Backend (.env)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=eyJhbG...
HELIUS_API_KEY=your-helius-key
FLASK_ENV=production
```

---

## 🚀 Deployment

### Frontend
```bash
npm run build
# Output: dist/ directory
# Deploy to: Vercel, Netlify, or static host
```

### Backend
```bash
cd backend
gunicorn -c gunicorn_config.py app:app
# Runs on: http://0.0.0.0:5000
```

### Database
- Hosted on Supabase (PostgreSQL)
- Managed migrations via Supabase CLI
- Automatic backups enabled

---

## 📊 Data Examples

### Sample KOL Transaction Data

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  lastTx: "buy",
  timeAgo: "28m",
  kolName: "Groovy",
  kolAvatar: "https://images.pexels.com/photos/220453/...",
  walletAddress: "34ZEH778zL8ctkLwxxERLX5ZnUu6MuFyX9CWrs8kucMw",
  twitterHandle: "@0xGroovy",
  token: "POPCAT",
  tokenContract: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  bought: "$18,500.00",
  sold: "$0.00",
  holding: "$18,500.00",
  pnl: "+$8,325.00",          // Token-specific P&L
  pnlPercentage: "+45.00%",    // Token-specific P&L %
  timestamp: "2025-10-28T15:13:42.163345+00:00"
}
```

### Sample KOL Profile Data

```javascript
{
  id: "uuid",
  name: "Ga__ke",
  wallet_address: "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm",
  twitter_handle: "@Ga__ke",
  avatar_url: "https://images.pexels.com/...",
  total_pnl: "125000.00",     // Lifetime total P&L
  win_rate: "68.50",          // Overall win rate
  total_trades: 24,
  total_volume: "485000.00",
  created_at: "2025-10-25T05:33:11.290312+00:00"
}
```

---

## 🐛 Known Issues & Solutions

### Issue 1: Flask Not Available
**Solution:** Frontend now connects directly to Supabase, bypassing Flask.

### Issue 2: Showing Wallet P&L Instead of Token P&L
**Solution:** Added `token_pnl` and `token_pnl_percentage` fields to transactions table.

### Issue 3: Stale Data
**Solution:** Auto-refresh every hour, manual refresh button available.

---

## 📝 Development Notes

### Adding a New KOL
```sql
INSERT INTO kol_profiles (name, wallet_address, twitter_handle)
VALUES ('NewKOL', 'SolanaWalletAddress...', '@NewKOLTwitter');
```

### Testing Token P&L Calculation
```sql
-- View token-specific P&L for recent transactions
SELECT
  kp.name,
  wt.token_symbol,
  wt.transaction_type,
  wt.amount,
  wt.token_pnl,
  wt.token_pnl_percentage
FROM webhook_transactions wt
JOIN kol_profiles kp ON kp.wallet_address = wt.from_address
WHERE wt.block_time >= NOW() - INTERVAL '24 hours'
ORDER BY wt.token_pnl DESC
LIMIT 20;
```

---

## 🎓 Key Concepts

### Token P&L vs Wallet P&L

**Wallet P&L (Total):**
- Sum of all P&L across all tokens
- Stored in `kol_profiles.total_pnl`
- Shows overall trading performance

**Token P&L (Specific):**
- P&L for one specific token in one transaction
- Stored in `webhook_transactions.token_pnl`
- Shows performance of individual token trades

**Example:**
```
Wallet Total P&L: $125,000
├── POPCAT Trade: +$8,325 (45%)
├── BONK Trade: +$3,750 (15%)
├── WIF Trade: +$4,676 (28%)
└── ... (other trades)
```

### Transaction Types

- **SWAP** - Token exchange (counted as BUY in UI)
- **BUY** - Direct purchase
- **SELL** - Token sale
- **TRANSFER** - Send/receive (not shown in feed)

---

## 🔗 External Resources

- **Solana Blockchain Explorer:** https://solscan.io
- **Helius API Docs:** https://docs.helius.dev
- **Birdeye API Docs:** https://docs.birdeye.so
- **Supabase Docs:** https://supabase.com/docs

---

## 📞 Support

For questions or issues, refer to:
- `/backend/API_DOCUMENTATION.md`
- `/backend/API_TESTING.md`
- `/backend/PRODUCTION_GUIDE.md`

---

**Last Updated:** 2025-10-29
**Version:** 1.0
**Maintainer:** SmartChain Development Team
