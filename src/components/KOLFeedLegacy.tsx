import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, TrendingUp, Filter, ExternalLink, Copy, Download, Info, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useTokenLogo } from '../hooks/useTokenLogo';
import { aggregatedPnlService } from '../services/aggregatedPnlService';
import { SafeImage } from './SafeImage';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface LegacyTrade {
  id: string;
  timestamp: string;
  trader: string;
  traderAvatar: string;
  action: 'buy' | 'sell';
  token: string;
  tokenSymbol: string;
  tokenMint: string;
  amount: string;
  price: string;
  entryPrice: string;
  value: string;
  walletAddress: string;
  twitterHandle: string;
  pnl: string;
  pnlPercentage: string;
  remainingTokens: number;
  allTokensSold: boolean;
  transactionSignature: string;
  // Aggregated fields
  buyCount?: number;
  sellCount?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
}

const KOLFeedLegacy: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [actionFilter, setActionFilter] = useState('all');
  const [trades, setTrades] = useState<LegacyTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [useAggregated, setUseAggregated] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<LegacyTrade | null>(null);
  const [tradeDetails, setTradeDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [traderSearch, setTraderSearch] = useState('');
  const [tokenSearch, setTokenSearch] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'pnl'>('time');

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [timeFilter, actionFilter, useAggregated]);

  useEffect(() => {
    const channel = supabase
      .channel('webhook_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhook_transactions'
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeFilter, actionFilter, useAggregated, trades]);

  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    console.log('🔔 Realtime update:', payload.eventType);

    if (payload.eventType === 'INSERT') {
      const newTx = payload.new;
      const txTime = new Date(newTx.block_time);
      const now = new Date();
      let timeFilter_date: Date;

      switch (timeFilter) {
        case '1h':
          timeFilter_date = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          timeFilter_date = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          timeFilter_date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeFilter_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeFilter_date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeFilter_date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      if (txTime < timeFilter_date) return;

      if (actionFilter !== 'all') {
        const txTypes = actionFilter === 'buy' ? ['BUY'] : ['SELL'];
        if (!txTypes.includes(newTx.transaction_type)) return;
      }

      const { data: wallets } = await supabase
        .from('monitored_wallets')
        .select('wallet_address, label, twitter_handle, twitter_avatar');

      const walletMap = new Map();
      wallets?.forEach((wallet: any) => {
        walletMap.set(wallet.wallet_address, wallet);
      });

      const { data: profiles } = await supabase
        .from('kol_profiles')
        .select('*');

      const profileMap = new Map();
      profiles?.forEach((profile: any) => {
        profileMap.set(profile.wallet_address, profile);
      });

      const wallet = walletMap.get(newTx.from_address);
      const profile = profileMap.get(newTx.from_address);
      const avatarUrl = wallet?.twitter_avatar || profile?.avatar_url || 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';

      const txType = newTx.transaction_type === 'BUY' ? 'buy' : 'sell';
      const amount = parseFloat(newTx.amount || '0');
      const price = parseFloat(newTx.current_token_price || '0');
      const entryPrice = parseFloat(newTx.entry_price || '0');
      const tokenPnl = parseFloat(newTx.token_pnl || '0');
      const tokenPnlPercentage = parseFloat(newTx.token_pnl_percentage || '0');
      const displayName = profile?.name || 'Insider';

      const formattedTrade: LegacyTrade = {
        id: newTx.id,
        timestamp: new Date(newTx.block_time).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        trader: displayName,
        traderAvatar: avatarUrl,
        action: txType,
        token: newTx.token_symbol || 'Unknown',
        tokenSymbol: newTx.token_symbol || 'UNK',
        tokenMint: newTx.token_mint || '',
        amount: `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${newTx.token_symbol}`,
        price: `$${price.toFixed(price < 0.01 ? 8 : 2)}`,
        entryPrice: `$${entryPrice.toFixed(entryPrice < 0.01 ? 8 : 2)}`,
        value: `$${(amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        walletAddress: newTx.from_address,
        twitterHandle: profile?.twitter_handle || newTx.from_address.substring(0, 8),
        pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pnlPercentage: `${tokenPnlPercentage >= 0 ? '+' : ''}${tokenPnlPercentage.toFixed(2)}%`,
        remainingTokens: parseFloat(newTx.remaining_tokens || '0'),
        allTokensSold: newTx.all_tokens_sold || false,
        transactionSignature: newTx.transaction_signature || ''
      };

      setTrades(prevTrades => [formattedTrade, ...prevTrades]);
      setTotalCount(prev => prev + 1);
      console.log('✅ Added new trade to feed:', formattedTrade.token);
    } else if (payload.eventType === 'UPDATE') {
      const updatedTx = payload.new;
      setTrades(prevTrades =>
        prevTrades.map(trade => {
          if (trade.transactionSignature === updatedTx.transaction_signature) {
            const amount = parseFloat(updatedTx.amount || '0');
            const price = parseFloat(updatedTx.current_token_price || '0');
            const tokenPnl = parseFloat(updatedTx.token_pnl || '0');
            const tokenPnlPercentage = parseFloat(updatedTx.token_pnl_percentage || '0');

            return {
              ...trade,
              price: `$${price.toFixed(price < 0.01 ? 8 : 2)}`,
              value: `$${(amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              pnlPercentage: `${tokenPnlPercentage >= 0 ? '+' : ''}${tokenPnlPercentage.toFixed(2)}%`,
              remainingTokens: parseFloat(updatedTx.remaining_tokens || '0'),
              allTokensSold: updatedTx.all_tokens_sold || false
            };
          }
          return trade;
        })
      );
      console.log('✅ Updated trade in feed');
    }
  }, [timeFilter, actionFilter, trades]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);

    try {
      const now = new Date();
      let timeFilter_date: Date;

      switch (timeFilter) {
        case '1h':
          timeFilter_date = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          timeFilter_date = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          timeFilter_date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeFilter_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeFilter_date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeFilter_date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const { data: wallets } = await supabase
        .from('monitored_wallets')
        .select('wallet_address, label, twitter_handle, twitter_avatar');

      const walletMap = new Map();
      wallets?.forEach((wallet: any) => {
        walletMap.set(wallet.wallet_address, wallet);
      });

      const { data: profiles } = await supabase
        .from('kol_profiles')
        .select('*');

      const profileMap = new Map();
      profiles?.forEach((profile: any) => {
        profileMap.set(profile.wallet_address, profile);
      });

      let query = supabase
        .from('webhook_transactions')
        .select('*', { count: 'exact' })
        .gte('block_time', timeFilter_date.toISOString())
        .neq('token_symbol', 'UNKNOWN');

      if (actionFilter !== 'all') {
        const txTypes = actionFilter === 'buy' ? ['BUY'] : ['SELL'];
        query = query.in('transaction_type', txTypes);
      }

      const { data: transactions, error, count } = await query
        .order('block_time', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error loading transactions:', error);
        setTrades([]);
        setTotalCount(0);
        return;
      }

      if (!transactions || transactions.length === 0) {
        setTrades([]);
        setTotalCount(0);
        return;
      }

      setTotalCount(count || 0);

      const formattedTrades: LegacyTrade[] = transactions.map((tx: any) => {
        const wallet = walletMap.get(tx.from_address);
        const profile = profileMap.get(tx.from_address);
        const avatarUrl = wallet?.twitter_avatar || profile?.avatar_url || 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';

        const txType = tx.transaction_type === 'BUY' ? 'buy' : 'sell';
        const amount = parseFloat(tx.amount || '0');
        const price = parseFloat(tx.current_token_price || '0');
        const entryPrice = parseFloat(tx.entry_price || '0');
        const tokenPnl = parseFloat(tx.token_pnl || '0');
        const tokenPnlPercentage = parseFloat(tx.token_pnl_percentage || '0');

        const displayName = profile?.name || 'Insider';

        return {
          id: tx.id,
          timestamp: new Date(tx.block_time).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
          trader: displayName,
          traderAvatar: avatarUrl,
          action: txType,
          token: tx.token_symbol || 'Unknown',
          tokenSymbol: tx.token_symbol || 'UNK',
          tokenMint: tx.token_mint || '',
          amount: `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${tx.token_symbol}`,
          price: `$${price.toFixed(price < 0.01 ? 8 : 2)}`,
          entryPrice: `$${entryPrice.toFixed(entryPrice < 0.01 ? 8 : 2)}`,
          value: `$${(amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          walletAddress: tx.from_address,
          twitterHandle: profile?.twitter_handle || tx.from_address.substring(0, 8),
          pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pnlPercentage: `${tokenPnlPercentage >= 0 ? '+' : ''}${tokenPnlPercentage.toFixed(2)}%`,
          remainingTokens: parseFloat(tx.remaining_tokens || '0'),
          allTokensSold: tx.all_tokens_sold || false,
          transactionSignature: tx.transaction_signature || ''
        };
      });

      setTrades(formattedTrades);
    } catch (error) {
      console.error('Error in loadTransactions:', error);
      setTrades([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, actionFilter]);

  const getActionColor = useCallback((action: string) => {
    return action === 'buy' ? 'text-green-600' : 'text-red-600';
  }, []);

  const getActionBg = useCallback((action: string) => {
    return action === 'buy' ? 'bg-green-600/10' : 'bg-red-600/10';
  }, []);

  const TokenLogo: React.FC<{ mint: string; symbol: string }> = ({ mint, symbol }) => {
    const logoUrl = useTokenLogo(mint);

    return (
      <SafeImage
        src={logoUrl}
        alt={symbol}
        className="w-6 h-6 rounded-full border border-white/30"
        fallbackIcon={false}
      />
    );
  };

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = trades;

    if (traderSearch.trim()) {
      const searchLower = traderSearch.toLowerCase();
      filtered = filtered.filter(trade =>
        trade.trader.toLowerCase().includes(searchLower) ||
        trade.twitterHandle.toLowerCase().includes(searchLower) ||
        trade.walletAddress.toLowerCase().includes(searchLower)
      );
    }

    if (tokenSearch.trim()) {
      const searchLower = tokenSearch.toLowerCase();
      filtered = filtered.filter(trade =>
        trade.tokenSymbol.toLowerCase().includes(searchLower) ||
        trade.token.toLowerCase().includes(searchLower)
      );
    }

    if (sortBy === 'pnl') {
      filtered = [...filtered].sort((a, b) => {
        const pnlA = parseFloat(a.pnl.replace(/[$,+]/g, ''));
        const pnlB = parseFloat(b.pnl.replace(/[$,+]/g, ''));
        return pnlB - pnlA;
      });
    }

    return filtered;
  }, [trades, traderSearch, tokenSearch, sortBy]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Trader', 'Action', 'Token', 'Amount', 'Price', 'Total Value', 'P&L', 'P&L %', 'Wallet Address'];
    const rows = trades.map(trade => [
      trade.timestamp,
      trade.trader,
      trade.action.toUpperCase(),
      trade.tokenSymbol,
      trade.amount,
      trade.price,
      trade.value,
      trade.pnl,
      trade.pnlPercentage,
      trade.walletAddress
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kol-feed-${timeFilter}-${Date.now()}.csv`;
    a.click();
  };

  const exportJSON = () => {
    const jsonContent = JSON.stringify(trades, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kol-feed-${timeFilter}-${Date.now()}.json`;
    a.click();
  };

  const loadTradeDetails = async (trade: LegacyTrade) => {
    setSelectedTrade(trade);
    setLoadingDetails(true);

    try {
      const { data, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .eq('from_address', trade.walletAddress)
        .eq('token_mint', trade.tokenMint)
        .order('block_time', { ascending: false });

      if (error) throw error;

      setTradeDetails(data || []);
    } catch (error) {
      console.error('Error loading trade details:', error);
      setTradeDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedTrade(null);
    setTradeDetails([]);
  };

  const calculateTotalPnL = () => {
    let totalBought = 0;
    let totalSold = 0;
    let totalBuyValue = 0;
    let totalSellValue = 0;

    for (const tx of tradeDetails) {
      const amount = Math.abs(parseFloat(tx.amount) || 0);
      const solAmount = Math.abs(parseFloat(tx.sol_amount) || 0);

      if (tx.transaction_type === 'BUY') {
        totalBought += amount;
        totalBuyValue += solAmount;
      } else if (tx.transaction_type === 'SELL') {
        totalSold += amount;
        totalSellValue += solAmount;
      }
    }

    const remainingTokens = totalBought - totalSold;
    const realizedPnl = totalSellValue - (totalBuyValue * (totalSold / totalBought));
    const pnlPercentage = totalBuyValue > 0 ? (realizedPnl / totalBuyValue) * 100 : 0;

    return {
      totalBought,
      totalSold,
      totalBuyValue,
      totalSellValue,
      remainingTokens,
      realizedPnl,
      pnlPercentage,
      buyCount: tradeDetails.filter(t => t.transaction_type === 'BUY').length,
      sellCount: tradeDetails.filter(t => t.transaction_type === 'SELL').length
    };
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-xl mb-1 font-semibold text-white">KOL Feed Legacy</h1>
          <p className="text-sm text-gray-400">
            {loading ? 'Loading...' : `${totalCount} transactions found`}
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
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

            <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
              <button
                onClick={() => setSortBy('time')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  sortBy === 'time'
                    ? 'bg-white text-noir-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="w-3 h-3" />
                Time
              </button>
              <button
                onClick={() => setSortBy('pnl')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  sortBy === 'pnl'
                    ? 'bg-white text-noir-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                P&L
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by trader or wallet address..."
                value={traderSearch}
                onChange={(e) => setTraderSearch(e.target.value)}
                className="w-full px-4 py-2 bg-noir-dark border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by token symbol..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full px-4 py-2 bg-noir-dark border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="noir-card rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading transactions...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="noir-card rounded-2xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white/70">No transactions found for this period</p>
          </div>
        ) : (
          <div className="noir-card rounded-2xl overflow-hidden h-[calc(100vh-320px)] flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="min-w-full">
                <thead className="bg-noir-dark border-b border-white/20 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Trader
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Action
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Token
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Entry
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Current
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Value
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      P&L
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      More
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-white tracking-wider">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAndSortedTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-white/5">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-mono text-white/70">
                          {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <SafeImage
                            src={trade.traderAvatar}
                            alt={trade.trader}
                            className="w-6 h-6 rounded-full border border-white/30"
                          />
                          <div className="text-xs font-semibold text-white">{trade.trader}</div>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getActionColor(trade.action)} ${getActionBg(trade.action)}`}>
                          <TrendingUp className={`w-3 h-3 ${trade.action === 'sell' ? 'rotate-180' : ''}`} />
                          {trade.action.toUpperCase()}
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TokenLogo mint={trade.tokenMint} symbol={trade.tokenSymbol} />
                          <div className="text-xs font-semibold text-white">{trade.tokenSymbol}</div>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-semibold text-white">{trade.amount}</div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-white/70">{trade.entryPrice}</div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-semibold text-white">{trade.price}</div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={`text-xs font-semibold ${getActionColor(trade.action)}`}>
                          {trade.value}
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs">
                          <div className={`text-sm font-bold ${trade.pnl.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                            {trade.pnlPercentage}
                          </div>
                          <div className={`text-xs ${trade.pnl.includes('-') ? 'text-red-400/70' : 'text-green-400/70'}`}>
                            {trade.pnl}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => loadTradeDetails(trade)}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                          title="View all trades"
                        >
                          <Info className="w-3 h-3" />
                          Details
                        </button>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(trade.walletAddress)}
                            className="hover:opacity-70 transition-all cursor-pointer p-1 text-white/70"
                            title="Copy wallet"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`https://solscan.io/account/${trade.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-all p-1 text-white/70"
                            title="View Wallet"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://solscan.io/tx/${trade.transactionSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-all p-1 text-purple-400"
                            title="View Transaction"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://twitter.com/${trade.twitterHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-all p-1 text-blue-400"
                            title="Twitter"
                          >
                            <XIcon className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="noir-card rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Historical Data</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={exportCSV}
              disabled={trades.length === 0}
              className="bg-white text-noir-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportJSON}
              disabled={trades.length === 0}
              className="bg-noir-dark border border-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <div className="ml-auto text-sm text-white/70">
              Showing {filteredAndSortedTrades.length} of {totalCount} transactions from the last {timeFilter}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Details Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="noir-card rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <SafeImage
                  src={selectedTrade.traderAvatar}
                  alt={selectedTrade.trader}
                  className="w-16 h-16 rounded-full border-2 border-white/30"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedTrade.trader} - {selectedTrade.tokenSymbol}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span>Wallet: {selectedTrade.walletAddress.substring(0, 8)}...{selectedTrade.walletAddress.substring(selectedTrade.walletAddress.length - 6)}</span>
                    <span>•</span>
                    <span>{tradeDetails.length} transactions</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Summary Stats */}
            {!loadingDetails && tradeDetails.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-white/10">
                {(() => {
                  const stats = calculateTotalPnL();
                  return (
                    <>
                      <div className="bg-noir-dark rounded-lg p-4">
                        <div className="text-xs text-white/60 mb-1">Total Bought</div>
                        <div className="text-lg font-bold text-green-400">
                          {stats.totalBought.toLocaleString()} {selectedTrade.tokenSymbol}
                        </div>
                        <div className="text-xs text-white/50">{stats.buyCount} buys</div>
                      </div>
                      <div className="bg-noir-dark rounded-lg p-4">
                        <div className="text-xs text-white/60 mb-1">Total Sold</div>
                        <div className="text-lg font-bold text-red-400">
                          {stats.totalSold.toLocaleString()} {selectedTrade.tokenSymbol}
                        </div>
                        <div className="text-xs text-white/50">{stats.sellCount} sells</div>
                      </div>
                      <div className="bg-noir-dark rounded-lg p-4">
                        <div className="text-xs text-white/60 mb-1">Remaining</div>
                        <div className="text-lg font-bold text-white">
                          {stats.remainingTokens.toLocaleString()} {selectedTrade.tokenSymbol}
                        </div>
                      </div>
                      <div className="bg-noir-dark rounded-lg p-4">
                        <div className="text-xs text-white/60 mb-1">Realized P&L</div>
                        <div className={`text-lg font-bold ${stats.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.realizedPnl >= 0 ? '+' : '-'}${Math.abs(stats.realizedPnl).toFixed(2)}
                        </div>
                        <div className={`text-xs ${stats.pnlPercentage >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                          {stats.pnlPercentage >= 0 ? '+' : ''}{stats.pnlPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetails ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white/70">Loading transaction history...</p>
                </div>
              ) : tradeDetails.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/70">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tradeDetails.map((tx) => {
                    const amount = Math.abs(parseFloat(tx.amount) || 0);
                    const solAmount = Math.abs(parseFloat(tx.sol_amount) || 0);
                    const price = parseFloat(tx.current_token_price) || 0;
                    const isBuy = tx.transaction_type === 'BUY';

                    return (
                      <div key={tx.id} className="bg-noir-dark rounded-lg p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${isBuy ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                {tx.transaction_type}
                              </div>
                              <span className="text-white font-semibold">
                                {amount.toLocaleString()} {selectedTrade.tokenSymbol}
                              </span>
                              <span className="text-white/50">@</span>
                              <span className="text-white/70">
                                ${price.toFixed(price < 0.01 ? 8 : 4)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-white/50">
                              <span>{new Date(tx.block_time).toLocaleString()}</span>
                              <span>•</span>
                              <span>Total: ${(amount * price).toFixed(2)}</span>
                              {solAmount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>SOL: {solAmount.toFixed(4)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <a
                            href={`https://solscan.io/tx/${tx.transaction_signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            title="View on Solscan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KOLFeedLegacy;
