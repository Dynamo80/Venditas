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
    'Your logo and colours, or your own Word template',
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
  eur: 80,
  inr: 6500,
  standardGbp: 149,
  standardUsd: 199,
  standardEur: 149,
  standardInr: 12000,
  foundingSeats: 20,
  blurb: 'For a team putting candidates in front of clients every day.',
  features: [
    'Unlimited CVs',
    'Everyone in your agency, no per-seat charge',
    'Branding remembered on your computer — set it once',
    'Drop in a whole shortlist at once',
    'Priority support, answered by the person who built it',
  ],
};

/**
 * Annual: ten months for twelve. Less per month, but a year's commitment and
 * the cash up front, which for a business invoicing by hand is worth more than
 * the two months. Decision 007.
 */
export const ANNUAL = { gbp: 790, usd: 990, eur: 800, inr: 65000, monthsFree: 2 };

/**
 * Charged in the customer's own currency; nobody should do FX in their head.
 *
 * The standard price and the illustrative hourly rate live here too. They used
 * to be written inline on the pricing page — `₹12,000` in a ternary — which is
 * exactly the fifth file this module's header warns about.
 */
const PRICES = {
  uk: { amount: PRO.gbp, annual: ANNUAL.gbp, standard: PRO.standardGbp, symbol: '£', code: 'GBP', hourly: '20' },
  us: { amount: PRO.usd, annual: ANNUAL.usd, standard: PRO.standardUsd, symbol: '$', code: 'USD', hourly: '25' },
  eu: { amount: PRO.eur, annual: ANNUAL.eur, standard: PRO.standardEur, symbol: '€', code: 'EUR', hourly: '23' },
  in: { amount: PRO.inr, annual: ANNUAL.inr, standard: PRO.standardInr, symbol: '₹', code: 'INR', hourly: '600' },
};

export function priceFor(region = 'uk') {
  return PRICES[region] || PRICES.uk;
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
 * Buying without a call (decision 014). The email already asks for what an
 * invoice needs, so the reply to it can be the invoice.
 */
export const INVOICE_URL =
  'mailto:founder@venditas.in' +
  `?subject=${encodeURIComponent('Venditas Agency plan: invoice')}` +
  `&body=${encodeURIComponent(
    'Hi Abin,\n\nPlease invoice us for the Venditas Agency plan.\n\n' +
      'Agency (legal name):\nBilling address:\nMonthly or annual:\nVAT number (if any):\n\nThanks,\n'
  )}`;

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
