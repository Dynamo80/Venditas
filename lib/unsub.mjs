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
    'venditas-unsub-dev'
  );
}

export function tokenFor(email) {
  return createHmac('sha256', secret())
    .update(String(email).trim().toLowerCase())
    .digest('base64url')
    .slice(0, 22);
}

export function tokenValid(email, token) {
  if (!email || !token) return false;
  const expected = Buffer.from(tokenFor(email));
  const given = Buffer.from(String(token));
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export function unsubUrl(email, base = 'https://venditas.in') {
  const e = encodeURIComponent(String(email).trim().toLowerCase());
  return `${base}/unsubscribe?e=${e}&t=${tokenFor(email)}`;
}
