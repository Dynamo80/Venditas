/**
 * One agency, one branded sample CV — for a LinkedIn conversation, not a batch.
 *
 *   node --env-file=.env.local outreach/render-one.mjs \
 *     --company "Rockstar Selection" --specialism tech \
 *     --logo https://www.rockstarselection.com/wp-content/uploads/2020/05/RockstarLogo.png \
 *     --colour 006799 --website rockstarselection.com
 *
 * Writes <Company>.png — paste it into the message — and <Company>.docx, sent
 * only when they ask, to outreach/linkedin/<date>/. Sends nothing.
 *
 * --env-file is only needed the first time a sample is used; after that it comes
 * from the cache. --sample <file.pdf> overrides the specialism match.
 *
 * Why this exists: "send me a couple of your CVs" asks a recruiter to go and do
 * something for a stranger, and they say "ok sure" and then don't. A finished
 * document in their own branding asks for nothing.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { render, makeReference } from '../lib/render.mjs';
import { preview } from '../lib/preview.mjs';
import { sampleFor, safeColour, loadSamples, fetchLogo } from './samples.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };

const company = opt('company');
if (!company) {
  console.error('usage: node --env-file=.env.local outreach/render-one.mjs --company <name> [--specialism <text>] [--logo <url>] [--colour <hex>] [--website <domain>] [--sample <file.pdf>]');
  process.exit(1);
}

const file = opt('sample') || sampleFor(opt('specialism'), company);
const samples = await loadSamples([file]);
const data = samples[file];
if (!data) {
  console.error(`No sample CV available for ${file}.`);
  process.exit(1);
}

const verified = safeColour(opt('colour'));
const colour = verified || '1F4E5F';
const logo = await fetchLogo(opt('logo'));

// One reference shared by the image and the document, as in the batch.
const reference = makeReference(data.name);
const brand = {
  name: company,
  colour,
  footer: company,
  contact: opt('website') || null,
  logo: logo?.data,
  logoType: logo?.type,
};

const outDir = path.join(ROOT, 'outreach', 'linkedin', new Date().toISOString().slice(0, 10));
mkdirSync(outDir, { recursive: true });
const safe = company.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40);
writeFileSync(path.join(outDir, `${safe}.docx`), await render(data, brand, { reference }));
writeFileSync(path.join(outDir, `${safe}.png`), await preview(data, brand, reference));

console.log(`${company}: ${file.replace('.pdf', '')} · ${logo ? 'logo' : 'no logo'} · #${colour}${verified ? '' : ' (default colour)'}`);
console.log(`  ${path.join(outDir, safe)}.png  (paste into the message)`);
console.log(`  ${path.join(outDir, safe)}.docx (send when they ask)`);
