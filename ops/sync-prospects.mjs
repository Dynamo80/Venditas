/**
 * Push the local prospect CSVs into Postgres, and pull them back.
 *
 *   node ops/sync-prospects.mjs push        upload every outreach/prospects*.csv
 *   node ops/sync-prospects.mjs pull        write the table back to CSV
 *   node ops/sync-prospects.mjs count       how many are up there
 *
 * The CSVs stay as the working format — they are easy to eyeball and easy for a
 * research agent to write. Postgres is the copy that survives a dead laptop and
 * that a session on another machine can read.
 *
 * Upserts on domain, so re-running is safe and a second list merges into the
 * first rather than duplicating it.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const BASE = env.SUPABASE_URL;
const KEY = env.SUPABASE_SECRET || env.SUPABASE_SERVICE_KEY;
if (!BASE || !KEY) {
  console.error('SUPABASE_URL and SUPABASE_SECRET must be in .env.local');
  process.exit(1);
}

async function rest(pathAndQuery, init = {}) {
  const res = await fetch(`${BASE}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${body.slice(0, 300)}`);
  return { body: body ? JSON.parse(body) : null, headers: res.headers };
}

/** Quoted fields carry commas and newlines; split(',') destroys the file. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

function domainOf(value) {
  if (!value) return null;
  let s = String(value).trim().toLowerCase();
  if (s.includes('@')) s = s.split('@')[1];
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  return s || null;
}

async function push() {
  const dir = path.join(ROOT, 'outreach');
  const files = readdirSync(dir).filter((f) => /^prospects.*\.csv$/i.test(f));
  if (!files.length) { console.log('no prospect CSVs found'); return; }

  const byDomain = new Map();
  for (const f of files) {
    const rows = parseCsv(readFileSync(path.join(dir, f), 'utf8'));
    for (const r of rows) {
      const domain = domainOf(r.website || r.email);
      if (!domain || !r.company) continue;
      // Later files win on conflict, but never overwrite a real value with a
      // blank one — the second list may be thinner than the first.
      const prev = byDomain.get(domain) || {};
      byDomain.set(domain, {
        domain,
        company: r.company || prev.company,
        website: r.website || prev.website || null,
        email: r.email || prev.email || null,
        city: r.city || prev.city || null,
        country: r.country || prev.country || null,
        size: r.size || prev.size || null,
        specialism: r.specialism || prev.specialism || null,
        brand_colour: r.brand_colour || prev.brand_colour || null,
        logo_url: r.logo_url || prev.logo_url || null,
        hook: r.hook || prev.hook || null,
        source: f.replace(/\.csv$/i, ''),
      });
    }
    console.log(`  read ${String(rows.length).padStart(4)} rows from ${f}`);
  }

  const all = [...byDomain.values()];
  console.log(`\n${all.length} unique agencies by domain`);

  // Chunked: one 285-row insert is a single point of failure, and PostgREST
  // has a request size limit that a list twice this size would cross.
  const CHUNK = 50;
  let done = 0;
  for (let i = 0; i < all.length; i += CHUNK) {
    const slice = all.slice(i, i + CHUNK);
    await rest('prospects?on_conflict=domain', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(slice),
    });
    done += slice.length;
    process.stdout.write(`\r  uploaded ${done}/${all.length}`);
  }
  console.log('\ndone');
}

async function pull() {
  const { body } = await rest('prospects?select=*&order=country.asc,company.asc');
  const cols = ['company', 'website', 'email', 'city', 'country', 'size', 'specialism', 'brand_colour', 'logo_url', 'hook'];
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(','), ...body.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const out = path.join(ROOT, 'outreach', 'prospects.csv');
  writeFileSync(out, csv + '\n');
  console.log(`wrote ${body.length} rows -> ${out}`);
}

async function count() {
  const res = await fetch(`${BASE}/rest/v1/prospects?select=id`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact', Range: '0-0' },
  });
  console.log('prospects in Postgres:', res.headers.get('content-range') || 'unknown');
  const c = await rest('contactable?select=domain');
  console.log('contactable today   :', (c.body || []).length);
}

const cmd = process.argv[2] || 'count';
const fn = { push, pull, count }[cmd];
if (!fn) { console.error(`unknown command: ${cmd}`); process.exit(1); }
fn().catch((e) => { console.error(`${cmd} failed:`, e.message); process.exit(1); });
