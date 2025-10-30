/*
  # Add Twitter Handle to Monitored Wallets

  1. Changes
    - Add twitter_handle column to monitored_wallets table
    - Add twitter_followers column for follower count
  
  2. Purpose
    - Store social media information for monitored wallets
    - Enable linking wallets to their Twitter profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monitored_wallets' AND column_name = 'twitter_handle'
  ) THEN
    ALTER TABLE monitored_wallets ADD COLUMN twitter_handle text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monitored_wallets' AND column_name = 'twitter_followers'
  ) THEN
    ALTER TABLE monitored_wallets ADD COLUMN twitter_followers integer DEFAULT 0;
  END IF;
END $$;
