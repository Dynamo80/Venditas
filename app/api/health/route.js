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
