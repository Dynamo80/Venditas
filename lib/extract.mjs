/**
 * CV -> structured fields.
 *
 * Two stages, deliberately separated:
 *
 *   1. Get text off the document. Deterministic, free, no model involved.
 *   2. Turn that text into typed fields, constrained by a response schema so
 *      the result is an object rather than prose we have to parse and hope
 *      about.
 *
 * The prompt and schema below are ported verbatim from the Python reference in
 * reference/extract.py, which was validated against a deliberately awful
 * two-column CV: split email addresses, three date formats, a sidebar, and page
 * furniture. Change them and re-run that test.
 *
 * The model is told repeatedly not to invent. A missing phone number must come
 * back null — an invented one is worse than a blank, because a recruiter will
 * forward it to a client as fact.
 */

import { deidentify, reattach } from './deidentify.mjs';

const MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Below this much text, a PDF is a scan rather than a document with a text layer. */
const TEXT_LAYER_MIN_CHARS = 250;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * An error whose message is safe, and useful, to show the person who uploaded
 * the file. Everything else is our problem, not theirs, and must not reach them
 * — a stranger seeing "GEMINI_API_KEY is not set" learns about our
 * infrastructure and still has no idea what to do about it.
 */
export class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserError';
    this.userFacing = true;
  }
}

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', nullable: true },
    headline: { type: 'string', nullable: true },
    location: { type: 'string', nullable: true },
    email: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    links: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string', nullable: true },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          employer: { type: 'string', nullable: true },
          title: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          start: { type: 'string', nullable: true },
          end: { type: 'string', nullable: true },
          current: { type: 'boolean' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['employer', 'title', 'start', 'end', 'current', 'bullets'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string', nullable: true },
          qualification: { type: 'string', nullable: true },
          start: { type: 'string', nullable: true },
          end: { type: 'string', nullable: true },
          detail: { type: 'string', nullable: true },
        },
        required: ['institution', 'qualification', 'start', 'end'],
      },
    },
    skills: { type: 'array', items: { type: 'string' } },
    languages: { type: 'array', items: { type: 'string' } },

    // Objects, not strings. "ILS — renewed 02/2026" was arriving as "ILS", and
    // for a clinical CV the currency of a certificate is the entire point of
    // listing it.
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          date: { type: 'string', nullable: true },
          issuer: { type: 'string', nullable: true },
        },
        required: ['name'],
      },
    },

    // Recruiters ask for these on every call. They were being read and thrown
    // away because the schema had nowhere to put them.
    availability: {
      type: 'object',
      nullable: true,
      properties: {
        notice_period: { type: 'string', nullable: true },
        right_to_work: { type: 'string', nullable: true },
        salary_expectation: { type: 'string', nullable: true },
      },
    },

    /**
     * The catch-all, and the most important field here.
     *
     * A fixed schema silently deletes whatever it has no slot for. A commercial
     * solicitor's CV lost all ten of its "Selected matters" — a third of the
     * document, and the part a legal recruiter actually reads — because there
     * was no field named for it. Anything that is not one of the sections above
     * goes here, under its own heading, and reaches the output.
     */
    other_sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
        },
        required: ['heading', 'items'],
      },
    },
  },
  required: ['name', 'experience', 'education', 'skills', 'other_sections'],
};

const INSTRUCTIONS = `You are extracting structured data from a candidate CV for a recruitment agency.

Rules, in order of importance:

1. NEVER invent information. If the CV does not state something, return null for
   that field, or an empty array. A blank field is correct; a plausible guess is
   a serious error, because a recruiter will forward it to a client as fact.

2. Copy wording from the CV. Do not rewrite, improve, summarise or expand
   bullets. Fix only obvious extraction damage: a word split across a line
   break, a hyphen inserted by wrapping, doubled spaces.

3. Text extracted from a PDF often breaks things across lines. Reassemble them.
   An email may arrive as two fragments on separate lines; join them with no
   space. The same applies to URLs.

4. Ignore page furniture: headers, footers, page numbers, "confidential"
   notices, and any text the candidate did not write as CV content.

5. Dates: normalise to YYYY-MM where the month is known, otherwise YYYY. If a
   role is ongoing ("Present", "Current", "to date"), set end to null and
   current to true. Otherwise current is false.

6. Sidebars are content. Skills, languages and contact details often live in a
   separate column and must still be captured.

7. Preserve the order roles appear in, which is normally most recent first.

8. The text has had direct identifiers removed before it reached you. Where you
   see [NAME], [EMAIL], [PHONE] or [LINK], that is deliberate. Return null for
   those fields — do not guess at what was removed, and do not copy the
   placeholder text into a field.

9. LOSE NOTHING. Every section of the CV must appear somewhere in your output.
   If a section does not fit profile, experience, education, skills, languages
   or certifications, put it in other_sections under its own heading, with its
   content as items. Examples that belong there: selected matters or cases,
   publications, audits, clinical governance, projects, patents, awards, board
   positions, technical environments, security clearances, memberships.
   A whole section silently disappearing is the worst thing this can do — a
   solicitor's list of matters IS their CV, and a recruiter forwarding it
   without noticing has sent a client a misleading document.

10. Never invent skills. If the CV has no skills section, derive skills ONLY
    from words that literally appear in it, and if in doubt return an empty
    array. Inferring "P&L management" because someone was a manager puts a
    claim in a candidate's mouth that they never made and a client may test.

11. Strip first person. "I led the migration" becomes "Led the migration".
    Leaving "I" in produces a document that reads half-edited on an agency's
    letterhead. Do not otherwise change the wording.

12. Keep the qualifying detail attached to a certification: its date, renewal
    date and issuing body if stated. "ILS — renewed 02/2026" must not become
    "ILS", because for a clinical CV the currency of the training is the point
    of listing it.

Return only the structured object.`;

