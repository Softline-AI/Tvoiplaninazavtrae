import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ExternalLink, Copy, AlertCircle } from 'lucide-react';
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

const SmartMoney: React.FC = () => {
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newTwitterHandle, setNewTwitterHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<RecentTransaction | null>(null);

  useEffect(() => {
    loadTrackedWallets();
    loadRecentTransactions();

    const transactionSubscription = supabase
      .channel('smart_money_transactions')
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
    const { data, error } = await supabase
      .from('smart_money_wallets')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTrackedWallets(data);
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

    const { data, error } = await supabase
      .from('webhook_transactions')
      .select('*')
      .in('wallet_address', walletAddresses)
      .in('transaction_type', ['buy', 'sell'])
      .order('timestamp', { ascending: false })
      .limit(50);

    if (data) {
      const transactions: RecentTransaction[] = data.map(tx => ({
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
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVarg7K1aFgxDmeHxwWgjBSuCy/HZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFgxDmeHxwWgjBSuCyvHZizsJFV2x6+qnUxQKRp/g8r5sIQUxh9Hz04I0Bh5uwO/jmEgND1ap4OytWhYMQ5nh8cFoIwUrgsrx2Ys7CRVdsevqp1MUCkaf4PK+bCEFMYfR89OCNAYebsDv45hIDQ9WqeDsrVoWDEOZ4fHBaCMFK4LK8dmLOwkVXbHr6qdTFApGn+DyvmwhBTGH0fPTgjQGHm7A7+OYSA0PVqng7K1aFg==');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Smart Money Tracker</h1>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Добавить кошелек для отслеживания</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Адрес кошелька"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
            />
            <input
              type="text"
              placeholder="Имя трейдера"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
            />
            <input
              type="text"
              placeholder="Twitter handle (опционально)"
              value={newTwitterHandle}
              onChange={(e) => setNewTwitterHandle(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-4 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={addWallet}
            disabled={isAdding}
            className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isAdding ? 'Добавление...' : 'Добавить кошелек'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Отслеживаемые кошельки ({trackedWallets.length})</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {trackedWallets.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  Нет отслеживаемых кошельков
                </div>
              ) : (
                trackedWallets.map((wallet) => (
                  <div key={wallet.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{wallet.nickname}</span>
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
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm font-mono">
                            {wallet.wallet_address.slice(0, 4)}...{wallet.wallet_address.slice(-4)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(wallet.wallet_address)}
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`https://solscan.io/account/${wallet.wallet_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => removeWallet(wallet.id)}
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

          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Последние транзакции</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  Нет транзакций
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{tx.nickname}</span>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            tx.transaction_type === 'buy'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.transaction_type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-white/60 text-sm mb-1">
                          {tx.token_symbol} • ${tx.usd_value.toFixed(2)}
                        </div>
                        <div className="text-white/40 text-xs">
                          {formatTimeAgo(tx.timestamp)}
                        </div>
                      </div>
                      <a
                        href={`https://solscan.io/token/${tx.token_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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

export default SmartMoney;
