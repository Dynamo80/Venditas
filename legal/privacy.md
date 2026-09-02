> **DRAFT — NOT YET IN FORCE.** This document was prepared by the operator of
> Venditas with AI assistance. It has **not** been reviewed by a qualified
> solicitor. It is not legal advice, and nobody should rely on it as a statement
> of legal position until a data protection lawyer qualified in England & Wales
> (and, where EU customers are involved, in an EU member state) has reviewed and
> approved it. Do not publish this on venditas.in with this banner removed until
> that review has happened.
>
> Draft version 0.1 — 2 September 2026

# Privacy Policy

## The one thing most people want to know

**We do not keep candidate CVs, and we do not keep anything from inside them.**

When you upload a CV, the file is read into memory, converted into a document,
and the memory is released when the HTTP response finishes. The file is never
written to a disk we control. Nothing from it goes into a database. There is no
copy for us to search, sell, lose or hand over. If a candidate writes to you next
month and asks what Venditas holds about them, the honest answer is: nothing.

We hold information about **you** — the recruiter using the tool. That is a
short list, and it is set out in full below.

## Who we are

Venditas is a sole trader business operated from India.

- **Address:** Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India
- **Email:** founder@venditas.in
- **Website:** https://venditas.in

For the personal data of **candidates** whose CVs you upload, you (the
recruitment agency) are the *data controller* and we are your *data processor*
under the UK GDPR and EU GDPR. We only handle that data to give you back a
formatted document. A separate Data Processing Agreement covers this and is
available at `legal/dpa.md` or on request from founder@venditas.in.

For the small amount of data we hold about **you and your agency**, described
below, we are the controller.

## What happens to a CV you upload

Step by step, this is the whole life of the file:

1. Your browser sends the CV (PDF or DOCX) over an encrypted connection to our
   application.
2. The text is pulled out of the file on our server. If the PDF turns out to be
   a scan with no readable text layer, up to the first four pages are converted
   into images instead.
3. The text — or those page images — is sent to **Google's Gemini API** over an
   encrypted connection, which returns the CV as structured fields (name,
   employers, dates, bullets and so on). If the call fails it is retried up to
   two more times, so the same content may be sent to Google up to three times
   for a single upload.
4. Those fields are used to build a Word document in your branding. Unless you
   turn redaction off, the candidate's name, email address, phone number and
   links are removed and replaced with a reference code made from their initials
   and the current month.
5. The finished document is checked: we read the document back and confirm those
   details are genuinely absent. If any of them survived, we return an error and
   no document at all.
6. The document is sent back in the response to your request. The uploaded file,
   the extracted text, the page images and the structured fields are all
   discarded.

Nothing in steps 1 to 6 is written to a database, an object store or a log file
by us. We do not keep the document we sent you either — if you lose it, we
cannot send it again.

### Two honest qualifications

- **A redacted CV is still personal data.** Removing a name and an email address
  does not make a document anonymous. Employers, dates, job titles and the
  candidate's own wording remain, and the reference code contains their
  initials. When you send that document to a client you are still sharing
  personal data, and your own obligations to the candidate still apply.
- **We cannot see inside Google's systems.** We send content to the Gemini API
  and Google's own terms govern what Google does with it. Our position on that
  is set out under "Who else is involved" below.

## What we actually store

| What | Why | Where | How long |
| --- | --- | --- | --- |
| Your email address | To identify you, apply the free daily limit, and email you about Venditas | Supabase Postgres database | Until you ask us to delete it |
| Your agency name (if you typed one) | To know who is using the tool | Same | Same |
| First seen and last seen timestamps, and a count of CVs you have run | To apply the free daily limit and to see whether the tool is being used | Same | Same |
| Whether you have unsubscribed, and an unsubscribe token | So that an unsubscribe sticks | Same | Retained after unsubscribe, so we do not email you again by mistake |
| A daily request counter keyed to a salted SHA-256 hash of your IP address | To stop one visitor draining the service | Same | One row per day, deleted after 90 days |

**We never store your IP address.** We hash it with a secret salt and keep only
the hash, because we need to count requests from a source, not know who the
source is.

We do **not** store: the CV, the candidate's name or contact details, the text of
the CV, the structured fields, the Word document we produced, your uploaded logo,
your brand colour, or the footer contact line you typed.

## Legal basis (UK/EU GDPR) for the data we hold about you

- **Your email address, agency name, counters and timestamps** — our legitimate
  interests in operating and metering the service and in preventing abuse
  (Article 6(1)(f)).
- **Emailing you about Venditas** — our legitimate interests in marketing to a
  business contact who has used the product (Article 6(1)(f)). We tell you this
  next to the field where you type your address, before you submit it, and every
  email carries a one-click unsubscribe link. You can opt out at any time and we
  will stop.
- **The hashed IP counters** — our legitimate interests in security and abuse
  prevention (Article 6(1)(f)).

## Marketing email

At the point where you enter your email address, the form says we will email you
about Venditas. If you would rather we did not:

