import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, CheckCircle, Crown, ChevronDown, Users } from 'lucide-react';

const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return { ref, isVisible };
};

const HomePage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const kols = [
    { handle: '@valueandtime', followers: '91.8K', twitter: 'https://x.com/valueandtime', avatar: 'https://pbs.twimg.com/profile_images/1874585004077875200/UwK9FNvy_400x400.jpg' },
    { handle: '@solanashaka', followers: '20.9K', twitter: 'https://x.com/solanashaka', avatar: 'https://pbs.twimg.com/profile_images/1906943959185698816/NicXkxug_400x400.jpg' },
    { handle: '@tier1haterr', followers: '10.20K', twitter: 'https://twitter.com/tier1haterr', avatar: 'https://pbs.twimg.com/profile_images/1985686649188012032/OeDVL6xB_400x400.jpg' },
    { handle: '@eth_ancarter', followers: '1.3K', twitter: 'https://x.com/eth_ancarter?s=21', avatar: 'https://pbs.twimg.com/profile_images/1961738830769229824/60LCaGAY_400x400.jpg' }
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

  const FadeInSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
      <div
        ref={ref}
        className={`transition-all duration-1000 ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  };

  return (
    <main className="noir-bg min-h-screen relative" style={{ willChange: 'scroll-position' }}>
      <video
        className="fixed top-0 left-0 w-screen h-screen object-cover opacity-50 z-0"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23000000' width='1' height='1'/%3E%3C/svg%3E"
        style={{
          filter: 'brightness(1.05) contrast(1.05)',
          transform: 'translateZ(0) scale(1.01)',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          imageRendering: 'auto'
        }}
        onLoadedData={(e) => {
          const video = e.currentTarget;
          video.style.opacity = '0.5';
          video.currentTime = 0.01;
        }}
      >
        <source src="https://i.imgur.com/E490BLn.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-noir-black/40 via-noir-black/50 to-noir-black z-0" style={{ transform: 'translateZ(0)', willChange: 'auto' }}></div>

      <header className="w-full py-4 sm:py-6 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-end">
          <Link to="/app/kol-feed" className="group">
            <img
              src="/launch-app-button.jpg"
              alt="Launch App"
              loading="eager"
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto hover:scale-105 hover:opacity-90 transition-all duration-300"
              onError={(e) => {
                console.error('Failed to load launch button image');
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>
        </div>
      </header>

      <section className="w-full pt-8 sm:pt-12 lg:pt-20 pb-16 sm:pb-20 lg:pb-32 flex flex-col items-center justify-center relative z-10">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-16 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex-1 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 noir-text-secondary relative z-20 pb-2" style={{ lineHeight: '1.15' }}>
              Follow the smart money trail
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 sm:mb-6 noir-text-secondary" style={{ lineHeight: '1.15' }}>
              Act before the market catches on
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl noir-text-secondary font-light mb-8 sm:mb-10 max-w-xl">
              Real-time blockchain intelligence. Follow the biggest wallets, catch trends early, and make profitable moves before the market reacts.
            </p>

            <ul className="grid grid-cols-1 gap-4 mb-10 sm:mb-14 w-full max-w-lg">
              {['Live whale wallet tracking', '1000+ KOL database', 'Early trend detection', 'Insider move alerts'].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4"
                  style={{ transform: 'translateZ(0)' }}
                >
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-white to-gray-300 flex-shrink-0 shadow-lg shadow-white/60 ring-2 ring-white/20 ring-offset-2 ring-offset-noir-black"></div>
                  <span className="font-semibold text-lg sm:text-xl noir-text-secondary tracking-wide">{item}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32 relative z-10">
        <FadeInSection>
        <div className="flex flex-col items-center mb-16 lg:mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-4 sm:mb-6 noir-text-secondary">
            Your Edge in the Fastest-Moving Market
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center noir-text-secondary max-w-3xl">
            While others rely on Twitter rumors and gut feelings, you'll trade with institutional-grade intelligence.
          </p>
        </div>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 my-8 sm:my-12">
          {[
            {
              image: 'https://i.imgur.com/U1pMVvy.jpeg',
              title: 'KOL Tracking',
              description: 'Monitor 1000+ Key Opinion Leaders and their trading activity. Follow the smartest traders and replicate their winning strategies.'
            },
            {
              image: 'https://i.imgur.com/X2IzMU9.jpeg',
              title: 'Pattern Detection',
              description: 'Advanced algorithms identify insider trading patterns and coordinated buying. Stay ahead of pumps and protect against dumps.'
            },
            {
              image: 'https://i.imgur.com/cZCdbk1.jpeg',
              title: 'Whale Monitoring',
              description: 'Track massive wallets in real-time. Get alerts when big players make moves that could signal major market shifts.'
            }
          ].map((feature, index) => (
            <FadeInSection key={index} delay={index * 100}>
            <div className="group noir-card noir-spotlight rounded-2xl p-6 sm:p-8 md:p-10">
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-full aspect-video bg-noir-gray rounded-xl overflow-hidden mb-6">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    style={{
                      contentVisibility: 'auto',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden'
                    }}
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold noir-text-secondary mb-3 sm:mb-4">{feature.title}</h3>
                <p className="noir-text-secondary text-base sm:text-lg leading-relaxed">{feature.description}</p>
              </div>
            </div>
            </FadeInSection>
          ))}
        </div>
      </div>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32 relative z-10">
        <FadeInSection>
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold noir-text-secondary mb-6 sm:mb-8">
            Traders Using SmartChain
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl noir-text-secondary max-w-4xl mx-auto leading-relaxed">
            Join thousands of professional traders who trust SmartChain to track smart money movements and discover the next big opportunities.
          </p>
        </div>
        </FadeInSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {kols.map((kol, index) => (
            <FadeInSection key={index} delay={index * 50}>
            <div style={{ transform: 'translateZ(0)' }}>
              <a href={kol.twitter} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="noir-card noir-shimmer rounded-2xl p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                        {kol.avatar ? (
                          <img src={kol.avatar} alt={kol.handle} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-8 h-8 text-noir-black" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-4 h-4 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold noir-text-secondary text-lg truncate group-hover:text-gray-400 transition-colors">
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
            </FadeInSection>
          ))}
        </div>

      </section>

      <section id="plans" className="w-full max-w-7xl mx-auto px-4 py-20 lg:py-32 relative z-10">
        <FadeInSection>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold noir-text-secondary mb-4">Choose Your Plan</h2>
          <p className="text-base sm:text-lg md:text-xl noir-text-secondary max-w-2xl mx-auto mb-6 sm:mb-8">
            Start free or unlock premium features to dominate the market
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-noir-black' : 'noir-text-secondary hover:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'yearly' ? 'bg-white text-noir-black' : 'noir-text-secondary hover:text-gray-300'
              }`}
            >
              Yearly
            </button>
            {billingPeriod === 'yearly' && (
              <p className="text-sm noir-text-secondary">Save 20% with annual billing</p>
            )}
          </div>
        </div>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <FadeInSection delay={0}>
          <div className="group bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold noir-text-secondary mb-3">Free</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold noir-text-secondary">$0</span>
                <span className="text-xl noir-text-secondary">/mo</span>
              </div>
            </div>

            <Link
              to="/app/kol-feed"
              className="group w-full bg-gradient-to-r from-white to-gray-100 text-noir-black py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-100 hover:to-white hover:scale-105 hover:shadow-2xl transition-all duration-300 mb-8 shadow-xl flex items-center justify-center gap-2"
            >
              <span>Start Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <ul className="space-y-4 text-left">
              {['Live KOL Feed', 'Smart Money Tracker', 'Wallet Finder', 'Token Insiders'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 noir-text-secondary text-base">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          </FadeInSection>

          <FadeInSection delay={100}>
          <div className="group bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-white/30 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold noir-text-secondary mb-3">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold noir-text-secondary">
                  ${billingPeriod === 'yearly' ? '159' : '199'}
                </span>
                <span className="text-xl noir-text-secondary">/mo</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm noir-text-secondary mt-2">$1,908 billed annually</p>
              )}
            </div>

            <Link
              to="/app/kol-feed"
              className="group w-full bg-gradient-to-r from-white to-gray-100 text-noir-black py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-100 hover:to-white hover:scale-105 hover:shadow-2xl transition-all duration-300 mb-8 shadow-xl flex items-center justify-center gap-2"
            >
              <span>Get Pro</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <ul className="space-y-4 text-left">
              {['Everything in Free', 'Cabal Finder', 'Fresh Wallet Feeds', 'Custom KOL Feed', 'Insiders Scan'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 noir-text-secondary text-base">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          </FadeInSection>

          <FadeInSection delay={200}>
          <div className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm border-2 border-white/30 rounded-3xl p-6 sm:p-8 hover:border-white/50 hover:shadow-2xl hover:shadow-white/10 transition-all duration-500 relative transform hover:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-white text-noir-black px-6 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>MOST POPULAR</span>
              </div>
            </div>

            <div className="mb-8 mt-4">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-3xl font-bold noir-text-secondary">Legend</h3>
                <Crown className="w-7 h-7 noir-text-secondary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold noir-text-secondary">
                  ${billingPeriod === 'yearly' ? '319' : '399'}
                </span>
                <span className="text-xl noir-text-secondary">/mo</span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="text-sm noir-text-secondary mt-2">$3,828 billed annually</p>
              )}
            </div>

            <Link
              to="/app/kol-feed"
              className="group w-full bg-gradient-to-r from-white via-gray-50 to-white text-noir-black py-5 px-8 rounded-xl font-bold text-xl hover:shadow-3xl hover:scale-105 transition-all duration-300 mb-8 shadow-2xl flex items-center justify-center gap-3 border-2 border-white/50"
            >
              <Crown className="w-6 h-6" />
              <span>Go Legend</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>

            <ul className="space-y-4 text-left">
              {['Everything in Pro', 'Whales Open Orders', 'Priority Alerts', 'Private Community', 'API Access', '1-on-1 Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 noir-text-secondary text-base font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          </FadeInSection>
        </div>
      </section>

      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <FadeInSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold noir-text-secondary mb-4">Frequently Asked Questions</h2>
          <p className="text-xl noir-text-secondary">Everything you need to know about SmartChain</p>
        </div>
        </FadeInSection>

        <FadeInSection delay={100}>
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
                    <span className="noir-text-secondary text-lg font-medium">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 noir-text-secondary transition-transform duration-300 flex-shrink-0 ${
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
        </FadeInSection>
      </section>
    </main>
  );
};

export default HomePage;
