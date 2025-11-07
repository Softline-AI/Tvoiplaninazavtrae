import { supabase } from './supabaseClient';
import { isMemecoin, classifyToken } from './memecoinFilter';
import { birdeyeService } from './birdeyeApi';

interface MemecoinPosition {
  walletAddress: string;
  tokenMint: string;
  tokenSymbol: string;
  totalBought: number;
  totalSold: number;
  averageEntryPrice: number;
  currentPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  pnlPercentage: number;
  remainingTokens: number;
  firstBuyTime: string;
  lastActivityTime: string;
  isMemecoin: boolean;
  category?: string;
}

interface MemecoinTrade {
  signature: string;
  walletAddress: string;
  tokenMint: string;
  tokenSymbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  value: number;
  timestamp: string;
  pnl?: number;
  pnlPercentage?: number;
}

class MemecoinPnlTracker {
  async getMemecoinPositions(walletAddress: string): Promise<MemecoinPosition[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .eq('from_address', walletAddress)
        .in('transaction_type', ['BUY', 'SELL'])
        .order('block_time', { ascending: true });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      const positionMap = new Map<string, MemecoinPosition>();

      for (const tx of transactions || []) {
        const classification = classifyToken(tx.token_symbol);

        if (!classification.isMemecoin) continue;

        const tokenMint = tx.token_mint;
        const amount = parseFloat(tx.amount || '0');
        const price = parseFloat(tx.current_token_price || '0');

        if (!positionMap.has(tokenMint)) {
          positionMap.set(tokenMint, {
            walletAddress,
            tokenMint,
            tokenSymbol: tx.token_symbol,
            totalBought: 0,
            totalSold: 0,
            averageEntryPrice: 0,
            currentPrice: price,
            realizedPnl: 0,
            unrealizedPnl: 0,
            totalPnl: 0,
            pnlPercentage: 0,
            remainingTokens: 0,
            firstBuyTime: tx.block_time,
            lastActivityTime: tx.block_time,
            isMemecoin: true,
            category: classification.category
          });
        }

        const position = positionMap.get(tokenMint)!;

        if (tx.transaction_type === 'BUY') {
          const costBasis = position.totalBought * position.averageEntryPrice;
          const newCostBasis = costBasis + (amount * price);
          position.totalBought += amount;
          position.averageEntryPrice = newCostBasis / position.totalBought;
          position.remainingTokens += amount;
        } else if (tx.transaction_type === 'SELL') {
          position.totalSold += amount;
          position.remainingTokens -= amount;

          const sellValue = amount * price;
          const costBasis = amount * position.averageEntryPrice;
          const tradePnl = sellValue - costBasis;
          position.realizedPnl += tradePnl;
        }

        position.lastActivityTime = tx.block_time;
      }

      const positions = Array.from(positionMap.values());

      const tokenAddresses = positions.map(p => p.tokenMint);
      if (tokenAddresses.length > 0) {
        const currentPrices = await birdeyeService.getMultipleTokenPrices(tokenAddresses);

        for (const position of positions) {
          const priceData = currentPrices[position.tokenMint];
          if (priceData && priceData.value > 0) {
            position.currentPrice = priceData.value;
          }

          if (position.remainingTokens > 0) {
            const currentValue = position.remainingTokens * position.currentPrice;
            const costBasis = position.remainingTokens * position.averageEntryPrice;
            position.unrealizedPnl = currentValue - costBasis;
          } else {
            position.unrealizedPnl = 0;
          }

          position.totalPnl = position.realizedPnl + position.unrealizedPnl;

          const totalInvested = position.totalBought * position.averageEntryPrice;
          if (totalInvested > 0) {
            position.pnlPercentage = (position.totalPnl / totalInvested) * 100;
          }
        }
      }

      return positions.sort((a, b) => b.totalPnl - a.totalPnl);
    } catch (error) {
      console.error('Error calculating memecoin positions:', error);
      return [];
    }
  }

  async getMemecoinTrades(walletAddress: string, tokenMint?: string): Promise<MemecoinTrade[]> {
    try {
      let query = supabase
        .from('webhook_transactions')
        .select('*')
        .eq('from_address', walletAddress)
        .in('transaction_type', ['BUY', 'SELL'])
        .order('block_time', { ascending: false });

      if (tokenMint) {
        query = query.eq('token_mint', tokenMint);
      }

      const { data: transactions, error } = await query;

      if (error) {
        console.error('Error fetching trades:', error);
        return [];
      }

      const trades: MemecoinTrade[] = [];

      for (const tx of transactions || []) {
        const classification = classifyToken(tx.token_symbol);

        if (!classification.isMemecoin) continue;

        trades.push({
          signature: tx.transaction_signature,
          walletAddress: tx.from_address,
          tokenMint: tx.token_mint,
          tokenSymbol: tx.token_symbol,
          type: tx.transaction_type as 'BUY' | 'SELL',
          amount: parseFloat(tx.amount || '0'),
          price: parseFloat(tx.current_token_price || '0'),
          value: parseFloat(tx.amount || '0') * parseFloat(tx.current_token_price || '0'),
          timestamp: tx.block_time,
          pnl: parseFloat(tx.token_pnl || '0'),
          pnlPercentage: parseFloat(tx.token_pnl_percentage || '0')
        });
      }

      return trades;
    } catch (error) {
      console.error('Error fetching memecoin trades:', error);
      return [];
    }
  }

  async getTopMemecoinTraders(limit: number = 10): Promise<Array<{
    walletAddress: string;
    totalPnl: number;
    winRate: number;
    totalTrades: number;
    topTokens: string[];
  }>> {
    try {
      const { data: transactions, error } = await supabase
        .from('webhook_transactions')
        .select('from_address, token_symbol, token_mint, transaction_type, token_pnl')
        .in('transaction_type', ['BUY', 'SELL'])
        .order('block_time', { ascending: false })
        .limit(5000);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      const traderStats = new Map<string, {
        totalPnl: number;
        wins: number;
        losses: number;
        totalTrades: number;
        tokens: Set<string>;
      }>();

      for (const tx of transactions || []) {
        const classification = classifyToken(tx.token_symbol);
        if (!classification.isMemecoin) continue;

        const wallet = tx.from_address;
        if (!traderStats.has(wallet)) {
          traderStats.set(wallet, {
            totalPnl: 0,
            wins: 0,
            losses: 0,
            totalTrades: 0,
            tokens: new Set()
          });
        }

        const stats = traderStats.get(wallet)!;
        const pnl = parseFloat(tx.token_pnl || '0');

        stats.totalPnl += pnl;
        stats.totalTrades++;
        stats.tokens.add(tx.token_symbol);

        if (pnl > 0) stats.wins++;
        if (pnl < 0) stats.losses++;
      }

      const results = Array.from(traderStats.entries())
        .map(([wallet, stats]) => ({
          walletAddress: wallet,
          totalPnl: stats.totalPnl,
          winRate: stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0,
          totalTrades: stats.totalTrades,
          topTokens: Array.from(stats.tokens).slice(0, 3)
        }))
        .sort((a, b) => b.totalPnl - a.totalPnl)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error calculating top memecoin traders:', error);
      return [];
    }
  }

  async getMemecoinsOnlyFromFeed(): Promise<any[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('webhook_transactions')
        .select('*')
        .in('transaction_type', ['BUY', 'SELL'])
        .order('block_time', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      const memecoins = (transactions || []).filter(tx => {
        const classification = classifyToken(tx.token_symbol);
        return classification.isMemecoin;
      });

      return memecoins;
    } catch (error) {
      console.error('Error filtering memecoins:', error);
      return [];
    }
  }
}

export const memecoinPnlTracker = new MemecoinPnlTracker();
export type { MemecoinPosition, MemecoinTrade };
