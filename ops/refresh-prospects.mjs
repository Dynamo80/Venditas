/**
 * New agencies from Companies House, once a month, without anyone remembering.
 *
 *   node ops/refresh-prospects.mjs           run if this month's file has not been done
 *   node ops/refresh-prospects.mjs --force   run even if it has
 *   node ops/refresh-prospects.mjs --dry     say what would happen
 *
 * Runs from ops/weekly.mjs, which calls it every Saturday; it does real work
 * once a month. Decision 018.
 *
 * WHY
 *
 * Decision 017 puts agencies registered in the last 90 days second in the
 * sending order, and they only stay new if the list is refreshed: a feed built
 * in September is a list of old agencies by December. Companies House publishes
 * the whole register as one free file in the first days of each month. This
 * fetches it, keeps employment agencies from the last 90 days, and runs the
 * discovery that was run by hand on 13 September (ops/build-prospects.mjs).
 * Every rule there still holds: no guessed address, robots.txt obeyed, limited
 * companies only.
 *
 * When the main UK list is within ten sending days of empty, it tops that up
 * from the same file. docs/state.md otherwise relies on a person noticing.
 *
 * The download is about 490 MB. It is kept only until it has been filtered.
 */

import { spawn } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { loadProspects } from '../outreach/prospects.mjs';
import { suppressed, DAILY_CAP } from '../outreach/send.mjs';
import { ROOT, CACHE, readState, writeState, recordRun } from './automation.mjs';

const FORCE = process.argv.includes('--force');
const DRY = process.argv.includes('--dry');

const DIR = path.join(CACHE, 'companies-house');
const BUILDER = path.join(ROOT, 'ops', 'build-prospects.mjs');
const NEW_CSV = path.join(ROOT, 'outreach', 'prospects-new.csv');
const MAIN_CSV = path.join(ROOT, 'outreach', 'prospects-uk-2.csv');

/** Companies to try per month. A month's new tier-A agencies are a few hundred. */
const NEW_LIMIT = 600;
const TOPUP_LIMIT = 1000;
const TOPUP_BELOW_DAYS = 10;

function fileName(d) {
  return `BasicCompanyDataAsOneFile-${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01.zip`;
}

/** This month's file if it is up, otherwise last month's. */
async function latestFile() {
  const now = new Date();
  for (const back of [0, 1]) {
    const name = fileName(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1)));
    const url = `https://download.companieshouse.gov.uk/${name}`;
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
      if (res.ok) return { name, url, bytes: Number(res.headers.get('content-length')) || 0 };
    } catch {
      // try the previous month
    }
  }
  return null;
}

/** Sendable UK prospects left, in days of the daily cap. The same test status.mjs applies. */
function ukDaysLeft() {
  const sentLog = path.join(ROOT, 'outreach', 'sent.log');
  const sent = new Set(existsSync(sentLog)
    ? readFileSync(sentLog, 'utf8').split('\n').map((l) => (l.split('\t')[1] || '').trim().toLowerCase()).filter(Boolean)
    : []);
  const skip = suppressed();
  const left = loadProspects()
    .filter((p) => /united kingdom|\buk\b|england|scotland|wales|ireland/i.test(p.country || ''))
    .filter((p) => {
      const e = (p.email || '').trim().toLowerCase();
      return e.includes('@') && !sent.has(e) && !skip.has(e);
    }).length;
  return left / DAILY_CAP;
}

const rows = (file) => (existsSync(file) ? Math.max(0, readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).length - 1) : 0);

