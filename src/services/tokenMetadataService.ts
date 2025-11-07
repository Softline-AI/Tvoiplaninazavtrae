import { supabase } from './supabaseClient';

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
      return solanaTokenListCache;
    }

    try {
      const response = await fetch(SOLANA_TOKEN_LIST_URL);
      if (!response.ok) {
        console.error('Failed to fetch Solana Token List');
        return null;
      }

      const tokenList: SolanaTokenList = await response.json();
      solanaTokenListCache = tokenList;
      solanaTokenListCacheTime = now;

      return tokenList;
    } catch (error) {
      console.error('Error loading Solana Token List:', error);
      return null;
    }
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
      const { data, error, status, statusText } = await supabase
        .from('token_metadata')
        .select('*')
        .eq('token_mint', tokenMint)
        .maybeSingle();

      if (error) {
        console.error(`[TokenMetadata] ❌ Error fetching cached metadata for ${tokenMint.slice(0, 8)}:`, {
          status,
          statusText,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      // Removed verbose cache hit logs to reduce console spam

      return data;
    } catch (error) {
      console.error(`[TokenMetadata] ❌ Unexpected error in getCachedMetadata:`, error);
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
      console.warn('[TokenMetadata] ⚠️ Birdeye API key not configured');
      return null;
    }

    const startTime = Date.now();

    try {
      console.log(`[TokenMetadata] 🔍 Fetching from Birdeye: ${tokenMint.slice(0, 8)}...`);

      const response = await fetch(
        `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`,
        {
          headers: {
            'X-API-KEY': BIRDEYE_API_KEY,
          },
        }
      );

      const duration = Date.now() - startTime;

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        console.error(`[TokenMetadata] ⚠️ Rate limited (429). Retry after: ${retryAfter}s`);
        return null;
      }

      if (!response.ok) {
        console.error(`[TokenMetadata] ❌ Birdeye API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const result: BirdeyeTokenResponse = await response.json();

      if (result.success && result.data) {
        console.log(`[TokenMetadata] ✅ Fetched from Birdeye in ${duration}ms: ${result.data.symbol}`);

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

      console.warn(`[TokenMetadata] ⚠️ Birdeye returned unsuccessful response in ${duration}ms`);
      return null;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[TokenMetadata] ❌ Error fetching from Birdeye after ${duration}ms:`, error instanceof Error ? error.message : error);
      return null;
    }
  },

  /**
   * Save metadata to Supabase cache
   */
  async saveMetadata(metadata: TokenMetadata): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`[TokenMetadata] 💾 Saving to cache: ${metadata.token_symbol || metadata.token_mint.slice(0, 8)}`);

      const { error, status, statusText } = await supabase
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

      const duration = Date.now() - startTime;

      if (error) {
        console.error(`[TokenMetadata] ❌ Error saving metadata after ${duration}ms:`, {
          status,
          statusText,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log(`[TokenMetadata] ✅ Cached in ${duration}ms`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[TokenMetadata] ❌ Unexpected error in saveMetadata after ${duration}ms:`, error);
    }
  },

  /**
   * Batch fetch multiple token logos
   */
  async getBatchTokenLogos(tokenMints: string[]): Promise<Record<string, string>> {
    const logos: Record<string, string> = {};

    // Fetch all in parallel
    const promises = tokenMints.map(async (mint) => {
      const logo = await this.getTokenLogo(mint);
      logos[mint] = logo;
    });

    await Promise.all(promises);

    return logos;
  },

  /**
   * Prefetch and cache token metadata for multiple tokens
   */
  async prefetchMetadata(tokenMints: string[]): Promise<void> {
    const promises = tokenMints.map((mint) => this.getTokenMetadata(mint));
    await Promise.all(promises);
  },
};
