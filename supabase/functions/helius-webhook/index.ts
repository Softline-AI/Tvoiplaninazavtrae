import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret",
};

const BIRDEYE_API_KEY = "a6296c5f82664e92aadffe9e99773d73";
const CACHE_DURATION_MINUTES = 5;
const SOLANA_TOKEN_LIST_URL = "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json";

let tokenListCache: any = null;
let tokenListCacheTime = 0;
const TOKEN_LIST_CACHE_DURATION = 60 * 60 * 1000;

interface HeliusWebhookData {
  type: string;
  signature?: string;
  timestamp?: number;
  feePayer?: string;
  fee?: number;
  amount?: number;
  from?: string;
  to?: string;
  tokenMint?: string;
  tokenSymbol?: string;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard?: string;
  }>;
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
      userAccount: string;
    }>;
  }>;
  description?: string;
  source?: string;
}

interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const tokenMetadataCache = new Map<string, { data: TokenMetadata | null; timestamp: number }>();

async function getTokenListData(): Promise<any> {
  const now = Date.now();

  if (tokenListCache && (now - tokenListCacheTime) < TOKEN_LIST_CACHE_DURATION) {
    return tokenListCache;
  }

  try {
    console.log('Fetching Solana token list...');
    const response = await fetch(SOLANA_TOKEN_LIST_URL);
    if (response.ok) {
      tokenListCache = await response.json();
      tokenListCacheTime = now;
      console.log(`Token list loaded: ${tokenListCache?.tokens?.length || 0} tokens`);
      return tokenListCache;
    }
  } catch (error) {
    console.error('Error fetching token list:', error);
  }

  return tokenListCache;
}

async function getTokenMetadata(mint: string): Promise<TokenMetadata | null> {
  const cached = tokenMetadataCache.get(mint);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < (CACHE_DURATION_MINUTES * 60 * 1000)) {
    return cached.data;
  }

  try {
    const tokenList = await getTokenListData();
    if (tokenList?.tokens) {
      const token = tokenList.tokens.find((t: any) => t.address === mint);
      if (token) {
        const metadata: TokenMetadata = {
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI
        };
        tokenMetadataCache.set(mint, { data: metadata, timestamp: now });
        return metadata;
      }
    }

    const birdeyeUrl = `https://public-api.birdeye.so/defi/token_overview?address=${mint}`;
    const response = await fetch(birdeyeUrl, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data) {
        const metadata: TokenMetadata = {
          symbol: data.data.symbol || mint.slice(0, 6).toUpperCase(),
          name: data.data.name || 'Unknown Token',
          decimals: data.data.decimals || 9,
          logoURI: data.data.logoURI
        };
        tokenMetadataCache.set(mint, { data: metadata, timestamp: now });
        return metadata;
      }
    }
  } catch (error) {
    console.error(`Error fetching token metadata for ${mint}:`, error);
  }

  const fallback: TokenMetadata = {
    symbol: mint.slice(0, 6).toUpperCase(),
    name: 'Unknown Token',
    decimals: 9
  };
  tokenMetadataCache.set(mint, { data: fallback, timestamp: now });
  return fallback;
}

async function getTokenPrice(mint: string): Promise<number | null> {
  try {
    const birdeyeUrl = `https://public-api.birdeye.so/defi/price?address=${mint}`;
    const response = await fetch(birdeyeUrl, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.value) {
        return data.data.value;
      }
    }
  } catch (error) {
    console.error(`Error fetching token price for ${mint}:`, error);
  }

  return null;
}

async function getMarketCap(mint: string): Promise<number | null> {
  try {
    const birdeyeUrl = `https://public-api.birdeye.so/defi/token_overview?address=${mint}`;
    const response = await fetch(birdeyeUrl, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.mc) {
        return data.data.mc;
      }
    }
  } catch (error) {
    console.error(`Error fetching market cap for ${mint}:`, error);
  }

  return null;
}

