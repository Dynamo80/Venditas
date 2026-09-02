# Record of processing activities — Article 30(2) UK GDPR

Venditas acts as a **processor** for its customers (recruitment agencies) and
as a **controller** for its own user accounts and marketing list. Article 30(2)
requires a processor to keep this record; Article 30(1) requires a controller
to. The small-organisation exemption in Article 30(5) does not apply, because
the processing is not occasional and CVs can contain special category data.

**Prepared:** 2026-09-02. **Keep current:** update on any new customer, new
sub-processor, or change to what is stored. Produce on request from a customer
or the ICO.

Items in `[square brackets]` are facts the founder has to supply. The record is
not complete until they are filled in, and a customer who asks for it will
notice.

---

## Part A — Venditas as processor (Article 30(2))

### 1. Processor

| | |
|---|---|
| Name | Venditas, a sole trader business operated by [FOUNDER FULL LEGAL NAME] |
| Address | Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India |
| Contact | founder@venditas.in |
| Data protection officer | None appointed; not required at this scale. Contact above. |
| UK representative (Article 27) | [NONE APPOINTED / name and address once appointed — see `compliance-notes.md` §8] |
| EU representative | Not applicable; no EU customers |

### 2. Controllers on whose behalf Venditas processes

Every paying customer is a controller. The authoritative list is the `leads`
table, rows where `plan <> 'free'`, which `node ops/status.mjs` prints. Keep
this table in step with it.

| Controller (agency) | Contact | Country | DPA signed | Since |
|---|---|---|---|---|
| *(none yet)* | | | | |

Trial users who upload CVs before signing a DPA are also controllers for that
processing. The terms of service (clause 4) make them responsible for having
a lawful basis; the same categories of processing below apply.

### 3. Categories of processing carried out for each controller

Identical for every controller. One service, one flow.

| Step | What happens | Where |
|---|---|---|
| Upload | A candidate CV (PDF or Word) is received over HTTPS | Vercel, `iad1` (US East) |
| Text extraction | Text is read from the file; a scanned PDF is rendered to page images instead | In memory, Vercel |
| Local de-identification | Name, email, phone and personal links are replaced with placeholders before anything leaves the server | In memory, Vercel |
| Structuring | The de-identified text (or page images for a scan) is sent to Google's Gemini API, which returns typed fields | Google LLC, US |
| Re-identification and rendering | Placeholders are merged back; a branded `.docx` is generated with contact details removed | In memory, Vercel |
| Verification | The output is read back and the request fails if any identifier is present | In memory, Vercel |
| Return | The document is returned to the user; every intermediate is discarded when the request ends | — |

**Categories of data subjects:** job candidates whose CVs the controller holds.

**Categories of personal data:** whatever the candidate wrote in their CV.
Typically: name, contact details, employment history, education, skills,
and sometimes special category data (health, disability, trade union role,
religious-affiliated employers, a photograph on a scanned CV). Venditas does
not inspect or filter for special category data because it does not retain
anything to filter.

**Retention:** none. No candidate data is written to persistent storage
(DPA clause 4, decision 006). Exception: a scanned CV's page images are sent
to Google as-is because they cannot be de-identified locally; Google's own
retention for abuse monitoring applies to those, and is [CONFIRM from Google's
current terms — see `compliance-notes.md` §1].

### 4. Transfers to third countries

| Transfer | From | To | Safeguard |
|---|---|---|---|
| Controller to Venditas | UK | India (no adequacy) | IDTA, or EU SCCs plus UK Addendum, per DPA Annex 4 — [EXECUTED INSTRUMENT PENDING; draft ready] |
| Venditas to Vercel | — | US (`iad1`) | Vercel's data processing terms; no candidate data at rest |
| Venditas to Google (Gemini) | — | US and other Google locations | Google's Gemini API terms [CONFIRM tier and applicable DPA — §1 of compliance notes] |
| Venditas to Supabase | — | AWS [REGION — CONFIRM in Supabase dashboard] | Supabase DPA; account data only, no candidate data |

### 5. Technical and organisational security measures

As described in DPA Annex 2, sections A to G. In summary: no retention of
candidate data; TLS in transit; secrets held only in the hosting provider's
environment and on one encrypted machine; single-person access; local
de-identification before the model call; post-render leak assertion that fails
closed; rate limiting by salted IP hash; a scheduled purge of usage counters
after 90 days and dormant accounts after 24 months. Measures **not** in place
(no certifications, no penetration test, no insurance) are stated in Annex 2
section G rather than omitted.

---

## Part B — Venditas as controller (Article 30(1))

### 6. User accounts and metering

| | |
|---|---|
| Purpose | Gate the trial, count usage, contact the user about the service |
| Lawful basis | Contract (Article 6(1)(b)) for the service; legitimate interests (6(1)(f)) for abuse control |
| Data subjects | People at recruitment agencies who use the site |
| Data | Work email, agency name, first and last seen, CV count, contact preference, unsubscribe token, plan and payment reference |
| Also stored | Per-day request counters keyed to a salted hash of the IP address; never the address |
| Recipients | Supabase (database host). Nobody else |
| Retention | Counters: 90 days. Dormant accounts: 24 months from last seen. Opt-out records: never deleted, so the opt-out is never forgotten |
| Transfers | To Supabase, AWS [REGION — CONFIRM] |

### 7. Marketing list (direct outreach to agencies)

| | |
|---|---|
| Purpose | Tell recruitment agencies that the tool exists |
| Lawful basis | Legitimate interests (Article 6(1)(f)); assessment in `legal/lia.md` |
| Data subjects | Staff and role addresses at recruitment agencies in the UK, Ireland and the US |
| Data | Agency name, website, work email, city, country, specialism, logo, brand colour, one sentence of public context; date and subject of each message sent |
| Source | Public business sources: the agency's own website, public professional profiles, public directories. No purchased lists |
| Recipients | GoDaddy (email sending and mailbox). Nobody else |
| Retention | Prospect list: for the duration of the campaign, then deleted. Sent log: 24 months. Suppression list: indefinitely |
| Transfers | Held on one machine in India; sent via GoDaddy's mail servers [REGION — CONFIRM] |
| Article 14 notice | Privacy policy, section "If we emailed you and you have never used Venditas", linked from every message |

---

## Change log

| Date | Change |
|---|---|
| 2026-09-02 | First version, written against the code and the DPA as they stand |
