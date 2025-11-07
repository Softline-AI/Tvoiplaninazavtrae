import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface Trade {
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  value: number;
  pnl?: number;
  timestamp: string;
  signature: string;
}

interface TokenPosition {
  tokenSymbol: string;
  totalBought: number;
  totalSold: number;
  averageEntryPrice: number;
  averageExitPrice: number;
  remainingTokens: number;
  isFullySold: boolean;
  realizedPnl: number;
  realizedPnlPercentage: number;
  unrealizedPnl: number;
  totalPnl: number;
  totalPnlPercentage: number;
  buyCount: number;
  sellCount: number;
  allTrades: Trade[];
}

interface Props {
  positions: TokenPosition[];
  onSelectToken?: (tokenSymbol: string) => void;
}

export default function AggregatedPositions({ positions, onSelectToken }: Props) {
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  const filteredPositions = positions.filter(position => {
    if (filterStatus === 'open') return !position.isFullySold;
    if (filterStatus === 'closed') return position.isFullySold;
    return true;
  });

  const totalRealizedPnl = positions.reduce((sum, p) => sum + p.realizedPnl, 0);
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalPnl = totalRealizedPnl + totalUnrealizedPnl;
  const openPositions = positions.filter(p => !p.isFullySold).length;

  const handleToggle = (tokenSymbol: string) => {
    setExpandedToken(expandedToken === tokenSymbol ? null : tokenSymbol);
    if (onSelectToken) {
      onSelectToken(tokenSymbol);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Package className="w-4 h-4" />
            <span>Total Positions</span>
          </div>
          <div className="text-2xl font-bold text-white">{positions.length}</div>
          <div className="text-xs text-gray-500 mt-1">{openPositions} open</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Realized P&L</span>
          </div>
          <div className={`text-2xl font-bold ${totalRealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalRealizedPnl.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">From closed positions</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Unrealized P&L</span>
          </div>
          <div className={`text-2xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalUnrealizedPnl.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">From open positions</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Total P&L</span>
          </div>
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPnl.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Combined</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({positions.length})
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'open'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Open ({openPositions})
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === 'closed'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Closed ({positions.length - openPositions})
        </button>
      </div>

      {/* Positions List */}
      <div className="space-y-3">
        {filteredPositions.map((position) => (
          <div
            key={position.tokenSymbol}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
          >
            {/* Position Header */}
            <button
              onClick={() => handleToggle(position.tokenSymbol)}
              className="w-full p-4 hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{position.tokenSymbol}</span>
                      {position.isFullySold ? (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">CLOSED</span>
                      ) : (
                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">OPEN</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {position.buyCount} buys, {position.sellCount} sells
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Avg Entry</div>
                    <div className="text-sm text-white font-mono">
                      ${position.averageEntryPrice.toFixed(8)}
                    </div>
                  </div>

                  {position.sellCount > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">Avg Exit</div>
                      <div className="text-sm text-white font-mono">
                        ${position.averageExitPrice.toFixed(8)}
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Total P&L</div>
                    <div className={`text-lg font-bold ${position.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.totalPnl >= 0 ? '+' : ''}${position.totalPnl.toFixed(2)}
                    </div>
                    <div className={`text-xs ${position.totalPnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.totalPnlPercentage >= 0 ? '+' : ''}{position.totalPnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedToken === position.tokenSymbol && (
              <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
                {/* P&L Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Realized P&L</div>
                    <div className={`text-lg font-bold ${position.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.realizedPnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {position.realizedPnlPercentage.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Unrealized P&L</div>
                    <div className={`text-lg font-bold ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.unrealizedPnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">On remaining tokens</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Remaining</div>
                    <div className="text-lg font-bold text-white">
                      {position.remainingTokens.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">tokens</div>
                  </div>
                </div>

                {/* Trade History */}
                <div>
                  <div className="text-sm font-medium text-gray-400 mb-2">Trade History</div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {position.allTrades.map((trade, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-800/30 rounded text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.type}
                          </span>
                          <span className="text-gray-400">
                            {trade.amount.toFixed(2)} @ ${trade.price.toFixed(8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {trade.pnl !== undefined && (
                            <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                          )}
                          <span className="text-gray-500">
                            {new Date(trade.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPositions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No positions found
        </div>
      )}
    </div>
  );
}
