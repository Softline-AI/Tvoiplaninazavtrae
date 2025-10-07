# Backend для StalkX

## Вариант 1: Python HTTP Server (без зависимостей) - РЕКОМЕНДУЕТСЯ

```bash
cd backend
python3 app_simple.py
```

## Вариант 2: Flask (требует установки)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Сервер запустится на `http://localhost:5000`

## API Endpoints

### 1. Транзакции
```
GET /api/transactions?timeRange=24h&type=all
```

### 2. KOL Feed
```
GET /api/kol-feed?timeRange=24h
```

### 3. Insider Scan
```
GET /api/insider-scan?timeRange=1h&alertLevel=all
```

### 4. Health Check
```
GET /api/health
```
