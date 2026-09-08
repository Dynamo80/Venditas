# Runbook — someone wants to pay

**If they want to talk first**, send the booking link rather than proposing times:
<https://calendly.com/aventis61/30min>. It is on `/pricing`, `/contact` and in the
site footer, and it lives in `lib/pricing.mjs` as `MEETING_URL` — change it there,
not in three pages.

There is no checkout. Razorpay cannot be used (decision 007), so money is
collected by invoice and bank transfer. This is fine for the first twenty
customers and it is the fastest thing that works today. The whole job is
under ten minutes per customer, and the ten minutes matter: an agency that
said yes on Tuesday and has no invoice by Thursday has stopped being a
customer.

## 1. The moment they say yes

Reply the same hour, from `founder@venditas.in`, and ask for exactly three
things if the pricing-page email did not already carry them:

- the agency's legal name for the invoice
- a billing email
- monthly or annual

Everything else can wait. Do not send a DPA, a questionnaire or a contract
unless they ask; the terms at `/terms` apply on use and the DPA at `/dpa` is
there when their compliance person wants it.

## 2. Raise the invoice

**UK and US customers: Skydo.** Skydo gives a GBP account in the UK and a USD
account in the US, so the customer pays a domestic transfer with no
international fees, and the money settles in INR.

| Field | Value |
|---|---|
| Customer | Agency legal name, billing email, country |
| Line | `Venditas — Agency plan, unlimited CVs, [month] [year]` or `... annual, [date] to [date]` |
| Amount | £79 / $99 monthly · £790 / $990 annual. Prices live in `lib/pricing.mjs` |
| Due | 7 days |
| Note | "Founding price, held for as long as you keep the subscription. Cancel any time by replying to this email. If it isn't saving your team real hours within a fortnight, say so and this invoice is void." |

**Indian customers: direct bank transfer or UPI** to the founder's own
account, ₹6,500 monthly or ₹65,000 annual. Send a plain PDF invoice with GST
treatment as your accountant advises; Skydo is for foreign receipts only.

## 3. Record it — before doing anything else

Paste into the Supabase SQL editor (requires `sql/003_customers.sql` to have
been run once):

```sql
update leads
   set plan = 'agency', plan_status = 'active', plan_started = now(),
       plan_currency = 'GBP', plan_amount = 79,        -- or 790 / 99 / 990 / 6500 / 65000
       payment_ref = 'skydo INV-0001'
 where email = 'them@theiragency.co.uk';
```

If the email is not in `leads` (they paid without ever running a CV), insert
the row first with `source = 'invoice'`.

For an annual customer, record `plan_amount` as the **monthly equivalent**
(790 ÷ 12 ≈ 65.83) so the `mrr` view stays honest. Put the true invoice
amount in `payment_ref`.

Then `node ops/status.mjs` must show `paying 1`. If it does not, the sale is
not recorded and will be forgotten.

## 4. When it is paid

- Reply: "Received, thank you. You're on the founding price." One line.
- Ask one question: "What does your template do that ours got wrong?" The
  answer is the product roadmap.
- Set a reminder for day 25 to raise next month's invoice. Monthly customers
  are re-invoiced monthly by hand until there are enough of them to justify
  a rail with recurring billing.

## 5. When it is not paid by day 7

One reminder, same thread, no tone. If nothing by day 14, mark
`plan_status = 'past_due'` and stop chasing. They keep the trial.
