# 015 — The goal is £10,000 MRR; £1,000 is the first milestone

**Date:** 2026-09-13 · **Status:** active
**Supersedes:** the £1,000 goal in `CLAUDE.md` and `docs/state.md`
**Keeps:** `docs/plan-30-days.md` as the plan for the first £1,000, unchanged

## Decision

- The goal is **£10,000 MRR**. Set by the founder on 2026-09-13. No date yet.
- £1,000 by 2026-10-02 stays, as the first milestone. `ops/status.mjs` prints
  both, computed from `lib/pricing.mjs`.

## The arithmetic

**77 agencies.** The first 20 pay the £79 founding price (004), and everyone
after that pays £149: 20 × £79 + 57 × £149 = £10,073. At £79 for everyone it
would take 127 agencies. The limit of 20 founding-price places is the
reason it is 77.

**The market is not the ceiling.** 77 is about 0.3% of the ~29,000 UK
recruitment businesses under 50 staff (`docs/reference/market.md`). HireAra
claims more than 1,000 agencies.

**Distribution is.** The whole UK prospect list is about 1,600 agencies. To
reach the goal, 1 in 21 of them would have to pay. Cold email from an unknown
vendor gets roughly one customer per 250–500 sends (`plan-30-days.md`).
At 25 sends a weekday, about 6,300 a year, that is **13–25 new agencies a
year**. The goal would take three to six years, before churn.

**Churn changes the target.** *Inference, not measured:* at 3% a month,
typical for small-business SaaS, 77 customers lose two or three a month, and
the funnel has to replace them just to stand still. At £1,000 that is nothing.
At £10,000 it is a channel's worth of work.

## What it does not change

**This week.** There are zero customers, and the first paying agency is the
next step towards £1,000 and towards £10,000 alike. Mail is unblocked (preflight
READY on 2026-09-13) and the daily routine is registered to send for real. Replies
still get an answer within the hour.

## What it conflicts with — the founder's call, not decided here

Each of these was decided with £1,000 in mind. Each one caps the business below
£10,000. They are listed here, not reversed:

| Constraint | Where decided | Why £10,000 strains it |
|---|---|---|
| Zero budget: one sending domain, 25 a day | `CLAUDE.md`, plan | Cold email tops out at 13–25 agencies a year |
| Warm audience (Hustlr, Labs60) kept separate | `plan-30-days.md` | The only channel on record that beats cold by an order of magnitude |
| No CRM integration | `research/pricing.md` §1, §7 | Every competitor priced above £149 has one. Bullhorn Marketplace is also where buyers shop: Allsorter and Kyloe are listed there |
| One plan, £79 then £149 | 004 | 77 agencies at about £131 each on average. A higher tier for 20–50 staff agencies cuts the count needed (HireAra sells £450 and £950 plans). *Illustration only:* 20 × £79 + 30 × £149 + 15 × £299 ≈ £10,500 from 65 agencies |
| Invoices by hand, through Skydo | 007 | 77 invoices a month at about ten minutes each is about 13 hours a month, most of the founder's time |
| Founder has 1–2 hours a day | plan | Replies, invoicing and support for 77 accounts do not fit in that |

## Rejected

- **Rewriting the thirty-day plan around £10,000.** That plan's own arithmetic
  already says £1,000 is out of reach by 2 October. Putting a bigger number on
  the same page would change nothing anyone does this week.
- **Moving everyone to £149 now to shrink the count.** `research/pricing.md` sets
  £149 as the price for a product that has a CRM integration and customer
  references, and this one has neither. No customers at £149 is further from
  £10,000 than 20 customers at £79. Decision 004 stands.
- **Choosing which constraint to break.** Every constraint in the table above
  belongs to the founder. This file records that they now conflict with the goal.
  It does not choose which one gives way.
