/**
 * The candidate's CV, poured into the agency's own Word template.
 *
 * WHY
 *
 * Without this, Venditas puts an agency's logo, colour and footer on Venditas's
 * own layout. The agencies most likely to buy are the ones already paying
 * HireAra or Allsorter (decision 013), and those tools fill the agency's own
 * template. An agency that uploads its letterhead and gets a different layout
 * back does not switch. docs/state.md called this the product gap most worth
 * closing.
 *
 * WHAT IS KEPT FROM THE TEMPLATE
 *
 * Everything except its body: headers and footers (with their logos), fonts and
 * styles, page size and margins, theme, settings. The CV goes where the template
 * says {{CV}}, keeping any text around the marker (an intro line, an interview
 * note). With no marker, the CV fills the page under the template's header.
 *
 * HOW
 *
 * render() builds the CV as usual, without its own masthead, footer or fonts.
 * Its body paragraphs move into the template's document.xml. Bullets need their
 * numbering definitions, renumbered so they cannot collide with the template's,
 * and any paragraph style the template lacks is copied across. String surgery
 * rather than an XML parser: the parts are machine-written, the operations are
 * narrow, and there is no entity expansion to worry about in a file a stranger
 * uploaded.
 *
 * Nothing is stored. The template arrives with the request, is used in memory
 * and is gone when the response is sent, exactly like the CV (decision 006).
 */

import JSZip from 'jszip';

export const MAX_TEMPLATE_BYTES = 2 * 1024 * 1024;
/** A zip that unpacks to far more than it weighs is not a letterhead. */
const MAX_UNPACKED_BYTES = 25 * 1024 * 1024;
const MARKER = /\{\{\s*cv\s*\}\}/i;
const MAIN = 'word/document.xml';
const RELS = 'word/_rels/document.xml.rels';
const TYPES = '[Content_Types].xml';

const PARTS = {
  numbering: {
    path: 'word/numbering.xml',
    rel: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml',
  },
  styles: {
    path: 'word/styles.xml',
    rel: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml',
  },
};

const userFacing = (message) => Object.assign(new Error(message), { userFacing: true });
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The text a paragraph shows, with run boundaries removed ("{{" and "CV}}" are often split). */
const textOf = (xml) => [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('');

/**
 * Attributes in namespaces other than w, r and xml. Word writes w14/w15 extras
 * that the template's root element may not declare, and an undeclared prefix
 * makes the whole document unreadable.
 */
const stripForeign = (xml) => xml.replace(/\s(?!w:|r:|xml:)[A-Za-z][\w.-]*:[\w.-]+="[^"]*"/g, '');

async function open(buffer) {
  let zip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw userFacing("That template isn't a Word file we can read. Save it as .docx and try again.");
  }
  if (!zip.file(MAIN)) throw userFacing("That template isn't a Word document. Save it as .docx and try again.");
  if (zip.file('word/vbaProject.bin')) {
    throw userFacing('That template contains macros. Save it as a plain .docx, not .docm, and try again.');
  }
  let unpacked = 0;
  for (const f of Object.values(zip.files)) unpacked += f._data?.uncompressedSize || 0;
  if (unpacked > MAX_UNPACKED_BYTES) throw userFacing('That template is too large once unpacked. Try a simpler version of it.');
  return zip;
}

/**
 * Is this a template we can use? Called before the CV is read, so a template we
 * cannot use never costs one of the ten trial CVs.
 * @returns {Promise<{marker: boolean}>}
 */
export async function checkTemplate(buffer) {
  if (buffer.length > MAX_TEMPLATE_BYTES) {
    throw userFacing(`That template is ${(buffer.length / 1048576).toFixed(1)}MB. The limit is 2MB.`);
  }
  const zip = await open(buffer);
  const doc = await zip.file(MAIN).async('string');
  if (!/<w:body[\s>]/.test(doc)) throw userFacing('That template has no page we can put a CV on.');
  return { marker: MARKER.test(textOf(doc)) };
}

