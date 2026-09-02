/**
 * Outreach sender.
 *
 * Deliberately conservative. The domain is the asset here — burn its reputation
 * and no amount of good copy recovers it — so every safeguard defaults to the
 * cautious setting and has to be argued out of, not into.
 *
 *   node outreach/send.mjs --dry            render everything, send nothing
 *   node outreach/send.mjs --to me          one message to ourselves, live
 *   node outreach/send.mjs --batch          the day's real batch
 *
 * A real batch will not run without --confirm, because a typo in a filename
 * should never be one keystroke away from mailing strangers.
 */

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { unsubUrl as signedUnsubUrl, tokenFor } from '../lib/unsub.mjs';
import { Imap, pickFolder } from './imap.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

// ---------------------------------------------------------------- settings
export const DAILY_CAP = 25;

/**
 * Legally required on commercial email to US and UK recipients, and separately
 * required by anyone who wants their mail delivered: a real identity, a real
 * postal address, and a working way out.
 */
export const SENDER = {
  // The human who signs the emails. Must match the LinkedIn profile the
  // recipient will find; a mismatch reads as a fabricated persona, which is
  // precisely what a recruiter is trained to notice.
  person: 'Abin',
  fullName: 'Abin Johnson',

  postal: 'Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India',
  company: 'Venditas',
  site: 'https://venditas.in',
};

const SUPPRESSION = path.join(ROOT, 'outreach', 'suppressed.txt');
const SENT_LOG = path.join(ROOT, 'outreach', 'sent.log');

// -------------------------------------------------------------------- env
function loadEnv() {
  const file = path.join(ROOT, '.env.local');
  if (!existsSync(file)) throw new Error('.env.local not found');
  const env = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trimStart().startsWith('#')) {
      env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return env;
}

// ------------------------------------------------------------- suppression
/**
 * Anyone who has opted out, bounced, or asked us to stop. Checked before every
 * single send. Nobody is ever removed from this file.
 */
export function suppressed() {
  if (!existsSync(SUPPRESSION)) return new Set();
  return new Set(
    readFileSync(SUPPRESSION, 'utf8')
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith('#'))
  );
}

export function suppress(email, reason = 'manual') {
  mkdirSync(path.dirname(SUPPRESSION), { recursive: true });
  appendFileSync(SUPPRESSION, `${email.toLowerCase()}  # ${reason} ${new Date().toISOString()}\n`);
}

function alreadySent(email) {
  if (!existsSync(SENT_LOG)) return false;
  return readFileSync(SENT_LOG, 'utf8').toLowerCase().includes(email.toLowerCase());
}

function logSent(email, subject, messageId) {
  mkdirSync(path.dirname(SENT_LOG), { recursive: true });
  appendFileSync(SENT_LOG, `${new Date().toISOString()}\t${email}\t${subject}\t${messageId}\n`);
}

// ----------------------------------------------------------------- footer
export function footerText(unsubUrl) {
  return [
    '',
    '—',
    `${SENDER.company} · ${SENDER.postal}`,
    `Not interested? ${unsubUrl} — one click, and I won't contact you again.`,
  ].join('\n');
}

export function footerHtml(unsubUrl) {
  return `<hr style="border:none;border-top:1px solid #dfe3e9;margin:22px 0 12px">
<p style="font:12px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#78838f;margin:0">
${SENDER.company} · ${SENDER.postal}<br>
Not interested? <a href="${unsubUrl}" style="color:#78838f">Unsubscribe</a> — one click, and I won't contact you again.
</p>`;
}

// --------------------------------------------------------------- transport
/**
 * One pool for the whole run, created lazily.
 *
 * A pool per message would be worse than no pool: it opens a fresh connection
 * every time, so the rate limiting below never applies across messages, and
 * nothing ever closes — the process hangs at exit holding open sockets.
 */
let _transport = null;

export function transport(env = loadEnv()) {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 465),
    // Implicit TLS. GoDaddy advertises AUTH before STARTTLS on 587, so a client
    // that authenticated before upgrading would leak the password; 465 is
    // encrypted from the first byte and that hazard cannot arise.
    secure: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    pool: true,
    maxConnections: 1,
    maxMessages: DAILY_CAP,
    // One message every ~20s. Slow is the point: a burst from a domain with no
    // sending history is the single clearest spam signal there is.
    rateDelta: 20_000,
    rateLimit: 1,
  });
  return _transport;
}