async function calculateTokenPnL(
  supabase: any,
  walletAddress: string,
  tokenMint: string,
  currentTransaction: {
    type: string;
    amount: number;
    priceUsd: number;
    solAmount: number;
  }
): Promise<{
  tokenPnl: number;
  tokenPnlPercentage: number;
  remainingTokens: number;
  allTokensSold: boolean;
  entryPrice: number;
}> {
  try {
    const { data: transactions, error } = await supabase
      .from("webhook_transactions")
      .select("transaction_type, token_amount, price_usd, sol_amount")
      .eq("from_address", walletAddress)
      .eq("token_mint", tokenMint)
      .in("transaction_type", ["BUY", "SELL"])
      .order("block_time", { ascending: true });

    if (error) {
      console.error("Error fetching transaction history:", error);
      return {
        tokenPnl: 0,
        tokenPnlPercentage: 0,
        remainingTokens: 0,
        allTokensSold: false,
        entryPrice: currentTransaction.priceUsd || 0,
      };
    }

    let totalBought = 0;
    let totalSold = 0;
    let totalCostUsd = 0;
    let totalRevenueUsd = 0;
    let totalSolSpent = 0;
    let totalSolReceived = 0;

    const allTransactions = [...(transactions || []), currentTransaction];

    for (const tx of allTransactions) {
      if (tx.transaction_type === "BUY") {
        totalBought += tx.amount || 0;
        totalCostUsd += (tx.amount || 0) * (tx.priceUsd || 0);
        totalSolSpent += Math.abs(tx.solAmount || 0);
      } else if (tx.transaction_type === "SELL") {
        totalSold += tx.amount || 0;
        totalRevenueUsd += (tx.amount || 0) * (tx.priceUsd || 0);
        totalSolReceived += Math.abs(tx.solAmount || 0);
      }
    }

    const remainingTokens = totalBought - totalSold;
    const allTokensSold = remainingTokens <= 0;

    let tokenPnl = 0;
    let tokenPnlPercentage = 0;
    const entryPrice = totalBought > 0 ? totalCostUsd / totalBought : 0;

    if (allTokensSold) {
      tokenPnl = totalRevenueUsd - totalCostUsd;
      tokenPnlPercentage = totalCostUsd > 0 ? (tokenPnl / totalCostUsd) * 100 : 0;
    } else {
      const realizedPnl = totalRevenueUsd - (totalSold / totalBought) * totalCostUsd;
      const unrealizedValue = remainingTokens * (currentTransaction.priceUsd || 0);
      const unrealizedCost = (remainingTokens / totalBought) * totalCostUsd;
      const unrealizedPnl = unrealizedValue - unrealizedCost;
      tokenPnl = realizedPnl + unrealizedPnl;
      tokenPnlPercentage = totalCostUsd > 0 ? (tokenPnl / totalCostUsd) * 100 : 0;
    }

    return {
      tokenPnl: parseFloat(tokenPnl.toFixed(2)),
      tokenPnlPercentage: parseFloat(tokenPnlPercentage.toFixed(2)),
      remainingTokens: parseFloat(remainingTokens.toFixed(2)),
      allTokensSold,
      entryPrice: parseFloat(entryPrice.toFixed(6)),
    };
  } catch (error) {
    console.error("Error calculating token P&L:", error);
    return {
      tokenPnl: 0,
      tokenPnlPercentage: 0,
      remainingTokens: 0,
      allTokensSold: false,
      entryPrice: 0,
    };
  }
}

