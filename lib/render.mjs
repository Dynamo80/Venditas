/**
 * Structured fields -> the agency's branded CV.
 *
 * The most important behaviour in this file is what it leaves out.
 *
 * An agency reformats a CV for one commercial reason above all others: to strip
 * the candidate's name and contact details before the document reaches a
 * client. If the client can read the candidate's email, the client can hire
 * them directly and the agency loses a fee worth thousands. Everything else
 * here is typography; this part is the business.
 *
 * So redaction is on by default and switching it off must be deliberate.
 */

import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel,
  ImageRun, Packer, Paragraph, TextRun,
} from 'docx';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MUTED = '666C74';

/** '2022-03' -> 'Mar 2022'. Anything unexpected passes through untouched. */
export function prettyDate(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{1,2})$/.exec(String(value).trim());
  if (m) {
    const mon = Number(m[2]);
    if (mon >= 1 && mon <= 12) return `${MONTHS[mon]} ${m[1]}`;
  }
  return String(value).trim();
}

function dateRange(item) {
  const start = prettyDate(item.start);
  const end = item.current ? 'Present' : prettyDate(item.end);
  if (start && end) return `${start} – ${end}`;
  return start || end || '';
}

export function initials(name) {
  if (!name) return 'CAND';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 3).map((p) => p[0].toUpperCase()).join('') || 'CAND';
}

export function makeReference(name, when = new Date()) {
  const stamp = `${when.getFullYear()}${String(when.getMonth() + 1).padStart(2, '0')}`;
  return `${initials(name)}-${stamp}`;
}

// ------------------------------------------------------------------ pieces
const text = (content, opts = {}) =>
  new Paragraph({
    spacing: { before: (opts.before ?? 0) * 20, after: (opts.after ?? 4) * 20 },
    alignment: opts.align,
    children: [
      new TextRun({
        text: content,
        size: Math.round((opts.size ?? 10) * 2), // docx uses half-points
        bold: opts.bold,
        italics: opts.italic,
        color: opts.color,
        font: 'Calibri',
      }),
    ],
  });

const sectionHeading = (label, colour) =>
  new Paragraph({
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 2, color: colour } },
    children: [
      new TextRun({
        text: label.toUpperCase(),
        size: 18,
        bold: true,
        color: colour,
        font: 'Calibri',
        characterSpacing: 20,
      }),
    ],
  });

const bullet = (content) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text: content, size: 19, font: 'Calibri' })],
  });

// ------------------------------------------------------------------ render
/**
 * @param {object} data      extracted CV fields
 * @param {object} brand     { name, colour, logo (Buffer), footer, contact, redact }
 * @returns {Promise<Buffer>} the .docx
 */
export async function render(data, brand = {}, { reference } = {}) {
  const colour = (brand.colour || '1F4E5F').replace(/^#/, '').toUpperCase();
  const redact = brand.redact !== false;
  const ref = reference || makeReference(data.name);
  const body = [];

  // ---- masthead ---------------------------------------------------------
  if (brand.logo) {
    body.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new ImageRun({
            data: brand.logo,
            transformation: { width: 150, height: brand.logoHeight || 44 },
            type: brand.logoType || 'png',
          }),
        ],
      })
    );
  } else {
    body.push(text(brand.name || 'Candidate Profile', { size: 15, bold: true, color: colour, after: 2 }));
  }

  // ---- identity ---------------------------------------------------------
  // The reference is how agency and client discuss this person without the
  // client being able to reach them.
  body.push(
    text(redact ? `Candidate reference ${ref}` : data.name || `Candidate reference ${ref}`,
         { size: 18, bold: true, before: 8, after: 2 })
  );

  if (data.headline) body.push(text(data.headline, { size: 11.5, color: colour, after: 2 }));

  // Location is commercially safe and genuinely useful to a client. Email,
  // phone and personal links are not, and never survive redaction.
  const facts = [];
  if (data.location) facts.push(data.location);
  if (!redact) {
    for (const v of [data.email, data.phone]) if (v) facts.push(v);
    for (const l of data.links || []) facts.push(l);
  }
  if (facts.length) body.push(text(facts.join('  ·  '), { size: 9, color: MUTED, after: 2 }));

  if (data.summary) {
    body.push(sectionHeading('Profile', colour));
    body.push(text(data.summary, { size: 10, after: 2 }));
  }

  // ---- experience -------------------------------------------------------
  if (data.experience?.length) {
    body.push(sectionHeading('Experience', colour));
    for (const role of data.experience) {
      const line = [role.title, role.employer].filter(Boolean).join(' — ');
      body.push(text(line || 'Role', { size: 10.5, bold: true, before: 7, after: 0 }));

      const meta = [dateRange(role), role.location].filter(Boolean).join('  ·  ');
      if (meta) body.push(text(meta, { size: 8.5, italic: true, color: MUTED, after: 3 }));

      for (const b of role.bullets || []) body.push(bullet(b));
    }
  }

  // ---- education --------------------------------------------------------
  if (data.education?.length) {
    body.push(sectionHeading('Education', colour));
    for (const ed of data.education) {
      const line = [ed.qualification, ed.institution].filter(Boolean).join(' — ');
      body.push(text(line || 'Qualification', { size: 10, bold: true, before: 5, after: 0 }));
      const bits = [dateRange(ed), ed.detail].filter(Boolean).join('  ·  ');
      if (bits) body.push(text(bits, { size: 8.5, italic: true, color: MUTED, after: 2 }));
    }
  }

  // ---- flat lists -------------------------------------------------------
  for (const [label, key] of [['Skills', 'skills'], ['Certifications', 'certifications'], ['Languages', 'languages']]) {
    const values = data[key] || [];
    if (values.length) {
      body.push(sectionHeading(label, colour));
      body.push(text(values.join('  ·  '), { size: 9.5, after: 2 }));
    }
  }

  // ---- footer -----------------------------------------------------------
  const footerBits = [brand.footer || brand.name || 'Candidate profile'];
  if (brand.contact) footerBits.push(brand.contact);
  footerBits.push(`Ref ${ref}`);

  const doc = new Document({
    creator: brand.name || 'Venditas',
    title: `Candidate ${ref}`,
    description: 'Formatted candidate profile',
    styles: { default: { document: { run: { font: 'Calibri', size: 20 } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 864, bottom: 864, left: 1080, right: 1080 } },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: footerBits.join('  ·  '),
                    size: 15,
                    color: '8A9098',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/**
 * Belt and braces. Redaction is the one thing that must never silently fail, so
 * we assert on the rendered text rather than trusting the code above.
 * Cheap to run on every render, and it catches a whole class of future edits.
 */
export function redactionLeaks(docText, data) {
  const candidates = [
    ['name', data.name],
    ['email', data.email],
    ['phone', data.phone],
    ...(data.links || []).map((l, i) => [`link${i + 1}`, l]),
  ];
  return candidates
    .filter(([, v]) => v && String(v).trim().length > 3)
    .filter(([, v]) => docText.includes(String(v).trim()))
    .map(([k]) => k);
}
