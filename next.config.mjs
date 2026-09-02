/**
 * Security headers.
 *
 * A recruitment agency's IT person may well run a scanner over this before
 * signing anything, and missing headers are the cheapest possible finding to
 * hand them. They cost nothing and they are the difference between a clean
 * report and an awkward email.
 */
const securityHeaders = [
  // Two years, preloadable. The site is HTTPS-only already; this stops a first
  // request ever going out in plaintext.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No page here has any business reaching for a camera, a microphone or a
  // location, so say so rather than relying on nobody asking.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

/** @type {import('next').NextConfig} */
export default {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
