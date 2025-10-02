import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Filter, ExternalLink, Copy } from 'lucide-react';

interface Transaction {
  id: string;
  signature: string;
  type: 'buy' | 'sell' | 'swap';
  wallet: string;
  walletName: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  value: string;
  price: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

const Transactions: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  const transactions: Transaction[] = [
    {
      id: '1',
      signature: '5ThrLJDFpJqaFL36AvAX8ECZmz6n4vZvqMYvpHHkpump',
      type: 'buy',
      wallet: 'BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd',
      walletName: 'Smart Whale #1',
      token: 'Solana',
      tokenSymbol: 'SOL',
      amount: '1,250 SOL',
      value: '$177,875',
      price: '$142.30',
      timestamp: '2 min ago',
      status: 'success'
    },
    {
      id: '2',
      signature: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
      type: 'sell',
      wallet: 'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
      walletName: 'KOL Trader',
      token: 'Bonk',
      tokenSymbol: 'BONK',
      amount: '50M BONK',
      value: '$1,700',
      price: '$0.000034',
      timestamp: '5 min ago',
      status: 'success'
    },
    {
      id: '3',
      signature: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
      type: 'swap',
      wallet: 'DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj',
      walletName: 'Whale Trader',
      token: 'Jupiter → Raydium',
      tokenSymbol: 'JUP→RAY',
      amount: '5,000 JUP',
      value: '$4,450',
      price: '$0.89',
      timestamp: '8 min ago',
      status: 'success'
    }
  ];

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
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white">Smart Money Transactions</h1>
        <div className="text-white/70">
          Explore every smart money transaction with wallet attribution
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['all', 'buy', 'sell', 'swap'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === type
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        
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
                  Token
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Value
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                  Price
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
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                      {tx.type.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-white">{tx.walletName}</div>
                      <div className="text-xs text-white/70 font-mono">
                        {tx.wallet.slice(0, 8)}...{tx.wallet.slice(-4)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border border-white/30 mr-2">
                        <span className="text-white font-bold text-xs">
                          {tx.tokenSymbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{tx.tokenSymbol}</div>
                        <div className="text-xs text-white/70">{tx.token}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{tx.amount}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{tx.value}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{tx.price}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <Clock className="w-3 h-3" />
                      {tx.timestamp}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;