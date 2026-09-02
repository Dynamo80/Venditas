/**
 * Build a day's outreach batch.
 *
 *   node outreach/batch.mjs                 build 25, write for review, send nothing
 *   node outreach/batch.mjs --n 10          smaller batch
 *   node outreach/batch.mjs --send --confirm  actually send
 *
 * Sending needs BOTH flags. One flag is too close to a typo for something that
 * mails strangers from a domain we cannot un-burn.
 *
 * Each prospect gets a real sample CV rendered in their own branding, matched
 * to what they recruit for. A finance recruiter opening a software engineer's
 * CV is a much weaker demonstration than one opening a financial controller's.
 *
 * The six sample CVs are extracted once and cached. Rendering is free after
 * that, so a batch of 285 costs six model calls rather than 285.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { render } from '../lib/render.mjs';
import { extract } from '../lib/extract.mjs';
import { send, closeTransport, suppressed, SENDER, DAILY_CAP } from './send.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const SAMPLES = path.join(ROOT, 'reference', 'samples');
const CACHE = path.join(ROOT, 'outreach', 'sample-cache.json');

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const WANT = Number(opt('n', DAILY_CAP));
const DO_SEND = flag('send') && flag('confirm');

// ------------------------------------------------------------------- csv
/** Quoted fields contain commas and newlines, so a split(',') will not do. */
function parseCsv(text) {
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

// ------------------------------------------------------- specialism matching
const SAMPLE_FOR = [
  [/\b(legal|law|solicitor|barrister|paralegal)\b/i, 'legal-commercial-solicitor.pdf'],
  [/\b(health|nurs|clinical|medical|care|locum|nhs)\b/i, 'healthcare-theatre-nurse.pdf'],
  [/\b(financ|account|audit|tax|banking|insurance|actuar)\b/i, 'finance-financial-controller.pdf'],
  [/\b(engineer|manufactur|industrial|mechanical|process|construc|civil)\b/i, 'engineering-process-engineer.pdf'],
  [/\b(sales|marketing|commercial|business development|bd)\b/i, 'sales-regional-manager.pdf'],
  [/\b(tech|software|it|develop|data|digital|devops|cloud|cyber)\b/i, 'tech-backend-engineer.pdf'],
];

function sampleFor(specialism) {
  for (const [re, file] of SAMPLE_FOR) {
    if (re.test(specialism || '')) {
      if (existsSync(path.join(SAMPLES, file))) return file;
    }
  }
  // Tech is the safest default: it is the largest specialism in the list, and
  // the sample is the one most heavily tested.
  const fallback = 'tech-backend-engineer.pdf';
  return existsSync(path.join(SAMPLES, fallback)) ? fallback : null;
}

// ------------------------------------------------------------- sample cache
async function loadSamples(needed) {
  const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  let added = 0;
  for (const file of needed) {
    if (cache[file]) continue;
    const buf = readFileSync(path.join(SAMPLES, file));
    process.stdout.write(`  extracting ${file}… `);
    cache[file] = await extract(buf, file);
    added++;
    console.log('done');
  }
  if (added) writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  return cache;
}

async function fetchLogo(url) {
  if (!url || !/^https?:\/\//.test(url)) return null;
  // .ico is a favicon, usually 32px and unusable at 150px wide in a document.
  if (/\.ico(\?|$)/i.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!/image\/(png|jpe?g)/i.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 1_500_000 || buf.length < 200) return null;
    return { data: buf, type: /jpe?g/i.test(type) ? 'jpg' : 'png' };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ message
function compose(p) {
  const first = (p.contact_first || '').trim();
  const greeting = first ? `Hi ${first},` : 'Hi,';
  const agency = p.company || 'your agency';

  const text = `${greeting}

I've attached a candidate CV in ${agency}'s branding — your colours, contact
details stripped out, a reference code in place of the name.

It took four seconds. I built the thing that made it.

If anyone there still rebuilds CVs into your template by hand before they go to
a client, that's the job it does. Whatever the candidate sent — the two-column
ones, the ones built in tables, the scans — comes back looking like the
attachment.

Worth a look? ${SENDER.site} — ten free, no card, run one of your own.

Arseny`;

  return { subject: `your template, four seconds`, text };
}

// --------------------------------------------------------------------- main
async function main() {
  const csv = path.join(ROOT, 'outreach', 'prospects.csv');
  if (!existsSync(csv)) {
    console.error('outreach/prospects.csv not found');
    process.exit(1);
  }

  const all = parseCsv(readFileSync(csv, 'utf8'));
  const skip = suppressed();
  const sentLog = existsSync(path.join(ROOT, 'outreach', 'sent.log'))
    ? readFileSync(path.join(ROOT, 'outreach', 'sent.log'), 'utf8').toLowerCase()
    : '';

  // Flagged during list-building: these publish an address on a domain
  // unrelated to the agency, which is either stale or someone else's inbox.
  // Cheaper to drop two prospects than to cold-email the wrong company.
  const FLAGGED = /complete dental staffing|dentemp/i;

  const eligible = all.filter((p) => {
    const e = (p.email || '').trim().toLowerCase();
    if (!e || !e.includes('@')) return false;
    if (skip.has(e)) return false;
    if (sentLog.includes(e)) return false;
    if (FLAGGED.test(p.company || '')) return false;
    return true;
  });

  // Ordering, most important first.
  //
  // UK before US: the research was unambiguous that UK and EU agencies
  // submitting under a client template feel this, and US in-house talent teams
  // largely do not.
  //
  // Then agencies whose logo we can actually fetch. Logos verified 10/10 on
  // sampling; brand colours did not — only 41 of 244 came from an agency's own
  // SVG, the rest were inferred, and an earlier pass had returned WordPress's
  // admin blue for a third of the list. A real logo carries the
  // personalisation on its own; a wrong accent colour actively undermines an
  // email claiming to be in their branding. So lead with the ones we are sure
  // about.
  const score = (p) => {
    const uk = /united kingdom|uk|england|scotland|wales/i.test(p.country || '') ? 0 : 4;
    const logo = /^https?:\/\//.test(p.logo_url || '') && !/\.ico(\?|$)/i.test(p.logo_url) ? 0 : 2;
    const colour = /^#?[0-9a-f]{6}$/i.test((p.brand_colour || '').trim()) ? 0 : 1;
    return uk + logo + colour;
  };
  eligible.sort((a, b) => score(a) - score(b));

  const batch = eligible.slice(0, WANT);
  console.log(`\n${all.length} prospects · ${eligible.length} eligible · taking ${batch.length}`);
  console.log(`mode: ${DO_SEND ? 'SEND' : 'dry run, nothing will be sent'}\n`);

  const needed = [...new Set(batch.map((p) => sampleFor(p.specialism)).filter(Boolean))];
  console.log(`samples needed: ${needed.length}`);
  const samples = await loadSamples(needed);

  const outDir = path.join(ROOT, 'outreach', 'batches', new Date().toISOString().slice(0, 10));
  mkdirSync(outDir, { recursive: true });

  const manifest = [];
  for (const p of batch) {
    const file = sampleFor(p.specialism);
    const data = samples[file];
    if (!data) continue;

    const colour = (p.brand_colour || '').replace(/^#/, '') || '1F4E5F';
    const logo = await fetchLogo(p.logo_url);

    const docx = await render(data, {
      name: p.company,
      colour,
      footer: p.company,
      contact: p.website || null,
      logo: logo?.data,
      logoType: logo?.type,
    });

    const { subject, text } = compose(p);
    const safe = (p.company || 'agency').replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40);
    writeFileSync(path.join(outDir, `${safe}.docx`), docx);

    manifest.push({
      company: p.company, email: p.email, country: p.country,
      specialism: p.specialism, sample: file, colour,
      logo: Boolean(logo), subject,
    });

    if (DO_SEND) {
      const r = await send({
        to: p.email,
        fromName: 'Arseny at Venditas',
        subject,
        text,
        attachments: [{ filename: 'sample-candidate.docx', content: docx }],
      });
      console.log(`  ${r.sent ? 'sent' : `skipped (${r.skipped})`}  ${p.email}`);
    } else {
      console.log(`  built  ${(p.company || '').padEnd(34).slice(0, 34)} ${file.replace('.pdf', '').padEnd(28)} ${logo ? 'logo' : '    '} #${colour}`);
    }
  }

  writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const sampleText = compose(batch[0] || {}).text;
  writeFileSync(path.join(outDir, 'email.txt'), sampleText);

  console.log(`\n${manifest.length} built -> ${outDir}`);
  console.log(`  with logo: ${manifest.filter((m) => m.logo).length}`);
  if (!DO_SEND) console.log('\nNothing sent. Review the .docx files, then: --send --confirm');
  closeTransport();
}

main().catch((e) => {
  console.error('batch failed:', e.message);
  closeTransport();
  process.exit(1);
});
