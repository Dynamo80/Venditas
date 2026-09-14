# State

**Only things that cannot be measured belong here.** For anything else run
`node ops/status.mjs`, which fetches it live.

Last reviewed: 2026-09-14 (growth jobs automated, decision 018; canonical host fixed in code)

## Goal

**£10,000 MRR**, no date set yet: 77 agencies (20 at the £79 founding price,
57 at £149). First milestone: £1,000 by 2026-10-02, which is 13 agencies at £79.
Currently 0. [Decision 015](decisions/015-ten-thousand-mrr.md) has the
arithmetic, and the constraints, all set with £1,000 in mind, that now cap the
business below £10,000. Each one is the founder's to keep or drop.

**Decided 2026-09-13:**
- The budget stays at $0, and revenue pays for growth.
- Paddle comes after the first one or two paying agencies.
- venditas.in is the only sending domain.
- Hustlr is never used ([016](decisions/016-growth-paid-by-growth.md)).
- Markets are the UK and Ireland. JobAdder is the first integration, because Firefish's API can't download a candidate's CV (`reference/integrations.md`). It waits on Abin registering a JobAdder developer account. Only free partnerships for now. The order profits are spent in is set ([017](decisions/017-markets-integrations-partnerships.md)).

**Built 2026-09-13, not deployed until the founder says so:**
- Batch upload of up to 20 CVs at once, and branding remembered in the browser
  (`app/Formatter.jsx`). The pricing page now describes what exists.
- `/anonymise-cv-tool`, `/hireara-alternative` and `/best-cv-formatting-software-uk`.
- The new-agency feed (`ops/build-prospects.mjs filter --since 90`, then
  `discover --new`).
- An accuracy line in the email to agencies already paying a competitor.

**Automated 2026-09-14** ([018](decisions/018-growth-runs-itself.md);
`runbooks/automation.md`). Running on this laptop now:
- `ops/watch.mjs`, every 20 minutes: replies marked, the matching answer filed
  in Drafts, and a notification for replies, invoice requests, enquiries and
  trial signups. Nothing is sent.
- `ops/weekly.mjs`, Saturdays: the live-site SEO check with IndexNow, and the
  monthly Companies House refresh.
- `ops/daily.mjs` now sends a notification when it is blocked or a stage fails.

**Built 2026-09-14, not live until deployed.** The SEO check found every
canonical and sitemap URL naming `venditas.in`, which redirects to
`www.venditas.in`, plus ten pages with no canonical. Fixed in code: www
everywhere, a canonical on every page, structured data on the home page, and
the DPA's annexes no longer render as extra `<h1>`s. The IndexNow key file
(`public/`) also needs the deploy before Bing can be told anything.

## The critical path

**The first paying agency.** It is the next step on either goal.

Mail is unblocked: `node ops/preflight.mjs` said READY on 13 September, after the
GoDaddy route had been dead since the 3rd. The scheduled task `Venditas daily
outreach` is registered **live** (`--send --confirm`), weekdays at 14:00 IST, and
catches up a day missed while the laptop slept. On 13 September it had never
run. That day's dry run finished with no failures.

**The first live run, 14 September at 14:00 IST, sent nothing.** The mail host
was unreachable at that minute and reachable again within the hour; the job
probed once and gave up, so the day's 25 sends were lost to a blip. Fixed the
same day: `daily.mjs` now re-probes every five minutes for up to half an hour
while the UK window is open, and the task's time limit is two hours. The
task was re-registered live. **Nothing was sent by hand on the 14th**: the
15 September run at 14:00 IST is the first real chance again.

1. **Confirm the first live run sent.** `ops/daily.log` should say `sent N`,
   not `dry` or `BLOCKED`, and `status.mjs` should show more than 54 sent.
   If the 14:00 minute is bad again, to send today by hand:
   `node ops/daily.mjs --send --confirm` any time before 22:00 IST
2. A reply now arrives as a notification, with the answer already in Drafts
   (`ops/watch.mjs`). Read it, send it → recruiter runs their own CV → invoice
   via Skydo. `docs/runbooks/replies.md`, within the hour
3. **Send the note waiting in Drafts** to the one stranger who ran a CV
   (8 September, a gmail address). Nobody had written to them in six days
4. **Follow-ups were silently skipped.** Until 14 September `followup.mjs`
   found an address for 1 of the 50 agencies emailed on 2–3 September, so 49
   never got the second message. Fixed; they go out 15 a day from the
   14 September run, alongside the 15 agencies paying a competitor
5. **Company page:** created 14 September from `outreach/company-page/`. Check
   the eight posts are scheduled through 9 October and that Abin's Venditas role
   links to the page
6. **The REC partner email is ready and waiting on the founder.** The address was
   checked on rec.uk.com on 14 September. Send it in UK working hours with
   `node outreach/partner-send.mjs --only rec` (dry run), then add
   `--send --confirm`. It sends once, files a copy in Sent, and never touches the
   25-a-day cap. Scheduling it automatically was blocked by permissions, rightly:
   it is mail to a third party in the founder's name
