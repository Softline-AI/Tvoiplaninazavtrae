import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Bell, ExternalLink, Copy, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface TrackedWallet {
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
  amount: number;
  usd_value: number;
  timestamp: string;
  nickname: string;
}

const MyStalks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<RecentTransaction | null>(null);

  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newTwitterHandle, setNewTwitterHandle] = useState('');
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTrackedWallets();
    loadRecentTransactions();

    const transactionSubscription = supabase
      .channel('stalks_transactions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'webhook_transactions'
      }, (payload) => {
        const newTx = payload.new;
        const trackedWallet = trackedWallets.find(w => w.wallet_address === newTx.wallet_address);

        if (trackedWallet && (newTx.transaction_type === 'buy' || newTx.transaction_type === 'sell')) {
          const transaction: RecentTransaction = {
            id: newTx.id,
            wallet_address: newTx.wallet_address,
            transaction_type: newTx.transaction_type,
            token_symbol: newTx.token_symbol,
            token_address: newTx.token_address,
            amount: newTx.token_amount,
            usd_value: newTx.usd_value || 0,
            timestamp: newTx.timestamp,
            nickname: trackedWallet.nickname
          };

          showNotification(transaction);
          setRecentTransactions(prev => [transaction, ...prev.slice(0, 49)]);
        }
      })
      .subscribe();

    return () => {
      transactionSubscription.unsubscribe();
    };
  }, [trackedWallets]);

  const loadTrackedWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_money_wallets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrackedWallets(data || []);
    } catch (error) {
      console.error('Error loading tracked wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const { data: wallets } = await supabase
        .from('smart_money_wallets')
        .select('wallet_address, nickname');

      if (!wallets || wallets.length === 0) {
        setRecentTransactions([]);
        return;
      }

      const walletAddresses = wallets.map(w => w.wallet_address);
      const walletMap = new Map(wallets.map(w => [w.wallet_address, w.nickname]));

      const { data, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .in('wallet_address', walletAddresses)
        .in('transaction_type', ['buy', 'sell'])
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transactions: RecentTransaction[] = (data || []).map(tx => ({
        id: tx.id,
        wallet_address: tx.wallet_address,
        transaction_type: tx.transaction_type,
        token_symbol: tx.token_symbol,
        token_address: tx.token_address,
        amount: tx.token_amount,
        usd_value: tx.usd_value || 0,
        timestamp: tx.timestamp,
        nickname: walletMap.get(tx.wallet_address) || 'Unknown'
      }));

      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const validateSolanaAddress = (address: string): boolean => {
    const solanaAddressPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaAddressPattern.test(address);
  };

  const addWallet = async () => {
    setError('');

    if (!newWalletAddress.trim()) {
      setError('Введите адрес кошелька');
      return;
    }

    if (!validateSolanaAddress(newWalletAddress)) {
      setError('Некорректный адрес кошелька Solana');
      return;
    }

    if (!newNickname.trim()) {
      setError('Введите имя трейдера');
      return;
    }

    const existing = trackedWallets.find(w => w.wallet_address === newWalletAddress);
    if (existing) {
      setError('Этот кошелек уже отслеживается');
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
      .single();

    setIsAdding(false);

    if (insertError) {
      setError('Ошибка добавления кошелька');
      return;
    }

    if (data) {
      setTrackedWallets([data, ...trackedWallets]);
      setNewWalletAddress('');
      setNewNickname('');
      setNewTwitterHandle('');
      setShowAddModal(false);
    }
  };

  const removeWallet = async (id: string) => {
    const { error } = await supabase
      .from('smart_money_wallets')
      .delete()
      .eq('id', id);

    if (!error) {
      setTrackedWallets(trackedWallets.filter(w => w.id !== id));
      loadRecentTransactions();
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVang7K1aFgxDmeHxwWgjBSuCy/HZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFg==');
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

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
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
            Add Wallet
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-noir-dark border border-white/20 rounded-xl p-1">
        {[
          { id: 'active', label: 'Tracked Wallets' },
          { id: 'alerts', label: 'Recent Transactions' }
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

      {activeTab === 'active' && (
        <div className="space-y-4">
          {loading ? (
            <div className="noir-card rounded-xl p-12 text-center">
              <div className="text-white/70">Loading...</div>
            </div>
          ) : trackedWallets.length > 0 ? (
            trackedWallets.map((wallet) => (
              <div key={wallet.id} className="noir-card rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-2xl">👛</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{wallet.nickname}</h3>
                          <div className="px-2 py-1 rounded-full text-xs font-medium text-emerald-600 bg-emerald-600/10">
                            WALLET
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-600/10">
                            <Bell className="w-3 h-3" />
                            ACTIVE
                          </div>
                          {wallet.twitter_handle && (
                            <a
                              href={`https://twitter.com/${wallet.twitter_handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/60 hover:text-white transition-colors"
                              title="View on X"
                            >
                              <XIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <div className="text-sm text-white/70">
                          Tracking wallet transactions in real-time
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-noir-dark rounded-lg p-3">
                        <div className="text-xs text-white/70 mb-1">Status</div>
                        <div className="text-sm font-bold text-white">Monitoring</div>
                      </div>

                      <div className="bg-noir-dark rounded-lg p-3">
                        <div className="text-xs text-white/70 mb-1">Added</div>
                        <div className="text-sm font-bold text-white">
                          {new Date(wallet.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => removeWallet(wallet.id)}
                      className="hover:opacity-70 transition-all p-2 text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="noir-card rounded-xl p-12 text-center">
              <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Tracked Wallets</h3>
              <p className="text-white/70">
                Add wallets to start tracking their transactions in real-time
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="noir-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.transaction_type === 'buy'
                      ? 'bg-emerald-600/20'
                      : 'bg-red-600/20'
                  }`}>
                    <TrendingUp className={`w-5 h-5 ${
                      tx.transaction_type === 'buy'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white mb-1">
                      {tx.nickname} {tx.transaction_type === 'buy' ? 'купил' : 'продал'} {tx.token_symbol}
                    </div>
                    <div className="text-xs text-white/70">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">${tx.usd_value.toFixed(2)}</div>
                    <a
                      href={`https://solscan.io/token/${tx.token_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      View Token
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="noir-card rounded-xl p-12 text-center">
              <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Transactions Yet</h3>
              <p className="text-white/70">
                Start tracking wallets to see their transactions here
              </p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="noir-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Add Wallet to Track</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Wallet Address</label>
                <input
                  type="text"
                  placeholder="Solana wallet address"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-noir-dark border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Trader Name</label>
                <input
                  type="text"
                  placeholder="e.g. Smart Whale"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full px-4 py-3 bg-noir-dark border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Twitter Handle (optional)</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={newTwitterHandle}
                  onChange={(e) => setNewTwitterHandle(e.target.value)}
                  className="w-full px-4 py-3 bg-noir-dark border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                  setNewWalletAddress('');
                  setNewNickname('');
                  setNewTwitterHandle('');
                }}
                className="flex-1 px-4 py-2 bg-noir-dark text-white rounded-lg font-medium hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addWallet}
                disabled={isAdding}
                className="flex-1 px-4 py-2 bg-white text-noir-black rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Adding...' : 'Add Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-4 rounded-lg shadow-2xl border border-white/20 animate-slide-in max-w-md z-50">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold mb-1">
                {notification.nickname} {notification.transaction_type === 'buy' ? 'купил' : 'продал'}
              </div>
              <div className="text-sm">
                {notification.token_symbol} • ${notification.usd_value.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStalks;
