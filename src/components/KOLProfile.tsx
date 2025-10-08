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
    <div className="h-svh flex flex-col bg-white">
      <nav className="flex z-40 w-full h-auto items-center justify-center border-b-2 border-gray-100 bg-white" style={{ '--navbar-height': '42px' } as React.CSSProperties}>
        <header className="z-40 flex px-6 gap-4 w-full flex-row relative flex-nowrap items-center justify-between h-[var(--navbar-height)] max-w-full">
          <ul className="h-full flex-row flex-nowrap items-center flex flex-1 gap-8">
            <li className="flex basis-0 flex-row flex-grow flex-nowrap justify-start bg-transparent items-center no-underline text-medium whitespace-nowrap box-border gap-3 max-w-fit mr-3">
              <a href="/" className="relative inline-flex items-center text-gray-900 no-underline hover:opacity-80 transition-opacity">
                <svg fill="none" height="23" viewBox="0 0 132 23" xmlns="http://www.w3.org/2000/svg" className="text-inherit h-5">
                  <path clipRule="evenodd" d="M7.25 22.3C5.05 22.3 3.31 21.74 2.03 20.62C0.75 19.5 0.11 17.85 0.11 15.67H4.07C4.07 16.85 4.3 17.66 4.76 18.1C5.24 18.52 6.07 18.73 7.25 18.73H7.43C8.57 18.73 9.37 18.56 9.83 18.22C10.31 17.88 10.55 17.26 10.55 16.36C10.55 15.82 10.37 15.37 10.01 15.01C9.65 14.63 9.21 14.33 8.69 14.11C8.17 13.87 7.48 13.62 6.62 13.36C6.18 13.24 5.86 13.14 5.66 13.06C5.46 12.98 5.26 12.91 5.06 12.85C4.86 12.77 4.67 12.69 4.49 12.61C3.47 12.17 2.66 11.68 2.06 11.14C1.46 10.6 1.03 9.99 0.77 9.31C0.53 8.63 0.42 7.83 0.44 6.91C0.46 5.09 1.08 3.69 2.3 2.71C3.52 1.73 5.05 1.24 6.89 1.24H7.07C9.23 1.24 10.92 1.8 12.14 2.92C13.38 4.04 14 5.7 14 7.9H10.04C10.04 7.06 9.95 6.42 9.77 5.98C9.59 5.54 9.29 5.24 8.87 5.08C8.45 4.9 7.85 4.81 7.07 4.81H6.89C6.09 4.81 5.48 4.98 5.06 5.32C4.66 5.64 4.46 6.17 4.46 6.91C4.46 7.41 4.57 7.83 4.79 8.17C5.01 8.49 5.31 8.77 5.69 9.01C6.07 9.23 6.55 9.43 7.13 9.61C7.23 9.65 7.33 9.69 7.43 9.73C7.55 9.77 7.66 9.8 7.76 9.82C8 9.9 8.23 9.98 8.45 10.06C8.67 10.12 8.89 10.19 9.11 10.27C10.33 10.71 11.33 11.2 12.11 11.74C12.89 12.28 13.48 12.93 13.88 13.69C14.3 14.43 14.51 15.32 14.51 16.36C14.51 18.34 13.87 19.83 12.59 20.83C11.33 21.81 9.61 22.3 7.43 22.3H7.25ZM22.6213 22C21.1613 22 20.0013 21.57 19.1413 20.71C18.2813 19.85 17.8513 18.73 17.8513 17.35V3.43L21.8113 3.13V17.44C21.8113 17.86 21.8813 18.14 22.0213 18.28C22.1613 18.42 22.4613 18.49 22.9213 18.49H25.8013V22H22.6213ZM15.2713 10.27V6.76H25.7713V10.27H15.2713ZM32.1546 22.3C31.0946 22.3 30.2046 22.1 29.4846 21.7C28.7646 21.3 28.2246 20.77 27.8646 20.11C27.5046 19.43 27.3246 18.68 27.3246 17.86V17.74C27.3246 16.48 27.7446 15.49 28.5846 14.77C29.4246 14.05 30.7346 13.59 32.5146 13.39L37.0446 12.91L37.3146 15.64L33.1446 16.09C32.3646 16.17 31.8246 16.34 31.5246 16.6C31.2446 16.86 31.1046 17.2 31.1046 17.62V17.68C31.1046 18.1 31.2446 18.42 31.5246 18.64C31.8246 18.86 32.2546 18.97 32.8146 18.97H32.9346C34.2946 18.97 35.2046 18.66 35.6646 18.04C36.1246 17.42 36.3546 16.67 36.3546 15.79V12.79C36.3546 11.73 36.1646 11 35.7846 10.6C35.4046 10.18 34.8846 9.97 34.2246 9.97H34.1046C33.4846 9.97 32.9646 10.13 32.5446 10.45C32.1246 10.75 31.8846 11.36 31.8246 12.28H27.8346C28.0346 10.26 28.7146 8.79 29.8746 7.87C31.0346 6.93 32.4946 6.46 34.2546 6.46H34.3746C36.1946 6.46 37.6146 6.98 38.6346 8.02C39.6546 9.04 40.1646 10.6 40.1646 12.7V18.49H42.3546V22H36.6546L36.3546 20.2H35.9946C35.6746 20.9 35.2046 21.43 34.5846 21.79C33.9846 22.13 33.2146 22.3 32.2746 22.3H32.1546ZM44.1826 22V0.399999H48.1726V22H44.1826ZM51.2392 22V0.399999H55.2292V11.47H55.5892L59.5492 6.76H64.4692L54.2992 17.8L55.2292 15.49V22H51.2392ZM60.2392 22L55.8592 14.29L58.1992 11.56L64.6792 22H60.2392ZM73.0474 22.3C71.6874 22.3 70.5074 22.05 69.5074 21.55C68.5074 21.03 67.7274 20.22 67.1674 19.12C66.6074 18.02 66.3274 16.64 66.3274 14.98V8.56C66.3274 6.88 66.6074 5.5 67.1674 4.42C67.7274 3.32 68.5074 2.52 69.5074 2.02C70.5074 1.5 71.6874 1.24 73.0474 1.24H73.1974C74.5574 1.24 75.7374 1.5 76.7374 2.02C77.7574 2.52 78.5374 3.32 79.0774 4.42C79.6374 5.5 79.9174 6.88 79.9174 8.56H77.6974C77.6974 6.66 77.3274 5.31 76.5874 4.51C75.8474 3.69 74.7174 3.28 73.1974 3.28H73.0474C71.5074 3.28 70.3674 3.69 69.6274 4.51C68.9074 5.31 68.5474 6.66 68.5474 8.56V14.98C68.5474 16.88 68.9174 18.24 69.6574 19.06C70.3974 19.86 71.5274 20.26 73.0474 20.26H73.1974C74.7174 20.26 75.8474 19.86 76.5874 19.06C77.3274 18.24 77.6974 16.88 77.6974 14.98H79.9174C79.9174 16.64 79.6374 18.02 79.0774 19.12C78.5374 20.2 77.7574 21 76.7374 21.52C75.7374 22.04 74.5574 22.3 73.1974 22.3H73.0474ZM83.615 22V0.399999H85.835V9.67H86.105C86.485 8.87 87.035 8.24 87.755 7.78C88.475 7.3 89.295 7.06 90.215 7.06H90.335C91.835 7.06 92.965 7.56 93.725 8.56C94.485 9.54 94.865 10.98 94.865 12.88V22H92.645V12.97C92.645 11.61 92.415 10.63 91.955 10.03C91.515 9.43 90.815 9.13 89.855 9.13H89.735C88.615 9.13 87.685 9.48 86.945 10.18C86.205 10.88 85.835 11.96 85.835 13.42V22H83.615ZM102.685 22.3C101.925 22.3 101.195 22.16 100.495 21.88C99.8155 21.6 99.2555 21.17 98.8155 20.59C98.3755 20.01 98.1555 19.28 98.1555 18.4V18.22C98.1555 17 98.6055 16.08 99.5055 15.46C100.405 14.82 101.745 14.38 103.525 14.14L108.565 13.48L108.805 15.25L103.855 15.91C102.595 16.09 101.685 16.36 101.125 16.72C100.585 17.06 100.315 17.55 100.315 18.19V18.37C100.315 18.97 100.545 19.45 101.005 19.81C101.485 20.15 102.145 20.32 102.985 20.32H103.105C104.585 20.32 105.725 19.95 106.525 19.21C107.345 18.47 107.755 17.23 107.755 15.49V12.79C107.755 11.57 107.495 10.65 106.975 10.03C106.455 9.39 105.655 9.07 104.575 9.07H104.455C103.355 9.07 102.525 9.33 101.965 9.85C101.425 10.35 101.115 11.12 101.035 12.16H98.7255C98.8255 10.56 99.3855 9.31 100.405 8.41C101.445 7.51 102.815 7.06 104.515 7.06H104.605C106.365 7.06 107.685 7.56 108.565 8.56C109.465 9.56 109.915 11 109.915 12.88V19.99H112.165V22H107.935L107.755 19.75H107.455C107.075 20.55 106.495 21.18 105.715 21.64C104.935 22.08 103.965 22.3 102.805 22.3H102.685ZM114.215 3.55V0.76H117.035V3.55H114.215ZM114.515 22V7.36H116.735V22H114.515ZM120.722 22V7.36H122.942V9.67H123.212C123.592 8.87 124.142 8.24 124.862 7.78C125.582 7.3 126.402 7.06 127.322 7.06H127.442C128.942 7.06 130.072 7.56 130.832 8.56C131.592 9.54 131.972 10.98 131.972 12.88V22H129.752V12.97C129.752 11.61 129.522 10.63 129.062 10.03C128.622 9.43 127.922 9.13 126.962 9.13H126.842C125.722 9.13 124.792 9.48 124.052 10.18C123.312 10.88 122.942 11.96 122.942 13.42V22H120.722Z" fill="currentColor" />
                </svg>
              </a>
            </li>
            <li className="text-medium whitespace-nowrap hidden md:flex md:items-center">
              <a href="https://stalkchain.freshdesk.com/" target="_blank" rel="noopener noreferrer" className="text-gray-900 no-underline hover:opacity-80 transition-opacity text-[15px]">
                Support
              </a>
            </li>
            <li className="text-medium whitespace-nowrap hidden md:flex md:items-center">
              <a href="https://docs.stalkchain.com/" target="_blank" rel="noopener noreferrer" className="text-gray-900 no-underline hover:opacity-80 transition-opacity text-[15px]">
                Docs
              </a>
            </li>
            <li className="text-medium whitespace-nowrap hidden md:flex md:items-center">
              <a href="https://twitter.com/StalkHQ" target="_blank" rel="noopener noreferrer" className="text-gray-900 no-underline hover:opacity-80 transition-opacity text-[15px]">
                <svg height="16" viewBox="0 0 512 512" width="16">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" stroke="currentColor" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white font-normal rounded-lg h-8 px-4 flex items-center cursor-pointer transition-colors">
              Login
            </a>
          </div>
        </header>
      </nav>

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
    </div>
  );
};

export default KOLProfile;
