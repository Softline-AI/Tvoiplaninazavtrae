import React, { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Filter } from 'lucide-react';

interface AnalyticsData {
  id: string;
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const TrendsAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [category, setCategory] = useState('all');

  const getAnalyticsForTimeRange = (range: string): AnalyticsData[] => {
    const baseMultiplier = range === '1h' ? 0.1 : range === '6h' ? 0.4 : range === '24h' ? 1 : range === '7d' ? 5 : 20;

    return [
      {
        id: '1',
        metric: 'Total Smart Money Volume',
        value: `$${(2.4 * baseMultiplier).toFixed(1)}B`,
        change: `+${(15.2 + Math.random() * 5).toFixed(1)}%`,
        trend: 'up',
        description: 'Volume from wallets with >$1M portfolio'
      },
      {
        id: '2',
        metric: 'Whale Transactions',
        value: `${Math.floor(1234 * baseMultiplier)}`,
        change: `+${(8.7 + Math.random() * 3).toFixed(1)}%`,
        trend: 'up',
        description: `Transactions >$100K in the last ${range}`
      },
      {
        id: '3',
        metric: 'New Token Discoveries',
        value: `${Math.floor(89 * baseMultiplier)}`,
        change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 10).toFixed(1)}%`,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        description: 'Tokens first bought by smart money'
      },
      {
        id: '4',
        metric: 'Average Hold Time',
        value: range === '1h' ? '2.3 hrs' : range === '6h' ? '8.5 hrs' : range === '24h' ? '4.2 days' : range === '7d' ? '6.8 days' : '12.4 days',
        change: `+${(12.5 + Math.random() * 5).toFixed(1)}%`,
        trend: 'up',
        description: 'Average holding period for profitable trades'
      },
      {
        id: '5',
        metric: 'Success Rate',
        value: `${(67.8 + Math.random() * 5).toFixed(1)}%`,
        change: `+${(2.3 + Math.random() * 2).toFixed(1)}%`,
        trend: 'up',
        description: 'Percentage of profitable smart money trades'
      },
      {
        id: '6',
        metric: 'Market Dominance',
        value: `${(23.4 + Math.random() * 3).toFixed(1)}%`,
        change: `${Math.random() > 0.6 ? '+' : '-'}${(Math.random() * 3).toFixed(1)}%`,
        trend: Math.random() > 0.6 ? 'up' : 'down',
        description: 'Smart money share of total market volume'
      }
    ];
  };

  const analytics: AnalyticsData[] = getAnalyticsForTimeRange(timeRange);

  const staticAnalytics: AnalyticsData[] = [
    {
      id: '1',
      metric: 'Total Smart Money Volume',
      value: '$2.4B',
      change: '+15.2%',
      trend: 'up',
      description: 'Volume from wallets with >$1M portfolio'
    },
    {
      id: '2',
      metric: 'Whale Transactions',
      value: '1,234',
      change: '+8.7%',
      trend: 'up',
      description: 'Transactions >$100K in the last 24h'
    },
    {
      id: '3',
      metric: 'New Token Discoveries',
      value: '89',
      change: '-3.1%',
      trend: 'down',
      description: 'Tokens first bought by smart money'
    },
    {
      id: '4',
      metric: 'Average Hold Time',
      value: '4.2 days',
      change: '+12.5%',
      trend: 'up',
      description: 'Average holding period for profitable trades'
    },
    {
      id: '5',
      metric: 'Success Rate',
      value: '67.8%',
      change: '+2.3%',
      trend: 'up',
      description: 'Percentage of profitable smart money trades'
    },
    {
      id: '6',
      metric: 'Market Dominance',
      value: '23.4%',
      change: '-1.2%',
      trend: 'down',
      description: 'Smart money share of total market volume'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-white/70" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-white/70';
    }
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      >
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.currentTime = 0.1;
        }}
        <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Trends Analytics</h1>
        <p className="text-sm text-white/60 mt-1">Deep analysis of token trends and whale movements</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
          {['1h', '6h', '24h', '7d', '30d'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === period
                  ? 'bg-white text-noir-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-noir-dark border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          <option value="all">All Metrics</option>
          <option value="volume">Volume Metrics</option>
          <option value="transactions">Transaction Metrics</option>
          <option value="performance">Performance Metrics</option>
        </select>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {analytics.map((item) => (
          <div key={item.id} className="noir-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-white/70" />
                <h3 className="text-sm font-medium text-white/70">{item.metric}</h3>
              </div>
              {getTrendIcon(item.trend)}
            </div>
            
            <div className="mb-2">
              <span className="text-2xl font-bold text-white">{item.value}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                {item.change}
              </span>
              <span className="text-xs text-white/50">vs previous period</span>
            </div>
            
            <p className="text-xs text-white/70">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="noir-card rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Smart Money Flow Analysis</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Last 7 days</span>
          </div>
        </div>
        
        <div className="h-64 bg-noir-dark rounded-lg border border-white/20 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/50">Interactive chart will be displayed here</p>
            <p className="text-white/30 text-sm mt-2">Showing volume trends and whale activity patterns</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TrendsAnalytics;