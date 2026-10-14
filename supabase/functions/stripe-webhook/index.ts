// supabase/functions/stripe-webhook/index.ts
// Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
//          (Stripe cannot send a Supabase JWT; the Stripe signature is the authentication.)
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_...
// Stripe Dashboard → Developers → Webhooks → add endpoint:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//   events: payment_intent.succeeded, payment_intent.payment_failed

import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text(); // must be the untouched raw body

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("bad signature", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { error } = await admin.rpc("complete_deposit", {
        p_provider_ref: pi.id,
        p_amount_minor: pi.amount_received,
        p_currency: pi.currency,
      });
      if (error) throw error;
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { error } = await admin.rpc("fail_deposit", { p_provider_ref: pi.id });
      if (error) throw error;
    }
    // other event types: acknowledge and ignore
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    // 500 makes Stripe retry. complete_deposit is idempotent, so retries are safe.
    console.error("webhook handler failed", err);
    return new Response("Handler error", { status: 500 });
  }
});
