# 018 — Most of the growth work runs by itself, on this laptop

**Date:** 2026-09-14 · **Status:** active
**Decided by:** Claude, at the founder's request to "automate most of it: SEO,
marketing, outreach", under the founder's constraint that everything runs
strictly on this machine: no connectors, no browser automation, no cloud agents.
**Extends:** [010](010-the-routine-runs-itself.md)

## Decision

Three scheduled jobs on the founder's laptop, registered by
`ops/install-schedule.ps1`. How to run and read them: `docs/runbooks/automation.md`.

| Job | When | What it does | What it never does |
|---|---|---|---|
| `ops/daily.mjs` (010) | Weekdays 14:00 IST | Inbox, nurture, follow-ups, new prospects, within the 25/day cap. Now also notifies when mail is blocked or a stage fails | — |
| `ops/watch.mjs` | Every 20 minutes | Marks replies so no follow-up chases them. Files the matching answer from `outreach/drafts.mjs` in Drafts, threaded. Suppresses opt-outs and bounces. Notifies on replies, the pricing page's invoice email, anything else written by hand, and new trial signups | Send anything |
| `ops/weekly.mjs` | Saturdays 10:00 | `seo.mjs --submit`: checks every sitemap page on the live site (status, canonical, title, description, h1, noindex) and pushes pages whose live text changed to IndexNow. `refresh-prospects.mjs`: once a month, new agencies from the Companies House file; tops up the main list when it is under ten sending days | Submit to Google; send email |

**Notifications** go to a Windows notification on this laptop, and also to
`ALERT_EMAIL` if `.env.local` sets it. That email goes out over the venditas.in
mailbox, is not outreach, and does not count against the cap.

**Fixed while measuring, 14 September.** `seo.mjs` found that every sitemap URL
and canonical named `https://venditas.in`, which 307-redirects to
`https://www.venditas.in`. It also found ten pages with no canonical, and a DPA
page with six `<h1>` elements. Canonicals, the sitemap, robots.txt and
`metadataBase` now use www. Every page has a canonical, the DPA's annexes render
as `<h2>` rather than extra `<h1>`s (`lib/legal.mjs`), and the home page carries
`SoftwareApplication` structured data. None of this is live until deployed.

## Stays with a person, and why

- **Sending a reply.** `docs/runbooks/replies.md`: reply personally. The watch
  gets the answer to Drafts within twenty minutes; pressing send is the part
  that stays human.
- **LinkedIn.** `docs/strategy-10k.md` says not to automate it, because Abin's
  account is the asset.
- **Deploying.** Nothing goes live until the founder says so (`docs/state.md`).
  The weekly check reports pages that are written but not live, every week,
  until they are.
- **Accounts on other sites:** Google Search Console, Bing Webmaster Tools, G2,
  UK Recruiter, AlternativeTo, and the partner and podcast emails in
  `outreach/partners.md`. Each is a one-off form or relationship in the
  founder's name, and a browser working through them is excluded by the
  founder's constraint.

## Rejected

- **Sending replies automatically.** It would save minutes, and the one person
  who replied is the reader most likely to spot a machine. Drafts get the
  saving without that risk.
- **Classifying replies with Gemini.** A reply carries a name and a signature,
  which is personal data the free tier may not receive (003). Keyword rules on
  this machine cover the five shapes a reply takes. `outreach/drafts.mjs` has
  the rules; the test cases are in the session that wrote them.
- **A push service for alerts** (ntfy, Pushover, Slack). Less code, but every
  replying agency's name would sit on a third party's server, and it breaks the
  on-this-machine constraint.
- **Gmail or Slack connectors, browser automation, cloud routines.** Ruled out
  by the founder on 14 September: strictly this machine.
- **Generating SEO pages on a schedule.** `docs/runbooks/inbound.md` rules out
  programmatic pages: thin pages drag down the ones that matter. Pages are
  written deliberately; the weekly job measures them.
- **Rank tracking by scraping Google.** It is against Google's terms, and a
  laptop's IP is blocked within days. Search Console reports the same thing
  once the founder has verified the site.
- **Pinging Google with the sitemap.** Google retired the endpoint in 2023.
- **Running outreach, connection-finding or posting from a second LinkedIn
  account** (offered by the founder on 14 September, "doesn't matter if it gets
  banned"). A new profile messaging strangers is what LinkedIn's spam controls
  catch first. An empty profile pitching Venditas also discredits the emails
  that name Abin Johnson, and the complaints attach to the brand and the domain,
  not the account. Collecting profiles breaks `ops/build-prospects.mjs`'s
  no-LinkedIn rule and falls outside `legal/lia.md`. Instead:
  `outreach/company-page/`, a page with a month of posts scheduled natively in
  LinkedIn, with Abin's own profile as super admin.
- **Generating the LinkedIn pack every week.** A pack reserves its agencies away
  from email for 21 days whether or not the invitations go out. Until the About
  section is fixed and week one is worked, a weekly pack only starves the
  email batch.
- **Making the bare domain canonical instead.** That needs the Vercel dashboard
  (off this machine) and a permanent redirect. The code follows the address
  that is actually served.

## Consequences

- **The laptop has to be on.** This was 010's accepted risk, and it now covers
  replies as well as sending. A missed run starts on waking.
- **The watch logs in to the mailbox about 72 times a day.** If GoDaddy throttles
  it, the interval goes up in `ops/install-schedule.ps1`.
- **The first watch run on a machine only records what is already there.**
  Acting on old mail would draft answers to replies that may already have been
  answered.
- **Job state lives in `ops/.cache/`,** which is gitignored: it holds message ids
  and addresses. Every job's last result is shown under AUTOMATION in
  `node ops/status.mjs`.
