/**
 * The whole morning routine, as one command.
 *
 *   node ops/daily.mjs                     what would happen; sends nothing
 *   node ops/daily.mjs --send --confirm    the real run
 *
 * WHY THIS EXISTS
 *
 * The routine was already scripted — five commands in docs/runbooks/outreach.md,
 * twenty minutes a day. It ran on 2 September, ran on 3 September, and then
 * stopped. By 8 September that was five working days at a 25/day cap: 125 sends
 * that cannot be recovered, because a cap you did not use yesterday is not
 * available today. The list was never the constraint and the copy was never the
 * constraint. The constraint was a person having to remember five commands
 * every morning.
 *
 * So: one command, and a scheduler that runs it whether or not anyone
 * remembers. `ops/install-schedule.ps1` registers it with Windows Task
 * Scheduler set to catch up on a missed day, because a laptop that was asleep
 * at nine is the ordinary case, not the exception.
 *
 * WHAT IT ADDS BEYOND CHAINING THE COMMANDS
 *
 * A shared budget. `batch`, `followup` and `nurture` each default to a 25-send
 * cap of their own, so running all three could put 50-plus messages out of a
 * domain whose whole protection is that it sends 25. Here the cap is counted
 * once, across every stage, from sent.log — and it is spent in the order that
 * values a conversation already started over a stranger not yet written to:
 *
 *   1. nurture    people using the trial right now. The most qualified
 *                 addresses we have, and the fewest.
 *   2. followup   day 3 and day 8. Most of the reply rate in a cold sequence
 *                 comes from the second message.
 *   3. batch      new prospects, with whatever is left.
 *
 * Nothing here decides who is contactable. Every existing guard still applies
 * underneath: the suppression list, the cooling period, opt-outs read live from
 * the database, weekday-and-working-hours, and the two-flag rule for sending to
 * strangers. This file only decides how many, in what order, and when.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { DAILY_CAP } from '../outreach/send.mjs';
import { isSendableNow } from '../outreach/contacted.mjs';

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..'
);
const SENT_LOG = path.join(ROOT, 'outreach', 'sent.log');
const RUN_LOG = path.join(ROOT, 'ops', 'daily.log');

/** At most this many follow-ups a day, so new prospects always get a share. Decision 013. */
const FOLLOWUP_MAX = 15;

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
// Two flags, as everywhere else that mails strangers. One flag is too close to
// a typo for something a scheduler will run unattended.
const LIVE = flag('send') && flag('confirm');
const FORCE = flag('force');   // ignore the working-hours window; for testing

/** Sends already made today, counted from the one log every sender appends to. */
function sentToday() {
  if (!existsSync(SENT_LOG)) return 0;
  const today = new Date().toISOString().slice(0, 10);
  return readFileSync(SENT_LOG, 'utf8')
    .split('\n')
    .filter((l) => l.startsWith(today)).length;
}

function remaining() {
  return Math.max(0, DAILY_CAP - sentToday());
}

/**
 * Each stage is a separate process on purpose. These scripts run at import and
 * call process.exit; more usefully, one of them throwing should not take the
 * rest of the morning with it. A stage that fails is reported and the next one
 * still runs.
 */
