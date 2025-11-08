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

async function loadSolanaTokenList(): Promise<any> {
  const now = Date.now();

  if (tokenListCache && (now - tokenListCacheTime) < TOKEN_LIST_CACHE_DURATION) {
    return tokenListCache;
  }

  try {
    const response = await fetch(SOLANA_TOKEN_LIST_URL);
    if (!response.ok) {
      console.error("Failed to fetch Solana token list");
      return null;
    }

    const data = await response.json();
    tokenListCache = data;
    tokenListCacheTime = now;
    console.log(`Loaded ${data.tokens?.length || 0} tokens from Solana token list`);
    return data;
  } catch (error) {
    console.error("Error loading Solana token list:", error);
    return null;
  }
}

async function getTokenSymbolFromTokenList(tokenMint: string): Promise<string | null> {
  try {
    const tokenList = await loadSolanaTokenList();
    if (!tokenList || !tokenList.tokens) {
      return null;
    }

    const token = tokenList.tokens.find((t: any) => t.address === tokenMint);
    if (token) {
      console.log(`Found token ${token.symbol} from token list`);
      return token.symbol;
    }

    return null;
  } catch (error) {
    console.error("Error getting token symbol from token list:", error);
    return null;
  }
}

async function getTokenSymbolFromBirdeye(tokenMint: string): Promise<string | null> {
  try {
    const url = `https://public-api.birdeye.so/defi/token_overview?address=${tokenMint}`;
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": BIRDEYE_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Birdeye API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data && data.data.symbol) {
      console.log(`Found token ${data.data.symbol} from Birdeye`);
      return data.data.symbol;
    }

    return null;
  } catch (error) {
    console.error("Error fetching token symbol from Birdeye:", error);
    return null;
  }
}

async function getTokenSymbol(tokenMint: string): Promise<string> {
  let symbol = await getTokenSymbolFromTokenList(tokenMint);
  if (symbol) return symbol;

  symbol = await getTokenSymbolFromBirdeye(tokenMint);
  if (symbol) return symbol;

  return "UNKNOWN";
}

async function getTokenMetadata(supabase: any, tokenMint: string): Promise<{
  symbol: string;
  name: string;
}> {
  try {
    const { data: cached, error: cacheError } = await supabase
      .from("token_metadata")
      .select("symbol, name")
      .eq("token_mint", tokenMint)
      .maybeSingle();

    if (cached && !cacheError) {
      return { symbol: cached.symbol, name: cached.name };
    }

    const symbol = await getTokenSymbol(tokenMint);
    const metadata = { symbol, name: symbol };

    await supabase.from("token_metadata").upsert(
      {
        token_mint: tokenMint,
        symbol: metadata.symbol,
        name: metadata.name,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "token_mint" }
    );

    return metadata;
  } catch (error) {
    console.error("Error in getTokenMetadata:", error);
    return { symbol: "UNKNOWN", name: "UNKNOWN" };
  }
}

async function getTokenPriceFromBirdeye(tokenMint: string): Promise<number> {
  try {
    const url = `https://public-api.birdeye.so/defi/price?address=${tokenMint}`;
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": BIRDEYE_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Birdeye price API error: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    if (data.success && data.data && data.data.value) {
      return data.data.value;
    }

    return 0;
  } catch (error) {
    console.error("Error fetching token price from Birdeye:", error);
    return 0;
  }
}

async function getTokenPrice(supabase: any, tokenMint: string, tokenSymbol: string): Promise<number> {
  try {
    const { data: cached, error: cacheError } = await supabase
      .from("token_price_cache")
      .select("price, last_updated")
      .eq("token_mint", tokenMint)
      .maybeSingle();

    if (cached && !cacheError) {
      const lastUpdated = new Date(cached.last_updated);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

      if (diffMinutes < CACHE_DURATION_MINUTES) {
        const price = parseFloat(cached.price);
        console.log(`Using cached price for ${tokenSymbol}: $${price}`);
        return price;
      }
    }

    const price = await getTokenPriceFromBirdeye(tokenMint);
    console.log(`Fetched fresh price for ${tokenSymbol}: $${price}`);

    if (price > 0) {
      await updateTokenPriceCache(supabase, tokenMint, price, tokenSymbol);
    }

    return price;
  } catch (error) {
    console.error("Error in getTokenPrice:", error);
    return 0;
  }
}

