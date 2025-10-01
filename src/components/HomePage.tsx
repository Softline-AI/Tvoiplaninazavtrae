import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Activity,
  ArrowRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [revealedElements, setRevealedElements] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-reveal-id');
            if (elementId) {
              setRevealedElements(prev => new Set([...prev, elementId]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all scroll-reveal elements
    const elements = document.querySelectorAll('[data-reveal-id]');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <main className="black-bg min-h-screen">
      {/* Header */}
      <header className="header-black">
        <div className="container mx-auto px-4">
          <h1 className="logo-black">STALKCHAIN</h1>
          <p className="tagline-black">Follow smart money on the blockchain</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Track Smart Money Movements
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Real-time blockchain intelligence. Follow the biggest wallets, catch trends early, 
              and make profitable moves before the market reacts.
            </p>
            <Link 
              to="/app/kol-feed" 
              className="btn-primary-black inline-flex items-center gap-2 text-lg px-8 py-4 rounded-lg hover:transform hover:scale-105 transition-all"
            >
              <span>Start Tracking</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-black">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">Our Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              className={`feature-item-black text-center fade-in-black ${revealedElements.has('feature-1') ? 'revealed' : ''}`}
              data-reveal-id="feature-1"
            >
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <h3>KOL Feed</h3>
              <p>Track the trades and activities of key opinion leaders (KOLs) in real time.</p>
            </div>
            
            <div 
              className={`feature-item-black text-center fade-in-black ${revealedElements.has('feature-2') ? 'revealed' : ''}`}
              data-reveal-id="feature-2"
            >
              <div className="flex justify-center mb-4">
                <Activity className="w-12 h-12 text-white" />
              </div>
              <h3>Whale Monitoring</h3>
              <p>Stay updated on major wallet movements and whale activities.</p>
            </div>
            
            <div 
              className={`feature-item-black text-center fade-in-black ${revealedElements.has('feature-3') ? 'revealed' : ''}`}
              data-reveal-id="feature-3"
            >
              <div className="flex justify-center mb-4">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
              <h3>Real-Time Analytics</h3>
              <p>Get insights into market trends and trading signals with up-to-date data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-black">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div 
              className={`pricing-plan-black text-center ${revealedElements.has('plan-1') ? 'revealed' : ''}`}
              data-reveal-id="plan-1"
            >
              <h3>Free</h3>
              <p>Basic access to essential features.</p>
              <div className="mt-6">
                <Link to="/app" className="btn-black w-full block py-3 rounded-lg">
                  Get Started
                </Link>
              </div>
            </div>
            
            <div 
              className={`pricing-plan-black text-center ${revealedElements.has('plan-2') ? 'revealed' : ''}`}
              data-reveal-id="plan-2"
            >
              <h3>Pro</h3>
              <p className="mb-2">$799/year</p>
              <p className="text-sm">Unlock advanced features and real-time tracking.</p>
              <div className="mt-6">
                <Link to="/app" className="btn-primary-black w-full block py-3 rounded-lg">
                  Start Pro Trial
                </Link>
              </div>
            </div>
            
            <div 
              className={`pricing-plan-black text-center ${revealedElements.has('plan-3') ? 'revealed' : ''}`}
              data-reveal-id="plan-3"
            >
              <h3>Legend</h3>
              <p className="mb-2">$7999/year</p>
              <p className="text-sm">Exclusive access and priority support.</p>
              <div className="mt-6">
                <Link to="/app" className="btn-primary-black w-full block py-3 rounded-lg">
                  Go Legend
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-black">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 StalkChain. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;