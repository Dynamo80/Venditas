/**
 * The prospect lists, read the same way by every channel.
 *
 * batch.mjs mails them and linkedin-pack.mjs hands them to a person to connect
 * with. Both have to agree on who is on the list, or one agency gets a cold
 * email and a connection request in the same week.
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { domainOf } from './contacted.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

/** Quoted fields contain commas and newlines, so a split(',') will not do. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

/**
 * Every outreach/prospects*.csv, merged on the email domain (or the site's,
 * when no address is published). The first list alphabetically wins, which is
 * why the hot list is named prospects-hot.csv.
 */
export function loadProspects() {
  const dir = path.join(ROOT, 'outreach');
  const csvs = readdirSync(dir).filter((f) => /^prospects.*\.csv$/i.test(f)).sort();
  const byKey = new Map();
  for (const f of csvs) {
    for (const p of parseCsv(readFileSync(path.join(dir, f), 'utf8'))) {
      const key = domainOf(p.email) || domainOf(p.website) || p.company;
      if (!byKey.has(key)) byKey.set(key, { ...p, list: f });
    }
  }
  return [...byKey.values()];
}
