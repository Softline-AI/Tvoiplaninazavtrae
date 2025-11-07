import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuyTransactions() {
  try {
    console.log('🔍 Fetching BUY transactions from Supabase...\n');

    const { data: buyTransactions, error } = await supabase
      .from('webhook_transactions')
      .select('*')
      .eq('transaction_type', 'BUY')
      .order('block_time', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return;
    }

    if (!buyTransactions || buyTransactions.length === 0) {
      console.log('⚠️  No BUY transactions found');
      return;
    }

    console.log(`✅ Found ${buyTransactions.length} BUY transactions\n`);
    console.log('━'.repeat(120));

    const { data: wallets } = await supabase
      .from('monitored_wallets')
      .select('wallet_address, label, twitter_handle');

    const walletInfoMap = new Map();
    wallets?.forEach(w => {
      walletInfoMap.set(w.wallet_address, w);
    });

    buyTransactions.forEach((tx, index) => {
      const walletInfo = walletInfoMap.get(tx.from_address);
      const walletLabel = walletInfo?.label || tx.from_address.substring(0, 8);
      const twitterHandle = walletInfo?.twitter_handle || 'N/A';

      const timestamp = new Date(tx.block_time).toLocaleString();
      const amount = parseFloat(tx.amount || '0').toFixed(4);
      const entryPrice = parseFloat(tx.entry_price || '0').toFixed(8);
      const currentPrice = parseFloat(tx.current_token_price || '0').toFixed(8);
      const tokenPnl = parseFloat(tx.token_pnl || '0').toFixed(2);
      const tokenPnlPercentage = parseFloat(tx.token_pnl_percentage || '0').toFixed(2);
      const remainingTokens = parseFloat(tx.remaining_tokens || '0').toFixed(4);
      const marketCap = parseFloat(tx.market_cap || '0');
      const marketCapFormatted = marketCap >= 1000000
        ? `$${(marketCap / 1000000).toFixed(2)}M`
        : marketCap >= 1000
        ? `$${(marketCap / 1000).toFixed(1)}K`
        : `$${marketCap.toFixed(0)}`;

      const pnlColor = parseFloat(tokenPnl) >= 0 ? '🟢' : '🔴';
      const allSold = tx.all_tokens_sold ? '❌ All Sold' : '✅ Still Holding';

      console.log(`\n${index + 1}. 🟢 BUY | ${tx.token_symbol} | ${timestamp}`);
      console.log(`   Trader:         ${walletLabel} (@${twitterHandle})`);
      console.log(`   Wallet:         ${tx.from_address.substring(0, 8)}...`);
      console.log(`   Token:          ${tx.token_symbol} (${tx.token_mint?.substring(0, 8)}...)`);
      console.log(`   Amount:         ${amount} tokens`);
      console.log(`   Entry Price:    $${entryPrice}`);
      console.log(`   Current Price:  $${currentPrice}`);
      console.log(`   Market Cap:     ${marketCapFormatted}`);
      console.log(`   Remaining:      ${remainingTokens} tokens ${allSold}`);
      console.log(`   ${pnlColor} P&L:            $${tokenPnl} (${tokenPnlPercentage}%)`);
      console.log(`   TX Signature:   ${tx.transaction_signature?.substring(0, 16)}...`);

      if (index < buyTransactions.length - 1) {
        console.log('   ' + '─'.repeat(110));
      }
    });

    console.log('\n' + '━'.repeat(120));

    // Статистика по BUY транзакциям
    const totalPnl = buyTransactions.reduce((sum, tx) => sum + parseFloat(tx.token_pnl || '0'), 0);
    const profitableBuys = buyTransactions.filter(tx => parseFloat(tx.token_pnl || '0') > 0).length;
    const avgPnl = totalPnl / buyTransactions.length;
    const stillHolding = buyTransactions.filter(tx => !tx.all_tokens_sold).length;
    const allSold = buyTransactions.filter(tx => tx.all_tokens_sold).length;

    console.log('\n💰 BUY Transaction Statistics:');
    console.log(`   Total P&L (unrealized): $${totalPnl.toFixed(2)}`);
    console.log(`   Average P&L:            $${avgPnl.toFixed(2)}`);
    console.log(`   Profitable BUYs:        ${profitableBuys}/${buyTransactions.length} (${((profitableBuys/buyTransactions.length)*100).toFixed(1)}%)`);
    console.log(`   Still Holding:          ${stillHolding} (${((stillHolding/buyTransactions.length)*100).toFixed(1)}%)`);
    console.log(`   All Sold:               ${allSold} (${((allSold/buyTransactions.length)*100).toFixed(1)}%)`);

    console.log('\n✅ BUY Transaction Check Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBuyTransactions();
