/**
 * Read the mailbox for bounces and replies.
 *
 *   node outreach/inbox.mjs              report what is there
 *   node outreach/inbox.mjs --apply      act on it
 *
 * Runs automatically before every batch, because the two things it catches are
 * both things that get worse if nobody looks:
 *
 *   A REPLY that goes unnoticed gets chased by the day-3 follow-up, which tells
 *   the one interested person that nobody read them.
 *
 *   A BOUNCE that goes unnoticed means sending to a dead address again. Repeat
 *   bounces are one of the clearest signals a mail provider uses to decide a
 *   domain is sending rubbish, and the domain cannot be un-burned.
 */

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { Imap, pickFolder } from './imap.mjs';
import { record, domainOf } from './contacted.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const BOUNCE_FROM = /mailer-daemon|postmaster|no-?reply@.*(mail|smtp)/i;
const BOUNCE_SUBJECT = /undeliver|delivery (status|failure)|returned mail|failure notice|mail delivery/i;
const AUTO_SUBJECT = /out of (the )?office|auto(matic)? reply|autoreply|vacation|away from/i;

/** Everyone we have emailed, so a sender can be recognised as a reply. */
function contactedDomains() {
  const f = path.join(ROOT, 'outreach', 'contacted.csv');
  if (!existsSync(f)) return new Set();
  return new Set(readFileSync(f, 'utf8').split('\n').slice(1)
    .filter((l) => l.trim()).map((l) => l.split(',')[0]));
}

function suppress(email, reason) {
  const f = path.join(ROOT, 'outreach', 'suppressed.txt');
  appendFileSync(f, `${email.toLowerCase()}  # ${reason} ${new Date().toISOString()}\n`);
}

function decodeSubject(raw) {
  // Enough MIME decoding to read a subject line; not a full implementation.
  return String(raw || '').replace(/=\?UTF-8\?Q\?([^?]*)\?=/gi, (_, t) =>
    t.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  ).replace(/=\?UTF-8\?B\?([^?]*)\?=/gi, (_, t) => Buffer.from(t, 'base64').toString('utf8'));
}

export async function scanInbox({ apply = false, sinceDays = 14 } = {}) {
  const host = (env.IMAP_HOST || env.SMTP_HOST || '').replace(/^smtpout\./, 'imap.');
  const im = new Imap({ host, port: Number(env.IMAP_PORT || 993), user: env.SMTP_USER, pass: env.SMTP_PASS });
  const found = { replies: [], bounces: [], auto: [], other: 0 };

  try {
    await im.connect();
    await im.login();
    await im.select('INBOX');

    const d = new Date(Date.now() - sinceDays * 86400_000);
    const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    const seqs = await im.search(`SINCE ${d.getDate()}-${mon}-${d.getFullYear()}`);

    const known = contactedDomains();

    for (const n of seqs) {
      const h = await im.headers(n);
      const from = h.from || '';
      const subject = decodeSubject(h.subject);
      const addr = (/<([^>]+)>/.exec(from) || [, from])[1].trim().toLowerCase();
      const dom = domainOf(addr);

      // Our own test messages are not replies.
      if (dom === domainOf(env.SMTP_USER)) { found.other++; continue; }

      if (BOUNCE_FROM.test(from) || BOUNCE_SUBJECT.test(subject)) {
        const body = await im.body(n);
        // The address that failed is in the body, not the headers.
        const failed = [...body.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)]
          .map((m) => m[0].toLowerCase())
          .find((e) => known.has(domainOf(e)));
        found.bounces.push({ subject, failed: failed || null });
        continue;
      }

      if (AUTO_SUBJECT.test(subject)) { found.auto.push({ from: addr, subject }); continue; }

      if (dom && known.has(dom)) { found.replies.push({ from: addr, domain: dom, subject }); continue; }

      found.other++;
    }

    if (apply) {
      for (const r of found.replies) record(r.from, 'replied', r.subject.slice(0, 60));
      for (const b of found.bounces) if (b.failed) suppress(b.failed, 'bounced');
    }
  } finally {
    await im.logout();
  }
  return found;
}

if (process.argv[1]?.endsWith('inbox.mjs')) {
  const f = await scanInbox({ apply: APPLY });
  console.log(`\ninbox scan${APPLY ? ' (applying)' : ' (read only)'}`);
  console.log(`  replies  ${f.replies.length}`);
  for (const r of f.replies) console.log(`    ${r.from.padEnd(38)} ${r.subject.slice(0, 46)}`);
  console.log(`  bounces  ${f.bounces.length}`);
  for (const b of f.bounces) console.log(`    ${(b.failed || 'unknown recipient').padEnd(38)} ${b.subject.slice(0, 46)}`);
  console.log(`  auto-replies ${f.auto.length}   other ${f.other}`);
  if (!APPLY && (f.replies.length || f.bounces.length)) {
    console.log('\n  Nothing changed. Run with --apply to mark replies and suppress bounces.');
  }
  console.log();
}
