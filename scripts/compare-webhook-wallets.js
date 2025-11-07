import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const WEBHOOK_ID = '07898a59-1338-4399-aa84-8aa3326b8724';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function compareWallets() {
  console.log('🔍 Comparing database wallets with Helius webhook...\n');

  // Fetch wallets from Supabase
  const { data: dbWallets, error } = await supabase
    .from('monitored_wallets')
    .select('wallet_address, label')
    .order('label');

  if (error) {
    console.error('❌ Error fetching wallets:', error);
    return;
  }

  // Filter out placeholder
  const validDbWallets = dbWallets
    .filter(w => w.wallet_address !== 'PLACEHOLDER_WALLET_ADDRESS')
    .map(w => ({ address: w.wallet_address, label: w.label || 'No label' }));

  console.log(`📋 Database: ${validDbWallets.length} valid wallets`);

  // Fetch webhook configuration
  const response = await fetch(`https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`);

  if (!response.ok) {
    console.error('❌ Helius API error:', response.status);
    return;
  }

  const webhookConfig = await response.json();
  const webhookWallets = webhookConfig.accountAddresses || [];

  console.log(`🌐 Helius Webhook: ${webhookWallets.length} wallets\n`);

  // Find missing wallets
  const missingWallets = validDbWallets.filter(
    dbWallet => !webhookWallets.includes(dbWallet.address)
  );

  // Find extra wallets (in webhook but not in DB)
  const extraWallets = webhookWallets.filter(
    whWallet => !validDbWallets.find(dbWallet => dbWallet.address === whWallet)
  );

  if (missingWallets.length === 0 && extraWallets.length === 0) {
    console.log('✅ Perfect sync! All wallets match.\n');
    return { missing: [], extra: [] };
  }

  if (missingWallets.length > 0) {
    console.log(`❌ Missing in Helius webhook (${missingWallets.length}):`);
    missingWallets.forEach((wallet, index) => {
      console.log(`   ${index + 1}. ${wallet.address.slice(0, 8)}...${wallet.address.slice(-4)} (${wallet.label})`);
    });
    console.log('');
  }

  if (extraWallets.length > 0) {
    console.log(`⚠️  Extra in webhook but not in DB (${extraWallets.length}):`);
    extraWallets.forEach((wallet, index) => {
      console.log(`   ${index + 1}. ${wallet.slice(0, 8)}...${wallet.slice(-4)}`);
    });
    console.log('');
  }

  return { missing: missingWallets, extra: extraWallets };
}

async function addMissingWallets() {
  const { missing, extra } = await compareWallets();

  if (!missing || missing.length === 0) {
    console.log('✅ No wallets to add!\n');
    return;
  }

  console.log(`\n🔧 Adding ${missing.length} missing wallets to webhook...\n`);

  // Get current webhook config
  const response = await fetch(`https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`);
  const webhookConfig = await response.json();
  const currentWallets = webhookConfig.accountAddresses || [];

  // Add missing wallets
  const updatedWallets = [...currentWallets, ...missing.map(w => w.address)];

  // Update webhook
  const updateResponse = await fetch(`https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhookURL: webhookConfig.webhookURL,
      accountAddresses: updatedWallets,
      transactionTypes: webhookConfig.transactionTypes,
      webhookType: webhookConfig.webhookType,
      authHeader: webhookConfig.authHeader
    })
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error(`❌ Failed to update webhook: ${updateResponse.status}`);
    console.error(errorText);
    return;
  }

  const result = await updateResponse.json();
  console.log('✅ Webhook updated successfully!\n');
  console.log(`📊 Total wallets now: ${result.accountAddresses?.length || 0}`);

  console.log('\n✅ Added wallets:');
  missing.forEach((wallet, index) => {
    console.log(`   ${index + 1}. ${wallet.address.slice(0, 8)}...${wallet.address.slice(-4)} (${wallet.label})`);
  });
}

addMissingWallets();
