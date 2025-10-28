import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, TrendingUp, TrendingDown, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { heliusService, type RealTimeKOLTrade } from '../services/heliusApi';
import { birdeyeService } from '../services/birdeyeApi';

interface KOLTrade {
  id: string;
  lastTx: 'buy' | 'sell';
  timeAgo: string;
  kolName: string;
  kolAvatar: string;
  walletAddress: string;
  twitterHandle: string;
  token: string;
  tokenContract: string;
  mcap: string;
  bought: string;
  sold: string;
  holding: string;
  pnl: string;
  pnlPercentage: string;
  aht?: string;
}

const KOLFeed: React.FC = () => {
  const navigate = useNavigate();
  const [realTrades, setRealTrades] = useState<RealTimeKOLTrade[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'pnl' | 'volume'>('time');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealKOLTrades = async () => {
    setIsLoadingReal(true);
    try {
      const params = new URLSearchParams({
        timeRange: timeRange,
        type: filter,
        sortBy: sortBy,
        limit: '50'
      });

      const response = await fetch(`http://localhost:5000/api/kol-feed?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        setRealTrades(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        console.error('Failed to fetch KOL feed:', data.error);
        setRealTrades([]);
      }
    } catch (error) {
      console.error('Error fetching KOL data:', error);
      setRealTrades([]);
    } finally {
      setIsLoadingReal(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchRealKOLTrades();
  };

  useEffect(() => {
    fetchRealKOLTrades();
    const interval = setInterval(fetchRealKOLTrades, 3600000);
    return () => clearInterval(interval);
  }, [filter, sortBy, timeRange]);

  const displayTrades = realTrades;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const stats = {
    totalTrades: displayTrades.length,
    buyTrades: displayTrades.filter(t => t.lastTx === 'buy').length,
    sellTrades: displayTrades.filter(t => t.lastTx === 'sell').length,
    avgPnl: displayTrades.reduce((acc, t) => {
      const pnl = parseFloat(t.pnl.replace(/[^0-9.-]/g, ''));
      return acc + (isNaN(pnl) ? 0 : pnl);
    }, 0) / displayTrades.length
  };

  return (
    <div className="w-full px-6 py-5 relative">
      <div className="relative z-10">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">KOL Feed</h1>
            <p className="text-sm text-white/60 mt-1">Transaction stream from 500+ influential traders - Updates hourly</p>
            {lastUpdate && (
              <p className="text-xs text-white/40 mt-1">Last updated: {lastUpdate}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isRefreshing
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white/5 text-white hover:bg-white hover:text-noir-black border border-white/10'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Cached 1hr</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('buy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setFilter('sell')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('time')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === 'time'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setSortBy('pnl')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                sortBy === 'pnl'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              P&L
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
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === '1h'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              1H
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === '24h'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              24H
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === '7d'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === '30d'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              30D
            </button>
          </div>

        </div>
      </div>

      <div className="mt-6">
        <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Trader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Bought</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Holdings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingReal ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-4 bg-white/10 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-white/10 rounded w-20"></div>
                            <div className="h-3 bg-white/10 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-4 bg-white/10 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-4 bg-white/10 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-4 bg-white/10 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-4 bg-white/10 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="h-4 bg-white/10 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-white/10 rounded"></div>
                          <div className="h-8 w-8 bg-white/10 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : displayTrades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Clock className="w-12 h-12 text-white/30" />
                        <p className="text-white/50 text-sm">No trades found. Waiting for live data...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayTrades.map((trade) => (
                  <tr key={trade.id} className="transition-all duration-200 hover:bg-white/[0.02] group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-bold uppercase tracking-wide ${
                          trade.lastTx === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.lastTx}
                        </span>
                        <span className="text-xs text-white/50">{trade.timeAgo} ago</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/app/kol-profile/${trade.walletAddress}`)}
                      >
                        <img
                          alt={trade.kolName}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                          src={trade.kolAvatar}
                          loading="lazy"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{trade.kolName}</span>
                          <a
                            href={`https://twitter.com/${trade.twitterHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/50 hover:text-white/80 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            @{trade.twitterHandle}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20">
                          <span className="text-white font-bold text-xs">
                            {trade.token.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-white">{trade.token}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-500">{trade.bought}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-500">{trade.sold}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-sm font-semibold ${
                          trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {trade.pnl}
                        </span>
                        <span className={`text-xs ${
                          trade.pnl.startsWith('+') ? 'text-green-500/70' : 'text-red-500/70'
                        }`}>
                          {trade.pnlPercentage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-medium text-white/80">{trade.holding}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(trade.walletAddress)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://solscan.io/account/${trade.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default KOLFeed;
