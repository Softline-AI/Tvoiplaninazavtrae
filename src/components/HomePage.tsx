import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Play, Star, Zap, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import FAQ from './FAQ';

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <main className="noir-bg min-h-screen pt-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Follow the{' '}
            <span className="text-gradient">Smart Money</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-light">
            Track whale wallets, catch trends early, and make profitable moves before the market reacts
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/app/kol-feed"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/app"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { text: "Live whale tracking", icon: <TrendingUp className="w-5 h-5" /> },
              { text: "1000+ KOL database", icon: <Star className="w-5 h-5" /> },
              { text: "Early trend detection", icon: <Zap className="w-5 h-5" /> },
              { text: "Real-time alerts", icon: <Shield className="w-5 h-5" /> }
            ].map((item, index) => (
              <div
                key={index}
                className="glass-card p-4 slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-2 text-white/80">
                  {item.icon}
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why SmartChain?
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Professional tools for serious traders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-Time Tracking",
              description: "Monitor KOL trades and whale movements as they happen. Never miss an opportunity.",
              icon: <TrendingUp className="w-8 h-8" />
            },
            {
              title: "Advanced Analytics",
              description: "Deep insights into trading patterns, success rates, and market trends.",
              icon: <Star className="w-8 h-8" />
            },
            {
              title: "Smart Alerts",
              description: "Get notified instantly when smart money makes significant moves.",
              icon: <Zap className="w-8 h-8" />
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="card-modern text-center fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-white/60 mb-8">
            Start free or unlock premium features
          </p>

          <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-400">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="card-modern">
            <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-white/60">/mo</span>
            </div>
            <button className="btn-secondary w-full mb-6">
              Get Started
            </button>
            <ul className="space-y-3 text-white/80">
              {[
                'Live KOL Feed',
                'Smart Money Tracker',
                'Wallet Finder',
                'Token Insiders'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-modern relative border-2 border-blue-500/30">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '159' : '199'}
              </span>
              <span className="text-white/60">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-400 mb-4">Billed $1,908/year</p>
            )}
            <button className="btn-primary w-full mb-6">
              Get Started
            </button>
            <ul className="space-y-3 text-white/80">
              {[
                'Everything in Free',
                'Cabal Finder',
                'Fresh Wallet Feeds',
                'Custom KOL Feed',
                'Insiders Scan'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-modern">
            <h3 className="text-2xl font-semibold text-white mb-2">Legend</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '319' : '399'}
              </span>
              <span className="text-white/60">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-400 mb-4">Billed $3,828/year</p>
            )}
            <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all mb-6">
              Go Legend
            </button>
            <ul className="space-y-3 text-white/80">
              {[
                'Everything in Pro',
                'Whales Open Orders',
                'Priority Alerts',
                'Private Community',
                'API Access',
                '1-on-1 Support'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FAQ />
    </main>
  );
};

export default HomePage;
