-- Venditas: somewhere to record a paying customer
-- Paste into the Supabase SQL editor and Run. Safe to re-run.
--
-- Found by the status tool asking for leads.plan and being told it does not
-- exist. The entire business is pointed at getting someone to pay, and there
-- was no field anywhere to write down that they had.
--
-- This lives in Postgres rather than a local file deliberately. A spreadsheet
-- works for five customers and quietly becomes the problem at fifty: the app
-- cannot read it to gate a paid feature, a webhook cannot write to it, and it
-- exists on one laptop. Customer records belong where the application can see
-- them.

alter table leads add column if not exists plan text not null default 'free';
alter table leads add column if not exists plan_status text not null default 'none';
alter table leads add column if not exists plan_started timestamptz;
alter table leads add column if not exists plan_currency text;
alter table leads add column if not exists plan_amount numeric(10,2);
-- Whatever the payment rail gives us: a Razorpay subscription id, a Skydo
-- invoice number, or a note that it was a bank transfer. Free text while the
-- rail is still being settled; tighten it once one wins.
alter table leads add column if not exists payment_ref text;

-- plan:        free | agency
-- plan_status: none | trialing | active | past_due | cancelled

create index if not exists leads_paying on leads (plan, plan_status)
  where plan <> 'free';

-- The number that matters, computed rather than maintained by hand somewhere
-- that will drift away from the truth.
create or replace view mrr as
select
  count(*) filter (where plan_status = 'active')                      as paying,
  coalesce(sum(plan_amount) filter (where plan_status = 'active'), 0) as mrr,
  coalesce(
    (array_agg(distinct plan_currency) filter (where plan_status = 'active'))[1],
    'GBP'
  ) as currency
from leads
where plan <> 'free';

-- Same policy as everything else here: service role only, nothing public.
revoke all on mrr from anon, authenticated;

-- Recording a sale, for whoever is reading this at 2am:
--
--   update leads
--      set plan = 'agency', plan_status = 'active', plan_started = now(),
--          plan_currency = 'GBP', plan_amount = 79,
--          payment_ref = 'skydo invoice 0001'
--    where email = 'them@theiragency.co.uk';