7. **Hot list: 17 agencies** (was 15). Tempting Recruitment (Allsorter) and Collins
   McNicholas (HireAra, Ireland) were added from public customer pages. Three more
   confirmed competitor users have no address a script could verify: Major
   Recruitment, Contract Scotland, Future Build Recruitment. Two minutes each in a
   browser (`outreach/prospects-notes.md`, second pass)
8. **Unsubscribe links were broken in every email sent before 14 September.** The
   sending scripts signed them without the site's secret, and the site answered
   400 "Invalid unsubscribe link", for the footer link and one-click alike.
   Measured against production on 14 September, then fixed on both sides:
   `send.mjs` loads the secret and refuses to send without it, and the site also
   accepts the old tokens, so the 54 links already sent now work. Anyone who
   tried before that saw "That link didn't work" and was told to email
   founder@venditas.in; any such email must be honoured by hand
   (`outreach/suppressed.txt`)
9. **The funnel, tightened on 14 September.** Each cold email's link opens the
   tool already set up with that agency's name, colour and logo
   (`lib/prefill.mjs`). Agencies can use their own Word template (019). The
   follow-up sequence is now two messages: day 3, then a last note five working
   days later. When the ten free CVs run out, the form offers the invoice and a
   call as buttons. Trials from emailed agencies show up as leads whose email
   domain matches a prospect; nothing tracks clicks

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
| 1 | ~~Run `sql/003_customers.sql`~~ — done; preflight confirms | | |
| 2 | ~~Skydo account~~ — set up by 14 September. Still worth a dry run: raise one test invoice so the first real one isn't the first attempt. INR account or UPI ID for Indian customers | Money is collected by invoice (decision 007). The pricing page already asks for what the invoice needs; `docs/runbooks/invoice.md` is the ten-minute routine | 15 min |
| 3 | Enable billing on the Gemini project | DPA clause 3.4 ("we do not train on your data") is untrue on the free tier. First compliance question every UK agency asks. Cost ~£0.0001 per CV | 10 min |
| 4 | ~~One founder identity~~ — done 2026-09-03: emails, DPA, Article 30 record and the LinkedIn playbook all say Abin Johnson | | |
| 5 | ~~Fix the LinkedIn About that says Venditas was shut down~~ — About fixed by 14 September. **Still open: Experience.** The profile export that day showed Venditas ending in May 2026, no current role, a Hustlr entry (decision 016) and a joke entry. Fix per `outreach/profile.md` §5 | Every cold email that gets looked up finds a founder whose Venditas ended four months ago | 10 min |
| 5a | ~~Google Search Console~~ — done 14 September. Still open: list on the free directories. Bing needs nothing: IndexNow is pushed every Saturday once deployed | The Quibench page only works if it is crawled. `docs/runbooks/inbound.md` | 1 hour |
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

Installs the daily run at 14:00 IST on weekdays (a dry run unless `-Live`), plus
the reply watch and the weekly job from decision 018; `-Task watch,weekly`
leaves the daily task alone. Every job catches up a run missed while the laptop
slept. Decision 010, and the reason it exists is that
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

## How someone buys, as of 2026-09-13

Pricing button → a pre-filled email asking for the agency's legal name, billing
address and monthly or annual → Abin replies with a Skydo invoice
(`docs/runbooks/invoice.md`) → paid → unlimited CVs. No call needed; "Book 30
minutes" stays underneath for anyone who wants one. Decision 014.

Demo accounts get five CVs and an email confirmation link. The public form still
gives ten with no signup, which is more than the demo gets — deliberate, and the
reasoning plus when to revisit it is in
[decision 012](decisions/012-five-cv-demo-and-euro.md).

## Not blocked, worth doing

- ~~**Load the agency's own Word template (.docx).**~~ Built 14 September
  ([019](decisions/019-the-agencys-own-template.md)): upload a .docx or .dotx
  with the CV; its header, footer, fonts and margins are kept, and the CV goes
  where it says {{CV}}. Tested against templates made in Word and opened in
  Word. **Scheduled company page post 4 (25 September) still says it doesn't
  exist: edit it in LinkedIn** (`outreach/company-page/posts.md`)
- Saved branding that follows a paying agency to another computer. It is
  per-browser today, by design (see `app/Formatter.jsx`)
- `.doc` support — currently refused with a clear message

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
| Six years building, IIT Bombay special mention, national hackathon top three | Changes what he can credibly claim in outreach |

**Hustlr and Labs60 are never used for Venditas** (decision 016): not as a
channel, a list, credibility or a mention.

## Conflict to resolve before LinkedIn outreach

His public LinkedIn About says he **shut Venditas down** because "the problem
wasn't real" — while we cold-email UK agencies under that name. Anyone who looks
up the sender finds the founder disowning the company.

Rewrite ready in `outreach/profile.md`, reclaiming the name rather than deleting
the line. Needs his decision and his hands: LinkedIn cannot be edited from here.
