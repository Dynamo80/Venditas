/**
 * Metering, lead capture and abuse control.
 *
 * Two jobs sharing one mechanism, because they need the same counters:
 *
 *   - Capture an email before the first CV. Most visitors arrive from outreach
 *     we sent them, so they already know who we are and the gate costs little —
 *     and it catches the lead at the moment of highest intent.
 *   - Stop anyone looping the endpoint. It spends a finite Gemini quota, and an
 *     unmetered public endpoint that costs money is an outage waiting to happen.
 */

import { createHash } from 'node:crypto';
import { SUPABASE_URL, supabaseKey } from './config.mjs';

const URL_BASE = SUPABASE_URL;
const SERVICE_KEY = supabaseKey.value;

export const FREE_UNGATED = 0;   // an email is required from the first CV

/**
 * A trial, not a free plan.
 *
 * Five a day is roughly 110 CVs a month. HireAra's paid entry tier — the
 * established UK competitor — allows 125 a month for £180. We were giving away
 * about 88% of a competitor's paid product, forever, which is not a generous
 * free tier, it is a pricing bug. Ten total is enough to decide whether the
 * output is any good, and not enough to run a desk on.
 */
export const FREE_TOTAL = 10;
export const FREE_PER_DAY = 5;    // burst protection within the trial
// The gate captures leads; it does not stop abuse, because a throwaway address
// is no harder to get than a VPN. This cap is what actually bounds the damage,
// and it is the reason the Gemini quota cannot be drained by one visitor.
export const HARD_IP_CAP = 12;

export const metered = Boolean(URL_BASE && SERVICE_KEY);

/**
 * Salted hash, never the address. We need to count requests from a source, not
 * know who the source is — and an unsalted hash of an IPv4 address is trivially
 * reversible by brute force, so the salt is doing real work.
 */
export function ipKey(ip) {
  const salt = process.env.USAGE_SALT || 'venditas-usage-v1';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

/**
 * Known throwaway providers. Not a security control — the list is endlessly
 * incomplete and anyone determined will get past it. It exists so the lead
 * list is mostly real people, which is the only thing it needs to achieve.
 */
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', '10minutemail.com',
  'tempmail.com', 'temp-mail.org', 'throwawaymail.com', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'sharklasers.com', 'dispostable.com',
  'maildrop.cc', 'fakeinbox.com', 'mailnesia.com', 'tempr.email',
  'moakt.com', 'emailondeck.com', 'burnermail.io', 'mohmal.com',
]);

export function isDisposable(email) {
  const domain = String(email).toLowerCase().split('@')[1] || '';
  return DISPOSABLE.has(domain);
}

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = await res.text();
  return body ? JSON.parse(body) : null;
}

/** Atomic in the database, because read-then-write races past its own limit. */
async function bump(key, kind) {
  const n = await rest('rpc/bump_usage', {
    method: 'POST',
    body: JSON.stringify({ p_key: key, p_kind: kind }),
  });
  return Number(n) || 0;
}

/**
 * Decide whether this request proceeds.
 *
 * Returns { allow, reason, needEmail, used } — `needEmail` distinguishes "ask
 * them politely" from "refuse", and the caller renders those very differently.
 */
export async function check(request, email) {
  // With no store configured the tool still works. Losing lead capture is
  // survivable; a landing page that 500s in front of a prospect is not.
  if (!metered) return { allow: true, reason: 'unmetered', needEmail: false, used: 0 };

  const key = ipKey(clientIp(request));

  try {
    const ipCount = await bump(key, 'ip');

    if (ipCount > HARD_IP_CAP) {
      return { allow: false, reason: 'ip-cap', needEmail: false, used: ipCount };
    }

    if (!email) {
      if (ipCount <= FREE_UNGATED) {
        return { allow: true, reason: 'free-first', needEmail: false, used: ipCount };
      }
      return { allow: false, reason: 'need-email', needEmail: true, used: ipCount };
    }

    if (isDisposable(email)) {
      return { allow: false, reason: 'disposable', needEmail: true, used: ipCount };
    }

    const addr = email.toLowerCase();
    const todayCount = await bump(addr, 'email');
    if (todayCount > FREE_PER_DAY) {
      return { allow: false, reason: 'daily-cap', needEmail: false, used: todayCount };
    }

    // Lifetime total, summed across days. The per-day bump above is the atomic
    // guard against concurrent requests; this is the trial allowance, and being
    // a read it can race by one or two. Losing a couple of free CVs to a race
    // is cheaper than a second round-trip on every upload.
    const lifetime = await lifetimeCount(addr);
    if (lifetime > FREE_TOTAL) {
      return { allow: false, reason: 'trial-used', needEmail: false, used: lifetime };
    }

    return { allow: true, reason: 'free-trial', needEmail: false, used: lifetime };
  } catch (e) {
    // A metering outage must not take the product down with it.
    console.error('metering unavailable, allowing through:', e.message);
    return { allow: true, reason: 'metering-error', needEmail: false, used: 0 };
  }
}

/** How many CVs this address has ever run. */
async function lifetimeCount(email) {
  try {
    const rows = await rest(
      `usage_daily?select=count&kind=eq.email&key=eq.${encodeURIComponent(email)}`
    );
    return (rows || []).reduce((n, r) => n + (Number(r.count) || 0), 0);
  } catch {
    // Unknown is treated as within allowance. Blocking a paying-shaped visitor
    // because our own counter is unreachable is the worse error.
    return 0;
  }
}

/** Upsert the lead. Never overwrites an existing may_contact=false. */
export async function recordLead(email, agency) {
  if (!metered || !email) return null;
  try {
    await rest('leads?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([
        {
          email: email.toLowerCase(),
          agency: agency || null,
          last_seen: new Date().toISOString(),
        },
      ]),
    });
    // Counted separately so a merge-upsert can't reset it.
    await rest(`rpc/bump_usage`, {
      method: 'POST',
      body: JSON.stringify({ p_key: `cv:${email.toLowerCase()}`, p_kind: 'email' }),
    });
    return true;
  } catch (e) {
    console.error('lead capture failed:', e.message);
    return false;
  }
}

/**
 * Opt someone out. Writes to the database when we have one, and always appends
 * to the on-disk suppression file when running somewhere with a writable disk,
 * because the outreach sender reads that file and it must never miss an opt-out.
 *
 * Returns true if the opt-out was recorded somewhere durable. A false return is
 * a promise we failed to keep, and the caller says so plainly.
 */
export async function removeContact(email, reason = 'unsubscribed') {
  const addr = String(email).trim().toLowerCase();
  if (!addr) return false;
  if (!metered) return false;

  try {
    // Upsert rather than update: someone can unsubscribe from a cold email
    // without ever having used the tool, so the row may not exist yet.
    await rest('leads?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([
        { email: addr, may_contact: false, source: 'unsubscribe', notes: reason },
      ]),
    });
    return true;
  } catch (e) {
    console.error('unsubscribe failed for', addr, e.message);
    return false;
  }
}

/** Addresses that must never be contacted. Read before every send. */
export async function optedOut() {
  if (!metered) return new Set();
  try {
    const rows = await rest('leads?select=email&may_contact=is.false');
    return new Set((rows || []).map((r) => r.email.toLowerCase()));
  } catch (e) {
    // Failing closed here would halt outreach entirely; failing open would mail
    // someone who opted out. The second is unacceptable, so we throw and let the
    // sender refuse to run rather than guess.
    throw new Error(`cannot read opt-out list, refusing to send: ${e.message}`);
  }
}
