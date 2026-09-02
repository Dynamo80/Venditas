# Compliance briefing — for the founder, not for customers

**Do not send this file to a customer.** It contains the honest version,
including the gaps. The customer-facing documents are `privacy.md`, `terms.md`
and `dpa.md`.

**I am not a lawyer and this is not legal advice.** It is a structured briefing
prepared with AI assistance so that you can walk into a conversation with a data
protection solicitor knowing what to ask, and walk into a procurement
conversation knowing what you will be asked. Where a genuine legal judgement is
needed, this document says so rather than guessing — see especially item 8
(Article 27) and item 11 (DPDP section 17(2)(b)).

Written 2 September 2026 against the code as it stands in this repository.

---

## The position in one paragraph

You are a data processor for UK and EU recruitment agencies, established in a
country with no adequacy decision, using a US sub-processor for the actual
content processing, with no certifications and no insurance. That sounds bad.
Against it you have one very strong card that most of your competitors do not:
**you retain nothing**. No candidate database means no breach surface, no data
subject access requests, no deletion obligations, no backups, no retention
schedule to defend, and a transfer risk assessment where the honest answer to
"what could an Indian authority compel you to hand over" is "nothing, there is no
copy". Lead with that. The work below is mostly about making the paperwork match
the architecture, and fixing three or four places where it currently does not.

---

# TIER 1 — Do these before you send a DPA to any UK agency

These are the things that will either fail a procurement review or make a
statement in your own documents untrue. Ranked.

## 1. Confirm you are on a **paid** Gemini API tier, and get Google's data terms in writing

**This is the single biggest risk in the whole system, and it is a five-minute
check.**

`lib/extract.mjs` calls `generativelanguage.googleapis.com/v1beta`. That is the
Gemini Developer API (the Google AI Studio API), not Vertex AI. Google's terms for
that API have historically drawn a hard line between the unpaid and paid tiers:

- On the **unpaid tier**, Google's terms have stated that Google uses the content
  you submit and the responses generated to improve its products, that human
  reviewers may read your inputs and outputs, and — explicitly — that you should
  not submit sensitive, confidential or personal information.
- On the **paid tier**, Google's terms have stated that prompts and responses are
  not used to improve Google's products, with logging limited to abuse monitoring
  for a defined and limited period.

If you are on the unpaid tier, then you are sending third-party candidate CVs —
including whatever special category data candidates put in them — to a service
whose own terms tell you not to, and which uses that content for product
improvement with human review. Clause 3.4 of the DPA you are about to sign says
you do not use Personal Data to train models. You would be signing something
untrue. A competent procurement reviewer at a UK agency will ask exactly this
question, in these words, and if the answer is wrong the deal is over and you may
have a notifiable problem with the agencies you have already served.

**What to do, in order:**

1. Open the Google Cloud / AI Studio console and confirm billing is enabled on the
   project the API key belongs to, and that the key is actually being billed
   rather than running on free quota.
2. Read the current Gemini API Additional Terms of Service and the Google APIs
   Terms for yourself and confirm the unpaid/paid distinction still reads as
   above. **Do not take the summary above as current fact — the terms change, and
   this needs to be verified on the day.**
3. Confirm which Google data processing terms apply to you (the Cloud Data
   Processing Addendum, or whatever governs the Gemini API at the time) and that
   you have accepted them, so that you actually have an Article 28 chain down to
   Google. You need this to be able to say in Annex 3 of the DPA that Google is
   contracted on terms no less protective than yours.
4. Note Google's stated retention window for abuse-monitoring logs and put the
   real figure in Annex 3 of the DPA. Right now that cell says **[CONFIRM]**.
5. Consider whether to move to **Vertex AI** instead. Vertex offers explicit
   regional processing (including a European region) and enterprise data terms,
   which is a materially easier story to tell a UK agency than "the AI Studio
   API". It is more work to wire up and it costs a little more. It also lets you
   answer "where is our candidate data processed" with a region name rather than
   a shrug. Worth pricing.

