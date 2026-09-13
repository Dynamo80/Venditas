/**
 * Read the mailbox every twenty minutes, so a reply is answered inside the hour.
 *
 *   node ops/watch.mjs          one pass: record, draft, alert
 *   node ops/watch.mjs --dry    one pass that changes nothing and alerts nobody
 *
 * Scheduled by ops/install-schedule.ps1. Decision 018.
 *
 * WHY
 *
 * docs/runbooks/replies.md: a reply is the scarcest thing this business has,
 * and answering one eight hours late wastes the batch. The daily routine reads
 * the inbox once, at 14:00 IST. A recruiter who replies at 11:00 UK is read the
 * next afternoon. Worse, the pricing page's "invoice us" email, which is a sale,
 * is never flagged at all: it comes from a domain we never wrote to, so
 * inbox.mjs counts it as "other".
 *
 * WHAT HAPPENS TO EACH MESSAGE, ONCE
 *
 *   reply from an agency we wrote to   marked replied, so no follow-up chases it;
 *                                      the matching draft from drafts.mjs filed
 *                                      in Drafts, threaded; the founder told
 *   "Venditas Agency plan: invoice"    the same, with the invoice draft, as a sale
 *   anyone else writing by hand        the founder told; a draft only for a price,
 *                                      data or buying question
 *   asks us to stop                    suppressed, as well as the above
 *   bounce                             the failed address suppressed
 *   auto-reply, newsletter, receipt    nothing
 *
 * Each new trial signup is flagged too: someone who has just run a CV is the
 * warmest lead the site produces, and nurture.mjs only reaches them at five.
 *
 * NOTHING IS SENT. The draft waits in the founder's own Drafts folder, to be
 * read and sent by a person. The runbook's rule stands: reply personally, and
 * never let a machine write to someone who wrote to you.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { Imap, pickFolder } from '../outreach/imap.mjs';
import { record, domainOf } from '../outreach/contacted.mjs';
import { suppressed, suppress, SENDER } from '../outreach/send.mjs';
import { BOUNCE_FROM, BOUNCE_SUBJECT, AUTO_SUBJECT, decodeSubject } from '../outreach/inbox.mjs';
import { DRAFTS, findArtifacts, classify } from '../outreach/drafts.mjs';
import { ROOT, loadEnv, notify, recordRun, readState, writeState, log } from './automation.mjs';

const DRY = process.argv.includes('--dry');

/** Far enough back to cover a laptop that slept through a long weekend. */
const LOOKBACK_DAYS = 4;
/** A shorter outage is the daily preflight's to report, not a reason to wake anyone. */
const FAILURE_ALERT_HOURS = 3;

const FIELDS = [
  'FROM', 'SUBJECT', 'DATE', 'MESSAGE-ID', 'REFERENCES', 'LIST-UNSUBSCRIBE', 'LIST-ID',
  'PRECEDENCE', 'AUTO-SUBMITTED', 'CONTENT-TYPE', 'CONTENT-TRANSFER-ENCODING',
];
const BULK_FROM = /no-?reply|do-?not-?reply|notifications?@|newsletter|mailer@/i;
/** Domains that say nothing about who someone works for. */
const FREEMAIL = /^(gmail|googlemail|outlook|hotmail|live|msn|yahoo|ymail|icloud|me|aol|proton|protonmail|gmx)\./i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Have we written to this address? By domain for agencies, because a reply
 * from the director counts when we wrote to info@. By exact address for free
 * mail, where sharing gmail.com with a trial user makes nobody a reply.
 */
function contactHistory() {
  const domains = new Set();
  const addresses = new Set();
  const sent = path.join(ROOT, 'outreach', 'sent.log');
  if (existsSync(sent)) {
    for (const l of readFileSync(sent, 'utf8').split('\n')) {
      const to = (l.split('\t')[1] || '').trim().toLowerCase();
      if (!to.includes('@')) continue;
      addresses.add(to);
      domains.add(domainOf(to));
    }
  }
  const ledger = path.join(ROOT, 'outreach', 'contacted.csv');
  if (existsSync(ledger)) {
    for (const l of readFileSync(ledger, 'utf8').split('\n').slice(1)) {
      const d = (l.split(',')[0] || '').trim();
      if (d) domains.add(d);
    }
  }
  return (addr) => {
    const d = domainOf(addr);
    if (!d) return false;
    return FREEMAIL.test(d) ? addresses.has(addr) : domains.has(d);
  };
}

