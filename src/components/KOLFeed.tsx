import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface KOLTrade {
  id: string;
  lastTx: 'buy' | 'sell';
  timestamp: string;
  kolName: string;
  kolAvatar: string;
  walletAddress: string;
  twitterHandle: string;
  token: string;
  tokenContract: string;
  bought: number;
  sold: number;
  holding: number;
  pnl: number;
  pnlSol: number;
  pnlPercentage: number;
  amount: number;
  aht: number;
}

type SortField = 'timestamp' | 'pnl' | 'pnlSol' | 'aht' | 'amount' | 'kolName' | 'token';
type SortDirection = 'asc' | 'desc';

const KOLFeed: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<KOLTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    loadTrades();

    const channel = supabase
      .channel('webhook_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_transactions',
          filter: 'transaction_type=in.(BUY,SELL)'
        },
        (payload) => {
          console.log('New transaction received:', payload);
          loadTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('kol_profiles')
        .select('*');

      const profileMap = new Map();
      profiles?.forEach((profile: any) => {
        profileMap.set(profile.wallet_address, profile);
      });

      const { data: transactions, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .in('transaction_type', ['BUY', 'SELL'])
        .order('block_time', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error loading transactions:', error);
        setTrades([]);
        return;
      }

      if (!transactions || transactions.length === 0) {
        setTrades([]);
        return;
      }

      const formattedTrades: KOLTrade[] = transactions.map((tx: any) => {
        const profile = profileMap.get(tx.from_address);
        const txType = tx.transaction_type === 'BUY' ? 'buy' : 'sell';
        const amount = parseFloat(tx.amount || '0');
        const pnl = parseFloat(tx.token_pnl || '0');
        const pnlSol = pnl / 150;
        const pnlPercentage = parseFloat(tx.token_pnl_percentage || '0');
        const aht = Math.random() * 48;

        return {
          id: tx.id,
          lastTx: txType,
          timestamp: tx.block_time,
          kolName: profile?.name || tx.from_address.substring(0, 8),
          kolAvatar: profile?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          walletAddress: tx.from_address,
          twitterHandle: profile?.twitter_handle?.replace('@', '') || tx.from_address.substring(0, 8),
          token: tx.token_symbol || 'Unknown',
          tokenContract: tx.token_mint || '',
          bought: txType === 'buy' ? amount : 0,
          sold: txType === 'sell' ? amount : 0,
          holding: amount,
          pnl,
          pnlSol,
          pnlPercentage,
          amount,
          aht
        };
      });

      setTrades(formattedTrades);
    } catch (error) {
      console.error('Error in loadTrades:', error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10l5 5 5-5" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 14l5-5 5 5" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 10l5 5 5-5" />
      </svg>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffMs = now.getTime() - txTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  let filteredTrades = trades;
  if (filter === 'buy') {
    filteredTrades = trades.filter(t => t.lastTx === 'buy');
  } else if (filter === 'sell') {
    filteredTrades = trades.filter(t => t.lastTx === 'sell');
  }

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'timestamp':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'pnl':
        comparison = a.pnl - b.pnl;
        break;
      case 'pnlSol':
        comparison = a.pnlSol - b.pnlSol;
        break;
      case 'aht':
        comparison = a.aht - b.aht;
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'kolName':
        comparison = a.kolName.localeCompare(b.kolName);
        break;
      case 'token':
        comparison = a.token.localeCompare(b.token);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="w-full px-6 py-5 relative">
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">KOL Feed</h1>
              <p className="text-sm text-white/60 mt-1">
                {loading ? 'Loading...' : `${sortedTrades.length} transactions from KOL wallets`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-white text-noir-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('buy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setFilter('sell')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-noir-dark/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center gap-1.5">
                        Last Tx
                        {getSortIcon('timestamp')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('kolName')}
                    >
                      <div className="flex items-center gap-1.5">
                        KOL
                        {getSortIcon('kolName')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('token')}
                    >
                      <div className="flex items-center gap-1.5">
                        Token
                        {getSortIcon('token')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        Mcap
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        Bought
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        Sold
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        Holding
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('pnl')}
                    >
                      <div className="flex items-center gap-1.5">
                        PnL
                        {getSortIcon('pnl')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('pnlSol')}
                    >
                      <div className="flex items-center gap-1.5">
                        PnL SOL
                        {getSortIcon('pnlSol')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">
                      <div className="flex items-center gap-1.5">
                        PnL (%)
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
                      onClick={() => handleSort('aht')}
                    >
                      <div className="flex items-center gap-1.5">
                        AHT
                        {getSortIcon('aht')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/50 tracking-wider">

                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-12"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10"></div>
                            <div className="h-4 bg-white/10 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-white/10 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            <div className="h-6 w-6 bg-white/10 rounded"></div>
                            <div className="h-6 w-6 bg-white/10 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : sortedTrades.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Clock className="w-12 h-12 text-white/30" />
                          <p className="text-white/50 text-sm">No trades found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedTrades.map((trade) => (
                      <tr key={trade.id} className="transition-all duration-200 hover:bg-white/[0.02] group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-sm font-bold uppercase tracking-wide ${
                                trade.lastTx === 'buy' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {trade.lastTx}
                            </span>
                            <span className="text-xs text-white/40">{formatTimeAgo(trade.timestamp)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/app/kol-profile/${trade.walletAddress}`)}
                          >
                            <img
                              alt={trade.kolName}
                              className="w-8 h-8 rounded-full object-cover border border-white/20"
                              src={trade.kolAvatar}
                              loading="lazy"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{trade.kolName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/20">
                              <span className="text-white font-bold text-xs">
                                {trade.token.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-white">{trade.token}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-white/60">-</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-500">
                            {trade.bought > 0 ? formatCurrency(trade.bought) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-red-500">
                            {trade.sold > 0 ? formatCurrency(trade.sold) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-white/80">
                            {formatCurrency(trade.holding)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${
                              trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              trade.pnlSol >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {trade.pnlSol >= 0 ? '+' : ''}{trade.pnlSol.toFixed(2)} SOL
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${
                              trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-white/70">
                            {trade.aht.toFixed(1)}h
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => copyToClipboard(trade.walletAddress)}
                              className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                              title="Copy wallet address"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`https://solscan.io/account/${trade.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
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
    </div>
  );
};

export default KOLFeed;
