import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Check } from 'lucide-react';

interface TokenHolding {
  name: string;
  symbol: string;
  address: string;
  value: string;
  amount: string;
  mcap: string;
  verified: boolean;
}

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  timeAgo: string;
  token: string;
  tokenAddress: string;
  bought: string;
  sold: string;
  pnl: string;
  pnlPercentage: string;
  holdings: string;
}

interface KOLData {
  name: string;
  twitter: string;
  followers: string;
  walletAddress: string;
  avatar: string;
}

const KOLProfile: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trades' | 'dca' | 'pnl'>('portfolio');
  const [kolData, setKolData] = useState<KOLData | null>(null);

  useEffect(() => {
    const mockKOLs: Record<string, KOLData> = {
      '5B52w1ZW9tuwUduueP5J7HXz5AcGfruGoX6YoAudvyxG': {
        name: 'Yenni',
        twitter: 'Yennii56',
        followers: '81.4K',
        walletAddress: '5B52w1ZW9tuwUduueP5J7HXz5AcGfruGoX6YoAudvyxG',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      },
      '9L76w2ZW9tuwUderuP5J7HZx5AcGfruGoX6YoAudvyxG': {
        name: 'Crypto Whale',
        twitter: 'cryptowhale',
        followers: '125.3K',
        walletAddress: '9L76w2ZW9tuwUderuP5J7HZx5AcGfruGoX6YoAudvyxG',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      },
      '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1': {
        name: 'Untaxxable',
        twitter: 'untaxxable',
        followers: '94.7K',
        walletAddress: '7NAd2EpYGGeFofpyvgehSXhH5vg6Ry6VRMW2Y6jiqCu1',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      },
      '8xKm3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR': {
        name: 'Crypto Bull',
        twitter: 'cryptobull',
        followers: '156.2K',
        walletAddress: '8xKm3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
        avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      },
      '9yLm4WZ5CptM6vsH3zpfR267KTenbnwm0L6geMxlQnbNS': {
        name: 'Whale Hunter',
        twitter: 'whalehunter',
        followers: '203.8K',
        walletAddress: '9yLm4WZ5CptM6vsH3zpfR267KTenbnwm0L6geMxlQnbNS',
        avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      },
    };

    if (walletAddress && mockKOLs[walletAddress]) {
      setKolData(mockKOLs[walletAddress]);
    } else {
      setKolData({
        name: 'Unknown Trader',
        twitter: 'unknown',
        followers: '0',
        walletAddress: walletAddress || '',
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      });
    }
  }, [walletAddress]);

  const mockHoldings: TokenHolding[] = [
    {
      name: 'SOL',
      symbol: 'SO',
      address: 'So11111111111111111111111111111111111111112',
      value: '$77.82',
      amount: '0.5272',
      mcap: 'N/A',
      verified: false,
    },
    {
      name: 'LAUNCHCOIN',
      symbol: 'LA',
      address: 'Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk',
      value: '$1.44M',
      amount: '10.0269M',
      mcap: '$104.52M',
      verified: true,
    },
    {
      name: 'House',
      symbol: 'HO',
      address: 'DitHyRMQiSDhn5cnKMJV2CDDt6sVct96YrECiM49pump',
      value: '$291.91K',
      amount: '9.7083M',
      mcap: '$7.29M',
      verified: true,
    },
  ];

  const mockTrades: Trade[] = [
    {
      id: '1',
      type: 'sell',
      timeAgo: '18s',
      token: 'DBA',
      tokenAddress: '5ToPP9Mq9H4fkRQ68V9knabtXDTbpjDLbikTgzwUpump',
      bought: '$439.42',
      sold: '$622.13',
      pnl: '+$182.71',
      pnlPercentage: '+41.58%',
      holdings: 'sold all',
    },
    {
      id: '2',
      type: 'buy',
      timeAgo: '1m',
      token: 'REALCOIN',
      tokenAddress: 'Ghrcrh9YgyU6baT3Wt5XNiQ7UXWNNYSZMEuCcauspump',
      bought: '$479.97',
      sold: '$2.24K',
      pnl: '+$2.32K',
      pnlPercentage: '+483.52%',
      holdings: '$563.68',
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!kolData) {
    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-black">
      <nav className="border-b border-white/10 bg-noir-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-2xl font-bold text-white tracking-tight">
                SMARTCHAIN
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="/" className="text-white/70 hover:text-white transition-colors text-sm">
                  Support
                </a>
                <a href="/" className="text-white/70 hover:text-white transition-colors text-sm">
                  Docs
                </a>
                <a href="/" className="text-white/70 hover:text-white transition-colors text-sm">
                  X
                </a>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Login
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={kolData.avatar}
                    alt={kolData.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-noir-black px-3 py-1 rounded-full border border-white/20">
                      <span className="text-xs text-white font-medium">{kolData.followers} followers</span>
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mt-4 mb-6">{kolData.name}</h1>

                <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z" />
                    </svg>
                    <span className="text-2xl font-bold text-white">$1.87M</span>
                  </div>
                  <div className="text-xs text-white/50 text-center">Total Portfolio Value</div>
                </div>

                <div className="flex items-center gap-2 w-full justify-center mb-4">
                  <a
                    href={`https://solscan.io/account/${kolData.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-white/70" />
                  </a>
                  <a
                    href={`https://x.com/${kolData.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => copyToClipboard(kolData.walletAddress)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/70" />
                    <span className="text-xs font-mono text-white/70">
                      {kolData.walletAddress.slice(0, 4)}...{kolData.walletAddress.slice(-4)}
                    </span>
                  </button>
                </div>

                <div className="text-xs text-white/40 text-center">
                  Powered by <span className="text-white/60">Stalkchain</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 w-fit">
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'portfolio'
                      ? 'bg-white text-noir-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveTab('trades')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'trades'
                      ? 'bg-white text-noir-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Trades
                </button>
                <button
                  onClick={() => setActiveTab('dca')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'dca'
                      ? 'bg-white text-noir-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  DCA
                </button>
                <button
                  onClick={() => setActiveTab('pnl')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'pnl'
                      ? 'bg-white text-noir-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  PNL
                </button>
              </div>
            </div>

            {activeTab === 'portfolio' && (
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search tokens by name, ticker, or address..."
                    className="w-full px-4 py-3 bg-noir-black border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mockHoldings.map((holding) => (
                    <div
                      key={holding.address}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {holding.symbol}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-white">{holding.symbol}</span>
                              {holding.verified && (
                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-white/50">MC {holding.mcap}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{holding.value}</div>
                          <div className="text-xs text-white/50">{holding.amount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">Token</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">Bought</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">P&L</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">Holdings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {mockTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-sm font-bold uppercase ${
                                trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {trade.type}
                            </span>
                            <span className="text-xs text-white/50">{trade.timeAgo} ago</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-white">{trade.token}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-500">{trade.bought}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-red-500">{trade.sold}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`text-sm font-semibold ${
                                trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {trade.pnl}
                            </span>
                            <span
                              className={`text-xs ${
                                trade.pnl.startsWith('+') ? 'text-green-500/70' : 'text-red-500/70'
                              }`}
                            >
                              {trade.pnlPercentage}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-white/80">{trade.holdings}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'dca' || activeTab === 'pnl') && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                <p className="text-white/50">
                  {activeTab === 'dca' ? 'DCA data coming soon...' : 'PNL analytics coming soon...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLProfile;
