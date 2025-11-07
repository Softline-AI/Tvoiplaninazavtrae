# Transaction Import Scripts

## Overview

Scripts for importing historical transactions from Helius API into the database.

---

## import-transactions.js

Imports recent transactions for monitored wallets from Helius API.

### Features

- Fetches last 50 transactions per wallet
- Parses transaction types (BUY, SELL, SWAP)
- Fetches current token prices from Birdeye
- Stores in `webhook_transactions` table
- Skips duplicates automatically

### Usage

```bash
node scripts/import-transactions.js
```

### Configuration

Edit `WALLETS` array in the script to add/remove wallets:

```javascript
const WALLETS = [
  '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
  'GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN',
  // ...
];
```

### Environment Variables

Required in `.env`:
```
VITE_HELIUS_API_KEY_1=your-helius-key
VITE_BIRDEYE_API_KEY=your-birdeye-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

### Output

```
=== Importing transactions for cupseyy (2fg5QD1e...) ===
Fetched 50 transactions for 2fg5QD1e...
✓ Imported SWAP Fungible... ($62.27)
✓ Imported BUY Fungible... ($108.85)
Imported: 20, Skipped: 30

=== Import Complete ===
Total transactions imported: 209
```

### Transaction Type Mapping

| Helius Type | Our Type |
|-------------|----------|
| SWAP | SWAP |
| BUY | BUY |
| SELL | SELL |
| TOKEN_MINT | BUY |
| FILL_ORDER | BUY |
| TRANSFER (from wallet) | SELL |
| TRANSFER (to wallet) | BUY |

### Rate Limits

- Helius API: No rate limit on free tier
- Birdeye API: 100ms delay between requests
- Script processes ~1 wallet/second

---

## Adding New Wallets

1. Add to `monitored_wallets` table:
```sql
INSERT INTO monitored_wallets (wallet_address, twitter_handle, label)
VALUES ('WALLET_ADDRESS', 'https://x.com/username', 'username');
```

2. Add to `kol_profiles` table:
```sql
INSERT INTO kol_profiles (wallet_address, name, twitter_handle, avatar_url)
VALUES ('WALLET_ADDRESS', 'Name', 'username', 'https://images.pexels.com/...');
```

3. Add wallet to `WALLETS` array in script

4. Run import script

---

## Troubleshooting

### No transactions found

- Check wallet address is correct
- Verify wallet has recent activity on Solscan
- Check Helius API key is valid

### RLS Policy Errors

```
Error: new row violates row-level security policy
```

**Solution:** Supabase RLS policies must allow INSERT for anon role:

```sql
CREATE POLICY "Public insert access to webhook transactions"
  ON webhook_transactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### Duplicate Transaction Errors

```
Error: duplicate key value violates unique constraint
```

**This is normal** - script skips duplicates automatically.

---

## Database Schema

### webhook_transactions

```sql
CREATE TABLE webhook_transactions (
  id uuid PRIMARY KEY,
  transaction_signature text UNIQUE,
  block_time timestamptz,
  from_address text,
  to_address text,
  amount numeric,
  token_mint text,
  token_symbol text,
  transaction_type text,
  fee numeric,
  token_pnl numeric,
  token_pnl_percentage numeric,
  current_token_price numeric,
  entry_price numeric,
  raw_data jsonb
);
```

### monitored_wallets

```sql
CREATE TABLE monitored_wallets (
  id uuid PRIMARY KEY,
  wallet_address text UNIQUE,
  label text,
  twitter_handle text,
  twitter_followers integer,
  is_active boolean DEFAULT true
);
```

---

## check-pnl.js

Проверяет транзакции и корректность расчета P&L.

### Features

- Получает последние 50 транзакций из базы данных
- Отображает детальную информацию о каждой транзакции
- Группирует транзакции по трейдерам
- Показывает статистику P&L
- Проверяет Entry Price, Current Price, P&L %

### Usage

```bash
node scripts/check-pnl.js
```

### Output Example

```
🔍 Fetching transactions from Supabase...

✅ Found 50 transactions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Trader: cupseyy
   Twitter: @cupseyy
   Wallet: 2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f
   ──────────────────────────────────────────────────────────────────────

   1. 🟢 BUY  | TRUMP | 2025-01-07 14:30:22
      Token:          TRUMP (HaP8r3ks...)
      Amount:         1250.0000 tokens
      Entry Price:    $0.12500000
      Current Price:  $0.15000000
      Market Cap:     $150M
      Remaining:      1250.0000 tokens
      🟢 P&L:            $31.25 (+20.00%)
      TX Signature:   5Qi7Tq8hPxNwE...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total Transactions Displayed: 50
📈 Total Unique Traders: 15

💰 P&L Statistics:
   Total P&L:          $4,523.45
   Average P&L:        $90.47
   Profitable Trades:  32/50 (64.0%)

📈 Transaction Type Distribution:
   BUY transactions:   28 (56.0%)
   SELL transactions:  22 (44.0%)

✅ P&L Check Complete!
```

### What It Checks

- ✅ Entry Price calculation
- ✅ Current Price from database
- ✅ P&L calculation (USD)
- ✅ P&L Percentage calculation
- ✅ Remaining tokens tracking
- ✅ BUY vs SELL logic
- ✅ Market cap data

---

## monitor-transactions.js

Real-time transaction monitoring with alerts and notifications.

### Features

- Real-time monitoring (checks every 60 seconds)
- Zero P&L trade alerts (instant flips)
- Profitable trade notifications (> $10)
- Token balance analysis
- Negative balance detection
- Summary statistics

### Usage

```bash
node scripts/monitor-transactions.js
```

### Alerts

**Zero P&L Alert:**
```
⚠️  ZERO P&L ALERT
   Trader: cupseyy
   Token: USD1
   Type: SELL
   Instant flip detected - bought and sold at same price
```

**Profitable Trade Alert:**
```
💰 PROFITABLE TRADE ALERT
   Trader: publixplays
   Token: TRUMP
   P&L: $52.35 (+15.25%)
```

**Big Win Alert (> $100):**
```
🎉 BIG WIN ALERT!
   Trader: beaverd
   Token: BONK
   P&L: $523.45 (+125.50%)
```

### Token Balance Analysis

The monitor analyzes token balances to detect potential issues:

- **Negative balances**: May indicate sells before tracked buys
- **Balance discrepancies**: Shows BUY/SELL count for debugging

### Control

- Press `Ctrl+C` to stop monitoring
- Updates every 60 seconds
- Runs initial balance analysis on start

---

## Future Improvements

- [ ] Add batch processing for multiple wallets
- [ ] Add filtering by date range
- [ ] Add support for pagination (>50 transactions)
- [ ] Add retry logic for failed requests
- [ ] Add progress bar
- [ ] Add dry-run mode
- [ ] Export to CSV
- [x] Real-time monitoring
- [x] Transaction alerts
- [x] Balance analysis
