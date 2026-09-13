/**
 * The answers to a reply, written once and used from two places.
 *
 *   outreach/reply.mjs   prints one, or sends it, by hand
 *   ops/watch.mjs        files one in Drafts the moment a reply arrives
 *
 * Replies cluster into a handful of shapes. Each draft is written to be sent
 * as-is, because a draft that needs editing is a draft that waits until evening.
 *
 * Nothing in this file sends anything.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { SENDER } from './send.mjs';
import { domainOf } from './contacted.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

/** Find the document we generated for this agency, in the most recent batch. */
export function findArtifacts(domain) {
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

export const DRAFTS = {
  interested: (c) => `Thanks — the Word file is attached, so you can see it is properly editable rather than a picture of a document.

If you want to try it on your own candidates: ${SENDER.site}, ten free, no card, no account to set up. Put your logo and colour in and it comes back in your template.

Anything it handles badly, tell me and I will fix it — that is more useful to me than a compliment.

${SENDER.person}`,

  price: (c) => `£79 a month, everyone at ${c.company || 'your agency'} included — no per-seat charge. Unlimited CVs. Monthly, cancel whenever.

That is a founding rate for the first twenty agencies and it stays at £79 for as long as you keep it; it goes to £149 after.

Ten free first at ${SENDER.site} — I would rather you decided on your own CVs than on my sample.

${SENDER.person}`,

  data: (c) => `Fair question, and the honest answer is short: we do not keep candidate CVs. The file is read in memory, turned into a document, returned, and gone when the request ends. No bucket, no backup, no candidate database.

What we do store is your email, your agency name and a count of CVs run.

The detail is at ${SENDER.site}/security, and there is a data processing agreement at ${SENDER.site}/dpa if your client needs one signed. If your legal team wants changes to it, send them over — it is a draft, not a hostage situation.

${SENDER.person}`,

  crm: (c) => `If your CRM already does branded CV formatting, honestly, use it. Loxo, Recruit CRM, Zoho Recruit and Vincere all ship it, and a second tool is not worth the money.

Where this tends to earn its place is Bullhorn, JobAdder, or no CRM at all — and where the CVs arriving are a mess, because that is the part it was actually built for.

Which are you on? If the answer is one of the first four I will say so and leave you alone.

${SENDER.person}`,

  // The pricing page's "invoice us" email (decision 014). It already asks for
  // what the invoice needs, so the answer is the invoice, the same day
  // (docs/runbooks/invoice.md records the sale when the invoice is raised).
  buy: (c) => `Thank you. The invoice will come from Skydo today, due in seven days, and your account goes unlimited as soon as it is raised.

If the legal name, billing address, or monthly or annual is missing from your email, reply with it and I will add it.

You're on the founding price: £79 a month for as long as you keep it.

${SENDER.person}`,

  no: (c) => `Understood, thanks for replying — most people do not, and it is genuinely useful to know.

You are off the list. I will not contact you again.

${SENDER.person}`,
};

/**
 * The part of a reply its sender wrote. Everything from the first quoted line
 * on is our own email coming back, and our own email mentions the price, the
 * DPA and the CRMs, which would otherwise decide every classification.
 */
export function ownWords(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const next = lines[i + 1] || '';
    if (/^\s*>/.test(l)) break;
    if (/^On\s.+/.test(l) && (/wrote:\s*$/.test(l) || /^\s*wrote:\s*$/.test(next) || /wrote:\s*$/.test(next))) break;
    if (/^-{2,}\s*Original Message/i.test(l) || /^_{8,}\s*$/.test(l) || /^From:\s.+/.test(l)) break;
    out.push(l);
  }
  return out.join('\n');
}

/** A request to stop. Suppression only ever reduces who is written to, so it errs this way. */
export const OPT_OUT = /\b(unsubscribe|remove (me|us)|take (me|us) off|stop (emailing|contacting|sending)|do not (email|contact)|don'?t (email|contact))\b/i;

/** First match wins, so the order is what a reply most needs answered first. */
const RULES = [
  ['no', /\b(not interested|no thanks|no,? thank you|unsubscribe|remove (me|us)|take (me|us) off|stop (emailing|contacting|sending)|do not (email|contact)|don'?t (email|contact))\b/i],
  ['buy', /\b(invoice|legal name|billing address|sign (us )?up|go ahead|we'?ll take it|purchase)\b/i],
  ['data', /\b(gdpr|dpa|data protection|data processing|privacy|security|stored?|retention|iso ?27001|soc ?2|compliance)\b/i],
  ['crm', /\b(bullhorn|jobadder|vincere|loxo|recruit ?crm|zoho|firefish|mercury|itris|crm|ats)\b/i],
  ['price', /\b(price|pricing|cost|costs|how much|per (month|user|seat))\b|£/i],
];

/**
 * Which draft fits. Keyword rules, run on this machine: a reply carries the
 * sender's name and signature, which is personal data the free Gemini tier may
 * not receive (decision 003).
 *
 * @returns {{kind: keyof DRAFTS, optOut: boolean}}
 */
export function classify(text, subject = '') {
  if (/venditas agency plan/i.test(subject)) return { kind: 'buy', optOut: false };
  const words = ownWords(text);
  for (const [kind, re] of RULES) {
    if (re.test(words)) return { kind, optOut: OPT_OUT.test(words) };
  }
  return { kind: 'interested', optOut: false };
}
