# Runbook — someone replied

A reply is the scarcest thing this business has. Twenty-five cold emails
produce one or two, and taking eight hours to answer one wastes the batch.
Everything below is one command.

## First, mark them

```bash
node outreach/reply.mjs <their-domain> --replied
```

Do this **before** anything else. It permanently excludes them from the day-3
follow-up. Chasing someone who already answered says plainly that nobody read
them, which is the exact impression a recruiter is trained to notice.

## See what we actually sent them

```bash
node outreach/reply.mjs <their-domain>
```

Prints the date, the sample CV used, the colour, whether their logo was found,
and the path to the Word file generated for them.

## Answer

```bash
node outreach/reply.mjs <their-domain> --draft price
```

Prints the draft without sending. Add `--send` to send it, and `--docx` to
attach the Word file.

| Draft | For |
|---|---|
| `interested` | "Looks good" / "send me more" — attaches the Word file |
| `price` | "How much?" |
| `data` | Anything about candidate data, GDPR, or a DPA |
| `crm` | They mention a CRM. **Read this one before sending** — if they are on Loxo, Recruit CRM, Zoho or Vincere, the honest answer is to walk away |
| `no` | A refusal. Thank them, then run `--replied` and add them to `outreach/suppressed.txt` |

## When they say it failed

A "tried it and it gave an error" reply usually arrives without the error.
Before answering, find out what happened; the tool tells you more than the
email does.

1. `node ops/status.mjs`. Under CUSTOMERS AND LEADS every lead shows
   *delivered of attempted*, and a **never delivered** line lists anyone whose
   attempts all errored (they never became a lead, because a lead is only
   recorded once a Word file has gone back). The date on that line should
   match when they wrote.
2. If it was in the last hour, the server's own error is still there:
   `vercel logs --project venditas --scope abin-johnsons-projects --level error --since 1h --no-follow`.
   Older than that and it is gone: Vercel keeps about an hour of logs on the
   free plan.
3. Otherwise ask for the exact wording, and match it here:

| They saw | It means |
|---|---|
| "Old .doc files are not supported yet" | Ask for .docx or PDF |
| "Unsupported file type" | Not a PDF or Word file |
| "No readable content" / "didn't look like a CV" | A scanned or image-only PDF with no text layer |
| "This one is on us — try again shortly" | Our side: the model call failed (Gemini free tier down or over quota) or a code fault. Every scanned PDF gave this until 15 September 2026 (decision 020) |
| "Blocked: the candidate's … would still have been visible" | The redaction check refused to ship a leak. A real bug in lib/deidentify.mjs; keep the file if they will share it |
| "Come back tomorrow" / "used all 10" | The trial limits, working as intended |

Reply personally either way. Ask them to try once more with the same file,
and if it is a .doc or a scan, say so plainly: those are the two failures
they can fix themselves. Do not send a sequence to someone who has written in.

## When they say yes

1. Send a Skydo invoice for £79, or a Razorpay link.
2. Record it in Postgres — the exact SQL is at the bottom of
   `sql/003_customers.sql`.
3. `node ops/status.mjs` should then show `paying 1`. If it does not, the sale
   is not recorded anywhere and will be forgotten.

## The rule

Reply personally, from the same address, and never send a sequence to someone
who has written to you. That is the fastest way to be marked as automated by
the one person who was interested.
