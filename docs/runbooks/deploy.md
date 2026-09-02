# Runbook — deploy and verify

## Deploying

Push to `main`. Vercel builds automatically and serves `venditas.in`. There is
no staging environment, which is fine at this size and worth remembering.

```bash
npm run build     # always build locally first; a failed Vercel build is a dead site
git push origin main
```

## Verifying, in order

```bash
curl -s https://www.venditas.in/api/health | jq
```

Want: `hasGeminiKey`, `hasSupabase`, `meteringReady` all true, and
`rejectedSecrets` empty.

Then a real end-to-end run:

```bash
curl -s -X POST https://www.venditas.in/api/format \
  -F "cv=@reference/samples/messy-cv.pdf" \
  -F "email=founder@venditas.in" -F "agency=Test" \
  -o /tmp/out.docx -w "%{http_code}\n"
```

A file starting with the bytes `PK` is a valid .docx. Anything else is JSON with
an error in it.

## Environment variables

Vercel needs: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET`, `CRON_SECRET`.

**Env var changes do not apply to an existing deployment — redeploy after any
change.** This cost an hour twice.

**Never paste a secret copied out of a masked field.** It arrives full of `•`
characters, is the correct length, looks fine, and fails deep inside fetch with
an error about ByteString conversion. `/api/health` reports `ascii: false` when
this happens. `SUPABASE_SECRET` exists as a second accepted name precisely
because re-entering the original kept picking up the bullets.
