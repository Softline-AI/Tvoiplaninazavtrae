/*
  # Create Token Price Cache Table

  1. New Table: `token_price_cache`
    - `id` (uuid, primary key)
    - `token_mint` (text, unique) - Token mint address
    - `token_symbol` (text) - Token symbol for display
    - `price` (numeric) - Current token price in USD
    - `last_updated` (timestamptz) - When price was last fetched
    - `created_at` (timestamptz) - When record was created

  2. Purpose
    - Cache token prices to reduce API calls to Birdeye
    - Update prices only when they're older than 5 minutes
    - Significantly reduces webhook processing time
    - Reduces API quota usage

  3. Security
    - Enable RLS
    - Allow anonymous read access (prices are public data)
    - Only service role can insert/update

  4. Performance
    - Index on token_mint for fast lookups
    - Index on last_updated for cache expiry checks
*/

-- Create token price cache table
CREATE TABLE IF NOT EXISTS token_price_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_mint text UNIQUE NOT NULL,
  token_symbol text,
  price numeric NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE token_price_cache ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read prices (public data)
CREATE POLICY "Anyone can read token prices"
  ON token_price_cache
  FOR SELECT
  TO anon
  USING (true);

-- Only authenticated users can read (alternative to anon)
CREATE POLICY "Authenticated users can read token prices"
  ON token_price_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_price_cache_mint 
  ON token_price_cache (token_mint);

CREATE INDEX IF NOT EXISTS idx_token_price_cache_updated 
  ON token_price_cache (last_updated DESC);

-- Create function to get or fetch token price
CREATE OR REPLACE FUNCTION get_cached_token_price(
  p_token_mint text,
  p_cache_duration_minutes int DEFAULT 5
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_price numeric;
  v_last_updated timestamptz;
BEGIN
  -- Try to get cached price
  SELECT price, last_updated
  INTO v_price, v_last_updated
  FROM token_price_cache
  WHERE token_mint = p_token_mint;

  -- If found and not expired, return cached price
  IF FOUND AND (NOW() - v_last_updated) < (p_cache_duration_minutes || ' minutes')::interval THEN
    RETURN v_price;
  END IF;

  -- Return NULL to indicate cache miss (caller should fetch from API)
  RETURN NULL;
END;
$$;

-- Create function to update token price cache
CREATE OR REPLACE FUNCTION update_token_price_cache(
  p_token_mint text,
  p_token_symbol text,
  p_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO token_price_cache (token_mint, token_symbol, price, last_updated)
  VALUES (p_token_mint, p_token_symbol, p_price, NOW())
  ON CONFLICT (token_mint) 
  DO UPDATE SET
    token_symbol = EXCLUDED.token_symbol,
    price = EXCLUDED.price,
    last_updated = NOW();
END;
$$;
