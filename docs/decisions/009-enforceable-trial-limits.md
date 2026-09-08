# 009 — The trial limits count against keys a visitor cannot mint

**Date:** 2026-09-08 · **Status:** active · **Refines:** [004](004-pricing.md)

## Decision

Decision 004 set the trial at ten CVs total, five a day. The numbers do not
change. What changes is that they are now enforceable:

- Metering counts against the **canonicalised** address — sub-address tags
  stripped everywhere, dots stripped for Google's domains — not the string typed
  into the form.
- The IP counter uses the address our **own edge** wrote, never the first entry
  of `x-forwarded-for`, and folds IPv6 to its /64.
- Both counters and the lifetime total move in **one database transaction**
  (`bump_trial`, `sql/005_trial_limits.sql`).
- The lifetime total lives in `usage_totals`, which the 90-day purge does not
  touch.
- Fail-open on a metering outage stays, but an in-process counter
  (`LOCAL_BURST`, 20/hour/source) sits behind it.

## What was actually broken

Five a day and ten in total were both free for the asking:

| Loophole | What it cost |
|---|---|
| `alice+1@gmail.com`, `alice+2@…` | A different digit, one inbox, a new counter each time |
| `a.l.i.c.e@gmail.com` | Google ignores the dots; the counter did not |
| `X-Forwarded-For: <anything>` | The header is written by the caller. The first entry was read. A fresh IP bucket per request — and a way to burn a stranger's allowance by claiming their address |
| One IPv6 host | A home allocation is a /64 at worst. Counting whole addresses meant an unlimited supply of them |
| The 90-day purge | The lifetime total was summed from `usage_daily`, which the retention job empties. Ten CVs, every quarter, forever |
| Three round trips | Two uploads arriving together both read nine used, and both went through |
| A 400 on the lifetime query | Its `catch` returned 0. The address went into the URL unescaped, so a `(` in it disabled the trial cap |
| `anything.mailinator.com` | The disposable list matched the bare domain only |

The first two are the ones that mattered. They need no tooling, no proxy and no
knowledge of how the site works — only the observation that a plus sign exists.

## Why the address is canonicalised for counting but not for writing

`recordLead` still stores what the visitor typed. Stripping `+desk` is right for
counting and wrong for writing: on a domain that treats `+` literally the two are
different mailboxes, and one of them may belong to somebody else. Yahoo's hyphen
aliases are left alone for the same reason — `john-smith@yahoo.com` is a name,
and folding it would make two strangers share one trial.

## What is still not enforced, deliberately

**No address is verified.** Anyone can type a stranger's address, or a plausible
invention, and get ten CVs. Verification means a confirmation email before the
first document, and the gate exists to catch a lead at the moment of highest
intent — an interstitial there costs more prospects than the CVs cost us.

So the email limit is a speed bump and the **IP cap is the real bound**. That was
already the intent (`HARD_IP_CAP`, 12/day, above the 5 so a shared office NAT
does not lock out a colleague); it just was not true, because the key it counted
against was a header anyone could type. It is true now.

**Rejected: a stricter IP cap.** Dropping it to 5 would match the per-day figure
and lock out the second person at any agency behind one NAT — the exact visitor
we want. Twelve is the compromise, and it is why alias-farming is capped at
twelve a day rather than five.

**Rejected: proof-of-work or a CAPTCHA.** Both tax every honest visitor to price
out an attacker we have not yet seen, on a page whose entire job is to get a
recruiter to a formatted CV in ten seconds.

## Consequences

- `sql/005_trial_limits.sql` must be pasted into Supabase. Until it is, the code
  falls back to the old counters and the trial resets every 90 days;
  `ops/status.mjs` prints `trial limits NOT RUN` while that is the case.
- Existing trial counters reset once. The email counters were keyed to the
  address in clear text and are now keyed to a salted hash, so the old rows are
  unreadable — and 005 deletes them, which also makes the Article 30 record's
  "never the address" true of the email counters as well as the IP ones.
- `leads.cv_count` is finally written, by `record_lead`. It replaces a shadow
  counter that was being kept in `usage_daily` under the address itself.
