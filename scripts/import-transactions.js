import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const HELIUS_API_KEY = process.env.VITE_HELIUS_API_KEY_1 || '23820805-b04f-45a2-9d4b-e70d588bd406';
const BIRDEYE_API_KEY = process.env.VITE_BIRDEYE_API_KEY || 'a6296c5f82664e92aadffe9e99773d73';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WALLETS = [
  '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f',
  'GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN',
  'DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt',
  '9yYya3F5EJoLnBNKW6z4bZvyQytMXzDcpU5D6yYr4jqL',
  '3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei',
  '4cXnf2z85UiZ5cyKsPMEULq1yufAtpkatmX4j4DBZqj2',
  'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o',
  'FL4j8EEMAPUjrvASnqX7VdpWZJji1LFsAxwojhpueUYt',
  'CA4keXLtGJWBcsWivjtMFBghQ8pFsGRWFxLrRCtirzu5',
  '8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR',
  'HvDf4Cxd2evdYueLhK5LoaiEvDXFXgb1uRrkoYPdvHfH',
  '86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD'
];

async function fetchTokenMetadata(tokenMint) {
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`Birdeye API error for ${tokenMint}: ${response.status}`);
      return { symbol: 'UNKNOWN', name: 'Unknown', price: 0 };
    }

    const data = await response.json();
    return {
      symbol: data?.data?.symbol || 'UNKNOWN',
      name: data?.data?.name || 'Unknown',
      price: data?.data?.price || 0
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return { symbol: 'UNKNOWN', name: 'Unknown', price: 0 };
  }
}

async function getHeliusTransactions(walletAddress, limit = 100) {
  try {
    const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Helius API error: ${response.status}`);
      return [];
    }

    const transactions = await response.json();
    console.log(`Fetched ${transactions.length} transactions for ${walletAddress.substring(0, 8)}...`);

    return transactions;
  } catch (error) {
    console.error('Error fetching Helius transactions:', error);
    return [];
  }
}

function parseHeliusTransaction(tx, walletAddress) {
  try {
    const type = tx.type?.toUpperCase() || 'UNKNOWN';

    let transactionType = 'UNKNOWN';
    if (type === 'SWAP') {
      if (tx.tokenTransfers && tx.tokenTransfers.length >= 2) {
        const solTransfer = tx.tokenTransfers.find(t => t.mint === 'So11111111111111111111111111111111111111112');
        if (solTransfer) {
          if (solTransfer.fromUserAccount === walletAddress) transactionType = 'BUY';
          else if (solTransfer.toUserAccount === walletAddress) transactionType = 'SELL';
          else transactionType = 'SWAP';
        } else {
          transactionType = 'SWAP';
        }
      } else {
        transactionType = 'SWAP';
      }
    }
    else if (type === 'TRANSFER' && tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const transfer = tx.tokenTransfers.find(t => t.fromUserAccount === walletAddress);
      if (transfer) transactionType = 'SELL';
      else transactionType = 'BUY';
    }
    else if (['TOKEN_MINT', 'FILL_ORDER', 'BUY_ITEM'].includes(type)) transactionType = 'BUY';
    else transactionType = type;

    let tokenMint = 'unknown';
    let tokenSymbol = null;
    let amount = 0;

    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const transfer = tx.tokenTransfers.find(t =>
        t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
      );

      if (transfer) {
        tokenMint = transfer.mint;
        tokenSymbol = transfer.tokenStandard || null;
        amount = transfer.tokenAmount || 0;
      }
    }

    if (tokenMint === 'unknown' || !tokenMint || tokenMint.length < 32) {
      return null;
    }

    return {
      signature: tx.signature,
      timestamp: tx.timestamp,
      feePayer: tx.feePayer,
      type: transactionType,
      tokenMint,
      tokenSymbol,
      amount,
      fee: tx.fee || 0,
      from: walletAddress,
    };
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return null;
  }
}

async function importTransactionsForWallet(walletAddress, label) {
  console.log(`\n=== Importing transactions for ${label} (${walletAddress.substring(0, 8)}...) ===`);

  const transactions = await getHeliusTransactions(walletAddress, 50);

  if (transactions.length === 0) {
    console.log('No transactions found');
    return 0;
  }

  let imported = 0;
  let skipped = 0;

  for (const tx of transactions) {
    const parsed = parseHeliusTransaction(tx, walletAddress);

    if (!parsed) {
      skipped++;
      continue;
    }

    const { data: existing } = await supabase
      .from('webhook_transactions')
      .select('id')
      .eq('transaction_signature', parsed.signature)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const tokenMetadata = await fetchTokenMetadata(parsed.tokenMint);
    const currentPrice = tokenMetadata.price;

    await new Promise(resolve => setTimeout(resolve, 100));

    const { error } = await supabase
      .from('webhook_transactions')
      .insert({
        transaction_signature: parsed.signature,
        block_time: new Date(parsed.timestamp * 1000).toISOString(),
        from_address: parsed.from,
        to_address: 'unknown',
        amount: parsed.amount.toString(),
        token_mint: parsed.tokenMint,
        token_symbol: tokenMetadata.symbol,
        transaction_type: parsed.type,
        fee: parsed.fee,
        token_pnl: '0',
        token_pnl_percentage: '0',
        current_token_price: currentPrice.toString(),
        entry_price: currentPrice.toString(),
        raw_data: tx,
      });

    if (error) {
      console.error(`Error inserting transaction: ${error.message}`);
    } else {
      imported++;
      console.log(`✓ Imported ${parsed.type} ${tokenMetadata.symbol} ($${(parsed.amount * currentPrice).toFixed(2)})`);
    }
  }

  console.log(`Imported: ${imported}, Skipped: ${skipped}`);
  return imported;
}

async function main() {
  console.log('Starting transaction import...\n');

  let totalImported = 0;

  for (const wallet of WALLETS) {
    const { data: walletData } = await supabase
      .from('monitored_wallets')
      .select('label')
      .eq('wallet_address', wallet)
      .maybeSingle();

    const label = walletData?.label || wallet.substring(0, 8);

    const imported = await importTransactionsForWallet(wallet, label);
    totalImported += imported;

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Total transactions imported: ${totalImported}`);
}

main().catch(console.error);
