import Link from 'next/link';
import { FREE, PRO, priceFor, GUARANTEE, PAY_URL, CONTACT_URL, MEETING_URL } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'Pricing — Venditas',
  description:
    'Ten CVs free to try. £79/month for unlimited, everyone in your agency included, no per-seat charge.',
};

const REGIONS = [
  { key: 'uk', label: 'GBP' },
  { key: 'eu', label: 'EUR' },
  { key: 'us', label: 'USD' },
  { key: 'in', label: 'INR' },
];

export default async function Pricing({ searchParams }) {
  const params = await searchParams;
  const region = REGIONS.some((r) => r.key === params?.c) ? params.c : 'uk';
  const price = priceFor(region);

  return (
    <div className="wrap">
      <header className="masthead">
        <h1>One price. Everyone in the agency.</h1>
        <p className="standfirst">
          No per-seat charge, because charging you more for putting a second recruiter on it
          would be a strange way to sell a tool that saves time.
        </p>
        <div className="currency">
          {REGIONS.map((r) => (
            <Link key={r.key} href={`/pricing?c=${r.key}`} className={r.key === region ? 'on' : ''}>
              {r.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="plans">
        <div className="plan">
          <h2>{FREE.name}</h2>
          <div className="amount">{price.symbol}0</div>
          <div className="per">ten CVs, no card, no clock</div>
          <p className="blurb">{FREE.blurb}</p>
          <ul>
            {FREE.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Link href="/" className="act quiet">
            Format a CV
          </Link>
        </div>

        <div className="plan featured">
          <h2>{PRO.name}</h2>
          <div className="amount">
            {price.symbol}
            {price.amount.toLocaleString()}
          </div>
          <div className="per">per month · {price.code} · cancel any time</div>
          <p className="founding">
            Founding price for the first {PRO.foundingSeats} agencies, and it stays at this rate
            for as long as you keep the subscription. It goes to{' '}
            {price.symbol}{price.standard.toLocaleString('en-GB')} after that.
          </p>
          <p className="blurb">{PRO.blurb}</p>
          <ul>
            {PRO.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="per">
            Or {price.symbol}{price.annual.toLocaleString('en-GB')} a year — two months free.
          </p>
          {PAY_URL ? (
            <>
              <a href={PAY_URL} className="act primary" rel="noopener">
                Start — {price.symbol}{price.amount}/month
              </a>
              <p className="per" style={{ marginTop: 10 }}>
                Card or bank transfer. Cancel any time.
              </p>
            </>
          ) : (
            <>
              <a href={MEETING_URL} className="act primary" target="_blank" rel="noopener noreferrer">
                Book 30 minutes with Abin
              </a>
              {/* Kept inside this branch: it says there is no checkout, and the
                  other branch is a checkout. */}
              <p className="per" style={{ marginTop: 10 }}>
                No checkout, deliberately. We are early enough that every conversation
                teaches us something, so buying starts with half an hour: bring a CV your
                team actually struggles with, and if it holds up we sort out payment on the
                call. Unlimited CVs from that point.
              </p>
            </>
          )}
          <p className="per" style={{ marginTop: 10 }}>
            Rather write first? <a href={CONTACT_URL}>Email Abin</a>.
          </p>
        </div>
      </div>

      <section className="prose" style={{ marginTop: 44 }}>
        <div className="callout">
          <p>
            <strong>{GUARANTEE}</strong>
          </p>
        </div>

        <h2>How to think about the price</h2>
        <p>
          A recruiter on a modest salary costs somewhere around {price.symbol}
          {price.hourly} an hour once you count
          everything. If reformatting CVs takes even two hours a week across your team, this pays
          for itself several times over in the first month — and if it doesn't, the paragraph
          above applies.
        </p>

        <h2>What happens to a placement fee</h2>
        <p>
          The real number isn't the hours. It's the one client who emails a candidate directly
          because their details were still on the CV. Contact details are stripped by default
          here, and every document is checked after it's built — if anything would have leaked,
          you get an error rather than a file.
        </p>

        <h2>Questions people ask before paying</h2>
        <div className="qa">
          <h3>Is there a contract?</h3>
          <p>No. Monthly, cancel whenever. Annual is available if you'd rather pay once.</p>
        </div>
        <div className="qa">
          <h3>What counts as a CV?</h3>
          <p>
            One document formatted. Reformatting the same candidate again after an edit doesn't
            count twice.
          </p>
        </div>
        <div className="qa">
          <h3>Do you store our candidates' data?</h3>
          <p>
            No. The file is processed in memory and discarded — see{' '}
            <Link href="/security">security and data</Link> for exactly what that means.
          </p>
        </div>
        <div className="qa">
          <h3>Can we try it on our own CVs first?</h3>
          <p>
            That's what the free tier is for, and it's the same product — not a crippled version.
          </p>
        </div>
      </section>
    </div>
  );
}
