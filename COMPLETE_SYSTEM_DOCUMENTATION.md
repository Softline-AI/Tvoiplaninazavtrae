# 🚀 ПОЛНАЯ ДОКУМЕНТАЦИЯ СИСТЕМЫ ТРАНЗАКЦИЙ

## 📋 ОГЛАВЛЕНИЕ
1. [Архитектура системы](#архитектура-системы)
2. [Поток данных](#поток-данных)
3. [Helius Webhook](#helius-webhook)
4. [Edge Function](#edge-function)
5. [Кэширование](#кэширование)
6. [База данных](#база-данных)
7. [Frontend](#frontend)
8. [Мониторинг кошельков](#мониторинг-кошельков)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

```
Solana Blockchain
        ↓
   Helius API (мониторит 31 кошелек)
        ↓
  Helius Webhook
        ↓
  Supabase Edge Function (helius-webhook)
        ↓
  Supabase Database (webhook_transactions)
        ↓
  Frontend (React + Realtime подписка)
```

---

## 🔄 ПОТОК ДАННЫХ

### 1. **Мониторинг транзакций**
- **Helius** отслеживает 31 кошелек в реальном времени
- Когда кошелек совершает транзакцию → Helius отправляет webhook

### 2. **Обработка webhook**
```typescript
// Helius отправляет POST запрос:
POST https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook

Headers:
  Content-Type: application/json
  X-Webhook-Secret: stalker-helius-webhook-2024-secure-key

Body: [
  {
    type: "SWAP",
    signature: "...",
    timestamp: 1699999999,
    accountData: [...],
    tokenTransfers: [...]
  }
]
```

### 3. **Edge Function обрабатывает**
```typescript
// Шаги обработки:
1. Извлекает from_address из транзакции
2. Проверяет что кошелек в monitored_wallets
3. Определяет тип транзакции (BUY/SELL)
4. Получает метаданные токена (symbol, price, marketCap)
5. Вычисляет P&L на основе истории
6. Сохраняет в webhook_transactions
```

### 4. **Frontend получает обновления**
```typescript
// Realtime подписка через Supabase:
supabase
  .channel('webhook_transactions_changes')
  .on('postgres_changes', { event: '*', table: 'webhook_transactions' },
    (payload) => {
      // Автоматически обновляет UI
    }
  )
```

---

## 🎯 HELIUS WEBHOOK

### Конфигурация:
```json
{
  "webhookID": "07898a59-1338-4399-aa84-8aa3326b8724",
  "webhookURL": "https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook",
  "webhookType": "enhanced",
  "accountAddresses": [31 кошелек],
  "transactionTypes": ["ANY"],
  "authHeader": "stalker-helius-webhook-2024-secure-key"
}
```

### Проверить статус:
```bash
node scripts/check-helius-webhook-status.js
```

### Синхронизировать кошельки:
```bash
node scripts/compare-webhook-wallets.js
```

### Dashboard:
https://dev.helius.xyz/webhooks

---

## ⚡ EDGE FUNCTION

### Расположение:
```
supabase/functions/helius-webhook/index.ts
```

### Основные функции:

#### 1. `extractPreliminaryData()`
Извлекает основной адрес кошелька из данных транзакции

#### 2. `determineTransactionType()`
```typescript
// Анализирует tokenBalanceChanges:
tokenAmountChange > 0 → "BUY"
tokenAmountChange < 0 → "SELL"
```

#### 3. `fetchTokenMetadata()`
```typescript
// Многоуровневое кэширование:
1. Проверяет Supabase cache (5 минут)
2. Проверяет Solana Token List
3. Запрашивает Birdeye API
4. Сохраняет в cache
```

#### 4. `calculateTokenPnl()`
```typescript
// Вычисляет P&L:
- Суммирует все покупки (BUY)
- Суммирует все продажи (SELL)
- Вычисляет remaining_tokens
- Вычисляет token_pnl и token_pnl_percentage
```

### Проверить логи:
```bash
# В Supabase Dashboard:
# https://supabase.com/dashboard/project/mjktfqrcklwpfzgonqmb/logs/edge-functions
```

---

## 💾 КЭШИРОВАНИЕ

### 1. **Token Metadata (Supabase)**
```sql
-- Таблица: token_metadata
-- Кэш: 5 минут
-- Хранит: symbol, name, price, market_cap, logo_url
```

### 2. **Solana Token List (Memory)**
```typescript
// Кэш: 1 час
// 10,000+ токенов
// Приоритет выше чем Birdeye
```

### 3. **Birdeye API Responses (Memory)**
```typescript
// Кэш: 5 минут
// 100 последних токенов
// Автоматический retry при 429
```

### 4. **Frontend Price Cache (Memory)**
```typescript
// Кэш: 30 секунд
// Уменьшает нагрузку на Birdeye
```

---

## 🗄️ БАЗА ДАННЫХ

### Основная таблица: `webhook_transactions`
```sql
CREATE TABLE webhook_transactions (
  id uuid PRIMARY KEY,
  transaction_signature text UNIQUE,
  block_time timestamptz,
  from_address text,          -- Кошелек который торгует
  to_address text,
  amount numeric,              -- Количество токенов
  token_mint text,             -- Адрес токена
  token_symbol text,           -- Символ токена
  token_name text,
  transaction_type text,       -- "BUY" или "SELL"
  fee numeric,
  sol_amount numeric,          -- Сумма в SOL
  native_balance_change numeric,

  -- P&L поля
  token_pnl numeric,           -- Прибыль/убыток в $
  token_pnl_percentage numeric, -- Прибыль/убыток в %
  current_token_price numeric,
  entry_price numeric,
  market_cap numeric,
  remaining_tokens numeric,    -- Сколько осталось
  all_tokens_sold boolean,     -- Все продано?

  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Индексы (17 штук):
```sql
-- Для быстрого поиска:
idx_webhook_transactions_from_address
idx_webhook_transactions_token_mint
idx_webhook_transactions_block_time (DESC)
idx_webhook_transactions_type_time
idx_webhook_transactions_kol_feed
idx_webhook_transactions_profitable (WHERE token_pnl > 0)
```

### RLS Политики:
```sql
-- Чтение: anon, authenticated
-- Запись: anon, authenticated, service_role
-- Обновление: anon, authenticated
```

### Таблица: `monitored_wallets`
```sql
CREATE TABLE monitored_wallets (
  id uuid PRIMARY KEY,
  wallet_address text UNIQUE,
  label text,
  twitter_handle text,
  created_at timestamptz DEFAULT now()
);
```

**Всего: 32 кошелька** (31 активный + 1 placeholder)

### Таблица: `token_metadata`
```sql
CREATE TABLE token_metadata (
  token_mint text PRIMARY KEY,
  token_symbol text,
  token_name text,
  logo_url text,
  decimals integer,
  description text,
  price numeric,           -- Кэш цены
  market_cap numeric,      -- Кэш market cap
  last_updated timestamptz
);
```

---

## 💻 FRONTEND

### Компоненты транзакций:

#### 1. **Transactions.tsx**
```typescript
// Основной компонент для просмотра транзакций
- Фильтры: ALL / BUY / SELL
- Временные диапазоны: 1h / 6h / 24h / 7d
- Realtime обновления
- Детальное логирование
```

#### 2. **KOLFeedLegacy.tsx**
```typescript
// KOL фид с транзакциями
- Показывает последние сделки KOL
- P&L метрики
- Фильтрация по прибыльности
```

#### 3. **MyStalks.tsx**
```typescript
// Агрегированные позиции
- Группировка по токенам
- Общий P&L
- Remaining tokens
```

### Realtime Subscription:
```typescript
const subscription = supabase
  .channel('webhook_transactions_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'webhook_transactions'
  }, (payload) => {
    console.log('🔴 Realtime update:', payload);
    // Перезагружает транзакции
  })
  .subscribe();
```

### API Services:

#### `birdeyeApi.ts`
```typescript
class BirdeyeService {
  // Кэширование 5 минут
  // Throttling 200ms между запросами
  // Retry logic при 429
  // Exponential backoff

  getTokenPrice(address)
  getTokenOverview(address)
  getMultipleTokenPrices(addresses[])
  getTrendingTokens()
}
```

#### `tokenMetadataService.ts`
```typescript
// Многоуровневое получение метаданных:
1. Supabase cache (24 часа)
2. Solana Token List (1 час)
3. Birdeye API (с кэшированием)
4. Сохранение в Supabase
```

#### `heliusTransactions.ts`
```typescript
// Загрузка исторических транзакций
// Используется для первоначальной загрузки
```

---

## 👥 МОНИТОРИНГ КОШЕЛЬКОВ

### Текущие кошельки (31):

#### KOL с Twitter:
1. **0xBiZzy** - FL4j8EEMAPUjrvASnqX7VdpWZJji1LFsAxwojhpueUYt
2. **beaverd** - GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN
3. **casino616** - 8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR
4. **Cented7** - CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o
5. **cupseyy** - 2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f
6. **KayTheDoc** - DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt
7. **Loopierr** - 9yYya3F5EJoLnBNKW6z4bZvyQytMXzDcpU5D6yYr4jqL
8. **old** - CA4keXLtGJWBcsWivjtMFBghQ8pFsGRWFxLrRCtirzu5
9. **publixplays** - 86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD
10. **Saint_pablo123** - 3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei
11. **SolanaPrincess** - HvDf4Cxd2evdYueLhK5LoaiEvDXFXgb1uRrkoYPdvHfH
12. **Waiter1x** - 4cXnf2z85UiZ5cyKsPMEULq1yufAtpkatmX4j4DBZqj2

#### Без лейбла (19 кошельков):
- GJA1HEbx..., 8MaVa9kd..., JDd3hy3g..., и т.д.

### Добавить новый кошелек:
```sql
INSERT INTO monitored_wallets (wallet_address, label, twitter_handle)
VALUES (
  'НОВЫЙ_АДРЕС_КОШЕЛЬКА',
  'Имя KOL',
  'https://x.com/username'
);
```

Затем синхронизировать:
```bash
node scripts/compare-webhook-wallets.js
```

---

## 🔧 TROUBLESHOOTING

### Проблема: Транзакции не приходят

#### Шаг 1: Проверить Helius webhook
```bash
node scripts/check-helius-webhook-status.js
```

Должно быть:
- ✅ URL: `https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook`
- ✅ Wallets: 31
- ✅ Transaction Types: ANY

#### Шаг 2: Проверить Edge Function
```bash
# Supabase Dashboard → Edge Functions → helius-webhook
# Статус должен быть: ACTIVE
```

#### Шаг 3: Синхронизировать кошельки
```bash
node scripts/compare-webhook-wallets.js
```

#### Шаг 4: Проверить логи
```bash
# Supabase Dashboard → Logs → Edge Functions
# Искать ошибки в последних логах
```

#### Шаг 5: Проверить последние транзакции
```sql
SELECT
  block_time,
  from_address,
  transaction_type,
  token_symbol,
  token_pnl
FROM webhook_transactions
ORDER BY block_time DESC
LIMIT 10;
```

---

### Проблема: Ошибки 429 (Birdeye)

**Решение:**
- Увеличен cache с 30 сек до 5 минут ✅
- Добавлен throttling 200ms ✅
- Retry logic с exponential backoff ✅
- Максимум 3 попытки ✅

**Проверить:**
```typescript
// В консоли должно быть:
[Birdeye] 📦 Using cached price for 8BseXT9E
```

---

### Проблема: Ошибки 401 (Supabase)

**Решено:** Добавлены RLS политики ✅

**Проверить:**
```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'token_metadata';

-- Должно быть:
-- INSERT: anon, authenticated
-- UPDATE: anon, authenticated
-- SELECT: anon
```

---

### Проблема: Realtime не работает

**Проверить подписку:**
```typescript
// В консоли должно быть:
✅ Realtime subscription active
🔴 Realtime update: { eventType: 'INSERT', new: {...} }
```

**Если нет:**
```sql
-- Проверить что realtime включен:
SELECT schemaname, tablename, relreplident
FROM pg_publication_tables
WHERE tablename = 'webhook_transactions';
-- relreplident должен быть 'd'
```

---

## 📊 МОНИТОРИНГ И МЕТРИКИ

### Проверить общую статистику:
```sql
SELECT
  COUNT(*) as total_transactions,
  COUNT(CASE WHEN transaction_type = 'BUY' THEN 1 END) as buys,
  COUNT(CASE WHEN transaction_type = 'SELL' THEN 1 END) as sells,
  COUNT(DISTINCT from_address) as unique_wallets,
  COUNT(DISTINCT token_mint) as unique_tokens,
  MAX(block_time) as latest_transaction
FROM webhook_transactions;
```

### Топ прибыльных сделок:
```sql
SELECT
  from_address,
  token_symbol,
  transaction_type,
  token_pnl,
  token_pnl_percentage,
  block_time
FROM webhook_transactions
WHERE token_pnl > 0
ORDER BY token_pnl DESC
LIMIT 20;
```

### Активность по времени:
```sql
SELECT
  DATE_TRUNC('hour', block_time) as hour,
  COUNT(*) as transactions,
  COUNT(CASE WHEN transaction_type = 'BUY' THEN 1 END) as buys,
  COUNT(CASE WHEN transaction_type = 'SELL' THEN 1 END) as sells
FROM webhook_transactions
WHERE block_time > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## 🚀 PRODUCTION CHECKLIST

### Перед деплоем:

- [ ] Все 31 кошелек в Helius webhook
- [ ] Edge function деплоена и активна
- [ ] RLS политики настроены
- [ ] Realtime включен
- [ ] Индексы созданы (17 штук)
- [ ] Кэширование настроено
- [ ] Error handling добавлен
- [ ] Логирование включено

### После деплоя:

- [ ] Проверить webhook статус
- [ ] Дождаться первой транзакции
- [ ] Проверить логи edge function
- [ ] Проверить realtime обновления на фронтенде
- [ ] Мониторить ошибки 429/401

---

## 📞 ПОЛЕЗНЫЕ ССЫЛКИ

- **Helius Dashboard:** https://dev.helius.xyz/webhooks
- **Supabase Dashboard:** https://supabase.com/dashboard/project/mjktfqrcklwpfzgonqmb
- **Birdeye API Docs:** https://docs.birdeye.so
- **Solana Token List:** https://github.com/solana-labs/token-list

---

## 🎯 ТЕКУЩИЙ СТАТУС

### ✅ Что работает:
- Helius webhook настроен
- 31 кошелек мониторится
- Edge function деплоена
- База данных настроена
- Кэширование оптимизировано
- Error handling улучшен
- Realtime подписка активна

### ⏳ Ожидаем:
- **Новые транзакции от мониторимых кошельков**
- Как только кто-то из 31 кошелька совершит сделку → появится в базе

### 📈 Следующие шаги:
1. Мониторить логи edge function
2. Проверять новые транзакции каждые 10 минут
3. При появлении транзакций - проверить корректность P&L
4. Оптимизировать если нужно

---

**Последнее обновление:** 2025-11-07
**Статус:** ✅ Готово к продакшену
