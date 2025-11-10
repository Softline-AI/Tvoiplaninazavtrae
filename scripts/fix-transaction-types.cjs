const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Правильная логика классификации:
 *
 * BUY (покупка токена):
 * - Трейдер ТРАТИТ SOL (sol_amount < 0 ИЛИ native_balance_change < 0)
 * - Трейдер ПОЛУЧАЕТ токены (token_amount > 0)
 *
 * SELL (продажа токена):
 * - Трейдер ПОЛУЧАЕТ SOL (sol_amount > 0 ИЛИ native_balance_change > 0)
 * - Трейдер ОТДАЕТ токены (token_amount < 0 ИЛИ уменьшается баланс)
 */
function classifyTransaction(tx) {
  const tokenAmount = parseFloat(tx.token_amount) || 0;
  const solAmount = parseFloat(tx.sol_amount) || 0;
  const nativeChange = parseFloat(tx.native_balance_change) || 0;

  console.log(`\n🔍 Analyzing: ${tx.token_symbol}`);
  console.log(`   Token Amount: ${tokenAmount}`);
  console.log(`   SOL Amount: ${solAmount}`);
  console.log(`   Native Change: ${nativeChange}`);
  console.log(`   Current Type: ${tx.transaction_type}`);

  // Используем либо sol_amount, либо native_balance_change
  const solChange = solAmount !== 0 ? solAmount : nativeChange;

  // Правило 1: SOL потрачен (отрицательный) + токены получены (положительные) = BUY
  if (solChange < 0 && tokenAmount > 0) {
    console.log(`   ✅ Should be BUY: Spent SOL, got tokens`);
    return 'BUY';
  }

  // Правило 2: SOL получен (положительный) + токены отданы (или любое кол-во) = SELL
  if (solChange > 0 && tokenAmount > 0) {
    console.log(`   ✅ Should be SELL: Got SOL, sold tokens`);
    return 'SELL';
  }

  // Правило 3: Оба отрицательные - скорее всего SELL
  if (solChange < 0 && tokenAmount < 0) {
    console.log(`   ⚠️ Both negative, likely SELL`);
    return 'SELL';
  }

  // Правило 4: Только токены получены без SOL изменений = BUY
  if (tokenAmount > 0 && solChange === 0) {
    console.log(`   ℹ️ Only tokens received, BUY`);
    return 'BUY';
  }

  // Правило 5: Только токены отданы без SOL изменений = SELL
  if (tokenAmount < 0 && solChange === 0) {
    console.log(`   ℹ️ Only tokens sent, SELL`);
    return 'SELL';
  }

  // Если уже явно указан тип, оставляем его
  if (tx.transaction_type === 'BUY' || tx.transaction_type === 'SELL') {
    console.log(`   ℹ️ Keeping current type: ${tx.transaction_type}`);
    return tx.transaction_type;
  }

  console.log(`   ⚠️ Unable to classify, defaulting to current: ${tx.transaction_type}`);
  return tx.transaction_type;
}

async function fixTransactionTypes() {
  console.log('🔄 Starting transaction type correction...\n');

  // Получаем все транзакции
  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('*')
    .order('block_time', { ascending: false });

  if (error) {
    console.error('❌ Error fetching transactions:', error);
    return;
  }

  console.log(`📊 Found ${transactions.length} transactions to analyze\n`);

  let correctedCount = 0;
  let unchangedCount = 0;

  for (const tx of transactions) {
    const correctType = classifyTransaction(tx);

    if (correctType !== tx.transaction_type) {
      console.log(`   🔄 Correcting: ${tx.transaction_type} → ${correctType}`);

      const { error: updateError } = await supabase
        .from('webhook_transactions')
        .update({ transaction_type: correctType })
        .eq('transaction_signature', tx.transaction_signature);

      if (updateError) {
        console.error(`   ❌ Error updating:`, updateError);
      } else {
        correctedCount++;
        console.log(`   ✅ Corrected successfully`);
      }
    } else {
      unchangedCount++;
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Total transactions: ${transactions.length}`);
  console.log(`   Corrected: ${correctedCount}`);
  console.log(`   Unchanged: ${unchangedCount}`);
  console.log(`\n✅ Done!`);
}

fixTransactionTypes().catch(console.error);
