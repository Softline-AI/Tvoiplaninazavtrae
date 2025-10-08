const HELIUS_API_KEYS = [
  import.meta.env.HELIUS_API_KEY_1 || '23820805-b04f-45a2-9d4b-e70d588bd406',
  import.meta.env.HELIUS_API_KEY_2 || 'e8716d73-d001-4b9a-9370-0a4ef7ac8d28',
  import.meta.env.HELIUS_API_KEY_3 || 'cc0ea229-5dc8-4e7d-9707-7c2692eeefbb',
];

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = HELIUS_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % HELIUS_API_KEYS.length;
  return key;
}

export interface HeliusTransactionResponse {
  signature: string;
  timestamp: number;
  slot: number;
  type: string;
  feePayer: string;
  fee: number;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard?: string;
  }>;
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
      userAccount: string;
    }>;
  }>;
  description?: string;
  source?: string;
}

export interface ParsedTransaction {
  signature: string;
  timestamp: number;
  type: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  tokenSymbol: string;
  fee: number;
  description: string;
  category: string;
}

export const heliusTransactionService = {
  async getRecentTransactions(limit: number = 100): Promise<HeliusTransactionResponse[]> {
    try {
      const apiKey = getNextApiKey();
      const url = `https://api.helius.xyz/v0/transactions/?api-key=${apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Helius API error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, limit) : [];
    } catch (error) {
      console.error('Error fetching transactions from Helius:', error);
      return [];
    }
  },

  async getAddressTransactions(
    address: string,
    limit: number = 100
  ): Promise<HeliusTransactionResponse[]> {
    try {
      const apiKey = getNextApiKey();
      const url = `https://api.helius.xyz/v0/addresses/${address}/transactions/?api-key=${apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Helius API error for address:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, limit) : [];
    } catch (error) {
      console.error('Error fetching address transactions from Helius:', error);
      return [];
    }
  },

  async parseTransactions(rawTransactions: HeliusTransactionResponse[]): Promise<ParsedTransaction[]> {
    return rawTransactions.map((tx) => {
      const tokenTransfer = tx.tokenTransfers?.[0];
      const nativeTransfer = tx.nativeTransfers?.[0];

      let from = tx.feePayer;
      let to = tx.feePayer;
      let amount = 0;
      let token = 'SOL';
      let tokenSymbol = 'SOL';

      if (tokenTransfer) {
        from = tokenTransfer.fromUserAccount;
        to = tokenTransfer.toUserAccount;
        amount = tokenTransfer.tokenAmount;
        token = tokenTransfer.mint;
        tokenSymbol = this.getTokenSymbol(tokenTransfer.mint);
      } else if (nativeTransfer) {
        from = nativeTransfer.fromUserAccount;
        to = nativeTransfer.toUserAccount;
        amount = nativeTransfer.amount / 1e9;
        token = 'So11111111111111111111111111111111111111112';
        tokenSymbol = 'SOL';
      }

      return {
        signature: tx.signature,
        timestamp: tx.timestamp,
        type: tx.type,
        from,
        to,
        amount,
        token,
        tokenSymbol,
        fee: tx.fee,
        description: tx.description || '',
        category: this.categorizeTransaction(tx.type),
      };
    });
  },

  categorizeTransaction(txType: string): string {
    const typeMap: { [key: string]: string } = {
      STAKE_SOL: 'staking',
      UNSTAKE_SOL: 'staking',
      ADD_TO_POOL: 'liquidity',
      DEPOSIT_FRACTIONAL_POOL: 'liquidity',
      WITHDRAW: 'liquidity',
      BUY_ITEM: 'trading',
      FILL_ORDER: 'trading',
      TOKEN_MINT: 'trading',
      SWAP: 'trading',
      DEPOSIT: 'fresh_wallet',
      TRANSFER: 'general',
      CLOSE_ITEM: 'general',
    };

    return typeMap[txType] || 'general';
  },

  getTokenSymbol(mint: string): string {
    const knownTokens: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
    };

    return knownTokens[mint] || `${mint.slice(0, 4)}...${mint.slice(-4)}`;
  },

  async getTradingActivity(limit: number = 50): Promise<ParsedTransaction[]> {
    const transactions = await this.getRecentTransactions(limit * 2);
    const parsed = await this.parseTransactions(transactions);
    return parsed.filter((tx) => tx.category === 'trading').slice(0, limit);
  },

  async getStakingActivity(limit: number = 30): Promise<ParsedTransaction[]> {
    const transactions = await this.getRecentTransactions(limit * 2);
    const parsed = await this.parseTransactions(transactions);
    return parsed.filter((tx) => tx.category === 'staking').slice(0, limit);
  },

  async getLiquidityActivity(limit: number = 30): Promise<ParsedTransaction[]> {
    const transactions = await this.getRecentTransactions(limit * 2);
    const parsed = await this.parseTransactions(transactions);
    return parsed.filter((tx) => tx.category === 'liquidity').slice(0, limit);
  },

  async getFreshWallets(limit: number = 20): Promise<ParsedTransaction[]> {
    const transactions = await this.getRecentTransactions(limit * 3);
    const parsed = await this.parseTransactions(transactions);
    return parsed.filter((tx) => tx.category === 'fresh_wallet').slice(0, limit);
  },
};