**Verdict: genuinely required, blocking, and cheap. Do it first.**

## 2. Publish the policies and link them from the site

Right now `app/page.jsx` has a footer with an address and a sentence about
discarding files, and no link to a privacy policy or terms anywhere. There is no
`/privacy` route and no `/terms` route.

You cannot ask an agency to trust a privacy policy that does not exist at a URL.
And UK GDPR Article 13 requires the information to be given at the point of
collection — the consent line next to the email field should link to it.

**What to do:**

- Publish `privacy.md` at `venditas.in/privacy` and `terms.md` at
  `venditas.in/terms`.
- Link both from the site footer, and link the privacy policy from the sentence
  next to the email field.
- Put the DPA somewhere a prospect can read it before asking —
  `venditas.in/dpa` or a PDF on request. Agencies love a vendor who has the DPA
  ready. It signals you have done this before.
- Get all three reviewed by a solicitor first (see item 4).

**Verdict: required, blocking, and entirely in your hands.**

## 3. Fix the three places where the code contradicts the documents

You are about to sign a document that says candidate data is never written to
persistent storage. Before you do, close these:

**(a) Error logs can carry CV-derived content.** In `lib/extract.mjs`, a failed
Gemini call throws with the first 300 characters of Google's response body
embedded in the message. In `app/api/format/route.js`, that error is then passed
whole to `console.error('extraction failed', e)`. On a serverless host, console
output goes into the provider's log store and is retained for whatever that
provider's retention period is. A Google error response can echo part of the
request or part of the model output — which is CV content. So on the error path,
fragments of candidate data can end up in third-party logs that you say do not
exist.

*Fix:* log the HTTP status and a request identifier, not the response body. Keep
the body out of the thrown message entirely, or scrub it before it is logged.
Small change, removes the only hole in the "we retain nothing" claim.

**(b) `usage_daily` and `leads` are never purged.** `sql/001_leads.sql` creates
per-day counter rows and lead rows and nothing ever deletes them. Storage
limitation (Article 5(1)(e)) is a real obligation, and `privacy.md` as drafted
says the counters are deleted after 90 days. **That sentence is currently false.**
Either implement the purge or change the sentence — publishing a policy that
describes a deletion routine you do not have is worse than the gap it papers
over.

*Fix:* a scheduled job that runs `delete from usage_daily where day < current_date
- 90`, and a decision on dormant leads (24 months since `last_seen` is a
defensible default; keep unsubscribed addresses on the suppression list
indefinitely, which is itself the lawful thing to do).

**(c) Google Fonts.** `app/layout.jsx` pulls typefaces from
`fonts.googleapis.com`, which discloses every visitor's IP address to Google
before they have done anything. A German court has awarded damages over exactly
this, and it is an easy finding for anyone reviewing you. `next/font` will
self-host the same two families with a one-line change and no visual difference.

*Fix:* self-host the fonts, then delete the Google Fonts paragraph from
`privacy.md`.

**One thing I checked that is fine:** `console.error('redaction leak', leaks)`
logs the *names* of the leaked fields (`email`, `phone`), not their values.
`redactionLeaks()` in `lib/render.mjs` maps to `[k]`, not `[v]`. No candidate data
in that log line.

**Verdict: (a) and (b) required before signing anything. (c) is a free win.**

## 4. Get a solicitor to review the three customer-facing documents

Budget one to three hours of a UK data protection solicitor's time, or an Indian
firm with a UK data protection practice. Send them `privacy.md`, `terms.md` and
`dpa.md`, and ask for four things specifically:

1. **The Article 27 question** (item 8 below) — a written view, not a shrug.
2. **The transfer instrument** — which one to use, correctly completed. Annex 4
   of the DPA describes the intent; it is not an executed instrument, and an
   incorrectly completed IDTA gives you no lawful basis at all.
3. **The liability clause** in both `terms.md` clause 10 and `dpa.md` clause 12,
   both of which are deliberately blank. Get a position you can hold.
