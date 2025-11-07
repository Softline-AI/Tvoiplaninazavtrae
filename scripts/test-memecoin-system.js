import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MEMECOIN_CATEGORIES = {
  'Dog Memes': ['DOGE', 'SHIB', 'FLOKI', 'ELON', 'SAMO', 'BONK', 'WIF', 'MYRO', 'CHEEMS'],
  'Frog Memes': ['PEPE', 'APU', 'BOBO', 'WOJAK', 'PONKE', 'BOME'],
  'Cat Memes': ['POPCAT', 'MEW', 'CATCOIN', 'NEKO', 'SMOL'],
  'Political Memes': ['TRUMP', 'BIDEN', 'MAGA', 'TREMP', 'BODEN'],
  'AI/Tech Memes': ['TURBO', 'GROK', 'AI', 'GPT', 'CHATGPT', 'TRUTH'],
  'Solana Memes': ['WEN', 'SILLY', 'SLERF', 'SMOG', 'BOOK', 'ANALOS', 'HARAMBE']
};

const STABLECOINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USD1', 'PYUSD'];

function classifyToken(symbol) {
  const upper = symbol.toUpperCase();

  if (STABLECOINS.includes(upper)) {
    return { type: 'Stablecoin', isMemecoin: false };
  }

  for (const [category, tokens] of Object.entries(MEMECOIN_CATEGORIES)) {
    if (tokens.includes(upper)) {
      return { type: category, isMemecoin: true };
    }
  }

  if (symbol.length <= 6) {
    return { type: 'Unknown Meme', isMemecoin: true };
  }

  return { type: 'Unknown', isMemecoin: false };
}

async function analyzeTransactions() {
  console.log('🔍 Analyzing memecoin transactions...\n');

  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('*')
    .in('transaction_type', ['BUY', 'SELL'])
    .order('block_time', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching transactions:', error);
    return;
  }

  const stats = {
    total: transactions.length,
    memecoins: 0,
    stablecoins: 0,
    other: 0,
    categories: {},
    topMemecoins: {}
  };

  const walletMemecoins = new Map();

  for (const tx of transactions) {
    const classification = classifyToken(tx.token_symbol);

    if (classification.isMemecoin) {
      stats.memecoins++;

      if (!stats.categories[classification.type]) {
        stats.categories[classification.type] = 0;
      }
      stats.categories[classification.type]++;

      if (!stats.topMemecoins[tx.token_symbol]) {
        stats.topMemecoins[tx.token_symbol] = {
          count: 0,
          volume: 0,
          pnl: 0,
          category: classification.type
        };
      }
      stats.topMemecoins[tx.token_symbol].count++;
      stats.topMemecoins[tx.token_symbol].volume += parseFloat(tx.amount || 0);
      stats.topMemecoins[tx.token_symbol].pnl += parseFloat(tx.token_pnl || 0);

      const wallet = tx.from_address.substring(0, 8);
      if (!walletMemecoins.has(wallet)) {
        walletMemecoins.set(wallet, new Set());
      }
      walletMemecoins.get(wallet).add(tx.token_symbol);
    } else if (classification.type === 'Stablecoin') {
      stats.stablecoins++;
    } else {
      stats.other++;
    }
  }

  console.log('━'.repeat(80));
  console.log('📊 TRANSACTION BREAKDOWN');
  console.log('━'.repeat(80));
  console.log(`Total Transactions: ${stats.total}`);
  console.log(`Memecoins: ${stats.memecoins} (${((stats.memecoins/stats.total)*100).toFixed(1)}%)`);
  console.log(`Stablecoins: ${stats.stablecoins} (${((stats.stablecoins/stats.total)*100).toFixed(1)}%)`);
  console.log(`Other: ${stats.other} (${((stats.other/stats.total)*100).toFixed(1)}%)`);

  console.log('\n━'.repeat(80));
  console.log('🎯 MEMECOIN CATEGORIES');
  console.log('━'.repeat(80));
  const sortedCategories = Object.entries(stats.categories)
    .sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sortedCategories) {
    const percentage = ((count / stats.memecoins) * 100).toFixed(1);
    console.log(`${category.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
  }

  console.log('\n━'.repeat(80));
  console.log('🏆 TOP 10 MEMECOINS BY ACTIVITY');
  console.log('━'.repeat(80));
  const topMemes = Object.entries(stats.topMemecoins)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  for (const [symbol, data] of topMemes) {
    const pnlColor = data.pnl >= 0 ? '+' : '';
    console.log(`${symbol.padEnd(12)} | ${data.category.padEnd(18)} | Trades: ${data.count.toString().padStart(3)} | P&L: ${pnlColor}$${data.pnl.toFixed(2)}`);
  }

  console.log('\n━'.repeat(80));
  console.log('👥 TRADERS & MEMECOIN DIVERSITY');
  console.log('━'.repeat(80));
  const topTraders = Array.from(walletMemecoins.entries())
    .map(([wallet, tokens]) => ({ wallet, count: tokens.size, tokens: Array.from(tokens).slice(0, 5) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  for (const trader of topTraders) {
    console.log(`${trader.wallet}... | ${trader.count} different memecoins`);
    console.log(`  └─ ${trader.tokens.join(', ')}`);
  }

  console.log('\n━'.repeat(80));
  console.log('💰 MEMECOIN P&L ANALYSIS');
  console.log('━'.repeat(80));

  const pnlStats = Object.values(stats.topMemecoins);
  const totalPnl = pnlStats.reduce((sum, m) => sum + m.pnl, 0);
  const profitableCoins = pnlStats.filter(m => m.pnl > 0).length;
  const losingCoins = pnlStats.filter(m => m.pnl < 0).length;

  console.log(`Total Memecoin P&L: $${totalPnl.toFixed(2)}`);
  console.log(`Profitable: ${profitableCoins} (${((profitableCoins/pnlStats.length)*100).toFixed(1)}%)`);
  console.log(`Losing: ${losingCoins} (${((losingCoins/pnlStats.length)*100).toFixed(1)}%)`);

  const bestMeme = topMemes.reduce((best, curr) => curr[1].pnl > best[1].pnl ? curr : best, topMemes[0]);
  const worstMeme = topMemes.reduce((worst, curr) => curr[1].pnl < worst[1].pnl ? curr : worst, topMemes[0]);

  console.log(`\n🚀 Best Performer: ${bestMeme[0]} (+$${bestMeme[1].pnl.toFixed(2)})`);
  console.log(`📉 Worst Performer: ${worstMeme[0]} ($${worstMeme[1].pnl.toFixed(2)})`);

  console.log('\n✅ Analysis Complete!\n');
}

analyzeTransactions();
