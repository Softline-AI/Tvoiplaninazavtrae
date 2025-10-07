import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 nav-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-lg font-bold text-white tracking-tight">
            SMARTCHAIN
          </Link>

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
          <div className="px-6 py-4 space-y-3">
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
