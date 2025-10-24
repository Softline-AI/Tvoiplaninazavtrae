import React, { useState } from 'react';
import { Clock, TrendingUp, Filter, ExternalLink, Copy } from 'lucide-react';

interface LegacyTrade {
  id: string;
  timestamp: string;
  trader: string;
  traderAvatar: string;
  action: 'buy' | 'sell';
  token: string;
  tokenSymbol: string;
  amount: string;
  price: string;
  value: string;
  walletAddress: string;
  twitterHandle: string;
}

const KOLFeedLegacy: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [actionFilter, setActionFilter] = useState('all');

  const legacyTrades: LegacyTrade[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:32:18',
      trader: 'SolanaWhaleKing',
      traderAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      action: 'buy',
      token: 'Solana',
      tokenSymbol: 'SOL',
      amount: '1,250 SOL',
      price: '$142.30',
      value: '$177,875',
      walletAddress: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      twitterHandle: 'solanawhaleking'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:28:45',
      trader: 'DeFiAlphaHunter',
      traderAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      action: 'sell',
      token: 'Jupiter',
      tokenSymbol: 'JUP',
      amount: '50,000 JUP',
      price: '$0.89',
      value: '$44,500',
      walletAddress: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      twitterHandle: 'defialphaHunter'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:25:12',
      trader: 'MemeKingTrader',
      traderAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
      action: 'buy',
      token: 'Bonk',
      tokenSymbol: 'BONK',
      amount: '100M BONK',
      price: '$0.000034',
      value: '$3,400',
      walletAddress: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      twitterHandle: 'memekingtrader'
    }
  ];

  const getActionColor = (action: string) => {
    return action === 'buy' ? 'text-green-600' : 'text-red-600';
  };

  const getActionBg = (action: string) => {
    return action === 'buy' ? 'bg-green-600/10' : 'bg-red-600/10';
  };

  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 right-0 bottom-0 h-full object-cover opacity-30 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen', left: '0', width: '100%' }}
      onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.currentTime = 0.1;
        }}
      >
        <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
      </video>
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">KOL Feed Legacy</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['1h', '6h', '24h', '7d', '30d'].map((period) => (
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
        
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['all', 'buy', 'sell'].map((action) => (
            <button
              key={action}
              onClick={() => setActionFilter(action)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                actionFilter === action
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {action === 'all' ? 'All Actions' : action}
            </button>
          ))}
        </div>
      </div>

      {/* Legacy Feed Table */}
      <div className="noir-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-noir-dark border-b border-white/20">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Trader
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Action
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Token
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Price
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Total Value
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Links
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {legacyTrades.map((trade) => (
                <tr key={trade.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white/70">{trade.timestamp}</div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={trade.traderAvatar}
                        alt={trade.trader}
                        className="w-8 h-8 rounded-full border border-white/30"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{trade.trader}</div>
                        <div className="text-xs text-white/70">@{trade.twitterHandle}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getActionColor(trade.action)} ${getActionBg(trade.action)}`}>
                      <TrendingUp className={`w-4 h-4 ${trade.action === 'sell' ? 'rotate-180' : ''}`} />
                      {trade.action.toUpperCase()}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border border-white/30">
                        <span className="text-white font-bold text-xs">
                          {trade.tokenSymbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{trade.tokenSymbol}</div>
                        <div className="text-xs text-white/70">{trade.token}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{trade.amount}</div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{trade.price}</div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getActionColor(trade.action)}`}>
                      {trade.value}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://solscan.io/account/${trade.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 hover:scale-110 transition-all p-1 text-white/70"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://twitter.com/${trade.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 hover:scale-110 transition-all p-1 text-blue-400"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="noir-card rounded-xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Export Historical Data</h3>
        <div className="flex items-center gap-4">
          <button className="bg-white text-noir-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all">
            Export CSV
          </button>
          <button className="bg-noir-dark border border-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all">
            Export JSON
          </button>
          <div className="ml-auto text-sm text-white/70">
            Showing {legacyTrades.length} transactions from the last {timeFilter}
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default KOLFeedLegacy;