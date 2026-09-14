# Runbook — the jobs that run by themselves

Decision 018. Everything below runs on the founder's laptop and nowhere else.

## Is it running?

```bash
node ops/status.mjs        # AUTOMATION: scheduled or not, last run, what it found
```

Install or repair every job (the daily one armed):

```powershell
powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Live
powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Task watch,weekly   # leave daily alone
powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Task watch -Remove  # stop one
```

## When a notification appears

| It says | Do |
|---|---|
| **Sale: X wants to buy** | Open Drafts: the reply is there. Raise the Skydo invoice and record it before anything else (`invoice.md`) |
| **Reply from X** | Open Drafts, read the draft, then send it or rewrite it. They are already marked replied, so no follow-up will reach them. If the draft is the wrong shape: `node outreach/reply.mjs <domain> --draft <kind>` |
| **New email from X** | Someone we never wrote to. There is a draft only if they asked about price, data or buying. Answer today |
| **Trial signup: X** | Someone has just run a CV, and a personal note to them is already in Drafts (`drafts.mjs`, "trial"). Read it, send it today. It beats the automatic email at five CVs |
| **Replies are not being read** | The mailbox has been unreachable for three hours. `node ops/preflight.mjs` |
| **Outreach blocked today** | The mail host was down for the whole half-hour the job kept asking (seven probes, five minutes apart; a blip shorter than that is ridden out silently and shows as `waiting` lines in `ops/daily.log`). `node ops/preflight.mjs`, then `node ops/daily.mjs --send --confirm` inside UK working hours |
| **a stage failed** | `node ops/preflight.mjs`, then `node ops/daily.mjs --send --confirm` inside UK working hours |
| **Weekly check: needs a look** | Pages written but not live means deploy (`deploy.md`). SEO problems: `node ops/seo.mjs` lists them by page |

Every notification is also written to `ops/notify.log`. To get them on a phone
as well, add `ALERT_EMAIL=you@example.com` to `.env.local`.

## By hand, any time

```bash
node ops/watch.mjs --dry               # what the next pass would do, changing nothing
node ops/seo.mjs                       # live site against the repo
node ops/seo.mjs --submit              # and push changed pages to IndexNow
node ops/refresh-prospects.mjs --dry   # would this month's Companies House run happen?
node ops/weekly.mjs                    # both, as Saturday runs them
```

## What the watch cannot tell apart

It classifies with keyword rules (`outreach/drafts.mjs`), so read every draft
before sending it. Known gaps:

- **A mailing sent without list headers** is reported as "new email". One
  notification, no harm; ignore it.
- **"Not interested right now, maybe next quarter"** reads as `no`. The draft
  is a polite goodbye, and they are **not** suppressed: only an explicit
  "remove me", "unsubscribe" or "stop emailing" suppresses.
- **A reply to a LinkedIn conversation sent by email** counts as a reply, but
  gets no `interested` draft, because there is no Word file to attach.

## Google, which none of this reaches

IndexNow covers Bing, Yandex, Seznam and Naver. Google needs the sitemap
submitted once in Search Console: `https://www.venditas.in/sitemap.xml`, with the
**www** property. After that Google reads the sitemap by itself.
