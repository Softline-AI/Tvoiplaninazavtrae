import React, { useState } from 'react';
import { BookOpen, TrendingUp, Search, Users, Wallet, Target, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
}

const LearningCenter: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string>('getting-started');

  const guides: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with SmartChain',
      icon: <BookOpen className="w-6 h-6" />,
      content: [
        'Welcome to SmartChain - your crypto intelligence platform for tracking smart money movements on Solana.',
        'Start by exploring the KOL Feed to see real-time transactions from influential traders and whales.',
        'Use the navigation sidebar to access different tools and features based on your subscription plan.',
        'Bookmark wallets and tokens you want to track closely for quick access later.'
      ]
    },
    {
      id: 'kol-feed',
      title: 'Understanding KOL Feed',
      icon: <TrendingUp className="w-6 h-6" />,
      content: [
        'The KOL Feed shows real-time transactions from Key Opinion Leaders (KOLs) and influential wallets in the crypto space.',
        'Each transaction displays the token traded, amount, price impact, and timing.',
        'Click on any KOL profile to see their full transaction history and success rate.',
        'Filter by token, transaction type (buy/sell), or time period to focus on specific activities.',
        'Pro tip: Watch for multiple KOLs buying the same token - this often signals an emerging trend.'
      ]
    },
    {
      id: 'wallet-finder',
      title: 'Using Wallet Finder',
      icon: <Search className="w-6 h-6" />,
      content: [
        'Wallet Finder helps you discover and track successful wallets based on their performance metrics.',
        'Search by wallet address or filter by profitability, win rate, and volume.',
        'Analyze wallet history to understand their trading patterns and strategies.',
        'Add promising wallets to your watchlist for continuous monitoring.',
        'Use the comparison feature to see how different wallets perform against each other.'
      ]
    },
    {
      id: 'cabal-finder',
      title: 'Cabal Finder & Insider Detection',
      icon: <Users className="w-6 h-6" />,
      content: [
        'Cabal Finder identifies coordinated trading groups and insider networks.',
        'Spot patterns where multiple wallets trade the same token at similar times.',
        'Detect potential pump schemes before they happen by analyzing group behavior.',
        'Track insider wallets that consistently profit from early token movements.',
        'Available for Pro and Legend subscribers.'
      ]
    },
    {
      id: 'token-analysis',
      title: 'Token Analysis Tools',
      icon: <Target className="w-6 h-6" />,
      content: [
        'Top Tokens shows the most traded tokens by KOLs with volume and price metrics.',
        'Daily Trends highlights tokens with unusual activity or sudden volume spikes.',
        'Top KOL Tokens displays which tokens have the most KOL attention.',
        'Click any token to see detailed analytics including holder distribution and transaction history.',
        'Use sentiment indicators to gauge market mood around specific tokens.'
      ]
    },
    {
      id: 'alerts',
      title: 'Smart Alerts & Notifications',
      icon: <AlertCircle className="w-6 h-6" />,
      content: [
        'Set up custom alerts for wallet activities, token movements, or price changes.',
        'Get notified when tracked KOLs make significant trades.',
        'Receive alerts when new wallets enter your watchlist tokens.',
        'Priority alerts available for Legend members with faster notification delivery.',
        'Configure alert thresholds to match your trading strategy.'
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: <Wallet className="w-6 h-6" />,
      content: [
        'Always verify information from multiple sources before making investment decisions.',
        'Use SmartChain as one tool in your research process, not the only one.',
        'Start with a small watchlist and expand as you learn the platform.',
        'Pay attention to transaction timing - early entries often indicate insider knowledge.',
        'Remember: Past performance does not guarantee future results.',
        'Join the Legend Community to learn from experienced traders.'
      ]
    }
  ];

  const features = [
    {
      title: 'Live KOL Feed',
      description: 'Track real-time transactions from influential crypto traders',
      plan: 'Free'
    },
    {
      title: 'Smart Money Tracker',
      description: 'Monitor whale wallets and big money movements',
      plan: 'Free'
    },
    {
      title: 'Wallet Finder',
      description: 'Discover profitable wallets to follow',
      plan: 'Free'
    },
    {
      title: 'Token Insiders',
      description: 'Identify insider trading patterns',
      plan: 'Free'
    },
    {
      title: 'Cabal Finder',
      description: 'Detect coordinated trading groups',
      plan: 'Pro'
    },
    {
      title: 'Fresh Wallet Feeds',
      description: 'Track newly created wallets making moves',
      plan: 'Pro'
    },
    {
      title: 'Custom KOL Feed',
      description: 'Create your own KOL watchlist',
      plan: 'Pro'
    },
    {
      title: 'Insider Scan',
      description: 'Advanced insider detection algorithms',
      plan: 'Pro'
    },
    {
      title: 'API Access',
      description: 'Integrate SmartChain data into your tools',
      plan: 'Legend'
    },
    {
      title: 'Priority Alerts',
      description: 'Get notified first about important movements',
      plan: 'Legend'
    },
    {
      title: 'Private Community',
      description: 'Access to exclusive trader community',
      plan: 'Legend'
    },
    {
      title: '1-on-1 Support',
      description: 'Personal assistance from our team',
      plan: 'Legend'
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? '' : id);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Center</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Master SmartChain and learn how to track smart money, discover opportunities, and make informed trading decisions
          </p>
        </div>

        {/* Quick Start */}
        <div className="mb-16 p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white/40">01</div>
              <h3 className="font-semibold text-lg">Explore KOL Feed</h3>
              <p className="text-gray-400 text-sm">Start by browsing real-time transactions from top traders</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white/40">02</div>
              <h3 className="font-semibold text-lg">Find Wallets</h3>
              <p className="text-gray-400 text-sm">Use Wallet Finder to discover successful trading profiles</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white/40">03</div>
              <h3 className="font-semibold text-lg">Track & Learn</h3>
              <p className="text-gray-400 text-sm">Monitor their moves and understand winning strategies</p>
            </div>
          </div>
        </div>

        {/* Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Platform Guides</h2>
          <div className="space-y-4">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all hover:border-white/20"
              >
                <button
                  onClick={() => toggleSection(guide.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      {guide.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{guide.title}</h3>
                  </div>
                  {expandedSection === guide.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSection === guide.id && (
                  <div className="px-6 pb-6 space-y-3">
                    {guide.content.map((paragraph, idx) => (
                      <p key={idx} className="text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Features Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      feature.plan === 'Free'
                        ? 'bg-green-500/20 text-green-400'
                        : feature.plan === 'Pro'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {feature.plan}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">💡</span>
            Pro Tips
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span className="text-gray-300">
                Follow multiple KOLs with different trading styles to diversify your insights
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span className="text-gray-300">
                Pay attention to KOL consensus - when several successful traders buy the same token
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span className="text-gray-300">
                Use Cabal Finder to avoid pump and dump schemes by identifying coordinated groups
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span className="text-gray-300">
                Set up alerts for your favorite wallets to never miss important moves
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1">•</span>
              <span className="text-gray-300">
                Join the Legend Community to learn advanced strategies from experienced traders
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;
