/**
 * Answer a reply in under a minute.
 *
 *   node outreach/reply.mjs <domain-or-email>              show what we sent them
 *   node outreach/reply.mjs <domain-or-email> --docx       send the editable Word file
 *   node outreach/reply.mjs <domain-or-email> --draft interested
 *
 * A reply is the scarcest thing this business has. Twenty-five emails at a
 * realistic reply rate is one or two people, and the cost of taking eight hours
 * to answer one of them is the entire batch. So: everything needed to respond
 * is one command away, including the file we promised in the original message.
 *
 * ops/watch.mjs usually gets there first and leaves the right draft in the
 * Drafts folder. This is for answering from the terminal instead.
 *
 * Nothing here sends without --send. Reading is free; mailing a customer is not.
 */

import { readFileSync, existsSync } from 'node:fs';
import { send, closeTransport, SENDER } from './send.mjs';
import { domainOf, record } from './contacted.mjs';
import { DRAFTS, findArtifacts } from './drafts.mjs';

const argv = process.argv.slice(2);
const who = argv[0];
const flag = (n) => argv.includes(`--${n}`);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };

if (!who) {
  console.error('usage: node outreach/reply.mjs <domain-or-email> [--docx] [--draft <kind>] [--send]');
  process.exit(1);
}

const domain = domainOf(who);

async function main() {
  const found = findArtifacts(domain);

  console.log(`\n${domain}`);
  if (!found) {
    console.log('  no record of contacting this agency — check the domain');
  } else {
    const e = found.entry;
    console.log(`  contacted   ${found.day} · ${e.email}`);
    console.log(`  company     ${e.company}  (${e.country || '?'})`);
    console.log(`  specialism  ${e.specialism || '-'}`);
    console.log(`  we sent     sample=${e.sample}  colour=#${e.colour}  logo=${e.logo ? 'yes' : 'no'}`);
    console.log(`  word file   ${existsSync(found.docx) ? found.docx : 'MISSING'}`);
  }

  // Marking a reply has to be one flag. If it is any harder it will not happen,
  // and the day-3 follow-up will chase someone who already answered — which
  // says plainly that nobody read them.
  if (flag('replied')) {
    record(who, 'replied', found?.entry?.company || '');
    console.log('\n  marked as replied — excluded from all follow-ups permanently');
  }

  const kind = opt('draft');
  if (kind) {
    const body = DRAFTS[kind];
    if (!body) {
      console.log(`\nunknown draft "${kind}". Available: ${Object.keys(DRAFTS).join(', ')}`);
      return;
    }
    const text = body(found?.entry || {});
    console.log(`\n--- draft: ${kind} ---\n${text}\n---`);

    if (flag('send')) {
      const to = opt('to') || found?.entry?.email;
      if (!to) { console.log('no address — pass --to'); return; }
      const attachments = flag('docx') && found && existsSync(found.docx)
        ? [{ filename: 'candidate-cv.docx', content: readFileSync(found.docx) }]
        : [];
      // allowRepeat: they wrote to us. The already-contacted guard exists to
      // stop cold duplicates, not to stop us answering someone.
      const r = await send({
        to, fromName: `${SENDER.person} at ${SENDER.company}`, subject: 'Re: your template, four seconds',
        text, attachments, allowRepeat: true,
      });
      console.log(JSON.stringify(r, null, 2));
    } else {
      console.log('\nNot sent. Add --send (and --docx to attach the Word file).');
    }
  } else {
    console.log(`\nDrafts available: ${Object.keys(DRAFTS).join(', ')}`);
    console.log('  node outreach/reply.mjs ' + domain + ' --draft interested --docx --send');
  }

  closeTransport();
}

main().catch((e) => { console.error('failed:', e.message); closeTransport(); process.exit(1); });
