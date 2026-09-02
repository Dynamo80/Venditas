-- Venditas: prospects and the shared contact ledger
-- Paste into the Supabase SQL editor and Run. Safe to re-run.
--
-- These were CSV files on one laptop. Two problems with that: the work is lost
-- if the disk dies, and a session on any other machine cannot see who has
-- already been contacted — which is exactly how the same agency gets emailed
-- twice by two different runs.
--
-- Contact history in particular has to be shared. It is the record of who we
-- have approached and who asked us to stop, and being wrong about that damages
-- a relationship we cannot get back.

-- ---------------------------------------------------------------- prospects
create table if not exists prospects (
  id           bigserial primary key,
  -- The natural key is the domain: an agency is one organisation, however many
  -- addresses it publishes.
  domain       text not null unique,
  company      text not null,
  website      text,
  email        text,
  city         text,
  country      text,
  size         text,
  specialism   text,
  brand_colour text,
  logo_url     text,
  hook         text,
  -- Which pass found them, so a bad batch can be identified later.
  source       text not null default 'list-1',
  -- Set when an agency runs a CRM that already does branded CV formatting.
  -- Loxo, Recruit CRM, Zoho Recruit and Vincere ship it natively, so pitching
  -- them wastes a send. See docs/decisions/005-target-market.md.
  disqualified boolean not null default false,
  disqualified_reason text,
  added_at     timestamptz not null default now()
);
create index if not exists prospects_country on prospects (country) where not disqualified;
create index if not exists prospects_email   on prospects (email)   where email is not null;

-- ------------------------------------------------------------ contact ledger
-- Every approach, on every channel, keyed by agency rather than by address.
-- Emailing info@ and messaging the founder on LinkedIn are two approaches to
-- the same company, and a cooling-off period that does not know that is not a
-- cooling-off period.
create table if not exists contacts (
  id        bigserial primary key,
  domain    text not null,
  channel   text not null,          -- email | linkedin
  at        timestamptz not null default now(),
  note      text
);
create index if not exists contacts_domain on contacts (domain, at desc);

-- Who may be approached today: never contacted, or last contacted long enough
-- ago. Computed here rather than in application code so email and LinkedIn
-- cannot drift apart on the definition.
create or replace view contactable as
select p.*
  from prospects p
 where not p.disqualified
   and p.email is not null
   and not exists (
     select 1 from contacts c
      where c.domain = p.domain
        and c.at > now() - interval '21 days'
   );

alter table prospects enable row level security;
alter table contacts  enable row level security;
-- No anon policies. A public prospect list is a competitor's shortcut, and a
-- public contact history is a privacy problem.

revoke all on contactable from anon, authenticated;
