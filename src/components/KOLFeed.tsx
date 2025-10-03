import React, { useState } from 'react';
import { useEffect } from 'react';
import { Filter, Copy, ExternalLink, HelpCircle, AlertTriangle } from 'lucide-react';
import { heliusService, type RealTimeKOLTrade } from '../services/heliusApi';

interface KOLTrade {
  id: string;
  lastTx: 'buy' | 'sell';
  timeAgo: string;
  kolName: string;
  kolAvatar: string;
  walletAddress: string;
  twitterHandle: string;
  telegramHandle?: string;
  token: string;
  tokenIcon: string;
  tokenContract: string;
  mcap: string;
  bought: string;
  sold: string;
  holding: string;
  pnl: string;
  pnlPercentage: string;
  aht: string;
  hasWarning?: boolean;
  verified?: boolean;
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
        console.log('📊 Loading real KOL data...');
        const realData = await heliusService.getRealTimeKOLData();
        console.log('📊 Loaded KOL data:', realData);
        setRealTrades(realData);
      } catch (error) {
        console.error('Error fetching real KOL data:', error);
        setError('Failed to load real-time data');
      } finally {
        setIsLoadingReal(false);
      }
    };

    fetchRealKOLTrades();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealKOLTrades, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const trades: KOLTrade[] = [
    {
      id: '1',
      lastTx: 'sell',
      timeAgo: '18s ago',
      kolName: 'dv',
      kolAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      twitterHandle: 'vibed333',
      token: 'DBA',
      tokenIcon: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
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
      lastTx: 'sell',
      timeAgo: '1min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      twitterHandle: 'cupseyy',
      token: 'REALCOIN',
      tokenIcon: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: 'Ghrcrh9YgyU6baT3Wt5XNiQ7UXWNNYSZMEuCcauspump',
      mcap: '$109.92K',
      bought: '$479.97',
      sold: '$2.24K',
      holding: '$563.68',
      pnl: '+$2.32K',
      pnlPercentage: '+483.52%',
      aht: '46min 4s',
      hasWarning: true
    },
    {
      id: '3',
      lastTx: 'sell',
      timeAgo: '4min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'cupseyy',
      token: 'DBA',
      tokenIcon: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
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
      lastTx: 'sell',
      timeAgo: '4min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      twitterHandle: 'cupseyy',
      token: 'DBA',
      tokenIcon: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      mcap: '$27.08K',
      bought: '$0.00',
      sold: '$499.14',
      holding: '$0.00',
      pnl: '+$499.14',
      pnlPercentage: '-',
      aht: '-'
    },
    {
      id: '5',
      lastTx: 'sell',
      timeAgo: '4min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      twitterHandle: 'cupseyy',
      token: 'DBA',
      tokenIcon: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      mcap: '$27.08K',
      bought: '$801.43',
      sold: '$383.40',
      holding: '$0.00',
      pnl: '-$418.03',
      pnlPercentage: '-52.16%',
      aht: '1min 9s'
    },
    {
      id: '6',
      lastTx: 'sell',
      timeAgo: '5min ago',
      kolName: 'Euris',
      kolAvatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj',
      twitterHandle: 'untaxxable',
      token: 'Dogz',
      tokenIcon: 'https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: '8RRBBJTqUMtgAbS68McVcXPodspZg3ZjyBowCdJSpump',
      mcap: '$6.68K',
      bought: '$787.99',
      sold: '$812.10',
      holding: 'sold all',
      pnl: '+$24.11',
      pnlPercentage: '+3.06%',
      aht: '12min 37s'
    },
    {
      id: '7',
      lastTx: 'sell',
      timeAgo: '8min ago',
      kolName: 'Idontpaytaxes',
      kolAvatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH',
      twitterHandle: 'untaxxable',
      token: 'Nothing',
      tokenIcon: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
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
      id: '8',
      lastTx: 'buy',
      timeAgo: '8min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'cupseyy',
      token: 'REALCOIN',
      tokenIcon: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: 'Ghrcrh9YgyU6baT3Wt5XNiQ7UXWNNYSZMEuCcauspump',
      mcap: '$109.92K',
      bought: '$459.60',
      sold: '$315.62',
      holding: '$1.57K',
      pnl: '+$1.43K',
      pnlPercentage: '+310.27%',
      aht: '11min 41s'
    },
    {
      id: '9',
      lastTx: 'buy',
      timeAgo: '8min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      twitterHandle: 'cupseyy',
      token: 'REALCOIN',
      tokenIcon: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: 'Ghrcrh9YgyU6baT3Wt5XNiQ7UXWNNYSZMEuCcauspump',
      mcap: '$109.92K',
      bought: '$454.04',
      sold: '$324.05',
      holding: '$1.59K',
      pnl: '+$1.46K',
      pnlPercentage: '+321.96%',
      aht: '11min 41s'
    },
    {
      id: '10',
      lastTx: 'sell',
      timeAgo: '14min ago',
      kolName: 'Cupsey 3',
      kolAvatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'cupseyy',
      token: 'Nothing',
      tokenIcon: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=28&h=28&dpr=1',
      tokenContract: 'C3QgEAkQ4DNCf73GKNHnWz6PHTL186DwDrkSexFBbonk',
      mcap: '$9.25K',
      bought: '$177.36',
      sold: '$242.02',
      holding: 'sold all',
      pnl: '+$64.65',
      pnlPercentage: '+36.45%',
      aht: '1min 56s'
    }
  ];

  // Use real data if available, otherwise fallback to mock data
  const displayTrades = realTrades.length > 0 ? realTrades : trades;

  const getRowBackground = (index: number) => {
    return index % 2 === 0 ? 'bg-white' : 'bg-gray-25';
  };

  const getTransactionTypeColor = (type: 'buy' | 'sell') => {
    return type === 'buy' ? 'text-green-600' : 'text-red-600';
  };

  const getPnLColor = (pnl: string) => {
    if (pnl === '-' || pnl === '$0.00') return 'text-gray-600';
    return pnl.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">KOL Feed</h1>
      </div>

      {/* Feed Table */}
      <div className="mt-6">
        <div className="noir-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-noir-dark border-b border-white/20">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Last Tx
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    KOL Trader
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Token
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Bought
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Sold
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    P&L
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Holdings
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {displayTrades.map((trade, index) => (
                  <tr key={trade.id} className="transition-all duration-300 hover:bg-white/5 group">
                    {/* Last Tx */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold uppercase tracking-wider ${getTransactionTypeColor(trade.lastTx)}`}>
                          {trade.lastTx === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                        <div className="text-xs text-white/70 font-medium">
                          <span className="text-sm text-white/70 font-medium">{trade.timeAgo}</span>
                        </div>
                      </div>
                    </td>

                    {/* KOL */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white flex items-center hover:bg-white/15 transition-all duration-300 cursor-pointer w-48">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="relative">
                              <img
                                alt={trade.kolName}
                                className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                                src={trade.kolAvatar}
                              />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-noir-dark"></div>
                            </div>
                            <span className="text-sm text-white font-medium">
                              {trade.kolName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <a
                              className="hover:opacity-70 transition-all p-1 text-white/70"
                              href={`https://solscan.io/account/${trade.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://twitter.com/${trade.twitterHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:opacity-70 transition-all p-1 text-blue-400"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Token */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-sm">
                            {trade.token.substring(0, 2).toUpperCase()}
                          </span>
                        <div>
                          <div className="text-sm font-bold text-white">{trade.token}</div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">{trade.bought}</div>
                    </td>

                    {/* Bought */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">{trade.bought}</div>
                    </td>

                    {/* Sold */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">{trade.sold}</div>
                    </td>

                    {/* P&L */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${trade.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl}
                      </div>
                    </td>

                    {/* Holdings */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">{trade.holding}</div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="hover:opacity-70 transition-all p-1 text-white/70">
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://solscan.io/account/${trade.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-70 transition-all p-1 text-white/70"
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
  );
};

export default KOLFeed;