# State

**Only things that cannot be measured belong here.** For anything else run
`node ops/status.mjs`, which fetches it live.

Last reviewed: 2026-09-08 (outreach blocked; daily routine scheduled)

## Goal

£1,000 MRR. At £79 that is **13 paying agencies**. Currently 0.

## The critical path

**Outreach is stopped. Nothing else matters until it is not.**

`node ops/preflight.mjs` says BLOCKED: every port on `smtpout.secureserver.net`
and `imap.secureserver.net` times out from this machine, port 80 included, while
`smtp.gmail.com:587` answers and `godaddy.com:443` loads. DNS resolves fine. That
is a blocked route to GoDaddy's mail IPs (`92.204.80.21`, `148.72.44.1`), not an
ISP closing mail ports.

Batches went out on 2 and 3 September. Nothing since — five working days, 125
sends, gone. Try in this order:

1. **Phone hotspot**, two minutes. Settles whether the block follows the network
   or the machine.
2. **GoDaddy support** with both IPs, the symptom, and the start date. A block
   placed after a burst of outbound mail from a residential address is ordinary
   and they can lift it.
3. **Any free-tier SMTP relay**, same domain, same SPF/DKIM/DMARC. It is one
   environment variable; `send.mjs` does not care who relays.

Then, and only then:

4. Watch for replies → recruiter runs their own CV → invoice via Skydo
5. The daily routine, scheduled: `ops\install-schedule.ps1`. Decision 010

Payment integration is **not** on the critical path. A Skydo invoice or a
Razorpay link collects £79 by hand perfectly well for the first customers.

## Is this a proper company yet? — reviewed 2026-09-02

The thirty-day plan and its arithmetic are in `docs/plan-30-days.md`. Cold email
alone lands at two or three customers by 2026-10-02, not thirteen; the plan
needs a self-serve pay path, the warm audience, a 500-agency UK list and a
trial that closes itself.

**Already true:** live site; privacy, terms, DPA and security pages at real
URLs; working one-click unsubscribe; SPF, DKIM and DMARC passing; retention
purge scheduled; nothing about a candidate stored; a legitimate interests
assessment, an Article 30 record and a breach plan in `legal/`.

**Not yet true, and only the founder can make it true.** Ranked by how
directly each blocks money.

| # | Item | Why it matters | Effort |
|---|---|---|---|
| 1 | Run `sql/003_customers.sql` | There is nowhere to record that someone paid | 5 min |
| 2 | Skydo GBP/USD account details and an INR account or UPI ID ready to put on an invoice | Money is collected by invoice (decision 007). The pricing page already asks for what the invoice needs; `docs/runbooks/invoice.md` is the ten-minute routine | 15 min |
| 3 | Enable billing on the Gemini project | DPA clause 3.4 ("we do not train on your data") is untrue on the free tier. First compliance question every UK agency asks. Cost ~£0.0001 per CV | 10 min |
| 4 | ~~One founder identity~~ — done 2026-09-03: emails, DPA, Article 30 record and the LinkedIn playbook all say Abin Johnson | | |
| 5 | Fix the LinkedIn About that says Venditas was shut down | Every cold email that gets looked up finds the founder disowning the product. Rewrite in `outreach/profile.md` | 10 min |
| 5a | Submit the sitemap to Google Search Console and Bing; list on the free directories | The Quibench page only works if it is crawled. `docs/runbooks/inbound.md` | 1 hour |
| 6 | Supabase region | One line from the dashboard; DPA Annex 3 and the Article 30 record have placeholders without it | 2 min |
| 7 | Solicitor review of privacy, terms, DPA; settle liability and governing law | A UK agency will not sign an unreviewed DPA from an overseas sole trader | 1–3 hours of fees |
| 8 | Article 27 UK representative, or a written opinion that none is needed; ICO fee question | A line on every supplier questionnaire | £100–500/yr |
| 9 | Back up `.env.local` somewhere encrypted | Every key and the SMTP password exist on one laptop | 5 min |
| 10 | Legal entity | Sole trader now is fine for the first customers. Revisit at the first five-figure contract: Indian Pvt Ltd or UK Ltd, see `legal/compliance-notes.md` §14 | Later |

Items 1 to 3 are the difference between a project and a business: after them a
stranger can try it, pay for it, and be recorded as having paid.

Razorpay is out entirely (decision 007); nothing waits on it.

