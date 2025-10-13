import { createClient } from '@supabase/supabase-js';
import { heliusTransactionService, ParsedTransaction } from './heliusTransactions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WebhookTransaction {
  id: string;
  transaction_signature: string;
  block_time: string;
  from_address: string;
  to_address: string;
  amount: number;
  token_mint: string;
  token_symbol: string | null;
  transaction_type: string;
  category: string;
  fee: number | null;
  created_at: string;
}

export const webhookService = {
  async getTransactionsByCategory(category: string, limit: number = 50): Promise<WebhookTransaction[]> {
    const startTime = Date.now();
    try {
      console.log(`[Webhook] 🔍 Fetching ${limit} transactions for category: ${category}`);
      const { data, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .eq('category', category)
        .order('block_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error(`[Webhook] ❌ Supabase error for category ${category}:`, error);
        console.log('[Webhook] 🔄 Falling back to Helius API...');
        return this.getFallbackData(category, limit);
      }

      if (!data || data.length === 0) {
        const duration = Date.now() - startTime;
        console.log(`[Webhook] ⚠️ No webhook data for ${category} after ${duration}ms, using Helius API...`);
        return this.getFallbackData(category, limit);
      }

      const duration = Date.now() - startTime;
      console.log(`[Webhook] ✅ Fetched ${data.length} transactions for ${category} in ${duration}ms`);
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Webhook] ❌ Error in getTransactionsByCategory after ${duration}ms:`, error);
      return this.getFallbackData(category, limit);
    }
  },

  async getFallbackData(category: string, limit: number): Promise<WebhookTransaction[]> {
    console.log(`[Webhook] 🔄 Using Helius fallback for category: ${category}`);
    let heliusData: ParsedTransaction[] = [];

    switch (category) {
      case 'trading':
        heliusData = await heliusTransactionService.getTradingActivity(limit);
        break;
      case 'staking':
        heliusData = await heliusTransactionService.getStakingActivity(limit);
        break;
      case 'liquidity':
        heliusData = await heliusTransactionService.getLiquidityActivity(limit);
        break;
      case 'fresh_wallet':
        heliusData = await heliusTransactionService.getFreshWallets(limit);
        break;
      default:
        const allTxs = await heliusTransactionService.getRecentTransactions(limit);
        heliusData = await heliusTransactionService.parseTransactions(allTxs);
    }

    console.log(`[Webhook] ✅ Fallback returned ${heliusData.length} transactions for ${category}`);
    return heliusData.map((tx) => ({
      id: tx.signature,
      transaction_signature: tx.signature,
      block_time: new Date(tx.timestamp * 1000).toISOString(),
      from_address: tx.from,
      to_address: tx.to,
      amount: tx.amount,
      token_mint: tx.token,
      token_symbol: tx.tokenSymbol,
      transaction_type: tx.type,
      category: tx.category,
      fee: tx.fee,
      created_at: new Date(tx.timestamp * 1000).toISOString(),
    }));
  },

  async getFreshWallets(limit: number = 20): Promise<WebhookTransaction[]> {
    return this.getTransactionsByCategory('fresh_wallet', limit);
  },

  async getTradingActivity(limit: number = 50): Promise<WebhookTransaction[]> {
    return this.getTransactionsByCategory('trading', limit);
  },

  async getStakingActivity(limit: number = 30): Promise<WebhookTransaction[]> {
    return this.getTransactionsByCategory('staking', limit);
  },

  async getLiquidityActivity(limit: number = 30): Promise<WebhookTransaction[]> {
    return this.getTransactionsByCategory('liquidity', limit);
  },

  async getAllTransactions(limit: number = 100): Promise<WebhookTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .order('block_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching all transactions:', error);
        return this.getFallbackData('general', limit);
      }

      if (!data || data.length === 0) {
        return this.getFallbackData('general', limit);
      }

      return data;
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      return this.getFallbackData('general', limit);
    }
  },

  async getWalletActivity(walletAddress: string, limit: number = 50): Promise<WebhookTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .or(`from_address.eq.${walletAddress},to_address.eq.${walletAddress}`)
        .order('block_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching wallet activity:', error);
        const heliusData = await heliusTransactionService.getAddressTransactions(walletAddress, limit);
        const parsed = await heliusTransactionService.parseTransactions(heliusData);
        return parsed.map((tx) => ({
          id: tx.signature,
          transaction_signature: tx.signature,
          block_time: new Date(tx.timestamp * 1000).toISOString(),
          from_address: tx.from,
          to_address: tx.to,
          amount: tx.amount,
          token_mint: tx.token,
          token_symbol: tx.tokenSymbol,
          transaction_type: tx.type,
          category: tx.category,
          fee: tx.fee,
          created_at: new Date(tx.timestamp * 1000).toISOString(),
        }));
      }

      if (!data || data.length === 0) {
        const heliusData = await heliusTransactionService.getAddressTransactions(walletAddress, limit);
        const parsed = await heliusTransactionService.parseTransactions(heliusData);
        return parsed.map((tx) => ({
          id: tx.signature,
          transaction_signature: tx.signature,
          block_time: new Date(tx.timestamp * 1000).toISOString(),
          from_address: tx.from,
          to_address: tx.to,
          amount: tx.amount,
          token_mint: tx.token,
          token_symbol: tx.tokenSymbol,
          transaction_type: tx.type,
          category: tx.category,
          fee: tx.fee,
          created_at: new Date(tx.timestamp * 1000).toISOString(),
        }));
      }

      return data;
    } catch (error) {
      console.error('Error in getWalletActivity:', error);
      return [];
    }
  },

  async getRecentActivity(timeRange: string = '24h', limit: number = 100): Promise<WebhookTransaction[]> {
    try {
      const now = new Date();
      let startTime = new Date();

      switch (timeRange) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '6h':
          startTime.setHours(now.getHours() - 6);
          break;
        case '24h':
          startTime.setHours(now.getHours() - 24);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        default:
          startTime.setHours(now.getHours() - 24);
      }

      const { data, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .gte('block_time', startTime.toISOString())
        .order('block_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return this.getFallbackData('general', limit);
      }

      if (!data || data.length === 0) {
        return this.getFallbackData('general', limit);
      }

      return data;
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      return this.getFallbackData('general', limit);
    }
  },
};
