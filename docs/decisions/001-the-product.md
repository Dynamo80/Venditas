# 001 — Sell CV reformatting to recruitment agencies

**Date:** 2026-09-02 · **Status:** active

## Decision

Build a tool that reformats a candidate CV into a recruitment agency's branded
Word template, with the candidate's contact details removed.

## Why, after rejecting seven alternatives

The founder has no audience, no network, no domain expertise and no budget, and
can code. That combination kills most ideas before they start.

**Rejected, and why — do not revisit these without new information:**

- **AI API reliability monitoring (built, then killed).** Any team that would
  buy it can write it in an afternoon. The founder's own words: teams build it
  in-house, and the tools that exist do not convert. Correct call.
- **Cold email personalisation.** Tried previously by the founder and failed on
  output quality. Anything where an LLM's raw prose *is* the deliverable is out.
- **Web accessibility compliance, EU tender alerts, Shopify catalogue
  intelligence.** All rejected as commoditised or as customers the founder
  cannot judge a product for.
- **Productized service / agency work.** Highest probability of revenue by a
  wide margin, and explicitly refused: the founder wants a product.
- **Anything e-commerce.** Refused.

## What makes this one different

The buyer **cannot build it themselves** — recruiters are not engineers. That
single fact is what killed the monitoring product and what this one survives.

The work is genuinely technical: parsing badly-made PDFs and Word files,
extracting structure from inconsistent layouts, generating a branded document.

The output is a document and typed fields, checkable against the source in
seconds. Not prose, so the previous failure mode cannot recur.

## Known risk

Twelve or more competitors, four of seven major CRMs now ship this natively, and
Quibench — a UK tool doing exactly this — shut down in August 2026. See
`docs/reference/competitors.md`. This is a crowded market entered deliberately,
on the grounds that crowding proves demand.
