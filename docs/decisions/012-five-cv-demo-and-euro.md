# 012 — Five CVs on a demo account, €80/month, and buying starts with a call

**Date:** 2026-09-09 · **Status:** active
**Supersedes:** the account limits and the work-email rule in [011](011-demo-accounts.md)
**Amends:** the currency table in [004](004-pricing.md); the buy path in [007](007-invoice-not-checkout.md)

## Decision

- A verified demo account gets **5 CVs total, 5 a day**. Decision 011 said 50 at
  25 a day; that was wrong.
- **EUR is a fourth currency at €80/month**, €800 annual, €149 standard.
- **Consumer mailboxes are no longer refused.** Gmail, Outlook, Yahoo, Proton
  and the rest go through.
- **The email confirmation link stays.** It is the friction that makes the five
  mean anything.
- **Buying starts by booking a call**, not by emailing for an invoice. The
  pricing button is the Calendly link.
- **The public trial stays at 10 CVs.** Deliberate; see below.

## Why five and not fifty

011 sized the account to build a habit: put a week of a real shortlist through
it and the tool sells itself. That is the right instinct for a product with a
checkout, where the habit and the purchase happen in the same session at 2am.

This business has no checkout and is not getting one before the deadline. So a
generous allowance does not shorten the path to payment, it removes the reason
to walk it: someone holding fifty CVs has no occasion to reply for a fortnight,
and a fortnight is most of what is left.

Five answers the only question a demo has to answer — does this hold up on *our*
candidates, in *our* branding — and does not clear a shortlist. The sixth CV is
a conversation instead of a quiet continuation.

## Why the confirmation link stays, when friction was a concern

Five CVs and "don't make it too frictional" pull against each other, and the
link is where that tension gets resolved. Without it the cap is decorative:
anyone wanting a sixth CV types a different address and has one. With it, the
cost is about sixty seconds, paid once, by someone who has already spent half an
hour on a call — which is the cheapest moment in the entire funnel to ask for
anything.

Everything else was cut instead. No password, no company-size question, no
"how did you hear about us". Name, agency, email, click.

## Why Gmail stops being blocked

011 blocked consumer mailboxes because one Gmail account is an unlimited supply
of `alice+1`, `alice+2`, `a.l.i.c.e`. Two things make that the wrong trade at
five CVs:

**The prize shrank.** Farming aliases now wins five CVs instead of fifty.

**The loophole was already shut a layer down.** `+` tags are refused outright at
signup, and `canonicalEmail` folds Gmail's dots and its googlemail.com alias, so
every spelling of one Gmail address shares one counter. Blocking the domain was
belt on top of braces.

What it cost was real: a two-person recruitment agency running on Gmail is
common, and telling one of them their own address is unacceptable — on a signup
page, straight after a demo — is an expensive way to protect five CVs.

Everything else stays on: throwaway domains, masking and forwarding services
(DuckDuckGo, Apple Hide My Email, SimpleLogin, addy.io, ImprovMX), shared
mailboxes, domains that cannot receive mail, and domains whose MX points
somewhere throwaway however respectable the domain looks. Gmail is a mailbox
someone reads; `duck.com` is a mailbox someone discards, and that is the
distinction the file is for. `requireWorkEmail: true` turns the block back on.

## Buying starts with a call

007 said money is collected by invoice rather than a checkout, and that stands.
What changes is the first step. The pricing page used to open a pre-filled email
asking to be invoiced; it now opens the calendar.

The reason is not conversion mechanics. At zero customers the call is worth more
than the order: it is the only way to find out which template they actually use,
what their client rejected last month, and which part of the output is wrong.
The page says this in as many words rather than dressing it up — no checkout,
deliberately, because we are early and every conversation teaches us something.

Payment rails are not named on the site. Bank transfer, PayPal or anything else
is settled on the call, and naming one in public commits us to a rail that may
change before the first ten customers.

## €80

A round, memorable number in the currency, which is worth more than parity.

Worth knowing rather than arguing about: €80 is roughly £69, so a euro customer
contributes about 13% less to a goal denominated in pounds than a UK one. Thirteen
customers at €80 is about £900, not £1,027. €90 would sit level with £79. The
price stands as decided; the arithmetic is written down so nobody is surprised.

## The public trial stays at 10, knowingly

An anonymous visitor on the front page gets ten CVs and no questions. A demo
attendee who confirms an address gets five. That is upside down, and it is a
deliberate call rather than an oversight.

The public form is the only thing currently producing leads at all — three of
them, one from a stranger on no prospect list. Cutting it in half or putting a
signup in front of it protects a cap that nobody is presently attacking, at the
cost of the single working part of the funnel.

The exposure is small and worth naming: a demo attendee who ignores the link
they were sent and uses the front page instead gets ten CVs unmetered against
their account. That costs a little Gemini quota and loses us the lead capture,
and it is a trade worth making until the front page produces enough traffic for
the leak to matter. Revisit when trial sign-ups pass roughly one a day.
