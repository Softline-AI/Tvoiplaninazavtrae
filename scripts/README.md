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

## Future Improvements

- [ ] Add batch processing for multiple wallets
- [ ] Add filtering by date range
- [ ] Add support for pagination (>50 transactions)
- [ ] Add retry logic for failed requests
- [ ] Add progress bar
- [ ] Add dry-run mode
- [ ] Export to CSV