/**
 * Compose the message without sending, so we hold the exact bytes.
 *
 * Needed because the copy filed in Sent must be byte-identical to the copy that
 * went out. Rebuilding it separately would let the two drift, and a Sent folder
 * showing something subtly different from what the recipient received is worse
 * than no Sent folder at all.
 */
let _composer = null;
function composer() {
  if (!_composer) _composer = nodemailer.createTransport({ streamTransport: true, buffer: true });
  return _composer;
}

/**
 * File a copy in the Sent folder over IMAP.
 *
 * Sending is SMTP; Sent is IMAP. A mail client writes this copy itself after
 * sending, and a script talking SMTP never does — which is why twenty-five
 * emails went out and the founder's Sent folder stayed empty, leaving him no
 * way to tell whether anything had happened.
 *
 * Best effort on purpose. Failing to file a copy must never fail a send that
 * has already reached the recipient.
 */
async function fileInSent(raw, env) {
  const host = (env.IMAP_HOST || env.SMTP_HOST || '').replace(/^smtpout\./, 'imap.');
  if (!host || !env.SMTP_USER || !env.SMTP_PASS) return false;
  const im = new Imap({ host, port: Number(env.IMAP_PORT || 993), user: env.SMTP_USER, pass: env.SMTP_PASS });
  try {
    await im.connect();
    await im.login();
    const folder = pickFolder(await im.listFolders(), ['Sent', 'Sent Items', 'INBOX.Sent']);
    if (!folder) return false;
    await im.append(folder, raw);
    return true;
  } catch (e) {
    console.error('  (could not file a copy in Sent:', e.message + ')');
    return false;
  } finally {
    await im.logout();
  }
}

/** Must be called when a run finishes, or the pool holds the process open. */
export function closeTransport() {
  if (_transport) {
    _transport.close();
    _transport = null;
  }
}

/**
 * @param {object} msg  { to, subject, text, html, attachments, unsubUrl }
 */
export async function send(msg, { env = loadEnv(), dry = false } = {}) {
  const to = msg.to.trim().toLowerCase();

  if (suppressed().has(to)) {
    return { skipped: 'suppressed', to };
  }
  if (!msg.allowRepeat && alreadySent(to)) {
    return { skipped: 'already-contacted', to };
  }

  // Signed, so nobody can iterate addresses and quietly unsubscribe a list
  // they don't own.
  const unsubUrl = msg.unsubUrl || signedUnsubUrl(to, SENDER.site);
  const oneClick = `${SENDER.site}/api/unsubscribe?e=${encodeURIComponent(to)}&t=${tokenFor(to)}`;

  const mail = {
    from: `"${msg.fromName || env.SMTP_FROM_NAME || SENDER.company}" <${env.SMTP_USER}>`,
    to,
    subject: msg.subject,
    text: msg.text + footerText(unsubUrl),
    html: msg.html ? msg.html + footerHtml(unsubUrl) : undefined,
    attachments: msg.attachments || [],
    headers: {
      // Lets a recipient opt out from their mail client without replying, which
      // mail providers treat as a strong positive signal.
      // The https URL is what a mail client POSTs to for one-click; the mailto
      // is the fallback for clients that don't implement RFC 8058.
      'List-Unsubscribe': `<${oneClick}>, <mailto:${env.SMTP_USER}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };

  if (dry) {
    return { dry: true, to, subject: mail.subject, bytes: (mail.text || '').length,
             attachments: (mail.attachments || []).map((a) => a.filename) };
  }

  // Compose once, then send those exact bytes and file those exact bytes.
  const built = await composer().sendMail(mail);
  const raw = built.message.toString();

  const info = await transport(env).sendMail({
    envelope: { from: env.SMTP_USER, to: [to] },
    raw,
  });

  logSent(to, mail.subject, info.messageId || built.messageId);
  const filed = await fileInSent(raw, env);

  return { sent: true, to, messageId: info.messageId || built.messageId, response: info.response, filedInSent: filed };
}
