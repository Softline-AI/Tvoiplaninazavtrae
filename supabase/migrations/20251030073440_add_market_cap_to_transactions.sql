/*
  # Add market cap to webhook_transactions

  1. Changes
    - Add market_cap column to store token market capitalization
    - Add token_name column to store full token name
    
  2. Notes
    - Market cap will be fetched from Birdeye API
    - Helps with filtering and sorting tokens by size
*/

ALTER TABLE webhook_transactions 
ADD COLUMN IF NOT EXISTS market_cap numeric DEFAULT 0;

ALTER TABLE webhook_transactions 
ADD COLUMN IF NOT EXISTS token_name text;

CREATE INDEX IF NOT EXISTS idx_transactions_market_cap ON webhook_transactions(market_cap);
