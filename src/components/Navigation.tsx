import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, TrendingUp, BarChart3, Star, Activity, Coins, TrendingDown, ArrowLeftRight, Wallet, Search, LineChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const isKOLProfile = location.pathname.includes('/kol/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const productIcons: Record<string, React.ReactNode> = {
    'KOL Feed': <TrendingUp className="w-4 h-4" />,
    'KOL Leaderboard': <BarChart3 className="w-4 h-4" />,
    'Top KOL Tokens': <Star className="w-4 h-4" />,
    'Daily Trends': <Activity className="w-4 h-4" />,
    'Top Tokens': <Coins className="w-4 h-4" />,
    'Trends Analytics': <TrendingDown className="w-4 h-4" />,
    'Transactions': <ArrowLeftRight className="w-4 h-4" />,
    'Wallet Finder': <Wallet className="w-4 h-4" />,
    'Cabal Finder': <Search className="w-4 h-4" />,
    'Copy Traders': <LineChart className="w-4 h-4" />,
  };

  const products = {
    'KOL Screener': [
      { name: 'KOL Feed', path: '/app/kol-feed', description: 'Real-time feed of top influencer trades and wallet activity' },
      { name: 'KOL Leaderboard', path: '/app/kol-leaderboard', description: 'Rank and discover the most successful KOLs by performance' },
      { name: 'Top KOL Tokens', path: '/app/top-kol-tokens', description: 'See trending tokens among KOLs with live sentiment updates' },
    ],
    'Smart Money Tracker': [
      { name: 'Daily Trends', path: '/app/daily-trends', description: 'Track the hottest tokens and market shifts every day' },
      { name: 'Top Tokens', path: '/app/top-tokens', description: 'Monitor top-performing tokens by volume and smart money' },
      { name: 'Trends Analytics', path: '/app/trends', description: 'Deep-dive analytics on token trends and whale movements' },
      { name: 'Transactions', path: '/app/transactions', description: 'Explore every smart money transaction with wallet attribution' },
    ],
    'Solana Tools': [
      { name: 'Wallet Finder', path: '/app/wallet-finder', description: 'Find and analyze any wallet. Uncover connections and holdings' },
      { name: 'Cabal Finder', path: '/app/cabal-finder', description: 'Discover new investment opportunities with analytics' },
      { name: 'Copy Traders', path: '/app/copy-traders', description: 'Copy the trades of the best traders' },
    ],
  };

  const tools = [
    { name: 'Wallet Finder', path: '/app/wallet-finder', description: 'Search any wallet' },
    { name: 'Top Tokens', path: '/app/top-tokens', description: 'Trending tokens' },
    { name: 'Copy Traders', path: '/app/copy-traders', description: 'Follow top traders' },
    { name: 'Trends Analytics', path: '/app/trends', description: 'Market insights' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 nav-dark" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold text-white tracking-tight">
              SMARTCHAIN
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {!isAppRoute && (
                <>
                <div className="relative" ref={productsRef}>
                  <button
                    onClick={() => {
                      setIsProductsOpen(!isProductsOpen);
                      setIsToolsOpen(false);
                    }}
                    className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors font-medium"
                  >
                    Products
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProductsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[800px] noir-card border border-white/10 rounded-lg shadow-xl p-6" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                      <div className="grid grid-cols-3 gap-6">
                        {Object.entries(products).map(([category, items]) => (
                          <div key={category} className="space-y-3">
                            <h3 className="font-semibold text-sm text-white mb-3">{category}</h3>
                            <div className="space-y-2">
                              {items.map((product) => (
                                <Link
                                  key={product.path}
                                  to={product.path}
                                  onClick={() => setIsProductsOpen(false)}
                                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                >
                                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/5 rounded-md group-hover:bg-white/10 transition-colors mt-0.5">
                                    <div className="text-white">
                                      {productIcons[product.name]}
                                    </div>
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <div className="font-medium text-white text-sm leading-tight">{product.name}</div>
                                    <div className="text-xs text-gray-400 leading-tight mt-0.5">{product.description}</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={toolsRef}>
                  <button
                    onClick={() => {
                      setIsToolsOpen(!isToolsOpen);
                      setIsProductsOpen(false);
                    }}
                    className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors font-medium"
                  >
                    Tools
                    <ChevronDown className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isToolsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 noir-card border border-white/10 rounded-lg shadow-xl py-2" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                      {tools.map((tool) => (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          onClick={() => setIsToolsOpen(false)}
                          className="block px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <div className="font-medium text-white text-sm">{tool.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{tool.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                </>
              )}

              {isAppRoute && !isKOLProfile && (
                <>
                  <a href="/futures" className="text-white hover:text-gray-300 transition-colors font-medium">
                    Futures
                  </a>
                  <a href="/#plans" className="text-white hover:text-gray-300 transition-colors font-medium">
                    Pricing
                  </a>
                </>
              )}

              {isKOLProfile && (
                <>
                  <a href="/#support" className="text-white hover:text-gray-300 transition-colors font-medium">
                    Support
                  </a>
                  <a href="/#docs" className="text-white hover:text-gray-300 transition-colors font-medium">
                    Docs
                  </a>
                </>
              )}
            </div>
          </div>

          {!isAppRoute && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/app/kol-feed" className="btn-white">
                Open App
              </Link>
            </div>
          )}

          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black">
          <div className="px-6 py-4 space-y-4">
            <div>
              <div className="font-medium text-white mb-2">Products</div>
              {Object.entries(products).map(([category, items]) => (
                <div key={category} className="mb-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 pl-4">{category}</div>
                  {items.map((product) => (
                    <Link
                      key={product.path}
                      to={product.path}
                      className="block text-sm text-gray hover:text-white transition-colors py-2 pl-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div>
              <div className="font-medium text-white mb-2">Tools</div>
              {tools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block text-sm text-gray hover:text-white transition-colors py-2 pl-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {tool.name}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <a
                href="/#features"
                className="block text-sm text-gray hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/#plans"
                className="block text-sm text-gray hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="/futures"
                className="block text-sm text-gray hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Futures
              </a>
            </div>

            <Link
              to="/app/kol-feed"
              className="btn-white inline-block w-full text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Open App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
