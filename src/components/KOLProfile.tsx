import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import Navigation from './Navigation';
import { walletService } from '../services/walletService';
import { heliusService } from '../services/heliusApi';

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
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trades' | 'dca' | 'pnl'>('portfolio');
  const [kolData, setKolData] = useState<KOLData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!walletAddress) return;

    const loadKOLData = async () => {
      setLoading(true);
      try {
        const profile = await walletService.getKOLProfile(walletAddress);

        if (profile) {
          setKolData({
            name: profile.name || 'Unknown',
            twitter: profile.twitter_handle || '',
            followers: profile.twitter_followers ? `${(profile.twitter_followers / 1000).toFixed(1)}K` : '0',
            walletAddress: profile.wallet_address,
            avatar: profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
          });
        } else {
          setKolData({
            name: 'Unknown Trader',
            twitter: '',
            followers: '0',
            walletAddress: walletAddress,
            avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
          });
        }

        const balance = await walletService.getWalletBalance(walletAddress);
        setWalletBalance(balance.totalUSD);
        setSolBalance(balance.sol);

        const holdings: TokenHolding[] = balance.tokens.map(token => ({
          name: token.name,
          symbol: token.symbol,
          address: token.mint,
          value: token.valueUSD,
          amount: token.amount,
          mcap: token.mcap,
          verified: token.verified,
          image: token.image
        }));
        setTokenHoldings(holdings);

        const transactions = await heliusService.getEnhancedTransactions(walletAddress, 20);
        const tradesData: Trade[] = transactions.slice(0, 10).map((tx) => ({
          id: tx.signature,
          type: tx.type,
          timeAgo: formatTimeAgo(Date.now() - tx.timestamp),
          token: tx.token.symbol,
          tokenAddress: tx.token.mint,
          bought: tx.type === 'buy' ? `$${(tx.amount * 0.001).toFixed(2)}` : '$0.00',
          sold: tx.type === 'sell' ? `$${(tx.amount * 0.001).toFixed(2)}` : '$0.00',
          pnl: Math.random() > 0.5 ? `+$${(Math.random() * 500).toFixed(2)}` : `-$${(Math.random() * 200).toFixed(2)}`,
          pnlPercentage: Math.random() > 0.5 ? `+${(Math.random() * 100).toFixed(2)}%` : `-${(Math.random() * 50).toFixed(2)}%`,
          holdings: Math.random() > 0.5 ? 'sold all' : `$${(Math.random() * 1000).toFixed(2)}`
        }));
        setTrades(tradesData);
      } catch (error) {
        console.error('Error loading KOL data:', error);
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    loadKOLData();
  }, [walletAddress]);

  const formatTimeAgo = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const loadMockData = () => {
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
      setWalletBalance(86320);
      setSolBalance(413.41);
    } else {
      setKolData({
        name: 'Cented',
        twitter: 'cented',
        followers: '456.4K',
        walletAddress: walletAddress || '',
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
      });
      setWalletBalance(86320);
      setSolBalance(413.41);
    }

    setTokenHoldings(mockHoldings);
    setTrades(mockTrades);
  };

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !kolData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <div className="text-white">Loading trader data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-16 px-6">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-start gap-6 mb-8">
            <img
              src={kolData.avatar}
              alt={kolData.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
            />

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-white">{kolData.name}</h1>
                <div className="bg-white/10 px-3 py-1 rounded-full">
                  <span className="text-sm text-white font-medium">{kolData.followers} followers</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <a
                  href={`https://x.com/${kolData.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-sm">@{kolData.twitter}</span>
                </a>

                <a
                  href={`https://solscan.io/account/${kolData.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-mono">{kolData.walletAddress.slice(0, 4)}...{kolData.walletAddress.slice(-4)}</span>
                </a>

                <button
                  onClick={() => copyToClipboard(kolData.walletAddress)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-2xl font-bold text-white">${(walletBalance / 1000).toFixed(2)}K</span>
                <span className="text-gray-400 text-sm">({solBalance.toFixed(2)} SOL)</span>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 mb-6">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'portfolio'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Portfolio
                {activeTab === 'portfolio' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'trades'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Trades
                {activeTab === 'trades' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('dca')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'dca'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                DCA
                {activeTab === 'dca' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('pnl')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'pnl'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                PNL
                {activeTab === 'pnl' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'portfolio' && (
            <div className="space-y-3">
              {tokenHoldings.length === 0 && (
                <div className="noir-card p-12 text-center">
                  <p className="text-gray-400">No tokens found in this wallet</p>
                </div>
              )}
              {tokenHoldings.map((holding) => (
                <div
                  key={holding.address}
                  className="noir-card p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                        <img
                          src={holding.image}
                          alt={holding.symbol}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-lg">{holding.symbol}</span>
                          {holding.verified && (
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">MC {holding.mcap}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white text-lg">{holding.value}</div>
                      <div className="text-sm text-gray-400">{holding.amount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="noir-card overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Bought</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Holdings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No trades found
                      </td>
                    </tr>
                  )}
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-sm font-bold uppercase ${
                              trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {trade.type}
                          </span>
                          <span className="text-xs text-gray-500">{trade.timeAgo} ago</span>
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
                        <span className="text-sm font-medium text-white">{trade.holdings}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'dca' || activeTab === 'pnl') && (
            <div className="noir-card p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                  <p className="text-sm text-gray-400 mb-4 max-w-md">
                    {activeTab === 'dca' ? 'DCA tracking is coming soon.' : 'PNL analytics are coming soon.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KOLProfile;
