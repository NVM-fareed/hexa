// supabase/functions/create-deposit/index.ts
// Deploy:  supabase functions deploy create-deposit
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_test_...
// (SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_CURRENCIES = ["USD", "EUR", "GBP"]; // card deposits only. Never BTC/ETH/USDT.
const MIN = 1;
const MAX = 10000;

const cors = {
  "Access-Control-Allow-Origin": "*", // tighten to your domain before launch
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // 1) Who is calling? Taken from the verified JWT, never from the request body.
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json({ error: "Not signed in" }, 401);

  // 2) Validate input
  let body: { amount?: unknown; currency?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }

  const currency = String(body.currency ?? "").toUpperCase();
  const amount = Number(body.amount);

  if (!ALLOWED_CURRENCIES.includes(currency)) {
    return json({ error: `Card deposits support ${ALLOWED_CURRENCIES.join(", ")} only` }, 400);
  }
  if (!Number.isFinite(amount) || amount < MIN || amount > MAX) {
    return json({ error: `Amount must be between ${MIN} and ${MAX}` }, 400);
  }
  const amountMinor = Math.round(amount * 100);
  if (Math.abs(amountMinor / 100 - amount) > 1e-9) {
    return json({ error: "Max 2 decimal places" }, 400);
  }

  // 3) The wallet must already exist for this user
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: wallet } = await admin
    .from("wallets").select("currency")
    .eq("user_id", user.id).eq("currency", currency).maybeSingle();
  if (!wallet) return json({ error: `No ${currency} wallet` }, 400);

  // 4) Create the PaymentIntent on Stripe (secret key stays server-side)
  const params = new URLSearchParams({
    amount: String(amountMinor),
    currency: currency.toLowerCase(),
    "payment_method_types[]": "card",
    "metadata[user_id]": user.id,
    "metadata[wallet_currency]": currency,
  });
  const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const pi = await stripeRes.json();
  if (!stripeRes.ok) {
    console.error("stripe error", pi);
    return json({ error: pi?.error?.message ?? "Payment provider error" }, 502);
  }

  // 5) Record the pending deposit. The wallet is NOT touched here.
  const { error: insErr } = await admin.from("deposits").insert({
    user_id: user.id,
    currency,
    amount,
    provider: "stripe",
    provider_ref: pi.id,
    status: "pending",
  });
  if (insErr) {
    console.error("deposit insert failed", insErr);
    return json({ error: "Could not start deposit" }, 500);
  }

  return json({ client_secret: pi.client_secret });
});
