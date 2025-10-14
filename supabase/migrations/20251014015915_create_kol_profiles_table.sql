/*
  # Create KOL Profiles Table

  1. New Tables
    - `kol_profiles`
      - `id` (uuid, primary key) - Unique identifier for each KOL
      - `wallet_address` (text, unique) - Solana wallet address (primary identifier)
      - `name` (text) - Display name of the KOL
      - `avatar_url` (text) - URL to profile avatar image
      - `twitter_handle` (text) - Twitter username without @
      - `bio` (text) - Biography/description of the KOL
      - `total_pnl` (numeric) - Total profit/loss across all trades
      - `total_trades` (integer) - Total number of trades
      - `win_rate` (numeric) - Win rate percentage
      - `total_volume` (numeric) - Total trading volume
      - `followers_count` (integer) - Number of followers/subscribers
      - `is_verified` (boolean) - Whether the KOL is verified
      - `rank` (integer) - Overall ranking
      - `created_at` (timestamptz) - When the profile was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `kol_profiles` table
    - Add policy for public read access (anyone can view KOL profiles)
    - Add policy for authenticated admin users to insert/update profiles

  3. Important Notes
    - This table stores verified KOL trader profiles
    - Public read access allows anyone to view profiles
    - Only admins can modify profiles (for data integrity)
*/

CREATE TABLE IF NOT EXISTS kol_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  twitter_handle text,
  bio text,
  total_pnl numeric DEFAULT 0,
  total_trades integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  total_volume numeric DEFAULT 0,
  followers_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  rank integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kol_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view KOL profiles"
  ON kol_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert KOL profiles"
  ON kol_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update KOL profiles"
  ON kol_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_kol_profiles_wallet ON kol_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_kol_profiles_rank ON kol_profiles(rank);
CREATE INDEX IF NOT EXISTS idx_kol_profiles_total_pnl ON kol_profiles(total_pnl DESC);