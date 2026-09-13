# The Venditas company page: every field, paste-ready

Written 2026-09-14. Every claim has the same sources as `outreach/profile.md`
(listed at the bottom of that file), plus the two noted below. If the product
changes, re-check them before the page says something that has stopped being true.

Images are in `images/`. Regenerate them with `node outreach/company-page/render.mjs`.

---

## Create the page

LinkedIn → **For Business** (top right) → **Create a Company Page** → **Company**.

| Field | Paste |
|---|---|
| Name | `Venditas` |
| LinkedIn public URL | `venditas`. If it is taken: `venditas-cv`, then `venditas-in` |
| Website | `https://www.venditas.in` |
| Industry | `Software Development` |
| Organisation size | `0-1 employees` |
| Organisation type | `Sole proprietorship`. Venditas is run by a sole trader (`docs/state.md`, item 10) |
| Logo | `images/logo-400.png` |
| Tagline | see below |

## Tagline (102 characters; the limit is 120)

```
Candidate CVs in your agency's branding, contact details removed and checked. 10 free, then £79/month.
```

## Edit page → Page info

**Description** (the About; the limit is 2,000 characters):

```
Before a candidate's CV goes to a client, someone at the agency rebuilds it in the agency's branding and takes the name, email and phone off. The reason isn't looks. A client who can read the candidate's number can ring them directly, and the agency loses the fee.

Venditas does that job. Drop in the CV the candidate sent, whether it's a PDF or a Word file, two columns, tables or a scan, and get back an editable Word document with your logo, colours and footer, and a reference code where the candidate's name was. Up to 20 CVs at once.

It is built around two things it won't do.

It won't rewrite the candidate. Their wording stays theirs, and their roles and dates stay in the order they wrote them.

It won't hand you a leak. Every finished document is read back before you get it. If the candidate's name, email, phone, links or home address are still in it, you get an error instead of a file.

CVs are processed in memory and not stored. www.venditas.in/security sets out exactly where the data goes.

10 CVs free, with no card and no sign-up. Then £79 a month for the whole agency, with no per-seat charge: the founding price for the first 20 agencies. You can buy by email, without a call.

Venditas is new, and it is run by one person, Abin Johnson, in Navi Mumbai. Messages to this page are answered by the person who built it.
```

**Specialties** (add each one). Look under **Edit page → Details**, below
Industry and Company size, for a "Specialties" field. If the page doesn't offer
one (on 14 September a new page showed only **Services**), skip it: the same
words are already in the description, which is what search reads. Don't
enter them as Services. That builds a service-provider listing with a "Request
proposal" button, which is the wrong shape for software.

```
CV formatting
CV redaction
Candidate anonymisation
Branded CVs
Recruitment agencies
Recruitment software
Document automation
GDPR
```

**Location:** Navi Mumbai, Maharashtra, India. City only: the street address is
already in every email footer, and a page does not need it.

**Custom button:** `Visit website` → `https://www.venditas.in`

**Cover image:** `images/cover-1128x191.png`

---

## The two claims not already sourced in profile.md

- **Up to 20 CVs at once:** `MAX_FILES = 20` in `app/Formatter.jsx`.
- **Branding saved in the browser, not on a server** (post 4): `localStorage` in
  `app/Formatter.jsx`, and its header comment.
