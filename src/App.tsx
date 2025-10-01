import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import KOLFeed from './components/KOLFeed';
import KOLLeaderboard from './components/KOLLeaderboard';
import TopKOLTokens from './components/TopKOLTokens';

const App: React.FC = () => {
  return (
    <Router>
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
          <div className="h-screen flex flex-col bg-black text-white">
            <div className="lg:flex lg:max-h-screen h-screen max-w-screen w-screen lg:overflow-hidden">
              <div className="lg:overflow-y-auto">
                <Sidebar />
              </div>
              <div className="flex-1 p-3 md:p-2 lg:overflow-y-auto">
                <div className="flex flex-col gap-0 items-center sm:items-start">
                  <Routes>
                    <Route path="/" element={<KOLLeaderboard />} />
                    <Route path="/kol-feed" element={<KOLFeed />} />
                    <Route path="/kol-leaderboard" element={<KOLLeaderboard />} />
                    <Route path="/top-kol-tokens" element={<TopKOLTokens />} />
                    <Route path="/daily-trends" element={<div className="p-8 text-center text-white">Daily Trends - Coming Soon</div>} />
                    <Route path="/top-tokens" element={<div className="p-8 text-center text-white">Top Tokens - Coming Soon</div>} />
                    <Route path="/trends-analytics" element={<div className="p-8 text-center text-white">Trends Analytics - Coming Soon</div>} />
                    <Route path="/transactions" element={<div className="p-8 text-center text-white">Transactions - Coming Soon</div>} />
                    <Route path="/wallet-finder" element={<div className="p-8 text-center text-white">Wallet Finder - Coming Soon</div>} />
                    <Route path="/cabal-finder" element={<div className="p-8 text-center text-white">Cabal Finder - Coming Soon</div>} />
                    <Route path="/copy-traders" element={<div className="p-8 text-center text-white">Copy Traders - Coming Soon</div>} />
                    <Route path="/kol-feed-legacy" element={<div className="p-8 text-center text-white">KOL Feed Legacy - Coming Soon</div>} />
                    
                    {/* Live Trackers */}
                    <Route path="/live-market-feed" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Live Market Feed</h2><p className="text-gray-400">Real-time market data streaming...</p></div>} />
                    <Route path="/transaction-stream" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Transaction Stream</h2><p className="text-gray-400">Live transaction monitoring...</p></div>} />
                    <Route path="/realtime-analytics" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Real-time Analytics</h2><p className="text-gray-400">Advanced analytics dashboard...</p></div>} />
                    
                    {/* Other sections */}
                    <Route path="/learning-center" element={<div className="p-8 text-center text-white">Learning Center - Coming Soon</div>} />
                    <Route path="/my-stalks" element={<div className="p-8 text-center text-white">My Stalks - PRO Feature</div>} />
                    <Route path="/insider-scan" element={<div className="p-8 text-center text-white">Insider Scan - LEGEND Feature</div>} />
                    <Route path="/fresh-wallet-feed" element={<div className="p-8 text-center text-white">Fresh Wallet Feed - LEGEND Feature</div>} />
                    <Route path="/live-dca-feed" element={<div className="p-8 text-center text-white">Live DCA Feed - LEGEND Feature</div>} />
                    <Route path="/legend-community" element={<div className="p-8 text-center text-white">Legend Community - LEGEND Feature</div>} />
                    <Route path="/upgrade" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Upgrade Your Plan</h2><p className="text-blue-main">Choose PRO or LEGEND to unlock advanced features</p></div>} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;