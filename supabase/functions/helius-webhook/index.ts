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
    tokenAmount: number;
    mint: string;
    tokenStandard?: string;
  }>;
  accountData?: Array<{
    account: string;
    nativeBalanceChange?: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
    }>;
  }>;
}

function validateAmount(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

async function loadTokenList(): Promise<any> {
  const now = Date.now();
  if (tokenListCache && (now - tokenListCacheTime) < TOKEN_LIST_CACHE_DURATION) {
    return tokenListCache;
  }

  try {
    const response = await fetch(SOLANA_TOKEN_LIST_URL);
    if (response.ok) {
      const data = await response.json();
      tokenListCache = data;
      tokenListCacheTime = now;
      console.log(`Loaded token list with ${data.tokens?.length || 0} tokens`);
      return data;
    }
  } catch (error) {
    console.error("Error loading token list:", error);
  }

  return tokenListCache || { tokens: [] };
}

async function fetchTokenMetadata(
  supabase: any,
  tokenMint: string
): Promise<{ symbol: string; name: string; price: number; marketCap: number; logoUrl: string | null }> {
  try {
    const { data: cachedMetadata, error: cacheError } = await supabase
      .from("token_metadata")
      .select("*")
      .eq("token_mint", tokenMint)
      .maybeSingle();

    let symbol = "UNKNOWN";
    let name = "Unknown Token";
    let logoUrl = null;
    let price = 0;
    let marketCap = 0;

    if (cachedMetadata) {
      const cacheAge = Date.now() - new Date(cachedMetadata.last_updated).getTime();
      const cacheMaxAge = CACHE_DURATION_MINUTES * 60 * 1000;

      if (cacheAge < cacheMaxAge) {
        return {
          symbol: cachedMetadata.symbol || "UNKNOWN",
          name: cachedMetadata.name || "Unknown Token",
          price: parseFloat(cachedMetadata.price || "0"),
          marketCap: parseFloat(cachedMetadata.market_cap || "0"),
          logoUrl: cachedMetadata.logo_url
        };
      }
    }

    const tokenList = await loadTokenList();
    const tokenInfo = tokenList.tokens?.find((t: any) => t.address === tokenMint);
    if (tokenInfo) {
      symbol = tokenInfo.symbol || symbol;
      name = tokenInfo.name || name;
      logoUrl = tokenInfo.logoURI || null;
    }

    try {
      const birdeyeUrl = `https://public-api.birdeye.so/defi/price?address=${tokenMint}`;
      const birdeyeResponse = await fetch(birdeyeUrl, {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      });

      if (birdeyeResponse.ok) {
        const birdeyeData = await birdeyeResponse.json();
        if (birdeyeData.success && birdeyeData.data) {
          price = birdeyeData.data.value || 0;
          marketCap = birdeyeData.data.marketCap || 0;
        }
      }
    } catch (error) {
      console.error("Error fetching price from Birdeye:", error);
    }

    const metadataToCache = {
      token_mint: tokenMint,
      symbol,
      name,
      logo_url: logoUrl,
      price: price.toString(),
      market_cap: marketCap.toString(),
      last_updated: new Date().toISOString()
    };

    await supabase
      .from("token_metadata")
      .upsert(metadataToCache, { onConflict: "token_mint" });

    return { symbol, name, price, marketCap, logoUrl };
  } catch (error) {
    console.error("Error in fetchTokenMetadata:", error);
    return {
      symbol: "UNKNOWN",
      name: "Unknown Token",
      price: 0,
      marketCap: 0,
      logoUrl: null
    };
  }
}

function extractPreliminaryData(data: HeliusWebhookData): { fromAddress: string | null } {
  let fromAddress = data.feePayer || null;

  if (!fromAddress && data.accountData && data.accountData.length > 0) {
    const mainAccount = data.accountData.find(acc => acc.nativeBalanceChange && acc.nativeBalanceChange < 0);
    if (mainAccount) {
      fromAddress = mainAccount.account;
    }
  }

  if (!fromAddress && data.tokenTransfers && data.tokenTransfers.length > 0) {
    fromAddress = data.tokenTransfers[0].fromUserAccount;
  }

  return { fromAddress };
}

function determineTransactionType(data: HeliusWebhookData, walletAddress: string): "BUY" | "SELL" | null {
  if (!data.accountData || data.accountData.length === 0) {
    return null;
  }

  const walletAccount = data.accountData.find(acc => acc.account === walletAddress);
  if (!walletAccount) {
    return null;
  }

  if (!walletAccount.tokenBalanceChanges || walletAccount.tokenBalanceChanges.length === 0) {
    return null;
  }

  const primaryTokenChange = walletAccount.tokenBalanceChanges[0];
  const tokenAmountChange = parseFloat(primaryTokenChange.rawTokenAmount.tokenAmount);

  if (tokenAmountChange > 0) {
    return "BUY";
  } else if (tokenAmountChange < 0) {
    return "SELL";
  }

  return null;
}

function extractTransactionData(
  data: HeliusWebhookData,
  walletAddress: string
): {
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint: string;
  tokenSymbol: string;
  solAmount: number;
  nativeBalanceChange: number;
} {
  let fromAddress = walletAddress;
  let toAddress = "";
  let amount = 0;
  let tokenMint = "";
  let tokenSymbol = "UNKNOWN";
  let solAmount = 0;
  let nativeBalanceChange = 0;

  if (data.accountData && data.accountData.length > 0) {
    const walletAccount = data.accountData.find(acc => acc.account === walletAddress);
    if (walletAccount) {
      if (walletAccount.nativeBalanceChange) {
        nativeBalanceChange = walletAccount.nativeBalanceChange / 1e9;
        solAmount = Math.abs(nativeBalanceChange);
      }

      if (walletAccount.tokenBalanceChanges && walletAccount.tokenBalanceChanges.length > 0) {
        const primaryTokenChange = walletAccount.tokenBalanceChanges[0];
        tokenMint = primaryTokenChange.mint;
        const rawAmount = parseFloat(primaryTokenChange.rawTokenAmount.tokenAmount);
        const decimals = primaryTokenChange.rawTokenAmount.decimals;
        amount = rawAmount / Math.pow(10, decimals);
      }
    }

    const counterpartyAccount = data.accountData.find(acc => 
      acc.account !== walletAddress && 
      acc.tokenBalanceChanges && 
      acc.tokenBalanceChanges.length > 0
    );
    if (counterpartyAccount) {
      toAddress = counterpartyAccount.account;
    }
  }

  if (data.tokenTransfers && data.tokenTransfers.length > 0) {
    const relevantTransfer = data.tokenTransfers.find(
      t => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
    );

    if (relevantTransfer) {
      if (!tokenMint) {
        tokenMint = relevantTransfer.mint;
      }
      if (amount === 0) {
        amount = relevantTransfer.tokenAmount;
      }
      if (relevantTransfer.fromUserAccount === walletAddress) {
        toAddress = relevantTransfer.toUserAccount;
      } else {
        fromAddress = relevantTransfer.fromUserAccount;
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
    nativeBalanceChange,
  };
}

async function calculateTokenPnl(
  supabase: any,
  transactionType: string,
  walletAddress: string,
  tokenMint: string,
  currentAmount: number,
  currentPrice: number
): Promise<{
  tokenPnl: number;
  tokenPnlPercentage: number;
  entryPrice: number;
  remainingTokens: number;
  allTokensSold: boolean;
}> {
  try {
    const { data: previousTransactions, error } = await supabase
      .from("webhook_transactions")
      .select("*")
      .eq("from_address", walletAddress)
      .eq("token_mint", tokenMint)
      .order("block_time", { ascending: true });

    if (error) {
      console.error("Error fetching previous transactions:", error);
      return {
        tokenPnl: 0,
        tokenPnlPercentage: 0,
        entryPrice: currentPrice,
        remainingTokens: transactionType === "BUY" ? Math.abs(currentAmount) : 0,
        allTokensSold: false
      };
    }

    let totalBought = 0;
    let totalSpentOnBuys = 0;
    let totalSold = 0;
    let totalReceivedFromSells = 0;

    for (const tx of previousTransactions) {
      const amount = Math.abs(parseFloat(tx.amount || "0"));
      const price = parseFloat(tx.current_token_price || "0");

      if (tx.transaction_type === "BUY") {
        totalBought += amount;
        totalSpentOnBuys += amount * price;
      } else if (tx.transaction_type === "SELL") {
        totalSold += amount;
        totalReceivedFromSells += amount * price;
      }
    }

    const absCurrentAmount = Math.abs(currentAmount);

    if (transactionType === "BUY") {
      totalBought += absCurrentAmount;
      totalSpentOnBuys += absCurrentAmount * currentPrice;
    } else if (transactionType === "SELL") {
      totalSold += absCurrentAmount;
      totalReceivedFromSells += absCurrentAmount * currentPrice;
    }

    const remainingTokens = totalBought - totalSold;
    const allTokensSold = remainingTokens <= 0.0001;

    let tokenPnl = 0;
    let tokenPnlPercentage = 0;
    let entryPrice = 0;

    if (totalBought > 0) {
      entryPrice = totalSpentOnBuys / totalBought;
    }

    if (allTokensSold) {
      tokenPnl = totalReceivedFromSells - totalSpentOnBuys;
      tokenPnlPercentage = totalSpentOnBuys > 0 
        ? (tokenPnl / totalSpentOnBuys) * 100 
        : 0;
    } else {
      const currentValue = remainingTokens * currentPrice;
      tokenPnl = (totalReceivedFromSells + currentValue) - totalSpentOnBuys;
      tokenPnlPercentage = totalSpentOnBuys > 0 
        ? (tokenPnl / totalSpentOnBuys) * 100 
        : 0;
    }

    return {
      tokenPnl,
      tokenPnlPercentage,
      entryPrice,
      remainingTokens,
      allTokensSold
    };
  } catch (error) {
    console.error("Error calculating P&L:", error);
    return {
      tokenPnl: 0,
      tokenPnlPercentage: 0,
      entryPrice: currentPrice,
      remainingTokens: transactionType === "BUY" ? Math.abs(currentAmount) : 0,
      allTokensSold: false
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const rawData = await req.json();
    const transactions: HeliusWebhookData[] = Array.isArray(rawData) ? rawData : [rawData];

    console.log(`\n🔔 Webhook received: ${transactions.length} transaction(s)`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = [];

    for (const data of transactions) {
      console.log(`\n📦 Processing: ${data.type} | Signature: ${data.signature?.substring(0, 16)}...`);

      const preliminaryData = extractPreliminaryData(data);

      if (!preliminaryData.fromAddress) {
        console.log(`No from_address found, skipping`);
        results.push({ status: 'skipped', reason: 'No from_address' });
        continue;
      }

      const { data: monitoredWallet } = await supabase
        .from("monitored_wallets")
        .select("*")
        .eq("wallet_address", preliminaryData.fromAddress)
        .maybeSingle();

      if (!monitoredWallet) {
        console.log(`Wallet ${preliminaryData.fromAddress} is not monitored, skipping`);
        results.push({ status: 'skipped', reason: 'Wallet not monitored' });
        continue;
      }

      const { fromAddress, toAddress, amount, tokenMint, tokenSymbol, solAmount, nativeBalanceChange } =
        extractTransactionData(data, preliminaryData.fromAddress);

      const transactionType = determineTransactionType(data, fromAddress);

      if (!transactionType) {
        console.log(`Transaction type could not be determined or is not BUY/SELL, skipping`);
        results.push({ status: 'skipped', reason: 'Transaction type not supported' });
        continue;
      }

      const tokenMetadata = await fetchTokenMetadata(supabase, tokenMint);
      const currentPrice = tokenMetadata.price;
      const realTokenSymbol = tokenMetadata.symbol;
      const marketCap = tokenMetadata.marketCap;

      console.log(`Transaction Type: ${transactionType} | Token: ${realTokenSymbol} @ $${currentPrice} | MC: $${marketCap}`);

      const { tokenPnl, tokenPnlPercentage, entryPrice, remainingTokens, allTokensSold } = await calculateTokenPnl(
        supabase,
        transactionType,
        fromAddress,
        tokenMint,
        amount,
        currentPrice
      );

      console.log(`Calculated P&L: $${tokenPnl} (${tokenPnlPercentage}%) | Remaining: ${remainingTokens} | All Sold: ${allTokensSold}`);

      console.log(`SOL Amount: ${solAmount} | Native Balance Change: ${nativeBalanceChange}`);

      const transactionData = {
        transaction_signature: data.signature || `${data.type}-${Date.now()}`,
        block_time: data.timestamp
          ? new Date(data.timestamp * 1000).toISOString()
          : new Date().toISOString(),
        from_address: fromAddress,
        to_address: toAddress,
        amount: amount.toString(),
        token_mint: tokenMint,
        token_symbol: realTokenSymbol,
        token_name: tokenMetadata.name,
        transaction_type: transactionType,
        fee: data.fee || 0,
        sol_amount: solAmount.toString(),
        native_balance_change: nativeBalanceChange.toString(),
        token_pnl: tokenPnl.toString(),
        token_pnl_percentage: tokenPnlPercentage.toString(),
        current_token_price: currentPrice.toString(),
        entry_price: entryPrice.toString(),
        market_cap: marketCap.toString(),
        remaining_tokens: remainingTokens.toString(),
        all_tokens_sold: allTokensSold,
        raw_data: data,
      };

      const { error } = await supabase
        .from("webhook_transactions")
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error("Error inserting transaction:", error);
        results.push({ status: 'error', error: error.message, signature: data.signature });
        continue;
      }

      console.log(`✅ Transaction saved: ${transactionType} ${realTokenSymbol}`);
      results.push({ status: 'success', transactionType, token: realTokenSymbol, signature: data.signature });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});