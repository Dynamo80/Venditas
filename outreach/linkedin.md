# LinkedIn playbook — Venditas

Founder-led outreach from Arseny's personal profile. ~20 touches a day, under 20 minutes,
executed by hand. UK recruitment agencies, 5–30 people.

Researched and written 2 September 2026. Platform limits change without notice — re-check
the ones flagged in [§0.5](#05-what-im-not-certain-about) before scaling volume.

---

## 0. Research findings that shape everything below

### 0.1 The finding that rewrites the sequence

**A free LinkedIn account can add a personalised note to only a handful of connection
requests per month.** Not per day — per month.

LinkedIn's own help pages state this, and they do not agree with each other on the number.
[Personalize invitations to connect](https://www.linkedin.com/help/linkedin/answer/a563153)
gives "up to three connection requests per month"; the
[Invitation limit reached](https://www.linkedin.com/help/linkedin/answer/a550555) page gives
five. Either way it is a single-digit monthly allowance, against a plan that sends ~250
requests a month. Premium removes the cap.

**Consequence: 98% of connection requests go out with no note. The profile is the note.**
That is not a compromise forced on us — see 0.2 — but it does mean Section A is the highest-leverage
part of this document. Every other section assumes the profile is done first.

The character limit on a note, for a free account, is **200 characters** (LinkedIn's help page,
same source). Third-party sources claim 300 for Premium. Write to 200 and you are safe either way.

### 0.2 Note vs. no note

The vendor studies contradict each other, badly:

| Source | Sample | Finding |
|---|---|---|
| [Belkins / Expandi](https://expandi.io/blog/linkedin-connection-message-templates/) | 20M+ outreach attempts | 26.42% with note vs 26.37% without — identical |
| [Botdog](https://www.botdog.co/blog-posts/linkedin-acceptance-rates) | 16,492 invitations, 37% overall | Blank requests accepted materially more often |
| [ReactIn](https://www.reactin.io/blog/linkedin-connection-request-with-or-without-note) | 80,000+ automated campaigns | 55–68% blank vs 28–45% with a note |

All three are published by companies selling LinkedIn automation, none disclose full
methodology, and they disagree by a factor of two. **Treat none of these numbers as reliable.**

The one consistent signal across them: a *templated* note depresses acceptance because it
reads as the opening move of a sales sequence, while notes lift *reply* rate after acceptance
(Botdog: 9.36% vs 5.44%). That maps exactly onto our situation. Recruiters are the population
best at spotting a sequence — it is a core professional skill for them — so a generic note is
worse than silence, and the persuasion belongs *after* the accept, where there is room to do
it properly.

Which is the same conclusion the free-account cap forces on us anyway. Convenient.

### 0.3 Volume limits and what actually triggers a restriction

**What LinkedIn officially says** — from
[Types of restrictions for sending invitations](https://www.linkedin.com/help/linkedin/answer/a551012/types-of-restrictions-for-sending-invitations):

- Restrictions trigger when you "sent many invitations within a short amount of time" **or**
  when "many of your invitations have been ignored, left pending, or marked as spam."
- "If you send an excessive number of invitations and we suspect the use of an automation
  tool," LinkedIn may suspend or restrict the account.
- "Most restrictions will automatically be removed within one week."
- Excessive **pending** invitations: wait "up to one month before attempting to send another
  invitation."
- After withdrawing an invitation, **you cannot re-invite that person for up to three weeks.**

Note what is *not* in there: a number. LinkedIn does not publish the cap.

**What the community consistently observes** (PhantomBuster, Expandi, LeadLoft, Cleverly,
Dux-Soup, all 2026): a weekly ceiling around **100 invitations**, applied on a rolling 7-day
window rather than a calendar week, identical across Free, Premium and Sales Navigator —
paying does not raise it. New or low-trust accounts are throttled lower, ~50–80/week.
Withdrawing pending invites does **not** return quota; the count is of requests sent.

**New vs. established.** Arseny's account is old and has ~500 real connections, which is
established. But it has never sent outreach, so its behavioural baseline is "occasional
browsing." Jumping from that to 20 invites a day is itself an anomaly. Ramp:

| | Invites/day | Invites/week |
|---|---|---|
| Week 1 | 8 | 40 |
| Week 2 | 10 | 50 |
| Week 3 | 12 | 60 |
| Week 4+ | 12 (steady) | 60 |

Steady state stays at **60/week against an observed ~100 ceiling**. The headroom is
deliberate: the cap is dynamic and reacts to acceptance rate, and we would rather spend
the margin on safety than on 40 more requests a week that would not change the outcome.

**The acceptance rate is the real limit, not the number.** LinkedIn weights ignored and
pending invites heavily. Recruiters accept at unusually high rates, which is the entire
reason this channel works — but if acceptance drops below ~25%, stop and fix targeting
before sending more. Volume with poor acceptance is what gets accounts restricted, not
volume as such.

### 0.4 What gets automation detected

Arseny is sending by hand, so most of this is moot. Recording where the line is, because
the temptation to "just install one tool" arrives around week three.

Flagged, per 2026 reporting from Cleverly, Dux-Soup, LinkedInsider and Northlight:

- **Velocity and rhythm.** Actions at machine-regular intervals, activity at 3am local time,
  200+ requests in a day, 100 messages in an hour. Human sending is lumpy; automated sending
  is not.
- **Browser extensions and cloud senders** (Dux-Soup, Expandi, PhantomBuster, Waalaxy, HeyReach
  et al.) — explicit User Agreement violations regardless of how slowly they are configured.
  2026 reports describe detection flagging suspicious sessions within ~48 hours rather than weeks.
- **Bulk profile scraping.** Pulling thousands of profiles quickly is one of the loudest signals.
- **Infrastructure.** Datacentre IPs, and many accounts operating from one IP.
- **Quality signals.** Low acceptance plus spam reports will restrict an account that never
  touched a tool.

Two practical notes for this specific case:

1. **Do not use a UK VPN.** The instinct is to look local to the prospects. LinkedIn does not
   care where Arseny sits — his profile says India and that is fine — but it does care about a
   session location that changes. A consistent Navi Mumbai IP is safer than an inconsistent
   UK one.
2. **Spreadsheets, keyboard shortcuts and pre-written text are not automation.** Preparing all
   twenty messages in a text file and pasting them one at a time is manual sending. The line is
   crossed when software touches the LinkedIn session, not when you prepare in advance.

**One limit that will bite before any of the above:** the free-account
**Commercial Use Limit**, which throttles search after roughly 250–350 profile searches a
month (community-observed; LinkedIn does not publish the number) and resets on the 1st.
At 12 prospects a day Arseny will approach it. Mitigation in [§B.5](#b5-working-around-the-commercial-use-limit).

### 0.5 What I'm not certain about

Read this before treating any number above as a rule.

| Claim | Confidence | Note |
|---|---|---|
| ~100 invites/week ceiling | **Medium** | Not published by LinkedIn. Community consensus only. This is why the plan sits at 60. |
| 3 vs 5 personalised notes/month | **Low on the number, high on the fact** | LinkedIn's own two help pages disagree. Plan for **zero** notes; treat any as a bonus. Verify in-product: if "Add a note" is greyed out or absent, the allowance is spent. |
| 200-char note limit (free) | **Medium-high** | Stated on LinkedIn's help page. Write to 200 regardless. |
| Acceptance rate with vs. without a note | **Low** | Three vendor studies, contradictory, thin methodology. The operational choice is forced by the note cap anyway, so this uncertainty costs us nothing. |
| CUL at 250–350 searches/month | **Medium** | Not officially numbered. Behaviour (throttle + monthly reset) is documented. |
| LinkedIn suppresses posts with external links | **Low** | Widely repeated, never confirmed by LinkedIn. Putting the link in the first comment costs nothing, so do it, but don't believe it's decisive. |
| Everything in §0.3 quoted from linkedin.com/help | **High** | Official source, quoted verbatim. |

**Rule for Arseny: if the platform tells you something different from this document, the
platform is right and this document is stale.**

---

## A. Profile

A UK recruiter checks the profile before accepting. With no note on the request, the profile
is doing 100% of the persuading. It has about four seconds.

The honesty constraint is not a handicap here. A solo founder who says so is *more* credible
than a fake "we", because recruiters spend all day reading company blurb and can smell a
one-man band pretending to be twelve. The move is to state it plainly and then make it
irrelevant with specifics only someone who actually built the thing would know.

### A.1 Headline

Paste-ready. LinkedIn allows 220 characters.

**Primary (170 chars):**

```
I build Venditas — candidate CVs into your agency's branded template in four seconds, contact details swapped for a reference code. Solo founder. Ten free at venditas.in
```

**Alternative, leads on the commercial reason (192 chars):**

```
Solo founder, Venditas. Your client can't go around you if they can't see the candidate's name. CV reformatted into your agency's template, contact details redacted, four seconds. venditas.in
```

**Alternative, plainest (139 chars):**

```
I built a tool that puts a candidate CV into your recruitment agency's own Word template with the contact details stripped out. venditas.in
```

Use the primary. Switch to the second only after the fee-protection content in Section D has
been running for a month and the phrase is doing recognisable work.

No "Helping X to Y." No rocket emoji. No "| Entrepreneur | Visionary |".

### A.2 About

Paste-ready. First two lines are what shows before "see more" — they carry the weight.

```
I built Venditas because recruiters kept telling me the same thing: the CV reformatting job
is twenty minutes, it happens at 9pm, and it is the least skilled part of the week.

Drop in whatever the candidate sent — the two-column one, the one that's a scan, the one with
a table nobody can edit — and it comes back as a Word document in your agency's template.
Candidate's name, email, phone and LinkedIn removed and replaced with a reference code.
Four seconds.

The redaction is the part that actually matters, so it's the part I over-built. Every document
is checked after it's generated, and if anything would have leaked you get an error instead of
a file. It fails loudly rather than quietly, because the quiet failure is the one that costs
you a placement fee.

Honest about what this is: I'm one person. I'm not a recruiter and I'm not in the UK — I'm in
Navi Mumbai. I don't have a list of agency logos to show you, because this is new.

What I have instead is this: you can run ten CVs through it right now without an account,
without a card, and without talking to me. If it doesn't handle your messiest CV, you'll know
in four seconds and you've lost nothing. And when you message me, it's me who answers, not a
support queue — which is the one genuine advantage of buying from one person.

£79/month when you're past the ten, everyone in your agency included. No per-seat pricing,
because charging you extra for adding a consultant is a strange way to run a business.

venditas.in — or just message me here, I'll run one for you.
```

Why this works, briefly: it opens with the recruiter's experience rather than the product;
the "two-column one, the one that's a scan" line is the credibility proof, because only
someone who has actually processed real CVs knows those are the hard cases; the weakness is
stated before the reader can find it, which removes its power; and the close is a zero-risk
action rather than a call booking.

### A.3 Experience entry

```
Founder — Venditas
Self-employed · Feb 2026 – Present · Navi Mumbai, Maharashtra, India · Remote

Venditas reformats a candidate CV into a recruitment agency's own branded Word template and
redacts the candidate's contact details, replacing name, email, phone and LinkedIn with a
reference code. Input is whatever the candidate actually sent — PDF or Word, up to 10MB,
including two-column layouts, sidebars, tables, inconsistent date formats and scans. Output
is an editable Word document in about four seconds.

The tool preserves the candidate's own wording. It does not rewrite, embellish or "improve"
their experience, because a CV that says something the candidate didn't say is a problem you
find out about in the interview.

Redaction is verified after generation rather than assumed: if a contact detail survived into
the output, the job errors instead of returning a file.

CVs are processed in memory and discarded. No candidate data is stored.

Built and run solo. Ten CVs free, then £79/month with the whole agency included.
```

### A.4 The rest of the profile

- **Photo.** A real, recent, well-lit photo of his face. Non-negotiable — a default avatar
  loses more acceptances than any wording gains.
- **Banner.** A screenshot of an actual before/after: messy CV on the left, branded output on
  the right. This does more work than any other pixel on the page. If that's not feasible,
  plain colour with `venditas.in` and "CVs into your template, four seconds."
- **Featured section.** One item: the link to venditas.in with the "ten free, no card" line.
- **Location.** Set to Navi Mumbai, honestly. Faking a London location is discoverable and is
  exactly the kind of thing that ends a conversation with someone whose job is verifying people.
- **Custom URL.** `linkedin.com/in/arseny-...` — set it, the default string looks abandoned.
- **Open to work: off.** Obviously, but check — it reframes the whole profile as job-seeking.
- **Do this before sending a single request.** The profile is the campaign.

---

## B. Targeting

### B.1 Who actually decides

At the sizes we care about, £79/month is below every procurement threshold. It is a personal
decision made by whoever feels the pain or manages the people who do.

| Agency size | Decision-maker | Titles to search | Notes |
|---|---|---|---|
| 2–10 | The founder, always | `Managing Director`, `Director`, `Founder`, `Owner`, `Principal Consultant` | Often the same person still formatting CVs at 9pm. Fastest yes available. Shortest sales cycle of any segment. |
| 11–30 | Founder **or** the ops/delivery layer | `Operations Manager`, `Head of Operations`, `Delivery Manager`, `Head of Delivery`, `Resourcing Manager`, `Business Manager`, `Associate Director`, `Team Leader` | The ops person owns "how we do things here" and is usually the one who built the Word template in the first place. They are the *best* prospect in this whole list — they feel the pain, they can champion internally, and £79 is inside their discretion or one conversation from it. |
| 31–50 | Ops/COO, slower | Same as above plus `Head of Talent Delivery`, `COO` | Workable but the cycle lengthens and an incumbent ATS relationship usually exists. Lower priority. |
| 50+ | Skip | — | Procurement, vendor reviews, existing Daxtra/Textkernel-style tooling. £79/month is not worth a two-month cycle for a solo founder. |

**Sweet spot: 5–30 people.** Enough CV volume that the manual job hurts, small enough that
one person decides this week.

**The most expensive targeting mistake available: in-house recruiters.** `Talent Acquisition`,
`Talent Partner`, `Recruitment Business Partner`, `Internal Recruiter`, `Head of People` at
non-agency companies. They do not rebrand CVs into a template for a client, and they have no
placement fee to protect. They will accept the connection — they accept everything — and then
never convert, quietly poisoning the acceptance-to-reply metric. Exclude them by name.

### B.2 Filters, free account

The free People search offers, under **All filters**: Connections, Locations, Current company,
Industry, Profile language, Schools, plus **Title** and **Company** under the keyword sub-filters.

**Company headcount is not available on free People search** — that filter is Sales Navigator.
Workaround in B.4.

Set these:

- **Industry:** `Staffing and Recruiting` — the single most valuable filter available, it
  removes the in-house population almost entirely
- **Locations:** `United Kingdom`, or run city-by-city — `Greater London`, `Greater Manchester`,
  `Birmingham`, `Leeds`, `Bristol`, `Reading`, `Glasgow`, `Edinburgh`. City-by-city produces
  better lists and burns fewer searches than paging through a national result set.
- **Connections:** `2nd` and `3rd+` both on. 2nd-degree first — shared connections lift
  acceptance and cost nothing.

### B.3 Keyword strings, paste-ready

LinkedIn's free keyword box accepts `AND`, `OR`, `NOT`, quotes and parentheses.

**Micro-agency owners:**

```
("recruitment agency" OR "recruitment consultancy" OR "search and selection") AND ("Managing Director" OR Founder OR Director) NOT "talent acquisition" NOT "in-house"
```

**The ops/delivery layer — highest-value segment:**

```
("recruitment" OR "staffing" OR "talent solutions") AND ("Operations Manager" OR "Head of Operations" OR "Delivery Manager" OR "Head of Delivery" OR "Resourcing Manager") NOT "in-house" NOT "talent acquisition"
```

**Permanent-focused, where the fee-protection story is strongest:**

```
("permanent recruitment" OR "perm desk" OR "placement fee") AND ("Director" OR "Manager")
```

**By specialism** — matters because the sample CV should match what they recruit for. Swap the
first term: `"tech recruitment"`, `"finance recruitment"`, `"engineering recruitment"`,
`"healthcare recruitment"`, `"construction recruitment"`, `"legal recruitment"`. Tech and
finance/accountancy are the two largest segments in the existing prospect list, so start there.

**Perm over contract.** Contract and temp desks earn a margin on timesheets; perm desks earn a
placement fee that a client can eliminate with one direct phone call. Both rebrand CVs, but
only one has the fee at genuine risk. Prioritise perm.

### B.4 Getting company size without Sales Navigator

Free **Company** search *does* have a headcount filter. So:

1. Company search → Industry `Staffing and Recruiting` → Location `United Kingdom` →
   Company size `11-50 employees` (and separately `2-10`).
2. Open a company → **People** tab → filter by title within that company.
3. Save the company names into a sheet. This is a once-a-week list-building job, not a daily one.

This is also more efficient against the Commercial Use Limit: one company search yields
several named prospects.

### B.5 Working around the Commercial Use Limit

At ~12 prospects a day, Arseny will run near the throttle. Reduce search consumption:

- **Build lists weekly in one sitting, work from the list daily.** A saved list of 60 names
  costs a handful of searches; looking up 12 people a day costs 60 a week.
- Prefer **company-page People tabs** over fresh people searches.
- Do not idly browse profiles mid-month. Profile views count toward commercial use.
- If throttled: it resets on the 1st. Spend the remainder of the month messaging people who
  already accepted — which is productive work anyway.

### B.6 The ten-second qualification, before clicking Connect

Skip anyone who fails:

- [ ] **Agency, not in-house.** Their headline says the agency's name, not "TA at [SaaS company]".
- [ ] **Roughly 3–40 people.** Check the company page.
- [ ] **They submit CVs to clients.** Job posts, candidate-spec posts, "my client is looking for…"
- [ ] **The agency has a real website with a logo.** Hard requirement — no logo, no branded
      render, and the render is the entire sequence. No logo, no target.
- [ ] **Active in the last ~60 days.** A dormant profile never sees the follow-up.

---

## C. The sequence

Three touches. Never a fourth.

### C.1 Where the branded render lands, and why

The strongest asset is that we can render a CV in *their* agency's branding before they ask.
Three possible slots:

**Not the connection request** — mechanically impossible. No attachments, and no note at all
on 98% of sends.

**Not the second touch, held back as a reward.** The argument for delaying is reciprocity:
earn the right first. It's wrong here. Delaying means the first message has to be something
*else*, and the only things available are a manufactured question ("how's the market for
perm devs at the moment?") or generic flattery. Both are the textbook opening move of a sales
sequence, and recruiters identify those professionally, every day. A fake opener does not buy
goodwill — it spends it, and then the good asset arrives after the reader has already filed
you as a seller.

**So: the render goes in the first message after acceptance.**

The rule is "never open with a pitch." A pitch is an *ask* — for time, a call, a reply, a trial.
The render is not an ask. It is a finished object, with their own logo on it, produced before
they requested it and handed over with nothing attached. It cannot be mass-produced
convincingly, which is exactly why it does not read as a sequence: the recruiter's
pattern-matcher is tuned for cheap and generic, and this is visibly neither.

The discipline that keeps it from becoming a pitch is that **message one contains no ask at
all.** Not a question, not a link, not "worth a chat?". The moment it contains an ask, it
becomes the thing recruiters are trained to spot.

### C.2 Touch 1 — the connection request

**Send with no note.** Forced by the free-account cap, supported by the acceptance data, and
correct on the merits: a templated note to a recruiter is a tell.

The profile does the work. This is why Section A comes first.

**The 3–5 notes a month you do have** are a scarce asset. Spend them only where there is a
real, specific, checkable reason — the person posted this week about the exact problem, or
you have a genuine mutual connection. Never on an ordinary prospect.

**Note template for those rare cases** (198 chars, within the 200 limit):

```
Hi James — saw your post about rebuilding CVs into the template at 11pm. I built a tool that does exactly that bit. Not pitching; happy to just send you one in Hartley's branding if it's useful.
```

Replace the first clause with the actual observed thing. If there is no actual observed thing,
send it without a note.

### C.3 Touch 2 — first message, 1 to 3 days after acceptance

**Not the instant they accept.** Replying within seconds of an acceptance is the single most
recognisable automation signature on the platform, and it is also slightly unnerving from a
stranger. One to three days reads as a person who got round to it.

Attach **a PNG of page one of the render, inline**, not the .docx. Reasons: it renders in the
message without a download, and a stranger's Word attachment is a thing security-aware people
do not open. Offer the editable file only if they ask.

**Paste-ready** (swap the bracketed values):

```
Thanks for connecting, [James].

No ask attached to this one. I ran a sample CV into [Hartley Grey]'s template to see whether
it would hold up — page one below.

Name, email, phone and LinkedIn stripped out, reference code in their place. Four seconds,
from whatever the candidate happened to send.

I built it, so I was mostly curious whether your template would survive it. It did.

Ignore freely — genuinely no reply needed.
```

Sixty words. No link, no question mark, no ask. "Ignore freely" is not a technique, it is the
literal instruction, and it is the line that stops the message reading as an opening move.

**If the render genuinely failed** — bad logo, colours off, template didn't survive — do not
send it. Send nothing and move that prospect to the second-touch-only track. A bad render
argues against the product more effectively than anything a competitor could say.

### C.4 Touch 3 — second touch, 5 to 7 days later, only if no reply

This one carries the fee-protection angle, which is the argument no competitor is making.

**Paste-ready:**

```
Last one from me, [James].

Every other tool that strips names off a CV sells it as bias reduction. That's not why
agencies do it. You do it because a client holding a candidate's mobile number doesn't need
you for the second conversation.

So that's the part I built for. The redaction gets verified after the document is generated —
if a phone number survived into the output, you get an error instead of a file. It fails
loudly, because the quiet failure is the one that costs you a fee.

venditas.in — ten free, no card, no account. £79/month after that, whole agency included.

If it's not for you, no reply needed. I won't chase.
```

"I won't chase" is true and it is kept. It also, reliably, raises reply rate among the people
who were on the fence — because it removes the cost of engaging.

**Then stop.** No third follow-up, no "just bumping this", no re-add in three months. The
connection persists; the content in Section D keeps reaching them; that is the long game.

### C.5 Replies — paste-ready handlers

**"How much?"**

```
£79/month, everyone in the agency included — no per-seat charge. Ten CVs free first, no card.
If it can't handle your worst CV you'll know inside a minute.
```

**"Our ATS already does this" / "Bullhorn does this"**

```
Fair — and if the output is good, you genuinely don't need me. The two things I hear are that
the formatter needs the CV parsed into the system cleanly first, and that it struggles with
the CVs that weren't built in a normal template. If yours handles a two-column PDF and a scan,
you're covered. If it doesn't, that's the gap I'm in.
```

Never disparage the ATS. Half of them are happy with it and arguing loses the other half too.

**"Where does the candidate data go?" / "GDPR?"**

```
Processed in memory and discarded — nothing about a candidate is stored, so there's no
database of CVs to breach. Happy to send the data protection page, or answer anything
specific your DPO wants to ask.
```

**"Not interested"**

```
No problem — thanks for saying so, that's more useful than silence. I won't follow up.
```

Then actually don't. Log it and never contact them again on any channel.

**"Can you do X?" (a feature it doesn't have)**

```
Not today, no. [Honest one-line answer.] I'm one person so I build what people actually ask
for twice — if you want it, that's one.
```

### C.6 Cross-channel collision

There is a cold-email sequence in `outreach/sequence.md` against a 285-agency list in
`outreach/prospects.csv`, 145 of them UK. **Never run the email sequence and this one at the
same person inside the same fortnight.** A LinkedIn request and a cold email landing the same
week is the clearest possible signal of a machine working a list, and it converts a warm
channel into a burnt one. Keep one shared "contacted" column across both.

**Also reconcile the price.** `sequence.md` still says "£X/month" with £149 as a working
number; this playbook and the brief say **£79**. Two prices in two channels is a credibility
problem the moment anyone compares. Pick one before either sequence runs at volume.

---

## D. Content

### D.1 Why posting matters here specifically

Arseny has no audience, so a post will not reach strangers. That is fine, because the job of
these posts is not reach — **it is to be visible to the ~60 recruiters a week who just accepted
a connection with no note and have no idea who he is.** Content converts a silent connection
into a recognised name, so that the message in touch 2 arrives from someone rather than from
nobody. It is sequence support, not audience building.

Two posts a week. Not daily — daily posting from a nobody looks like a content tool.
Link in the first comment, not the body.

### D.2 Post 1 — the reframe (the unclaimed angle)

This is the flagship. Every competitor in the space — MeVitae, Sapia, Pinpoint, GapJumpers,
plus the whole blind-recruitment literature from techUK and BITC — frames CV anonymisation as
bias reduction, sold to employers for their internal hiring. Not one of them frames it as fee
protection, which is the reason recruitment agencies actually do it.

```
Every piece of software that strips the name off a CV sells it as bias reduction.

That is not why recruitment agencies do it.

Agencies redact candidate details because a client who has the candidate's mobile number does
not need the agency for the second conversation. The redaction is not an equality initiative.
It is the thing standing between you and a client who "just wanted to check one detail" and
somehow ended up making an offer.

I find it strange that an entire product category has decided to sell the noble version of the
reason, when the commercial one is stronger, more honest, and the one that actually gets
budget signed off.

Nobody has ever lost twelve thousand pounds to unconscious bias.

Am I wrong? Genuinely asking — if your agency anonymises CVs primarily for diversity reasons
rather than fee protection, I'd like to hear it, because it would mean I've built the wrong
messaging.
```

The closing question is real, not engagement bait, and it invites the disagreement that drives
comments. Expect pushback from DEI-focused recruiters — see [§F](#f-what-not-to-do) on how to handle it.

### D.3 Post 2 — the observed detail

No product mention at all. This is the one most likely to get shared.

```
A recruiter told me last month that she reformats CVs into the agency template between 9 and
11pm, because it's the only part of the day nobody interrupts.

Twenty minutes a CV. Six or seven CVs on a bad week.

The part that stuck with me: she didn't describe it as a problem. She described it as the job.
Fifteen years in, three billing awards, and a couple of hours a week spent fighting a
two-column layout that won't paste cleanly into Word.

I don't think there's an insight here. I just haven't stopped thinking about it.
```

No hook trick, no "here's what I learned", no numbered lessons. It works because it is
specific and it doesn't sell — which is why the people it describes will reply to it.

### D.4 Post 3 — technical competence

Proves the founder understands the actual job, which is the substitute for a track record.

```
Things that break a CV reformatting tool, in order of how often I've had to fix them:

1. Two-column layouts. Text reads left-to-right across both columns, so the job title lands
   in the middle of the previous role's responsibilities.
2. Tables with merged cells. Employment history in a 3x8 table where two cells were merged in
   2019 and nothing has been right since.
3. Scans. Someone photographed a printed CV. It is a picture. There is no text.
4. Dates. "2019-2021", "Mar 19 – present", "3 yrs 2 mos", and my favourite, "2018 - 2018".
5. Contact details in the header. Not the document body — the actual Word header, where a
   naive find-and-replace never looks. This is the one that leaks a phone number to a client.

Number 5 is why the redaction gets checked after the document is built rather than during. If
a contact detail survived into the output, the job errors instead of handing you the file.

A tool that quietly leaks a candidate's mobile is worse than no tool, because you don't find
out until the client has already called them.
```

### D.5 Post 4 — the honest outsider

Deploy after the first three. Turns the credibility gap into the content.

```
I'm not a recruiter. I built a tool for recruiters. Here's what I got wrong.

I assumed the value was time. Twenty minutes a CV, several CVs a week, multiply it out, show
the hours saved. Every recruiter I showed that to was unmoved.

What they actually cared about was the redaction being right. Not fast — right. One of them
described the failure mode precisely: you don't discover the leak, the client does, and the
first you hear about it is the placement not happening.

So the speed is the headline and the checking is the product. It took about a dozen
conversations with people who had every reason to ignore a stranger from Navi Mumbai to work
that out.

If you're building for an industry you've never worked in: the thing the industry optimises
for is almost never the thing an outsider assumes it optimises for. Ask more, assume less.
```

### D.6 Format rules

- First two lines carry it — roughly 140 characters show before "see more" on mobile.
- One idea per line, blank line between. Walls of text die.
- 2–3 hashtags maximum, or none. `#recruitment #recruitmentagency #ukrecruitment`.
- **No engagement bait.** No "Agree? 👇", no "Comment INFO and I'll DM you", no fake polls.
  This audience punishes it and it is the fastest way to be filed as a marketer.
- Post Tuesday–Thursday, UK morning. From IST that is roughly 12:30–14:30 — a comfortable
  slot for Navi Mumbai.
- **Reply to every comment**, within the hour where possible. On a small account this is the
  entire compounding mechanism.

---

## E. The 20-minute daily routine

Runs Monday to Friday. UK business hours from IST: **12:30–14:30 IST** hits the UK
morning. Pick one slot and keep it.

Steady state is **12 connection requests + 5 first messages + 3 second touches = 20 touches.**
Week 1 runs 8 requests, week 2 runs 10 (see the ramp in §0.3).

1. **[1 min] Open the sheet and the saved prospect list.** No searching during the daily
   window — the list was built in Sunday's block. Searching mid-window burns Commercial Use
   Limit and blows the time budget.

2. **[6 min] Send 12 connection requests.** Work down the list. Ten seconds a profile against
   the B.6 checklist, then Connect → **Send without a note**. If the "Add a note" prompt
   appears, dismiss it. Skip anyone who fails the check rather than lowering the bar to hit
   the number — 9 good requests beat 12 loose ones, because acceptance rate is the metric
   LinkedIn is actually watching.

3. **[7 min] Send 5 first messages.** Filter to acceptances from **2–3 days ago**, not today.
   For each: paste the pre-written message from the batch file, swap name and agency, drop in
   the pre-built render PNG, send. If a render wasn't prepared for that person, skip them —
   they go into Sunday's batch and get messaged next week.

4. **[3 min] Send 3 second touches.** People who accepted 5–7 days ago, got message one, and
   didn't reply. Paste the C.4 text. Mark them closed in the sheet — no third message, ever.

5. **[2 min] Handle replies.** Anything needing more than the C.5 handlers gets flagged and
   answered properly later in the day. Never rush a real conversation to protect the timer.

6. **[1 min] Log it.** One row per touch: name, agency, date, stage, outcome. This is also the
   shared "contacted" record that stops the email sequence colliding.

**Overflow, if the timer allows:** one substantive comment on a UK recruiter's post. Not
"great post" — an actual sentence. This is the cheapest possible way to become a recognised
name before the request lands.

### E.1 The Sunday block — 45 minutes, non-negotiable

The 20-minute daily window only works because the expensive work happens once a week. Without
this, the daily routine is 50 minutes and gets abandoned by Thursday.

1. **[20 min] Build next week's renders.** For everyone who accepted this week: pull the
   agency logo and brand colour from their site, run the sample CV, screenshot page one, save
   as `agency-name.png`. Match the sample CV to their specialism — a tech CV to a tech agency.
   The render is four seconds; fetching the branding is the actual work.
2. **[15 min] Refresh the prospect list to 60+ names** using the B.3 searches and the B.4
   company-page route.
3. **[10 min] Write the week's two posts** and schedule or draft them.

### E.2 Numbers to expect

Honest arithmetic, so week three doesn't feel like failure:

- 60 requests/week → **~20 acceptances** (recruiters accept well; below 25% means fix targeting)
- 20 acceptances → **~2–4 replies**
- Per month: ~240 requests, ~80 acceptances, ~10 conversations, **maybe 3–6 free-tier trials,
  1–2 conversions**

**That is roughly £79–£158 of new MRR a month from this channel alone.** It is slow. It is also
20 minutes a day, it compounds — 80 new recruiter connections a month means the posts in
Section D reach an audience that didn't exist a month ago — and the connections do not expire.
Judge it at 90 days, not at three weeks.

**Kill criteria.** If after 6 weeks at steady volume: acceptance is under 20%, or zero replies
have converted to a trial, stop and change the targeting or the message. Do not just send more.

---

## F. What not to do

**Account risk**

1. **Don't install automation.** Dux-Soup, Expandi, PhantomBuster, Waalaxy, HeyReach and the
   rest are User Agreement violations however gently configured, and 2026 reporting describes
   detection flagging sessions within ~48 hours. A restricted account cannot be replaced —
   the 500 connections and the profile history are the asset.
2. **Don't exceed ~20 requests a day or ~100 a week**, and don't go near either. The plan sits
   at 12/day and 60/week for a reason: the cap is unpublished, dynamic, and reacts to
   acceptance rate.
3. **Don't send in one machine-gun burst.** Twelve requests over six minutes is fine. Twelve
   in ninety seconds at exactly 13:00 every day is a rhythm.
4. **Don't let pending invitations pile up.** LinkedIn explicitly restricts accounts with
   "excessive pending" invites, and the wait can be *up to one month*. Once a month, withdraw
   invites older than four weeks — in small batches.
5. **But don't withdraw to free up quota.** It doesn't work — the count is of requests sent —
   and LinkedIn blocks re-inviting that person for **up to three weeks**.
6. **Don't use a UK VPN.** A stable Navi Mumbai IP is safer than a location that moves.
   His profile says India; that is not a problem to solve.
7. **Don't run this from a second "backup" profile.** Duplicate accounts are a ToS violation
   and losing both is worse than losing one.

**Reputation risk — the more expensive category**

8. **Don't pitch in the connection note.** On the three-to-five occasions a month a note is
   possible, a pitch wastes a scarce asset *and* triggers the recruiter's sequence-detector at
   the worst moment.
9. **Don't message the second they accept.** Nothing says bot louder.
10. **Don't fake the opener.** No "how's the perm market treating you?", no "loved your recent
    post" when there was no recent post, no invented mutual ground. Recruiters spot manufactured
    rapport professionally, daily. Getting caught is strictly worse than never sending.
11. **Don't invent social proof.** No "trusted by UK agencies", no logo wall, no "we". He is
    one person with a new product, and saying so is the credibility play — a claim a recruiter
    can disprove in one search ends the conversation permanently.
12. **Don't send a third follow-up.** Two touches then silence. "Just bumping this to the top
    of your inbox" is the most-recognised move in outbound and it converts a neutral
    non-response into an actively negative impression.
13. **Don't send a bad render.** Wrong logo, mangled colours, broken layout — send nothing.
    A bad render is a live demonstration that the product doesn't work.
14. **Don't put a Calendly link in the first two touches.** A calendar link makes the whole
    thing a sales sequence retroactively, including the parts that weren't.
15. **Don't target in-house TA.** They accept, they never convert, and they degrade the
    acceptance-to-reply signal that this whole channel depends on.
16. **Don't argue about diversity in the comments.** Post 1 will attract pushback from
    recruiters invested in the bias framing. The correct response is
    `"Both reasons are real — I just think one of them is why the budget gets approved.
    Fair challenge though."` Then stop. Winning that argument publicly costs more than losing
    it quietly.
17. **Don't connect with candidates.** Only agency-side people. Candidates in the network make
    the profile read as a recruiter's, which confuses every prospect who checks it.
18. **Don't run email and LinkedIn at the same person the same fortnight.** See C.6.
19. **Don't automate the posts through a scheduling tool that posts on his behalf via API
    login.** Native scheduling inside LinkedIn is fine.

---

## Appendix — the one-page version

- Profile first. It is the entire connection request.
- 12 requests/day, **no note**, ramped from 8. 60/week, never 100.
- Never search during the daily window. Build lists Sunday.
- Message 2–3 days after acceptance, never instantly, always with the branded render, **never
  with an ask**.
- Second touch at day 5–7 carries the fee-protection line. Then stop.
- Two posts a week. Fee protection, not diversity.
- If LinkedIn contradicts this document, LinkedIn is right.

---

**Sources for the platform limits in §0:**
[Types of restrictions for sending invitations — LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a551012/types-of-restrictions-for-sending-invitations) ·
[Invitation limit reached — LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a550555) ·
[Personalize invitations to connect — LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a563153) ·
[PhantomBuster: connection request limits 2026](https://phantombuster.com/blog/social-selling/linkedin-connection-request-limit/) ·
[PhantomBuster: commercial use limit](https://phantombuster.com/blog/social-selling/linkedin-commercial-use-limit/) ·
[LeadLoft: LinkedIn limits 2026](https://www.leadloft.com/blog/linkedin-limits) ·
[Cleverly: why automation tools get accounts banned](https://www.cleverly.co/blog/why-linkedin-automation-tools-get-your-account-banned-and-what-to-do-instead) ·
[Dux-Soup: automation safety 2026](https://www.dux-soup.com/blog/linkedin-automation-safety-guide-how-to-avoid-account-restrictions-in-2026) ·
[Botdog: 16,492 invitations analysed](https://www.botdog.co/blog-posts/linkedin-acceptance-rates) ·
[Expandi: connection message templates](https://expandi.io/blog/linkedin-connection-message-templates/) ·
[ReactIn: with or without note](https://www.reactin.io/blog/linkedin-connection-request-with-or-without-note)
