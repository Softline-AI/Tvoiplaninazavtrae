from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import redis
import json
import logging
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from logging.handlers import RotatingFileHandler

load_dotenv()

app = Flask(__name__)
CORS(app)

if not app.debug:
    file_handler = RotatingFileHandler('/tmp/flask_app.log', maxBytes=10240000, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Flask application startup')

HELIUS_API_KEY_1 = os.getenv('VITE_HELIUS_API_KEY_1')
HELIUS_API_KEY_2 = os.getenv('VITE_HELIUS_API_KEY_2')
HELIUS_API_KEY_3 = os.getenv('VITE_HELIUS_API_KEY_3')
BIRDEYE_API_KEY = os.getenv('VITE_BIRDEYE_API_KEY')
ABLY_API_KEY = os.getenv('VITE_ABLY_API_KEY')
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

HELIUS_API_KEY = HELIUS_API_KEY_1

print(f"API Keys loaded:")
print(f"  Helius API Key 1: {'✓' if HELIUS_API_KEY_1 else '✗'}")
print(f"  Helius API Key 2: {'✓' if HELIUS_API_KEY_2 else '✗'}")
print(f"  Helius API Key 3: {'✓' if HELIUS_API_KEY_3 else '✗'}")
print(f"  Birdeye API Key: {'✓' if BIRDEYE_API_KEY else '✗'}")
print(f"  Ably API Key: {'✓' if ABLY_API_KEY else '✗'}")
print(f"  Supabase URL: {'✓' if SUPABASE_URL else '✗'}")
print(f"  Supabase Key: {'✓' if SUPABASE_KEY else '✗'}")

try:
    cache = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    cache.ping()
    REDIS_AVAILABLE = True
    print("✓ Redis connected successfully")
    app.logger.info('Redis cache connected')
except Exception as e:
    REDIS_AVAILABLE = False
    print(f"✗ Redis not available: {str(e)}")
    print("  Caching disabled - application will work without cache")
    if not app.debug:
        app.logger.warning(f'Redis connection failed: {str(e)}')

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        time_range = request.args.get('timeRange', '24h')
        tx_type = request.args.get('type', 'all')

        cache_key = f"transactions_{time_range}_{tx_type}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        headers = {
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }

        url = f"{SUPABASE_URL}/rest/v1/webhook_transactions"
        params = {'order': 'block_time.desc', 'limit': '50'}

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        transactions = response.json()

        if tx_type != 'all':
            transactions = [tx for tx in transactions if tx.get('transaction_type') == tx_type]

        result = {
            "success": True,
            "data": transactions,
            "timeRange": time_range,
            "type": tx_type
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 300, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch transactions: {str(e)}",
            "data": []
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": []
        }), 500

