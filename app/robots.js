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
    // www: the bare domain redirects there (see app/sitemap.js).
    sitemap: 'https://www.venditas.in/sitemap.xml',
  };
}
