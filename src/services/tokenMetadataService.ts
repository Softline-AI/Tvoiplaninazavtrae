import { supabase } from './supabaseClient';
import { apiRequestHandler } from './apiRequestHandler';

const BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const SOLANA_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json';

interface TokenMetadata {
  token_mint: string;
  token_symbol: string | null;
  token_name: string | null;
  logo_url: string | null;
  decimals: number;
  description: string | null;
  last_updated: string;
}

interface BirdeyeTokenResponse {
  success: boolean;
  data: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    description?: string;
  };
}

interface SolanaTokenListToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, any>;
}

interface SolanaTokenList {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: Record<string, any>;
  timestamp: string;
  tokens: SolanaTokenListToken[];
}

const DEFAULT_TOKEN_LOGO = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';

let solanaTokenListCache: SolanaTokenList | null = null;
let solanaTokenListCacheTime: number = 0;
const TOKEN_LIST_CACHE_DURATION = 60 * 60 * 1000;

export const tokenMetadataService = {
  /**
   * Load Solana Token List with caching
   */
  async loadSolanaTokenList(): Promise<SolanaTokenList | null> {
    const now = Date.now();

    if (solanaTokenListCache && (now - solanaTokenListCacheTime) < TOKEN_LIST_CACHE_DURATION) {
      console.log('[TokenList] 📦 Using cached Solana Token List');
      return solanaTokenListCache;
    }

    const tokenList = await apiRequestHandler.request<SolanaTokenList>(
      SOLANA_TOKEN_LIST_URL,
      {},
      { cacheDuration: TOKEN_LIST_CACHE_DURATION, maxRetries: 5, timeout: 60000 }
    );

    if (tokenList) {
      solanaTokenListCache = tokenList;
      solanaTokenListCacheTime = now;
      console.log(`[TokenList] ✅ Loaded ${tokenList.tokens.length} tokens`);
    }

    return tokenList;
  },

  /**
   * Get token metadata from Solana Token List
   */
  async getFromSolanaTokenList(tokenMint: string): Promise<TokenMetadata | null> {
    try {
      const tokenList = await this.loadSolanaTokenList();
      if (!tokenList) return null;

      const token = tokenList.tokens.find(t => t.address === tokenMint);
      if (!token) return null;

      return {
        token_mint: tokenMint,
        token_symbol: token.symbol,
        token_name: token.name,
        logo_url: token.logoURI || null,
        decimals: token.decimals,
        description: null,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting token from Solana Token List:', error);
      return null;
    }
  },

  /**
   * Get token logo URL with caching
   */
  async getTokenLogo(tokenMint: string): Promise<string> {
    try {
      const cachedMetadata = await this.getCachedMetadata(tokenMint);

      if (cachedMetadata && this.isCacheValid(cachedMetadata.last_updated)) {
        return cachedMetadata.logo_url || DEFAULT_TOKEN_LOGO;
      }

      let metadata = await this.getFromSolanaTokenList(tokenMint);

      if (!metadata && BIRDEYE_API_KEY) {
        metadata = await this.fetchFromBirdeye(tokenMint);
      }

      if (metadata) {
        await this.saveMetadata(metadata);
        return metadata.logo_url || DEFAULT_TOKEN_LOGO;
      }

      return DEFAULT_TOKEN_LOGO;
    } catch (error) {
      console.error(`Error fetching token logo for ${tokenMint}:`, error);
      return DEFAULT_TOKEN_LOGO;
    }
  },

  /**
   * Get full token metadata with caching
   */
  async getTokenMetadata(tokenMint: string): Promise<TokenMetadata | null> {
    try {
      const cachedMetadata = await this.getCachedMetadata(tokenMint);

      if (cachedMetadata && this.isCacheValid(cachedMetadata.last_updated)) {
        return cachedMetadata;
      }

      let metadata = await this.getFromSolanaTokenList(tokenMint);

      if (!metadata && BIRDEYE_API_KEY) {
        metadata = await this.fetchFromBirdeye(tokenMint);
      }

      if (metadata) {
        await this.saveMetadata(metadata);
        return metadata;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching token metadata for ${tokenMint}:`, error);
      return null;
    }
  },

  /**
   * Get cached metadata from Supabase
   */
  async getCachedMetadata(tokenMint: string): Promise<TokenMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('token_mint', tokenMint)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cached metadata:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCachedMetadata:', error);
      return null;
    }
  },

  /**
   * Check if cache is still valid
   */
  isCacheValid(lastUpdated: string): boolean {
    const now = new Date().getTime();
    const updated = new Date(lastUpdated).getTime();
    return (now - updated) < CACHE_DURATION;
  },

  /**
   * Fetch token metadata from Birdeye API
   */
  async fetchFromBirdeye(tokenMint: string): Promise<TokenMetadata | null> {
    if (!BIRDEYE_API_KEY) {
      console.warn('Birdeye API key not configured');
      return null;
    }

    const result = await apiRequestHandler.request<BirdeyeTokenResponse>(
      `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
        },
      },
      { cacheDuration: CACHE_DURATION, maxRetries: 3 }
    );

    if (result?.success && result.data) {
      return {
        token_mint: tokenMint,
        token_symbol: result.data.symbol || null,
        token_name: result.data.name || null,
        logo_url: result.data.logoURI || null,
        decimals: result.data.decimals || 0,
        description: result.data.description || null,
        last_updated: new Date().toISOString(),
      };
    }

    return null;
  },

  /**
   * Save metadata to Supabase cache
   */
  async saveMetadata(metadata: TokenMetadata): Promise<void> {
    try {
      const { error } = await supabase
        .from('token_metadata')
        .upsert({
          token_mint: metadata.token_mint,
          token_symbol: metadata.token_symbol,
          token_name: metadata.token_name,
          logo_url: metadata.logo_url,
          decimals: metadata.decimals,
          description: metadata.description,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'token_mint',
        });

      if (error) {
        console.error('Error saving metadata:', error);
      }
    } catch (error) {
      console.error('Error in saveMetadata:', error);
    }
  },

  /**
   * Batch fetch multiple token logos with parallel processing
   */
  async getBatchTokenLogos(tokenMints: string[]): Promise<Record<string, string>> {
    const logos: Record<string, string> = {};

    try {
      const { data: cachedData } = await supabase
        .from('token_metadata')
        .select('token_mint, logo_url, last_updated')
        .in('token_mint', tokenMints);

      const cachedMap = new Map<string, { logo_url: string | null; last_updated: string }>();
      cachedData?.forEach(item => {
        cachedMap.set(item.token_mint, { logo_url: item.logo_url, last_updated: item.last_updated });
      });

      const mintsToFetch: string[] = [];

      tokenMints.forEach(mint => {
        const cached = cachedMap.get(mint);
        if (cached && this.isCacheValid(cached.last_updated)) {
          logos[mint] = cached.logo_url || DEFAULT_TOKEN_LOGO;
        } else {
          mintsToFetch.push(mint);
        }
      });

      if (mintsToFetch.length > 0) {
        const batchSize = 15;
        for (let i = 0; i < mintsToFetch.length; i += batchSize) {
          const batch = mintsToFetch.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map(async (mint) => {
              const logo = await this.getTokenLogo(mint);
              return { mint, logo };
            })
          );

          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              logos[result.value.mint] = result.value.logo;
            } else {
              logos[result.value as any] = DEFAULT_TOKEN_LOGO;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in getBatchTokenLogos:', error);
      tokenMints.forEach(mint => {
        if (!logos[mint]) {
          logos[mint] = DEFAULT_TOKEN_LOGO;
        }
      });
    }

    return logos;
  },

  /**
   * Prefetch and cache token metadata for multiple tokens
   */
  async prefetchMetadata(tokenMints: string[]): Promise<void> {
    const batchSize = 10;
    for (let i = 0; i < tokenMints.length; i += batchSize) {
      const batch = tokenMints.slice(i, i + batchSize);
      const promises = batch.map((mint) => this.getTokenMetadata(mint));
      await Promise.all(promises);
    }
  },
};
