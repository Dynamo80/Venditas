/**
 * Trial nurture: two emails to people who are actually using the tool.
 *
 *   node outreach/nurture.mjs            dry run: who would get what
 *   node outreach/nurture.mjs --send     send them
 *
 * The ten-CV trial gates on a work email, so every trial user is a lead with
 * a usage count. Someone who has run five CVs has spent real time on the
 * output and is the most qualified person in the whole funnel; today nobody
 * speaks to them. Two touches, both from Abin, both answerable by replying:
 *
 *   stage 5    halfway through the trial: did the output hold up, what broke
 *   stage 10   the trial is used up: the founding price, and how to be invoiced
 *
 * Each stage is sent once per address, ever, recorded in outreach/nurture.log.
 * Opt-outs (may_contact = false) and the suppression list are honoured. The
 * founder's own domain is skipped so test runs never mail ourselves.
 *
 * Run it from the same daily routine as the batch: it reads the leads table
 * live, so there is nothing to keep in sync.
 */

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { send, SENDER, suppressed, closeTransport } from './send.mjs';
import { PRO, ANNUAL, GUARANTEE } from '../lib/pricing.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const LOG = path.join(ROOT, 'outreach', 'nurture.log');

const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const BASE = env.SUPABASE_URL;
const KEY = env.SUPABASE_SECRET || env.SUPABASE_SERVICE_KEY;
if (!BASE || !KEY) { console.error('SUPABASE_URL and SUPABASE_SECRET are required in .env.local'); process.exit(1); }

const SEND = process.argv.includes('--send');
const STAGES = [5, 10];

async function leads() {
  const q = `${BASE}/rest/v1/leads?select=email,agency,cv_count,may_contact,plan&cv_count=gte.${STAGES[0]}&may_contact=is.true&order=cv_count.desc`;
  let res = await fetch(q, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (res.status === 400) {
    // sql/003_customers.sql not run yet: there is no plan column. Fall back
    // rather than fail; a paying customer cannot exist without that column
    // anyway, so nobody is wrongly nurtured.
    res = await fetch(q.replace(',plan', ''), { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  }
  if (!res.ok) throw new Error(`leads query failed: ${res.status}`);
  return res.json();
}

function alreadySent() {
  const done = new Set();
  if (existsSync(LOG)) {
    for (const line of readFileSync(LOG, 'utf8').split('\n')) {
      const [email, stage] = line.split('\t');
      if (email && stage) done.add(`${email.toLowerCase()}|${stage}`);
    }
  }
  return done;
}

function stageFor(lead, done) {
  // Highest stage reached that has not been sent. Someone who jumped from 0
  // to 10 in one sitting gets the close, not the halfway email after it.
  for (const s of [...STAGES].reverse()) {
    if (lead.cv_count >= s && !done.has(`${lead.email.toLowerCase()}|${s}`)) return s;
  }
  return null;
}

function firstName(lead) {
  // We only have an email. "Hi there" is worse than no greeting.
  return '';
}

function message(stage, lead) {
  const agency = lead.agency ? ` at ${lead.agency}` : '';
  if (stage === 5) {
    return {
      subject: 'halfway through your ten',
      text: [
        `Hi,`,
        ``,
        `You've run ${lead.cv_count} CVs through Venditas${agency}. Did the output hold up against your own template?`,
        ``,
        `If anything came back wrong — a section in the wrong order, a date format, a bullet that went missing — reply with the CV and I'll fix it the same day. That is genuinely the most useful thing you could send me right now.`,
        ``,
        `— ${SENDER.person}`,
        `${SENDER.fullName}, ${SENDER.company}`,
      ].join('\n'),
    };
  }
  return {
    subject: 'your ten are used up',
    text: [
      `Hi,`,
      ``,
      `That's the ten trial CVs used${agency}. If the output was good enough to send to a client, here is what it costs to keep going:`,
      ``,
      `£${PRO.gbp} a month, unlimited CVs, everyone in the agency, no per-seat charge. Or £${ANNUAL.gbp} for the year, which is two months free. This is the founding price for the first ${PRO.foundingSeats} agencies and it stays at this rate for as long as you keep it; it goes to £${PRO.standardGbp} after that.`,
      ``,
      `${GUARANTEE}`,
      ``,
      `To start, reply with the agency name you'd like on the invoice and whether you want monthly or annual. You'll have the invoice within the day and pay by ordinary bank transfer — no card, no contract.`,
      ``,
      `If it wasn't good enough, tell me what it got wrong. I'd rather know.`,
      ``,
      `— ${SENDER.person}`,
      `${SENDER.fullName}, ${SENDER.company} · venditas.in/pricing`,
    ].join('\n'),
  };
}

async function main() {
  const rows = await leads();
  const done = alreadySent();
  const supp = suppressed();
  const ownDomain = (env.SMTP_USER || '').split('@')[1];

  const due = [];
  for (const l of rows) {
    const email = String(l.email || '').toLowerCase();
    if (!email.includes('@')) continue;
    if (email.split('@')[1] === ownDomain) continue;
    if (supp.has(email)) continue;
    if (l.plan && l.plan !== 'free') continue; // already paying; do not sell to them
    const stage = stageFor({ ...l, email }, done);
    if (stage) due.push({ ...l, email, stage });
  }

  console.log(`\n${rows.length} trial users at ${STAGES[0]}+ CVs · ${due.length} due a nurture email${SEND ? '' : '  (dry run; add --send)'}\n`);
  for (const l of due) {
    const m = message(l.stage, l);
    console.log(`  ${l.email.padEnd(36)} ${String(l.cv_count).padStart(2)} CVs  stage ${l.stage}  "${m.subject}"`);
    if (!SEND) continue;
    const r = await send({ to: l.email, subject: m.subject, text: m.text, fromName: SENDER.fullName, allowRepeat: true });
    if (r.sent) {
      appendFileSync(LOG, `${l.email}\t${l.stage}\t${new Date().toISOString()}\n`);
      console.log(`    sent  ${r.messageId}`);
    } else {
      console.log(`    skipped: ${r.skipped}`);
    }
  }
  closeTransport();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
