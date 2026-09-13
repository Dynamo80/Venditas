/**
 * Build a UK prospect list from Companies House, for free.
 *
 * The first list (285 rows) was hand-researched and runs out in four days at
 * the 25/day cap. Companies House publishes every UK company with its SIC
 * code as a free bulk download, and 78109 / 78200 / 78300 are the employment
 * agency codes. That is the whole UK market in one file; what it lacks is a
 * website and an email, which this script finds and verifies.
 *
 *   # 1. Download once (about 490 MB), then filter to active agencies:
 *   curl -L -o ch.zip https://download.companieshouse.gov.uk/BasicCompanyDataAsOneFile-YYYY-MM-01.zip
 *   unzip -p ch.zip | node ops/build-prospects.mjs filter --out ch-agencies.csv
 *
 *   # 2. Find and verify websites and emails, appending to outreach/prospects-uk-2.csv:
 *   node ops/build-prospects.mjs discover --in ch-agencies.csv --limit 2000
 *
 *   # New agencies only (decision 017): registered in the last 90 days, with a
 *   # recruitment-shaped name, written to outreach/prospects-new.csv with the
 *   # incorporation date, which is what outreach/batch.mjs keys its email on:
 *   unzip -p ch.zip | node ops/build-prospects.mjs filter --since 90 --out ch-new.csv
 *   node ops/build-prospects.mjs discover --in ch-new.csv --new --limit 2000
 *
 * Rules, the same ones the first list honoured (outreach/prospects-notes.md):
 *
 *   - No email is ever guessed, inferred or pattern-generated. An address is
 *     written only if it appears on the agency's own website. No address, empty cell.
 *   - Only public pages. No LinkedIn, no directories that forbid scraping,
 *     no logins. robots.txt is read per host and obeyed.
 *   - A website is accepted as the agency's only if the page talks about
 *     recruitment AND carries a distinctive part of the registered name. A
 *     guessed domain that resolves is not evidence; the content is.
 *   - Agencies whose site embeds Loxo, Recruit CRM, Zoho Recruit or Vincere
 *     are skipped: those CRMs ship branded formatting natively (decision 005).
 *
 * Re-running is safe: companies already tried are recorded in a done-file and
 * skipped, and domains already in any outreach/prospects*.csv are never added
 * twice.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync, readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve as dnsResolve } from 'node:dns/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT_CSV = path.join(ROOT, 'outreach', 'prospects-uk-2.csv');
const NEW_CSV = path.join(ROOT, 'outreach', 'prospects-new.csv');
const HEADER = 'company,website,email,city,country,size,specialism,brand_colour,logo_url,hook';
const UA = 'VenditasListBuilder/1.0 (+https://venditas.in/about; founder@venditas.in)';

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };

// ------------------------------------------------------------------ csv

function parseCsvLine(line) {
  const out = []; let cell = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cell); cell = ''; }
    else cell += c;
  }
  out.push(cell);
  return out;
}
const csvCell = (s) => { s = String(s ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

function readCsvFile(file) {
  if (!existsSync(file)) return [];
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const head = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((l) => Object.fromEntries(head.map((h, i) => [h, parseCsvLine(l)[i] ?? ''])));
}

// --------------------------------------------------------------- filter
//
// Reads the Companies House CSV on stdin (2.8 GB, so streamed), keeps active
// agencies, and ranks them. Names that say what they do ("X RECRUITMENT LTD")
// go first: their domain is guessable and the site will verify. Names that
// don't ("PENHALIGON HOLDINGS LTD" under 78109) are mostly contractors'
// personal service companies, and are kept last.

const AGENCY_SIC = /^(78109|78200|78300) /;
const NAMEY = /\b(RECRUIT|RESOURC|STAFFING|TALENT|SEARCH|SELECTION|PERSONNEL|APPOINTMENTS|PLACEMENT|HEADHUNT|EXECUTIVE|PEOPLE|CONSULTAN|ASSOCIATES|PARTNERS|JOBS|CAREERS|HIRING|WORKFORCE)/;
const NOISE = /\b(UMBRELLA|PAYROLL|HOMECARE|HOME CARE|CARE SERVICES|DOMICILIARY|CLEANING|SECURITY|TAXI|MODEL|MODELS|ESCORT|DRIVING|DRIVERS|LOCUM|NANNY|NANNIES|AU PAIR|TUTOR|FOOTBALL|SPORTS|MUSIC|FILM|CASTING|ENTERTAINMENT|PROMOTIONS|MARITIME|CREW)\b/;

async function filter() {
  // --since N keeps only companies registered in the last N days. The default
  // run does the opposite and drops anything under two years old, because most
  // young 78109 companies are one contractor's personal service company. A
  // recruitment-shaped name (tier A) is what separates a new agency from those,
  // so --since keeps tier A only.
  const since = Number(opt('since', 0));
  const fresh = since ? new Date(Date.now() - since * 86400_000) : null;
  const out = opt('out', since ? 'ch-new.csv' : 'ch-agencies.csv');
  const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 2);
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  let head = null, kept = 0, seen = 0;
  const rows = [];
  for await (const line of rl) {
    if (!head) { head = parseCsvLine(line).map((h) => h.trim()); continue; }
    seen++;
    if (seen % 500000 === 0) process.stderr.write(`  ${seen} rows scanned, ${kept} kept\n`);
    // Cheap pre-check before parsing the whole line.
    if (!/"(78109|78200|78300) - /.test(line)) continue;
    const c = parseCsvLine(line);
    const g = (k) => c[head.indexOf(k)] ?? '';
    if (g('CompanyStatus') !== 'Active') continue;
    const sics = ['SICCode.SicText_1', 'SICCode.SicText_2', 'SICCode.SicText_3', 'SICCode.SicText_4'].map(g);
    if (!sics.some((s) => AGENCY_SIC.test(s))) continue;
    const acct = g('Accounts.AccountCategory');
    if (/DORMANT/.test(acct)) continue;
    const [d, m, y] = g('IncorporationDate').split('/').map(Number);
    if (!y) continue;
    const inc = new Date(y, m - 1, d);
    if (fresh ? inc < fresh : inc > cutoff) continue;
    const name = g('CompanyName').trim();
    if (NOISE.test(name)) continue;
    if (fresh && !NAMEY.test(name)) continue;
    if (!/LIMITED|LTD|LLP/.test(name)) continue; // sole traders are individual subscribers under PECR; skip
    rows.push({
      name, number: g('CompanyNumber'), town: g('RegAddress.PostTown'), postcode: g('RegAddress.PostCode'),
      incorporated: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      sic: sics.find((s) => AGENCY_SIC.test(s)).slice(0, 5), accounts: acct,
      tier: NAMEY.test(name) ? 'A' : 'B',
    });
    kept++;
  }
  rows.sort((a, b) => (a.tier < b.tier ? -1 : a.tier > b.tier ? 1 : a.incorporated < b.incorporated ? -1 : 1));
  const text = ['name,number,town,postcode,incorporated,sic,accounts,tier', ...rows.map((r) => Object.values(r).map(csvCell).join(','))].join('\n') + '\n';
  writeFileSync(out, text);
  const a = rows.filter((r) => r.tier === 'A').length;
  console.error(`\n${seen} companies scanned · ${kept} active agencies kept · ${a} with a recruitment-shaped name (tier A) · ${kept - a} tier B\nwritten ${out}`);
}

// ------------------------------------------------------------- discover

const STOP = new Set(['limited', 'ltd', 'llp', 'plc', 'the', 'and', 'uk', 'recruitment', 'recruiting', 'recruit', 'group', 'consultancy', 'consultants', 'consulting', 'services', 'solutions', 'people', 'search', 'selection', 'talent', 'staffing', 'resourcing', 'partners', 'associates', 'international', 'global', 'london', 'personnel', 'appointments', 'executive', 'company', 'co']);

function tokensOf(name) {
  return name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
}

function domainCandidates(name) {
  const toks = tokensOf(name).filter((t) => !['limited', 'ltd', 'llp', 'plc', 'the', 'uk'].includes(t));
  if (!toks.length) return [];
  const core = toks.filter((t) => !['and'].includes(t));
  const bases = new Set([core.join(''), core.join('-')]);
  const distinct = core.filter((t) => !STOP.has(t));
  if (distinct.length && distinct.length < core.length) {
    bases.add(distinct.join(''));
    bases.add(distinct.join('') + 'recruitment');
    bases.add(distinct.join('-') + '-recruitment');
  }
  const out = [];
  for (const b of bases) {
    if (b.length < 3 || b.length > 40) continue;
    for (const tld of ['.co.uk', '.com', '.uk']) out.push(b + tld);
  }
  return out.slice(0, 12);
}

async function resolves(host) {
  try { await dnsResolve(host, 'A'); return true; } catch { return false; }
}

async function get(url, ms = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,*/*' }, redirect: 'follow', signal: ctl.signal });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('html') && !ct.includes('text')) return { ok: false };
    const html = (await res.text()).slice(0, 600_000);
    return { ok: res.ok, html, url: res.url };
  } catch { return { ok: false }; }
  finally { clearTimeout(t); }
}

