# Runbook — inbound, at zero cost

Outbound is capped at 25 emails a day by domain reputation. Inbound has no
cap, costs nothing, and compounds. It is also slow: general SEO takes months
and is not on the thirty-day critical path. What follows is the short list of
inbound that can produce a trial inside weeks, ordered by expected yield per
founder-hour.

## 1. The Quibench page — built

Quibench, the closest UK comparable, shut in August 2026. Its customers still
have the job and are searching for its name, and no other vendor has claimed
the term. `/quibench-alternative` is live and in the sitemap.

Founder, ten minutes: submit `https://www.venditas.in/sitemap.xml` in Google
Search Console (the **www** property: the bare domain redirects there) so the
pages are crawled this week rather than whenever. Bing is covered without an
account: `ops/seo.mjs --submit` pushes changed pages to IndexNow every
Saturday (decision 018).

## 2. Free directory listings — founder, one hour total

Each of these is a form. Each produces a backlink and a place a recruiter
comparing tools will look. Use the same description everywhere:

> Venditas reformats candidate CVs into a recruitment agency's branded Word
> template with the candidate's contact details removed, so a client cannot
> go around the agency. Ten CVs free, then £79/month for the whole agency.
> Nothing about a candidate is stored.

| Where | Why | Notes |
|---|---|---|
| **AlternativeTo** | List Venditas as an alternative to Quibench and HireAra | This is where "Quibench alternative" searchers land second |
| **G2** | Free vendor profile; recruiters search it | Category: Recruiting Automation / Resume Formatting |
| **Capterra / GetApp** | Free listing | Same category. Ignore the paid-placement upsell |
| **SaaSHub** | Free, indexes fast | |
| **Product Hunt** | One launch day of traffic | Do this after the first two paying customers so there are real quotes |
| **Bullhorn Marketplace** | The beachhead CRM; being listed answers "does it work with Bullhorn" | Partner programme; ask about the developer tier. Do not pay for it |

## 3. Communities where recruiters already ask this question

Answer, do not pitch. One useful reply a day in a place where the question
is already being asked beats a post nobody asked for.

- Reddit: r/recruiting, r/RecruitmentUK, r/UKJobs (recruiter threads)
- The UK Recruiter and Recruiter.co.uk forums and comment sections
- LinkedIn: the four posts in `outreach/posts.md`, one a day, in order

The reply that works: describe the manual process honestly, mention the
failure mode (the recruiter who deleted the degree along with the contact
details, `docs/reference/market.md`), and say what you built only if asked
or in a one-line signature.

## 4. What not to do

- **No paid ads.** Zero budget, and a £79 product with no reviews does not
  pay back a click.
- **No SEO agency, no backlink buying.** Both cost money and the second one
  costs the domain.
- **No programmatic pages** ("CV formatting for dental recruitment agencies
  in Leeds"). Thin pages hurt the pages that matter.
- **No Quibench trademark in ads or as the site name.** A factual comparison
  page is normal; pretending to be them is not.

## Measuring it

`node ops/status.mjs` prints trial sign-ups. Anyone whose email is not on the
prospect list came from inbound. Ask them how they found it in the stage-5
nurture email; it is the only attribution this business needs for now.
