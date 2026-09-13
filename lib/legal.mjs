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

  return { title, html: marked.parse(demoteAfterFirstH1(body)) };
}

/**
 * The page already has its <h1>. A document with more top-level headings (the
 * DPA's four annexes and its signature block) would put five more on the page,
 * which tells a search engine the page has no single subject. From the first
 * such heading on, every heading drops one level: an annex becomes an <h2> and
 * its sections <h3>. Documents without one render exactly as before.
 */
function demoteAfterFirstH1(md) {
  let fenced = false;
  let demote = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      if (/^# /.test(line)) demote = true;
      return demote && /^#{1,5} /.test(line) ? `#${line}` : line;
    })
    .join('\n');
}
