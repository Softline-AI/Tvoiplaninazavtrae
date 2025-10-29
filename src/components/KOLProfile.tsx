import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign,
  Target, Percent, Wallet, Award, BarChart3, Clock, ArrowUpRight,
  ArrowDownRight, Zap, TrendingDown as TrendingDownIcon, Star
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface KOLProfile {
  wallet_address: string;
  name: string;
  avatar_url: string;
  twitter_handle: string;
  twitter_followers: number;
  total_pnl: number;
  total_pnl_sol: number;
  total_trades: number;
  total_volume: number;
  win_rate: number;
  profitable_trades: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
  avg_hold_time_hours: number;
  last_active: string;
  total_bought: number;
  total_sold: number;
  portfolio_value: number;
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
  bestTrade: number;
  worstTrade: number;
  lastTradeTime: string;
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
  const [activeTab, setActiveTab] = useState<'transactions' | 'tokens' | 'analytics'>('analytics');
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
        .limit(200);

      if (txError) {
        console.error('Error loading transactions:', txError);
      }

      const transactions = txData || [];

      const totalPnl = transactions.reduce((sum, tx) => sum + parseFloat(tx.token_pnl || '0'), 0);
      const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
      const profitableTrades = transactions.filter(tx => parseFloat(tx.token_pnl || '0') > 0).length;
      const winRate = transactions.length > 0 ? (profitableTrades / transactions.length) * 100 : 0;

      const pnlValues = transactions.map(tx => parseFloat(tx.token_pnl || '0'));
      const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
      const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

      const buyTxs = transactions.filter(tx => tx.transaction_type === 'BUY');
      const sellTxs = transactions.filter(tx => tx.transaction_type === 'SELL');
      const totalBought = buyTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
      const totalSold = sellTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

      let avgHoldTime = 0;
      if (transactions.length > 1) {
        const times = transactions.map(tx => new Date(tx.block_time).getTime());
        const timeDiffs = times.slice(0, -1).map((time, i) => time - times[i + 1]);
        avgHoldTime = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length / (1000 * 60 * 60);
      }

      const totalPnlSol = totalPnl / 150;

      const profile: KOLProfile = {
        wallet_address: walletAddress,
        name: profileData?.name || walletAddress.substring(0, 8),
        avatar_url: profileData?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        twitter_handle: profileData?.twitter_handle || '',
        twitter_followers: profileData?.twitter_followers || 0,
        total_pnl: totalPnl,
        total_pnl_sol: totalPnlSol,
        total_trades: transactions.length,
        total_volume: totalVolume,
        win_rate: winRate,
        profitable_trades: profitableTrades,
        best_trade_pnl: bestTrade,
        worst_trade_pnl: worstTrade,
        avg_hold_time_hours: avgHoldTime,
        last_active: transactions.length > 0 ? transactions[0].block_time : new Date().toISOString(),
        total_bought: totalBought,
        total_sold: totalSold,
        portfolio_value: totalBought - totalSold + totalPnl
      };

      setProfile(profile);
      setTransactions(transactions);

      const tokenMap = new Map<string, {
        trades: number;
        totalPnl: number;
        totalVolume: number;
        profitableTrades: number;
        mint: string;
        bestTrade: number;
        worstTrade: number;
        lastTradeTime: string;
      }>();

      transactions.forEach((tx: any) => {
        const symbol = tx.token_symbol || 'Unknown';
        if (!tokenMap.has(symbol)) {
          tokenMap.set(symbol, {
            trades: 0,
            totalPnl: 0,
            totalVolume: 0,
            profitableTrades: 0,
            mint: tx.token_mint || '',
            bestTrade: -Infinity,
            worstTrade: Infinity,
            lastTradeTime: tx.block_time
          });
        }
        const stats = tokenMap.get(symbol)!;
        stats.trades++;
        const pnl = parseFloat(tx.token_pnl || '0');
        stats.totalPnl += pnl;
        stats.totalVolume += parseFloat(tx.amount || '0');
        if (pnl > 0) stats.profitableTrades++;
        if (pnl > stats.bestTrade) stats.bestTrade = pnl;
        if (pnl < stats.worstTrade) stats.worstTrade = pnl;
        if (new Date(tx.block_time) > new Date(stats.lastTradeTime)) {
          stats.lastTradeTime = tx.block_time;
        }
      });

      const tokenStatsArray: TokenStats[] = Array.from(tokenMap.entries()).map(([symbol, stats]) => ({
        symbol,
        mint: stats.mint,
        trades: stats.trades,
        totalPnl: stats.totalPnl,
        totalVolume: stats.totalVolume,
        avgPnl: stats.totalPnl / stats.trades,
        winRate: (stats.profitableTrades / stats.trades) * 100,
        bestTrade: stats.bestTrade === -Infinity ? 0 : stats.bestTrade,
        worstTrade: stats.worstTrade === Infinity ? 0 : stats.worstTrade,
        lastTradeTime: stats.lastTradeTime
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

  const formatSol = (value: number): string => {
    return `${value.toFixed(2)} SOL`;
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <p className="text-white/70 text-sm">Loading trader profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 text-lg mb-4">Profile not found</p>
          <button
            onClick={() => navigate('/app/kol-feed')}
            className="px-4 py-2 bg-white text-noir-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Back to KOL Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/app/kol-feed')}
          className="mb-6 text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          ← Back to KOL Feed
        </button>

        <div className="relative bg-gradient-to-br from-noir-dark/60 to-noir-dark/40 border border-white/10 rounded-2xl p-8 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-28 h-28 rounded-2xl border-2 border-white/20 object-cover shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-noir-dark flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-500">Top Trader</span>
                </div>
              </div>

              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-base mb-4 inline-flex items-center gap-2 transition-colors"
                >
                  @{profile.twitter_handle.replace('@', '')}
                  {profile.twitter_followers > 0 && (
                    <span className="text-white/50">
                      • {(profile.twitter_followers / 1000).toFixed(1)}K followers
                    </span>
                  )}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <Wallet className="w-4 h-4 text-white/50" />
                  <span className="text-sm text-white/70 font-mono">{profile.wallet_address.substring(0, 12)}...{profile.wallet_address.slice(-8)}</span>
                  <button
                    onClick={() => copyToClipboard(profile.wallet_address)}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <a
                  href={`https://solscan.io/account/${profile.wallet_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white text-sm flex items-center gap-2"
                >
                  View on Solscan
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-sm text-white/70">Last active: {formatTimeAgo(profile.last_active)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-sm text-white/50 mb-1">Total P&L</div>
                <div className={`text-3xl font-bold ${profile.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profile.total_pnl >= 0 ? '+' : ''}{formatCurrency(profile.total_pnl)}
                </div>
                <div className={`text-sm ${profile.total_pnl_sol >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                  {profile.total_pnl_sol >= 0 ? '+' : ''}{formatSol(profile.total_pnl_sol)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Win Rate</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile.win_rate.toFixed(1)}%</p>
            <p className="text-xs text-white/50">
              {profile.profitable_trades} / {profile.total_trades} profitable
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Total Trades</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile.total_trades}</p>
            <p className="text-xs text-white/50">Volume: {formatCurrency(profile.total_volume)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Avg Hold Time</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile.avg_hold_time_hours.toFixed(1)}h</p>
            <p className="text-xs text-white/50">Average holding period</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Award className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Best Trade</span>
            </div>
            <p className="text-3xl font-bold text-green-500 mb-1">+{formatCurrency(profile.best_trade_pnl)}</p>
            <p className="text-xs text-red-500">Worst: {formatCurrency(profile.worst_trade_pnl)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-white/50">Total Bought</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(profile.total_bought)}</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-sm text-white/50">Total Sold</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(profile.total_sold)}</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm text-white/50">Portfolio Value</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(profile.portfolio_value)}</p>
          </div>
        </div>

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden">
          <div className="border-b border-white/10 bg-black/20">
            <div className="flex gap-2 px-6 py-4">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                💼 Transactions ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'tokens'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                🪙 Top Tokens ({tokenStats.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Top 5 Profitable Tokens
                    </h3>
                    <div className="space-y-3">
                      {tokenStats.slice(0, 5).map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{token.symbol}</div>
                              <div className="text-xs text-white/50">{token.trades} trades</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${token.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.totalPnl >= 0 ? '+' : ''}{formatCurrency(token.totalPnl)}
                            </div>
                            <div className="text-xs text-white/50">{token.winRate.toFixed(0)}% WR</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {sortedTransactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-bold ${
                              tx.transaction_type === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {tx.transaction_type}
                            </div>
                            <div>
                              <div className="font-medium text-white">{tx.token_symbol}</div>
                              <div className="text-xs text-white/50">{formatTimeAgo(tx.block_time)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold text-sm ${tx.token_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.token_pnl >= 0 ? '+' : ''}{formatCurrency(tx.token_pnl)}
                            </div>
                            <div className="text-xs text-white/50">{formatCurrency(tx.amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white mb-1">{tokenStats.length}</div>
                      <div className="text-xs text-white/50">Unique Tokens</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-500 mb-1">{profile.profitable_trades}</div>
                      <div className="text-xs text-white/50">Winning Trades</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-red-500 mb-1">{profile.total_trades - profile.profitable_trades}</div>
                      <div className="text-xs text-white/50">Losing Trades</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white mb-1">{(profile.total_volume / profile.total_trades).toFixed(0)}</div>
                      <div className="text-xs text-white/50">Avg Trade Size</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="overflow-x-auto -mx-6">
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
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="overflow-x-auto -mx-6">
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
                        Best Trade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                        Last Trade
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
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-green-500 h-full rounded-full"
                                style={{ width: `${token.winRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white/80 min-w-[45px]">{token.winRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-green-500 font-medium">
                            +{formatCurrency(token.bestTrade)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-white/50">{formatTimeAgo(token.lastTradeTime)}</span>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLProfile;
