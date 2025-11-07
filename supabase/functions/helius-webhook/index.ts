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
    let logoUrl: string | null = null;

    if (cachedMetadata) {
      symbol = cachedMetadata.token_symbol || "UNKNOWN";
      name = cachedMetadata.token_name || "Unknown Token";
      logoUrl = cachedMetadata.logo_url;
    }

    if (!cachedMetadata || !logoUrl) {
      const tokenList = await loadTokenList();
      const tokenInfo = tokenList?.tokens?.find(
        (t: any) => t.address?.toLowerCase() === tokenMint.toLowerCase()
      );

      if (tokenInfo) {
        symbol = tokenInfo.symbol || symbol;
        name = tokenInfo.name || name;
        logoUrl = tokenInfo.logoURI || logoUrl;
      }
    }

    const price = await getTokenPriceWithCache(supabase, tokenMint, symbol);

    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    let marketCap = 0;
    if (response.ok) {
      const data = await response.json();
      marketCap = data?.data?.mc || 0;

      if (!symbol || symbol === "UNKNOWN") {
        symbol = data?.data?.symbol || "UNKNOWN";
      }
      if (!name || name === "Unknown Token") {
        name = data?.data?.name || "Unknown Token";
      }
    }

    if (!logoUrl && data?.data?.logoURI) {
      await supabase.from("token_metadata").upsert({
        token_mint: tokenMint,
        token_symbol: symbol,
        token_name: name,
        logo_url: data.data.logoURI,
        decimals: data.data.decimals || 0,
        last_updated: new Date().toISOString(),
      }, { onConflict: "token_mint" });
    }

    return { symbol, name, price, marketCap, logoUrl: logoUrl || data?.data?.logoURI || null };
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return { symbol: "UNKNOWN", name: "Unknown Token", price: 0, marketCap: 0, logoUrl: null };
  }
}

