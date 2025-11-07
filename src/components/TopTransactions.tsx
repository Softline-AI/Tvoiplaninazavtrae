import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { kolFeedServiceV2, type KOLFeedItem } from '../services/kolFeedServiceV2';

export default function TopTransactions() {
  const navigate = useNavigate();
  const [topTrades, setTopTrades] = useState<KOLFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadTopTransactions();
  }, [timeRange]);

  const loadTopTransactions = async () => {
    setLoading(true);
    const result = await kolFeedServiceV2.getKOLFeed({
      timeRange,
      type: 'all',
      sortBy: 'time',
      limit: 10
    });

    if (result.success) {
      setTopTrades(result.data);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recent Trades</h2>
            <p className="text-sm text-gray-400">Latest transactions</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : topTrades.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No trades found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topTrades.map((trade, index) => (
            <div
              key={trade.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/app/kol-profile/${trade.walletAddress}`)}
                    className="hover:opacity-70 transition-all cursor-pointer"
                  >
                    <img
                      src={trade.kolAvatar}
                      alt={trade.kolName}
                      className="w-10 h-10 rounded-full"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => navigate(`/app/kol-profile/${trade.walletAddress}`)}
                        className="font-bold text-white hover:underline hover:opacity-70 transition-all cursor-pointer"
                      >
                        {trade.kolName}
                      </button>
                      <span className="text-xs text-gray-500">@{trade.twitterHandle.replace('@', '')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        trade.lastTx === 'buy'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.lastTx.toUpperCase()}
                      </span>
                      <span className="text-white font-medium">{trade.token}</span>
                      <span className="text-gray-400">
                        {trade.lastTx === 'buy' ? trade.bought : trade.sold}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{trade.timeAgo} ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500">
                    {trade.lastTx === 'buy' ? trade.bought : trade.sold}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
