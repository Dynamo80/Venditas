# Venditas

Turns a candidate CV into an agency-branded Word document with the candidate's
contact details removed.

Recruitment agencies do this by hand, dozens of times a week, for one commercial
reason: if the client can read the candidate's email, the client can hire them
directly and the agency loses the fee. Everything else about the reformat is
presentation. That part is the business — so redaction is on by default and the
result is verified rather than assumed.

## How it works

    CV (PDF/DOCX)  ->  text  ->  structured fields  ->  branded .docx

**Text off the page** is deterministic and free: `unpdf` for PDF, `mammoth` for
Word. A PDF with almost no text layer is a scan, and its pages are sent as
images instead.

**Fields** come from one model call constrained by a response schema, so the
result is a typed object rather than prose to parse and hope about. The prompt
forbids invention: anything the CV does not state comes back null. A blank field
is correct; a plausible guess is a serious error, because a recruiter will
forward it to a client as fact. Bullets are copied verbatim — this reformats a
CV, it does not embellish one.

**Rendering** produces the .docx, then reads it back and asserts that the
candidate's name, email, phone and links are absent. A leak fails the request:
returning nothing beats returning a document that costs the agency a placement.

## Run it

    npm install
    GEMINI_API_KEY=... npm run dev

## Layout

    lib/extract.mjs        document -> typed fields
    lib/render.mjs         fields -> branded .docx, plus the leak assertion
    app/api/format/route.js  upload endpoint
    app/page.jsx           the tool, which is also the landing page
    reference/             validated Python original, kept for regression checks

`reference/` is not shipped. It is the implementation the extraction prompt was
developed and proven against, including `samples/make_sample.py`, which builds a
deliberately awful two-column CV: split email addresses, three date formats, a
sidebar, and page furniture. Change the prompt, re-run that.
