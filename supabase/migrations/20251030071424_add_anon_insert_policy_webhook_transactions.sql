/*
  # Add anon insert access to webhook_transactions

  1. Security Changes
    - Add policy to allow anon role to insert webhook transactions
    - This is needed for import scripts and webhook processing
    
  2. Notes
    - Allows public insert for transaction data
    - Used by Helius webhook and import scripts
*/

CREATE POLICY "Public insert access to webhook transactions"
  ON webhook_transactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
