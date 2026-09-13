/**
 * Can the pages be found, and has every search engine that takes a push been
 * told what changed?
 *
 *   node ops/seo.mjs             check every page the repo defines against the live site
 *   node ops/seo.mjs --submit    and push pages whose live text changed to IndexNow
 *   node ops/seo.mjs --local http://localhost:3000
 *                                check a local `next start` before deploying; records nothing
 *
 * Runs weekly from ops/weekly.mjs. Decision 018.
 *
 * WHY
 *
 * Search is the one channel with no daily cap (docs/runbooks/inbound.md), and it
 * fails quietly in ways nobody checks by eye. On 14 September, for example:
 *
 *   - /hireara-alternative was in the sitemap and answered 404, because the
 *     pages were written but not deployed;
 *   - every sitemap and canonical URL named https://venditas.in, which
 *     redirects (307, temporary) to https://www.venditas.in. Search engines
 *     were told the true address of each page was one that sends them elsewhere;
 *   - most pages had no canonical at all.
 *
 * INDEXNOW, AND WHY NOT GOOGLE
 *
 * IndexNow is the free protocol shared by Bing, Yandex, Seznam and Naver: one
 * POST and they recrawl. Bing's index also feeds Copilot and is among those
 * ChatGPT search draws on, which is most of "AI answers" for a UK recruiter.
 * Google does not take part and retired its sitemap ping in 2023. It needs the
 * sitemap submitted once in Search Console by hand (docs/state.md), and then
 * reads it by itself.
 *
 * A page is pushed when the text a reader sees on the live page changes, not
 * when its source file does. An edit that is not deployed is not announced, and
 * a deploy is announced without anyone remembering to.
 */

import { readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sitemap from '../app/sitemap.js';
import { INDEXNOW_KEY } from '../lib/indexnow.mjs';
import { ROOT, readState, writeState, recordRun } from './automation.mjs';

const argv = process.argv.slice(2);
// A local build is checked against the production addresses it will claim once
// deployed, so a canonical that is wrong locally is wrong in the same way live.
const LOCAL = argv.includes('--local') ? (argv[argv.indexOf('--local') + 1] || 'http://localhost:3000').replace(/\/$/, '') : null;
const SUBMIT = argv.includes('--submit') && !LOCAL;
const UA = 'VenditasSiteCheck/1.0 (+https://www.venditas.in/about)';

/** Routes that exist on purpose and are not for search: a signup step, and an opt-out that carries an address. */
const NOT_FOR_SEARCH = new Set(['demo', 'unsubscribe']);

const entities = (s) => s
  .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const grab = (html, ...patterns) => {
  for (const re of patterns) {
    const m = re.exec(html);
    if (m) return entities(m[1]);
  }
  return '';
};
const noSlash = (u) => u.replace(/\/$/, '');

async function get(url) {
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) });
    return {
      status: res.status,
      location: res.headers.get('location') || '',
      robots: res.headers.get('x-robots-tag') || '',
      html: res.status === 200 ? await res.text() : '',
    };
  } catch (e) {
    return { status: 0, error: String(e?.cause?.code || e?.message || e), html: '' };
  }
}

/** Problems stop a page being indexed as intended. Notes are worth fixing but cost little. */
function inspect(url, page) {
  const html = page.html;
  const title = grab(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = grab(html,
    /<meta[^>]+name="description"[^>]+content="([^"]*)"/i,
    /<meta[^>]+content="([^"]*)"[^>]+name="description"/i);
  const canonical = grab(html,
    /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i,
    /<link[^>]+href="([^"]*)"[^>]+rel="canonical"/i);
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html) || /noindex/i.test(page.robots);

  const problems = [];
  const notes = [];
  if (!title) problems.push('no title');
  else if (title.length > 65) notes.push(`title ${title.length} chars, results cut near 60`);
  if (!description) problems.push('no meta description');
  else if (description.length > 170) notes.push(`description ${description.length} chars, cut near 155`);
  if (!canonical) problems.push('no canonical');
  else if (noSlash(canonical) !== noSlash(url)) problems.push(`canonical is ${canonical}`);
  if (h1s !== 1) problems.push(`${h1s} h1 elements`);
  if (noindex) problems.push('noindex');
  if (!/application\/ld\+json/i.test(html)) notes.push('no structured data');
  return { problems, notes };
}

/** The words on the page, without the scripts and build hashes that change on every deploy. */
function fingerprint(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function routesOnDisk() {
  const app = path.join(ROOT, 'app');
  return readdirSync(app, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(app, d.name, 'page.jsx')))
    .map((d) => d.name);
}

