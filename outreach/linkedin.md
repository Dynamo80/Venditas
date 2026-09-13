# LinkedIn playbook — Venditas

Founder-led outreach from Abin's personal profile. ~20 touches a day, under 20 minutes,
executed by hand. UK recruitment agencies, 5–30 people.

Researched and written 2 September 2026. Platform limits change without notice — re-check
the ones flagged in [§0.5](#05-what-im-not-certain-about) before scaling volume.

**Corrected 2026-09-13.**
- The daily work now starts at [`linkedin/START-HERE.md`](linkedin/START-HERE.md).
- Profile text lives only in [`profile.md`](profile.md), and posts only in [`posts.md`](posts.md).
- Messages and reply handlers (§C) were checked against the code and current pricing.
- Two posts built on invented anecdotes were removed (§D).
- The claims that were removed, and why, are listed where they used to be.

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

**New vs. established.** Abin's account is established, but it has never sent
outreach, so its behavioural baseline is "occasional browsing." Jumping from that to 20
invites a day is itself an anomaly. Ramp:

| | Invites/day | Invites/week |
|---|---|---|
| Week 1 | 8 | 40 |
| Week 2 | 10 | 50 |
| Week 3 | 12 | 60 |
| Week 4+ | 12 (steady) | 60 |

Steady state stays at **60/week against an observed ~100 ceiling**. The headroom is
deliberate: the cap is dynamic and reacts to acceptance rate, and we would rather spend
the margin on safety than on 40 more requests a week that would not change the outcome.

**Abin's hard limits** are 15 a day and 100 in any 7 days. `node outreach/linkedin/today.mjs`
counts requests from its log and warns at either. The ramp above stays well inside them.

**The acceptance rate is the real limit, not the number.** LinkedIn weights ignored and
pending invites heavily. Recruiters accept at unusually high rates, which is the entire
reason this channel works — but if acceptance drops below ~25%, stop and fix targeting
before sending more. Volume with poor acceptance is what gets accounts restricted, not
volume as such.

### 0.4 What gets automation detected

Abin is sending by hand, so most of this is moot. Recording where the line is, because
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
   care where Abin sits — his profile says India and that is fine — but it does care about a
   session location that changes. A consistent Navi Mumbai IP is safer than an inconsistent
   UK one.
2. **Spreadsheets, keyboard shortcuts and pre-written text are not automation.** Preparing all
   twenty messages in a text file and pasting them one at a time is manual sending. The line is
   crossed when software touches the LinkedIn session, not when you prepare in advance.
   `today.mjs` reads and writes local files only.

**One limit that will bite before any of the above:** the free-account
**Commercial Use Limit**, which throttles search after roughly 250–350 profile searches a
month (community-observed; LinkedIn does not publish the number) and resets on the 1st.
At 12 prospects a day Abin will approach it. Mitigation in [§B.5](#b5-working-around-the-commercial-use-limit).

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

**Rule for Abin: if the platform tells you something different from this document, the
platform is right and this document is stale.**

---

## A. Profile

A UK recruiter checks the profile before accepting. With no note on the request, the profile
is doing 100% of the persuading. It has about four seconds.

The honesty constraint is not a handicap here. A solo founder who says so is *more* credible
than a fake "we", because recruiters spend all day reading company blurb and can smell a
one-man band pretending to be twelve. The move is to state it plainly and then make it
irrelevant with specifics only someone who actually built the thing would know.

**The paste-ready headline, About, experience entry, banner and settings are in
[`profile.md`](profile.md), and only there.** Two copies drift apart, and the prospect always
reads the stale one.

What the profile has to carry, in order of weight:

1. **What it does and why agencies pay.** A CV in the agency's branding with the contact
   details removed, so the client can't go around the agency.
2. **Accuracy.** The candidate's own words are kept, roles and dates stay in the order they
   wrote them, and a document with a surviving contact detail is refused. Public complaints
   about competing tools are about invented content and scrambled dates, not price
   (`docs/strategy-10k.md` §1). Competitors are not named on the profile.
3. **Honesty about the founder.** One person, in Navi Mumbai, not a recruiter. It is a relaunch
   of a name he previously closed, and it has no customers to show yet.
4. **A zero-risk action.** Ten CVs free, no card, no sign-up. £79/month for the whole agency,
   the founding price for the first 20.

**Removed from this section on 2026-09-13:**
- The old About opened "I built Venditas because recruiters kept telling me the same thing".
  No such conversations are on record.
- It also said "four seconds". Nothing measures that, and the site's upload screen says "about
  ten seconds".
- The old experience entry dated Venditas "Feb 2026". No record supports that date.
- The custom-URL example read `linkedin.com/in/arseny-...`, which is the wrong name. It is now
  `abinjohnson` or `abin-venditas`.

**Do the profile before sending a single request. The profile is the campaign.**

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

At ~12 prospects a day, Abin will run near the throttle. Reduce search consumption:

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
- [ ] **The agency has a real website with a logo.** No usable logo means a render with the
      agency name in type, which gets message one B (§C.3). A *wrong* logo means no render and
      no message.
- [ ] **Active in the last ~60 days.** A dormant profile never sees the follow-up.
- [ ] **Not emailed in the last 14 days.** `today.mjs` checks `sent.log` and the contact ledger.

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
they requested it and handed over with nothing attached. It is visibly specific to them, which
is why it does not read like the generic opening of a sequence.

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

**Note template for those rare cases** (under 200 characters; re-count after filling it in):

```
Hi [name], saw your post about [the actual thing they posted]. I built a tool for exactly that part of the job. Not pitching; happy to send you a sample set up for [agency] if it's useful.
```

The bracketed observation must be real. If there is no actual observed thing, send the request
without a note.

### C.3 Touch 2 — first message, 1 to 3 days after acceptance

**Not the instant they accept.** Replying within seconds of an acceptance is the single most
recognisable automation signature on the platform, and it is also slightly unnerving from a
stranger. One to three days reads as a person who got round to it.

Attach **a PNG of page one of the render, inline**, not the .docx. Reasons: it renders in the
message without a download, and a stranger's Word attachment is a thing security-aware people
do not open. Offer the editable file only if they ask. The week's renders are in
`outreach/linkedin/renders/`, one per agency, each checked by eye.

**A: the render carries their logo or site icon**

```
Thanks for connecting, [first name].

No ask attached to this one. I ran one of my sample CVs through Venditas with [Agency]'s logo on it, to see how it would come out. Page one is below. The candidate is fictional.

The name, email, phone, links and street address come off, and a reference code goes where the name was. The candidate's own wording stays as they wrote it.

Ignore freely, no reply needed.
```

**B: no usable logo, so the agency name is set in type**

```
Thanks for connecting, [first name].

No ask attached to this one. I ran one of my sample CVs through Venditas set up for [Agency], to see how it would come out. Page one is below. The candidate is fictional, and with your logo uploaded it goes where the agency name is.

The name, email, phone, links and street address come off, and a reference code goes where the name was. The candidate's own wording stays as they wrote it.

Ignore freely, no reply needed.
```

No link, no question mark, no ask. "Ignore freely" is not a technique. It is the literal
instruction, and it is the line that stops the message reading as an opening move.

**Corrected 2026-09-13:**
- The old text said the sample was "into [agency]'s template", and closed "I was mostly
  curious whether your template would survive it. It did." The tool applies logo, colours and
  footer to its own layout (`lib/render.mjs`). It has never seen their template, so that
  claim was untrue.
- "Four seconds" is unmeasured.
- The removed identifiers listed only name, email, phone and LinkedIn. The street address and
  every link are removed too (commit `7a93eac`).
- "The candidate is fictional" is added so nobody thinks a real candidate's data was used.

**If the render genuinely failed** — wrong logo, colours off, layout broken — do not
send it. Send nothing and move that prospect to the second-touch-only track. A bad render
argues against the product more effectively than anything a competitor could say.

### C.4 Touch 3 — second touch, 5 to 7 days later, only if no reply

This one carries the fee-protection argument and the accuracy point.

**Paste-ready:**

```
Last one from me, [first name].

Agencies take the contact details off a CV because a client holding the candidate's mobile doesn't need the agency for the second conversation. That's the part I built for. Every finished document is read back, and if a contact detail survived you get an error instead of a file. It also keeps the candidate's own words, and their roles and dates in the order they wrote them.

venditas.in: ten CVs free, no card, no sign-up. After that it's £79 a month for the whole agency, the founding price for the first 20 agencies, and you can buy by email with no call.

If it's not for you, no reply needed. I won't chase.
```

"I won't chase" is true, and it has to stay true. It also takes away the cost of replying.

**Corrected 2026-09-13:** the old text opened "Every other tool that strips names off a CV sells
it as bias reduction." That is false. At least one competitor sells anonymisation "for
compliant submissions" (`docs/reference/competitors.md`). The price line now says it is the
founding price (decision 004) and that buying needs no call (decision 014).

**Then stop.** No third follow-up, no "just bumping this", no re-add in three months. The
connection persists; the content in Section D keeps reaching them; that is the long game.

### C.5 Replies — paste-ready handlers

Each one checked against the code, `lib/pricing.mjs` and the decisions on 2026-09-13.
If something changes (Gemini billing enabled, saved branding built), update the handler
the same day.

**"How much?"**

```
£79 a month for the whole agency, no per-seat charge, or £790 for a year. That's the founding price for the first 20 agencies, and it stays at that rate for them; the standard price is £149. Ten CVs free first, no card, at venditas.in. If it can't handle your worst CV, you'll know in a minute.
```

**"Our ATS already does this" / "Bullhorn does this"**

```
Fair. If what it gives you is something you'd send a client, you don't need me. The test I'd run is your awkward CVs, the two-column PDFs and scans: does it come out in your branding rather than plain text under a header, and does anything the candidate wrote go missing? If yours passes that, you're covered. If it doesn't, that's the gap I'm in.
```

Never disparage the ATS. Half of them are happy with it and arguing loses the other half too.
(Corrected: the old handler began "The two things I hear are…", which referred to
conversations that are not on record.)

**"Where does the candidate data go?" / "GDPR?"**

```
Nothing about a candidate is stored: the file is handled in memory and discarded when the request ends. The name, email, phone, links and street address are removed on our server before the rest of the text goes to Google's Gemini API to be put into sections. I'm on Gemini's free tier, whose terms let Google use what's sent to improve its products, which is why the identifiers come off first. A scanned CV has no text to strip, so its page images go as they are. It's all set out at venditas.in/security, and there's a data processing agreement at venditas.in/dpa. Happy to answer anything your DPO asks.
```

(Corrected: the old handler said only "processed in memory and discarded". That is true but
leaves out Google, which `/security` and DPA clause 3.4 both disclose. A DPO will find it,
so they should hear it from us first.)

**"Does it make things up?" / "Is it AI?"**

```
It uses an AI model to read the CV into sections. It's instructed to copy the candidate's wording, keep their roles and dates in order, and leave a field empty rather than guess. The part that isn't left to instructions is the contact details: every finished document is checked, and it fails rather than hand over a leak. Honestly, the best check is yours: run your messiest CV through the free ten and compare it line by line.
```

**"Can it use our own Word template?"**

```
Not your actual Word file, no. It puts your logo, colours and footer on a clean layout of its own. If your clients expect a particular layout, send me the template and I'll tell you honestly how close it gets.
```

**"Can we save our branding?" / "Can I upload a whole shortlist?"**

**Check venditas.in yourself before you answer.** On 13 September both were being built
(`lib/pricing.mjs` now says "Branding remembered on your computer — set it once" and
"Drop in a whole shortlist at once") but were not yet live. Use whichever reply matches
what the live site does today.

If both work on the live site:

```
Yes. It remembers your logo and colours in your browser on that computer, so you set them once, and you can drop in a whole shortlist in one go. Each CV takes about ten seconds.
```

If they don't yet:

```
Not yet, honestly. Right now it's one CV at a time, with your logo and colours added each time. Both are being built now, and hearing that you'd use them helps.
```

Never give the first reply until you've seen it work on venditas.in.

**"Not interested"**

```
No problem, thanks for saying so. That's more useful than silence. I won't follow up.
```

Then actually don't. Log it `closed` and never contact them again on any channel.

**"Can you do X?" (a feature it doesn't have)**

```
Not today, no. [Honest one-line answer.] I'm one person, so what gets built next is whatever agencies actually ask for. That counts as one.
```

### C.6 Cross-channel collision

**Never run the email sequence and this one at the same agency inside the same fortnight.**
A LinkedIn request and a cold email landing the same week is the clearest possible signal of a
machine working a list, and it converts a warm channel into a burnt one.

How that is enforced now:
- **Every agency in a LinkedIn pack is written to the shared contact ledger**
  (`outreach/contacted.mjs`), so the email batch skips it for 21 days. So is every request
  logged with `today.mjs log … requested`.
- **`today.mjs` checks the other direction.** Any agency emailed in the last 14 days (by
  address or domain, from `sent.log` and the ledger) shows as "emailed <date>, skip until
  <date>" and is never listed as due.
- **Agencies already paying a competitor** (`prospects-hot.csv`, decision 013) are the email
  batch's first job, so they are left out of LinkedIn packs.

**Price: reconciled.** `sequence.md`, this playbook and the site all say £79 (founding, first
20 agencies), £149 standard. `lib/pricing.mjs` is the source of truth.

---

## D. Content

### D.1 Why posting matters here specifically

Abin has no audience, so a post will not reach strangers. That is fine, because the job of
these posts is not reach — **it is to be visible to the ~60 recruiters a week who just accepted
a connection with no note and have no idea who he is.** Content converts a silent connection
into a recognised name, so that the message in touch 2 arrives from someone rather than from
nobody. It is sequence support, not audience building.

Two posts a week. Not daily — daily posting from a nobody looks like a content tool.
Link in the first comment, not the body.

### D.2 The posts

**Paste-ready posts are in [`posts.md`](posts.md), and only there**, each with the file or
link that makes it true. Week one:
- **Tuesday:** why an agency takes the name off. Fee protection rather than bias.
- **Thursday:** what the tool is built not to do. Accuracy and the leak check.

**Removed from this playbook on 2026-09-13:**

- **Old post 2 ("the observed detail") was invented.** It began "A recruiter told me last month
  that she reformats CVs into the agency template between 9 and 11pm", with "fifteen years in,
  three billing awards". No such conversation is on record, and Venditas has no customers.
- **Old post 4 ("the honest outsider") was invented.** "Every recruiter I showed that to was
  unmoved… about a dozen conversations". No such conversations are on record.
- **Old post 1 was rewritten.** It claimed "Every piece of software that strips the name off a
  CV sells it as bias reduction" and "Not one of them frames it as fee protection". Both are
  too absolute, and one competitor sells anonymisation for compliance. "Nobody has ever lost
  twelve thousand pounds to unconscious bias" used an unsourced fee figure; decision 004 puts
  a typical fee nearer £7,800.
- **Old post 3 was folded into posts.md's reserve post.** Its list of failure cases was fair,
  but it said "in order of how often I've had to fix them", and there is no such count.

### D.3 Format rules

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
morning. Pick one slot and keep it. **The step-by-step version, with the commands, is
[`linkedin/START-HERE.md`](linkedin/START-HERE.md).**

Steady state is **12 connection requests + 5 first messages + 3 second touches = 20 touches.**
Week 1 runs 8 requests, week 2 runs 10 (see the ramp in §0.3).

1. **[1 min] `node outreach/linkedin/today.mjs --due`.** It shows the counters and exactly who
   is due. No searching for new prospects during the daily window — the list was built in
   Sunday's block. Searching mid-window burns Commercial Use Limit and blows the time budget.

2. **[6 min] Send the day's connection requests.** Work down the day's pack. Ten seconds a
   profile against the B.6 checklist, then Connect → **Send without a note**. If the "Add a
   note" prompt appears, dismiss it. Skip anyone who fails the check rather than lowering the
   bar to hit the number — acceptance rate is the metric LinkedIn is actually watching.

3. **[7 min] Send first messages** to the people `--due` lists (accepted 1–3 days ago). Paste
   message A or B, attach the render PNG, send. If no good render exists for that agency,
   skip them.

4. **[3 min] Send second touches** to the people `--due` lists (5–7 days after message one, no
   reply). Paste the C.4 text. No third message, ever.

5. **[2 min] Handle replies.** Anything needing more than the C.5 handlers gets flagged and
   answered properly later in the day. Never rush a real conversation to protect the timer.

6. **[1 min] Log each action as you go**: `node outreach/linkedin/today.mjs log "<agency>"
   <stage> ["name"]`. The counters, the due list and the email cooling-off all come from
   this log.

**Overflow, if the timer allows:** one substantive comment on a UK recruiter's post. Not
"great post" — an actual sentence. This is the cheapest possible way to become a recognised
name before the request lands.

### E.1 The Sunday block — 45 minutes, non-negotiable

The 20-minute daily window only works because the expensive work happens once a week. Without
this, the daily routine is 50 minutes and gets abandoned by Thursday.

1. **[20 min] Build next week's list and renders.**
   `node --env-file=.env.local outreach/linkedin-pack.mjs --days 5 --per-day 10` picks UK
   agencies nobody has emailed, renders a sample in each one's branding, and reserves them in
   the contact ledger. Then **look at every render**. Drop any with a wrong logo (a client's
   logo, an accreditation badge or a stock icon) or a site that isn't the agency's. For a
   single agency, `outreach/render-one.mjs --company … --logo <url>` re-renders with a logo
   taken from its own site. Add the keepers to `tracker.csv` with `site` and `render` notes.
   The pack's own `index.html` messages use older wording, so use §C.3 and §C.4.
2. **[15 min] Refresh the prospect list** using the B.3 searches and the B.4
   company-page route, for agencies not already on a list.
3. **[10 min] Check next week's two posts** in `posts.md` against the rule at its top.

### E.2 Numbers to expect

Estimates, not measurements, so week three doesn't feel like failure:

- 60 requests/week → **~16–20 acceptances** (research benchmark: 27% of invitations accepted,
  `research/growth-2026-09.md`; below 25% means fix targeting)
- 20 acceptances → **~2–5 replies** (same source: 28% of those accepted reply, but most
  replies are not interest)
- Per month: ~240 requests, ~65–80 acceptances, ~10 conversations, **maybe 3–6 free-tier
  trials, 1–2 conversions**

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
   the connections and the profile history are the asset.
2. **Don't exceed 15 requests a day or 100 in 7 days**, and don't go near either. The plan sits
   at 12/day and 60/week for a reason: LinkedIn's cap is unpublished, dynamic, and reacts to
   acceptance rate.
3. **Don't send in one machine-gun burst.** Twelve requests over six minutes is fine. Twelve
   in ninety seconds at exactly 13:00 every day is a rhythm.
4. **Don't let pending invitations pile up.** LinkedIn explicitly restricts accounts with
   "excessive pending" invites, and the wait can be *up to one month*. Once a month, withdraw
   invites older than four weeks — in small batches. `today.mjs` flags them.
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
11. **Don't invent social proof.** No "trusted by UK agencies", no logo wall, no "we", no "a
    recruiter told me". He is one person with a new product and no customers yet, and saying so
    is the credibility play — a claim a recruiter can disprove in one search ends the
    conversation permanently.
12. **Don't send a third follow-up.** Two touches then silence. "Just bumping this to the top
    of your inbox" is the most-recognised move in outbound and it converts a neutral
    non-response into an actively negative impression.
13. **Don't send a bad render.** Wrong logo, mangled colours, broken layout — send nothing.
    A bad render is a live demonstration that the product doesn't work.
14. **Don't put a Calendly link in the first two touches.** A calendar link makes the whole
    thing a sales sequence retroactively, including the parts that weren't.
15. **Don't target in-house TA.** They accept, they never convert, and they degrade the
    acceptance-to-reply signal that this whole channel depends on.
16. **Don't argue about diversity in the comments.** The Tuesday post will attract pushback from
    recruiters invested in the bias framing. The correct response is
    `"Both reasons are real — I just think one of them is why the budget gets approved.
    Fair challenge though."` Then stop. Winning that argument publicly costs more than losing
    it quietly.
17. **Don't connect with candidates.** Only agency-side people. Candidates in the network make
    the profile read as a recruiter's, which confuses every prospect who checks it.
18. **Don't run email and LinkedIn at the same agency the same fortnight.** See C.6.
19. **Don't automate the posts through a scheduling tool that posts on his behalf via API
    login.** Native scheduling inside LinkedIn is fine.
20. **Don't claim what the product doesn't do.** Not "your template" (it applies your
    branding), not "four seconds" (unmeasured; the site says about ten), and not remembered
    branding or shortlist upload until you have seen them work on the live site (§C.5).

---

## Appendix — the one-page version

- Profile first. It is the entire connection request.
- Start each day with `node outreach/linkedin/today.mjs --due`; log every action.
- 12 requests/day, **no note**, ramped from 8. 60/week; hard limits 15/day and 100/7 days.
- Never search during the daily window. Build lists Sunday.
- Message 2–3 days after acceptance, never instantly, always with the render, **never
  with an ask**.
- Second touch at day 5–7 carries the fee-protection line and the accuracy point. Then stop.
- Two posts a week. Fee protection, not diversity. Nothing invented.
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
