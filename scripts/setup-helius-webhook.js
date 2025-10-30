import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1 || '23820805-b04f-45a2-9d4b-e70d588bd406';
const WEBHOOK_URL = 'https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getExistingWebhooks() {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch webhooks: ${response.status}`);
      return [];
    }

    const webhooks = await response.json();
    console.log(`Found ${webhooks.length} existing webhooks`);
    return webhooks;
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return [];
  }
}

async function deleteWebhook(webhookId) {
  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      console.log(`✓ Deleted webhook ${webhookId}`);
      return true;
    } else {
      console.error(`Failed to delete webhook ${webhookId}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting webhook ${webhookId}:`, error);
    return false;
  }
}

async function createWebhook(wallets) {
  try {
    const payload = {
      webhookURL: WEBHOOK_URL,
      transactionTypes: ['SWAP', 'TRANSFER'],
      accountAddresses: wallets,
      webhookType: 'enhanced',
      txnStatus: 'all'
    };

    const response = await fetch(
      `https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to create webhook: ${response.status}`, error);
      return null;
    }

    const webhook = await response.json();
    console.log(`✓ Created webhook for ${wallets.length} wallets`);
    return webhook;
  } catch (error) {
    console.error('Error creating webhook:', error);
    return null;
  }
}

async function main() {
  console.log('Starting Helius webhook setup...\n');

  // Hardcoded list of monitored wallets (from database)
  const walletAddresses = [
    '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
    '3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei',
    '4cXnf2z85UiZ5cyKsPMEULq1yufAtpkatmX4j4DBZqj2',
    '86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD',
    '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR',
    '9yYya3F5EJoLnBNKW6z4bZvyQytMXzDcpU5D6yYr4jqL',
    'CA4keXLtGJWBcsWivjtMFBghQ8pFsGRWFxLrRCtirzu5',
    'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o',
    'DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt',
    'FL4j8EEMAPUjrvASnqX7VdpWZJji1LFsAxwojhpueUYt',
    'GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN',
    'HvDf4Cxd2evdYueLhK5LoaiEvDXFXgb1uRrkoYPdvHfH'
  ];

  console.log(`Using ${walletAddresses.length} monitored wallets\n`);

  // Get existing webhooks
  const existingWebhooks = await getExistingWebhooks();

  // Delete all existing webhooks
  console.log('\nDeleting existing webhooks...');
  for (const webhook of existingWebhooks) {
    await deleteWebhook(webhook.webhookID);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Create new webhook with all wallets
  console.log('\nCreating new webhook...');
  const webhook = await createWebhook(walletAddresses);

  if (webhook) {
    console.log('\n✅ Webhook setup complete!');
    console.log(`Webhook ID: ${webhook.webhookID}`);
    console.log(`Webhook URL: ${webhook.webhookURL}`);
    console.log(`Monitoring ${walletAddresses.length} wallets`);
  } else {
    console.log('\n❌ Failed to create webhook');
  }
}

main();
