/**
 * Once a week, the jobs that do not need doing daily.
 *
 *   node ops/weekly.mjs
 *
 *   1. seo       the live site checked against the repo; changed pages pushed to IndexNow
 *   2. refresh   new agencies from Companies House, when this month's file is new
 *
 * Scheduled for Saturday by ops/install-schedule.ps1, and run on waking if the
 * laptop was off. It tells the founder only what needs a person: pages built but
 * not live, pages with a problem, a stage that failed. A quiet week stays quiet.
 * Decision 018.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, notify, lastRun, recordRun, log } from './automation.mjs';

function stage(name, script, args, minutes) {
  process.stdout.write(`\n── ${name} ${'─'.repeat(Math.max(0, 56 - name.length))}\n`);
  const res = spawnSync(process.execPath, [path.join(ROOT, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: minutes * 60_000,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
  const out = `${res.stdout || ''}${res.stderr || ''}`.trimEnd();
  if (out) console.log(out.split('\n').map((l) => `   ${l}`).join('\n'));
  if (res.error?.code === 'ETIMEDOUT') return { name, ok: false, why: `timed out after ${minutes} min` };
  if (res.status !== 0) return { name, ok: false, why: `exit ${res.status}` };
  return { name, ok: true };
}

async function main() {
  console.log(`VENDITAS · weekly · ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`);

  const results = [
    stage('seo', 'ops/seo.mjs', ['--submit'], 10),
    stage('refresh', 'ops/refresh-prospects.mjs', [], 210),
  ];

  const seo = lastRun('seo');
  const refresh = lastRun('refresh');
  const needs = results.filter((r) => !r.ok).map((r) => `${r.name} failed (${r.why})`);
  if (results[0].ok && seo) {
    if (seo.pending?.length) needs.push(`${seo.pending.length} page(s) written but not live, e.g. ${seo.pending[0]}: deploy`);
    if (seo.problems) needs.push(`${seo.problems} SEO problem(s): run node ops/seo.mjs`);
  }

  const summary = [seo?.summary, refresh?.summary].filter(Boolean).join(' | ');
  log('weekly.log', `${needs.length ? `NEEDS: ${needs.join('; ')} | ` : ''}${summary}`);
  recordRun('weekly', { ok: results.every((r) => r.ok), needs, summary: needs.length ? needs.join('; ') : summary });

  if (needs.length) {
    await notify({ title: 'Weekly check: needs a look', body: [...needs, '', summary].join('\n') });
  }
  if (results.some((r) => !r.ok)) process.exitCode = 1;
}

main().catch(async (e) => {
  console.error('weekly failed:', e?.message || e);
  log('weekly.log', `ERROR ${e?.message || e}`);
  await notify({ title: 'Weekly jobs failed', body: String(e?.message || e) }).catch(() => {});
  process.exit(1);
});
