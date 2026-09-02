import { tokenValid } from '../../../lib/unsub.mjs';
import { removeContact } from '../../../lib/meter.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * RFC 8058 one-click unsubscribe. Mail clients POST here directly from the
 * List-Unsubscribe header, with no human ever seeing a page. Gmail and Outlook
 * treat a working one-click as a strong positive signal, and its absence as the
 * opposite — so this endpoint is worth as much for deliverability as it is for
 * the law.
 */
async function handle(request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get('e') || '').trim().toLowerCase();
  const token = url.searchParams.get('t') || '';

  if (!email || !tokenValid(email, token)) {
    return new Response('Invalid unsubscribe link', { status: 400 });
  }

  const ok = await removeContact(email, 'one-click unsubscribe');
  // A 200 either way: the mail client is not the right place to surface our
  // storage problems, and a non-200 makes some clients hide the button for good.
  if (!ok) console.error('one-click unsubscribe could not be recorded:', email);
  return new Response('Unsubscribed', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export const POST = handle;
export const GET = handle;
