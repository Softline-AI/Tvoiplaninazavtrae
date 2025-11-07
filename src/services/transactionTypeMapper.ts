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
 *
 * Logic:
 * - SWAP SOL -> Token = BUY (trader gives SOL, receives token)
 * - SWAP Token -> SOL = SELL (trader gives token, receives SOL)
 *
 * @param tokenMint - The token being tracked
 * @param amount - Token amount (positive = receiving, negative = sending)
 * @param solAmount - SOL amount involved (positive = receiving SOL, negative = spending SOL)
 * @param nativeBalanceChange - Native SOL balance change
 */
export function classifySwapTransaction(
  tokenMint: string,
  amount: number,
  solAmount?: number,
  nativeBalanceChange?: number
): TransactionAction {
  // If we have SOL amount information
  if (solAmount !== undefined && solAmount !== 0) {
    // Spending SOL (negative) to get tokens = BUY
    if (solAmount < 0 && amount > 0) {
      return 'BUY';
    }
    // Receiving SOL (positive) by giving tokens = SELL
    if (solAmount > 0 && amount < 0) {
      return 'SELL';
    }
  }

  // If we have native balance change information
  if (nativeBalanceChange !== undefined && nativeBalanceChange !== 0) {
    // SOL decreased (spent) and tokens increased = BUY
    if (nativeBalanceChange < 0 && amount > 0) {
      return 'BUY';
    }
    // SOL increased (received) and tokens decreased = SELL
    if (nativeBalanceChange > 0 && amount < 0) {
      return 'SELL';
    }
  }

  // Fallback to simple amount-based logic
  // Positive amount = receiving tokens = BUY
  if (amount > 0) {
    return 'BUY';
  }

  // Negative amount = sending tokens = SELL
  if (amount < 0) {
    return 'SELL';
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
        additionalContext?.solAmount,
        additionalContext?.nativeBalanceChange
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
  sol_amount?: string | number;
  native_balance_change?: number;
  [key: string]: any;
}): TransactionAction {
  const amount = typeof transaction.amount === 'string'
    ? parseFloat(transaction.amount)
    : transaction.amount;

  const solAmount = transaction.sol_amount
    ? (typeof transaction.sol_amount === 'string'
      ? parseFloat(transaction.sol_amount)
      : transaction.sol_amount)
    : undefined;

  const action = mapTransactionType(
    transaction.transaction_type,
    transaction.token_mint,
    amount,
    {
      solAmount: solAmount,
      nativeBalanceChange: transaction.native_balance_change
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
