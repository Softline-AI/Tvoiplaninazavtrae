import React, { useState } from 'react';
import { Search, Users, TrendingUp, ExternalLink, Copy, Network } from 'lucide-react';

interface CabalData {
  id: string;
  name: string;
  members: number;
  totalValue: string;
  avgWinRate: string;
  topToken: string;
  recentActivity: string;
  wallets: Array<{
    address: string;
    name: string;
    contribution: string;
  }>;
  performance: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const CabalFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('performance');

  const cabals: CabalData[] = [
    {
      id: '1',
      name: 'Solana Whales Collective',
      members: 12,
      totalValue: '$24.5M',
      avgWinRate: '82.3%',
      topToken: 'SOL',
      recentActivity: '5 min ago',
      wallets: [
        { address: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd', name: 'Whale #1', contribution: '$8.2M' },
        { address: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f', name: 'Whale #2', contribution: '$6.1M' },
        { address: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR', name: 'Whale #3', contribution: '$4.8M' }
      ],
      performance: '+156.7%',
      riskLevel: 'low'
    },
    {
      id: '2',
      name: 'DeFi Alpha Hunters',
      members: 8,
      totalValue: '$12.8M',
      avgWinRate: '74.1%',
      topToken: 'JUP',
      recentActivity: '12 min ago',
      wallets: [
        { address: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1', name: 'Alpha #1', contribution: '$4.2M' },
        { address: 'DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj', name: 'Alpha #2', contribution: '$3.8M' },
        { address: '2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH', name: 'Alpha #3', contribution: '$2.9M' }
      ],
      performance: '+89.4%',
      riskLevel: 'medium'
    },
    {
      id: '3',
      name: 'Meme Coin Syndicate',
      members: 15,
      totalValue: '$8.9M',
      avgWinRate: '68.9%',
      topToken: 'BONK',
      recentActivity: '1 hour ago',
      wallets: [
        { address: 'RFSqPtn1JfavGiUD4HJsZyYXvZsycxf31hnYfbyG6iB', name: 'Meme #1', contribution: '$2.1M' },
        { address: '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR', name: 'Meme #2', contribution: '$1.9M' },
        { address: 'xXpRSpAe1ajq4tJP78tS3X1AqNwJVQ4Vvb1Swg4hHQh', name: 'Meme #3', contribution: '$1.7M' }
      ],
      performance: '+234.1%',
      riskLevel: 'high'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-600/10';
      case 'medium':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'high':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-white/70 bg-white/10';
    }
  };

  const getPerformanceColor = (performance: string) => {
    return performance.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Cabal Finder</h1>
      </div>

      {/* Search and Filters */}
      <div className="noir-card rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search cabals by name, token, or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-noir-dark border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-noir-dark border border-white/20 rounded-lg px-4 py-3 text-white"
          >
            <option value="all">All Cabals</option>
            <option value="active">Active (24h)</option>
            <option value="high-performance">High Performance</option>
            <option value="low-risk">Low Risk</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-noir-dark border border-white/20 rounded-lg px-4 py-3 text-white"
          >
            <option value="performance">Performance</option>
            <option value="value">Total Value</option>
            <option value="members">Members</option>
            <option value="activity">Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Cabals List */}
      <div className="space-y-6">
        {cabals.map((cabal) => (
          <div key={cabal.id} className="noir-card rounded-xl p-6">
            {/* Cabal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{cabal.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span>{cabal.members} members</span>
                    <span>•</span>
                    <span>Last active {cabal.recentActivity}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(cabal.riskLevel)}`}>
                  {cabal.riskLevel.toUpperCase()} RISK
                </div>
                <div className={`text-lg font-bold ${getPerformanceColor(cabal.performance)}`}>
                  {cabal.performance}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-noir-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70">Total Value</span>
                </div>
                <div className="text-lg font-bold text-white">{cabal.totalValue}</div>
              </div>
              
              <div className="bg-noir-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70">Avg Win Rate</span>
                </div>
                <div className="text-lg font-bold text-green-600">{cabal.avgWinRate}</div>
              </div>
              
              <div className="bg-noir-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-white/70">Top Token</span>
                </div>
                <div className="text-lg font-bold text-white">{cabal.topToken}</div>
              </div>
              
              <div className="bg-noir-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-4 h-4 rounded-full bg-green-500"></span>
                  <span className="text-sm text-white/70">Members</span>
                </div>
                <div className="text-lg font-bold text-white">{cabal.members}</div>
              </div>
            </div>

            {/* Top Members */}
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-3">Top Contributing Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {cabal.wallets.map((wallet, index) => (
                  <div key={index} className="bg-noir-dark rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{wallet.name}</span>
                      <div className="flex items-center gap-1">
                        <button className="hover:opacity-70 transition-all p-1 text-white/70">
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={`https://solscan.io/account/${wallet.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-70 transition-all p-1 text-white/70"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="text-xs text-white/70 font-mono mb-1">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
                    </div>
                    <div className="text-sm font-bold text-green-600">{wallet.contribution}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CabalFinder;