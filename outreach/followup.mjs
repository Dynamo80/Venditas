/**
 * Follow-ups: one three working days after the first email, and a last note
 * five working days after that. Then silence.
 *
 *   node outreach/followup.mjs                    show who is due, send nothing
 *   node outreach/followup.mjs --send --confirm   send them
 *   [--n N] [--after 3] [--last-after 5]
 *
 * Most of the reply rate in a cold sequence comes after the first message, not
 * from it. Skipping the follow-ups wastes the batch. The last note says it is the
 * last, and it is: nothing in this repo writes to that agency again unless they
 * reply.
 *
 * THE THING THAT MUST NOT GO WRONG: following up someone who already replied.
 * That is worse than never following up at all — it says plainly that nobody
 * read their answer, which is exactly the impression a recruiter is trained to
 * spot. ops/watch.mjs marks replies within twenty minutes, and by hand:
 *
 *   node outreach/reply.mjs <domain> --replied
 *
 * Anyone marked is excluded permanently.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { send, closeTransport, suppressed, SENDER, DAILY_CAP } from './send.mjs';
import { domainOf, record, isSendableNow } from './contacted.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const LEDGER = path.join(ROOT, 'outreach', 'contacted.csv');
const SENT_LOG = path.join(ROOT, 'outreach', 'sent.log');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const AFTER_DAYS = Number(opt('after', 3));
const LAST_AFTER_DAYS = Number(opt('last-after', 5));
const WANT = Number(opt('n', DAILY_CAP));
const DO_SEND = flag('send') && flag('confirm');

function ledger() {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, 'utf8').split('\n').slice(1).filter((l) => l.trim())
    .map((l) => { const [domain, channel, at, note] = l.split(','); return { domain, channel, at, note }; });
}

/** Everything we generated for an agency, so the follow-up can reference it. */
function artifactsFor(domain) {
  const dir = path.join(ROOT, 'outreach', 'batches');
  if (!existsSync(dir)) return null;
  for (const day of readdirSync(dir).sort().reverse()) {
    const mp = path.join(dir, day, 'manifest.json');
    if (!existsSync(mp)) continue;
    const entry = JSON.parse(readFileSync(mp, 'utf8')).find((m) => domainOf(m.email) === domain);
    if (entry) return entry;
  }
  return null;
}

/**
 * The first cold email to each domain, from the log every sender appends to:
 * the address it went to and the subject it carried.
 *
 * Batch manifests are not a complete record. On 14 September this found an
 * address for only one of the 50 agencies emailed on 2 and 3 September, and
 * the other 49 were skipped without a word, so the second message never went
 * to any of them. sent.log holds every send, so it fills the gap. Its subject
 * lets the follow-up thread under the email actually sent, now that the
 * competitor and new-agency emails carry subjects of their own.
 */
function firstSends(ownDomain) {
  const out = new Map();
  if (!existsSync(SENT_LOG)) return out;
  for (const line of readFileSync(SENT_LOG, 'utf8').split('\n')) {
    const [at, to, subject = ''] = line.split('\t');
    const email = (to || '').trim().toLowerCase();
    const domain = domainOf(email);
    if (!domain || domain === ownDomain) continue;
    if (/^re:/i.test(subject) || /\btest\b/i.test(subject)) continue;
    if (!out.has(domain)) out.set(domain, { email, subject, at });
  }
  return out;
}

/**
 * Working days, not calendar days. Three days after a Wednesday send is
 * Saturday, and a follow-up delivered then is the one touch in the sequence
 * most likely to be wasted.
 */
function workingDaysAgo(n) {
  let cutoff = Date.now();
  let counted = 0;
  while (counted < n) {
    cutoff -= 86400_000;
    const d = new Date(cutoff).getUTCDay();
    if (d !== 0 && d !== 6) counted++;
  }
  return cutoff;
}

function body(company) {
  return `Following up on the CV I sent — did the formatting hold up?

The part most agencies check first: the candidate's name, email, phone and
LinkedIn are removed and replaced with a reference code, and every document is
checked after it is built. If anything would still have been visible you get an
error instead of a file. Losing a fee to a client who went direct is the
expensive failure, so it is the one thing that does not get to fail quietly.

Ten free at ${SENDER.site} if you want to run your own.

${SENDER.person}`;
}

