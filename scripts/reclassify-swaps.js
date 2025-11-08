import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reclassifySwaps() {
  console.log('🔄 Starting SWAP transaction reclassification...\n');

  // Get all SWAP transactions
  const { data: swapTxs, error } = await supabase
    .from('webhook_transactions')
    .select('id, transaction_signature, from_address, token_mint, token_symbol, sol_amount, native_balance_change')
    .eq('transaction_type', 'SWAP')
    .order('block_time', { ascending: false });

  if (error) {
    console.error('Error fetching SWAP transactions:', error);
    return;
  }

  console.log(`Found ${swapTxs.length} SWAP transactions to reclassify\n`);

  let buyCount = 0;
  let sellCount = 0;
  let remainSwap = 0;
  let errorCount = 0;

  for (let i = 0; i < swapTxs.length; i++) {
    const tx = swapTxs[i];

    try {
      // Determine if it's a BUY or SELL based on SOL flow
      const solAmount = parseFloat(tx.sol_amount || '0');
      const nativeBalanceChange = parseFloat(tx.native_balance_change || '0');

      let newType = 'SWAP';

      // If SOL went out (negative), it's a BUY
      if (solAmount < 0 || nativeBalanceChange < 0) {
        newType = 'BUY';
        buyCount++;
      }
      // If SOL came in (positive), it's a SELL
      else if (solAmount > 0 || nativeBalanceChange > 0) {
        newType = 'SELL';
        sellCount++;
      }
      // Otherwise keep as SWAP (token-to-token)
      else {
        remainSwap++;
        continue;
      }

      // Update the transaction
      const { error: updateError } = await supabase
        .from('webhook_transactions')
        .update({ transaction_type: newType })
        .eq('id', tx.id);

      if (updateError) {
        console.error(`Error updating transaction ${tx.transaction_signature}:`, updateError);
        errorCount++;
      } else {
        if (i % 100 === 0) {
          console.log(`Progress: ${i}/${swapTxs.length} processed...`);
        }
      }

    } catch (err) {
      console.error(`Error processing transaction ${tx.transaction_signature}:`, err);
      errorCount++;
    }
  }

  console.log('\n✅ Reclassification complete!');
  console.log(`\nResults:`);
  console.log(`  SWAP → BUY:  ${buyCount}`);
  console.log(`  SWAP → SELL: ${sellCount}`);
  console.log(`  Remain SWAP: ${remainSwap}`);
  console.log(`  Errors:      ${errorCount}`);
  console.log(`  Total:       ${swapTxs.length}`);
}

reclassifySwaps().catch(console.error);
