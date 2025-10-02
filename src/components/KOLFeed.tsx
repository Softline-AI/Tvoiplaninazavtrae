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
        <div className="text-gray-600">
          Live feed of Key Opinion Leader trades and wallet activity.
        </div>
      </div>

      {/* Feed Table */}
      <div className="mt-6">
        <div className="noir-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-noir-dark border-b border-white/20">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>Last Trade</span>
                        <button className="opacity-70 hover:opacity-100 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>KOL Trader</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>Token</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>Market Cap</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>Bought</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>Sold</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>Holdings</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>P&L</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <span>P&L %</span>
                        <button className="opacity-50 hover:opacity-70 transition-opacity">
                          <Filter className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-2">
                      Hold Time
                      <span className="cursor-help">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    <div className="flex items-center gap-1"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {trades.map((trade, index) => (
                  <tr key={trade.id} className="transition-all duration-300 hover:bg-white/5 group">
                    {/* Last Tx */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold uppercase tracking-wider ${getTransactionTypeColor(trade.lastTx)}`}>
                          {trade.lastTx === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                        <div>
                          <span className="text-sm text-white/70 font-medium">{trade.timeAgo}</span>
                        </div>
                      </div>
                    </td>

                    {/* KOL */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white flex items-center hover:bg-white/15 transition-all duration-300 cursor-pointer" style={{ overflow: 'hidden', height: '36px', width: '180px' }}>
                          <div className="flex-1 flex items-center justify-start cursor-pointer text-white min-w-0">
                            <div className="relative">
                              <div className="relative mr-2">
                                <div className="relative">
                                  <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center border-2 border-white/40">
                                    <span className="text-white font-bold text-[10px]">
                                      {trade.kolName.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <img
                                    alt={trade.kolName}
                                    className="absolute inset-0 rounded-full border-2 border-white/40 object-cover w-[24px] h-[24px]"
                                    src={trade.kolAvatar}
                                    style={{ display: 'block' }}
                                  />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-noir-dark shadow-lg"></div>
                              </div>
                            </div>
                            <span className="text-sm text-white font-bold truncate">
                              {trade.kolName}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <a
                              className="hover:opacity-70 hover:scale-110 transition-all px-1 text-white/70"
                              href={`https://solscan.io/account/${trade.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://twitter.com/${trade.twitterHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:opacity-70 hover:scale-110 transition-all p-1 text-blue-400"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                              </svg>
                            </a>
                            {trade.telegramHandle && (
                              <a
                                href={`https://t.me/${trade.telegramHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-70 hover:scale-110 transition-all p-1 text-blue-500"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M1.058 6.85c4.337-1.89 7.222-3.127 8.654-3.716 4.113-1.697 4.97-1.992 5.531-2.002.123 0 .397.028.574.17.148.123.188.29.207.406.02.116.045.38.026.588-.223 2.335-1.188 8.016-1.682 10.634-.207 1.11-.615 1.482-1.01 1.518-.861.074-1.516-.576-2.35-1.13-1.295-.85-2.025-1.38-3.284-2.21-1.456-.963-.512-1.494.317-2.362.217-.228 4.005-3.672 4.077-3.983.01-.037.018-.174-.073-.246-.092-.073-.227-.048-.325-.03-.138.027-2.22 1.41-6.247 4.147-.59.406-1.124.604-1.603.594-.528-.01-1.545-.299-2.3-.544-.927-.299-1.663-.456-1.6-.973.033-.263.409-.536 1.114-.82z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Token */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="max-w-[180px]">
                        <div className="w-fit flex items-center rounded-md p-0 transition-colors hover:bg-gray-100">
                          <button className="bg-transparent hover:bg-transparent p-0 rounded-md flex items-center">
                            <div className="flex items-center min-w-[100px] p-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 overflow-hidden">
                                <span className="text-gray-500 font-medium text-xs">
                                  {trade.token.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <img
                                alt={trade.token}
                                className="absolute w-7 h-7 rounded-full border border-gray-300 object-cover"
                                src={trade.tokenIcon}
                                style={{ display: 'block' }}
                              />
                              <div className="flex flex-col ml-2 text-left">
                                <span className="text-xs font-medium flex items-center gap-1">
                                  {trade.token}
                                  {trade.verified && (
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                                      <path 
                                        d="M9 12L11 14L15.5 9.5M7.33377 3.8187C8.1376 3.75455 8.90071 3.43846 9.51447 2.91542C10.9467 1.69486 13.0533 1.69486 14.4855 2.91542C15.0993 3.43846 15.8624 3.75455 16.6662 3.8187C18.5421 3.96839 20.0316 5.45794 20.1813 7.33377C20.2455 8.1376 20.5615 8.90071 21.0846 9.51447C22.3051 10.9467 22.3051 13.0533 21.0846 14.4855C20.5615 15.0993 20.2455 15.8624 20.1813 16.6662C20.0316 18.5421 18.5421 20.0316 16.6662 20.1813C15.8624 20.2455 15.0993 20.5615 14.4855 21.0846C13.0533 22.3051 10.9467 22.3051 9.51447 21.0846C8.90071 20.5615 8.1376 20.2455 7.33377 20.1813C5.45794 20.0316 3.96839 18.5421 3.8187 16.6662C3.75455 15.8624 3.43846 15.0993 2.91542 14.4855C1.69486 13.0533 1.69486 10.9467 2.91542 9.51447C3.43846 8.90071 3.75455 8.1376 3.8187 7.33377C3.96839 5.45794 5.45794 3.96839 7.33377 3.8187Z" 
                                        stroke="#10b981" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </span>
                              </div>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 pr-2">
                            <button className="hover:opacity-50 cursor-pointer px-1 flex items-center text-gray-500">
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://axiom.trade/t/${trade.tokenContract}/@stalk`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:opacity-70 hover:scale-110 transition-all p-1 text-gray-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>