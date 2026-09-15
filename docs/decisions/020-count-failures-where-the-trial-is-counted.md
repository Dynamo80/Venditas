# 020 — Count failed runs in usage_daily, not in a log or a new table

Date: 2026-09-15

## What happened

A prospect wrote "I tried to do one on your website but it failed" without
the error text. `ops/status.mjs` could not say whether anyone had failed: it
printed one number, "CVs run", summed from attempts, and a lead is only
recorded once a Word file has gone back. Vercel's free plan keeps about an
hour of runtime logs, so the server's own error was long gone.

Extending the status script found the run: one address, two attempts on
10 September, nothing delivered. Reproducing every code path locally found
the cause. Any scanned or image-only PDF failed on our side, identically on
retry, because the page rasteriser's canvas dependency was never installed
and, once it was, the second PDF.js parse read a buffer the first one had
already transferred away. The privacy policy had disclosed the scan path as
working since 2 September. It never had.

## Decision

Every failure after the trial CV has been metered is counted with
`bump_usage(email_hash, 'fail:<reason>')` into the existing `usage_daily`
table, and `ops/status.mjs` prints the total by reason next to attempted and
delivered. Reasons are a short fixed set: `file`, `timeout`, `extract`,
`not-a-cv`, `render`, `leak`, `redaction-check`.

Scanned PDFs are fixed (`@napi-rs/canvas` installed, rendering from the
already-open document) and covered by `reference/samples/scanned-management-accountant.pdf`.
The model call is now given a budget that fits inside the function's 60
seconds; one attempt used to be allowed 90.

## Rejected

- **A `failures` table.** Needs a migration pasted into Supabase by hand,
  a row in the Article 30 record, and its own purge. `usage_daily` already
  has the hashed key, the 90-day purge, and a service-only policy; a new
  `kind` value costs nothing and stores nothing new about anyone.
- **A log drain.** Every drain that keeps logs past an hour costs money, and
  costs stay at zero until revenue (decision 016).
- **Logging the error text with the counter.** The text can echo the
  request, and the request is a candidate's CV. The reason class is enough
  to know where to look; the sample fixtures reproduce the rest.
- **Retrying a scanned CV as text.** There is no text. Saying "we couldn't
  read it" would have been honest, but the product page says scans work, so
  they have to.

## What it means for a reply

`docs/runbooks/replies.md`, "When they say it failed": run the status
script first, and only then ask what the screen said.
