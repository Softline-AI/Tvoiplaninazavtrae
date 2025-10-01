import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { heliusService } from '../services/heliusApi';

declare global {
  interface Window {
    gsap: any;
  }
}

const HomePage: React.FC = () => {
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const pricingCardsRef = useRef<HTMLDivElement>(null);
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const kolFeedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations
    if (window.gsap) {
      // Feature cards animation
      window.gsap.from(".feature-card", {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power4.out",
      });

      // Pricing cards animation
      window.gsap.from(".pricing-card", {
        opacity: 0,
        x: -100,
        stagger: 0.3,
        duration: 1.5,
        ease: "power4.out",
      });

      // Demo section animation
      window.gsap.from(".demo-section", {
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        ease: "power4.out",
      });
    }

    // Simulate KOL Feed API call
    const loadKOLFeed = async () => {
      if (kolFeedRef.current) {
        kolFeedRef.current.innerHTML = '<p class="text-gray-400">Loading KOL Feed...</p>';
        
        try {
          // Try to get real data from Helius API
          const realData = await heliusService.getRealTimeKOLData();
          
          setTimeout(() => {
            if (kolFeedRef.current) {
              if (realData && realData.length > 0) {
                kolFeedRef.current.innerHTML = `
                  <h3 class="text-2xl mb-4 text-white">Latest KOL Activity</h3>
                  <div class="space-y-3">
                    ${realData.slice(0, 3).map(trade => `
                      <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div class="flex items-center gap-3">
                          <img src="${trade.kolAvatar}" alt="${trade.kolName}" class="w-8 h-8 rounded-full">
                          <div>
                            <span class="font-medium text-white">${trade.kolName}</span>
                            <span class="text-sm text-gray-400 ml-2">${trade.lastTx} ${trade.token}</span>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm font-medium ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}">${trade.pnl}</div>
                          <div class="text-xs text-gray-400">${trade.timeAgo}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `;
              } else {
                // Fallback demo data
                kolFeedRef.current.innerHTML = `
                  <h3 class="text-2xl mb-4 text-white">Latest KOL Activity</h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">D</div>
                        <div>
                          <span class="font-medium text-white">dv</span>
                          <span class="text-sm text-gray-400 ml-2">bought SOL</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-green-400">+$1,250</div>
                        <div class="text-xs text-gray-400">2min ago</div>
                      </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">C</div>
                        <div>
                          <span class="font-medium text-white">Cupsey</span>
                          <span class="text-sm text-gray-400 ml-2">sold BONK</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-red-400">-$890</div>
                        <div class="text-xs text-gray-400">5min ago</div>
                      </div>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">E</div>
                        <div>
                          <span class="font-medium text-white">Euris</span>
                          <span class="text-sm text-gray-400 ml-2">bought USDC</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-green-400">+$2,100</div>
                        <div class="text-xs text-gray-400">8min ago</div>
                      </div>
                    </div>
                  </div>
                `;
              }
            }
          }, 2000);
        } catch (error) {
          console.error('Error loading KOL feed:', error);
          // Show demo data on error
          setTimeout(() => {
            if (kolFeedRef.current) {
              kolFeedRef.current.innerHTML = `
                <h3 class="text-2xl mb-4 text-white">Latest KOL Activity (Demo)</h3>
                <div class="space-y-3">
                  <div class="p-3 bg-gray-700 rounded-lg">
                    <span class="text-white">Demo: Trader 1 bought 5000 SOL</span>
                  </div>
                  <div class="p-3 bg-gray-700 rounded-lg">
                    <span class="text-white">Demo: Trader 2 sold 1000 BTC</span>
                  </div>
                  <div class="p-3 bg-gray-700 rounded-lg">
                    <span class="text-white">Demo: Trader 3 bought 3000 ETH</span>
                  </div>
                </div>
              `;
            }
          }, 2000);
        }
      }
    };

    loadKOLFeed();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <header className="text-center py-16">
        <h1 className="text-5xl font-extrabold uppercase tracking-wider">STALKCHAIN</h1>
        <p className="text-xl mt-4 text-gray-300">Follow Smart Money on the Blockchain</p>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-900">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl mb-10 font-bold">Our Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10" ref={featureCardsRef}>
            <div className="feature-card p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300">
              <h3 className="text-2xl mb-4 font-semibold">KOL Feed</h3>
              <p className="text-gray-300">Track the trades and activities of key opinion leaders (KOLs) in real-time.</p>
            </div>
            <div className="feature-card p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300">
              <h3 className="text-2xl mb-4 font-semibold">Whale Monitoring</h3>
              <p className="text-gray-300">Track major wallet movements and whale activities.</p>
            </div>
            <div className="feature-card p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300">
              <h3 className="text-2xl mb-4 font-semibold">Real-Time Analytics</h3>
              <p className="text-gray-300">Get insights into market trends and trading signals with up-to-date data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-800">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl mb-10 font-bold">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10" ref={pricingCardsRef}>
            <div className="pricing-card p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300">
              <h3 className="text-3xl mb-4 font-bold">Free</h3>
              <p className="text-gray-300 mb-4">Basic access to essential features.</p>
              <p className="text-2xl font-semibold text-green-400">$0/month</p>
              <Link 
                to="/app" 
                className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-300"
              >
                Get Started
              </Link>
            </div>
            <div className="pricing-card p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 border-2 border-blue-500">
              <h3 className="text-3xl mb-4 font-bold">Pro</h3>
              <p className="text-gray-300 mb-4">Unlock advanced features and real-time tracking.</p>
              <p className="text-2xl font-semibold text-blue-400">$799/year</p>
              <Link 
                to="/app" 
                className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-300"
              >
                Start Pro Trial
              </Link>
            </div>
            <div className="pricing-card p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300">
              <h3 className="text-3xl mb-4 font-bold">Legend</h3>
              <p className="text-gray-300 mb-4">Exclusive access and priority support.</p>
              <p className="text-2xl font-semibold text-yellow-400">$7999/year</p>
              <Link 
                to="/app" 
                className="mt-6 inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors duration-300"
              >
                Go Legend
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 bg-gray-900">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl mb-10 font-bold">Live Demo</h2>
          <div className="demo-section p-6 bg-gray-800 rounded-lg shadow-md mb-10 max-w-4xl mx-auto">
            <div ref={kolFeedRef}>
              <p className="text-gray-400">Loading KOL Feed...</p>
            </div>
            <div className="mt-6">
              <Link 
                to="/app/kol-feed" 
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors duration-300 font-semibold"
              >
                View Full KOL Feed
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <p className="text-gray-400">&copy; 2025 StalkChain. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;