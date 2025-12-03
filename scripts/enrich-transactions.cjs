const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BIRDEYE_API_KEY = process.env.VITE_BIRDEYE_API_KEY;
const BATCH_SIZE = 20;
const RATE_LIMIT_DELAY = 1500; // ms between batches

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTokenPrice(mint) {
  try {
    const response = await axios.get(
      `https://public-api.birdeye.so/defi/price?address=${mint}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
          'x-chain': 'solana'
        }
      }
    );
    return response.data?.data?.value || null;
  } catch (error) {
    console.error(`Error fetching price for ${mint}:`, error.message);
    return null;
  }
}

async function getMarketCap(mint) {
  try {
    const response = await axios.get(
      `https://public-api.birdeye.so/defi/token_overview?address=${mint}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
          'x-chain': 'solana'
        }
      }
    );
    return response.data?.data?.mc || null;
  } catch (error) {
    console.error(`Error fetching market cap for ${mint}:`, error.message);
    return null;
  }
}

async function enrichTransaction(transaction) {
  console.log(`\n📝 Enriching transaction ${transaction.id}...`);
  console.log(`  Token: ${transaction.token_symbol} (${transaction.token_mint})`);

  const price = await getTokenPrice(transaction.token_mint);
  const marketCap = await getMarketCap(transaction.token_mint);

  if (!price) {
    console.log(`  ⚠️  No price data available`);
    return null;
  }

  console.log(`  💰 Price: $${price.toFixed(8)}`);
  console.log(`  📊 Market Cap: $${marketCap ? marketCap.toLocaleString() : 'N/A'}`);

  const updates = {
    current_token_price: price.toString(),
    price_usd: price.toString(),
    market_cap: marketCap ? marketCap.toString() : null,
  };

  // Calculate entry price if we have SOL amount
  if (transaction.sol_amount && transaction.amount) {
    const entryPrice = Math.abs(transaction.sol_amount) / transaction.amount;
    updates.entry_price = entryPrice;
    console.log(`  🎯 Entry Price: $${entryPrice.toFixed(8)}`);
  }

  return updates;
}

async function main() {
  console.log('🚀 Starting transaction enrichment...\n');

  // Get all transactions with missing price data
  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('*')
    .or('current_token_price.is.null,current_token_price.eq.0')
    .neq('token_symbol', 'SOL')
    .order('block_time', { ascending: false })
    .limit(200);

  if (error) {
    console.error('❌ Error fetching transactions:', error);
    return;
  }

  if (!transactions || transactions.length === 0) {
    console.log('✅ No transactions need enrichment');
    return;
  }

  console.log(`📦 Found ${transactions.length} transactions to enrich\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process in batches
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(transactions.length / BATCH_SIZE)}`);

    for (const transaction of batch) {
      try {
        const updates = await enrichTransaction(transaction);

        if (updates) {
          const { error: updateError } = await supabase
            .from('webhook_transactions')
            .update(updates)
            .eq('id', transaction.id);

          if (updateError) {
            console.error(`  ❌ Error updating transaction:`, updateError.message);
            errorCount++;
          } else {
            console.log(`  ✅ Updated successfully`);
            successCount++;
          }
        } else {
          errorCount++;
        }

        // Small delay between individual requests
        await sleep(200);
      } catch (error) {
        console.error(`  ❌ Error processing transaction:`, error.message);
        errorCount++;
      }
    }

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < transactions.length) {
      console.log(`\n⏱️  Waiting ${RATE_LIMIT_DELAY}ms before next batch...`);
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Enrichment Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📈 Total: ${successCount + errorCount}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
