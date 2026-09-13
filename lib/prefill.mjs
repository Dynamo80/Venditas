/**
 * A link that opens the tool already set up for one agency.
 *
 * The cold email shows an agency a sample CV in its own logo and colour, then
 * invites it to run its own. Until now the link opened a blank form, so seeing
 * that same result on their own CV meant finding their logo file and a colour
 * code first. The personal link carries the agency's name, the colour we
 * verified, and the public address of the logo on its own website, so one
 * dropped CV gives them what the email showed them.
 *
 * SIGNED, because the server fetches the logo address inside the link: an
 * unsigned link would let anyone make the server fetch any URL. Only the
 * outreach batch, which holds the secret, can mint one, and app/api/prefill
 * still refuses anything that isn't a public HTTPS PNG or JPEG.
 *
 * Nothing is recorded when a link is opened. A trial needs a work email, and its
 * domain already says which emailed agency tried the tool.
 *
 * The secret is the one unsubscribe links use (lib/unsub.mjs). Local scripts
 * pass it in explicitly (outreach/send.mjs, loadSigningSecret), because a
 * terminal run does not have it in process.env, which is how every unsubscribe
 * link before 14 September came to be signed with the wrong key.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const MAX_AGENCY = 80;
const MAX_LOGO_URL = 300;

const siteSecret = () => process.env.UNSUB_SECRET || process.env.SUPABASE_SECRET || process.env.SUPABASE_SERVICE_KEY || null;

function mac(payload, secret) {
  // Prefixed, so a prefill signature can never double as an unsubscribe token.
  return createHmac('sha256', secret).update(`prefill:${payload}`).digest('base64url').slice(0, 16);
}

/** @returns {string|null} null when there is no secret, so no broken link is ever minted */
export function personalLink({ agency, colour, logo }, { secret, base = 'https://www.venditas.in' } = {}) {
  if (!secret || !agency) return null;
  const fields = { a: String(agency).trim().slice(0, MAX_AGENCY) };
  const c = String(colour || '').replace('#', '').toLowerCase();
  if (/^[0-9a-f]{6}$/.test(c)) fields.c = c;
  if (/^https:\/\/[^\s"'<>]+$/i.test(logo || '') && logo.length <= MAX_LOGO_URL) fields.l = logo;
  const payload = Buffer.from(JSON.stringify(fields)).toString('base64url');
  return `${base}/?for=${payload}.${mac(payload, secret)}`;
}

/** @returns {{agency: string, colour: string|null, logo: string|null}|null} */
export function readPrefill(token, { secret = siteSecret() } = {}) {
  if (!secret) return null;
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig || payload.length > 1000) return null;
  const expected = Buffer.from(mac(payload, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const f = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const agency = String(f.a || '').trim().slice(0, MAX_AGENCY);
    if (!agency) return null;
    return {
      agency,
      colour: /^[0-9a-f]{6}$/.test(f.c || '') ? `#${f.c}` : null,
      logo: typeof f.l === 'string' && /^https:\/\//i.test(f.l) ? f.l : null,
    };
  } catch {
    return null;
  }
}
