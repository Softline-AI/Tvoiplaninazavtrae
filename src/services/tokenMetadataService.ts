import { supabase } from './supabaseClient';

const BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

const DEFAULT_TOKEN_LOGO = 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100';

export const tokenMetadataService = {
  /**
   * Get token logo URL with caching
   */
  async getTokenLogo(tokenMint: string): Promise<string> {
    try {
      // Check cache first
      const cachedMetadata = await this.getCachedMetadata(tokenMint);

      if (cachedMetadata && this.isCacheValid(cachedMetadata.last_updated)) {
        return cachedMetadata.logo_url || DEFAULT_TOKEN_LOGO;
      }

      // Fetch from Birdeye API
      const metadata = await this.fetchFromBirdeye(tokenMint);

      if (metadata) {
        // Save to cache
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
      // Check cache first
      const cachedMetadata = await this.getCachedMetadata(tokenMint);

      if (cachedMetadata && this.isCacheValid(cachedMetadata.last_updated)) {
        return cachedMetadata;
      }

      // Fetch from Birdeye API
      const metadata = await this.fetchFromBirdeye(tokenMint);

      if (metadata) {
        // Save to cache
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
