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
 * Detailed Logic:
 *
 * PRIMARY RULES (highest confidence):
 * 1. SWAP SOL -> Token = BUY
 *    - Trader spends SOL (solAmount < 0)
 *    - Trader receives token (amount > 0)
 *    - Example: -5 SOL, +1000 POPCAT = BUY POPCAT
 *
 * 2. SWAP Token -> SOL = SELL
 *    - Trader sends token (amount < 0)
 *    - Trader receives SOL (solAmount > 0)
 *    - Example: -1000 POPCAT, +5 SOL = SELL POPCAT
 *
 * SECONDARY RULES (with validation):
 * 3. Token-to-Token SWAP
 *    - If amount > 0: Receiving token = BUY
 *    - If amount < 0: Sending token = SELL
 *
 * FALLBACK RULES (basic logic):
 * 4. Amount-based classification
 *    - Positive amount = BUY (receiving tokens)
 *    - Negative amount = SELL (sending tokens)
 *
 * @param tokenMint - The token being tracked
 * @param amount - Token amount (positive = receiving, negative = sending)
 * @param solAmount - SOL amount involved (positive = receiving SOL, negative = spending SOL)
 * @param nativeBalanceChange - Native SOL balance change
 * @returns TransactionAction - BUY, SELL, or UNKNOWN
 */
export function classifySwapTransaction(
  tokenMint: string,
  amount: number,
  solAmount?: number,
  nativeBalanceChange?: number
): TransactionAction {
  console.log(`[SWAP Classification] Token: ${tokenMint}, Amount: ${amount}, SOL: ${solAmount}, Balance Change: ${nativeBalanceChange}`);

  // PRIMARY RULE 1: SOL amount is the most reliable indicator
  if (solAmount !== undefined && solAmount !== 0) {

    // Case 1: Spending SOL (negative) to get tokens (positive) = BUY
    if (solAmount < 0 && amount > 0) {
      console.log(`[SWAP Classification] ✓ BUY: Spending ${Math.abs(solAmount)} SOL to get ${amount} tokens`);
      return 'BUY';
    }

    // Case 2: Receiving SOL (positive) by giving tokens (negative) = SELL
    if (solAmount > 0 && amount < 0) {
      console.log(`[SWAP Classification] ✓ SELL: Sending ${Math.abs(amount)} tokens to get ${solAmount} SOL`);
      return 'SELL';
    }

    // Case 3: Both positive or both negative - unusual but handle it
    if (solAmount > 0 && amount > 0) {
      // Receiving both SOL and tokens - likely receiving tokens (BUY)
      console.log(`[SWAP Classification] ⚠ Unusual: Receiving both SOL and tokens, classifying as BUY`);
      return 'BUY';
    }

    if (solAmount < 0 && amount < 0) {
      // Sending both SOL and tokens - likely selling tokens (SELL)
      console.log(`[SWAP Classification] ⚠ Unusual: Sending both SOL and tokens, classifying as SELL`);
      return 'SELL';
    }
  }

  // SECONDARY RULE: Use native balance change as backup
  if (nativeBalanceChange !== undefined && nativeBalanceChange !== 0) {

    // Case 4: SOL balance decreased (spent) and tokens increased = BUY
    if (nativeBalanceChange < 0 && amount > 0) {
      console.log(`[SWAP Classification] ✓ BUY: SOL balance decreased by ${Math.abs(nativeBalanceChange)}, tokens increased by ${amount}`);
      return 'BUY';
    }

    // Case 5: SOL balance increased (received) and tokens decreased = SELL
    if (nativeBalanceChange > 0 && amount < 0) {
      console.log(`[SWAP Classification] ✓ SELL: SOL balance increased by ${nativeBalanceChange}, tokens decreased by ${Math.abs(amount)}`);
      return 'SELL';
    }

    // Case 6: Validate consistency
    if (nativeBalanceChange < 0 && amount < 0) {
      console.log(`[SWAP Classification] ⚠ Inconsistent: Both decreased, classifying as SELL`);
      return 'SELL';
    }

    if (nativeBalanceChange > 0 && amount > 0) {
      console.log(`[SWAP Classification] ⚠ Inconsistent: Both increased, classifying as BUY`);
      return 'BUY';
    }
  }

  // FALLBACK RULE: Simple amount-based logic
  // Positive amount = receiving tokens = BUY
  if (amount > 0) {
    console.log(`[SWAP Classification] ℹ Fallback BUY: Positive token amount (${amount})`);
    return 'BUY';
  }

  // Negative amount = sending tokens = SELL
  if (amount < 0) {
    console.log(`[SWAP Classification] ℹ Fallback SELL: Negative token amount (${amount})`);
    return 'SELL';
  }

  // Unable to classify
  console.warn(`[SWAP Classification] ✗ UNKNOWN: Cannot classify transaction`);
  return 'UNKNOWN';
}

/**
 * Map transaction type to BUY/SELL action with comprehensive validation
 *
 * Process:
 * 1. Check for explicit BUY/SELL type labels
 * 2. Analyze SWAP transactions using SOL amount
 * 3. Handle TRANSFER operations
 * 4. Apply fallback logic
 *
 * @param transactionType - Type label from blockchain
 * @param tokenMint - Token mint address
 * @param amount - Token amount
 * @param additionalContext - SOL amount, balance changes, etc.
 * @returns TransactionAction
 */
