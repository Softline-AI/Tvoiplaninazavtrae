import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Star,
  TrendingUp,
  Activity,
  Wallet,
  Search,
  Users,
  Zap,
  Repeat
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
      badge: 'LGND'
    },
    {
      icon: <Repeat className="w-4 h-4" />,
      label: 'Live DCA',
      href: '/app/live-dca-feed',
      badge: 'LGND'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar-dark w-64 h-full p-4 flex flex-col">
      <div className="mb-8">
        <Link to="/" className="text-lg font-bold text-white tracking-tight px-3">
          SMARTCHAIN
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
              <span className="badge-white">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Link
          to="/app/upgrade"
          className="btn-white w-full text-center block"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
