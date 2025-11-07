import dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_URL = 'https://mjktfqrcklwpfzgonqmb.supabase.co/functions/v1/helius-webhook';

// Mock transaction data to test webhook
const mockTransaction = [
  {
    type: 'SWAP',
    signature: 'test-signature-' + Date.now(),
    timestamp: Math.floor(Date.now() / 1000),
    feePayer: '8BseXT9EtoEhBTKFFYkwTnjKSUZwhtmdKY2Jrj8j45Rt',
    fee: 5000,
    accountData: [
      {
        account: '8BseXT9EtoEhBTKFFYkwTnjKSUZwhtmdKY2Jrj8j45Rt',
        nativeBalanceChange: -100000000, // -0.1 SOL
        tokenBalanceChanges: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            rawTokenAmount: {
              tokenAmount: '1000000',
              decimals: 6
            }
          }
        ]
      }
    ],
    tokenTransfers: [
      {
        fromUserAccount: '8BseXT9EtoEhBTKFFYkwTnjKSUZwhtmdKY2Jrj8j45Rt',
        toUserAccount: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        tokenAmount: 1,
        mint: 'So11111111111111111111111111111111111111112'
      }
    ]
  }
];

async function testWebhook() {
  console.log('🧪 Testing webhook endpoint...\n');
  console.log(`URL: ${WEBHOOK_URL}\n`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.HELIUS_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify(mockTransaction)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log('\nResponse:');
    console.log(responseText);

    if (response.ok) {
      console.log('\n✅ Webhook is working!');
      try {
        const json = JSON.parse(responseText);
        console.log('\nProcessed:', json.processed);
        console.log('Results:', JSON.stringify(json.results, null, 2));
      } catch (e) {
        // Response might not be JSON
      }
    } else {
      console.log('\n❌ Webhook returned an error');
    }

  } catch (error) {
    console.error('\n❌ Error testing webhook:', error.message);
  }
}

testWebhook();
