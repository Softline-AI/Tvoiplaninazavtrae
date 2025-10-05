const FLASK_API_URL = 'http://localhost:5000/api';

interface FlaskTransaction {
  id: string;
  signature: string;
  type: 'buy' | 'sell' | 'swap';
  wallet: string;
  walletName: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  value: string;
  price: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

interface FlaskKOLActivity {
  id: string;
  wallet: string;
  walletName: string;
  action: string;
  token: string;
  tokenName: string;
  amount: string;
  value: string;
  price: string;
  timestamp: string;
  pnl: string;
  pnlPercent: string;
  isProfit: boolean;
}

interface FlaskInsiderActivity {
  id: string;
  type: 'large_buy' | 'large_sell' | 'new_position' | 'whale_move';
  wallet: string;
  walletName: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  value: string;
  timestamp: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  contractAddress: string;
}

class FlaskService {
  async getTransactions(timeRange: string = '24h', type: string = 'all'): Promise<FlaskTransaction[]> {
    try {
      const response = await fetch(
        `${FLASK_API_URL}/transactions?timeRange=${timeRange}&type=${type}`
      );

      if (!response.ok) {
        console.error('Flask API error:', response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching transactions from Flask:', error);
      return [];
    }
  }

  async getKOLFeed(timeRange: string = '24h'): Promise<FlaskKOLActivity[]> {
    try {
      const response = await fetch(
        `${FLASK_API_URL}/kol-feed?timeRange=${timeRange}`
      );

      if (!response.ok) {
        console.error('Flask API error:', response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching KOL feed from Flask:', error);
      return [];
    }
  }

  async getInsiderScan(timeRange: string = '1h', alertLevel: string = 'all'): Promise<FlaskInsiderActivity[]> {
    try {
      const response = await fetch(
        `${FLASK_API_URL}/insider-scan?timeRange=${timeRange}&alertLevel=${alertLevel}`
      );

      if (!response.ok) {
        console.error('Flask API error:', response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching insider scan from Flask:', error);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${FLASK_API_URL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Flask API health check failed:', error);
      return false;
    }
  }
}

export const flaskService = new FlaskService();
export type { FlaskTransaction, FlaskKOLActivity, FlaskInsiderActivity };
