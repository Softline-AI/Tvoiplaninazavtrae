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
    <div className="sidebar py-2 w-60 h-full px-2 noir-sidebar z-100">
      <div>
        <div className="transition-all duration-200">
          <div className="flex w-full gap-1 mb-1">
            <Link
              to="/app/learning-center"
              className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="text-white">
                  <Play className="w-5 h-5" />
                </div>
                <span className="text-sm text-white">Learning Center</span>
              </div>
            </Link>
          </div>
          <div className="flex w-full gap-1 mb-1">
            <Link
              to="/app/my-stalks"
              className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white opacity-50 hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="text-white">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-sm text-white">My Stalks</span>
              </div>
              <div className="font-semibold px-1 py-0 rounded w-9 text-center flex items-center justify-center text-xs h-4 border text-purple-700 border-purple-200 bg-purple-50">
                PRO
              </div>
            </Link>
          </div>
        </div>
        <hr className="border-blue-500/30 my-1" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('kol')}
          className="w-full px-2 flex items-center justify-between text-white rounded-lg hover:bg-white/10 h-auto pt-2 mb-1"
        >
          <span className="text-xs">KOL SCREENER</span>
          <div className="flex items-center justify-center h-6 w-6 min-w-6">
            <div className={`transition-transform ${openSections.kol ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </button>
        {openSections.kol && (
          <div className="transition-all duration-200">
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/kol-feed"
                className={`flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors ${
                  isActive('/app/kol-feed')
                    ? 'text-noir-black bg-white'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={isActive('/app/kol-feed') ? 'text-noir-black' : 'text-white'}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className={`text-sm ${isActive('/app/kol-feed') ? 'text-noir-black' : 'text-white'}`}>
                    KOL Feed
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/kol-leaderboard"
                className={`flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors ${
                  isActive('/app/kol-leaderboard')
                    ? 'text-noir-black bg-white'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={isActive('/app/kol-leaderboard') ? 'text-noir-black' : 'text-white'}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className={`text-sm ${isActive('/app/kol-leaderboard') ? 'text-noir-black' : 'text-white'}`}>
                    KOL Leaderboard
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/top-kol-tokens"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-white">Top KOL Tokens</span>
                </div>
              </Link>
            </div>
            <div className="flex w-full gap-1 mb-1">
              <Link
                to="/app/kol-feed-legacy"
                className="flex-1 flex items-center justify-between h-8 px-2 rounded-lg transition-colors text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 18h14M5 14h14l1-9-4 3-4-5-4 5-4-3 1 9Z"
                        stroke="white"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-white">KOL Feed Legacy</span>
                </div>
              </Link>
            </div>
          </div>
        )}
        <hr className="border-white/20 my-1" />
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
        <hr className="border-white/20 my-1" />
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
        <hr className="border-white/20 my-1" />
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
        <hr className="border-white/20 my-1" />
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
        <hr className="border-white/20 my-1" />
      </div>

      <button className="w-full flex items-center soft-button text-medium h-10 mb-1 px-2 rounded-lg"></button>
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
