# Seventy-seven agencies: the strategy to £10,000 MRR

Written 2026-09-13 from six research threads (`research/growth-2026-09.md`), and
revised the same day once the founder had decided. For live numbers, run
`node ops/status.mjs`. The forecasts below come from a model, with its
assumptions stated.

## The answer

£10,000 MRR is **77 agencies**: 20 at £79 and 57 at £149 (decision 015).

The founder has decided (016): **no money is spent before revenue arrives**. The
first agencies pay by Skydo invoice, then Paddle. Email goes out from venditas.in
only, and Hustlr is never used. Claude has decided markets, integrations,
partnerships, and the order in which profits are spent (017).

Under those decisions the model reaches £10,000 in **month 14 (November 2027)**.
If a CRM marketplace and the TRN partnership both work once revenue can pay for
them, it gets there in month 9–10 (June–July 2027). If only the free channels work,
and only at their low end, there are about 32 agencies, roughly £3,400 MRR, at
month 14.

The first paying agency still comes before everything else. It unlocks the paid
channels, and every channel converts better once there is a named customer.

## What the research changed

1. **Competitors lose customers over accuracy, not price.**
   - HireAra's and Allsorter's public complaints are about invented content and dates
     put in the wrong order. No review complains about price.
   - Venditas never rewrites a word and refuses to return a document if a contact
     detail survives.
   - That is now in the email to agencies already paying a competitor.
2. **Skydo takes about 18% of a £79 payment.** Paddle charges 5% + 50¢. Paddle comes
   after the first one or two paying agencies (016).
3. **About 5,000 new UK agencies register each year under SIC 78109** (340 in
   August 2026).
   - They are choosing their tools, and most have no CV template yet.
   - The feed is built: `ops/build-prospects.mjs filter --since 90` then
     `discover --new`.
   - `outreach/batch.mjs` sends them their own first email, second in line after
     agencies already paying a competitor.
4. **The UK cannot supply enough cold-email prospects on its own.** At benchmark rates,
   77 customers means contacting 85,000–300,000 prospects. At 25 a day, cold email is
   one channel among several, aimed at the agencies most likely to buy.
5. **JobAdder is the first integration.** Firefish looked better: UK-heavy, free to
   join, no formatting partner listed. But its API cannot download a candidate's CV,
   and it has no button or trigger inside the CRM.
   - JobAdder's API can read the CV and write a `FormattedResume` back.
   - A Partner Action button can open Venditas from the candidate record.
   - It is free to join, and its home market is Australia.
   - Estimate: about 9–11 developer-days.
   - `docs/reference/integrations.md` has the details.
6. **The Recruitment Network (TRN) reaches 4,500+ agency owners** for £249 a month,
   and already sells a fee-protection tool to them. It comes at rung 3 (017).
7. **US staffing agencies do this job.** There are about 27,000 of them, and competition
   is crowded and cheap. They are served when they arrive, not cold-emailed (017).
8. **Three of our own records were wrong.** HireAra sells anonymisation, and Bullhorn
   and Firefish both have basic formatted CVs built in. Corrected in
   `docs/reference/competitors.md`.
9. **Nobody searches for "fee protection".** People search "CV formatting software for
   recruiters", "anonymise CV tool" and "blind CV". The new pages target those
   phrases and make the fee-protection argument inside them.
10. **The pricing page sold two features that did not exist.** Both are now built:
    - batch upload, up to 20 CVs at once;
    - branding saved in the browser, so nothing about the agency is stored on a server.

## What has been decided

| Question | Decision | Record |
|---|---|---|
| Budget | $0. Revenue pays for growth, in a set order | 016, 017 |
| Payment | Skydo invoices until one or two agencies have paid, then Paddle | 016 |
| Sending volume | venditas.in only, 25 a day | 016 |
| Hustlr and Labs60 | Never used for Venditas | 016 |
| Markets | UK and Ireland for outbound. US, Australia and NZ served when they arrive. India and non-English Europe out | 017 (supersedes 008) |
| Integrations | JobAdder first. Firefish's API cannot download a candidate's CV, so 017's condition picked JobAdder (`docs/reference/integrations.md`). Bullhorn last | 017 |
| Partnerships | Free now: REC, Sonovate, 3R, Giant, SSG, UK Recruiter directory, G2, podcasts. The offer is a first month free, not a lower price. TRN at rung 3 | 017 |

**Pricing does not change.** When an integration ships, add a tier for agencies with
20–50 staff.

## The order profits are spent in (017)

**Rule:** fixed monthly spending never goes above a quarter of MRR.

| Rung | When | Spend |
|---|---|---|
| 0 | Now | Nothing |
| 1 | First one or two paying agencies | Paddle (fees per payment only), Gemini billing |
| 2 | MRR ≥ £400 | A second sending domain, about £90 a month, plus a US test group from it |
| 3 | MRR ≥ £1,000 for two months running | TRN Core partner, £249 a month |
| 4 | MRR ≥ £4,000, and two paying agencies use Bullhorn | Bullhorn partner programme |

## Channels, ranked by speed × size ÷ cost

New agencies per month once each channel is running (month 4 onwards). These are
estimates, not measurements.

