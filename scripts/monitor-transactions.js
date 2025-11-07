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

let lastCheckedTime = new Date();
const seenTransactions = new Set();

async function notifyZeroPnl(transaction, walletInfo) {
  const traderName = walletInfo?.label || transaction.from_address.substring(0, 8);
  console.log(`\n⚠️  ZERO P&L ALERT`);
  console.log(`   Trader: ${traderName}`);
  console.log(`   Token: ${transaction.token_symbol}`);
  console.log(`   Type: ${transaction.transaction_type}`);
  console.log(`   Amount: ${parseFloat(transaction.amount).toFixed(2)} tokens`);
  console.log(`   Entry: $${parseFloat(transaction.entry_price).toFixed(8)}`);
  console.log(`   Exit: $${parseFloat(transaction.current_token_price).toFixed(8)}`);
  console.log(`   Instant flip detected - bought and sold at same price`);
}

async function notifyProfitableTrade(transaction, walletInfo) {
  const traderName = walletInfo?.label || transaction.from_address.substring(0, 8);
  const pnl = parseFloat(transaction.token_pnl || 0);
  const pnlPercentage = parseFloat(transaction.token_pnl_percentage || 0);

  if (pnl > 100) {
    console.log(`\n🎉 BIG WIN ALERT!`);
  } else if (pnl > 10) {
    console.log(`\n💰 PROFITABLE TRADE ALERT`);
  } else {
    return;
  }

  console.log(`   Trader: ${traderName}`);
  console.log(`   Token: ${transaction.token_symbol}`);
  console.log(`   Type: ${transaction.transaction_type}`);
  console.log(`   P&L: $${pnl.toFixed(2)} (${pnlPercentage.toFixed(2)}%)`);
  console.log(`   Entry: $${parseFloat(transaction.entry_price).toFixed(8)}`);
  console.log(`   Current: $${parseFloat(transaction.current_token_price).toFixed(8)}`);
  console.log(`   Time: ${new Date(transaction.block_time).toLocaleString()}`);
}

async function checkNegativeTokens(transaction, walletInfo) {
  const remaining = parseFloat(transaction.remaining_tokens || 0);

  if (remaining < -1000000) {
    const traderName = walletInfo?.label || transaction.from_address.substring(0, 8);
    console.log(`\n⚠️  LARGE NEGATIVE BALANCE DETECTED`);
    console.log(`   Trader: ${traderName}`);
    console.log(`   Token: ${transaction.token_symbol}`);
    console.log(`   Remaining: ${remaining.toFixed(2)} tokens`);
    console.log(`   This may indicate multiple sells without tracked buys`);
    console.log(`   Transaction: ${transaction.transaction_signature?.substring(0, 16)}...`);
  }
}

async function monitorTransactions() {
  try {
    const { data: wallets } = await supabase
      .from('monitored_wallets')
      .select('wallet_address, label, twitter_handle');

    const walletInfoMap = new Map();
    wallets?.forEach(w => {
      walletInfoMap.set(w.wallet_address, w);
    });

    const { data: transactions, error } = await supabase
      .from('webhook_transactions')
      .select('*')
      .in('transaction_type', ['BUY', 'SELL'])
      .gte('block_time', lastCheckedTime.toISOString())
      .order('block_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return;
    }

    if (!transactions || transactions.length === 0) {
      return;
    }

    const newTransactions = transactions.filter(tx => !seenTransactions.has(tx.id));

    if (newTransactions.length === 0) {
      return;
    }

    console.log(`\n${'━'.repeat(80)}`);
    console.log(`📊 New Transactions: ${newTransactions.length}`);
    console.log(`   Time: ${new Date().toLocaleString()}`);
    console.log(`${'━'.repeat(80)}`);

    for (const tx of newTransactions) {
      seenTransactions.add(tx.id);
      const walletInfo = walletInfoMap.get(tx.from_address);

      const pnl = parseFloat(tx.token_pnl || 0);
      const pnlPercentage = parseFloat(tx.token_pnl_percentage || 0);

      if (pnl === 0 && tx.transaction_type === 'SELL') {
        await notifyZeroPnl(tx, walletInfo);
      }

      if (pnl > 10) {
        await notifyProfitableTrade(tx, walletInfo);
      }

      await checkNegativeTokens(tx, walletInfo);
    }

    const latestTx = transactions[0];
    if (latestTx) {
      lastCheckedTime = new Date(latestTx.block_time);
    }

    const buyCount = newTransactions.filter(tx => tx.transaction_type === 'BUY').length;
    const sellCount = newTransactions.filter(tx => tx.transaction_type === 'SELL').length;
    const totalPnl = newTransactions.reduce((sum, tx) => sum + parseFloat(tx.token_pnl || 0), 0);

    console.log(`\n📈 Summary:`);
    console.log(`   BUY: ${buyCount}, SELL: ${sellCount}`);
    console.log(`   Total P&L: $${totalPnl.toFixed(2)}`);
    console.log(`   Next check in 60 seconds...`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function analyzeTokenBalances() {
  try {
    console.log('\n🔍 Analyzing token balances across all wallets...\n');

    const { data: transactions } = await supabase
      .from('webhook_transactions')
      .select('from_address, token_mint, token_symbol, transaction_type, amount, remaining_tokens')
      .in('transaction_type', ['BUY', 'SELL'])
      .order('block_time', { ascending: true });

    const walletTokenBalances = new Map();

    transactions?.forEach(tx => {
      const key = `${tx.from_address}-${tx.token_mint}`;

      if (!walletTokenBalances.has(key)) {
        walletTokenBalances.set(key, {
          wallet: tx.from_address,
          token: tx.token_symbol,
          balance: 0,
          buys: 0,
          sells: 0
        });
      }

      const balance = walletTokenBalances.get(key);

      if (tx.transaction_type === 'BUY') {
        balance.balance += parseFloat(tx.amount || 0);
        balance.buys++;
      } else if (tx.transaction_type === 'SELL') {
        balance.balance -= parseFloat(tx.amount || 0);
        balance.sells++;
      }
    });

    console.log('Token Balances (showing issues):');
    console.log('─'.repeat(80));

    let issueCount = 0;
    for (const [key, balance] of walletTokenBalances.entries()) {
      if (balance.balance < -1000) {
        issueCount++;
        console.log(`⚠️  ${balance.wallet.substring(0, 8)}... | ${balance.token}`);
        console.log(`   Balance: ${balance.balance.toFixed(2)} tokens`);
        console.log(`   BUYs: ${balance.buys}, SELLs: ${balance.sells}`);
        console.log('');
      }
    }

    if (issueCount === 0) {
      console.log('✅ No significant balance issues detected');
    } else {
      console.log(`Found ${issueCount} tokens with negative balances`);
      console.log('Note: Negative balances may indicate sells before tracked buys');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

console.log('🚀 Transaction Monitor Started');
console.log('━'.repeat(80));
console.log('Monitoring for:');
console.log('  - Zero P&L trades (instant flips)');
console.log('  - Profitable trades > $10');
console.log('  - Token balance issues');
console.log('━'.repeat(80));

await analyzeTokenBalances();

console.log('\n⏰ Starting real-time monitoring...\n');

await monitorTransactions();

const intervalId = setInterval(async () => {
  await monitorTransactions();
}, 60000);

process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping monitor...');
  clearInterval(intervalId);
  process.exit(0);
});
