import React, { useState } from 'react';
import { Search, Wallet, ExternalLink, Copy, TrendingUp, DollarSign } from 'lucide-react';
import { birdeyeService } from '../services/birdeyeApi';

interface WalletData {
  address: string;
  name: string;
  balance: string;
  totalValue: string;
  winRate: string;
  totalTrades: number;
  profitLoss: string;
  topTokens: Array<{
    symbol: string;
    amount: string;
    value: string;
  }>;
  recentActivity: string;
  riskScore: 'low' | 'medium' | 'high';
}

const WalletFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WalletData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const mockWallets: WalletData[] = [
    {
      address: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      name: 'Smart Whale #1',
      balance: '12,450 SOL',
      totalValue: '$1.77M',
      winRate: '78.5%',
      totalTrades: 1234,
      profitLoss: '+$456K',
      topTokens: [
        { symbol: 'SOL', amount: '12,450', value: '$1.77M' },
        { symbol: 'BONK', amount: '50M', value: '$1.7K' },
        { symbol: 'JUP', amount: '5,000', value: '$4.45K' }
      ],
      recentActivity: '2 min ago',
      riskScore: 'low'
    },
    {
      address: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      name: 'KOL Trader Pro',
      balance: '8,920 SOL',
      totalValue: '$1.27M',
      winRate: '65.2%',
      totalTrades: 892,
      profitLoss: '+$234K',
      topTokens: [
        { symbol: 'SOL', amount: '8,920', value: '$1.27M' },
        { symbol: 'RAY', amount: '2,500', value: '$10.6K' },
        { symbol: 'WIF', amount: '1,000', value: '$2.87K' }
      ],
      recentActivity: '15 min ago',
      riskScore: 'medium'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      console.log('🔍 Searching wallet with Birdeye:', searchQuery);
      const walletData = await birdeyeService.getWalletTokenBalance(searchQuery.trim());

      if (walletData && walletData.items) {
        const topTokens = walletData.items
          .slice(0, 5)
          .map((item: any) => ({
            symbol: item.symbol || 'Unknown',
            amount: (item.uiAmount || 0).toFixed(2),
            value: `$${(item.valueUsd || 0).toFixed(2)}`
          }));

        const totalValue = walletData.items.reduce((sum: number, item: any) => sum + (item.valueUsd || 0), 0);

        const walletResult: WalletData = {
          address: searchQuery.trim(),
          name: 'Wallet',
          balance: `${(walletData.totalUsd / 142.35).toFixed(2)} SOL`,
          totalValue: `$${totalValue.toFixed(2)}`,
          winRate: '-',
          totalTrades: 0,
          profitLoss: '-',
          topTokens: topTokens,
          recentActivity: 'Just now',
          riskScore: 'medium'
        };

        setSearchResults([walletResult]);
        console.log('🔍 Wallet data found:', walletResult);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching wallet:', error);
      setSearchResults(mockWallets);
    } finally {
      setIsSearching(false);
    }
  };

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

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Wallet Finder</h1>
      </div>

      {/* Search */}
      <div className="noir-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Enter wallet address, ENS name, or search by token holdings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-noir-dark border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-white text-noir-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          {searchResults.map((wallet) => (
            <div key={wallet.address} className="noir-card rounded-xl p-6">
              {/* Wallet Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border-2 border-white/30">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{wallet.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/70 font-mono">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
                      </span>
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
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(wallet.riskScore)}`}>
                  {wallet.riskScore.toUpperCase()} RISK
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-noir-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Balance</span>
                  </div>
                  <div className="text-lg font-bold text-white">{wallet.balance}</div>
                  <div className="text-sm text-white/50">{wallet.totalValue}</div>
                </div>
                
                <div className="bg-noir-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Win Rate</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">{wallet.winRate}</div>
                  <div className="text-sm text-white/50">{wallet.totalTrades} trades</div>
                </div>
                
                <div className="bg-noir-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">P&L</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">{wallet.profitLoss}</div>
                  <div className="text-sm text-white/50">All time</div>
                </div>
                
                <div className="bg-noir-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 rounded-full bg-green-500"></span>
                    <span className="text-sm text-white/70">Last Active</span>
                  </div>
                  <div className="text-lg font-bold text-white">{wallet.recentActivity}</div>
                  <div className="text-sm text-white/50">Online</div>
                </div>
              </div>

              {/* Top Holdings */}
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-3">Top Holdings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {wallet.topTokens.map((token, index) => (
                    <div key={index} className="bg-noir-dark rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border border-white/30">
                            <span className="text-white font-bold text-xs">
                              {token.symbol.substring(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">{token.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">{token.amount}</div>
                          <div className="text-xs text-white/70">{token.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && (
        <div className="noir-card rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Search for Wallets</h3>
          <p className="text-white/70">
            Enter a wallet address, ENS name, or search criteria to analyze smart money wallets
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletFinder;