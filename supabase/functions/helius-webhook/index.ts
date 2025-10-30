import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret",
};

const BIRDEYE_API_KEY = "a6296c5f82664e92aadffe9e99773d73";
const CACHE_DURATION_MINUTES = 5;

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
    mint: string;
    tokenAmount: number;
    tokenStandard: string;
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
  [key: string]: any;
}

function validateTransactionData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.type) {
    errors.push("Missing transaction type");
  }

  if (!data.signature && !data.timestamp) {
    errors.push("Missing transaction signature or timestamp");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateTokenMint(tokenMint: string): boolean {
  if (!tokenMint || tokenMint === "unknown") {
    return false;
  }

  if (tokenMint.length < 32 || tokenMint.length > 44) {
    return false;
  }

  return true;
}

function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && isFinite(amount);
}

async function getCachedTokenPrice(
  supabase: any,
  tokenMint: string
): Promise<number | null> {
  try {
    const cacheExpiry = new Date(Date.now() - CACHE_DURATION_MINUTES * 60 * 1000);

    const { data, error } = await supabase
      .from("token_price_cache")
      .select("price, last_updated")
      .eq("token_mint", tokenMint)
      .gte("last_updated", cacheExpiry.toISOString())
      .maybeSingle();

    if (error) {
      console.error("Error fetching cached price:", error);
      return null;
    }

    if (data) {
      console.log(`Cache HIT for ${tokenMint}: $${data.price}`);
      return parseFloat(data.price);
    }

    console.log(`Cache MISS for ${tokenMint}`);
    return null;
  } catch (error) {
    console.error("Error in getCachedTokenPrice:", error);
    return null;
  }
}

async function updateTokenPriceCache(
  supabase: any,
  tokenMint: string,
  tokenSymbol: string | null,
  price: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from("token_price_cache")
      .upsert({
        token_mint: tokenMint,
        token_symbol: tokenSymbol,
        price: price.toString(),
        last_updated: new Date().toISOString()
      }, {
        onConflict: "token_mint"
      });

    if (error) {
      console.error("Error updating price cache:", error);
    } else {
      console.log(`Updated cache for ${tokenMint}: $${price}`);
    }
  } catch (error) {
    console.error("Error in updateTokenPriceCache:", error);
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
  tokenSymbol: string | null
): Promise<number> {
  if (!validateTokenMint(tokenMint)) {
    console.error(`Invalid token mint: ${tokenMint}`);
    return 0;
  }

  const cachedPrice = await getCachedTokenPrice(supabase, tokenMint);

  if (cachedPrice !== null) {
    return cachedPrice;
  }

  const freshPrice = await fetchTokenPrice(tokenMint);

  if (freshPrice > 0) {
    await updateTokenPriceCache(supabase, tokenMint, tokenSymbol, freshPrice);
  }

  return freshPrice;
}

async function getEntryPrice(
  supabase: any,
  walletAddress: string,
  tokenMint: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("webhook_transactions")
      .select("entry_price, current_token_price")
      .eq("from_address", walletAddress)
      .eq("token_mint", tokenMint)
      .eq("transaction_type", "BUY")
      .order("block_time", { ascending: true })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0;
    }

    const price = parseFloat(data[0].entry_price || data[0].current_token_price || "0");
    return validateAmount(price) ? price : 0;
  } catch (error) {
    console.error("Error getting entry price:", error);
    return 0;
  }
}

async function getTokenBalance(
  supabase: any,
  walletAddress: string,
  tokenMint: string
): Promise<{ totalBought: number; totalSold: number; avgEntryPrice: number }> {
  try {
    const { data: buyData } = await supabase
      .from("webhook_transactions")
      .select("amount, current_token_price")
      .eq("from_address", walletAddress)
      .eq("token_mint", tokenMint)
      .eq("transaction_type", "BUY");

    const { data: sellData } = await supabase
      .from("webhook_transactions")
      .select("amount")
      .eq("from_address", walletAddress)
      .eq("token_mint", tokenMint)
      .eq("transaction_type", "SELL");

    const totalBought = (buyData || []).reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);
    const totalSold = (sellData || []).reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

    let avgEntryPrice = 0;
    if (buyData && buyData.length > 0) {
      const totalCost = buyData.reduce((sum, tx) => {
        const amount = parseFloat(tx.amount || "0");
        const price = parseFloat(tx.current_token_price || "0");
        return sum + (amount * price);
      }, 0);
      avgEntryPrice = totalBought > 0 ? totalCost / totalBought : 0;
    }

    return { totalBought, totalSold, avgEntryPrice };
  } catch (error) {
    console.error("Error getting token balance:", error);
    return { totalBought: 0, totalSold: 0, avgEntryPrice: 0 };
  }
}