async function submit(host, urls) {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`, urlList: urls }),
      signal: AbortSignal.timeout(30000),
    });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const pages = sitemap().map((e) => e.url);
  const origin = new URL(pages[0]).origin;
  const host = new URL(origin).host;
  const base = LOCAL || origin;

  console.log(`\nSEO · ${origin}${LOCAL ? ` · as served by ${LOCAL}` : ''} · ${new Date().toISOString().slice(0, 10)}\n`);

  const results = [];
  for (const url of pages) {
    const page = await get(LOCAL ? `${LOCAL}${new URL(url).pathname}` : url);
    const r = { url, path: new URL(url).pathname, status: page.status, problems: [], notes: [], pending: false };
    if (page.status === 200) {
      Object.assign(r, inspect(url, page));
      r.fp = fingerprint(page.html);
    } else if (page.status === 404) {
      r.pending = true;
    } else if (page.status >= 300 && page.status < 400) {
      r.problems.push(`redirects (${page.status}) to ${page.location}`);
    } else {
      r.problems.push(page.status ? `HTTP ${page.status}` : `unreachable: ${page.error}`);
    }
    results.push(r);
    const verdict = r.pending ? 'built, not deployed' : r.problems.length ? r.problems.join('; ') : 'ok';
    console.log(`  ${r.path.padEnd(46)} ${String(r.status).padEnd(4)} ${verdict}`);
    for (const n of r.notes) console.log(`  ${''.padEnd(46)}      note: ${n}`);
  }

  // The live sitemap and robots.txt: what a crawler actually reads, which is
  // not the repo until it is deployed.
  const siteProblems = [];
  const liveMap = await get(`${base}/sitemap.xml`);
  if (liveMap.status !== 200) siteProblems.push(`sitemap.xml answers ${liveMap.status}`);
  else {
    const foreign = [...liveMap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.startsWith(`${origin}/`));
    if (foreign.length) siteProblems.push(`live sitemap lists ${foreign.length} URL(s) not on ${origin}, e.g. ${foreign[0]}`);
  }
  const robots = await get(`${base}/robots.txt`);
  if (robots.status !== 200) siteProblems.push(`robots.txt answers ${robots.status}`);
  else if (!robots.html.includes(`Sitemap: ${origin}/sitemap.xml`)) siteProblems.push(`robots.txt does not point at ${origin}/sitemap.xml`);

  const listed = new Set(pages.map((u) => noSlash(new URL(u).pathname).replace(/^\//, '')));
  const unlisted = routesOnDisk().filter((r) => !listed.has(r) && !NOT_FOR_SEARCH.has(r));

  const live = results.filter((r) => r.status === 200);
  const pending = results.filter((r) => r.pending).map((r) => r.path);
  const withProblems = results.filter((r) => r.problems.length).length + siteProblems.length;

  console.log('');
  for (const p of siteProblems) console.log(`  site              ${p}`);
  if (unlisted.length) console.log(`  not in sitemap    ${unlisted.join(', ')}  (app/sitemap.js)`);
  console.log(`  live              ${live.length} of ${pages.length}`);
  console.log(`  not deployed      ${pending.length}${pending.length ? '  -> deploy (docs/runbooks/deploy.md)' : ''}`);
  console.log(`  with a problem    ${withProblems}`);

  let indexnow = 'not asked (add --submit)';
  let submitted = 0;
  if (SUBMIT) {
    const keyFile = await get(`${origin}/${INDEXNOW_KEY}.txt`);
    if (keyFile.status !== 200 || keyFile.html.trim() !== INDEXNOW_KEY) {
      indexnow = `key file not live (public/${INDEXNOW_KEY}.txt answers ${keyFile.status}); nothing submitted until it is deployed`;
    } else {
      const state = readState('seo', { submitted: {} });
      const changed = live.filter((r) => state.submitted[r.url] !== r.fp);
      if (!changed.length) {
        indexnow = 'nothing changed since the last submission';
      } else {
        const status = await submit(host, changed.map((r) => r.url));
        if (status === 200 || status === 202) {
          for (const r of changed) state.submitted[r.url] = r.fp;
          writeState('seo', state);
          submitted = changed.length;
          indexnow = `submitted ${changed.length} page(s), HTTP ${status}`;
        } else {
          indexnow = `refused, HTTP ${status || 'no answer'}; will retry next run`;
        }
      }
    }
  }
  if (LOCAL) {
    const keyFile = await get(`${LOCAL}/${INDEXNOW_KEY}.txt`);
    indexnow = keyFile.status === 200 && keyFile.html.trim() === INDEXNOW_KEY ? 'key file served correctly' : `key file answers ${keyFile.status}`;
  }
  console.log(`  indexnow          ${indexnow}\n`);

  // A local check describes a build, not the site, so it leaves no record for status.mjs.
  if (LOCAL) return;

  recordRun('seo', {
    ok: live.length > 0,
    live: live.length,
    pages: pages.length,
    pending,
    problems: withProblems,
    unlisted,
    submitted,
    summary: `${live.length} of ${pages.length} pages live, ${pending.length} not deployed, ${withProblems} problem(s); IndexNow ${indexnow}`,
  });

  if (!live.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('seo check failed:', e?.message || e);
  process.exit(1);
});
