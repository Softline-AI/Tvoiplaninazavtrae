from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    time_range = request.args.get('timeRange', '24h')
    tx_type = request.args.get('type', 'all')

    transactions = [
        {
            "id": "1",
            "signature": "5ThrLJDFpJqaFL36AvAX8ECZmz6n4vZvqMYvpHHkpump",
            "type": "buy",
            "wallet": "BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd",
            "walletName": "Smart Whale #1",
            "token": "Solana",
            "tokenSymbol": "SOL",
            "amount": "1,250 SOL",
            "value": "$177,875",
            "price": "$142.30",
            "timestamp": "2 min ago",
            "status": "success"
        },
        {
            "id": "2",
            "signature": "2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f",
            "type": "sell",
            "wallet": "FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR",
            "walletName": "KOL Trader",
            "token": "Bonk",
            "tokenSymbol": "BONK",
            "amount": "50M BONK",
            "value": "$1,700",
            "price": "$0.000034",
            "timestamp": "5 min ago",
            "status": "success"
        },
        {
            "id": "3",
            "signature": "7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1",
            "type": "swap",
            "wallet": "DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj",
            "walletName": "Whale Trader",
            "token": "Jupiter → Raydium",
            "tokenSymbol": "JUP→RAY",
            "amount": "5,000 JUP",
            "value": "$4,450",
            "price": "$0.89",
            "timestamp": "8 min ago",
            "status": "success"
        },
        {
            "id": "4",
            "signature": "8KBc3VZ5CnwpihT7yoeQ156JSdmavm9K5fdLxjkPnBmS",
            "type": "buy",
            "wallet": "GhP4YA5DqQs6vnN3rpeT267KTenbwq0L6geMzlRsXyNu",
            "walletName": "DeFi Whale",
            "token": "Orca",
            "tokenSymbol": "ORCA",
            "amount": "10,000 ORCA",
            "value": "$35,600",
            "price": "$3.56",
            "timestamp": "12 min ago",
            "status": "success"
        }
    ]

    if tx_type != 'all':
        transactions = [tx for tx in transactions if tx['type'] == tx_type]

    return jsonify({
        "success": True,
        "data": transactions,
        "timeRange": time_range,
        "type": tx_type
    })

@app.route('/api/kol-feed', methods=['GET'])
def get_kol_feed():
    time_range = request.args.get('timeRange', '24h')

    kol_activities = [
        {
            "id": "1",
            "wallet": "BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd",
            "walletName": "CryptoWhale",
            "action": "bought",
            "token": "SOL",
            "tokenName": "Solana",
            "amount": "1,250",
            "value": "$177,875",
            "price": "$142.30",
            "timestamp": "2 min ago",
            "pnl": "+$12,450",
            "pnlPercent": "+7.5%",
            "isProfit": True
        },
        {
            "id": "2",
            "wallet": "FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR",
            "walletName": "SmartMoney",
            "action": "sold",
            "token": "BONK",
            "tokenName": "Bonk",
            "amount": "50M",
            "value": "$1,700",
            "price": "$0.000034",
            "timestamp": "5 min ago",
            "pnl": "-$340",
            "pnlPercent": "-2.1%",
            "isProfit": False
        }
    ]

    return jsonify({
        "success": True,
        "data": kol_activities,
        "timeRange": time_range
    })

@app.route('/api/insider-scan', methods=['GET'])
def get_insider_scan():
    time_range = request.args.get('timeRange', '1h')
    alert_level = request.args.get('alertLevel', 'all')

    activities = [
        {
            "id": "1",
            "type": "large_buy",
            "wallet": "BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd",
            "walletName": "Insider Whale #1",
            "token": "Unknown Token",
            "tokenSymbol": "ALPHA",
            "amount": "50M ALPHA",
            "value": "$2.5M",
            "timestamp": "2 min ago",
            "confidence": "high",
            "description": "Large accumulation before announcement",
            "contractAddress": "5ThrLJDFpJqaFL36AvAX8ECZmz6n4vZvqMYvpHHkpump"
        },
        {
            "id": "2",
            "type": "whale_move",
            "wallet": "2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f",
            "walletName": "Smart Money #2",
            "token": "Jupiter",
            "tokenSymbol": "JUP",
            "amount": "100K JUP",
            "value": "$89K",
            "timestamp": "8 min ago",
            "confidence": "high",
            "description": "Unusual activity from dormant wallet",
            "contractAddress": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
        }
    ]

    if alert_level != 'all':
        activities = [a for a in activities if a['confidence'] == alert_level]

    return jsonify({
        "success": True,
        "data": activities,
        "timeRange": time_range,
        "alertLevel": alert_level
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Flask API is running"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