4. **Governing law** in `terms.md` clause 14 and `dpa.md` clause 14.3.

**On governing law, the trade-off, so you can decide before you pay for the
advice:** an Indian law and Mumbai courts clause is normal for an Indian
business and cheapest for you to defend, but a UK agency's legal team may refuse
it outright, and it means *you* would have to sue in Mumbai to chase a UK
customer who does not pay. English law with English courts is what UK
counterparties expect and removes the friction, but it exposes you to a
jurisdiction that is expensive to defend in. A common middle position for a small
overseas vendor is English law with arbitration seated in London or Singapore, or
simply conceding English law because your realistic risk of being sued is lower
than your realistic risk of losing deals over the clause. This is a commercial
decision. Make it deliberately.

**Verdict: required. This is the money you should spend.**

## 5. Be able to sign a transfer instrument on the day they ask

A UK agency's DPO will ask: "India is not adequate. What is your transfer
mechanism?" The right answer is "we will sign the IDTA, here is our completed
draft" — attached, already filled in, ready. The wrong answer is "what's an
IDTA?".

- **UK:** the **International Data Transfer Agreement (IDTA)**, or the EU SCCs
  plus the **UK Addendum**. The ICO publishes both, free.
- **EU:** the **EU Standard Contractual Clauses**, Module Two (controller to
  processor).
- **Their homework, not yours:** the exporter has to do a Transfer Risk
  Assessment (UK) or Transfer Impact Assessment (EU). But you can make it
  effortless, and that is a sales advantage. Annex 4 section D of the DPA gives
  them the facts they need. The killer line is that there is no candidate data at
  rest in India at all, so the usual "what if the Indian government demands it"
  analysis has an unusually clean answer.

**Verdict: required. Prepare the completed instrument in advance.**

## 6. Write your Article 30(2) record of processing

Article 30(2) UK GDPR requires **processors** to maintain a written record. The
small-organisation exemption in Article 30(5) does not help you, because it falls
away where processing is not occasional and where it can involve special category
data — yours is continuous, and candidate CVs can contain Article 9 data.

The good news: the DPA annexes are 80% of it. What the record has to contain is
your name and contact details, the name and contact details of each controller
you act for (so: a list of your customers), your Article 27 representative if you
appoint one, the categories of processing you carry out for each controller,
details of third country transfers and the safeguards, and a general description
of your security measures.

Make it one document, keep it current, and be ready to produce it. An agency's
DPO occasionally asks to see it, and the ICO can require it.

**Verdict: legally required. An afternoon's work. Nobody will notice until
someone does.**

---

# TIER 2 — Required or near-required, but rarely blocking a first deal

## 7. Decide on the Article 27 representative — see item 8 for the analysis

Placed here in the ranking because the *decision* is Tier 1 but the *cost* is
small and the *risk of delay* is moderate. Read item 8, then either appoint one or
get a written opinion that you do not need one. Do not simply leave it open,
because an agency questionnaire will ask.

## 8. The Article 27 question, properly

**You asked for the considerations rather than an answer, and that is right,
because this one is genuinely contested.**

### The rule

Article 27 UK GDPR requires a controller or processor **not established in the
UK** to designate a representative in the UK, in writing — but only where Article
3(2) applies to them, and subject to the exemption in Article 27(2). The EU GDPR
has a mirror-image provision for the EU.

So there are three questions, in order.

### Question one: does Article 3(2) catch you at all?

Article 3(2) catches processing of UK data subjects' personal data by someone not
established in the UK, where the processing relates to **(a)** offering goods or
services to those data subjects, or **(b)** monitoring their behaviour.

**The argument that it does not catch you:** you offer a service to recruitment
agencies, which are businesses. You do not offer anything to candidates.
Candidates are not your customers, have never heard of you, and receive nothing
from you. On the narrower reading of Article 3(2)(a), the "offering of goods or
services to data subjects" means to *those* data subjects — and you offer nothing
to candidates. The European Data Protection Board's guidance on territorial scope
directs you to look at the **processor's own activity**, not to inherit the
controller's territorial status automatically; a non-UK processor acting for a UK
controller is generally brought into line through the Article 28 contract rather
than by direct application of Article 3(2). You are also not monitoring anyone's
behaviour, so 3(2)(b) is out.

