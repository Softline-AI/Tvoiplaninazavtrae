/**
 * Transaction Type Mapper
 *
 * Maps various transaction types to standardized BUY/SELL actions
 */

export type TransactionAction = 'BUY' | 'SELL' | 'UNKNOWN';

interface TransactionTypeMapping {
  buyTypes: string[];
  sellTypes: string[];
  swapTypes: string[];
  transferTypes: string[];
}

const TYPE_MAPPING: TransactionTypeMapping = {
  buyTypes: [
    'BUY',
    'buy',
    'Buy',
  ],

  sellTypes: [
    'SELL',
    'sell',
    'Sell',
  ],

  swapTypes: [
    'SWAP',
    'swap',
    'Swap',
  ],

  transferTypes: [
    'TRANSFER',
    'transfer',
    'Transfer',
    'transferChecked',
    'get_fees',
    'x5',
    'anchor Self CPI Log'
  ]
};

/**
 * Determine if a SWAP transaction is a BUY or SELL
 * based on token balances and amounts
 */
export function classifySwapTransaction(
  tokenMint: string,
  amount: number,
  fromTokenBalance?: number,
  toTokenBalance?: number
): TransactionAction {
  // If amount is positive, it's likely a BUY (receiving tokens)
  if (amount > 0) {
    return 'BUY';
  }

  // If amount is negative, it's likely a SELL (sending tokens)
  if (amount < 0) {
    return 'SELL';
  }

  // If we have balance information
  if (fromTokenBalance !== undefined && toTokenBalance !== undefined) {
    if (toTokenBalance > fromTokenBalance) {
      return 'BUY';
    } else if (toTokenBalance < fromTokenBalance) {
      return 'SELL';
    }
  }

  return 'UNKNOWN';
}

/**
 * Map transaction type to BUY/SELL action
 */
export function mapTransactionType(
  transactionType: string,
  tokenMint?: string,
  amount?: number,
  additionalContext?: any
): TransactionAction {
  const type = transactionType?.toUpperCase() || 'UNKNOWN';

  // Direct BUY types
  if (TYPE_MAPPING.buyTypes.some(t => t.toUpperCase() === type)) {
    return 'BUY';
  }

  // Direct SELL types
  if (TYPE_MAPPING.sellTypes.some(t => t.toUpperCase() === type)) {
    return 'SELL';
  }

  // SWAP types need analysis
  if (TYPE_MAPPING.swapTypes.some(t => t.toUpperCase() === type)) {
    if (tokenMint && amount !== undefined) {
      return classifySwapTransaction(
        tokenMint,
        amount,
        additionalContext?.fromTokenBalance,
        additionalContext?.toTokenBalance
      );
    }
    return 'UNKNOWN';
  }

  // Transfer types - usually buys (receiving tokens)
  if (TYPE_MAPPING.transferTypes.some(t => t.toUpperCase() === type)) {
    return 'BUY';
  }

  return 'UNKNOWN';
}

/**
 * Check if transaction type is a buy action
 */
export function isBuyTransaction(transactionType: string): boolean {
  return mapTransactionType(transactionType) === 'BUY';
}

/**
 * Check if transaction type is a sell action
 */
export function isSellTransaction(transactionType: string): boolean {
  return mapTransactionType(transactionType) === 'SELL';
}

/**
 * Normalize transaction type for display
 */
export function normalizeTransactionType(transactionType: string): TransactionAction {
  return mapTransactionType(transactionType);
}

/**
 * Get all valid BUY transaction types
 */
export function getAllBuyTypes(): string[] {
  return [...TYPE_MAPPING.buyTypes, ...TYPE_MAPPING.transferTypes];
}

/**
 * Get all valid SELL transaction types
 */
export function getAllSellTypes(): string[] {
  return TYPE_MAPPING.sellTypes;
}

/**
 * Get all transaction types that need analysis (SWAP)
 */
export function getSwapTypes(): string[] {
  return TYPE_MAPPING.swapTypes;
}

/**
 * Enhanced classification with context from transaction data
 */
export function classifyTransactionWithContext(transaction: {
  transaction_type: string;
  token_mint: string;
  amount: string | number;
  from_address: string;
  to_address?: string;
  token_balance_change?: number;
  [key: string]: any;
}): TransactionAction {
  const amount = typeof transaction.amount === 'string'
    ? parseFloat(transaction.amount)
    : transaction.amount;

  const action = mapTransactionType(
    transaction.transaction_type,
    transaction.token_mint,
    amount,
    {
      fromTokenBalance: transaction.token_balance_change,
      toTokenBalance: transaction.token_balance_change
    }
  );

  return action;
}

/**
 * Batch classify transactions
 */
export function classifyTransactions(transactions: any[]): Map<string, TransactionAction> {
  const results = new Map<string, TransactionAction>();

  for (const tx of transactions) {
    const key = `${tx.transaction_signature || tx.id}`;
    const action = classifyTransactionWithContext(tx);
    results.set(key, action);
  }

  return results;
}
