# Company page posts: a month, ready to schedule

Written 2026-09-14. The same rule as `outreach/posts.md`: every sentence can be
traced to the code, a decision or sourced research, and nothing implies
customers Venditas doesn't have. The sources are under each post.

## How these go out

- **Scheduled in LinkedIn, in one sitting.** On the page, start a post, paste the
  text, add the image, then use the clock icon beside **Post** to set the date
  and time. Nothing logs in to LinkedIn from this machine, so nothing here risks
  the page.
- **When:** Wednesdays and Fridays at 08:30 UK (13:00 IST until the clocks change
  on 25 October; 14:00 IST after). Abin's own posts are Tuesdays and Thursdays
  (`outreach/posts.md`), so the two never land on the same day.
- **Link in the post, last line.** A scheduled post can't carry a first comment,
  so the link goes at the end of the text.
- **Images:** `images/`, one per post, rendered by `render.mjs`.
- **Comments:** whoever is signed in as the page answers the same day, in a
  sentence, without pitching in the thread.

---

## Day one, when the page goes live: the pinned post

Publish it straight away, then **… → Pin to top of page**.

Image: `images/before-after.png`

```
Venditas turns a candidate's CV into a Word document in your agency's branding, with the candidate's name, email, phone, links and street address removed.

Why an agency needs that: a client who can read the candidate's number can ring them directly, and the agency loses the fee.

What goes in: whatever the candidate sent. PDF or Word, two columns, tables, scans.

What comes out: an editable Word document with your logo, colours and footer, and a reference code where the name was.

Every finished document is read back before you get it. If a contact detail survived, you get an error, not a file.

Ten CVs free, no card, no sign-up. Then £79 a month for the whole agency, the founding price for the first 20 agencies.

It's new, and it's built by one person. Messages to this page are answered by the person who built it.

www.venditas.in
```

**Sources.** The fee reason: decision 001. Formats: `lib/extract.mjs`, `/faq`.
Street address: commit `7a93eac`. The read-back check: `redactionLeaks()` in
`lib/render.mjs`, enforced in `app/api/format/route.js`. Price and trial:
`lib/pricing.mjs`, decisions 004 and 012.

---

## 1 · Wednesday 16 September, 08:30 UK: the check

Image: `images/post-01-check.png`

```
Removing the contact details from a CV is half the job. The other half is making sure they're gone.

Venditas does the first half, then reads the finished Word document back and looks again for the candidate's name, email, phone number, links and home address.

If any of them is still there, the request fails and no document is returned.

That is deliberately inconvenient. An error on your screen costs a minute. A CV that reaches a client with the candidate's mobile number in the footer can cost the placement fee.

Ten CVs free, no card: www.venditas.in
```

**Sources.** `redactionLeaks()` in `lib/render.mjs`; `app/api/format/route.js`
returns an error instead of the file. The mobile number in the footer is a
hypothetical, written as one.

## 2 · Friday 18 September, 08:30 UK: accuracy

Image: `images/post-02-accuracy.png`

```
A formatted CV goes to a client as the candidate's own account of their career. So there are two things a formatting tool must not do.

It must not rewrite. The candidate's wording stays theirs, and their roles and dates stay in the order they listed them.

It must not guess. If a CV doesn't give a date or a job title, that field stays empty rather than getting something plausible.

Venditas is built to both rules. The one change it makes on purpose: a bullet point that starts with "I" loses the "I".

A CV that says something the candidate didn't is a problem you find out about in the interview.

www.venditas.in
```

**Sources.** Extraction rules 1, 2, 7, 10 and 11 in `lib/extract.mjs`
(`outreach/profile.md`, "Where each claim comes from").

## 3 · Wednesday 23 September, 08:30 UK: candidate data

Image: `images/post-03-data.png`

```
The first question to ask about any CV tool: what happens to the candidate's data?

For Venditas: the file is read in memory, turned into a Word document, returned, and gone when the request ends. No storage bucket, no backup, no candidate database.

What is kept: the agency's email address, its name, and a count of CVs run.

The security page sets out exactly where the data goes, including the parts that aren't flattering. And there's a data processing agreement ready for when a client asks for one.

www.venditas.in/security
```

