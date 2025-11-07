/*
  # Add UPDATE policy for webhook_transactions
  
  ## Changes
  
  1. Security
    - Add policy to allow authenticated and anon users to update webhook_transactions
    - This enables reclassification of existing transactions
  
  ## Purpose
  
  Allows scripts and authenticated users to update transaction types
  when reclassification is needed (e.g., after improving classification logic)
*/

-- Add UPDATE policy for authenticated and anon users
CREATE POLICY "Public update access to webhook transactions"
  ON webhook_transactions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);