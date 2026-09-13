/**
 * A week of LinkedIn outreach, prepared so that sending it is pasting.
 *
 *   node --env-file=.env.local outreach/linkedin-pack.mjs                 5 weekdays x 12 agencies
 *   node --env-file=.env.local outreach/linkedin-pack.mjs --days 3 --per-day 8
 *   node --env-file=.env.local outreach/linkedin-pack.mjs --dry           build, reserve nobody
 *
 * For each agency: a sample CV already set up in its branding (PNG), a search
 * that finds the person who decides, and the two messages from the playbook
 * (outreach/linkedin.md) with the agency's name in. Written to
 * outreach/linkedin/pack-<date>/index.html: open it and work down the day.
 *
 * Nothing is sent and nothing touches LinkedIn. The founder sends by hand,
 * which is the only way LinkedIn allows without risking the account.
 *
 * Every agency in the pack is written to the contact ledger as `linkedin`, so
 * the email batch leaves it alone for the cooling-off period (contacted.mjs).
 * Recruiters spot a machine working a list; an email and a connection request
 * from the same person in one week is exactly that.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { preview } from '../lib/preview.mjs';
import { render, makeReference } from '../lib/render.mjs';
import { sampleFor, safeColour, loadSamples, fetchLogo } from './samples.mjs';
import { loadProspects } from './prospects.mjs';
import { recentlyContacted, record, domainOf } from './contacted.mjs';
import { suppressed } from './send.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DAYS = Number(opt('days', 5));
// The playbook's steady state: 12 requests a weekday, 60 a week, against a
// ceiling LinkedIn does not publish but is observed around 100.
const PER_DAY = Number(opt('per-day', 12));
const DRY = argv.includes('--dry');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The next `n` weekdays, starting tomorrow. */
function weekdays(n) {
  const out = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
  }
  return out;
}

// ------------------------------------------------------------------ choose
function eligible() {
  const skip = suppressed();
  const sentLog = existsSync(path.join(ROOT, 'outreach', 'sent.log'))
    ? readFileSync(path.join(ROOT, 'outreach', 'sent.log'), 'utf8').toLowerCase()
    : '';

  return loadProspects()
    .filter((p) => /united kingdom|uk|england|scotland|wales/i.test(p.country || ''))
    .filter((p) => p.website && p.company)
    // Agencies already paying a competitor are the email batch's first job.
    .filter((p) => !p.incumbent && !p.evidence_url)
    .filter((p) => {
      const e = (p.email || '').toLowerCase();
      if (e && (skip.has(e) || sentLog.includes(e))) return false;
      return !recentlyContacted(p.email || p.website).contacted;
    })
    // Hooks that describe something other than a recruitment agency.
    .filter((p) => !/training provider|management consultancy/i.test(p.hook || ''))
    .sort((a, b) => score(a) - score(b));
}

/** Logo first (the sample carries the personalisation), then the 10-50 sweet spot. */
function score(p) {
  const logo = /^https?:\/\//.test(p.logo_url || '') ? 0 : 3;
  const size = /10-50/.test(p.size || '') ? 0 : /1-10/.test(p.size || '') ? 1 : 2;
  const known = p.specialism && !/general/i.test(p.specialism) ? 0 : 1;
  return logo + size + known;
}

// ---------------------------------------------------------------- messages
const firstMessage = (agency) => `Thanks for connecting, [first name].

No ask attached to this one. I ran a sample CV through set up for ${agency} to see how it would come out: page one attached.

Name, email, phone and LinkedIn swapped for a reference code, straight from whatever the candidate sent. About four seconds.

Ignore freely, no reply needed.`;

const secondMessage = () => `Last one from me, [first name].

Agencies strip contact details off a CV because a client holding the candidate's mobile doesn't need the agency for the second conversation. That's the part I built for: every document is read back after it's built, and if a phone number survived you get an error instead of a file.

venditas.in: ten CVs free, no card. £79 a month after that for the whole agency, and you can buy by email, no call needed.

If it's not for you, no reply needed. I won't chase.`;

const peopleSearch = (company) =>
  `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `"${company}" (director OR founder OR owner OR "managing director" OR "operations manager")`
  )}`;
const companySearch = (company) =>
  `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`;

// -------------------------------------------------------------------- main
const days = weekdays(DAYS);
const chosen = eligible().slice(0, DAYS * PER_DAY);
if (!chosen.length) {
  console.error('No eligible UK agencies left. Regenerate the list: ops/build-prospects.mjs');
  process.exit(1);
}

const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.join(ROOT, 'outreach', 'linkedin', `pack-${stamp}`);
mkdirSync(outDir, { recursive: true });

const samples = await loadSamples([...new Set(chosen.map((p) => sampleFor(p.specialism, p.company)).filter(Boolean))]);

const entries = [];
for (const [i, p] of chosen.entries()) {
  const file = sampleFor(p.specialism, p.company);
  const data = samples[file];
  if (!data) continue;
  const verified = safeColour(p.brand_colour);
  const logo = await fetchLogo(p.logo_url);
  const reference = makeReference(data.name);
  const brand = {
    name: p.company, colour: verified || '1F4E5F', footer: p.company,
    contact: p.website, logo: logo?.data, logoType: logo?.type,
  };
  const safe = p.company.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40);
  writeFileSync(path.join(outDir, `${safe}.png`), await preview(data, brand, reference));
  writeFileSync(path.join(outDir, `${safe}.docx`), await render(data, brand, { reference }));

  const day = days[Math.floor(i / PER_DAY)];
  entries.push({ p, safe, day, logo: Boolean(logo), sample: file.replace('.pdf', '') });
  if (!DRY) record(p.email || p.website, 'linkedin', `pack ${stamp} ${p.company}`);
  process.stdout.write(`  ${String(i + 1).padStart(2)} ${p.company.padEnd(36).slice(0, 36)} ${logo ? 'logo' : '    '} ${file.replace('.pdf', '')}\n`);
}

