import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Filter, ExternalLink, Copy } from 'lucide-react';
import { flaskService } from '../services/flaskApi';

interface Transaction {
  id: string;
  signature: string;
  type: 'buy' | 'sell' | 'swap';
  wallet: string;
  timestamp: string;
}

const Transactions: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'swap'>('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      console.log('🔄 Fetching transactions from Flask API...');
      const data = await flaskService.getTransactions(timeRange, filter);
      setTransactions(data);
      setIsLoading(false);
      console.log('✅ Transactions loaded:', data.length);
    };

    fetchTransactions();
  }, [timeRange, filter]);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'sell':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'swap':
        return <ArrowUpRight className="w-4 h-4 text-blue-600 rotate-90" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-white/70" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-600 bg-green-600/10';
      case 'sell':
        return 'text-red-600 bg-red-600/10';
      case 'swap':
        return 'text-blue-600 bg-blue-600/10';
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
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      >
        <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
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
              onClick={() => setFilter('buy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setFilter('sell')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => setFilter('swap')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'swap'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Swap
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
                  <td colSpan={4} className="px-4 py-8 text-center text-white/70">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/70">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                <tr key={tx.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                      {tx.type.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {tx.wallet.slice(0, 8)}...{tx.wallet.slice(-4)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <Clock className="w-3 h-3" />
                      {tx.timestamp}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(tx.signature)}
                        className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-70 hover:scale-110 transition-all p-1 text-white/70"
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