import React, { useState } from 'react';
import { Sparkles, TrendingUp, Clock, ExternalLink, Copy, Filter } from 'lucide-react';

interface FreshWallet {
  id: string;
  address: string;
  age: string;
  firstTransaction: string;
  totalValue: string;
  tokenCount: number;
  largestPosition: {
    token: string;
    symbol: string;
    value: string;
  };
  recentActivity: string;
  riskScore: number;
  potentialType: 'whale' | 'bot' | 'trader' | 'unknown';
}

const FreshWalletFeed: React.FC = () => {
  const [minValue, setMinValue] = useState('1000');
  const [walletType, setWalletType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');

  const freshWallets: FreshWallet[] = [
    {
      id: '1',
      address: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      age: '2 hours',
      firstTransaction: '2 hours ago',
      totalValue: '$125K',
      tokenCount: 5,
      largestPosition: {
        token: 'Solana',
        symbol: 'SOL',
        value: '$89K'
      },
      recentActivity: '5 min ago',
      riskScore: 85,
      potentialType: 'whale'
    },
    {
      id: '2',
      address: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      age: '6 hours',
      firstTransaction: '6 hours ago',
      totalValue: '$45K',
      tokenCount: 12,
      largestPosition: {
        token: 'Jupiter',
        symbol: 'JUP',
        value: '$23K'
      },
      recentActivity: '12 min ago',
      riskScore: 72,
      potentialType: 'trader'
    },
    {
      id: '3',
      address: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      age: '1 day',
      firstTransaction: '1 day ago',
      totalValue: '$8.9K',
      tokenCount: 3,
      largestPosition: {
        token: 'Bonk',
        symbol: 'BONK',
        value: '$5.2K'
      },
      recentActivity: '1 hour ago',
      riskScore: 45,
      potentialType: 'bot'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whale':
        return 'text-blue-600 bg-blue-600/10';
      case 'trader':
        return 'text-green-600 bg-green-600/10';
      case 'bot':
        return 'text-yellow-600 bg-yellow-600/10';
      default:
        return 'text-white/70 bg-white/10';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-contain opacity-30 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.currentTime = 0.1;
        }}
      >
        <source src="https://i.imgur.com/E490BLn.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Fresh Wallet Feed</h1>
      </div>

      {/* Filters */}
      <div className="noir-card rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
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
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            className="bg-noir-dark border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            <option value="all">All Types</option>
            <option value="whale">Potential Whales</option>
            <option value="trader">Active Traders</option>
            <option value="bot">Bot Activity</option>
          </select>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Min Value:</span>
            <select
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              className="bg-noir-dark border border-white/20 rounded-lg px-3 py-2 text-sm font-medium text-white"
            >
              <option value="1000">$1K+</option>
              <option value="10000">$10K+</option>
              <option value="50000">$50K+</option>
              <option value="100000">$100K+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fresh Wallets List */}
      <div className="space-y-4">
        {freshWallets.map((wallet) => (
          <div key={wallet.id} className="noir-card rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Wallet Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white font-mono">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(wallet.potentialType)}`}>
                        {wallet.potentialType.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/70">
                      <span>Created {wallet.age} ago</span>
                      <span>•</span>
                      <span>Last active {wallet.recentActivity}</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Total Value</div>
                    <div className="text-lg font-bold text-white">{wallet.totalValue}</div>
                  </div>
                  
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Tokens</div>
                    <div className="text-lg font-bold text-white">{wallet.tokenCount}</div>
                  </div>
                  
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Risk Score</div>
                    <div className={`text-lg font-bold ${getRiskColor(wallet.riskScore)}`}>
                      {wallet.riskScore}/100
                    </div>
                  </div>
                  
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">First TX</div>
                    <div className="text-sm font-bold text-white">{wallet.firstTransaction}</div>
                  </div>
                </div>

                {/* Largest Position */}
                <div className="bg-noir-dark rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70 mb-1">Largest Position</div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border border-white/30">
                          <span className="text-white font-bold text-xs">
                            {wallet.largestPosition.symbol.substring(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {wallet.largestPosition.symbol}
                        </span>
                        <span className="text-xs text-white/70">
                          {wallet.largestPosition.token}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {wallet.largestPosition.value}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-2 text-white/70">
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://solscan.io/account/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 hover:scale-110 transition-all p-2 text-white/70"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detection Criteria */}
      <div className="noir-card rounded-xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Fresh Wallet Detection Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Whale Indicators</h4>
            <div className="space-y-2 text-sm text-white/70">
              <div>• Large initial deposit ($50K+)</div>
              <div>• Few but high-value transactions</div>
              <div>• Focus on blue-chip tokens</div>
              <div>• Low transaction frequency</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Trader Indicators</h4>
            <div className="space-y-2 text-sm text-white/70">
              <div>• High transaction frequency</div>
              <div>• Diverse token portfolio</div>
              <div>• Quick position changes</div>
              <div>• DeFi protocol interactions</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default FreshWalletFeed;