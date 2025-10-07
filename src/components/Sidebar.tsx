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
  Crown,
  ChevronRight
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'KOL Feed',
      href: '/app/kol-feed'
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      label: 'Leaderboard',
      href: '/app/kol-leaderboard'
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'Top Tokens',
      href: '/app/top-kol-tokens'
    },
    {
      icon: <Activity className="w-4 h-4" />,
      label: 'Daily Trends',
      href: '/app/daily-trends',
      badge: 'PRO'
    },
    {
      icon: <Wallet className="w-4 h-4" />,
      label: 'Wallet Finder',
      href: '/app/wallet-finder',
      badge: 'PRO'
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: 'Cabal Finder',
      href: '/app/cabal-finder',
      badge: 'PRO'
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Copy Traders',
      href: '/app/copy-traders',
      badge: 'PRO'
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Insider Scan',
      href: '/app/insider-scan',
      badge: 'LEGEND'
    },
    {
      icon: <Repeat className="w-4 h-4" />,
      label: 'Live DCA Feed',
      href: '/app/live-dca-feed',
      badge: 'LEGEND'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar-modern w-64 h-full p-4 flex flex-col">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-lg font-semibold text-white">SmartChain</span>
        </Link>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className={item.badge === 'PRO' ? 'badge-pro' : 'badge-legend'}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Link
          to="/app/upgrade"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Crown className="w-5 h-5" />
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
