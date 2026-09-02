# 003 — Strip identifiers before the model sees them

**Date:** 2026-09-02 · **Status:** active

## The problem

Extraction runs on Google's **unpaid** Gemini tier. Google's terms for that tier
permit using submitted content to improve their products, including human
review, and explicitly ask you not to submit personal information. A candidate's
CV is exactly that.

The founder will not enable billing. So sending CVs as-is would have made the
site's central promise untrue.

## Decision

Remove direct identifiers **locally, before anything leaves the server**:
name, email, phone and personal links, replaced with `[NAME]`, `[EMAIL]`,
`[PHONE]`, `[LINK]`. Google receives an employment history with the person taken
out of it. The identifiers are merged back into the structured result locally.

Implementation: `lib/deidentify.mjs`.

## Why this is better engineering, not just a workaround

A regular expression reads an email address more reliably than a language model,
costs nothing, and cannot hallucinate a phone number that was never on the page.
Contact extraction got *more* accurate.

## Two things that are not obvious

**Name detection uses the email address.** Position on the page is unreliable —
a two-column CV puts the sidebar first, so the name can be twenty lines down
while "CONTACT" and "SKILLS" sit at the top. Tokens from the email local part
(`priya.raghunathan@` → priya, raghunathan) find it regardless of layout.

**Scanned CVs are an exception.** A page image cannot be redacted this way, so it
goes to Google as-is. Disclosed in the privacy policy rather than quietly
ignored.

## Honest limit

This is pseudonymisation, not anonymisation. An employment history with dates and
employers can still identify someone in combination, and under GDPR it remains
personal data. It materially reduces exposure. It does not make the free tier
appropriate for data anyone would call sensitive.

**If a paying customer asks, the correct answer is to enable billing on Gemini.**
It costs roughly a hundredth of a cent per CV.