export function mapTransactionType(
  transactionType: string,
  tokenMint?: string,
  amount?: number,
  additionalContext?: any
): TransactionAction {
  const type = transactionType?.toUpperCase() || 'UNKNOWN';

  console.log(`[Type Mapper] Input: ${type}, Token: ${tokenMint?.substring(0, 8)}..., Amount: ${amount}`);

  // Validation: Check for required data
  if (!transactionType) {
    console.warn(`[Type Mapper] ✗ Missing transaction type`);
    return 'UNKNOWN';
  }

  // RULE 1: Direct BUY types (explicitly labeled as BUY)
  if (TYPE_MAPPING.buyTypes.some(t => t.toUpperCase() === type)) {
    console.log(`[Type Mapper] ✓ Direct BUY type detected`);
    return 'BUY';
  }

  // RULE 2: Direct SELL types (explicitly labeled as SELL)
  if (TYPE_MAPPING.sellTypes.some(t => t.toUpperCase() === type)) {
    console.log(`[Type Mapper] ✓ Direct SELL type detected`);
    return 'SELL';
  }

  // RULE 3: SWAP types need detailed analysis
  if (TYPE_MAPPING.swapTypes.some(t => t.toUpperCase() === type)) {
    console.log(`[Type Mapper] SWAP detected, analyzing...`);

    // Validate required data for SWAP analysis
    if (!tokenMint) {
      console.warn(`[Type Mapper] ✗ SWAP missing tokenMint`);
      return 'UNKNOWN';
    }

    if (amount === undefined || amount === null) {
      console.warn(`[Type Mapper] ✗ SWAP missing amount`);
      return 'UNKNOWN';
    }

    // Perform detailed SWAP classification
    const result = classifySwapTransaction(
      tokenMint,
      amount,
      additionalContext?.solAmount,
      additionalContext?.nativeBalanceChange
    );

    console.log(`[Type Mapper] ✓ SWAP classified as: ${result}`);
    return result;
  }

  // RULE 4: Transfer types
  // TRANSFER can be BUY or SELL depending on direction
  if (TYPE_MAPPING.transferTypes.some(t => t.toUpperCase() === type)) {
    console.log(`[Type Mapper] TRANSFER detected`);

    // If we have amount information, use it
    if (amount !== undefined && amount !== null) {
      if (amount > 0) {
        console.log(`[Type Mapper] ✓ TRANSFER classified as BUY (receiving ${amount})`);
        return 'BUY';
      } else if (amount < 0) {
        console.log(`[Type Mapper] ✓ TRANSFER classified as SELL (sending ${Math.abs(amount)})`);
        return 'SELL';
      }
    }

    // Default: TRANSFER is usually receiving tokens
    console.log(`[Type Mapper] ℹ TRANSFER defaulting to BUY`);
    return 'BUY';
  }

  // RULE 5: Unknown type - try to infer from context
  console.warn(`[Type Mapper] ⚠ Unknown type: ${type}, attempting inference...`);

  if (amount !== undefined && amount !== null) {
    if (amount > 0) {
      console.log(`[Type Mapper] ℹ Inferred BUY from positive amount`);
      return 'BUY';
    } else if (amount < 0) {
      console.log(`[Type Mapper] ℹ Inferred SELL from negative amount`);
      return 'SELL';
    }
  }

  console.warn(`[Type Mapper] ✗ Unable to classify transaction`);
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
 *
 * This function processes complete transaction data and determines
 * whether it represents a BUY or SELL action.
 *
 * Validation steps:
 * 1. Parse and validate all numeric fields
 * 2. Extract SOL amount information
 * 3. Pass complete context to mapper
 * 4. Return classification with confidence
 *
 * @param transaction - Complete transaction object from database
 * @returns TransactionAction - BUY, SELL, or UNKNOWN
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
  console.log(`[Context Classifier] Processing transaction from ${transaction.from_address?.substring(0, 8)}...`);

  // Validate required fields
  if (!transaction.transaction_type) {
    console.error(`[Context Classifier] ✗ Missing transaction_type`);
    return 'UNKNOWN';
  }

  if (!transaction.token_mint) {
    console.error(`[Context Classifier] ✗ Missing token_mint`);
    return 'UNKNOWN';
  }

  // Parse token amount
  let amount: number;
  if (typeof transaction.amount === 'string') {
    amount = parseFloat(transaction.amount);
    if (isNaN(amount)) {
      console.error(`[Context Classifier] ✗ Invalid amount: ${transaction.amount}`);
      return 'UNKNOWN';
    }
  } else {
    amount = transaction.amount;
  }

  // Parse SOL amount
  let solAmount: number | undefined;
  if (transaction.sol_amount !== undefined && transaction.sol_amount !== null) {
    if (typeof transaction.sol_amount === 'string') {
      solAmount = parseFloat(transaction.sol_amount);
      if (isNaN(solAmount)) {
        console.warn(`[Context Classifier] ⚠ Invalid sol_amount: ${transaction.sol_amount}, ignoring`);
        solAmount = undefined;
      }
    } else {
      solAmount = transaction.sol_amount;
    }
  }

  console.log(`[Context Classifier] Parsed: Amount=${amount}, SOL=${solAmount}, NativeChange=${transaction.native_balance_change}`);

  // Build context for classification
  const context = {
    solAmount: solAmount,
    nativeBalanceChange: transaction.native_balance_change,
    tokenBalanceChange: transaction.token_balance_change,
    fromAddress: transaction.from_address,
    toAddress: transaction.to_address
  };

  // Classify using the mapper
  const action = mapTransactionType(
    transaction.transaction_type,
    transaction.token_mint,
    amount,
    context
  );

  console.log(`[Context Classifier] ✓ Final classification: ${action}`);
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
