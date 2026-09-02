/**
 * Strip direct identifiers out of CV text before any of it reaches a model.
 *
 * WHY THIS EXISTS
 * The extraction model runs on Google's unpaid Gemini tier, whose terms permit
 * Google to use submitted content to improve their products, with human review,
 * and explicitly ask you not to submit personal information. A candidate's CV
 * is exactly that. Rather than send it and hope, we remove the direct
 * identifiers locally and send Google an employment history with the person
 * taken out of it.
 *
 * It also happens to be the better engineering. A regular expression reads an
 * email address more reliably than a language model does, costs nothing, and
 * cannot hallucinate a phone number that was never on the page.
 *
 * HONEST LIMIT
 * This is pseudonymisation, not anonymisation. An employment history with
 * dates and employers can still identify someone in combination, and under
 * GDPR it remains personal data. This materially reduces exposure; it does not
 * make the free tier appropriate for data you would call sensitive. That
 * judgement stays with the operator, and the privacy policy says so.
 */

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// Deliberately conservative. A loose phone pattern eats dates, salaries and
// postcodes, and a mangled work history is a worse failure than a missed number.
const PHONE_RE = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d{3,5}[\s.-]?\d{3,4}[\s.-]?\d{0,4}/g;

const URL_RE = /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com|medium\.com|x\.com|twitter\.com)\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/gi;

/** Words that mean a line is a heading, not somebody's name. */
const NOT_A_NAME = new Set([
  'curriculum', 'vitae', 'cv', 'resume', 'résumé', 'profile', 'summary',
  'contact', 'experience', 'education', 'skills', 'languages', 'references',
  'confidential', 'page', 'personal', 'details', 'objective', 'about',
]);

/**
 * PDF extraction breaks things across lines: an address arrives as
 * "priya.raghunathan" on one line and "@gmail.com" on the next. Rejoin those
 * before matching, or every pattern below misses.
 */
export function repairLineBreaks(text) {
  return text
    .replace(/([A-Za-z0-9._%+-])\s*\n\s*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '$1$2')
    .replace(/(@[A-Za-z0-9.-]*)\s*\n\s*([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '$1$2')
    .replace(/((?:linkedin|github|gitlab|medium)\.com\/(?:in\/)?)\s*\n\s*([A-Za-z0-9._-]+)/gi, '$1$2');
}

function looksLikeName(line) {
  const s = line.trim();
  if (!s || s.length > 48 || /[@\d]/.test(s)) return false;
  const words = s.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  if (words.some((w) => NOT_A_NAME.has(w.toLowerCase().replace(/[^a-z]/gi, '')))) return false;
  // Every word starts with a capital and is a plausible name token.
  return words.every((w) => /^[A-ZÀ-Þ][A-Za-zÀ-ÿ'’.-]*$/.test(w));
}

/**
 * Name tokens implied by an email address: priya.raghunathan@… -> [priya, raghunathan].
 * A far stronger signal than position on the page, and it costs nothing.
 */
function tokensFromEmail(email) {
  if (!email) return [];
  return email
    .split('@')[0]
    .split(/[._\-+\d]+/)
    .filter((t) => t.length > 2)
    .map((t) => t.toLowerCase());
}

/**
 * The candidate's name.
 *
 * Two passes, because position alone is unreliable: a two-column CV puts the
 * sidebar first, so the name can be twenty lines down while "CONTACT" and
 * "SKILLS" sit at the top.
 *
 *   1. A line matching the tokens in the email address. Nearly always right
 *      when an address is present, and immune to layout.
 *   2. Otherwise the first name-shaped line near the top.
 *
 * The window stays tight in pass 2 on purpose. A name-shaped line deep in the
 * document is more likely a referee or a former manager, and redacting those
 * would quietly damage the work history we are supposed to preserve.
 */
export function findName(text, email = null) {
  const lines = text.split('\n');
  const tokens = tokensFromEmail(email);

  if (tokens.length) {
    for (const line of lines.slice(0, 60)) {
      const s = line.trim();
      if (!s || s.length > 48) continue;
      const lower = s.toLowerCase();
      const hits = tokens.filter((t) => lower.includes(t)).length;
      // Both parts of the address present, and it reads like a name.
      if (hits >= Math.min(2, tokens.length) && looksLikeName(s)) return s;
    }
  }

  for (const line of lines.slice(0, 25)) {
    if (looksLikeName(line)) return line.trim();
  }
  return null;
}

/**
 * @returns {{ clean: string, found: { name, email, phone, links } }}
 */
export function deidentify(rawText) {
  const text = repairLineBreaks(rawText);

  const emails = [...new Set(text.match(EMAIL_RE) || [])];
  const links = [...new Set((text.match(URL_RE) || []).map((l) => l.replace(/[.,;)]+$/, '')))];

  // Phones are matched only after emails and links are removed, so the digits
  // inside a URL or an address cannot be mistaken for a number.
  let working = text;
  for (const e of emails) working = working.split(e).join(' [EMAIL] ');
  for (const l of links) working = working.split(l).join(' [LINK] ');

  const phones = [...new Set((working.match(PHONE_RE) || []))]
    .map((p) => p.trim())
    .filter((p) => {
      const digits = p.replace(/\D/g, '');
      // A real phone number, not a year, a salary or a postcode.
      return digits.length >= 9 && digits.length <= 15;
    });

  for (const p of phones) working = working.split(p).join(' [PHONE] ');

  const name = findName(text, emails[0] || null);
  if (name) {
    // Also catch the name used on its own elsewhere, e.g. in a footer.
    working = working.split(name).join('[NAME]');
    for (const part of name.split(/\s+/)) {
      if (part.length > 2) {
        working = working.replace(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), '[NAME]');
      }
    }
  }

  return {
    clean: working,
    found: {
      name: name || null,
      email: emails[0] || null,
      phone: phones[0] || null,
      links,
    },
  };
}

/**
 * Put the locally-found identifiers back onto the model's structured output.
 *
 * Local values always win: they came from the document itself, not from a
 * model's reading of a document with the identifiers already removed.
 */
export function reattach(data, found) {
  return {
    ...data,
    name: found.name ?? data.name ?? null,
    email: found.email ?? null,
    phone: found.phone ?? null,
    links: found.links?.length ? found.links : [],
  };
}
