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

/** Charged in the customer's own currency; nobody should do FX in their head. */
export function priceFor(region = 'uk') {
  if (region === 'in') return { amount: PRO.inr, symbol: '₹', code: 'INR' };
  if (region === 'us') return { amount: PRO.usd, symbol: '$', code: 'USD' };
  return { amount: PRO.gbp, symbol: '£', code: 'GBP' };
}

export const GUARANTEE =
  "If it isn't saving your team real hours within a fortnight, tell us and we'll refund the month. No form to fill in.";
