/*
  # Create tracked tokens table for My Smarts feature

  1. New Tables
    - `tracked_tokens`
      - `id` (uuid, primary key)
      - `user_id` (text) - User identifier for future auth integration
      - `token_address` (text) - Token contract address
      - `token_symbol` (text) - Token symbol (e.g., SOL, BTC)
      - `token_name` (text) - Full token name
      - `network` (text) - Blockchain network (solana, ethereum, etc.)
      - `price_alert_enabled` (boolean) - Enable price change alerts
      - `price_threshold_percent` (numeric) - Alert threshold percentage
      - `transaction_alert_enabled` (boolean) - Enable transaction alerts
      - `current_price` (numeric) - Last known price
      - `tracked_since` (timestamptz) - When tracking started
      - `last_alert_time` (timestamptz) - Last alert timestamp
      - `is_active` (boolean) - Is tracking active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `tracked_tokens` table
    - Add policy for anonymous users to manage their tokens (temporary until auth is implemented)

  3. Indexes
    - Index on token_address for fast lookups
    - Index on is_active for filtering active tokens
    - Index on user_id for future user-based queries
*/

CREATE TABLE IF NOT EXISTS tracked_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'anonymous',
  token_address text NOT NULL,
  token_symbol text NOT NULL,
  token_name text NOT NULL,
  network text DEFAULT 'solana',
  price_alert_enabled boolean DEFAULT true,
  price_threshold_percent numeric DEFAULT 5.0,
  transaction_alert_enabled boolean DEFAULT true,
  current_price numeric DEFAULT 0,
  tracked_since timestamptz DEFAULT now(),
  last_alert_time timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tracked_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous users to read tracked tokens"
  ON tracked_tokens
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous users to insert tracked tokens"
  ON tracked_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update tracked tokens"
  ON tracked_tokens
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to delete tracked tokens"
  ON tracked_tokens
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tracked_tokens_address ON tracked_tokens(token_address);
CREATE INDEX IF NOT EXISTS idx_tracked_tokens_active ON tracked_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_tracked_tokens_user ON tracked_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_tokens_network ON tracked_tokens(network);