/**
 * Email capture. Deliberately minimal: an address and nothing else, because
 * every extra field on a signup form costs conversions and we can ask which
 * providers they care about after they've said yes to something.
 *
 * Uses the service role because `subscribers` has no anon policy — the whole
 * point of that table is that the public cannot read it.
 */

const URL_BASE = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function back(request, params) {
  const url = new URL('/', request.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return Response.redirect(url, 303);
}

export async function POST(request) {
  let email;
  try {
    const form = await request.formData();
    email = String(form.get('email') || '').trim().toLowerCase();
  } catch {
    return back(request, { subscribed: 'error' });
  }

  if (!EMAIL.test(email) || email.length > 254) {
    return back(request, { subscribed: 'invalid' });
  }

  if (!URL_BASE || !SERVICE_KEY) {
    console.error('subscribe: storage not configured');
    return back(request, { subscribed: 'error' });
  }

  try {
    const res = await fetch(`${URL_BASE}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        // A repeat signup is a person, not an error. Swallow the conflict and
        // tell them the same thing we tell a first-timer.
        Prefer: 'return=minimal,resolution=ignore-duplicates',
      },
      body: JSON.stringify([{ email }]),
    });

    if (!res.ok && res.status !== 409) {
      console.error('subscribe failed', res.status, (await res.text()).slice(0, 300));
      return back(request, { subscribed: 'error' });
    }
  } catch (e) {
    console.error('subscribe threw', e.message);
    return back(request, { subscribed: 'error' });
  }

  return back(request, { subscribed: 'ok' });
}
