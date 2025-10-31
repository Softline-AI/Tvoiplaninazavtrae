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

function validateAmount(value: number): boolean {
  if (typeof value !== "number") return false;
  if (!isFinite(value)) return false;
  if (isNaN(value)) return false;
  if (value < 0) return false;
  return true;
}

async function updateTokenPriceCache(
  supabase: any,
  tokenMint: string,
  price: number,
  tokenSymbol: string
): Promise<void> {
  try {
    const { error } = await supabase.from("token_price_cache").upsert(
      {
        token_mint: tokenMint,
        token_symbol: tokenSymbol,
        price: price.toString(),
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "token_mint",
      }
    );

    if (error) {
      console.error("Error updating token price cache:", error);
    }
  } catch (error) {
    console.error("Error in updateTokenPriceCache:", error);
  }
}

async function fetchTokenMetadata(tokenMint: string): Promise<{ symbol: string; name: string; price: number; marketCap: number }> {
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`,
      {
        headers: {
          "X-API-KEY": BIRDEYE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`Birdeye API error: ${response.status}`);
      return { symbol: "UNKNOWN", name: "Unknown Token", price: 0, marketCap: 0 };
    }

    const data = await response.json();
    const symbol = data?.data?.symbol || "UNKNOWN";
    const name = data?.data?.name || "Unknown Token";
    const price = data?.data?.price || 0;
    const marketCap = data?.data?.marketCap || 0;

    console.log(`Token: ${symbol} @ $${price} | MC: $${marketCap}`);

    return { symbol, name, price, marketCap };
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return { symbol: "UNKNOWN", name: "Unknown Token", price: 0, marketCap: 0 };
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

    if (!error && cachedPrice) {
      const lastUpdated = new Date(cachedPrice.last_updated);
      const now = new Date();
      const minutesSinceUpdate =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

      if (minutesSinceUpdate < CACHE_DURATION_MINUTES) {
        const price = parseFloat(cachedPrice.price);
        console.log(`Using cached price for ${tokenMint}: $${price}`);
        return price;
      }
    }

    const price = await fetchTokenPrice(tokenMint);
    await updateTokenPriceCache(supabase, tokenMint, price, tokenSymbol);
    return price;
  } catch (error) {
    console.error("Error in getTokenPriceWithCache:", error);
    return 0;
  }
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
      return { tokenPnl: 0, tokenPnlPercentage: 0, entryPrice: currentPrice };
    }

    if (!previousTransactions || previousTransactions.length === 0) {
      return { tokenPnl: 0, tokenPnlPercentage: 0, entryPrice: currentPrice };
    }

    let totalBought = 0;
    let totalSpent = 0;
    let totalSold = 0;
    let totalReceived = 0;

    for (const tx of previousTransactions) {
      const amount = parseFloat(tx.amount || "0");
      const price = parseFloat(tx.current_token_price || "0");

      if (tx.transaction_type === "BUY") {
        totalBought += amount;
        totalSpent += amount * price;
      } else if (tx.transaction_type === "SELL") {
        totalSold += amount;
        totalReceived += amount * price;
      }
    }

    if (transactionType === "BUY") {
      totalBought += currentAmount;
      totalSpent += currentAmount * currentPrice;
    } else if (transactionType === "SELL") {
      totalSold += currentAmount;
      totalReceived += currentAmount * currentPrice;
    }

    const currentHolding = totalBought - totalSold;
    const avgEntryPrice = totalBought > 0 ? totalSpent / totalBought : 0;

    let unrealizedPnl = 0;
    let realizedPnl = 0;

    if (currentHolding > 0) {
      unrealizedPnl = currentHolding * currentPrice - currentHolding * avgEntryPrice;
    }

    if (totalSold > 0) {
      realizedPnl = totalReceived - (totalSold * avgEntryPrice);
    }

    const totalPnl = unrealizedPnl + realizedPnl;
    const pnlPercentage = totalSpent > 0 ? (totalPnl / totalSpent) * 100 : 0;

    return {
      tokenPnl: totalPnl,
      tokenPnlPercentage: pnlPercentage,
      entryPrice: avgEntryPrice,
    };
  } catch (error) {
    console.error("Error calculating token P&L:", error);
    return { tokenPnl: 0, tokenPnlPercentage: 0, entryPrice: currentPrice };
  }
}

function determineTransactionType(data: HeliusWebhookData, walletAddress: string): string {
  const type = data.type?.toUpperCase() || "UNKNOWN";

  if (type === "SWAP") {
    if (data.tokenTransfers && data.tokenTransfers.length >= 2) {
      const solTransfer = data.tokenTransfers.find(
        (t) => t.mint === "So11111111111111111111111111111111111111112"
      );

      if (solTransfer) {
        if (solTransfer.fromUserAccount === walletAddress) return "BUY";
        if (solTransfer.toUserAccount === walletAddress) return "SELL";
      }

      const nonSolTransfer = data.tokenTransfers.find(
        (t) => t.mint !== "So11111111111111111111111111111111111111112"
      );

      if (nonSolTransfer) {
        if (nonSolTransfer.toUserAccount === walletAddress) return "BUY";
        if (nonSolTransfer.fromUserAccount === walletAddress) return "SELL";
      }
    }

    if (data.accountData && data.accountData.length > 0) {
      const walletAccount = data.accountData.find(acc => acc.account === walletAddress);
      if (walletAccount && walletAccount.tokenBalanceChanges) {
        for (const balanceChange of walletAccount.tokenBalanceChanges) {
          const amount = parseFloat(balanceChange.rawTokenAmount.tokenAmount);
          if (amount > 0) return "BUY";
          if (amount < 0) return "SELL";
        }
      }
    }
  }

  if (type === "TRANSFER" && data.tokenTransfers && data.tokenTransfers.length > 0) {
    const transfer = data.tokenTransfers.find(
      (t) => t.fromUserAccount === walletAddress
    );
    return transfer ? "SELL" : "BUY";
  }

  if (["TOKEN_MINT", "FILL_ORDER", "BUY_ITEM"].includes(type)) return "BUY";

  return type;
}

function extractTransactionData(
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

  if (!amount && data.amount) {
    amount = data.amount;
  }

  if (!tokenMint && data.tokenMint) {
    tokenMint = data.tokenMint;
  }

  return { fromAddress, toAddress, amount, tokenMint, tokenSymbol };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const data: HeliusWebhookData = Array.isArray(body) ? body[0] : body;

    if (!data || !data.type) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${data.type} transaction`);

    const { fromAddress, toAddress, amount, tokenMint, tokenSymbol } =
      extractTransactionData(data);

    if (!fromAddress || !tokenMint || amount <= 0) {
      console.log(
        `Skipping transaction: fromAddress=${fromAddress}, tokenMint=${tokenMint}, amount=${amount}`
      );
      return new Response(
        JSON.stringify({ message: "Transaction skipped - insufficient data" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: monitoredWallet } = await supabase
      .from("monitored_wallets")
      .select("*")
      .eq("wallet_address", fromAddress)
      .maybeSingle();

    if (!monitoredWallet) {
      console.log(`Wallet ${fromAddress} is not monitored, skipping`);
      return new Response(
        JSON.stringify({ message: "Wallet not monitored" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const transactionType = determineTransactionType(data, fromAddress);

    const tokenMetadata = await fetchTokenMetadata(tokenMint);
    const currentPrice = tokenMetadata.price;
    const realTokenSymbol = tokenMetadata.symbol;
    const marketCap = tokenMetadata.marketCap;

    console.log(`Token: ${realTokenSymbol} @ $${currentPrice} | MC: $${marketCap}`);

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
      token_symbol: realTokenSymbol,
      token_name: tokenMetadata.name,
      transaction_type: transactionType,
      fee: data.fee || 0,
      token_pnl: tokenPnl.toString(),
      token_pnl_percentage: tokenPnlPercentage.toString(),
      current_token_price: currentPrice.toString(),
      entry_price: entryPrice.toString(),
      market_cap: marketCap.toString(),
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

    console.log(
      `✅ Transaction processed: ${transactionType} ${amount} ${realTokenSymbol} @ $${currentPrice}`
    );

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});