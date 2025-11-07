/*
  # Fix Token Metadata RLS Policies
  
  1. Problem
    - Token metadata table only has SELECT policy for anon users
    - Missing INSERT and UPDATE policies causing 401 errors
    - tokenMetadataService cannot save cached data
  
  2. Changes
    - Add INSERT policy for anon users to cache token metadata
    - Add UPDATE policy for anon users to refresh cached data
    - Allows frontend to cache Birdeye API responses
  
  3. Security
    - Policies allow anon users to write/update token metadata
    - This is safe as token metadata is public information
    - Reduces API calls to Birdeye and improves performance
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow anonymous insert to token metadata" ON token_metadata;
  DROP POLICY IF EXISTS "Allow anonymous update to token metadata" ON token_metadata;
  DROP POLICY IF EXISTS "Allow authenticated insert to token metadata" ON token_metadata;
  DROP POLICY IF EXISTS "Allow authenticated update to token metadata" ON token_metadata;
END $$;

-- Add INSERT policy for anon users
CREATE POLICY "Allow anonymous insert to token metadata"
  ON token_metadata
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add UPDATE policy for anon users
CREATE POLICY "Allow anonymous update to token metadata"
  ON token_metadata
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add authenticated users policies for completeness
CREATE POLICY "Allow authenticated insert to token metadata"
  ON token_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to token metadata"
  ON token_metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);