// ------------------------------------------------------------------ reading
async function readPdf(buffer) {
  const { extractText, getDocumentProxy, renderPageAsImage } = await import('unpdf');
  const bytes = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });

  if (text.replace(/\s/g, '').length >= TEXT_LAYER_MIN_CHARS) {
    return { text: text.trim(), images: [] };
  }

  // Scanned CV: hand the model pictures of the pages instead.
  const pageCount = Math.min(pdf.numPages, 4);
  const images = [];
  for (let i = 1; i <= pageCount; i++) {
    const png = await renderPageAsImage(bytes, i, { scale: 2 });
    images.push(Buffer.from(png).toString('base64'));
  }
  return { text: '', images };
}

async function readDocx(buffer) {
  const mammoth = (await import('mammoth')).default;
  const { value } = await mammoth.extractRawText({ buffer });
  return { text: (value || '').trim(), images: [] };
}

export async function readDocument(buffer, filename) {
  const ext = (filename.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
  if (ext === '.pdf') return readPdf(buffer);
  if (ext === '.docx') return readDocx(buffer);
  if (ext === '.txt' || ext === '.md') {
    return { text: buffer.toString('utf8').trim(), images: [] };
  }
  // .doc is the legacy binary format and mammoth cannot read it. Saying so is
  // better than returning an empty CV and letting them wonder.
  if (ext === '.doc') {
    throw new UserError('Old .doc files are not supported yet — please re-save as .docx or PDF.');
  }
  throw new UserError(`Unsupported file type: ${ext || 'unknown'}. Use PDF or DOCX.`);
}

// -------------------------------------------------------------------- model
async function callGemini(parts, apiKey, signal) {
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [{ parts }],
      systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: SCHEMA,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    // Deliberately does NOT include the response body. An API error can echo
    // part of the request back, and the request is a candidate's CV — that
    // error message ends up in console.error, which is the one place candidate
    // data could survive a request we promise retains nothing. Status and the
    // provider's own error code are enough to debug with, and carry no content.
    let code = 'unknown';
    try {
      const body = await res.json();
      code = body?.error?.status || body?.error?.code || 'unknown';
    } catch {
      /* a non-JSON error body is not worth risking */
    }
    throw new Error(`gemini ${res.status} (${code})`);
  }
  return res.json();
}

export async function extract(buffer, filename, { apiKey = process.env.GEMINI_API_KEY, retries = 2 } = {}) {
  // Read the document before checking configuration. If someone uploads a .csv
  // we should tell them that, even on a day when our own setup is broken —
  // their problem is fixable by them, ours isn't.
  const { text, images } = await readDocument(buffer, filename);
  if (!text && !images.length) {
    throw new UserError('No readable content found in that file.');
  }

  if (!apiKey) throw new Error('config: GEMINI_API_KEY is not set');

  // Direct identifiers are stripped locally, before anything leaves this
  // machine. Google receives an employment history with the person taken out of
  // it, and the identifiers are merged back in below.
  //
  // Scanned CVs are the exception: a page image cannot be redacted this way, so
  // it goes as-is. That exception is disclosed in the privacy policy rather
  // than quietly ignored.
  const { clean, found } = text
    ? deidentify(text)
    : { clean: '', found: null };

  const parts = clean
    ? [{ text: `CV text:\n\n${clean}` }]
    : [
        { text: 'CV pages follow as images.' },
        ...images.map((data) => ({ inlineData: { mimeType: 'image/png', data } })),
      ];

  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const payload = await callGemini(parts, apiKey, AbortSignal.timeout(90_000));
      const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error('empty response from model');
      const parsed = JSON.parse(raw);
      // Local values win: they came from the document, not from a model reading
      // a document with the identifiers already taken out.
      const data = found ? reattach(parsed, found) : parsed;
      data._source = text ? 'text' : 'image';
      data._deidentified = Boolean(found);
      data._usage = payload.usageMetadata ?? {};
      return data;
    } catch (e) {
      last = e;
      // Retry transient failures only. A TypeError is a bug in this file and
      // will fail identically three times — retrying it just spends three times
      // the quota before reporting the same thing. This exact case cost three
      // API calls to a "found is not defined".
      const transient =
        e instanceof TypeError === false &&
        e instanceof SyntaxError === false &&
        !(e instanceof ReferenceError);
      if (!transient || attempt >= retries) break;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error(`Extraction failed: ${last?.message ?? last}`);
}
