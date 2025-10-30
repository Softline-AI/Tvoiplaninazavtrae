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

  // ALL monitored wallets from database (31 total)
  const walletAddresses = [
    '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
    '2kv8X2a9bxnBM8NKLc6BBTX2z13GFNRL4oRotMUJRva9',
    '3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei',
    '4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk',
    '4cXnf2z85UiZ5cyKsPMEULq1yufAtpkatmX4j4DBZqj2',
    '52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD',
    '76zneZhcvEzF5JXznQuF5tpoVSDiuchw4h5epCdi4bdT',
    '86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD',
    '8BseXT9EtoEhBTKFFYkwTnjKSUZwhtmdKY2Jrj8j45Rt',
    '8MaVa9kdt3NW4Q5HyNAm1X5LbR8PQRVDc1W8NMVK88D5',
    '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR',
    '9yYya3F5EJoLnBNKW6z4bZvyQytMXzDcpU5D6yYr4jqL',
    'AeLaMjzxErZt4drbWVWvcxpVyo8p94xu5vrg41eZPFe3',
    'Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ',
    'BoYHJoKntk3pjkaV8qFojEonSPWmWMfQocZTwDd1bcGG',
    'BTYBjYjodGY7K2ifq1c4Wv4WMbJQPVN7tUStTsfcvR31',
    'BuhkHhM3j4viF71pMTd23ywxPhF35LUnc2QCLAvUxCdW',
    'CA4keXLtGJWBcsWivjtMFBghQ8pFsGRWFxLrRCtirzu5',
    'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o',
    'Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow',
    'DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt',
    'EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf',
    'FL4j8EEMAPUjrvASnqX7VdpWZJji1LFsAxwojhpueUYt',
    'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
    'GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65',
    'GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN',
    'HvDf4Cxd2evdYueLhK5LoaiEvDXFXgb1uRrkoYPdvHfH',
    'JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN',
    'm7Kaas3Kd8FHLnCioSjCoSuVDReZ6FDNBVM6HTNYuF7',
    'MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2',
    'sAdNbe1cKNMDqDsa4npB3TfL62T14uAo2MsUQfLvzLT'
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
