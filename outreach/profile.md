# LinkedIn profile — paste-ready

Rewritten 2026-09-13. Replaces the earlier draft in this file. The audience is a
UK or EU recruitment agency owner deciding, in about two seconds, whether to
accept a connection request with no note on it. Everything below is written for
that person.

Do these in order. The first two cost nothing and matter more than everything
after them.

---

## 1. Turn off #OPEN_TO_WORK — first, today

Both warm threads (Klaus, Marc) show "Abin Johnson, #OPEN_TO_WORK". To an agency
owner, that reads as: this founder is job-hunting, so the product may not be
here in three months. Nobody buys a monthly subscription from that.

Profile → the "Open to" card under your name → the pencil → **Delete from
profile**. If it was set for recruiters only, check Settings → Data privacy →
Job seeking preferences as well.

## 2. Photo

A recent, well-lit face photo. Recruiters look at profiles all day, and a
missing or dated photo is the fastest "no" there is.

---

## 3. Headline (220 characters max)

**Use this one:**

```
Founder, Venditas · Candidate CVs into your agency's template, contact details stripped, in seconds · 10 free at venditas.in
```

It says what the product does for them before they have to click anything, and
it ends in something they can do.

**If the profile also has to find you engineering work:**

```
Founder, Venditas (branded, redacted CVs for recruitment agencies) · Full-stack AI engineer
```

Weaker for recruiters. Use it only if you need the second audience.

---

## 4. About

The first two lines show before "see more", so they carry the weight.

```
Every recruitment agency does the same job several times a day: a candidate's CV arrives in whatever state they made it, and before it reaches the client someone rebuilds it in the agency's template and takes the name, email and phone off. The reason isn't looks. A client who can read the candidate's number can hire them directly, and the agency loses a fee worth thousands.

I built Venditas to do that job. Drop in the CV, whether it's two columns, a Europass form or a scan, and get back an editable Word document in your branding, with a reference code where the candidate's details were. The finished document is read back before it's returned, and if any contact detail survived you get an error instead of a file. It copies the candidate's own wording; it doesn't embellish.

It costs £79 a month for the whole agency, with no per-seat charge. You can try 10 CVs first, with no card and no call, at venditas.in.

Honest about what this is: I'm one person, in Navi Mumbai, and I'm not a recruiter. Venditas is my second go under this name. I closed the first version when I worked out the problem it solved wasn't real, and restarted it on one I could find evidence for. When you message me, the person who built it answers.

If your agency still reformats CVs by hand, send me one you're embarrassed by and I'll run it through.
```

**Why it is shaped like this.**
- **It opens with their job, not the product.** They should recognise their own afternoon in the first two lines.
- **The fee-protection point is the pitch.** It is the reason agencies redact at all, and no competitor leads with it.
- **"Europass form or a scan" is a specific detail.** Only someone who has processed real CVs names those.
- **The restart line is kept, and turned around.** If an older version of your About said you shut Venditas down, this answers it rather than hiding it. Deleting it would look like a scrub to anyone who had already read it.
- **Hustlr and Labs60 are left out on purpose.** Those audiences are separate from this one, and a recruiter who reads "AI receptionists" stops trusting that this is a focused product.

---

## 5. Experience: add or replace the Venditas entry

Title: **Founder**
Company: **Venditas** (create the company page if prompted, or leave as text)
Dates: Feb 2026 – Present · Navi Mumbai, India · Remote

```
Venditas turns a candidate CV into a recruitment agency's own branded Word template and removes the candidate's name, email, phone, links and street address, replacing them with a reference code.

What goes in is whatever the candidate sent: PDF or Word, two-column layouts, tables, Europass forms, scans. What comes out is an editable Word document in about four seconds. The candidate's own wording is kept, not rewritten.

Redaction is checked on the finished document. If any identifier survived, the request fails rather than returning the file. Candidate CVs are processed in memory and not stored.

£79/month for the whole agency. 10 CVs free at venditas.in.
```

## 6. Featured

Add one link: **venditas.in/pricing**. Title "Venditas: 10 CVs free, then £79/month for the agency". If LinkedIn pulls the wrong preview image, upload `outreach/linkedin/banner.png` as the thumbnail.

## 7. Banner

Upload `outreach/linkedin/banner.png` (1584 x 396): a messy CV on one side, the same candidate as a branded, redacted document on the other. It does more work than any sentence on the page.

## 8. The small settings

- **Custom URL:** Profile → Edit public profile & URL → `linkedin.com/in/abin-venditas` or `abinjohnson`. The default string of digits looks unfinished.
- **Location:** Navi Mumbai. Don't fake a UK location. Recruiters verify people for a living.
- **Contact info → Website:** venditas.in, labelled "Company".
- **Skills (top 3):** Recruitment Technology, Document Automation, Data Protection.
- **Creator mode, "Provide services", newsletters:** leave off. They make the profile read like a freelancer's.

---

## After the profile is done

Work the daily pack: `node --env-file=.env.local outreach/linkedin-pack.mjs` generates a week of it, and `outreach/linkedin/pack-<date>/index.html` is the checklist. The posts are in `outreach/posts.md`.
