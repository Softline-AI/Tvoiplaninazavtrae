import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  token_pnl: string;
  token_pnl_percentage: string;
  current_token_price: string;
  entry_price: string;
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
  timestamp: string;
  blockTime: string;
}

export interface FeedFilters {
  timeRange: '1h' | '24h' | '7d' | '30d' | 'all';
  type: 'all' | 'buy' | 'sell';
  sortBy: 'time' | 'volume';
  tokens?: string[];
  kols?: string[];
  limit: number;
  cursor?: string;
}

export interface FeedResponse {
  success: boolean;
  data: KOLFeedItem[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
  error?: string;
}

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

const getTimeFilter = (timeRange: string): Date | null => {
  if (timeRange === 'all') return null;

  const now = new Date();
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
};

const transformTransaction = (
  tx: any,
  profile: KOLProfile | undefined
): KOLFeedItem | null => {
  if (!profile) return null;

  const txType = ['SWAP', 'BUY'].includes(tx.transaction_type) ? 'buy' : 'sell';
  const amount = parseFloat(tx.amount || '0');

  return {
    id: tx.id,
    lastTx: txType,
    timeAgo: formatTimeAgo(tx.block_time),
    kolName: profile.name,
    kolAvatar: profile.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    walletAddress: tx.from_address,
    twitterHandle: profile.twitter_handle || tx.from_address.substring(0, 8),
    token: tx.token_symbol || 'Unknown',
    tokenContract: tx.token_mint || '',
    bought: txType === 'buy' ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
    sold: txType === 'sell' ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
    holding: txType === 'buy' ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'sold all',
    timestamp: tx.block_time,
    blockTime: tx.block_time
  };
};

export const kolFeedServiceV2 = {
  async getKOLFeed(filters: FeedFilters): Promise<FeedResponse> {
    try {
      const timeFilter = getTimeFilter(filters.timeRange);

      const { data: profiles, error: profilesError } = await supabase
        .from('kol_profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching KOL profiles:', profilesError);
        return { success: false, data: [], hasMore: false, error: profilesError.message };
      }

      if (!profiles || profiles.length === 0) {
        return { success: true, data: [], hasMore: false };
      }

      const profileMap = new Map<string, KOLProfile>();
      profiles.forEach((profile: any) => {
        profileMap.set(profile.wallet_address, profile);
      });

      let walletAddresses = Array.from(profileMap.keys());

      if (filters.kols && filters.kols.length > 0) {
        walletAddresses = walletAddresses.filter(addr =>
          filters.kols!.some(kol => addr.includes(kol))
        );
      }

      let query = supabase
        .from('webhook_transactions')
        .select('*')
        .in('from_address', walletAddresses);

      if (timeFilter) {
        query = query.gte('block_time', timeFilter.toISOString());
      }

      if (filters.cursor) {
        query = query.lt('block_time', filters.cursor);
      }

      if (filters.type !== 'all') {
        const txTypes = filters.type === 'buy' ? ['BUY', 'SWAP'] : ['SELL'];
        query = query.in('transaction_type', txTypes);
      }

      if (filters.tokens && filters.tokens.length > 0) {
        query = query.in('token_symbol', filters.tokens);
      }

      if (filters.sortBy === 'volume') {
        query = query.order('amount', { ascending: false });
      } else {
        query = query.order('block_time', { ascending: false });
      }

      query = query.limit(filters.limit + 1);

      const { data: transactions, error: txError } = await query;

      if (txError) {
        console.error('Error fetching transactions:', txError);
        return { success: false, data: [], hasMore: false, error: txError.message };
      }

      if (!transactions || transactions.length === 0) {
        return { success: true, data: [], hasMore: false };
      }

      const hasMore = transactions.length > filters.limit;
      const dataToProcess = hasMore ? transactions.slice(0, -1) : transactions;

      const feedItems: KOLFeedItem[] = dataToProcess
        .map((tx: any) => {
          const profile = profileMap.get(tx.from_address);
          return transformTransaction(tx, profile);
        })
        .filter((item): item is KOLFeedItem => item !== null);

      const nextCursor = hasMore && feedItems.length > 0
        ? feedItems[feedItems.length - 1].blockTime
        : undefined;

      return {
        success: true,
        data: feedItems,
        nextCursor,
        hasMore
      };
    } catch (error) {
      console.error('Error in getKOLFeed:', error);
      return {
        success: false,
        data: [],
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  subscribeToTransactions(
    callback: (transaction: KOLFeedItem) => void,
    walletAddresses?: string[]
  ): RealtimeChannel {
    const channel = supabase
      .channel('webhook_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_transactions',
          filter: walletAddresses
            ? `from_address=in.(${walletAddresses.join(',')})`
            : undefined
        },
        async (payload) => {
          console.log('New transaction received:', payload);

          const tx = payload.new;

          const { data: profile } = await supabase
            .from('kol_profiles')
            .select('*')
            .eq('wallet_address', tx.from_address)
            .maybeSingle();

          if (profile) {
            const feedItem = transformTransaction(tx, profile);
            if (feedItem) {
              callback(feedItem);
            }
          }
        }
      )
      .subscribe();

    return channel;
  },

  unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  }
};