// ------------------------------------------------------------------- mime
//
// Enough MIME to read what a person typed, not a full implementation. Replies
// arrive as quoted-printable from Gmail and base64 from Outlook, usually as
// multipart/alternative, sometimes nested inside multipart/mixed.

function decodeBody(body, encoding = '') {
  if (/base64/i.test(encoding)) {
    return Buffer.from(body.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64').toString('utf8');
  }
  if (/quoted-printable/i.test(encoding)) {
    const bytes = body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
    return Buffer.from(bytes, 'latin1').toString('utf8');
  }
  return body;
}

const stripHtml = (h) => h
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>|<\/p>|<\/div>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

function partHeaders(block) {
  const out = {};
  for (const [, k, v] of block.replace(/\r?\n[ \t]+/g, ' ').matchAll(/^([A-Za-z-]+):[ \t]*(.*)$/gm)) {
    out[k.toLowerCase()] = v.trim();
  }
  return out;
}

function plainText(raw, headers) {
  const type = headers['content-type'] || 'text/plain';
  const boundary = /boundary="?([^";\s]+)"?/i.exec(type)?.[1];
  if (!boundary) {
    const t = decodeBody(raw, headers['content-transfer-encoding']);
    return /text\/html/i.test(type) ? stripHtml(t) : t;
  }
  let html = '';
  for (const part of raw.split(`--${boundary}`).slice(1)) {
    const gap = part.search(/\r?\n\r?\n/);
    if (gap === -1) continue;
    const h = partHeaders(part.slice(0, gap));
    const body = part.slice(gap).replace(/^\r?\n\r?\n/, '');
    const partType = h['content-type'] || 'text/plain';
    if (/multipart\//i.test(partType)) {
      const inner = plainText(body, h);
      if (inner.trim()) return inner;
    } else if (/text\/plain/i.test(partType)) {
      return decodeBody(body, h['content-transfer-encoding']);
    } else if (/text\/html/i.test(partType) && !html) {
      html = stripHtml(decodeBody(body, h['content-transfer-encoding']));
    }
  }
  return html;
}

/** FETCH wraps the body in a closing parenthesis and the tagged OK. Neither is the message. */
const withoutTrailer = (res) => res.replace(/\)\s*\r?\nA\d{4} (?:OK|NO|BAD)[^\r\n]*\s*$/, '');

// ------------------------------------------------------------------ drafts

