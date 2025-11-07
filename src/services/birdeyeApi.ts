import { apiRequestHandler } from './apiRequestHandler';

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
    const url = `${BIRDEYE_BASE_URL}/defi/price?address=${address}`;
    const result = await apiRequestHandler.request<{ data: BirdeyeTokenPrice }>(
      url,
      { headers: this.headers },
      { cacheDuration: 30000, maxRetries: 3 }
    );
    return result?.data || null;
  }

  async getMultipleTokenPrices(addresses: string[]): Promise<Record<string, BirdeyeTokenPrice>> {
    const addressList = addresses.join(',');
    const url = `${BIRDEYE_BASE_URL}/defi/multi_price?list_address=${addressList}`;
    const result = await apiRequestHandler.request<{ data: Record<string, BirdeyeTokenPrice> }>(
      url,
      { headers: this.headers },
      { cacheDuration: 30000, maxRetries: 3 }
    );
    return result?.data || {};
  }

  async getTokenOverview(address: string): Promise<BirdeyeTokenOverview | null> {
    const url = `${BIRDEYE_BASE_URL}/defi/token_overview?address=${address}`;
    const result = await apiRequestHandler.request<{ data: BirdeyeTokenOverview }>(
      url,
      { headers: this.headers },
      { cacheDuration: 300000, maxRetries: 3 }
    );
    return result?.data || null;
  }

  async getTrendingTokens(sortBy: string = 'rank', sortType: string = 'asc', offset: number = 0, limit: number = 50): Promise<BirdeyeTrendingToken[]> {
    const url = `${BIRDEYE_BASE_URL}/defi/tokenlist?sort_by=${sortBy}&sort_type=${sortType}&offset=${offset}&limit=${limit}`;
    const result = await apiRequestHandler.request<{ data: { tokens: BirdeyeTrendingToken[] } }>(
      url,
      { headers: this.headers },
      { cacheDuration: 60000, maxRetries: 3 }
    );
    return result?.data?.tokens || [];
  }

  async getTokenSecurity(address: string): Promise<BirdeyeTokenSecurityResponse | null> {
    const url = `${BIRDEYE_BASE_URL}/defi/token_security?address=${address}`;
    const result = await apiRequestHandler.request<{ data: BirdeyeTokenSecurityResponse }>(
      url,
      { headers: this.headers },
      { cacheDuration: 600000, maxRetries: 3 }
    );
    return result?.data || null;
  }

  async getTokenTradeData(address: string, type: '24h' | '4h' | '1h' = '24h'): Promise<any> {
    const url = `${BIRDEYE_BASE_URL}/defi/txs/token?address=${address}&tx_type=swap&sort_type=desc&offset=0&limit=50`;
    const result = await apiRequestHandler.request<{ data: any }>(
      url,
      { headers: this.headers },
      { cacheDuration: 60000, maxRetries: 3 }
    );
    return result?.data || null;
  }

  async getWalletTokenBalance(walletAddress: string): Promise<any> {
    const url = `${BIRDEYE_BASE_URL}/v1/wallet/token_list?wallet=${walletAddress}`;
    const result = await apiRequestHandler.request<{ data: any }>(
      url,
      { headers: this.headers },
      { cacheDuration: 60000, maxRetries: 3 }
    );
    return result?.data || null;
  }
}

export const birdeyeService = new BirdeyeService();
export type { BirdeyeTokenPrice, BirdeyeTokenOverview, BirdeyeTrendingToken, BirdeyeTokenSecurityResponse };
