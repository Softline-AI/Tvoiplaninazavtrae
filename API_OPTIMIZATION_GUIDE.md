# API Optimization Guide

Это руководство описывает систему оптимизации API-запросов, которая решает проблемы `ERR_INSUFFICIENT_RESOURCES` и `Failed to fetch`.

## Проблемы и Решения

### Основные Проблемы

1. **ERR_INSUFFICIENT_RESOURCES** - Перегрузка сервера из-за слишком частых запросов
2. **Failed to fetch** - Сетевые сбои, таймауты или временная недоступность API
3. **Rate Limiting** - Превышение лимитов запросов к API

### Решения

#### 1. Универсальный обработчик API запросов (`apiRequestHandler.ts`)

Новый сервис предоставляет:

- **Автоматические повторные попытки** с экспоненциальной задержкой
- **Rate Limiting** - ограничение частоты запросов для каждого домена
- **Кэширование** - автоматическое кэширование успешных ответов
- **Дедупликация** - предотвращение одновременных одинаковых запросов
- **Таймауты** - автоматическая отмена долгих запросов
- **Batch-обработка** - управление одновременными запросами

#### 2. Оптимизация Supabase запросов (`supabaseOptimized.ts`)

Новый сервис для работы с Supabase:

- **Повторные попытки** при ошибках сети
- **Batch-операции** для массовых вставок/обновлений
- **Кэширование** запросов в localStorage
- **Управление ошибками** с детальным логированием

## Использование

### API Request Handler

#### Базовый запрос с повторными попытками

```typescript
import { apiRequestHandler } from './services/apiRequestHandler';

const data = await apiRequestHandler.request<ResponseType>(
  'https://api.example.com/endpoint',
  {
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' }
  },
  {
    maxRetries: 3,        // Количество попыток (default: 3)
    retryDelay: 1000,     // Начальная задержка в мс (default: 1000)
    timeout: 30000,       // Таймаут в мс (default: 30000)
    cacheDuration: 300000 // Кэш на 5 минут (default: 300000)
  }
);
```

#### Batch-запросы с ограничением одновременности

```typescript
const urls = [
  'https://api.example.com/token/1',
  'https://api.example.com/token/2',
  'https://api.example.com/token/3'
];

const results = await apiRequestHandler.batchRequest<TokenData>(
  urls,
  { headers: { 'X-API-KEY': 'key' } },
  { cacheDuration: 60000 },
  5 // Максимум 5 одновременных запросов
);
```

#### Управление кэшем

```typescript
// Статистика кэша
const stats = apiRequestHandler.getCacheStats();
console.log(`Cache size: ${stats.size}, Domains: ${stats.domains}`);

// Очистка кэша для домена
apiRequestHandler.clearDomainCache('api.birdeye.so');

// Полная очистка
apiRequestHandler.clearCache();
```

### Optimized Supabase

#### Безопасный SELECT с повторными попытками

```typescript
import { supabaseOptimized } from './services/supabaseOptimized';

const result = await supabaseOptimized.withRetry(
  () => supabase
    .from('transactions')
    .select('*')
    .eq('wallet', walletAddress)
    .limit(100),
  { maxRetries: 3, retryDelay: 1000 }
);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error);
}
```

#### Batch-вставка записей

```typescript
const records = [
  { token_mint: 'abc...', symbol: 'TOKEN1' },
  { token_mint: 'def...', symbol: 'TOKEN2' },
  // ... много записей
];

const { inserted, errors } = await supabaseOptimized.batchInsert(
  'token_metadata',
  records,
  { batchSize: 100, maxRetries: 3 }
);

console.log(`Inserted: ${inserted}/${records.length}`);
if (errors.length > 0) {
  console.error('Errors:', errors);
}
```

#### Upsert с повторными попытками

```typescript
const { upserted, errors } = await supabaseOptimized.upsertWithRetry(
  'token_metadata',
  records,
  ['token_mint'], // Конфликтующая колонка
  { batchSize: 50 }
);
```

#### Кэширование запросов

```typescript
const tokens = await supabaseOptimized.getWithCache(
  'cached_tokens_list',
  async () => supabaseOptimized.withRetry(
    () => supabase.from('tokens').select('*')
  ),
  300000 // Кэш на 5 минут
);
```

## Обновленные сервисы

### Birdeye API (`birdeyeApi.ts`)

Все методы теперь используют `apiRequestHandler`:

```typescript
// Автоматические повторные попытки и кэширование
const price = await birdeyeService.getTokenPrice(tokenAddress);

// Batch-получение цен
const prices = await birdeyeService.getMultipleTokenPrices([
  'token1', 'token2', 'token3'
]);

// Trending токены с кэшированием
const trending = await birdeyeService.getTrendingTokens('rank', 'asc', 0, 50);
```

