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

async function fetchTransactions() {
  try {
    console.log('🔍 Fetching transactions from Supabase...\n');

    // Получаем последние 50 транзакций
    const { data: transactions, error } = await supabase
      .from('webhook_transactions')
      .select('*')
      .in('transaction_type', ['BUY', 'SELL'])
      .order('block_time', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return;
    }

    if (!transactions || transactions.length === 0) {
      console.log('⚠️  No transactions found');
      return;
    }

    console.log(`✅ Found ${transactions.length} transactions\n`);
    console.log('━'.repeat(120));

    // Группируем транзакции по кошелькам
    const walletMap = new Map();

    transactions.forEach(tx => {
      const walletKey = tx.from_address;
      if (!walletMap.has(walletKey)) {
        walletMap.set(walletKey, []);
      }
      walletMap.get(walletKey).push(tx);
    });

    // Получаем информацию о кошельках
    const { data: wallets } = await supabase
      .from('monitored_wallets')
      .select('wallet_address, label, twitter_handle');

    const walletInfoMap = new Map();
    wallets?.forEach(w => {
      walletInfoMap.set(w.wallet_address, w);
    });

    // Выводим транзакции по кошелькам
    let txCount = 0;
    for (const [walletAddress, txList] of walletMap.entries()) {
      const walletInfo = walletInfoMap.get(walletAddress);
      const walletLabel = walletInfo?.label || walletAddress.substring(0, 8);
      const twitterHandle = walletInfo?.twitter_handle || 'N/A';

      console.log(`\n👤 Trader: ${walletLabel}`);
      console.log(`   Twitter: ${twitterHandle}`);
      console.log(`   Wallet: ${walletAddress}`);
      console.log('   ' + '─'.repeat(110));

      txList.forEach(tx => {
        txCount++;
        const timestamp = new Date(tx.block_time).toLocaleString();
        const action = tx.transaction_type;
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
        const actionIcon = action === 'BUY' ? '🟢 BUY ' : '🔴 SELL';

        console.log(`\n   ${txCount}. ${actionIcon} | ${tx.token_symbol} | ${timestamp}`);
        console.log(`      Token:          ${tx.token_symbol} (${tx.token_mint?.substring(0, 8)}...)`);
        console.log(`      Amount:         ${amount} tokens`);
        console.log(`      Entry Price:    $${entryPrice}`);
        console.log(`      Current Price:  $${currentPrice}`);
        console.log(`      Market Cap:     ${marketCapFormatted}`);
        console.log(`      Remaining:      ${remainingTokens} tokens`);
        console.log(`      ${pnlColor} P&L:            $${tokenPnl} (${tokenPnlPercentage}%)`);
        console.log(`      TX Signature:   ${tx.transaction_signature?.substring(0, 16)}...`);
      });

      console.log('   ' + '─'.repeat(110));
    }

    console.log('\n' + '━'.repeat(120));
    console.log(`\n📊 Total Transactions Displayed: ${txCount}`);
    console.log(`📈 Total Unique Traders: ${walletMap.size}\n`);

    // Статистика по P&L
    const totalPnl = transactions.reduce((sum, tx) => sum + parseFloat(tx.token_pnl || '0'), 0);
    const profitableTx = transactions.filter(tx => parseFloat(tx.token_pnl || '0') > 0).length;
    const avgPnl = totalPnl / transactions.length;

    console.log('💰 P&L Statistics:');
    console.log(`   Total P&L:          $${totalPnl.toFixed(2)}`);
    console.log(`   Average P&L:        $${avgPnl.toFixed(2)}`);
    console.log(`   Profitable Trades:  ${profitableTx}/${transactions.length} (${((profitableTx/transactions.length)*100).toFixed(1)}%)`);

    // BUY vs SELL статистика
    const buyTx = transactions.filter(tx => tx.transaction_type === 'BUY').length;
    const sellTx = transactions.filter(tx => tx.transaction_type === 'SELL').length;

    console.log('\n📈 Transaction Type Distribution:');
    console.log(`   BUY transactions:   ${buyTx} (${((buyTx/transactions.length)*100).toFixed(1)}%)`);
    console.log(`   SELL transactions:  ${sellTx} (${((sellTx/transactions.length)*100).toFixed(1)}%)`);

    console.log('\n✅ P&L Check Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Запуск
fetchTransactions();
