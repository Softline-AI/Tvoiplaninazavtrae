const https = require('https');

const WEBHOOK_URL = 'https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook';

// Test webhook WITHOUT secret (like Helius does)
const mockTransaction = [{
  type: "SWAP",
  signature: "test-no-secret-" + Date.now(),
  timestamp: Math.floor(Date.now() / 1000),
  feePayer: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR",
  fee: 5000,
  tokenTransfers: [{
    fromUserAccount: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR",
    toUserAccount: "TestAccount123",
    mint: "So11111111111111111111111111111111111111112",
    tokenAmount: 1.5
  }, {
    fromUserAccount: "TestAccount123",
    toUserAccount: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR",
    mint: "TestTokenMint123",
    tokenAmount: 1000
  }],
  nativeTransfers: [{
    fromUserAccount: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR",
    toUserAccount: "TestAccount123",
    amount: 1500000000
  }],
  accountData: [{
    account: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR",
    nativeBalanceChange: -1500000000,
    tokenBalanceChanges: [{
      mint: "TestTokenMint123",
      rawTokenAmount: {
        tokenAmount: "1000000000000",
        decimals: 9
      },
      userAccount: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR"
    }]
  }],
  description: "Test transaction WITHOUT secret (like Helius)",
  source: "test"
}];

console.log('🧪 Testing Webhook WITHOUT Secret (Helius style)\n');
console.log('URL:', WEBHOOK_URL);
console.log('');

const data = JSON.stringify(mockTransaction);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
    // NO X-Webhook-Secret header!
  }
};

const req = https.request(WEBHOOK_URL, options, (res) => {
  console.log('Response Status:', res.statusCode);
  console.log('');

  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', responseBody);
    console.log('');

    if (res.statusCode === 200) {
      console.log('✅ Webhook accepts requests without secret!');
      console.log('✅ Helius can now send data successfully!');
    } else if (res.statusCode === 401) {
      console.log('❌ Still requires secret - Edge Function not updated yet');
      console.log('   Need to redeploy the function');
    } else {
      console.log(`⚠️ Unexpected status: ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();

console.log('Sending test transaction (NO secret)...\n');
