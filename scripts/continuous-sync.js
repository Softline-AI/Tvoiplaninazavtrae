import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEYS = [
  process.env.VITE_HELIUS_API_KEY_1,
  process.env.VITE_HELIUS_API_KEY_2,
  process.env.VITE_HELIUS_API_KEY_3
];
let currentKeyIndex = 0;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BIRDEYE_API_KEY = process.env.VITE_BIRDEYE_API_KEY;
const BATCH_SIZE = 5;
const SYNC_INTERVAL = 30000; // 30 seconds

function getNextApiKey() {
  const key = HELIUS_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % HELIUS_API_KEYS.length;
  return key;
}

async function getTokenPrice(mint) {
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${mint}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
          'x-chain': 'solana'
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data?.data?.value || 0;
    }
  } catch (error) {
    console.error(`Error fetching price for ${mint}:`, error.message);
  }
  return 0;
}

async function processTransaction(tx, walletAddress) {
  const { data: existing } = await supabase
    .from('webhook_transactions')
    .select('transaction_signature')
    .eq('transaction_signature', tx.signature)
    .maybeSingle();

  if (existing) return null;

  let tokenMint = null;
  let tokenAmount = 0;
  let solAmount = 0;
  let transactionType = 'SWAP';

  for (const transfer of tx.tokenTransfers || []) {
    if (transfer.mint !== 'So11111111111111111111111111111111111111112') {
      tokenMint = transfer.mint;

      if (transfer.toUserAccount === walletAddress) {
        tokenAmount = transfer.tokenAmount;
        transactionType = 'BUY';
      } else if (transfer.fromUserAccount === walletAddress) {
        tokenAmount = transfer.tokenAmount;
        transactionType = 'SELL';
      }
    } else {
      if (transfer.toUserAccount === walletAddress) {
        solAmount += transfer.tokenAmount;
      } else if (transfer.fromUserAccount === walletAddress) {
        solAmount -= transfer.tokenAmount;
      }
    }
  }

  if (!tokenMint) return null;

  const priceUsd = await getTokenPrice(tokenMint);

  const transactionData = {
    transaction_signature: tx.signature,
    block_time: new Date(tx.timestamp * 1000).toISOString(),
    transaction_type: transactionType,
    from_address: walletAddress,
    to_address: null,
    amount: tokenAmount,
    token_amount: tokenAmount,
    token_mint: tokenMint,
    token_symbol: tokenMint.slice(0, 6).toUpperCase(),
    token_name: 'Unknown Token',
    fee: tx.fee / 1_000_000_000,
    price_usd: priceUsd,
    current_token_price: priceUsd,
    sol_amount: solAmount,
    source: 'helius-sync'
  };

  return transactionData;
}

async function syncWalletTransactions(walletAddress) {
  try {
    const apiKey = getNextApiKey();
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=20&type=SWAP`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const transactions = await response.json();
    const recentTransactions = transactions.filter(tx => {
      const txTime = new Date(tx.timestamp * 1000);
      const hoursDiff = (Date.now() - txTime) / (1000 * 60 * 60);
      return hoursDiff < 2;
    });

    let inserted = 0;
    for (const tx of recentTransactions) {
      const txData = await processTransaction(tx, walletAddress);
      if (txData) {
        const { error } = await supabase
          .from('webhook_transactions')
          .insert([txData]);

        if (!error) {
          inserted++;
          console.log(`    ✅ Inserted: ${tx.signature.slice(0, 20)}... (${txData.transaction_type})`);
        }
      }
    }

    return inserted;
  } catch (error) {
    console.error(`  ❌ Error for ${walletAddress.slice(0, 8)}:`, error.message);
    return 0;
  }
}

async function syncAllWallets() {
  console.log('\n🔄 Starting sync cycle...');

  const { data: wallets, error } = await supabase
    .from('monitored_wallets')
    .select('wallet_address');

  if (error) {
    console.error('❌ Error fetching wallets:', error);
    return;
  }

  let totalInserted = 0;

  for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
    const batch = wallets.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(wallets.length / BATCH_SIZE)}`);

    const results = await Promise.all(
      batch.map(w => syncWalletTransactions(w.wallet_address))
    );

    totalInserted += results.reduce((sum, count) => sum + count, 0);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✨ Sync complete! Inserted ${totalInserted} new transactions`);
}

async function continuousSync() {
  console.log('🚀 Starting continuous sync...\n');

  while (true) {
    try {
      await syncAllWallets();
    } catch (error) {
      console.error('❌ Sync error:', error);
    }

    console.log(`\n⏳ Waiting ${SYNC_INTERVAL / 1000}s until next sync...\n`);
    await new Promise(resolve => setTimeout(resolve, SYNC_INTERVAL));
  }
}

continuousSync();