const robotsCache = new Map();
async function allowed(origin, pathname) {
  if (!robotsCache.has(origin)) {
    const r = await get(`${origin}/robots.txt`, 6000);
    const dis = [];
    if (r.ok && r.html) {
      let star = false;
      for (const raw of r.html.split('\n')) {
        const line = raw.split('#')[0].trim();
        const m = /^user-agent:\s*(.+)$/i.exec(line);
        if (m) { star = m[1].trim() === '*'; continue; }
        const d = /^disallow:\s*(.*)$/i.exec(line);
        if (d && star && d[1].trim()) dis.push(d[1].trim());
      }
    }
    robotsCache.set(origin, dis);
  }
  // Standard matching: a rule is a prefix, "*" is a wildcard, "$" anchors the
  // end. "/*?" blocks query strings, not the site; "/" blocks the site.
  const dis = robotsCache.get(origin);
  return !dis.some((p) => {
    const re = new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    return re.test(pathname);
  });
}

const text = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

const RECRUITY = /recruit|staffing|resourcing|headhunt|executive search|search (and|&) selection|talent (acquisition|partner|solutions)|personnel|candidates|vacancies|job seekers|employers/i;
const PARKED = /domain (is )?for sale|parked (free|domain)|buy this domain|sedo\.com|godaddy\.com\/domainsearch|hugedomains|dan\.com|afternic/i;
const CRM = /loxo\.co|recruitcrm\.io|zoho(recruit|\.com\/recruit)|vincere\.io/i;
const BAD_EMAIL = /\.(png|jpg|jpeg|gif|svg|webp)$|sentry|wixpress|example\.|yourdomain|domain\.com|email\.com|@2x|\.js$|noreply|no-reply|godaddy|wordpress|w3\.org/i;

