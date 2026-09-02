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
 * Nothing here sends without --send. Reading is free; mailing a customer is not.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { send, closeTransport, SENDER } from './send.mjs';
import { domainOf, record } from './contacted.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

const argv = process.argv.slice(2);
const who = argv[0];
const flag = (n) => argv.includes(`--${n}`);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };

if (!who) {
  console.error('usage: node outreach/reply.mjs <domain-or-email> [--docx] [--draft <kind>] [--send]');
  process.exit(1);
}

const domain = domainOf(who);

/** Find the document we generated for this agency, in the most recent batch. */
function findArtifacts() {
  const dir = path.join(ROOT, 'outreach', 'batches');
  if (!existsSync(dir)) return null;
  for (const day of readdirSync(dir).sort().reverse()) {
    const manifestPath = path.join(dir, day, 'manifest.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const entry = manifest.find((m) => domainOf(m.email) === domain || domainOf(m.company) === domain);
    if (!entry) continue;
    const safe = (entry.company || '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40);
    return {
      day,
      entry,
      docx: path.join(dir, day, `${safe}.docx`),
      png: path.join(dir, day, `${safe}.png`),
    };
  }
  return null;
}

/**
 * Replies cluster into a handful of shapes. Each of these is written to be sent
 * as-is, because a draft that needs editing is a draft that waits until evening.
 */
const DRAFTS = {
  interested: (c) => `Thanks — the Word file is attached, so you can see it is properly editable rather than a picture of a document.

If you want to try it on your own candidates: ${SENDER.site}, ten free, no card, no account to set up. Put your logo and colour in and it comes back in your template.

Anything it handles badly, tell me and I will fix it — that is more useful to me than a compliment.

Arseny`,

  price: (c) => `£79 a month, everyone at ${c.company || 'your agency'} included — no per-seat charge. Unlimited CVs. Monthly, cancel whenever.

That is a founding rate for the first twenty agencies and it stays at £79 for as long as you keep it; it goes to £149 after.

Ten free first at ${SENDER.site} — I would rather you decided on your own CVs than on my sample.

Arseny`,

  data: (c) => `Fair question, and the honest answer is short: we do not keep candidate CVs. The file is read in memory, turned into a document, returned, and gone when the request ends. No bucket, no backup, no candidate database.

What we do store is your email, your agency name and a count of CVs run.

The detail is at ${SENDER.site}/security, and there is a data processing agreement at ${SENDER.site}/dpa if your client needs one signed. If your legal team wants changes to it, send them over — it is a draft, not a hostage situation.

Arseny`,

  crm: (c) => `If your CRM already does branded CV formatting, honestly, use it. Loxo, Recruit CRM, Zoho Recruit and Vincere all ship it, and a second tool is not worth the money.

Where this tends to earn its place is Bullhorn, JobAdder, or no CRM at all — and where the CVs arriving are a mess, because that is the part it was actually built for.

Which are you on? If the answer is one of the first four I will say so and leave you alone.

Arseny`,

  no: (c) => `Understood, thanks for replying — most people do not, and it is genuinely useful to know.

You are off the list. I will not contact you again.

Arseny`,
};

async function main() {
  const found = findArtifacts();

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
        to, fromName: 'Arseny at Venditas', subject: 'Re: your template, four seconds',
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
