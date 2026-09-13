import { lookup } from 'node:dns/promises';
import { readPrefill } from '../../../lib/prefill.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The branding behind a personal link from our email (lib/prefill.mjs): the
 * agency's name, its colour, and its logo as a data URL the form can use.
 *
 * The logo address came inside a link we signed, and it is still treated as an
 * address a stranger chose: HTTPS only, a host that resolves to public addresses
 * only, no redirects, PNG or JPEG only, a megabyte at most, five seconds at most.
 * If any of that fails, the form still gets the name and colour.
 */

const PRIVATE = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^::$/, /^::1$/, /^f[cd]/i, /^fe[89ab]/i,
  /^::ffff:(0|10|127|169\.254|192\.168|172\.(1[6-9]|2\d|3[01]))\./i,
];
const MAX_LOGO_BYTES = 1024 * 1024;

async function isPublicHost(hostname) {
  try {
    const addresses = await lookup(hostname, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !PRIVATE.some((re) => re.test(address)));
  } catch {
    return false;
  }
}

async function logoAsDataUrl(address) {
  try {
    const url = new URL(address);
    if (url.protocol !== 'https:' || !(await isPublicHost(url.hostname))) return null;
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
      headers: { 'user-agent': 'Venditas/1.0 (+https://www.venditas.in/about)' },
    });
    if (res.status !== 200) return null;
    const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (type !== 'image/png' && type !== 'image/jpeg') return null;
    if (Number(res.headers.get('content-length') || 0) > MAX_LOGO_BYTES) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_LOGO_BYTES) return null;
    return `data:${type};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const fields = readPrefill(new URL(request.url).searchParams.get('for'));
  if (!fields) {
    return Response.json({ error: 'That link has been changed or is not ours.' }, { status: 400 });
  }
  const logo = fields.logo ? await logoAsDataUrl(fields.logo) : null;
  return Response.json(
    { agency: fields.agency, colour: fields.colour, logo },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