function findEmails(html, domain) {
  const src = html.replace(/\s*\[\s*at\s*\]\s*|\s*\(\s*at\s*\)\s*/gi, '@').replace(/\s*\[\s*dot\s*\]\s*|\s*\(\s*dot\s*\)\s*/gi, '.');
  const found = new Set();
  for (const m of src.matchAll(/mailto:([^"'?\s>]+)/gi)) found.add(decodeURIComponent(m[1]).toLowerCase());
  for (const m of src.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)) found.add(m[0].toLowerCase());
  const root = domain.replace(/^www\./, '');
  const ok = [...found].filter((e) => !BAD_EMAIL.test(e) && e.length < 60);
  const same = ok.filter((e) => e.endsWith('@' + root) || e.endsWith('.' + root));
  const pool = same.length ? same : [];
  // Only addresses on the agency's own domain. A gmail address on a page could be anyone's.
  const role = pool.find((e) => /^(info|hello|enquiries|enquiry|contact|admin|office|jobs|recruitment|careers|team|mail|hi)@/.test(e));
  return role || pool[0] || '';
}

function abs(base, href) { try { return new URL(href, base).href; } catch { return ''; } }

function logoOf(html, base) {
  const pick = (re) => { const m = re.exec(html); return m ? abs(base, m[1]) : ''; };
  return pick(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
    || pick(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i)
    || pick(/<img[^>]+src=["']([^"']*logo[^"']*\.(?:png|svg|webp|jpg))["']/i)
    || pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || pick(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+\.(?:png|svg))["']/i)
    || '';
}

function colourOf(html) {
  const m = /<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-f]{3,6})["']/i.exec(html)
    || /<meta[^>]+content=["'](#[0-9a-f]{3,6})["'][^>]+name=["']theme-color["']/i.exec(html);
  if (!m) return '';
  const c = m[1].toLowerCase();
  return /^#(fff|ffffff|000|000000)$/.test(c) ? '' : c;
}

function hookOf(html) {
  const m = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']{20,300})["']/i.exec(html)
    || /<meta[^>]+content=["']([^"']{20,300})["'][^>]+name=["']description["']/i.exec(html);
  if (!m) return '';
  // Pages that declare one charset and serve another leave U+FFFD where an
  // en dash or a curly quote was; a hook with a � in it is worse than none.
  const s = m[1].replace(/&amp;/g, '&').replace(/&#?\w+;/g, ' ').replace(/�/g, '-').replace(/\s+/g, ' ').trim();
  const first = s.split(/(?<=[.!?])\s/)[0];
  return first.length > 160 ? first.slice(0, 157) + '...' : first;
}

const SPECIALISMS = [
  ['tech', /software|developer|\bit recruit|technology|\bdata\b|cyber|devops|cloud|digital/gi],
  ['finance', /accountanc|finance|financial|banking|audit|tax\b|actuar|insurance/gi],
  ['healthcare', /nurs|healthcare|medical|dental|clinical|\bcare\b|pharmac|locum/gi],
  ['engineering', /engineer|manufactur|automotive|aerospace|mechanical|electrical/gi],
  ['construction', /construction|civil|surveyor|quantity|site manager|rail\b|infrastructure/gi],
  ['legal', /solicitor|legal|law firm|paralegal|lawyer/gi],
  ['marketing', /marketing|creative|design|digital agency|\bpr\b|communications/gi],
  ['education', /teacher|teaching|school|education|tutor|nursery/gi],
  ['sales', /\bsales\b|business development|account manager/gi],
  ['hospitality', /hospitality|chef|hotel|catering|restaurant/gi],
  ['logistics', /logistics|supply chain|warehouse|driver|transport/gi],
  ['hr', /\bhr\b|human resources/gi],
  ['executive search', /executive search|headhunt|c-suite|board level|senior appointments/gi],
  ['life sciences', /life science|biotech|pharma|clinical research|medical device/gi],
];
function specialismOf(t) {
  let best = 'general', bestN = 2;
  for (const [name, re] of SPECIALISMS) {
    const n = (t.match(re) || []).length;
    if (n > bestN) { best = name; bestN = n; }
  }
  return best;
}

function sizeOf(accounts) {
  if (/MICRO/.test(accounts)) return '1-10 (micro-entity accounts)';
  if (/SMALL|TOTAL EXEMPTION/.test(accounts)) return '10-50 (small company accounts)';
  return '';
}

function verifyOwnership(name, t) {
  const toks = tokensOf(name).filter((x) => x.length >= 4 && !STOP.has(x));
  const lower = t.toLowerCase();
  if (toks.length) return toks.some((x) => lower.includes(x));
  // Every word is generic ("Talent Search Ltd"): require the whole phrase.
  const phrase = tokensOf(name).filter((x) => !['limited', 'ltd', 'llp'].includes(x)).join(' ');
  return phrase.length > 6 && lower.includes(phrase);
}

const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
/**
 * "TD RECRUITMENT LIMITED" -> "TD Recruitment". Registered names are all
 * caps; a plain title-case gives "Td" and "Mcdermott", which reads as a
 * machine. Short tokens stay upper-case (initials: TD, JMC, HR), Mc/Mac
 * and O' get their inner capital, and the corporate suffix goes.
 */
export function cleanName(s) {
  const t = title(s.replace(/\s+(LIMITED|LTD\.?|LLP|PLC|L\.L\.P\.)$/i, '').replace(/\s*\(UK\)\s*/i, ' UK ').trim());
  return t
    .replace(/\b([A-Z][a-z]{0,2})\b/g, (w) => (w.length <= 3 && !/^(And|The|Of|For|In|At|To|On|By|An|A)$/i.test(w) ? w.toUpperCase() : w))
    .replace(/\b(Mc|Mac)([a-z])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/\bO'([a-z])/g, (_, c) => `O'${c.toUpperCase()}`)
    .replace(/\b(Uk|Usa|Eu|It|Hr|Ict|Cv|Cvs|Llp)\b/g, (w) => w.toUpperCase())
    .replace(/\s+/g, ' ');
}

async function investigate(co) {
  for (const host of domainCandidates(co.name)) {
    if (!(await resolves(host))) continue;
    let page = await get(`https://${host}/`);
    if (!page.ok) page = await get(`http://${host}/`);
    if (!page.ok || !page.html) continue;
    const final = new URL(page.url);
    const origin = final.origin;
    const domain = final.hostname.replace(/^www\./, '');
    if (!(await allowed(origin, '/'))) return { skip: 'robots' };
    const t = text(page.html);
    if (PARKED.test(page.html) || t.length < 200) continue;
    if (!RECRUITY.test(t)) continue;
    if (!verifyOwnership(co.name, t)) continue;
    if (CRM.test(page.html)) return { skip: 'crm', domain };

    // Email: homepage first, then contact-ish pages.
    let email = findEmails(page.html, domain);
    if (!email) {
      const links = [...page.html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => abs(origin, m[1]))
        .filter((u) => u.startsWith(origin) && /contact|get-in-touch|about|team|reach/i.test(u)).slice(0, 3);
      const paths = [...new Set([...links, `${origin}/contact`, `${origin}/contact-us`, `${origin}/get-in-touch`, `${origin}/about-us`])];
      for (const u of paths) {
        if (!(await allowed(origin, new URL(u).pathname))) continue;
        const p = await get(u, 8000);
        if (p.ok && p.html) { email = findEmails(p.html, domain); if (email) break; }
      }
    }
    return {
      row: {
        company: cleanName(co.name), website: origin, email,
        city: title(co.town || ''), country: 'United Kingdom', size: sizeOf(co.accounts),
        specialism: specialismOf(t), brand_colour: colourOf(page.html), logo_url: logoOf(page.html, origin), hook: hookOf(page.html),
      },
      domain,
    };
  }
  return { skip: 'no-site' };
}

function knownDomains() {
  const set = new Set();
  const dir = path.join(ROOT, 'outreach');
  // Every list batch.mjs sends from, so a new list cannot re-add an agency an old one has.
  for (const f of readdirSync(dir).filter((n) => /^prospects.*\.csv$/i.test(n))) {
    for (const r of readCsvFile(path.join(dir, f))) {
      try { set.add(new URL(r.website).hostname.replace(/^www\./, '')); } catch {}
      if (r.email && r.email.includes('@')) set.add(r.email.split('@')[1].toLowerCase());
    }
  }
  return set;
}

async function discover() {
  const inFile = opt('in', 'ch-agencies.csv');
  const limit = Number(opt('limit', 500));
  const conc = Number(opt('concurrency', 6));
  const tierOnly = opt('tier', 'A');
  const doneFile = opt('done', path.join(path.dirname(path.resolve(inFile)), 'discover-done.txt'));
  // --new: the list of recently registered agencies, which carries the
  // incorporation date so the first email can say what it is based on.
  const isNew = args.includes('--new');
  const outCsv = isNew ? NEW_CSV : OUT_CSV;
  const header = isNew ? `${HEADER},incorporated` : HEADER;

  const done = new Set(existsSync(doneFile) ? readFileSync(doneFile, 'utf8').split('\n').filter(Boolean) : []);
  const known = knownDomains();
  // Small agencies only (decision 005: 3-50 staff). GROUP, FULL and MEDIUM
  // accounts mean a company big enough to have a CRM team and a procurement
  // process; the trial-to-invoice motion does not fit them.
  const small = (c) => !/GROUP|MEDIUM|^FULL$/.test(c.accounts);
  // Deterministic shuffle so a run is a fair sample of the country rather
  // than the oldest agencies first, which skews to the largest.
  const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
  const todo = readCsvFile(inFile)
    .filter((c) => (tierOnly === 'all' || c.tier === tierOnly) && small(c) && !done.has(c.number))
    .sort((a, b) => hash(a.number) - hash(b.number))
    .slice(0, limit);
  if (!existsSync(outCsv)) writeFileSync(outCsv, header + '\n');

  const stats = { tried: 0, found: 0, withEmail: 0, crm: 0, robots: 0, nosite: 0, dup: 0 };
  let i = 0;
  const worker = async () => {
    while (i < todo.length) {
      const co = todo[i++];
      let r;
      try { r = await investigate(co); } catch (e) { r = { skip: 'error' }; }
      stats.tried++;
      if (r.row) {
        if (known.has(r.domain)) { stats.dup++; }
        else {
          known.add(r.domain);
          const row = isNew ? { ...r.row, incorporated: co.incorporated } : r.row;
          appendFileSync(outCsv, Object.values(row).map(csvCell).join(',') + '\n');
          stats.found++; if (r.row.email) stats.withEmail++;
          console.log(`  + ${r.row.company.padEnd(40)} ${r.row.website.padEnd(38)} ${r.row.email || '(no address published)'}`);
        }
      } else if (r.skip === 'crm') stats.crm++;
      else if (r.skip === 'robots') stats.robots++;
      else stats.nosite++;
      appendFileSync(doneFile, co.number + '\n');
      if (stats.tried % 50 === 0) console.log(`  … ${stats.tried}/${todo.length} tried · ${stats.found} sites · ${stats.withEmail} emails · ${stats.crm} on a native-formatting CRM · ${stats.nosite} no site found`);
    }
  };
  await Promise.all(Array.from({ length: conc }, worker));
  console.log(`\ndone: ${stats.tried} tried · ${stats.found} added · ${stats.withEmail} with a published email · ${stats.dup} already listed · ${stats.crm} skipped (CRM) · ${stats.robots} skipped (robots.txt) · ${stats.nosite} no verifiable site\n-> ${outCsv}`);
}

// Only act as a CLI when run directly; cleanName is importable on its own.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  if (cmd === 'filter') filter();
  else if (cmd === 'discover') discover();
  else { console.error('usage: build-prospects.mjs filter [--since DAYS] --out F  |  discover --in F [--new] [--limit N] [--tier A|B|all] [--concurrency N]'); process.exit(1); }
}
