# 004 — £79 founding price, £149 standard, ten-CV trial

**Date:** 2026-09-02 · **Status:** active

## Decision

- **Trial:** 10 CVs total per email address. Not per day.
- **Agency:** £79 / $99 / ₹6,500 per month, unlimited CVs, everyone in the
  agency included, no per-seat charge.
- £79 is a **founding price** for the first 20 agencies, honoured for as long as
  they stay. Standard is £149.

## The free tier was a pricing bug

It was five CVs a day — about 110 a month. HireAra's *paid* entry tier allows
125 a month for £180. We were giving away roughly 88% of a competitor's paid
product, forever. That is not generosity, it is a leak.

## Why £79 and not £149

£149 is defensible on value: HireAra charges £180 + VAT, and a year of this is
about 23% of a **single** UK placement fee (~£7,800 at 20% of median salary).

The problem is anchoring, not value. A cluster of micro-competitors sits at
$0.25–0.99 per CV and $25–95 per month, several advertising no per-seat fees, so
a prospect often arrives expecting £50. Against that, with no reviews and no
track record, £149 is a hard first sale.

## Why "founding price" rather than a quiet discount

Discounting silently and raising it later is the version that costs trust. Named
as temporary, honoured permanently for the people who took the risk, with the
standard price printed next to it.

## Arithmetic

£1,000 MRR ≈ **13 customers at £79**, or 7 at £149. Every price lives in
`lib/pricing.mjs` — change it there, not in five pages.
