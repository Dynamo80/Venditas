# Venditas — read this first

CV reformatting for recruitment agencies. Drop in a candidate CV, get it back in
a Word document in the agency's branding, with the candidate's contact details stripped
out. Sold to UK agencies at £79/month. Goal: £10,000 MRR, with £1,000 as the first
milestone (decision 015).

## Before doing anything

```bash
node ops/status.mjs
```

That prints what is **measured**, live: production health, leads, paying
customers, outreach counts, which migrations have run. Never trust a document
for anything that script can tell you — a written status is accurate the day it
is written and quietly wrong afterwards.

Then read `docs/state.md` for the things that cannot be measured: what is
blocked, what happens next, and why.

## The map

| Where | What it answers |
|---|---|
| `docs/state.md` | What is blocked right now, and what to do next |
| `docs/strategy-10k.md` | How 77 agencies is reached: the channels, the model, and the seven decisions awaiting the founder |
| `docs/plan-30-days.md` | The arithmetic from zero to the first £1,000 MRR, and the four things that have to be true |
| `legal/` | Customer-facing privacy, terms, DPA; founder-only compliance notes, LIA, Article 30 record, breach plan |
| `docs/decisions/` | Why we did it this way. Numbered, dated, immutable |
| `docs/runbooks/` | How to perform a task, step by step |
| `docs/runbooks/automation.md` | What runs by itself on the laptop (daily outreach, reply watch, weekly SEO and prospects), and what each notification means |
| `docs/reference/` | Facts that do not change often — competitors, accounts, market |
| `ops/status.mjs` | Live measured state |

## House rules

**Read `docs/decisions/` before proposing a change of direction.** Seven product
ideas were killed getting here and the reasoning is written down. Re-litigating
a settled decision costs a day and lands in the same place.

**Anything measurable goes in a script, not a document.** If you find yourself
writing a number into markdown, ask whether `ops/status.mjs` could fetch it.

**Record a decision when you make one**, as a new numbered file in
`docs/decisions/`. State what was rejected and why — the rejected option is the
part a future reader needs.

**Never invent a candidate's data, and never let one leak.** Redaction is the
product. Both are enforced in code and must stay that way.

## Hard constraints

- Costs stay at zero: free tiers only. The Gemini free tier's terms forbid
  personal data, which is why identifiers are stripped locally before any model
  call — see `docs/decisions/003-gemini-free-tier.md`.
- Growth is paid for by revenue: nothing is spent before money comes in, and
  then only in the order set by decision 017 (decision 016).
- Outreach is capped at 25 emails a day from venditas.in, the only sending domain.
- Hustlr and Labs60 are never used for Venditas: not as a channel, a list, or a
  mention (decision 016).
- The founder is one person, part time, in Navi Mumbai. Anything requiring a
  team does not exist.
