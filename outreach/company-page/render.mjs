/**
 * The company page's images, rendered on this machine from the site's own
 * palette and icon (app/globals.css, app/icon.svg).
 *
 *   node outreach/company-page/render.mjs
 *
 * Writes outreach/company-page/images/. Each post card may only say what its
 * post in posts.md says, because every claim in a post is sourced there. Change
 * the words in both places or neither.
 */

import sharp from 'sharp';
import { mkdirSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'images');

const C = {
  paper: '#f6f7f9',
  ink: '#151b26',
  ink2: '#4a5464',
  ink3: '#78838f',
  line: '#dfe3e9',
  accent: '#33418f',
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The document glyph from app/icon.svg, on a 32-unit grid. */
const GLYPH = `
  <rect x="9" y="6" width="14" height="20" rx="2" fill="#fff"/>
  <rect x="11.5" y="9" width="9" height="1.6" rx="0.8" fill="${C.accent}" opacity=".35"/>
  <rect x="11.5" y="12.4" width="9" height="2.6" rx="1" fill="${C.accent}"/>
  <rect x="11.5" y="17" width="9" height="1.6" rx="0.8" fill="${C.accent}" opacity=".35"/>
  <rect x="11.5" y="20.2" width="6" height="1.6" rx="0.8" fill="${C.accent}" opacity=".35"/>`;

const mark = (x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 32})"><rect width="32" height="32" rx="7" fill="${C.accent}"/>${GLYPH}</g>`;

/** Square, full-bleed: LinkedIn rounds and crops the corners itself. */
function logo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="400" height="400" fill="${C.accent}"/>
    <g transform="scale(12.5)">${GLYPH}</g>
  </svg>`;
}

/**
 * 1128 x 191. The page logo overlaps the lower left of the cover on desktop and
 * phones crop the sides, so the words sit centred, in the top two thirds.
 */
function cover() {
  const W = 1128;
  const H = 191;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    <rect y="${H - 6}" width="${W}" height="6" fill="${C.accent}"/>
    <text x="${W / 2}" y="70" text-anchor="middle" font-family="${SERIF}" font-size="34" fill="${C.ink}">${esc("Candidate CVs in your agency's branding,")}</text>
    <text x="${W / 2}" y="112" text-anchor="middle" font-family="${SERIF}" font-size="34" fill="${C.ink}">${esc('with the contact details stripped.')}</text>
    <text x="${W / 2}" y="152" text-anchor="middle" font-family="${SANS}" font-size="19" fill="${C.accent}" letter-spacing="0.5">${esc('www.venditas.in  ·  10 CVs free, no card')}</text>
  </svg>`;
}

/** 1200 x 1200, the shape that shows largest in the LinkedIn feed on a phone. */
function card({ kicker, lines, sub = [] }) {
  const W = 1200;
  const H = 1200;
  const PAD = 96;
  // Sized for a phone: the card shows at about a third of this width in the feed.
  const HEAD = 96;
  const HEAD_LEAD = 114;
  const SUB = 40;
  const SUB_LEAD = 58;
  const blockH = 60 + lines.length * HEAD_LEAD + (sub.length ? 40 + sub.length * SUB_LEAD : 0);
  const top = Math.round((H - blockH) / 2) + 10;

  const head = lines
    .map((l, i) => `<text x="${PAD}" y="${top + 60 + HEAD_LEAD * (i + 1) - 16}" font-family="${SERIF}" font-size="${HEAD}" fill="${C.ink}" letter-spacing="-1">${esc(l)}</text>`)
    .join('');
  const subTop = top + 60 + lines.length * HEAD_LEAD + 40;
  const subs = sub
    .map((l, i) => `<text x="${PAD}" y="${subTop + SUB_LEAD * (i + 1) - 12}" font-family="${SANS}" font-size="${SUB}" fill="${C.ink2}">${esc(l)}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    ${mark(PAD, PAD, 64)}
    <text x="${PAD + 84}" y="${PAD + 44}" font-family="${SERIF}" font-size="38" fill="${C.ink}" letter-spacing="-0.5">Venditas</text>
    <text x="${PAD + 250}" y="${PAD + 42}" font-family="${SANS}" font-size="18" fill="${C.ink3}" letter-spacing="2.5">FOR RECRUITMENT AGENCIES</text>
    <text x="${PAD}" y="${top + 30}" font-family="${SANS}" font-size="26" font-weight="600" fill="${C.accent}" letter-spacing="3">${esc(kicker.toUpperCase())}</text>
    ${head}
    ${subs}
    <rect x="${PAD}" y="${H - PAD - 14}" width="56" height="4" fill="${C.accent}"/>
    <text x="${PAD + 76}" y="${H - PAD}" font-family="${SANS}" font-size="30" fill="${C.accent}">www.venditas.in</text>
  </svg>`;
}

/** One per post in posts.md, in order. Short lines, broken by hand: 1008px of width holds about 22 characters at this size. */
export const CARDS = [
  { file: 'post-01-check.png', kicker: 'Checked on every document', lines: ['If a contact detail', 'survives, you get', 'an error, not a file.'] },
  { file: 'post-02-accuracy.png', kicker: 'Accuracy', lines: ["The candidate's", 'words stay.', 'Gaps stay empty.'] },
  { file: 'post-03-data.png', kicker: 'Candidate data', lines: ['Processed in memory.', 'Not stored.'], sub: ['No bucket, no backup, no candidate database.'] },
  { file: 'post-04-branding.png', kicker: 'Set it once', lines: ['Your logo, colour', 'and footer on', 'every CV.'], sub: ['Saved in your own browser, not on a server.'] },
  { file: 'post-05-shortlist.png', kicker: 'Shortlists', lines: ['Up to 20 CVs', 'at once.'], sub: ['PDF or Word, two columns, tables, scans.'] },
  { file: 'post-06-address.png', kicker: 'Home addresses', lines: ['The street goes.', 'The town stays.'], sub: ['A client needs the commute, not the house.'] },
  { file: 'post-07-pricing.png', kicker: 'Pricing', lines: ['£79 a month.', 'The whole agency.'], sub: ['Founding price for the first 20 agencies.', 'Ten CVs free first, no card.'] },
  { file: 'post-08-quibench.png', kicker: 'If you used Quibench', lines: ['Quibench closed', 'on 11 August 2026.'], sub: ['The job it did still needs doing.'] },
];

async function png(svg, file, width, height) {
  // Rendered at twice the size and scaled down, for clean edges on the text.
  await sharp(Buffer.from(svg), { density: 144 }).resize(width, height).png().toFile(path.join(OUT, file));
  console.log(`  ${file}  ${width}x${height}`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`\ncompany page images -> ${path.relative(process.cwd(), OUT)}`);
  await png(logo(), 'logo-400.png', 400, 400);
  await png(cover(), 'cover-1128x191.png', 1128, 191);
  for (const c of CARDS) await png(card(c), c.file, 1200, 1200);

  // The before-and-after banner from the LinkedIn pack, whose sample contact
  // block is blurred. messy-cv-page1.png is not used: its sample shows a Gmail
  // address and a LinkedIn handle that a real person could own.
  const banner = path.join(HERE, '..', 'linkedin', 'banner-branding.png');
  if (existsSync(banner)) {
    copyFileSync(banner, path.join(OUT, 'before-after.png'));
    console.log('  before-after.png  (copied from outreach/linkedin/banner-branding.png)');
  } else {
    console.log('  before-after.png  MISSING: outreach/linkedin/banner-branding.png not found');
  }
  console.log();
}

main().catch((e) => {
  console.error('render failed:', e.message);
  process.exit(1);
});