- click the unsubscribe link in any email we send — one click, no confirmation
  step, no login; or
- email founder@venditas.in with the word "unsubscribe".

We do not sell, rent or share your address with anyone else for their marketing.

## If we emailed you and you have never used Venditas

We contact recruitment agencies directly to tell them about the tool. If a
message from us was the first you had heard of us, this is what you are entitled
to know.

- **What we hold:** your name, your work email address, your agency's name, and
  a note of what we sent you and when.
- **Where we got it:** from publicly available business sources — your agency's
  own website, public professional profiles and public business directories. We
  do not buy lists and we did not get your address from another company.
- **Why:** our legitimate interests in telling a business that a tool built for
  its trade exists (Article 6(1)(f)). We think a short, relevant, one-to-one
  message to a work address is a reasonable thing to receive; you may disagree,
  which is why the next line exists.
- **How to stop it:** click the unsubscribe link in the email, or reply with the
  word "unsubscribe", or email founder@venditas.in. One click is enough, there is
  no confirmation step, and we keep your address on a suppression list
  afterwards for the sole purpose of never contacting you again.
- **Your rights:** the same as everyone else's, set out under "Your rights"
  below — including the right to object, which we will always honour.

## Who else is involved

These are the third parties that process data as part of running Venditas.

| Provider | What they get | Where |
| --- | --- | --- |
| **Google LLC** (Gemini API) | CV text, or images of CV pages for scanned PDFs, sent for the duration of the call | United States and other Google locations |
| **Supabase** (Postgres, hosted on Amazon Web Services) | Your email address, agency name, timestamps, counters, hashed IP counters | See `legal/dpa.md` for the current region |
| Application hosting provider | Processes the upload in memory while your request runs; no candidate data is stored | See `legal/dpa.md` |
| Email provider (SMTP) | Your email address, so we can send you email | See `legal/dpa.md` |
| **Google Fonts** | Your IP address and browser details, because our page loads fonts from Google's servers | Google |

The up-to-date list, with company details and locations, is kept in the Data
Processing Agreement at `legal/dpa.md`.

## Where your data goes

Venditas is operated from **India**. Our providers process data in the **United
States** and in whichever regions Supabase, Google and our hosting provider
operate. So personal data you send us leaves the UK and the EEA.

India is not covered by a UK or EU adequacy decision. If you are a UK or EU
agency and you need a lawful transfer mechanism in place before you can use
Venditas, we will sign the UK International Data Transfer Agreement (or the
Addendum to the EU Standard Contractual Clauses), and the EU Standard
Contractual Clauses for EU customers. Ask at founder@venditas.in.

## Cookies and tracking

Venditas sets **no cookies**. There is no analytics, no tracking pixel, no
advertising tag and no session storage. We do not know which pages you looked at
or where you came from.

The one exception worth naming: our page loads its typefaces from Google Fonts,
which means Google's servers see your IP address and browser details when the
page loads. We are looking at serving the fonts ourselves so that stops
happening.

## Your rights

If you are in the UK or the EEA you have the right to ask us for a copy of the
data we hold about you, to have it corrected or deleted, to object to it being
used, and to have it sent to you in a portable form. Email founder@venditas.in
and we will deal with it within one month.

Because the list of what we hold is so short, most of these requests are quick.
"Delete everything you have about me" means removing your row from the leads
table; we keep your address on a suppression list only so that we do not email
you again.

If you are in India, the Digital Personal Data Protection Act 2023 gives you
comparable rights, including the right to access, correction, erasure, and
grievance redressal, and the right to nominate someone to exercise them on your
behalf. **Grievance officer: the proprietor of Venditas, founder@venditas.in.**
Write to that address and you will have a reply within one month. If you are not
satisfied, you may complain to the Data Protection Board of India.

**Complaints.** If you are in the UK you can complain to the Information
Commissioner's Office (ico.org.uk). If you are in the EEA you can complain to
your national supervisory authority. We would rather you told us first, but you
do not have to.

## Candidates: what to do if a CV of yours was processed

We hold nothing about you, so there is nothing for us to show you or delete. The
recruitment agency that uploaded your CV is the organisation that decides what
happens to it, and your request should go to them. If you write to
founder@venditas.in we will tell you this and, if you can identify the agency, we
will confirm whether they are a customer.

## Security

- Everything is encrypted in transit.
- Candidate data is never written to storage, which removes the largest category
  of risk entirely.
- The database is not readable by the public; row level security is on and there
  is no anonymous access policy.
- IP addresses are salted and hashed rather than stored.
- Access to the systems is limited to one person, the operator of the business.

The fuller list, in the form agency procurement teams ask for, is in
`legal/dpa.md`.

## Children

Venditas is a business tool for recruitment agencies and is not directed at
children. A candidate CV may occasionally be that of someone under 18; because we
retain nothing from it, no data about that person persists.

## Changes

If we change this policy we will update the date at the top. If a change matters
— a new sub-processor, or a change to what we store — we will email registered
users before it takes effect.

## Contact

founder@venditas.in
Venditas, Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India
