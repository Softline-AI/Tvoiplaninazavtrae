#!/usr/bin/env node

/**
 * Reclassify existing transactions based on updated logic
 *
 * This script re-analyzes transactions that have sol_amount data
 * and updates their transaction_type if needed
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Classify transaction based on SOL amount and token amount
 */
function classifyTransaction(tx) {
  const amount = parseFloat(tx.amount || '0');
  const solAmount = parseFloat(tx.sol_amount || '0');
  const type = tx.transaction_type;

  // If no SOL data, keep original classification
  if (tx.sol_amount === null || tx.sol_amount === undefined) {
    return type;
  }

  // PRIMARY RULE: SOL amount based classification
  // SOL spent (negative) + tokens received (positive) = BUY
  if (solAmount < 0 && amount > 0) {
    return 'BUY';
  }

  // SOL received (positive) + tokens sent (any amount) = SELL
  if (solAmount > 0) {
    return 'SELL';
  }

  // FALLBACK: Amount-based
  if (amount > 0) {
    return 'BUY';
  }

  if (amount < 0) {
    return 'SELL';
  }

  return type;
}

async function reclassifyTransactions() {
  console.log('🔄 Starting transaction reclassification...\n');

  try {
    // Get all transactions with sol_amount data
    const { data: transactions, error } = await supabase
      .from('webhook_transactions')
      .select('*')
      .not('sol_amount', 'is', null)
      .order('block_time', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return;
    }

    if (!transactions || transactions.length === 0) {
      console.log('ℹ️ No transactions found with sol_amount data');
      return;
    }

    console.log(`📊 Found ${transactions.length} transactions to analyze\n`);

    let reclassified = 0;
    let unchanged = 0;
    const updates = [];

    // Analyze each transaction
    for (const tx of transactions) {
      const currentType = tx.transaction_type;
      const newType = classifyTransaction(tx);

      if (currentType !== newType) {
        console.log(`🔀 Reclassifying transaction:`);
        console.log(`   Signature: ${tx.transaction_signature.substring(0, 20)}...`);
        console.log(`   Token: ${tx.token_symbol}`);
        console.log(`   Amount: ${tx.amount}`);
        console.log(`   SOL Amount: ${tx.sol_amount}`);
        console.log(`   Old Type: ${currentType} → New Type: ${newType}\n`);

        updates.push({
          id: tx.id,
          transaction_type: newType
        });

        reclassified++;
      } else {
        unchanged++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✓ Reclassified: ${reclassified}`);
    console.log(`   ✓ Unchanged: ${unchanged}`);
    console.log(`   ✓ Total analyzed: ${transactions.length}\n`);

    if (updates.length > 0) {
      console.log(`💾 Updating ${updates.length} transactions...`);

      // Update in batches of 100
      const batchSize = 100;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);

        for (const update of batch) {
          const { error: updateError } = await supabase
            .from('webhook_transactions')
            .update({ transaction_type: update.transaction_type })
            .eq('id', update.id);

          if (updateError) {
            console.error(`❌ Error updating ${update.id}:`, updateError);
          }
        }

        console.log(`   Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
      }

      console.log('✅ Reclassification complete!\n');
    } else {
      console.log('ℹ️ No reclassification needed\n');
    }

    // Show statistics
    const { data: stats } = await supabase
      .from('webhook_transactions')
      .select('transaction_type')
      .not('sol_amount', 'is', null);

    if (stats) {
      const buys = stats.filter(t => t.transaction_type === 'BUY').length;
      const sells = stats.filter(t => t.transaction_type === 'SELL').length;

      console.log('📊 Current statistics (transactions with SOL data):');
      console.log(`   BUY: ${buys}`);
      console.log(`   SELL: ${sells}`);
      console.log(`   Total: ${stats.length}\n`);
    }

  } catch (error) {
    console.error('❌ Error in reclassification:', error);
  }
}

// Run the script
reclassifyTransactions();
