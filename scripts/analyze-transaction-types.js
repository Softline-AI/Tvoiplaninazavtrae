import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTransactionTypes() {
  console.log('🔍 Analyzing transaction types in database...\n');

  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('transaction_type, token_symbol, from_address')
    .limit(10000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total transactions analyzed: ${transactions.length}\n`);

  const typeStats = new Map();

  for (const tx of transactions) {
    const type = tx.transaction_type || 'UNKNOWN';
    if (!typeStats.has(type)) {
      typeStats.set(type, {
        count: 0,
        tokens: new Set(),
        wallets: new Set()
      });
    }
    const stats = typeStats.get(type);
    stats.count++;
    stats.tokens.add(tx.token_symbol);
    stats.wallets.add(tx.from_address);
  }

  console.log('━'.repeat(80));
  console.log('📊 TRANSACTION TYPE BREAKDOWN');
  console.log('━'.repeat(80));
  console.log('Type'.padEnd(30), 'Count'.padStart(8), 'Tokens'.padStart(10), 'Wallets'.padStart(10));
  console.log('─'.repeat(80));

  const sorted = Array.from(typeStats.entries())
    .sort((a, b) => b[1].count - a[1].count);

  for (const [type, stats] of sorted) {
    console.log(
      type.padEnd(30),
      stats.count.toString().padStart(8),
      stats.tokens.size.toString().padStart(10),
      stats.wallets.size.toString().padStart(10)
    );
  }

  console.log('\n━'.repeat(80));
  console.log('💡 RECOMMENDED TYPE MAPPING');
  console.log('━'.repeat(80));

  const buyTypes = ['BUY'];
  const sellTypes = ['SELL'];
  const otherTypes = [];

  for (const [type] of sorted) {
    const upper = type.toUpperCase();
    if (upper === 'BUY' || upper.includes('BUY')) {
      buyTypes.push(type);
    } else if (upper === 'SELL' || upper.includes('SELL')) {
      sellTypes.push(type);
    } else {
      otherTypes.push(type);
    }
  }

  console.log('\n🟢 BUY TYPES:');
  buyTypes.forEach(t => console.log(`   - ${t}`));

  console.log('\n🔴 SELL TYPES:');
  sellTypes.forEach(t => console.log(`   - ${t}`));

  if (otherTypes.length > 0) {
    console.log('\n⚪ OTHER TYPES (need manual classification):');
    otherTypes.forEach(t => console.log(`   - ${t}`));
  }

  console.log('\n✅ Analysis complete!\n');
}

analyzeTransactionTypes();
