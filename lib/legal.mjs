/**
 * Renders the legal documents in legal/*.md into pages.
 *
 * The markdown files are the source of truth, not a copy of it. A solicitor
 * will mark up those documents, and the alternative — hand-converting each
 * revision into JSX — guarantees that the published page and the reviewed text
 * drift apart. On a privacy policy, that drift is the whole risk.
 *
 * Read at build time, so nothing touches the filesystem in a serverless
 * request, and the .md content ships inside the prerendered HTML.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

const DIR = path.join(process.cwd(), 'legal');

export function loadLegal(slug) {
  const raw = readFileSync(path.join(DIR, `${slug}.md`), 'utf8');

  // The first H1 becomes the page title; leaving it in the body would render a
  // second heading directly under the one the layout already shows.
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;
  const body = titleMatch ? raw.replace(titleMatch[0], '') : raw;

  return { title, html: marked.parse(body) };
}
