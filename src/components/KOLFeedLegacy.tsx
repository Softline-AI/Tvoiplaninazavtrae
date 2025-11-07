import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Filter, ExternalLink, Copy, Download } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useTokenLogos } from '../hooks/useTokenLogo';
import { aggregatedPnlService } from '../services/aggregatedPnlService';

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
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Batch load token logos
  const tokenMints = trades.map(t => t.tokenMint).filter(Boolean);
  const tokenLogos = useTokenLogos(tokenMints);

  useEffect(() => {
    loadTransactions();
  }, [timeFilter, actionFilter, useAggregated]);

  useEffect(() => {
    if (!realtimeEnabled) return;

    console.log('🔴 Setting up Realtime subscription for instant updates...');

    const channel = supabase
      .channel('webhook_transactions_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_transactions'
        },
        (payload) => {
          console.log('⚡ New transaction received in real-time:', payload.new);
          handleRealtimeTransaction(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'webhook_transactions'
        },
        (payload) => {
          console.log('⚡ Transaction updated in real-time:', payload.new);
          handleRealtimeUpdate(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [realtimeEnabled, actionFilter, timeFilter]);

  const handleRealtimeTransaction = async (newTx: any) => {
    const now = new Date();
    let timeFilterDate: Date;

    switch (timeFilter) {
      case '1h':
        timeFilterDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        timeFilterDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        timeFilterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const txTime = new Date(newTx.block_time);
    if (txTime < timeFilterDate) {
      return;
    }

    if (actionFilter !== 'all') {
      const txTypes = actionFilter === 'buy' ? ['BUY'] : ['SELL'];
      if (!txTypes.includes(newTx.transaction_type)) {
        return;
      }
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
      trader: profile?.name || newTx.from_address.substring(0, 8),
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
      allTokensSold: newTx.all_tokens_sold || false
    };

    setTrades(prevTrades => [formattedTrade, ...prevTrades]);
    setTotalCount(prevCount => prevCount + 1);

    console.log(`✅ Added new ${txType.toUpperCase()} transaction to feed:`, formattedTrade.token);
  };

  const handleRealtimeUpdate = async (updatedTx: any) => {
    setTrades(prevTrades => {
      const index = prevTrades.findIndex(t => t.id === updatedTx.id);
      if (index === -1) return prevTrades;

      const txType = updatedTx.transaction_type === 'BUY' ? 'buy' : 'sell';
      const amount = parseFloat(updatedTx.amount || '0');
      const price = parseFloat(updatedTx.current_token_price || '0');
      const entryPrice = parseFloat(updatedTx.entry_price || '0');
      const tokenPnl = parseFloat(updatedTx.token_pnl || '0');
      const tokenPnlPercentage = parseFloat(updatedTx.token_pnl_percentage || '0');

      const updatedTrades = [...prevTrades];
      updatedTrades[index] = {
        ...updatedTrades[index],
        action: txType,
        amount: `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${updatedTx.token_symbol}`,
        price: `$${price.toFixed(price < 0.01 ? 8 : 2)}`,
        entryPrice: `$${entryPrice.toFixed(entryPrice < 0.01 ? 8 : 2)}`,
        value: `$${(amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pnlPercentage: `${tokenPnlPercentage >= 0 ? '+' : ''}${tokenPnlPercentage.toFixed(2)}%`,
      };

      console.log(`✅ Updated transaction in feed:`, updatedTrades[index].token);
      return updatedTrades;
    });
  };

  const loadTransactions = async () => {
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
        .gte('block_time', timeFilter_date.toISOString());

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
          trader: profile?.name || tx.from_address.substring(0, 8),
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
          allTokensSold: tx.all_tokens_sold || false
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
  };

  const getActionColor = (action: string) => {
    return action === 'buy' ? 'text-green-600' : 'text-red-600';
  };

  const getActionBg = (action: string) => {
    return action === 'buy' ? 'bg-green-600/10' : 'bg-red-600/10';
  };

  const TokenLogo: React.FC<{ mint: string; symbol: string }> = ({ mint, symbol }) => {
    const logoUrl = tokenLogos[mint] || 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';

    return (
      <img
        src={logoUrl}
        alt={symbol}
        className="w-6 h-6 rounded-full border border-white/30"
        onError={(e) => {
          e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';
        }}
      />
    );
  };

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

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-white">KOL Feed Legacy</h1>
            {realtimeEnabled && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">Live</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {loading ? 'Loading...' : `${totalCount} transactions found`}
            {realtimeEnabled && ' • Real-time updates enabled'}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6 flex-wrap">
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
          <div className="noir-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
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
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="transition-all duration-200 hover:bg-white/5">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-mono text-white/70">
                          {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
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
                            title="Solscan"
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
              Showing {trades.length} of {totalCount} transactions from the last {timeFilter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLFeedLegacy;