| Channel | New agencies/month | Cost | Starts | What it rests on |
|---|---|---|---|---|
| **New-agency feed** from Companies House | 1–4 | £0 | This week | 340 registrations in August under 78109 alone |
| **Agencies paying a competitor**, pitched on accuracy (013) | 0.5–2 | £0 | 14 September | 15 prospects on the hot list |
| **LinkedIn by hand**, 60 invites a week | 1–2 | 20 min a day | Once the About section is fixed | 27% accept, 28% of those reply |
| **Search, AI answers, free anonymiser, G2** | 0.5–2 | £0 | Once deployed | No vendor owns "HireAra alternative"; free tools win "anonymise CV" |
| **JobAdder marketplace** | 0–3 | 9–11 developer-days | Months 2–3 | Three formatting tools listed already; none mentions anonymisation on its listing |
| **Free member deals**: REC, Sonovate, 3R, Giant, SSG | 0–2 | A first month free | Months 3–6 | They publish pages of exclusive supplier deals |
| **Cold email from a second domain** (rung 2) | 1–3 | ~£90/mo, paid from revenue | About month 4 | 0.45% reply rate per email |
| **TRN partnership** (rung 3) | 1–4 | £249/mo, paid from revenue | About month 7 | 4,500 agency owners |
| **Referrals from customers** | 1–2 at 40 customers | A free month each | Month 4 | — |

## The model

**Assumptions:**
- New agencies per month: 1, 2, 4, 5, 6, 7, 8, then 9 from month 8. The free channels
  come first; the second domain adds from about month 4 and TRN from about month 7.
- 4% monthly churn.
- The first 20 pay £79, everyone after pays £149.

| Month | Ends | Agencies | MRR | Rung reached |
|---|---|---|---|---|
| 1 | Oct 2026 | 1 | £79 | 1: Skydo, then Paddle |
| 3 | Dec 2026 | 6 | £474 | 2: second sending domain |
| 5 | Feb 2027 | 17 | £1,343 | — |
| 7 | Apr 2027 | 30 | £3,070 | 3: TRN (after two months above £1,000) |
| 8 | May 2027 | 38 | £4,262 | 4 is possible if two agencies use Bullhorn |
| 11 | Aug 2027 | 59 | £7,391 | — |
| 13 | Oct 2027 | 72 | £9,327 | — |
| **14** | **Nov 2027** | **78** | **£10,073** | — |

**Other cases:**
- **Stretch** (1, 3, 5, 8, 10, 12, then 15 a month; 3% churn): 77 agencies in month 9,
  June 2027.
- **Low** (free channels only, 3 a month; 4% churn): 32 agencies at month 14.

**If churn runs above 6% a month,** the base case takes longer than two years. Ask
every agency that leaves why.

## The next fourteen days

**Done on 13 September:**
- Decisions 016 and 017 recorded.
- The competitor email now carries the accuracy promise.
- New-agency feed and new-agency email built.
- Batch upload and branding saved in the browser built. The pricing page now
  describes what exists.
- `/anonymise-cv-tool`, `/hireara-alternative` and `/best-cv-formatting-software-uk`
  written.
- Partner and listing drafts in `outreach/partners.md`.
- Integration research in `docs/reference/integrations.md`.
- LinkedIn week-one pack in `outreach/linkedin/`.

**Abin, about four hours:**
1. LinkedIn: follow `outreach/linkedin/START-HERE.md`. Fix the About section first; it
   still says Venditas shut down.
2. Say yes to deploying the site changes. Nothing is live until then.
3. Submit the sitemap to Google Search Console and Bing, 10 min.
4. Claim the free G2 profile, and list on the UK Recruiter directory for free,
   20 min. The copy is in `outreach/partners.md`.
5. Send the REC, Sonovate and back-office partner emails, and the podcast pitches,
   from `outreach/partners.md`, 30 min.
6. Register a JobAdder developer account in your own name, 15 min. JobAdder
   approves both the account and the app, and the build waits on that
   (`docs/reference/integrations.md`).
7. Answer every reply within the hour. That is still most of the job.

**Claude, next:**
1. Once JobAdder approves the account, build the integration:
   - read the candidate's `Resume` attachment;
   - format it;
   - write it back as `FormattedResume`;
   - add a Partner Action button on the candidate record.
   Agency branding then has to be stored on the server for integrated accounts
   (`docs/reference/integrations.md`).
2. Once the first agency pays: Paddle checkout, plus a webhook that records the
   sale in the `customers` table.
3. Refresh the new-agency list monthly, when Companies House publishes a new file.

## What not to do

- **Spend before revenue,** or out of order (016, 017).
- **Use Hustlr or Labs60** in any form (016).
- **Buy a competitor.** Nothing relevant is for sale, and Quibench deleted its
  customer data.
- **Pay for Bullhorn Marketplace** before rung 4.
- **Enter non-English Europe, or sell to Indian agencies** (017).
- **Automate LinkedIn.** Abin's account is the asset.
- **Raise the price, or ask for a card upfront on the trial.**
- **Offer partners a lower price.** Offer a first month free instead, which keeps
  the 77-agency arithmetic intact.

## Risks

- **JobAdder can refuse or revoke access.** Its API terms carry a broad
  non-compete and New South Wales law, and three formatting tools are already
  listed. Build only after the developer account is approved.
- **One domain at 25 a day is a single point of failure.** The September outage cost
  five working days. `ops/preflight.mjs` runs before every send.
- **The accuracy promise has to stay true.** Keep the check that refuses to return
  a document with a contact detail left in, and never promise anything the tests
  do not cover.
- **Founder time.** At nine new agencies a month, anything done by hand becomes the
  ceiling. That is why Paddle comes at rung 1.
- **Churn is unmeasured.** Replace the model's 4% with real numbers by month 4.
