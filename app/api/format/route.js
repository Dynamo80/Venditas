import { extract, MAX_UPLOAD_BYTES } from '../../../lib/extract.mjs';
import { render, redactionLeaks, makeReference } from '../../../lib/render.mjs';
import { check, recordLead, FREE_TOTAL, FREE_PER_DAY } from '../../../lib/meter.mjs';
import mammoth from 'mammoth';

// Extraction takes ten seconds or so, most of it waiting on the model.
export const maxDuration = 60;
export const runtime = 'nodejs';

const bad = (message, status = 400) =>
  Response.json({ error: message }, { status });

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return bad('Could not read the upload.');
  }

  const file = form.get('cv');
  if (!file || typeof file === 'string') return bad('No CV file was attached.');
  if (file.size === 0) return bad('That file is empty.');
  if (file.size > MAX_UPLOAD_BYTES) {
    return bad(`That file is ${(file.size / 1048576).toFixed(1)}MB. The limit is 10MB.`);
  }

  const brand = {
    name: (form.get('agency') || '').toString().trim() || 'Candidate Profile',
    colour: (form.get('colour') || '1F4E5F').toString().trim(),
    contact: (form.get('contact') || '').toString().trim() || null,
    footer: (form.get('agency') || '').toString().trim() || null,
    // Redaction is opt-out, and only an explicit "no" turns it off.
    redact: form.get('redact') !== 'off',
  };

  const email = (form.get('email') || '').toString().trim().toLowerCase();
  if (!email) return bad('Enter your work email to run a CV.', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return bad("That email doesn't look right — mind checking it?", 400);
  }

  // Metered before anything expensive happens. Extraction spends a finite
  // quota, so the decision to spend it has to come first.
  const verdict = await check(request, email);
  if (!verdict.allow) {
    const messages = {
      disposable: 'Please use your work email — throwaway addresses are blocked.',
      'daily-cap': `That's ${FREE_PER_DAY} today. Come back tomorrow, or get in touch and we'll lift it.`,
      'trial-used': `You've used all ${FREE_TOTAL} of your trial CVs - which means it's working. Email founder@venditas.in and we'll get you set up properly.`,
      'ip-cap': "You've hit today's limit from this connection. It resets tomorrow.",
      'need-email': 'Enter your work email to run a CV.',
    };
    return Response.json(
      { error: messages[verdict.reason] || 'Limit reached.', reason: verdict.reason },
      { status: verdict.reason === 'disposable' ? 400 : 429 }
    );
  }

  const logo = form.get('logo');
  if (logo && typeof logo !== 'string' && logo.size > 0 && logo.size < 2 * 1024 * 1024) {
    const type = (logo.type || '').includes('jpeg') ? 'jpg' : 'png';
    brand.logo = Buffer.from(await logo.arrayBuffer());
    brand.logoType = type;
  }

  let data;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    data = await extract(buffer, file.name);
  } catch (e) {
    // Only errors explicitly marked user-facing are shown. Anything else is a
    // fault on our side: log it in full, tell them something true and useful,
    // and never hand a stranger the name of an environment variable.
    if (e?.userFacing) return bad(e.message, 422);
    console.error('extraction failed:', e?.message || 'unknown');
    return bad("We couldn't process that CV. This one is on us — try again shortly.", 500);
  }

  if (!data.name && !data.experience?.length) {
    return bad(
      "That didn't look like a CV — no name and no work history came back. If it is one, it may be an image-only scan we couldn't read.",
      422
    );
  }

  const reference = makeReference(data.name);

  let docx;
  try {
    docx = await render(data, brand, { reference });
  } catch (e) {
    console.error('render failed:', e?.message || 'unknown');
    return bad('Formatting failed after the CV was read. Nothing was saved.', 500);
  }

  // Redaction is the commercial promise of this product, so it is verified on
  // the finished document rather than assumed from the code path. A leak fails
  // the request outright — shipping a CV with the candidate's email in it is
  // worse for the agency than shipping nothing.
  if (brand.redact) {
    try {
      const { value: docText } = await mammoth.extractRawText({ buffer: docx });
      const leaks = redactionLeaks(docText, data);
      if (leaks.length) {
        console.error('redaction leak', leaks);
        return bad(
          `Blocked: the candidate's ${leaks.join(' and ')} would still have been visible. Nothing was returned.`,
          500
        );
      }
    } catch (e) {
      console.error('redaction check failed:', e?.message || 'unknown');
      return bad('Could not verify redaction, so nothing was returned.', 500);
    }
  }

  // Recorded only once the document exists. Capturing an address off a request
  // that then failed would put someone on the list who never got anything.
  await recordLead(email, brand.name);

  const safeName = (brand.redact ? reference : data.name || reference)
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .slice(0, 60);

  return new Response(docx, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}.docx"`,
      'Content-Length': String(docx.length),
      'X-Candidate-Ref': reference,
      'Cache-Control': 'no-store',
    },
  });
}
