# Venditas — Market & Pricing Research

**Date:** 2 September 2026
**Scope:** CV reformatting / parsing / candidate-profile branding tools sold to recruitment agencies (UK & US), 3–50 staff.
**Working assumption under test:** $199 / £149 per month, flat.

---

## 1. Recommendation up front

**Do not launch at £149/$199 flat in the product's current shape. Launch at £79/$99 for the core plan, and hold £149/$199 back until CRM integration ships.**

The single biggest determinant of what you can charge here is not the quality of the output — it is whether the tool is inside the recruiter's CRM. Every credible competitor integrates with Bullhorn, JobAdder, Vincere or Mercury. Venditas does not. Without integration the workflow is *export from CRM → upload to Venditas → download → re-attach*, which is exactly the manual handling the product claims to remove.

### Recommended packaging

| Plan | UK | US | Allowance | Notes |
|---|---|---|---|---|
| **Trial** | free | free | 10 CVs, 14 days | Email gate, no card. **Replaces the current 5/day free tier.** |
| **Solo** | £39 +VAT | £49 | 40 CVs/mo | 1 template. For 1–4 person firms and independents. |
| **Agency** ← lead with this | £79 +VAT | £99 | 150 CVs/mo | 3 templates, unlimited users. |
| **Agency Plus** | £149 +VAT | £199 | 400 CVs/mo | Unlimited templates, priority support. |
| Overage | £0.45/CV | $0.55/CV | — | Or prompt an upgrade. |