async function calculateTokenPnl(
  supabase: any,
  transactionType: string,
  walletAddress: string,
  tokenMint: string,
  amount: number,
  currentPrice: number
): Promise<{ tokenPnl: number; tokenPnlPercentage: number; entryPrice: number }> {
  let tokenPnl = 0;
  let tokenPnlPercentage = 0;
  let entryPrice = 0;

  if (!validateAmount(amount) || !validateAmount(currentPrice)) {
    console.error(`Invalid calculation inputs - amount: ${amount}, price: ${currentPrice}`);
    return { tokenPnl: 0, tokenPnlPercentage: 0, entryPrice: 0 };
  }

  if (transactionType === "BUY") {
    entryPrice = currentPrice;
    tokenPnl = 0;
    tokenPnlPercentage = 0;
    console.log(`BUY transaction: Entry price set to $${currentPrice}, P&L = $0`);
  } else if (transactionType === "SELL") {
    const previousEntry = await getEntryPrice(supabase, walletAddress, tokenMint);

    if (previousEntry > 0) {
      entryPrice = previousEntry;
      const exitPrice = currentPrice;
      tokenPnl = amount * (exitPrice - entryPrice);
      tokenPnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
      console.log(`SELL transaction: Entry $${entryPrice}, Exit $${exitPrice}, P&L = $${tokenPnl}`);
    } else {
      entryPrice = currentPrice;
      tokenPnl = 0;
      tokenPnlPercentage = 0;
      console.log(`SELL transaction: No entry price found, P&L = $0`);
    }
  } else if (transactionType === "SWAP") {
    const balance = await getTokenBalance(supabase, walletAddress, tokenMint);
    const currentHolding = balance.totalBought - balance.totalSold;

    if (currentHolding > 0 && balance.avgEntryPrice > 0) {
      entryPrice = balance.avgEntryPrice;
      const unrealizedPnl = currentHolding * (currentPrice - balance.avgEntryPrice);

      tokenPnl = unrealizedPnl;
      tokenPnlPercentage = ((currentPrice - balance.avgEntryPrice) / balance.avgEntryPrice) * 100;
      console.log(`SWAP transaction: Avg Entry $${balance.avgEntryPrice}, Current $${currentPrice}, Unrealized P&L = $${tokenPnl}`);
    } else {
      entryPrice = currentPrice;
      tokenPnl = 0;
      tokenPnlPercentage = 0;
      console.log(`SWAP transaction: New position or no holdings, P&L = $0`);
    }
  }

  if (!isFinite(tokenPnl) || isNaN(tokenPnl)) {
    console.error(`Invalid P&L calculation result: ${tokenPnl}`);
    tokenPnl = 0;
  }

  if (!isFinite(tokenPnlPercentage) || isNaN(tokenPnlPercentage)) {
    console.error(`Invalid P&L percentage result: ${tokenPnlPercentage}`);
    tokenPnlPercentage = 0;
  }

  return {
    tokenPnl: parseFloat(tokenPnl.toFixed(2)),
    tokenPnlPercentage: parseFloat(tokenPnlPercentage.toFixed(2)),
    entryPrice: parseFloat(entryPrice.toFixed(8)),
  };
}

function determineTransactionType(data: HeliusWebhookData, walletAddress: string): string {
  const type = data.type?.toUpperCase();

  if (type === "SWAP") {
    if (data.tokenTransfers && data.tokenTransfers.length >= 2) {
      const solTransfer = data.tokenTransfers.find(t =>
        t.mint === 'So11111111111111111111111111111111111111112'
      );

      const tokenTransfer = data.tokenTransfers.find(t =>
        t.mint !== 'So11111111111111111111111111111111111111112'
      );

      if (solTransfer && tokenTransfer) {
        if (solTransfer.fromUserAccount === walletAddress) {
          console.log(`SWAP detected as BUY: Wallet spent SOL for tokens`);
          return "BUY";
        } else if (solTransfer.toUserAccount === walletAddress) {
          console.log(`SWAP detected as SELL: Wallet received SOL for tokens`);
          return "SELL";
        }
      }
    }

    console.log(`SWAP type kept as SWAP (insufficient data to determine)`);
    return "SWAP";
  }

  const typeMapping: { [key: string]: string } = {
    "BUY": "BUY",
    "SELL": "SELL",
    "TRANSFER": "TRANSFER",
    "TOKEN_MINT": "BUY",
    "FILL_ORDER": "BUY",
    "BUY_ITEM": "BUY",
  };

  const mappedType = typeMapping[type] || type || "UNKNOWN";
  console.log(`Transaction type mapping: ${type} -> ${mappedType}`);

  return mappedType;
}

