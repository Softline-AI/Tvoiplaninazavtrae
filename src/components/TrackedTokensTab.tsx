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

  useEffect(() => {
    loadTrackedTokens();
    const interval = setInterval(checkPriceAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Tracked Tokens</h3>
          <p className="text-sm text-white/60">Monitor price changes and get alerts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-noir-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Token
        </button>
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
        <div className="space-y-3">
          {trackedTokens.map((token) => (
            <div
              key={token.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={`https://dd.dexscreener.com/ds-data/tokens/solana/${token.token_address}.png?size=lg`}
                    alt={token.token_symbol}
                    className="w-10 h-10 rounded-full border border-white/20"
                    onError={(e) => {
                      e.currentTarget.src = 'https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{token.token_symbol}</h4>
                      <span className="text-xs text-white/40">{token.token_name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="text-sm text-white/60">
                        {formatPrice(token.current_price)}
                      </div>
                      <div className="text-xs text-white/40">
                        Tracking: {getTimeSince(token.tracked_since)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePriceAlert(token)}
                    className={`p-2 rounded-lg transition-all ${
                      token.price_alert_enabled
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                    title={token.price_alert_enabled ? 'Alerts enabled' : 'Alerts disabled'}
                  >
                    {token.price_alert_enabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveToken(token.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Remove token"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {token.price_alert_enabled && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-white/60">
                    Alert threshold: ±{token.price_threshold_percent}%
                    {token.last_alert_time && (
                      <span className="ml-2">• Last alert: {getTimeSince(token.last_alert_time)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
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