/** document.xml split around its body: everything before, the content, the final section properties, everything after. */
function bodyParts(doc) {
  const opening = /<w:body(?:\s[^>]*)?>/.exec(doc);
  if (!opening) throw userFacing('That template has no page we can put a CV on.');
  const start = opening.index + opening[0].length;
  const end = doc.lastIndexOf('</w:body>');
  const inner = doc.slice(start, end);
  // The body's own section properties are its last child. Earlier ones sit inside
  // paragraphs and end a section rather than the document.
  const s = inner.lastIndexOf('<w:sectPr');
  const tail = s >= 0 ? inner.slice(s) : '';
  const isBodyLevel = /^<w:sectPr(?:\s[^>]*)?(?:\/>|>[\s\S]*<\/w:sectPr>)\s*$/.test(tail);
  return {
    head: doc.slice(0, start),
    content: isBodyLevel ? inner.slice(0, s) : inner,
    sectPr: isBodyLevel ? tail.trim() : '',
    tail: doc.slice(end),
  };
}

const maxId = (xml, re) => [...xml.matchAll(re)].reduce((n, m) => Math.max(n, Number(m[1])), 0);

/** Move the CV's bullet definitions into the template's numbering, renumbered past the template's own. */
function mergeNumbering(tplNum, cvNum, body) {
  const abstracts = cvNum.match(/<w:abstractNum\b[\s\S]*?<\/w:abstractNum>/g) || [];
  const nums = cvNum.match(/<w:num\s[\s\S]*?<\/w:num>/g) || [];
  const absBase = maxId(tplNum, /<w:abstractNum\b[^>]*\sw:abstractNumId="(\d+)"/g);
  const numBase = maxId(tplNum, /<w:num\s[^>]*w:numId="(\d+)"/g);
  const absMap = new Map();
  const numMap = new Map();

  const newAbstracts = abstracts.map((a) => {
    const id = Number(/\sw:abstractNumId="(\d+)"/.exec(a)[1]);
    const next = absBase + absMap.size + 1;
    absMap.set(id, next);
    // nsid identifies a list definition across documents; two equal ones get merged by Word.
    return stripForeign(a.replace(/\sw:abstractNumId="\d+"/, ` w:abstractNumId="${next}"`).replace(/<w:nsid\s[^>]*\/>/g, ''));
  });
  const newNums = nums.map((n) => {
    const id = Number(/w:numId="(\d+)"/.exec(n)[1]);
    const next = numBase + numMap.size + 1;
    numMap.set(id, next);
    return stripForeign(
      n.replace(/w:numId="\d+"/, `w:numId="${next}"`)
        .replace(/(<w:abstractNumId w:val=")(\d+)(")/, (_, a, v, b) => `${a}${absMap.get(Number(v)) ?? v}${b}`)
    );
  });

  // The schema wants every abstractNum before every num, and both before numIdMacAtCleanup.
  let out = tplNum;
  const before = (xml, ...patterns) => {
    for (const p of patterns) { const i = xml.search(p); if (i >= 0) return i; }
    return xml.lastIndexOf('</w:numbering>');
  };
  const absAt = before(out, /<w:num\s/, /<w:numIdMacAtCleanup/);
  out = out.slice(0, absAt) + newAbstracts.join('') + out.slice(absAt);
  const numAt = before(out, /<w:numIdMacAtCleanup/);
  out = out.slice(0, numAt) + newNums.join('') + out.slice(numAt);

  return {
    numbering: out,
    body: body.replace(/(<w:numId w:val=")(\d+)(")/g, (_, a, v, b) => `${a}${numMap.get(Number(v)) ?? v}${b}`),
  };
}