**The argument that it does catch you:** the ICO takes an expansive view of
extraterritorial reach. Your entire service exists to process the personal data of
UK individuals as part of a service delivered into the UK market, and the
processing is squarely "related to" a UK-facing offering. On this reading the
"related to" language does the work, and the fact that your commercial
counterparty is a business rather than the data subject is not decisive.

**Nobody can tell you with certainty which is right on your facts.** This is
exactly the point where you want a paid opinion rather than a guess, and it is
the first of the four things to put in front of the solicitor at item 4.

### Question two: if 3(2) applies, does the Article 27(2) exemption save you?

Almost certainly not. The exemption applies only where the processing is
**occasional**, does **not** include large-scale processing of special category
data, and is **unlikely to result in a risk** to individuals. Your processing is
continuous and systematic rather than occasional, and CVs routinely contain
Article 9 data — a health condition, a disability, a trade union role, a
religiously affiliated employer, a photograph on a scanned CV. So if you are
caught by 3(2), plan on needing a representative.

### Question three: should you appoint one anyway?

Probably yes, and here is the honest reason: **it is cheaper than the argument.**

- Commercial UK representative services cost roughly £100–£500 a year.
- UK agency supplier questionnaires increasingly include the line "if you are not
  established in the UK, who is your UK GDPR Article 27 representative?" A blank
  answer costs you weeks of back-and-forth with someone's DPO. A named firm ends
  the conversation in one line.
- Appointing one when you did not have to costs you a few hundred pounds. Not
  appointing one when you had to is an infringement, and it is the kind that is
  trivially visible from the outside — anyone can look at your privacy policy and
  see there is no representative named.

**If you appoint one:** name them in the privacy policy, name them in your
Article 30 record, and put them in the DPA. The representative must be
established in the UK and mandated in writing.

**EU separately.** Article 27 EU GDPR is a distinct obligation with a distinct
representative, in an EU member state. You are currently selling to the UK and
the US, so this is not live. The day you take your first EU agency as a customer,
revisit it.

**US.** There is no equivalent requirement. See item 13.

**Verdict: legal judgement genuinely required. Commercially, appointing one is
the low-friction path.**

## 9. Decide whether to get Cyber Essentials

**Cyber Essentials** is the UK government-backed baseline certification. The
self-assessed level costs a few hundred pounds plus VAT and takes a day or two of
form-filling. It is not legally required for anything, but many UK buyers treat
it as the minimum evidence of competence, some public-sector-adjacent buyers
require it outright, and it gives you something to write in the box on the
questionnaire that currently says "no certifications".

SOC 2 and ISO 27001 are the enterprise answers, cost thousands and take months,
and are not proportionate for a one-person business at this stage. Do not start
there. Cyber Essentials is the version that fits.

**Verdict: not required. High value per pound for UK selling. Do it once you have
your first two or three paying customers.**

## 10. Cyber liability and professional indemnity insurance

UK recruitment agency supplier contracts routinely require the supplier to carry
insurance — often £1m–£5m of professional indemnity and a cyber policy. It is
frequently a standard clause their template drops in without much thought, and it
is negotiable for a small vendor, but you will meet it.

You have no insurance at the effective date, and Annex 2 section G of the DPA says
so. Get quotes now so that when it comes up you can say "we can put that in place
for this contract" and price it into the deal, rather than discovering the
requirement mid-negotiation.

This also interacts with the liability cap. A cap with no insurance behind it is
just a number. A cap set at your insured limit is a position you can defend.

**Verdict: not legally required. Practically required for larger agency
customers.**

## 11. India: the DPDP Act 2023, and the exemption that may do most of the work

### Status

