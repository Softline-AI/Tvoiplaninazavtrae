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
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes instead of 30 seconds
  private requestQueue: Promise<any>[] = [];
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 200; // Minimum 200ms between requests

  constructor() {
    this.headers = {
      'X-API-KEY': BIRDEYE_API_KEY || '',
      'Accept': 'application/json',
    };
  }

  private getCacheKey(url: string): string {
    return url;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    await this.throttleRequest();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, { headers: this.headers });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
          const waitTime = Math.min(retryAfter * 1000, 30000); // Max 30 seconds

          console.warn(`[Birdeye] ⚠️ Rate limited (429). Waiting ${waitTime/1000}s before retry ${attempt}/${maxRetries}`);

          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        return response;
      } catch (error) {
        if (attempt === maxRetries) throw error;

        const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(`[Birdeye] ⚠️ Request failed. Retrying in ${backoffTime/1000}s (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    throw new Error('Max retries exceeded');
  }

  async getTokenPrice(address: string): Promise<BirdeyeTokenPrice | null> {
    const startTime = Date.now();
    const url = `${BIRDEYE_BASE_URL}/defi/price?address=${address}`;
    const cacheKey = this.getCacheKey(url);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`[Birdeye] 📦 Using cached price for ${address.slice(0, 8)}`);
      return cached;
    }

    try {
      console.log(`[Birdeye] 🔍 Fetching price for token: ${address.slice(0, 8)}...`);
      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        console.error(`[Birdeye] ❌ API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const duration = Date.now() - startTime;
      console.log(`[Birdeye] ✅ Token price fetched in ${duration}ms:`, data.data?.value);

      if (data.data) {
        this.setCache(cacheKey, data.data);
      }

      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Birdeye] ❌ Error after ${duration}ms:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  async getMultipleTokenPrices(addresses: string[]): Promise<Record<string, BirdeyeTokenPrice>> {
    const startTime = Date.now();
    try {
      const addressList = addresses.join(',');
      const url = `${BIRDEYE_BASE_URL}/defi/multi_price?list_address=${addressList}`;
      const cacheKey = this.getCacheKey(url);

      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`[Birdeye] 📦 Using cached prices for ${addresses.length} tokens`);
        return cached;
      }

      console.log(`[Birdeye] 🔍 Fetching prices for ${addresses.length} tokens...`);
      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        console.error(`[Birdeye] ❌ API error fetching multiple prices: ${response.status}`);
        return {};
      }

      const data = await response.json();
      const prices = data.data || {};
      const duration = Date.now() - startTime;
      console.log(`[Birdeye] ✅ Fetched ${Object.keys(prices).length} token prices in ${duration}ms`);
      this.setCache(cacheKey, prices);
      return prices;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Birdeye] ❌ Error fetching multiple prices after ${duration}ms:`, error);
      return {};
    }
  }

  async getTokenOverview(address: string): Promise<BirdeyeTokenOverview | null> {
    const startTime = Date.now();
    const url = `${BIRDEYE_BASE_URL}/defi/token_overview?address=${address}`;
    const cacheKey = this.getCacheKey(url);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`[Birdeye] 📦 Using cached overview for ${address.slice(0, 8)}`);
      return cached;
    }

    try {
      console.log(`[Birdeye] 🔍 Fetching overview for: ${address.slice(0, 8)}...`);
      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        console.error(`[Birdeye] ❌ API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const duration = Date.now() - startTime;
      console.log(`[Birdeye] ✅ Overview fetched in ${duration}ms`);

      if (data.data) {
        this.setCache(cacheKey, data.data);
      }

      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Birdeye] ❌ Error after ${duration}ms:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  async getTrendingTokens(sortBy: string = 'rank', sortType: string = 'asc', offset: number = 0, limit: number = 50): Promise<BirdeyeTrendingToken[]> {
    const startTime = Date.now();
    try {
      const url = `${BIRDEYE_BASE_URL}/defi/tokenlist?sort_by=${sortBy}&sort_type=${sortType}&offset=${offset}&limit=${limit}`;
      const cacheKey = this.getCacheKey(url);

      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`[Birdeye] 📦 Using cached trending tokens (${cached.length} tokens)`);
        return cached;
      }

      console.log(`[Birdeye] 🔥 Fetching ${limit} trending tokens sorted by ${sortBy}...`);
      const response = await fetch(url, { headers: this.headers });

      if (!response.ok) {
        console.error(`[Birdeye] ❌ API error fetching trending tokens: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const tokens = data.data?.tokens || [];
      const duration = Date.now() - startTime;
      console.log(`[Birdeye] ✅ Fetched ${tokens.length} trending tokens in ${duration}ms`);
      this.setCache(cacheKey, tokens);
      return tokens;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Birdeye] ❌ Error fetching trending tokens after ${duration}ms:`, error);
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
