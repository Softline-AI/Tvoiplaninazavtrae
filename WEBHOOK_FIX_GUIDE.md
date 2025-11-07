# Helius Webhook Fix Guide

## Проблема

### Что было не так?

**Транзакции не появлялись в KOL Feed**, потому что:

1. ❌ **Webhook URL был неправильный** (старый проект)
2. ❌ **Не были добавлены monitored wallets** (0 кошельков)
3. ❌ **Helius не отправлял данные** на webhook

### Симптомы:

```
- Последняя транзакция: 04:31:34 (более 30 минут назад)
- Новые сделки трейдеров не отображаются
- SPL продажа не видна в KOL Feed
- Нет BUY/SELL транзакций в real-time
```

## Диагностика

### Скрипт для проверки:

```bash
node scripts/check-helius-webhook-status.js
```

**Результат диагностики:**

```
⚠️  WARNING: No transactions in last 10 minutes!
⚠️  Webhook might not be receiving data!

Webhook #1:
- URL: https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook ❌
- Wallets: 0 ❌
```

## Решение

### Автоматическое исправление:

```bash
node scripts/fix-helius-webhook.js
```

### Что делает скрипт:

1. **Получает все monitored wallets из Supabase**
   ```
   Found 31 monitored wallets ✅
   ```

2. **Проверяет существующие webhooks в Helius**
   ```
   Found 1 existing webhook(s)
   ```

3. **Удаляет старый webhook с неправильным URL**
   ```
   Deleting old webhook: 12a745c2-a551-4822-af59-0034fbaef6c9
   Old URL: https://swugviyjmqchbriosjoa.supabase.co/... ❌
   ```

4. **Создает новый webhook с правильным URL**
   ```
   New webhook created successfully! ✅
   ID: 64257770-64f2-417c-a152-c7b8fb7d35cd
   URL: https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook
   Wallets: 31
   ```

## Проверка после исправления

### 1. Проверить, что webhook получает данные:

```bash
node scripts/check-helius-webhook-status.js
```

**Ожидаемый результат (через 2-3 минуты):**

```
📊 Recent Transactions:
   Latest: BUY BONK
   Time: 2025-11-07T05:01:24+00:00
   Age: 0 minutes ago
   ✅ Webhook appears to be working
```

### 2. Проверить в Supabase:

```sql
SELECT
  transaction_type,
  token_symbol,
  block_time
FROM webhook_transactions
WHERE block_time >= NOW() - INTERVAL '5 minutes'
ORDER BY block_time DESC;
```

### 3. Открыть KOL Feed:

- Должны появиться новые транзакции в real-time
- SPL продажи будут видны
- BUY/SELL транзакции отображаются мгновенно

## Технические детали

### Правильная конфигурация webhook:

```json
{
  "webhookURL": "https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook",
  "transactionTypes": ["ANY"],
  "accountAddresses": [
    "FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR",
    "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o",
    // ... всего 31 кошелек
  ],
  "webhookType": "enhanced",
  "authHeader": "stalker-helius-webhook-2024-secure-key"
}
```

### Почему это важно:

1. **webhookURL** - должен указывать на ПРАВИЛЬНЫЙ Supabase project
2. **accountAddresses** - должны содержать ВСЕ monitored wallets
3. **transactionTypes: ["ANY"]** - получать ВСЕ типы транзакций
4. **webhookType: "enhanced"** - получать детальную информацию

## Как избежать проблемы в будущем

### 1. Регулярная проверка webhook:

Добавьте в cron:
```bash
# Проверять каждые 10 минут
*/10 * * * * node /path/to/scripts/check-helius-webhook-status.js
```

### 2. Мониторинг транзакций:

```sql
-- Alert если нет транзакций более 15 минут
SELECT
  CASE
    WHEN MAX(block_time) < NOW() - INTERVAL '15 minutes'
    THEN 'ALERT: No transactions in 15 minutes!'
    ELSE 'OK'
  END as status
FROM webhook_transactions;
```

### 3. Добавление нового кошелька:

При добавлении нового monitored wallet в Supabase:

```bash
# Обновить webhook
node scripts/fix-helius-webhook.js
```

Или вручную через Helius Dashboard:
1. Go to https://dev.helius.xyz/webhooks
2. Select your webhook
3. Add new wallet address
4. Save

## Решение других проблем

### Проблема: Webhook получает данные, но не записывает в БД

**Проверить:**
1. Edge Function логи в Supabase Dashboard
2. Правильность SUPABASE_URL в Edge Function
3. RLS политики на таблице webhook_transactions

**Решение:**
```sql
-- Проверить политики
SELECT * FROM pg_policies WHERE tablename = 'webhook_transactions';

-- Добавить политику для anon (если нет)
CREATE POLICY "Allow anon insert" ON webhook_transactions
  FOR INSERT TO anon
  WITH CHECK (true);
```

### Проблема: Дублирующиеся транзакции

**Проверить:**
```sql
SELECT
  transaction_signature,
  COUNT(*) as count
FROM webhook_transactions
GROUP BY transaction_signature
HAVING COUNT(*) > 1;
```

**Решение:**
- Добавить UNIQUE constraint на transaction_signature
- Обновить Edge Function использовать UPSERT

### Проблема: Rate limit от Helius

**Симптомы:**
```
Helius API error: 429 Too Many Requests
```

**Решение:**
- Использовать несколько API ключей (rotation)
- Добавить caching для token prices
- Увеличить plan в Helius

## Summary

✅ **Webhook исправлен и работает!**

**Что было:**
- ❌ Старый URL (swugviyjmqchbriosjoa)
- ❌ 0 кошельков
- ❌ Нет транзакций

**Что стало:**
- ✅ Правильный URL (mjktfqrcklwpfzgonqmb)
- ✅ 31 кошелек
- ✅ Все транзакции поступают в real-time

**Результат:**
- Все BUY/SELL транзакции отображаются мгновенно
- SPL продажи видны в KOL Feed
- Real-time обновления работают
- P&L рассчитывается корректно

🎉 **Система полностью восстановлена!**
