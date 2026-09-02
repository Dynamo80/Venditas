# 002 — Redaction is the product, formatting is the wrapper

**Date:** 2026-09-02 · **Status:** active

## Decision

Treat removing the candidate's contact details as the core feature. Redaction is
on by default; turning it off requires an explicit choice. Every generated
document is checked after rendering and the request **fails** if any identifier
would still be visible.

## Why

An agency reformats a CV for one commercial reason: if the client can see the
candidate's email, the client can hire them directly and the agency loses a
placement fee worth thousands. The branded template is presentation. The
redaction is the money.

## The positioning nobody else has taken

Every competitor frames anonymisation as diversity, bias reduction or GDPR. Not
one frames it as fee protection — *your client cannot go around you*. That is
the reason agencies actually do it, it is free to claim, and it is more
commercially urgent than the framing everyone else uses.

## Why it fails closed

Returning nothing is better than returning a CV with the candidate's email in
it. The first costs a support email; the second costs the customer a placement
and costs us the customer. `redactionLeaks()` runs on the rendered document, not
on the code path, because trusting the code path is how this breaks silently.

## Caveat found in research

Redaction demand is less universal than it looks. Some clients refuse anonymised
CVs, and HireAra — the largest UK player — does not mention redaction at all.
Real, but not universal.
