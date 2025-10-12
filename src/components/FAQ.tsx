import React, { useState } from 'react';
import { ChevronDown, TrendingUp, Shield, Zap, Users, Eye, Sparkles, Target } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
  gradient: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqItems: FAQItem[] = [
    {
      id: 'q1',
      question: 'What is SmartChain?',
      answer: 'SmartChain is a powerful crypto analytics platform that helps you track whale movements, discover early opportunities, and monitor insider trading patterns in real-time on the Solana blockchain.',
      icon: <Sparkles className="w-5 h-5" />,
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      id: 'q2',
      question: 'How does SmartChain work?',
      answer: 'SmartChain analyzes on-chain data and market patterns to identify promising opportunities. Our platform tracks successful crypto traders and whales, providing you with real-time insights into their trading activities and potential market movements.',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      id: 'q3',
      question: 'What features does SmartChain offer?',
      answer: 'SmartChain offers a comprehensive suite of tools including Live KOL Feed, Smart Money Tracker, Solana Tools, Wallet Finder, Cabal Finder, and Token Insiders. Premium members get access to additional features like Custom KOL Feed, Whales Open Orders tracking, and a private community.',
      icon: <Target className="w-5 h-5" />,
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      id: 'q4',
      question: 'Is SmartChain suitable for beginners?',
      answer: 'Yes! SmartChain is designed with an intuitive interface that makes it accessible for beginners while providing powerful insights for experienced traders. Our platform includes helpful documentation and guides to get you started.',
      icon: <Users className="w-5 h-5" />,
      gradient: 'from-pink-500/20 to-rose-500/20'
    },
    {
      id: 'q5',
      question: 'What subscription plans are available?',
      answer: 'SmartChain offers three subscription tiers: Free ($0/month) with basic features, Pro ($199/month or $159/month billed yearly), and Legend ($399/month or $319/month billed yearly) with full access to all premium features including API access and 1-on-1 support. Save 20% with annual billing.',
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: 'from-violet-500/20 to-purple-500/20'
    },
    {
      id: 'q6',
      question: 'How do I cancel my membership?',
      answer: 'You can cancel your membership at any time from your account settings. Simply navigate to the billing section and click on "Cancel Subscription". Your access will continue until the end of your current billing period.',
      icon: <Shield className="w-5 h-5" />,
      gradient: 'from-red-500/20 to-orange-500/20'
    },
    {
      id: 'q7',
      question: 'What makes SmartChain different?',
      answer: 'SmartChain combines real-time data analysis, whale tracking, and pattern recognition to give you an edge in the crypto market. Our platform helps you identify opportunities before they go viral, backed by actual on-chain data and sophisticated tracking algorithms.',
      icon: <Eye className="w-5 h-5" />,
      gradient: 'from-teal-500/20 to-cyan-500/20'
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Got Questions?</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-400">
          Everything you need to know about SmartChain
        </p>
      </div>

      <div className="grid gap-4">
        {faqItems.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? 'border-white/30 bg-gradient-to-br ' + item.gradient + ' backdrop-blur-sm'
                  : 'border-white/10 bg-black/40 backdrop-blur-sm hover:border-white/20'
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="flex py-6 px-6 w-full items-start gap-4 text-left transition-all focus:outline-none"
                aria-expanded={isOpen}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isOpen
                      ? 'bg-white/20 scale-110'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <div className={`transition-colors ${isOpen ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <span className={`text-lg font-semibold transition-colors ${
                    isOpen ? 'text-white' : 'text-gray-200 group-hover:text-white'
                  }`}>
                    {item.question}
                  </span>
                </div>

                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 mt-1 transition-all duration-300 ${
                    isOpen ? 'rotate-180 text-white' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pl-20">
                  <p className="text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>

              {isOpen && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
