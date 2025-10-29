import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign, Target, Percent, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface KOLProfile {
  wallet_address: string;
  name: string;
  avatar_url: string;
  twitter_handle: string;
  twitter_followers: number;
  total_pnl: number;
  total_trades: number;
  total_volume: number;
  win_rate: number;
  profitable_trades: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  block_time: string;
  token_symbol: string;
  token_mint: string;
  amount: number;
  token_pnl: number;
  token_pnl_percentage: number;
  current_token_price: number;
  signature: string;
}

interface TokenStats {
  symbol: string;
  mint: string;
  trades: number;
  totalPnl: number;
  totalVolume: number;
  avgPnl: number;
  winRate: number;
}

type SortField = 'block_time' | 'token_pnl' | 'amount' | 'token_symbol';
type SortDirection = 'asc' | 'desc';

const KOLProfile: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<KOLProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'tokens'>('transactions');
  const [sortField, setSortField] = useState<SortField>('block_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (walletAddress) {
      loadProfile();
    }
  }, [walletAddress]);

  const loadProfile = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('kol_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      const { data: txData, error: txError } = await supabase
        .from('webhook_transactions')
        .select('*')
        .eq('from_address', walletAddress)
        .order('block_time', { ascending: false })
        .limit(100);

      if (txError) {
        console.error('Error loading transactions:', txError);
      }

      const transactions = txData || [];

      const totalPnl = transactions.reduce((sum, tx) => sum + parseFloat(tx.token_pnl || '0'), 0);
      const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
      const profitableTrades = transactions.filter(tx => parseFloat(tx.token_pnl || '0') > 0).length;
      const winRate = transactions.length > 0 ? (profitableTrades / transactions.length) * 100 : 0;

      const profile: KOLProfile = {
        wallet_address: walletAddress,
        name: profileData?.name || walletAddress.substring(0, 8),
        avatar_url: profileData?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        twitter_handle: profileData?.twitter_handle || '',
        twitter_followers: profileData?.twitter_followers || 0,
        total_pnl: totalPnl,
        total_trades: transactions.length,
        total_volume: totalVolume,
        win_rate: winRate,
        profitable_trades: profitableTrades
      };

      setProfile(profile);
      setTransactions(transactions);

      const tokenMap = new Map<string, {
        trades: number;
        totalPnl: number;
        totalVolume: number;
        profitableTrades: number;
        mint: string;
      }>();

      transactions.forEach((tx: any) => {
        const symbol = tx.token_symbol || 'Unknown';
        if (!tokenMap.has(symbol)) {
          tokenMap.set(symbol, {
            trades: 0,
            totalPnl: 0,
            totalVolume: 0,
            profitableTrades: 0,
            mint: tx.token_mint || ''
          });
        }
        const stats = tokenMap.get(symbol)!;
        stats.trades++;
        const pnl = parseFloat(tx.token_pnl || '0');
        stats.totalPnl += pnl;
        stats.totalVolume += parseFloat(tx.amount || '0');
        if (pnl > 0) stats.profitableTrades++;
      });

      const tokenStatsArray: TokenStats[] = Array.from(tokenMap.entries()).map(([symbol, stats]) => ({
        symbol,
        mint: stats.mint,
        trades: stats.trades,
        totalPnl: stats.totalPnl,
        totalVolume: stats.totalVolume,
        avgPnl: stats.totalPnl / stats.trades,
        winRate: (stats.profitableTrades / stats.trades) * 100
      }));

      tokenStatsArray.sort((a, b) => b.totalPnl - a.totalPnl);
      setTokenStats(tokenStatsArray);

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10l5 5 5-5" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 14l5-5 5 5" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 10l5 5 5-5" />
      </svg>
    );
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'block_time':
        comparison = new Date(a.block_time).getTime() - new Date(b.block_time).getTime();
        break;
      case 'token_pnl':
        comparison = parseFloat(a.token_pnl?.toString() || '0') - parseFloat(b.token_pnl?.toString() || '0');
        break;
      case 'amount':
        comparison = parseFloat(a.amount?.toString() || '0') - parseFloat(b.amount?.toString() || '0');
        break;
      case 'token_symbol':
        comparison = (a.token_symbol || '').localeCompare(b.token_symbol || '');
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffMs = now.getTime() - txTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center">
        <p className="text-white/70">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/app/kol-feed')}
          className="mb-6 text-white/60 hover:text-white transition-colors text-sm"
        >
          ← Back to KOL Feed
        </button>

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-6">
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-24 h-24 rounded-full border-2 border-white/20 object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm mb-3 inline-block"
                >
                  @{profile.twitter_handle.replace('@', '')}
                  {profile.twitter_followers > 0 && ` • ${(profile.twitter_followers / 1000).toFixed(1)}K followers`}
                </a>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-white/50">{profile.wallet_address}</span>
                <button
                  onClick={() => copyToClipboard(profile.wallet_address)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://solscan.io/account/${profile.wallet_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-white/50">Total P&L</span>
            </div>
            <p className={`text-2xl font-bold ${profile.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profile.total_pnl >= 0 ? '+' : ''}{formatCurrency(profile.total_pnl)}
            </p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-white/50">Total Trades</span>
            </div>
            <p className="text-2xl font-bold text-white">{profile.total_trades}</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-white/50">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{profile.win_rate.toFixed(1)}%</p>
            <p className="text-xs text-white/50 mt-1">
              {profile.profitable_trades} / {profile.total_trades} profitable
            </p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-white/50">Total Volume</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(profile.total_volume)}</p>
          </div>
        </div>

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden">
          <div className="border-b border-white/10">
            <div className="flex gap-4 px-6 py-4">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-white text-noir-black'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Transactions ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'tokens'
                    ? 'bg-white text-noir-black'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Tokens ({tokenStats.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'transactions' ? (
              <table className="min-w-full">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('block_time')}
                    >
                      <div className="flex items-center gap-1.5">
                        Time
                        {getSortIcon('block_time')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('token_symbol')}
                    >
                      <div className="flex items-center gap-1.5">
                        Token
                        {getSortIcon('token_symbol')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-1.5">
                        Amount
                        {getSortIcon('amount')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('token_pnl')}
                    >
                      <div className="flex items-center gap-1.5">
                        P&L
                        {getSortIcon('token_pnl')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      P&L %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-bold uppercase ${
                            ['BUY', 'SWAP'].includes(tx.transaction_type) ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-white/50">{formatTimeAgo(tx.block_time)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">{tx.token_symbol || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white/80">
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            tx.token_pnl >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {tx.token_pnl >= 0 ? '+' : ''}{formatCurrency(tx.token_pnl)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            tx.token_pnl_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {tx.token_pnl_percentage >= 0 ? '+' : ''}{tx.token_pnl_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white inline-block"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Trades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Total P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Avg P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Win Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tokenStats.map((token, index) => (
                    <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-white">{token.symbol}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white/80">{token.trades}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            token.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {token.totalPnl >= 0 ? '+' : ''}{formatCurrency(token.totalPnl)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            token.avgPnl >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {token.avgPnl >= 0 ? '+' : ''}{formatCurrency(token.avgPnl)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white/80">{token.winRate.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white/80">{formatCurrency(token.totalVolume)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`https://birdeye.so/token/${token.mint}?chain=solana`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white inline-block"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLProfile;
