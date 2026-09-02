import { SUPABASE_URL, supabaseKey } from '../../../../lib/config.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily retention purge, called by Vercel Cron.
 *
 * Guarded so it can't be triggered by anyone who guesses the path. On Vercel
 * the platform sends CRON_SECRET as a bearer token; locally, the same secret
 * works, and with no secret configured the endpoint refuses rather than
 * defaulting open.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!SUPABASE_URL || !supabaseKey.value) {
    return Response.json({ error: 'storage not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/purge_old_data`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey.value,
        Authorization: `Bearer ${supabaseKey.value}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      console.error('purge failed:', res.status, detail);
      return Response.json({ error: 'purge failed', status: res.status }, { status: 500 });
    }
    const rows = await res.json();
    const result = Array.isArray(rows) ? rows[0] : rows;
    console.log('purge ok:', JSON.stringify(result));
    return Response.json({ ok: true, ...result });
  } catch (e) {
    console.error('purge threw:', e?.message || 'unknown');
    return Response.json({ error: 'purge failed' }, { status: 500 });
  }
}
