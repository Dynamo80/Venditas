# 013 — Agencies already paying a competitor go first, and follow-ups get a ceiling

**Date:** 2026-09-13 · **Status:** active
**Amends:** the spending order in [010](010-the-routine-runs-itself.md)

## Decision

- `outreach/prospects-hot.csv` lists UK agencies that a CV-formatting
  competitor publicly names as a customer: HireAra's customer page and case
  studies, The Access Group's case studies, Allsorter's testimonials. Every row
  carries the URL that says so (`evidence_url`). Fifteen rows, from a list of
  twenty-one: six had no published email, or the only evidence was a logo.
- The batch sorts these ahead of every other prospect.
- They get a different first email (`composeSwitch` in `outreach/batch.mjs`):
  it says where we saw them, does not explain a job they already pay to have
  done, and makes no claim about the competitor beyond that page. The ask is
  the renewal date, not a call.
- `ops/daily.mjs` spends at most **15** of the 25 daily sends on follow-ups.
  New prospects always get the rest.

## Why

**Intent.** An agency paying for HireAra has already decided the problem is
worth money and that software should do it. The remaining question is price and
trust, which is a shorter conversation than the one the ordinary cold email has
to start.

**The follow-up queue after a gap.** Sending stopped on 3 September. When it
restarts, 54 day-3 and day-8 follow-ups are due at once. Under 010's order they
would take all 25 sends on Monday and Tuesday, and the fifteen best-qualified
prospects on the list would wait until Wednesday behind a cohort that has
produced no replies in ten days, several of whom were sent a mis-rendered
sample (see commit `916cd26`).

**Why not drop the follow-ups.** Most of a cold sequence's replies come from the
second message; that reasoning in 010 still holds. The ceiling delays them by a
day or two. It does not skip them.

## Rejected

- **Quoting HireAra's price in the email.** Our own Quibench page cites
  "from £180 a month", but it was not re-verified for this, and a wrong number
  about a competitor, sent to that competitor's customer, is the fastest way to
  look careless.
- **Naming an incumbent on logo-only evidence** (Pertemps, The ONE Group). A
  logo on a 2022 homepage snapshot is not proof they are a customer today.
- **Candidately and Daxtra as incumbents.** Adjacent products, not the same job.
  Pioneer Selection stays at the top of the list but gets the ordinary email.
