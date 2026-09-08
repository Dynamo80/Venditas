# Runbook — send a day's outreach

## Normally, you do not

The routine is scheduled. `ops/install-schedule.ps1` registers it on weekdays at
14:00 IST and it catches up a day the laptop slept through. Decision 010.

To run it by hand — a first look, or a day the scheduler was off:

```bash
node ops/preflight.mjs                 # can mail leave at all?
node ops/daily.mjs                     # what would go out; sends nothing
node ops/daily.mjs --send --confirm    # the real run
```

`daily.mjs` does preflight, inbox, nurture, follow-ups and the batch in that
order, spending one shared 25/day budget across all three senders. Running the
individual commands below still works, but each defaults to a cap of 25 *of its
own* — run three of them by hand on a busy day and the domain sends fifty.

Everything after this section is the manual path and the reasoning behind the
limits. Read it once; it is why the automated version behaves as it does.

## Before the first send of a new list

```bash
node ops/status.mjs          # confirm production is healthy
node outreach/batch.mjs --n 10   # dry run, writes .docx for review, sends nothing
```

Open several of the generated documents in `outreach/batches/<date>/`. Check the
logo is the right agency's and the colour is not obviously wrong. Brand colours
are the least reliable field in the list.

## Sending

```bash
node outreach/batch.mjs --n 25 --send --confirm
```

**Both flags are required.** One is too close to a typo for something that mails
strangers from a domain that cannot be un-burned.

## The limits, and why

- **25 emails/day.** One domain with no sending history. Exceeding this is how
  the domain stops reaching inboxes, and no amount of good copy recovers it.
- **One message every 20 seconds**, enforced by the pooled transport. A burst
  from a cold domain is the clearest spam signal there is.
- GoDaddy caps outbound around 250–500/day and forbids unsolicited *bulk* mail.
  25 individually-personalised messages is correspondence, not bulk, and sits
  inside both the number and the intent.

## Why the Sent folder looked empty

Sending is SMTP. The Sent folder is IMAP. A mail client writes that copy itself
after sending; a script talking SMTP never does — so the first batch of 25 went
out and left an empty Sent folder, which looked exactly like nothing had
happened.

Every send now files a copy over IMAP, using the same bytes that were
transmitted rather than a rebuild, so the record cannot drift from what the
recipient actually received. It is best-effort: failing to file a copy never
fails a send that already reached its destination.

**The first 25 are not in Sent and cannot be put there retroactively** — their
raw bytes were not kept. The documents and the manifest for that batch are in
`outreach/batches/2026-09-02/`.

## Proving a batch actually went

```bash
node outreach/inbox.mjs
```

Reads the mailbox for bounces and replies. A delivery failure arrives within
minutes, so an inbox with no bounces a few hours after a batch is real evidence
of delivery — better evidence than the relay's acceptance, which only says it
took responsibility.

## Guarantees already enforced in code

- Nobody on `outreach/suppressed.txt` is contacted, ever
- Nobody in `outreach/sent.log` is contacted twice
- Every message carries a signed one-click unsubscribe and the postal address
- If the opt-out list cannot be read, sending **refuses to run** rather than
  guessing

## When someone replies

Reply personally, from the same address. Do not send a sequence to someone who
has answered — that is the fastest way to be marked as automated.

Recording a sale: see the comment at the bottom of `sql/003_customers.sql`.

## The rest of the daily routine

Sending new prospects is the last step, not the first. Before it:

```bash
node outreach/inbox.mjs                # replies and bounces; marks repliers
node outreach/nurture.mjs --send       # trial users who hit 5 and 10 CVs
node outreach/followup.mjs --send      # day-3 and day-8 follow-ups
```

Follow-ups and nurture emails count toward the same 25-a-day cap; the batch
takes whatever is left.

## When the list runs low

`node ops/status.mjs` prints days of UK list remaining. Under a week:

```bash
node ops/build-prospects.mjs discover --in <scratch>/ch-agencies.csv --limit 2000
```

It appends verified agencies to `outreach/prospects-uk-2.csv`, which the batch
already reads. First-time setup (the 490 MB Companies House download and the
filter) is documented at the top of the script. Nothing in it guesses an
email address; every row's address was read off the agency's own site.