/** Everything in it is true of the product on the day it was written (decision 019 for the template). */
function lastNote() {
  return `Last note from me on this.

Agencies take the contact details off a CV because a client holding the
candidate's number doesn't need the agency for the second conversation.
Venditas does that job: in your own Word template or your branding, with the
candidate's own wording kept, and every document read back before you get it.

Ten free at ${SENDER.site}, no card. After that it's £79 a month for the whole
agency.

If it isn't for you, no reply needed. I won't email again.

${SENDER.person}`;
}

async function main() {
  const rows = ledger();
  const skip = suppressed();

  const byChannel = (c) => new Set(rows.filter((r) => r.channel === c).map((r) => r.domain));
  const replied = byChannel('replied');
  const followed = byChannel('followup');
  const lastSent = byChannel('lastnote');
  const cutoff = workingDaysAgo(AFTER_DAYS);
  const lastCutoff = workingDaysAgo(LAST_AFTER_DAYS);

  const sends = firstSends(domainOf(SENDER.site));
  const addressFor = (domain) => {
    const entry = artifactsFor(domain);
    const first = sends.get(domain);
    return { entry, email: entry?.email || first?.email, subject: first?.subject };
  };

  const due = [];
  const taken = new Set();
  const consider = (r, stage, since, excluded) => {
    if (taken.has(r.domain) || replied.has(r.domain) || excluded.has(r.domain)) return;
    const t = Date.parse(r.at);
    if (!Number.isFinite(t) || t > since) return;
    const { entry, email, subject } = addressFor(r.domain);
    if (!email || skip.has(email.toLowerCase())) return;
    taken.add(r.domain);
    due.push({ stage, domain: r.domain, at: r.at, ...entry, email, subject });
  };
  // The first follow-up before any last note: an agency that has heard once
  // matters more than one that has already heard twice.
  for (const r of rows) if (r.channel === 'email') consider(r, 'followup', cutoff, followed);
  for (const r of rows) if (r.channel === 'followup') consider(r, 'lastnote', lastCutoff, lastSent);

  const when = isSendableNow();
  if (DO_SEND && !when.ok) {
    console.error(`\nRefusing to send: ${when.why}.`);
    console.error('Pass --anyway if you have a reason.');
    if (!flag('anyway')) { closeTransport(); process.exit(1); }
  }

  const batch = due.slice(0, WANT);
  const count = (s) => due.filter((d) => d.stage === s).length;
  console.log(`\n${rows.filter((r) => r.channel === 'email').length} first contacts · ` +
              `${replied.size} replied · ${followed.size} followed up · ${lastSent.size} sent the last note`);
  console.log(`due: ${count('followup')} follow-up (after ${AFTER_DAYS} working days) · ` +
              `${count('lastnote')} last note (${LAST_AFTER_DAYS} working days after the follow-up) · taking ${batch.length}`);
  console.log(`mode: ${DO_SEND ? 'SEND' : 'dry run'}\n`);

  if (!batch.length) {
    console.log('Nobody is due yet.');
    closeTransport();
    return;
  }

  for (const p of batch) {
    if (!DO_SEND) {
      console.log(`  due   ${p.stage.padEnd(9)} ${(p.company || p.domain).padEnd(34).slice(0, 34)} ${p.email}  (last touch ${p.at.slice(0, 10)})`);
      continue;
    }
    const r = await send({
      to: p.email,
      fromName: `${SENDER.person} at ${SENDER.company}`,
      // Same subject, so it threads under the original rather than arriving as
      // a fresh pitch they have to place.
      subject: `Re: ${p.subject || 'your template, four seconds'}`,
      text: p.stage === 'lastnote' ? lastNote() : body(p.company),
      allowRepeat: true,
    });
    if (r.sent) record(p.email, p.stage, p.company || '');
    console.log(`  ${r.sent ? 'sent' : `skipped (${r.skipped})`}  ${p.stage.padEnd(9)} ${p.email}`);
  }

  if (!DO_SEND) console.log('\nNothing sent. Add --send --confirm.');
  closeTransport();
}

main().catch((e) => { console.error('followup failed:', e.message); closeTransport(); process.exit(1); });
