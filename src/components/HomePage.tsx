import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, TrendingUp, Users, Zap, Shield, Target, Activity } from 'lucide-react';
import FAQ from './FAQ';

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen pt-16 overflow-hidden" style={{ background: '#0A0A0A' }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.15), transparent 40%)`
        }}
      />

      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <section className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-400 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Track the smart money movements
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
            Position before<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">price impact</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Real-time on-chain intelligence. Track KOL wallets, whale movements, and insider activity across Solana.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to="/app/kol-feed"
              className="group relative px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/50"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/app"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              View Demo
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { value: '1000+', label: 'KOLs Tracked' },
              { value: '24/7', label: 'Live Feed' },
              { value: '10K+', label: 'Traders' },
              { value: '<100ms', label: 'Latency' }
            ].map((stat, i) => (
              <div key={i} className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-green-500/30 rounded-xl p-6 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-transparent rounded-xl transition-all duration-300" />
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Professional Intelligence Suite
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto font-light">
            Everything you need to track smart money and stay ahead
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Live KOL Feed",
              description: "Track 1000+ verified Key Opinion Leaders in real-time. See every trade before it hits Twitter."
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: "Whale Tracker",
              description: "Monitor large wallets and get instant alerts on significant position changes."
            },
            {
              icon: <Activity className="w-6 h-6" />,
              title: "Market Analytics",
              description: "Advanced on-chain metrics, volume analysis, and trend detection algorithms."
            },
            {
              icon: <Target className="w-6 h-6" />,
              title: "Token Scanner",
              description: "Discover tokens before they pump. Track what smart wallets are accumulating."
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Real-time Alerts",
              description: "Custom notifications via Telegram, Discord, or email. Never miss an opportunity."
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Insider Detection",
              description: "AI-powered pattern recognition to detect coordinated buying and insider activity."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-green-500/30 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
              <div className="relative">
                <div className="w-12 h-12 bg-green-500/10 group-hover:bg-green-500/20 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                  <div className="text-green-400">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get Started in Seconds
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Three steps to tracking smart money
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent -translate-y-1/2" />

          {[
            {
              step: "01",
              title: "Create Account",
              description: "Sign up free. No credit card needed."
            },
            {
              step: "02",
              title: "Choose Tools",
              description: "Select KOLs, set alerts, customize feeds."
            },
            {
              step: "03",
              title: "Start Tracking",
              description: "Get real-time intelligence and profit."
            }
          ].map((item, index) => (
            <div key={index} className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full mb-6 relative z-10">
                <span className="text-3xl font-bold text-green-400">{item.step}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 font-light">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 font-light">
            Start free. Scale when ready.
          </p>

          <div className="inline-flex items-center gap-1 p-1 bg-white/[0.02] border border-white/10 rounded-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                billingPeriod === 'monthly' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                billingPeriod === 'yearly' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs font-normal">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-gray-400 text-sm font-light">Get started</p>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-lg text-gray-400">/mo</span>
            </div>
            <button className="w-full mb-10 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-lg font-semibold transition-all">
              Start Free
            </button>
            <div className="space-y-3 text-white">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-medium">Includes:</div>
              {[
                'Live KOL Feed',
                'Basic Analytics',
                'Wallet Finder',
                'Token Tracking',
                'Email Alerts'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                  <span className="text-sm text-gray-300 font-light">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-white/[0.02] border-2 border-green-500/50 rounded-2xl p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-green-500 text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-gray-400 text-sm font-light">For serious traders</p>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '159' : '199'}
              </span>
              <span className="text-lg text-gray-400">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-gray-500 mb-8 font-light">$1,908 annually</p>
            )}
            <button className="w-full mb-10 py-3 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold transition-all hover:scale-105">
              Get Pro
            </button>
            <div className="space-y-3 text-white">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-medium">Everything in Free, plus:</div>
              {[
                'Advanced Analytics',
                'Cabal Finder',
                'Fresh Wallet Feeds',
                'Custom KOL Lists',
                'Insider Scan',
                'Telegram Alerts',
                'Priority Support'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" />
                  <span className="text-sm text-gray-300 font-light">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Legend</h3>
              <p className="text-gray-400 text-sm font-light">Maximum edge</p>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '319' : '399'}
              </span>
              <span className="text-lg text-gray-400">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-gray-500 mb-8 font-light">$3,828 annually</p>
            )}
            <button className="w-full mb-10 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-lg font-semibold transition-all">
              Go Legend
            </button>
            <div className="space-y-3 text-white">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-medium">Everything in Pro, plus:</div>
              {[
                'Whale Open Orders',
                'Priority Alerts',
                'Private Community',
                'API Access',
                'White Glove Support',
                'Custom Features',
                'Early Access'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                  <span className="text-sm text-gray-300 font-light">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="relative bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-3xl p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(34, 197, 94, 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Track Smart Money?
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
              Join 10,000+ traders using StalkX to stay ahead
            </p>
            <Link
              to="/app/kol-feed"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/50"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
