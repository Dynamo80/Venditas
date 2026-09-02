/**
 * One probe sweep. Designed to be run on a schedule, every few minutes,
 * forever.
 *
 *   node probe/run.mjs            write to Supabase
 *   node probe/run.mjs --dry      measure and print, write nothing
 *
 * Providers are probed concurrently: doing them in sequence would spread one
 * sweep over half a minute and make "the same moment" mean different things
 * for the first provider and the last.
 */

import { timedRequest } from './timing.mjs';
import { probeInference, activeInferenceProviders } from './inference.mjs';
import { DEFAULT_PROVIDERS } from './providers.mjs';

const DRY = process.argv.includes('--dry');

// store.mjs demands credentials at import time, which a dry run has no business
// needing. Loaded only on the path that actually writes.
const store = DRY ? null : await import('./store.mjs');
const REGION = process.env.PROBE_REGION || 'local';

/**
 * An unauthenticated request to a provider's API. We are asking one question:
 * is the API edge reachable, and how fast does it answer? A 401 answers that
 * perfectly, so auth-rejection codes count as up. A 5xx or a timeout does not.
 */
async function probeEdge(p) {
  const r = await timedRequest(p.edge_url, { method: p.edge_method || 'GET', timeoutMs: 15000 });
  const upCodes = p.edge_up_codes || [200, 401, 403, 405];
  const reached = r.httpStatus != null && upCodes.includes(r.httpStatus);
  return {
    kind: 'edge',
    ok: reached,
    http_status: r.httpStatus,
    dns_ms: r.dnsMs,
    tcp_ms: r.tcpMs,
    tls_ms: r.tlsMs,
    ttfb_ms: r.ttfbMs,
    total_ms: r.totalMs,
    tokens_out: null,
    error: r.error ? String(r.error).slice(0, 500)
      : reached ? null : `unexpected status ${r.httpStatus}`,
  };
}

/**
 * What the provider admits to on its own public status page.
 *
 * Plain fetch rather than our timed client: we don't care how fast a status
 * page answers, and we do care about following redirects — Anthropic moved
 * theirs to status.claude.com and the feed silently went empty until we did.
 */
async function fetchStatus(p) {
  if (!p.statuspage_url) return [];
  try {
    const res = await fetch(p.statuspage_url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Bellwether/1.0 (+https://venditas.in/about)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const j = await res.json();
    const rows = [];
    const indicator = j?.status?.indicator ?? null;

    rows.push({
      provider_id: p.id,
      external_id: `overall:${indicator}`,
      indicator,
      name: j?.status?.description ?? null,
      description: null,
      url: j?.page?.url ?? null,
    });

    for (const inc of j?.incidents ?? []) {
      rows.push({
        provider_id: p.id,
        external_id: inc.id,
        indicator: inc.impact ?? null,
        name: inc.name ?? null,
        description: (inc.incident_updates?.[0]?.body ?? '').slice(0, 1000) || null,
        url: inc.shortlink ?? null,
      });
    }
    return rows;
  } catch {
    return [];
  }
}

async function main() {
  const started = Date.now();
  const providers = DRY ? DEFAULT_PROVIDERS : await store.getProviders();
  if (!providers?.length) {
    console.error('No providers in the database. Run sql/001_schema.sql first.');
    process.exit(1);
  }

  const withKeys = new Set(activeInferenceProviders());
  const ts = new Date().toISOString();

  const results = await Promise.all(
    providers.map(async (p) => {
      const jobs = [probeEdge(p)];
      if (withKeys.has(p.id)) jobs.push(probeInference(p.id));
      const [edge, inf] = await Promise.all(jobs);
      return [edge, inf].filter(Boolean).map((s) => ({ ...s, provider_id: p.id, region: REGION, ts }));
    })
  );

  const samples = results.flat();
  const statusRows = (await Promise.all(providers.map(fetchStatus))).flat();

  // ---- report -------------------------------------------------------------
  const pad = (s, n) => String(s ?? '').padEnd(n);
  const num = (v, n = 9) => String(v ?? '-').padStart(n);
  console.log(`\nBellwether sweep  region=${REGION}  ${ts}${DRY ? '  [dry run]' : ''}`);
  console.log('─'.repeat(88));
  console.log(pad('provider', 14) + pad('kind', 11) + num('http') + num('dns') + num('tls') + num('ttfb') + num('total'));
  console.log('─'.repeat(88));
  for (const s of samples) {
    const mark = s.ok ? ' ' : ' !';
    console.log(
      pad(s.provider_id, 14) + pad(s.kind, 11) +
      num(s.http_status) + num(s.dns_ms) + num(s.tls_ms) + num(s.ttfb_ms) + num(s.total_ms) + mark +
      (s.error ? `  ${s.error.slice(0, 60)}` : '')
    );
  }
  console.log('─'.repeat(88));

  const down = samples.filter((s) => !s.ok);
  const inferenceCount = samples.filter((s) => s.kind === 'inference').length;
  console.log(
    `${samples.length} samples · ${inferenceCount} inference · ` +
    `${down.length} failing · status rows ${statusRows.length} · ${Date.now() - started}ms`
  );

  if (DRY) {
    console.log('\nDry run: nothing written.');
    return;
  }

  await store.insertProbes(samples);
  await store.upsertStatusEvents(statusRows);
  console.log(`Written. Total probes stored: ${await store.countProbes()}`);
}

main().catch((e) => {
  console.error('sweep failed:', e.message);
  process.exit(1);
});
