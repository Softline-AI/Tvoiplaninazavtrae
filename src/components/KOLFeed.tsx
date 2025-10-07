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
      bought: '$439',
      sold: '$622',
      holding: 'sold all',
      pnl: '+$182',
      pnlPercentage: '+41%'
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
      bought: '$480',
      sold: '$2.2K',
      holding: '$564',
      pnl: '+$2.3K',
      pnlPercentage: '+483%'
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
      bought: '$0',
      sold: '$432',
      holding: '$0',
      pnl: '+$432',
      pnlPercentage: '-'
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
      bought: '$254',
      sold: '$247',
      holding: 'sold',
      pnl: '-$7',
      pnlPercentage: '-3%'
    }
  ];

  const displayTrades = realTrades.length > 0 ? realTrades : mockTrades;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Live Trades</h1>
          <p className="text-sm text-gray">Real-time KOL trading activity</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black border border-white/10">
          <div className="status-dot"></div>
          <span className="text-xs font-medium text-white">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {displayTrades.map((trade, index) => (
          <div
            key={trade.id}
            className="card-dark p-5 slide-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={trade.kolAvatar}
                  alt={trade.kolName}
                  className="w-10 h-10 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <h3 className="text-white font-semibold text-sm">{trade.kolName}</h3>
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
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    trade.lastTx === 'buy'
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-gray'
                  }`}
                >
                  {trade.lastTx.toUpperCase()}
                </span>
                <span className="text-xs text-gray">{trade.timeAgo}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-xs text-gray mb-1">Token</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <span className="text-white font-bold text-xs">
                      {trade.token.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm">{trade.token}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray mb-1">Bought</p>
                <p className="text-sm font-semibold text-white">{trade.bought}</p>
              </div>
              <div>
                <p className="text-xs text-gray mb-1">Sold</p>
                <p className="text-sm font-semibold text-white">{trade.sold}</p>
              </div>
              <div>
                <p className="text-xs text-gray mb-1">Holdings</p>
                <p className="text-sm font-semibold text-white">{trade.holding}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray mb-1">P&L</p>
                  <div className="flex items-center gap-2">
                    {trade.pnl.startsWith('+') ? (
                      <TrendingUp className="w-4 h-4 text-white" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-gray" />
                    )}
                    <span className="text-base font-bold text-white">
                      {trade.pnl}
                    </span>
                    <span className="text-sm text-gray">
                      {trade.pnlPercentage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(trade.walletAddress)}
                  className="p-2 hover:bg-white/10 rounded transition-all text-gray hover:text-white"
                  title="Copy wallet"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://solscan.io/account/${trade.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded transition-all text-gray hover:text-white"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KOLFeed;
