# 010 — The daily routine runs itself, on the laptop

**Date:** 2026-09-08 · **Status:** active

## Decision

- The five-command morning becomes one: `node ops/daily.mjs --send --confirm`.
- It is registered with **Windows Task Scheduler** on the founder's machine
  (`ops/install-schedule.ps1`), weekdays, with `StartWhenAvailable` so a missed
  day runs when the machine next wakes.
- It installs as a **dry run**. Arming it is a separate, deliberate `-Live`.
- `ops/preflight.mjs` runs first and stops everything if mail cannot leave.
- The 25/day cap is counted **once, across every sender**, not once per script.

## What went wrong that this fixes

Batches went out on 2 and 3 September. Nothing went out from 4 to 8 September —
five working days, 125 sends, unrecoverable, because an unused cap does not roll
over. That is about a quarter of everything the thirty days had left.

Two separate failures, and it matters which is which:

**The mail host became unreachable.** `batch.mjs` refuses to send when it cannot
read the mailbox, which is right. But the refusal surfaced as a stack trace at
the end of a command, and the command was only run when someone remembered to
run it.

**Nothing said so.** `status.mjs` is the morning glance and it showed a healthy
site, a healthy database, and a send count that had stopped moving. An outage
and a quiet morning were indistinguishable from the one place the founder looks.

The routine being scripted was never the problem. Every one of those five
commands worked. The problem was that a person had to initiate them, and the
system had no opinion about a day on which nobody did.

## Why a shared budget

`batch.mjs`, `followup.mjs` and `nurture.mjs` each default to `--n 25`,
independently. Running the documented morning in order could therefore put fifty
or more messages out of a domain whose entire protection is that it sends
twenty-five. Nobody had hit it because the follow-up queue was empty; it was a
trap waiting for the first busy day.

`daily.mjs` reads `sent.log`, computes what is left, and spends it in priority
order: **nurture, then follow-ups, then new prospects.** A conversation already
started is worth more than a stranger not yet written to, and the trial users are
both the most qualified addresses in the funnel and the fewest.

## Rejected: GitHub Actions

The obvious answer, and wrong here. The runner would need `sent.log`,
`contacted.csv` and `suppressed.txt` to know who has already been mailed, and
would have to commit them back to keep that state between runs. The repository
is public, and commit `c3e0774` deliberately removed exactly those files after a
blind `git add -A` published the contact ledger. Rebuilding that mistake as a
scheduled job is not a trade worth making for a scheduler.

It becomes the right answer the day the repository goes private. Until then the
state stays on one machine, which is also where the mail credentials already are.

**Rejected: a Vercel cron.** Free-tier crons are one run a day, the batch renders
a preview image per prospect and would not finish inside the function timeout,
and it would put SMTP credentials and the prospect list into the hosting
environment for the sake of a timer.

**Rejected: catching up the missed 125 sends.** The cap exists to protect a
sending reputation, and a domain that sent 25 a day and then suddenly sends 150
is a domain that gets filtered. The five days are gone. The plan is recomputed
around 450 remaining sends rather than pretending otherwise.

## Consequences

- The scheduled task only runs while the laptop is on. `StartWhenAvailable`
  covers a machine that was asleep at the scheduled minute; it does not cover a
  machine that is off all day. That is the residual risk and it is accepted, on
  the grounds that the alternative publishes the contact ledger.
- `daily.mjs` exits non-zero when a stage fails, so Task Scheduler's last-result
  column is worth looking at.
- `ops/daily.log` records one line per run. `*.log` is already gitignored.
- `status.mjs` now probes the mail host, so the morning glance answers "can
  anything go out today" before it answers anything else.
