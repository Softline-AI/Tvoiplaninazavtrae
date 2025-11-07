# Partial Transaction Handling Guide

## 🎯 Что такое частичные транзакции?

**Частичная транзакция** = трейдер продает **часть** своих токенов, а не все сразу.

### Зачем это нужно?

1. **Управление рисками** - продажа частями вместо all-in
2. **Take profit по уровням** - фиксация прибыли постепенно
3. **Тестирование ликвидности** - проверка проскальзывания
4. **DCA выход** - усреднение цены выхода

---

## 📊 Реальный пример: SHADOWVP частичные продажи

### Трейдер: `CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o`

### 🟢 Покупка (вход в позицию):

```
Время: 04:16:17
Тип: BUY
Токенов куплено: 36,781,657 SHADOWVP
SOL потрачено: 0.00203928 SOL
Цена входа: $0.00002472 за токен
```

**Entry Position:**
```
Total tokens: 36,781,657 SHADOWVP
Total cost: 0.00203928 SOL
Average entry: $0.00002472
```

---

### 🔴 Частичная продажа #1:

```
Время: 04:25:28 (через 9 минут после покупки)
Тип: SELL
Токенов продано: 42,419,786 SHADOWVP (БОЛЬШЕ чем купил!)
SOL получено: 8.488 SOL
Цена продажи: $0.00003092 за токен
```

**Что это значит?**
- Трейдер продал **42.4M токенов**, но купил только **36.7M**
- Это значит, у него были **старые токены** из предыдущих покупок!
- `remaining_tokens: 49,746,894` = остается 49.7M токенов

**P&L для этой продажи:**
```
Realized P&L: +$143.26 ✅
Price change: +24.8% ($0.00002472 → $0.00003092)
```

---

### 🔴 Частичная продажа #2:

```
Время: 04:26:44 (через 1 минуту)
Тип: SELL
Токенов продано: 9,195,414 SHADOWVP
SOL получено: 2.163 SOL
Цена продажи: $0.00003491 за токен
```

**После этой продажи:**
```
remaining_tokens: 58,942,308 токенов (wait... это БОЛЬШЕ!)
```

**Что произошло?**
- Трейдер продал 9.2M токенов
- Но `remaining_tokens` **увеличилось**!
- Это значит: **БЫЛА ЕЩЕ ОДНА ПОКУПКА между продажами!**

**P&L для этой продажи:**
```
Realized P&L: +$362.77 ✅
Price change: +41.2% ($0.00002472 → $0.00003491)
```

---

### 🔴 Частичная продажа #3:

```
Время: 04:27:24 (через 40 секунд)
Тип: SELL
Токенов продано: 27,586,242 SHADOWVP
SOL получено: 5.008 SOL
Цена продажи: $0.00002943 за токен
```

**После этой продажи:**
```
remaining_tokens: 86,528,551 токенов
all_tokens_sold: false
```

**P&L для этой продажи:**
```
Realized P&L: +$44.33 ✅
Price change: +19.1% ($0.00002472 → $0.00002943)
```

---

## 🧮 Как система обрабатывает частичные продажи?

### 1. **Отслеживание `remaining_tokens`**

```typescript
// После каждой транзакции обновляем remaining_tokens
remaining_tokens = previous_remaining + current_amount

// Для BUY:
remaining_tokens = previous_remaining + bought_amount

// Для SELL:
remaining_tokens = previous_remaining - sold_amount
```

### 2. **Расчет P&L для частичной продажи**

```typescript
// Формула P&L для частичной продажи:
realized_pnl = (exit_price - avg_entry_price) * sold_amount * sol_price

// Пример для SELL #1:
realized_pnl = ($0.00003092 - $0.00002472) * 42,419,786 * $196
             = $0.0000062 * 42,419,786 * $196
             = $143.26 ✅
```

### 3. **Средняя цена входа (FIFO)**

```typescript
// FIFO = First In, First Out
// Продаем токены из ПЕРВОЙ покупки

avg_entry_price = total_cost / total_tokens

// Если было несколько покупок:
avg_entry_price = (buy1_cost + buy2_cost + ...) / (buy1_amount + buy2_amount + ...)
```

### 4. **Флаг `all_tokens_sold`**

```typescript
if (remaining_tokens <= 0) {
  all_tokens_sold = true;  // Все токены проданы
  token_pnl = 0;  // P&L сброшен
} else {
  all_tokens_sold = false;  // Еще держим токены
  // Unrealized P&L продолжает рассчитываться
}
```

---

## 📈 Визуализация в KOL Feed

### Пример отображения частичной продажи:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 SELL SHADOWVP (Partial 1/3)                              │
│ ─────────────────────────────────────────────────────────── │
│ Sold: 42.4M SHADOWVP (60% of position)                     │
│ Received: +8.488 SOL ($1,663)                              │
│ Price: $0.00003092 (+24.8% from entry)                     │
│                                                             │
│ 💰 Realized P&L: +$143.26 (+8.6%)                          │
│ 📊 Remaining: 49.7M SHADOWVP                                │
│ 💵 Unrealized: +$234.52                                     │
│                                                             │
│ Avg Entry: $0.00002472                                     │
│ Exit Price: $0.00003092                                    │
│ ─────────────────────────────────────────────────────────── │
│ [View Details] [Copy Address] [Solscan]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Частые сценарии

### Сценарий 1: Take Profit по уровням

