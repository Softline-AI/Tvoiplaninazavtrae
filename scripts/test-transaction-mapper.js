import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function classifyTransaction(tx) {
  const type = tx.transaction_type?.toUpperCase() || 'UNKNOWN';
  const amount = parseFloat(tx.amount || '0');

  // Direct BUY
  if (type === 'BUY') return 'BUY';

  // Direct SELL
  if (type === 'SELL') return 'SELL';

  // SWAP - classify based on amount
  if (type === 'SWAP') {
    return amount > 0 ? 'BUY' : 'SELL';
  }

  // Other types - default to BUY
  return 'BUY';
}

async function testTransactionMapper() {
  console.log('🧪 Testing Transaction Type Mapper\n');

  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('*')
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const stats = {
    original: {
      BUY: 0,
      SELL: 0,
      SWAP: 0,
      UNKNOWN: 0
    },
    classified: {
      BUY: 0,
      SELL: 0,
      UNKNOWN: 0
    }
  };

  const examples = {
    SWAP_to_BUY: [],
    SWAP_to_SELL: [],
    BUY: [],
    SELL: []
  };

  for (const tx of transactions) {
    const originalType = tx.transaction_type?.toUpperCase() || 'UNKNOWN';
    const classifiedType = classifyTransaction(tx);

    stats.original[originalType] = (stats.original[originalType] || 0) + 1;
    stats.classified[classifiedType]++;

    if (originalType === 'SWAP') {
      const key = `SWAP_to_${classifiedType}`;
      if (examples[key].length < 3) {
        examples[key].push({
          token: tx.token_symbol,
          amount: parseFloat(tx.amount || '0'),
          price: parseFloat(tx.current_token_price || '0'),
          type: originalType,
          classified: classifiedType
        });
      }
    } else if (originalType === 'BUY' && examples.BUY.length < 3) {
      examples.BUY.push({
        token: tx.token_symbol,
        amount: parseFloat(tx.amount || '0'),
        type: originalType
      });
    } else if (originalType === 'SELL' && examples.SELL.length < 3) {
      examples.SELL.push({
        token: tx.token_symbol,
        amount: parseFloat(tx.amount || '0'),
        type: originalType
      });
    }
  }

  console.log('━'.repeat(80));
  console.log('📊 BEFORE CLASSIFICATION');
  console.log('━'.repeat(80));
  console.log(`BUY:     ${stats.original.BUY} transactions`);
  console.log(`SELL:    ${stats.original.SELL} transactions`);
  console.log(`SWAP:    ${stats.original.SWAP} transactions (needs classification)`);
  console.log(`UNKNOWN: ${stats.original.UNKNOWN || 0} transactions`);

  console.log('\n' + '━'.repeat(80));
  console.log('📊 AFTER CLASSIFICATION');
  console.log('━'.repeat(80));
  console.log(`BUY:     ${stats.classified.BUY} transactions (+${stats.classified.BUY - stats.original.BUY} from SWAP)`);
  console.log(`SELL:    ${stats.classified.SELL} transactions (+${stats.classified.SELL - stats.original.SELL} from SWAP)`);
  console.log(`UNKNOWN: ${stats.classified.UNKNOWN} transactions`);

  console.log('\n' + '━'.repeat(80));
  console.log('💡 SWAP CLASSIFICATION EXAMPLES');
  console.log('━'.repeat(80));

  if (examples.SWAP_to_BUY.length > 0) {
    console.log('\n🟢 SWAP → BUY (positive amount):');
    examples.SWAP_to_BUY.forEach(ex => {
      console.log(`   ${ex.token}: amount=${ex.amount.toFixed(2)} (${ex.amount > 0 ? '+' : ''}${ex.amount.toFixed(2)}) → BUY`);
    });
  }

  if (examples.SWAP_to_SELL.length > 0) {
    console.log('\n🔴 SWAP → SELL (negative amount):');
    examples.SWAP_to_SELL.forEach(ex => {
      console.log(`   ${ex.token}: amount=${ex.amount.toFixed(2)} (${ex.amount > 0 ? '+' : ''}${ex.amount.toFixed(2)}) → SELL`);
    });
  }

  if (examples.BUY.length > 0) {
    console.log('\n✅ Direct BUY:');
    examples.BUY.forEach(ex => {
      console.log(`   ${ex.token}: amount=${ex.amount.toFixed(2)}`);
    });
  }

  if (examples.SELL.length > 0) {
    console.log('\n✅ Direct SELL:');
    examples.SELL.forEach(ex => {
      console.log(`   ${ex.token}: amount=${ex.amount.toFixed(2)}`);
    });
  }

  const improvement = ((stats.original.SWAP / transactions.length) * 100).toFixed(1);
  console.log('\n' + '━'.repeat(80));
  console.log(`✅ Classification improved ${improvement}% of transactions!`);
  console.log('━'.repeat(80) + '\n');
}

testTransactionMapper();
