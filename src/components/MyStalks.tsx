import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Bell, Settings, ExternalLink, Copy, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { TrackedTokensTab } from './TrackedTokensTab';

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

interface SmartMoneyWallet {
  id: string;
  wallet_address: string;
  nickname: string;
  twitter_handle?: string;
  created_at: string;
}

interface RecentTransaction {
  id: string;
  wallet_address: string;
  transaction_type: 'buy' | 'sell';
  token_symbol: string;
  token_address: string;
  token_amount: number;
  usd_value: number;
  timestamp: string;
  nickname: string;
  market_cap?: number;
  token_pnl?: number;
  transaction_signature?: string;
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
  const [activeTab, setActiveTab] = useState('tokens');
  const [showAddModal, setShowAddModal] = useState(false);
  const [monitoredWallets, setMonitoredWallets] = useState<MonitoredWallet[]>([]);
  const [smartMoneyWallets, setSmartMoneyWallets] = useState<SmartMoneyWallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<RecentTransaction | null>(null);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newTwitterHandle, setNewTwitterHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonitoredWallets();
    loadSmartMoneyWallets();
    loadRecentTransactions();
  }, []);

  useEffect(() => {
    // Subscribe to real-time transactions
    const transactionSubscription = supabase
      .channel('smart_money_transactions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'webhook_transactions'
      }, (payload) => {
        const newTx = payload.new;
        const trackedWallet = smartMoneyWallets.find(w => w.wallet_address === newTx.from_address);

        if (trackedWallet && (newTx.transaction_type === 'BUY' || newTx.transaction_type === 'SELL')) {
          const transaction: RecentTransaction = {
            id: newTx.id,
            wallet_address: newTx.from_address,
            transaction_type: newTx.transaction_type.toLowerCase(),
            token_symbol: newTx.token_symbol,
            token_address: newTx.token_mint,
            token_amount: newTx.amount,
            usd_value: newTx.sol_amount * 150 || 0,
            timestamp: newTx.block_time,
            nickname: trackedWallet.nickname,
            market_cap: newTx.market_cap,
            token_pnl: newTx.token_pnl,
            transaction_signature: newTx.transaction_signature
          };

          showNotification(transaction);
          setRecentTransactions(prev => [transaction, ...prev.slice(0, 49)]);
        }
      })
      .subscribe();

    return () => {
      transactionSubscription.unsubscribe();
    };
  }, [smartMoneyWallets]);

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

  const loadSmartMoneyWallets = async () => {
    const { data } = await supabase
      .from('smart_money_wallets')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setSmartMoneyWallets(data);
    }
  };

  const loadRecentTransactions = async () => {
    const { data: wallets } = await supabase
      .from('smart_money_wallets')
      .select('wallet_address, nickname');

    if (!wallets || wallets.length === 0) {
      setRecentTransactions([]);
      return;
    }

    const walletAddresses = wallets.map(w => w.wallet_address);
    const walletMap = new Map(wallets.map(w => [w.wallet_address, w.nickname]));

    const { data } = await supabase
      .from('webhook_transactions')
      .select('*')
      .in('from_address', walletAddresses)
      .in('transaction_type', ['BUY', 'SELL'])
      .neq('token_symbol', 'UNKNOWN')
      .order('block_time', { ascending: false })
      .limit(50);

    if (data) {
      const transactions: RecentTransaction[] = data.map(tx => ({
        id: tx.id,
        wallet_address: tx.from_address,
        transaction_type: tx.transaction_type.toLowerCase(),
        token_symbol: tx.token_symbol,
        token_address: tx.token_mint,
        token_amount: tx.amount,
        usd_value: tx.sol_amount * 150 || 0,
        timestamp: tx.block_time,
        nickname: walletMap.get(tx.from_address) || 'Unknown',
        market_cap: tx.market_cap,
        token_pnl: tx.token_pnl,
        transaction_signature: tx.transaction_signature
      }));
      setRecentTransactions(transactions);
    }
  };

  const validateSolanaAddress = (address: string): boolean => {
    const solanaAddressPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaAddressPattern.test(address);
  };

  const addSmartMoneyWallet = async () => {
    setError('');

    if (!newWalletAddress.trim()) {
      setError('Enter wallet address');
      return;
    }

    if (!validateSolanaAddress(newWalletAddress)) {
      setError('Invalid Solana wallet address');
      return;
    }

    if (!newNickname.trim()) {
      setError('Enter trader name');
      return;
    }

    const existing = smartMoneyWallets.find(w => w.wallet_address === newWalletAddress);
    if (existing) {
      setError('This wallet is already tracked');
      return;
    }

    setIsAdding(true);

    const { data, error: insertError } = await supabase
      .from('smart_money_wallets')
      .insert([{
        wallet_address: newWalletAddress.trim(),
        nickname: newNickname.trim(),
        twitter_handle: newTwitterHandle.trim() || null
      }])
      .select()
      .maybeSingle();

    setIsAdding(false);

    if (insertError) {
      setError('Error adding wallet');
      return;
    }

    if (data) {
      setSmartMoneyWallets([data, ...smartMoneyWallets]);
      setNewWalletAddress('');
      setNewNickname('');
      setNewTwitterHandle('');
      setShowAddModal(false);
    }
  };

  const removeSmartMoneyWallet = async (id: string) => {
    const { error } = await supabase
      .from('smart_money_wallets')
      .delete()
      .eq('id', id);

    if (!error) {
      setSmartMoneyWallets(smartMoneyWallets.filter(w => w.id !== id));
      loadRecentTransactions();
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVarg7K1aFgxDmeHxwWgjBSuCy/HZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFg==');
    audio.play().catch(() => {});
  };

  const showNotification = (transaction: RecentTransaction) => {
    playNotificationSound();
    setNotification(transaction);
    setTimeout(() => setNotification(null), 5000);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffMs = now.getTime() - txTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
        return 'text-orange-600 bg-orange-600/10';
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
              My Smarts
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-noir-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Smart
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-noir-dark border border-white/20 rounded-xl p-1">
        {[
          { id: 'tokens', label: '🪙 Tokens' },
          { id: 'active', label: 'Active Stalks' },
          { id: 'smart-money', label: 'Smart Money' },
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

      {/* Tokens Tab */}
      {activeTab === 'tokens' && <TrackedTokensTab />}

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
              <div
                key={wallet.id}
                className="noir-card rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => window.open(`https://solscan.io/account/${wallet.wallet_address}`, '_blank')}
              >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(wallet.wallet_address);
                            }}
                            className="hover:opacity-70 transition-all p-1 text-white/70"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://solscan.io/account/${wallet.wallet_address}`, '_blank');
                            }}
                            className="hover:opacity-70 transition-all p-1 text-white/70"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
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
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="hover:opacity-70 transition-all p-2 text-white/70"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className={`hover:opacity-70 transition-all p-2 ${
                        wallet.is_active ? 'text-green-600' : 'text-white/70'
                      }`}
                    >
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
            <div
              key={stalk.id}
              className="noir-card rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-all"
              onClick={() => window.open(`https://solscan.io/account/${stalk.target}`, '_blank')}
            >
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(stalk.target);
                          }}
                          className="hover:opacity-70 transition-all p-1 text-white/70"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://solscan.io/account/${stalk.target}`, '_blank');
                          }}
                          className="hover:opacity-70 transition-all p-1 text-white/70"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
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
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="hover:opacity-70 transition-all p-2 text-white/70"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className={`hover:opacity-70 transition-all p-2 ${
                      stalk.alertsEnabled ? 'text-green-600' : 'text-white/70'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Money Tab */}
      {activeTab === 'smart-money' && (
        <div className="space-y-6">
          {/* Add Wallet Form */}
          <div className="noir-card rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Track Smart Money Wallets</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Wallet Address"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                className="px-4 py-3 bg-noir-dark border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
              <input
                type="text"
                placeholder="Trader Name"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="px-4 py-3 bg-noir-dark border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
              <input
                type="text"
                placeholder="Twitter handle (optional)"
                value={newTwitterHandle}
                onChange={(e) => setNewTwitterHandle(e.target.value)}
                className="px-4 py-3 bg-noir-dark border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={addSmartMoneyWallet}
              disabled={isAdding}
              className="bg-white text-noir-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {isAdding ? 'Adding...' : 'Add Wallet'}
            </button>
          </div>

          {/* Tracked Wallets & Recent Transactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tracked Wallets */}
            <div className="noir-card rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Tracked Wallets ({smartMoneyWallets.length})</h2>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {smartMoneyWallets.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    No tracked wallets yet
                  </div>
                ) : (
                  smartMoneyWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="bg-noir-dark rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => window.open(`https://solscan.io/account/${wallet.wallet_address}`, '_blank')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">{wallet.nickname}</span>
                            {wallet.twitter_handle && (
                              <a
                                href={`https://twitter.com/${wallet.twitter_handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-white transition-colors text-xs"
                              >
                                @{wallet.twitter_handle.replace('@', '')}
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/60 text-sm font-mono">
                              {wallet.wallet_address.slice(0, 4)}...{wallet.wallet_address.slice(-4)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(wallet.wallet_address);
                              }}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://solscan.io/account/${wallet.wallet_address}`, '_blank');
                              }}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSmartMoneyWallet(wallet.id);
                          }}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="noir-card rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    No transactions yet
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-noir-dark rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => window.open(`https://solscan.io/tx/${tx.transaction_signature}`, '_blank')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">{tx.nickname}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              tx.transaction_type === 'buy'
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {tx.transaction_type.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-white/60 text-sm mb-1">
                            {tx.token_symbol} • ${tx.usd_value.toFixed(2)}
                            {tx.token_pnl && (
                              <span className={`ml-2 ${
                                tx.token_pnl > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                ({tx.token_pnl > 0 ? '+' : ''}{tx.token_pnl.toFixed(2)}%)
                              </span>
                            )}
                          </div>
                          <div className="text-white/40 text-xs">
                            {formatTimeAgo(tx.timestamp)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://solscan.io/tx/${tx.transaction_signature}`, '_blank');
                          }}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
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

      {/* Transaction Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-lg shadow-2xl border border-white/20 animate-slide-in max-w-md z-50">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold mb-1">
                {notification.nickname} {notification.transaction_type === 'buy' ? 'bought' : 'sold'}
              </div>
              <div className="text-sm">
                {notification.token_symbol} • ${notification.usd_value.toFixed(2)}
                {notification.token_pnl && (
                  <span className="ml-2">
                    ({notification.token_pnl > 0 ? '+' : ''}{notification.token_pnl.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStalks;
