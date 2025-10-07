import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  feePayer: string;
  fee: number;
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
}

interface WebhookPayload {
  transaction?: HeliusTransaction;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook:", JSON.stringify(payload, null, 2));

    const transaction = payload.transaction;

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: "No transaction data in payload" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Process token transfers
    if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
      for (const transfer of transaction.tokenTransfers) {
        // Filter for large transactions (>10000 tokens)
        if (transfer.tokenAmount > 10000) {
          const { error } = await supabase
            .from("webhook_transactions")
            .insert({
              transaction_signature: transaction.signature,
              block_time: new Date(transaction.timestamp * 1000).toISOString(),
              from_address: transfer.fromUserAccount,
              to_address: transfer.toUserAccount,
              amount: transfer.tokenAmount,
              token_mint: transfer.mint,
              token_symbol: null,
              transaction_type: transaction.type,
              fee: transaction.fee,
              raw_data: payload,
            });

          if (error) {
            console.error("Error inserting transaction:", error);
          } else {
            console.log(
              `Large transfer saved: ${transfer.tokenAmount} tokens from ${transfer.fromUserAccount}`
            );
          }
        }
      }
    }

    // Process native transfers (SOL)
    if (transaction.nativeTransfers && transaction.nativeTransfers.length > 0) {
      for (const transfer of transaction.nativeTransfers) {
        const solAmount = transfer.amount / 1e9; // Convert lamports to SOL

        // Filter for large SOL transfers (>10 SOL)
        if (solAmount > 10) {
          const { error } = await supabase
            .from("webhook_transactions")
            .insert({
              transaction_signature: transaction.signature,
              block_time: new Date(transaction.timestamp * 1000).toISOString(),
              from_address: transfer.fromUserAccount,
              to_address: transfer.toUserAccount,
              amount: solAmount,
              token_mint: "So11111111111111111111111111111111111111112",
              token_symbol: "SOL",
              transaction_type: transaction.type,
              fee: transaction.fee,
              raw_data: payload,
            });

          if (error) {
            console.error("Error inserting SOL transaction:", error);
          } else {
            console.log(
              `Large SOL transfer saved: ${solAmount} SOL from ${transfer.fromUserAccount}`
            );
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      {
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