function determineTransactionType(data: HeliusWebhookData, walletAddress: string): string | null {
  const type = data.type?.toUpperCase() || "UNKNOWN";

  console.log(`\n🔍 Analyzing transaction type: ${type} for wallet ${walletAddress.slice(0, 8)}...`);

  let solReceived = false;
  let solSent = false;
  let tokenReceived = false;
  let tokenSent = false;

  if (data.tokenTransfers && data.tokenTransfers.length > 0) {
    console.log(`📦 Token transfers found: ${data.tokenTransfers.length}`);

    for (const transfer of data.tokenTransfers) {
      const isSol = transfer.mint === "So11111111111111111111111111111111111111112";
      const tokenSymbol = transfer.tokenStandard || transfer.mint?.slice(0, 8);

      if (transfer.toUserAccount === walletAddress) {
        if (isSol) {
          solReceived = true;
          console.log(`  ← Received SOL: ${transfer.tokenAmount}`);
        } else {
          tokenReceived = true;
          console.log(`  ← Received token ${tokenSymbol}: ${transfer.tokenAmount}`);
        }
      }

      if (transfer.fromUserAccount === walletAddress) {
        if (isSol) {
          solSent = true;
          console.log(`  → Sent SOL: ${transfer.tokenAmount}`);
        } else {
          tokenSent = true;
          console.log(`  → Sent token ${tokenSymbol}: ${transfer.tokenAmount}`);
        }
      }
    }
  }

  if (data.accountData && data.accountData.length > 0) {
    const walletAccount = data.accountData.find(acc => acc.account === walletAddress);

    if (walletAccount) {
      if (walletAccount.nativeBalanceChange) {
        const solChange = walletAccount.nativeBalanceChange / 1_000_000_000;
        if (solChange > 0) {
          solReceived = true;
          console.log(`  ← Native balance increased: ${solChange.toFixed(4)} SOL`);
        }
        if (solChange < 0) {
          solSent = true;
          console.log(`  → Native balance decreased: ${Math.abs(solChange).toFixed(4)} SOL`);
        }
      }

      if (walletAccount.tokenBalanceChanges) {
        for (const balanceChange of walletAccount.tokenBalanceChanges) {
          if (balanceChange.mint === "So11111111111111111111111111111111111111112") {
            continue;
          }

          const amount = parseFloat(balanceChange.rawTokenAmount.tokenAmount);
          const decimals = balanceChange.rawTokenAmount.decimals;
          const readableAmount = amount / Math.pow(10, decimals);

          if (amount > 0) {
            tokenReceived = true;
            console.log(`  ← Token balance increased: ${readableAmount.toFixed(2)}`);
          }
          if (amount < 0) {
            tokenSent = true;
            console.log(`  → Token balance decreased: ${Math.abs(readableAmount).toFixed(2)}`);
          }
        }
      }
    }
  }

  console.log(`📊 Analysis: SOL sent=${solSent}, SOL received=${solReceived}, Token sent=${tokenSent}, Token received=${tokenReceived}`);

  if (tokenReceived && solSent) {
    console.log("✅ BUY detected: Token IN + SOL OUT");
    return "BUY";
  }

  if (solReceived && tokenSent) {
    console.log("✅ SELL detected: SOL IN + Token OUT");
    return "SELL";
  }

  if (tokenReceived && !tokenSent && !solReceived) {
    console.log("✅ BUY detected: Only token received");
    return "BUY";
  }

  if (tokenSent && !tokenReceived && !solSent) {
    console.log("✅ SELL detected: Only token sent");
    return "SELL";
  }

  if (tokenReceived && tokenSent) {
    console.log("⚠️ SWAP detected: Token-to-token");
    return "SWAP";
  }

  if (type === "TOKEN_MINT") {
    console.log("✅ TOKEN_MINT detected as BUY");
    return "BUY";
  }

  if (type === "TRANSFER" || type === "SOL_TRANSFER") {
    console.log("ℹ️ Pure TRANSFER, skipping");
    return null;
  }

  console.log(`⚠️ Could not determine transaction type for ${type}, returning ${type}`);
  return type;
}