function stage(name, script, args, { timeout = 15 * 60_000 } = {}) {
  const started = Date.now();
  process.stdout.write(`\n── ${name} ${'─'.repeat(Math.max(0, 56 - name.length))}\n`);
  const res = spawnSync(process.execPath, [path.join(ROOT, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout,
  });
  const out = `${res.stdout || ''}${res.stderr || ''}`.trimEnd();
  if (out) console.log(out.split('\n').map((l) => `   ${l}`).join('\n'));

  const seconds = Math.round((Date.now() - started) / 1000);
  if (res.error?.code === 'ETIMEDOUT') {
    console.log(`   ! ${name} timed out after ${seconds}s`);
    return { name, ok: false, why: 'timed out' };
  }
  if (res.status !== 0) {
    console.log(`   ! ${name} exited ${res.status}`);
    return { name, ok: false, why: `exit ${res.status}` };
  }
  return { name, ok: true, seconds };
}

async function main() {
  const now = new Date();
  console.log('='.repeat(66));
  console.log(` VENDITAS · daily routine · ${now.toISOString().replace('T', ' ').slice(0, 16)} UTC`);
  console.log(`${'='.repeat(66)}`);
  console.log(LIVE ? ' mode  LIVE — this sends mail' : ' mode  dry run — add --send --confirm to send');

  if (LIVE && !existsSync(path.join(ROOT, '.env.local'))) {
    console.error('\n .env.local not found. Nothing can be sent from here.');
    process.exit(2);
  }

  // The window is the recipients' window, not ours. A cold email that lands at
  // 03:00 on a Sunday is read as automation, which is the one thing the whole
  // sequence is written to avoid.
  const when = isSendableNow(now);
  if (LIVE && !when.ok && !FORCE) {
    console.log(`\n not a sending window: ${when.why}. Nothing sent.`);
    console.log(' the scheduler will pick this up on the next weekday morning.');
    log(`skipped — ${when.why}`);
    return;
  }
  console.log(` window ${when.why}`);

  const startedWith = sentToday();
  console.log(` budget ${remaining()} of ${DAILY_CAP} left today (${startedWith} already sent)\n`);

  // Stage zero: is sending possible at all? Without this the run spends its
  // first fifteen minutes discovering, one timeout at a time, that the mail
  // host is unreachable — and then says so in a stack trace. Ask once, plainly,
  // and stop if the answer is no.
  const pre = spawnSync(process.execPath, [path.join(ROOT, 'ops/preflight.mjs')], {
    cwd: ROOT, encoding: 'utf8', timeout: 3 * 60_000,
  });
  console.log((pre.stdout || '').trimEnd());
  if (pre.status === 1) {
    console.log(' Nothing was attempted. Fix the mail path, then run this again.\n');
    log('BLOCKED — mail host unreachable, nothing attempted');
    process.exitCode = 1;
    return;
  }

  const results = [];

  // Read the mailbox first, always, even on a day with no budget left. A reply
  // that goes unseen gets chased by the day-3 follow-up, which tells the one
  // interested person that nobody read them; a bounce that goes unseen gets
  // sent to again, and repeat bounces are how a domain's reputation dies.
  results.push(stage('inbox — replies and bounces', 'outreach/inbox.mjs', LIVE ? ['--apply'] : []));

  if (remaining() === 0) {
    console.log('\n cap already spent today. Inbox read; nothing sent.');
    log(`inbox only — cap already spent (${startedWith} sent)`);
    return summary(results, startedWith);
  }

  // 1. Trial users. Tiny volume, highest intent: someone who has run five CVs
  //    has spent real time on the output and nobody has ever spoken to them.
  results.push(stage('nurture — trial users at 5 and 10 CVs', 'outreach/nurture.mjs', LIVE ? ['--send'] : []));

  // 2. Follow-ups, then 3. new prospects, each taking what is left at the
  //    moment it runs rather than what was left when the run started.
  //
  //    Follow-ups are capped below the whole budget (decision 013). After a
  //    gap in sending, overdue follow-ups can fill the day on their own, and
  //    the agencies already paying a competitor for this job would wait behind
  //    a cohort that has not replied in ten days.
  if (remaining() > 0) {
    const n = String(Math.min(remaining(), FOLLOWUP_MAX));
    results.push(stage('follow-up — day 3 and day 8', 'outreach/followup.mjs',
      LIVE ? ['--send', '--confirm', '--n', n] : ['--n', n]));
  }
  if (remaining() > 0) {
    results.push(stage('batch — new prospects', 'outreach/batch.mjs',
      LIVE ? ['--send', '--confirm', '--n', String(remaining())] : ['--n', String(remaining())]));
  } else {
    console.log('\n── batch — new prospects ───────────────────────────────\n   no budget left after follow-ups; skipped');
  }

  summary(results, startedWith);
}

function summary(results, startedWith) {
  const sent = sentToday() - startedWith;
  const failed = results.filter((r) => !r.ok);

  console.log(`\n${'='.repeat(66)}`);
  console.log(` sent this run   ${sent}`);
  console.log(` sent today      ${sentToday()} of ${DAILY_CAP}`);
  for (const f of failed) console.log(` FAILED          ${f.name} (${f.why})`);
  console.log(' next            replies are the scarcest thing here — answer them first');
  console.log(`${'='.repeat(66)}\n`);

  log(
    `${LIVE ? 'live' : 'dry'} — sent ${sent}, today ${sentToday()}/${DAILY_CAP}` +
    (failed.length ? `, FAILED: ${failed.map((f) => f.name).join('; ')}` : '')
  );

  // A scheduled task that always exits 0 is a scheduled task nobody notices has
  // broken. Non-zero when a stage failed, so Task Scheduler shows a last-result
  // that is worth looking at.
  if (failed.length) process.exitCode = 1;
}

function log(line) {
  try {
    appendFileSync(RUN_LOG, `${new Date().toISOString()}\t${line}\n`);
  } catch {
    // A log that cannot be written must not stop the mail going out.
  }
}

main().catch((e) => {
  console.error('daily routine failed:', e?.message || e);
  log(`ERROR ${e?.message || e}`);
  process.exit(1);
});
