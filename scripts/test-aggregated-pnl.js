import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateAggregatedPnl(walletAddress) {
  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('*')
    .eq('from_address', walletAddress)
    .in('transaction_type', ['BUY', 'SELL'])
    .order('block_time', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Group by token
  const tokenPositions = new Map();

  for (const tx of transactions) {
    const tokenMint = tx.token_mint;
    const amount = parseFloat(tx.amount || '0');
    const price = parseFloat(tx.current_token_price || '0');

    if (!tokenPositions.has(tokenMint)) {
      tokenPositions.set(tokenMint, {
        symbol: tx.token_symbol,
        totalBought: 0,
        totalBuyValue: 0,
        totalSold: 0,
        totalSellValue: 0,
        buyCount: 0,
        sellCount: 0,
        trades: []
      });
    }

    const position = tokenPositions.get(tokenMint);

    if (tx.transaction_type === 'BUY') {
      position.totalBought += amount;
      position.totalBuyValue += amount * price;
      position.buyCount++;
      position.trades.push({
        type: 'BUY',
        amount,
        price,
        time: new Date(tx.block_time).toLocaleString()
      });
    } else if (tx.transaction_type === 'SELL') {
      position.totalSold += amount;
      position.totalSellValue += amount * price;
      position.sellCount++;
      position.trades.push({
        type: 'SELL',
        amount,
        price,
        time: new Date(tx.block_time).toLocaleString()
      });
    }
  }

  return tokenPositions;
}

async function displayAggregatedPnl() {
  console.log('🔍 Testing Aggregated P&L Calculation\n');

  // Test with a wallet that has multiple sells of the same token
  const { data: wallets } = await supabase
    .from('monitored_wallets')
    .select('wallet_address, label')
    .limit(5);

  if (!wallets || wallets.length === 0) {
    console.log('No wallets found');
    return;
  }

  for (const wallet of wallets) {
    console.log('\n' + '━'.repeat(100));
    console.log(`👤 Trader: ${wallet.label || wallet.wallet_address.substring(0, 8)}`);
    console.log('━'.repeat(100));

    const positions = await calculateAggregatedPnl(wallet.wallet_address);

    if (positions.size === 0) {
      console.log('   No positions found');
      continue;
    }

    // Find tokens with multiple sells
    const multiSellTokens = Array.from(positions.entries())
      .filter(([_, pos]) => pos.sellCount > 1)
      .sort((a, b) => b[1].sellCount - a[1].sellCount);

    if (multiSellTokens.length === 0) {
      console.log('   No tokens with multiple sells');
      continue;
    }

    console.log(`\n📊 Tokens with Multiple Sells: ${multiSellTokens.length}\n`);

    for (const [tokenMint, position] of multiSellTokens.slice(0, 3)) {
      const avgEntryPrice = position.totalBuyValue / position.totalBought;
      const avgExitPrice = position.totalSellValue / position.totalSold;
      const remainingTokens = position.totalBought - position.totalSold;

      // Calculate realized P&L (from sells)
      const soldCostBasis = position.totalSold * avgEntryPrice;
      const realizedPnl = position.totalSellValue - soldCostBasis;
      const realizedPnlPct = (realizedPnl / soldCostBasis) * 100;

      console.log(`🪙 ${position.symbol.padEnd(12)} (${position.buyCount} buys, ${position.sellCount} sells)`);
      console.log('   ─────────────────────────────────────────────────────────');
      console.log(`   Total Bought:      ${position.totalBought.toFixed(2)} tokens`);
      console.log(`   Total Sold:        ${position.totalSold.toFixed(2)} tokens`);
      console.log(`   Remaining:         ${remainingTokens.toFixed(2)} tokens`);
      console.log(`   Avg Entry Price:   $${avgEntryPrice.toFixed(8)}`);
      console.log(`   Avg Exit Price:    $${avgExitPrice.toFixed(8)}`);

      const pnlColor = realizedPnl >= 0 ? '🟢' : '🔴';
      const pnlSign = realizedPnl >= 0 ? '+' : '';
      console.log(`   ${pnlColor} Realized P&L:     ${pnlSign}$${realizedPnl.toFixed(2)} (${pnlSign}${realizedPnlPct.toFixed(2)}%)`);

      console.log('\n   Trade History:');
      position.trades.forEach((trade, idx) => {
        const emoji = trade.type === 'BUY' ? '🟢' : '🔴';
        console.log(`     ${idx + 1}. ${emoji} ${trade.type.padEnd(4)} | ${trade.amount.toFixed(2).padStart(12)} @ $${trade.price.toFixed(8)} | ${trade.time}`);
      });

      console.log('');
    }
  }

  console.log('\n' + '━'.repeat(100));
  console.log('✅ Aggregated P&L Test Complete');
  console.log('━'.repeat(100) + '\n');
}

displayAggregatedPnl();
