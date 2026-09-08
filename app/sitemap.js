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
  ['security', 0.8],
  ['faq', 0.7],
  ['contact', 0.6],
  ['about', 0.5],
  ['privacy', 0.3],
  ['terms', 0.3],
  ['dpa', 0.3],
];

export default function sitemap() {
  const now = new Date();
  return PAGES.map(([path, priority]) => ({
    url: `https://venditas.in/${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority,
  }));
}
