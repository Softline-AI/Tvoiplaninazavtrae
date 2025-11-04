/*
  # Create token metadata cache table

  1. New Tables
    - `token_metadata`
      - `id` (uuid, primary key)
      - `token_mint` (text, unique) - Token mint address
      - `token_symbol` (text) - Token symbol
      - `token_name` (text) - Full token name
      - `logo_url` (text) - Token logo URL
      - `decimals` (integer) - Token decimals
      - `description` (text) - Token description
      - `last_updated` (timestamptz) - Last time metadata was updated
      - `created_at` (timestamptz) - When record was created

  2. Security
    - Enable RLS on `token_metadata` table
    - Add policy for anonymous users to read token metadata

  3. Indexes
    - Index on token_mint for fast lookups
    - Index on last_updated for cache invalidation
*/

CREATE TABLE IF NOT EXISTS token_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_mint text UNIQUE NOT NULL,
  token_symbol text,
  token_name text,
  logo_url text,
  decimals integer DEFAULT 0,
  description text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE token_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to token metadata"
  ON token_metadata
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_token_metadata_mint ON token_metadata(token_mint);
CREATE INDEX IF NOT EXISTS idx_token_metadata_updated ON token_metadata(last_updated);