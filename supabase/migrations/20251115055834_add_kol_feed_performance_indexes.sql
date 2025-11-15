/*
  # Add performance indexes for KOL Feed

  1. Performance Improvements
    - Add composite index on (from_address, block_time) for faster KOL transaction queries
    - Add index on twitter_handle for faster profile lookups
    - Add index on token_mint for faster token filtering
    - Add partial index for BUY/SELL transactions only

  2. Notes
    - These indexes will significantly speed up KOL Feed queries
    - Composite index on (from_address, block_time DESC) allows fast sorting
    - Partial index reduces storage and improves query speed for filtered data
*/

-- Composite index for KOL wallet transactions with time sorting
CREATE INDEX IF NOT EXISTS idx_webhook_tx_wallet_time 
  ON webhook_transactions (from_address, block_time DESC)
  WHERE transaction_type IN ('BUY', 'SELL');

-- Index for token filtering
CREATE INDEX IF NOT EXISTS idx_webhook_tx_token_mint 
  ON webhook_transactions (token_mint)
  WHERE token_symbol != 'UNKNOWN';

-- Index for twitter handle lookups in monitored_wallets
CREATE INDEX IF NOT EXISTS idx_monitored_wallets_twitter 
  ON monitored_wallets (twitter_handle)
  WHERE twitter_handle IS NOT NULL;

-- Index for KOL profiles wallet lookup
CREATE INDEX IF NOT EXISTS idx_kol_profiles_wallet 
  ON kol_profiles (wallet_address);

-- Composite index for transaction type filtering with time
CREATE INDEX IF NOT EXISTS idx_webhook_tx_type_time 
  ON webhook_transactions (transaction_type, block_time DESC)
  WHERE transaction_type IN ('BUY', 'SELL') AND token_symbol != 'UNKNOWN';