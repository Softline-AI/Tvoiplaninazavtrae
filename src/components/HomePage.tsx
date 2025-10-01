import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Play, 
  TrendingUp, 
  BarChart3, 
  Star, 
  Wallet, 
  Search, 
  ChevronDown,
  ShieldCheck,
  Zap,
  Activity,
  Brain,
  Target,
  Sparkles,
  Crown,
  Users,
  Eye,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface Testimonial {
  id: number;
  username: string;
  handle: string;
  followers: string;
  verified: boolean;
  twitterUrl: string;
}

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [activeFeature, setActiveFeature] = useState('kol-feed');
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

  const testimonials: Testimonial[] = [
    {
      id: 1,
      username: '@cryptomanran',
      handle: 'cryptomanran',
      followers: '958.87K',
      verified: true,
      twitterUrl: 'https://twitter.com/cryptomanran'
    },
    {
      id: 2,
      username: '@nft_cryptogang',
      handle: 'nft_cryptogang',
      followers: '119.52K',
      verified: true,
      twitterUrl: 'https://twitter.com/nft_cryptogang'
    },
    {
      id: 3,
      username: '@tier1haterr',
      handle: 'tier1haterr',
      followers: '10.20K',
      verified: true,
      twitterUrl: 'https://twitter.com/tier1haterr'
    },
    {
      id: 4,
      username: '@Chyan',
      handle: 'Chyan',
      followers: '10.71K',
      verified: true,
      twitterUrl: 'https://twitter.com/Chyan'
    },
    {
      id: 5,
      username: '@fomomofosol',
      handle: 'fomomofosol',
      followers: '89.79K',
      verified: true,
      twitterUrl: 'https://twitter.com/fomomofosol'
    },
    {
      id: 6,
      username: '@ScottPh77711570',
      handle: 'ScottPh77711570',
      followers: '15.79K',
      verified: true,
      twitterUrl: 'https://twitter.com/ScottPh77711570'
    },
    {
      id: 7,
      username: '@ashrobinqt',
      handle: 'ashrobinqt',
      followers: '88.30K',
      verified: true,
      twitterUrl: 'https://twitter.com/ashrobinqt'
    },
    {
      id: 8,
      username: '@Mladek_sol',
      handle: 'Mladek_sol',
      followers: '24.34K',
      verified: true,
      twitterUrl: 'https://twitter.com/Mladek_sol'
    }
  ];

  const features = [
    {
      id: 'kol-feed',
      title: 'KOL Feed',
      description: 'Track KOL trades live with wallet feeds. Position before followers using fast insights to seize market moves and stay ahead of retail.',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: 'kol-leaderboard',
      title: 'KOL Leaderboard',
      description: 'Rank top KOLs by win rate, success. Live leaderboards let you follow market movers and use their strategies for sharp insights.',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'top-kol-tokens',
      title: 'Top KOL Tokens',
      description: 'Spot tokens with heavy KOL buys. Alerts for influencer convergence let you position early before retail drives big price discovery.',
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'wallet-finder',
      title: 'Wallet Finder',
      description: 'Find wallets with advanced search. Track partial addresses, connections, patterns instantly to uncover alpha sources and market opportunities.',
      icon: <Wallet className="w-6 h-6" />
    },
    {
      id: 'cabal-finder',
      title: 'Cabal Finder',
      description: 'Spot coordinated wallet groups with analysis. Track strategies, market impact for consistent alpha across tokens and market conditions.',
      icon: <Search className="w-6 h-6" />
    }
  ];

  return (
    <main className="container mx-auto px-4 white-bg min-h-screen">
      {/* Hero Section */}
      <section className="w-full pt-16 lg:pt-32 pb-20 lg:pb-32 flex flex-col items-center justify-center relative">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">
          <div className={`flex-1 flex flex-col items-start text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              <span className="text-blue-bright">STALKCHAIN</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-medium mb-8">
              Follow smart money on the blockchain
            </p>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light mb-10 max-w-2xl">
              Real-time blockchain intelligence. Follow the biggest wallets, catch trends early, and make profitable moves before the market reacts.
            </p>
            
            <ul className="grid grid-cols-1 gap-3 mb-10 w-full max-w-md">
              {[
                { text: "Live whale wallet tracking", delay: "0ms" },
                { text: "1000+ KOL database", delay: "200ms" },
                { text: "Early trend detection", delay: "400ms" },
                { text: "Insider move alerts", delay: "600ms" }
              ].map((item, index) => (
                <li 
                  key={index}
                  className={`flex items-center gap-2 text-base md:text-lg text-gray-600 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: item.delay }}
                >
                  <Check className="w-5 h-5 text-blue-bright shrink-0" />
                  {item.text}
                </li>
              ))}
            </ul>
            
            <div className="flex flex-row items-center justify-start gap-4 mb-6 w-full">
              <Link 
                to="/app/kol-feed" 
                className="beautiful-button inline-flex items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none h-14 rounded-lg px-10 text-lg md:text-xl hover-lift"
              >
                <span>Stop Missing Alpha</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 beautiful-card px-4 py-2 rounded-full mt-2">
              <ShieldCheck className="w-4 h-4 text-blue-bright" />
              <span className="text-gray-600 text-xs">30-Day Money-Back Guarantee</span>
            </div>
          </div>
          
          {/* Video Player */}
          <div className={`flex-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="aspect-video beautiful-card rounded-xl overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                poster="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&dpr=1"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                <div className="flex items-center justify-center h-full bg-gray-900">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-blue-main mx-auto mb-4" />
                    <p className="text-white font-medium">SmartChain Demo Video</p>
                    <p className="text-gray-300 text-sm mt-2">Click to play demonstration</p>
                  </div>
                </div>
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div 
          className={`flex flex-col items-center mb-12 lg:mb-16 max-w-3xl mx-auto scroll-reveal ${revealedElements.has('features-title') ? 'revealed' : ''}`}
          data-reveal-id="features-title"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-6 text-gray-900">
            Our Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
          {[
            {
              title: "KOL Feed",
              description: "Track the trades and activities of key opinion leaders (KOLs) in real time.",
              icon: <TrendingUp className="w-12 h-12 text-blue-bright mb-4" />
            },
            {
              title: "Whale Monitoring", 
              description: "Stay updated on major wallet movements and whale activities.",
              icon: <Activity className="w-12 h-12 text-blue-bright mb-4" />
            },
            {
              title: "Real-Time Analytics",
              description: "Get insights into market trends and trading signals with up-to-date data.",
              icon: <BarChart3 className="w-12 h-12 text-blue-bright mb-4" />
            }
          ].map((item, index) => (
            <div
              key={index}
              className={`group beautiful-card rounded-xl p-8 hover-lift scroll-reveal ${revealedElements.has(`feature-${index}`) ? 'revealed' : ''}`}
              data-reveal-id={`feature-${index}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl mb-4 font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex flex-col items-center">
            <Link 
              to="/app"
              className="beautiful-button inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all h-14 rounded-lg px-10 text-lg md:text-xl group hover-lift pulse-blue"
            >
              <span>Join Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-xs md:text-sm text-gray-600 text-center mt-2">
              Try risk-free, money back guarantee.
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div 
          className={`text-center mb-12 lg:mb-16 scroll-reveal ${revealedElements.has('testimonials-title') ? 'revealed' : ''}`}
          data-reveal-id="testimonials-title"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-6">
            Traders Using SmartChain
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professional traders who trust SmartChain to track smart money movements and discover the next big opportunities.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`transition-all duration-700 scroll-reveal ${revealedElements.has(`testimonial-${index}`) ? 'revealed' : ''}`} 
              data-reveal-id={`testimonial-${index}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <a
                href={testimonial.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="beautiful-card rounded-xl p-6 hover-lift">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-200">
                        <Users className="w-6 h-6 text-blue-main" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-base truncate group-hover:text-blue-bright transition-colors">
                        {testimonial.username}
                      </span>
                      {testimonial.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4 font-medium">
                      {testimonial.followers} followers
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-bright transition-colors">
                        SmartChain User
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button className="beautiful-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-all h-12 px-8 py-3 hover-lift">
            <Link to="/app" className="w-full h-full flex items-center justify-center">
              Get Started
            </Link>
          </button>
        </div>
      </section>

      {/* Tools Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div 
          className={`flex flex-col items-center mb-12 lg:mb-16 px-2 scroll-reveal ${revealedElements.has('tools-title') ? 'revealed' : ''}`}
          data-reveal-id="tools-title"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 gradient-text">
            Unlock the Most Advanced Smart Money Tools
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl leading-relaxed">
            Everything you need to track, analyze, and act on smart money flows in real time.
          </p>
        </div>

        <div 
          className={`flex flex-col lg:flex-row gap-0 items-stretch rounded-2xl beautiful-card overflow-hidden scroll-reveal hover-lift ${revealedElements.has('tools-panel') ? 'revealed' : ''}`}
          data-reveal-id="tools-panel"
        >
          <div className="w-full lg:w-[35%] flex flex-col divide-y divide-blue-500/20">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`relative transition-all duration-300 ${
                  feature.id === activeFeature 
                    ? 'bg-blue-900/20' 
                    : 'hover:bg-blue-900/10'
                } ${index === 0 ? 'rounded-t-2xl lg:rounded-tr-none lg:rounded-tl-2xl' : ''} ${
                  index === features.length - 1 ? 'rounded-b-2xl lg:rounded-bl-2xl lg:rounded-br-none' : ''
                }`}
              >
                <button
                  onClick={() => setActiveFeature(feature.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between group hover:no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      feature.id === activeFeature ? 'text-blue-bright bg-blue-900/30' : 'text-blue-main'
                    }`}>
                      {feature.icon}
                    </div>
                    <span className={`font-semibold text-base md:text-lg transition-colors ${
                      feature.id === activeFeature ? 'text-blue-bright' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
                    feature.id === activeFeature ? 'rotate-180 text-blue-bright' : 'text-blue-main'
                  }`} />
                </button>
                
                {feature.id === activeFeature && (
                  <div className="px-8 py-2 animate-fadeIn">
                    <div className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full lg:w-[65%] bg-black/20 relative overflow-hidden lg:flex lg:items-center lg:justify-center p-12">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-blue-900/30 rounded-full flex items-center justify-center">
                <Brain className="w-16 h-16 text-blue-bright" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics Dashboard</h3>
              <p className="text-gray-600 max-w-md">
                Real-time data visualization and smart money tracking interface designed for professional traders.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-600">
            These opportunities happen every week. The difference between profit and regret is having the right tools to spot them early.
          </p>
          <div className="flex flex-col items-center">
            <Link 
              to="/app"
              className="beautiful-button inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all h-14 rounded-lg px-10 text-lg md:text-xl group hover-lift pulse-blue"
            >
              <span>Start Tracking Smart Money Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-xs md:text-sm text-gray-600 text-center mt-2">
              Try risk-free, money back guarantee.
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="w-full max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div 
          className={`text-center mb-12 lg:mb-16 scroll-reveal ${revealedElements.has('pricing-title') ? 'revealed' : ''}`}
          data-reveal-id="pricing-title"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pricing
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div 
            className={`beautiful-card rounded-2xl p-8 hover-lift scroll-reveal ${revealedElements.has('plan-free') ? 'revealed' : ''}`}
            data-reveal-id="plan-free"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                Free
              </div>
              <p className="text-gray-600 mb-8">Basic access to essential features.</p>
              <button className="w-full beautiful-button h-12 rounded-lg font-semibold">
                Get Started Free
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div 
            className={`beautiful-card rounded-2xl p-8 hover-lift scroll-reveal ${revealedElements.has('plan-pro') ? 'revealed' : ''}`}
            data-reveal-id="plan-pro"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $799<span className="text-lg text-gray-500">/year</span>
              </div>
              <p className="text-gray-600 mb-8">Unlock advanced features and real-time tracking.</p>
              <button className="w-full beautiful-button h-12 rounded-lg font-semibold">
                Start Pro Trial
              </button>
            </div>
          </div>

          {/* Legend Plan */}
          <div 
            className={`beautiful-card rounded-2xl p-8 hover-lift scroll-reveal ${revealedElements.has('plan-legend') ? 'revealed' : ''}`}
            data-reveal-id="plan-legend"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                Legend <Crown className="w-6 h-6 text-amber-500" />
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $7999<span className="text-lg text-gray-500">/year</span>
              </div>
              <p className="text-gray-600 mb-8">Exclusive access and priority support.</p>
              <button className="w-full beautiful-button h-12 rounded-lg font-semibold">
                Go Legend
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">&copy; 2025 StalkChain. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;