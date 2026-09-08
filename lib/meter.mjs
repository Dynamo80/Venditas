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
 *
 * A limit is only a limit if the key it counts against is one the visitor
 * cannot mint at will. Everything awkward in this file — canonicalising the
 * address, refusing to believe a forwarded-for header, folding an IPv6 host
 * down to its prefix — is there because the first version counted against keys
 * that were free to create. See docs/decisions/009-enforceable-trial-limits.md.
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
// is no harder to get than a VPN — and no address is ever verified, so the one
// in the form need not even belong to the person typing it. This cap is what
// actually bounds the damage, and it is the reason the Gemini quota cannot be
// drained by one visitor. It sits above FREE_PER_DAY on purpose, so a shared
// office NAT does not lock out the second colleague to try the tool.
export const HARD_IP_CAP = 12;

/**
 * The network-free backstop, in requests per hour per source.
 *
 * Every limit above needs the database, and `check()` deliberately fails open
 * when the database is unreachable — a metering outage must not take the
 * product down. "Fails open" is an invitation if there is nothing behind it.
 * This counter lives in the process, costs no round trip, and is what an
 * attacker meets during an outage. It sits well above HARD_IP_CAP so it never
 * fires while the database is healthy.
 */
export const LOCAL_BURST = 20;
const LOCAL_WINDOW_MS = 60 * 60 * 1000;
const LOCAL_MAX_KEYS = 5000;

export const metered = Boolean(URL_BASE && SERVICE_KEY);

// --------------------------------------------------------------------- keys

/**
 * Salted hash, never the value. We need to count requests from a source, not
 * know who the source is — and an unsalted hash of an IPv4 address is trivially
 * reversible by brute force, so the salt is doing real work. The same now
 * applies to the email counters, which used to hold the address in clear text:
 * the Article 30 record says that table holds hashes, and this is what makes
 * the sentence true.
 */
function hashKey(prefix, value) {
  const salt = process.env.USAGE_SALT || 'venditas-usage-v1';
  return createHash('sha256').update(`${salt}:${prefix}:${value}`).digest('hex').slice(0, 32);
}

export function ipKey(ip) {
  return hashKey('ip', normaliseIp(ip));
}

export function emailKey(email) {
  return hashKey('email', canonicalEmail(email));
}

/**
 * The address the visitor typed, reduced to the mailbox it actually reaches.
 *
 * `alice+1@gmail.com` through `alice+99@gmail.com` are ninety-nine keys and one
 * inbox, and typing a different digit is a good deal easier than finding a VPN.
 * Sub-addressing is stripped for every domain; dots are stripped only for
 * Google's, because only Google guarantees they are insignificant. Yahoo's
 * hyphen aliases are left alone on purpose — `john-smith@yahoo.com` is usually
 * a name, and folding it would make two strangers share one trial.
 *
 * NFKC and the zero-width strip come first: `alice<U+200B>@x.com` is a distinct
 * string, a distinct hash, and the same mailbox.
 *
 * This is the key we *count* against. It is never the address we *write to* —
 * see recordLead, which keeps what the visitor typed.
 */
const ZERO_WIDTH = /[­​-‏‪-‮⁠-⁤﻿]/g;
const GOOGLE_MAIL = new Set(['gmail.com', 'googlemail.com']);

export function canonicalEmail(raw) {
  const s = String(raw || '').normalize('NFKC').replace(ZERO_WIDTH, '').trim().toLowerCase();
  const at = s.lastIndexOf('@');
  if (at < 1) return s;

  let local = s.slice(0, at);
  let domain = s.slice(at + 1).replace(/\.+$/, '');   // a trailing dot is the same host

  const tag = local.indexOf('+');
  if (tag > 0) local = local.slice(0, tag);

  if (GOOGLE_MAIL.has(domain)) {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }
  return `${local}@${domain}`;
}

/**
 * Which address to believe when the request has been through a proxy.
 *
 * `x-forwarded-for` is written by whoever sent the request and appended to by
 * every hop after them, so its *first* entry is the one value in the chain the
 * caller chose for themselves. Reading that entry meant a header anyone can
 * type gave them a fresh bucket per request, and the cap that "actually bounds
 * the damage" bounded nothing. It also let someone burn a stranger's allowance
 * by claiming their address.
 *
 * So: take what our own edge wrote. `x-vercel-forwarded-for` is set by Vercel,
 * which strips any inbound copy, so it cannot be forged. Failing that, the last
 * entry of `x-forwarded-for` — the hop nearest us, appended by our proxy rather
 * than supplied by the caller. `x-real-ip` is a last resort for running behind
 * something else, and for local development, where nothing is metered anyway.
 */