async function fetchTokenPrice(tokenMint: string): Promise<number> {
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${tokenMint}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`Birdeye API error: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    const price = data?.data?.value || 0;

    if (!validateAmount(price)) {
      console.error(`Invalid price from API: ${price}`);
      return 0;
    }

    return price;
  } catch (error) {
    console.error("Error fetching token price:", error);
    return 0;
  }
}

async function getTokenPriceWithCache(
  supabase: any,
  tokenMint: string,
  tokenSymbol: string
): Promise<number> {
  try {
    const { data: cachedPrice, error } = await supabase
      .from("token_price_cache")
      .select("price, last_updated")
      .eq("token_mint", tokenMint)
      .maybeSingle();

    if (cachedPrice && !error) {
      const cacheAge = Date.now() - new Date(cachedPrice.last_updated).getTime();
      if (cacheAge < CACHE_DURATION_MINUTES * 60 * 1000) {
        return cachedPrice.price;
      }
    }

    const price = await fetchTokenPrice(tokenMint);

    if (price > 0) {
      await supabase.from("token_price_cache").upsert({
        token_mint: tokenMint,
        token_symbol: tokenSymbol,
        price: price,
        last_updated: new Date().toISOString(),
      }, { onConflict: "token_mint" });
    }

    return price;
  } catch (error) {
    console.error("Error getting token price with cache:", error);
    return 0;
  }
}

/**
 * Calculate P&L for token positions
 *
 * Formula:
 * - BUY: Unrealized P&L = (Current Price - Avg Entry Price) * Holding
 * - SELL: Realized P&L = (Sell Price - Avg Entry Price) * Amount Sold
 *
 * CRITICAL: amount can be negative (when wallet sends tokens)
 * We use Math.abs() to get absolute values for calculations
 */
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

    // Calculate totals from previous transactions
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

    // Add current transaction
    const absCurrentAmount = Math.abs(currentAmount);

    if (transactionType === "BUY") {
      totalBought += absCurrentAmount;
      totalSpentOnBuys += absCurrentAmount * currentPrice;
    } else if (transactionType === "SELL") {
      totalSold += absCurrentAmount;
      totalReceivedFromSells += absCurrentAmount * currentPrice;
    }

    // Calculate position metrics
    const currentHolding = totalBought - totalSold;
    const avgEntryPrice = totalBought > 0 ? totalSpentOnBuys / totalBought : currentPrice;
    const allTokensSold = currentHolding <= 0.000001;

    let pnl = 0;
    let pnlPercentage = 0;

    if (transactionType === "BUY") {
      // For BUY: Calculate unrealized P&L on current holding
      if (currentHolding > 0 && avgEntryPrice > 0) {
        const currentValue = currentHolding * currentPrice;
        const costBasis = currentHolding * avgEntryPrice;
        pnl = currentValue - costBasis;
        pnlPercentage = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;
      }

      console.log(`[BUY P&L] Bought: ${totalBought.toFixed(2)}, Holding: ${currentHolding.toFixed(2)}, Entry: $${avgEntryPrice.toFixed(8)}, Current: $${currentPrice.toFixed(8)}, Unrealized P&L: $${pnl.toFixed(2)} (${pnlPercentage.toFixed(2)}%)`);
    } else if (transactionType === "SELL") {
      // For SELL: Calculate realized P&L from this sale
      if (avgEntryPrice > 0) {
        const soldValue = absCurrentAmount * currentPrice;
        const soldCost = absCurrentAmount * avgEntryPrice;
        const realizedPnl = soldValue - soldCost;
        const realizedPnlPct = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;

        pnl = realizedPnl;
        pnlPercentage = realizedPnlPct;

        // Add unrealized P&L from remaining holding
        if (currentHolding > 0) {
          const unrealizedValue = currentHolding * currentPrice;
          const unrealizedCost = currentHolding * avgEntryPrice;
          const unrealizedPnl = unrealizedValue - unrealizedCost;
          pnl += unrealizedPnl;
        }

        console.log(`[SELL P&L] Sold: ${absCurrentAmount.toFixed(2)} @ $${currentPrice.toFixed(8)}, Entry: $${avgEntryPrice.toFixed(8)}, Realized: $${realizedPnl.toFixed(2)} (${realizedPnlPct.toFixed(2)}%), Remaining: ${currentHolding.toFixed(2)}, Total P&L: $${pnl.toFixed(2)}`);
      }
    }

    return {
      tokenPnl: pnl,
      tokenPnlPercentage: pnlPercentage,
      entryPrice: avgEntryPrice,
      remainingTokens: currentHolding,
      allTokensSold: allTokensSold,
    };
  } catch (error) {
    console.error("Error calculating token P&L:", error);
    return {
      tokenPnl: 0,
      tokenPnlPercentage: 0,
      entryPrice: currentPrice,
      remainingTokens: 0,
      allTokensSold: false
    };
  }
}

function extractPreliminaryData(
  data: HeliusWebhookData
): {
  fromAddress: string | null;
  toAddress: string | null;
  amount: number;
  tokenMint: string | null;
  tokenSymbol: string | null;
} {
  let fromAddress: string | null = null;
  let toAddress: string | null = null;
  let amount = 0;
  let tokenMint: string | null = null;
  let tokenSymbol: string | null = null;

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

  if (!fromAddress) {
    fromAddress = data.feePayer || data.from || null;
  }

  if (!toAddress) {
    toAddress = data.to || null;
  }

  return {
    fromAddress,
    toAddress,
    amount,
    tokenMint,
    tokenSymbol,
  };
}

/**
 * Determine transaction type using SOL-first classification
 *
 * GOLDEN RULE:
 * - SOL spent (negative) = BUY (buying tokens with SOL)
 * - SOL received (positive) = SELL (selling tokens for SOL)
 *
 * Priority:
 * 1. Check native SOL transfers (HIGHEST PRIORITY - most reliable)
 * 2. Check token transfer direction (fallback)
 */
function determineTransactionType(data: HeliusWebhookData, walletAddress: string): string | null {
  const type = data.type?.toUpperCase() || "UNKNOWN";

  console.log(`[Type Detection] Processing ${type} transaction for ${walletAddress.substring(0, 8)}...`);

  // PRIORITY 1: ALWAYS check native SOL transfers first (most reliable)
  if (data.nativeTransfers && data.nativeTransfers.length > 0) {
    for (const transfer of data.nativeTransfers) {
      // Wallet SENDS SOL = BUY (spending SOL to buy tokens)
      if (transfer.fromUserAccount === walletAddress) {
        console.log(`[Type Detection] ✓ BUY: Wallet spent ${transfer.amount / 1_000_000_000} SOL (SOL-first rule)`);
        return "BUY";
      }
      // Wallet RECEIVES SOL = SELL (selling tokens for SOL)
      if (transfer.toUserAccount === walletAddress) {
        console.log(`[Type Detection] ✓ SELL: Wallet received ${transfer.amount / 1_000_000_000} SOL (SOL-first rule)`);
        return "SELL";
      }
    }
  }

  // PRIORITY 2: Check token transfers for SWAP type
  if (type === "SWAP" && data.tokenTransfers && data.tokenTransfers.length >= 2) {
    const solTransfer = data.tokenTransfers.find(
      (t) => t.mint === "So11111111111111111111111111111111111111112"
    );

    if (solTransfer) {
      // Wallet SENDS SOL = BUY
      if (solTransfer.fromUserAccount === walletAddress) {
        console.log(`[Type Detection] ✓ BUY: Wallet sent wrapped SOL`);
        return "BUY";
      }
      // Wallet RECEIVES SOL = SELL
      if (solTransfer.toUserAccount === walletAddress) {
        console.log(`[Type Detection] ✓ SELL: Wallet received wrapped SOL`);
        return "SELL";
      }
    }

    // Check non-SOL token direction
    const nonSolTransfer = data.tokenTransfers.find(
      (t) => t.mint !== "So11111111111111111111111111111111111111112"
    );

    if (nonSolTransfer) {
      // Wallet RECEIVES token = BUY
      if (nonSolTransfer.toUserAccount === walletAddress) {
        console.log(`[Type Detection] ✓ BUY: Wallet received token`);
        return "BUY";
      }
      // Wallet SENDS token = SELL
      if (nonSolTransfer.fromUserAccount === walletAddress) {
        console.log(`[Type Detection] ✓ SELL: Wallet sent token`);
        return "SELL";
      }
    }
  }

  // Handle TRANSFER type
  if (type === "TRANSFER" && data.tokenTransfers && data.tokenTransfers.length > 0) {
    const transfer = data.tokenTransfers.find(
      (t) => t.fromUserAccount === walletAddress
    );

    if (transfer) {
      console.log(`[Type Detection] ✓ SELL: TRANSFER - wallet sent tokens`);
      return "SELL";
    } else {
      console.log(`[Type Detection] ✓ BUY: TRANSFER - wallet received tokens`);
      return "BUY";
    }
  }

  // Direct type labels
  if (type === "BUY") {
    console.log(`[Type Detection] ✓ BUY: Direct type`);
    return "BUY";
  }

  if (type === "SELL") {
    console.log(`[Type Detection] ✓ SELL: Direct type`);
    return "SELL";
  }

  console.warn(`[Type Detection] ✗ Unable to classify ${type}`);
  return null;
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

      // CRITICAL: Set amount sign based on direction
      // If wallet is sending tokens, amount should be negative
      // If wallet is receiving tokens, amount should be positive
      const baseAmount = tokenTransfer.tokenAmount || 0;
      if (tokenTransfer.fromUserAccount === walletAddress) {
        amount = -Math.abs(baseAmount);  // Wallet sends = negative
      } else if (tokenTransfer.toUserAccount === walletAddress) {
        amount = Math.abs(baseAmount);   // Wallet receives = positive
      } else {
        amount = baseAmount;
      }

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

  // Extract SOL amount from native transfers
  if (data.nativeTransfers && data.nativeTransfers.length > 0) {
    for (const transfer of data.nativeTransfers) {
      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      const solValue = transfer.amount / 1_000_000_000;

      // If wallet is sender (fromUserAccount), SOL is negative (spent)
      if (transfer.fromUserAccount === walletAddress) {
        solAmount -= solValue;
      }
      // If wallet is receiver (toUserAccount), SOL is positive (received)
      if (transfer.toUserAccount === walletAddress) {
        solAmount += solValue;
      }
    }
  }

  // Extract native balance change from account data
  if (data.accountData && data.accountData.length > 0) {
    const walletAccount = data.accountData.find(acc => acc.account === walletAddress);
    if (walletAccount && walletAccount.nativeBalanceChange !== undefined) {
      // Convert lamports to SOL
      nativeBalanceChange = walletAccount.nativeBalanceChange / 1_000_000_000;
    }
  }

  if (!fromAddress) {
    fromAddress = data.feePayer || data.from || null;
  }

  if (!toAddress) {
    toAddress = data.to || null;
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: HeliusWebhookData = await req.json();

    console.log(`\n🔔 Webhook received: ${data.type} | Signature: ${data.signature?.substring(0, 16)}...`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const preliminaryData = extractPreliminaryData(data);

    if (!preliminaryData.fromAddress) {
      console.log(`No from_address found, skipping`);
      return new Response(
        JSON.stringify({ message: "No from_address found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: monitoredWallet } = await supabase
      .from("monitored_wallets")
      .select("*")
      .eq("wallet_address", preliminaryData.fromAddress)
      .maybeSingle();

    if (!monitoredWallet) {
      console.log(`Wallet ${preliminaryData.fromAddress} is not monitored, skipping`);
      return new Response(
        JSON.stringify({ message: "Wallet not monitored" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Now extract with correct wallet address
    const { fromAddress, toAddress, amount, tokenMint, tokenSymbol, solAmount, nativeBalanceChange } =
      extractTransactionData(data, preliminaryData.fromAddress);

    const transactionType = determineTransactionType(data, fromAddress);

    if (!transactionType) {
      console.log(`Transaction type could not be determined or is not BUY/SELL, skipping`);
      return new Response(
        JSON.stringify({ message: "Transaction type not supported" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`✅ Transaction saved: ${transactionType} ${realTokenSymbol}`);

    return new Response(
      JSON.stringify({ success: true, transactionType, token: realTokenSymbol }),
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