async function fileDraft(im, folder, { env, to, subject, headers, text, attachments }) {
  const composer = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const built = await composer.sendMail({
    from: `"${SENDER.person} at ${SENDER.company}" <${env.SMTP_USER}>`,
    to,
    subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`,
    inReplyTo: headers['message-id'] || undefined,
    references: [headers.references, headers['message-id']].filter(Boolean).join(' ') || undefined,
    text,
    attachments,
  });
  await im.append(folder, built.message.toString(), '\\Draft');
}

// ------------------------------------------------------------------ handle

/** @returns {null | {type:string, alert?:boolean, title?:string, body?:string, line:string}} */
async function handle(im, seq, h, ctx) {
  const from = h.from || '';
  const subject = decodeSubject(h.subject) || '(no subject)';
  const addr = ((/<([^>]+)>/.exec(from) || [, from])[1] || '').trim().toLowerCase();
  const dom = domainOf(addr);
  if (!dom || dom === ctx.own) return null;

  if (BOUNCE_FROM.test(from) || BOUNCE_SUBJECT.test(subject)) {
    const body = await im.body(seq);
    const failed = [...body.matchAll(EMAIL)]
      .map((m) => m[0].toLowerCase())
      .find((e) => e !== addr && ctx.wasContacted(e));
    if (failed && ctx.act && !suppressed().has(failed)) suppress(failed, 'bounced');
    return { type: 'bounce', line: `${failed || 'unknown recipient'} bounced` };
  }

  if (AUTO_SUBJECT.test(subject) || /auto-(replied|generated|notified)/i.test(h['auto-submitted'] || '')) return null;

  const sale = /venditas agency plan/i.test(subject);
  const replied = ctx.wasContacted(addr);
  const bulk = Boolean(h['list-unsubscribe'] || h['list-id']) || /bulk|list|junk/i.test(h.precedence || '') || BULK_FROM.test(addr);
  if (!sale && !replied && bulk) return null;

  const text = plainText(withoutTrailer(await im.body(seq, 16000)), h);
  const { kind, optOut } = classify(text, subject);
  const found = findArtifacts(dom);
  const company = found?.entry?.company || dom;
  const hasDocx = Boolean(found && existsSync(found.docx));

  // A draft only where its words are true for this sender: the "interested"
  // one promises an attached Word file, and the cold-email answers assume we
  // wrote first.
  const draftable = replied
    ? kind !== 'interested' || hasDocx
    : ['buy', 'price', 'data'].includes(kind);

  let drafted = false;
  let suppressedNow = false;
  if (ctx.act) {
    if (replied) record(addr, 'replied', subject.slice(0, 60));
    if (optOut && !suppressed().has(addr)) { suppress(addr, 'asked to stop'); suppressedNow = true; }
    if (draftable && ctx.draftsFolder) {
      try {
        await fileDraft(im, ctx.draftsFolder, {
          env: ctx.env,
          to: addr,
          subject,
          headers: h,
          text: DRAFTS[kind](found?.entry || {}),
          attachments: kind === 'interested' && hasDocx
            ? [{ filename: 'candidate-cv.docx', content: readFileSync(found.docx) }]
            : [],
        });
        drafted = true;
      } catch (e) {
        console.log(`    could not file a draft: ${e.message}`);
      }
    }
  }

  const draftLine = drafted
    ? `A "${kind}" reply is in Drafts: read it, then send.`
    : draftable && ctx.act ? 'The draft could not be filed; use node outreach/reply.mjs.' : 'No draft.';

  if (sale || kind === 'buy') {
    return {
      type: 'sale', alert: true,
      title: `Sale: ${company} wants to buy`,
      body: `${addr} — "${subject}". ${draftLine} Raise the Skydo invoice and record it: docs/runbooks/invoice.md.`,
      line: `${addr} "${subject}" -> buy`,
    };
  }
  if (replied) {
    return {
      type: 'reply', alert: true,
      title: `Reply from ${company}`,
      body: `${addr} — "${subject}" (reads as ${kind}). ${draftLine} ${suppressedNow ? 'They asked to stop, so they are suppressed.' : 'Answer within the hour.'}`,
      line: `${addr} "${subject}" -> ${kind}`,
    };
  }
  return {
    type: 'enquiry', alert: true,
    title: `New email from ${company}`,
    body: `${addr} — "${subject}". Not someone we wrote to. ${draftLine} Answer it today.`,
    line: `${addr} "${subject}" -> ${kind}`,
  };
}

// ------------------------------------------------------------------ passes

async function scanMailbox(env, state, act) {
  const host = (env.IMAP_HOST || env.SMTP_HOST || '').replace(/^(?:smtpout|smtp)\./, 'imap.');
  const im = new Imap({ host, port: Number(env.IMAP_PORT || 993), user: env.SMTP_USER, pass: env.SMTP_PASS });
  const events = [];
  let read = 0;
  try {
    await im.connect();
    await im.login();
    const draftsFolder = pickFolder(await im.listFolders(), ['Drafts', 'INBOX.Drafts', 'Draft']);
    await im.select('INBOX');
    const d = new Date(Date.now() - LOOKBACK_DAYS * 86400_000);
    const seqs = await im.search(`SINCE ${d.getDate()}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`);
    const ctx = { env, act, draftsFolder, own: domainOf(env.SMTP_USER), wasContacted: contactHistory() };

    for (const seq of seqs) {
      const h = await im.headers(seq, FIELDS);
      const id = h['message-id'] || `${h.date}|${h.from}|${h.subject}`;
      if (state.seen[id]) continue;
      read++;
      try {
        const ev = await handle(im, seq, h, ctx);
        if (ev) events.push(ev);
      } catch (e) {
        events.push({ type: 'error', line: `message ${seq}: ${e.message}` });
      }
      // Seen even when handling failed: a message that breaks the parser must
      // not raise the same alert every twenty minutes.
      state.seen[id] = new Date().toISOString();
    }
  } finally {
    await im.logout();
  }
  return { events, read };
}

async function newLeads(env, state) {
  const key = env.SUPABASE_SECRET || env.SUPABASE_SERVICE_KEY;
  if (!env.SUPABASE_URL || !key) return [];
  const since = state.leadsSince;
  state.leadsSince = state.leadsSince || new Date().toISOString();
  if (!since) return [];
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/leads?select=email,agency,first_seen&first_seen=gt.${encodeURIComponent(since)}&order=first_seen.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (rows.length) state.leadsSince = rows[rows.length - 1].first_seen;
    return rows
      .filter((r) => domainOf(r.email) !== domainOf(env.SMTP_USER))
      .map((r) => ({
        type: 'trial', alert: true,
        title: `Trial signup: ${r.agency || domainOf(r.email)}`,
        body: `${r.email} has just started the free trial. A personal note from the founder today beats the automatic one at five CVs.`,
        line: `${r.email} ${r.agency || ''}`,
      }));
  } catch {
    return [];
  }
}

// -------------------------------------------------------------------- main

async function main() {
  const env = loadEnv();
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.error('.env.local has no mail credentials; nothing to watch.');
    process.exit(2);
  }

  const saved = readState('watch', null);
  // The first pass on a machine only learns what is already there. Acting on
  // it would draft answers to replies the founder may have answered last week.
  const firstRun = !saved;
  const state = saved || { seen: {}, leadsSince: null, failingSince: null, failureAlerted: false };
  const act = !DRY && !firstRun;

  console.log(`\nwatch · ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC${DRY ? ' · dry run' : ''}${firstRun ? ' · first run' : ''}`);

  let mail;
  try {
    mail = await scanMailbox(env, state, act);
    state.failingSince = null;
    state.failureAlerted = false;
  } catch (e) {
    state.failingSince = state.failingSince || new Date().toISOString();
    const hours = (Date.now() - Date.parse(state.failingSince)) / 3600_000;
    console.log(`  mailbox unreadable: ${e.message} (for ${hours.toFixed(1)}h)`);
    if (!DRY) {
      if (hours >= FAILURE_ALERT_HOURS && !state.failureAlerted) {
        await notify({
          title: 'Replies are not being read',
          body: `The mailbox has been unreadable for ${Math.floor(hours)} hours (${e.message}). Run node ops/preflight.mjs.`,
          env,
        });
        state.failureAlerted = true;
      }
      writeState('watch', state);
      recordRun('watch', { ok: false, summary: `mailbox unreadable for ${hours.toFixed(1)}h: ${e.message}` });
      log('watch.log', `FAILED ${e.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const events = [...mail.events, ...(firstRun ? [] : await newLeads(env, state))];
  if (firstRun) await newLeads(env, state);

  for (const ev of events) console.log(`  ${ev.type.padEnd(8)} ${ev.line}`);
  const alerts = events.filter((e) => e.alert);
  if (!events.length) console.log(`  ${mail.read} new message(s), nothing for a person`);

  if (firstRun) {
    console.log(`\n  First run: ${mail.read} message(s) from the last ${LOOKBACK_DAYS} days recorded as already seen.`);
    console.log('  Nothing was drafted, recorded or alerted. Anything above marked sale, reply or');
    console.log('  enquiry is worth checking by hand. Every message from now on is acted on.');
  } else if (act) {
    for (const a of alerts) await notify({ title: a.title, body: a.body, env });
  }

  // Forget what has fallen out of the search window, so the file stays small.
  const cutoff = Date.now() - (LOOKBACK_DAYS + 10) * 86400_000;
  for (const [id, at] of Object.entries(state.seen)) if (Date.parse(at) < cutoff) delete state.seen[id];

  if (!DRY) {
    writeState('watch', state);
    const summary = `${mail.read} new message(s), ${alerts.length} needing a person` +
      (alerts.length ? `: ${alerts.map((a) => a.title).join('; ')}` : '');
    recordRun('watch', { ok: true, summary });
    if (events.length) log('watch.log', summary);
  }
}

main().catch((e) => {
  console.error('watch failed:', e?.message || e);
  log('watch.log', `ERROR ${e?.message || e}`);
  process.exit(1);
});