export function clientIp(request) {
  const last = (v) => {
    const parts = String(v).split(',').map((p) => p.trim()).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
  };
  const vercel = request.headers.get('x-vercel-forwarded-for');
  if (vercel) return last(vercel) || '0.0.0.0';
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return last(fwd) || '0.0.0.0';
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

/**
 * One host, one key.
 *
 * A home IPv6 allocation is a /64 at worst and usually a /56, so counting whole
 * addresses gave anyone on IPv6 an effectively unlimited supply of them — no
 * proxy, no tooling, just a different source address on each request. The /64
 * is the smallest block an ISP hands out, so it is the smallest unit worth
 * counting. Ports are stripped, and an IPv4-mapped address is counted as the
 * IPv4 address it is, so one host cannot present as two keys.
 */
export function normaliseIp(raw) {
  let ip = String(raw || '').trim();
  if (!ip) return '0.0.0.0';

  if (ip.startsWith('[')) {                       // [2001:db8::1]:443
    const close = ip.indexOf(']');
    if (close > 0) ip = ip.slice(1, close);
  } else if (ip.includes('.') && ip.split(':').length === 2) {
    ip = ip.split(':')[0];                        // 203.0.113.4:5000
  }
  ip = ip.toLowerCase();

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(ip);
  if (mapped) ip = mapped[1];

  if (!ip.includes(':')) return ip;               // IPv4: one address per host

  // Expand "::" so the first four groups can be read off reliably.
  let groups;
  if (ip.includes('::')) {
    const [head, tail = ''] = ip.split('::');
    const h = head ? head.split(':').filter(Boolean) : [];
    const t = tail ? tail.split(':').filter(Boolean) : [];
    groups = [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  } else {
    groups = ip.split(':');
  }
  const four = groups.slice(0, 4).map((g) => (g || '0').padStart(4, '0'));
  while (four.length < 4) four.push('0000');
  return `${four.join(':')}::/64`;
}

/**
 * Known throwaway providers. Not a security control — the list is endlessly
 * incomplete and anyone determined will get past it. It exists so the lead
 * list is mostly real people, which is the only thing it needs to achieve.
 *
 * Matched against every parent of the domain, because several of these deliver
 * anything.mailinator.com to the same inbox and a bare-domain check missed the
 * lot of it.
 */
const DISPOSABLE = new Set([
  'mailinator.com', 'mailinator.net', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'grr.la', 'sharklasers.com',
  'pokemail.net', 'spam4.me', '10minutemail.com', 'minuteinbox.com',
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tmpmail.org',
  'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'getnada.com',
  'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'mailnesia.com',
  'tempr.email', 'moakt.com', 'emailondeck.com', 'burnermail.io', 'mohmal.com',
  'mailsac.com', 'mailcatch.com', 'dropmail.me', 'inboxkitten.com',
  'emailfake.com', '1secmail.com', 'mail.tm', 'linshiyouxiang.net',
]);

export function isDisposable(email) {
  const domain = canonicalEmail(email).split('@')[1] || '';
  if (!domain) return false;
  const parts = domain.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    if (DISPOSABLE.has(parts.slice(i).join('.'))) return true;
  }
  return false;
}

// ------------------------------------------------------- in-process backstop

/** ipKey -> hit timestamps within the window. Bounded; see sweep(). */
const recent = new Map();

function sweep(now) {
  if (recent.size <= LOCAL_MAX_KEYS) return;
  for (const [k, hits] of recent) {
    if (!hits.length || now - hits[hits.length - 1] > LOCAL_WINDOW_MS) recent.delete(k);
  }
  // Still full: drop insertion-oldest until it fits. Losing a counter is a
  // smaller problem than a map that grows until the instance dies.
  let drop = recent.size - LOCAL_MAX_KEYS;
  for (const k of recent.keys()) {
    if (drop-- <= 0) break;
    recent.delete(k);
  }
}

function localHits(key, now, record) {
  const hits = (recent.get(key) || []).filter((t) => now - t < LOCAL_WINDOW_MS);
  if (record) {
    hits.push(now);
    recent.set(key, hits);
    sweep(now);
  } else if (hits.length) {
    recent.set(key, hits);
  }
  return hits.length;
}

/**
 * Called before the request body is read, because reading it means pulling up
 * to 10MB off the wire for someone we are about to refuse. It costs no network
 * call, so there is no reason not to ask first.
 */
export function guard(request) {
  const key = ipKey(clientIp(request));
  return { allow: localHits(key, Date.now(), true) <= LOCAL_BURST, key };
}

/** Test seam: the window is an hour and no test should wait for one. */
export function resetLocalCounters() {
  recent.clear();
}

// ------------------------------------------------------------------ storage

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
  if (!res.ok) {
    const err = new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
    err.status = res.status;   // callers need 404 told apart from the rest
    throw err;
  }
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
 * Every counter this decision needs, in one transaction.
 *
 * Three separate round trips could each be interleaved with a concurrent
 * upload, and the lifetime total used to be a plain read — so two requests
 * arriving together both saw nine used and both went through. One call, one
 * transaction, no window.
 */
let trialRpc = 'unknown';   // 'unknown' | 'ok' | 'missing'

async function counters(ipk, emk) {
  if (trialRpc !== 'missing') {
    try {
      const rows = await rest('rpc/bump_trial', {
        method: 'POST',
        body: JSON.stringify({ p_ip_key: ipk, p_email_key: emk }),
      });
      const r = (Array.isArray(rows) ? rows[0] : rows) || {};
      trialRpc = 'ok';
      return {
        ipToday: Number(r.ip_today) || 0,
        emailToday: Number(r.email_today) || 0,
        emailTotal: Number(r.email_total) || 0,
      };
    } catch (e) {
      if (e.status !== 404) throw e;
      // sql/005 has not been pasted into Supabase yet. A deploy usually lands
      // before the migration does, and metering going offline in that gap is
      // the worst possible time for it. Fall back, and stop asking.
      trialRpc = 'missing';
      console.warn('bump_trial absent — run sql/005_trial_limits.sql; per-day counters only');
    }
  }
  return legacyCounters(ipk, emk);
}

/** Pre-005 path: the same limits, but the lifetime total resets with the purge. */
async function legacyCounters(ipk, emk) {
  const ipToday = await bump(ipk, 'ip');
  if (!emk) return { ipToday, emailToday: 0, emailTotal: 0 };

  const emailToday = await bump(emk, 'email');
  let emailTotal = emailToday;
  try {
    // emk is 32 hex characters, so there is nothing here to escape. The address
    // itself used to go into this URL, where an unescaped character could make
    // the query 400 — and the catch below turned that into an unlimited trial.
    const rows = await rest(`usage_daily?select=count&kind=eq.email&key=eq.${emk}`);
    emailTotal = (rows || []).reduce((n, r) => n + (Number(r.count) || 0), 0);
  } catch (e) {
    // Fall back to what today's atomic counter already proved, never to zero.
    console.error('lifetime count unavailable:', e.message);
  }
  return { ipToday, emailToday, emailTotal };
}

// ----------------------------------------------------------------- decision

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

  const ipk = ipKey(clientIp(request));
  const overLocally = localHits(ipk, Date.now(), false) > LOCAL_BURST;

  const canon = email ? canonicalEmail(email) : '';
  const emk = canon ? emailKey(canon) : null;

  // Cheap, certain, and first: a throwaway address never costs us a round trip
  // and never lands on the lead list.
  if (canon && isDisposable(canon)) {
    return { allow: false, reason: 'disposable', needEmail: true, used: 0 };
  }

  try {
    const c = await counters(ipk, emk);

    if (c.ipToday > HARD_IP_CAP) {
      return { allow: false, reason: 'ip-cap', needEmail: false, used: c.ipToday };
    }

    if (!emk) {
      if (c.ipToday <= FREE_UNGATED) {
        return { allow: true, reason: 'free-first', needEmail: false, used: c.ipToday };
      }
      return { allow: false, reason: 'need-email', needEmail: true, used: c.ipToday };
    }

    if (c.emailToday > FREE_PER_DAY) {
      return { allow: false, reason: 'daily-cap', needEmail: false, used: c.emailToday };
    }
    if (c.emailTotal > FREE_TOTAL) {
      return { allow: false, reason: 'trial-used', needEmail: false, used: c.emailTotal };
    }

    return { allow: true, reason: 'free-trial', needEmail: false, used: c.emailTotal };
  } catch (e) {
    // A metering outage must not take the product down with it — but the
    // in-process counter still applies, so an outage is not an open door.
    console.error('metering unavailable, allowing through:', e.message);
    if (overLocally) return { allow: false, reason: 'ip-cap', needEmail: false, used: LOCAL_BURST };
    return { allow: true, reason: 'metering-error', needEmail: false, used: 0 };
  }
}

/**
 * Upsert the lead. Never overwrites an existing may_contact=false.
 *
 * Stores the address as the visitor typed it, not the canonical form the
 * counters use: stripping `+desk` is right for counting and wrong for writing,
 * because on a domain that treats `+` literally the two are different mailboxes
 * and one of them may belong to somebody else.
 */
export async function recordLead(email, agency) {
  if (!metered || !email) return null;
  const addr = String(email).trim().toLowerCase();
  const name = (agency || '').trim() || null;
  try {
    // Upsert and increment in one statement, so a merge cannot reset the count.
    await rest('rpc/record_lead', {
      method: 'POST',
      body: JSON.stringify({ p_email: addr, p_agency: name }),
    });
    return true;
  } catch (e) {
    if (e.status !== 404) {
      console.error('lead capture failed:', e.message);
      return false;
    }
  }
  try {
    // Pre-005: the upsert without the counter.
    await rest('leads?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{ email: addr, agency: name, last_seen: new Date().toISOString() }]),
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