- **Flat per agency, not per seat.** Unlimited users on every paid plan.
- **Allowance pooled over a rolling 12 months, billed monthly.** Copy HireAra, which sells "1,500 candidates/year" rather than a monthly cap ([HireAra pricing](https://www.hireara.ai/pricing)). CV volume in a small agency is bursty; a hard monthly cap creates support tickets and a hard monthly *over*-allowance feels wasteful in quiet months.
- **Annual option: 2 months free (~17%).** Offer it, don't force it.
- **Keep £149/$199 as the *Plus* tier now, and promote it to the core tier once Bullhorn + JobAdder integrations ship.** At that point re-tier upward rather than raising the price of an existing plan.

### Why not £149/$199 as the entry price

Because there is a near-exact feature match at $79/month. **CVFormatter** offers agency-branded templates, resume anonymisation, Word/PDF/weblink output *and* a native JobAdder integration for $79/mo (100 resumes) or $299/mo (500 resumes), with a free tier of 5 ([CVFormatter pricing](https://www.cvformatter.co/pricing), [JobAdder integration listing](https://jobadder.com/integration/cv-formatter/)). A buyer who searches "CV formatting software" will find it. £149/$199 for a tool with no CRM integration is a harder sell than the same money for one with it.

### Reasoning, condensed

1. **The category has a hard price wall around $0.60–$1.00 per CV.** FormaCV is $0.99/CV, Candidately is $1.00/exported resume, CVFormatter works out at $0.60–0.79/CV, iReformat's marginal rate is $0.15–0.25/CV. £149 flat only beats these if the agency genuinely processes ~200+ CVs/month. Most 3–15 person agencies do not.
2. **£149/$199 is priced against HireAra, and that's the right *ceiling* but the wrong *floor*.** HireAra Starter is £180/mo +VAT for 1,500 candidates/year with unlimited users ([HireAra pricing](https://www.hireara.ai/pricing)). Undercutting the category leader by 17% is a coherent story — but HireAra has 1,000+ agencies, nine CRM integrations and a brand. A new solo product cannot claim the #2 price slot on day one.
3. **The current free tier is a pricing bug and is the most urgent thing to fix.** Five CVs/day is roughly 110 CVs/month across working days. HireAra's £180/month paid Starter plan allows 125/month. You are currently giving away ~88% of a competitor's £180 plan for free, forever. Almost no 3–15 person agency will ever hit that ceiling, so there is no reason for them to pay.
4. **Per-seat pricing is wrong for this product.** In a small agency, CV formatting is concentrated in one or two resourcers/administrators, not spread across every consultant. Per-seat would either undercount value or invite login-sharing. It also compares badly to HireAra Starter's unlimited users. RemakeCV is the one competitor doing per-seat ($25/user/mo, 30 credits, annual) and it caps volume tightly to compensate ([RemakeCV pricing](https://www.remakecv.com/pricing)).
5. **UK vs US: keep a modest USD premium, don't engineer a big one.** £149 and $199 are already roughly at parity with a small US premium. Quote UK prices "+VAT" — that is the convention in this category (HireAra does it) and UK buyers expect it. *Inference:* a larger US premium is defensible on willingness-to-pay grounds, but you have no US brand, no US references and no US-hours support, so it would be unearned.

---

## 2. Question 3 first, because it is the bad news: do the CRMs already do this?

**Straight answer: yes, four of the seven CRMs I checked ship branded CV formatting natively, and three of those include some form of contact-detail redaction. This is a real and material threat. It is not fatal, but it is worse than the brief assumes, and it should change your targeting.**

| CRM | Native branded CV formatting? | Native redaction of contact details? | How good? |
|---|---|---|---|
| **Recruit CRM** | **Yes** — Business plan and above | **Yes** — keyword + manual highlighter | Header/footer/watermark **overlaid on the original CV**, not a re-typeset into your template. No bulk. |
| **Vincere** | **Yes** — Document Builder | **No** — manual editing step | Rebuilds from CRM field data via wildcards. "No bulk action to re-generate." |
| **Loxo** | **Yes** — native branded resume | **Yes** — one-click anonymise + per-field checkboxes | **Loxo's fixed layout, PDF only.** Cannot upload your own Word template. |
| **Zoho Recruit** | **Yes** — all paid Staffing editions | **Yes** — toggle to hide contact/address | Two template types; Basic keeps original resume, Standard rebuilds from fields. |
| **Bullhorn** | **No** | No | Formatting/anonymisation are **marketplace add-ons** (Allsorter, Candidately, Kyloe AwesomeDocs). |
| **JobAdder** | **No** | Partial — but for internal blind screening, not client submission | Relies on integrations: Allsorter, CVFormatter, Represend. |
| **Mercury** | **No** | No | Integrates **Daxtra Reformatter** (bought separately) since v28, Jan 2024. |

### What this means

**The threatening one is Loxo.** It already does automatic one-click anonymisation of name, photo, phone and email, natively, at no extra cost. That is the exact "commercial point" the brief identifies as the differentiator. Its weakness is that output is PDF only, generated from Loxo's own parsed profile fields in Loxo's own layout — you cannot supply your Word template ([Loxo help](https://help.loxo.co/en/articles/4148571-generate-branded-custom-resumes)).

**The reassuring detail is that none of the native features do the whole job.** In every case the native feature fails on at least one of:
- it stamps a header/footer on the original rather than re-typesetting into your template (Recruit CRM);
- it rebuilds from CRM fields, so it is only as good as the parse and loses the candidate's own wording (Vincere, Loxo, Zoho Standard);
- redaction is a manual step (Vincere) or requires typing keywords / dragging a highlighter (Recruit CRM);
- output is PDF, not editable Word (Loxo);
- there is no bulk operation (Vincere, Recruit CRM).

**But be clear-eyed: these are feature gaps, not moats.** They are the kind of thing a CRM closes in a release or two, and the direction of travel is obvious — Recruit CRM shipped its formatting agent in November 2025 ([Recruit CRM blog](https://recruitcrm.io/blogs/cv-formatting-feature/)).

### The actionable consequence

**Target agencies on Bullhorn, JobAdder and Mercury, and agencies with no CRM at all. Do not sell into Loxo, Zoho Recruit, Vincere or Recruit CRM shops** unless you can demonstrate the Word-template and fidelity gap in a side-by-side. Bullhorn alone is the largest agency CRM by installed base, and it has no native formatting — that is your beachhead.

Sources: [Recruit CRM help](https://help.recruitcrm.io/en/articles/5659171-resume-cv-formatting) · [Recruit CRM blog](https://recruitcrm.io/blogs/cv-formatting-feature/) · [Vincere Document Builder](http://help.vincere.io/en/articles/5219576-creating-formatted-resume-in-document-builder) · [Vincere formatted resumes](https://help.vincere.io/en/articles/1981471-managing-formatted-resumes-in-vincere) · [Loxo branded resumes](https://help.loxo.co/en/articles/4148571-generate-branded-custom-resumes) · [Zoho Recruit formatted resume](https://help.zoho.com/portal/en/kb/recruit/talent-management/formatted-resume/articles/formatted-resume-overview) · [Allsorter on Bullhorn Marketplace](https://www.bullhorn.com/marketplace/allsorter/) · [Mercury v28 release notes](https://portal.wearemercury.com/knowledgebase/article/KA-01537/en-us) · [JobAdder × Allsorter](https://jobadder.com/integration/allsorter/) · [JobAdder × CVFormatter](https://jobadder.com/integration/cv-formatter/) · [JobAdder anonymiser blog](https://jobadder.com/blog/anonymising-applicant-resumes-and-cvs/)

> **Caveat on the JobAdder anonymiser:** the blog describing it is a guest post by Diversely, an integration partner, and the use case is *internal blind screening to reduce hiring bias* — anonymising inbound applicants before your own team reviews them. That is a different job from anonymising an outbound CV sent to a client. It is not a competing feature.

---

## 3. Question 1: competitors and what they actually charge

### 3a. Published pricing (verified on the vendor's own page)

| Vendor | Price | Unit | Volume | Free tier | Notes |
|---|---|---|---|---|---|
| [**iReformat**](https://recruiteze.com/pricing/ireformat/) | $29.95/mo | flat | 50 resumes/mo | 3/mo free | Marginal rate $0.15–0.25/resume at higher tiers. No contract. *Second-hand: pricing page is on recruiteze.com, an affiliated site.* |
| [**CVFormatter**](https://www.cvformatter.co/pricing) | **$79/mo** | flat | 100 resumes | 5 credits free | $299/mo for 500. Anonymisation on **all** tiers. Custom template $49 one-off. Annual saves 20%. |
| [**FormaCV**](https://formacv.ai/pricing) | **$0.99/CV** | per CV | unlimited | 30-day trial | No seats, no minimum, no commitment. Anonymisation + audit log standard. |
| [**Candidately**](https://www.candidately.com/pricing) | **$1.00** | per exported resume | unlimited | none | Unlimited users. Anonymisation included. Client Portal is separate at $99/mo + $49/extra user, **billed annually, no month-to-month**. |
| [**RemakeCV**](https://www.remakecv.com/pricing) | $25/user/mo | **per seat**, annual | 30 credits/mo | waitlist trial | Auto-anonymisation included. |
| [**HireAra**](https://www.hireara.ai/pricing) | **£180/mo +VAT** | flat | 1,500 candidates/**year** | none | Starter tier. Unlimited users, 5 templates. Then £450 (5,000/yr), £950 (12,000/yr), Enterprise custom. |
| [**Textkernel**](https://www.textkernel.com/pricing/) (inc. Sovren) | from $99/mo | credits | 500–25,000 credits | 500 free credits | **This is a parsing API for developers, not a recruiter-facing formatting tool.** Not a direct competitor. |
| [**idibu**](https://ww2.idibu.com/pricing) | **£125/mo** | 5 user licences | — | none | 12-month contract. Job multiposting, **not** CV formatting. Included as a spend benchmark. |

### 3b. Quote-only (no published pricing — stated plainly, not guessed)

- **Daxtra Styler** — quote/demo only. Does redact contact details and applies corporate branding, logo, T&Cs and cover sheet. Enterprise-leaning. One published case study: 200 monthly incoming resumes, "saving 22 hours" (~6.6 min/CV). ([product page](https://www.daxtra.com/products/resume-formatting-anonymizing-software/))
- **Allsorter** — quote only; the pricing page shows "Elite" and "Enterprise" tiers with a *Request Quote* button and the line "Priced per month. Discount offered on annual sign-ups." Claims 400+ organisations "including global enterprise leaders." Bullhorn marketplace listing describes anonymising "name, school, employer, date of birth etc." — framed as **DE&I compliance**, not fee protection. ([pricing](https://www.allsorter.com/pricing), [Bullhorn listing](https://www.bullhorn.com/marketplace/allsorter/))
- **RChilli** — quote-driven; public figures circulating ($75–$149/mo entry) come from third-party review sites, not RChilli's own pricing page, which is a "customised pricing" request form. Treat as unverified. ([RChilli pricing](https://www.rchilli.com/pricing))
- **Kyloe AwesomeDocs** (Bullhorn add-on) — quote only. Document generation incl. CVs; no explicit anonymisation. One customer claim: candidate profile prep from 2 hours to 15 minutes. ([Kyloe](https://kyloepartners.com/document-automation/))
- **Logezy** — quote only, and **not a competitor**: it is UK staffing/healthcare workforce management (shifts, timesheets, compliance, payroll). ([Logezy](https://www.logezy.com/))
- **CV Partner** — **now rebranded Flowcase**, quote only, and **not a competitor**: it sells to management/IT/engineering consultancies for bids and RFPs, not recruitment agencies. No anonymisation mentioned. ([Flowcase pricing](https://www.flowcase.com/pricing))
- **Hinterview** — no public pricing. The pricing URL 404s and the main site redirects to a login at `my.hinterview.com`, so the marketing site is effectively gated. It is a video-interviewing / candidate-presentation product, adjacent rather than competing.
- **Represend** (JobAdder integration) — quote only. Merges branded coversheets and legal conditions with the candidate's resume and tracks views/downloads. **No redaction** — not a competitor on the anonymisation job. ([JobAdder × Represend](https://jobadder.com/integration/represend/))

### 3c. Do they sell to small agencies?

- **Yes, actively:** iReformat, CVFormatter, FormaCV, RemakeCV, Candidately — all self-serve, all with free or near-free entry, none with enterprise minimums.
- **Yes, but from above:** HireAra's Starter is explicitly "Good for small agencies" at £180/mo.
- **Effectively no:** Daxtra, Allsorter, RChilli, Textkernel enterprise — sales-led, demo-gated, annual contracts.

**The conclusion for pricing:** the small-agency end of this market is *already served* and *already cheap*. There is no pricing vacuum at $199. There is arguably one at £79–99 with a credible brand and a CRM integration.

### 3d. A warning sign worth taking seriously

**Quibench, a UK CV formatting and redaction tool aimed at recruitment agencies, has shut down.** Its site now reads "This project is suspended" and "Quibench is no longer operating under this brand and is not accepting new sign-ups," with stored CVs deleted ([quibench.io](https://quibench.io/)). A direct competitor in exactly this niche, in exactly this geography, did not survive.

Related observation: several of the low-priced entrants (iReformat, FormaCV, CVFormatter, cvready) publish near-identical "8 best CV formatting tools" listicles that rank each other. That is a signature of programmatic-SEO micro-SaaS. Their *prices* are real and verifiable on their own pages, but their *durability and scale are unverified* — do not assume any of them is a large business, and do not assume they will still be there in a year.

---

## 4. Question 2: is CV reformatting genuinely painful?

Evidence gathered so far is **supportive but heavily vendor-sourced**, which is the weakest kind. Vendors selling formatting tools have an obvious incentive to overstate the pain. Ranked by trustworthiness:

**Moderately trustworthy (a named customer, in a published case study):**
- Daxtra: one client's "200 monthly incoming resumes can now be processed more quickly, saving 22 hours" — implies ~6.6 min saved per CV, and confirms a real agency processing **200 CVs/month**. ([Daxtra Styler](https://www.daxtra.com/products/resume-formatting-anonymizing-software/))
- Kyloe: a customer reporting candidate profile preparation dropping "from 2 hours to 15 minutes." ([Kyloe](https://kyloepartners.com/document-automation/))

**Vendor marketing claims (treat as directional only):**
- HireAra: customers report "5–20 minutes" saved per CV; "2 minutes. That's how long it takes to send a HireAra CV." ([HireAra](https://www.hireara.ai/product))
- Recruit CRM, describing why it built the feature: manually reformatting resumes "can take hours." ([Recruit CRM blog](https://recruitcrm.io/blogs/cv-formatting-feature/))
- Allsorter: "up to 80% time savings per formatting transaction." ([Bullhorn Marketplace](https://www.bullhorn.com/marketplace/allsorter/))
- iReformat: claims manual reformatting averages "30 to 60 minutes per resume" — this is the highest claim found and comes from a vendor blog with no methodology. **Treat with scepticism.**

**The useful cross-check** is that four CRM vendors independently built this feature into their products. Companies do not build features nobody asks for. That is decent indirect evidence the pain is real — but note it cuts both ways: it is also evidence the pain is *being solved by someone other than you*.

> Deeper primary-source research (recruiter forum discussions, job adverts listing CV formatting as a duty, offshore per-CV formatting services, and the fee-protection/backdoor-hire motivation) was commissioned but **had not returned at the time of writing**. See §7.

---

## 5. Question 4: what small agencies spend on tooling

Partial. The verified anchors available:

- **idibu: £125/month for 5 user licences, on a 12-month contract** ([idibu pricing](https://ww2.idibu.com/pricing)). This is the single most useful comparator in this document. idibu is a well-established, essentially *load-bearing* tool for a UK agency — job multiposting to boards. A 5-person agency pays £125/mo for it. **A CV formatting tool priced at £149/mo would cost more than the agency's job-board distribution platform.** That is a very hard sell, and it is the strongest single argument against £149 as an entry price.
- **HireAra Starter: £180/mo +VAT**, the top of the small-agency range for this specific job.
- **Candidately Client Portal: $99/mo for 1 user + $49/additional user, annual only** — so a 5-user agency is ~$295/mo.
- **Textkernel Professional: from $99/mo.**
- **Crelate (core CRM): $85/user/mo (Essentials, annual, up to 2 users) and $119/user/mo (Business)** ([Crelate pricing](https://www.crelate.com/pricing)). This is one of the few agency CRMs with fully public per-seat pricing, and it is the best available proxy for core-system cost.

### The ratio test — the most useful way to read this

A 5-person agency on Crelate Business pays roughly **$500–600/month for its CRM**. Point solutions in most SaaS stacks land at **10–25% of the core system's cost**; above that, they start attracting "do we really need this?" scrutiny at renewal.

- 10–25% of $500–600 = **$50–150/month**. → The recommended **$99** sits squarely inside it.
- **$199 is ~35–40% of core CRM spend for a single-purpose tool with no CRM integration.** That is the number that will get the subscription cancelled in month four.

The idibu comparison makes the same point from the other direction: **£125/month buys a 5-user agency its entire job-board distribution platform** ([idibu pricing](https://ww2.idibu.com/pricing)). A CV formatting tool at £149 would cost *more* than the system that sources the candidates in the first place. That ordering is very hard to defend in a renewal conversation, and it is the strongest single argument against £149 as an entry price.

*Inference, not cited:* stacking these suggests a 5–10 person UK agency's discretionary tooling budget outside the CRM is plausibly £300–800/month total, across job boards, sourcing/contact data, and one or two point solutions.

> Full CRM/ATS list pricing, published industry benchmarks on agency technology spend, and placement-fee economics (to express price as a fraction of one placement fee) were commissioned but **had not returned at the time of writing**. See §7.

---

## 6. Question 5: packaging detail and reasoning

### Flat vs per-seat — **flat**
- CV formatting concentrates in 1–2 people (resourcers/admin), so per-seat undercounts value and invites sharing.
- HireAra Starter and CVFormatter are both flat/unlimited-user. Per-seat would price badly against them.
- Flat is far simpler for a solo founder to quote, invoice and support.
- The one per-seat competitor (RemakeCV) pairs it with a tight 30-credit cap, i.e. it is really volume pricing wearing a seat costume.

### Volume allowance — **yes, and pool it annually**
An uncapped flat fee exposes you to a single high-volume customer destroying your gross margin on LLM/OCR costs. But a hard monthly cap punishes bursty usage. HireAra's annual-allowance-with-monthly-billing structure solves both and is worth copying directly.

### Free tier — **kill it, replace with a trial**
This is the most urgent change.
- Current: 5 CVs/day ≈ **110 CVs/month**.
- HireAra's £180/mo paid Starter: **125 CVs/month**.
- You are giving away ~88% of a £180/month competitor plan, indefinitely.

Recommend **10 CVs total over 14 days, email gate, no card**. Keep the email gate — it is working as lead capture. A perpetual free tier is especially wrong for a per-use tool, because the users who stay under a generous cap forever are precisely the small/independent recruiters least likely to ever convert. Note the market convention supports a *small* free allowance: CVFormatter gives 5 credits, iReformat gives 3/month, FormaCV gives a 30-day trial.

### Monthly vs annual — **monthly default, annual discount**
Category convention leans annual (Candidately has no month-to-month; RemakeCV Business is annual-billed; CVFormatter and FormaCV discount annual). But an unproven product from an unknown solo founder forcing annual will crush conversion. Offer 2 months free on annual to pull cash forward and dampen churn; do not require it.

### GBP vs USD — **near-parity, quote UK +VAT**
£149 ≈ $189 and $199 ≈ £155 at prevailing rates, so the working prices already embed a small USD premium. Keep that shape at the lower recommended price points (£79 / $99). Always state UK prices "+VAT" — HireAra does, and UK agency buyers expect it; showing a VAT-inclusive number makes you look ~20% more expensive than you are.

### What actually justifies a premium later
Ranked by how defensible each is:
1. **CRM integration (Bullhorn first, then JobAdder, then Mercury).** This is the price unlock. It is also the thing every competitor already has.
2. **"Nothing gets rewritten."** Competitors lean on generative AI to rewrite and summarise. Recruiters have a real, rational fear of a tool inventing experience on a CV they are legally presenting to a client. Fidelity-by-default is a genuine trust position and nobody else is leading with it. *Inference: this is under-exploited in the current positioning.*
3. **Fee protection as the framing.** Every competitor frames anonymisation as DE&I/bias/GDPR compliance (Allsorter explicitly, JobAdder via Diversely, FormaCV "GDPR-safe blind submissions"). **Nobody frames it as "stop your client going around you."** That is a sharper, more commercial, more emotive story and it is available. This costs nothing to adopt and is the cheapest differentiation on this list.
4. **Robustness on bad inputs** — two-column, sidebars, tables, scans. Plausible but hard to prove in marketing and easy for competitors to claim.

**A caution on the Word-output wedge.** The brief may be over-relying on it. HireAra outputs PDF + trackable link, and Loxo outputs PDF only — but **CVFormatter outputs "Word, PDF & Weblink"** and Daxtra Styler applies full templates ([JobAdder × CVFormatter](https://jobadder.com/integration/cv-formatter/)). Editable Word output is a differentiator against the CRMs and against HireAra, but **not** against the closest-priced direct competitor.

---

## 7. Could not verify / open items

**Commissioned but not returned at time of writing.** Two parallel research threads were still running when this document was written; their findings are not reflected above:
- **Q2 primary sources** — recruiter forum/Reddit/LinkedIn discussion of CV formatting as a chore; job adverts listing CV formatting as a duty (Recruitment Administrator/Resourcer roles, UK) and offshore VA equivalents with salary levels; outsourced per-CV formatting service prices; evidence on backdoor-hire/fee-protection motivation.
- **Q4 primary sources** — published per-user pricing for Bullhorn, Vincere, JobAdder, Loxo, Crelate, Zoho Recruit, Manatal, Recruiterflow etc.; industry benchmarks on agency technology spend (Bullhorn GRID, REC, APSCo, SIA); placement fee and revenue-per-recruiter economics.

**Could not verify at all:**
- **Hinterview pricing** — pricing page 404s and the site redirects to a login; no published figures found.
- **Logezy pricing** — quote-only; no public figures.
- **RChilli's real entry price** — the widely-quoted $75–$149/mo figures come from third-party review aggregators (ITQlick, SoftwareFinder), not RChilli. RChilli's own page is a quote request.
- **Daxtra Styler and Allsorter prices** — genuinely quote-only. Third-party blogs assert "£180+" or "$100/user" ranges; these are competitor-authored SEO content and I would not rely on them.
- **Bullhorn native capability, from a Bullhorn-owned source.** The claim that Bullhorn has no native template formatting is supported by Bullhorn's own marketplace selling third-party formatting tools, and by competitor blogs. I could not find a first-party Bullhorn document stating the limitation outright. Confidence: high but not absolute.
- **Actual CV volume for a 3–50 person agency.** Only one hard datapoint (Daxtra's 200 resumes/month client). The recommended 150-CV Agency allowance is *inference* from that plus HireAra's 125/month Starter tier, not from survey data. **This number should be validated against your own free-tier telemetry before you set the caps** — you already have the usage data to do it, and it is the single cheapest piece of research available to you.
- **Durability of the low-cost competitors.** Prices verified; company size, funding and staying power unverified.
- **Exchange rate** — GBP/USD conversions above are approximate and used only for order-of-magnitude comparison.

**Methodological note:** the web-search budget for this session was exhausted partway through; later findings were gathered by fetching vendor pages directly. Some competitors may therefore have been missed, particularly recent entrants that do not rank for the queries used.
