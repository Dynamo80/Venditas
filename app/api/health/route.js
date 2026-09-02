/**
 * Deployment diagnostics.
 *
 * Reports whether things are configured and whether the document libraries
 * actually load in this runtime — never a secret, not even a fragment of one.
 * `hasGeminiKey` is a boolean because the only useful question is "is it set",
 * and any answer richer than yes/no is a liability on a public endpoint.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {};

  checks.hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  checks.hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

  // Whether the metering tables and the counter function actually exist. The
  // env vars being present says nothing about whether the SQL has been run.
  if (checks.hasSupabase) {
    try {
      const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/bump_usage`, {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_key: 'healthcheck', p_kind: 'ip' }),
      });
      checks.meteringReady = res.ok;
      if (!res.ok) checks.meteringError = (await res.text()).slice(0, 160);
    } catch (e) {
      checks.meteringReady = false;
      checks.meteringError = String(e?.message || e).slice(0, 160);
    }
  } else {
    checks.meteringReady = false;
  }
  checks.node = process.version;
  checks.region = process.env.VERCEL_REGION || 'local';

  // pdfjs, which unpdf wraps, is the most likely thing to behave differently
  // under a serverless runtime than it does on a laptop.
  try {
    const { extractText, getDocumentProxy } = await import('unpdf');
    checks.unpdfLoads = typeof extractText === 'function' && typeof getDocumentProxy === 'function';
  } catch (e) {
    checks.unpdfLoads = false;
    checks.unpdfError = String(e?.message || e).slice(0, 200);
  }

  try {
    const mammoth = (await import('mammoth')).default;
    checks.mammothLoads = typeof mammoth.extractRawText === 'function';
  } catch (e) {
    checks.mammothLoads = false;
    checks.mammothError = String(e?.message || e).slice(0, 200);
  }

  try {
    const { Packer, Document } = await import('docx');
    checks.docxLoads = Boolean(Packer && Document);
  } catch (e) {
    checks.docxLoads = false;
    checks.docxError = String(e?.message || e).slice(0, 200);
  }

  const ok = checks.hasGeminiKey && checks.unpdfLoads && checks.mammothLoads && checks.docxLoads;

  return Response.json({ ok, ...checks }, {
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