async function updateKolProfile(
  supabase: any,
  walletAddress: string,
  tokenPnl: number,
  volume: number,
  transactionType: string
): Promise<void> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from("kol_profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching KOL profile:", fetchError);
      return;
    }

    if (!profile) {
      console.log(`No KOL profile found for ${walletAddress}`);
      return;
    }

    const newTotalPnl = (parseFloat(profile.total_pnl) || 0) + tokenPnl;
    const newTotalTrades = (profile.total_trades || 0) + 1;
    const newTotalVolume = (parseFloat(profile.total_volume) || 0) + volume;

    const { data: allTransactions } = await supabase
      .from("webhook_transactions")
      .select("token_pnl")
      .eq("from_address", walletAddress);

    const profitableCount = (allTransactions || []).filter(tx => parseFloat(tx.token_pnl || "0") > 0).length;
    const totalCount = (allTransactions || []).length + 1;
    const newWinRate = totalCount > 0 ? (profitableCount / totalCount) * 100 : 0;

    console.log(`Updating KOL profile: P&L +$${tokenPnl}, Total: $${newTotalPnl}, WR: ${newWinRate.toFixed(1)}%`);

    const { error: updateError } = await supabase
      .from("kol_profiles")
      .update({
        total_pnl: newTotalPnl.toFixed(2),
        total_trades: newTotalTrades,
        total_volume: newTotalVolume.toFixed(2),
        win_rate: newWinRate.toFixed(2),
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress);

    if (updateError) {
      console.error("Error updating KOL profile:", updateError);
    } else {
      console.log(`Updated KOL profile for ${walletAddress}`);
    }
  } catch (error) {
    console.error("Error in updateKolProfile:", error);
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
    const webhookSecret = req.headers.get("x-webhook-secret");
    const validSecret = Deno.env.get("HELIUS_WEBHOOK_SECRET");

    if (validSecret && webhookSecret !== validSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid webhook secret" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: HeliusWebhookData = await req.json();
    console.log("Received webhook:", JSON.stringify(data, null, 2));

    const validation = validateTransactionData(data);
    if (!validation.valid) {
      console.error("Invalid transaction data:", validation.errors);
      return new Response(
        JSON.stringify({ error: "Invalid transaction data", details: validation.errors }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let fromAddress = data.from || data.feePayer || "unknown";
    let toAddress = data.to || "unknown";
    let tokenMint = data.tokenMint || "unknown";
    let tokenSymbol = data.tokenSymbol || null;
    let amount = data.amount || 0;

    if (data.tokenTransfers && data.tokenTransfers.length > 0) {
      const transfer = data.tokenTransfers[0];
      fromAddress = transfer.fromUserAccount || fromAddress;
      toAddress = transfer.toUserAccount || toAddress;
      tokenMint = transfer.mint || tokenMint;
      amount = transfer.tokenAmount || amount;
    }

    if (data.accountData && data.accountData.length > 0) {
      const account = data.accountData[0];
      fromAddress = account.account || fromAddress;

      if (account.tokenBalanceChanges && account.tokenBalanceChanges.length > 0) {
        const tokenChange = account.tokenBalanceChanges[0];
        tokenMint = tokenChange.mint || tokenMint;
        amount = parseFloat(tokenChange.rawTokenAmount?.tokenAmount || "0");
      }
    }

    if (!validateTokenMint(tokenMint)) {
      console.error(`Invalid token mint: ${tokenMint}`);
      return new Response(
        JSON.stringify({ error: "Invalid token mint address" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!validateAmount(amount)) {
      console.error(`Invalid amount: ${amount}`);
      return new Response(
        JSON.stringify({ error: "Invalid transaction amount" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const transactionType = determineTransactionType(data, fromAddress);

    const currentPrice = await getTokenPriceWithCache(supabase, tokenMint, tokenSymbol);
    console.log(`Current price for ${tokenMint}: $${currentPrice}`);

    const { tokenPnl, tokenPnlPercentage, entryPrice } = await calculateTokenPnl(
      supabase,
      transactionType,
      fromAddress,
      tokenMint,
      amount,
      currentPrice
    );

    console.log(`Calculated P&L: $${tokenPnl} (${tokenPnlPercentage}%)`);

    const transactionData = {
      transaction_signature: data.signature || `${data.type}-${Date.now()}`,
      block_time: data.timestamp
        ? new Date(data.timestamp * 1000).toISOString()
        : new Date().toISOString(),
      from_address: fromAddress,
      to_address: toAddress,
      amount: amount.toString(),
      token_mint: tokenMint,
      token_symbol: tokenSymbol,
      transaction_type: transactionType,
      fee: data.fee || 0,
      token_pnl: tokenPnl.toString(),
      token_pnl_percentage: tokenPnlPercentage.toString(),
      current_token_price: currentPrice.toString(),
      entry_price: entryPrice.toString(),
      raw_data: data,
    };

    const { error } = await supabase
      .from("webhook_transactions")
      .insert(transactionData);

    if (error) {
      console.error(`Error inserting transaction:`, error);

      if (error.code !== "23505") {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        console.log("Duplicate transaction, skipping...");
      }
    } else {
      console.log(`Transaction saved successfully: ${transactionData.transaction_signature}`);

      await updateKolProfile(supabase, fromAddress, tokenPnl, amount, transactionType);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed",
        data: {
          signature: transactionData.transaction_signature,
          type: transactionType,
          token: tokenSymbol || tokenMint,
          amount: amount,
          pnl: tokenPnl,
          pnlPercentage: tokenPnlPercentage,
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});