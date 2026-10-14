-- Run in Supabase → SQL Editor.
-- Assumes tables: wallets(user_id, currency, balance) and
-- transactions(user_id, type, from_currency, from_amount, to_currency, to_amount, rate, status)

-- 1) Every card deposit gets a row BEFORE money moves. Only the server writes here.
create table if not exists public.deposits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete restrict,
  currency     text not null check (currency in ('USD','EUR','GBP')),
  amount       numeric(18,2) not null check (amount >= 1 and amount <= 10000),
  provider     text not null default 'stripe',
  provider_ref text unique,                       -- Stripe PaymentIntent id (pi_...)
  status       text not null default 'pending'
               check (status in ('pending','completed','failed')),
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.deposits enable row level security;

-- Users may read their own deposits. No insert/update/delete policies exist,
-- so the browser cannot create or change a deposit. Only the service role can.
drop policy if exists "read own deposits" on public.deposits;
create policy "read own deposits" on public.deposits
  for select using (auth.uid() = user_id);

-- 2) The ONLY code path that credits a wallet for a card deposit.
--    Idempotent: Stripe retries webhooks, so a second call must not double-credit.
create or replace function public.complete_deposit(
  p_provider_ref text,
  p_amount_minor bigint,   -- Stripe amount_received, in cents
  p_currency     text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.deposits%rowtype;
begin
  select * into d from public.deposits
   where provider_ref = p_provider_ref
   for update;                                   -- row lock: serialises duplicate webhooks

  if not found then
    raise exception 'unknown deposit %', p_provider_ref;
  end if;

  if d.status = 'completed' then
    return;                                      -- already credited
  end if;

  if (d.amount * 100)::bigint <> p_amount_minor or d.currency <> upper(p_currency) then
    raise exception 'amount/currency mismatch for %', p_provider_ref;
  end if;

  update public.wallets
     set balance = balance + d.amount
   where user_id = d.user_id and currency = d.currency;

  if not found then
    raise exception 'wallet missing for user % / %', d.user_id, d.currency;
  end if;

  update public.deposits
     set status = 'completed', completed_at = now()
   where id = d.id;

  insert into public.transactions
    (user_id, type, from_currency, from_amount, to_currency, to_amount, rate, status)
  values
    (d.user_id, 'receive', d.currency, d.amount, d.currency, d.amount, 1, 'completed');
end;
$$;

-- Browser roles must never be able to call it.
revoke all on function public.complete_deposit(text, bigint, text) from public, anon, authenticated;
grant execute on function public.complete_deposit(text, bigint, text) to service_role;

-- 3) Marks a deposit failed (called from the webhook on payment_failed).
create or replace function public.fail_deposit(p_provider_ref text)
returns void language sql security definer set search_path = public as $$
  update public.deposits set status = 'failed'
   where provider_ref = p_provider_ref and status = 'pending';
$$;
revoke all on function public.fail_deposit(text) from public, anon, authenticated;
grant execute on function public.fail_deposit(text) to service_role;

-- 4) !!! THE STEP THAT MAKES ALL OF THE ABOVE MATTER !!!
-- Right now the browser can run: client.from('wallets').update({balance: 999999})
-- Until that is blocked, a user can skip Stripe entirely.
--
-- DO NOT run this yet. withdraw.html, exchange.html and the send-to-user flow
-- still update wallets from the browser and will break the moment you revoke.
-- Run it only after those are moved into security-definer functions (issues 2/3/5).
--
--   revoke update, insert, delete on public.wallets from anon, authenticated;
--
-- Also check what policies exist today:
--   select policyname, cmd, qual, with_check from pg_policies
--    where tablename in ('wallets','transactions','profiles');
