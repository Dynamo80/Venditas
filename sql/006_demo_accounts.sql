-- Venditas: verified demo accounts
-- Paste into the Supabase SQL editor and Run. Safe to re-run.
-- Requires sql/001_leads.sql.
--
-- Someone who sat through a demo is not the same as a stranger who found the
-- landing page, and until now the system could not tell them apart: both typed
-- an address into a form and neither address was ever checked. This adds the
-- one thing that turns a typed string into an account — a link that had to be
-- clicked in a mailbox the person actually reads.
--
-- The strictness lives in lib/email-policy.mjs. Everything here exists to make
-- the verification single-use and expiring, because a magic link that works
-- twice is a magic link that works for whoever else has the email.

alter table leads add column if not exists account_status  text not null default 'none';
-- none | pending | verified | blocked
alter table leads add column if not exists full_name       text;
alter table leads add column if not exists verify_hash     text;
alter table leads add column if not exists verify_expires  timestamptz;
alter table leads add column if not exists verify_sent_at  timestamptz;
alter table leads add column if not exists verified_at     timestamptz;
alter table leads add column if not exists signup_ip_key   text;
alter table leads add column if not exists demo_at         timestamptz;

create index if not exists leads_account on leads (account_status);

-- The token is never stored. Only its SHA-256 lands here, so a leaked database
-- backup is not a set of working sign-in links.
--
-- Returns nothing on purpose: the caller already knows the token it generated,
-- and returning it from the database would put it in one more log.
create or replace function demo_signup(
  p_email      text,
  p_name       text,
  p_agency     text,
  p_hash       text,
  p_expires    timestamptz,
  p_ip_key     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into leads (email, agency, full_name, source, account_status,
                     verify_hash, verify_expires, verify_sent_at, signup_ip_key)
  values (lower(trim(p_email)), nullif(trim(coalesce(p_agency,'')),''),
          nullif(trim(coalesce(p_name,'')),''), 'demo', 'pending',
          p_hash, p_expires, now(), p_ip_key)
  on conflict (email) do update
    set full_name      = coalesce(excluded.full_name, leads.full_name),
        agency         = coalesce(excluded.agency, leads.agency),
        verify_hash    = excluded.verify_hash,
        verify_expires = excluded.verify_expires,
        verify_sent_at = now(),
        signup_ip_key  = excluded.signup_ip_key,
        last_seen      = now(),
        -- Someone already verified who signs up again stays verified: a second
        -- link should not silently downgrade a working account.
        account_status = case when leads.account_status = 'verified'
                              then 'verified' else 'pending' end;
end;
$$;

-- Consume a link. Single-use: the hash is cleared in the same statement that
-- accepts it, so a forwarded email cannot be replayed.
--
-- Matching on the hash rather than the address means a valid link is sufficient
-- on its own, and an attacker who knows an address still has nothing.
create or replace function demo_verify(p_hash text)
returns table (email text, full_name text, agency text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update leads
     set account_status = 'verified',
         verified_at    = coalesce(leads.verified_at, now()),
         verify_hash    = null,
         verify_expires = null,
         last_seen      = now()
   where leads.verify_hash = p_hash
     and leads.verify_expires > now()
     and leads.account_status <> 'blocked'
  returning leads.email, leads.full_name, leads.agency;
end;
$$;

-- Housekeeping: a pending signup nobody completed is a dead row holding a hash.
create or replace function purge_stale_signups()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  update leads
     set verify_hash = null, verify_expires = null,
         account_status = case when account_status = 'pending' then 'none' else account_status end
   where verify_expires is not null and verify_expires < now() - interval '7 days';
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function demo_signup(text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function demo_verify(text) from public, anon, authenticated;
revoke all on function purge_stale_signups() from public, anon, authenticated;

select purge_stale_signups();
