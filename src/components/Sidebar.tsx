import React, { useState } from 'react';
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
  Repeat,
  Crown,
  ChevronDown,
  Play,
  Target,
  Shuffle
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    kol: true,
    streams: true,
    smart: true,
    solana: true,
    legend: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar py-4 w-64 h-full px-3 noir-sidebar z-100 overflow-y-auto">
      <div>
        <div className="transition-all duration-200 space-y-1">
          <Link
            to="/app/learning-center"
            className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white hover:bg-white/10 group"
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Learning Center</span>
            </div>
          </Link>
          <Link
            to="/app/my-stalks"
            className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">My Stalks</span>
            </div>
            <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
              PRO
            </div>
          </Link>
        </div>
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('kol')}
          className="w-full px-3 flex items-center justify-between text-white/60 rounded-lg hover:bg-white/5 h-9 mb-2 group transition-all"
        >
          <span className="text-[11px] font-bold tracking-wider">KOL SCREENER</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.kol ? 'rotate-180' : ''}`} />
        </button>
        {openSections.kol && (
          <div className="space-y-1 mb-3">
            <Link
              to="/app/kol-feed"
              className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all group ${
                isActive('/app/kol-feed')
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">KOL Feed</span>
            </Link>
            <Link
              to="/app/kol-leaderboard"
              className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all group ${
                isActive('/app/kol-leaderboard')
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">KOL Leaderboard</span>
            </Link>
            <Link
              to="/app/top-kol-tokens"
              className="flex items-center gap-3 h-10 px-3 rounded-lg transition-all text-white hover:bg-white/10 group"
            >
              <Star className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Top KOL Tokens</span>
            </Link>
            <Link
              to="/app/kol-feed-legacy"
              className="flex items-center gap-3 h-10 px-3 rounded-lg transition-all text-white hover:bg-white/10 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:scale-110"
              >
                <path
                  d="M5 18h14M5 14h14l1-9-4 3-4-5-4 5-4-3 1 9Z"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">KOL Feed Legacy</span>
            </Link>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('streams')}
          className="w-full px-2 flex items-center justify-between text-white rounded-lg hover:bg-white/10 h-auto pt-2 mb-1"
        >
          <span className="text-xs">STREAMS SCREENER</span>
          <div className="flex items-center justify-center h-6 w-6 min-w-6">
            <div className={`transition-transform ${openSections.streams ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </button>
        {openSections.streams && (
          <div className="transition-all duration-200">
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/live-market-feed"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Live Market Feed</span>
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/transaction-stream"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Transaction Stream</span>
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/realtime-analytics"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Real-time Analytics</span>
                </div>
              </Link>
            </div>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('smart')}
          className="w-full px-2 flex items-center justify-between text-white rounded-lg hover:bg-white/10 h-auto pt-2 mb-1"
        >
          <span className="text-xs">SMART MONEY TRACKER</span>
          <div className="flex items-center justify-center h-6 w-6 min-w-6">
            <div className={`transition-transform ${openSections.smart ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </button>
        {openSections.smart && (
          <div className="transition-all duration-200">
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/daily-trends"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Daily Trends</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/top-tokens"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Top Tokens</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/trends-analytics"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Trends Analytics</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/transactions"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Transactions</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('solana')}
          className="w-full px-2 flex items-center justify-between text-white rounded-lg hover:bg-white/10 h-auto pt-2 mb-1"
        >
          <span className="text-xs">SOLANA TOOLS</span>
          <div className="flex items-center justify-center h-6 w-6 min-w-6">
            <div className={`transition-transform ${openSections.solana ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </button>
        {openSections.solana && (
          <div className="transition-all duration-200">
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/wallet-finder"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Wallet Finder</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/cabal-finder"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Cabal Finder</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/copy-traders"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Copy Traders</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                  PRO
                </div>
              </Link>
            </div>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('legend')}
          className="w-full px-2 flex items-center justify-between text-white rounded-lg hover:bg-white/10 h-auto pt-2 mb-1"
        >
          <span className="text-xs">LEGEND TOOLS</span>
          <div className="flex items-center justify-center h-6 w-6 min-w-6">
            <div className={`transition-transform ${openSections.legend ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </button>
        {openSections.legend && (
          <div className="transition-all duration-200">
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/insider-scan"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Insider Scan</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-blue-600 border-purple-200 bg-purple-50">
                  LGND
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/fresh-wallet-feed"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Fresh Wallet Feed</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-blue-600 border-purple-200 bg-purple-50">
                  LGND
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/live-dca-feed"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Live DCA Feed</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-blue-600 border-purple-200 bg-purple-50">
                  LGND
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/legend-community"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Legend Community</span>
                </div>
                <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-blue-600 border-purple-200 bg-purple-50">
                  LGND
                </div>
              </Link>
            </div>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <Link
        to="/app/upgrade"
        className="w-full flex items-center justify-center gap-2 bg-white text-black h-12 px-4 rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 mt-6"
      >
        <Crown className="w-5 h-5" />
        Unlock Tools
      </Link>
    </div>
  );
};

export default Sidebar;
