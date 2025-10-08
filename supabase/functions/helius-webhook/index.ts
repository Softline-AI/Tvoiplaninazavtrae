import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret",
};

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
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify webhook secret
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

    // Map of transaction types to collection names
    const typeMapping: { [key: string]: string } = {
      ADD_TO_POOL: "add_to_pool",
      BUY_ITEM: "buy_items",
      CLOSE_ITEM: "close_items",
      DEPOSIT: "deposits",
      DEPOSIT_FRACTIONAL_POOL: "deposit_fractional_pool",
      FILL_ORDER: "fill_order",
      STAKE_SOL: "stake_sol",
      TOKEN_MINT: "token_mint",
      TRANSFER: "transfers",
      UNSTAKE_SOL: "unstake_sol",
      WITHDRAW: "withdraw",
    };

    // Process the transaction based on its type
    if (data.type && typeMapping[data.type]) {
      console.log(`Processing ${data.type} transaction`);

      // Extract common fields with fallbacks
      const transactionData = {
        transaction_signature: data.signature || `${data.type}-${Date.now()}`,
        block_time: data.timestamp
          ? new Date(data.timestamp * 1000).toISOString()
          : new Date().toISOString(),
        from_address: data.from || data.feePayer || "unknown",
        to_address: data.to || "unknown",
        amount: data.amount || 0,
        token_mint: data.tokenMint || "unknown",
        token_symbol: data.tokenSymbol || null,
        transaction_type: data.type,
        fee: data.fee || 0,
        raw_data: data,
      };

      // Insert into webhook_transactions table
      const { error } = await supabase
        .from("webhook_transactions")
        .insert(transactionData);

      if (error) {
        console.error(`Error inserting ${data.type} transaction:`, error);

        // If it's a duplicate, that's okay
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
        }
      } else {
        console.log(`${data.type} transaction saved successfully`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
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
