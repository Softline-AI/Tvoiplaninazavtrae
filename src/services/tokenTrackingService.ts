import { supabase } from './supabaseClient';

export interface TrackedToken {
  id: string;
  user_id: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  network: string;
  price_alert_enabled: boolean;
  price_threshold_percent: number;
  transaction_alert_enabled: boolean;
  current_price: number;
  tracked_since: string;
  last_alert_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenSearchResult {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  v24hUSD?: number;
  mc?: number;
}

class TokenTrackingService {
  private readonly BIRDEYE_API_KEY = import.meta.env.VITE_BIRDEYE_API_KEY;
  private readonly BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

  async searchTokens(query: string, network: string = 'solana'): Promise<TokenSearchResult[]> {
    try {
      const response = await fetch(
        `${this.BIRDEYE_BASE_URL}/defi/token_search?chain=${network}&search_term=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-API-KEY': this.BIRDEYE_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  async getTokenPrice(tokenAddress: string, network: string = 'solana'): Promise<number> {
    try {
      const response = await fetch(
        `${this.BIRDEYE_BASE_URL}/defi/price?address=${tokenAddress}&chain=${network}`,
        {
          headers: {
            'X-API-KEY': this.BIRDEYE_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.value || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  async addTrackedToken(token: {
    token_address: string;
    token_symbol: string;
    token_name: string;
    network?: string;
    price_threshold_percent?: number;
  }): Promise<TrackedToken | null> {
    try {
      const currentPrice = await this.getTokenPrice(token.token_address, token.network || 'solana');

      const { data, error } = await supabase
        .from('tracked_tokens')
        .insert({
          token_address: token.token_address,
          token_symbol: token.token_symbol,
          token_name: token.token_name,
          network: token.network || 'solana',
          current_price: currentPrice,
          price_threshold_percent: token.price_threshold_percent || 5.0,
          is_active: true,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error adding tracked token:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addTrackedToken:', error);
      return null;
    }
  }

  async getTrackedTokens(): Promise<TrackedToken[]> {
    try {
      const { data, error } = await supabase
        .from('tracked_tokens')
        .select('*')
        .eq('is_active', true)
        .order('tracked_since', { ascending: false });

      if (error) {
        console.error('Error fetching tracked tokens:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTrackedTokens:', error);
      return [];
    }
  }

  async updateTrackedToken(id: string, updates: Partial<TrackedToken>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tracked_tokens')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating tracked token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTrackedToken:', error);
      return false;
    }
  }

  async removeTrackedToken(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tracked_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error removing tracked token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeTrackedToken:', error);
      return false;
    }
  }

  async checkPriceAlerts(trackedTokens: TrackedToken[]): Promise<{
    token: TrackedToken;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
  }[]> {
    const alerts: {
      token: TrackedToken;
      oldPrice: number;
      newPrice: number;
      changePercent: number;
    }[] = [];

    for (const token of trackedTokens) {
      if (!token.price_alert_enabled) continue;

      const newPrice = await this.getTokenPrice(token.token_address, token.network);
      const oldPrice = token.current_price;

      if (oldPrice > 0) {
        const changePercent = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);

        if (changePercent >= token.price_threshold_percent) {
          alerts.push({
            token,
            oldPrice,
            newPrice,
            changePercent,
          });

          await this.updateTrackedToken(token.id, {
            current_price: newPrice,
            last_alert_time: new Date().toISOString(),
          });
        }
      } else {
        await this.updateTrackedToken(token.id, {
          current_price: newPrice,
        });
      }
    }

    return alerts;
  }
}

export const tokenTrackingService = new TokenTrackingService();
