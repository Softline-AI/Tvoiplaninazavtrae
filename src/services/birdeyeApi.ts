const BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

interface BirdeyeTokenPrice {
  address: string;
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
  liquidity?: number;
  v24hUSD?: number;
  v24hChangePercent?: number;
}

interface BirdeyeTokenOverview {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string;
  liquidity?: number;
  mc?: number;
  v24hUSD?: number;
  v24hChangePercent?: number;
  trade24h?: number;
}

interface BirdeyeTokenSecurityResponse {
  address: string;
  creationTime: number;
  creatorAddress: string;
  owner: string;
  metaplexUpdateAuthority: string;
  metaplexUpdateAuthorityPercent: number;
  topHoldersPercent: number;
  top10HoldersBalance: number;
  top10HoldersPercent: number;
  top10UserBalance: number;
  top10UserPercent: number;
  lockInfo: string;
  freezeAuthority: string;
  mintAuthority: string;
  totalSupply: number;
}

interface BirdeyeTrendingToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  liquidity: number;
  mc: number;
  price: number;
  v24hUSD: number;
  v24hChangePercent: number;
  trade24h: number;
  buy24h: number;
  sell24h: number;
  rank?: number;
}

class BirdeyeService {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'X-API-KEY': BIRDEYE_API_KEY || '',
      'Accept': 'application/json',
    };
  }

  async getTokenPrice(address: string): Promise<BirdeyeTokenPrice | null> {
    try {
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/defi/price?address=${address}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching token price from Birdeye:', error);
      return null;
    }
  }

  async getMultipleTokenPrices(addresses: string[]): Promise<Record<string, BirdeyeTokenPrice>> {
    try {
      const addressList = addresses.join(',');
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/defi/multi_price?list_address=${addressList}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return {};
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching multiple token prices from Birdeye:', error);
      return {};
    }
  }

  async getTokenOverview(address: string): Promise<BirdeyeTokenOverview | null> {
    try {
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/defi/token_overview?address=${address}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching token overview from Birdeye:', error);
      return null;
    }
  }

  async getTrendingTokens(sortBy: string = 'rank', sortType: string = 'asc', offset: number = 0, limit: number = 50): Promise<BirdeyeTrendingToken[]> {
    try {
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/defi/tokenlist?sort_by=${sortBy}&sort_type=${sortType}&offset=${offset}&limit=${limit}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return [];
      }

      const data = await response.json();
      return data.data?.tokens || [];
    } catch (error) {
      console.error('Error fetching trending tokens from Birdeye:', error);
      return [];
    }
  }

  async getTokenSecurity(address: string): Promise<BirdeyeTokenSecurityResponse | null> {
    try {
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/defi/token_security?address=${address}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching token security from Birdeye:', error);
      return null;
    }
  }

  async getTokenTradeData(address: string, type: '24h' | '4h' | '1h' = '24h'): Promise<any> {
    try {
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/defi/txs/token?address=${address}&tx_type=swap&sort_type=desc&offset=0&limit=50`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching token trade data from Birdeye:', error);
      return null;
    }
  }

  async getWalletTokenBalance(walletAddress: string): Promise<any> {
    try {
      const response = await fetch(
        `${BIRDEYE_BASE_URL}/v1/wallet/token_list?wallet=${walletAddress}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        console.error('Birdeye API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching wallet token balance from Birdeye:', error);
      return null;
    }
  }
}

export const birdeyeService = new BirdeyeService();
export type { BirdeyeTokenPrice, BirdeyeTokenOverview, BirdeyeTrendingToken, BirdeyeTokenSecurityResponse };
