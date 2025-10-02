import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Filter, ExternalLink, Copy } from 'lucide-react';

interface TrendData {
  id: string;
  rank: number;
  token: string;
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
  marketCap: string;
  holders: number;
  transactions: number;
  contractAddress: string;
  isPositive: boolean;
}

const DailyTrends: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [sortBy, setSortBy] = useState('volume');

  const trends: TrendData[] = [
    {
      id: '1',
      rank: 1,
      token: 'Solana',
      symbol: 'SOL',
      price: '$142.35',
      change24h: '+12.45%',
      volume: '$2.1B',
      marketCap: '$67.2B',
      holders: 1250000,
      transactions: 45230,
      contractAddress: 'So11111111111111111111111111111111111111112',
      isPositive: true
    },
    {
      id: '2',
      rank: 2,
      token: 'Bonk',
      symbol: 'BONK',
      price: '$0.000034',
      change24h: '+8.92%',
      volume: '$156M',
      marketCap: '$2.4B',
      holders: 890000,
      transactions: 23450,
      contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      isPositive: true
    },
    {
      id: '3',
      rank: 3,
      token: 'dogwifhat',
      symbol: 'WIF',
      price: '$2.87',
      change24h: '-3.21%',
      volume: '$89M',
      marketCap: '$2.8B',
      holders: 456000,
      transactions: 18920,
      contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      isPositive: false
    }
  ];

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Daily Trends</h1>
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
      </div>

      {/* Trends Table */}
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
                  Market Cap
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Transactions
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trends.map((trend) => (
                <tr key={trend.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">#{trend.rank}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30 mr-3">
                        <span className="text-white font-bold text-sm">
                          {trend.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{trend.symbol}</div>
                        <div className="text-xs text-white/70">{trend.token}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{trend.price}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-base font-bold ${
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {trend.change24h}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{trend.volume}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{trend.marketCap}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-base font-bold text-white">{trend.transactions.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://solscan.io/token/${trend.contractAddress}`}
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

export default DailyTrends;