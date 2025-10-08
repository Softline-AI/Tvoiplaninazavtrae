import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, CheckCircle, Crown, ChevronDown, Play, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const kols = [
    { handle: '@cryptomanran', followers: '958.87K', twitter: 'https://twitter.com/cryptomanran' },
    { handle: '@nft_cryptogang', followers: '119.52K', twitter: 'https://twitter.com/nft_cryptogang' },
    { handle: '@tier1haterr', followers: '10.20K', twitter: 'https://twitter.com/tier1haterr' },
    { handle: '@Chyan', followers: '10.71K', twitter: 'https://twitter.com/Chyan' }
  ];

  const faqs = [
    {
      question: 'What is SmartChain?',
      answer: 'SmartChain is a powerful crypto analytics platform that helps you track whale movements, discover early opportunities, and monitor insider trading patterns in real-time on the Solana blockchain.'
    },
    {
      question: 'How does SmartChain work?',
      answer: 'SmartChain analyzes on-chain data and market patterns to identify promising opportunities. Our platform tracks successful crypto traders and whales, providing you with real-time insights into their trading activities and potential market movements.'
    },
    {
      question: 'What features does SmartChain offer?',
      answer: 'SmartChain offers a comprehensive suite of tools including Live KOL Feed, Smart Money Tracker, Solana Tools, Wallet Finder, Cabal Finder, and Token Insiders. Premium members get access to additional features like Custom KOL Feed, Whales Open Orders tracking, and a private community.'
    },
    {
      question: 'Is SmartChain suitable for beginners?',
      answer: 'Yes! SmartChain is designed with an intuitive interface that makes it accessible for beginners while providing powerful insights for experienced traders. Our platform includes helpful documentation and guides to get you started.'
    },
    {
      question: 'What subscription plans are available?',
      answer: 'SmartChain offers three subscription tiers: Free ($0/month) with basic features, Pro ($199/month or $159/month billed yearly), and Legend ($399/month or $319/month billed yearly) with full access to all premium features including API access and 1-on-1 support. Save 20% with annual billing.'
    },
    {
      question: 'How do I cancel my membership?',
      answer: 'You can cancel your membership at any time from your account settings. Simply navigate to the billing section and click on "Cancel Subscription". Your access will continue until the end of your current billing period.'
    },
    {
      question: 'What makes SmartChain different?',
      answer: 'SmartChain combines real-time data analysis, whale tracking, and pattern recognition to give you an edge in the crypto market. Our platform helps you identify opportunities before they go viral, backed by actual on-chain data and sophisticated tracking algorithms.'
    }
  ];

  return (
    <main className="noir-bg min-h-screen">
      <section className="w-full pt-20 lg:pt-32 pb-20 lg:pb-32 flex flex-col items-center justify-center relative">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-16 max-w-7xl mx-auto px-4">
          <div className="flex-1 flex flex-col items-start text-left">
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
              {['Live whale wallet tracking', '1000+ KOL database', 'Early trend detection', 'Insider move alerts'].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-lg md:text-xl noir-text-secondary transition-all duration-700 noir-slide-in"
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                    <svg className="w-5 h-5 text-white drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path strokeWidth="3" d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                  {item}
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

          <div className="flex-1">
            <div className="aspect-video noir-card noir-spotlight rounded-2xl overflow-hidden noir-glow">
              <video
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&dpr=1"
              >
                <source src="https://drive.google.com/uc?export=download&id=133brmb1JfxkI94qmvmCghn2-KyzR1OUd" type="video/mp4" />
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

      <div className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="flex flex-col items-center mb-16 lg:mb-20 max-w-4xl mx-auto noir-fade-in revealed">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-6 noir-gradient-text">
            Your Edge in the Fastest-Moving Market
          </h2>
          <p className="text-xl md:text-2xl text-center noir-text-secondary max-w-3xl">
            While others rely on Twitter rumors and gut feelings, you'll trade with institutional-grade intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 my-12">
          {[
            {
              image: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=800',
              title: 'KOL Tracking',
              description: 'Monitor 1000+ Key Opinion Leaders and their trading activity. Follow the smartest traders and replicate their winning strategies.'
            },
            {
              image: 'https://images.pexels.com/photos/7567592/pexels-photo-7567592.jpeg?auto=compress&cs=tinysrgb&w=800',
              title: 'Whale Monitoring',
              description: 'Track massive wallets in real-time. Get alerts when big players make moves that could signal major market shifts.'
            },
            {
              image: 'https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800',
              title: 'Pattern Detection',
              description: 'Advanced algorithms identify insider trading patterns and coordinated buying. Stay ahead of pumps and protect against dumps.'
            }
          ].map((feature, index) => (
            <div key={index} className="group noir-card noir-spotlight rounded-2xl p-10 noir-fade-in revealed">
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-full aspect-video bg-noir-gray rounded-xl overflow-hidden mb-6 transition-all duration-300">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="noir-text-secondary text-lg leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/app"
            className="noir-button noir-pulse inline-flex items-center justify-center gap-3 whitespace-nowrap font-medium transition-all h-16 rounded-lg px-12 text-xl group"
          >
            <span>Join Now</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <section className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="text-center mb-16 lg:mb-20 noir-fade-in revealed">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold noir-gradient-text mb-8">
            Traders Using SmartChain
          </h2>
          <p className="text-xl md:text-2xl noir-text-secondary max-w-4xl mx-auto leading-relaxed">
            Join thousands of professional traders who trust SmartChain to track smart money movements and discover the next big opportunities.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {kols.map((kol, index) => (
            <div
              key={index}
              className="transition-all duration-700 noir-fade-in revealed"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <a href={kol.twitter} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="noir-card noir-shimmer rounded-2xl p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                        <Users className="w-8 h-8 text-noir-black" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-4 h-4 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-lg truncate group-hover:text-gray-200 transition-colors">
                        {kol.handle}
                      </span>
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    </div>
                    <div className="text-base noir-text-secondary mb-6 font-medium">{kol.followers} followers</div>
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
          <Link
            to="/app"
            className="noir-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-lg font-semibold transition-all h-14 px-10 py-4"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section id="plans" className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="text-center mb-16 noir-fade-in revealed">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-xl noir-text-secondary max-w-2xl mx-auto mb-8">
            Start free or unlock premium features to dominate the market
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-noir-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'yearly' ? 'bg-white text-noir-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-400">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all noir-fade-in revealed">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-lg text-white/60">/mo</span>
            </div>
            <div className="h-6 mb-4"></div>
            <button className="w-full bg-white text-noir-black py-3 px-6 rounded-xl font-semibold hover:bg-white/90 transition-all mb-6">
              Get Started
            </button>
            <ul className="space-y-2.5 text-left text-white/80 text-sm">
              {['Live KOL Feed', 'Smart Money Tracker', 'Wallet Finder', 'Token Insiders'].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all noir-fade-in revealed">
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '159' : '199'}
              </span>
              <span className="text-lg text-white/60">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-400 mb-4">Billed $1,908/year</p>
            )}
            <button className="w-full bg-white text-noir-black py-3 px-6 rounded-xl font-semibold hover:bg-white/90 transition-all mb-6">
              Get Started
            </button>
            <ul className="space-y-2.5 text-left text-white/80 text-sm">
              {['Everything in Starter', 'Cabal Finder', 'Fresh Wallet Feeds', 'Custom KOL Feed', 'Insiders Scan'].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-white/30 transition-all relative noir-fade-in revealed">
            <div className="absolute -top-3 right-6">
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-noir-black px-4 py-1 rounded-full text-sm font-bold">
                Popular
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-white">Legend</h3>
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">
                ${billingPeriod === 'yearly' ? '319' : '399'}
              </span>
              <span className="text-lg text-white/60">/mo</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-400 mb-4">Billed $3,828/year</p>
            )}
            <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-noir-black py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all mb-6">
              Go Legend
            </button>
            <ul className="space-y-2.5 text-left text-white/80 text-sm">
              {['Everything in Pro', 'Whales Open Orders', 'Priority Alerts', 'Private Community', 'API Access', '1-on-1 Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="w-full max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl noir-text-secondary">Everything you need to know about SmartChain</p>
        </div>

        <div className="border border-white/20 rounded-2xl overflow-hidden bg-noir-dark/50 backdrop-blur-sm">
          {faqs.map((faq, index) => (
            <React.Fragment key={index}>
              <div className="text-base">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex py-5 px-6 w-full items-center gap-4 text-left transition-all hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-expanded={openFaq === index}
                >
                  <div className="flex-1">
                    <span className="text-white text-lg font-medium">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 transition-transform duration-300 flex-shrink-0 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 noir-text-secondary text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
              {index < faqs.length - 1 && <hr className="border-white/10" />}
            </React.Fragment>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
