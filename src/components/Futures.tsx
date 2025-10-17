import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Zap, Target, Users, Shield, Rocket, CheckCircle } from 'lucide-react';

const Futures: React.FC = () => {
  const roadmapItems = [
    {
      quarter: 'Q1 2025',
      status: 'In Progress',
      items: [
        'Advanced AI-powered trading signals',
        'Multi-chain support (Ethereum, BSC)',
        'Enhanced whale tracking algorithms',
        'Mobile app launch (iOS & Android)'
      ]
    },
    {
      quarter: 'Q2 2025',
      status: 'Planned',
      items: [
        'Automated copy trading system',
        'Social trading community features',
        'Advanced portfolio analytics',
        'Integration with major DEX platforms'
      ]
    },
    {
      quarter: 'Q3 2025',
      status: 'Planned',
      items: [
        'NFT tracking and analytics',
        'DeFi protocol monitoring',
        'Custom alert builder',
        'API marketplace for developers'
      ]
    },
    {
      quarter: 'Q4 2025',
      status: 'Planned',
      items: [
        'AI trading bot marketplace',
        'Institutional-grade analytics',
        'Cross-chain arbitrage finder',
        'Global expansion and localization'
      ]
    }
  ];

  const upcomingFeatures = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'AI-Powered Predictions',
      description: 'Machine learning models that predict token performance based on historical data and market sentiment'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics Dashboard',
      description: 'Institutional-grade analytics with custom indicators, backtesting, and performance metrics'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time Trade Execution',
      description: 'Automated trading system that executes trades instantly when smart money moves'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Smart Risk Management',
      description: 'AI-powered risk assessment tools that help you protect your portfolio and maximize returns'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Social Trading Network',
      description: 'Connect with top traders, share strategies, and learn from the best in the community'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Security & Compliance',
      description: 'Enterprise-level security measures and regulatory compliance for institutional users'
    }
  ];

  return (
    <main className="noir-bg min-h-screen relative">
      <video
        className="fixed top-0 left-0 w-screen h-screen object-cover opacity-50 z-0"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        loading="lazy"
        style={{
          filter: 'brightness(1.05) contrast(1.05)',
          willChange: 'transform'
        }}
      >
        <source src="https://i.imgur.com/E490BLn.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-noir-black/40 via-noir-black/50 to-noir-black z-0"></div>

      <section className="w-full pt-24 sm:pt-32 pb-12 sm:pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold noir-text-secondary">
                The Future of SmartChain
              </h1>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl noir-text-secondary max-w-4xl mx-auto">
              Building the most powerful crypto intelligence platform for the next generation of traders
            </p>
          </div>

          <div className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold noir-text-secondary mb-4 sm:mb-6">Our Vision</h2>
            <p className="text-base sm:text-lg noir-text-secondary leading-relaxed mb-4">
              SmartChain is revolutionizing crypto trading by providing real-time intelligence that was previously only available to institutional investors. Our mission is to democratize access to smart money movements and give every trader the tools they need to succeed.
            </p>
            <p className="text-base sm:text-lg noir-text-secondary leading-relaxed">
              We're building a comprehensive ecosystem that combines on-chain analytics, AI-powered insights, and social trading features to create the ultimate platform for crypto intelligence. Our goal is to become the industry standard for tracking whale movements, discovering early opportunities, and executing profitable trades.
            </p>
          </div>

          <div className="mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold noir-text-secondary text-center mb-8 sm:mb-12">
              Upcoming Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-white mb-4">{feature.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold noir-text-secondary mb-3">{feature.title}</h3>
                  <p className="noir-text-secondary text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold noir-text-secondary text-center mb-8 sm:mb-12">
              Development Roadmap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {roadmapItems.map((quarter, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{quarter.quarter}</h3>
                    <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                      quarter.status === 'In Progress'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {quarter.status}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {quarter.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
                        <span className="noir-text-secondary text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm border-2 border-white/30 rounded-3xl p-8 sm:p-10 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold noir-text-secondary mb-4 sm:mb-6">
              Join Us on This Journey
            </h2>
            <p className="text-base sm:text-lg md:text-xl noir-text-secondary mb-6 sm:mb-8 max-w-3xl mx-auto">
              Be part of the revolution in crypto trading intelligence. Get early access to new features, provide feedback, and help shape the future of SmartChain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/app/kol-feed"
                className="noir-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base sm:text-lg font-semibold transition-all h-12 sm:h-14 px-8 sm:px-10 w-full sm:w-auto"
              >
                Get Started Now
              </Link>
              <a
                href="/#plans"
                className="bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base sm:text-lg font-semibold transition-all h-12 sm:h-14 px-8 sm:px-10 border border-white/20 w-full sm:w-auto"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Futures;
