/*
  # Add Performance Optimization Indexes

  1. Performance Improvements
    - Add index on `block_time` for fast time-based filtering
    - Add index on `from_address` for quick KOL lookup
    - Add index on `token_symbol` for token-specific queries
    - Add composite index on `from_address, token_mint` for entry price lookups
    - Add index on `token_pnl` for P&L sorting
    - Add index on `transaction_type` for filtering by type

  2. Benefits
    - Faster queries for KOL Feed (time-based filtering)
    - Faster KOL Profile lookups
    - Faster token-specific analytics
    - Optimized entry price calculations
    - Improved sorting performance

  3. Notes
    - These indexes significantly improve query performance
    - Minimal storage overhead
    - Essential for scaling to large transaction volumes
*/

-- Index for time-based queries (most common filter)
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_block_time 
  ON webhook_transactions (block_time DESC);

-- Index for KOL-specific queries
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_from_address 
  ON webhook_transactions (from_address);

-- Index for token-specific queries
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_token_symbol 
  ON webhook_transactions (token_symbol);

-- Index for token mint lookups
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_token_mint 
  ON webhook_transactions (token_mint);

-- Composite index for entry price calculations (critical for P&L)
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_entry_lookup 
  ON webhook_transactions (from_address, token_mint, block_time ASC);

-- Index for P&L sorting
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_token_pnl 
  ON webhook_transactions (token_pnl DESC);

-- Index for transaction type filtering
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_type 
  ON webhook_transactions (transaction_type);

-- Composite index for KOL Feed queries (most common use case)
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_kol_feed 
  ON webhook_transactions (from_address, block_time DESC);

-- Index for profitable trades calculation
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_profitable 
  ON webhook_transactions (from_address, token_pnl) 
  WHERE token_pnl > 0;
