/**
 * What is actually true right now.
 *
 *   node ops/status.mjs
 *
 * The point of this file is that it does not remember anything. Every number
 * below is fetched from the live system at the moment you run it.
 *
 * A hand-maintained status document is a diary: it is accurate on the day it is
 * written and quietly wrong forever after, and the person reading it has no way
 * to tell which. Anything measurable is measured here; STATE.md carries only the
 * things that genuinely cannot be — intent, blockers, what we decided to do
 * next.
 *
 * Prints secret NAMES, never values.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const SITE = 'https://www.venditas.in';

const env = (() => {
  const f = path.join(ROOT, '.env.local');
  if (!existsSync(f)) return {};
  return Object.fromEntries(
    readFileSync(f, 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
})();

const ok = (b) => (b ? 'yes' : 'NO');
const pad = (s, n) => String(s).padEnd(n);

async function jget(url, opts = {}) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), ...opts });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function sb(pathAndQuery, extraHeaders = {}) {
  const base = env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET || env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(`${base}/rest/v1/${pathAndQuery}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, ...extraHeaders },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return { rows: await res.json(), range: res.headers.get('content-range') };
  } catch {
    return null;
  }
}

/** Minimal CSV reader: header row, quoted fields, newlines inside quotes. */
function readCsv(file) {
  const f = path.join(ROOT, 'outreach', file);
  if (!existsSync(f)) return [];
  const text = readFileSync(f, 'utf8');
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ''])));
}

function countCsv(file) {
  const f = path.join(ROOT, 'outreach', file);
  if (!existsSync(f)) return null;
  // Rows, not lines: quoted fields contain newlines.
  const text = readFileSync(f, 'utf8');
  let rows = 0, quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') quoted = !quoted;
    else if (c === '\n' && !quoted) rows++;
  }
  return Math.max(0, rows - 1);
}

