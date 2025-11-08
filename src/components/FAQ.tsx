import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqItems: FAQItem[] = [
    {
      id: 'q1',
      question: 'What is SmartChain?',
      answer: 'SmartChain is a powerful crypto analytics platform that helps you track whale movements, discover early opportunities, and monitor insider trading patterns in real-time on the Solana blockchain.'
    },
    {
      id: 'q2',
      question: 'How does SmartChain work?',
      answer: 'SmartChain analyzes on-chain data and market patterns to identify promising opportunities. Our platform tracks successful crypto traders and whales, providing you with real-time insights into their trading activities and potential market movements.'
    },
    {
      id: 'q3',
      question: 'What features does SmartChain offer?',
      answer: 'SmartChain offers a comprehensive suite of tools including Live KOL Feed, Smart Money Tracker, Solana Tools, Wallet Finder, Cabal Finder, and Token Insiders. Premium members get access to additional features like Custom KOL Feed, Whales Open Orders tracking, and a private community.'
    },
    {
      id: 'q4',
      question: 'Is SmartChain suitable for beginners?',
      answer: 'Yes! SmartChain is designed with an intuitive interface that makes it accessible for beginners while providing powerful insights for experienced traders. Our platform includes helpful documentation and guides to get you started.'
    },
    {
      id: 'q5',
      question: 'What subscription plans are available?',
      answer: 'SmartChain offers three subscription tiers: Free ($0/month) with basic features, Pro ($199/month or $159/month billed yearly), and Legend ($399/month or $319/month billed yearly) with full access to all premium features including API access and 1-on-1 support. Save 20% with annual billing.'
    },
    {
      id: 'q6',
      question: 'How do I cancel my membership?',
      answer: 'You can cancel your membership at any time from your account settings. Simply navigate to the billing section and click on "Cancel Subscription". Your access will continue until the end of your current billing period.'
    },
    {
      id: 'q7',
      question: 'What makes SmartChain different?',
      answer: 'SmartChain combines real-time data analysis, whale tracking, and pattern recognition to give you an edge in the crypto market. Our platform helps you identify opportunities before they go viral, backed by actual on-chain data and sophisticated tracking algorithms.'
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
    <section className="w-full max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl noir-text-secondary">
          Everything you need to know about SmartChain
        </p>
      </div>

      <div className="border border-white/20 rounded-2xl overflow-hidden bg-noir-dark/50 backdrop-blur-sm">
        {faqItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <hr className="border-white/10" />
            )}
            <div className="text-base">
              <button
                onClick={() => toggleItem(item.id)}
                className="flex py-5 px-6 w-full items-center gap-4 text-left transition-all hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-expanded={openItems.has(item.id)}
              >
                <div className="flex-1">
                  <span className="text-white text-lg font-medium">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-white/60 transition-transform duration-300 flex-shrink-0 ${
                    openItems.has(item.id) ? '-rotate-180' : ''
                  }`}
                />
              </button>

              {openItems.has(item.id) && (
                <div className="px-6 pb-5 noir-text-secondary text-base leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
