/**
 * Transactional mail: the verification link, and nothing else.
 *
 * Deliberately separate from outreach/send.mjs, which is the wrong transport
 * for this in three specific ways:
 *
 *   It appends the marketing footer — an unsubscribe link and the Article 14
 *   notice. Neither belongs on a mail the recipient asked for thirty seconds
 *   ago, and offering "unsubscribe" on a confirmation link invites someone to
 *   opt out of the thing they are in the middle of doing.
 *
 *   It honours the outreach suppression list. Someone who told us to stop cold
 *   emailing them has every right to open an account afterwards, and refusing
 *   to send their own confirmation link would be an absurd way to enforce an
 *   opt-out.
 *
 *   It reads .env.local from disk. That file is on the founder's laptop, where
 *   the outreach scripts run. This code runs on Vercel, where configuration
 *   arrives as process.env and there is no such file.
 *
 * Suppression still applies in the direction that matters: sending here never
 * adds anyone to a marketing list, and recordLead is not called.
 */

import nodemailer from 'nodemailer';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * process.env first, because that is what production has. The .env.local
 * fallback exists so the same code path can be exercised on the laptop without
 * copying secrets into a second place.
 */
function settings() {
  const env = { ...process.env };
  if (!env.SMTP_HOST) {
    try {
      const f = path.join(process.cwd(), '.env.local');
      if (existsSync(f)) {
        for (const line of readFileSync(f, 'utf8').split('\n')) {
          const i = line.indexOf('=');
          if (i > 0 && !line.trimStart().startsWith('#')) {
            const k = line.slice(0, i).trim();
            if (!env[k]) env[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    } catch { /* production has no such file, and does not need one */ }
  }
  return env;
}

export function mailerReady() {
  const e = settings();
  return Boolean(e.SMTP_HOST && e.SMTP_USER && e.SMTP_PASS);
}

/**
 * Send one transactional message.
 *
 * Throws rather than returning a failure flag. A signup that cannot send its
 * verification link has not half-worked — it has failed, and the caller must
 * not leave a pending account behind pretending otherwise.
 */
export async function sendTransactional({ to, subject, text, html }) {
  const env = settings();
  if (!mailerReady()) throw new Error('SMTP is not configured in this environment');

  const port = Number(env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    // Short: this runs inside a request the person is waiting on. Better to
    // fail and say so than to hold the page open for a minute.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  try {
    const info = await transport.sendMail({
      from: `"${env.SMTP_FROM_NAME || 'Venditas'}" <${env.SMTP_USER}>`,
      to: String(to).trim().toLowerCase(),
      subject,
      text,
      html,
      headers: {
        // Tells mail providers this is a receipt, not a campaign, so it is not
        // filtered with the marketing mail — and stops well-behaved auto-
        // responders from replying to it.
        'Auto-Submitted': 'auto-generated',
        'X-Auto-Response-Suppress': 'All',
      },
    });
    return { messageId: info.messageId };
  } finally {
    transport.close();
  }
}
