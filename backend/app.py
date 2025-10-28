from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import redis
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

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
except:
    REDIS_AVAILABLE = False
    print("Redis not available, caching disabled")

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
        cache_key = f"kol_feed_{time_range}"

        if REDIS_AVAILABLE:
            cached_data = cache.get(cache_key)
            if cached_data:
                return jsonify(json.loads(cached_data))

        headers = {
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }

        url = f"{SUPABASE_URL}/rest/v1/kol_profiles"
        params = {'select': '*', 'order': 'total_pnl.desc'}

        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        kol_profiles = response.json()

        result = {
            "success": True,
            "data": kol_profiles,
            "timeRange": time_range
        }

        if REDIS_AVAILABLE:
            cache.setex(cache_key, 600, json.dumps(result))

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch KOL feed: {str(e)}",
            "data": []
        }), 500
    except Exception as e:
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

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Flask API is running",
        "redis": "connected" if REDIS_AVAILABLE else "unavailable",
        "endpoints": {
            "transactions": "/api/transactions",
            "kol_feed": "/api/kol-feed",
            "insider_scan": "/api/insider-scan",
            "wallet_transactions": "/api/wallet/<address>/transactions",
            "token_price": "/api/token/<address>/price"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
