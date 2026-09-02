# Thirty days to £1,000 MRR — the arithmetic, and what has to be true

Written 2026-09-02, day 0. Deadline **2026-10-02**. Target: **13 paying agencies
at £79** (£1,027). Live count: `node ops/status.mjs`, under CUSTOMERS AND LEADS.

This document exists because the plan as it stood on day 0 was "send 25 cold
emails a day and wait", and that plan cannot reach 13 in 30 days. The numbers
below show why, and what replaces it.

## The funnel, measured on day 0

| Stage | Number | Source |
|---|---|---|
| UK prospects in the list | 145 | `prospects.csv` |
| UK prospects already emailed | 25 | `sent.log`, batch 1 |
| UK prospects left with an address | 105 | `status.mjs` → FUNNEL |
| Emails per day, hard cap | 25 | domain protection |
| Days of UK list remaining | ~4 | 105 ÷ 25 |
| Trial sign-ups that are not the founder | 0 | `leads` table |
| Paying customers | 0 | not yet recordable |

The US half of the list (140 rows) is deliberately last: decision 005 found US
in-house teams do not feel this problem, so those emails mostly buy nothing.

## Why cold email alone lands at two or three, not thirteen

Cold email from an unknown vendor with no reviews converts at roughly one
paying customer per 250–500 sends, on the usual assumptions: 2–4% reply, a
quarter of replies positive, a third of those paying after a trial. Twenty
working days at the cap is 500 sends, so **500 emails is one to two customers**,
and only if the list is extended to 500 UK agencies first, which it is not.

That is the floor, and it is worth having. It is not the plan.

## The four things that have to be true

Each one is a multiplier on the others. Doing three of the four is not 75% of
the result.

### 1. Someone can pay without emailing us — by day 2

The pricing page button is `mailto:`. Every sale currently needs a reply, an
invoice, a bank transfer and a manual SQL update. A prospect who tries ten CVs
at 11pm and likes it has nowhere to put a card.

- Founder: fix the Razorpay business category, or create a Skydo/Razorpay
  payment page for £79/month, and paste its URL into `NEXT_PUBLIC_PAY_URL` on
  Vercel. The pricing page switches from "email us" to "start" on its own.
- Founder: run `sql/003_customers.sql` so a payment can be recorded. Five
  minutes, and until it is done `status.mjs` cannot show a customer.
- Founder: enable billing on the Gemini project. It costs about a hundredth of a
  cent per CV and makes the DPA's "we do not train on your data" clause true.
  A UK agency's compliance person asks this question; today the honest answer
  loses the deal.

### 2. The warm audience is asked first — days 1 to 7

Cold email was chosen because the plan believed there was no audience. There
is: **Hustlr's 50 users are agencies and SDRs**, Labs60 has commercial
relationships, and the LinkedIn profile has ~500 real connections.

Warm outreach to a relevant audience converts an order of magnitude better
than cold. Fifty warm contacts, of whom perhaps ten are recruitment agencies or
know one, is worth more than the next 500 cold sends.

- Founder: one message to Hustlr users — not a broadcast, a personal note to
  the ones who run or sell into agencies — asking for an introduction to one
  UK recruiter who formats CVs by hand. Ask for the introduction, not the sale.
- Founder: fix the LinkedIn About line that says Venditas was shut down
  (`outreach/profile.md` has the rewrite), then start the LinkedIn playbook.
  Until the About is fixed, every cold email that gets looked up finds the
  founder disowning the product.

### 3. The list is extended to 500 UK agencies — by day 10

Sending is capped at 25 a day and the UK list runs out on day 4. Sourcing is
the bottleneck, and it is a scripted job, not a founder job.

- Build `prospects-uk-2.csv`: another ~350 UK agencies, 3–50 staff, screened
  against the CRMs in decision 005 (drop Loxo, Recruit CRM, Zoho, Vincere;
  prefer Bullhorn, JobAdder, Mercury). `status.mjs` already looks for the
  file. Priority: agencies with a fetchable logo, because logos verified
  10/10 and colours did not.
- Segment by specialism so the sample CV matches the agency's sector.

### 4. The trial closes itself — by day 7

The ten-CV trial gates on a work email, which captures the lead. Nothing
follows. A recruiter who uses seven CVs and stops is the most qualified person
in the entire funnel, and today nobody speaks to them.

- Build: an email at CV 5 ("halfway through your ten — anything the output got
  wrong?") and at CV 10 (the founding price, the pay link, the guarantee).
  Both from the founder's address, both answerable by replying. Requires the
  pay link from item 1 to exist.
- Build: batch upload and saved branding, which the pricing page already
  promises. A paying customer will ask for both in week one.

## Scenarios

| | What is true | Customers by 2026-10-02 |
|---|---|---|
| Floor | Cold email only, list extended to 500 | 1–3 |
| Plan | All four items above done in the first ten days | 6–10 |
| Stretch | Plan, plus one warm introduction turns into a 3–5 agency referral chain | 13+ |

Thirteen in thirty days from a standing start is a stretch outcome. It is not
impossible; it requires the warm channel to work. The plan outcome, 6–10, is
£500–800 MRR and a business that is visibly working, and the same actions
carry it to £1,000 in the following two to three weeks.

## Weekly shape

| Week | Founder | Scripted |
|---|---|---|
| 1 | Pay link, SQL, Gemini billing, LinkedIn About, Hustlr messages | Extend UK list, trial emails at CV 5 and 10 |
| 2 | Reply to every reply within the hour; LinkedIn playbook daily | Batches at the cap; follow-ups day 3 and 8 |
| 3 | First customer calls: ask what template rules we got wrong | Batch upload, saved branding |
| 4 | Ask every paying agency for one introduction | Batches continue; measure |

## What to measure every morning

`node ops/status.mjs`. The FUNNEL section prints UK prospects left and days of
list remaining; CUSTOMERS AND LEADS prints trial sign-ups and paying. If
sign-ups are not moving by day 10, the emails are not landing or the landing
page is not converting, and the fix is there, not in more sending.
