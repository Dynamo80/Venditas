# 006 — Nothing about a candidate is stored

**Date:** 2026-09-02 · **Status:** active

## Decision

Candidate CVs are processed in memory and discarded when the request ends. No
bucket, no queue, no backup, no candidate database accumulating behind the
product.

Stored instead: the **user's** email and agency name, a usage count, and a
salted hash of their IP for rate limiting. Never the raw IP.

## Why this is a commercial asset, not just hygiene

The founder is a sole trader in India selling to UK agencies, who will ask for a
data processing agreement before they pay. "No candidate data at rest" makes the
international transfer risk assessment unusually clean, and it should lead every
procurement conversation.

## Three ways this was nearly untrue

Found in a review of the code, all fixed:

1. **Errors carried CV content into logs.** `extract.mjs` put 300 characters of
   Google's error response into the thrown message, and the route logged the
   whole error object. An API error can echo the request back. Now errors carry
   a status and error code only.
2. **Nothing was ever deleted.** No purge existed. `sql/002_retention.sql` now
   removes counters after 90 days and dormant leads after 24 months.
3. **Fonts loaded from Google**, sending every visitor's IP to Google to fetch a
   typeface. Now self-hosted.

## The one deliberate exception

Rows marked `may_contact = false` are **never** deleted. That flag is the record
of an opt-out; deleting it is how a suppression list forgets someone asked to be
left alone and emails them again two years later.
