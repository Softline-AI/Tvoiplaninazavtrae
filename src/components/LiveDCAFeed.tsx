import React, { useState } from 'react';
import { Repeat, TrendingUp, Clock, ExternalLink, Copy, BarChart3 } from 'lucide-react';
import { useTokenLogo } from '../hooks/useTokenLogo';

interface DCAActivity {
  id: string;
  wallet: string;
  walletName: string;
  strategy: 'buy' | 'sell';
  token: string;
  tokenSymbol: string;
  amount: string;
  frequency: string;
  totalInvested: string;
  avgPrice: string;
  currentValue: string;
  pnl: string;
  nextExecution: string;
  isActive: boolean;
  contractAddress: string;
}

const LiveDCAFeed: React.FC = () => {
  const [strategyFilter, setStrategyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const dcaActivities: DCAActivity[] = [
    {
      id: '1',
      wallet: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      walletName: 'DCA Master #1',
      strategy: 'buy',
      token: 'Solana',
      tokenSymbol: 'SOL',
      amount: '10 SOL',
      frequency: 'Daily',
      totalInvested: '$45.2K',
      avgPrice: '$135.40',
      currentValue: '$52.8K',
      pnl: '+$7.6K',
      nextExecution: '2 hours',
      isActive: true,
      contractAddress: 'So11111111111111111111111111111111111111112'
    },
    {
      id: '2',
      wallet: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      walletName: 'Smart DCA Bot',
      strategy: 'buy',
      token: 'Jupiter',
      tokenSymbol: 'JUP',
      amount: '500 JUP',
      frequency: 'Every 6h',
      totalInvested: '$12.8K',
      avgPrice: '$0.92',
      currentValue: '$11.2K',
      pnl: '-$1.6K',
      nextExecution: '4 hours',
      isActive: true,
      contractAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
    },
    {
      id: '3',
      wallet: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      walletName: 'Whale DCA #3',
      strategy: 'sell',
      token: 'Raydium',
      tokenSymbol: 'RAY',
      amount: '100 RAY',
      frequency: 'Weekly',
      totalInvested: '$8.9K',
      avgPrice: '$4.45',
      currentValue: '$8.1K',
      pnl: '-$0.8K',
      nextExecution: '3 days',
      isActive: false,
      contractAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
    }
  ];

  const getStrategyColor = (strategy: string) => {
    return strategy === 'buy' 
      ? 'text-green-600 bg-green-600/10' 
      : 'text-red-600 bg-red-600/10';
  };

  const getPnLColor = (pnl: string) => {
    return pnl.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'text-green-600 bg-green-600/10'
      : 'text-white/70 bg-white/10';
  };

  const TokenLogo: React.FC<{ contractAddress: string; symbol: string }> = ({ contractAddress, symbol }) => {
    const logoUrl = useTokenLogo(contractAddress);

    return (
      <img
        src={logoUrl}
        alt={symbol}
        className="w-8 h-8 rounded-full border border-white/30"
        onError={(e) => {
          e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';
        }}
      />
    );
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
        <h1 className="text-xl mb-1 font-semibold text-white">Live DCA Feed</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['all', 'buy', 'sell'].map((strategy) => (
            <button
              key={strategy}
              onClick={() => setStrategyFilter(strategy)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                strategyFilter === strategy
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {strategy === 'all' ? 'All Strategies' : `${strategy} DCA`}
            </button>
          ))}
        </div>
        
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['active', 'paused', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                statusFilter === status
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* DCA Activities */}
      <div className="space-y-4">
        {dcaActivities.map((activity) => (
          <div key={activity.id} className="noir-card rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Activity Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30">
                    <Repeat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white">{activity.walletName}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStrategyColor(activity.strategy)}`}>
                        {activity.strategy.toUpperCase()} DCA
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.isActive)}`}>
                        {activity.isActive ? 'ACTIVE' : 'PAUSED'}
                      </div>
                    </div>
                    <div className="text-xs text-white/70 font-mono">
                      {activity.wallet.slice(0, 8)}...{activity.wallet.slice(-4)}
                    </div>
                  </div>
                </div>

                {/* Token Info */}
                <div className="flex items-center gap-3 mb-4">
                  <TokenLogo contractAddress={activity.contractAddress} symbol={activity.tokenSymbol} />
                  <div>
                    <div className="text-sm font-bold text-white">{activity.tokenSymbol}</div>
                    <div className="text-xs text-white/70">{activity.token}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-white">{activity.amount}</div>
                    <div className="text-xs text-white/70">{activity.frequency}</div>
                  </div>
                </div>

                {/* DCA Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Total Invested</div>
                    <div className="text-sm font-bold text-white">{activity.totalInvested}</div>
                  </div>
                  
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Avg Price</div>
                    <div className="text-sm font-bold text-white">{activity.avgPrice}</div>
                  </div>
                  
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">Current Value</div>
                    <div className="text-sm font-bold text-white">{activity.currentValue}</div>
                  </div>
                  
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="text-xs text-white/70 mb-1">P&L</div>
                    <div className={`text-sm font-bold ${getPnLColor(activity.pnl)}`}>
                      {activity.pnl}
                    </div>
                  </div>
                </div>

                {/* Next Execution */}
                <div className="bg-noir-dark rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/70" />
                      <span className="text-sm text-white/70">Next Execution</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {activity.isActive ? `In ${activity.nextExecution}` : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-2 text-white/70">
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-2 text-white/70">
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://solscan.io/account/${activity.wallet}`}
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

      {/* DCA Statistics */}
      <div className="noir-card rounded-xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">DCA Market Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-noir-dark rounded-lg p-4">
            <div className="text-xs text-white/70 mb-1">Active Strategies</div>
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-xs text-green-600">+12% this week</div>
          </div>
          
          <div className="bg-noir-dark rounded-lg p-4">
            <div className="text-xs text-white/70 mb-1">Total DCA Volume</div>
            <div className="text-2xl font-bold text-white">$45.2M</div>
            <div className="text-xs text-green-600">+8.5% today</div>
          </div>
          
          <div className="bg-noir-dark rounded-lg p-4">
            <div className="text-xs text-white/70 mb-1">Avg Success Rate</div>
            <div className="text-2xl font-bold text-green-600">73.8%</div>
            <div className="text-xs text-white/70">Profitable strategies</div>
          </div>
          
          <div className="bg-noir-dark rounded-lg p-4">
            <div className="text-xs text-white/70 mb-1">Most Popular Token</div>
            <div className="text-2xl font-bold text-white">SOL</div>
            <div className="text-xs text-white/70">34% of all DCA</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LiveDCAFeed;