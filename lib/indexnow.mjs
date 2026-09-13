/**
 * The IndexNow key. Not a secret: the protocol proves we control the host by
 * serving this same string at /<key>.txt (public/), and the key travels in the
 * clear with every submission. Used by ops/seo.mjs.
 */
export const INDEXNOW_KEY = 'c77d5b8bcc8d68c47ab90da6bd47313d';
