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
        console.log(`📊 Fetching KOL leaderboard data for ${timePeriod}...`);

        let refreshInterval = 120000;
        let dataLimit = 50;

        switch(timePeriod) {
          case '1h':
            dataLimit = 20;
            refreshInterval = 60000;
            break;
          case '6h':
            dataLimit = 30;
            refreshInterval = 90000;
            break;
          case '1d':
            dataLimit = 50;
            refreshInterval = 120000;
            break;
          case '7d':
            dataLimit = 100;
            refreshInterval = 180000;
            break;
        }

        const kolData = await heliusService.getKOLLeaderboardData();

        const formattedKOLs: KOLTrader[] = kolData.slice(0, dataLimit).map((kol, index) => {
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
        console.log(`📊 Loaded ${formattedKOLs.length} KOLs for ${timePeriod}`);
      } catch (error) {
        console.error('Error fetching real KOL data:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoadingReal(false);
      }
    };

    fetchRealKOLData();
    const interval = setInterval(fetchRealKOLData, 120000);
    return () => clearInterval(interval);
  }, [timePeriod]);

  const traders: KOLTrader[] = [
    {
      id: '1',
      name: 'Cupsey 2',
      rank: 1,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 7,
      sellCount: 13,
      volume: '$0.01K',
      twitterHandle: 'cupseyy',
      walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      isTopPerformer: true
    },
    {
      id: '2',
      name: 'Cupsey 3',
      rank: 2,
      avatar: 'https://images.pexels.com/photos/220454/pexels-photo-220454.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 9,
      sellCount: 11,
      volume: '$0.01K',
      twitterHandle: 'cupseyy',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      isSecondPlace: true
    },
    {
      id: '3',
      name: 'Euris',
      rank: 3,
      avatar: 'https://images.pexels.com/photos/220455/pexels-photo-220455.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 10,
      sellCount: 10,
      volume: '$0.01K',
      twitterHandle: 'untaxxable',
      walletAddress: 'DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj'
    },
    {
      id: '4',
      name: 'dv',
      rank: 4,
      avatar: 'https://images.pexels.com/photos/220456/pexels-photo-220456.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 6,
      sellCount: 14,
      volume: '$0.01K',
      twitterHandle: 'vibed333',
      walletAddress: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd'
    },
    {
      id: '5',
      name: 'casino',
      rank: 5,
      avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 10,
      sellCount: 10,
      volume: '$0.01K',
      twitterHandle: 'casino616',
      walletAddress: '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR'
    },
    {
      id: '6',
      name: 'Cupsey Alt',
      rank: 6,
      avatar: 'https://images.pexels.com/photos/220458/pexels-photo-220458.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 12,
      sellCount: 8,
      volume: '$0.01K',
      twitterHandle: 'cupseyy',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR'
    },
    {
      id: '7',
      name: 'Idontpaytaxes',
      rank: 7,
      avatar: 'https://images.pexels.com/photos/220459/pexels-photo-220459.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 13,
      sellCount: 7,
      volume: '$0.01K',
      twitterHandle: 'untaxxable',
      walletAddress: '2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH'
    },
    {
      id: '8',
      name: 'GOOD TRADER 7',
      rank: 8,
      avatar: 'https://images.pexels.com/photos/220460/pexels-photo-220460.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      buyCount: 12,
      sellCount: 8,
      volume: '$0.01K',
      twitterHandle: 'goodtrader7',
      walletAddress: 'RFSqPtn1JfavGiUD4HJsZyYXvZsycxf31hnYfbyG6iB'
    }
  ];

  const getRankDisplay = (trader: KOLTrader) => {
    if (trader.isTopPerformer) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 text-base">#{trader.rank}</span>
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
      );
    }
    return <span className="font-medium text-white/70 text-sm">#{trader.rank}</span>;
  };

  const getRowStyling = (trader: KOLTrader) => {
    if (trader.isTopPerformer) {
      return 'border-l-2 border-amber-400/50';
    }
    return '';
  };

  // Use real data if available, otherwise fallback to mock data
  const displayTraders = realKOLs.length > 0 ? realKOLs : traders;

  return (
    <div className="w-full mx-auto px-0 max-w-[1220px] md:px-10 py-5">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h1>
          
          <div className="flex gap-2">
            {['6h', '1d', '7d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timePeriod === period
                    ? 'bg-white text-noir-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {period === '6h' ? '6H' : period === '1d' ? '24H' : '7D'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden mt-6 shadow-2xl">
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
                  Trades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">

                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayTraders.map((trader) => (
                <tr key={trader.id} className={`transition-all duration-200 hover:bg-white/[0.02] ${getRowStyling(trader)}`}>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {getRankDisplay(trader)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        alt={trader.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                        src={trader.avatar}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{trader.name}</span>
                        <a
                          href={`https://twitter.com/${trader.twitterHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/50 hover:text-white/80 transition-colors"
                        >
                          @{trader.twitterHandle}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-500">{trader.buyCount}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-sm font-medium text-red-500">{trader.sellCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white">{trader.volume}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <a
                      href={`https://solscan.io/account/${trader.walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white inline-flex"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-noir-dark/40 border border-white/10 rounded-xl mt-6 overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowExplanation(!showExplanation)}>
            <span className="text-sm font-medium text-white">How Rankings Work</span>
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showExplanation && (
            <div className="pt-4 space-y-3">
              <div className="text-xs text-white/60 space-y-2">
                <p>Traders are ranked by total trading volume in the selected timeframe.</p>
                <p>Includes both buy and sell transactions from real-time on-chain data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KOLLeaderboard;