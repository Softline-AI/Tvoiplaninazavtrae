import { supabase } from './supabaseClient';

interface CachedProfile {
  wallet_address: string;
  name: string;
  twitter_handle: string;
  twitter_avatar: string;
  avatar_url: string;
  [key: string]: any;
}

interface CachedWallet {
  wallet_address: string;
  label: string;
  twitter_handle: string;
  twitter_avatar: string;
}

class ProfileCacheService {
  private profilesCache: Map<string, CachedProfile> | null = null;
  private walletsCache: Map<string, CachedWallet> | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private fetchPromise: Promise<void> | null = null;

  /**
   * Get all cached profiles and wallets
   */
  async getAll(): Promise<{
    profiles: Map<string, CachedProfile>;
    wallets: Map<string, CachedWallet>;
  }> {
    const now = Date.now();
    const isCacheValid = this.profilesCache && this.walletsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION;

    if (isCacheValid) {
      console.log('[ProfileCache] Using cached data');
      return {
        profiles: this.profilesCache!,
        wallets: this.walletsCache!,
      };
    }

    // If a fetch is already in progress, wait for it
    if (this.fetchPromise) {
      console.log('[ProfileCache] Waiting for existing fetch');
      await this.fetchPromise;
      return {
        profiles: this.profilesCache!,
        wallets: this.walletsCache!,
      };
    }

    // Start a new fetch
    console.log('[ProfileCache] Fetching fresh data');
    this.fetchPromise = this.fetchData();

    try {
      await this.fetchPromise;
    } finally {
      this.fetchPromise = null;
    }

    return {
      profiles: this.profilesCache!,
      wallets: this.walletsCache!,
    };
  }

  /**
   * Fetch profiles and wallets from database
   */
  private async fetchData(): Promise<void> {
    const [profilesResult, walletsResult] = await Promise.all([
      supabase
        .from('kol_profiles')
        .select('*'),
      supabase
        .from('monitored_wallets')
        .select('wallet_address, label, twitter_handle, twitter_avatar')
    ]);

    if (profilesResult.error) {
      console.error('[ProfileCache] Error fetching profiles:', profilesResult.error);
      throw profilesResult.error;
    }

    this.profilesCache = new Map();
    profilesResult.data?.forEach((profile: any) => {
      this.profilesCache!.set(profile.wallet_address, profile);
    });

    this.walletsCache = new Map();
    walletsResult.data?.forEach((wallet: any) => {
      this.walletsCache!.set(wallet.wallet_address, wallet);
    });

    this.cacheTimestamp = Date.now();
    console.log(`[ProfileCache] Cached ${this.profilesCache.size} profiles and ${this.walletsCache.size} wallets`);
  }

  /**
   * Get a specific profile
   */
  async getProfile(walletAddress: string): Promise<CachedProfile | null> {
    const { profiles } = await this.getAll();
    return profiles.get(walletAddress) || null;
  }

  /**
   * Get a specific wallet
   */
  async getWallet(walletAddress: string): Promise<CachedWallet | null> {
    const { wallets } = await this.getAll();
    return wallets.get(walletAddress) || null;
  }

  /**
   * Invalidate cache to force refresh on next request
   */
  invalidate(): void {
    this.profilesCache = null;
    this.walletsCache = null;
    this.cacheTimestamp = 0;
    console.log('[ProfileCache] Cache invalidated');
  }

  /**
   * Preload cache
   */
  async preload(): Promise<void> {
    await this.getAll();
  }
}

export const profileCache = new ProfileCacheService();
