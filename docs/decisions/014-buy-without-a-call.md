# 014 — An agency can buy without a call

**Date:** 2026-09-13 · **Status:** active
**Supersedes:** "buying starts with a call" in [012](012-five-cv-demo-and-euro.md)
**Keeps:** invoice, not checkout, from [007](007-invoice-not-checkout.md)

## Decision

- The pricing page's main button is **"Get an invoice"**. It opens an email to
  founder@venditas.in that already asks for the agency's legal name, billing
  address, monthly or annual, and VAT number (`INVOICE_URL` in
  `lib/pricing.mjs`).
- The reply is a Skydo invoice (`docs/runbooks/invoice.md`). Unlimited CVs from
  the day it is paid.
- "Book 30 minutes with Abin" stays, underneath, for anyone who wants to see it
  on their own CVs first. It is no longer the only way in.

## Why

**The founder's time is the scarcest input.** 012 put a half-hour call in front
of every purchase so the first customers would teach us something. The cost is
that every sale waits for a calendar slot, and the founder has said he wants to
be involved as little as possible.

**The best prospects don't need the call.** Decision 013 puts agencies already
paying HireAra or Allsorter first. They know the job and are comparing on price.
For them a mandatory call is friction with nothing to learn.

**It is still a conversation.** An invoice by email is a thread with the
founder, so 012's point, that early customers should talk to the person who
built it, survives without a meeting.

## Rejected

- **A card checkout.** Still no free rail for an Indian sole trader: Razorpay is
  registered to another business (007), and a merchant of record takes a cut.
  The business spends nothing.
- **Dropping the call link.** Some agencies, and most compliance teams, want a
  human before they pay. It costs nothing to leave it there.
