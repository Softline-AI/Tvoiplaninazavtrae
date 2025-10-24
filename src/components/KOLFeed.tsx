import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
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

  useEffect(() => {
    const fetchRealKOLTrades = async () => {
      setIsLoadingReal(true);
      try {
        const realData = await heliusService.getRealTimeKOLData();
        const uniqueTokens = [...new Set(realData.map(trade => trade.tokenContract))];
        const prices = await birdeyeService.getMultipleTokenPrices(uniqueTokens);

        const enrichedData = realData.map(trade => {
          const priceData = prices[trade.tokenContract];
          if (priceData) {
            const tokenPrice = priceData.value;
            const bought = parseFloat(trade.bought.replace(/[^0-9.]/g, ''));
            const sold = parseFloat(trade.sold.replace(/[^0-9.]/g, ''));
            const holding = parseFloat(trade.holding.replace(/[^0-9.]/g, '')) || 0;

            const boughtValue = bought;
            const soldValue = sold;
            const holdingValue = holding * tokenPrice;
            const totalValue = soldValue + holdingValue;
            const pnl = totalValue - boughtValue;
            const pnlPercentage = boughtValue > 0 ? (pnl / boughtValue) * 100 : 0;

            return {
              ...trade,
              pnl: pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`,
              pnlPercentage: pnl >= 0 ? `+${pnlPercentage.toFixed(2)}%` : `${pnlPercentage.toFixed(2)}%`,
            };
          }
          return trade;
        });

        setRealTrades(enrichedData);
      } catch (error) {
        console.error('Error fetching KOL data:', error);
      } finally {
        setIsLoadingReal(false);
      }
    };

    fetchRealKOLTrades();
    const interval = setInterval(fetchRealKOLTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  const mockTrades: KOLTrade[] = [
    {
      id: '1',
      lastTx: 'sell',
      timeAgo: '18s',
      kolName: 'dv',
      kolAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      twitterHandle: 'vibed333',
      token: 'DBA',
      tokenContract: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      mcap: '$27.08K',
      bought: '$439.42',
      sold: '$622.13',
      holding: 'sold all',
      pnl: '+$182.71',
      pnlPercentage: '+41.58%',
      aht: '4min 19s'
    },
    {
      id: '2',
      lastTx: 'buy',
      timeAgo: '1m',
      kolName: 'Cupsey',
      kolAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      twitterHandle: 'cupseyy',
      token: 'REALCOIN',
      tokenContract: 'Ghrcrh9YgyU6baT3Wt5XNiQ7UXWNNYSZMEuCcauspump',
      mcap: '$109.92K',
      bought: '$479.97',
      sold: '$2.24K',
      holding: '$563.68',
      pnl: '+$2.32K',
      pnlPercentage: '+483.52%',
      aht: '46min 4s'
    },
    {
      id: '3',
      lastTx: 'sell',
      timeAgo: '4m',
      kolName: 'Euris',
      kolAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'untaxxable',
      token: 'DBA',
      tokenContract: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      mcap: '$27.08K',
      bought: '$0.00',
      sold: '$431.79',
      holding: '$0.00',
      pnl: '+$431.79',
      pnlPercentage: '-',
      aht: '-'
    },
    {
      id: '4',
      lastTx: 'buy',
      timeAgo: '8m',
      kolName: 'Untaxxable',
      kolAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      twitterHandle: 'untaxxable',
      token: 'Nothing',
      tokenContract: 'C3QgEAkQ4DNCf73GKNHnWz6PHTL186DwDrkSexFBbonk',
      mcap: '$9.25K',
      bought: '$254.00',
      sold: '$247.27',
      holding: 'sold all',
      pnl: '-$6.74',
      pnlPercentage: '-2.65%',
      aht: '13s'
    },
    {
      id: '5',
      lastTx: 'sell',
      timeAgo: '12m',
      kolName: 'Crypto Bull',
      kolAvatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '8xKm3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'cryptobull',
      token: 'MOON',
      tokenContract: 'D4xN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      mcap: '$156.3K',
      bought: '$1.2K',
      sold: '$3.8K',
      holding: '$450',
      pnl: '+$3.05K',
      pnlPercentage: '+254.2%',
      aht: '2h 15m'
    },
    {
      id: '6',
      lastTx: 'buy',
      timeAgo: '15m',
      kolName: 'Whale Hunter',
      kolAvatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '9yLm4WZ5CptM6vsH3zpfR267KTenbnwm0L6geMxlQnbNS',
      twitterHandle: 'whalehunter',
      token: 'PEPE',
      tokenContract: 'E5yN4WZ5CptM6vsH3zpfR267KTenbnwm0L6geMxlQnbNS',
      mcap: '$2.3M',
      bought: '$5.6K',
      sold: '$0',
      holding: '$8.9K',
      pnl: '+$3.3K',
      pnlPercentage: '+58.9%',
      aht: '35min'
    }
  ];

  const displayTrades = realTrades.length > 0 ? realTrades : mockTrades;

  const filteredTrades = displayTrades.filter(trade => {
    if (filter !== 'all' && trade.lastTx !== filter) return false;
    return true;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortBy === 'pnl') {
      const pnlA = parseFloat(a.pnl.replace(/[^0-9.-]/g, ''));
      const pnlB = parseFloat(b.pnl.replace(/[^0-9.-]/g, ''));
      return pnlB - pnlA;
    }
    if (sortBy === 'volume') {
      const boughtA = parseFloat(a.bought.replace(/[^0-9.-]/g, ''));
      const boughtB = parseFloat(b.bought.replace(/[^0-9.-]/g, ''));
      const soldA = parseFloat(a.sold.replace(/[^0-9.-]/g, ''));
      const soldB = parseFloat(b.sold.replace(/[^0-9.-]/g, ''));
      const volumeA = boughtA + soldA;
      const volumeB = boughtB + soldB;
      return volumeB - volumeA;
    }
    return 0;
  });

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
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-contain opacity-30 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.currentTime = 0.1;
        }}
      >
        <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">KOL Feed</h1>
            <p className="text-sm text-white/60 mt-1">Transaction stream from 500+ influential traders with ~2 second delay</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-white/50 uppercase tracking-wider">Live</span>
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
                {sortedTrades.map((trade) => (
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
                ))}
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
