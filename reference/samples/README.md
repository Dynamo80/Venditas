# Sample CV pack

Six fictional CVs, one per recruitment specialism, for attaching to cold outreach
already rendered in the target agency's branding. A finance recruiter opens a
financial controller's CV; a legal recruiter opens a solicitor's.

**Everything in these files is invented.** The people, the employers, the
universities, the clients, the deal values and the registration numbers do not
exist. Contact details are deliberately unusable: `example.com` addresses and
UK numbers in the Ofcom drama range (`07700 900xxx`). The NMC PIN and SRA ID are
not valid registration numbers. Nothing here is derived from a real candidate's
CV, and no real employer is named as anybody's employer.

Each generator is standalone. Run it and it writes its PDF next to itself:

```
python make_tech.py
```

`make_sample.py` is the original prototype (`messy-cv.pdf`, a data engineer with
a left sidebar); the six below follow its approach.

## The six samples

| Generator | PDF | Specialism | Candidate | Formatting hazard | Live test |
|---|---|---|---|---|---|
| `make_tech.py` | `tech-backend-engineer.pdf` | Technology | Senior backend engineer, 9 yrs | Two-column layout with a **right-hand** dark sidebar; **email split across two lines** (`devansh.kulkarni` / `@example.com`), and a URL split the same way | PASS |
| `make_finance.py` | `finance-financial-controller.pdf` | Finance and accounting | Financial controller, ACMA CGMA | **Table-based Word layout** — whole CV is one bordered table, dates in a narrow left cell, plus a three-across skills grid | PASS |
| `make_healthcare.py` | `healthcare-theatre-nurse.pdf` | Healthcare | Senior theatre nurse (scrub), Band 6 | **Header and footer page furniture** on both pages: running name/PIN header, Windows file path, "Page 1 of 2", confidentiality strip | PASS |
| `make_engineering.py` | `engineering-process-engineer.pdf` | Engineering and manufacturing | Senior process engineer, CEng | **Nine inconsistent date formats** in one document (see below) | NOT TESTED — daily quota |
| `make_legal.py` | `legal-commercial-solicitor.pdf` | Legal | Commercial solicitor, 5 yrs PQE | **Three pages**, flowing continuously so a job's bullets break across a page boundary; ten-item schedule of matters | PASS (with a serious content loss, see below) |
| `make_sales.py` | `sales-regional-manager.pdf` | Sales and marketing | Regional sales manager | **No section headings at all** — no bold, no bullets, no rules, one font size; employers and dates buried mid-sentence | PASS |

Every hazard on the brief is covered. Two CVs carry a second hazard: the tech CV
adds the split email address to the two-column layout (they occur together in
real life, because the sidebar is too narrow for the address), and the
healthcare CV runs to two pages under its header and footer furniture.

The engineering CV's date formats, all in one document:

```
March 2022 - Present      Sep 2017 to Jun 2019      Jan '11 - Aug '12
07/2019 - 06/2021         01.09.2012 - 31.08.2015   Summer 2010
2015-17                   Oct 2010 - Jun 2011       2019 (Aug) to present
```

`07/2019` is a UK/US ambiguity trap: it must read as July 2019, not 7 January.

## Live test

```
curl -s -X POST https://www.venditas.in/api/format \
  -F "cv=@<pdf>" -F "email=founder@venditas.in" -F "agency=Test Agency" \
  -o out.docx -w "%{http_code}"
```

Run 2026-09-02. Five of the six were submitted; the endpoint allows five runs
per day per email address and `founder@venditas.in` was at its limit, so
`engineering-process-engineer.pdf` is untested and should go first tomorrow.

All five returned HTTP 200 and a valid `.docx` (bytes `PK`). None of them
leaked: no candidate name, email, phone, NMC PIN, page number, confidentiality
notice or file path survived into any output document. Redaction is doing its
job.

### What the product handled well

- The right-hand sidebar did not interleave. Skills and certifications were
  lifted out of it into their own sections rather than being wedged into a job
  description.
- The Word table's detached dates were re-attached to the right employers, and
  the three-across skills grid was read across, not down.
- The no-headings CV was correctly split into four separate roles, with the
  education paragraph not filed as a job.
- Every date format tried so far normalised correctly, including `07/2019` as
  July.
- Three pages produced no truncation of the experience section, and the
  four-seat training contract survived intact.

### What it handled badly

**Content outside the schema is dropped silently.** The extraction schema in
`reference/extract.py` has room for profile, experience, education, skills,
languages and certifications, and nothing else. Anything a candidate writes
under any other heading disappears without a trace in the output. In these five
samples that cost:

- **Legal — the entire "Selected matters" section, all ten numbered matters.**
  Roughly a third of the document, and for a commercial solicitor it is the most
  commercially important part of the CV. Not truncated or paraphrased: absent. A
  legal recruiter would not send the output.
- **Healthcare — the audit and service improvement section** (including a
  quantified two-cycle audit, 71% to 96% checklist compliance) and the whole
  compliance block: DBS enhanced check date, occupational health clearance,
  notice period, willingness to take a Band 7 or rotational post.
- **Healthcare — the NMC PIN and revalidation date.** Defensible as a redaction,
  since the PIN is a public-register lookup key and would let a client identify
  the candidate. But it is absent from the schema rather than deliberately
  redacted, so it is being dropped by accident, not by policy.
- **Tech and sales — notice period and right-to-work status.** Both are among
  the first things a recruiter needs.
- **Finance — the scope line under the current role** ("Group turnover 78m,
  three manufacturing sites, 620 headcount, team of nine"). It was an
  unbulleted sentence in the table cell and the schema only stores bullets, so
  the size of the job vanished.

**Certification dates are stripped.** "ILS - renewed 02/2026" became "ILS
(Immediate Life Support)"; "Perioperative Care Skills, Level 6 module - 2019"
lost its year. For healthcare the currency of mandatory training is the whole
point of listing it.

**Skills are inferred rather than copied on prose-heavy CVs.** The sales CV
never lists skills; the output asserts "P&L management", "Key account
management", "Pricing strategy". The legal CV's output asserts "Private M&A",
"Data Protection". Reasonable inferences, but the extraction rules say never to
invent, and these are being presented to a client as things the candidate
claimed.

**Two job titles were invented on the sales CV.** The source says he spent two
years at Kelmscott Office Solutions "in a straightforward new business telesales
role" — no title given — and the output states the title as "New Business
Telesales". Likewise "Senior Territory Sales Executive" at Verity Trade
Supplies, synthesised from "territory sales executive" plus "promoted to senior
executive in 2016".

**First person leaks through the rewrite.** The no-headings CV's prose was
converted to bullets, but inconsistently: bullets that begin impersonally end
with "and I own the P&L for the region", "and I wrote most of the submission
myself", "in my second and third years". It reads like an unfinished edit, which
on a branded agency document is the kind of thing a client notices.
