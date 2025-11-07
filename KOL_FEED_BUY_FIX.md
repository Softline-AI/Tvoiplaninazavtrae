# KOL Feed - BUY Transactions Fix

## Problem

Покупки (BUY transactions) не отображались в KOL Feed, потому что:

1. **TRANSFER транзакции классифицировались неправильно** - все TRANSFER с SOL тратой помечались как SELL
2. **Отсутствовала политика UPDATE** - невозможно было переклассифицировать существующие транзакции
3. **Edge Function не учитывала SOL amount для TRANSFER** - использовалась только простая логика направления токенов

## Solution

### 1. Улучшена Edge Function (helius-webhook)

**Файл:** `supabase/functions/helius-webhook/index.ts`

#### Обновлена логика для TRANSFER транзакций:

```typescript
// Handle TRANSFER - similar logic to SWAP
if (type === "TRANSFER" && data.tokenTransfers && data.tokenTransfers.length > 0) {
  // PRIORITY 1: Check if SOL was involved in native transfers
  if (data.nativeTransfers && data.nativeTransfers.length > 0) {
    for (const nativeTransfer of data.nativeTransfers) {
      // Wallet sends SOL = BUY (paying for tokens)
      if (nativeTransfer.fromUserAccount === walletAddress) {
        return "BUY";
      }
      // Wallet receives SOL = SELL (selling tokens for SOL)
      if (nativeTransfer.toUserAccount === walletAddress) {
        return "SELL";
      }
    }
  }

  // PRIORITY 2: Check token transfer direction
  const transfer = data.tokenTransfers.find(
    (t) => t.fromUserAccount === walletAddress
  );

  return transfer ? "SELL" : "BUY";
}
```

**Ключевые улучшения:**
- Приоритет отдается native SOL transfers
- Wallet тратит SOL → BUY
- Wallet получает SOL → SELL
- Fallback на направление токенов

### 2. Добавлена RLS политика UPDATE

**Migration:** `add_update_policy_webhook_transactions.sql`

```sql
CREATE POLICY "Public update access to webhook transactions"
  ON webhook_transactions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

Это позволяет:
- Обновлять существующие транзакции
- Переклассифицировать старые данные
- Запускать скрипты reclassification

### 3. Переклассифицированы существующие транзакции

**SQL Updates:**

```sql
-- Reclassify: SOL spent + tokens received = BUY
UPDATE webhook_transactions
SET transaction_type = 'BUY'
WHERE sol_amount IS NOT NULL
  AND sol_amount::numeric < 0
  AND amount::numeric > 0
  AND transaction_type != 'BUY';

-- Reclassify: No SOL movement but tokens received = BUY
UPDATE webhook_transactions
SET transaction_type = 'BUY'
WHERE sol_amount IS NOT NULL
  AND sol_amount::numeric = 0
  AND amount::numeric > 0
  AND transaction_type != 'BUY';
```

**Результаты:**
- 7 транзакций переклассифицированы с SELL → BUY
- Теперь правильно отображаются покупки USD1, ETH, DOGE, SHADOWVP

### 4. Создан скрипт для рекласификации

**Файл:** `scripts/reclassify-transactions.js`

Автоматический скрипт для:
- Анализа существующих транзакций
- Определения правильной классификации
- Пакетного обновления в базе
- Статистики до/после

## Examples

### До исправления:
```
Transaction: TRANSFER
Token: ETH
Amount: 36389832 (received)
SOL Amount: -0.00203928 (spent)
Classification: SELL ❌ (неправильно!)
```

### После исправления:
```
Transaction: TRANSFER
Token: ETH
Amount: 36389832 (received)
SOL Amount: -0.00203928 (spent)
Classification: BUY ✓ (правильно!)
```

## Statistics

**До:**
- BUY: 0 транзакций
- SELL: 17 транзакций
- Проблема: Все покупки классифицированы как продажи

**После:**
- BUY: 7 транзакций ✓
- SELL: 10 транзакций ✓
- Результат: Правильная классификация

## Current Status

✅ **Edge Function обновлена** - TRANSFER транзакции теперь правильно классифицируются
✅ **RLS политики добавлены** - можно обновлять транзакции
✅ **Старые данные переклассифицированы** - 7 BUY транзакций восстановлены
✅ **KOL Feed отображает покупки** - фильтр "buy" теперь показывает транзакции
✅ **Скрипт для рекласификации** - можно повторить процесс при необходимости

## Next Steps

### Для новых транзакций:
1. Edge Function автоматически классифицирует правильно
2. Используется multi-priority логика (SOL transfers → token direction)
3. Детальное логирование для отладки

### Для проверки:
```sql
-- Check BUY transactions
SELECT
  transaction_signature,
  transaction_type,
  token_symbol,
  amount::numeric,
  sol_amount::numeric,
  block_time
FROM webhook_transactions
WHERE transaction_type = 'BUY'
  AND sol_amount IS NOT NULL
ORDER BY block_time DESC;
```

### Для повторной рекласификации:
```bash
node scripts/reclassify-transactions.js
```

## Technical Details

### Classification Logic Priority:

**For TRANSFER transactions:**
1. Check native SOL transfers (highest priority)
   - Wallet sends SOL → BUY
   - Wallet receives SOL → SELL
2. Check token transfer direction (fallback)
   - Wallet receives tokens → BUY
   - Wallet sends tokens → SELL

**For SWAP transactions:**
1. Check SOL in tokenTransfers
2. Check non-SOL token direction
3. Check native transfers
4. Check account balance changes

### Database Changes:

**New columns** (already existed):
- `sol_amount` - Net SOL movement
- `native_balance_change` - SOL balance change

**New RLS policies:**
- UPDATE policy for anon/authenticated users

## Monitoring

### Edge Function Logs:
```
[Type Detection] TRANSFER detected, analyzing...
[Type Detection] ✓ TRANSFER as BUY: Wallet spent 0.00203928 SOL
```

### Database Query:
```sql
SELECT
  transaction_type,
  COUNT(*) as count
FROM webhook_transactions
WHERE block_time >= NOW() - INTERVAL '24 hours'
GROUP BY transaction_type;
```

## Summary

Проблема с отсутствием покупок в KOL Feed полностью решена через:
1. Улучшенную логику классификации TRANSFER транзакций
2. Добавление RLS политики UPDATE
3. Переклассификацию существующих данных
4. Автоматизацию процесса через скрипт

Теперь KOL Feed корректно отображает как покупки (BUY), так и продажи (SELL)!
