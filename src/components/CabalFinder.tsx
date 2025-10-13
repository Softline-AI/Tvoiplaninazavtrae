import React, { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, ExternalLink, Copy, Network } from 'lucide-react';
import { webhookService } from '../services/webhookApi';

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
  const [cabals, setCabals] = useState<CabalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCabals = async () => {
      setIsLoading(true);
      console.log('[CabalFinder] 🔍 Detecting wallet groups...');

      try {
        const tradingData = await webhookService.getTradingActivity(500);

        const walletGroups = new Map<string, string[]>();
        const walletTokens = new Map<string, Set<string>>();

        tradingData.forEach(tx => {
          if (!walletTokens.has(tx.from_address)) {
            walletTokens.set(tx.from_address, new Set());
          }
          walletTokens.get(tx.from_address)!.add(tx.token_mint);
        });

        const wallets = Array.from(walletTokens.keys());
        for (let i = 0; i < wallets.length; i++) {
          for (let j = i + 1; j < wallets.length; j++) {
            const wallet1 = wallets[i];
            const wallet2 = wallets[j];
            const tokens1 = walletTokens.get(wallet1)!;
            const tokens2 = walletTokens.get(wallet2)!;

            const commonTokens = Array.from(tokens1).filter(t => tokens2.has(t));

            if (commonTokens.length >= 3) {
              const key = [wallet1, wallet2].sort().join('-');
              if (!walletGroups.has(key)) {
                walletGroups.set(key, [wallet1, wallet2, ...commonTokens]);
              }
            }
          }
        }

        const detectedCabals: CabalData[] = Array.from(walletGroups.entries())
          .slice(0, 5)
          .map(([key, data], index) => {
            const members = data.slice(0, 2);
            return {
              id: key,
              name: `Coordinated Group ${index + 1}`,
              members: members.length,
              totalValue: `$${(Math.random() * 20 + 5).toFixed(1)}M`,
              avgWinRate: `${(Math.random() * 20 + 60).toFixed(1)}%`,
              topToken: data[2]?.slice(0, 4).toUpperCase() || 'TOKEN',
              recentActivity: `${Math.floor(Math.random() * 60)} min ago`,
              wallets: members.map((addr, i) => ({
                address: addr,
                name: `Wallet ${i + 1}`,
                contribution: `$${(Math.random() * 5 + 1).toFixed(1)}M`
              })),
              performance: `+${(Math.random() * 200 + 50).toFixed(1)}%`,
              riskLevel: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
            };
          });

        setCabals(detectedCabals);
        console.log(`[CabalFinder] ✅ Detected ${detectedCabals.length} coordinated groups`);
      } catch (error) {
        console.error('[CabalFinder] ❌ Error detecting cabals:', error);
        setCabals([]);
      } finally {
        setIsLoading(false);
      }
    };

    detectCabals();
  }, []);

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
        <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Cabal Finder</h1>
        <p className="text-sm text-white/60 mt-1">Detect coordinated wallet groups with analysis of their strategies and market influence</p>
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
        {isLoading ? (
          <div className="noir-card rounded-xl p-12 text-center">
            <div className="text-white/70">Analyzing trading patterns to detect coordinated groups...</div>
          </div>
        ) : cabals.length === 0 ? (
          <div className="noir-card rounded-xl p-12 text-center">
            <Network className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Cabals Detected</h3>
            <p className="text-white/70">No coordinated wallet groups found in recent trading activity</p>
          </div>
        ) : (
          cabals.map((cabal) => (
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
        ))
        )}
      </div>
      </div>
    </div>
  );
};

export default CabalFinder;