The Digital Personal Data Protection Act 2023 was enacted in August 2023 but its
provisions commence by notification. The implementing Rules were notified in
November 2025 with a phased timetable, so different duties bite at different
dates. **Check the current commencement position on the day you act on this** —
which duties are live determines what you actually have to do now versus plan
for.

### The provision to ask an Indian lawyer about first: section 17(2)(b)

Section 17(2)(b) exempts, from most of the Act, the processing of personal data
of a Data Principal **who is not within India**, carried out **pursuant to a
contract with a person outside India**, by a person based in India. It was
written for India's IT and outsourcing sector, and on its face **Venditas is
precisely the intended beneficiary**: your candidates are in the UK and the US,
and you process them under contract with UK and US agencies.

If it applies, most of the Act's substantive obligations — the notice and consent
machinery in Chapter II, the data principal rights in Chapter III, and the
cross-border transfer provision — fall away for that processing, leaving (as the
provision is commonly read) the general responsibility provision and the duty to
maintain reasonable security safeguards.

Two practical consequences worth noting even before you get advice:

- The exemption is expressed to depend on there being a **contract**. That is
  another reason to get customers onto signed terms rather than relying on
  clickwrap alone.
- It does **not** cover Indian users or Indian candidates. If an Indian agency
  starts using the tool, or a UK agency uploads the CV of a candidate in India,
  that processing sits outside the exemption and the full Act applies to it.

**Do not treat the reading above as settled.** The whole shape of your Indian
obligations turns on it, and it deserves a specific opinion from an Indian data
protection lawyer. Ask them: does 17(2)(b) cover our candidate processing, does it
also cover the UK/US user contact data we hold as a Data Fiduciary in our own
right, and what exactly survives the exemption?

### What applies where the exemption does not

For anything outside 17(2)(b) — Indian users, Indian candidates, and arguably
your own marketing list to the extent it contains Indian contacts — plan for:

- **Notice and consent.** An itemised notice, in plain language, available in
  English and the Eighth Schedule languages, before or at the point of
  collection. Consent must be free, specific, informed, unconditional and
  unambiguous, with a clear affirmative action, and as easy to withdraw as to
  give. Your current on-page notice next to the email field is a reasonable
  starting point but was written for GDPR-style transparency, not DPDP-style
  itemised consent.
- **Purpose limitation and erasure.** Erase personal data once the purpose is
  served or consent is withdrawn, unless retention is legally required.
- **Security safeguards.** Section 8(5) requires reasonable security safeguards,
  and this one survives even under the 17(2)(b) exemption.
- **Breach notification.** DPDP requires notification to the Data Protection Board
  and to affected Data Principals, and — unlike GDPR — it has **no materiality
  threshold**. Read literally, every breach is reportable. This is stricter than
  what you are used to reading about GDPR, and it is a real difference.
- **Grievance redressal.** Publish the contact details of a person who will answer
  data principal grievances. `founder@venditas.in` already does this job, but the
  privacy policy should name it as the grievance channel explicitly for Indian
  users.
- **Children.** DPDP defines a child as under 18 and requires verifiable parental
  consent, with a prohibition on tracking and targeted advertising to children.
  A graduate or school-leaver CV can be that of a 17-year-old. Your saving grace
  is that you retain nothing, but note it.

### What does not apply to you

- You are not a Significant Data Fiduciary, so no Data Protection Officer in
  India, no independent audit, no algorithmic due diligence obligations.
- There is **no general data localisation requirement** in the Act. Section 16
  works as a blacklist: transfers out of India are permitted except to countries
  the government notifies as restricted. Confirm the current notified list, but
  as far as is known none of the countries you send data to is restricted.

**Verdict: get one hour of Indian advice on 17(2)(b). It probably shrinks your
Indian obligations to "keep the security safeguards and publish a grievance
contact", which is a much smaller problem than it first looks.**

## 12. The cold outreach list is a separate compliance problem, and you own it

