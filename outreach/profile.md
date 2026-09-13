# LinkedIn profile — paste-ready, final

Final version, 2026-09-13. Replaces every earlier draft in this file. Written
for a UK agency owner deciding in a couple of seconds whether to accept a
connection request that has no note on it.

Every claim below was checked against the code and the decision records. The
sources are listed at the bottom. If the product changes, re-check them before
the profile says something that has stopped being true.

Do the steps in order. Steps 1 to 5 take about fifteen minutes.

---

## 1. Turn off "Open to work"

If your profile shows #OPEN_TO_WORK, an agency owner reads it as "this founder
is job-hunting, so the product may not be here in three months".

Profile → the "Open to" card under your name → pencil → **Delete from profile**.
Then check Settings → Data privacy → Job seeking preferences, in case it is
also set to be visible to recruiters only.

## 2. Photo

A recent, well-lit photo of your face. A missing or old photo is the quickest
"ignore" there is.

---

## 3. Headline

Paste this (177 characters; the limit is 220):

```
Founder, Venditas · Candidate CVs in your agency's branding, contact details removed so your client can't go around you · The candidate's own words kept · 10 free at venditas.in
```

It says what the product does and why an agency pays for it before anyone
clicks, and it ends with something they can do.

---

## 4. About

Replace the whole About section with this. The first two lines are what shows
before "see more".

```
Before a candidate's CV goes to a client, someone at the agency rebuilds it in the agency's branding and takes the name, email and phone off. The reason isn't looks. A client who can read the candidate's number can ring them directly, and the agency loses the fee.

I built Venditas to do that job. Drop in the CV the candidate sent, whether it's a PDF or a Word file, two columns, tables or a scan, and you get back an editable Word document with your logo, colours and footer, and a reference code where the candidate's name was.

It is built around two things it won't do.

It won't rewrite the candidate. Their wording stays theirs, and their roles and dates stay in the order they wrote them. A CV that says something the candidate didn't is a problem you find out about in the interview.

It won't hand you a leak. Every finished document is read back before you get it. If the candidate's name, email, phone, links or home address are still in it, you get an error instead of a file.

CVs are processed in memory and not stored. venditas.in/security sets out exactly where the data goes, including the parts that aren't flattering.

£79 a month for the whole agency, with no per-seat charge. That is the founding price for the first 20 agencies, and it stays at that rate for them. You can run 10 CVs free first, with no card and no sign-up, and buy by email without a call.

Honest about what this is: I'm one person, in Navi Mumbai, and I'm not a recruiter. Venditas is also my second go under this name. The first version didn't solve a real problem, so I closed it. In September 2026 I relaunched the name on this problem, after checking that agencies already pay people and software to do the job. When you message me, the person who built it answers.

If your agency still reformats CVs by hand, send me the one you'd be embarrassed to forward and I'll run it through.
```

**Why the "second go" paragraph stays.** The old About said you shut Venditas
down because the problem wasn't real, and some prospects will already have read
that. Deleting it would look like a cover-up to them. This version says what
happened (closed, then relaunched on a different problem) and nothing more.
It does not invent a story about the first version.

---

## 5. Experience: edit the Venditas entry, or add one

- **Title:** Founder
- **Company:** Venditas
- **Employment type:** Self-employed
- **Dates:** if a Venditas entry already exists, keep its real start month and
  set the end to **Present**. If there is no entry, start **Sep 2026**. Don't
  choose a date to look more established. A recruiter checks dates for a living.
- **Location:** Navi Mumbai, Maharashtra, India · Remote

Description:

```
Relaunched September 2026. Venditas turns a candidate's CV into a recruitment agency's branded Word document, with the agency's logo, colours and footer, and removes the candidate's name, email, phone, links and street address. A reference code goes where the name was. The town stays, because a client needs it to judge the commute.

In: whatever the candidate sent. PDF or Word (.docx) up to 10MB, including two-column layouts, tables, Europass forms and scans. Out: an editable Word document, in seconds.

Accuracy: the candidate's own wording is kept, and their roles and dates stay in the order they listed them. It is built not to add skills or achievements that aren't on the page.

Redaction is checked on the finished document. If a contact detail survived, the request fails and nothing is returned. CVs are processed in memory and not stored.

£79/month for the whole agency (founding price for the first 20 agencies). 10 CVs free at venditas.in.
```

## 6. Featured

Add one link: **venditas.in/pricing**, titled
`Venditas: 10 CVs free, then £79/month for the whole agency`. If LinkedIn pulls
the wrong preview image, upload `outreach/linkedin/banner.png` as the thumbnail.

## 7. Banner

Upload `outreach/linkedin/banner.png` (1584 × 396). It shows a messy sample CV
and the same fictional candidate as a branded, redacted document.

## 8. Settings

- **Custom URL:** Profile → Edit public profile & URL → `abinjohnson` or
  `abin-venditas`. The default string of digits looks unfinished.
- **Location:** Navi Mumbai. Don't set a UK location. It can be checked, and
  checking people is a recruiter's job.
- **Contact info → Website:** `venditas.in`, type "Company".
- **Top skills:** Recruitment Technology, Document Automation, Data Protection.
- **Creator mode, "Provide services", newsletter:** leave off. They make the
  profile read like a freelancer's.

---

## What changed from the previous draft, and why

| Was | Now | Why |
|---|---|---|
| "into your agency's template" | "in your agency's branding: logo, colours, footer" | The product puts the agency's logo, colour and footer on its own layout (`lib/render.mjs`). It does not load an agency's Word template. A prospect who uploads their template and finds it ignored has caught us overclaiming. |
| "in about four seconds" | "in seconds" | Nothing in the repo measures four seconds, and the site's own upload screen says "about ten seconds" (`app/page.jsx`). |
| "Feb 2026 – Present" | the real start month, or Sep 2026 | No record of February 2026 anywhere. The CV product was built from 2 September 2026. |
| Accuracy was one clause at the end of a paragraph | Its own paragraph: wording kept, roles and dates kept in order, nothing added | The research (`docs/strategy-10k.md` §1) found that public complaints about CV formatting tools are about invented content and scrambled dates, not price. Competitors are deliberately not named on the profile. |
| Founding price not mentioned | "founding price for the first 20 agencies" | Decision 004. Saying £79 without that invites "so it's £79 forever?" later. |
| "no card and no call" | "no card and no sign-up … buy by email without a call" | Decision 014: an agency can buy by email. The public trial needs no account (decision 012). |

## Where each claim comes from

- Wording kept, roles in order, nothing invented: extraction rules 1, 2, 7 and 10 in `lib/extract.mjs`. (Rule 11 also drops a leading "I" from bullets. That is the only wording it changes on purpose.)
- Error instead of a file: `redactionLeaks()` in `lib/render.mjs`, enforced in `app/api/format/route.js`. It checks name, email, phone, home address and links.
- Street address removed, town kept: commit `7a93eac`.
- In memory, not stored: decision 006, `/security`.
- PDF or .docx, 10MB, scans: `lib/extract.mjs`, `/faq`. `.doc` is refused.
- £79, first 20, whole agency, £149 standard: `lib/pricing.mjs`, decision 004.
- Ten free, no card: `lib/pricing.mjs`, decision 012. Buy by email: decision 014.
