import { useEffect, useState } from 'react';
import { Bell, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { priceMonitor, PriceAlert } from '../services/priceMonitor';
import { memecoinPnlTracker, MemecoinPosition } from '../services/memecoinPnlTracker';

export default function MemecoinMonitor() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [positions, setPositions] = useState<MemecoinPosition[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');

  useEffect(() => {
    priceMonitor.onPriceAlert((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20));

      if (Notification.permission === 'granted') {
        const emoji = alert.alertType === 'pump' ? '🚀' : alert.alertType === 'dump' ? '📉' : '⚡';
        new Notification(`${emoji} ${alert.tokenSymbol} Price Alert`, {
          body: `${alert.changePercent > 0 ? '+' : ''}${alert.changePercent.toFixed(2)}% - $${alert.currentPrice.toFixed(8)}`,
          icon: '/favicon.ico'
        });
      }

      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCl/zPDTgjMGHm7A7+OZURE');
        audio.play().catch(() => {});
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    });

    return () => {
      priceMonitor.stopMonitoring();
    };
  }, []);

  const handleStartMonitoring = async () => {
    if (!selectedWallet) {
      alert('Please enter a wallet address');
      return;
    }

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    const positions = await memecoinPnlTracker.getMemecoinPositions(selectedWallet);
    setPositions(positions);

    const tokens = positions.map(p => ({
      address: p.tokenMint,
      symbol: p.tokenSymbol
    }));

    priceMonitor.startMonitoring(tokens);
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    priceMonitor.stopMonitoring();
    setIsMonitoring(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pump':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'dump':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'pump':
        return 'bg-green-500/10 border-green-500/30';
      case 'dump':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Memecoin Price Monitor</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              placeholder="Enter Solana wallet address..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              disabled={isMonitoring}
            />
          </div>

          <div className="flex gap-3">
            {!isMonitoring ? (
              <button
                onClick={handleStartMonitoring}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={handleStopMonitoring}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Stop Monitoring
              </button>
            )}
          </div>

          {isMonitoring && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Monitoring {positions.length} memecoins</span>
            </div>
          )}
        </div>
      </div>

      {positions.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Memecoin Positions</h3>
          <div className="space-y-3">
            {positions.map((position) => (
              <div
                key={position.tokenMint}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{position.tokenSymbol}</span>
                      {position.category && (
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {position.category}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {position.remainingTokens.toFixed(2)} tokens @ ${position.currentPrice.toFixed(8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${position.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.totalPnl.toFixed(2)}
                    </div>
                    <div className={`text-sm ${position.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Price Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getAlertColor(alert.alertType)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.alertType)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{alert.tokenSymbol}</span>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded uppercase">
                          {alert.alertType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        ${alert.previousPrice.toFixed(8)} → ${alert.currentPrice.toFixed(8)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${alert.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {alert.changePercent >= 0 ? '+' : ''}{alert.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
