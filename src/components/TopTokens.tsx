import React, { useState } from 'react';
import { Star, TrendingUp, Filter, ExternalLink, Copy } from 'lucide-react';

interface TopToken {
  id: string;
  rank: number;
  token: string;
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
  marketCap: string;
  smartMoneyVolume: string;
  whaleHolders: number;
  contractAddress: string;
  isPositive: boolean;
}

const TopTokens: React.FC = () => {
  const [sortBy, setSortBy] = useState('smartMoney');
  const [timeFilter, setTimeFilter] = useState('24h');

  const tokens: TopToken[] = [
    {
      id: '1',
      rank: 1,
      token: 'Solana',
      symbol: 'SOL',
      price: '$142.35',
      change24h: '+12.45%',
      volume: '$2.1B',
      marketCap: '$67.2B',
      smartMoneyVolume: '$456M',
      whaleHolders: 234,
      contractAddress: 'So11111111111111111111111111111111111111112',
      isPositive: true
    },
    {
      id: '2',
      rank: 2,
      token: 'Jupiter',
      symbol: 'JUP',
      price: '$0.89',
      change24h: '+8.92%',
      volume: '$89M',
      marketCap: '$1.2B',
      smartMoneyVolume: '$23M',
      whaleHolders: 156,
      contractAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      isPositive: true
    },
    {
      id: '3',
      rank: 3,
      token: 'Raydium',
      symbol: 'RAY',
      price: '$4.23',
      change24h: '-2.15%',
      volume: '$45M',
      marketCap: '$890M',
      smartMoneyVolume: '$12M',
      whaleHolders: 89,
      contractAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      isPositive: false
    }
  ];

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Top Tokens</h1>
        <div className="text-white/70">
          Monitor top-performing tokens by volume and smart money activity
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['1h', '6h', '24h', '7d'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeFilter === period
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-noir-dark border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <option value="smartMoney">Smart Money Volume</option>
          <option value="volume">Total Volume</option>
          <option value="marketCap">Market Cap</option>
          <option value="whales">Whale Holders</option>
        </select>
      </div>

      {/* Tokens Table */}
      <div className="noir-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-noir-dark border-b border-white/20">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Token
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Price
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  24h Change
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Volume
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Smart Money
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Whale Holders
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tokens.map((token) => (
                <tr key={token.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-base font-bold text-white mr-2">#{token.rank}</span>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30 mr-3">
                        <span className="text-white font-bold text-sm">
                          {token.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{token.symbol}</div>
                        <div className="text-xs text-white/70">{token.token}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{token.price}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-base font-bold ${
                      token.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {token.change24h}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{token.volume}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-blue-400">{token.smartMoneyVolume}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{token.whaleHolders}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://solscan.io/token/${token.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 hover:scale-110 transition-all p-1 text-white/70"
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
  );
};

export default TopTokens;