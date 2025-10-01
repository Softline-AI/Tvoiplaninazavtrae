import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Play, 
  Target, 
  BarChart3, 
  Star, 
  TrendingUp, 
  Activity, 
  Wallet, 
  Search, 
  Users, 
  Zap, 
  Repeat, 
  Shuffle, 
  Crown,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    kolScreener: true,
    streamsScreener: true,
    smartMoneyTracker: true,
    solanaTools: true,
    legendTools: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    {
      icon: <Play className="w-5 h-5" />,
      label: 'Learning Center',
      href: '/app/learning-center'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'My Stalks',
      href: '/app/my-stalks',
      badge: 'PRO',
      disabled: true
    }
  ];

  const kolScreenerItems = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'KOL Feed',
      href: '/app/kol-feed'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'KOL Leaderboard',
      href: '/app/kol-leaderboard',
      active: true
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Top KOL Tokens',
      href: '/app/top-kol-tokens'
    }
  ];

  const kolFeedLegacyItem = {
    label: 'KOL Feed Legacy',
    href: '/app/kol-feed-legacy'
  };

  const streamsScreenerItems = [
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Live Market Feed',
      href: '/app/live-market-feed'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Transaction Stream',
      href: '/app/transaction-stream'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Real-time Analytics',
      href: '/app/realtime-analytics'
    }
  ];

  const smartMoneyTrackerItems = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Daily Trends',
      href: '/app/daily-trends',
      badge: 'PRO',
      disabled: true
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Top Tokens',
      href: '/app/top-tokens',
      badge: 'PRO',
      disabled: true
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Trends Analytics',
      href: '/app/trends-analytics',
      badge: 'PRO',
      disabled: true
    },
    {
      icon: <Shuffle className="w-5 h-5" />,
      label: 'Transactions',
      href: '/app/transactions',
      badge: 'PRO',
      disabled: true
    }
  ];

  const solanaToolsItems = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'Wallet Finder',
      href: '/app/wallet-finder',
      badge: 'PRO',
      disabled: true
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Cabal Finder',
      href: '/app/cabal-finder',
      badge: 'PRO',
      disabled: true
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Copy Traders',
      href: '/app/copy-traders',
      badge: 'PRO',
      disabled: true
    }
  ];

  const legendToolsItems = [
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Insider Scan',
      href: '/app/insider-scan',
      badge: 'LGND',
      disabled: true
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Fresh Wallet Feed',
      href: '/app/fresh-wallet-feed',
      badge: 'LGND',
      disabled: true
    },
    {
      icon: <Repeat className="w-5 h-5" />,
      label: 'Live DCA Feed',
      href: '/app/live-dca-feed',
      badge: 'LGND',
      disabled: true
    },
    {
      icon: <Crown className="w-5 h-5" />,
      label: 'Legend Community',
      href: '/app/legend-community',
      badge: 'LGND',
      disabled: true
    }
  ];

  const renderMenuItem = (item: any) => {
    const isActive = location.pathname === item.href;
    
    return (
    <div key={item.label} className="flex w-full gap-1 mb-1">
      <Link
        to={item.href}
        className={`flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors ${
          isActive 
            ? 'text-noir-black bg-white' 
            : item.disabled 
              ? 'text-white opacity-50 hover:bg-white/10' 
              : 'text-white hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={isActive ? 'text-noir-black' : 'text-white'}>
            {item.icon}
          </div>
          <span className={`text-sm ${isActive ? 'text-noir-black' : 'text-white'}`}>
            {item.label}
          </span>
        </div>
        {item.badge && (
          <div className={`font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border ${
            item.badge === 'PRO' 
              ? 'text-purple-700 border-purple-200 bg-purple-50' 
              : 'text-blue-600 border-purple-200 bg-purple-50'
          }`}>
            {item.badge}
          </div>
        )}
      </Link>
    </div>
    );
  };

  const renderSpecialMenuItem = (item: any) => {
    const isActive = location.pathname === item.href;
    
    return (
      <div key={item.label} className="flex w-full gap-1 mb-1">
        <Link
          to={item.href}
          className="z-0 group relative box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 min-w-20 text-small gap-2 rounded-small transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:bg-default/40 flex-1 flex items-center justify-between text-white bg-black h-8 px-2 rounded-lg hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div>
              <svg aria-hidden="true" focusable="false" height="20" role="presentation" viewBox="0 0 24 24" width="20" fill="none">
                <path d="M5 18h14M5 14h14l1-9-4 3-4-5-4 5-4-3 1 9Z" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="text-sm text-white">{item.label}</span>
          </div>
        </Link>
      </div>
    );
  };

  const renderSection = (title: string, items: any[], sectionKey: keyof typeof expandedSections) => (
    <div>
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-2 flex items-center justify-between text-white rounded-lg hover:bg-white/10 h-auto pt-2 mb-1"
      >
        <span className="text-xs">{title}</span>
        <div className="flex items-center justify-center h-6 w-6 min-w-6">
          <div className={`transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </button>
      {expandedSections[sectionKey] && (
        <div className="transition-all duration-200">
          {items.map((item) => renderMenuItem(item))}
          {sectionKey === 'kolScreener' && renderSpecialMenuItem(kolFeedLegacyItem)}
        </div>
      )}
      <hr className="border-white/20 my-1" />
    </div>
  );

  return (
    <div className="sidebar py-2 w-60 h-full px-2 noir-sidebar z-100">
      <div>
        <div className="transition-all duration-200">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
        <hr className="border-blue-500/30 my-1" />
      </div>

      {renderSection('KOL SCREENER', kolScreenerItems, 'kolScreener')}
      {renderSection('STREAMS SCREENER', streamsScreenerItems, 'streamsScreener')}
      {renderSection('SMART MONEY TRACKER', smartMoneyTrackerItems, 'smartMoneyTracker')}
      {renderSection('SOLANA TOOLS', solanaToolsItems, 'solanaTools')}
      {renderSection('LEGEND TOOLS', legendToolsItems, 'legendTools')}

      <button className="w-full flex items-center soft-button text-medium h-10 mb-1 px-2 rounded-lg">
      </button>
      <button className="w-full flex items-center noir-button text-medium h-10 mb-1 px-2 rounded-lg">
        <Link to="/app/upgrade" className="w-full flex items-center">
          <Crown className="w-7 h-7 mr-2" />
          Unlock Tools
        </Link>
      </button>
    </div>
  );
};

export default Sidebar;