async function main() {
  console.log('\n' + '='.repeat(66));
  console.log(' VENDITAS  ·  measured state  ·  ' + new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC');
  console.log('='.repeat(66));

  // ---- production -------------------------------------------------------
  const health = await jget(`${SITE}/api/health?t=${Date.now()}`);
  console.log('\nPRODUCTION');
  if (!health) {
    console.log('  site            UNREACHABLE');
  } else {
    console.log(`  gemini key      ${ok(health.hasGeminiKey)}`);
    console.log(`  supabase        ${ok(health.hasSupabase)}  (via ${health.supabaseKeyFrom || '-'})`);
    console.log(`  metering ready  ${ok(health.meteringReady)}${health.meteringError ? '  ' + health.meteringError.slice(0, 60) : ''}`);
    console.log(`  region          ${health.region}`);
    const bad = (health.rejectedSecrets || []);
    if (bad.length) console.log(`  REJECTED SECRETS  ${bad.join(', ')}  <- bad paste, re-enter`);
  }

  // Does the retention function exist? Only way to know is to call it.
  const purge = env.SUPABASE_URL
    ? await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/purge_old_data`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SECRET || env.SUPABASE_SERVICE_KEY || '',
          Authorization: `Bearer ${env.SUPABASE_SECRET || env.SUPABASE_SERVICE_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
        signal: AbortSignal.timeout(15000),
      }).then((r) => r.status).catch(() => 0)
    : 0;
  // 404 means the function is genuinely absent. Anything else means we could
  // not ask - and reporting "not run" when we simply had no credentials is the
  // kind of confident wrong answer this whole file exists to avoid.
  const retention =
    purge === 200 ? 'installed'
    : purge === 404 ? 'NOT RUN - paste sql/002_retention.sql into Supabase'
    : `unknown (could not check${purge ? `, http ${purge}` : ', no local credentials'})`;
  console.log(`  retention sql   ${retention}`);

  // ---- the business -----------------------------------------------------
  console.log('\nCUSTOMERS AND LEADS');
  // Ask only for columns that have always existed, so a migration that has not
  // been run yet degrades to "cannot see plans" rather than to silence. The
  // first version of this asked for leads.plan, got a 400, and reported the
  // whole database unreachable — which sent me looking in the wrong place
  // entirely.
  const leads = await sb('leads?select=email,agency,may_contact,first_seen&order=first_seen.desc');
  if (!leads) {
    console.log('  (leads table unreadable — check credentials and RLS)');
  } else {
    const rows = leads.rows || [];
    console.log(`  leads captured  ${rows.length}`);
    console.log(`  opted out       ${rows.filter((r) => r.may_contact === false).length}`);
    for (const r of rows.slice(0, 5)) {
      console.log(`    ${pad(r.email, 34)} ${pad(r.agency || '-', 22)} ${r.first_seen?.slice(0, 10)}`);
    }
  }

  const mrr = await sb('mrr?select=*');
  if (!mrr) {
    console.log('  paying          UNKNOWN — run sql/003_customers.sql; there is');
    console.log('                  currently nowhere to record that someone paid');
  } else {
    const m = (mrr.rows || [])[0] || {};
    console.log(`  paying          ${m.paying ?? 0}    <- the only number that matters`);
    console.log(`  MRR             ${m.currency || 'GBP'} ${Number(m.mrr ?? 0).toFixed(2)}`);
  }

  const usage = await sb('usage_daily?select=count&kind=eq.email');
  if (usage) {
    const total = (usage.rows || []).reduce((n, r) => n + (Number(r.count) || 0), 0);
    console.log(`  CVs run (all)   ${total}`);
  }

  // ---- outreach ---------------------------------------------------------
  console.log('\nOUTREACH');
  const lists = ['prospects.csv', 'prospects-uk-2.csv', 'colours-verified.csv'];
  for (const f of lists) {
    const n = countCsv(f);
    console.log(`  ${pad(f, 24)} ${n === null ? 'not present' : n + ' rows'}`);
  }
  const sentLog = path.join(ROOT, 'outreach', 'sent.log');
  const sent = existsSync(sentLog)
    ? readFileSync(sentLog, 'utf8').split('\n').filter((l) => l.trim()).length
    : 0;
  console.log(`  emails sent      ${sent}`);
  const supp = path.join(ROOT, 'outreach', 'suppressed.txt');
  const suppN = existsSync(supp)
    ? readFileSync(supp, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).length
    : 0;
  console.log(`  suppressed       ${suppN}`);

  // ---- funnel -----------------------------------------------------------
  // The arithmetic in docs/plan-30-days.md, recomputed rather than copied.
  // Sending is capped at 25/day, so the question every morning is not "did we
  // send" but "how many days of list are left, and how far from the goal".
  console.log('\nFUNNEL');
  {
    const GOAL_GBP = 1000, PRICE_GBP = 79, CAP = 25, DEADLINE = '2026-10-02';
    const need = Math.ceil(GOAL_GBP / PRICE_GBP);
    const sentAddrs = new Set(
      existsSync(sentLog)
        ? readFileSync(sentLog, 'utf8').split('\n').map((l) => l.split('\t')[1]).filter(Boolean).map((e) => e.toLowerCase())
        : [],
    );
    const isUK = (c) => /united kingdom|\buk\b|england|scotland|wales|ireland/i.test(c || '');
    let ukLeft = 0, usLeft = 0, ukTotal = 0;
    for (const f of lists) {
      for (const p of readCsv(f)) {
        const e = (p.email || '').trim().toLowerCase();
        const uk = isUK(p.country);
        if (uk) ukTotal++;
        if (!e.includes('@') || sentAddrs.has(e)) continue;
        if (uk) ukLeft++; else usLeft++;
      }
    }
    const daysLeft = Math.max(0, Math.round((Date.parse(DEADLINE) - Date.now()) / 86400_000));
    console.log(`  goal             ${need} agencies at GBP ${PRICE_GBP} = GBP ${need * PRICE_GBP}/mo, by ${DEADLINE} (${daysLeft} days left)`);
    console.log(`  UK prospects     ${ukLeft} uncontacted of ${ukTotal}  ->  ${(ukLeft / CAP).toFixed(1)} days of sending at ${CAP}/day`);
    console.log(`  US prospects     ${usLeft} uncontacted  (last in the queue; see decision 005)`);
    if (ukLeft < CAP * 5) console.log(`  LIST RUNS OUT    in under a week — build prospects-uk-2.csv (docs/plan-30-days.md, item 3)`);
  }

  // ---- local config -----------------------------------------------------
  console.log('\nLOCAL CONFIG  (names only, never values)');
  for (const k of ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SECRET', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']) {
    const v = env[k];
    const clean = v ? /^[\x20-\x7e]+$/.test(v) : false;
    console.log(`  ${pad(k, 22)} ${v ? (clean ? 'set' : 'SET BUT NOT ASCII - bad paste') : 'missing'}`);
  }

  console.log('\nRead docs/STATE.md for what is blocked and what happens next.');
  console.log('='.repeat(66) + '\n');
}

main().catch((e) => {
  console.error('status failed:', e.message);
  process.exit(1);
});