**India list: deferred, deliberately.** Decision 008 added India to fill the
cap on days the UK list could not. The Companies House list builder then
produced 45 days of UK prospects in one run, so the cap is the binding limit
and India is no longer needed inside the thirty days. The research agent for
`outreach/prospects-in-1.csv` was cut off by a usage limit before writing
anything; re-run it when the UK list is under two weeks from empty, or when
the first UK customers prove the pitch and it is worth a second market.

## The daily routine, scheduled

It is one command now, and it should not need running by hand at all:

```bash
node ops/daily.mjs --send --confirm
```

Preflight, inbox, nurture, follow-ups, then new prospects — spending one shared
25/day budget across all three senders, which the separate commands did not do.
Register it once and stop thinking about it:

```bash
powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1
```

Installs a dry run at 14:00 IST on weekdays; add `-Live` to arm it. Catches up a
day missed to a sleeping laptop. Decision 010, and the reason it exists is that
the hand-run version stopped on 3 September and nobody noticed for five days.

When FUNNEL says the UK list is under a week from empty:

```bash
node ops/build-prospects.mjs discover --in <path>/ch-agencies.csv --limit 2000
```

The Companies House file behind that is regenerated monthly by them and
downloaded once by us; the command to fetch and filter it is at the top of
`ops/build-prospects.mjs`.

## Payment is manual, by decision

The pricing page's button opens an email, not a checkout. No payment URL is
configured and that is deliberate: at zero customers the first few
conversations teach more than a checkout does.

The cost is that nothing is captured automatically — no webhook, no receipt,
no row appearing on its own. A sale exists only in an inbox unless someone
writes it down. See `docs/runbooks/closing.md`.

Switching it on later is one Vercel environment variable,
`NEXT_PUBLIC_PAY_URL`, and a redeploy. The pricing page picks it up itself.

## Not blocked, worth doing

- Batch upload (whole shortlist at once) — asked for on the pricing page, does
  not exist yet
- Saved branding per account — same
- `.doc` support — currently refused with a clear message

## Waiting on one paste into Supabase

`sql/005_trial_limits.sql` has not been run. Until it is, the daily cap holds
but the ten-CV trial resets every 90 days when the retention job clears the
counters it was summed from. `node ops/status.mjs` prints `trial limits NOT RUN`
while that is true. Paste the file into the Supabase SQL editor and Run; it is
safe to re-run, and it replaces `purge_old_data` from `sql/002_retention.sql`.

## Known and accepted

- **No SOC 2, no penetration test.** Stated plainly on `/security` rather than
  discovered later.
- **The trial email is never verified.** Anyone can type a stranger's address,
  or an invention, and get ten CVs. Verification would mean an interstitial in
  front of the highest-intent moment on the site, so the IP cap does the real
  bounding instead — 12 a day. See
  [decision 009](decisions/009-enforceable-trial-limits.md).
- **Scanned CVs bypass local de-identification** and reach Google as page
  images. Disclosed in the privacy policy.
- **Brand colours in the prospect list are unreliable** — only 41 of 244 came
  from a verified source. Outreach is ordered to favour agencies whose logo we
  can fetch, since logos verified 10/10.

## Founder assets that were not known when the plan was made

Discovered from his LinkedIn on 2026-09-02, after the outreach plan was built.
The plan assumed no audience and no domain expertise, and both were wrong.

| Asset | Why it matters |
|---|---|
| **Hustlr** — live product, 50 users in 14 days, **agencies and SDRs** | A warm B2B audience adjacent to recruitment agencies. The single most valuable asset here, and cold email was chosen because it was believed not to exist |
| **Labs60** — his agency, AI receptionists and video for SaaS teams | An existing commercial relationship base, and a second route to market |
| Six years building, IIT Bombay special mention, national hackathon top three | Changes what he can credibly claim in outreach |

**Action not yet taken:** work out whether Hustlr's 50 users can be told about
Venditas. Warm beats cold by an order of magnitude, and this was never in the
plan because the plan did not know it existed.

## Conflict to resolve before LinkedIn outreach

His public LinkedIn About says he **shut Venditas down** because "the problem
wasn't real" — while we cold-email UK agencies under that name. Anyone who looks
up the sender finds the founder disowning the company.

Rewrite ready in `outreach/profile.md`, reclaiming the name rather than deleting
the line. Needs his decision and his hands: LinkedIn cannot be edited from here.
