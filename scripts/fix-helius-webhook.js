/**
 * Fix Helius Webhook Configuration
 *
 * This script:
 * 1. Deletes the old webhook with wrong URL
 * 2. Creates a new webhook with correct URL
 * 3. Adds all monitored wallets to the webhook
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// CORRECT webhook URL (use from env)
const CORRECT_WEBHOOK_URL = `${process.env.VITE_SUPABASE_URL}/functions/v1/helius-webhook`;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWebhook() {
  console.log('\n🔧 Fixing Helius Webhook Configuration...\n');

  // 1. Get all monitored wallets
  const { data: wallets, error: walletsError } = await supabase
    .from('monitored_wallets')
    .select('wallet_address, label');

  if (walletsError) {
    console.error('❌ Error fetching wallets:', walletsError);
    return;
  }

  const walletAddresses = wallets
    .filter(w => w.wallet_address !== 'PLACEHOLDER_WALLET_ADDRESS')
    .map(w => w.wallet_address);

  console.log(`📋 Found ${walletAddresses.length} monitored wallets\n`);

  // 2. Get existing webhooks
  console.log('🔍 Checking existing webhooks...');
  const listResponse = await fetch(
    `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`
  );

  if (!listResponse.ok) {
    console.error('❌ Failed to list webhooks:', listResponse.status);
    return;
  }

  const existingWebhooks = await listResponse.json();
  console.log(`   Found ${existingWebhooks.length} existing webhook(s)\n`);

  // 3. Delete old webhooks with wrong URL
  for (const webhook of existingWebhooks) {
    if (webhook.webhookURL !== CORRECT_WEBHOOK_URL) {
      console.log(`🗑️  Deleting old webhook: ${webhook.webhookID}`);
      console.log(`   Old URL: ${webhook.webhookURL}`);

      const deleteResponse = await fetch(
        `https://api.helius.xyz/v0/webhooks/${webhook.webhookID}?api-key=${HELIUS_API_KEY}`,
        { method: 'DELETE' }
      );

      if (deleteResponse.ok) {
        console.log('   ✅ Deleted successfully\n');
      } else {
        console.log(`   ❌ Failed to delete: ${deleteResponse.status}\n`);
      }
    } else {
      console.log(`✅ Webhook already has correct URL: ${webhook.webhookID}\n`);

      // Update this webhook with wallets
      console.log('📝 Updating webhook with monitored wallets...');
      const updateResponse = await fetch(
        `https://api.helius.xyz/v0/webhooks/${webhook.webhookID}?api-key=${HELIUS_API_KEY}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookURL: CORRECT_WEBHOOK_URL,
            transactionTypes: ['ANY'],
            accountAddresses: walletAddresses,
            webhookType: 'enhanced'
          })
        }
      );

      if (updateResponse.ok) {
        console.log(`   ✅ Updated with ${walletAddresses.length} wallets\n`);
        console.log('✅ Webhook configuration fixed!\n');
        return;
      } else {
        console.log(`   ❌ Failed to update: ${updateResponse.status}\n`);
      }
    }
  }

  // 4. Create new webhook with correct URL
  console.log('🆕 Creating new webhook...');
  console.log(`   URL: ${CORRECT_WEBHOOK_URL}`);
  console.log(`   Wallets: ${walletAddresses.length}`);
  console.log(`   Transaction Types: ANY\n`);

  const createResponse = await fetch(
    `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookURL: CORRECT_WEBHOOK_URL,
        transactionTypes: ['ANY'],
        accountAddresses: walletAddresses,
        webhookType: 'enhanced',
        authHeader: process.env.HELIUS_WEBHOOK_SECRET || ''
      })
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error('❌ Failed to create webhook:', createResponse.status);
    console.error('   Error:', errorText);
    return;
  }

  const newWebhook = await createResponse.json();
  console.log('✅ New webhook created successfully!');
  console.log(`   ID: ${newWebhook.webhookID}`);
  console.log(`   URL: ${newWebhook.webhookURL}`);
  console.log(`   Wallets: ${newWebhook.accountAddresses?.length || 0}\n`);

  console.log('🎉 Webhook configuration fixed!\n');
  console.log('💡 New transactions should start flowing within 1-2 minutes.\n');
}

fixWebhook().catch(console.error);
