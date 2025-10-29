import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret",
};

const BIRDEYE_API_KEY = "a6296c5f82664e92aadffe9e99773d73";

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

interface TokenPrice {
  value: number;
  updateUnixTime: number;
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
    return data?.data?.value || 0;
  } catch (error) {
    console.error("Error fetching token price:", error);
    return 0;
  }
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
      .in("transaction_type", ["BUY", "SWAP"])
      .order("block_time", { ascending: true })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0;
    }

    return data[0].entry_price || data[0].current_token_price || 0;
  } catch (error) {
    console.error("Error getting entry price:", error);
    return 0;
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

  if (transactionType === "BUY" || transactionType === "SWAP") {
    entryPrice = currentPrice;

    const previousEntry = await getEntryPrice(supabase, walletAddress, tokenMint);

    if (previousEntry > 0) {
      entryPrice = previousEntry;
      tokenPnl = amount * ((currentPrice - previousEntry) / previousEntry);
      tokenPnlPercentage = ((currentPrice - previousEntry) / previousEntry) * 100;
    } else {
      entryPrice = currentPrice;
      tokenPnl = 0;
      tokenPnlPercentage = 0;
    }
  } else if (transactionType === "SELL") {
    entryPrice = await getEntryPrice(supabase, walletAddress, tokenMint);

    if (entryPrice > 0) {
      const exitPrice = currentPrice;
      tokenPnl = amount * ((exitPrice - entryPrice) / entryPrice);
      tokenPnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
    }
  }

  return {
    tokenPnl: parseFloat(tokenPnl.toFixed(2)),
    tokenPnlPercentage: parseFloat(tokenPnlPercentage.toFixed(2)),
    entryPrice: parseFloat(entryPrice.toFixed(8)),
  };
}

function determineTransactionType(data: HeliusWebhookData): string {
  const type = data.type?.toUpperCase();

  const typeMapping: { [key: string]: string } = {
    "SWAP": "SWAP",
    "BUY": "BUY",
    "SELL": "SELL",
    "TRANSFER": "TRANSFER",
    "TOKEN_MINT": "BUY",
    "FILL_ORDER": "BUY",
    "BUY_ITEM": "BUY",
  };

  return typeMapping[type] || type || "UNKNOWN";
}

async function updateKolProfile(
  supabase: any,
  walletAddress: string,
  tokenPnl: number,
  volume: number
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

    const { data: profitableTrades } = await supabase
      .from("webhook_transactions")
      .select("token_pnl")
      .eq("from_address", walletAddress)
      .gt("token_pnl", 0);

    const profitableCount = profitableTrades?.length || 0;
    const newWinRate = newTotalTrades > 0 ? (profitableCount / newTotalTrades) * 100 : 0;

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

    const transactionType = determineTransactionType(data);

    const currentPrice = await fetchTokenPrice(tokenMint);
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

      await updateKolProfile(supabase, fromAddress, tokenPnl, amount);
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