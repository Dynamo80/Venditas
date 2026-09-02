const PAGES = [
  ['', 1.0],
  ['pricing', 0.9],
  ['security', 0.8],
  ['faq', 0.7],
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
