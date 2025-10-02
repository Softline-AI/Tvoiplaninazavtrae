import React, { useState } from 'react';
import { useEffect } from 'react';
import { Crown, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react';
import { heliusService, type KOLData } from '../services/heliusApi';

interface KOLTrader {
  id: string;
  name: string;
  rank: number;
  avatar: string;
  buyCount: number;
  sellCount: number;
  volume: string;
  twitterHandle: string;
  walletAddress: string;
  isTopPerformer?: boolean;
  isSecondPlace?: boolean;
}

const KOLLeaderboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('1d');
  const [sortBy, setSortBy] = useState('overall');
  const [showExplanation, setShowExplanation] = useState(false);
  const [realKOLs, setRealKOLs] = useState<KOLTrader[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealKOLData = async () => {
      setIsLoadingReal(true);
      setError(null);
      try {
        console.log('📊 Fetching real KOL leaderboard data...');
        const kolData = await heliusService.getKOLLeaderboardData();
        
        const formattedKOLs: KOLTrader[] = kolData.map((kol, index) => {          
          return {
            id: (index + 1).toString(),
            name: kol.name || `KOL ${index + 1}`,
            rank: index + 1,
            avatar: `https://images.pexels.com/photos/${220453 + index}/pexels-photo-${220453 + index}.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1`,
            buyCount: kol.buyCount,
            sellCount: kol.sellCount,
            volume: `$${(kol.totalVolume / 1000).toFixed(2)}K`,
            twitterHandle: kol.twitterHandle || `kol${index + 1}`,
            walletAddress: kol.wallet,
            isTopPerformer: index === 0,
            isSecondPlace: index === 1
          };
        });

        setRealKOLs(formattedKOLs);
        console.log('📊 Loaded KOL leaderboard:', formattedKOLs);
      } catch (error) {
        console.error('Error fetching real KOL data:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoadingReal(false);
      }
    };

    fetchRealKOLData();
    // Refresh data every 2 minutes
    const interval = setInterval(fetchRealKOLData, 120000);
    return () => clearInterval(interval);
  }, [timePeriod]); // Refresh when time period changes

  const traders: KOLTrader[] = [
    {
      id: '1',
      name: 'Cupsey 3',
      rank: 1,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 719,
      sellCount: 334,
      volume: '$165.46K',
      twitterHandle: 'cupseyy',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      isTopPerformer: true
    },
    {
      id: '2',
      name: 'Cupsey 3',
      rank: 2,
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 667,
      sellCount: 320,
      volume: '$137.89K',
      twitterHandle: 'cupseyy',
      walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      isSecondPlace: true
    },
    {
      id: '3',
      name: 'Cupsey 3',
      rank: 3,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 654,
      sellCount: 320,
      volume: '$134.42K',
      twitterHandle: 'cupseyy',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR'
    },
    {
      id: '4',
      name: 'GOOD TRADER 7',
      rank: 4,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 33,
      sellCount: 35,
      volume: '$101.24K',
      twitterHandle: 'goodtrader7',
      walletAddress: 'RFSqPtn1JfavGiUD4HJsZyYXvZsycxf31hnYfbyG6iB'
    },
    {
      id: '5',
      name: 'casino',
      rank: 5,
      avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 68,
      sellCount: 50,
      volume: '$98.30K',
      twitterHandle: 'casino616',
      walletAddress: '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR'
    },
    {
      id: '6',
      name: 'aloh',
      rank: 6,
      avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 200,
      sellCount: 54,
      volume: '$88.17K',
      twitterHandle: 'alohquant',
      walletAddress: 'xXpRSpAe1ajq4tJP78tS3X1AqNwJVQ4Vvb1Swg4hHQh'
    },
    {
      id: '7',
      name: 'TheMarketingIdol',
      rank: 7,
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 175,
      sellCount: 96,
      volume: '$85.00K',
      twitterHandle: 'TMIofficials',
      walletAddress: 'HYWo71Wk9PNDe5sBaRKazPnVyGnQDiwgXCFKvgAQ1ENp'
    },
    {
      id: '8',
      name: 'OGAntD',
      rank: 8,
      avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 264,
      sellCount: 107,
      volume: '$82.69K',
      twitterHandle: 'ratwizardx',
      walletAddress: '215nhcAHjQQGgwpQSJQ7zR26etbjjtVdW74NLzwEgQjP'
    },
    {
      id: '9',
      name: 's',
      rank: 9,
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 5,
      sellCount: 32,
      volume: '$82.17K',
      twitterHandle: 'runitbackghost',
      walletAddress: 'ApRnQN2HkbCn7W2WWiT2FEKvuKJp9LugRyAE1a9Hdz1'
    },
    {
      id: '10',
      name: 'Heyitsyolo',
      rank: 10,
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 151,
      sellCount: 79,
      volume: '$44.99K',
      twitterHandle: 'Heyitsyolotv',
      walletAddress: 'Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ'
    }
  ];

  const getRankDisplay = (trader: KOLTrader) => {
    if (trader.isTopPerformer) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-500 text-lg">#{trader.rank}</span>
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
      );
    }
    if (trader.isSecondPlace) {
      return <span className="font-bold text-blue-600 text-base">#{trader.rank}</span>;
    }
    if (trader.rank === 3) {
      return <span className="font-bold text-amber-700 text-base">#{trader.rank}</span>;
    }
    return <span className="font-medium">#{trader.rank}</span>;
  };

  const getRowStyling = (trader: KOLTrader) => {
    if (trader.isTopPerformer) {
      return 'bg-gradient-to-r from-amber-50 to-transparent border-l-4 border-amber-400 shadow-sm';
    }
    if (trader.isSecondPlace) {
      return 'bg-gradient-to-r from-blue-50 to-transparent border-l-2 border-blue-300';
    }
    if (trader.rank === 3) {
      return 'bg-gradient-to-r from-zinc-50 to-transparent border-l-2 border-zinc-300';
    }
    return '';
  };

  // Use real data if available, otherwise fallback to mock data
  const displayTraders = realKOLs.length > 0 ? realKOLs : traders;

  return (
    <div className="w-full mx-auto px-0 max-w-[1220px] md:px-10 py-5">
      {/* Header */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl mb-1 font-semibold">KOL Leaderboard</h1>
          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="inline-flex h-fit gap-2 items-center flex-nowrap overflow-x-scroll scrollbar-hide rounded-lg bg-noir-dark border border-white/20 p-0.5 mb-1">
                  <button
                    onClick={() => setTimePeriod('6h')}
                    className={`z-0 w-full px-3 py-1 flex group relative justify-center items-center cursor-pointer transition-opacity h-8 text-sm rounded-sm ${
                      timePeriod === '6h' 
                        ? 'bg-white text-noir-black shadow-sm' 
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="relative z-10 whitespace-nowrap transition-colors font-medium">6H</div>
                    {timePeriod === '6h' && <span className="absolute z-0 inset-0 rounded-sm bg-white shadow-sm" />}
                  </button>
                  <button
                    onClick={() => setTimePeriod('1d')}
                    className={`z-0 w-full px-3 py-1 flex group relative justify-center items-center cursor-pointer transition-opacity h-8 text-sm rounded-sm ${
                      timePeriod === '1d' 
                        ? 'bg-white text-noir-black shadow-sm' 
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="relative z-10 whitespace-nowrap transition-colors font-medium">24H</div>
                    {timePeriod === '1d' && <span className="absolute z-0 inset-0 rounded-sm bg-white shadow-sm" />}
                  </button>
                  <button
                    onClick={() => setTimePeriod('7d')}
                    className={`z-0 w-full px-3 py-1 flex group relative justify-center items-center cursor-pointer transition-opacity h-8 text-sm rounded-sm ${
                      timePeriod === '7d' 
                        ? 'bg-white text-noir-black shadow-sm' 
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="relative z-10 whitespace-nowrap transition-colors font-medium">7D</div>
                    {timePeriod === '7d' && <span className="absolute z-0 inset-0 rounded-sm bg-white shadow-sm" />}
                  </button>
                </div>
              </div>
              <button className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                <RefreshCw className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="relative max-w-[160px] min-w-[100px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-noir-dark border border-white/20 rounded-lg px-4 py-2 text-sm font-medium appearance-none cursor-pointer hover:bg-noir-gray focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all text-white"
              >
                <option value="overall">Overall Rank</option>
                <option value="winRate">Win Rate</option>
                <option value="volume">Volume</option>
                <option value="pnl">P&L</option>
                <option value="activity">Most Active</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="noir-card rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="flex justify-between py-4 bg-noir-dark sticky top-0 z-10 px-6 border-b border-white/20">
          <div className="flex items-center flex-1">
            <div className="flex items-center min-w-[40px] text-sm font-medium text-white">Rank</div>
            <div className="flex-1 text-sm font-medium text-white pl-6">Trader</div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex w-16 text-sm font-medium text-white justify-end">Trades</div>
            <div className="flex w-28 text-sm font-medium text-white justify-end">Volume</div>
            <div className="flex w-4 text-xs justify-center"></div>
          </div>
        </div>

        <hr className="border-white/20" />

        {/* Table Rows */}
        <div className="divide-y divide-white/10">
          {displayTraders.map((trader) => (
            <div key={trader.id} className="relative">
              <div className={`w-full flex justify-between items-center h-20 text-sm hover:bg-white/5 transition-all duration-300 ${getRowStyling(trader)}`}>
                <div className="flex items-center pl-6 flex-1">
                  <div className="flex items-center min-w-[40px]">
                    <div className="flex items-center gap-1">
                      {getRankDisplay(trader)}
                    </div>
                  </div>
                  <div className="font-medium">
                    <div className="bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2 text-white flex items-center transition-all duration-300 cursor-pointer group" style={{ overflow: 'hidden', height: '40px', width: 'auto' }}>
                      <div className="flex-1 flex items-center justify-start cursor-pointer text-white min-w-0">
                        <div className="relative">
                          <div className="relative mr-2">
                            <div className="relative">
                              <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30">
                                <span className="text-white font-bold text-sm">
                                  {trader.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <img
                                alt={trader.name}
                                className="absolute inset-0 rounded-full border-2 border-white/30 object-cover w-[32px] h-[32px]"
                                src={trader.avatar}
                                style={{ display: 'block' }}
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-lg"></div>
                          </div>
                        </div>
                        <span className="font-bold mr-2 text-white truncate text-base">
                          {trader.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          className="hover:opacity-70 hover:scale-110 transition-all px-1 text-white/70"
                          href={`https://solscan.io/account/${trader.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://twitter.com/${trader.twitterHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-70 hover:scale-110 transition-all p-1 text-blue-400 group-hover:text-blue-300"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex justify-end w-16">
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 font-bold text-base">📈{trader.buyCount}</span>
                      <span className="text-white/50 font-bold">/</span>
                      <span className="text-red-600 font-bold text-base">📉{trader.sellCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-end w-28 text-green-700 font-bold text-lg">
                    {trader.volume}
                  </div>
                  <div className="pr-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation Section */}
      <div className="noir-card rounded-xl mt-6 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowExplanation(!showExplanation)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">How KOL Rankings Work</span>
              <span className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full">🏆 Ranking System</span>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showExplanation && (
            <div className="pt-3 pb-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-white text-sm">Ranking Factors</h4>
                  <div className="bg-noir-dark rounded-lg p-3 border border-white/10 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium text-xs">V</div>
                        <span className="text-xs font-medium text-white">Total Trading Volume (USD)</span>
                      </div>
                      <p className="text-xs text-white/70 pl-7">Includes BUY/SELL and DCA fills.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-medium text-xs">A</div>
                        <span className="text-xs font-medium text-white">Trading Activity (Buy/Sell Counts)</span>
                      </div>
                      <p className="text-xs text-white/70 pl-7">Counts BUY/SELL trades and DCA fills.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-white text-sm">How Rankings Are Determined</h4>
                  <div className="bg-noir-dark rounded-lg p-3 border border-white/10">
                    <ol className="text-xs space-y-3">
                      <li className="pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-medium">1</div>
                          <span className="font-medium text-white">Transaction Aggregation</span>
                        </div>
                        <p className="mt-1 text-white/70 pl-7">Spot trades and DCA fills are gathered for each KOL in the selected timeframe.</p>
                      </li>
                      <li className="pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-medium">2</div>
                          <span className="font-medium text-white">Metric Calculation</span>
                        </div>
                        <p className="mt-1 text-white/70 pl-7">Total Trading Volume (USD), Buy, and Sell Transactions are calculated.</p>
                      </li>
                      <li>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-medium">3</div>
                          <span className="font-medium text-white">Sorting & Ranking</span>
                        </div>
                        <p className="mt-1 text-white/70 pl-7">KOLs are ranked by Total Trading Volume (USD). Trading Activity is a secondary sorter.</p>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-center text-white/50">
                <span>Rankings update approximately every 30 minutes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KOLLeaderboard;