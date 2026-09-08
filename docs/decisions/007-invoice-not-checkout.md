# 007 — Collect money by invoice; annual prepay counts

**Date:** 2026-09-03 · **Status:** active

## Decision

- No checkout. Customers are invoiced by hand and pay by bank transfer: UK
  and US customers into local-currency accounts via Skydo, Indian customers
  into an Indian account or by UPI.
- The pricing page button opens a pre-filled email asking for the three
  things an invoice needs. A payment URL can replace it later by setting
  `NEXT_PUBLIC_PAY_URL`; nothing else changes.
- Annual prepay is offered at ten months for twelve (£790 / $990 / ₹65,000)
  and counts toward the MRR goal at its monthly equivalent.

## Why

**Razorpay is unavailable.** The account is registered for a different
business and cannot be changed to this one. That was the only card rail with
an Indian entity behind it.

**A merchant of record (Paddle, Lemon Squeezy, Polar) was rejected** for now.
It would give a real checkout in a day and handle UK VAT, but the founder
chose Skydo, which already exists and costs nothing per month. Revisit when
re-invoicing monthly customers by hand takes more than an hour a month; that
is roughly fifteen customers, which is also the goal.

**Manual invoicing is not a compromise at this size.** Every one of the first
twenty customers will have talked to the founder anyway; the invoice is one
more email in a thread that already exists. What matters is that it is sent
within the hour, which `docs/runbooks/invoice.md` exists to make routine.

**Annual prepay** is worth two months' discount because a business with no
recurring rail benefits more from twelve months of certainty than from the
extra £158, and because a customer who has paid for a year gives feedback
instead of churning.

## Rejected

- Stripe: requires a registered business entity in a supported country;
  the sole trader in India does not qualify.
- Waiting for the Razorpay category change: cannot happen.
- Charging per CV: the micro-competitors at $0.25–0.99 per CV have set a
  floor that makes the product look expensive by the unit; the value is in
  unlimited use by the whole agency (decision 004).
