# 017 — Markets, integrations, partnerships, and the order profits are spent

**Date:** 2026-09-13 · **Status:** active
**Decided by:** Claude, at the founder's request (016 delegates these three)
**Supersedes:** [008](008-india-second-market.md) (India as the second market)
**Amends:** [005](005-target-market.md), whose CRM table is out of date (see `docs/reference/competitors.md`)

Evidence for everything below: `research/growth-2026-09.md`.

## Markets

- **The 25 daily sends go to the UK and Ireland only.** Order:
  1. Agencies already paying a competitor ([013](013-paying-competitor-customers-first.md))
  2. Agencies incorporated in the last 90 days, from the Companies House feed
  3. The rest of the UK and Irish list
  4. US rows last, as 005 already had it
- **US, Australian and New Zealand agencies are served, not chased.** Anyone who
  arrives through the site or a CRM marketplace can buy (USD pricing already
  exists). No cold email goes to them until a second sending domain is paid for
  (rung 2 below).
- **Indian agencies are out.** This supersedes 008.
  - ₹6,500 is about twice the price of a CRM seat there.
  - Nobody knows how many agencies there are.
  - Selling there brings the full DPDP Act into scope.
  - 25 sends a day are better spent on the UK.
- **Non-English Europe is out.** Local tools cost €24–49 a month, CVs arrive in
  Dutch or German, and buyers expect their data kept in the EU.

## Integrations

- **Firefish first,** if its API can read a candidate's CV file and write a
  document back.
  - Free to join, mostly UK, 700+ agencies.
  - No CV-formatting partner is listed, and a customer has asked for one.
  - Firefish promotes its partners to its own users.
- **Otherwise JobAdder first.** It is free to join, and Australia is its home
  market, which is how Australia gets served (see Markets).
- **Bullhorn comes last,** only after two agencies that use Bullhorn are paying
  and revenue can cover its fees (rung 4). Reasons:
  - About $6–9K in the first year.
  - It reportedly asks for two contracted customers first.
  - It says most partners get few leads from the listing.
- Which API can do what, and the build plan: `docs/reference/integrations.md`.

## Partnerships

**Free ones start now:**
- Member deals through REC business partners, Sonovate, 3R, Giant and SSG
  Partnerships. REC only if its cost is the member offer and no fee.
- A free UK Recruiter directory listing and a free G2 profile.
- Guest spots on podcasts for agency owners: Recruiter Startup, Recruitment
  Founders, RAG.

**The member offer is a first month free, not a lower price.** A lower price
would push the number of agencies needed above 77.

**The Recruitment Network (TRN) comes later.** It costs £249 a month on a
12-month contract, so it waits for rung 3.

## The order profits are spent in

**Rule:** fixed monthly spending never goes above a quarter of MRR.

| Rung | When | Spend | Why it comes at this point |
|---|---|---|---|
| 0 | Now | Nothing | 016 |
| 1 | First one or two paying agencies | Paddle (fees per payment, no monthly charge); Gemini billing (fractions of a penny per CV) | Skydo takes about 18% of a £79 payment. On the free tier, DPA clause 3.4 has to say that Google may use CV text; a paid tier lets it promise no training, and that is the first compliance question UK agencies ask |
| 2 | MRR ≥ £400 (about 5 agencies) | A second sending domain with mailboxes, about £90 a month; a US test group from it | The only way cold email grows past 25 a day without putting venditas.in at risk |
| 3 | MRR ≥ £1,000 for two months running | TRN Core partner, £249 a month | 4,500 agency owners, and TRN already sells a fee-protection tool (Bobcheck) to them. The 12-month contract needs revenue to have held up first |
| 4 | MRR ≥ £4,000, and two paying agencies use Bullhorn | Bullhorn partner programme | Last, for the reasons under Integrations |

## Rejected

- **US cold email now.** The largest pool, but crowded, with prices set per CV
  or per user. At 25 sends a day, every US send is a UK send not made.
- **Australian cold email now.** It arrives more cheaply through JobAdder.
- **Paying for TRN before revenue.** Ruled out by 016. A 12-month contract also
  needs two months of revenue that holds up.
- **Partner offers that lower the price.** They would push the agencies
  needed above 77.
- **Keeping India as the second market (008).** The research above outweighs
  the timezone and payment convenience that justified it.
