# Privy Authentication Setup (Опционально)

Приложение поддерживает Privy для аутентификации пользователей.

**ПО УМОЛЧАНИЮ PRIVY ОТКЛЮЧЕН** - все функции работают без авторизации.

Если вы хотите добавить систему регистрации и защитить профили трейдеров, следуйте инструкции ниже.

## Настройка

### 1. Создайте аккаунт на Privy

1. Перейдите на [privy.io](https://privy.io)
2. Зарегистрируйтесь и создайте новое приложение
3. В настройках приложения найдите `App ID`

### 2. Настройте переменные окружения

Откройте файл `.env` и добавьте строку с вашим App ID:

```
VITE_PRIVY_APP_ID=clpxxxxxxxxxxxxxx
```

**Важно:** Без этой переменной Privy не будет активирован и приложение работает в обычном режиме.

### 3. Настройте методы входа (опционально)

По умолчанию включены следующие методы входа:
- Email
- Wallet (Web3)
- Google
- Twitter

Чтобы изменить методы входа, отредактируйте `src/main.tsx`:

```typescript
loginMethods: ['email', 'wallet', 'google', 'twitter']
```

### 4. Настройте внешний вид (опционально)

Измените тему и цвета в `src/main.tsx`:

```typescript
appearance: {
  theme: 'dark',        // 'light' или 'dark'
  accentColor: '#ffffff',
  logo: '/favicon.svg',
}
```

## Как это работает

### Защищенные маршруты

Профили трейдеров (`/app/kol-profile/:walletAddress`) теперь защищены компонентом `ProtectedRoute`:

- Неавторизованные пользователи видят экран с предложением войти
- После входа они получают полный доступ к профилям

### Компоненты авторизации

1. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Оборачивает защищенные маршруты
   - Показывает экран входа для неавторизованных пользователей

2. **AuthButton** (`src/components/AuthButton.tsx`)
   - Отображается в Navigation на страницах приложения
   - Показывает кнопку "Sign In" или информацию о пользователе

### Доступ к данным пользователя

Используйте хук `usePrivy` для работы с авторизацией:

```typescript
import { usePrivy } from '@privy-io/react-auth';

function MyComponent() {
  const { authenticated, user, login, logout } = usePrivy();

  if (authenticated) {
    console.log('User email:', user?.email?.address);
    console.log('User wallet:', user?.wallet?.address);
  }

  return (
    <button onClick={authenticated ? logout : login}>
      {authenticated ? 'Logout' : 'Login'}
    </button>
  );
}
```

## Расширение функционала

### Добавление дополнительных защищенных маршрутов

В `src/App.tsx` оберните любой маршрут в `ProtectedRoute`:

```typescript
<Route path="/premium-feature" element={
  <ProtectedRoute>
    <PremiumComponent />
  </ProtectedRoute>
} />
```

### Проверка авторизации в компонентах

```typescript
import { usePrivy } from '@privy-io/react-auth';

function MyComponent() {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {authenticated ? (
        <div>Welcome, authenticated user!</div>
      ) : (
        <div>Please sign in to continue</div>
      )}
    </div>
  );
}
```

## Важные замечания

1. **App ID обязателен** - без него приложение не запустится
2. **Тестирование в режиме разработки** - Privy работает как на localhost, так и в production
3. **Безопасность** - Privy автоматически управляет токенами и сессиями
4. **Встроенные кошельки** - Privy может создавать кошельки для пользователей без Web3 кошелька

## Документация Privy

Полная документация доступна на: [docs.privy.io](https://docs.privy.io)
