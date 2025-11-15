import { supabase } from './supabaseClient';

export interface KOLProfile {
  id: string;
  name: string;
  wallet_address: string;
  twitter_handle: string;
  avatar_url: string;
  total_pnl: string;
  win_rate: string;
  total_trades: number;
  total_volume: string;
}

export interface KOLTransaction {
  id: string;
  transaction_signature: string;
  block_time: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_mint: string;
  token_symbol: string;
  transaction_type: string;
  fee: string;
}

export interface KOLFeedItem {
  id: string;
  lastTx: 'buy' | 'sell';
  timeAgo: string;
  kolName: string;
  kolAvatar: string;
  walletAddress: string;
  twitterHandle: string;
  token: string;
  tokenContract: string;
  bought: string;
  sold: string;
  holding: string;
  pnl: string;
  pnlPercentage: string;
  timestamp: string;
}

// In-memory cache for KOL profiles and wallets
let cachedProfiles: Map<string, KOLProfile> | null = null;
let cachedWallets: Map<string, any> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const txTime = new Date(timestamp);
  const diffMs = now.getTime() - txTime.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

export const kolFeedService = {
  async getKOLFeed(params: {
    timeRange: '1h' | '24h' | '7d' | '30d';
    type: 'all' | 'buy' | 'sell';
    sortBy: 'time' | 'pnl' | 'volume';
    limit: number;
    page?: number;
  }): Promise<{ success: boolean; data: KOLFeedItem[]; error?: string; hasMore?: boolean; total?: number }> {
    try {
      // Calculate time filter
      const now = new Date();
      let timeFilter: Date;
      switch (params.timeRange) {
        case '1h':
          timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Check cache validity
      const now = Date.now();
      const isCacheValid = cachedProfiles && cachedWallets && (now - cacheTimestamp) < CACHE_DURATION;

      let walletMap: Map<string, any>;
      let profiles: any[];

      if (isCacheValid) {
        console.log('[KOL Feed] Using cached profiles');
        walletMap = cachedWallets!;
        profiles = Array.from(cachedProfiles!.values());
      } else {
        console.log('[KOL Feed] Fetching fresh profiles');
        // Fetch wallets and profiles in parallel
        const [walletsResult, profilesResult] = await Promise.all([
          supabase
            .from('monitored_wallets')
            .select('wallet_address, label, twitter_handle, twitter_avatar'),
          supabase
            .from('kol_profiles')
            .select('*')
        ]);

        if (profilesResult.error) {
          console.error('Error fetching KOL profiles:', profilesResult.error);
          return { success: false, data: [], error: profilesResult.error.message };
        }

        walletMap = new Map();
        walletsResult.data?.forEach((wallet: any) => {
          walletMap.set(wallet.wallet_address, wallet);
        });

        profiles = profilesResult.data || [];

        // Update cache
        cachedWallets = walletMap;
        cachedProfiles = new Map();
        profiles.forEach((profile: any) => {
          cachedProfiles!.set(profile.wallet_address, profile);
        });
        cacheTimestamp = now;
      }

      if (!profiles || profiles.length === 0) {
        return { success: true, data: [] };
      }

      // Create a map of profiles by wallet address
      const profileMap = new Map<string, KOLProfile>();
      profiles.forEach((profile: any) => {
        profileMap.set(profile.wallet_address, profile);
      });

      // Get wallet addresses
      const walletAddresses = Array.from(profileMap.keys());

      // Calculate pagination
      const page = params.page || 1;
      const offset = (page - 1) * params.limit;

      // Build transaction query with filters
      let txQuery = supabase
        .from('webhook_transactions')
        .select('*')
        .in('from_address', walletAddresses)
        .gte('block_time', timeFilter.toISOString())
        .neq('token_symbol', 'UNKNOWN');

      // Add type filter at database level if specified
      if (params.type === 'buy') {
        txQuery = txQuery.in('transaction_type', ['BUY', 'SWAP']);
      } else if (params.type === 'sell') {
        txQuery = txQuery.eq('transaction_type', 'SELL');
      } else {
        txQuery = txQuery.in('transaction_type', ['BUY', 'SELL', 'SWAP']);
      }

      // Fetch transactions with pagination
      const { data: transactions, error: txError } = await txQuery
        .order('block_time', { ascending: false })
        .range(offset, offset + params.limit - 1);

      if (txError) {
        console.error('Error fetching transactions:', txError);
        return { success: false, data: [], error: txError.message };
      }

      if (!transactions || transactions.length === 0) {
        return { success: true, data: [] };
      }

      // Transform transactions to KOLFeedItems
      const feedItems: KOLFeedItem[] = transactions
        .map((tx: any) => {
          const profile = profileMap.get(tx.from_address);
          if (!profile) return null;

          const wallet = walletMap.get(tx.from_address);
          const avatarUrl = wallet?.twitter_avatar || profile.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg';

          const txType = ['SWAP', 'BUY'].includes(tx.transaction_type) ? 'buy' : 'sell';

          const amount = parseFloat(tx.amount || '0');
          const tokenPnl = parseFloat(tx.token_pnl || '0');
          const tokenPnlPercentage = parseFloat(tx.token_pnl_percentage || '0');

          return {
            id: tx.id,
            lastTx: txType,
            timeAgo: formatTimeAgo(tx.block_time),
            kolName: profile.name,
            kolAvatar: avatarUrl,
            walletAddress: tx.from_address,
            twitterHandle: profile.twitter_handle || tx.from_address.substring(0, 8),
            token: tx.token_symbol || 'Unknown',
            tokenContract: tx.token_mint || '',
            bought: txType === 'buy' ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
            sold: txType === 'sell' ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
            holding: txType === 'buy' ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'sold all',
            pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            pnlPercentage: `${tokenPnlPercentage >= 0 ? '+' : ''}${tokenPnlPercentage.toFixed(2)}%`,
            timestamp: tx.block_time
          };
        })
        .filter((item): item is KOLFeedItem => item !== null);

      // Sort the results
      if (params.sortBy === 'pnl') {
        feedItems.sort((a, b) => {
          const pnlA = parseFloat(a.pnl.replace(/[^0-9.-]/g, ''));
          const pnlB = parseFloat(b.pnl.replace(/[^0-9.-]/g, ''));
          return pnlB - pnlA;
        });
      } else if (params.sortBy === 'volume') {
        feedItems.sort((a, b) => {
          const volA = parseFloat(a.bought.replace(/[^0-9.-]/g, '')) + parseFloat(a.sold.replace(/[^0-9.-]/g, ''));
          const volB = parseFloat(b.bought.replace(/[^0-9.-]/g, '')) + parseFloat(b.sold.replace(/[^0-9.-]/g, ''));
          return volB - volA;
        });
      }
      // 'time' is already sorted by default

      // Simple hasMore detection: if we got full page, there might be more
      const hasMore = transactions.length === params.limit;

      return {
        success: true,
        data: feedItems,
        hasMore,
        total
      };
    } catch (error) {
      console.error('Error in getKOLFeed:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
