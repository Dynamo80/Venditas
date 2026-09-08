# Thirty days to £1,000 MRR — the arithmetic, and what has to be true

Written 2026-09-02, revised 2026-09-03, revised again 2026-09-08 after six days
of measured results. Deadline **2026-10-02**. Target: **13 paying agencies at
£79** (£1,027), or the equivalent in annual and INR customers.

Live count: `node ops/status.mjs`. Nothing in this file is a number you should
trust over that script.

## What is actually blocking money, 2026-09-08

Run `node ops/preflight.mjs` before reading further. On the day this was
revised it said BLOCKED, and everything below is downstream of that.

**The mail host is unreachable from the founder's machine.** Every port on
`smtpout.secureserver.net` and `imap.secureserver.net` times out — including
port 80, which no ISP filters — while `smtp.gmail.com:587` answers normally and
`godaddy.com:443` loads. DNS resolves. That combination means the route to
GoDaddy's mail IPs is blocked at the far end or by something between, not that
outbound mail ports are closed here.

The consequence is not subtle: **54 emails were sent on 2 and 3 September and
none since.** `batch.mjs` refuses to send when it cannot read the mailbox, which
is correct — sending blind is how a domain dies — but the refusal was a stack
trace at the end of a command nobody was running any more. Five working days and
125 sends went past unnoticed. At the cap, 125 sends is about a quarter of
everything the remaining month has to work with.

Until this is fixed, no plan on this page can execute. In order of how fast they
can be tried:

1. **A phone hotspot.** Two minutes, and it settles whether the block follows
   the network or the machine. If the batch sends over a hotspot, the answer is
   the ISP or the router, not GoDaddy.
2. **GoDaddy support**, with the two IPs (`92.204.80.21`, `148.72.44.1`), the
   symptom (all ports dead, including 80) and the date it started. A block
   placed after a burst of outbound mail from a residential address is the
   ordinary explanation and they can lift it.
3. **A different sending path.** Any SMTP relay with a free tier, pointed at the
   same domain with the same SPF/DKIM/DMARC. This changes `SMTP_HOST` and
   nothing else; `send.mjs` does not care who relays.

## The arithmetic, recomputed on 2026-09-08

| | |
|---|---|
| Weekdays left (9 Sep – 2 Oct) | **18** |
| Sends available at the 25/day cap | **450** |
| Already sent | 54 |
| Total sends the deadline can hold | **504** |
| Customers needed | 13 |
| **Implied conversion** | **1 paying customer per 39 sends** |

Cold email from an unknown vendor with no reviews converts at roughly one
customer per 250–500 sends. The plan needs six to thirteen times that. It is not
a copy problem or a list problem; 504 sends is simply not 13 customers at any
conversion rate this channel produces.

| Scenario | What is true | Customers by 2026-10-02 |
|---|---|---|
| Mail stays blocked | Nothing sends | **0** |
| Floor | Mail fixed this week, cap used most days | 1–2 |
| Plan | Mail fixed tomorrow, cap used every day, follow-ups and nurture running, replies answered same day | 2–4 |
| Stretch | Plan, plus one annual prepay, plus one referral | 5–6 |

**£1,000 MRR by 2026-10-02 is not reachable through cold email at 25 a day.**
That was already the honest reading on 2 September, when the ceiling was
5–9 customers; six days of outage have taken it lower. The same routine,
continued into November, reaches £1,000 — the constraint is arithmetic, not
effort.

What that means for the next 24 days: the goal worth chasing is **the first two
or three paying agencies and proof the funnel converts at all**. That is what
makes month two a different arithmetic problem, because a customer who can be
named and quoted is worth more to the next hundred sends than the hundred sends
themselves.

### The one lever that changes the ceiling

The cap is 25 a day **from one domain**. It is not a law; it is what protects a
single sending reputation. A second sending domain doubles the ceiling to about
1,000 sends by the deadline, which is 2–4 customers instead of 1–2. It costs
about £10 and roughly a week of warming before it can carry a full batch, and it
is the only thing available that changes the shape of the month rather than the
margin. It is the founder's call: it breaks the zero-cost constraint, and a
domain warmed carelessly is worth less than no domain at all.

