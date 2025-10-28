# SmartChain - Crypto Intelligence Platform

## Project Overview
SmartChain is a comprehensive crypto analytics platform for tracking smart money movements, whale activities, and KOL (Key Opinion Leader) transactions on the Solana blockchain.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v7
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Animations**: React Transition Group

### Backend
- **Database**: Supabase (PostgreSQL)
- **API Services**: 
  - Helius API (Solana blockchain data)
  - Birdeye API (Token prices and market data)
  - Flask API (Python backend for data processing)
- **Real-time**: Supabase Edge Functions with webhooks

## Project Structure

```
/src
  /components          # React components
    - HomePage.tsx     # Landing page with hero, features, pricing
    - Navigation.tsx   # Top navigation bar
    - Sidebar.tsx      # App sidebar navigation
    - KOLFeed.tsx      # Main KOL transaction feed
    - KOLProfile.tsx   # Individual KOL profile page
    - KOLLeaderboard.tsx # KOL rankings
    - TopKOLTokens.tsx # Top tokens by KOL activity
    - WalletFinder.tsx # Wallet discovery tool
    - CabalFinder.tsx  # Coordinated trading detection
    - InsiderScan.tsx  # Insider trading detection
    - FreshWalletFeed.tsx # New wallet tracker
    - TopTokens.tsx    # Top trending tokens
    - DailyTrends.tsx  # Daily market trends
    - Transactions.tsx # Transaction history
    - MyStalks.tsx     # User's tracked wallets
    - LearningCenter.tsx # Educational content
    - LegendCommunity.tsx # Premium community
    - Futures.tsx      # Futures trading section
    
  /services           # API integration services
    - supabaseClient.ts  # Supabase client setup
    - heliusApi.ts       # Helius API integration
    - birdeyeApi.ts      # Birdeye API integration
    - flaskApi.ts        # Flask backend API
    - webhookApi.ts      # Webhook handlers
    - walletService.ts   # Wallet operations

/backend
  - app.py            # Flask application (main)
  - app_simple.py     # Simplified Flask version
  - requirements.txt  # Python dependencies

/supabase
  /migrations         # Database migrations
  /functions          # Edge functions
    /helius-webhook   # Webhook handler for transactions

```

## Key Features

### Free Tier
- Live KOL Feed - Real-time transaction tracking
- Smart Money Tracker - Whale movement monitoring
- Wallet Finder - Profitable wallet discovery
- Token Insiders - Insider trading detection

### Pro Tier ($199/mo or $159/mo yearly)
- All Free features
- Cabal Finder - Coordinated group detection
- Fresh Wallet Feeds - New wallet tracking
- Custom KOL Feed - Personalized KOL selection
- Insiders Scan - Advanced insider detection

### Legend Tier ($399/mo or $319/mo yearly)
- All Pro features
- Whales Open Orders - Open order tracking
- Priority Alerts - Fast notifications
- Private Community - Exclusive access
- API Access - Integration capabilities
- 1-on-1 Support - Personal assistance

## Database Schema

### Tables

#### kol_profiles
```sql
- id (uuid, PK)
- wallet_address (text, unique)
- name (text)
- avatar_url (text)
- twitter_handle (text)
- bio (text)
- total_pnl (numeric)
- total_trades (integer)
- win_rate (numeric)
- total_volume (numeric)
- followers_count (integer)
- is_verified (boolean)
- rank (integer)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### webhook_transactions
```sql
- id (uuid, PK)
- signature (text, unique)
- timestamp (timestamptz)
- wallet_address (text)
- transaction_type (text)
- token_address (text)
- amount (numeric)
- price (numeric)
- value_usd (numeric)
- raw_data (jsonb)
- created_at (timestamptz)
```

#### monitored_wallets
```sql
- id (uuid, PK)
- wallet_address (text, unique)
- name (text)
- is_active (boolean)
- added_at (timestamptz)
- last_checked (timestamptz)
```

## API Integration

### Helius API
- Endpoint: `https://api.helius.xyz`
- Purpose: Solana blockchain data, transactions, wallet info
- Key endpoints:
  - `/v0/addresses/{address}/transactions`
  - `/v1/webhooks`

### Birdeye API
- Endpoint: `https://public-api.birdeye.so`
- Purpose: Token prices, market data, historical charts
- Key endpoints:
  - `/defi/price`
  - `/defi/history_price`
  - `/defi/token_overview`

### Flask Backend
- Local endpoint: `http://localhost:5000`
- Purpose: Data processing, analytics
- Features:
  - Transaction analysis
  - Pattern detection
  - Data aggregation

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HELIUS_API_KEY=your_helius_api_key
VITE_BIRDEYE_API_KEY=your_birdeye_api_key
```

## KOL Profiles (Current)

1. **Ga__ke** (@Ga__ke) - DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm
2. **Jijo** (@jijo_exe) - 4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk
3. **Frosty** (@ohFrostyyy) - EAnB5151L8ejp3SM6haLgyv3snk6oqc8acKgWEg9T5J
4. **Til** (@tilcrypto) - EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf
5. **Gregorian** (@gr3gor14n) - J23qr98GjGJJqKq9CBEnyRhHbmkaVxtTJNNxKu597wsA
6. **Latuche** (@Latuche95) - GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65
7. **Publix** (@Publixplayz) - 86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD
8. **Groovy** (@0xGroovy) - 34ZEH778zL8ctkLwxxERLX5ZnUu6MuFyX9CWrs8kucMw
9. **Yolo** (@Heyitsyolotv) - Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ
10. **Untaxxable** (@untaxxable) - 2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH

## Design System

### Color Scheme
- Primary: Black background (#000000)
- Text: White/Gray gradients
- Accents: White borders with transparency
- Buttons: White with black text
- Cards: White/10 backgrounds with blur

### Typography
- Font: System fonts (sans-serif)
- Headings: Bold, 2xl-6xl sizes
- Body: Regular, base-lg sizes

### Components Style
- Rounded corners (xl, 2xl, 3xl)
- Backdrop blur effects
- Hover states with scale transforms
- Smooth transitions (300-500ms)
- Shadow effects for depth

## Routing Structure

```
/ - Home page
/app - Main app dashboard
/app/kol-feed - KOL transaction feed
/app/kol-leaderboard - KOL rankings
/app/kol-profile/:address - Individual KOL profile
/app/top-kol-tokens - Top tokens by KOL activity
/app/top-tokens - Overall top tokens
/app/daily-trends - Daily market trends
/app/trends-analytics - Trend analysis
/app/transactions - Transaction history
/app/wallet-finder - Wallet discovery
/app/cabal-finder - Group detection
/app/copy-traders - Copy trading features
/app/insider-scan - Insider detection
/app/fresh-wallet-feed - New wallets
/app/live-dca-feed - DCA activity
/app/my-stalks - User's tracked items
/app/legend-community - Premium community
/futures - Futures section
/learning-center - Educational content
```

## Key Functionalities

### Transaction Monitoring
- Real-time webhook integration
- Automatic transaction parsing
- KOL activity tracking
- Volume and value calculations

### Wallet Analysis
- Performance metrics (PnL, win rate)
- Transaction history
- Token holdings
- Trading patterns

### Pattern Detection
- Coordinated trading (cabals)
- Insider patterns
- Fresh wallet activities
- Whale movements

### User Features
- Wallet bookmarking
- Custom alerts
- Personalized feeds
- Community access (premium)

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Security
- Row Level Security (RLS) on all tables
- Public read access for public data
- Authenticated writes only
- API key protection
- Environment variable management

