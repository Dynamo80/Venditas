/**
 * Regenerate lib/blocklist-disposable.mjs from the public list.
 *
 *   node ops/refresh-blocklist.mjs
 *
 * A blocklist is a perishable good. New throwaway providers appear weekly and a
 * list frozen at the moment it was written is a list that quietly stops working
 * — which is the worst failure mode available, because it looks exactly like a
 * list that is working.
 *
 * So the list is not hand-maintained. It is fetched from the same source most
 * of the ecosystem uses, and regenerating it is one command. Run it monthly, or
 * whenever someone gets through.
 *
 * WHY THE SMALLER LIST
 *
 * There is a 75,000-domain list and an 8,700-domain one. The big list sweeps up
 * parked domains, dead providers and the occasional real small business, and a
 * false positive here is a prospect being told their own company address is
 * fake — on the signup page, in front of someone who agreed to a demo. The
 * curated list is the one the maintained libraries use, and precision matters
 * more than reach when a miss costs a blocked visitor and a hit costs nothing
 * (the address still has to survive a verification email).
 */

import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SOURCE =
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf';

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..'
);
const OUT = path.join(ROOT, 'lib', 'blocklist-disposable.mjs');

const res = await fetch(SOURCE, { signal: AbortSignal.timeout(60_000) });
if (!res.ok) throw new Error(`could not fetch the blocklist: HTTP ${res.status}`);

const domains = [
  ...new Set(
    (await res.text())
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith('#') && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(l))
  ),
].sort();

if (domains.length < 5000) {
  // A truncated download that still parses would silently halve the blocklist.
  throw new Error(`only ${domains.length} domains parsed; refusing to write a short list`);
}

writeFileSync(
  OUT,
  `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node ops/refresh-blocklist.mjs
 *
 * Source:  ${SOURCE}
 * Fetched: ${new Date().toISOString().slice(0, 10)}
 * Domains: ${domains.length}
 *
 * Stored as one newline-delimited string rather than an array literal: it is a
 * fraction of the parse cost and a fraction of the bytes, and nothing here is
 * ever read by a human.
 */

export const FETCHED = '${new Date().toISOString().slice(0, 10)}';
export const COUNT = ${domains.length};

export const DISPOSABLE_DOMAINS = new Set(
  \`${domains.join('\n')}\`.split('\\n')
);
`,
  'utf8'
);

console.log(`wrote ${domains.length} domains to lib/blocklist-disposable.mjs`);
