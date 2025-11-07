# P&L System Guide

## Что такое P&L?

**P&L (Profit and Loss)** — система расчета прибыли и убытков для каждой транзакции трейдера.

### Основная формула:

```
P&L = (Цена продажи - Цена покупки) × Количество
```

- **Положительный P&L** = Прибыль ✅
- **Отрицательный P&L** = Убыток ❌

## Как работает система P&L для SWAP транзакций?

### SWAP = Покупка + Продажа

SWAP транзакция на самом деле включает две операции:

1. **Продажа** одного токена (трейдер отдает токен)
2. **Покупка** другого токена (трейдер получает новый токен)

## Типы P&L

### 1. Unrealized P&L (Нереализованная прибыль/убыток)

**Когда:** Трейдер держит токены, но еще не продал

**Формула:**
```
Unrealized P&L = (Текущая цена - Средняя цена покупки) × Количество держимых токенов
```

**Пример:**
```
Трейдер купил:
- 1000 BONK @ $0.50 = $500 потрачено

Текущая цена: $0.60

Unrealized P&L = ($0.60 - $0.50) × 1000 = $100 прибыли (пока не продано)
```

### 2. Realized P&L (Реализованная прибыль/убыток)

**Когда:** Трейдер продал токены

**Формула:**
```
Realized P&L = (Цена продажи - Средняя цена покупки) × Количество проданных токенов
```

**Пример:**
```
Трейдер купил:
- 1000 BONK @ $0.50 = $500 потрачено

Трейдер продал:
- 1000 BONK @ $0.55 = $550 получено

Realized P&L = ($0.55 - $0.50) × 1000 = $50 прибыли ✅
```

## Система отслеживания позиций

### Как мы отслеживаем позиции каждого трейдера?

Для каждой пары **wallet + token** мы отслеживаем:

1. **Общее количество купленных токенов** (Total Bought)
2. **Общая сумма потраченная на покупки** (Total Spent)
3. **Общее количество проданных токенов** (Total Sold)
4. **Общая сумма полученная от продаж** (Total Received)

**Текущая позиция:**
```
Current Holding = Total Bought - Total Sold
```

**Средняя цена входа:**
```
Average Entry Price = Total Spent / Total Bought
```

## Примеры расчета P&L

### Пример 1: Простая покупка

```
Действие: Трейдер покупает 1000 BONK за 100 SOL

Расчет:
- Total Bought = 1000 BONK
- Total Spent = 100 SOL
- Average Entry Price = 100 / 1000 = $0.10 per BONK
- Current Price = $0.12
- Current Holding = 1000 BONK

Unrealized P&L = (0.12 - 0.10) × 1000 = +$20 ✅
Unrealized P&L % = ((0.12 - 0.10) / 0.10) × 100 = +20%
```

### Пример 2: Покупка → Продажа (частичная)

```
Шаг 1: Покупка
- Купил 1000 BONK @ $0.50 = $500 потрачено

Шаг 2: Продажа (частичная)
- Продал 400 BONK @ $0.60 = $240 получено

Расчет:
- Total Bought = 1000 BONK
- Total Spent = $500
- Total Sold = 400 BONK
- Total Received = $240
- Average Entry Price = $500 / 1000 = $0.50
- Current Price = $0.60
- Current Holding = 1000 - 400 = 600 BONK

Realized P&L (от продажи):
= ($0.60 - $0.50) × 400 = +$40 ✅

Unrealized P&L (от оставшихся):
= ($0.60 - $0.50) × 600 = +$60 ✅

Total P&L = $40 (realized) + $60 (unrealized) = +$100
```

### Пример 3: Множественные покупки

```
Шаг 1: Купил 1000 BONK @ $0.40 = $400
Шаг 2: Купил 500 BONK @ $0.60 = $300
Шаг 3: Текущая цена $0.70

Расчет:
- Total Bought = 1500 BONK
- Total Spent = $700
- Average Entry Price = $700 / 1500 = $0.4667
- Current Holding = 1500 BONK
- Current Price = $0.70

Unrealized P&L:
= ($0.70 - $0.4667) × 1500 = +$350 ✅

P&L % = ((0.70 - 0.4667) / 0.4667) × 100 = +50%
```

### Пример 4: Полная продажа позиции

```
Шаг 1: Купил 1000 BONK @ $0.50 = $500
Шаг 2: Продал 1000 BONK @ $0.60 = $600

Расчет:
- Total Bought = 1000 BONK
- Total Spent = $500
- Total Sold = 1000 BONK
- Total Received = $600
- Average Entry Price = $0.50
- Current Holding = 0 BONK (all sold ✓)

Realized P&L = $600 - $500 = +$100 ✅
P&L % = (($0.60 - $0.50) / $0.50) × 100 = +20%
```

## Реализация в коде

### Edge Function: `calculateTokenPnl()`

```typescript
async function calculateTokenPnl(
  supabase: any,
  transactionType: string,
  walletAddress: string,
  tokenMint: string,
  currentAmount: number,
  currentPrice: number
): Promise<{
  tokenPnl: number;
  tokenPnlPercentage: number;
  entryPrice: number;
  remainingTokens: number;
  allTokensSold: boolean;
}>
```

