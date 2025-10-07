import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import FAQ from './FAQ';

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <main className="noir-bg min-h-screen pt-16">
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center max-w-4xl mx-auto fade-in">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
            Track Smart Money
          </h1>
          <p className="text-xl md:text-2xl text-gray mb-12 max-w-3xl mx-auto">
            Real-time whale tracking and KOL analytics. Make moves before the market reacts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app/kol-feed" className="btn-white px-8 py-4 text-base">
              Start Tracking
              <ArrowRight className="w-4 h-4 inline-block ml-2" />
            </Link>
            <Link to="/app" className="btn-dark px-8 py-4 text-base">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Professional Tools
          </h2>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            Everything you need to track smart money movements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Real-Time Tracking",
              description: "Monitor KOL trades and whale movements instantly"
            },
            {
              title: "Advanced Analytics",
              description: "Deep insights into trading patterns and success rates"
            },
            {
              title: "Smart Alerts",
              description: "Get notified when smart money makes moves"
            }
          ].map((feature, index) => (
            <div key={index} className="card-dark p-8 text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pricing
          </h2>
          <p className="text-lg text-gray mb-8">
            Start free or unlock premium features
          </p>

          <div className="inline-flex items-center gap-2 p-1 bg-black border border-white/10 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded font-medium text-sm transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-black' : 'text-gray hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded font-medium text-sm transition-all ${
                billingPeriod === 'yearly' ? 'bg-white text-black' : 'text-gray hover:text-white'
              }`}
            >
              Yearly <span className="text-xs ml-1">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="card-dark p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-gray">/mo</span>
            </div>
            <button className="btn-dark w-full mb-6">Get Started</button>
            <ul className="space-y-3 text-white">
              {['Live KOL Feed', 'Smart Money Tracker', 'Wallet Finder', 'Token Insiders'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-dark p-8 border-2 border-white">
            <div className="text-xs font-bold text-black bg-white px-3 py-1 rounded inline-block mb-3">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '159' : '199'}
              </span>
              <span className="text-gray">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-gray mb-4">$1,908/year</p>
            )}
            <button className="btn-white w-full mb-6">Get Started</button>
            <ul className="space-y-3 text-white">
              {['Everything in Free', 'Cabal Finder', 'Fresh Wallet Feeds', 'Custom KOL Feed', 'Insiders Scan'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-dark p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Legend</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '319' : '399'}
              </span>
              <span className="text-gray">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-gray mb-4">$3,828/year</p>
            )}
            <button className="btn-white w-full mb-6">Get Started</button>
            <ul className="space-y-3 text-white">
              {['Everything in Pro', 'Whales Open Orders', 'Priority Alerts', 'Private Community', 'API Access', '1-on-1 Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
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
