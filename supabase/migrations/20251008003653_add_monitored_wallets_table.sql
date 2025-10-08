/*
  # Create monitored wallets table

  1. New Tables
    - `monitored_wallets`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text, unique) - Solana wallet address to monitor
      - `label` (text, nullable) - Optional label/name for the wallet
      - `is_active` (boolean) - Whether monitoring is active for this wallet
      - `created_at` (timestamptz) - When the wallet was added
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on `monitored_wallets` table
    - Add policy for authenticated users to read all monitored wallets
    - Add policy for service role to manage wallets

  3. Indexes
    - Index on wallet_address for fast lookups
    - Index on is_active for filtering active wallets
*/

CREATE TABLE IF NOT EXISTS monitored_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  label text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitored_wallets_address 
  ON monitored_wallets(wallet_address);

CREATE INDEX IF NOT EXISTS idx_monitored_wallets_active 
  ON monitored_wallets(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE monitored_wallets ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read monitored wallets
CREATE POLICY "Authenticated users can read monitored wallets"
  ON monitored_wallets
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for service role to manage monitored wallets
CREATE POLICY "Service role can manage monitored wallets"
  ON monitored_wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert the 25 monitored wallets
INSERT INTO monitored_wallets (wallet_address) VALUES
  ('FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR'),
  ('BoYHJoKntk3pjkaV8qFojEonSPWmWMfQocZTwDd1bcGG'),
  ('8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR'),
  ('m7Kaas3Kd8FHLnCioSjCoSuVDReZ6FDNBVM6HTNYuF7'),
  ('BuhkHhM3j4viF71pMTd23ywxPhF35LUnc2QCLAvUxCdW'),
  ('3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei'),
  ('GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN'),
  ('Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow'),
  ('2kv8X2a9bxnBM8NKLc6BBTX2z13GFNRL4oRotMUJRva9'),
  ('GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65'),
  ('8MaVa9kdt3NW4Q5HyNAm1X5LbR8PQRVDc1W8NMVK88D5'),
  ('JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN'),
  ('sAdNbe1cKNMDqDsa4npB3TfL62T14uAo2MsUQfLvzLT'),
  ('EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf'),
  ('AeLaMjzxErZt4drbWVWvcxpVyo8p94xu5vrg41eZPFe3'),
  ('Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ'),
  ('4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk'),
  ('76zneZhcvEzF5JXznQuF5tpoVSDiuchw4h5epCdi4bdT'),
  ('BTYBjYjodGY7K2ifq1c4Wv4WMbJQPVN7tUStTsfcvR31'),
  ('8BseXT9EtoEhBTKFFYkwTnjKSUZwhtmdKY2Jrj8j45Rt'),
  ('52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD'),
  ('MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2')
ON CONFLICT (wallet_address) DO NOTHING;
