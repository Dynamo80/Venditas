/**
 * Can today's outreach actually happen? Answer before spending twenty minutes
 * finding out that it cannot.
 *
 *   node ops/preflight.mjs        check everything, print a verdict
 *
 * WHY
 *
 * On 3 September the batch went out. On 4 September it did not, and nothing
 * said so. `batch.mjs` refuses to send when it cannot read the mailbox — which
 * is right, because sending blind is how a domain dies — but the refusal was a
 * stack trace at the end of a command nobody was running any more. Five working
 * days and 125 sends went past before anyone noticed, and 125 sends is roughly
 * a fifth of everything the thirty days had left.
 *
 * The failure was not the outage. The failure was that an outage and an
 * ordinary quiet morning looked identical. So: one command that says which,
 * in words, with the fix next to it.
 *
 * Every check here is read-only. Nothing is sent, no credential is used to log
 * in anywhere, and a TCP handshake is as far as the mail checks go.
 */

import net from 'node:net';
import dns from 'node:dns/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..'
);
const SITE = 'https://venditas.in';

function env() {
  const f = path.join(ROOT, '.env.local');
  if (!existsSync(f)) return null;
  const out = {};
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trimStart().startsWith('#')) {
      out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

/** TCP reachability only. A banner is a bonus, never a requirement. */
function reachable(host, port, ms = 7000) {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port });
    const done = (ok, detail) => {
      clearTimeout(timer);
      try { sock.destroy(); } catch { /* already gone */ }
      resolve({ ok, detail });
    };
    const timer = setTimeout(() => done(false, `no response in ${ms / 1000}s`), ms);
    sock.on('connect', () => done(true, 'open'));
    sock.on('error', (e) => done(false, e.code || e.message));
  });
}

const results = [];
const record = (name, ok, detail, fix) => {
  results.push({ name, ok, detail, fix });
  const mark = ok === true ? ' ok ' : ok === null ? ' ?? ' : 'FAIL';
  console.log(`  [${mark}] ${name.padEnd(28)} ${detail}`);
  if (!ok && fix) console.log(`         ${fix}`);
};

