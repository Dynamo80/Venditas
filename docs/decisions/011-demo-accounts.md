# 011 — A demo account is a confirmed work address, nothing more

**Date:** 2026-09-08 · **Status:** active · **Builds on:** [009](009-enforceable-trial-limits.md)

## Decision

Someone who has sat through a demo signs up at `/demo`: name, agency, work
email. They get a link, and the account is inert until it is clicked.

The address is checked in nine layers before the link is sent
(`lib/email-policy.mjs`): shape, unroutable and placeholder domains,
sub-addressing, masking and forwarding services, an 8,742-domain disposable
blocklist, consumer mailboxes, shared mailboxes, whether the domain resolves and
accepts mail at all, and where its MX actually points.

A verified account gets **50 CVs, 25 a day** instead of the public trial's ten
and five, metered against the confirmed address rather than whatever is typed
into the form afterwards.

## Why an account at all

Decision 009 made the trial limits enforceable but could not make them
meaningful, because no address was ever verified: anyone could type a stranger's
address, or an invention, and the IP cap was doing all the real work. For a cold
visitor that is the right trade — a confirmation step in front of the highest
intent moment on the site costs more prospects than it saves CVs.

A demo attendee is not a cold visitor. They have already spent half an hour on a
call, so the friction is affordable, and in exchange the address becomes worth
something: an invoice can be sent to it, and 50 CVs is enough for them to put a
week of their actual shortlist through the tool. Ten was never enough to form a
habit, which is the only thing that closes this sale.

## Why no password

A password is a reset flow, a hashing decision, a storage liability and a
support burden, in exchange for nothing this business needs. The only fact worth
establishing is that the person reads mail at the address they gave, and a
clicked link establishes that better than a password does. After the click, a
signed cookie for thirty days.

## Rejected

**SMTP callback verification** — connecting to the domain's mail server and
issuing `RCPT TO` to see whether the mailbox exists. The obvious next lever and a
trap: serious mail servers accept-all and answer yes to everything, several treat
the probe as address harvesting and blacklist the source, and doing it from the
same IP that sends outreach would risk the one asset that cannot be replaced. The
confirmation email answers the same question honestly.

**A paid verification API** (ZeroBounce, NeverBounce and the like). They are
better than this file at catch-all detection and domain age. They also cost
money, and costs stay at zero.

**The 75,000-domain blocklist** over the 8,742-domain one. The big list sweeps up
parked domains, dead providers and the occasional real small business. A false
positive here tells a prospect their own company address is fake, on a signup
page, straight after a demo. Precision beats reach when a miss costs nothing —
the address still has to survive the confirmation email.

**Blocking `recruitment@`, `careers@`, `jobs@`** with the other shared
mailboxes. At a small agency those are frequently one recruiter's actual desk,
and they are exactly the customer we are trying to sign.

## The known cost

Refusing consumer mailboxes will refuse a real customer eventually — a
two-person agency running on Gmail is not rare. That rejection is the only one
marked `appealable`, and it says so: it points at `/contact`, and
`requireWorkEmail: false` opens the account by hand. The alternative is that
Gmail's unlimited aliases make every other layer decorative.

## Consequences

- `sql/006_demo_accounts.sql` must be run. Signup returns 500 without it, and
  `status.mjs`, `preflight.mjs` and `/api/health` all say so.
- **SMTP credentials must exist in the Vercel environment.** The outreach
  scripts read `.env.local` on the laptop; this runs in production and has no
  such file. Without them signup refuses honestly rather than leaving a pending
  account with no link in anyone's inbox — but nobody can sign up.
- The blocklist is perishable. `node ops/refresh-blocklist.mjs` regenerates it;
  run it monthly, or when someone gets through.
