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
  // Launch price. The research put £149/$199 at the UK market median, but that
  // sits above the point where "cheaper than upgrading your CRM tier" stops
  // being true — and against offshore human formatting at $1.50–2.50 a CV, the
  // ceiling is lower than it looks. Earn the median later.
  gbp: 79,
  usd: 99,
  inr: 6500,
  blurb: 'For a team putting candidates in front of clients every day.',
  features: [
    'Unlimited CVs',
    'Everyone in your agency, no per-seat charge',
    'Saved branding — set it once',
    'Batch upload, whole shortlists at a time',
    'Priority support, answered by the person who built it',
  ],
};

/** Charged in the customer's own currency; nobody should do FX in their head. */
export function priceFor(region = 'uk') {
  if (region === 'in') return { amount: PRO.inr, symbol: '₹', code: 'INR' };
  if (region === 'us') return { amount: PRO.usd, symbol: '$', code: 'USD' };
  return { amount: PRO.gbp, symbol: '£', code: 'GBP' };
}

export const GUARANTEE =
  "If it isn't saving your team real hours within a fortnight, tell us and we'll refund the month. No form to fill in.";