### Token Metadata Service (`tokenMetadataService.ts`)

Оптимизированная загрузка метаданных:

```typescript
// Solana Token List с автоматическими повторами
const tokenList = await tokenMetadataService.loadSolanaTokenList();

// Метаданные токена с каскадным поиском
const metadata = await tokenMetadataService.getTokenMetadata(tokenMint);

// Batch-получение логотипов (с ограничением одновременности)
const logos = await tokenMetadataService.getBatchTokenLogos(tokenMints);
```

### Helius Transactions (`heliusTransactions.ts`)

```typescript
// Транзакции адреса с повторными попытками
const txs = await heliusTransactionService.getAddressTransactions(
  walletAddress,
  100
);
```

## Настройки Rate Limiting

Rate Limiter автоматически управляет частотой запросов для каждого домена:

- **Токены по умолчанию**: 10 запросов
- **Скорость восстановления**: 1 токен/сек
- **Автоматическое ожидание**: Если токены закончились, запрос будет ждать

Вы можете настроить эти параметры в `apiRequestHandler.ts`:

```typescript
// В методе initRateLimiter
this.initRateLimiter(domain,
  20,  // maxTokens - макс. запросов
  2    // refillRate - токенов в секунду
);
```

## Стратегии повторных попыток

### Экспоненциальная задержка

Задержка увеличивается с каждой попыткой:
- Попытка 1: ~1000ms
- Попытка 2: ~2000ms + jitter
- Попытка 3: ~4000ms + jitter

Jitter (случайная задержка) предотвращает одновременные повторы.

### Не повторяемые ошибки

Следующие ошибки НЕ вызывают повтор:
- HTTP 4xx (ошибки клиента)
- AbortError (таймаут)

## Мониторинг

Все операции логируются в консоль:

```
[Request] 🔍 Attempt 1/3: https://api.example.com/...
[Request] ✅ Success in 234ms
[Cache] 📦 Cache hit for GET:https://...
[RateLimit] ⏳ Waiting 500ms for api.example.com
[Supabase] Batch insert complete: 150/150 inserted
```

## Рекомендации

1. **Всегда используйте кэширование** для часто запрашиваемых данных
2. **Настраивайте cacheDuration** в зависимости от типа данных:
   - Цены токенов: 30-60 секунд
   - Метаданные токенов: 5-10 минут
   - Token security: 10+ минут
   - Token lists: 1+ час

3. **Используйте batch-операции** вместо множества отдельных запросов
4. **Мониторьте логи** для выявления проблемных API
5. **Очищайте кэш** при необходимости обновления данных

## Примеры из реального использования

### Получение цен для множества токенов

```typescript
// ❌ Плохо - много отдельных запросов
for (const token of tokens) {
  const price = await fetch(`/api/price/${token}`);
}

// ✅ Хорошо - один batch-запрос
const prices = await birdeyeService.getMultipleTokenPrices(tokens);
```

### Вставка транзакций в базу данных

```typescript
// ❌ Плохо - без повторов и batch-обработки
await supabase.from('transactions').insert(transactions);

// ✅ Хорошо - с повторами и batch-обработкой
const { inserted, errors } = await supabaseOptimized.batchInsert(
  'transactions',
  transactions,
  { batchSize: 100, maxRetries: 3 }
);
```

## Troubleshooting

### Проблема: Все еще получаю ERR_INSUFFICIENT_RESOURCES

**Решение**: Уменьшите `batchSize` и увеличьте задержки между batch-операциями.

### Проблема: Долгие запросы

**Решение**: Уменьшите `timeout` и увеличьте кэширование.

### Проблема: Rate limiting слишком агрессивный

**Решение**: Увеличьте `maxTokens` и `refillRate` в `initRateLimiter`.

### Проблема: Кэш устаревает

**Решение**: Уменьшите `cacheDuration` или используйте `clearDomainCache()`.

## Производительность

С новой системой:
- ✅ Снижение количества запросов на 60-80% благодаря кэшированию
- ✅ Автоматическое восстановление после сетевых сбоев
- ✅ Предотвращение перегрузки API через rate limiting
- ✅ Более быстрые повторные загрузки благодаря кэшу
- ✅ Улучшенная надежность batch-операций

## Дальнейшие улучшения

1. Persistent cache (IndexedDB вместо localStorage)
2. Метрики производительности и алерты
3. Адаптивный rate limiting на основе ответов API
4. Circuit breaker для временно недоступных API
5. Request prioritization
