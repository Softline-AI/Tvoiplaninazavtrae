import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const WEBHOOK_ID = '07898a59-1338-4399-aa84-8aa3326b8724';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addWalletsToWebhook() {
  console.log('🚀 Adding wallets to Helius webhook...\n');

  // Fetch all monitored wallets from Supabase
  const { data: wallets, error } = await supabase
    .from('monitored_wallets')
    .select('wallet_address, label, twitter_handle')
    .order('label');

  if (error) {
    console.error('❌ Error fetching wallets:', error);
    return;
  }

  console.log(`📋 Found ${wallets.length} wallets in database\n`);

  // Filter out placeholder wallet
  const validWallets = wallets.filter(w => w.wallet_address !== 'PLACEHOLDER_WALLET_ADDRESS');

  console.log(`✅ ${validWallets.length} valid wallets to add\n`);

  // Prepare wallet addresses array
  const walletAddresses = validWallets.map(w => w.wallet_address);

  // Update webhook with wallet addresses
  try {
    const response = await fetch(`https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountAddresses: walletAddresses,
        transactionTypes: ['ANY'],
        webhookType: 'enhanced'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Helius API error: ${response.status}`);
      console.error(errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Webhook updated successfully!\n');
    console.log('📊 Webhook Details:');
    console.log(`   - ID: ${result.webhookID}`);
    console.log(`   - URL: ${result.webhookURL}`);
    console.log(`   - Type: ${result.webhookType}`);
    console.log(`   - Wallets: ${result.accountAddresses?.length || 0}`);
    console.log(`   - Transaction Types: ${result.transactionTypes?.join(', ')}`);

    if (result.accountAddresses && result.accountAddresses.length > 0) {
      console.log('\n✅ Successfully added wallets:');
      validWallets.forEach((wallet, index) => {
        const label = wallet.label || 'No label';
        console.log(`   ${index + 1}. ${wallet.wallet_address.slice(0, 8)}... (${label})`);
      });
    }

  } catch (error) {
    console.error('❌ Error updating webhook:', error.message);
  }
}

addWalletsToWebhook();
