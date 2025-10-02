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
    }
  ];

  const features = [
    {
      id: 'kol-feed',
      title: 'KOL Feed',
      description: 'Track KOL trades live with wallet feeds. Position before followers using fast insights to seize market moves and stay ahead of retail.',
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      id: 'kol-leaderboard',
      title: 'KOL Leaderboard',
      description: 'Rank top KOLs by win rate, success. Live leaderboards let you follow market movers and use their strategies for sharp insights.',
      icon: <BarChart3 className="w-8 h-8" />
    },
    {
      id: 'top-kol-tokens',
      title: 'Top KOL Tokens',
      description: 'Spot tokens with heavy KOL buys. Alerts for influencer convergence let you position early before retail drives big price discovery.',
      icon: <Star className="w-8 h-8" />
    }
  ];

  return (
    <main className="noir-bg min-h-screen">
      {/* Hero Section */}
      <section className="w-full pt-20 lg:pt-32 pb-20 lg:pb-32 flex flex-col items-center justify-center relative">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-16 max-w-7xl mx-auto px-4">
          <div className={`flex-1 flex flex-col items-start text-left noir-fade-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 noir-gradient-text">
              Follow the smart money trail
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6 noir-subtitle">
              Act before the market catches on
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl noir-text-secondary font-light mb-10 max-w-xl">
              Real-time blockchain intelligence. Follow the biggest wallets, catch trends early, and make profitable moves before the market reacts.
            </p>
            
            <ul className="grid grid-cols-1 gap-4 mb-12 w-full max-w-md">
              {[
                { text: "Live whale wallet tracking", delay: "0ms" },
                { text: "1000+ KOL database", delay: "200ms" },
                { text: "Early trend detection", delay: "400ms" },
                { text: "Insider move alerts", delay: "600ms" }
              ].map((item, index) => (
                <li 
                  key={index}
                  className={`flex items-center gap-3 text-lg md:text-xl noir-text-secondary transition-all duration-700 noir-slide-in`}
                  style={{ transitionDelay: item.delay }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-5 h-5 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 w-full">
              <Link 
                to="/app/kol-feed" 
                className="noir-button noir-pulse inline-flex items-center justify-center whitespace-nowrap font-medium transition-all h-16 rounded-lg px-12 text-lg md:text-xl"
              >
                <span>Stop Missing Alpha</span>
              </Link>
              <Link 
                to="/app" 
                className="noir-button-secondary inline-flex items-center justify-center whitespace-nowrap font-medium transition-all h-16 rounded-lg px-12 text-lg md:text-xl"
              >
                <span>View Demo</span>
              </Link>
            </div>
          </div>
          
          {/* Video Player */}
          <div className={`flex-1 noir-fade-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="aspect-video noir-card noir-spotlight rounded-2xl overflow-hidden noir-glow">
              <video 
                className="w-full h-full object-cover"
                controls
                poster="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&dpr=1"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                <div className="flex items-center justify-center h-full bg-noir-dark">
                  <div className="text-center">
                    <Play className="w-20 h-20 text-white mx-auto mb-6" />
                    <p className="text-white font-medium text-xl">SmartChain Demo Video</p>
                    <p className="noir-text-secondary text-lg mt-3">Click to play demonstration</p>
                  </div>
                </div>
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <div className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div 
          className={`flex flex-col items-center mb-16 lg:mb-20 max-w-4xl mx-auto noir-fade-in ${revealedElements.has('features-title') ? 'revealed' : ''}`}
          data-reveal-id="features-title"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-6 noir-gradient-text">
            Your Edge in the Fastest-Moving Market
          </h2>
          <p className="text-xl md:text-2xl text-center noir-text-secondary max-w-3xl">
            While others rely on Twitter rumors and gut feelings, you'll trade with institutional-grade intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 my-12">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`group noir-card noir-spotlight rounded-2xl p-10 noir-fade-in ${revealedElements.has(`feature-${index}`) ? 'revealed' : ''}`}
              data-reveal-id={`feature-${index}`}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-full aspect-video bg-noir-gray rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center mb-6 transition-all duration-300 hover:border-white/40">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-white/60 text-sm">Feature Preview</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Feature {index}</h3>
                <p className="noir-text-secondary text-lg leading-relaxed">
                  Advanced trading tools and insights to help you make better decisions in the crypto market.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-16">
          <div className="flex flex-col items-center">
            <Link 
              to="/app"
              className="noir-button noir-pulse inline-flex items-center justify-center gap-3 whitespace-nowrap font-medium transition-all h-16 rounded-lg px-12 text-xl group"
            >
              <span>Join Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <div className="flex flex-col items-center">
            <Link 
              to="/app"
              className="noir-button noir-pulse inline-flex items-center justify-center gap-3 whitespace-nowrap font-medium transition-all h-16 rounded-lg px-12 text-xl group"
            >
              <span>Join Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-sm md:text-base noir-text-muted text-center mt-3">
              Try risk-free, money back guarantee.
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div 
          className={`text-center mb-16 lg:mb-20 noir-fade-in ${revealedElements.has('testimonials-title') ? 'revealed' : ''}`}
          data-reveal-id="testimonials-title"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold noir-gradient-text mb-8">
            Traders Using SmartChain
          </h2>
          <p className="text-xl md:text-2xl noir-text-secondary max-w-4xl mx-auto leading-relaxed">
            Join thousands of professional traders who trust SmartChain to track smart money movements and discover the next big opportunities.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`transition-all duration-700 noir-fade-in ${revealedElements.has(`testimonial-${index}`) ? 'revealed' : ''}`} 
              data-reveal-id={`testimonial-${index}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <a
                href={testimonial.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="noir-card noir-shimmer rounded-2xl p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                        <Users className="w-8 h-8 text-noir-black" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-4 h-4 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-lg truncate group-hover:text-gray-200 transition-colors">
                        {testimonial.username}
                      </span>
                      {testimonial.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="text-base noir-text-secondary mb-6 font-medium">
                      {testimonial.followers} followers
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-200 rounded-full"></div>
                      <span className="text-sm font-semibold noir-text-secondary group-hover:text-white transition-colors">
                        Using SmartChain
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-16">
          <button className="noir-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-lg font-semibold transition-all h-14 px-10 py-4">
            <Link to="/app" className="w-full h-full flex items-center justify-center">
              Get Started
            </Link>
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div 
          className={`text-center mb-16 lg:mb-20 noir-fade-in ${revealedElements.has('pricing-title') ? 'revealed' : ''}`}
          data-reveal-id="pricing-title"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold noir-gradient-text mb-8">
            Choose Your Trading Edge
          </h2>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl"></div>
          <p className="text-xl md:text-2xl noir-text-secondary max-w-4xl mx-auto leading-relaxed">
            Start free, upgrade when you're ready to unlock advanced features and maximize your profits.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div 
            className={`noir-card rounded-3xl p-10 noir-fade-in ${revealedElements.has('plan-free') ? 'revealed' : ''}`}
            data-reveal-id="plan-free"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">Free</h3>
              <div className="text-5xl font-bold text-white mb-8">
                $0<span className="text-xl noir-text-secondary">/month</span>
              </div>
              <ul className="space-y-5 mb-10 text-left">
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Basic KOL tracking</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Limited wallet insights</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Community access</span>
                </li>
              </ul>
              <button className="w-full noir-button-secondary h-14 rounded-lg font-semibold text-lg">
                Get Started Free
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div 
            className={`noir-card noir-border-glow rounded-3xl p-10 relative border-2 border-white noir-pulse noir-fade-in ${revealedElements.has('plan-pro') ? 'revealed' : ''}`}
            data-reveal-id="plan-pro"
          >
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <span className="bg-white text-noir-black px-6 py-2 rounded-full text-base font-bold noir-neon">
                Most Popular
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">Pro</h3>
              <div className="text-5xl font-bold text-white mb-8">
                $49<span className="text-xl noir-text-secondary">/month</span>
              </div>
              <ul className="space-y-5 mb-10 text-left">
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Advanced KOL analytics</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Real-time alerts</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Portfolio tracking</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">API access</span>
                </li>
              </ul>
              <button className="w-full noir-button h-14 rounded-lg font-semibold text-lg">
                Start Pro Trial
              </button>
            </div>
          </div>

          {/* Legend Plan */}
          <div 
            className={`noir-card noir-spotlight rounded-3xl p-10 noir-fade-in ${revealedElements.has('plan-legend') ? 'revealed' : ''}`}
            data-reveal-id="plan-legend"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3 noir-neon">
                Legend <Crown className="w-8 h-8 text-yellow-400" />
              </h3>
              <div className="text-5xl font-bold text-white mb-8">
                $99<span className="text-xl noir-text-secondary">/month</span>
              </div>
              <ul className="space-y-5 mb-10 text-left">
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Insider scan tools</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Fresh wallet feeds</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                    <svg className="w-4 h-4 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-lg">Priority support</span>
                </li>
              </ul>
              <button className="w-full noir-button-secondary h-14 rounded-lg font-semibold text-lg">
                Go Legend
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;