async function calculateTokenPnL(
  supabase: any,
  walletAddress: string,
  tokenMint: string,
  transactionType: string,
  currentAmount: number,
  currentPrice: number
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
      .select("transaction_type, amount, sol_amount")
      .eq("from_address", walletAddress)
      .eq("token_mint", tokenMint)
      .order("block_time", { ascending: true });

    if (error) throw error;

    let totalBought = 0;
    let totalSold = 0;
    let totalBuyValue = 0;
    let totalSellValue = 0;

    for (const tx of transactions || []) {
      const amount = Math.abs(parseFloat(tx.amount) || 0);
      const solAmount = Math.abs(parseFloat(tx.sol_amount) || 0);

      if (tx.transaction_type === "BUY") {
        totalBought += amount;
        totalBuyValue += solAmount;
      } else if (tx.transaction_type === "SELL") {
        totalSold += amount;
        totalSellValue += solAmount;
      }
    }

    if (transactionType === "BUY") {
      totalBought += currentAmount;
      totalBuyValue += Math.abs(parseFloat(currentPrice.toString()) || 0);
    } else if (transactionType === "SELL") {
      totalSold += currentAmount;
      totalSellValue += Math.abs(parseFloat(currentPrice.toString()) || 0);
    }

    const remainingTokens = totalBought - totalSold;
    const allTokensSold = remainingTokens <= 0;

    const entryPrice = totalBought > 0 ? totalBuyValue / totalBought : 0;
    const currentValue = remainingTokens * currentPrice;
    const investedValue = remainingTokens * entryPrice;

    const tokenPnl = totalSellValue + currentValue - totalBuyValue;
    const tokenPnlPercentage = totalBuyValue > 0 ? (tokenPnl / totalBuyValue) * 100 : 0;

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

    return "SWAP";
  }

  if (type === "TRANSFER") return "TRANSFER";
  if (type === "TOKEN_MINT") return "BUY";
  if (type === "SOL_TRANSFER") return null;

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
    if (walletAccount && walletAccount.nativeBalanceChange !== undefined) {
      nativeBalanceChange = walletAccount.nativeBalanceChange / 1_000_000_000;
    }
  }

  console.log(`Extracted SOL data for ${monitoredWalletAddr?.substring(0, 8)}: SOL Amount=${solAmount}, Balance Change=${nativeBalanceChange}`);

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

  return { fromAddress, toAddress, amount, tokenMint, tokenSymbol, solAmount, nativeBalanceChange };
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

    let data: HeliusWebhookData;

    try {
      data = await req.json();
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      return new Response(
        JSON.stringify({ message: "Invalid JSON" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Received webhook data:", JSON.stringify(data).substring(0, 200));

    if (!data) {
      console.error("No data received");
      return new Response(
        JSON.stringify({ message: "No data received" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data.type) {
      console.error("Missing transaction type in webhook data");
      return new Response(
        JSON.stringify({ message: "Missing transaction type", received: Object.keys(data) }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing ${data.type} transaction`);

    const preliminaryData = extractTransactionData(data, data.feePayer || data.from || "");

    if (!preliminaryData.fromAddress || !preliminaryData.tokenMint || preliminaryData.amount <= 0) {
      console.log(
        `Skipping transaction: fromAddress=${preliminaryData.fromAddress}, tokenMint=${preliminaryData.tokenMint}, amount=${preliminaryData.amount}`
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

    const tokenMetadata = await getTokenMetadata(supabase, tokenMint!);
    const realTokenSymbol = tokenMetadata.symbol !== "UNKNOWN" ? tokenMetadata.symbol : (tokenSymbol || "UNKNOWN");

    if (realTokenSymbol === "UNKNOWN") {
      console.log(`Could not determine token symbol for ${tokenMint}, skipping`);
      return new Response(
        JSON.stringify({ message: "Token symbol unknown" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentPrice = await getTokenPrice(supabase, tokenMint!, realTokenSymbol);

    const { tokenPnl, tokenPnlPercentage, remainingTokens, allTokensSold, entryPrice } = await calculateTokenPnL(
      supabase,
      fromAddress,
      tokenMint!,
      transactionType,
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
      remaining_tokens: remainingTokens.toString(),
      all_tokens_sold: allTokensSold,
    };

    const { error: insertError } = await supabase
      .from("webhook_transactions")
      .insert([transactionData]);

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

    console.log(`Transaction ${data.signature} saved successfully`);

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