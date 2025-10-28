/*
  # Add anon read access to webhook_transactions

  1. Security Changes
    - Add policy to allow anon role to read webhook transactions
    - This is needed for public KOL feed access through API
    
  2. Notes
    - Data is non-sensitive public transaction data
    - Read-only access for anon users
*/

-- Drop and recreate the authenticated policy to include anon
DROP POLICY IF EXISTS "Authenticated users can read webhook transactions" ON webhook_transactions;

CREATE POLICY "Public read access to webhook transactions"
  ON webhook_transactions
  FOR SELECT
  TO anon, authenticated
  USING (true);
