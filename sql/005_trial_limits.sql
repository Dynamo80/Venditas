-- Venditas: enforceable trial limits
-- Paste into the Supabase SQL editor and Run. Safe to re-run.
--
-- Run sql/001_leads.sql first. This file REPLACES purge_old_data from
-- sql/002_retention.sql — if you ever re-run 002, run this file again after it.
--
-- Why this exists: the ten-CV trial was not ten CVs. Three separate round trips
-- decided it, so two uploads arriving together both read the same total and both
-- went through; and the lifetime total was summed from usage_daily, which the
-- retention purge empties after 90 days, so everyone got a fresh trial every
-- quarter. See docs/decisions/009-enforceable-trial-limits.md.

-- ------------------------------------------------------------ trial totals
-- The lifetime counter, kept apart from usage_daily precisely because
-- usage_daily is purged on a 90-day clock and this must not be.
--
-- The key is a salted hash of the canonicalised address, never the address:
-- same treatment as the IP counters, and what the Article 30 record describes.
create table if not exists usage_totals (
  key        text primary key,
  count      int not null default 0,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);
create index if not exists usage_totals_seen on usage_totals (last_seen desc);
alter table usage_totals enable row level security;
-- No anon policies, deliberately. Service role only: a usage count tells an
-- abuser exactly how much room they have left.

-- ------------------------------------------------------------- one decision
-- Every counter the allow/deny decision needs, in one transaction. Doing this
-- as three calls left a window between each one, and a rate limit with a window
-- in it is a rate suggestion.
create or replace function bump_trial(p_ip_key text, p_email_key text default null)
returns table (ip_today int, email_today int, email_total int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip    int := 0;
  v_day   int := 0;
  v_total int := 0;
begin
  insert into usage_daily (key, kind, count) values (p_ip_key, 'ip', 1)
  on conflict (key, kind, day) do update set count = usage_daily.count + 1
  returning usage_daily.count into v_ip;

  if p_email_key is not null and p_email_key <> '' then
    insert into usage_daily (key, kind, count) values (p_email_key, 'email', 1)
    on conflict (key, kind, day) do update set count = usage_daily.count + 1
    returning usage_daily.count into v_day;

    insert into usage_totals (key, count) values (p_email_key, 1)
    on conflict (key) do update
      set count = usage_totals.count + 1, last_seen = now()
    returning usage_totals.count into v_total;
  end if;

  return query select v_ip, v_day, v_total;
end;
$$;

-- ------------------------------------------------------------------- leads
-- Upsert and increment together. cv_count has existed since 001 and has never
-- been written, because a merge-duplicates upsert would have reset it — so the
-- app kept a shadow counter in usage_daily instead, keyed to the address in
-- clear text. This replaces both.
--
-- may_contact is deliberately absent from the update list: someone who
-- unsubscribed and later runs another CV must stay unsubscribed.
create or replace function record_lead(p_email text, p_agency text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into leads (email, agency, cv_count, source)
  values (lower(trim(p_email)), nullif(trim(coalesce(p_agency, '')), ''), 1, 'tool')
  on conflict (email) do update
    set agency    = coalesce(excluded.agency, leads.agency),
        last_seen = now(),
        cv_count  = leads.cv_count + 1;
end;
$$;

-- --------------------------------------------------------------- retention
-- Supersedes the version in 002. Dropped first because the return type gains a
-- column and Postgres will not replace a function across that change.
drop function if exists purge_old_data();

create or replace function purge_old_data()
returns table (usage_deleted int, totals_deleted int, leads_deleted int)
language plpgsql
security definer
set search_path = public
as $$
declare
  u int;
  t int;
  l int;
begin
  -- Request counters exist to enforce a daily limit. Beyond a quarter they
  -- serve no purpose and are simply data we are holding for no reason.
  delete from usage_daily where day < (now() at time zone 'utc')::date - interval '90 days';
  get diagnostics u = row_count;

  -- Trial totals are kept longer than the daily counters, because deleting one
  -- is handing back a trial that was already spent. Twenty-four months matches
  -- the dormant-account rule below: if we have forgotten the person, there is
  -- nothing left to meter.
  delete from usage_totals where last_seen < now() - interval '24 months';
  get diagnostics t = row_count;

  -- Someone who tried the tool once, two years ago, never came back and never
  -- opted out. There is no legitimate interest in keeping them any longer.
  --
  -- Rows with may_contact = false are deliberately NOT deleted. That flag is
  -- the record of an opt-out, and deleting it would mean forgetting that
  -- someone asked us to stop — which is how a suppression list quietly fails
  -- and a person gets contacted again years later.
  delete from leads
   where may_contact = true
     and last_seen < now() - interval '24 months';
  get diagnostics l = row_count;

  return query select u, t, l;
end;
$$;

-- ------------------------------------------------------------------ tidy up
-- The email counters were keyed to the address itself. They are keyed to a
-- salted hash now, so these rows are unreadable by the current code and are
-- personal data we no longer have any use for. This also clears the 'cv:'
-- shadow rows that record_lead replaces.
delete from usage_daily where kind = 'email' and key like '%@%';

-- ------------------------------------------------------------------ policy
revoke all on function bump_trial(text, text) from public, anon, authenticated;
revoke all on function record_lead(text, text) from public, anon, authenticated;
revoke all on function purge_old_data() from public, anon, authenticated;

-- Run it once now so the first execution isn't the scheduled one.
select * from purge_old_data();
