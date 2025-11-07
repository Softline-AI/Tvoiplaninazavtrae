import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, ExternalLink, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { aggregatedPnlService, type TokenPosition } from '../services/aggregatedPnlService';
import { useTokenLogo } from '../hooks/useTokenLogo';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface AggregatedPosition extends TokenPosition {
  kolName: string;
  kolAvatar: string;
  twitterHandle: string;
  lastUpdateTime: string;
}

const AggregatedKOLFeed: React.FC = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('7d');
  const [positions, setPositions] = useState<AggregatedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  useEffect(() => {
    loadAggregatedPositions();

    const channel = supabase
      .channel('webhook_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_transactions'
        },
        () => {
          loadAggregatedPositions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeFilter]);

  const loadAggregatedPositions = async () => {
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

      const { data: profiles } = await supabase
        .from('kol_profiles')
        .select('*');

      if (!profiles || profiles.length === 0) {
        setPositions([]);
        return;
      }

      const allPositions: AggregatedPosition[] = [];

      for (const profile of profiles) {
        const walletPositions = await aggregatedPnlService.getWalletPositions(profile.wallet_address);

        const filteredPositions = walletPositions.filter(pos => {
          const lastTradeTime = new Date(pos.lastSellTime || pos.firstBuyTime);
          return lastTradeTime >= timeFilter_date;
        });

        const enrichedPositions: AggregatedPosition[] = filteredPositions.map(pos => ({
          ...pos,
          kolName: profile.name,
          kolAvatar: profile.avatar_url || 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg',
          twitterHandle: profile.twitter_handle,
          lastUpdateTime: pos.lastSellTime || pos.firstBuyTime
        }));

        allPositions.push(...enrichedPositions);
      }

      allPositions.sort((a, b) => new Date(b.lastUpdateTime).getTime() - new Date(a.lastUpdateTime).getTime());

      setPositions(allPositions);
    } catch (error) {
      console.error('Error loading aggregated positions:', error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (positionKey: string) => {
    setExpandedPosition(expandedPosition === positionKey ? null : positionKey);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCurrency = (num: number): string => {
    return `$${formatNumber(num, 2)}`;
  };

  const TokenLogo: React.FC<{ mint: string; symbol: string }> = ({ mint, symbol }) => {
    const logoUrl = useTokenLogo(mint);

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

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-xl mb-1 font-semibold text-white">KOL Feed - Aggregated Positions</h1>
          <p className="text-sm text-gray-400">
            {loading ? 'Loading...' : `${positions.length} active positions`}
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
        </div>

        {loading ? (
          <div className="noir-card rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading positions...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="noir-card rounded-2xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white/70">No positions found for this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => {
              const positionKey = `${position.walletAddress}-${position.tokenMint}`;
              const isExpanded = expandedPosition === positionKey;

              return (
                <div
                  key={positionKey}
                  className="noir-card rounded-xl overflow-hidden transition-all duration-200 hover:bg-white/5"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => navigate(`/app/kol-profile/${position.walletAddress}`)}
                          className="hover:opacity-70 transition-all cursor-pointer flex-shrink-0"
                        >
                          <img
                            src={position.kolAvatar}
                            alt={position.kolName}
                            className="w-10 h-10 rounded-full border border-white/30"
                          />
                        </button>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigate(`/app/kol-profile/${position.walletAddress}`)}
                            className="font-bold text-white hover:underline hover:opacity-70 transition-all text-sm"
                          >
                            {position.kolName}
                          </button>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(position.lastUpdateTime).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TokenLogo mint={position.tokenMint} symbol={position.tokenSymbol} />
                          <div>
                            <div className="text-sm font-semibold text-white">{position.tokenSymbol}</div>
                            {position.marketCap > 0 && (
                              <div className="text-xs text-gray-400">MC: {formatCurrency(position.marketCap)}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Bought</div>
                          <div className="text-sm font-semibold text-green-400">{formatCurrency(position.totalBuyValue)}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-400">Sold</div>
                          <div className="text-sm font-semibold text-red-400">{formatCurrency(position.totalSellValue)}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-400">Holding</div>
                          <div className="text-sm font-semibold text-white">
                            {position.isFullySold ? 'Sold All' : `${formatNumber(position.remainingTokens, 4)} ${position.tokenSymbol}`}
                          </div>
                        </div>

                        <div className="text-right min-w-[120px]">
                          <div className="text-xs text-gray-400">Live P&L</div>
                          <div className={`text-lg font-bold ${position.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(position.totalPnl)}
                          </div>
                          <div className={`text-sm ${position.totalPnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.totalPnlPercentage >= 0 ? '+' : ''}{formatNumber(position.totalPnlPercentage, 2)}%
                          </div>
                        </div>

                        <button
                          onClick={() => toggleExpanded(positionKey)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-white" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/10 bg-noir-dark/50 p-4">
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-3">Position Details</h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg Entry Price:</span>
                              <span className="text-white font-medium">{formatCurrency(position.averageEntryPrice)}</span>
                            </div>
                            {position.sellCount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Avg Exit Price:</span>
                                <span className="text-white font-medium">{formatCurrency(position.averageExitPrice)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-400">Current Price:</span>
                              <span className="text-white font-medium">{formatCurrency(position.currentPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Buy Trades:</span>
                              <span className="text-white font-medium">{position.buyCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sell Trades:</span>
                              <span className="text-white font-medium">{position.sellCount}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-white mb-3">P&L Breakdown</h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Realized P&L:</span>
                              <span className={`font-medium ${position.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(position.realizedPnl)} ({position.realizedPnlPercentage >= 0 ? '+' : ''}{formatNumber(position.realizedPnlPercentage, 2)}%)
                              </span>
                            </div>
                            {!position.isFullySold && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Unrealized P&L:</span>
                                <span className={`font-medium ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(position.unrealizedPnl)} ({position.unrealizedPnlPercentage >= 0 ? '+' : ''}{formatNumber(position.unrealizedPnlPercentage, 2)}%)
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-white/10">
                              <span className="text-white font-medium">Total P&L:</span>
                              <span className={`font-bold ${position.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(position.totalPnl)} ({position.totalPnlPercentage >= 0 ? '+' : ''}{formatNumber(position.totalPnlPercentage, 2)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Trade History</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {position.allTrades.map((trade, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs bg-noir-black/30 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.type}
                                </span>
                                <span className="text-gray-400">{new Date(trade.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-gray-400">Amount</div>
                                  <div className="text-white">{formatNumber(trade.amount, 4)}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-gray-400">Price</div>
                                  <div className="text-white">{formatCurrency(trade.price)}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-gray-400">Value</div>
                                  <div className="text-white">{formatCurrency(trade.value)}</div>
                                </div>
                                {trade.pnl !== undefined && (
                                  <div className="text-right min-w-[80px]">
                                    <div className="text-gray-400">P&L</div>
                                    <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {formatCurrency(trade.pnl)}
                                    </div>
                                  </div>
                                )}
                                <a
                                  href={`https://solscan.io/tx/${trade.signature}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:opacity-70 transition-all text-white/70"
                                  title="View on Solscan"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => copyToClipboard(position.walletAddress)}
                          className="text-xs bg-noir-black/50 px-3 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-white/70"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Wallet
                        </button>
                        <a
                          href={`https://solscan.io/account/${position.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-noir-black/50 px-3 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-white/70"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Solscan
                        </a>
                        <a
                          href={`https://twitter.com/${position.twitterHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-noir-black/50 px-3 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-blue-400"
                        >
                          <XIcon className="w-3 h-3" />
                          Twitter
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AggregatedKOLFeed;
