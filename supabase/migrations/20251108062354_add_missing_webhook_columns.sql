/*
  # Add missing columns to webhook_transactions

  1. Changes
    - Add `price_usd` column (alias for current_token_price)
    - Add `token_amount` column (alias for amount)
    - Add `token_decimals` column
    - Add `token_logo` column

  2. Notes
    - These columns are required by the Edge Function
    - Using numeric for price and decimals
    - Using text for logo URL
*/

-- Add missing columns
ALTER TABLE webhook_transactions 
  ADD COLUMN IF NOT EXISTS token_decimals integer,
  ADD COLUMN IF NOT EXISTS token_logo text;

-- Create a view or use triggers to sync price_usd with current_token_price
-- For now, we'll just ensure both columns exist by aliasing in queries
-- But the function uses price_usd, so let's add it
ALTER TABLE webhook_transactions 
  ADD COLUMN IF NOT EXISTS price_usd numeric;

-- Migrate existing data
UPDATE webhook_transactions 
SET price_usd = current_token_price 
WHERE price_usd IS NULL AND current_token_price IS NOT NULL;

-- Add token_amount as alias for amount if needed
ALTER TABLE webhook_transactions 
  ADD COLUMN IF NOT EXISTS token_amount numeric;

UPDATE webhook_transactions 
SET token_amount = amount 
WHERE token_amount IS NULL AND amount IS NOT NULL;