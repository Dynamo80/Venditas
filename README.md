# Bellwether

Independent reliability probes for AI provider APIs.

Every few minutes this measures whether each provider's API is reachable, how
long the network legs take, and — where a key is available — how long a real
generation request takes end to end. Samples are appended to Postgres and never
edited.

The measurements are public. That is deliberate: an independent record is only
worth something if anyone can check it.

## Run it

```bash
node probe/run.mjs --dry
```

No database, no API keys, no signup. It probes the live providers and prints
what it found. This is the fastest way to see whether the numbers are real.

For a live sweep that writes to Postgres:

```bash
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
node probe/run.mjs
```

## What is measured

**Edge probe** — an unauthenticated request to the provider's API. The question
is whether the edge is reachable and how fast it answers; a `401` answers that
perfectly, so auth-rejection codes count as reachable. A `5xx`, a TLS failure or
a timeout does not. Runs for every provider, needs no key, and costs nothing.

**Inference probe** — a real generation request: fixed prompt, temperature 0,
fixed output cap, so the series stays comparable across providers and across
months. Activates per provider only when that provider's key is in the
environment.

**Official status** — what the provider admits to on its own public status page,
stored separately from our own measurements. The gap between the two is the most
interesting thing here.

## How the timings are taken

`fetch` cannot say where the time went, so `probe/timing.mjs` drops to
`node:https` and hooks the socket lifecycle to separate DNS from TCP from TLS
from the server actually thinking. Each phase is reported as its own duration,
not a cumulative offset.

Every probe opens a fresh socket. A connection reused from a keep-alive pool
would report ~0ms for DNS, TCP and TLS and quietly corrupt the series.

## Known limits

Stated here rather than buried, because a measurement you can't audit is just an
assertion.

- **Region coverage is thin.** Scheduled sweeps run from one location. A number
  taken from one place is not a global number.
- **Sampling is not perfectly even.** GitHub's scheduler runs late under load.
  Every sample carries its own timestamp, and nothing downstream assumes a fixed
  interval.
- **Inference coverage depends on keys.** Providers without a key in the
  environment get edge probes only — real latency for them is not being
  measured, and the index says so rather than leaving a blank that looks like
  a zero.
- **Model pins matter.** Each inference probe names an exact model version, never
  a `-latest` alias, because an alias that shifts underneath a benchmark
  invalidates every prior comparison. When a pinned model is retired, the
  changeover is recorded rather than backfilled.

## Layout

```
probe/timing.mjs      timed HTTPS with per-phase socket instrumentation
probe/inference.mjs   per-provider generation probes, key-gated
probe/providers.mjs   offline fallback list, mirrors the SQL seed
probe/store.mjs       Supabase over plain REST, no SDK
probe/run.mjs         one sweep
sql/001_schema.sql    tables, RLS policy, seed rows
```

No dependencies. It has to run identically in a GitHub Action, an edge function
and on a laptop.
