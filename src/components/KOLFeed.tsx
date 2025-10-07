import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
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
  bought: string;
  sold: string;
  holding: string;
  pnl: string;
  pnlPercentage: string;
}

const KOLFeed: React.FC = () => {
  const [realTrades, setRealTrades] = useState<RealTimeKOLTrade[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealKOLTrades = async () => {
      setIsLoadingReal(true);
      setError(null);
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
        console.error('Error fetching real KOL data:', error);
        setError('Failed to load real-time data');
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
      timeAgo: '18s ago',
      kolName: 'dv',
      kolAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      twitterHandle: 'vibed333',
      token: 'DBA',
      tokenContract: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      bought: '$439.42',
      sold: '$622.13',
      holding: 'sold all',
      pnl: '+$182.71',
      pnlPercentage: '+41.58%'
    },
    {
      id: '2',
      lastTx: 'buy',
      timeAgo: '1min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      twitterHandle: 'cupseyy',
      token: 'REALCOIN',
      tokenContract: 'Ghrcrh9YgyU6baT3Wt5XNiQ7UXWNNYSZMEuCcauspump',
      bought: '$479.97',
      sold: '$2.24K',
      holding: '$563.68',
      pnl: '+$2.32K',
      pnlPercentage: '+483.52%'
    },
    {
      id: '3',
      lastTx: 'sell',
      timeAgo: '4min ago',
      kolName: 'Euris',
      kolAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'untaxxable',
      token: 'DBA',
      tokenContract: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      bought: '$0.00',
      sold: '$431.79',
      holding: '$0.00',
      pnl: '+$431.79',
      pnlPercentage: '-'
    },
    {
      id: '4',
      lastTx: 'buy',
      timeAgo: '8min ago',
      kolName: 'Idontpaytaxes',
      kolAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      twitterHandle: 'untaxxable',
      token: 'Nothing',
      tokenContract: 'C3QgEAkQ4DNCf73GKNHnWz6PHTL186DwDrkSexFBbonk',
      bought: '$254.00',
      sold: '$247.27',
      holding: 'sold all',
      pnl: '-$6.74',
      pnlPercentage: '-2.65%'
    }
  ];

  const displayTrades = realTrades.length > 0 ? realTrades : mockTrades;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">KOL Trading Feed</h1>
          <p className="text-white/60">Track real-time trades from top KOLs and influencers</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="status-dot online"></div>
          <span className="text-sm font-medium text-green-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayTrades.map((trade, index) => (
          <div
            key={trade.id}
            className="card-modern group slide-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={trade.kolAvatar}
                  alt={trade.kolName}
                  className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
                />
                <div>
                  <h3 className="text-white font-medium text-base">{trade.kolName}</h3>
                  <a
                    href={`https://twitter.com/${trade.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-blue-400 transition-colors"
                  >
                    @{trade.twitterHandle}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                    trade.lastTx === 'buy'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {trade.lastTx}
                </span>
                <span className="text-xs text-white/40">{trade.timeAgo}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-xs text-white/50 mb-1">Token</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <span className="text-white font-semibold text-xs">
                      {trade.token.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-medium">{trade.token}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-white/50 mb-1">Bought</p>
                <p className="text-sm font-semibold text-green-400">{trade.bought}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Sold</p>
                <p className="text-sm font-semibold text-red-400">{trade.sold}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Holdings</p>
                <p className="text-sm font-semibold text-white/80">{trade.holding}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-white/50 mb-1">P&L</p>
                  <div className="flex items-center gap-2">
                    {trade.pnl.startsWith('+') ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={`text-base font-bold ${
                        trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {trade.pnl}
                    </span>
                    <span
                      className={`text-sm ${
                        trade.pnl.startsWith('+') ? 'text-green-400/70' : 'text-red-400/70'
                      }`}
                    >
                      {trade.pnlPercentage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(trade.walletAddress)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                  title="Copy wallet address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://solscan.io/account/${trade.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayTrades.length === 0 && (
        <div className="card-modern text-center py-12">
          <p className="text-white/60">No trades available at the moment</p>
        </div>
      )}
    </div>
  );
};

export default KOLFeed;