function extractTransactionData(
  data: HeliusWebhookData,
  walletAddress: string
): {
  fromAddress: string | null;
  toAddress: string | null;
  amount: number;
  tokenMint: string | null;
  tokenSymbol: string | null;
  solAmount: number;
  nativeBalanceChange: number;
} {
  let fromAddress: string | null = null;
  let toAddress: string | null = null;
  let amount = 0;
  let tokenMint: string | null = null;
  let tokenSymbol: string | null = null;
  let solAmount = 0;
  let nativeBalanceChange = 0;

  if (data.tokenTransfers && data.tokenTransfers.length > 0) {
    const tokenTransfer = data.tokenTransfers.find(
      (t) => t.mint !== "So11111111111111111111111111111111111111112"
    );

    if (tokenTransfer) {
      fromAddress = tokenTransfer.fromUserAccount;
      toAddress = tokenTransfer.toUserAccount;
      amount = tokenTransfer.tokenAmount || 0;
      tokenMint = tokenTransfer.mint;
      tokenSymbol = tokenTransfer.tokenStandard;
    }
  }

  if (!fromAddress && data.accountData && data.accountData.length > 0) {
    for (const account of data.accountData) {
      if (account.tokenBalanceChanges && account.tokenBalanceChanges.length > 0) {
        const tokenChange = account.tokenBalanceChanges[0];
        fromAddress = account.account;
        tokenMint = tokenChange.mint;

        const rawAmount = tokenChange.rawTokenAmount.tokenAmount;
        const decimals = tokenChange.rawTokenAmount.decimals;
        amount = parseFloat(rawAmount) / Math.pow(10, decimals);
        break;
      }
    }
  }

  const monitoredWalletAddr = fromAddress || toAddress || walletAddress;

  if (data.nativeTransfers && data.nativeTransfers.length > 0) {
    for (const transfer of data.nativeTransfers) {
      const solValue = transfer.amount / 1_000_000_000;

      if (transfer.fromUserAccount === monitoredWalletAddr) {
        solAmount -= solValue;
      }
      if (transfer.toUserAccount === monitoredWalletAddr) {
        solAmount += solValue;
      }
    }
  }

  if (data.accountData && data.accountData.length > 0) {
    const walletAccount = data.accountData.find(acc => acc.account === monitoredWalletAddr);
    if (walletAccount && walletAccount.nativeBalanceChange) {
      nativeBalanceChange = walletAccount.nativeBalanceChange / 1_000_000_000;
      if (Math.abs(nativeBalanceChange) > Math.abs(solAmount)) {
        solAmount = nativeBalanceChange;
      }
    }
  }

  return {
    fromAddress,
    toAddress,
    amount,
    tokenMint,
    tokenSymbol,
    solAmount,
    nativeBalanceChange
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("HELIUS_WEBHOOK_SECRET");

    if (webhookSecret && webhookSecret !== expectedSecret) {
      console.error("Unauthorized webhook request - invalid secret");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (webhookSecret) {
      console.log("✅ Webhook secret verified");
    } else {
      console.log("ℹ️ No webhook secret provided (Helius webhook)");
    }

    const payload = await req.json();
    console.log("\n" + "=".repeat(60));
    console.log("🔔 Received webhook payload");
    console.log("=".repeat(60));

    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn("Invalid payload format or empty array");
      return new Response(JSON.stringify({ message: "No transactions in payload" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: HeliusWebhookData = payload[0];

    console.log(`Type: ${data.type}`);
    console.log(`Signature: ${data.signature}`);
    console.log(`Fee Payer: ${data.feePayer}`);
    console.log(`Description: ${data.description || 'N/A'}`);

    const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(JSON.stringify({ message: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: monitoredWallets, error: walletsError } = await supabase
      .from("monitored_wallets")
      .select("wallet_address");

    if (walletsError) {
      console.error("Error fetching monitored wallets:", walletsError);
      return new Response(JSON.stringify({ message: "Error fetching wallets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const monitoredAddresses = monitoredWallets?.map(w => w.wallet_address) || [];
    console.log(`\n📋 Monitoring ${monitoredAddresses.length} wallets`);

    const involvedWallet = monitoredAddresses.find(addr =>
      data.feePayer === addr ||
      data.from === addr ||
      data.to === addr ||
      data.nativeTransfers?.some(t => t.fromUserAccount === addr || t.toUserAccount === addr) ||
      data.tokenTransfers?.some(t => t.fromUserAccount === addr || t.toUserAccount === addr)
    );

    if (!involvedWallet) {
      console.warn("Transaction does not involve any monitored wallet");
      return new Response(JSON.stringify({ message: "Wallet not monitored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`\n✅ Found monitored wallet: ${involvedWallet}`);

    const transactionType = determineTransactionType(data, involvedWallet);

    if (!transactionType) {
      console.log("⏭️ Skipping transaction - not a relevant type");
      return new Response(JSON.stringify({ message: "Transaction type not relevant" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      fromAddress,
      toAddress,
      amount,
      tokenMint,
      tokenSymbol: rawTokenSymbol,
      solAmount,
      nativeBalanceChange
    } = extractTransactionData(data, involvedWallet);

    if (!tokenMint) {
      console.warn("No token mint found in transaction");
      return new Response(JSON.stringify({ message: "No token mint found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`\n💎 Token: ${tokenMint}`);
    console.log(`Amount: ${amount}`);
    console.log(`SOL Amount: ${solAmount}`);

    const metadata = await getTokenMetadata(tokenMint);
    const tokenSymbol = metadata?.symbol || rawTokenSymbol || tokenMint.slice(0, 6).toUpperCase();
    const tokenName = metadata?.name || "Unknown Token";
    const tokenDecimals = metadata?.decimals || 9;
    const tokenLogo = metadata?.logoURI;

    console.log(`Symbol: ${tokenSymbol}`);
    console.log(`Name: ${tokenName}`);

    const priceUsd = await getTokenPrice(tokenMint);
    const marketCap = await getMarketCap(tokenMint);

    console.log(`Price: $${priceUsd?.toFixed(6) || 'N/A'}`);
    console.log(`Market Cap: $${marketCap?.toLocaleString() || 'N/A'}`);

    const pnlData = await calculateTokenPnL(
      supabase,
      fromAddress || involvedWallet,
      tokenMint,
      {
        type: transactionType,
        amount,
        priceUsd: priceUsd || 0,
        solAmount
      }
    );

    console.log(`\n📊 P&L Calculation:`);
    console.log(`  Token P&L: $${pnlData.tokenPnl}`);
    console.log(`  P&L %: ${pnlData.tokenPnlPercentage}%`);
    console.log(`  Remaining Tokens: ${pnlData.remainingTokens}`);
    console.log(`  All Sold: ${pnlData.allTokensSold}`);

    const transactionData = {
      transaction_signature: data.signature || "",
      block_time: data.timestamp
        ? new Date(data.timestamp * 1000).toISOString()
        : new Date().toISOString(),
      transaction_type: transactionType,
      from_address: fromAddress || involvedWallet,
      to_address: toAddress,
      amount: amount,
      token_amount: amount,
      token_mint: tokenMint,
      token_symbol: tokenSymbol,
      token_name: tokenName,
      token_decimals: tokenDecimals,
      token_logo: tokenLogo,
      fee: data.fee ? data.fee / 1_000_000_000 : 0,
      price_usd: priceUsd,
      current_token_price: priceUsd,
      market_cap: marketCap,
      description: data.description,
      source: data.source || "helius",
      sol_amount: solAmount,
      native_balance_change: nativeBalanceChange,
      token_pnl: pnlData.tokenPnl.toString(),
      token_pnl_percentage: pnlData.tokenPnlPercentage.toString(),
      remaining_tokens: pnlData.remainingTokens.toString(),
      all_tokens_sold: pnlData.allTokensSold,
    };

    const { error: insertError } = await supabase
      .from("webhook_transactions")
      .upsert([transactionData], {
        onConflict: 'transaction_signature',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error("Error inserting transaction:", insertError);
      return new Response(
        JSON.stringify({ message: "Error saving transaction", error: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`✅ Transaction ${data.signature} saved successfully`);

    return new Response(
      JSON.stringify({ message: "Transaction processed successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});