import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, TrendingUp, Users, Zap, Shield, Target, Activity } from 'lucide-react';
import FAQ from './FAQ';

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <main className="noir-bg min-h-screen pt-16">
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center max-w-5xl mx-auto fade-in">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white mb-6">
            Trusted by 10,000+ traders worldwide
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
            Track Smart Money<br />in Real-Time
          </h1>
          <p className="text-xl md:text-2xl text-gray mb-12 max-w-3xl mx-auto leading-relaxed">
            Follow KOL trades, monitor whale wallets, and catch trends before they explode. Professional intelligence for serious traders.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/app/kol-feed" className="btn-white px-10 py-5 text-lg font-bold">
              Start Tracking Free
              <ArrowRight className="w-5 h-5 inline-block ml-2" />
            </Link>
            <Link to="/app" className="btn-dark px-10 py-5 text-lg font-bold">
              View Live Demo
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="card-dark p-5">
              <div className="text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-xs text-gray uppercase tracking-wider">KOLs Tracked</div>
            </div>
            <div className="card-dark p-5">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs text-gray uppercase tracking-wider">Live Monitoring</div>
            </div>
            <div className="card-dark p-5">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs text-gray uppercase tracking-wider">Active Users</div>
            </div>
            <div className="card-dark p-5">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-xs text-gray uppercase tracking-wider">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-gray max-w-3xl mx-auto">
            Professional-grade tools to track, analyze, and profit from smart money movements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: "Live KOL Feed",
              description: "Track every trade from 1000+ verified Key Opinion Leaders in real-time. See what they buy before followers do.",
              features: ["Real-time notifications", "Trade history", "P&L tracking"]
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Whale Wallets",
              description: "Monitor the biggest wallets making moves. Get instant alerts when whales buy or sell significant positions.",
              features: ["Wallet ranking", "Position tracking", "Smart alerts"]
            },
            {
              icon: <Activity className="w-8 h-8" />,
              title: "Market Analytics",
              description: "Advanced charts and metrics to understand market sentiment and identify emerging trends before they pump.",
              features: ["Trend detection", "Volume analysis", "Social sentiment"]
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: "Token Discovery",
              description: "Find hidden gems before they moon. Track what smart money is accumulating and get in early.",
              features: ["Early detection", "Risk scoring", "Token metrics"]
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Instant Alerts",
              description: "Never miss a move. Get real-time notifications via Telegram, Discord, or email when opportunities arise.",
              features: ["Custom filters", "Multi-platform", "Priority alerts"]
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Insider Scan",
              description: "Detect insider activity and coordinated buying patterns. Stay ahead of pump and dumps.",
              features: ["Pattern detection", "Wallet clustering", "Risk alerts"]
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="card-dark p-8 fade-in hover:border-white/20 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-6">
                <div className="text-black">{feature.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray leading-relaxed mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray max-w-3xl mx-auto">
            Three simple steps to start tracking smart money
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Create Account",
              description: "Sign up in seconds. No credit card required to start."
            },
            {
              step: "02",
              title: "Choose Tools",
              description: "Select KOLs to track, set up alerts, customize your dashboard."
            },
            {
              step: "03",
              title: "Track & Profit",
              description: "Monitor live trades, get instant alerts, make informed decisions."
            }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple Pricing
          </h2>
          <p className="text-xl text-gray mb-10">
            Start free or unlock premium features to dominate the market
          </p>

          <div className="inline-flex items-center gap-2 p-1 bg-black border border-white/10 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-8 py-3 rounded text-sm font-bold transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-black' : 'text-gray hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-8 py-3 rounded text-sm font-bold transition-all ${
                billingPeriod === 'yearly' ? 'bg-white text-black' : 'text-gray hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card-dark p-10">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-3">Free</h3>
              <p className="text-gray text-sm">Perfect for getting started</p>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-xl text-gray">/month</span>
            </div>
            <button className="btn-dark w-full mb-10 py-4 text-base font-bold">
              Start Free
            </button>
            <div className="space-y-4 text-white">
              <div className="font-bold text-sm uppercase tracking-wider text-gray mb-6">Includes:</div>
              {[
                'Live KOL Feed',
                'Basic Analytics',
                'Wallet Finder',
                'Token Tracking',
                'Email Alerts'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-dark p-10 border-2 border-white relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-3">Pro</h3>
              <p className="text-gray text-sm">For serious traders</p>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '159' : '199'}
              </span>
              <span className="text-xl text-gray">/month</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-gray mb-8">Billed $1,908 annually</p>
            )}
            <button className="btn-white w-full mb-10 py-4 text-base font-bold">
              Get Pro
            </button>
            <div className="space-y-4 text-white">
              <div className="font-bold text-sm uppercase tracking-wider text-gray mb-6">Everything in Free, plus:</div>
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
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-dark p-10">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-3">Legend</h3>
              <p className="text-gray text-sm">Maximum edge</p>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '319' : '399'}
              </span>
              <span className="text-xl text-gray">/month</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-gray mb-8">Billed $3,828 annually</p>
            )}
            <button className="btn-white w-full mb-10 py-4 text-base font-bold">
              Go Legend
            </button>
            <div className="space-y-4 text-white">
              <div className="font-bold text-sm uppercase tracking-wider text-gray mb-6">Everything in Pro, plus:</div>
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
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="card-dark p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Track Smart Money?
          </h2>
          <p className="text-xl text-gray mb-10 max-w-2xl mx-auto">
            Join thousands of traders using SmartChain to stay ahead of the market
          </p>
          <Link to="/app/kol-feed" className="btn-white px-12 py-5 text-lg font-bold inline-flex items-center gap-3">
            Start Tracking Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
