import React, { useState, useEffect } from 'react';
import { Crown, ExternalLink, RefreshCw, ChevronDown, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface KOLTrader {
  id: string;
  name: string;
  rank: number;
  avatar: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  totalVolume: number;
  buyCount: number;
  sellCount: number;
  twitterHandle: string;
  walletAddress: string;
  isTopPerformer?: boolean;
  isSecondPlace?: boolean;
  isThirdPlace?: boolean;
}

type SortOption = 'pnl' | 'winRate' | 'volume' | 'trades';

const KOLLeaderboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [sortBy, setSortBy] = useState<SortOption>('pnl');
  const [showExplanation, setShowExplanation] = useState(false);
  const [traders, setTraders] = useState<KOLTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKOLData();
  }, [timePeriod, sortBy]);

  const loadKOLData = async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      let timeFilter: Date | null = null;

      switch (timePeriod) {
        case '1h':
          timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          timeFilter = new Date(now.getTime() - 6 * 60 * 60 * 1000);
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
      }

      const { data: wallets } = await supabase
        .from('monitored_wallets')
        .select('wallet_address, label, twitter_handle, twitter_avatar');

      const walletMap = new Map();
      wallets?.forEach((wallet: any) => {
        walletMap.set(wallet.wallet_address, wallet);
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('kol_profiles')
        .select('*');

      if (profilesError) {
        console.error('Error loading KOL profiles:', profilesError);
        setError('Failed to load leaderboard data');
        return;
      }

      if (!profiles || profiles.length === 0) {
        setTraders([]);
        return;
      }

      const kolsWithStats = await Promise.all(
        profiles.map(async (profile: any) => {
          let txQuery = supabase
            .from('webhook_transactions')
            .select('transaction_type, amount, token_pnl')
            .eq('from_address', profile.wallet_address)
            .neq('token_symbol', 'UNKNOWN');

          if (timeFilter) {
            txQuery = txQuery.gte('block_time', timeFilter.toISOString());
          }

          const { data: transactions } = await txQuery;

          const buyCount = transactions?.filter((tx: any) =>
            tx.transaction_type === 'BUY'
          ).length || 0;

          const sellCount = transactions?.filter((tx: any) =>
            tx.transaction_type === 'SELL'
          ).length || 0;

          const totalTrades = buyCount + sellCount;

          const totalVolume = transactions?.reduce((sum: number, tx: any) => {
            const solAmount = Math.abs(parseFloat(tx.sol_amount || '0'));
            const usdValue = solAmount * 200;
            return sum + usdValue;
          }, 0) || 0;

          const totalPnl = transactions?.reduce((sum: number, tx: any) =>
            sum + parseFloat(tx.token_pnl || '0'), 0
          ) || 0;

          const profitableTrades = transactions?.filter((tx: any) =>
            parseFloat(tx.token_pnl || '0') > 0
          ).length || 0;

          const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

          const wallet = walletMap.get(profile.wallet_address);
          const avatarUrl = wallet?.twitter_avatar || profile.avatar_url || 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';

          return {
            id: profile.id,
            name: profile.name,
            avatar: avatarUrl,
            totalPnl,
            winRate,
            totalTrades,
            totalVolume,
            buyCount,
            sellCount,
            twitterHandle: profile.twitter_handle?.replace('@', '') || profile.wallet_address.substring(0, 8),
            walletAddress: profile.wallet_address,
            rank: 0
          };
        })
      );

      let sortedKOLs = [...kolsWithStats];

      switch (sortBy) {
        case 'pnl':
          sortedKOLs.sort((a, b) => b.totalPnl - a.totalPnl);
          break;
        case 'winRate':
          sortedKOLs.sort((a, b) => b.winRate - a.winRate);
          break;
        case 'volume':
          sortedKOLs.sort((a, b) => b.totalVolume - a.totalVolume);
          break;
        case 'trades':
          sortedKOLs.sort((a, b) => b.totalTrades - a.totalTrades);
          break;
      }

      const rankedKOLs = sortedKOLs.map((kol, index) => ({
        ...kol,
        rank: index + 1,
        isTopPerformer: index === 0,
        isSecondPlace: index === 1,
        isThirdPlace: index === 2
      }));

      setTraders(rankedKOLs);
    } catch (error) {
      console.error('Error in loadKOLData:', error);
      setError('Failed to load leaderboard data');
      setTraders([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (trader: KOLTrader) => {
    if (trader.isTopPerformer) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400 text-lg">#{trader.rank}</span>
          <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        </div>
      );
    }
    if (trader.isSecondPlace) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-300 text-lg">#{trader.rank}</span>
          <Crown className="w-5 h-5 text-gray-300 fill-gray-300" />
        </div>
      );
    }
    if (trader.isThirdPlace) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold text-orange-400 text-lg">#{trader.rank}</span>
          <Crown className="w-5 h-5 text-orange-400 fill-orange-400" />
        </div>
      );
    }
    return <span className="font-medium text-white/70 text-sm">#{trader.rank}</span>;
  };

  const getRowStyling = (trader: KOLTrader) => {
    if (trader.isTopPerformer) {
      return 'border-l-4 border-yellow-400 bg-yellow-400/5';
    }
    if (trader.isSecondPlace) {
      return 'border-l-4 border-gray-300 bg-gray-300/5';
    }
    if (trader.isThirdPlace) {
      return 'border-l-4 border-orange-400 bg-orange-400/5';
    }
    return '';
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="w-full mx-auto px-0 max-w-[1220px] md:px-10 py-5 relative">
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">KOL Leaderboard</h1>
              <p className="text-sm text-white/60 mt-1">
                {loading ? 'Loading...' : `${traders.length} traders ranked by performance`}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['1h', '6h', '24h', '7d', '30d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timePeriod === period
                      ? 'bg-white text-noir-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-white/50 mr-2">Sort by:</span>
            <button
              onClick={() => setSortBy('pnl')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === 'pnl'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Total P&L
            </button>
            <button
              onClick={() => setSortBy('winRate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === 'winRate'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Win Rate
            </button>
            <button
              onClick={() => setSortBy('volume')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === 'volume'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setSortBy('trades')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === 'trades'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Total Trades
            </button>
            <button
              onClick={loadKOLData}
              disabled={loading}
              className="ml-auto p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="bg-noir-dark/40 border border-red-500/20 rounded-xl p-12 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : traders.length === 0 ? (
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white/70">No traders found for this period</p>
          </div>
        ) : (
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider w-20">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Trader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Total P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Win Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Trades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {traders.map((trader) => (
                    <tr
                      key={trader.id}
                      className={`transition-all duration-200 hover:bg-white/[0.02] ${getRowStyling(trader)}`}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getRankDisplay(trader)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            alt={trader.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                            src={trader.avatar}
                            loading="lazy"
                          />
                          <div className="flex-1 flex flex-col">
                            <span className="text-sm font-semibold text-white">{trader.name}</span>
                            <span className="text-xs text-white/50">@{trader.twitterHandle.replace('@', '')}</span>
                          </div>
                          <a
                            href={`https://twitter.com/${trader.twitterHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="View on X"
                          >
                            <XIcon className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className={`w-4 h-4 ${trader.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                          <span className={`text-sm font-bold ${trader.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trader.totalPnl >= 0 ? '+' : ''}{formatCurrency(trader.totalPnl)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-white">{trader.winRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(trader.winRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-semibold text-white mb-1">{trader.totalTrades}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-green-400">{trader.buyCount}B</span>
                            <span className="text-white/30">/</span>
                            <span className="text-red-400">{trader.sellCount}S</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-white">{formatCurrency(trader.totalVolume)}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://solscan.io/account/${trader.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white inline-flex"
                            title="View on Solscan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl mt-6 overflow-hidden shadow-2xl">
          <div className="p-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              <span className="text-sm font-medium text-white">How Rankings Work</span>
              <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronDown
                  className={`w-4 h-4 text-white/60 transition-transform ${
                    showExplanation ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {showExplanation && (
              <div className="pt-4 space-y-3">
                <div className="text-xs text-white/60 space-y-2">
                  <p>
                    <strong>Total P&L:</strong> Cumulative profit/loss across all trades in the selected timeframe.
                    Calculated from actual transaction data.
                  </p>
                  <p>
                    <strong>Win Rate:</strong> Percentage of profitable trades. Higher win rate indicates more
                    consistent profitability.
                  </p>
                  <p>
                    <strong>Volume:</strong> Total value of all trades (buys + sells) executed by the trader.
                  </p>
                  <p>
                    <strong>Trades:</strong> Total number of transactions, broken down into buys (B) and sells (S).
                  </p>
                  <p className="pt-2 border-t border-white/10">
                    Rankings update based on real-time on-chain data from Solana blockchain.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLLeaderboard;
