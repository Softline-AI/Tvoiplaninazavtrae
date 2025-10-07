import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 nav-modern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">SmartChain</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/#features"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              to="/#plans"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/app"
              className="btn-primary inline-flex items-center justify-center"
            >
              Open App
            </Link>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/#features"
              className="block text-sm font-medium text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#plans"
              className="block text-sm font-medium text-white/70 hover:text-white transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/app"
              className="btn-primary inline-flex items-center justify-center w-full"
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
