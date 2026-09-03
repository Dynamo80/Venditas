# Runbook — closing a sale by hand

Payment is deliberately manual for now. The pricing page's "Get set up" button
opens an email rather than a checkout, and no payment URL is configured.

That is a reasonable choice at zero customers — the first few conversations
teach more than a checkout does, and a founder who speaks to customer number one
learns things a Stripe webhook never reports. It has one cost, and this runbook
exists to cover it: **nothing is captured automatically.** No webhook, no
receipt, no row appearing on its own. If it is not written down, it did not
happen.

## When someone says yes

**1. Send the invoice.**

Skydo for international, Razorpay for INR. £79 for the founding rate, monthly.
Mention that it stays at £79 for as long as they keep it — that is the thing
that makes a founding price worth accepting rather than waiting.

**2. Record it the moment payment lands.** Not later.

```sql
update leads
   set plan = 'agency',
       plan_status = 'active',
       plan_started = now(),
       plan_currency = 'GBP',
       plan_amount = 79,
       payment_ref = 'skydo invoice 0001'
 where email = 'them@theiragency.co.uk';
```

If the address is not in `leads` yet — they may have bought without using the
trial — insert first:

```sql
insert into leads (email, agency, plan, plan_status, plan_started,
                   plan_currency, plan_amount, payment_ref)
values ('them@theiragency.co.uk', 'Their Agency', 'agency', 'active', now(),
        'GBP', 79, 'skydo invoice 0001');
```

**3. Check it registered.**

```bash
node ops/status.mjs
```

`paying` should have gone up and `MRR` should show the total. If it has not, the
sale exists only in your inbox and will be forgotten — that is the entire
failure mode this step guards against.

**4. Mark them so no outreach reaches them again.**

```bash
node outreach/reply.mjs theiragency.co.uk --replied
```

A customer receiving a cold pitch is worse than a stranger receiving one.

## Monthly, until this is automated

Manual billing does not renew itself. Each month:

- Send the next invoice.
- If someone does not pay, set `plan_status = 'past_due'` — do not delete the
  row, because the history matters and a lapsed customer is the warmest lead
  there is.
- Run `node ops/status.mjs` and confirm the figure matches what actually arrived
  in the bank. A number nobody reconciles drifts, and MRR is the one number this
  business is steering by.

## When to stop doing this by hand

Around three or four customers. At that point the monthly invoicing round costs
more attention than setting up a payment link would, and the risk shifts from
"learning too little" to "forgetting to bill someone".

The switch is already built: set `NEXT_PUBLIC_PAY_URL` on Vercel to a Razorpay
or Skydo payment page and redeploy. The pricing page picks it up on its own and
the button becomes a real checkout. Nothing else needs changing.
