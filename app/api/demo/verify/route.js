import { completeSignup, makeSession, sessionCookie, accountsEnabled } from '../../../../lib/demo-account.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The clicked link.
 *
 * A GET that changes state, which is normally a mistake — but a mail client
 * cannot POST, and the token is single-use and expiring, so the thing a
 * prefetching scanner can do by following it is spend a link that only its
 * owner received. That is the accepted cost of every magic link ever shipped.
 *
 * Redirects rather than rendering, so the token stops being in the address bar
 * the moment it has been used and cannot be shoulder-read, bookmarked, or sent
 * to us in a referrer.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');

  // Built by hand rather than with Response.redirect(), whose headers are
  // immutable by spec — the success case has to attach a Set-Cookie.
  const to = (path, cookie) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: new URL(path, url.origin).toString(),
        'Cache-Control': 'no-store',
        ...(cookie ? { 'Set-Cookie': cookie } : {}),
      },
    });

  if (!accountsEnabled) return to('/demo?state=not-configured');
  if (!token) return to('/demo?state=missing');

  let account;
  try {
    account = await completeSignup(token);
  } catch (e) {
    console.error('verification failed:', e?.message || 'unknown');
    return to('/demo?state=error');
  }

  // Wrong, already used, or past its expiry — all the same answer, because
  // telling them which is the difference between "your link expired" and a way
  // to probe for live tokens.
  if (!account) return to('/demo?state=expired');

  return to('/demo?state=verified', sessionCookie(makeSession(account.email)));
}
