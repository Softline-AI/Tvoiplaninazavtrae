import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign,
  Target, Wallet, BarChart3, Clock, ArrowUpRight, ArrowDownRight,
  Calendar, Zap, Users
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { SafeImage } from './SafeImage';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
  roi: number;
  sharpe_ratio: number;
  max_drawdown: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
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
  roi: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'tokens' | 'analytics'>('overview');
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
      const { data: walletData } = await supabase
        .from('monitored_wallets')
        .select('wallet_address, label, twitter_handle, twitter_avatar')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('kol_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      const { data: txData, error: txError } = await supabase
        .from('webhook_transactions')
        .select('*')
        .eq('from_address', walletAddress)
        .neq('token_symbol', 'UNKNOWN')
        .order('block_time', { ascending: false })
        .limit(500);

      if (txError) {
        console.error('Error loading transactions:', txError);
      }

      const transactions = txData || [];

      const totalPnl = transactions.reduce((sum, tx) => sum + parseFloat(tx.token_pnl || '0'), 0);
      const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
      const profitableTrades = transactions.filter(tx => parseFloat(tx.token_pnl || '0') > 0).length;
      const losingTrades = transactions.filter(tx => parseFloat(tx.token_pnl || '0') < 0).length;
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

      const roi = totalBought > 0 ? (totalPnl / totalBought) * 100 : 0;

      const wins = pnlValues.filter(v => v > 0);
      const losses = pnlValues.filter(v => v < 0);
      const avgWin = wins.length > 0 ? wins.reduce((sum, v) => sum + v, 0) / wins.length : 0;
      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, v) => sum + v, 0) / losses.length) : 0;

      const grossProfit = wins.reduce((sum, v) => sum + v, 0);
      const grossLoss = Math.abs(losses.reduce((sum, v) => sum + v, 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

      const returns = pnlValues.map(v => totalBought > 0 ? (v / totalBought) : 0);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

      let cumulativePnl = 0;
      let peak = 0;
      let maxDrawdown = 0;

      pnlValues.forEach(pnl => {
        cumulativePnl += pnl;
        if (cumulativePnl > peak) {
          peak = cumulativePnl;
        }
        const drawdown = peak - cumulativePnl;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });

      const profile: KOLProfile = {
        wallet_address: walletAddress,
        name: profileData?.name || walletAddress.substring(0, 8),
        avatar_url: walletData?.twitter_avatar || profileData?.avatar_url || 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg',
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
        portfolio_value: totalBought - totalSold + totalPnl,
        roi,
        sharpe_ratio: sharpeRatio,
        max_drawdown: maxDrawdown,
        profit_factor: profitFactor,
        avg_win: avgWin,
        avg_loss: avgLoss
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
        invested: number;
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
            lastTradeTime: tx.block_time,
            invested: 0
          });
        }
        const stats = tokenMap.get(symbol)!;
        stats.trades++;
        const pnl = parseFloat(tx.token_pnl || '0');
        const amount = parseFloat(tx.amount || '0');
        stats.totalPnl += pnl;
        stats.totalVolume += amount;
        if (tx.transaction_type === 'BUY') {
          stats.invested += amount;
        }
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
        lastTradeTime: stats.lastTradeTime,
        roi: stats.invested > 0 ? (stats.totalPnl / stats.invested) * 100 : 0
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

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <SafeImage
                src={profile.avatar_url}
                alt={profile.name}
                className="w-24 h-24 rounded-xl border border-white/20 object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>

              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm mb-3 inline-flex items-center gap-2 transition-colors group"
                >
                  <XIcon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                  @{profile.twitter_handle.replace('@', '')}
                  {profile.twitter_followers > 0 && (
                    <span className="text-white/40">
                      • {(profile.twitter_followers / 1000).toFixed(1)}K followers
                    </span>
                  )}
                </a>
              )}

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <Wallet className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-xs text-white/70 font-mono">
                    {profile.wallet_address.substring(0, 8)}...{profile.wallet_address.slice(-6)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(profile.wallet_address)}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <a
                  href={`https://solscan.io/account/${profile.wallet_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-white/70 hover:text-white text-xs flex items-center gap-2"
                >
                  View on Solscan
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-xs text-white/70">Last: {formatTimeAgo(profile.last_active)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">Total P&L</div>
              <div className={`text-3xl font-bold mb-1 ${profile.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profile.total_pnl >= 0 ? '+' : ''}{formatCurrency(profile.total_pnl)}
              </div>
              <div className={`text-sm ${profile.total_pnl_sol >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                {profile.total_pnl_sol >= 0 ? '+' : ''}{formatSol(profile.total_pnl_sol)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{profile.win_rate.toFixed(1)}%</p>
            <p className="text-xs text-white/40">{profile.profitable_trades} / {profile.total_trades} wins</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Total Trades</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{profile.total_trades}</p>
            <p className="text-xs text-white/40">{formatCurrency(profile.total_volume)} volume</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Avg Hold Time</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{profile.avg_hold_time_hours.toFixed(1)}h</p>
            <p className="text-xs text-white/40">Average period</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">ROI</span>
            </div>
            <p className={`text-2xl font-bold mb-1 ${profile.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profile.roi >= 0 ? '+' : ''}{profile.roi.toFixed(1)}%
            </p>
            <p className="text-xs text-white/40">Return on investment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Total Bought</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(profile.total_bought)}</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Total Sold</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(profile.total_sold)}</p>
          </div>

          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Portfolio Value</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(profile.portfolio_value)}</p>
          </div>
        </div>

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Advanced Analytics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Profit Factor</div>
              <div className="text-xl font-bold text-white">{profile.profit_factor.toFixed(2)}</div>
              <div className="text-xs text-white/40 mt-1">Gross profit / loss</div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Sharpe Ratio</div>
              <div className="text-xl font-bold text-white">{profile.sharpe_ratio.toFixed(2)}</div>
              <div className="text-xs text-white/40 mt-1">Risk-adjusted return</div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Max Drawdown</div>
              <div className="text-xl font-bold text-red-500">{formatCurrency(profile.max_drawdown)}</div>
              <div className="text-xs text-white/40 mt-1">Peak to trough</div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Avg Win/Loss</div>
              <div className="text-xl font-bold text-white">{(profile.avg_win / Math.abs(profile.avg_loss)).toFixed(2)}</div>
              <div className="text-xs text-white/40 mt-1">Win/loss ratio</div>
            </div>
          </div>
        </div>

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden">
          <div className="border-b border-white/10 bg-black/20">
            <div className="flex gap-1 px-4 py-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white text-noir-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-white text-noir-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Transactions ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'tokens'
                    ? 'bg-white text-noir-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Top Tokens ({tokenStats.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Top 5 Profitable Tokens
                    </h3>
                    <div className="space-y-2">
                      {tokenStats.slice(0, 5).map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs border border-white/20">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{token.symbol}</div>
                              <div className="text-xs text-white/40">{token.trades} trades • ROI: {token.roi.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${token.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.totalPnl >= 0 ? '+' : ''}{formatCurrency(token.totalPnl)}
                            </div>
                            <div className="text-xs text-white/40">{token.winRate.toFixed(0)}% WR</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {sortedTransactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                              tx.transaction_type === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {tx.transaction_type}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{tx.token_symbol}</div>
                              <div className="text-xs text-white/40">{formatTimeAgo(tx.block_time)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold text-sm ${tx.token_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.token_pnl >= 0 ? '+' : ''}{formatCurrency(tx.token_pnl)}
                            </div>
                            <div className="text-xs text-white/40">{formatCurrency(tx.amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold text-white mb-1">{tokenStats.length}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">Unique Tokens</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold text-green-500 mb-1">{profile.profitable_trades}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">Winning</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold text-red-500 mb-1">{profile.total_trades - profile.profitable_trades}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">Losing</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold text-white mb-1">${(profile.total_volume / profile.total_trades).toFixed(0)}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">Avg Size</div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Type
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                        onClick={() => handleSort('block_time')}
                      >
                        <div className="flex items-center gap-1.5">
                          Time
                          {getSortIcon('block_time')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                        onClick={() => handleSort('token_symbol')}
                      >
                        <div className="flex items-center gap-1.5">
                          Token
                          {getSortIcon('token_symbol')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-1.5">
                          Amount
                          {getSortIcon('amount')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                        onClick={() => handleSort('token_pnl')}
                      >
                        <div className="flex items-center gap-1.5">
                          P&L
                          {getSortIcon('token_pnl')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        P&L %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Links
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold uppercase ${
                              tx.transaction_type === 'BUY' ? 'text-green-600' : 'text-red-600'
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Trades
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Total P&L
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Avg P&L
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Best Trade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Last Trade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                        Link
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
                          <span
                            className={`text-sm font-medium ${
                              token.roi >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {token.roi >= 0 ? '+' : ''}{token.roi.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden max-w-[60px]">
                              <div
                                className="bg-green-500 h-full rounded-full"
                                style={{ width: `${token.winRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-white/80 min-w-[40px]">{token.winRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-green-500 font-medium">
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
