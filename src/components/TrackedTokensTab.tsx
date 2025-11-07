import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Bell, BellOff, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react';
import { tokenTrackingService, TrackedToken, TokenSearchResult } from '../services/tokenTrackingService';
import { notificationService } from '../services/notificationService';

export const TrackedTokensTab: React.FC = () => {
  const [trackedTokens, setTrackedTokens] = useState<TrackedToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceThreshold, setPriceThreshold] = useState(5);
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    loadTrackedTokens();
    const interval = setInterval(checkPriceAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (trackedTokens.length > 0) {
      const interval = setInterval(() => {
        trackedTokens.forEach(async (token) => {
          const newPrice = await tokenTrackingService.getTokenPrice(token.token_address, token.network);
          const oldPrice = token.current_price;
          if (oldPrice > 0) {
            const change = ((newPrice - oldPrice) / oldPrice) * 100;
            setPriceChanges(prev => ({ ...prev, [token.id]: change }));
          }
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [trackedTokens]);

  const loadTrackedTokens = async () => {
    setLoading(true);
    const tokens = await tokenTrackingService.getTrackedTokens();
    setTrackedTokens(tokens);
    setLoading(false);
  };

  const checkPriceAlerts = async () => {
    const alerts = await tokenTrackingService.checkPriceAlerts(trackedTokens);

    alerts.forEach(alert => {
      notificationService.notifyPriceAlert(
        alert.token.token_symbol,
        alert.oldPrice,
        alert.newPrice,
        alert.changePercent
      );
    });

    if (alerts.length > 0) {
      await loadTrackedTokens();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await tokenTrackingService.searchTokens(query);
    setSearchResults(results.slice(0, 20));
    setIsSearching(false);
  };

  const handleAddToken = async (token: TokenSearchResult) => {
    const added = await tokenTrackingService.addTrackedToken({
      token_address: token.address,
      token_symbol: token.symbol,
      token_name: token.name,
      network: 'solana',
      price_threshold_percent: priceThreshold,
    });

    if (added) {
      notificationService.notifySuccess(
        'Token Added',
        `Now tracking ${token.symbol}`
      );
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
      await loadTrackedTokens();
    } else {
      notificationService.notifyError(
        'Error',
        'Failed to add token'
      );
    }
  };

  const handleRemoveToken = async (id: string) => {
    const success = await tokenTrackingService.removeTrackedToken(id);
    if (success) {
      notificationService.notifySuccess('Token Removed', 'Token removed from tracking');
      await loadTrackedTokens();
    }
  };

  const togglePriceAlert = async (token: TrackedToken) => {
    await tokenTrackingService.updateTrackedToken(token.id, {
      price_alert_enabled: !token.price_alert_enabled,
    });
    await loadTrackedTokens();
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const getTimeSince = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">Price Tracking</h3>
            <p className="text-white/70 mb-4">
              Monitor cryptocurrency prices across multiple networks including Solana, Ethereum, Arbitrum, BSC, and Polygon.
              Get instant notifications when prices change by your specified threshold.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20">
                🔔 Real-time Alerts
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20">
                📊 Multi-Chain Support
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20">
                🎯 Custom Thresholds
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-noir-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Token
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      ) : trackedTokens.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60 mb-4">No tokens tracked yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-white hover:text-white/80 text-sm"
          >
            Add your first token →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {trackedTokens.map((token) => {
            const priceChange = priceChanges[token.id] || 0;
            const isPositive = priceChange > 0;
            const isNegative = priceChange < 0;

            return (
            <div
              key={token.id}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <img
                      src={`https://dd.dexscreener.com/ds-data/tokens/solana/${token.token_address}.png?size=lg`}
                      alt={token.token_symbol}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                      onError={(e) => {
                        e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';
                      }}
                    />
                    {token.price_alert_enabled && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-noir-dark">
                        <Bell className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-lg">{token.token_symbol}</h4>
                      {priceChange !== 0 && (
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isPositive ? 'bg-green-500/20 text-green-400' :
                          isNegative ? 'bg-red-500/20 text-red-400' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
                          {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50">{token.token_name}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveToken(token.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  title="Remove token"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-noir-dark/50 rounded-lg p-4 mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(token.current_price)}
                    </div>
                    <div className="text-xs text-white/40 mt-1">Current Price</div>
                  </div>
                  <button
                    onClick={() => togglePriceAlert(token)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      token.price_alert_enabled
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {token.price_alert_enabled ? (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-white/40 mb-1">Alert Threshold</div>
                    <div className="text-white font-semibold">±{token.price_threshold_percent}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-white/40 mb-1">Tracking Since</div>
                    <div className="text-white font-semibold">{getTimeSince(token.tracked_since)}</div>
                  </div>
                </div>
              </div>

              {token.last_alert_time && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  Last alert: {getTimeSince(token.last_alert_time)}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">Add Token to Track</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/60">
                Track any token from Solana, Ethereum, Arbitrum, BSC, Polygon and more
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">
                Price Alert Threshold (%)
              </label>
              <input
                type="number"
                value={priceThreshold}
                onChange={(e) => setPriceThreshold(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                min="1"
                max="100"
              />
              <p className="text-xs text-white/40 mt-1">
                Get notified when price changes by this percentage
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search token by name or symbol..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              />
            </div>

            {isSearching && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleAddToken(token)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all text-left"
                  >
                    <img
                      src={token.logoURI || `https://dd.dexscreener.com/ds-data/tokens/solana/${token.address}.png?size=lg`}
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full border border-white/20"
                      onError={(e) => {
                        e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{token.symbol}</span>
                        <span className="text-xs text-white/40">{token.name}</span>
                      </div>
                      {token.v24hUSD && (
                        <div className="text-sm text-white/60">
                          24h Vol: ${(token.v24hUSD / 1000000).toFixed(2)}M
                          {token.mc && ` • MC: $${(token.mc / 1000000).toFixed(2)}M`}
                        </div>
                      )}
                    </div>
                    <Plus className="w-5 h-5 text-white/40" />
                  </button>
                ))}
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-white/60">
                No tokens found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
