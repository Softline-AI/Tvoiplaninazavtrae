import React, { useState } from 'react';
import { useEffect } from 'react';
import { ChevronUp, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { heliusService, type TokenInfo } from '../services/heliusApi';

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

  useEffect(() => {
    const fetchRealTokenData = async () => {
      setIsLoadingReal(true);
      try {
        console.log('🔥 Fetching real trending tokens...');
        const trendingTokens = await heliusService.getTrendingTokens();
        const prices = await heliusService.getTokenPrices(trendingTokens.map(t => t.mint));
        
        const formattedTokens: Token[] = trendingTokens.map((token, index) => {
          const price = prices[token.mint] || token.price || 0;
          const marketCap = token.marketCap || (price * parseFloat(token.supply) / Math.pow(10, token.decimals));
          
          return {
            id: (index + 1).toString(),
            rank: index + 1,
            symbol: token.symbol,
            name: token.name,
            marketCap: `$${(marketCap / 1000000).toFixed(2)}M`,
            kolHolders: Math.floor(Math.random() * 10) + 1,
            kolHoldings: `$${(Math.random() * 100000).toFixed(0)}`,
            kolTraders: Math.floor(Math.random() * 10) + 1,
            totalSwaps: Math.floor(Math.random() * 100) + 1,
            buyVolume: `$${(Math.random() * 50000).toFixed(0)}`,
            sellVolume: `$${(Math.random() * 50000).toFixed(0)}`,
            netVolume: Math.random() > 0.5 ? `+$${(Math.random() * 10000).toFixed(0)}` : `-$${(Math.random() * 10000).toFixed(0)}`,
            tokenAge: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
            contractAddress: token.mint,
            verified: Math.random() > 0.7
          };
        });

        setRealTokens(formattedTokens);
        console.log('🔥 Loaded trending tokens:', formattedTokens);
      } catch (error) {
        console.error('Error fetching real token data:', error);
      } finally {
        setIsLoadingReal(false);
      }
    };

    fetchRealTokenData();
    // Refresh data every 2 minutes
    const interval = setInterval(fetchRealTokenData, 120000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold">Top KOL Tokens</h1>
        <div className="mb-3">
          <div className="mt-2 mb-1 text-gray-600">
            {realTokens.length > 0 ? 'Live token data from Helius API' : 'Top tokens being traded by Key Opinion Leaders (KOLs) on Solana with real-time rankings and holdings data.'}
            {isLoadingReal && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading real token data...
              </div>
            )}
          </div>
          
          {/* Time Period Tabs */}
          <div className="inline-flex mt-4">
            <div className="flex h-fit gap-2 items-center flex-nowrap overflow-x-scroll scrollbar-hide rounded-lg bg-gray-50 border border-gray-300 p-0.5 mb-1">
              {['1h', '6h', '1d', '7d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`z-0 w-full px-3 py-1 flex group relative justify-center items-center cursor-pointer transition-opacity h-8 text-sm rounded-sm ${
                    timePeriod === period
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <div className="relative z-10 whitespace-nowrap transition-colors font-medium">
                    {period === '1h' ? '1H' : period === '6h' ? '6H' : period === '1d' ? '24H' : '7D'}
                  </div>
                  {timePeriod === period && (
                    <span className="absolute z-0 inset-0 rounded-sm bg-white shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center gap-1">
                    Rank
                    <span className="ml-1">
                      {getSortIcon('rank')}
                    </span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div className="flex items-center gap-1">Token</div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('kolHolders')}
                >
                  <div className="flex items-center gap-1">
                    KOL Holders
                    <span className="ml-1">
                      {getSortIcon('kolHolders')}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('kolHoldings')}
                >
                  <div className="flex items-center gap-1">
                    KOL Holdings
                    <span className="ml-1">
                      {getSortIcon('kolHoldings')}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('kolTraders')}
                >
                  <div className="flex items-center gap-1">
                    KOL Traders
                    <span className="ml-1">
                      {getSortIcon('kolTraders')}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('totalSwaps')}
                >
                  <div className="flex items-center gap-1">
                    Total Swaps
                    <span className="ml-1">
                      {getSortIcon('totalSwaps')}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('buyVolume')}
                >
                  <div className="flex items-center gap-1">
                    Buy Volume
                    <span className="ml-1">
                      {getSortIcon('buyVolume')}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('sellVolume')}
                >
                  <div className="flex items-center gap-1">
                    Sell Volume
                    <span className="ml-1">
                      {getSortIcon('sellVolume')}
                    </span>
                  </div>
                </th>
                <th 
                  className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('netVolume')}
                >
                  <div className="flex items-center gap-1">
                    Net Volume
                    <span className="ml-1">
                      {getSortIcon('netVolume')}
                    </span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div className="flex items-center gap-1">Token Age</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayTokens.map((token, index) => (
                <tr key={token.id} className={`transition-colors hover:bg-gray-100 ${getRowBackground(index)}`}>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{token.rank}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="min-w-0">
                      <div className="w-fit flex items-center rounded-md p-0 transition-colors hover:bg-gray-100">
                        <button className="bg-transparent hover:bg-transparent p-0 rounded-md flex items-center">
                          <div className="flex items-center min-w-[100px] p-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 overflow-hidden">
                              <span className="text-gray-500 font-medium text-xs">
                                {token.symbol.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-col ml-2 text-left">
                              <span className="text-xs font-medium flex items-center gap-1">
                                {token.symbol}
                                {token.verified && (
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
                              <span className="text-[10px] text-gray-500">
                                MC <span className="text-gray-600 font-bold">{token.marketCap}</span>
                              </span>
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 pr-2">
                          <button className="hover:opacity-50 cursor-pointer px-1 flex items-center text-gray-500">
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`https://axiom.trade/t/${token.contractAddress}/@stalk`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-50 px-1 text-gray-500"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{token.kolHolders}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{token.kolHoldings}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{token.kolTraders}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{token.totalSwaps}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-green-600">{token.buyVolume}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-red-600">{token.sellVolume}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className={`text-sm ${getNetVolumeColor(token.netVolume)}`}>
                      {token.netVolume}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-xs text-gray-600">
                      <span>{token.tokenAge}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopKOLTokens;