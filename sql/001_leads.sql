-- Venditas: leads and usage metering
-- Paste into the Supabase SQL editor and Run. Safe to re-run.

-- ------------------------------------------------------------------- leads
-- Someone who used the tool and gave us an address. They have seen the output
-- before handing anything over, which is what makes them worth contacting.
create table if not exists leads (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  agency       text,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  cv_count     int not null default 0,
  source       text not null default 'tool',
  -- Set when they use the tool, because the notice next to the field says we
  -- will email them about Venditas. Cleared the moment they unsubscribe.
  may_contact  boolean not null default true,
  unsub_token  uuid not null default gen_random_uuid(),
  notes        text
);
create index if not exists leads_seen on leads (last_seen desc);

-- ------------------------------------------------------------------- usage
-- Per-day counters for metering and abuse control.
--
-- The key for an anonymous visitor is a salted hash of their IP, never the
-- address itself: we need to count requests, not identify people, and storing
-- the raw address would collect personal data we have no use for.
create table if not exists usage_daily (
  key    text not null,
  kind   text not null,            -- 'ip' | 'email'
  day    date not null default (now() at time zone 'utc')::date,
  count  int  not null default 0,
  primary key (key, kind, day)
);
create index if not exists usage_day on usage_daily (day desc);

-- Atomic increment-and-return. Doing this as read-then-write in the app would
-- let two concurrent uploads both read the same count and both be allowed
-- through, which is exactly the case a rate limit exists to stop.
create or replace function bump_usage(p_key text, p_kind text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  insert into usage_daily (key, kind, count)
  values (p_key, p_kind, 1)
  on conflict (key, kind, day)
  do update set count = usage_daily.count + 1
  returning count into new_count;
  return new_count;
end;
$$;

-- ------------------------------------------------------------------ policy
-- Neither table is readable by the public. Lead email addresses are the asset
-- and the liability; usage counts would tell an abuser exactly how much room
-- they have left.
alter table leads       enable row level security;
alter table usage_daily enable row level security;
-- No anon policies, deliberately. Service role only.

revoke all on function bump_usage(text, text) from public, anon, authenticated;
