const PAGES = [
  ['', 1.0],
  ['pricing', 0.9],
  ['cv-formatting-for-recruitment-agencies', 0.8],
  ['gdpr-cv-redaction-recruitment-agencies', 0.8],
  ['candidate-cv-anonymisation-fee-protection', 0.8],
  ['bulk-cv-formatting-shortlist', 0.7],
  ['cv-formatting-house-style-consistency', 0.7],
  ['how-long-does-it-take-to-reformat-a-cv', 0.7],
  ['quibench-alternative', 0.8],
  ['hireara-alternative', 0.8],
  ['best-cv-formatting-software-uk', 0.8],
  ['anonymise-cv-tool', 0.8],
  ['security', 0.8],
  ['faq', 0.7],
  ['contact', 0.6],
  ['about', 0.5],
  ['privacy', 0.3],
  ['terms', 0.3],
  ['dpa', 0.3],
];

/**
 * www, because that is where the site is served: https://venditas.in answers
 * with a redirect to https://www.venditas.in. A sitemap and canonicals naming the
 * address that redirects tell a crawler two different things about every page.
 * `node ops/seo.mjs` checks the two still agree.
 */
export const ORIGIN = 'https://www.venditas.in';

export default function sitemap() {
  const now = new Date();
  return PAGES.map(([path, priority]) => ({
    url: `${ORIGIN}/${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority,
  }));
}
