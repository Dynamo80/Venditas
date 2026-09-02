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

## Blocked on the founder

| Item | Why it matters |
|---|---|
| Run `sql/003_customers.sql` | There is nowhere to record that someone paid |
| Razorpay business category | Account is registered for dropshipping; selling SaaS through it risks a settlement hold, and invoices carry the wrong business name |
| Supabase region | One line from the dashboard; the DPA has a placeholder without it |
| Solicitor review of privacy, terms, DPA | A UK agency will not sign an unreviewed DPA from an overseas sole trader |

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
