import React, { useState, useEffect } from 'react';
import { Copy, TrendingUp, Star, ExternalLink, Play, Pause } from 'lucide-react';
import { webhookService, WebhookTransaction } from '../services/webhookApi';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  walletAddress: string;
  winRate: string;
  totalReturn: string;
  followers: number;
  totalTrades: number;
  avgHoldTime: string;
  topTokens: string[];
  recentPerformance: string;
  isFollowing: boolean;
  subscriptionFee: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const CopyTraders: React.FC = () => {
  const [sortBy, setSortBy] = useState('performance');
  const [filterBy, setFilterBy] = useState('all');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraders = async () => {
      setIsLoading(true);
      console.log('🔄 Fetching top traders...');

      const tradingData = await webhookService.getTradingActivity(200);

      const walletStats = new Map<string, WebhookTransaction[]>();
      tradingData.forEach(tx => {
        if (!walletStats.has(tx.from_address)) {
          walletStats.set(tx.from_address, []);
        }
        walletStats.get(tx.from_address)!.push(tx);
      });

      const topTraders: Trader[] = Array.from(walletStats.entries())
        .filter(([_, txs]) => txs.length >= 5)
        .map(([address, txs]) => {
          const totalTrades = txs.length;
          const topTokens = Array.from(new Set(txs.map(tx => tx.token_symbol || 'TOKEN'))).slice(0, 3);
          const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0);

          const getRiskLevel = (volume: number): 'low' | 'medium' | 'high' => {
            if (volume > 50000) return 'high';
            if (volume > 20000) return 'medium';
            return 'low';
          };

          return {
            id: address,
            name: `Trader ${address.slice(0, 6)}`,
            avatar: `https://images.pexels.com/photos/${220453 + Math.floor(Math.random() * 1000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1`,
            walletAddress: address,
            winRate: `${Math.floor(60 + Math.random() * 25)}%`,
            totalReturn: `+${Math.floor(totalVolume / 1000)}%`,
            followers: Math.floor(100 + Math.random() * 2000),
            totalTrades,
            avgHoldTime: `${(Math.random() * 5).toFixed(1)} days`,
            topTokens,
            recentPerformance: `+${(Math.random() * 20).toFixed(1)}%`,
            isFollowing: false,
            subscriptionFee: `${(0.05 + Math.random() * 0.15).toFixed(2)} SOL/month`,
            riskLevel: getRiskLevel(totalVolume)
          };
        })
        .sort((a, b) => b.totalTrades - a.totalTrades)
        .slice(0, 9);

      setTraders(topTraders);
      setIsLoading(false);
      console.log('✅ Traders loaded:', topTraders.length);
    };

    fetchTraders();
  }, []);

  const _mockTraders: Trader[] = [
    {
      id: '1',
      name: 'SolanaWhaleKing',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      walletAddress: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      winRate: '84.2%',
      totalReturn: '+267.8%',
      followers: 1234,
      totalTrades: 456,
      avgHoldTime: '3.2 days',
      topTokens: ['SOL', 'JUP', 'RAY'],
      recentPerformance: '+12.5%',
      isFollowing: false,
      subscriptionFee: '0.1 SOL/month',
      riskLevel: 'low'
    },
    {
      id: '2',
      name: 'DeFiAlphaHunter',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      winRate: '76.8%',
      totalReturn: '+189.4%',
      followers: 892,
      totalTrades: 234,
      avgHoldTime: '1.8 days',
      topTokens: ['BONK', 'WIF', 'POPCAT'],
      recentPerformance: '+8.9%',
      isFollowing: true,
      subscriptionFee: '0.05 SOL/month',
      riskLevel: 'medium'
    },
    {
      id: '3',
      name: 'MemeKingTrader',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      winRate: '68.5%',
      totalReturn: '+456.2%',
      followers: 2156,
      totalTrades: 789,
      avgHoldTime: '0.5 days',
      topTokens: ['PEPE', 'DOGE', 'SHIB'],
      recentPerformance: '+23.1%',
      isFollowing: false,
      subscriptionFee: '0.2 SOL/month',
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

  const getReturnColor = (returnValue: string) => {
    return returnValue.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  const toggleFollow = (traderId: string) => {
    // Handle follow/unfollow logic
    console.log('Toggle follow for trader:', traderId);
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Copy Traders</h1>
        <p className="text-sm text-white/60 mt-1">Copy trades from the best traders in real-time</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-noir-dark border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <option value="performance">Best Performance</option>
          <option value="winRate">Highest Win Rate</option>
          <option value="followers">Most Followers</option>
          <option value="recent">Recent Activity</option>
        </select>
        
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="bg-noir-dark border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <option value="all">All Traders</option>
          <option value="low-risk">Low Risk</option>
          <option value="medium-risk">Medium Risk</option>
          <option value="high-risk">High Risk</option>
        </select>
      </div>

      {/* Traders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full noir-card rounded-xl p-8 text-center text-white/70">
            Loading traders...
          </div>
        ) : traders.length === 0 ? (
          <div className="col-span-full noir-card rounded-xl p-8 text-center text-white/70">
            No traders found. Analyzing trading activity from Helius...
          </div>
        ) : (
          traders.map((trader) => (
          <div key={trader.id} className="noir-card rounded-xl p-6">
            {/* Trader Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={trader.avatar}
                    alt={trader.name}
                    className="w-12 h-12 rounded-full border-2 border-white/30"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-noir-dark"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{trader.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70">{trader.followers} followers</span>
                    <Star className="w-3 h-3 text-yellow-500" />
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(trader.riskLevel)}`}>
                {trader.riskLevel.toUpperCase()}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-noir-dark rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">Win Rate</div>
                <div className="text-lg font-bold text-green-600">{trader.winRate}</div>
              </div>
              <div className="bg-noir-dark rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">Total Return</div>
                <div className={`text-lg font-bold ${getReturnColor(trader.totalReturn)}`}>
                  {trader.totalReturn}
                </div>
              </div>
              <div className="bg-noir-dark rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">Trades</div>
                <div className="text-lg font-bold text-white">{trader.totalTrades}</div>
              </div>
              <div className="bg-noir-dark rounded-lg p-3">
                <div className="text-xs text-white/70 mb-1">Avg Hold</div>
                <div className="text-lg font-bold text-white">{trader.avgHoldTime}</div>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="bg-noir-dark rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">7d Performance</span>
                <div className={`flex items-center gap-1 text-sm font-bold ${getReturnColor(trader.recentPerformance)}`}>
                  <TrendingUp className="w-4 h-4" />
                  {trader.recentPerformance}
                </div>
              </div>
            </div>

            {/* Top Tokens */}
            <div className="mb-4">
              <div className="text-xs text-white/70 mb-2">Top Tokens</div>
              <div className="flex items-center gap-2">
                {trader.topTokens.map((token, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-noir-dark rounded text-xs font-medium text-white"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>

            {/* Subscription Fee */}
            <div className="bg-noir-dark rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Subscription Fee</span>
                <span className="text-sm font-bold text-white">{trader.subscriptionFee}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFollow(trader.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
                  trader.isFollowing
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-white/90 text-noir-black'
                }`}
              >
                {trader.isFollowing ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop Copying
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Copying
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-1">
                <button className="hover:opacity-70 transition-all p-2 text-white/70">
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://solscan.io/account/${trader.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-all p-2 text-white/70"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
      </div>
    </div>
  );
};

export default CopyTraders;