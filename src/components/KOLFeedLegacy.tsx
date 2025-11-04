import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Filter, ExternalLink, Copy, Download } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LegacyTrade {
  id: string;
  timestamp: string;
  trader: string;
  traderAvatar: string;
  action: 'buy' | 'sell';
  token: string;
  tokenSymbol: string;
  amount: string;
  price: string;
  value: string;
  walletAddress: string;
  twitterHandle: string;
  pnl: string;
  pnlPercentage: string;
}

const KOLFeedLegacy: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [actionFilter, setActionFilter] = useState('all');
  const [trades, setTrades] = useState<LegacyTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, [timeFilter, actionFilter]);

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
        const txTypes = actionFilter === 'buy' ? ['BUY', 'SWAP'] : ['SELL'];
        query = query.in('transaction_type', txTypes);
      }

      const { data: transactions, error, count } = await query
        .order('block_time', { ascending: false })
        .limit(100);

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
        const avatarUrl = wallet?.twitter_avatar || profile?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg';

        const txType = ['BUY', 'SWAP'].includes(tx.transaction_type) ? 'buy' : 'sell';
        const amount = parseFloat(tx.amount || '0');
        const price = parseFloat(tx.current_token_price || '0');
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
          amount: `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${tx.token_symbol}`,
          price: `$${price.toFixed(price < 0.01 ? 8 : 2)}`,
          value: `$${(amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          walletAddress: tx.from_address,
          twitterHandle: profile?.twitter_handle || tx.from_address.substring(0, 8),
          pnl: `${tokenPnl >= 0 ? '+' : ''}$${Math.abs(tokenPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pnlPercentage: `${tokenPnlPercentage >= 0 ? '+' : ''}${tokenPnlPercentage.toFixed(2)}%`
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
          <h1 className="text-xl mb-1 font-semibold text-white">KOL Feed Legacy</h1>
          <p className="text-sm text-gray-400">
            {loading ? 'Loading...' : `${totalCount} transactions found`}
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
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-noir-dark border-b border-white/20">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Timestamp
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Trader
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Token
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Total Value
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      P&L
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="transition-all duration-300 hover:bg-white/5">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-white/70">{trade.timestamp}</div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={trade.traderAvatar}
                            alt={trade.trader}
                            className="w-8 h-8 rounded-full border border-white/30"
                          />
                          <div>
                            <div className="text-sm font-bold text-white">{trade.trader}</div>
                            <div className="text-xs text-white/70">@{typeof trade.twitterHandle === 'string' ? trade.twitterHandle.replace('@', '') : trade.twitterHandle}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getActionColor(trade.action)} ${getActionBg(trade.action)}`}>
                          <TrendingUp className={`w-4 h-4 ${trade.action === 'sell' ? 'rotate-180' : ''}`} />
                          {trade.action.toUpperCase()}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border border-white/30">
                            <span className="text-white font-bold text-xs">
                              {trade.tokenSymbol.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{trade.tokenSymbol}</div>
                            <div className="text-xs text-white/70">{trade.token}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">{trade.amount}</div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">{trade.price}</div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${getActionColor(trade.action)}`}>
                          {trade.value}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className={`font-bold ${trade.pnl.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                            {trade.pnl}
                          </div>
                          <div className={`text-xs ${trade.pnl.includes('-') ? 'text-red-400/70' : 'text-green-400/70'}`}>
                            {trade.pnlPercentage}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(trade.walletAddress)}
                            className="hover:opacity-70 hover:scale-110 transition-all cursor-pointer p-1 text-white/70"
                            title="Copy wallet address"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://solscan.io/account/${trade.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 hover:scale-110 transition-all p-1 text-white/70"
                            title="View on Solscan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <a
                            href={`https://twitter.com/${trade.twitterHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 hover:scale-110 transition-all p-1 text-blue-400"
                            title="View Twitter"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                              <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                            </svg>
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
