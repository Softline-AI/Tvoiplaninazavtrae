/*
  # Add token-specific PnL to transactions

  1. Changes
    - Add `token_pnl` column to store P&L for this specific token trade
    - Add `token_pnl_percentage` column to store P&L percentage for this token
    - Add `current_token_price` column to store token price at transaction time
    - Add `entry_price` column to store entry price if this is a sell

  2. Notes
    - `token_pnl` can be positive (profit) or negative (loss)
    - For BUY transactions, token_pnl might be 0 or show unrealized P&L
    - For SELL transactions, token_pnl shows realized P&L
*/

DO $$ 
BEGIN
  -- Add token_pnl column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_transactions' AND column_name = 'token_pnl'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN token_pnl DECIMAL(20, 2) DEFAULT 0;
  END IF;

  -- Add token_pnl_percentage column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_transactions' AND column_name = 'token_pnl_percentage'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN token_pnl_percentage DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- Add current_token_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_transactions' AND column_name = 'current_token_price'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN current_token_price DECIMAL(20, 8) DEFAULT 0;
  END IF;

  -- Add entry_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_transactions' AND column_name = 'entry_price'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN entry_price DECIMAL(20, 8) DEFAULT 0;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_token_pnl 
ON webhook_transactions(token_pnl DESC);

-- Comment on columns
COMMENT ON COLUMN webhook_transactions.token_pnl IS 'P&L for this specific token trade in USD';
COMMENT ON COLUMN webhook_transactions.token_pnl_percentage IS 'P&L percentage for this token trade';
COMMENT ON COLUMN webhook_transactions.current_token_price IS 'Token price at transaction time';
COMMENT ON COLUMN webhook_transactions.entry_price IS 'Entry price for this token (for sell transactions)';