## The constraints, as decided

| Question | Answer | Consequence |
|---|---|---|
| Payment rail | Skydo invoices by hand; Razorpay cannot be used | No checkout. The pricing page opens a pre-filled email. `docs/runbooks/invoice.md` |
| Warm audience (Hustlr, Labs60) | Not relevant, keep separate | Every customer comes from cold outreach, the trial, or inbound |
| Budget | Zero. Free tiers only | One sending domain, 25 a day. No ads, no lead data |
| Markets | UK first, India second | Decision 008. The UK list holds 45 days at the cap, so India stays deferred |
| Annual prepay | Counts | £790 / $990 / ₹65,000, recorded at monthly equivalent |
| Founder time | Abin, 1–2 hours a day | The machine does the volume. Abin replies, invoices, does LinkedIn |

## The four things that have to be true

### 1. Mail can leave the building — founder, today

Above. Nothing else on this list matters until `node ops/preflight.mjs` says
READY.

### 2. The cap is used every weekday — scripted, and now scheduled

One command replaces the five-command morning:

```bash
node ops/daily.mjs --send --confirm
```

It runs preflight, reads the inbox, sends nurture emails to trial users,
sends day-3 and day-8 follow-ups, and fills what is left of the 25 with new
prospects — spending one shared budget across all three, which the separate
commands did not do. Register it so it does not depend on anyone remembering:

```bash
powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1
```

That installs a **dry run** on weekdays at 14:00 IST (09:30 UK). Watch one, then
arm it with `-Live`. It is set to catch up a missed day when the machine next
wakes, because a laptop asleep at half past nine is the ordinary case and is
exactly how the five days in September went missing. Decision 010.

### 3. Replies are answered within the hour — founder, daily

A reply is the scarcest thing this business has. `docs/runbooks/replies.md` makes
each answer one command. The founder's one to two hours go here first, then
invoices, then LinkedIn.

### 4. A sale can be recorded — founder, five minutes

`sql/003_customers.sql` has still not been run. There is nowhere to write down
that someone paid, and `status.mjs` cannot show a customer that has no table to
live in. `sql/005_trial_limits.sql` is also outstanding; until it runs, the
ten-CV trial silently resets every 90 days.

## What is not measured, and should be

`leads.cv_count` reads 0 for all three leads, and `usage_daily` holds IP counters
but **not one email counter** — while three lead rows exist, each of which is
only written after a document has been successfully produced. So:

- At least three CVs have been formatted end to end. One of them, on
  2026-09-08 at 16:13 UTC, was a stranger who is on no prospect list.
- The counter that was supposed to record that has never once been written in
  production, so "CVs run" in `status.mjs` has always read 0 regardless of the
  truth, and the trial has never actually been enforced.

`sql/005_trial_limits.sql` replaces that path with a single call whose failure is
logged rather than swallowed. Run it, and the next section of this plan becomes
answerable instead of guessed at.

## What to measure every morning

`node ops/status.mjs`, which now leads with whether mail can leave at all.

The question to hold it against: **has anyone who is not on a prospect list run
a CV?** One had, by 8 September. If that number is still one by 15 September
with 200 more sends behind it, the problem is the landing page or the message,
and the fix is there rather than in more sending.

## Weekly shape

| Week | Founder (1–2 h/day) | Scheduled |
|---|---|---|
| Now | Unblock mail. Run sql/003 and sql/005. Arm the scheduler | Nothing until mail works |
| 1 | Replies, invoices, LinkedIn About rewrite, Search Console | Daily routine at 14:00 IST |
| 2 | Replies, invoices, LinkedIn playbook daily | Follow-ups at day 3 and 8; nurture at 5 and 10 CVs |
| 3 | First customer calls: what did the template get wrong | Batches continue; regenerate the list if it thins |
| 4 | Ask every paying agency for one introduction | Batches continue |
