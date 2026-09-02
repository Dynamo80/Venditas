/**
 * Read side. Uses the anon key: every table the index touches is public by RLS
 * policy, and the measurements being publicly readable is the whole strategy.
 *
 * Nothing here throws. The page must render before the database exists, before
 * the first sweep lands, and during an outage of our own — an index that 500s
 * when it has nothing to say is worse than one that says "no data yet".
 */

const URL_BASE = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;

export const configured = Boolean(URL_BASE && ANON);

async function rest(path) {
  if (!configured) return null;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const WINDOW_HOURS = 24;

export async function getIndex() {
  const since = new Date(Date.now() - WINDOW_HOURS * 3600_000).toISOString();

  const [providers, probes, statusRows] = await Promise.all([
    rest('providers?select=id,name,sort&order=sort.asc'),
    rest(
      `probes?select=provider_id,kind,region,ts,ok,ttfb_ms,total_ms,http_status` +
      `&ts=gte.${since}&order=ts.asc&limit=20000`
    ),
    rest('status_events?select=provider_id,indicator,name,ts&order=ts.desc&limit=200'),
  ]);

  if (!providers?.length) return { configured, providers: [], regions: [], windowHours: WINDOW_HOURS };

  const byProvider = new Map(providers.map((p) => [p.id, []]));
  for (const s of probes ?? []) byProvider.get(s.provider_id)?.push(s);

  // Most recent official indicator per provider, if their status page has one.
  const official = new Map();
  for (const r of statusRows ?? []) {
    if (!official.has(r.provider_id) && r.indicator) official.set(r.provider_id, r);
  }

  const regions = [...new Set((probes ?? []).map((s) => s.region))].sort();

  const rows = providers.map((p) => {
    const all = byProvider.get(p.id) ?? [];
    return {
      id: p.id,
      name: p.name,
      edge: summarise(all.filter((s) => s.kind === 'edge')),
      inference: summarise(all.filter((s) => s.kind === 'inference')),
      official: official.get(p.id) ?? null,
    };
  });

  return { configured, providers: rows, regions, windowHours: WINDOW_HOURS };
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Math.round(sorted[i]);
}

/**
 * Availability is counted over every sample, latency only over successful ones:
 * a timeout has no meaningful response time, and letting one in would drag the
 * percentile toward whatever we happened to set the timeout to.
 */
function summarise(samples) {
  if (!samples.length) return null;

  const ok = samples.filter((s) => s.ok);
  const lat = ok.map((s) => Number(s.ttfb_ms)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  const latest = samples[samples.length - 1];

  const buckets = sparkline(samples);

  return {
    samples: samples.length,
    availability: ok.length / samples.length,
    p50: percentile(lat, 50),
    p95: percentile(lat, 95),
    latestOk: latest.ok,
    latestTs: latest.ts,
    latestMs: latest.ok && Number.isFinite(Number(latest.ttfb_ms)) ? Math.round(Number(latest.ttfb_ms)) : null,
    buckets,
  };
}

/** Hourly medians for the strip chart. Null where we simply have no samples. */
function sparkline(samples, count = 24) {
  const now = Date.now();
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const hi = now - i * 3600_000;
    const lo = hi - 3600_000;
    const inBucket = samples.filter((s) => {
      const t = Date.parse(s.ts);
      return t > lo && t <= hi;
    });
    if (!inBucket.length) { out.push(null); continue; }
    const ok = inBucket.filter((s) => s.ok);
    const lat = ok.map((s) => Number(s.ttfb_ms)).filter(Number.isFinite).sort((a, b) => a - b);
    out.push({
      ms: percentile(lat, 50),
      availability: ok.length / inBucket.length,
      samples: inBucket.length,
    });
  }
  return out;
}
