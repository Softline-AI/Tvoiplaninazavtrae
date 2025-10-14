import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Search, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

interface TokenHolding {
  name: string;
  symbol: string;
  address: string;
  value: string;
  amount: string;
  mcap: string;
  verified: boolean;
  image: string;
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
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trades' | 'dca' | 'pnl' | 'copy'>('portfolio');
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
        name: 'Cented',
        twitter: 'cented',
        followers: '456.4K',
        walletAddress: walletAddress || '',
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      });
    }
  }, [walletAddress]);

  const mockHoldings: TokenHolding[] = [
    {
      name: 'Solana',
      symbol: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      value: '$77.82',
      amount: '0.5272',
      mcap: '$85.2B',
      verified: true,
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      name: 'LAUNCHCOIN',
      symbol: 'LAUNCH',
      address: 'Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk',
      value: '$1.44M',
      amount: '10.0269M',
      mcap: '$104.52M',
      verified: true,
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      name: 'House',
      symbol: 'HOUSE',
      address: 'DitHyRMQiSDhn5cnKMJV2CDDt6sVct96YrECiM49pump',
      value: '$291.91K',
      amount: '9.7083M',
      mcap: '$7.29M',
      verified: false,
      image: 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    },
    {
      name: 'Jupiter',
      symbol: 'JUP',
      address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      value: '$15.8K',
      amount: '12,543',
      mcap: '$1.8B',
      verified: true,
      image: 'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-screen-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div
                  className="text-xl font-bold text-gray-900 cursor-pointer"
                  onClick={() => navigate('/app/home')}
                >
                  Stalk<span className="font-normal">Chain</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Support
                  </a>
                  <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Docs
                  </a>
                  <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    X
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for token, wallet or KOL"
                    className="pl-10 pr-20 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300 w-80"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">cmd K</span>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                  Login
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-6">
          <div className="flex gap-6">
            <div className="w-80 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <img
                      src={kolData.avatar}
                      alt={kolData.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gray-900 px-3 py-1 rounded-full">
                        <span className="text-xs text-white font-medium">{kolData.followers} followers</span>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-6">{kolData.name}</h1>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-2xl font-bold text-gray-900">$86.32K</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">(413.41 SOL)</div>
                  </div>

                  <div className="flex items-center gap-3 w-full justify-center mb-4">
                    <a
                      href={`https://x.com/${kolData.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={`https://solscan.io/account/${kolData.walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-700" />
                    </a>
                    <button
                      onClick={() => copyToClipboard(kolData.walletAddress)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-700" />
                      <span className="text-xs font-mono text-gray-700">
                        Cyet...a54o
                      </span>
                    </button>
                  </div>

                  <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors mb-3 flex items-center justify-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>

                  <div className="text-xs text-gray-400 text-center">
                    Powered by <span className="text-gray-600 font-medium">Stalkchain</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <div className="flex items-center gap-8">
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'portfolio'
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Portfolio
                      {activeTab === 'portfolio' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('trades')}
                      className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'trades'
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Trades
                      {activeTab === 'trades' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('dca')}
                      className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'dca'
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      DCA
                      {activeTab === 'dca' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('pnl')}
                      className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'pnl'
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      PNL
                      {activeTab === 'pnl' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('copy')}
                      className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'copy'
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Copy Traders
                      {activeTab === 'copy' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'portfolio' && (
                <div>
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                            All Tokens
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">{mockHoldings.length}</span> tokens
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {mockHoldings.map((holding, index) => (
                        <div
                          key={holding.address}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                                <img
                                  src={holding.image}
                                  alt={holding.symbol}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{holding.symbol}</span>
                                  {holding.verified && (
                                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">MC {holding.mcap}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{holding.value}</div>
                              <div className="text-xs text-gray-500">{holding.amount}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trades' && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bought</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holdings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockTrades.map((trade) => (
                        <tr key={trade.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`text-sm font-bold uppercase ${
                                  trade.type === 'buy' ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {trade.type}
                              </span>
                              <span className="text-xs text-gray-500">{trade.timeAgo} ago</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{trade.token}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-green-600">{trade.bought}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-red-600">{trade.sold}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`text-sm font-semibold ${
                                  trade.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {trade.pnl}
                              </span>
                              <span
                                className={`text-xs ${
                                  trade.pnl.startsWith('+') ? 'text-green-600/70' : 'text-red-600/70'
                                }`}
                              >
                                {trade.pnlPercentage}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{trade.holdings}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(activeTab === 'dca' || activeTab === 'pnl' || activeTab === 'copy') && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
                      <p className="text-sm text-gray-600 mb-4 max-w-md">
                        Create a free account to view detailed portfolio holdings and track token balances.
                      </p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                        Login / Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLProfile;
