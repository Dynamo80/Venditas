# Personal data breach plan — one page

The DPA (clause 9.1) commits Venditas to notifying an affected customer
**without undue delay and within 48 hours** of becoming aware of a breach.
This page exists so that the 48 hours are spent acting, not deciding.

## What a breach can be here

Because no candidate data is stored (decision 006), the realistic events are:

| Event | Data at risk | Likely how you find out |
|---|---|---|
| Supabase credentials or project compromised | User emails, agency names, usage counts, salted IP hashes | Supabase alert; unexplained rows; a customer reports mail they did not sign up for |
| Gemini API key leaked | Nobody's stored data, but an attacker can run CVs through our quota and Google sees them as ours | Google quota alerts; `status.mjs` shows CV counts you did not generate |
| SMTP credentials leaked | The mailbox: every reply from every prospect and customer | Mail you did not send appears in Sent; recipients complain |
| Redaction leak shipped to a customer | One candidate's contact details reach a client | The customer tells you; `redactionLeaks()` should have failed the request, so this is also a code bug |
| Laptop lost or stolen | `.env.local` (all keys), the prospect list, the sent log | You know immediately |
| Vercel or Supabase report their own incident | Whatever their notice says | Their email |

## The first hour

1. **Stop the bleeding.** Rotate the affected credential first, understand later:
   - Gemini: Google AI Studio, API keys, delete and create.
   - Supabase: dashboard, Settings, API, regenerate the service key.
   - SMTP: GoDaddy email admin, change the password.
   - Update the Vercel env vars and **redeploy**; env changes do not apply to a
     running deployment. Update `.env.local`.
2. **Write down the time you became aware.** The 48 hours run from now.
3. **Work out who is affected.** The customer list is the `leads` table, rows
   where `plan <> 'free'`. Trial users are `leads` with `plan = 'free'`.
   Prospects who never used the site are in `outreach/prospects.csv` and
   `sent.log`, and are not customers under any DPA.

## Within 48 hours — notify customers

Email each affected paying customer from `founder@venditas.in`. DPA clause 9.2
says what the notice must contain; use this shape:

> Subject: Venditas — security notice, [date]
>
> On [date/time] we became aware that [what happened, one sentence].
> The data involved is [what, from the table above]. Candidate CVs are not
> stored by Venditas and were not involved / were involved as follows: [...].
> We have [what you did: rotated keys, redeployed, etc.] at [time].
> Likely consequences for you: [...]. What we recommend you do: [...].
> Contact: founder@venditas.in. We will update you by [date].

Send it even if the picture is incomplete. Clause 9 allows information to be
provided in phases. It does not allow silence while you investigate.

## Regulators

- **The customer decides** whether to notify the ICO; they are the controller.
  Give them what they need to decide within the 48 hours.
- **Venditas as controller** (the marketing list, user accounts): if the breach
  is likely to result in a risk to those people, the ICO must be told within
  72 hours. For a leak of work email addresses and agency names the risk is
  usually low; write down the reasoning either way.
- India: DPDP Act rules on breach notification to the Data Protection Board.
  Check the commencement position on the day; see `compliance-notes.md` §11.

## Afterwards

Record the incident, the timeline and what changed as a new file in
`docs/decisions/`. If the cause was a paste into a chat window, a ticket or a
screenshot, rotate every key that has ever been pasted anywhere.
