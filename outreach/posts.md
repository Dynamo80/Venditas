# LinkedIn posts

Rewritten 2026-09-13. Every sentence in a post below can be traced to the code, a
commit, or research with a source. There are no anecdotes, no "a recruiter told
me", and no number that isn't on record. Venditas has no customers yet, and
nothing here implies otherwise.

**The test before posting anything new:** can you point to the file or link
that makes each sentence true? If not, cut the sentence.

## Rules

- **Timing:** Tuesday and Thursday, 08:00–10:00 UK, which is 12:30–14:30 IST while the UK is on summer time (until 25 October).
- **Links:** put venditas.in in the first comment, not in the post.
- **No bait:** no "Agree?", no "comment INFO", no one-word lines for effect.
- **Posting and connecting:** don't post and send connection requests in the same hour. Send the day's requests first, then post at least an hour later, or post first and send requests the next day.
- **Comments:** reply to every one, in a sentence, the same day. Don't pitch in the thread. If someone asks what you're building, answer in one line and offer to send the link privately.
- **The bias challenge:** if someone pushes back on the first post, reply: "Both reasons are real. I just think the fee is why the budget gets approved. Fair challenge though." Then stop.

---

## Week one

### Tuesday 15 September — why an agency takes the name off

> Most of what gets written about anonymised CVs is about reducing bias.
>
> That is a real reason. It is not the everyday reason a recruitment agency
> takes the candidate's name, email and phone off a CV before a client sees it.
>
> An agency does it because a client who can read the candidate's number can
> ring them directly, hire them, and never pay the fee.
>
> In an agency, then, redaction isn't a policy. It sits between a shortlist
> and an invoice.
>
> That changes what "good enough" means. A redaction step that is right almost
> every time isn't good enough. The CV that goes out with a phone number left in
> the footer is the one that costs the fee.
>
> I build a tool that rebuilds CVs in an agency's branding and strips the contact
> details. Because of all this, it reads every finished document back before
> handing it over. If a contact detail survived, you get an error instead of a
> file.
>
> If your agency redacts CVs mainly for a different reason, I'd genuinely like to
> hear it.

First comment: `venditas.in — ten CVs free, no card.`

**Sources.** The bias framing in the anonymisation literature: `outreach/linkedin.md`
§D.2 (research, 2 September). The fee reason: decision 001, `docs/reference/market.md`.
The read-back check: `redactionLeaks()` in `lib/render.mjs`, enforced in
`app/api/format/route.js`. The footer phone number is a hypothetical, written as
one, not something that happened.

### Thursday 17 September — what it's built not to do

> Read the public reviews of CV formatting software and the complaints aren't
> about price.
>
> They're about accuracy: content the candidate never wrote, and employment dates
> put in the wrong order.
>
> For a recruiter that is worse than no tool at all. The document goes to a
> client as the candidate's CV, and if it says something the candidate didn't,
> you find out in the interview.
>
> So the tool I've built for agencies is designed around what it won't do.
>
> It won't rewrite the candidate. Their wording stays, and their roles and dates
> stay in the order they listed them.
>
> It won't fill gaps. If the CV doesn't say something, the field stays empty
> rather than getting a plausible guess.
>
> It won't hand over a leak. The finished document is read back, and if the
> candidate's name, email, phone, links or home address survived, you get an
> error and no file.
>
> The third is a hard check on every document. The first two are how it is built
> to work, and I test them against deliberately awkward sample CVs rather than
> tidy ones.
>
> It's new, it's one person, and I'm looking for the first agencies to use it.

First comment: `venditas.in — run ten of your own CVs, no card, no sign-up.`

**Sources.** The review complaints: `research/growth-2026-09.md` §2, which links
Trustpilot and Capterra reviews. No competitor is named, on purpose. The rules
against rewriting, filling gaps and reordering: rules 1, 2, 7 and 10 in
`lib/extract.mjs`. The hard check: `lib/render.mjs` and `app/api/format/route.js`.
Awkward sample CVs: `reference/samples/README.md` (fictional candidates).

---

## In reserve (true, and can be posted from week two)

### The Europass fault

> Testing my CV tool against a Europass CV turned up a fault I'd rather have found
> than not.
>
> Europass is a form: labels in one column, answers in the other. The tool took
> the street address as the candidate's "location" and carried it through. It
> also missed the candidate's name, because the form puts the surname first,
> after a label.
>
> A street address identifies someone as surely as a mobile number, and this
> document is built to go to a client.
>
> Both are fixed. Labels are stripped before it looks for a name, and surname-first
> names are recognised. Streets are removed, keeping only the town and postcode
> district, which a client needs for the commute. The check that reads the finished
> document back now looks for the home address too.
>
> I found it because I test against the awkward CVs, not the tidy ones. If you run
> an agency, the CV you'd be embarrassed to forward is the one I want to see.

**Source:** commit `7a93eac`. Don't add "nothing else leaked" or "the name came off
as it should". The commit says the name was *not* recognised on that CV.

---

## Removed on 2026-09-13, and why

| Post | Removed because |
|---|---|
| Old post 2, the candidate whose degree was deleted | The repo records the story (`docs/reference/market.md`) but not a link to it, and the post added a detail that isn't in the record ("asked in three interviews"). Find the original post and link it before writing about it again. |
| Old post 3, "the market read" | Its numbers ("fourteen products", "four of seven CRMs", a competitor that "shut down last month") come from 2 September research and were already flagged as needing a re-check. "Last month" becomes false on 1 October. |
| Old post 4, the restart | "About a year in" is not recorded anywhere, and the post framed Venditas as "my last company". The profile's About now covers the restart in two true sentences, and that is enough. |
| Old post 5, the Europass bug | It said "Nothing else leaked. The name and phone came off as they should." The commit for that fix says the name was not recognised. Rewritten above as a reserve post. |
| Old post 6, "why it refuses to hand you a file" | True. Folded into Thursday's post. |
| Intro line "900 followers" | Not recorded anywhere in the repo. |
| `outreach/linkedin.md` §D.3, "A recruiter told me last month that she reformats CVs between 9 and 11pm… fifteen years in, three billing awards" | **Invented.** No such conversation is on record, and Venditas has no customers. Removed from the playbook. |
| `outreach/linkedin.md` §D.5, "Every recruiter I showed that to was unmoved… about a dozen conversations" | **Invented.** No such conversations are on record. Removed from the playbook. |
