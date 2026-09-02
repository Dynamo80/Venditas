# State

**Only things that cannot be measured belong here.** For anything else run
`node ops/status.mjs`, which fetches it live.

Last reviewed: 2026-09-02

## Goal

£1,000 MRR. At £79 that is **13 paying agencies**. Currently 0.

## The critical path

Everything else is secondary to this sequence:

1. Founder reviews a batch of outreach emails and approves sending
2. Send 25/day from `founder@venditas.in` + ~20 LinkedIn touches/day
3. A recruiter replies → runs their own CV on the site → invoice via Skydo

Payment integration is **not** on the critical path. A Skydo invoice or a
Razorpay link collects £79 by hand perfectly well for the first customers.

## Blocked on the founder

| Item | Why it matters |
|---|---|
| Approve the first outreach batch | Nothing sends without this. The only real blocker |
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
