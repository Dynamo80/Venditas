/**
 * What the scheduled jobs share: reading .env.local, telling the founder
 * something, and leaving a record of each run for ops/status.mjs to read.
 *
 * WHY NOTIFY EXISTS
 *
 * Decision 010 found that the costly part of the 4–8 September outage was not
 * the outage. It was that nothing said so. Everything here now runs without a
 * person starting it, and a job nobody starts is a job nobody watches, so each
 * one says out loud when something needs a person:
 *
 *   - a Windows notification on this laptop, always;
 *   - an email to ALERT_EMAIL, when .env.local sets it. That is the route that
 *     reaches a phone, and a reply at 16:00 UK is 20:30 in Navi Mumbai.
 *
 * Both run from this machine through what it already has: Windows, and the
 * venditas.in mailbox. A push service would be less code, and it would put the
 * name of every agency that replies on somebody else's server.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

export const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..'
);

/** Job state and run records. Gitignored: it names agencies and addresses. */
export const CACHE = path.join(ROOT, 'ops', '.cache');

export function loadEnv() {
  const f = path.join(ROOT, '.env.local');
  if (!existsSync(f)) return {};
  const out = {};
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trimStart().startsWith('#')) {
      out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

// ------------------------------------------------------------------ state

export function readState(name, fallback) {
  try {
    return JSON.parse(readFileSync(path.join(CACHE, `${name}.json`), 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeState(name, value) {
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(path.join(CACHE, `${name}.json`), JSON.stringify(value, null, 2));
}

/** One file per job, so two jobs finishing at once cannot overwrite each other. */
export function recordRun(job, result) {
  writeState(`run-${job}`, { at: new Date().toISOString(), ...result });
}

export function lastRun(job) {
  return readState(`run-${job}`, null);
}

export function log(file, line) {
  try {
    appendFileSync(path.join(ROOT, 'ops', file), `${new Date().toISOString()}\t${line}\n`);
  } catch {
    // A log that cannot be written must not stop the job it describes.
  }
}

// ----------------------------------------------------------------- notify

/**
 * The text arrives through environment variables, never inside the script.
 * A subject line is written by a stranger, and a stranger's words spliced into
 * a PowerShell command are a command.
 */
const TOAST = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$text = $xml.GetElementsByTagName('text')
$text.Item(0).AppendChild($xml.CreateTextNode($env:VENDITAS_TITLE)) | Out-Null
$text.Item(1).AppendChild($xml.CreateTextNode($env:VENDITAS_BODY)) | Out-Null
$app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe'
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show([Windows.UI.Notifications.ToastNotification]::new($xml))
`;

function toast(title, body) {
  if (process.platform !== 'win32') return false;
  const res = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(TOAST, 'utf16le').toString('base64')],
    {
      env: { ...process.env, VENDITAS_TITLE: title.slice(0, 120), VENDITAS_BODY: body.slice(0, 400) },
      encoding: 'utf8',
      timeout: 30_000,
      windowsHide: true,
    }
  );
  return res.status === 0;
}

/**
 * Straight to the founder, outside send.mjs on purpose: this is not outreach,
 * so it takes no share of the 25-a-day cap, gets no unsubscribe footer, and is
 * not written to sent.log, where it would read as a prospect contacted.
 */
async function email(env, title, body) {
  if (!env.ALERT_EMAIL || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return false;
  const t = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 465),
    secure: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  try {
    await t.sendMail({
      from: `"Venditas automation" <${env.SMTP_USER}>`,
      to: env.ALERT_EMAIL,
      subject: `[Venditas] ${title}`,
      text: `${body}\n\n— from the scheduled jobs on the founder's laptop (ops/automation.mjs)`,
    });
    return true;
  } catch {
    return false;
  } finally {
    t.close();
  }
}

export async function notify({ title, body, env = loadEnv() }) {
  const shown = toast(title, body);
  const mailed = await email(env, title, body);
  log('notify.log', `${title} — ${body.replace(/\s+/g, ' ')}  [toast ${shown ? 'yes' : 'no'}, email ${mailed ? 'yes' : 'no'}]`);
  return { shown, mailed };
}