/** Copy across any paragraph, character or table style the CV uses and the template does not define. */
function mergeStyles(tplStyles, cvStyles, body) {
  const used = new Set([...body.matchAll(/<w:(?:pStyle|rStyle|tblStyle) w:val="([^"]+)"/g)].map((m) => m[1]));
  let out = tplStyles;
  for (const id of used) {
    if (new RegExp(`w:styleId="${escapeRe(id)}"`).test(out)) continue;
    const def = new RegExp(`<w:style\\b[^>]*w:styleId="${escapeRe(id)}"[\\s\\S]*?<\\/w:style>`).exec(cvStyles);
    if (def) out = out.replace('</w:styles>', `${stripForeign(def[0])}</w:styles>`);
  }
  return out;
}

/** Give the template a part it lacks (numbering, styles), wired into the package. */
async function addPart(zip, part, content) {
  zip.file(part.path, content);
  const rels = await zip.file(RELS)?.async('string');
  if (rels && !rels.includes(part.rel)) {
    let n = 1;
    while (rels.includes(`Id="rIdVenditas${n}"`)) n++;
    zip.file(RELS, rels.replace('</Relationships>',
      `<Relationship Id="rIdVenditas${n}" Type="${part.rel}" Target="${part.path.replace('word/', '')}"/></Relationships>`));
  }
  const types = await zip.file(TYPES).async('string');
  if (!types.includes(`PartName="/${part.path}"`)) {
    zip.file(TYPES, types.replace('</Types>', `<Override PartName="/${part.path}" ContentType="${part.type}"/></Types>`));
  }
}

/**
 * @param {Buffer} cvDocx          render(data, brand, { template: true })
 * @param {Buffer} templateBuffer  the agency's .docx or .dotx
 * @returns {Promise<Buffer>}      the CV in the agency's template
 */
export async function intoTemplate(cvDocx, templateBuffer) {
  const tpl = await open(templateBuffer);
  const cv = await JSZip.loadAsync(cvDocx);

  const cvParts = bodyParts(await cv.file(MAIN).async('string'));
  let body = stripForeign(cvParts.content);

  if (/<w:numPr>/.test(body) && cv.file(PARTS.numbering.path)) {
    const cvNum = await cv.file(PARTS.numbering.path).async('string');
    const tplNum = await tpl.file(PARTS.numbering.path)?.async('string');
    if (tplNum) {
      const merged = mergeNumbering(tplNum, cvNum, body);
      tpl.file(PARTS.numbering.path, merged.numbering);
      body = merged.body;
    } else {
      await addPart(tpl, PARTS.numbering, cvNum);
    }
  }

  const cvStyles = await cv.file(PARTS.styles.path).async('string');
  const tplStyles = await tpl.file(PARTS.styles.path)?.async('string');
  if (tplStyles) tpl.file(PARTS.styles.path, mergeStyles(tplStyles, cvStyles, body));
  else await addPart(tpl, PARTS.styles, cvStyles);

  const t = bodyParts(await tpl.file(MAIN).async('string'));
  const paragraphs = [...t.content.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)];
  // A marker paragraph that holds another paragraph (a text box) cannot be cut
  // out cleanly, so it is treated as no marker at all.
  const marker = paragraphs.find((m) => MARKER.test(textOf(m[0])) && !/<w:p\b/.test(m[0].slice(4)));
  const content = marker
    ? t.content.slice(0, marker.index) + body + t.content.slice(marker.index + marker[0].length)
    : body;
  // No section properties in the template: use the CV's page setup, without its
  // header and footer references, which point at parts the template does not have.
  const sectPr = t.sectPr || cvParts.sectPr.replace(/<w:(?:header|footer)Reference\b[^>]*\/>/g, '');
  tpl.file(MAIN, t.head + content + sectPr + t.tail);

  // A .dotx is a template package. The download is a document, and Word refuses a
  // .docx whose main part says otherwise.
  const types = await tpl.file(TYPES).async('string');
  tpl.file(TYPES, types.replace('wordprocessingml.template.main+xml', 'wordprocessingml.document.main+xml'));

  return tpl.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
