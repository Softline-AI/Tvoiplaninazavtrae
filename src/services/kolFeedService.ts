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
  }): Promise<{ success: boolean; data: KOLFeedItem[]; error?: string }> {
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

      // Fetch KOL profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('kol_profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching KOL profiles:', profilesError);
        return { success: false, data: [], error: profilesError.message };
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

      // Fetch transactions for KOL wallets
      const { data: transactions, error: txError } = await supabase
        .from('webhook_transactions')
        .select('*')
        .in('from_address', walletAddresses)
        .gte('block_time', timeFilter.toISOString())
        .order('block_time', { ascending: false })
        .limit(params.limit * 2);

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

          const txType = ['SWAP', 'BUY'].includes(tx.transaction_type) ? 'buy' : 'sell';

          // Filter by type if needed
          if (params.type !== 'all' && txType !== params.type) {
            return null;
          }

          const amount = parseFloat(tx.amount || '0');
          const totalPnl = parseFloat(profile.total_pnl || '0');
          const winRate = parseFloat(profile.win_rate || '0');

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
            pnl: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            pnlPercentage: `${winRate >= 0 ? '+' : ''}${winRate.toFixed(2)}%`,
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

      // Limit results
      const limitedItems = feedItems.slice(0, params.limit);

      return {
        success: true,
        data: limitedItems
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
