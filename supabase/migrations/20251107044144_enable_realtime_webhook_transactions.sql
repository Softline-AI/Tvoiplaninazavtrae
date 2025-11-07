/*
  # Enable Realtime for webhook_transactions
  
  ## Changes
  
  1. Realtime
    - Enable realtime publication for webhook_transactions table
    - This allows clients to subscribe to INSERT/UPDATE/DELETE events in real-time
  
  ## Purpose
  
  Enables instant notification of new transactions so KOL Feed displays
  buy/sell transactions immediately without polling or page refresh
*/

-- Enable realtime for webhook_transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_transactions;