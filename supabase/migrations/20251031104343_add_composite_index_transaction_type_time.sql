/*
  # Add composite index for transaction type and time filtering

  1. New Index
    - `idx_webhook_transactions_type_time` - Composite index on (transaction_type, block_time DESC)
    - This optimizes queries that filter by transaction_type and order by block_time
    - Particularly useful for KOL Feed queries with .in('transaction_type', ['BUY', 'SELL'])

  2. Performance Impact
    - Faster filtering on BUY/SELL transactions
    - Improved query performance for time-based sorting
    - Reduced query execution time for large datasets
*/

-- Add composite index for transaction type and block time
CREATE INDEX IF NOT EXISTS idx_webhook_transactions_type_time 
ON webhook_transactions(transaction_type, block_time DESC);