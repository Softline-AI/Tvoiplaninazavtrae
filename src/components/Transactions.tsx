import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Filter, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Transaction {
  id: string;
  transaction_signature: string;
  transaction_type: string;
  from_address: string;
  token_symbol: string;
  amount: string;
  block_time: string;
  token_pnl: string;
  token_pnl_percentage: string;
}

const Transactions: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTimeRangeDate = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      console.log(`🔄 Fetching transactions from Supabase (${timeRange}, ${filter})...`);

      try {
        const timeRangeDate = getTimeRangeDate(timeRange);

        let query = supabase
          .from('webhook_transactions')
          .select('*')
          .gte('block_time', timeRangeDate)
          .order('block_time', { ascending: false })
          .limit(100);

        if (filter !== 'all') {
          query = query.eq('transaction_type', filter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase error:', error);
          setTransactions([]);
        } else {
          setTransactions(data || []);
          console.log('✅ Transactions loaded:', data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      }

      setIsLoading(false);
    };

    fetchTransactions();

    const subscription = supabase
      .channel('webhook_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhook_transactions'
        },
        (payload) => {
          console.log('🔴 Realtime update:', payload);
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange, filter]);

  const filteredTransactions = transactions;

  const getTypeIcon = (type: string) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case 'BUY':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'SELL':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-white/70" />;
    }
  };

  const getTypeColor = (type: string) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case 'BUY':
        return 'text-green-600 bg-green-600/10';
      case 'SELL':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-white/70 bg-white/10';
    }
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-sm text-white/60 mt-1">Detailed transaction log with wallet attribution - track institutional player actions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
            {['1h', '6h', '24h', '7d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === period
                    ? 'bg-white text-noir-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('BUY')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'BUY'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setFilter('SELL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'SELL'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Sell
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="noir-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-noir-dark border-b border-white/20">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Type
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Wallet
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Token & Amount
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  P&L %
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Time
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/70">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/70">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                <tr key={tx.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(tx.transaction_type)}`}>
                      {getTypeIcon(tx.transaction_type)}
                      {tx.transaction_type}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {tx.from_address?.slice(0, 8)}...{tx.from_address?.slice(-4)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {tx.token_symbol} {parseFloat(tx.amount || '0').toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${parseFloat(tx.token_pnl_percentage || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(tx.token_pnl_percentage || '0').toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.block_time).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(tx.transaction_signature)}
                        className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70"
                        title="Copy signature"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://solscan.io/tx/${tx.transaction_signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 hover:scale-110 transition-all p-1 text-white/70"
                        title="View on Solscan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Transactions;