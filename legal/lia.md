# Legitimate Interests Assessment — direct outreach to recruitment agencies

**Controller:** Venditas (sole trader, India). **Processing:** sending one-to-one
email, and LinkedIn connection requests, to people who work at UK, Irish and US
recruitment agencies, to tell them the tool exists.
**Lawful basis relied on:** Article 6(1)(f) UK GDPR, legitimate interests.
**Prepared:** 2026-09-02. **Review:** every six months, or when the practice changes.

This is the document the ICO asks for if a recipient complains. It records the
three-part test: the purpose, the necessity, and the balance.

## 1. Purpose test — what is the interest?

Venditas sells a tool to recruitment agencies. The interest is telling an
agency that a tool built for a task its staff perform by hand exists, and
inviting them to try it. That is a commercial interest, which the GDPR
recitals expressly recognise as capable of being legitimate (Recital 47:
"the processing of personal data for direct marketing purposes may be
regarded as carried out for a legitimate interest").

The interest is specific: we contact agencies only about CV formatting and
redaction, we contact each agency once per campaign, and we do not sell or
share the list.

## 2. Necessity test — is the processing necessary for it?

The data held per prospect is: the agency name, its website, a work email
address (in most cases a role address such as `info@` or `hello@`), the city
and country, the agency's specialism, its logo and brand colour, and one
sentence of public information about the agency used to personalise the
message. Where an individual's name is known it is a first name and a job
title.

Each item is used in the message or in choosing whether to send one. Nothing
is held that is not used. A less intrusive way of reaching the same agency —
an advertisement — would reach far more people who have no interest and is
not available at zero cost to a business with no revenue.

## 3. Balancing test

**Nature of the data.** Business contact data, mostly role addresses, taken
from the agency's own website and public directories. No special category
data, no private-life data, nothing about the person beyond their job.

**Reasonable expectations.** A recruitment agency publishes its address to be
contacted about recruitment. A message about a tool for the agency's core
work, sent to that address, is within what a business expects to receive.
Recruiters themselves send unsolicited approaches for a living.

**Source.** Public business sources only: the agency's own website, public
professional profiles, public business directories. We do not buy lists and
do not obtain addresses from other companies. If the practice ever changes,
this document and the privacy policy change first.

**Impact on the individual.** One short email, a follow-up three days later
and a final message on day eight. Never a fourth. Each carries the sender's
real name, a postal address, and a one-click unsubscribe that works without a
confirmation step. Anyone who opts out goes on a suppression list that the
sending script refuses to run without, and that is never purged.

**Individual subscribers under PECR.** The UK Privacy and Electronic
Communications Regulations treat sole traders and partnerships as individual
subscribers, to whom unsolicited marketing email requires consent. The list
is built from agencies presenting as companies, but a small recruitment
outfit can be a sole trader. Mitigation: any objection is honoured
immediately and permanently; where an agency is identifiable as a sole trader
before sending, it is removed from the list. This is a known residual risk
and is accepted rather than pretended away.

**Article 14 notice.** Recipients did not give us their address, so they are
told what we hold and where it came from: the privacy policy section "If we
emailed you and you have never used Venditas" is linked from every message.

**Safeguards.** Daily cap of 25 messages; one message every 20 seconds; SPF,
DKIM and DMARC so the sender is verifiable; no tracking pixels; no open or
click tracking; the prospect list, sent log and suppression list are kept
out of version control and off shared systems.

## 4. Outcome

The interest is legitimate, the processing is necessary for it, and the
impact on recipients — a small number of relevant, identifiable, opt-outable
messages to a business address — does not override it. **Legitimate interests
is an appropriate basis.**

Conditions attached to that conclusion, each of which is enforced in
`outreach/send.mjs` or `outreach/batch.mjs`:

1. Never more than three messages to one agency per campaign.
2. Suppression list honoured absolutely; sending refuses to run without it.
3. Real identity, postal address and one-click unsubscribe on every message.
4. Article 14 notice linked from every message.
5. No sale, sharing or enrichment of the list from third parties.

## 5. Records

- Sent log: `outreach/sent.log` (local, not committed).
- Suppression list: `outreach/suppressed.txt` (local, never purged).
- Opt-outs made through the site: `leads.may_contact = false`, never deleted.
