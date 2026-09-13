/**
 * Brand colours, made legible on a white page.
 *
 * WHY
 * Every coloured element in the CV — agency name, headline, section headings,
 * rules, bullets — is drawn in the brand colour on white. A colour picked for a
 * website background (#faf7f1, #f3f3f3) makes all of them disappear, and the
 * document looks broken in exactly the place it is supposed to look like the
 * agency. The outreach batch on 2026-09-13 rendered two agencies that way.
 *
 * So a colour too pale to read is darkened, keeping its hue, until it clears
 * WCAG's 3:1 for large text. Section headings are bold and uppercase, which is
 * what that threshold is for. A colour that already reads is left untouched:
 * the agency should recognise its own brand.
 */

const DEFAULT = '1F4E5F';

/** '#abc' | 'AABBCC' | '#aabbcc' -> 'AABBCC', or null if it is not a colour. */
export function normaliseHex(raw) {
  let hex = String(raw || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.split('').map((c) => c + c).join('');
  return /^[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null;
}

const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));

function channel(v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex) {
  const [r, g, b] = rgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio against white, 1 (invisible) to 21 (black). */
export function contrastOnWhite(hex) {
  return 1.05 / (luminance(hex) + 0.05);
}

/**
 * The brand colour if it reads on white, otherwise the same hue darkened until
 * it does. Anything that is not a colour gets the house default.
 */
export function readableOnWhite(raw, min = 3) {
  const hex = normaliseHex(raw);
  if (!hex) return DEFAULT;
  if (contrastOnWhite(hex) >= min) return hex;

  const [r, g, b] = rgb(hex);
  for (let f = 0.95; f > 0; f -= 0.05) {
    const darker = [r, g, b]
      .map((v) => Math.round(v * f).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    if (contrastOnWhite(darker) >= min) return darker;
  }
  return DEFAULT;
}
