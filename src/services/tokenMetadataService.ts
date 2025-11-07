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

    try {
      const response = await fetch(
        `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`,
        {
          headers: {
            'X-API-KEY': BIRDEYE_API_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error(`Birdeye API error: ${response.status}`);
        return null;
      }

      const result: BirdeyeTokenResponse = await response.json();

      if (result.success && result.data) {
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
    } catch (error) {
      console.error('Error fetching from Birdeye:', error);
      return null;
    }
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
