/**
 * Real-time Transaction Service
 *
 * Handles instant updates for transactions using Supabase Realtime
 * Ensures BUY/SELL transactions appear immediately in KOL Feed
 */

import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeTransaction {
  id: string;
  transaction_signature: string;
  transaction_type: 'BUY' | 'SELL' | 'SWAP';
  from_address: string;
  token_mint: string;
  token_symbol: string;
  amount: string;
  sol_amount: string;
  current_token_price: string;
  entry_price: string;
  token_pnl: string;
  token_pnl_percentage: string;
  block_time: string;
  remaining_tokens: string;
  all_tokens_sold: boolean;
}

type TransactionCallback = (transaction: RealtimeTransaction) => void;

class RealtimeTransactionService {
  private channel: RealtimeChannel | null = null;
  private isSubscribed = false;

  /**
   * Subscribe to real-time transaction updates
   */
  subscribe(
    onInsert: TransactionCallback,
    onUpdate: TransactionCallback,
    options?: {
      timeFilter?: string;
      actionFilter?: string;
    }
  ): () => void {
    if (this.isSubscribed) {
      console.warn('⚠️ Already subscribed to realtime updates');
      return () => {};
    }

    console.log('🔴 Subscribing to real-time transaction updates...');

    this.channel = supabase
      .channel('webhook_transactions_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_transactions',
        },
        (payload) => {
          console.log('⚡ New transaction INSERT:', payload.new);

          const transaction = payload.new as RealtimeTransaction;

          // Apply filters if specified
          if (options?.actionFilter && options.actionFilter !== 'all') {
            const allowedTypes = options.actionFilter === 'buy' ? ['BUY'] : ['SELL'];
            if (!allowedTypes.includes(transaction.transaction_type)) {
              return;
            }
          }

          onInsert(transaction);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'webhook_transactions',
        },
        (payload) => {
          console.log('⚡ Transaction UPDATE:', payload.new);
          onUpdate(payload.new as RealtimeTransaction);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        this.isSubscribed = status === 'SUBSCRIBED';
      });

    // Return unsubscribe function
    return () => this.unsubscribe();
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(): void {
    if (this.channel) {
      console.log('🔌 Unsubscribing from realtime updates');
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isSubscribed = false;
    }
  }

  /**
   * Check if currently subscribed
   */
  isActive(): boolean {
    return this.isSubscribed;
  }
}

// Export singleton instance
export const realtimeTransactionService = new RealtimeTransactionService();

/**
 * Transaction notification helper
 */
export const showTransactionNotification = (
  type: 'BUY' | 'SELL',
  tokenSymbol: string,
  amount: string
) => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'BUY'
      ? 'bg-green-500/90 text-white'
      : 'bg-red-500/90 text-white'
  }`;

  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="text-lg font-bold">${type}</div>
      <div class="text-sm">${tokenSymbol} • ${amount}</div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};
