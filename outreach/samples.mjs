/**
 * Which sample CV an agency is shown, and the branding it is shown in.
 *
 * Shared by the daily batch and by render-one.mjs, which builds a single sample
 * for a LinkedIn conversation. One definition, so an agency sees the same kind of
 * candidate whichever channel reaches it.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { extract } from '../lib/extract.mjs';
import { contrastOnWhite } from '../lib/colour.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const SAMPLES = path.join(ROOT, 'reference', 'samples');
const CACHE = path.join(ROOT, 'outreach', 'sample-cache.json');

// ------------------------------------------------------- specialism matching
// Stems, so no trailing \b: with one, `financ` never matched "finance" and
// `health` never matched "healthcare", and every finance, healthcare,
// engineering and construction agency was sent a backend engineer's CV.
// Tested against specialism *and* company name — "Falcon Wealth Search" says
// what it recruits for even when the specialism column says "general".
// Logistics sits above engineering so a driver or mechanic agency is not shown
// a chartered process engineer.
export const SAMPLE_FOR = [
  [/\b(legal|law\b|solicitor|barrister|paralegal|conveyanc)/i, 'legal-commercial-solicitor.pdf'],
  [/\b(health|nurs|clinical|medical|care\b|carer|locum|nhs|dental|pharma)/i, 'healthcare-theatre-nurse.pdf'],
  [/\b(financ|account|audit|tax\b|banking|insurance|actuar|wealth|invest|pension|payroll)/i, 'finance-financial-controller.pdf'],
  // `tech\b`, not `tech`: "Engineering & Technical" is not a software agency.
  [/\b(tech\b|technolog|software|it\b|develop|data\b|digital|devops|cloud|cyber|telecom)/i, 'tech-backend-engineer.pdf'],
  [/\b(logistic|transport|driver|driving|hgv|lgv|haulage|warehous|fleet|mechanic\b|mechanics|freight)/i, 'logistics-ce-driver.pdf'],
  [/\b(engineer|manufactur|industrial|mechanical|electrical|process\b|construc|civil)/i, 'engineering-process-engineer.pdf'],
  [/\b(sales|marketing|commercial|business development|bd\b)/i, 'sales-regional-manager.pdf'],
];

/**
 * Hex values that are a framework's default, not an agency's identity.
 *
 * The list-building agent warned that only 41 of 244 colours came from a
 * verified source, and #22d3ee — Tailwind's cyan-400 — reached this batch as
 * "Cloud Recruit UK's brand colour". Rendering a CV in a stranger's CSS default
 * and calling it their branding is worse than not personalising at all: it is
 * visibly, checkably wrong.
 *
 * When in doubt, fall back to our own neutral. An unbranded document still
 * demonstrates the product; a wrongly-branded one demonstrates carelessness.
 */
const FRAMEWORK_DEFAULTS = new Set([
  '007cba', '0073aa', '0693e3',                     // WordPress
  '007bff', '0d6efd', '6c757d', '17a2b8', '28a745', // Bootstrap
  '3b82f6', '1e40af', '22d3ee', '06b6d4', '2563eb', // Tailwind
  '4285f4', '1a73e8',                               // Google
  '000000', 'ffffff', 'cccccc', '333333', '666666', '999999',
]);

export function safeColour(raw) {
  const hex = String(raw || '').replace(/^#/, '').trim().toLowerCase();
  if (!/^[0-9a-f]{6}$/.test(hex)) return null;
  if (FRAMEWORK_DEFAULTS.has(hex)) return null;
  // Near-white is a page background the scraper picked up, not a brand.
  // Darkening it would invent a colour and call it theirs.
  if (contrastOnWhite(hex) < 1.5) return null;
  return hex;
}

export function sampleFor(specialism, company = '') {
  const haystack = `${specialism || ''} ${company || ''}`;
  for (const [re, file] of SAMPLE_FOR) {
    if (re.test(haystack)) {
      if (existsSync(path.join(SAMPLES, file))) return file;
    }
  }
  // Generalist agencies place office, sales and operations roles far more often
  // than backend engineers, so a regional sales manager is the least surprising
  // candidate to show them.
  for (const fallback of ['sales-regional-manager.pdf', 'tech-backend-engineer.pdf']) {
    if (existsSync(path.join(SAMPLES, fallback))) return fallback;
  }
  return null;
}

// ------------------------------------------------------------- sample cache
export async function loadSamples(needed) {
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

export async function fetchLogo(url) {
  if (!url || !/^https?:\/\//.test(url)) return null;
  // .ico is a favicon, usually 32px and unusable at 150px wide in a document.
  if (/\.ico(\?|$)/i.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!/image\/(png|jpe?g|svg\+xml|webp)/i.test(type)) return null;
    let buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 1_500_000 || buf.length < 200) return null;
    // Word and the preview take PNG or JPEG. Agency sites increasingly serve
    // SVG or WebP, and skipping those left half the best prospects unbranded.
    if (/svg/i.test(type)) buf = await sharp(buf, { density: 300 }).resize({ width: 600 }).png().toBuffer();
    else if (/webp/i.test(type)) buf = await sharp(buf).png().toBuffer();
    if (await vanishesOnWhite(buf)) return null;
    return { data: buf, type: /jpe?g/i.test(type) ? 'jpg' : 'png' };
  } catch {
    return null;
  }
}

/**
 * A logo drawn for a dark site header — white lettering on a transparent
 * background — disappears on a white CV page. Rockstar Selection's did: a black
 * "R.S" roundel and then nothing where the name should be, which reads as a
 * broken document. Without the logo the agency name is set in type instead.
 *
 * The test is whether the parts that stay visible on white span the logo. A
 * white letter inside a coloured badge is fine (the badge spans it); a white
 * wordmark beside a small icon is not. Opaque images are never rejected: their
 * white is a background, and it was on white already.
 */
async function vanishesOnWhite(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .resize(240, 240, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, channels } = info;

  let transparent = 0, pixels = 0;
  const all = { x0: Infinity, x1: -1, y0: Infinity, y1: -1 };
  const seen = { x0: Infinity, x1: -1, y0: Infinity, y1: -1 };
  const grow = (b, x, y) => {
    b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x);
    b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y);
  };

  for (let i = 0; i < data.length; i += channels) {
    pixels++;
    if (data[i + 3] < 128) { transparent++; continue; }
    const x = (i / channels) % width;
    const y = Math.floor(i / channels / width);
    grow(all, x, y);
    const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    if (lum < 0.85) grow(seen, x, y);
  }

  if (transparent / pixels < 0.05 || all.x1 < 0) return false;
  if (seen.x1 < 0) return true;
  const span = (b) => [b.x1 - b.x0 + 1, b.y1 - b.y0 + 1];
  const [aw, ah] = span(all);
  const [sw, sh] = span(seen);
  return sw / aw < 0.6 || sh / ah < 0.6;
}
