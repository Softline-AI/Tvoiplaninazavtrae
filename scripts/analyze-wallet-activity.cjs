const axios = require('axios');

const HELIUS_API_KEY = '23820805-b04f-45a2-9d4b-e70d588bd406';
const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';

const KNOWN_KOLS = [
  { name: 'casino616', address: '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR' },
  { name: 'GOOD TRADER 7', address: 'RFSqPtn1JfavGiUD4HJsZyYXvZsycxf31hnYfbyG6iB' },
  { name: 'Cupsey 3', address: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f' }
];

async function analyzeWalletActivity(walletName, walletAddress) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Analyzing: ${walletName}`);
    console.log(`📍 Address: ${walletAddress}`);
    console.log('='.repeat(60));

    const url = `${HELIUS_BASE_URL}/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=50`;

    const response = await axios.get(url);
    const transactions = response.data;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.log('❌ No transactions found');
      return;
    }

    console.log(`\n✅ Found ${transactions.length} recent transactions\n`);

    const typeCount = {};
    transactions.forEach(tx => {
      typeCount[tx.type] = (typeCount[tx.type] || 0) + 1;
    });

    console.log('📈 Transaction Types:');
    Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = ((count / transactions.length) * 100).toFixed(1);
        console.log(`  ${type.padEnd(15)} ${count.toString().padStart(3)} (${percentage}%)`);
      });

    const swaps = transactions.filter(tx => tx.type === 'SWAP');
    console.log(`\n🔄 Recent SWAP Activity: ${swaps.length} swaps found\n`);

    if (swaps.length > 0) {
      const uniqueTokens = new Set();

      swaps.slice(0, 10).forEach((swap, index) => {
        const time = new Date(swap.timestamp * 1000);
        const minutesAgo = Math.round((Date.now() - time.getTime()) / 60000);

        console.log(`${index + 1}. Swap ${minutesAgo}m ago`);
        console.log(`   Sig: ${swap.signature.slice(0, 20)}...`);

        if (swap.tokenTransfers && swap.tokenTransfers.length > 0) {
          swap.tokenTransfers.forEach(transfer => {
            uniqueTokens.add(transfer.mint);
            const direction = transfer.fromUserAccount === walletAddress ? '→ OUT' : '← IN';
            console.log(`   ${direction} ${transfer.tokenAmount.toLocaleString()} tokens`);
            console.log(`   Token: ${transfer.mint.slice(0, 12)}...`);
          });
        }
        console.log('');
      });

      console.log(`💎 Unique tokens traded: ${uniqueTokens.size}`);

      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      const oneDayAgo = now - (24 * 60 * 60 * 1000);

      const swapsLastHour = swaps.filter(tx => tx.timestamp * 1000 >= oneHourAgo);
      const swapsLastDay = swaps.filter(tx => tx.timestamp * 1000 >= oneDayAgo);

      console.log(`\n⏰ Activity Timeline:`);
      console.log(`  Last hour: ${swapsLastHour.length} swaps`);
      console.log(`  Last 24h: ${swapsLastDay.length} swaps`);

      if (swaps.length > 0) {
        const timestamps = swaps.map(tx => tx.timestamp * 1000);
        const avgInterval = timestamps.length > 1
          ? (Math.max(...timestamps) - Math.min(...timestamps)) / (timestamps.length - 1)
          : 0;

        const avgMinutes = Math.round(avgInterval / 60000);
        console.log(`  Avg swap interval: ${avgMinutes} minutes`);
      }
    }

    const latestTx = transactions[0];
    const latestTime = new Date(latestTx.timestamp * 1000);
    const minutesAgo = Math.round((Date.now() - latestTime.getTime()) / 60000);

    console.log(`\n🕐 Last Activity: ${minutesAgo} minutes ago`);
    console.log(`   Type: ${latestTx.type}`);
    console.log(`   Time: ${latestTime.toLocaleString()}`);

  } catch (error) {
    console.error(`\n❌ Error analyzing ${walletName}:`, error.response?.data || error.message);
  }
}

async function compareKOLActivity() {
  console.log('\n\n' + '='.repeat(60));
  console.log('🏆 KOL Activity Comparison');
  console.log('='.repeat(60));

  const results = [];

  for (const kol of KNOWN_KOLS) {
    try {
      const url = `${HELIUS_BASE_URL}/addresses/${kol.address}/transactions?api-key=${HELIUS_API_KEY}&limit=50`;
      const response = await axios.get(url);
      const transactions = response.data;

      const swaps = transactions.filter(tx => tx.type === 'SWAP');
      const latestSwap = swaps[0];

      results.push({
        name: kol.name,
        totalTx: transactions.length,
        swapCount: swaps.length,
        lastActivity: latestSwap ? Math.round((Date.now() - (latestSwap.timestamp * 1000)) / 60000) : 999999
      });

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error fetching ${kol.name}:`, error.message);
    }
  }

  results.sort((a, b) => a.lastActivity - b.lastActivity);

  console.log('\nMost Recent Activity:\n');
  results.forEach((result, index) => {
    const activity = result.lastActivity < 999999 ? `${result.lastActivity}m ago` : 'No swaps';
    console.log(`${index + 1}. ${result.name.padEnd(20)} | Swaps: ${result.swapCount.toString().padStart(2)} | Last: ${activity}`);
  });
}

(async () => {
  console.log('🚀 Starting Wallet Activity Analysis...\n');

  for (const kol of KNOWN_KOLS) {
    await analyzeWalletActivity(kol.name, kol.address);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await compareKOLActivity();

  console.log('\n\n✅ Analysis complete!\n');
})();