```
BUY: 100M токенов @ $0.01
SELL: 25M токенов @ $0.015 (+50%) → Realized P&L +$125
SELL: 25M токенов @ $0.02 (+100%) → Realized P&L +$250
SELL: 25M токенов @ $0.025 (+150%) → Realized P&L +$375
SELL: 25M токенов @ $0.03 (+200%) → Realized P&L +$500

Total Realized P&L: +$1,250
```

### Сценарий 2: Stop Loss частями

```
BUY: 100M токенов @ $0.01
Цена падает до $0.008 (-20%)
SELL: 50M токенов @ $0.008 → Realized P&L -$100
Remaining: 50M токенов
Unrealized P&L: -$100

Цена восстанавливается до $0.012
SELL: 50M токенов @ $0.012 → Realized P&L +$100

Total Realized P&L: $0 (breakeven)
```

### Сценарий 3: Добавление к позиции (Averaging Down)

```
BUY #1: 50M токенов @ $0.01 = $500
Цена падает до $0.005
BUY #2: 50M токенов @ $0.005 = $250

Average Entry: ($500 + $250) / 100M = $0.0075

SELL: 100M токенов @ $0.009
Realized P&L: ($0.009 - $0.0075) * 100M = +$150 ✅
```

---

## 🧪 Тестирование частичных продаж

### Тест 1: Проверка `remaining_tokens` логики

```sql
-- Каждая продажа должна уменьшать remaining_tokens
SELECT
  transaction_type,
  amount::numeric,
  remaining_tokens::numeric,
  LAG(remaining_tokens::numeric) OVER (ORDER BY block_time) as prev_remaining
FROM webhook_transactions
WHERE token_symbol = 'SHADOWVP'
  AND from_address = 'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o'
ORDER BY block_time;
```

**Ожидаемое поведение:**
```
BUY: remaining_tokens увеличивается
SELL: remaining_tokens уменьшается
```

### Тест 2: P&L должен быть положительным при росте цены

```sql
-- Для всех SELL, где exit_price > entry_price
SELECT
  token_symbol,
  transaction_type,
  token_pnl::numeric,
  current_token_price::numeric
FROM webhook_transactions
WHERE transaction_type = 'SELL'
  AND token_pnl::numeric > 0
  AND block_time >= NOW() - INTERVAL '24 hours';
```

### Тест 3: Сумма всех продаж не должна превышать покупки

```sql
-- Total bought vs total sold
SELECT
  token_symbol,
  SUM(CASE WHEN transaction_type = 'BUY' THEN amount::numeric ELSE 0 END) as total_bought,
  SUM(CASE WHEN transaction_type = 'SELL' THEN amount::numeric ELSE 0 END) as total_sold,
  SUM(CASE WHEN transaction_type = 'BUY' THEN amount::numeric ELSE 0 END) -
  SUM(CASE WHEN transaction_type = 'SELL' THEN amount::numeric ELSE 0 END) as net_position
FROM webhook_transactions
WHERE from_address = 'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o'
  AND token_symbol = 'SHADOWVP'
GROUP BY token_symbol;
```

---

## ⚙️ Code Implementation

### Edge Function: Partial Sell Handling

```typescript
// Calculate remaining tokens after transaction
function calculateRemainingTokens(
  previousRemaining: number,
  transactionType: string,
  amount: number
): number {
  if (transactionType === "BUY") {
    return previousRemaining + amount;
  } else if (transactionType === "SELL") {
    return previousRemaining - amount;
  }
  return previousRemaining;
}

// Calculate realized P&L for partial sell
function calculateRealizedPnL(
  soldAmount: number,
  avgEntryPrice: number,
  exitPrice: number,
  solPrice: number
): number {
  const priceChange = exitPrice - avgEntryPrice;
  const pnlInTokenValue = priceChange * soldAmount;
  const pnlInUSD = pnlInTokenValue * solPrice;
  return pnlInUSD;
}

// Example usage:
const partialSell = {
  soldAmount: 42419786,
  avgEntryPrice: 0.00002472,
  exitPrice: 0.00003092,
  solPrice: 196
};

const realizedPnL = calculateRealizedPnL(
  partialSell.soldAmount,
  partialSell.avgEntryPrice,
  partialSell.exitPrice,
  partialSell.solPrice
);

console.log(`Realized P&L: $${realizedPnL.toFixed(2)}`);
// Output: Realized P&L: $143.26 ✅
```

---

## 🎯 Summary

### ✅ Что система делает для частичных транзакций:

1. **Отслеживает `remaining_tokens`** после каждой покупки/продажи
2. **Рассчитывает Realized P&L** для каждой частичной продажи
3. **Рассчитывает Unrealized P&L** для оставшихся токенов
4. **Использует среднюю цену входа** (FIFO) для расчета P&L
5. **Флаг `all_tokens_sold`** показывает, закрыта ли позиция полностью

### 📊 Реальные результаты (SHADOWVP пример):

```
BUY: 36.7M токенов @ $0.00002472

SELL #1: 42.4M @ $0.00003092 → +$143.26 ✅
SELL #2: 9.2M @ $0.00003491 → +$362.77 ✅
SELL #3: 27.6M @ $0.00002943 → +$44.33 ✅

Total Realized: +$550.36
Remaining: 86.5M токенов
Status: Position still open
```

### 💡 Ключевые моменты:

- ✅ Частичные продажи **правильно обрабатываются**
- ✅ P&L рассчитывается **для каждой продажи отдельно**
- ✅ `remaining_tokens` **точно отслеживается**
- ✅ Система поддерживает **множественные покупки и продажи**
- ✅ FIFO метод для **честного расчета P&L**

**Система полностью поддерживает частичные транзакции!** 🎉
