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
  // Form labels. On a Europass CV "Nationality Polish" is the first name-shaped
  // line, and taking it for the name redacted "Polish" out of the languages.
  'nationality', 'citizenship', 'gender', 'birth', 'address', 'mobile',
  'telephone', 'phone', 'email', 'surname', 'occupational', 'employment',
  'mother', 'tongue', 'driving', 'licence', 'license', 'availability',
  'certificates', 'information', 'europass',
]);

/** A label in front of the name on the same line, as forms and Europass write it. */
const NAME_LABEL = /^\s*(?:surname\s*\/\s*first\s*name|first\s*name\s*\/\s*surname|full\s*name|candidate\s*name|surname|name|naam|nom|imi[eę]\s+i\s+nazwisko)\b\s*[:\-–]?\s*/i;

/** A line a form labels as an address. */
const ADDRESS_LABEL = /^\s*(?:home\s+|postal\s+)?(?:address|adres|adresse|anschrift|direcci[oó]n|indirizzo|morada)\b/i;

// Street words in either case. The street's own name must be capitalised,
// which is what keeps "led 3 teams across the road network" out. "Court" is
// left off: a legal CV's "14 High Court hearings" matched, and a solicitor's
// work history matters more than the rare home address on a Court.
const ci = (w) => `[${w[0].toUpperCase()}${w[0]}]${w.slice(1)}`;
const UK_STREET = ['street', 'st', 'road', 'rd', 'avenue', 'ave', 'lane', 'ln', 'way', 'drive',
  'dr', 'close', 'crescent', 'place', 'terrace', 'gardens', 'grove', 'mews',
  'square', 'hill', 'row', 'walk', 'parade', 'boulevard'].map(ci).join('|');

const STREET_RE = new RegExp([
  // 14 Acacia Avenue · 221B Baker Street · 3/12 Park Road
  String.raw`\b\d+[A-Za-z]?(?:[\/-]\d+)?,?\s+(?:[A-Z][\p{L}'’.-]*\s+){1,3}(?:${UK_STREET})\b\.?`,
  // ul. Jaworowa 9/4 · al. Jana Pawla 12
  String.raw`(?<!\p{L})(?:[Uu]l|[Aa]l|[Oo]s)\.\s*(?:\p{Lu}[\p{L}'’.-]*\s+){1,3}\d+[A-Za-z]?(?:[\/-]\d+)?`,
  // Kerkstraat 12 · Hauptstraße 5a
  String.raw`(?<!\p{L})\p{Lu}[\p{L}'’-]*?(?:straat|weg|laan|plein|gracht|kade|singel|dijk|straße|strasse|str\.|gasse|allee|platz)\s+\d+[A-Za-z]?(?:[\/-]\d+)?`,
  // 12 rue de la Paix · 5 avenue Foch
  String.raw`\b\d+,?\s+(?:[Rr]ue|[Aa]venue|[Bb]oulevard|[Cc]hemin|[Ii]mpasse|[Aa]llée)\s+[^,\n]{2,40}`,
  // Calle Mayor 5 · Rua Augusta 20
  String.raw`(?<!\p{L})(?:[Cc]alle|[Aa]venida|[Vv]iale|[Rr]ua|[Cc]arrer)\s+\p{Lu}[^,\n\d]{1,40}?\s*\d+[A-Za-z]?`,
].join('|'), 'gu');
const STREET_ONE = new RegExp(STREET_RE.source, 'u');

/** A full UK postcode. The outward half ("LS8") is kept; the inward half is a handful of houses. */
const UK_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}\b/g;

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
  // "Krawiec, Mateusz": surname first, the way Europass and most EU forms write it.
  const s = line.trim().replace(/^([^\s,]+),\s+(?=\S)/, '$1 ');
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

  // "Surname / First name Krawiec, Mateusz" puts a form label on the same line
  // as the value. Test the value, and return only the value.
  const values = lines.map((line) => line.replace(NAME_LABEL, '').trim());

  if (tokens.length) {
    for (const s of values.slice(0, 60)) {
      if (!s || s.length > 48) continue;
      const lower = s.toLowerCase();
      const hits = tokens.filter((t) => lower.includes(t)).length;
      // Both parts of the address present, and it reads like a name.
      if (hits >= Math.min(2, tokens.length) && looksLikeName(s)) return s;
    }
  }

  for (const s of values.slice(0, 25)) {
    if (looksLikeName(s)) return s;
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

  // A home address. The town is worth keeping, since a client needs to know the
  // candidate is in Kalisz rather than Krakow, but a street and a flat number
  // identify the person as surely as a phone number does. Only near the top, or
  // on a line a form labels as an address: further down, "14 High Court
  // hearings" is work history, not somewhere to live.
  const addresses = [];
  working = working
    .split('\n')
    .map((line, i) => (i < 25 || ADDRESS_LABEL.test(line)
      ? line
          .replace(STREET_RE, (m) => { addresses.push(m.trim()); return '[ADDRESS]'; })
          .replace(UK_POSTCODE, '$1')
      : line))
    .join('\n');

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
    for (const part of name.split(/[\s,]+/)) {
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
      address: addresses[0] || null,
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
    address: found.address ?? null,
    location: coarseLocation(data.location),
  };
}

/**
 * The town, not the doorstep. "ul. Jaworowa 9/4, 62-800 Kalisz, Poland" becomes
 * "Kalisz, Poland" and "Leeds LS8 2AB" becomes "Leeds LS8". A UK postcode
 * district stays because recruiters judge commutes by it.
 */
export function coarseLocation(location) {
  if (!location) return location ?? null;
  const parts = String(location)
    .split(',')
    .map((p) => p.replace(/\[ADDRESS\]/g, '').trim())
    .filter((p) => p && !STREET_ONE.test(p) && !/^(?:flat|apartment|apt|unit)\b/i.test(p))
    .map((p) => p
      .replace(UK_POSTCODE, '$1')
      .replace(/\b\d{4}\s?[A-Z]{2}\b/g, '')   // Netherlands: 1012 AB
      .replace(/\b\d{2}-\d{3}\b/g, '')        // Poland: 62-800
      .replace(/\b\d{5}(?:-\d{4})?\b/g, '')   // Germany, France, Spain, Italy, US
      .replace(/\s{2,}/g, ' ')
      .trim())
    .filter((p) => /\p{L}/u.test(p));
  return parts.length ? parts.join(', ') : null;
}
