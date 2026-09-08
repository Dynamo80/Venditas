# 008 — India is the second market, not a replacement for the UK

**Date:** 2026-09-03 · **Status:** active · Extends 005, does not supersede it

## Decision

Sell to Indian recruitment agencies alongside UK agencies, at ₹6,500 a month.
The UK remains the primary market and gets the outreach cap first; Indian
prospects fill the cap on days the UK list cannot.

## Why

The goal is £1,000 MRR as fast as possible, and the founder is in Navi
Mumbai. Indian agencies submitting CVs to client hiring managers do the same
reformatting and have the same fee-protection reason to redact. Selling to
them means:

- Same timezone; replies within the hour without staying up.
- Domestic payment by bank transfer or UPI; no international rail needed.
- No UK GDPR transfer question, no Article 27 question, no IDTA.
- A pool the CRM screen in decision 005 barely touches, because the
  Loxo/Vincere installed base is small in India.

## What changes

- A separate prospect list, `outreach/prospects-in-1.csv`, built under the
  same rules as the first list: published addresses only, public pages only,
  no LinkedIn. Sourcing notes in `outreach/prospects-in-notes.md`.
- Pricing already had an INR price (`lib/pricing.mjs`); the pricing page
  shows it under `?c=in`.

## What does not change

- The 25-a-day cap. It protects the domain regardless of where the mail goes.
- The product. Sample CVs are UK-flavoured; an Indian sample is worth adding
  once the first Indian reply arrives, not before.

## The compliance consequence, stated rather than hidden

Decision 006's clean international-transfer story relies on the DPDP Act
section 17(2)(b) exemption, which covers processing of people **outside
India** under contract with a person outside India. Indian agencies and
Indian candidates fall outside that exemption, so the full DPDP Act applies
to that processing: notice, consent handled by the agency as Data Fiduciary,
security safeguards, and breach notification to the Data Protection Board.
The no-retention architecture makes most of this light, but "light" is not
"absent". `legal/compliance-notes.md` §11 has the questions for an Indian
lawyer; ask them before the first Indian invoice, not after.
