import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Bell, Settings, ExternalLink, Copy, Plus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface MonitoredWallet {
  id: string;
  wallet_address: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  twitter_handle: string | null;
  twitter_avatar: string | null;
}

interface Stalk {
  id: string;
  name: string;
  type: 'wallet' | 'token' | 'kol';
  target: string;
  targetName: string;
  alertsEnabled: boolean;
  totalAlerts: number;
  lastActivity: string;
  performance: string;
  isPositive: boolean;
  createdDate: string;
  settings: {
    minValue: string;
    alertTypes: string[];
  };
}

const MyStalks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [monitoredWallets, setMonitoredWallets] = useState<MonitoredWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoredWallets();
  }, []);

  const fetchMonitoredWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('monitored_wallets')
        .select('id, wallet_address, label, is_active, created_at, updated_at, twitter_handle, twitter_avatar')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonitoredWallets(data || []);
    } catch (error) {
      console.error('Error fetching monitored wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const stalks: Stalk[] = [
    {
      id: '1',
      name: 'Whale Tracker #1',
      type: 'wallet',
      target: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      targetName: 'Smart Whale',
      alertsEnabled: true,
      totalAlerts: 23,
      lastActivity: '2 hours ago',
      performance: '+12.5%',
      isPositive: true,
      createdDate: '2024-01-10',
      settings: {
        minValue: '$10K',
        alertTypes: ['Large Trades', 'New Positions']
      }
    },
    {
      id: '2',
      name: 'SOL Price Tracker',
      type: 'token',
      target: 'So11111111111111111111111111111111111111112',
      targetName: 'Solana (SOL)',
      alertsEnabled: true,
      totalAlerts: 45,
      lastActivity: '15 min ago',
      performance: '+8.9%',
      isPositive: true,
      createdDate: '2024-01-08',
      settings: {
        minValue: '$1K',
        alertTypes: ['Price Changes', 'Volume Spikes']
      }
    },
    {
      id: '3',
      name: 'KOL Alpha Hunter',
      type: 'kol',
      target: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      targetName: 'DeFiAlphaHunter',
      alertsEnabled: false,
      totalAlerts: 12,
      lastActivity: '1 day ago',
      performance: '-2.1%',
      isPositive: false,
      createdDate: '2024-01-05',
      settings: {
        minValue: '$5K',
        alertTypes: ['New Trades', 'Strategy Changes']
      }
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wallet':
        return 'text-blue-600 bg-blue-600/10';
      case 'token':
        return 'text-green-600 bg-green-600/10';
      case 'kol':
        return 'text-purple-600 bg-purple-600/10';
      default:
        return 'text-white/70 bg-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wallet':
        return '👛';
      case 'token':
        return '🪙';
      case 'kol':
        return '👑';
      default:
        return '📊';
    }
  };

  const getPerformanceColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl mb-1 font-semibold text-white flex items-center gap-2">
              <Target className="w-6 h-6" />
              My Stalks
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-noir-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Stalk
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-noir-dark border border-white/20 rounded-xl p-1">
        {[
          { id: 'active', label: 'Active Stalks' },
          { id: 'paused', label: 'Paused' },
          { id: 'alerts', label: 'Recent Alerts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-noir-black'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Stalks */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Monitored Wallets from Database */}
          {loading ? (
            <div className="noir-card rounded-xl p-12 text-center">
              <div className="text-white/70">Loading monitored wallets...</div>
            </div>
          ) : monitoredWallets.length > 0 ? (
            monitoredWallets.map((wallet) => (
              <div key={wallet.id} className="noir-card rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {wallet.twitter_avatar ? (
                        <img
                          src={wallet.twitter_avatar}
                          alt={wallet.label || 'Trader'}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="text-2xl">👛</div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">
                            {wallet.label || 'Monitored Wallet'}
                          </h3>
                          <div className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-600/10">
                            WALLET
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            wallet.is_active ? 'text-green-600 bg-green-600/10' : 'text-white/70 bg-white/10'
                          }`}>
                            <Bell className="w-3 h-3" />
                            {wallet.is_active ? 'ACTIVE' : 'PAUSED'}
                          </div>
                        </div>
                        <div className="text-sm text-white/70">
                          Tracking wallet transactions
                        </div>
                      </div>
                    </div>

                    <div className="bg-noir-dark rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-white/70 mb-1">Wallet Address</div>
                          <div className="text-sm font-mono text-white">
                            {wallet.wallet_address.slice(0, 8)}...{wallet.wallet_address.slice(-4)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(wallet.wallet_address)}
                            className="hover:opacity-70 transition-all p-1 text-white/70"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://solscan.io/account/${wallet.wallet_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-all p-1 text-white/70"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-noir-dark rounded-lg p-3">
                        <div className="text-xs text-white/70 mb-1">Status</div>
                        <div className="text-sm font-bold text-white">
                          {wallet.is_active ? 'Monitoring' : 'Paused'}
                        </div>
                      </div>

                      <div className="bg-noir-dark rounded-lg p-3">
                        <div className="text-xs text-white/70 mb-1">Added</div>
                        <div className="text-sm font-bold text-white">
                          {new Date(wallet.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="bg-noir-dark rounded-lg p-3">
                        <div className="text-xs text-white/70 mb-1">Type</div>
                        <div className="text-sm font-bold text-white">Wallet</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button className="hover:opacity-70 transition-all p-2 text-white/70">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className={`hover:opacity-70 transition-all p-2 ${
                      wallet.is_active ? 'text-green-600' : 'text-white/70'
                    }`}>
                      <Bell className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="noir-card rounded-xl p-12 text-center">
              <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Monitored Wallets</h3>
              <p className="text-white/70">
                Add wallets to start monitoring their transactions
              </p>
            </div>
          )}

          {/* Example Stalks */}
          {stalks.map((stalk) => (
            <div key={stalk.id} className="noir-card rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Stalk Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">{getTypeIcon(stalk.type)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{stalk.name}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(stalk.type)}`}>
                          {stalk.type.toUpperCase()}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          stalk.alertsEnabled ? 'text-green-600 bg-green-600/10' : 'text-white/70 bg-white/10'
                        }`}>
                          <Bell className="w-3 h-3" />
                          {stalk.alertsEnabled ? 'ACTIVE' : 'PAUSED'}
                        </div>
                      </div>
                      <div className="text-sm text-white/70">
                        Tracking: {stalk.targetName}
                      </div>
                    </div>
                  </div>

                  {/* Target Info */}
                  <div className="bg-noir-dark rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/70 mb-1">Target</div>
                        <div className="text-sm font-mono text-white">
                          {stalk.target.slice(0, 8)}...{stalk.target.slice(-4)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="hover:opacity-70 transition-all p-1 text-white/70">
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://solscan.io/account/${stalk.target}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-70 transition-all p-1 text-white/70"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-noir-dark rounded-lg p-3">
                      <div className="text-xs text-white/70 mb-1">Total Alerts</div>
                      <div className="text-lg font-bold text-white">{stalk.totalAlerts}</div>
                    </div>
                    
                    <div className="bg-noir-dark rounded-lg p-3">
                      <div className="text-xs text-white/70 mb-1">Performance</div>
                      <div className={`text-lg font-bold ${getPerformanceColor(stalk.isPositive)}`}>
                        {stalk.performance}
                      </div>
                    </div>
                    
                    <div className="bg-noir-dark rounded-lg p-3">
                      <div className="text-xs text-white/70 mb-1">Last Activity</div>
                      <div className="text-sm font-bold text-white">{stalk.lastActivity}</div>
                    </div>
                    
                    <div className="bg-noir-dark rounded-lg p-3">
                      <div className="text-xs text-white/70 mb-1">Created</div>
                      <div className="text-sm font-bold text-white">{stalk.createdDate}</div>
                    </div>
                  </div>

                  {/* Alert Settings */}
                  <div className="bg-noir-dark rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/70">Alert Settings</span>
                      <span className="text-xs text-white/70">Min Value: {stalk.settings.minValue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stalk.settings.alertTypes.map((alertType, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-noir-black text-white/70 rounded text-xs"
                        >
                          {alertType}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button className="hover:opacity-70 transition-all p-2 text-white/70">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className={`hover:opacity-70 transition-all p-2 ${
                    stalk.alertsEnabled ? 'text-green-600' : 'text-white/70'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paused Tab */}
      {activeTab === 'paused' && (
        <div className="noir-card rounded-xl p-12 text-center">
          <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Paused Stalks</h3>
          <p className="text-white/70">
            All your stalks are currently active and monitoring targets
          </p>
        </div>
      )}

      {/* Recent Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="noir-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Large Buy Alert</div>
                <div className="text-xs text-white/70">Whale Tracker #1 • 2 hours ago</div>
              </div>
            </div>
            <p className="text-sm text-white/70">
              Smart Whale purchased 1,250 SOL worth $177,875 at $142.30 per token
            </p>
          </div>
          
          <div className="noir-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Price Movement Alert</div>
                <div className="text-xs text-white/70">SOL Price Tracker • 15 min ago</div>
              </div>
            </div>
            <p className="text-sm text-white/70">
              SOL price increased by 8.9% in the last hour, reaching $142.30
            </p>
          </div>
        </div>
      )}

      {/* Add Stalk Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="noir-card rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add New Stalk</h3>
            <p className="text-white/70 mb-4">
              Feature coming soon! You'll be able to add custom stalks for wallets, tokens, and KOLs.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="bg-white text-noir-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStalks;