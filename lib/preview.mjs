/**
 * A PNG of what the branded CV looks like.
 *
 * WHY
 * Cold outreach cannot lead with a .docx. A Word attachment from a stranger is
 * a thing security-aware people do not open, it raises spam scores, and some
 * corporate mail gateways quarantine it outright. The whole pitch rests on the
 * recruiter *seeing* the document — so show them, inline in the message, with
 * nothing to open and nothing to trust.
 *
 * HOW
 * Hand-built SVG rasterised by sharp, which is already present as a Next
 * dependency. No browser, no headless Chrome, no new packages. The layout
 * deliberately mirrors render.mjs: the recruiter should recognise the real
 * document when they later download it.
 *
 * This is a picture of the output, never a substitute for it. The .docx is what
 * they get when they reply.
 */

import sharp from 'sharp';

const W = 900;
const H = 1160; // A4-ish at this width
const PAD = 62;

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Greedy wrap on an estimated glyph width. SVG has no text flow, and pulling in
 * a font-metrics library to place three paragraphs would cost more than the
 * occasional line breaking a word early.
 */
function wrap(text, maxWidth, fontSize) {
  const perChar = fontSize * 0.5;
  const maxChars = Math.max(8, Math.floor(maxWidth / perChar));
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function pretty(v) {
  if (!v) return null;
  const m = /^(\d{4})-(\d{1,2})$/.exec(String(v).trim());
  if (m && +m[2] >= 1 && +m[2] <= 12) return `${MONTHS[+m[2]]} ${m[1]}`;
  return String(v).trim();
}

/**
 * @param {object} data   extracted CV fields
 * @param {object} brand  { name, colour, logo (Buffer), logoType }
 * @param {string} reference
 * @returns {Promise<Buffer>} PNG
 */
export async function preview(data, brand = {}, reference = 'CAND-0000') {
  const colour = '#' + (brand.colour || '1F4E5F').replace(/^#/, '');
  const inner = W - PAD * 2;
  const parts = [];
  let y = PAD;

  // ---- masthead ---------------------------------------------------------
  if (brand.logo) {
    const b64 = brand.logo.toString('base64');
    const mime = brand.logoType === 'jpg' ? 'image/jpeg' : 'image/png';
    parts.push(
      `<image x="${PAD}" y="${y}" height="44" preserveAspectRatio="xMinYMin meet" ` +
      `href="data:${mime};base64,${b64}"/>`
    );
    y += 64;
  } else {
    parts.push(
      `<text x="${PAD}" y="${y + 22}" font-size="23" font-weight="700" fill="${colour}">` +
      `${esc(brand.name || 'Candidate Profile')}</text>`
    );
    y += 46;
  }

  // ---- identity ---------------------------------------------------------
  parts.push(`<text x="${PAD}" y="${y + 30}" font-size="34" font-weight="700" fill="#14181d">Candidate reference ${esc(reference)}</text>`);
  y += 48;

  if (data.headline) {
    parts.push(`<text x="${PAD}" y="${y + 18}" font-size="19" fill="${colour}">${esc(data.headline)}</text>`);
    y += 30;
  }
  if (data.location) {
    parts.push(`<text x="${PAD}" y="${y + 14}" font-size="15" fill="#77808b">${esc(data.location)}</text>`);
    y += 26;
  }

  const heading = (label) => {
    y += 22;
    parts.push(`<text x="${PAD}" y="${y}" font-size="14" font-weight="700" letter-spacing="1.6" fill="${colour}">${esc(label.toUpperCase())}</text>`);
    y += 8;
    parts.push(`<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" stroke="${colour}" stroke-width="1.2"/>`);
    y += 20;
  };

  const para = (text, size = 15, fill = '#3d444e', indent = 0) => {
    for (const line of wrap(text, inner - indent, size)) {
      parts.push(`<text x="${PAD + indent}" y="${y}" font-size="${size}" fill="${fill}">${esc(line)}</text>`);
      y += size * 1.42;
    }
  };

  if (data.summary) {
    heading('Profile');
    para(data.summary);
  }

  // ---- experience, until the page runs out ------------------------------
  if (data.experience?.length) {
    heading('Experience');
    for (const role of data.experience) {
      // Stop cleanly rather than spilling past the page edge. A preview that
      // runs off the bottom looks broken; one that ends mid-history looks like
      // page one of something longer, which is exactly what it is.
      if (y > H - 150) break;
      const title = [role.title, role.employer].filter(Boolean).join(' — ');
      parts.push(`<text x="${PAD}" y="${y}" font-size="16.5" font-weight="700" fill="#14181d">${esc(title)}</text>`);
      y += 22;
      const dates = [
        [pretty(role.start), role.current ? 'Present' : pretty(role.end)].filter(Boolean).join(' – '),
        role.location,
      ].filter(Boolean).join('  ·  ');
      if (dates) {
        parts.push(`<text x="${PAD}" y="${y}" font-size="13.5" font-style="italic" fill="#77808b">${esc(dates)}</text>`);
        y += 21;
      }
      for (const b of (role.bullets || []).slice(0, 3)) {
        if (y > H - 130) break;
        parts.push(`<circle cx="${PAD + 5}" cy="${y - 5}" r="2.2" fill="${colour}"/>`);
        para(b, 14.5, '#3d444e', 18);
        y += 3;
      }
      y += 10;
    }
  }

  // ---- footer, mirroring the document -----------------------------------
  // Crop to the content rather than always emitting a full page. A short CV
  // padded with two hundred pixels of blank paper reads as a rendering fault,
  // and this image has exactly one job: to look like a finished document.
  const height = Math.min(H, Math.max(420, Math.round(y + 90)));

  const footer = [brand.footer || brand.name, `Ref ${reference}`].filter(Boolean).join('  ·  ');
  parts.push(`<line x1="${PAD}" y1="${height - 56}" x2="${W - PAD}" y2="${height - 56}" stroke="#e2e6ea" stroke-width="1"/>`);
  parts.push(`<text x="${W / 2}" y="${height - 34}" font-size="12.5" fill="#98a0a9" text-anchor="middle">${esc(footer)}</text>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
  <rect width="${W}" height="${height}" fill="#ffffff"/>
  <g font-family="Calibri, 'Segoe UI', 'DejaVu Sans', sans-serif">${parts.join('\n  ')}</g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${height - 1}" fill="none" stroke="#dfe3e9"/>
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
