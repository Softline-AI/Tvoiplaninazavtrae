# Transaction Classification Improvements

## Summary

Полностью переработана система классификации SWAP транзакций с многоуровневым анализом и детальным логированием для точного определения операций BUY/SELL на Solana blockchain.

## Что было сделано

### 1. Frontend - Transaction Type Mapper
**Файл:** `src/services/transactionTypeMapper.ts`

#### Улучшенная классификация SWAP транзакций
- **PRIMARY RULES**: Анализ SOL amount (высокая точность)
  - `solAmount < 0` + `amount > 0` = BUY (трейдер тратит SOL, получает токены)
  - `solAmount > 0` + `amount < 0` = SELL (трейдер отдает токены, получает SOL)

- **SECONDARY RULES**: Native balance change (средняя точность)
  - `nativeBalanceChange < 0` + `amount > 0` = BUY
  - `nativeBalanceChange > 0` + `amount < 0` = SELL

- **FALLBACK RULES**: Amount-based (базовая точность)
  - `amount > 0` = BUY (получение токенов)
  - `amount < 0` = SELL (отправка токенов)

#### Comprehensive Logging
Добавлено детальное логирование на каждом уровне:
```
[SWAP Classification] Token: 7GCihg..., Amount: 1000, SOL: -5.0
[SWAP Classification] ✓ BUY: Spending 5.0 SOL to get 1000 tokens
[Type Mapper] ✓ SWAP classified as: BUY
[Context Classifier] ✓ Final classification: BUY
```

#### Edge Cases Handling
- Обработка unusual patterns (оба положительные/отрицательные)
- Token-to-Token swaps
- Inconsistent data patterns

### 2. Backend - Edge Function
**Файл:** `supabase/functions/helius-webhook/index.ts`

#### Улучшенная функция determineTransactionType
Многоуровневый анализ с приоритетами:

**PRIORITY 1**: Analyze SOL transfers (наиболее надежный)
```typescript
if (solTransfer.fromUserAccount === walletAddress) return "BUY";
if (solTransfer.toUserAccount === walletAddress) return "SELL";
```

**PRIORITY 2**: Analyze non-SOL token transfers
```typescript
if (nonSolTransfer.toUserAccount === walletAddress) return "BUY";
if (nonSolTransfer.fromUserAccount === walletAddress) return "SELL";
```

**PRIORITY 3**: Check native balance changes
```typescript
if (transfer.fromUserAccount === walletAddress) return "BUY";
if (transfer.toUserAccount === walletAddress) return "SELL";
```

**PRIORITY 4**: Check account data for balance changes

#### Enhanced SOL Extraction
Улучшенное извлечение данных о SOL:
- Native transfers tracking
- Account balance change monitoring
- Lamports to SOL conversion (1 SOL = 1,000,000,000 lamports)

### 3. Database Schema
**Migration:** `supabase/migrations/add_sol_amount_to_transactions.sql`

Добавлены новые поля:
- `sol_amount` (numeric) - Net SOL движение
- `native_balance_change` (numeric) - Изменение баланса SOL

### 4. Documentation
**Файл:** `SWAP_CLASSIFICATION_GUIDE.md`

Полная документация включает:
- Детальное описание правил классификации
- Примеры транзакций с пояснениями
- Test cases для проверки
- Troubleshooting guide
- SQL queries для debugging

## Примеры работы

### Example 1: SOL → Token (BUY)
```typescript
Input: {
  transaction_type: "SWAP",
  amount: 1000,        // Получено 1000 токенов
  sol_amount: -5.0     // Потрачено 5 SOL
}
Output: BUY ✓
Confidence: HIGH
```

### Example 2: Token → SOL (SELL)
```typescript
Input: {
  transaction_type: "SWAP",
  amount: -1000,       // Отдано 1000 токенов
  sol_amount: 5.0      // Получено 5 SOL
}
Output: SELL ✓
Confidence: HIGH
```

### Example 3: Fallback (No SOL data)
```typescript
Input: {
  transaction_type: "SWAP",
  amount: 1000,        // Получено 1000 токенов
  sol_amount: null     // Нет данных о SOL
}
Output: BUY ✓
Confidence: LOW (fallback to amount-based)
```

## Benefits

1. **Высокая точность**: Multi-layered approach с fallbacks
2. **Детальная валидация**: Проверка inconsistencies и edge cases
3. **Comprehensive logging**: Легкий debugging с детальными логами
4. **Лучший P&L**: Точное отслеживание позиций → правильный расчет прибыли
5. **Historical compatibility**: Работает с новыми и старыми данными
6. **Edge case handling**: Обработка необычных транзакций

## Технические детали

### Validation Chain
```
1. Check transaction_type (required)
2. Check token_mint (required)
3. Parse amount (number, validated)
4. Parse sol_amount (number, optional)
5. Extract native_balance_change (optional)
6. Apply PRIMARY rules (SOL-based)
7. Apply SECONDARY rules (balance-based)
8. Apply FALLBACK rules (amount-based)
9. Return classification + log result
```

### Confidence Levels
- **HIGH**: SOL amount + token amount match expected pattern
- **MEDIUM**: Native balance change + token amount match
- **LOW**: Only token amount available (fallback)

## Testing

### Verification Commands

**1. Check recent SWAP transactions:**
```sql
SELECT
  transaction_signature,
  transaction_type,
  amount::numeric,
  sol_amount::numeric,
  token_symbol,
  block_time
FROM webhook_transactions
WHERE transaction_type = 'SWAP'
ORDER BY block_time DESC
LIMIT 20;
```

**2. Check classification distribution:**
```sql
SELECT
  transaction_type,
  CASE
    WHEN sol_amount::numeric < 0 AND amount::numeric > 0 THEN 'BUY'
    WHEN sol_amount::numeric > 0 AND amount::numeric < 0 THEN 'SELL'
    ELSE 'OTHER'
  END as classification,
  COUNT(*) as count
FROM webhook_transactions
WHERE transaction_type = 'SWAP'
GROUP BY transaction_type, classification;
```

**3. View Edge Function logs:**
```
Supabase Dashboard > Edge Functions > helius-webhook > Logs
Look for: [Type Detection] messages
```

## Next Steps

1. Monitor Edge Function logs для проверки классификации
2. Собрать статистику по accuracy classification
3. Рассмотреть добавление confidence scores в ответ
4. Возможно добавить ML модель для сложных случаев

## Notes

- Все изменения полностью обратно совместимы
- Старые транзакции (без sol_amount) используют fallback logic
- Новые транзакции получают полную multi-layered classification
- Система автоматически адаптируется к доступным данным
