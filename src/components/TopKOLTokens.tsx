import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Copy, ExternalLink, Search, X, Users, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { birdeyeService } from '../services/birdeyeApi';
import { useTokenLogo } from '../hooks/useTokenLogo';

interface TokenStats {
  id: string;
  rank: number;
  symbol: string;
  mint: string;
  kolCount: number;
  totalTrades: number;
  avgPnl: number;
  avgPnlPercentage: number;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  netVolume: number;
  currentPrice: number;
  marketCap: string;
  priceChange24h: number;
}

const TopKOLTokens: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [sortBy, setSortBy] = useState('kolCount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [tokens, setTokens] = useState<TokenStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'buy' | 'sell'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minKOLs, setMinKOLs] = useState(2);

  useEffect(() => {
    loadTokenStats();
  }, [timePeriod, sortBy, sortDirection]);

  const loadTokenStats = async () => {
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

      let query = supabase
        .from('webhook_transactions')
        .select('token_symbol, token_mint, from_address, transaction_type, amount, token_pnl, token_pnl_percentage, current_token_price')
        .neq('token_symbol', 'UNKNOWN');

      if (timeFilter) {
        query = query.gte('block_time', timeFilter.toISOString());
      }

      const { data: transactions, error: txError } = await query;

      if (txError) {
        console.error('Error loading transactions:', txError);
        setError('Failed to load token data');
        return;
      }

      if (!transactions || transactions.length === 0) {
        setTokens([]);
        return;
      }

      const tokenMap = new Map<string, {
        symbol: string;
        mint: string;
        kols: Set<string>;
        trades: number;
        totalPnl: number;
        totalPnlPercentage: number;
        totalVolume: number;
        buyVolume: number;
        sellVolume: number;
        prices: number[];
      }>();

      transactions.forEach((tx: any) => {
        if (!tx.token_symbol) return;

        const key = tx.token_symbol;

        if (!tokenMap.has(key)) {
          tokenMap.set(key, {
            symbol: tx.token_symbol,
            mint: tx.token_mint || '',
            kols: new Set(),
            trades: 0,
            totalPnl: 0,
            totalPnlPercentage: 0,
            totalVolume: 0,
            buyVolume: 0,
            sellVolume: 0,
            prices: []
          });
        }

        const stats = tokenMap.get(key)!;
        stats.kols.add(tx.from_address);
        stats.trades++;
        stats.totalPnl += parseFloat(tx.token_pnl || '0');
        stats.totalPnlPercentage += parseFloat(tx.token_pnl_percentage || '0');

        const amount = parseFloat(tx.amount || '0');
        stats.totalVolume += amount;

        if (tx.transaction_type === 'BUY') {
          stats.buyVolume += amount;
        } else if (tx.transaction_type === 'SELL') {
          stats.sellVolume += amount;
        }

        if (tx.current_token_price) {
          stats.prices.push(parseFloat(tx.current_token_price));
        }
      });

      const tokenStatsArray: TokenStats[] = [];

      for (const [key, stats] of tokenMap.entries()) {
        if (stats.kols.size < minKOLs) continue;

        const avgPrice = stats.prices.length > 0
          ? stats.prices.reduce((sum, p) => sum + p, 0) / stats.prices.length
          : 0;

        let marketCapStr = '$0';
        let priceChange = 0;

        if (stats.mint) {
          try {
            const priceData = await birdeyeService.getTokenPrice(stats.mint);
            if (priceData && priceData.value) {
              priceChange = priceData.priceChange24h || 0;
            }

            const overview = await birdeyeService.getTokenOverview(stats.mint);
            if (overview && overview.mc) {
              const mc = overview.mc;
              if (mc >= 1000000) {
                marketCapStr = `$${(mc / 1000000).toFixed(2)}M`;
              } else if (mc >= 1000) {
                marketCapStr = `$${(mc / 1000).toFixed(1)}K`;
              } else {
                marketCapStr = `$${mc.toFixed(0)}`;
              }
            }
          } catch (error) {
            console.log(`Could not fetch Birdeye data for ${stats.symbol}`);
          }
        }

        tokenStatsArray.push({
          id: key,
          rank: 0,
          symbol: stats.symbol,
          mint: stats.mint,
          kolCount: stats.kols.size,
          totalTrades: stats.trades,
          avgPnl: stats.totalPnl / stats.trades,
          avgPnlPercentage: stats.totalPnlPercentage / stats.trades,
          totalVolume: stats.totalVolume,
          buyVolume: stats.buyVolume,
          sellVolume: stats.sellVolume,
          netVolume: stats.buyVolume - stats.sellVolume,
          currentPrice: avgPrice,
          marketCap: marketCapStr,
          priceChange24h: priceChange
        });
      }

      let sortedTokens = [...tokenStatsArray];

      switch (sortBy) {
        case 'kolCount':
          sortedTokens.sort((a, b) =>
            sortDirection === 'desc' ? b.kolCount - a.kolCount : a.kolCount - b.kolCount
          );
          break;
        case 'avgPnl':
          sortedTokens.sort((a, b) =>
            sortDirection === 'desc' ? b.avgPnl - a.avgPnl : a.avgPnl - b.avgPnl
          );
          break;
        case 'totalVolume':
          sortedTokens.sort((a, b) =>
            sortDirection === 'desc' ? b.totalVolume - a.totalVolume : a.totalVolume - b.totalVolume
          );
          break;
        case 'totalTrades':
          sortedTokens.sort((a, b) =>
            sortDirection === 'desc' ? b.totalTrades - a.totalTrades : a.totalTrades - b.totalTrades
          );
          break;
        case 'netVolume':
          sortedTokens.sort((a, b) =>
            sortDirection === 'desc' ? b.netVolume - a.netVolume : a.netVolume - b.netVolume
          );
          break;
      }

      const rankedTokens = sortedTokens.map((token, index) => ({
        ...token,
        rank: index + 1
      }));

      setTokens(rankedTokens);
    } catch (error) {
      console.error('Error in loadTokenStats:', error);
      setError('Failed to load token statistics');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const TokenLogo: React.FC<{ mint: string; symbol: string }> = ({ mint, symbol }) => {
    const logoUrl = useTokenLogo(mint);

    return (
      <img
        src={logoUrl}
        alt={symbol}
        className="w-10 h-10 rounded-full border border-white/20"
        onError={(e) => {
          e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';
        }}
      />
    );
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronUp className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="w-3 h-3" /> :
      <ChevronDown className="w-3 h-3" />;
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = searchQuery === '' ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.mint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'buy') {
      return token.netVolume > 0;
    }
    if (filterTab === 'sell') {
      return token.netVolume < 0;
    }

    return true;
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Top KOL Tokens</h1>
              <p className="text-sm text-white/60 mt-1">
                {loading ? 'Loading...' : `${filteredTokens.length} tokens actively traded by KOLs`}
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

          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="text-xs text-white/50 mr-2">Sort by:</span>
            <button
              onClick={() => handleSort('kolCount')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'kolCount'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              KOL Count
            </button>
            <button
              onClick={() => handleSort('avgPnl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'avgPnl'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Avg P&L
            </button>
            <button
              onClick={() => handleSort('totalVolume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'totalVolume'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => handleSort('totalTrades')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'totalTrades'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Trades
            </button>
            <button
              onClick={() => handleSort('netVolume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'netVolume'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              Net Vol
            </button>
            <button
              onClick={loadTokenStats}
              disabled={loading}
              className="ml-auto p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative w-full p-3 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex-1">
              <div className="inline-flex h-fit gap-2 items-center flex-nowrap rounded-lg p-1 bg-white">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`relative z-10 w-full px-3 py-1 flex justify-center items-center cursor-pointer transition-all h-8 text-sm rounded-lg ${
                    filterTab === 'all'
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTab('buy')}
                  className={`relative z-10 w-full px-3 py-1 flex justify-center items-center cursor-pointer transition-all h-8 text-sm rounded-lg ${
                    filterTab === 'buy'
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Net Buy
                </button>
                <button
                  onClick={() => setFilterTab('sell')}
                  className={`relative z-10 w-full px-3 py-1 flex justify-center items-center cursor-pointer transition-all h-8 text-sm rounded-lg ${
                    filterTab === 'sell'
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Net Sell
                </button>
              </div>
            </div>

            <div className="flex-1 min-w-[300px]">
              <div className="relative w-full inline-flex items-center bg-white rounded-xl px-3 h-10 shadow-sm">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by token symbol or address..."
                  className="w-full pl-2 pr-8 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading token statistics...</p>
          </div>
        ) : error ? (
          <div className="bg-noir-dark/40 border border-red-500/20 rounded-xl p-12 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white/70">No tokens found for this period</p>
          </div>
        ) : (
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Token
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('kolCount')}
                    >
                      <div className="flex items-center gap-1.5">
                        KOLs
                        {getSortIcon('kolCount')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('totalTrades')}
                    >
                      <div className="flex items-center gap-1.5">
                        Trades
                        {getSortIcon('totalTrades')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('avgPnl')}
                    >
                      <div className="flex items-center gap-1.5">
                        Avg P&L
                        {getSortIcon('avgPnl')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Buy Vol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Sell Vol
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('netVolume')}
                    >
                      <div className="flex items-center gap-1.5">
                        Net Vol
                        {getSortIcon('netVolume')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTokens.map((token) => (
                    <tr key={token.id} className="transition-all duration-200 hover:bg-white/[0.02]">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-white/70">#{token.rank}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <TokenLogo mint={token.mint} symbol={token.symbol} />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{token.symbol}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/50">{token.marketCap}</span>
                              {token.priceChange24h !== 0 && (
                                <span className={`text-xs font-medium ${
                                  token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-bold text-white">{token.kolCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-white/80">{token.totalTrades}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm">
                          <div className={`font-bold ${token.avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.avgPnl >= 0 ? '+' : ''}{formatCurrency(token.avgPnl)}
                          </div>
                          <div className={`text-xs ${token.avgPnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.avgPnlPercentage >= 0 ? '+' : ''}{token.avgPnlPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-500">{formatCurrency(token.buyVolume)}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-red-500">{formatCurrency(token.sellVolume)}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`text-sm font-bold ${token.netVolume >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.netVolume >= 0 ? '+' : ''}{formatCurrency(token.netVolume)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyToClipboard(token.mint)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            title="Copy token address"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://birdeye.so/token/${token.mint}?chain=solana`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            title="View on Birdeye"
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

        <div className="bg-noir-dark/40 border border-white/10 rounded-xl mt-6 p-6">
          <h3 className="text-sm font-medium text-white mb-3">How It Works</h3>
          <div className="text-xs text-white/60 space-y-2">
            <p>
              <strong>Data Source:</strong> Real transactions from KOL wallets tracked via Helius webhooks +
              token prices from Birdeye API.
            </p>
            <p>
              <strong>KOL Count:</strong> Number of unique KOL traders who have traded this token.
            </p>
            <p>
              <strong>Avg P&L:</strong> Average profit/loss per trade for this token across all KOLs.
            </p>
            <p>
              <strong>Net Volume:</strong> Buy volume minus sell volume. Positive = more buying pressure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopKOLTokens;
