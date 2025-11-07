/**
 * Check Helius Webhook Status
 *
 * This script checks if Helius webhooks are properly configured
 * and receiving transactions from monitored wallets
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebhookStatus() {
  console.log('\n🔍 Checking Helius Webhook Status...\n');

  // 1. Check what webhook URL should be
  console.log('✅ Expected Webhook URL:');
  console.log(`   https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook`);
  console.log('');

  // 2. Get monitored wallets
  const { data: wallets, error: walletsError } = await supabase
    .from('monitored_wallets')
    .select('wallet_address, label, twitter_handle');

  if (walletsError) {
    console.error('❌ Error fetching wallets:', walletsError);
    return;
  }

  console.log(`📋 Monitored Wallets: ${wallets.length}`);
  wallets.forEach((wallet, i) => {
    console.log(`   ${i + 1}. ${wallet.wallet_address.substring(0, 8)}... (${wallet.label || 'No label'})`);
  });
  console.log('');

  // 3. Check recent transactions
  const { data: recentTxs, error: txError } = await supabase
    .from('webhook_transactions')
    .select('*')
    .order('block_time', { ascending: false })
    .limit(10);

  if (txError) {
    console.error('❌ Error fetching transactions:', txError);
    return;
  }

  console.log('📊 Recent Transactions:');
  if (recentTxs.length === 0) {
    console.log('   ⚠️  NO TRANSACTIONS FOUND!');
  } else {
    const latestTx = recentTxs[0];
    const timeSinceLastTx = Date.now() - new Date(latestTx.block_time).getTime();
    const minutesAgo = Math.floor(timeSinceLastTx / 1000 / 60);

    console.log(`   Latest: ${latestTx.transaction_type} ${latestTx.token_symbol}`);
    console.log(`   Time: ${latestTx.block_time}`);
    console.log(`   Age: ${minutesAgo} minutes ago`);

    if (minutesAgo > 10) {
      console.log('   ⚠️  WARNING: No transactions in last 10 minutes!');
      console.log('   ⚠️  Webhook might not be receiving data!');
    } else {
      console.log('   ✅ Webhook appears to be working');
    }
  }
  console.log('');

  // 4. Check Helius API
  console.log('🔗 Checking Helius API...');
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`
    );

    if (!response.ok) {
      console.log(`   ❌ Helius API error: ${response.status}`);
      return;
    }

    const webhooks = await response.json();
    console.log(`   ✅ Found ${webhooks.length} webhook(s)`);

    webhooks.forEach((webhook, i) => {
      console.log(`\n   Webhook #${i + 1}:`);
      console.log(`   - ID: ${webhook.webhookID}`);
      console.log(`   - URL: ${webhook.webhookURL}`);
      console.log(`   - Type: ${webhook.webhookType}`);
      console.log(`   - Wallets: ${webhook.accountAddresses?.length || 0}`);
      console.log(`   - Transaction Types: ${webhook.transactionTypes?.join(', ') || 'ALL'}`);
    });
  } catch (error) {
    console.error('   ❌ Error checking Helius:', error.message);
  }

  console.log('\n');

  // 5. Recommendations
  console.log('💡 Recommendations:');
  console.log('');
  console.log('If webhook is not receiving data:');
  console.log('1. Go to https://dev.helius.xyz/webhooks');
  console.log('2. Check if webhook URL is correct:');
  console.log('   https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook');
  console.log('3. Verify monitored wallets are added to webhook');
  console.log('4. Check transaction types include: SWAP');
  console.log('5. Ensure webhook is ACTIVE (not paused)');
  console.log('');
}

checkWebhookStatus().catch(console.error);
