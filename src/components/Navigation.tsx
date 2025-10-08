import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
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

  const products = [
    { name: 'KOL Feed', path: '/app/kol-feed', description: 'Track influential traders' },
    { name: 'Fresh Wallets', path: '/app/fresh-wallets', description: 'New wallet activity' },
    { name: 'Insider Scan', path: '/app/insider-scan', description: 'Insider trading alerts' },
    { name: 'Live DCA Feed', path: '/app/live-dca', description: 'Dollar cost averaging' },
  ];

  const tools = [
    { name: 'Wallet Finder', path: '/app/wallet-finder', description: 'Search any wallet' },
    { name: 'Top Tokens', path: '/app/top-tokens', description: 'Trending tokens' },
    { name: 'Copy Traders', path: '/app/copy-traders', description: 'Follow top traders' },
    { name: 'Trends Analytics', path: '/app/trends', description: 'Market insights' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 nav-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold text-white tracking-tight">
              SMARTCHAIN
            </Link>

            <div className="hidden md:flex items-center gap-6">
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
                  <div className="absolute top-full left-0 mt-2 w-64 noir-card border border-white/10 rounded-lg shadow-xl py-2">
                    {products.map((product) => (
                      <Link
                        key={product.path}
                        to={product.path}
                        onClick={() => setIsProductsOpen(false)}
                        className="block px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="font-medium text-white text-sm">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{product.description}</div>
                      </Link>
                    ))}
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
                  <div className="absolute top-full left-0 mt-2 w-64 noir-card border border-white/10 rounded-lg shadow-xl py-2">
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
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm text-gray hover:text-white transition-colors">
              Features
            </a>
            <a href="/#plans" className="text-sm text-gray hover:text-white transition-colors">
              Pricing
            </a>
            <Link to="/app" className="btn-white">
              Open App
            </Link>
          </div>

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
              {products.map((product) => (
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
            </div>

            <Link
              to="/app"
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