`outreach/send.mjs` sends cold email to recruitment agencies. For that list you
are the **controller**, not a processor, and none of the DPA applies. What you are
doing looks careful — a daily cap, a suppression file nobody is ever removed
from, a postal address in the footer, a working one-click unsubscribe, a
`List-Unsubscribe-Post` header. That is better hygiene than most. Three gaps:

- **PECR, and who counts as an individual subscriber.** UK PECR restricts
  unsolicited marketing email to "individual subscribers". Employees at a limited
  company's corporate address are corporate subscribers and fall outside that
  restriction, which is why B2B cold email to `name@agency.co.uk` is generally
  lawful without prior consent. **Sole traders and partnerships are treated as
  individual subscribers**, and a fair number of small recruitment outfits are
  exactly that. The ICO has taken enforcement action over B2B email that reached
  sole traders. Consider a filter, and honour objections instantly (you do).
- **Article 14.** You did not get these addresses from the individuals, so
  Article 14 requires you to tell them what data you hold, why, and **where you
  got it from** — normally within a month, and in practice in the first message.
  `privacy.md` now has a section headed "If we emailed you and you have never
  used Venditas" that does this job. Two things you must do to make it work:
  **link it from the outreach email footer**, and **check that the source
  description in it is actually true of how you built the list** — it says
  public business sources, your agency's own website, public professional
  profiles and public directories, and that you do not buy lists. If that is not
  how the list was assembled, change the wording, not the practice.
- **Write down your Legitimate Interests Assessment.** One page: the interest, why
  the processing is necessary for it, and the balancing test against the
  recipient's rights. It takes twenty minutes and it is the document the ICO asks
  for if anyone ever complains.

**US recipients:** CAN-SPAM wants accurate headers, a clear identification that
the message is a solicitation, a valid physical postal address, and opt-outs
honoured within ten business days. Your footer already does this.

**Verdict: mostly done. Add the Article 14 notice and the LIA.**

## 13. US customers ask for something different

UK and EU agencies want a GDPR DPA. US agencies increasingly want a **CCPA/CPRA
service provider addendum** — the key commitments being that you will not sell or
share personal information, will not retain, use or disclose it outside the
direct business relationship, and will not combine it with data from other
sources. All three are already true of you and are easy to sign.

Some US agencies handling candidates in specific states will also raise state
privacy statutes and, for background-check-adjacent work, the FCRA. You are not a
consumer reporting agency and do not do background checks, so FCRA should not
reach you, but be ready for the question.

**Verdict: add a short CCPA addendum to the pack when a US customer asks. Not
urgent.**

---

# TIER 3 — Worth doing, not urgent

## 14. Consider what legal entity you are actually contracting as

`dpa.md` has `[FOUNDER FULL LEGAL NAME]` in it because a sole proprietorship is
not a legal person separate from you. A UK agency's legal team will notice that
they are contracting with an individual in India, with unlimited personal
liability and no corporate veil, and some of them will not like it.

Two options worth pricing with an accountant:

- **An Indian private limited company.** Cheap, quick, gives you a corporate
  counterparty and limits your personal liability. Does not solve the adequacy or
  Article 27 questions.
- **A UK limited company.** Solves rather a lot at once: no Article 27 question,
  no international transfer instrument needed for the customer-to-you leg (though
  you would still be exporting to yourself in India), a UK entity on the contract,
  a UK bank account, and a far easier procurement conversation. It creates UK
  company filing, tax and possibly VAT obligations, and needs an accountant who
  handles cross-border. It is the heavier option and it may be the right one at
  the point where UK revenue justifies it.

**Verdict: strategic, not urgent. Revisit at your first five-figure contract.**

## 15. Smaller items

- **The tool works before anyone signs anything.** A recruiter at a UK agency can
  put real candidate data through the free tier this afternoon with no DPA in
  place. Legally that is their controller-side problem, and `terms.md` clause 4
  puts the warranty on them. Commercially, expect their compliance officer to ask
  what happens in that window. Have an answer.
