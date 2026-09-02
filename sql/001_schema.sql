-- Bellwether schema, v1
-- Paste this whole file into the Supabase SQL editor and hit Run.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------- providers
create table if not exists providers (
  id                text primary key,          -- 'openai'
  name              text not null,             -- 'OpenAI'
  edge_url          text not null,             -- unauthenticated probe target
  edge_method       text not null default 'GET',
  edge_up_codes     int[] not null default '{200,401,403,405}',  -- reached the API = up
  statuspage_url    text,                      -- Statuspage summary.json, if any
  inference_enabled boolean not null default false,
  sort              int not null default 100,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------- raw samples
-- One row per probe. This is the append-only record everything else derives
-- from; never edit, never backfill. Its credibility is the product.
create table if not exists probes (
  id          bigserial primary key,
  provider_id text not null references providers(id) on delete cascade,
  kind        text not null,                   -- 'edge' | 'inference'
  region      text not null,                   -- 'blr' | 'iad' | ...
  ts          timestamptz not null default now(),
  ok          boolean not null,
  http_status int,
  dns_ms      numeric(10,2),
  tcp_ms      numeric(10,2),
  tls_ms      numeric(10,2),
  ttfb_ms     numeric(10,2),
  total_ms    numeric(10,2),
  tokens_out  int,                             -- inference only
  error       text
);
create index if not exists probes_provider_ts  on probes (provider_id, ts desc);
create index if not exists probes_ts           on probes (ts desc);
create index if not exists probes_kind_ts      on probes (kind, ts desc);

-- --------------------------------------------------- official status events
-- What the provider itself admits to, scraped from its public status page.
-- Kept separate from our measurements on purpose: the gap between the two is
-- the most interesting thing we have.
create table if not exists status_events (
  id          bigserial primary key,
  provider_id text not null references providers(id) on delete cascade,
  external_id text,
  ts          timestamptz not null default now(),
  indicator   text,                            -- none|minor|major|critical
  name        text,
  description text,
  url         text
);
create unique index if not exists status_events_dedupe
  on status_events (provider_id, coalesce(external_id,''), coalesce(indicator,''));

-- ------------------------------------------------------------- our verdicts
-- Incidents Bellwether detected from probe data, independent of the provider.
create table if not exists incidents (
  id              bigserial primary key,
  provider_id     text not null references providers(id) on delete cascade,
  kind            text not null,
  key             text not null unique,        -- stable dedupe key
  severity        text not null,               -- 'degraded' | 'down'
  started_at      timestamptz not null,
  ended_at        timestamptz,
  peak_ttfb_ms    numeric(10,2),
  baseline_ttfb_ms numeric(10,2),
  error_rate      numeric(5,4),
  notified_at     timestamptz
);
create index if not exists incidents_open on incidents (provider_id, ended_at);

-- ----------------------------------------------------------------- rollups
-- Precomputed so the public index never scans the raw table.
create table if not exists rollups_hourly (
  provider_id text not null references providers(id) on delete cascade,
  kind        text not null,
  region      text not null,
  hour        timestamptz not null,
  samples     int not null,
  ok_count    int not null,
  p50_ms      numeric(10,2),
  p95_ms      numeric(10,2),
  p99_ms      numeric(10,2),
  primary key (provider_id, kind, region, hour)
);
create index if not exists rollups_hour on rollups_hourly (hour desc);

-- ------------------------------------------------------------- subscribers
create table if not exists subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  created_at      timestamptz not null default now(),
  plan            text not null default 'free',   -- free | pro
  status          text not null default 'active', -- active | past_due | cancelled
  providers       text[] not null default '{}',
  slack_webhook   text,
  razorpay_sub_id text,
  verified        boolean not null default false,
  unsub_token     uuid not null default gen_random_uuid()
);
create index if not exists subscribers_plan on subscribers (plan, status);

-- ------------------------------------------------------------ alerts ledger
-- Exists to guarantee we never send the same person the same incident twice.
create table if not exists alerts (
  id            bigserial primary key,
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  incident_id   bigint not null references incidents(id) on delete cascade,
  channel       text not null,                 -- email | slack
  sent_at       timestamptz not null default now(),
  unique (subscriber_id, incident_id, channel)
);

-- ------------------------------------------------------------------- policy
-- Measurements are public: that is the whole marketing strategy.
-- Subscriber rows are not readable by anyone but the service role.
alter table providers      enable row level security;
alter table probes         enable row level security;
alter table status_events  enable row level security;
alter table incidents      enable row level security;
alter table rollups_hourly enable row level security;
alter table subscribers    enable row level security;
alter table alerts         enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='providers' and policyname='public_read') then
    create policy public_read on providers      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='probes' and policyname='public_read') then
    create policy public_read on probes         for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='status_events' and policyname='public_read') then
    create policy public_read on status_events  for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='incidents' and policyname='public_read') then
    create policy public_read on incidents      for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='rollups_hourly' and policyname='public_read') then
    create policy public_read on rollups_hourly for select to anon, authenticated using (true);
  end if;
end $$;
-- subscribers and alerts intentionally get no anon policy: service role only.

-- ------------------------------------------------------------- seed providers
-- edge_url is an endpoint that rejects unauthenticated calls quickly. We are
-- measuring whether the API edge is reachable and how fast it answers, not
-- borrowing anything: a 401 is a successful measurement.
insert into providers (id, name, edge_url, edge_method, statuspage_url, inference_enabled, sort) values
  ('openai',    'OpenAI',        'https://api.openai.com/v1/models',                        'GET',  'https://status.openai.com/api/v2/summary.json',    false, 10),
  ('anthropic', 'Anthropic',     'https://api.anthropic.com/v1/messages',                   'GET',  'https://status.claude.com/api/v2/summary.json', false, 20),
  ('google',    'Google Gemini', 'https://generativelanguage.googleapis.com/v1beta/models', 'GET',  null,                                               true,  30),
  ('groq',      'Groq',          'https://api.groq.com/openai/v1/models',                   'GET',  'https://groqstatus.com/api/v2/summary.json',       false, 40),
  ('mistral',   'Mistral',       'https://api.mistral.ai/v1/models',                        'GET',  null,    false, 50),
  ('cohere',    'Cohere',        'https://api.cohere.com/v1/models',                        'GET',  'https://status.cohere.com/api/v2/summary.json',    false, 60)
on conflict (id) do update set
  name = excluded.name,
  edge_url = excluded.edge_url,
  edge_method = excluded.edge_method,
  statuspage_url = excluded.statuspage_url,
  sort = excluded.sort;
