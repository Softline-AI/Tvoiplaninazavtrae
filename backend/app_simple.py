#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs

class APIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        params = parse_qs(parsed_url.query)

        if path == '/api/transactions':
            self.handle_transactions(params)
        elif path == '/api/kol-feed':
            self.handle_kol_feed(params)
        elif path == '/api/insider-scan':
            self.handle_insider_scan(params)
        elif path == '/api/health':
            self.handle_health()
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def handle_transactions(self, params):
        time_range = params.get('timeRange', ['24h'])[0]
        tx_type = params.get('type', ['all'])[0]

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

        response = {
            "success": True,
            "data": transactions,
            "timeRange": time_range,
            "type": tx_type
        }

        self._set_headers()
        self.wfile.write(json.dumps(response).encode())

    def handle_kol_feed(self, params):
        time_range = params.get('timeRange', ['24h'])[0]

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

        response = {
            "success": True,
            "data": kol_activities,
            "timeRange": time_range
        }

        self._set_headers()
        self.wfile.write(json.dumps(response).encode())

    def handle_insider_scan(self, params):
        time_range = params.get('timeRange', ['1h'])[0]
        alert_level = params.get('alertLevel', ['all'])[0]

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

        response = {
            "success": True,
            "data": activities,
            "timeRange": time_range,
            "alertLevel": alert_level
        }

        self._set_headers()
        self.wfile.write(json.dumps(response).encode())

    def handle_health(self):
        response = {
            "status": "ok",
            "message": "Python HTTP Server is running"
        }
        self._set_headers()
        self.wfile.write(json.dumps(response).encode())

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

def run(port=5000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIHandler)
    print(f'🚀 Server running on http://localhost:{port}')
    print(f'📡 API endpoints available:')
    print(f'   GET http://localhost:{port}/api/transactions')
    print(f'   GET http://localhost:{port}/api/kol-feed')
    print(f'   GET http://localhost:{port}/api/insider-scan')
    print(f'   GET http://localhost:{port}/api/health')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
