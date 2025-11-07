import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const WALLETS_TO_CHECK = [
  'DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt',
  'FxN3VZ4BosL5urG2yoeQ156JSdmavm9K5fdLxjkPmaMR',
  'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o',
  'BoYHJoKntk3pjkaV8qFojEonSPWmWMfQocZTwDd1bcGG',
  'm7Kaas3Kd8FHLnCioSjCoSuVDReZ6FDNBVM6HTNYuF7',
];

async function importMissingTransactions() {
  console.log('\n📥 Importing missing transactions...\n');

  let totalImported = 0;
  let totalSkipped = 0;

  for (const wallet of WALLETS_TO_CHECK) {
    const shortWallet = wallet.substring(0, 8);
    console.log(`\n🔍 Checking wallet: ${shortWallet}...`);

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${HELIUS_API_KEY}&limit=10`
      );

      if (!response.ok) {
        console.log(`   ❌ Failed to fetch: ${response.status}`);
        continue;
      }

      const transactions = await response.json();
      console.log(`   Found ${transactions.length} recent transactions`);

      for (const tx of transactions) {
        const signature = tx.signature;
        const timestamp = tx.timestamp;
        const type = tx.type;
        const shortSig = signature ? signature.substring(0, 16) : 'no-sig';

        // Check if already exists
        const { data: existing } = await supabase
          .from('webhook_transactions')
          .select('transaction_signature')
          .eq('transaction_signature', signature)
          .maybeSingle();

        if (existing) {
          console.log(`   ⏭️  Skip (exists): ${shortSig}...`);
          totalSkipped++;
          continue;
        }

        const date = new Date(timestamp * 1000).toISOString();
        console.log(`   🆕 NEW: ${type} at ${date}`);
        console.log(`      Signature: ${shortSig}...`);

        // Send to webhook
        const webhookUrl = `${supabaseUrl}/functions/v1/helius-webhook`;

        try {
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': 'stalker-helius-webhook-2024-secure-key'
            },
            body: JSON.stringify(tx)
          });

          if (webhookResponse.ok) {
            console.log(`      ✅ Imported successfully`);
            totalImported++;
          } else {
            const error = await webhookResponse.text();
            console.log(`      ❌ Failed: ${error.substring(0, 100)}`);
          }
        } catch (err) {
          console.log(`      ❌ Error: ${err.message}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.log(`   ❌ Error processing wallet: ${err.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Imported: ${totalImported}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log('\n✅ Import complete!\n');
}

importMissingTransactions().catch(console.error);
