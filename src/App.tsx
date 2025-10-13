import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import KOLFeed from './components/KOLFeed';
import KOLProfile from './components/KOLProfile';
import KOLLeaderboard from './components/KOLLeaderboard';
import TopKOLTokens from './components/TopKOLTokens';
import DailyTrends from './components/DailyTrends';
import TopTokens from './components/TopTokens';
import TrendsAnalytics from './components/TrendsAnalytics';
import Transactions from './components/Transactions';
import WalletFinder from './components/WalletFinder';
import CabalFinder from './components/CabalFinder';
import CopyTraders from './components/CopyTraders';
import InsiderScan from './components/InsiderScan';
import FreshWalletFeed from './components/FreshWalletFeed';
import LiveDCAFeed from './components/LiveDCAFeed';
import LegendCommunity from './components/LegendCommunity';
import KOLFeedLegacy from './components/KOLFeedLegacy';
import MyStalks from './components/MyStalks';

const App: React.FC = () => {
  return (
    <Router>
      <div className="fixed inset-0 z-0 overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="pointer-events-none opacity-30 w-full h-full"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover'
          }}
        >
          <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
        </video>
        <div className="animated-3d-background"></div>
      </div>
      <div className="relative z-10" style={{ background: 'transparent' }}>
        <Navigation />
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={
            <div className="min-h-screen">
              <HomePage />
            </div>
          } />
        
        {/* App Routes with Sidebar */}
        <Route path="/app/*" element={
          <div className="flex" style={{ minHeight: 'calc(100vh - 64px)', marginTop: '64px' }}>
            <div className="lg:w-64 lg:flex-shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="w-full">
                  <Routes>
                    <Route path="/" element={<KOLFeed />} />
                    <Route path="/kol-feed" element={<KOLFeed />} />
                    <Route path="/kol-profile/:walletAddress" element={<KOLProfile />} />
                    <Route path="/kol-leaderboard" element={<KOLLeaderboard />} />
                    <Route path="/top-kol-tokens" element={<TopKOLTokens />} />
                    <Route path="/daily-trends" element={<DailyTrends />} />
                    <Route path="/top-tokens" element={<TopTokens />} />
                    <Route path="/trends-analytics" element={<TrendsAnalytics />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/wallet-finder" element={<WalletFinder />} />
                    <Route path="/cabal-finder" element={<CabalFinder />} />
                    <Route path="/copy-traders" element={<CopyTraders />} />
                    <Route path="/kol-feed-legacy" element={<KOLFeedLegacy />} />
                    
                    {/* Live Trackers */}
                    <Route path="/live-market-feed" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Live Market Feed</h2><p className="text-gray-300">Real-time market data streaming...</p></div>} />
                    <Route path="/transaction-stream" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Transaction Stream</h2><p className="text-gray-300">Live transaction monitoring...</p></div>} />
                    <Route path="/realtime-analytics" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Real-time Analytics</h2><p className="text-gray-300">Advanced analytics dashboard...</p></div>} />
                    
                    {/* Other sections */}
                    <Route path="/learning-center" element={<div className="p-8 text-center text-white">Learning Center - Coming Soon</div>} />
                    <Route path="/my-stalks" element={<MyStalks />} />
                    <Route path="/insider-scan" element={<InsiderScan />} />
                    <Route path="/fresh-wallet-feed" element={<FreshWalletFeed />} />
                    <Route path="/live-dca-feed" element={<LiveDCAFeed />} />
                    <Route path="/legend-community" element={<LegendCommunity />} />
                    <Route path="/upgrade" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Upgrade Your Plan</h2><p className="text-gray-300">Choose PRO or LEGEND to unlock advanced features</p></div>} />
                  </Routes>
                </div>
              </div>
            </div>
        } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;