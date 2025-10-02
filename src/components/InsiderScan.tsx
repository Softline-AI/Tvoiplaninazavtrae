import React, { useState } from 'react';
import { Eye, AlertTriangle, TrendingUp, Clock, ExternalLink, Copy } from 'lucide-react';

interface InsiderActivity {
  id: string;
  type: 'large_buy' | 'large_sell' | 'new_position' | 'whale_move';
  wallet: string;
  walletName: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  value: string;
  timestamp: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  contractAddress: string;
}

const InsiderScan: React.FC = () => {
  const [alertLevel, setAlertLevel] = useState('all');
  const [timeFilter, setTimeFilter] = useState('1h');

  const activities: InsiderActivity[] = [
    {
      id: '1',
      type: 'large_buy',
      wallet: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      walletName: 'Insider Whale #1',
      token: 'Unknown Token',
      tokenSymbol: 'ALPHA',
      amount: '50M ALPHA',
      value: '$2.5M',
      timestamp: '2 min ago',
      confidence: 'high',
      description: 'Large accumulation before announcement',
      contractAddress: '5ThrLJDFpJqaFL36AvAX8ECZmz6n4vZvqMYvpHHkpump'
    },
    {
      id: '2',
      type: 'whale_move',
      wallet: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      walletName: 'Smart Money #2',
      token: 'Jupiter',
      tokenSymbol: 'JUP',
      amount: '100K JUP',
      value: '$89K',
      timestamp: '8 min ago',
      confidence: 'high',
      description: 'Unusual activity from dormant wallet',
      contractAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
    },
    {
      id: '3',
      type: 'new_position',
      wallet: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      walletName: 'Insider #3',
      token: 'Raydium',
      tokenSymbol: 'RAY',
      amount: '25K RAY',
      value: '$105K',
      timestamp: '15 min ago',
      confidence: 'medium',
      description: 'First-time position in trending token',
      contractAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'large_buy':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'large_sell':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'new_position':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'whale_move':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Eye className="w-4 h-4 text-white/70" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'large_buy':
        return 'text-green-600 bg-green-600/10';
      case 'large_sell':
        return 'text-red-600 bg-red-600/10';
      case 'new_position':
        return 'text-blue-600 bg-blue-600/10';
      case 'whale_move':
        return 'text-yellow-600 bg-yellow-600/10';
      default:
        return 'text-white/70 bg-white/10';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-600/10';
      case 'medium':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'low':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-white/70 bg-white/10';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'large_buy':
        return 'LARGE BUY';
      case 'large_sell':
        return 'LARGE SELL';
      case 'new_position':
        return 'NEW POSITION';
      case 'whale_move':
        return 'WHALE MOVE';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Insider Scan</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['all', 'high', 'medium'].map((level) => (
            <button
              key={level}
              onClick={() => setAlertLevel(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                alertLevel === level
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {level === 'all' ? 'All Alerts' : `${level} Confidence`}
            </button>
          ))}
        </div>
        
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

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="noir-card rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Activity Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(activity.type)}`}>
                    {getTypeIcon(activity.type)}
                    {getTypeLabel(activity.type)}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(activity.confidence)}`}>
                    {activity.confidence.toUpperCase()} CONFIDENCE
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white/70">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                  </div>
                </div>

                {/* Activity Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-white/70 mb-1">Wallet</div>
                    <div className="text-sm font-bold text-white">{activity.walletName}</div>
                    <div className="text-xs text-white/50 font-mono">
                      {activity.wallet.slice(0, 8)}...{activity.wallet.slice(-4)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-white/70 mb-1">Token</div>
                    <div className="text-sm font-bold text-white">{activity.tokenSymbol}</div>
                    <div className="text-xs text-white/50">{activity.token}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-white/70 mb-1">Amount & Value</div>
                    <div className="text-sm font-bold text-white">{activity.amount}</div>
                    <div className="text-xs text-green-600 font-bold">{activity.value}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-noir-dark rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Insider Alert</div>
                      <div className="text-sm text-white/70">{activity.description}</div>
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

      {/* Alert Settings */}
      <div className="noir-card rounded-xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Detection Thresholds</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Large Transaction</span>
                <span className="text-sm text-white/70">$100K+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Whale Movement</span>
                <span className="text-sm text-white/70">$1M+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Unusual Activity</span>
                <span className="text-sm text-white/70">3x avg volume</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-white">High confidence alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-white">Whale movements</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-white">New positions</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsiderScan;