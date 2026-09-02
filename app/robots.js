export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing useful to a crawler, and /unsubscribe carries an address in
        // the query string that has no business in a search index.
        disallow: ['/api/', '/unsubscribe'],
      },
    ],
    sitemap: 'https://venditas.in/sitemap.xml',
  };
}