- **Metering fails open.** If Supabase is unreachable, `check()` logs and lets the
  request through. That is a deliberate and defensible choice — a landing page
  that 500s in front of a prospect is worse — but it means your rate limits are
  not a security control. Do not describe them as one in a questionnaire.
- **Keep the sales copy precise.** "The CV is processed and discarded, never
  stored" is true and is your best line. "The output is anonymised" would not be
  true — the document still contains employers, dates, achievements in the
  candidate's own words, and their initials in the reference code. Redacted is not
  anonymised. Do not let that drift.
- **Local secrets and local personal data.** `.env.local` holds a live Gemini key
  and live SMTP credentials in plaintext, and `outreach/` holds your prospect
  list, sent log and suppression list. Both are gitignored, which is right. Make
  sure the machine has full-disk encryption on, and rotate any key that has ever
  been pasted into a chat window, a ticket or a screenshot.
- **Have a breach plan on one page.** The DPA commits you to notifying customers
  within 48 hours. Write down now, while calm, who you would email, what you would
  say, and where the customer list lives. Forty-eight hours is not long if you are
  working it out from scratch.
- **ICO registration.** The data protection fee applies to controllers, and the
  ICO's position on non-UK organisations is not something to guess at. Ask about
  it in the same conversation as Article 27; if it turns out to apply, the tier
  one fee is around £52 a year and it is a five-minute form.

---

# What a UK recruitment agency will actually ask for

This is the practical version of the whole document. When an agency's operations
or compliance person runs their supplier check, this is the list, roughly in the
order it arrives:

1. A privacy policy at a real URL.
2. A signed DPA with an Article 28-compliant set of clauses.
3. A named sub-processor list with locations. **No placeholders.**
4. "Where is our data stored, and for how long?" — your best answer, and it wins
   the meeting if you give it precisely.
5. "Do you use our data, or our candidates' data, to train AI models?" — must be
   a clean no, which requires item 1 of Tier 1 to be true.
6. A transfer mechanism for India, signed.
7. A completed security questionnaire.
8. "Who is your UK representative?"
9. Certifications and insurance.
10. Liability position.

---

# The ranked answer: what to do before a UK agency will sign

In strict order. Items 1 to 5 are the ones that actually block a signature.

| # | Action | Why it blocks | Effort |
| --- | --- | --- | --- |
| **1** | **Confirm you are on a paid Gemini tier and secure Google's data processing terms** | Without it, "we don't train on your data" in the DPA is untrue, and the deal dies on the questionnaire | Hours |
| **2** | **Get `privacy.md`, `terms.md` and `dpa.md` reviewed by a data protection solicitor, and settle liability and governing law** | They will not sign an unreviewed DPA from an overseas sole trader | 1–3 hours of fees |
| **3** | **Publish the privacy policy and terms at real URLs and link them from the site** | Their first check, and they do it before they contact you | Hours |
| **4** | **Have a completed IDTA (or SCCs + UK Addendum) ready to sign** | India is not adequate; no mechanism means no lawful transfer | Half a day plus review |
| **5** | **Name the real hosting and email sub-processors, with regions, in DPA Annex 3** | A sub-processor list with `[CONFIRM]` in it fails procurement outright | Hours |
| **6** | **Fix the error logging and add the retention purge** | Makes the "we retain nothing" claim in the DPA literally true | Half a day |
| **7** | **Resolve the Article 27 representative question — opinion, or just appoint one** | It is a line on the questionnaire; blank answers cost weeks | £100–£500/yr |
| **8** | **Write the Article 30(2) record of processing** | Legally required; occasionally requested | An afternoon |
| **9** | **Get one hour of Indian advice on DPDP section 17(2)(b)** | Defines your actual Indian exposure; probably shrinks it a lot | 1 hour of fees |
| **10** | **Price cyber and professional indemnity insurance; consider Cyber Essentials** | Comes up with larger agencies, and backs your liability cap | Days, plus premium |

Everything above the line in that table is achievable in about a week of your
time plus a few hundred pounds of professional fees. Items 1 to 6 are the ones
without which a competent UK buyer will stop.
