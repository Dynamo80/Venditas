-- Venditas: data retention
-- Paste into the Supabase SQL editor and Run. Safe to re-run.
--
-- A privacy policy that promises deletion while nothing is ever deleted is
-- worse than one that promises nothing: it is a written, dated, provable false
-- statement. This makes the promise true.

create or replace function purge_old_data()
returns table (usage_deleted int, leads_deleted int)
language plpgsql
security definer
set search_path = public
as $$
declare
  u int;
  l int;
begin
  -- Request counters exist to enforce a daily limit. Beyond a quarter they
  -- serve no purpose and are simply data we are holding for no reason.
  delete from usage_daily where day < (now() at time zone 'utc')::date - interval '90 days';
  get diagnostics u = row_count;

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

  return query select u, l;
end;
$$;

revoke all on function purge_old_data() from public, anon, authenticated;

-- Run it once now so the first execution isn't the scheduled one.
select * from purge_old_data();
