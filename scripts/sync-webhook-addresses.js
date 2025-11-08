import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const WEBHOOK_ID = '941fe3fa-4e55-4b56-835a-a160feb412e0';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function syncWebhookAddresses() {
  console.log('🔄 Syncing webhook addresses...\n');

  const { data: wallets, error } = await supabase
    .from('monitored_wallets')
    .select('wallet_address');

  if (error) {
    console.error('❌ Error fetching wallets:', error);
    return;
  }

  const addresses = wallets.map(w => w.wallet_address);
  console.log(`📋 Found ${addresses.length} wallets in database`);

  const payload = {
    accountAddresses: addresses,
    transactionTypes: ['SWAP', 'TRANSFER'],
    webhookType: 'enhanced',
    txnStatus: 'all',
    webhookURL: 'https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook'
  };

  console.log('📤 Sending payload:', JSON.stringify(payload, null, 2).substring(0, 500) + '...\n');

  const response = await fetch(
    `https://api.helius.xyz/v0/webhooks/${WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log(`\n✅ Webhook updated successfully!`);
    console.log(`📍 Monitoring ${data.accountAddresses?.length || 0} addresses`);
  } else {
    const error = await response.text();
    console.error('❌ Error updating webhook:', error);
  }
}

syncWebhookAddresses();
