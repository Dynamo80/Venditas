/**
 * Pricing, in one place.
 *
 * Referenced by the pricing page, the FAQ, the limit messages and the outreach
 * copy. A price that lives in five files gets changed in four of them, and the
 * fifth is always the one a prospect reads.
 */

export const FREE = {
  name: 'Trial',
  total: 10,
  blurb: 'Ten CVs, no card. Enough to decide whether the output is any good.',
  features: [
    'Ten CVs to try',
    'Your logo, colours and footer',
    'Contact details stripped by default',
    'Word (.docx) output',
  ],
};

export const PRO = {
  name: 'Agency',
  // Founding price, and deliberately temporary.
  //
  // HireAra, the established UK competitor, charges GBP 180/mo + VAT for
  // unlimited users and was acquired by The Access Group. The value case is not
  // the problem: GBP 149/yr-equivalent is about 23% of a single UK placement
  // fee. The problem is that we have no reviews and no track record, and a
  // cluster of micro-competitors at $0.25-0.99 per CV has already anchored the
  // buyer low.
  //
  // So: launch under the leader, say plainly that it is a founding price, and
  // honour it for the people who take a risk on an unknown. Discounting
  // silently and raising it later would be the version that costs trust.
  gbp: 79,
  usd: 99,
  inr: 6500,
  standardGbp: 149,
  standardUsd: 199,
  foundingSeats: 20,
  blurb: 'For a team putting candidates in front of clients every day.',
  features: [
    'Unlimited CVs',
    'Everyone in your agency, no per-seat charge',
    'Saved branding — set it once',
    'Batch upload, whole shortlists at a time',
    'Priority support, answered by the person who built it',
  ],
};

/**
 * Annual: ten months for twelve. Less per month, but a year's commitment and
 * the cash up front, which for a business invoicing by hand is worth more than
 * the two months. Decision 007.
 */
export const ANNUAL = { gbp: 790, usd: 990, inr: 65000, monthsFree: 2 };

/** Charged in the customer's own currency; nobody should do FX in their head. */
export function priceFor(region = 'uk') {
  if (region === 'in') return { amount: PRO.inr, annual: ANNUAL.inr, symbol: '₹', code: 'INR' };
  if (region === 'us') return { amount: PRO.usd, annual: ANNUAL.usd, symbol: '$', code: 'USD' };
  return { amount: PRO.gbp, annual: ANNUAL.gbp, symbol: '£', code: 'GBP' };
}

/**
 * How money is collected: an invoice, sent by a person, paid by bank transfer.
 * UK and US customers pay a local-currency account via Skydo; Indian customers
 * pay an Indian account. No checkout exists and, per decision 007, none is
 * needed for the first twenty. The button on the pricing page opens an email
 * with everything the invoice needs, so a reply is all it takes.
 */
export function invoiceMailto(region = 'uk') {
  const p = priceFor(region);
  const body = [
    'Hi Abin,',
    '',
    'Please invoice us for Venditas.',
    '',
    `Plan: monthly (${p.symbol}${p.amount}/month)  or  annual (${p.symbol}${p.annual}/year, two months free)`,
    'Agency name (as it should appear on the invoice):',
    'Billing email:',
    'Country:',
    '',
    'Anything you need the tool to do first:',
  ].join('\n');
  return `mailto:founder@venditas.in?subject=${encodeURIComponent('Venditas — invoice us')}&body=${encodeURIComponent(body)}`;
}

/**
 * Where "start" on the pricing page sends people.
 *
 * Until a payment page exists (Razorpay or Skydo, the founder's account),
 * this is empty and the button falls back to an email. The moment a URL is
 * set in NEXT_PUBLIC_PAY_URL on Vercel and the site redeploys, a prospect who
 * liked their ten trial CVs at 11pm can pay without waiting for a reply.
 * Every sale that needs a human in the loop is a sale that can be lost to a
 * weekend.
 */
export const PAY_URL = (process.env.NEXT_PUBLIC_PAY_URL || '').trim();
export const CONTACT_URL = 'mailto:founder@venditas.in?subject=Venditas%20Agency%20plan';

/**
 * Thirty minutes with the founder: a demo, a billing question, or a compliance
 * team wanting to talk to a human before they sign anything.
 *
 * Deliberately the bare booking URL. The link as first shared carried
 * `?month=2026-09&date=2026-09-09`, which is Calendly's deep link to one
 * particular day — fine when you paste it into a message that week, wrong on a
 * page that outlives the week, where it opens a calendar pinned to a date in
 * the past. Without the query string Calendly opens on the next day with real
 * availability.
 *
 * Money still moves by invoice (decision 007). This is for the conversation
 * before the invoice, not a replacement for it.
 */
export const MEETING_URL = 'https://calendly.com/aventis61/30min';

export const GUARANTEE =
  "If it isn't saving your team real hours within a fortnight, tell us and we'll refund the month. No form to fill in.";
