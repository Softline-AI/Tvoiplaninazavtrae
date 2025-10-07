/*
  # Create webhook transactions table

  1. New Tables
    - `webhook_transactions`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `transaction_signature` (text, unique) - Blockchain transaction signature
      - `block_time` (timestamptz) - When the transaction occurred on blockchain
      - `from_address` (text) - Sender wallet address
      - `to_address` (text) - Receiver wallet address
      - `amount` (numeric) - Token amount transferred
      - `token_mint` (text) - Token mint address
      - `token_symbol` (text, nullable) - Token symbol if available
      - `transaction_type` (text) - Type of transaction (TRANSFER, SWAP, etc)
      - `fee` (numeric, nullable) - Transaction fee
      - `raw_data` (jsonb) - Full webhook payload for reference
      - `created_at` (timestamptz) - When the record was created in our database

  2. Security
    - Enable RLS on `webhook_transactions` table
    - Add policy for authenticated users to read all webhook data
    - Webhook function will use service role key to bypass RLS when inserting

  3. Indexes
    - Index on transaction_signature for fast lookups
    - Index on from_address for wallet tracking
    - Index on block_time for chronological queries
    - Index on token_mint for token-specific queries
*/

CREATE TABLE IF NOT EXISTS webhook_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_signature text UNIQUE NOT NULL,
  block_time timestamptz NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  amount numeric NOT NULL,
  token_mint text NOT NULL,
  token_symbol text,
  transaction_type text NOT NULL,
  fee numeric,
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_signature 
  ON webhook_transactions(transaction_signature);

CREATE INDEX IF NOT EXISTS idx_webhook_transactions_from_address 
  ON webhook_transactions(from_address);

CREATE INDEX IF NOT EXISTS idx_webhook_transactions_block_time 
  ON webhook_transactions(block_time DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_transactions_token_mint 
  ON webhook_transactions(token_mint);

-- Enable RLS
ALTER TABLE webhook_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read webhook data
CREATE POLICY "Authenticated users can read webhook transactions"
  ON webhook_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for service role to insert webhook data (bypasses RLS automatically)
CREATE POLICY "Service role can insert webhook transactions"
  ON webhook_transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);