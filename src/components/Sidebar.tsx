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
    <div className="sidebar py-4 w-full h-full px-3 noir-glass z-100 overflow-y-auto hidden md:block">
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
          className="w-full px-3 flex items-center justify-between text-white/60 rounded-lg hover:bg-white/5 h-9 mb-2 group transition-all"
        >
          <span className="text-[11px] font-bold tracking-wider">STREAMS SCREENER</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.streams ? 'rotate-180' : ''}`} />
        </button>
        {openSections.streams && (
          <div className="space-y-1 mb-3">
            <Link
              to="/app/live-market-feed"
              className="flex items-center gap-3 h-10 px-3 rounded-lg transition-all text-white hover:bg-white/10 group"
            >
              <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Live Market Feed</span>
            </Link>
            <Link
              to="/app/transaction-stream"
              className="flex items-center gap-3 h-10 px-3 rounded-lg transition-all text-white hover:bg-white/10 group"
            >
              <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Transaction Stream</span>
            </Link>
            <Link
              to="/app/realtime-analytics"
              className="flex items-center gap-3 h-10 px-3 rounded-lg transition-all text-white hover:bg-white/10 group"
            >
              <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Real-time Analytics</span>
            </Link>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('smart')}
          className="w-full px-3 flex items-center justify-between text-white/60 rounded-lg hover:bg-white/5 h-9 mb-2 group transition-all"
        >
          <span className="text-[11px] font-bold tracking-wider">SMART MONEY TRACKER</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.smart ? 'rotate-180' : ''}`} />
        </button>
        {openSections.smart && (
          <div className="space-y-1 mb-3">
            <Link
              to="/app/daily-trends"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Daily Trends</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
            <Link
              to="/app/top-tokens"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Top Tokens</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
            <Link
              to="/app/trends-analytics"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Trends Analytics</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
            <Link
              to="/app/transactions"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Shuffle className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('solana')}
          className="w-full px-3 flex items-center justify-between text-white/60 rounded-lg hover:bg-white/5 h-9 mb-2 group transition-all"
        >
          <span className="text-[11px] font-bold tracking-wider">SOLANA TOOLS</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.solana ? 'rotate-180' : ''}`} />
        </button>
        {openSections.solana && (
          <div className="space-y-1 mb-3">
            <Link
              to="/app/wallet-finder"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Wallet Finder</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
            <Link
              to="/app/cabal-finder"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Cabal Finder</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
            <Link
              to="/app/copy-traders"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Copy Traders</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-white/20 bg-white/5">
                PRO
              </div>
            </Link>
          </div>
        )}
        <div className="h-px bg-white/10 my-3" />
      </div>

      <div>
        <button
          onClick={() => toggleSection('legend')}
          className="w-full px-3 flex items-center justify-between text-white/60 rounded-lg hover:bg-white/5 h-9 mb-2 group transition-all"
        >
          <span className="text-[11px] font-bold tracking-wider">LEGEND TOOLS</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.legend ? 'rotate-180' : ''}`} />
        </button>
        {openSections.legend && (
          <div className="space-y-1 mb-3">
            <Link
              to="/app/insider-scan"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Insider Scan</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30 bg-amber-500/10 text-amber-400">
                LGND
              </div>
            </Link>
            <Link
              to="/app/fresh-wallet-feed"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Fresh Wallet Feed</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30 bg-amber-500/10 text-amber-400">
                LGND
              </div>
            </Link>
            <Link
              to="/app/live-dca-feed"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Live DCA Feed</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30 bg-amber-500/10 text-amber-400">
                LGND
              </div>
            </Link>
            <Link
              to="/app/legend-community"
              className="flex items-center justify-between h-10 px-3 rounded-lg transition-all text-white/50 hover:bg-white/10 hover:text-white/80 group"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">Legend Community</span>
              </div>
              <div className="font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30 bg-amber-500/10 text-amber-400">
                LGND
              </div>
            </Link>
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