@app.route('/api/kol-feed', methods=['GET'])
def get_kol_feed():
    try:
        time_range = request.args.get('timeRange', '24h')
        tx_type = request.args.get('type', 'all')
        sort_by = request.args.get('sortBy', 'time')
        limit = int(request.args.get('limit', 50))

        cache_key = f"kol_feed_{time_range}_{tx_type}_{sort_by}_{limit}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        headers = {
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }

        now_utc = datetime.now(timezone.utc)
        time_filter_map = {
            '1h': now_utc - timedelta(hours=1),
            '24h': now_utc - timedelta(hours=24),
            '7d': now_utc - timedelta(days=7),
            '30d': now_utc - timedelta(days=30)
        }
        time_filter = time_filter_map.get(time_range, now_utc - timedelta(hours=24))

        kol_profiles_url = f"{SUPABASE_URL}/rest/v1/kol_profiles"
        kol_response = requests.get(kol_profiles_url, headers=headers, params={'select': '*'}, timeout=10)
        kol_response.raise_for_status()
        kol_profiles = {p['wallet_address']: p for p in kol_response.json()}

        tx_url = f"{SUPABASE_URL}/rest/v1/webhook_transactions"
        tx_params = {
            'select': '*',
            'block_time': f'gte.{time_filter.isoformat()}',
            'order': 'block_time.desc',
            'limit': str(limit * 2)
        }

        tx_response = requests.get(tx_url, headers=headers, params=tx_params, timeout=10)
        tx_response.raise_for_status()
        transactions = tx_response.json()

        kol_trades = []
        for tx in transactions:
            wallet = tx.get('from_address')
            if wallet in kol_profiles:
                profile = kol_profiles[wallet]

                tx_category = 'buy' if tx.get('transaction_type') in ['SWAP', 'BUY'] else 'sell'

                if tx_type != 'all' and tx_category != tx_type:
                    continue

                time_diff = now_utc - datetime.fromisoformat(tx['block_time'].replace('Z', '+00:00'))
                if time_diff.total_seconds() < 60:
                    time_ago = f"{int(time_diff.total_seconds())}s"
                elif time_diff.total_seconds() < 3600:
                    time_ago = f"{int(time_diff.total_seconds() / 60)}m"
                else:
                    time_ago = f"{int(time_diff.total_seconds() / 3600)}h"

                trade = {
                    'id': tx['id'],
                    'lastTx': tx_category,
                    'timeAgo': time_ago,
                    'kolName': profile['name'],
                    'kolAvatar': profile.get('avatar_url', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'),
                    'walletAddress': wallet,
                    'twitterHandle': profile.get('twitter_handle', wallet[:8]),
                    'token': tx.get('token_symbol', 'Unknown'),
                    'tokenContract': tx.get('token_mint', ''),
                    'bought': f"${float(tx.get('amount', 0)):,.2f}",
                    'sold': '$0.00' if tx_category == 'buy' else f"${float(tx.get('amount', 0)):,.2f}",
                    'holding': f"${float(tx.get('amount', 0)):,.2f}" if tx_category == 'buy' else 'sold all',
                    'pnl': f"+${abs(float(profile.get('total_pnl', 0))):,.2f}" if profile.get('total_pnl', 0) >= 0 else f"-${abs(float(profile.get('total_pnl', 0))):,.2f}",
                    'pnlPercentage': f"+{profile.get('win_rate', 0):.2f}%" if profile.get('win_rate', 0) >= 0 else f"{profile.get('win_rate', 0):.2f}%",
                    'timestamp': tx['block_time']
                }
                kol_trades.append(trade)

        if sort_by == 'pnl':
            kol_trades.sort(key=lambda x: float(x['pnl'].replace('$', '').replace(',', '').replace('+', '')), reverse=True)
        elif sort_by == 'volume':
            kol_trades.sort(key=lambda x: float(x['bought'].replace('$', '').replace(',', '')) + float(x['sold'].replace('$', '').replace(',', '')), reverse=True)

        kol_trades = kol_trades[:limit]

        result = {
            "success": True,
            "data": kol_trades,
            "timeRange": time_range,
            "type": tx_type,
            "sortBy": sort_by,
            "cached_at": now_utc.isoformat(),
            "cache_expires_in": 3600
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 3600, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        app.logger.error(f"KOL feed request error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch KOL feed: {str(e)}",
            "data": []
        }), 500
    except Exception as e:
        app.logger.error(f"KOL feed error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": []
        }), 500

@app.route('/api/insider-scan', methods=['GET'])
def get_insider_scan():
    try:
        time_range = request.args.get('timeRange', '1h')
        alert_level = request.args.get('alertLevel', 'all')
        cache_key = f"insider_scan_{time_range}_{alert_level}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        headers = {
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }

        url = f"{SUPABASE_URL}/rest/v1/webhook_transactions"
        params = {
            'select': '*',
            'order': 'block_time.desc',
            'limit': '100'
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        transactions = response.json()

        activities = []
        for tx in transactions:
            if tx.get('amount_usd', 0) > 100000:
                activity = {
                    "id": tx.get('signature', ''),
                    "type": "large_buy" if tx.get('type') == 'SWAP' else "whale_move",
                    "wallet": tx.get('wallet_address', ''),
                    "walletName": tx.get('wallet_address', '')[:8] + '...',
                    "token": tx.get('token_symbol', 'Unknown'),
                    "tokenSymbol": tx.get('token_symbol', 'UNK'),
                    "amount": f"{tx.get('amount', 0)} {tx.get('token_symbol', '')}",
                    "value": f"${tx.get('amount_usd', 0):,.0f}",
                    "timestamp": tx.get('timestamp', ''),
                    "confidence": "high" if tx.get('amount_usd', 0) > 500000 else "medium",
                    "description": "Large transaction detected",
                    "contractAddress": tx.get('token_address', '')
                }
                activities.append(activity)

        if alert_level != 'all':
            activities = [a for a in activities if a['confidence'] == alert_level]

        result = {
            "success": True,
            "data": activities[:50],
            "timeRange": time_range,
            "alertLevel": alert_level
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 180, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch insider scan data: {str(e)}",
            "data": []
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": []
        }), 500

@app.route('/api/wallet/<wallet_address>/transactions', methods=['GET'])
def get_wallet_transactions(wallet_address):
    try:
        cache_key = f"wallet_tx_{wallet_address}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        url = f"https://api.helius.xyz/v0/addresses/{wallet_address}/transactions"
        params = {
            'api-key': HELIUS_API_KEY,
            'limit': 50
        }

        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()

        transactions = response.json()

        result = {
            "success": True,
            "wallet": wallet_address,
            "data": transactions
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 300, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch wallet transactions: {str(e)}",
            "data": []
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": []
        }), 500

