/*
  # Add SOL amount tracking to transactions
  
  ## Changes
  
  1. New Columns
    - `sol_amount` (numeric, nullable) - Amount of SOL involved in the transaction
      - Negative = SOL spent (buying tokens)
      - Positive = SOL received (selling tokens)
    - `native_balance_change` (numeric, nullable) - Native SOL balance change for the wallet
  
  ## Purpose
  
  These fields enable accurate classification of SWAP transactions:
  - SWAP SOL -> Token (sol_amount < 0) = BUY
  - SWAP Token -> SOL (sol_amount > 0) = SELL
  
  This improves P&L calculation accuracy by correctly identifying buy vs sell operations.
*/

-- Add SOL amount tracking columns
DO $$
BEGIN
  -- Add sol_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webhook_transactions' AND column_name = 'sol_amount'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN sol_amount numeric;
  END IF;

  -- Add native_balance_change column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webhook_transactions' AND column_name = 'native_balance_change'
  ) THEN
    ALTER TABLE webhook_transactions ADD COLUMN native_balance_change numeric;
  END IF;
END $$;