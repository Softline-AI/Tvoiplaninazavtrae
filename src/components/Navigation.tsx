import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex z-40 w-full h-auto items-center justify-center sticky top-0 inset-x-0 noir-nav noir-glass">
      <header className="z-40 flex px-6 gap-4 w-full flex-row relative flex-nowrap items-center justify-between h-16 max-w-7xl">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white tracking-wider">SMARTCHAIN</div>
          </Link>
        </div>
        
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors font-medium"
              >
                Products
                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-[600px] bg-noir-dark border border-white/20 rounded-xl shadow-2xl p-6 z-50 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* KOL Screener */}
                    <div className="space-y-3">
                      <div className="mb-2">
                        <h3 className="font-semibold text-sm text-white">KOL Screener</h3>
                      </div>
                      <div className="space-y-2">
                        <Link to="/app/kol-feed" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 24 24" width="16" fill="none" className="w-5 h-5 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                              <path d="M5 18h14M5 14h14l1-9-4 3-4-5-4 5-4-3 1 9Z" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">KOL Feed</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Real-time feed of top influencer trades and wallet activity</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/kol-leaderboard" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 24 24" width="16" className="w-5 h-5">
                              <path d="M9 7H4.6C4.03995 7 3.75992 7 3.54601 7.10899C3.35785 7.20487 3.20487 7.35785 3.10899 7.54601C3 7.75992 3 8.03995 3 8.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H9M9 21H15M9 21L9 4.6C9 4.03995 9 3.75992 9.10899 3.54601C9.20487 3.35785 9.35785 3.20487 9.54601 3.10899C9.75992 3 10.0399 3 10.6 3L13.4 3C13.9601 3 14.2401 3 14.454 3.10899C14.6422 3.20487 14.7951 3.35785 14.891 3.54601C15 3.75992 15 4.03995 15 4.6V21M15 11H19.4C19.9601 11 20.2401 11 20.454 11.109C20.6422 11.2049 20.7951 11.3578 20.891 11.546C21 11.7599 21 12.0399 21 12.6V19.4C21 19.9601 21 20.2401 20.891 20.454C20.7951 20.6422 20.6422 20.7951 20.454 20.891C20.2401 21 19.9601 21 19.4 21H15" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">KOL Leaderboard</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Rank and discover the most successful KOLs by performance</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/top-kol-tokens" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 22 21" width="16" className="w-5 h-5">
                              <path d="M10.2826 2.4533C10.5131 1.98636 10.6284 1.75289 10.7848 1.6783C10.9209 1.6134 11.0791 1.6134 11.2152 1.6783C11.3716 1.75289 11.4869 1.98636 11.7174 2.4533L13.904 6.88327C13.9721 7.02112 14.0061 7.09004 14.0558 7.14356C14.0999 7.19094 14.1527 7.22933 14.2113 7.25661C14.2775 7.28741 14.3536 7.29852 14.5057 7.32076L19.397 8.03569C19.912 8.11098 20.1696 8.14862 20.2888 8.27442C20.3925 8.38388 20.4412 8.53428 20.4215 8.68376C20.3988 8.85556 20.2124 9.03716 19.8395 9.40037L16.3014 12.8464C16.1911 12.9538 16.136 13.0075 16.1004 13.0714C16.0689 13.128 16.0487 13.1902 16.0409 13.2545C16.0321 13.3271 16.0451 13.403 16.0711 13.5547L16.9059 18.4221C16.994 18.9355 17.038 19.1922 16.9553 19.3445C16.8833 19.477 16.7553 19.57 16.607 19.5975C16.4366 19.6291 16.2061 19.5078 15.7451 19.2654L11.3724 16.9658C11.2361 16.8942 11.168 16.8583 11.0962 16.8443C11.0327 16.8318 10.9673 16.8318 10.9038 16.8443C10.832 16.8583 10.7639 16.8942 10.6276 16.9658L6.25491 19.2654C5.7939 19.5078 5.5634 19.6291 5.39296 19.5975C5.24467 19.57 5.11671 19.477 5.04472 19.3445C4.96199 19.1922 5.00601 18.9355 5.09406 18.4221L5.92887 13.5547C5.9549 13.403 5.96791 13.3271 5.9591 13.2545C5.95131 13.1902 5.9311 13.128 5.89959 13.0714C5.86401 13.0075 5.80886 12.9538 5.69857 12.8464L2.16054 9.40037C1.78765 9.03716 1.6012 8.85556 1.57851 8.68376C1.55877 8.53428 1.60754 8.38388 1.71124 8.27442C1.83042 8.14862 2.08796 8.11098 2.60303 8.03569L7.4943 7.32076C7.64641 7.29852 7.72247 7.28741 7.7887 7.25661C7.84735 7.22933 7.90015 7.19094 7.94417 7.14356C7.99389 7.09004 8.02791 7.02112 8.09596 6.88327L10.2826 2.4533Z" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Top KOL Tokens</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">See trending tokens among KOLs with live sentiment updates</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Smart Money Tracker */}
                    <div className="space-y-3">
                      <div className="mb-2">
                        <h3 className="font-semibold text-sm text-white">Smart Money Tracker</h3>
                      </div>
                      <div className="space-y-2">
                        <Link to="/app/daily-trends" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 24 24" width="16" className="w-5 h-5">
                              <path d="M21 10H17L14 19L8 1L5 10H1" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Daily Trends</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Track the hottest tokens and market shifts every day</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/top-tokens" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="20" role="presentation" viewBox="0 0 24 24" width="20" className="w-5 h-5">
                              <path d="M12 17C12 19.7614 14.2386 22 17 22C19.7614 22 22 19.7614 22 17C22 14.2386 19.7614 12 17 12C14.2386 12 12 14.2386 12 17ZM12 17C12 15.8742 12.3721 14.8353 13 13.9995V5M12 17C12 17.8254 12.2 18.604 12.5541 19.2901C11.7117 20.0018 9.76584 20.5 7.5 20.5C4.46243 20.5 2 19.6046 2 18.5V5M13 5C13 6.10457 10.5376 7 7.5 7C4.46243 7 2 6.10457 2 5M13 5C13 3.89543 10.5376 3 7.5 3C4.46243 3 2 3.89543 2 5M2 14C2 15.1046 4.46243 16 7.5 16C9.689 16 11.5793 15.535 12.4646 14.8618M13 9.5C13 10.6046 10.5376 11.5 7.5 11.5C4.46243 11.5 2 10.6046 2 9.5" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Top Tokens</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Monitor top-performing tokens by volume and smart money</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/trends-analytics" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 24 24" width="16" className="w-5 h-5">
                              <path d="M22 7L14.1314 14.8686C13.7354 15.2646 13.5373 15.4627 13.309 15.5368C13.1082 15.6021 12.8918 15.6021 12.691 15.5368C12.4627 15.4627 12.2646 15.2646 11.8686 14.8686L9.13137 12.1314C8.73535 11.7354 8.53735 11.5373 8.30902 11.4632C8.10817 11.3979 7.89183 11.3979 7.69098 11.4632C7.46265 11.5373 7.26465 11.7354 6.86863 12.1314L2 17M22 7H15M22 7V14" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Trends Analytics</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Deep-dive analytics on token trends and whale movements</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/transactions" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 24 24" width="16" className="w-5 h-5">
                              <path d="M20 17H4M4 17L8 13M4 17L8 21M4 7H20M20 7L16 3M20 7L16 11" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Transactions</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Explore every smart money transaction with wallet attribution</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Solana Tools */}
                    <div className="space-y-3">
                      <div className="mb-2">
                        <h3 className="font-semibold text-sm text-white">Solana Tools</h3>
                      </div>
                      <div className="space-y-2">
                        <Link to="/app/wallet-finder" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="16" role="presentation" viewBox="0 0 24 24" width="16" className="w-5 h-5">
                              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M19 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"></path>
                                <path d="M16.5 14a.5.5 0 1 1 0-1a.5.5 0 0 1 0 1" stroke="white" fill="none"></path>
                                <path d="M18 7V5.603a2 2 0 0 0-2.515-1.932l-11 2.933A2 2 0 0 0 3 8.537V9"></path>
                              </g>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Wallet Finder</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Find and analyze any wallet. Uncover connections and holdings</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/cabal-finder" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="20" role="presentation" viewBox="0 0 24 24" width="20" className="w-5 h-5">
                              <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              <path d="M22 22L20 20" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Cabal Finder</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Discover new investment opportunities with analytics</div>
                          </div>
                        </Link>
                        
                        <Link to="/app/copy-traders" className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left group">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                            <svg aria-hidden="true" focusable="false" height="20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation" className="w-5 h-5">
                              <path d="M3 17L9 11L13 15L21 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              <path d="M17 7H21V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-white text-sm leading-tight break-words">Copy Traders</div>
                            <div className="text-xs text-gray-300 leading-tight mt-0.5 break-words">Copy the trades of the best traders</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a href="#plans" className="text-white hover:text-gray-300 transition-colors font-medium">
              Tools
            </a>
          </div>
        </div>
        
        <div className="flex items-center">
          <Link 
            to="/app" 
            className="noir-button noir-shimmer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2"
          >
            Open App
          </Link>
        </div>
      </header>
    </nav>
  );
};

export default Navigation;