async function main() {
  console.log('\nPREFLIGHT  ·  can outreach run today?\n');

  // ---------------------------------------------------------------- secrets
  const e = env();
  if (!e) {
    record('.env.local', false, 'not found', 'Nothing can be sent from this machine without it.');
    return verdict();
  }
  const missing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
    .filter((k) => !e[k]);
  record('.env.local', missing.length === 0,
    missing.length ? `missing ${missing.join(', ')}` : 'all mail settings present');

  // ------------------------------------------------------------------- mail
  // The single point of failure for the entire outreach plan. If these two
  // hosts are unreachable, no email goes out today and no reply is read,
  // whatever else is healthy.
  const smtpHost = e.SMTP_HOST;
  const imapHost = (e.IMAP_HOST || e.SMTP_HOST || '').replace(/^smtpout\./, 'imap.');
  const smtpPort = Number(e.SMTP_PORT || 465);
  const imapPort = Number(e.IMAP_PORT || 993);

  if (smtpHost) {
    let ips = [];
    try { ips = await dns.resolve4(smtpHost); } catch { /* reported below */ }
    if (!ips.length) {
      record('smtp dns', false, `${smtpHost} does not resolve`, 'A DNS or network problem, not a mail problem.');
    } else {
      record('smtp dns', true, `${smtpHost} -> ${ips[0]}`);
      const r = await reachable(smtpHost, smtpPort);
      record(`smtp ${smtpPort}`, r.ok, `${smtpHost}:${smtpPort} ${r.detail}`,
        r.ok ? null : 'No mail can be sent. See the diagnosis below.');

      // Port 80 is never blocked by an ISP. If it is also dead, the route to
      // this host is blocked outright rather than the mail port being filtered
      // — which points at the far end, not at the local network.
      if (!r.ok) {
        const web = await reachable(smtpHost, 80, 5000);
        const ref = await reachable('smtp.gmail.com', 587, 5000);
        if (!web.ok && ref.ok) {
          record('  diagnosis', false,
            'every port on the mail host is dead while other providers answer',
            'The mail host is blocking or not routing to this IP. Not an ISP port block.');
        } else if (!ref.ok) {
          record('  diagnosis', false,
            'outbound mail ports are dead everywhere',
            'The network is blocking mail ports. Try a phone hotspot.');
        }
      }
    }

    const ri = await reachable(imapHost, imapPort);
    record(`imap ${imapPort}`, ri.ok, `${imapHost}:${imapPort} ${ri.detail}`,
      ri.ok ? null : 'Replies and bounces cannot be read, so batch.mjs will refuse to send.');
  }

  // ------------------------------------------------------------- production
  try {
    const res = await fetch(`${SITE}/api/health?t=${Date.now()}`, { signal: AbortSignal.timeout(15000) });
    const h = await res.json();
    record('site', Boolean(h.ok), h.ok ? 'healthy' : 'health check failing',
      h.ok ? null 	: 'A prospect who clicks through today lands on a broken tool.');
    record('trial limits', h.trialLimitsReady === true,
      h.trialLimitsReady ? 'sql/005 applied' : 'sql/005 not run',
      h.trialLimitsReady ? null : 'Paste sql/005_trial_limits.sql into Supabase.');
    record('signup mail', h.mailerReady === true,
      h.mailerReady ? 'SMTP set in the hosting environment' : 'SMTP missing in production',
      h.mailerReady ? null : 'Add SMTP_HOST, SMTP_USER and SMTP_PASS to Vercel, then redeploy — nobody can sign up without them.');
    record('demo accounts', h.demoAccountsReady === true,
      h.demoAccountsReady ? 'sql/006 applied' : 'sql/006 not run',
      h.demoAccountsReady ? null : 'Paste sql/006_demo_accounts.sql into Supabase — signup 500s without it.');
  } catch (err) {
    record('site', false, String(err?.message || err).slice(0, 60), 'venditas.in is not answering.');
  }

  // Nowhere to record a sale is a quiet way to not have a business.
  if (e.SUPABASE_URL && e.SUPABASE_SECRET) {
    try {
      const res = await fetch(`${e.SUPABASE_URL}/rest/v1/mrr?select=*`, {
        headers: { apikey: e.SUPABASE_SECRET, Authorization: `Bearer ${e.SUPABASE_SECRET}` },
        signal: AbortSignal.timeout(15000),
      });
      record('sales recording', res.ok, res.ok ? 'sql/003 applied' : 'sql/003 not run',
        res.ok ? null : 'Run sql/003_customers.sql — there is nowhere to record that someone paid.');
    } catch (err) {
      record('sales recording', null, `could not check (${String(err?.message || err).slice(0, 40)})`);
    }
  }

  verdict();
}

function verdict() {
  const failed = results.filter((r) => r.ok === false);
  const mailDead = failed.some((r) => r.name.startsWith('smtp') || r.name.startsWith('imap'));

  console.log(`\n${'-'.repeat(64)}`);
  if (!failed.length) {
    console.log(' READY — outreach can run.');
  } else if (mailDead) {
    console.log(' BLOCKED — no outreach can go out today.');
    console.log(' Everything in the thirty-day plan is downstream of this one thing.');
  } else {
    console.log(` ${failed.length} problem(s), but mail works — outreach can still run.`);
  }
  console.log(`${'-'.repeat(64)}\n`);

  // Non-zero only when mail is down: that is the condition where continuing is
  // pointless. A missing migration is worth shouting about but not worth
  // stopping the morning for.
  process.exitCode = mailDead ? 1 : 0;
}

main().catch((e) => {
  console.error('preflight failed:', e?.message || e);
  process.exit(2);
});
