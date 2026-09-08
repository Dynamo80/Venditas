/**
 * Demo accounts: the token, the session, and the two database calls.
 *
 * An "account" here is deliberately small. No password, because a password is a
 * reset flow, a storage decision and a breach liability in exchange for nothing
 * this business needs. What it needs is one fact — that the person can read
 * mail at the address they gave — and a clicked link establishes that better
 * than a password ever does.
 *
 * So: a random single-use token, stored only as a hash, that expires; and after
 * it is clicked, a signed cookie that says who this browser is.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { SUPABASE_URL, supabaseKey } from './config.mjs';

const URL_BASE = SUPABASE_URL;
const SERVICE_KEY = supabaseKey.value;

export const accountsEnabled = Boolean(URL_BASE && SERVICE_KEY);

/** How long a verification link is good for. Long enough to walk to a laptop. */
export const LINK_TTL_MINUTES = 45;
/** How long a verified browser stays signed in. */
export const SESSION_DAYS = 30;
export const SESSION_COOKIE = 'vd_demo';

function secret() {
  return (
    process.env.DEMO_SECRET ||
    process.env.UNSUB_SECRET ||
    process.env.SUPABASE_SECRET ||
    process.env.SUPABASE_SERVICE_KEY ||
    'venditas-demo-dev'
  );
}

// ------------------------------------------------------------------- tokens

/**
 * The link token. 32 random bytes: not derived from the address, so knowing
 * someone's email tells an attacker nothing about their link.
 */
export function newToken() {
  return randomBytes(32).toString('base64url');
}

/** Only this ever reaches the database. */
export function hashToken(token) {
  return createHash('sha256').update(`${secret()}:${token}`).digest('hex');
}

// ------------------------------------------------------------------ session

/**
 * `v1.<email>.<expires>.<signature>` — stateless, so a signed-in browser costs
 * no database read on every request. Revocation is by rotating DEMO_SECRET,
 * which is a blunt instrument and the right one at this size.
 */
export function makeSession(email, days = SESSION_DAYS) {
  const addr = String(email).trim().toLowerCase();
  const expires = Date.now() + days * 86400_000;
  const body = `v1.${Buffer.from(addr).toString('base64url')}.${expires}`;
  return `${body}.${createHmac('sha256', secret()).update(body).digest('base64url').slice(0, 32)}`;
}

/** @returns {{email: string}|null} */
export function readSession(cookie) {
  if (!cookie) return null;
  const parts = String(cookie).split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return null;

  const body = parts.slice(0, 3).join('.');
  const expected = Buffer.from(
    createHmac('sha256', secret()).update(body).digest('base64url').slice(0, 32)
  );
  const given = Buffer.from(parts[3]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  if (Number(parts[2]) < Date.now()) return null;
  try {
    return { email: Buffer.from(parts[1], 'base64url').toString('utf8') };
  } catch {
    return null;
  }
}

export function sessionCookie(value, maxAgeDays = SESSION_DAYS) {
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${Math.round(maxAgeDays * 86400)}`,
  ].join('; ');
}

// ----------------------------------------------------------------- database

async function rpc(fn, body) {
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Record a pending signup. The token is returned to the caller, never stored. */
export async function startSignup({ email, name, agency, ipKey }) {
  const token = newToken();
  await rpc('demo_signup', {
    p_email: email,
    p_name: name || null,
    p_agency: agency || null,
    p_hash: hashToken(token),
    p_expires: new Date(Date.now() + LINK_TTL_MINUTES * 60_000).toISOString(),
    p_ip_key: ipKey || null,
  });
  return token;
}

/**
 * Consume a link.
 * @returns {{email, full_name, agency}|null} null when it is wrong, used or expired.
 */
export async function completeSignup(token) {
  const rows = await rpc('demo_verify', { p_hash: hashToken(token) });
  const row = Array.isArray(rows) ? rows[0] : rows;
  return row?.email ? row : null;
}

export function verifyUrl(token, base = 'https://venditas.in') {
  return `${base}/api/demo/verify?t=${encodeURIComponent(token)}`;
}
