import { checkEmail } from '../../../../lib/email-policy.mjs';
import { startSignup, verifyUrl, accountsEnabled, LINK_TTL_MINUTES } from '../../../../lib/demo-account.mjs';
import { sendTransactional, mailerReady } from '../../../../lib/mailer.mjs';
import { guard, ipKey, clientIp } from '../../../../lib/meter.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// A DNS lookup and an SMTP handshake; neither is fast, both have short timeouts.
export const maxDuration = 30;

const SITE = 'https://venditas.in';

const bad = (message, reason, status = 400, extra = {}) =>
  Response.json({ error: message, reason, ...extra }, { status });

export async function POST(request) {
  // Same in-memory backstop the format endpoint uses. Signup is cheaper to
  // abuse than a CV run — it sends mail on demand — so it gets the same gate
  // before anything else happens.
  if (!guard(request).allow) {
    return bad("Too many attempts from this connection. Try again later.", 'rate-limited', 429);
  }

  if (!accountsEnabled) {
    return bad('Accounts are not configured on this deployment.', 'not-configured', 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Could not read that form.', 'bad-request');
  }

  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim().slice(0, 80);
  const agency = String(body.agency || '').trim().slice(0, 80);

  if (!name) return bad('Please give us your name.', 'no-name');
  if (!agency) return bad('Please tell us which agency you are with.', 'no-agency');

  // The strict part. Nine layers, in lib/email-policy.mjs — throwaway domains,
  // masked and forwarded addresses, consumer mailboxes, shared mailboxes, and
  // whether the domain can receive mail at all.
  const verdict = await checkEmail(email);
  if (!verdict.ok) {
    // The reason is returned so the page can offer the right way forward: a
    // consumer address is appealable, a typo is not.
    return bad(verdict.message, verdict.reason, 400, { appealable: Boolean(verdict.appealable) });
  }

  // Checked before a row is written. A pending account with no link in anyone's
  // inbox is a dead end that looks like success.
  if (!mailerReady()) {
    console.error('demo signup: SMTP not configured in this environment');
    return bad(
      "We couldn't send the confirmation email just now. Reply to your demo invitation and we'll set you up by hand.",
      'mail-unavailable',
      503
    );
  }

  let token;
  try {
    token = await startSignup({
      email: verdict.canonical,
      name,
      agency,
      ipKey: ipKey(clientIp(request)),
    });
  } catch (e) {
    console.error('demo signup failed:', e?.message || 'unknown');
    return bad('Something went wrong setting up the account. Nothing was saved.', 'server', 500);
  }

  const link = verifyUrl(token, SITE);
  try {
    await sendTransactional({
      to: verdict.canonical,
      subject: 'Confirm your Venditas account',
      text: [
        `Hi ${name.split(' ')[0]},`,
        '',
        'Confirm your email and your account is ready:',
        link,
        '',
        `The link works for ${LINK_TTL_MINUTES} minutes and once only.`,
        '',
        "If you didn't ask for this, ignore it — nothing happens until the link is clicked.",
        '',
        'Abin',
        'Venditas · venditas.in',
      ].join('\n'),
      html: `<p>Hi ${name.split(' ')[0]},</p>
<p>Confirm your email and your account is ready:</p>
<p><a href="${link}">Confirm my account</a></p>
<p style="color:#78838f;font-size:13px">The link works for ${LINK_TTL_MINUTES} minutes and once only.
If you didn't ask for this, ignore it — nothing happens until the link is clicked.</p>
<p>Abin<br>Venditas · venditas.in</p>`,
    });
  } catch (e) {
    // The row exists but the link never left. Say so plainly rather than
    // showing "check your inbox" for a mail that is not coming.
    console.error('verification email failed:', e?.message || 'unknown');
    return bad(
      "We couldn't send the confirmation email. Reply to your demo invitation and we'll set you up by hand.",
      'mail-failed',
      502
    );
  }

  return Response.json(
    { ok: true, sentTo: verdict.canonical, expiresInMinutes: LINK_TTL_MINUTES },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
