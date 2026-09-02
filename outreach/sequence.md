# Outreach sequence — recruitment agencies

Written for one job: get a recruiter to open an attachment. Not to explain the
product, not to book a call. The attachment does the selling, because a
formatted CV in their own branding is self-evident in a way no sentence is.

## The mechanic

For each agency, before sending:

1. Pull their logo and brand colour from their own website.
2. Run a sample CV through the tool with their branding applied.
3. Attach the result.

The email is short because the document is the argument. This is why the whole
sequence is worth building around a personalised asset rather than merge tags —
`{{first_name}}` fools nobody, a document with their logo on it isn't a trick.

## Legal footer (required on every send)

Every message carries: real sender identity, the postal address, and a working
one-click unsubscribe. Anyone who opts out is never contacted again on any
sequence. This is not optional — it's the law in the US and the UK, and it's
also the difference between a domain that keeps working and one that doesn't.

> Venditas · [FULL POSTAL ADDRESS PENDING] · Navi Mumbai, India
> Don't want to hear from me again? [Unsubscribe] — one click, no questions.

---

## Email 1 — day 0

**Subject:** `your template, four seconds`

Alternative subjects to rotate (deliverability suffers if every send is
identical):
- `CV formatting for {{agency}}`
- `attached: a CV in your branding`
- `the reformatting job, automated`

**Body:**

> Hi {{first_name}},
>
> I've attached a candidate CV in {{agency}}'s branding — logo, your colours,
> contact details stripped out, reference code in place of the name.
>
> It took four seconds. I built the thing that made it.
>
> If your team still rebuilds CVs into your template by hand before they go to a
> client, that's the job it does. Drop in whatever the candidate sent — the
> two-column ones, the ones with tables, the scans — and it comes back like the
> attachment.
>
> Worth a look? venditas.in — you can run one yourself, no signup.
>
> — {{sender_name}}
>
> *[footer]*

**Why it's shaped this way.** The attachment is named first, because that's the
only line that earns the open. No greeting-paragraph, no "I hope this finds you
well," no claim about hours saved — a recruiter can do that arithmetic faster
than I can assert it. The ask is to look at a page, not to book a call, because
the product demonstrates itself and a calendar link at this stage costs replies.

---

## Email 2 — day 3, same thread

**Subject:** re: previous

> Hi {{first_name}},
>
> Following up on the attached CV — did the formatting hold up?
>
> The bit most agencies check first: the candidate's name, email, phone and
> LinkedIn are removed and replaced with a reference. Every document gets
> checked after it's built, and if anything would have leaked it errors instead
> of handing you the file. Losing a fee to a client who went direct is the
> expensive failure, so it's the one thing that doesn't get to fail quietly.
>
> — {{sender_name}}

Reply-to-thread, not a new subject line. Leads with redaction because that's the
commercial reason the job exists, and anyone who opened email 1 already knows
what it does.

---

## Email 3 — day 8, close

**Subject:** re: previous

> Hi {{first_name}},
>
> Last one from me.
>
> £79/month, unlimited CVs, no contract. If it isn't saving your team real hours
> in the first fortnight, don't pay for the second.
>
> If it's not for you, no reply needed — I won't chase.
>
> — {{sender_name}}

"No reply needed" is there because it's true and because it materially raises
reply rate from the people who *are* interested. Never send a fourth.

---

## What still needs deciding

- **Price: settled at £79/$99.** A founding rate for the first 20 agencies,
  honoured for as long as they stay; £149 standard after. Reasoning in
  `docs/decisions/004-pricing.md`. The single source of truth is
  `lib/pricing.mjs` — if this document and that file ever disagree, the file
  wins, and quoting two prices across two channels is a credibility problem the
  moment a prospect compares them.
- **Sender identity.** Emails sign off as a person, not a company. Confirm which
  name goes on them.
- **Sample CV.** The attachment should be a plausible candidate in a sector the
  agency actually recruits for — a tech CV to a tech agency. Means segmenting
  the list by specialism, which is worth the effort.

## What I will not do

No "just bumping this to the top of your inbox." No fake re-sends. No pretending
we've met. Recruiters read manipulative outreach professionally, every day, and
recognising it is a core skill of the job — getting caught trying it is worse
than not sending at all.
