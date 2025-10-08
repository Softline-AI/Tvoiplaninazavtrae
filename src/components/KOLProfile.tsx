import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, X } from 'lucide-react';

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

const KOLProfile: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trades' | 'dca' | 'pnl'>('portfolio');

  const mockKOL = {
    name: 'Yenni',
    twitter: 'Yennii56',
    followers: '81.4K',
    walletAddress: '5B52w1ZW9tuwUduueP5J7HXz5AcGfruGoX6YoAudvyxG',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
  };

  const mockHoldings: TokenHolding[] = [
    {
      name: 'SOL',
      symbol: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      value: '$77.82',
      amount: '0.5272',
      mcap: 'N/A',
      verified: false,
    },
    {
      name: 'LAUNCHCOIN',
      symbol: 'LAUNCHCOIN',
      address: 'Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk',
      value: '$1.44M',
      amount: '10.0269M',
      mcap: '$104.52M',
      verified: true,
    },
    {
      name: 'House',
      symbol: 'House',
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

  return (
    <div className="w-full mx-auto max-w-screen-2xl px-4 py-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="bg-white border border-white/20 rounded-xl overflow-hidden shadow-lg relative min-w-[300px]">
            <div className="absolute bottom-2 right-2 opacity-10 pointer-events-none"></div>
            <div className="p-6 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex flex-col">
                <div className="flex justify-center mb-8">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-blue-100 blur-md opacity-30 transform scale-110"></div>
                      <div className="w-28 h-28 border-3 border-white shadow-md relative z-10 rounded-full overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          alt={mockKOL.name}
                          src={mockKOL.avatar}
                        />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20">
                        <a
                          href={`https://x.com/${mockKOL.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:opacity-80 transition-opacity"
                        >
                          <div className="bg-gray-800 px-3 py-1 rounded-full shadow-lg flex items-baseline text-xs">
                            <span className="font-semibold mr-1 text-white">{mockKOL.followers}</span>
                            <span className="text-white">followers</span>
                          </div>
                        </a>
                      </div>
                    </div>
                    <div className="ml-5 mt-3">
                      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                        {mockKOL.name}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg py-4 px-6 w-full shadow-sm border border-gray-100">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-blue-500 mr-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z" />
                        </svg>
                      </span>
                      <div className="text-2xl font-bold text-gray-900">$1.87M</div>
                    </div>
                    <div className="text-sm text-gray-600">Total Portfolio Value</div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 items-center mb-5">
                  <a
                    href={`https://solscan.io/account/${mockKOL.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:opacity-80 transition-opacity flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm border border-gray-100 h-9 w-9"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-700" />
                  </a>
                  <a
                    href={`https://x.com/${mockKOL.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:opacity-80 transition-opacity flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm border border-gray-100 h-9 w-9"
                  >
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => copyToClipboard(mockKOL.walletAddress)}
                    className="px-2 py-1.5 hover:opacity-80 transition-opacity flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm border border-gray-100 text-gray-600 h-9"
                  >
                    <Copy className="w-5 h-5 mr-1.5" />
                    <span className="text-xs font-mono whitespace-nowrap">
                      {mockKOL.walletAddress.slice(0, 4)}...{mockKOL.walletAddress.slice(-4)}
                    </span>
                  </button>
                </div>

                <div className="mt-4 flex justify-center">
                  <a
                    href="https://stalkchain.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <span>Powered by</span>
                    <span className="font-semibold ml-1">Stalkchain</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-3/4 flex flex-col gap-2">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex flex-wrap gap-4 max-w-full overflow-x-auto pb-2 sm:pb-0 mb-2">
                  <div className="inline-flex mt-4">
                    <div className="flex h-fit gap-2 items-center flex-nowrap overflow-x-scroll scrollbar-hide rounded-lg bg-gray-50 border border-gray-300 p-0.5 mb-1">
                      <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activeTab === 'portfolio'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Portfolio
                      </button>
                      <button
                        onClick={() => setActiveTab('trades')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activeTab === 'trades'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Trades
                      </button>
                      <button
                        onClick={() => setActiveTab('dca')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activeTab === 'dca'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        DCA
                      </button>
                      <button
                        onClick={() => setActiveTab('pnl')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activeTab === 'pnl'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        PNL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'portfolio' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="space-y-4">
                  <div className="w-full">
                    <input
                      type="text"
                      placeholder="Search tokens by name, ticker, or address..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {mockHoldings.map((holding) => (
                      <div
                        key={holding.address}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-fit flex items-center rounded-md p-0">
                            <div className="flex items-center min-w-[100px] p-2">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center border border-gray-300">
                                <span className="text-gray-700 font-bold text-xs">
                                  {holding.symbol.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex flex-col ml-2 text-left">
                                <span className="text-sm font-medium flex items-center gap-1">
                                  {holding.symbol}
                                  {holding.verified && (
                                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  MC <span className="text-gray-600 font-bold">{holding.mcap}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-sm text-black font-medium block truncate">
                              {holding.value}
                            </span>
                            <span className="text-xs text-gray-500">{holding.amount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
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
                          <span className="text-sm font-medium text-gray-800">{trade.holdings}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === 'dca' || activeTab === 'pnl') && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">
                {activeTab === 'dca' ? 'DCA data coming soon...' : 'PNL analytics coming soon...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KOLProfile;
