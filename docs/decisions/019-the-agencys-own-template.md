# 019 — The CV goes into the agency's own Word template

**Date:** 2026-09-14 · **Status:** active
**Decided by:** Claude, with the founder's standing instruction to build toward
£10,000 MRR

## Decision

An agency can upload its own Word template (.docx or .dotx, up to 2MB) with the
CV. The result keeps everything in the template except its body: headers and
footers with their logos, fonts, styles, page size, margins, theme. The CV goes
where the template says `{{CV}}`, and any text around the marker (an intro line,
an interview note) stays. With no marker, the CV fills the page under the
template's header.

Without a template nothing changes: the agency's logo, colour and footer line on
Venditas's own layout, byte for byte what `lib/render.mjs` produced before.

`lib/template.mjs` does the merge. `render(..., { template: true })` leaves out
the masthead, footer and fonts, and the body paragraphs move into the template
with their bullet numbering renumbered and any missing style copied across.

## Why now

- **The best leads need it.** The agencies most likely to pay are those already
  paying HireAra or Allsorter (013), and those tools fill the agency's own
  template. A switch that starts with "your layout, not ours" is a switch that
  doesn't happen.
- **It was the named gap.** `docs/state.md` listed it as the product gap most
  worth closing, and until 13 September the site claimed it anyway.
- **The goal needs switchers.** 77 agencies (015) will not come from agencies
  that have never paid for this. They come from agencies that already do.

## How it was checked

- Templates made in Microsoft Word on this machine: a letterhead with its own
  font, header and footer; a template with a logo in the header, an intro line,
  `{{CV}}` and a closing line; and the letterhead saved as .dotx.
- Every result: well-formed XML in every changed part, bullets referencing
  numbering that exists, no marker left, the template's section properties and
  footer kept, the redaction check passing, the CV between the intro and closing
  text when a marker is used.
- Every result opened in Word itself: one page, the template's own font applied,
  header and footer present, bullets intact. Exported to PDF and looked at.
- The template-free output compared byte for byte with the previous renderer.

## Guards

- Checked before the meter, so a template we can't use never costs a trial CV.
- Macro-enabled files are refused. So is anything that isn't a Word package, or
  that unpacks past 25MB.
- The template is used in memory for that request and never stored (006). The
  browser keeps it only if "remember" is ticked, next to the saved logo.
- The redaction check runs on the final merged document.

## Rejected

- **Placeholder fields for every CV section** (`{{name}}`, `{{experience}}`, as
  docxtemplater does). Agencies would have to rebuild their template around our
  field names before the first CV, which is the setup a ten-CV trial cannot ask
  for. One marker, or none, works with the template they already have.
- **A template library chosen from our side.** It solves a different problem.
  The agency's template is the point.
- **Storing templates on the server for convenience.** It would break 006's
  "nothing about the agency is stored", and the browser already keeps branding.
- **A new dependency for the merge** (docxtemplater, a full XML DOM). The parts are
  machine-written and the operations are narrow. jszip, already installed through
  `docx`, is enough.

## Known limits

- A marker inside a text box is ignored, and the CV fills the page instead.
- A template with several sections keeps only the last section's page setup.
- The CV's section headings keep Venditas's structure (Profile, Experience...),
  set in the template's font. They do not adopt the template's own heading
  styles. Worth doing when a paying agency asks.
