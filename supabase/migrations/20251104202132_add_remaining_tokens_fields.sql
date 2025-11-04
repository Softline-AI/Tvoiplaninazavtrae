/*
  # Add remaining tokens tracking fields

  1. Changes
    - Add `remaining_tokens` column to track how many tokens remain after transaction
    - Add `all_tokens_sold` boolean to indicate if position is fully closed
  
  2. Details
    - `remaining_tokens` (numeric) - Amount of tokens remaining in wallet for this token
    - `all_tokens_sold` (boolean) - True if trader has sold all tokens, false if partial sale
    
  3. Purpose
    - Track partial vs complete sales
    - Show accurate position status for each trader
    - Calculate P&L correctly for partial positions
*/

-- Add remaining tokens tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webhook_transactions' AND column_name = 'remaining_tokens'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN remaining_tokens NUMERIC DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webhook_transactions' AND column_name = 'all_tokens_sold'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN all_tokens_sold BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_remaining ON webhook_transactions(from_address, token_mint, all_tokens_sold);