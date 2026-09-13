/**
 * Send one partner email from outreach/partners.md, word for word.
 *
 *   node outreach/partner-send.mjs --only rec                   show exactly what would go
 *   node outreach/partner-send.mjs --only rec --send --confirm  send it
 *
 * WHY THIS AND NOT send.mjs
 *
 * A partner email is a one-to-one enquiry to a business partnerships inbox, not
 * cold outreach (outreach/partners.md). So it goes without the unsubscribe
 * footer, it takes no share of the 25-a-day cap, and it is not written to
 * sent.log, where it would read as a prospect contacted. A copy is still filed
 * in Sent so the founder can see it went, and ops/watch.mjs flags the reply.
 *
 * GUARDS
 *
 * - The section must name a To address. Forms are not emailed.
 * - Two flags to send, as everywhere else that mails anyone.
 * - UK working hours only (contacted.mjs), so it lands when someone reads it.
 * - Once per address, ever: outreach/partners.log is checked first.
 * - Check the address is still published on the partner's own site on the day
 *   (partners.md). This script trusts the file for that.
 */

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { Imap, pickFolder } from './imap.mjs';
import { isSendableNow } from './contacted.mjs';
import { SENDER } from './send.mjs';
import { notify } from '../ops/automation.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const DRAFTS = path.join(ROOT, 'outreach', 'partners.md');
const LOG = path.join(ROOT, 'outreach', 'partners.log');

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const LIVE = argv.includes('--send') && argv.includes('--confirm');
const ONLY = (opt('only') || '').toLowerCase();

function env() {
  const out = {};
  for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trimStart().startsWith('#')) out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

/**
 * The markdown wraps its quotes at about 80 characters. Sent as they are, the
 * lines break mid-sentence on a phone. A line joins the one before it when that
 * one was a full wrapped line; short lines (the greeting, the sign-off) stay put.
 */
function unwrap(lines) {
  const out = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (line.trim() && prev && prev.length >= 60) out[out.length - 1] = `${prev} ${line.trim()}`;
    else out.push(line.trim());
  }
  return out.join('\n');
}

/** Each "## " section that names a To address and a Subject, with its quoted body. */
function sections() {
  const text = readFileSync(DRAFTS, 'utf8').replace(/\r/g, '');
  return text.split(/^## /m).slice(1).map((block) => {
    const title = block.split('\n')[0].trim();
    const to = (/\*\*To:\*\*\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(block) || [])[1] || '';
    const subject = (/\*\*Subject:\*\*\s*(.+)/.exec(block) || [])[1]?.trim() || '';
    const quote = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('>')) quote.push(line.replace(/^>\s?/, ''));
      else if (quote.length) break;
    }
    return { title, key: title.split(/[\s—–-]/)[0].toLowerCase(), to, subject, body: unwrap(quote).trim() };
  }).filter((s) => s.to && s.subject && s.body);
}

function alreadySent(to) {
  return existsSync(LOG) && readFileSync(LOG, 'utf8').toLowerCase().includes(`\t${to.toLowerCase()}\t`);
}

async function fileInSent(raw, e) {
  const host = (e.IMAP_HOST || e.SMTP_HOST || '').replace(/^(?:smtpout|smtp)\./, 'imap.');
  const im = new Imap({ host, port: Number(e.IMAP_PORT || 993), user: e.SMTP_USER, pass: e.SMTP_PASS });
  try {
    await im.connect();
    await im.login();
    const folder = pickFolder(await im.listFolders(), ['Sent', 'Sent Items', 'INBOX.Sent']);
    if (folder) await im.append(folder, raw);
    return Boolean(folder);
  } catch {
    return false;
  } finally {
    await im.logout();
  }
}

async function main() {
  const all = sections();
  const chosen = all.filter((s) => s.key === ONLY);
  if (!ONLY || !chosen.length) {
    console.log(`Choose one with --only. Sections with an address: ${all.map((s) => `${s.key} (${s.to})`).join(', ') || 'none'}`);
    process.exit(1);
  }
  const s = chosen[0];
  const e = env();
  const mail = { from: `"${SENDER.fullName}" <${e.SMTP_USER}>`, to: s.to, subject: s.subject, text: s.body };

  console.log(`\n${LIVE ? 'SENDING' : 'DRY RUN'} · ${s.title}`);
  console.log(`  from     ${mail.from}\n  to       ${mail.to}\n  subject  ${mail.subject}\n\n${mail.text}\n`);
  if (alreadySent(s.to)) { console.log(`  already sent to ${s.to} (outreach/partners.log). Nothing sent.`); return; }
  if (!LIVE) { console.log('  Nothing sent. Add --send --confirm.'); return; }

  const when = isSendableNow();
  if (!when.ok) {
    console.log(`  not a sending window: ${when.why}. Nothing sent.`);
    await notify({ title: `Partner email not sent: ${s.key.toUpperCase()}`, body: `Outside UK working hours (${when.why}). Run node outreach/partner-send.mjs --only ${s.key} --send --confirm on a weekday morning.` });
    process.exitCode = 1;
    return;
  }

  const built = await nodemailer.createTransport({ streamTransport: true, buffer: true }).sendMail(mail);
  const raw = built.message.toString();
  const t = nodemailer.createTransport({ host: e.SMTP_HOST, port: Number(e.SMTP_PORT || 465), secure: true, auth: { user: e.SMTP_USER, pass: e.SMTP_PASS } });
  try {
    const info = await t.sendMail({ envelope: { from: e.SMTP_USER, to: [s.to] }, raw });
    appendFileSync(LOG, `${new Date().toISOString()}\t${s.to}\t${s.subject}\t${info.messageId || built.messageId}\n`);
    const filed = await fileInSent(raw, e);
    console.log(`  sent ${info.messageId || ''} · copy in Sent: ${filed ? 'yes' : 'no'}`);
    await notify({ title: `Partner email sent: ${s.key.toUpperCase()}`, body: `To ${s.to}, "${s.subject}". A reply will be flagged like any other.` });
  } finally {
    t.close();
  }
}

main().catch((err) => {
  console.error('partner send failed:', err?.message || err);
  process.exit(1);
});