@app.route('/api/token/<token_address>/price', methods=['GET'])
def get_token_price(token_address):
    try:
        cache_key = f"token_price_{token_address}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        headers = {
            'X-API-KEY': BIRDEYE_API_KEY
        }

        url = f"https://public-api.birdeye.so/defi/price"
        params = {
            'address': token_address,
            'check_liquidity': 'true'
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        price_data = response.json()

        result = {
            "success": True,
            "token": token_address,
            "data": price_data
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 60, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch token price: {str(e)}",
            "data": {}
        }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": {}
        }), 500

@app.route('/api/trader/<wallet_address>', methods=['GET'])
def get_trader_profile(wallet_address):
    try:
        cache_key = f"trader_profile_{wallet_address}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        headers = {
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }

        profile_url = f"{SUPABASE_URL}/rest/v1/kol_profiles"
        profile_params = {
            'select': '*',
            'wallet_address': f'eq.{wallet_address}'
        }

        profile_response = requests.get(profile_url, headers=headers, params=profile_params, timeout=10)
        profile_response.raise_for_status()
        profiles = profile_response.json()

        if not profiles:
            return jsonify({
                "success": False,
                "error": "Trader not found"
            }), 404

        profile = profiles[0]

        now_utc = datetime.now(timezone.utc)
        time_filter = now_utc - timedelta(days=30)

        tx_url = f"{SUPABASE_URL}/rest/v1/webhook_transactions"
        tx_params = {
            'select': '*',
            'from_address': f'eq.{wallet_address}',
            'block_time': f'gte.{time_filter.isoformat()}',
            'order': 'block_time.desc',
            'limit': '100'
        }

        tx_response = requests.get(tx_url, headers=headers, params=tx_params, timeout=10)
        tx_response.raise_for_status()
        transactions = tx_response.json()

        recent_trades = []
        for tx in transactions[:20]:
            time_diff = now_utc - datetime.fromisoformat(tx['block_time'].replace('Z', '+00:00'))
            if time_diff.total_seconds() < 60:
                time_ago = f"{int(time_diff.total_seconds())}s"
            elif time_diff.total_seconds() < 3600:
                time_ago = f"{int(time_diff.total_seconds() / 60)}m"
            elif time_diff.total_seconds() < 86400:
                time_ago = f"{int(time_diff.total_seconds() / 3600)}h"
            else:
                time_ago = f"{int(time_diff.total_seconds() / 86400)}d"

            trade = {
                'id': tx['id'],
                'type': 'buy' if tx.get('transaction_type') in ['SWAP', 'BUY'] else 'sell',
                'token': tx.get('token_symbol', 'Unknown'),
                'tokenContract': tx.get('token_mint', ''),
                'amount': float(tx.get('amount', 0)),
                'timestamp': tx['block_time'],
                'timeAgo': time_ago
            }
            recent_trades.append(trade)

        result = {
            "success": True,
            "profile": {
                "wallet_address": profile['wallet_address'],
                "name": profile['name'],
                "avatar_url": profile.get('avatar_url', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'),
                "twitter_handle": profile.get('twitter_handle', ''),
                "bio": profile.get('bio', ''),
                "total_pnl": float(profile.get('total_pnl', 0)),
                "total_trades": profile.get('total_trades', 0),
                "win_rate": float(profile.get('win_rate', 0)),
                "total_volume": float(profile.get('total_volume', 0)),
                "followers_count": profile.get('followers_count', 0),
                "is_verified": profile.get('is_verified', False),
                "rank": profile.get('rank'),
                "created_at": profile.get('created_at'),
                "updated_at": profile.get('updated_at')
            },
            "recent_trades": recent_trades,
            "stats": {
                "total_transactions": len(transactions),
                "buy_count": len([t for t in transactions if t.get('transaction_type') in ['SWAP', 'BUY']]),
                "sell_count": len([t for t in transactions if t.get('transaction_type') not in ['SWAP', 'BUY']]),
                "total_volume_30d": sum([float(t.get('amount', 0)) for t in transactions])
            }
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 300, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Trader profile request error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch trader profile: {str(e)}"
        }), 500
    except Exception as e:
        app.logger.error(f"Trader profile error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Flask API is running",
        "redis": "connected" if REDIS_AVAILABLE else "unavailable",
        "endpoints": {
            "transactions": "/api/transactions",
            "kol_feed": "/api/kol-feed",
            "trader_profile": "/api/trader/<wallet_address>",
            "insider_scan": "/api/insider-scan",
            "wallet_transactions": "/api/wallet/<address>/transactions",
            "token_price": "/api/token/<address>/price"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