// -------------------------------------------------------------------- page
const byDay = days.map((d) => ({ d, items: entries.filter((e) => e.day === d) })).filter((g) => g.items.length);
const label = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

const card = (e) => `
<article class="card" id="${esc(e.safe)}">
  <label class="done"><input type="checkbox" data-key="${esc(e.safe)}"> done</label>
  <h3>${esc(e.p.company)}</h3>
  <p class="meta">${esc([e.p.city, e.p.specialism, e.p.size].filter(Boolean).join(' · '))}
    · <a href="${esc(e.p.website)}" target="_blank" rel="noopener">website</a></p>
  <ol>
    <li><strong>Find the decider:</strong> <a href="${esc(peopleSearch(e.p.company))}" target="_blank" rel="noopener">people search</a>
      or <a href="${esc(companySearch(e.p.company))}" target="_blank" rel="noopener">company page → People</a>.
      Director, founder, or ops manager. Skip in-house talent teams.</li>
    <li><strong>Connect with no note.</strong></li>
    <li><strong>1-3 days after they accept</strong>, send this with the image:
      <pre>${esc(firstMessage(e.p.company))}</pre>
      <button data-copy="${esc(firstMessage(e.p.company))}">Copy message</button>
      <a class="img" href="${esc(e.safe)}.png" download>Image: ${esc(e.safe)}.png</a></li>
    <li><strong>5-7 days later, only if no reply:</strong>
      <pre>${esc(secondMessage())}</pre>
      <button data-copy="${esc(secondMessage())}">Copy message</button></li>
  </ol>
  <details><summary>Preview ${e.logo ? '' : '(no logo found: agency name set in type)'}</summary>
    <img src="${esc(e.safe)}.png" alt="Sample CV for ${esc(e.p.company)}" loading="lazy">
    <p class="meta">Check the logo is theirs before sending. If it is wrong, skip this one.</p>
  </details>
</article>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Venditas LinkedIn pack ${stamp}</title>
<style>
  body{font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#14181d;background:#f6f7f9;margin:0;padding:24px 16px}
  main{max-width:860px;margin:0 auto}
  h1{font-size:22px;margin:0 0 4px} h2{margin:36px 0 8px;font-size:18px}
  .rules{background:#fff;border:1px solid #dfe3e9;border-radius:8px;padding:12px 18px}
  .card{background:#fff;border:1px solid #dfe3e9;border-radius:8px;padding:14px 18px;margin:12px 0;position:relative}
  .card.is-done{opacity:.45}
  .done{position:absolute;right:16px;top:14px;font-size:13px}
  h3{margin:0 0 2px;font-size:16px} .meta{color:#66707b;font-size:13px;margin:0 0 8px}
  pre{white-space:pre-wrap;background:#f3f5f8;border-radius:6px;padding:10px;font:13.5px/1.45 inherit;margin:6px 0}
  button{font:inherit;font-size:13px;padding:4px 10px;border:1px solid #c9d0d8;border-radius:6px;background:#fff;cursor:pointer}
  .img{margin-left:10px;font-size:13px} img{max-width:100%;border:1px solid #dfe3e9;margin-top:8px}
</style></head><body><main>
<h1>LinkedIn pack · ${esc(stamp)}</h1>
<p class="meta">${entries.length} agencies over ${byDay.length} weekdays. These agencies are held back from cold email for 21 days.</p>
<div class="rules">
  <p><strong>Every day, UK morning (12:30-14:30 IST):</strong> send that day's connection requests with no note, message the people who accepted 1-3 days ago, and send the second message to anyone who accepted 5-7 days ago and never replied. Never message someone the minute they accept.</p>
  <p><strong>If they reply:</strong> answer the same day. Price: £79/month, whole agency, 10 free first. Data: venditas.in/security. Ready to buy: venditas.in/pricing, "Get an invoice", no call needed.</p>
</div>
${byDay.map((g) => `<h2>${esc(label(g.d))} · ${g.items.length}</h2>${g.items.map(card).join('')}`).join('\n')}
</main>
<script>
  const store = (() => { try { return window.localStorage; } catch { return null; } })();
  document.querySelectorAll('input[data-key]').forEach((box) => {
    const key = 'pack-${stamp}-' + box.dataset.key;
    try { box.checked = store?.getItem(key) === '1'; } catch {}
    const paint = () => box.closest('.card').classList.toggle('is-done', box.checked);
    paint();
    box.addEventListener('change', () => { try { store?.setItem(key, box.checked ? '1' : '0'); } catch {} paint(); });
  });
  document.querySelectorAll('button[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; }
    catch { b.textContent = 'Select the text above and copy'; }
    setTimeout(() => (b.textContent = 'Copy message'), 1500);
  }));
</script></body></html>`;

writeFileSync(path.join(outDir, 'index.html'), html);
console.log(`\n${entries.length} agencies, ${byDay.length} days -> ${path.join(outDir, 'index.html')}`);
console.log(DRY ? 'Dry run: nobody reserved in the contact ledger.' : 'Reserved in the contact ledger as linkedin; the email batch will skip them for 21 days.');
