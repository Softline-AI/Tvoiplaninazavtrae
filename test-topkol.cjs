const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://swugviyjmqchbriosjoa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dWd2aXlqbXFjaGJyaW9zam9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODEwMDgsImV4cCI6MjA3NTQ1NzAwOH0.GoI9Bpyei_HilNFSitQCrTtE-eI0FwWUlRPaXmGxo_c';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing TopKOLTokens query...');

  const now = new Date();
  const timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: transactions, error } = await supabase
    .from('webhook_transactions')
    .select('token_symbol, token_mint, from_address, transaction_type, amount, token_pnl, token_pnl_percentage, current_token_price')
    .neq('token_symbol', 'UNKNOWN')
    .in('transaction_type', ['BUY', 'SELL'])
    .gte('block_time', timeFilter.toISOString());

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total transactions:', transactions.length);

  const tokenMap = new Map();

  transactions.forEach(tx => {
    if (!tx.token_symbol) return;

    if (!tokenMap.has(tx.token_symbol)) {
      tokenMap.set(tx.token_symbol, {
        symbol: tx.token_symbol,
        mint: tx.token_mint,
        kols: new Set(),
        trades: 0,
        buyVolume: 0,
        sellVolume: 0
      });
    }

    const stats = tokenMap.get(tx.token_symbol);
    stats.kols.add(tx.from_address);
    stats.trades++;

    const amount = parseFloat(tx.amount || '0');
    if (tx.transaction_type === 'BUY') {
      stats.buyVolume += amount;
    } else if (tx.transaction_type === 'SELL') {
      stats.sellVolume += amount;
    }
  });

  const tokensWithMultipleKOLs = Array.from(tokenMap.values())
    .filter(t => t.kols.size >= 2)
    .sort((a, b) => b.kols.size - a.kols.size);

  console.log('\nTop 10 tokens by KOL count:');
  tokensWithMultipleKOLs.slice(0, 10).forEach((token, i) => {
    console.log((i + 1) + '. ' + token.symbol + ' - ' + token.kols.size + ' KOLs, ' + token.trades + ' trades');
  });
})();
