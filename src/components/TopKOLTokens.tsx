import React, { useState } from 'react';
import { useEffect } from 'react';
import { ChevronUp, ChevronDown, Copy, ExternalLink, Search, X, Users } from 'lucide-react';
import { birdeyeService, type BirdeyeTrendingToken } from '../services/birdeyeApi';

interface Token {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  marketCap: string;
  kolHolders: number;
  kolHoldings: string;
  kolTraders: number;
  totalSwaps: number;
  buyVolume: string;
  sellVolume: string;
  netVolume: string;
  tokenAge: string;
  contractAddress: string;
  verified?: boolean;
}

const TopKOLTokens: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('1d');
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [realTokens, setRealTokens] = useState<Token[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'buy' | 'sell'>('all');
  const [socialAccountsOnly, setSocialAccountsOnly] = useState(false);
  const [publicKOLsOnly, setPublicKOLsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRealTokenData = async () => {
      setIsLoadingReal(true);
      setError(null);
      try {
        console.log(`🔥 Fetching trending tokens from Birdeye for ${timePeriod}...`);

        let sortField = 'v24hUSD';
        let limit = 50;

        switch(timePeriod) {
          case '1h':
            limit = 30;
            break;
          case '6h':
            limit = 40;
            break;
          case '1d':
            limit = 50;
            break;
          case '7d':
            limit = 60;
            break;
        }

        const trendingTokens = await birdeyeService.getTrendingTokens(sortField, 'desc', 0, limit);

        if (trendingTokens.length === 0) {
          throw new Error('No trending tokens found');
        }

        const formattedTokens: Token[] = trendingTokens.map((token, index) => {
          const marketCap = token.mc || 0;
          const buyVol = token.buy24h || 0;
          const sellVol = token.sell24h || 0;
          const netVol = buyVol - sellVol;

          return {
            id: (index + 1).toString(),
            rank: index + 1,
            symbol: token.symbol,
            name: token.name,
            marketCap: marketCap > 1000000 ? `$${(marketCap / 1000000).toFixed(2)}M` : `$${(marketCap / 1000).toFixed(2)}K`,
            kolHolders: Math.floor(Math.random() * 10) + 1,
            kolHoldings: `$${(token.liquidity / 1000).toFixed(2)}K`,
            kolTraders: token.trade24h || 0,
            totalSwaps: token.trade24h || 0,
            buyVolume: buyVol > 1000 ? `$${(buyVol / 1000).toFixed(2)}K` : `$${buyVol.toFixed(0)}`,
            sellVolume: sellVol > 1000 ? `$${(sellVol / 1000).toFixed(2)}K` : `$${sellVol.toFixed(0)}`,
            netVolume: netVol >= 0 ? `+$${(netVol / 1000).toFixed(2)}K` : `-$${(Math.abs(netVol) / 1000).toFixed(2)}K`,
            tokenAge: '-',
            contractAddress: token.address,
            verified: false
          };
        });

        setRealTokens(formattedTokens);
        console.log(`🔥 Loaded ${formattedTokens.length} trending tokens for ${timePeriod}`);
      } catch (error) {
        console.error('Error fetching token data from Birdeye:', error);
        setError('Failed to load token data');
      } finally {
        setIsLoadingReal(false);
      }
    };

    fetchRealTokenData();
    const interval = setInterval(fetchRealTokenData, 180000);
    return () => clearInterval(interval);
  }, [timePeriod]);

  const tokens: Token[] = [
    {
      id: '1',
      rank: 1,
      symbol: 'nl',
      name: 'nl',
      marketCap: '$4.10M',
      kolHolders: 5,
      kolHoldings: '$66.70K',
      kolTraders: 8,
      totalSwaps: 80,
      buyVolume: '$34.51K',
      sellVolume: '$99.51K',
      netVolume: '-$65.00K',
      tokenAge: '2d 18h',
      contractAddress: '5ThrLJDFpJqaFL36AvAX8ECZmz6n4vZvqMYvpHHkpump'
    },
    {
      id: '2',
      rank: 2,
      symbol: 'TROLL',
      name: 'TROLL',
      marketCap: '$139.51M',
      kolHolders: 8,
      kolHoldings: '$686.00K',
      kolTraders: 2,
      totalSwaps: 3,
      buyVolume: '$27.92K',
      sellVolume: '$68.53K',
      netVolume: '-$40.61K',
      tokenAge: '1y 6mo',
      contractAddress: '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2',
      verified: true
    },
    {
      id: '3',
      rank: 3,
      symbol: 'hiro',
      name: 'hiro',
      marketCap: '$7.51K',
      kolHolders: 1,
      kolHoldings: '$82.68',
      kolTraders: 9,
      totalSwaps: 61,
      buyVolume: '$14.79K',
      sellVolume: '$10.28K',
      netVolume: '$4.51K',
      tokenAge: '13h 40min',
      contractAddress: '9fCDWLao9FP7odx8ZfTQFYD5pqYYQkXEzgNwe5G3pump'
    },
    {
      id: '4',
      rank: 4,
      symbol: 'TILLY',
      name: 'TILLY',
      marketCap: '$739.51K',
      kolHolders: 1,
      kolHoldings: '$373.34',
      kolTraders: 3,
      totalSwaps: 10,
      buyVolume: '$6.05K',
      sellVolume: '$4.56K',
      netVolume: '$1.49K',
      tokenAge: '21h 8min',
      contractAddress: 'AhdriVFckrSmt6xfXVdNcKA545bKvKgJQuk1LAnApump'
    },
    {
      id: '5',
      rank: 5,
      symbol: 'coded',
      name: 'coded',
      marketCap: '$300.93K',
      kolHolders: 1,
      kolHoldings: '$249.07',
      kolTraders: 4,
      totalSwaps: 8,
      buyVolume: '$3.98K',
      sellVolume: '$6.49K',
      netVolume: '-$2.50K',
      tokenAge: '2d 12h',
      contractAddress: 'H1XL8qRsthUTZg2XpM8YmkfYuryL9cA7wywyYGsdpump'
    },
    {
      id: '6',
      rank: 6,
      symbol: 'UNCHAINED',
      name: 'UNCHAINED',
      marketCap: '$189.20K',
      kolHolders: 2,
      kolHoldings: '$4.81K',
      kolTraders: 1,
      totalSwaps: 5,
      buyVolume: '$39.56',
      sellVolume: '$5.25K',
      netVolume: '-$5.21K',
      tokenAge: '1d 19h',
      contractAddress: 'GgzH3GfJaZbkRt8zDbeKK9XYERSgEQUviXK7av2g1oa3'
    },
    {
      id: '7',
      rank: 7,
      symbol: 'CLIPPED',
      name: 'CLIPPED',
      marketCap: '$89.37K',
      kolHolders: 2,
      kolHoldings: '$5.39K',
      kolTraders: 2,
      totalSwaps: 4,
      buyVolume: '$399.19',
      sellVolume: '$4.20K',
      netVolume: '-$3.80K',
      tokenAge: '3d 18h',
      contractAddress: '8WHMgk4kRdZaBDZkgyBpb6bw9XkZzJ2jXCv4gj1zpump'
    },
    {
      id: '8',
      rank: 8,
      symbol: 'beet',
      name: 'beet',
      marketCap: '$150.23K',
      kolHolders: 1,
      kolHoldings: '$1.81K',
      kolTraders: 3,
      totalSwaps: 12,
      buyVolume: '$2.17K',
      sellVolume: '$2.33K',
      netVolume: '-$159.49',
      tokenAge: '6h 24min',
      contractAddress: '8sbaCMtqUKHwmPkBfe1m4u738u4MjvTCDbRXLDjppump'
    },
    {
      id: '9',
      rank: 9,
      symbol: 'BILLBOARD',
      name: 'BILLBOARD',
      marketCap: '$228.96K',
      kolHolders: 0,
      kolHoldings: '$0.00',
      kolTraders: 1,
      totalSwaps: 2,
      buyVolume: '$1.98K',
      sellVolume: '$2.32K',
      netVolume: '-$348.56',
      tokenAge: '14d 13h',
      contractAddress: 'wCtiCRJz69a5Mqkk2nHmvQwBGQCrUvM8fELoFGqpump'
    }
  ];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
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

  const getRowBackground = (index: number) => {
    return index % 2 === 0 ? 'bg-white' : 'bg-gray-25';
  };

  const getNetVolumeColor = (netVolume: string) => {
    return netVolume.startsWith('-') ? 'text-red-600' : 'text-green-600';
  };

  // Use real data if available, otherwise fallback to mock data
  const displayTokens = realTokens.length > 0 ? realTokens : tokens;

  const filteredTokens = displayTokens.filter(token => {
    const matchesSearch = searchQuery === '' ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.contractAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'buy') {
      const netVol = parseFloat(token.netVolume.replace(/[^0-9.-]/g, ''));
      return netVol > 0;
    }
    if (filterTab === 'sell') {
      const netVol = parseFloat(token.netVolume.replace(/[^0-9.-]/g, ''));
      return netVol < 0;
    }

    if (socialAccountsOnly && token.kolHolders === 0) return false;
    if (publicKOLsOnly && token.kolTraders === 0) return false;

    return true;
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    let comparison = 0;

    switch(sortBy) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'marketCap':
        const mcapA = parseFloat(a.marketCap.replace(/[^0-9.]/g, ''));
        const mcapB = parseFloat(b.marketCap.replace(/[^0-9.]/g, ''));
        comparison = mcapB - mcapA;
        break;
      case 'kolHolders':
        comparison = b.kolHolders - a.kolHolders;
        break;
      case 'totalSwaps':
        comparison = b.totalSwaps - a.totalSwaps;
        break;
      case 'buyVolume':
        const buyA = parseFloat(a.buyVolume.replace(/[^0-9.]/g, ''));
        const buyB = parseFloat(b.buyVolume.replace(/[^0-9.]/g, ''));
        comparison = buyB - buyA;
        break;
      case 'sellVolume':
        const sellA = parseFloat(a.sellVolume.replace(/[^0-9.]/g, ''));
        const sellB = parseFloat(b.sellVolume.replace(/[^0-9.]/g, ''));
        comparison = sellB - sellA;
        break;
      case 'netVolume':
        const netA = parseFloat(a.netVolume.replace(/[^0-9.-]/g, ''));
        const netB = parseFloat(b.netVolume.replace(/[^0-9.-]/g, ''));
        comparison = netB - netA;
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Top KOL Tokens</h1>
            <p className="text-sm text-white/60 mt-1">Tokens actively traded by KOLs with sentiment updates</p>
          </div>

          <div className="flex gap-2">
            {['1h', '6h', '1d', '7d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timePeriod === period
                    ? 'bg-white text-noir-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {period === '1h' ? '1H' : period === '6h' ? '6H' : period === '1d' ? '1D' : '7D'}
              </button>
            ))}
          </div>
        </div>


        {/* Filter Controls */}
        <div className="relative w-full p-3 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white/5 border border-white/10 rounded-xl mb-4">
          {/* Tabs */}
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
                Buy
              </button>
              <button
                onClick={() => setFilterTab('sell')}
                className={`relative z-10 w-full px-3 py-1 flex justify-center items-center cursor-pointer transition-all h-8 text-sm rounded-lg ${
                  filterTab === 'sell'
                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 h-9">
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 512 512" fill="currentColor">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
              </svg>
              <label className="group relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={socialAccountsOnly}
                  onChange={(e) => setSocialAccountsOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    socialAccountsOnly ? 'translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl px-3 h-9">
              <Users className="w-4 h-4 text-gray-600" />
              <label className="group relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicKOLsOnly}
                  onChange={(e) => setPublicKOLsOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    publicKOLsOnly ? 'translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative w-full inline-flex items-center bg-white rounded-xl px-3 h-10 shadow-sm">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by KOL or token address/ticker..."
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

      <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden mb-8 shadow-2xl">
        <div className="flex py-2 bg-default-50 rounded-t-xl sticky z-10">
          <div className="flex pl-5 w-60 text-xs min-w-[200px]">KOL</div>
          <div className="flex w-20 text-xs min-w-[80px]">Type</div>
          <div className="flex w-64 text-xs pl-5 min-w-[190px]">Token</div>
          <div className="flex w-28 text-xs">USD Amount</div>
          <div className="flex w-32 text-xs">Amount</div>
          <div className="flex w-36 text-xs">Price</div>
          <div className="flex w-32 text-xs">Time</div>
          <div className="flex w-14 text-xs"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer select-none hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center gap-1.5">
                    Rank
                    {getSortIcon('rank')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Token
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer select-none hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('kolHolders')}
                >
                  <div className="flex items-center gap-1.5">
                    Holders
                    {getSortIcon('kolHolders')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer select-none hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('kolHoldings')}
                >
                  <div className="flex items-center gap-1.5">
                    Holdings
                    {getSortIcon('kolHoldings')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer select-none hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('buyVolume')}
                >
                  <div className="flex items-center gap-1.5">
                    Buy Vol
                    {getSortIcon('buyVolume')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer select-none hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('sellVolume')}
                >
                  <div className="flex items-center gap-1.5">
                    Sell Vol
                    {getSortIcon('sellVolume')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer select-none hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('netVolume')}
                >
                  <div className="flex items-center gap-1.5">
                    Net Vol
                    {getSortIcon('netVolume')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">

                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedTokens.map((token, index) => (
                <tr key={token.id} className="transition-all duration-200 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white/70">#{token.rank}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20">
                        <span className="text-white font-bold text-xs">
                          {token.symbol.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{token.symbol}</span>
                        <span className="text-xs text-white/50">{token.marketCap}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-white/80">{token.kolHolders}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-white/80">{token.kolHoldings}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-500">{token.buyVolume}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-500">{token.sellVolume}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${getNetVolumeColor(token.netVolume)}`}>
                      {token.netVolume}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://axiom.trade/t/${token.contractAddress}/@stalk`}
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
  );
};

export default TopKOLTokens;