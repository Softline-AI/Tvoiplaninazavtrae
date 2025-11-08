const https = require('https');

const WEBHOOK_URL = 'https://swugviyjmqchbriosjoa.supabase.co/functions/v1/helius-webhook';
const WEBHOOK_SECRET = 'stalker-helius-webhook-2024-secure-key';

// Test webhook with a mock transaction
const mockTransaction = [{
  type: "SWAP",
  signature: "test-signature-" + Date.now(),
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
  description: "Test transaction from webhook test script",
  source: "test"
}];

console.log('🧪 Testing Webhook Endpoint\n');
console.log('URL:', WEBHOOK_URL);
console.log('');

const data = JSON.stringify(mockTransaction);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'X-Webhook-Secret': WEBHOOK_SECRET
  }
};

const req = https.request(WEBHOOK_URL, options, (res) => {
  console.log('✅ Response Status:', res.statusCode);
  console.log('');

  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', responseBody);
    console.log('');

    if (res.statusCode === 200) {
      console.log('✅ Webhook endpoint is working!');
    } else {
      console.log('❌ Webhook returned error status');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error testing webhook:', error.message);
  console.error('');
  console.error('Possible issues:');
  console.error('1. Edge Function not deployed');
  console.error('2. Network connectivity problem');
  console.error('3. URL incorrect');
});

req.write(data);
req.end();

console.log('Sending test transaction...\n');
