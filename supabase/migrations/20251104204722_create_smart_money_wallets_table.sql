/*
  # Create smart_money_wallets table

  1. New Tables
    - `smart_money_wallets`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique, required) - Solana wallet address to track
      - `nickname` (text, required) - Display name for the trader
      - `twitter_handle` (text, optional) - Twitter handle of the trader
      - `created_at` (timestamptz) - When the wallet was added for tracking

  2. Security
    - Enable RLS on `smart_money_wallets` table
    - Add policy for anonymous users to read all wallets
    - Add policy for anonymous users to insert new wallets
    - Add policy for anonymous users to delete wallets

  3. Indexes
    - Index on wallet_address for fast lookups
    - Index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS smart_money_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  nickname text NOT NULL,
  twitter_handle text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE smart_money_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to smart_money_wallets"
  ON smart_money_wallets
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert to smart_money_wallets"
  ON smart_money_wallets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from smart_money_wallets"
  ON smart_money_wallets
  FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_smart_money_wallets_address ON smart_money_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_smart_money_wallets_created ON smart_money_wallets(created_at DESC);
