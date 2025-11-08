const axios = require('axios');

const HELIUS_API_KEY = '23820805-b04f-45a2-9d4b-e70d588bd406';
const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';

const TEST_ADDRESS = '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR';

async function testAddressTransactionHistory() {
  try {
    console.log('\n=== Testing Helius Address Transaction History API ===\n');
    console.log(`📍 Address: ${TEST_ADDRESS}`);
    console.log(`🔑 Using API Key: ${HELIUS_API_KEY.slice(0, 8)}...`);

    const url = `${HELIUS_BASE_URL}/addresses/${TEST_ADDRESS}/transactions?api-key=${HELIUS_API_KEY}&limit=10`;

    console.log(`\n🔄 Fetching transaction history...`);
    console.log(`URL: ${url.replace(HELIUS_API_KEY, 'API_KEY')}\n`);

    const response = await axios.get(url);

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`✅ Success! Retrieved ${response.data.length} transactions\n`);

      console.log('=== First 3 Transactions ===\n');
      response.data.slice(0, 3).forEach((tx, index) => {
        console.log(`Transaction ${index + 1}:`);
        console.log(`  Signature: ${tx.signature}`);
        console.log(`  Type: ${tx.type}`);
        console.log(`  Timestamp: ${tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'N/A'}`);
        console.log(`  Fee: ${tx.fee} lamports`);
        console.log(`  Status: ${tx.status || 'success'}`);
        console.log(`  Description: ${tx.description || 'N/A'}`);

        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          console.log(`  Token Transfers: ${tx.tokenTransfers.length}`);
          tx.tokenTransfers.slice(0, 2).forEach((transfer, i) => {
            console.log(`    ${i + 1}. ${transfer.mint?.slice(0, 8)}... - ${transfer.tokenAmount || 0}`);
          });
        }

        console.log('');
      });

      console.log('\n=== Transaction Type Summary ===');
      const typeCounts = response.data.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      }, {});

      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

      const swapTransactions = response.data.filter(tx => tx.type === 'SWAP');
      console.log(`\n📊 SWAP transactions: ${swapTransactions.length}/${response.data.length}`);

      if (swapTransactions.length > 0) {
        console.log('\n=== First SWAP Transaction Details ===');
        const swap = swapTransactions[0];
        console.log(`Signature: ${swap.signature}`);
        console.log(`Description: ${swap.description}`);

        if (swap.tokenTransfers) {
          console.log('Token Transfers:');
          swap.tokenTransfers.forEach((transfer, i) => {
            console.log(`  ${i + 1}. From: ${transfer.fromUserAccount?.slice(0, 8)}...`);
            console.log(`     To: ${transfer.toUserAccount?.slice(0, 8)}...`);
            console.log(`     Mint: ${transfer.mint?.slice(0, 8)}...`);
            console.log(`     Amount: ${transfer.tokenAmount}`);
          });
        }
      }

    } else {
      console.log('❌ Unexpected response format');
      console.log('Response:', response.data);
    }

  } catch (error) {
    console.error('\n❌ Error testing Helius API:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

async function testParsedSwapTransactions() {
  try {
    console.log('\n\n=== Testing Parsed SWAP Transactions ===\n');

    const url = `${HELIUS_BASE_URL}/addresses/${TEST_ADDRESS}/transactions?api-key=${HELIUS_API_KEY}&limit=20&type=SWAP`;

    console.log(`🔄 Fetching only SWAP transactions...\n`);

    const response = await axios.get(url);

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`✅ Retrieved ${response.data.length} SWAP transactions\n`);

      response.data.slice(0, 5).forEach((tx, index) => {
        console.log(`SWAP ${index + 1}:`);
        console.log(`  Signature: ${tx.signature?.slice(0, 16)}...`);
        console.log(`  Time: ${tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'N/A'}`);
        console.log(`  Description: ${tx.description || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('\n❌ Error testing parsed transactions:');
    console.error(error.response?.data || error.message);
  }
}

console.log('🚀 Starting Helius API Integration Test...\n');

(async () => {
  await testAddressTransactionHistory();
  await testParsedSwapTransactions();

  console.log('\n✅ Test completed!\n');
})();
