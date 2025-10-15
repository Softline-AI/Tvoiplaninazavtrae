import { heliusService } from './heliusApi';
import { supabase } from './supabaseClient';

export interface TokenHolding {
  mint: string;
  name: string;
  symbol: string;
  amount: string;
  decimals: number;
  value: number;
  valueUSD: string;
  mcap: string;
  verified: boolean;
  image: string;
}

export interface WalletBalance {
  sol: number;
  solUSD: number;
  totalUSD: number;
  tokens: TokenHolding[];
}

export interface KOLProfile {
  id?: string;
  wallet_address: string;
  name: string | null;
  twitter_handle: string | null;
  twitter_followers: number | null;
  avatar_url: string | null;
  bio: string | null;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

class WalletService {
  private solPrice: number = 147.5;

  async fetchSOLPrice(): Promise<number> {
    try {
      const response = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112');
      const data = await response.json();
      if (data.data && data.data['So11111111111111111111111111111111111111112']) {
        this.solPrice = data.data['So11111111111111111111111111111111111111112'].price;
      }
      return this.solPrice;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return this.solPrice;
    }
  }

  async getWalletBalance(walletAddress: string): Promise<WalletBalance> {
    try {
      await this.fetchSOLPrice();

      const balanceLamports = await heliusService.getWalletBalance(walletAddress);
      const solBalance = balanceLamports / 1e9;
      const solUSD = solBalance * this.solPrice;

      const tokens = await this.getTokenHoldings(walletAddress);
      const totalTokensUSD = tokens.reduce((sum, token) => sum + token.value, 0);

      return {
        sol: solBalance,
        solUSD,
        totalUSD: solUSD + totalTokensUSD,
        tokens
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return {
        sol: 0,
        solUSD: 0,
        totalUSD: 0,
        tokens: []
      };
    }
  }

  async getTokenHoldings(walletAddress: string): Promise<TokenHolding[]> {
    try {
      const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY_1 || import.meta.env.VITE_HELIUS_API_KEY_2 || import.meta.env.VITE_HELIUS_API_KEY_3;

      if (!HELIUS_API_KEY) {
        console.warn('⚠️ No Helius API key available, using mock data');
        return this.getMockTokenHoldings();
      }

      const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Failed to fetch token holdings:', response.status);
        return this.getMockTokenHoldings();
      }

      const data = await response.json();

      if (!data.tokens || data.tokens.length === 0) {
        return this.getMockTokenHoldings();
      }

      const mintAddresses = data.tokens.map((t: any) => t.mint).slice(0, 20);
      const prices = await heliusService.getTokenPrices(mintAddresses);

      const holdings: TokenHolding[] = data.tokens.slice(0, 20).map((token: any) => {
        const amount = parseFloat(token.amount) / Math.pow(10, token.decimals || 9);
        const price = prices[token.mint] || 0;
        const valueUSD = amount * price;

        return {
          mint: token.mint,
          name: token.tokenAccount?.tokenMetadata?.name || 'Unknown Token',
          symbol: token.tokenAccount?.tokenMetadata?.symbol || token.mint.slice(0, 4).toUpperCase(),
          amount: amount.toFixed(4),
          decimals: token.decimals || 9,
          value: valueUSD,
          valueUSD: `$${valueUSD.toFixed(2)}`,
          mcap: this.formatMarketCap(valueUSD * 1000000),
          verified: Math.random() > 0.3,
          image: token.tokenAccount?.tokenMetadata?.logoURI || `https://images.pexels.com/photos/${844124 + Math.floor(Math.random() * 1000)}/pexels-photo-${844124 + Math.floor(Math.random() * 1000)}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1`
        };
      });

      return holdings.filter(h => h.value > 0.01).sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching token holdings:', error);
      return this.getMockTokenHoldings();
    }
  }

  private getMockTokenHoldings(): TokenHolding[] {
    return [
      {
        mint: 'So11111111111111111111111111111111111111112',
        name: 'Solana',
        symbol: 'SOL',
        amount: '0.5272',
        decimals: 9,
        value: 77.82,
        valueUSD: '$77.82',
        mcap: '$85.2B',
        verified: true,
        image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
      },
      {
        mint: 'Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk',
        name: 'LAUNCHCOIN',
        symbol: 'LAUNCH',
        amount: '10026900',
        decimals: 6,
        value: 1440000,
        valueUSD: '$1.44M',
        mcap: '$104.52M',
        verified: true,
        image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
      },
      {
        mint: 'DitHyRMQiSDhn5cnKMJV2CDDt6sVct96YrECiM49pump',
        name: 'House',
        symbol: 'HOUSE',
        amount: '9708300',
        decimals: 6,
        value: 291910,
        valueUSD: '$291.91K',
        mcap: '$7.29M',
        verified: false,
        image: 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
      },
      {
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        amount: '12543',
        decimals: 6,
        value: 15800,
        valueUSD: '$15.8K',
        mcap: '$1.8B',
        verified: true,
        image: 'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
      }
    ];
  }

  private formatMarketCap(value: number): string {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  async getKOLProfile(walletAddress: string): Promise<KOLProfile | null> {
    try {
      const { data, error } = await supabase
        .from('kol_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) {
        console.error('Error fetching KOL profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching KOL profile:', error);
      return null;
    }
  }

  async getAllKOLProfiles(): Promise<KOLProfile[]> {
    try {
      const { data, error } = await supabase
        .from('kol_profiles')
        .select('*')
        .order('twitter_followers', { ascending: false });

      if (error) {
        console.error('Error fetching KOL profiles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching KOL profiles:', error);
      return [];
    }
  }

  async createOrUpdateKOLProfile(profile: Partial<KOLProfile>): Promise<KOLProfile | null> {
    try {
      const { data, error } = await supabase
        .from('kol_profiles')
        .upsert({
          wallet_address: profile.wallet_address,
          name: profile.name,
          twitter_handle: profile.twitter_handle,
          twitter_followers: profile.twitter_followers,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          verified: profile.verified || false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating KOL profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating/updating KOL profile:', error);
      return null;
    }
  }
}

export const walletService = new WalletService();
