/*
  # Add read policy for monitored_wallets

  1. Security
    - Add policy for anonymous users to read monitored_wallets table
    - This is needed for the import script to fetch wallet addresses
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'monitored_wallets' 
    AND policyname = 'Allow anon read monitored wallets'
  ) THEN
    CREATE POLICY "Allow anon read monitored wallets"
      ON monitored_wallets
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