**Sources.** Decision 006; `/security`; `/dpa`; the `data` reply in
`outreach/drafts.mjs`.

## 4 · Friday 25 September, 08:30 UK: branding, set once

Image: `images/post-04-branding.png`

```
Venditas puts every CV into your agency's branding: your logo, your colour and your footer, around the candidate's own content.

You set it up once. It's saved in your own browser, on your own computer, so nothing about your agency's branding is kept on a server.

If your agency already has a Word template, upload that instead. Its header, footer, fonts and margins stay exactly as they are, and the CV goes wherever you type {{CV}}.

www.venditas.in
```

**Sources.** `localStorage` in `app/Formatter.jsx`; templates in `lib/template.mjs`
(decision 019).

**Changed on 14 September, after the posts were scheduled.** The earlier text said
Venditas "doesn't load your agency's own Word template yet", which stopped being
true that day. If post 4 is already scheduled in LinkedIn, open the page's
scheduled posts and replace its text with the version above before 25 September.

## 5 · Wednesday 30 September, 08:30 UK: a whole shortlist

Image: `images/post-05-shortlist.png`

```
A shortlist doesn't arrive one CV at a time, so it shouldn't have to be formatted one at a time.

Drop up to 20 CVs into Venditas at once: PDFs, Word files, two-column layouts, tables, scans. Each comes back as its own editable Word document in your branding, with the candidate's contact details removed and checked.

Ten CVs free to try, no card and no sign-up.

www.venditas.in
```

**Sources.** `MAX_FILES = 20` in `app/Formatter.jsx`; formats in
`lib/extract.mjs` and `/faq`; the check as in post 1; trial in `lib/pricing.mjs`.

## 6 · Friday 2 October, 08:30 UK: home addresses

Image: `images/post-06-address.png`

```
A home address identifies a candidate as surely as a phone number, and plenty of CVs carry one.

Venditas removes the street and keeps the town and postcode district. A client needs the town to judge the commute. They don't need the house.

The check that reads the finished document back looks for the home address as well as the name, email, phone and links. If the street survived, no file is returned.

www.venditas.in
```

**Sources.** Commit `7a93eac` ("keep the town but not the street");
`redactionLeaks()` checks the home address (`outreach/profile.md`).

## 7 · Wednesday 7 October, 08:30 UK: pricing, in full

Image: `images/post-07-pricing.png`

```
How Venditas is priced, all of it.

Ten CVs free, with no card and no sign-up.

Then £79 a month for the whole agency: unlimited CVs, everyone included, no per-seat charge. That's the founding price for the first 20 agencies, and it stays at that rate for as long as they keep it. After that, it's £149.

Annual is £790, which is two months free.

You can buy by email without a call: the pricing page opens an email that asks for what the invoice needs.

And if it isn't saving your team real hours within a fortnight, say so and the month is refunded.

www.venditas.in/pricing
```

**Sources.** `PRO`, `ANNUAL` and `GUARANTEE` in `lib/pricing.mjs`; decisions 004
and 014.

**Check on the day:** if 20 agencies are already paying by 7 October, the
founding price has gone. Rewrite before it posts.

## 8 · Friday 9 October, 08:30 UK: for former Quibench users

Image: `images/post-08-quibench.png`

```
Quibench, a CV formatting and anonymisation tool sold to recruitment agencies, stopped operating on 11 August 2026.

If your agency relied on it, the job hasn't gone away. Venditas does the same core job: a candidate's CV in your branding, with the contact details removed, as an editable Word document.

What's different, so you can judge for yourself: one flat price for the whole agency rather than a monthly CV allowance, and a check on every finished document that refuses to return a file if a contact detail survived.

www.venditas.in/quibench-alternative
```

**Sources.** `research/growth-2026-09.md` §2: shut down 11 August 2026, and sold
at €29/month for 50 CVs and €99 for 200, both from archived pages [V]. No
Quibench customer is named, because none was found.

---

## After 9 October

The Europass post in `outreach/posts.md` ("In reserve") works on the page too, in
the third person. Anything new follows the same test: can you point to the file
or link that makes each sentence true? If not, cut the sentence.
