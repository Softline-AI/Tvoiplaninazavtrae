import React, { useState, useEffect } from 'react';
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
  const [realTrades, setRealTrades] = useState<RealTimeKOLTrade[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'pnl'>('time');

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
    if (filter === 'all') return true;
    return trade.lastTx === filter;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortBy === 'pnl') {
      const pnlA = parseFloat(a.pnl.replace(/[^0-9.-]/g, ''));
      const pnlB = parseFloat(b.pnl.replace(/[^0-9.-]/g, ''));
      return pnlB - pnlA;
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
    <div className="w-full max-w-7xl mx-auto p-6 fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live KOL Trading Feed</h1>
          <p className="text-sm text-gray">Real-time tracking of Key Opinion Leader trades</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black border border-white/10">
          <div className="status-dot"></div>
          <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-dark p-4">
          <div className="text-xs text-gray mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
        </div>
        <div className="card-dark p-4">
          <div className="text-xs text-gray mb-1">Buy Trades</div>
          <div className="text-2xl font-bold text-white">{stats.buyTrades}</div>
        </div>
        <div className="card-dark p-4">
          <div className="text-xs text-gray mb-1">Sell Trades</div>
          <div className="text-2xl font-bold text-white">{stats.sellTrades}</div>
        </div>
        <div className="card-dark p-4">
          <div className="text-xs text-gray mb-1">Avg P&L</div>
          <div className={`text-2xl font-bold ${stats.avgPnl >= 0 ? 'text-white' : 'text-gray'}`}>
            {stats.avgPnl >= 0 ? '+' : ''}{stats.avgPnl.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 card-dark p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-white text-black' : 'text-gray hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('buy')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              filter === 'buy' ? 'bg-white text-black' : 'text-gray hover:text-white'
            }`}
          >
            Buys
          </button>
          <button
            onClick={() => setFilter('sell')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              filter === 'sell' ? 'bg-white text-black' : 'text-gray hover:text-white'
            }`}
          >
            Sells
          </button>
        </div>

        <div className="flex items-center gap-2 card-dark p-1 rounded-lg">
          <button
            onClick={() => setSortBy('time')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              sortBy === 'time' ? 'bg-white text-black' : 'text-gray hover:text-white'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('pnl')}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              sortBy === 'pnl' ? 'bg-white text-black' : 'text-gray hover:text-white'
            }`}
          >
            Top P&L
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedTrades.map((trade, index) => (
          <div
            key={trade.id}
            className="card-dark p-6 slide-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <img
                  src={trade.kolAvatar}
                  alt={trade.kolName}
                  className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
                />
                <div>
                  <h3 className="text-white font-bold text-base">{trade.kolName}</h3>
                  <a
                    href={`https://twitter.com/${trade.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray hover:text-white transition-colors"
                  >
                    @{trade.twitterHandle}
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    trade.lastTx === 'buy'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {trade.lastTx.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray">
                  <Clock className="w-3 h-3" />
                  <span>{trade.timeAgo}</span>
                </div>
              </div>
            </div>

            <div className="mb-5 pb-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray mb-2">Token</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                      <span className="text-white font-bold text-xs">
                        {trade.token.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-base">{trade.token}</span>
                      <div className="text-xs text-gray flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {trade.mcap}
                      </div>
                    </div>
                  </div>
                </div>
                {trade.aht && trade.aht !== '-' && (
                  <div className="text-right">
                    <p className="text-xs text-gray mb-1">Hold Time</p>
                    <p className="text-sm font-semibold text-white">{trade.aht}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-xs text-gray mb-1">Bought</p>
                <p className="text-base font-bold text-white">{trade.bought}</p>
              </div>
              <div>
                <p className="text-xs text-gray mb-1">Sold</p>
                <p className="text-base font-bold text-white">{trade.sold}</p>
              </div>
              <div>
                <p className="text-xs text-gray mb-1">Holdings</p>
                <p className="text-base font-bold text-white">{trade.holding}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-white/10">
              <div>
                <p className="text-xs text-gray mb-2">Profit & Loss</p>
                <div className="flex items-center gap-2">
                  {trade.pnl.startsWith('+') ? (
                    <TrendingUp className="w-5 h-5 text-white" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-gray" />
                  )}
                  <span className={`text-xl font-bold ${trade.pnl.startsWith('+') ? 'text-white' : 'text-gray'}`}>
                    {trade.pnl}
                  </span>
                  <span className={`text-sm font-semibold ${trade.pnl.startsWith('+') ? 'text-white' : 'text-gray'}`}>
                    ({trade.pnlPercentage})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(trade.walletAddress)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray hover:text-white"
                  title="Copy wallet address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://solscan.io/account/${trade.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray hover:text-white"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedTrades.length === 0 && (
        <div className="card-dark text-center py-20">
          <p className="text-gray text-lg">No trades match your filters</p>
        </div>
      )}
    </div>
  );
};

export default KOLFeed;
