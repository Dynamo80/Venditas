import Formatter from './Formatter';
import { PRO } from '../lib/pricing.mjs';

export const metadata = {
  alternates: { canonical: 'https://www.venditas.in/' },
};

/**
 * What a search engine or an AI answer reads to know this is a product with a
 * price rather than an article. Nothing the page does not already say, and no
 * rating, because there are no reviews yet.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Venditas',
  url: 'https://www.venditas.in/',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    "Reformats candidate CVs into a recruitment agency's branded Word document, with the candidate's name, email, phone and LinkedIn removed.",
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'GBP', description: 'Ten CVs free, no card' },
    { '@type': 'Offer', price: String(PRO.gbp), priceCurrency: 'GBP', description: 'Agency plan: unlimited CVs, whole agency, per month' },
  ],
};

export default function Page() {
  return (
    <div className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <header className="masthead">
        <div className="brand">
          Venditas <span>for recruitment agencies</span>
        </div>
        <h1>Candidate CVs in your branding, with the contact details stripped.</h1>
        <p className="standfirst">
          Drop in whatever mess the candidate sent. Get back a clean Word document in your
          branding, ready to send to a client — with the candidate's name, email, phone and
          LinkedIn removed so nobody goes around you.
        </p>
      </header>

      <Formatter />

      <section className="why">
        <div>
          <h3>Contact details gone by default</h3>
          <p>
            Name, email, phone and LinkedIn are removed and replaced with a reference code. Every
            document is checked after it's built — if anything would have leaked, you get an error
            instead of a file.
          </p>
        </div>
        <div>
          <h3>Nothing gets rewritten</h3>
          <p>
            Your candidate's own wording is preserved exactly. This reformats a CV; it does not
            invent achievements or embellish bullets you'll have to defend to a client.
          </p>
        </div>
        <div>
          <h3>Handles the awful ones</h3>
          <p>
            Two-column layouts, sidebars, tables, inconsistent dates, scans. The formats that break
            everything else are the ones this was built against.
          </p>
        </div>
      </section>

    </div>
  );
}
