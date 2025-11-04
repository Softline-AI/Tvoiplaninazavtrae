import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import Futures from './components/Futures';

const KOLFeed = lazy(() => import('./components/KOLFeed'));
const KOLProfile = lazy(() => import('./components/KOLProfile'));
const KOLLeaderboard = lazy(() => import('./components/KOLLeaderboard'));
const TopKOLTokens = lazy(() => import('./components/TopKOLTokens'));
const DailyTrends = lazy(() => import('./components/DailyTrends'));
const TopTokens = lazy(() => import('./components/TopTokens'));
const TrendsAnalytics = lazy(() => import('./components/TrendsAnalytics'));
const Transactions = lazy(() => import('./components/Transactions'));
const WalletFinder = lazy(() => import('./components/WalletFinder'));
const CabalFinder = lazy(() => import('./components/CabalFinder'));
const CopyTraders = lazy(() => import('./components/CopyTraders'));
const InsiderScan = lazy(() => import('./components/InsiderScan'));
const FreshWalletFeed = lazy(() => import('./components/FreshWalletFeed'));
const LiveDCAFeed = lazy(() => import('./components/LiveDCAFeed'));
const LegendCommunity = lazy(() => import('./components/LegendCommunity'));
const KOLFeedLegacy = lazy(() => import('./components/KOLFeedLegacy'));
const MyStalks = lazy(() => import('./components/MyStalks'));
const LearningCenter = lazy(() => import('./components/LearningCenter'));
const SmartMoney = lazy(() => import('./components/SmartMoney'));

const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23000000' width='1' height='1'/%3E%3C/svg%3E"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
            pointerEvents: 'none',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            contain: 'strict'
          }}
          onLoadedData={(e) => {
            const video = e.currentTarget;
            video.style.opacity = '0.3';
          }}
        >
          <source src="https://i.imgur.com/E490BLn.mp4" type="video/mp4" />
        </video>
        <div className="animated-3d-background" style={{ contain: 'strict' }}></div>
      </div>
      {children}
    </>
  );
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.pathname}
        timeout={300}
        classNames="page"
      >
        <Routes location={location}>
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

          <Route path="/live-market-feed" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Live Market Feed</h2><p className="text-gray-300">Real-time market data streaming...</p></div>} />
          <Route path="/transaction-stream" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Transaction Stream</h2><p className="text-gray-300">Live transaction monitoring...</p></div>} />
          <Route path="/realtime-analytics" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Real-time Analytics</h2><p className="text-gray-300">Advanced analytics dashboard...</p></div>} />

          <Route path="/learning-center" element={<LearningCenter />} />
          <Route path="/my-stalks" element={<MyStalks />} />
          <Route path="/insider-scan" element={<InsiderScan />} />
          <Route path="/fresh-wallet-feed" element={<FreshWalletFeed />} />
          <Route path="/live-dca-feed" element={<LiveDCAFeed />} />
          <Route path="/legend-community" element={<LegendCommunity />} />
          <Route path="/smart-money" element={<SmartMoney />} />
          <Route path="/upgrade" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-white">Upgrade Your Plan</h2><p className="text-gray-300">Choose PRO or LEGEND to unlock advanced features</p></div>} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <BackgroundWrapper>
        <div className="relative z-10" style={{ background: 'transparent' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={
              <div className="min-h-screen">
                <HomePage />
              </div>
            } />

            <Route path="/futures" element={
              <div className="min-h-screen">
                <Futures />
              </div>
            } />

            <Route path="/app/*" element={
              <>
                <video
                  className="fixed top-0 left-0 w-screen h-screen object-cover opacity-50 z-0 pointer-events-none"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23000000' width='1' height='1'/%3E%3C/svg%3E"
                  style={{
                    filter: 'brightness(1.05) contrast(1.05)',
                    transform: 'translateZ(0) scale(1.01)',
                    backfaceVisibility: 'hidden',
                    perspective: 1000,
                    imageRendering: 'auto'
                  }}
                  onLoadedData={(e) => {
                    const video = e.currentTarget;
                    video.style.opacity = '0.5';
                    video.currentTime = 0.01;
                  }}
                >
                  <source src="https://i.imgur.com/E490BLn.mp4" type="video/mp4" />
                </video>
                <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black z-0 pointer-events-none" style={{ transform: 'translateZ(0)', willChange: 'auto' }}></div>
              <div className="flex w-full" style={{ minHeight: 'calc(100vh - 64px)', marginTop: '64px' }}>
                <div className="hidden md:block md:w-64 flex-shrink-0">
                  <Sidebar />
                </div>
                <div className="flex-1 overflow-y-auto" style={{ contain: 'layout style paint' }}>
                  <div className="w-full">
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-screen">
                        <div className="text-white text-xl">Loading...</div>
                      </div>
                    }>
                      <AnimatedRoutes />
                    </Suspense>
                  </div>
                </div>
              </div>
              </>
            } />
          </Routes>
        </div>
      </BackgroundWrapper>
    </Router>
  );
};

export default App;
