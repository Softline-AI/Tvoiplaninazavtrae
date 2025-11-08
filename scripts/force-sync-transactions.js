import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function syncTransactions() {
  console.log('🔄 Force syncing recent transactions...\n');

  const { data: wallets, error } = await supabase
    .from('monitored_wallets')
    .select('wallet_address');

  if (error) {
    console.error('❌ Error fetching wallets:', error);
    return;
  }

  console.log(`📋 Syncing ${wallets.length} wallets...\n`);

  for (const wallet of wallets.slice(0, 5)) {
    console.log(`🔍 Checking ${wallet.wallet_address.slice(0, 8)}...`);

    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${wallet.wallet_address}/transactions?api-key=${HELIUS_API_KEY}&limit=10&type=SWAP`
    );

    if (response.ok) {
      const transactions = await response.json();
      console.log(`  Found ${transactions.length} recent SWAP transactions`);

      for (const tx of transactions) {
        const txTime = new Date(tx.timestamp * 1000);
        const now = new Date();
        const hoursDiff = (now - txTime) / (1000 * 60 * 60);

        if (hoursDiff < 2) {
          console.log(`  ⏰ Fresh TX: ${tx.signature.slice(0, 20)}... (${hoursDiff.toFixed(1)}h ago)`);

          const { data: existing } = await supabase
            .from('webhook_transactions')
            .select('transaction_signature')
            .eq('transaction_signature', tx.signature)
            .maybeSingle();

          if (!existing) {
            console.log(`    ❌ Missing in DB! Need to sync...`);
          } else {
            console.log(`    ✅ Already in DB`);
          }
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

syncTransactions();