### Логика расчета:

#### 1. Загрузка истории транзакций

```typescript
const { data: previousTransactions } = await supabase
  .from("webhook_transactions")
  .select("*")
  .eq("from_address", walletAddress)
  .eq("token_mint", tokenMint)
  .order("block_time", { ascending: true });
```

#### 2. Подсчет totals из истории

```typescript
let totalBought = 0;
let totalSpentOnBuys = 0;
let totalSold = 0;
let totalReceivedFromSells = 0;

for (const tx of previousTransactions) {
  const amount = Math.abs(parseFloat(tx.amount));
  const price = parseFloat(tx.current_token_price);

  if (tx.transaction_type === "BUY") {
    totalBought += amount;
    totalSpentOnBuys += amount * price;
  } else if (tx.transaction_type === "SELL") {
    totalSold += amount;
    totalReceivedFromSells += amount * price;
  }
}
```

#### 3. Добавление текущей транзакции

```typescript
if (transactionType === "BUY") {
  totalBought += absCurrentAmount;
  totalSpentOnBuys += absCurrentAmount * currentPrice;
} else if (transactionType === "SELL") {
  totalSold += absCurrentAmount;
  totalReceivedFromSells += absCurrentAmount * currentPrice;
}
```

#### 4. Расчет метрик позиции

```typescript
const currentHolding = totalBought - totalSold;
const avgEntryPrice = totalBought > 0 ? totalSpentOnBuys / totalBought : currentPrice;
const allTokensSold = currentHolding <= 0.000001;
```

#### 5. Расчет P&L

**Для BUY (Unrealized P&L):**

```typescript
if (transactionType === "BUY") {
  if (currentHolding > 0 && avgEntryPrice > 0) {
    const currentValue = currentHolding * currentPrice;
    const costBasis = currentHolding * avgEntryPrice;
    pnl = currentValue - costBasis;
    pnlPercentage = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;
  }
}
```

**Для SELL (Realized P&L):**

```typescript
if (transactionType === "SELL") {
  if (avgEntryPrice > 0) {
    // Realized P&L от продажи
    const soldValue = absCurrentAmount * currentPrice;
    const soldCost = absCurrentAmount * avgEntryPrice;
    const realizedPnl = soldValue - soldCost;
    pnl = realizedPnl;
    pnlPercentage = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;

    // + Unrealized P&L от оставшихся токенов
    if (currentHolding > 0) {
      const unrealizedValue = currentHolding * currentPrice;
      const unrealizedCost = currentHolding * avgEntryPrice;
      const unrealizedPnl = unrealizedValue - unrealizedCost;
      pnl += unrealizedPnl;
    }
  }
}
```

## Отображение в KOL Feed

### Данные транзакции:

```typescript
{
  transaction_type: "BUY" | "SELL",
  token_symbol: "BONK",
  amount: "1000",
  entry_price: "0.50",
  current_token_price: "0.60",
  token_pnl: "100.00",
  token_pnl_percentage: "20.00",
  remaining_tokens: "1000",
  all_tokens_sold: false
}
```

### Визуализация:

```
┌─────────────────────────────────────────────┐
│ BONK                                        │
│ BUY 1000 @ $0.60                           │
│ Entry: $0.50                               │
│ P&L: +$100.00 (+20%)  ✅                   │
│ Holding: 1000 BONK                         │
└─────────────────────────────────────────────┘
```

## Ключевые особенности

### ✅ Правильная обработка знака amount

```typescript
// amount может быть отрицательным (когда wallet отправляет токены)
const absCurrentAmount = Math.abs(currentAmount);
```

### ✅ SOL-first классификация

```typescript
// Если SOL потрачен (negative) = BUY
// Если SOL получен (positive) = SELL
if (sol_amount < 0) → BUY
if (sol_amount > 0) → SELL
```

### ✅ Учет частичных продаж

```typescript
// Realized P&L от продажи + Unrealized P&L от остатка
pnl = realizedPnl + unrealizedPnl;
```

### ✅ Real-time обновления

```typescript
// Supabase Realtime автоматически обновляет UI
supabase.channel('webhook_transactions_realtime')
  .on('postgres_changes', { event: 'INSERT' }, handleNewTransaction)
  .subscribe();
```

## Примеры логов

### BUY транзакция:

```
[BUY P&L] Bought: 1000.00, Holding: 1000.00, Entry: $0.50000000,
Current: $0.60000000, Unrealized P&L: $100.00 (+20.00%)
```

### SELL транзакция:

```
[SELL P&L] Sold: 400.00 @ $0.60000000, Entry: $0.50000000,
Realized: $40.00 (+20.00%), Remaining: 600.00, Total P&L: $100.00
```

## Summary

✅ **P&L система работает полностью!**
- Unrealized P&L для открытых позиций
- Realized P&L для продаж
- Средняя цена входа с учетом множественных покупок
- Правильная обработка частичных продаж
- Real-time обновления в KOL Feed
- Детальные логи для отладки

**Все транзакции теперь отображают корректный P&L!** 🎉
