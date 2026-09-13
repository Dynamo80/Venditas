/**
 * Unsubscribe tokens.
 *
 * The link goes in every outbound email, so the address is visible in the URL
 * either way. The token is not hiding anything — it stops someone iterating
 * addresses and unsubscribing a list they don't own, which would be quiet,
 * total, and very hard to notice.
 *
 * Stateless HMAC rather than a stored token, because cold prospects are not
 * rows in any table yet and still need a working opt-out.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

function secret() {
  // Falls back to the service key so this works without another variable to
  // paste. Only ever used to sign, never transmitted.
  return (
    process.env.UNSUB_SECRET ||
    process.env.SUPABASE_SECRET ||
    process.env.SUPABASE_SERVICE_KEY ||
    LEGACY
  );
}

/**
 * The development fallback, which signed every link sent before 14 September:
 * the sending scripts ran without the real secret in their environment, so the
 * site rejected each of those unsubscribe links with HTTP 400. They have to work.
 *
 * This key is in a public repository, so anyone can forge a link with it, and
 * the only thing a forged link does is opt an address out of our email. That
 * costs an email not sent. Refusing a genuine opt-out costs the law and the
 * domain. outreach/send.mjs now refuses to send without the real secret, so no
 * new link is signed with this one.
 */
const LEGACY = 'venditas-unsub-dev';

function sign(email, key) {
  return createHmac('sha256', key)
    .update(String(email).trim().toLowerCase())
    .digest('base64url')
    .slice(0, 22);
}

export function tokenFor(email) {
  return sign(email, secret());
}

export function tokenValid(email, token) {
  if (!email || !token) return false;
  const given = Buffer.from(String(token));
  return [secret(), LEGACY].some((key) => {
    const expected = Buffer.from(sign(email, key));
    return expected.length === given.length && timingSafeEqual(expected, given);
  });
}

export function unsubUrl(email, base = 'https://venditas.in') {
  const e = encodeURIComponent(String(email).trim().toLowerCase());
  return `${base}/unsubscribe?e=${e}&t=${tokenFor(email)}`;
}
