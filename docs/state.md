# State

**Only things that cannot be measured belong here.** For anything else run
`node ops/status.mjs`, which fetches it live.

Last reviewed: 2026-09-02 (batch 1 sent)

## Goal

£1,000 MRR. At £79 that is **13 paying agencies**. Currently 0.

## The critical path

Everything else is secondary to this sequence:

1. ~~Founder reviews and approves~~ — waived; the founder authorised sending
   directly on 2026-09-02
2. **Batch 1 sent: 25 UK agencies, 2026-09-02.** Inline branded preview image,
   no attachment. All 25 accepted for delivery
3. Watch for replies, then: recruiter runs their own CV → invoice via Skydo
4. Batch 2 tomorrow — the cap is 25/day and it exists to protect the domain

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
| 2 | A payment page, its URL in `NEXT_PUBLIC_PAY_URL` on Vercel, redeploy | Pricing page button is `mailto:`. Nobody can pay without a reply, an invoice and a bank transfer | 1 hour, plus Razorpay category fix or a Skydo page |
| 3 | Enable billing on the Gemini project | DPA clause 3.4 ("we do not train on your data") is untrue on the free tier. First compliance question every UK agency asks. Cost ~£0.0001 per CV | 10 min |
| 4 | **One founder identity.** The repo names two people: `send.mjs` and the DPA path say Abin Johnson; `outreach/linkedin.md` says Arseny runs LinkedIn outreach; batch 1 was signed Arseny | A prospect who gets an email from Abin and a LinkedIn request from Arseny for the same product reads it as a machine working a list. The DPA needs one legal name in `[FOUNDER FULL LEGAL NAME]` | Decision, then 10 min of edits |
| 5 | Fix the LinkedIn About that says Venditas was shut down | Every cold email that gets looked up finds the founder disowning the product. Rewrite in `outreach/profile.md` | 10 min |
| 6 | Supabase region | One line from the dashboard; DPA Annex 3 and the Article 30 record have placeholders without it | 2 min |
| 7 | Solicitor review of privacy, terms, DPA; settle liability and governing law | A UK agency will not sign an unreviewed DPA from an overseas sole trader | 1–3 hours of fees |
| 8 | Article 27 UK representative, or a written opinion that none is needed; ICO fee question | A line on every supplier questionnaire | £100–500/yr |
| 9 | Back up `.env.local` somewhere encrypted | Every key and the SMTP password exist on one laptop | 5 min |
| 10 | Legal entity | Sole trader now is fine for the first customers. Revisit at the first five-figure contract: Indian Pvt Ltd or UK Ltd, see `legal/compliance-notes.md` §14 | Later |

Items 1 to 3 are the difference between a project and a business: after them a
stranger can try it, pay for it, and be recorded as having paid.

Also blocked on the founder, lower stakes: Razorpay's business category is
"dropshipping", so invoices carry the wrong business name until it is changed.

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

## Known and accepted

- **No SOC 2, no penetration test.** Stated plainly on `/security` rather than
  discovered later.
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