async function download(file, dest) {
  mkdirSync(DIR, { recursive: true });
  const part = `${dest}.part`;
  console.log(`  downloading ${file.name} (${Math.round(file.bytes / 1e6)} MB)`);
  const res = await fetch(file.url, { signal: AbortSignal.timeout(2 * 3600_000) });
  if (!res.ok || !res.body) throw new Error(`download failed: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(part));
  const got = statSync(part).size;
  if (file.bytes && got !== file.bytes) throw new Error(`download incomplete: ${got} of ${file.bytes} bytes`);
  renameSync(part, dest);
}

function exited(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) return resolve(child.exitCode);
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

/** The zip holds one CSV. Stream it out and into the filter, never onto disk (it is 2.8 GB). */
async function filterInto(zip, args) {
  const unzip = process.platform === 'win32'
    ? spawn(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-xOf', zip], { stdio: ['ignore', 'pipe', 'inherit'], windowsHide: true })
    : spawn('unzip', ['-p', zip], { stdio: ['ignore', 'pipe', 'inherit'] });
  const filter = spawn(process.execPath, [BUILDER, 'filter', ...args], { cwd: ROOT, stdio: ['pipe', 'inherit', 'inherit'], windowsHide: true });
  unzip.stdout.pipe(filter.stdin);
  const [a, b] = await Promise.all([exited(unzip), exited(filter)]);
  return a || b;
}

async function discover(args) {
  const child = spawn(process.execPath, [BUILDER, 'discover', ...args], { cwd: ROOT, stdio: 'inherit', windowsHide: true });
  return exited(child);
}

async function main() {
  console.log(`\nrefresh · Companies House · ${new Date().toISOString().slice(0, 10)}${DRY ? ' · dry run' : ''}`);

  const file = await latestFile();
  if (!file) {
    console.log('  no file found for this month or last');
    if (!DRY) recordRun('refresh', { ok: false, summary: 'Companies House file not found for this month or last' });
    process.exitCode = 1;
    return;
  }

  const state = readState('refresh', {});
  if (state.file === file.name && !FORCE) {
    console.log(`  ${file.name} already done on ${String(state.at).slice(0, 10)}; next file early next month`);
    if (!DRY) recordRun('refresh', { ok: true, skipped: true, summary: `up to date with ${file.name}` });
    return;
  }

  const days = ukDaysLeft();
  const topUp = days < TOPUP_BELOW_DAYS;
  console.log(`  file        ${file.name}`);
  console.log(`  new         agencies registered in the last 90 days, up to ${NEW_LIMIT} tried`);
  console.log(`  main list   ${days.toFixed(1)} sending days left${topUp ? `, under ${TOPUP_BELOW_DAYS}: topping up, up to ${TOPUP_LIMIT} tried` : '; no top-up needed'}`);
  if (DRY) return;

  const zip = path.join(DIR, file.name);
  const newCh = path.join(DIR, 'ch-new.csv');
  const allCh = path.join(DIR, 'ch-agencies.csv');
  const before = { fresh: rows(NEW_CSV), main: rows(MAIN_CSV) };
  const failures = [];

  try {
    if (!existsSync(zip) || (file.bytes && statSync(zip).size !== file.bytes)) await download(file, zip);

    if (await filterInto(zip, ['--since', '90', '--out', newCh])) failures.push('filter (new)');
    if (topUp && await filterInto(zip, ['--out', allCh])) failures.push('filter (main)');
    // Filtered: the 490 MB has done its job. Kept if a filter failed, so a
    // retry does not download it again.
    if (!failures.length) rmSync(zip, { force: true });

    if (!failures.includes('filter (new)') && await discover(['--in', newCh, '--new', '--limit', String(NEW_LIMIT)])) failures.push('discover (new)');
    if (topUp && !failures.includes('filter (main)') && await discover(['--in', allCh, '--limit', String(TOPUP_LIMIT)])) failures.push('discover (main)');
  } catch (e) {
    failures.push(e.message);
  }

  const added = { fresh: rows(NEW_CSV) - before.fresh, main: rows(MAIN_CSV) - before.main };
  const summary = `${file.name}: ${added.fresh} new agencies added` +
    (topUp ? `, ${added.main} added to the main list` : '') +
    (failures.length ? `; FAILED ${failures.join(', ')}` : '');
  console.log(`\n  ${summary}\n`);

  // A failed month is not marked done, so next Saturday tries again.
  if (!failures.length) writeState('refresh', { file: file.name, at: new Date().toISOString(), added });
  recordRun('refresh', { ok: !failures.length, added, summary });
  if (failures.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('refresh failed:', e?.message || e);
  recordRun('refresh', { ok: false, summary: `failed: ${e?.message || e}` });
  process.exit(1);
});
