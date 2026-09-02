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
