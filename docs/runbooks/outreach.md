# Runbook — send a day's outreach

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
