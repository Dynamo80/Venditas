/**
 * The day-3 follow-up.
 *
 *   node outreach/followup.mjs                    show who is due, send nothing
 *   node outreach/followup.mjs --send --confirm   send them
 *
 * Most of the reply rate in a cold sequence comes from the second message, not
 * the first. Skipping it wastes the batch.
 *
 * THE THING THAT MUST NOT GO WRONG: following up someone who already replied.
 * That is worse than never following up at all — it says plainly that nobody
 * read their answer, which is exactly the impression a recruiter is trained to
 * spot. There is no inbox access here, so replies have to be marked by hand:
 *
 *   node outreach/reply.mjs <domain> --replied
 *
 * Anyone marked is excluded permanently.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { send, closeTransport, suppressed, SENDER, DAILY_CAP } from './send.mjs';
import { domainOf, record } from './contacted.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const LEDGER = path.join(ROOT, 'outreach', 'contacted.csv');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const AFTER_DAYS = Number(opt('after', 3));
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

async function main() {
  const rows = ledger();
  const skip = suppressed();

  const replied = new Set(rows.filter((r) => r.channel === 'replied').map((r) => r.domain));
  const followed = new Set(rows.filter((r) => r.channel === 'followup').map((r) => r.domain));
  const cutoff = Date.now() - AFTER_DAYS * 86400_000;

  const due = [];
  for (const r of rows) {
    if (r.channel !== 'email') continue;
    if (replied.has(r.domain) || followed.has(r.domain)) continue;
    const t = Date.parse(r.at);
    if (!Number.isFinite(t) || t > cutoff) continue;
    const entry = artifactsFor(r.domain);
    if (!entry?.email || skip.has(entry.email.toLowerCase())) continue;
    if (!due.some((d) => d.domain === r.domain)) {
      due.push({ domain: r.domain, at: r.at, ...entry });
    }
  }

  const batch = due.slice(0, WANT);
  console.log(`\n${rows.filter((r) => r.channel === 'email').length} first contacts · ` +
              `${replied.size} replied · ${followed.size} already followed up`);
  console.log(`${due.length} due after ${AFTER_DAYS} days · taking ${batch.length}`);
  console.log(`mode: ${DO_SEND ? 'SEND' : 'dry run'}\n`);

  if (!batch.length) {
    console.log('Nobody is due yet. First contacts need to be at least ' + AFTER_DAYS + ' days old.');
    closeTransport();
    return;
  }

  for (const p of batch) {
    if (!DO_SEND) {
      console.log(`  due   ${(p.company || p.domain).padEnd(34).slice(0, 34)} ${p.email}  (sent ${p.at.slice(0, 10)})`);
      continue;
    }
    const r = await send({
      to: p.email,
      fromName: `${SENDER.person} at ${SENDER.company}`,
      // Same subject, so it threads under the original rather than arriving as
      // a fresh pitch they have to place.
      subject: 'Re: your template, four seconds',
      text: body(p.company),
      allowRepeat: true,
    });
    if (r.sent) record(p.email, 'followup', p.company || '');
    console.log(`  ${r.sent ? 'sent' : `skipped (${r.skipped})`}  ${p.email}`);
  }

  if (!DO_SEND) console.log('\nNothing sent. Add --send --confirm.');
  closeTransport();
}

main().catch((e) => { console.error('followup failed:', e.message); closeTransport(); process.exit(1); });
