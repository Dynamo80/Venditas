import Link from 'next/link';
import { PRO } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'HireAra alternative for CV formatting and redaction — Venditas',
  description: `Comparing HireAra? Venditas turns candidate CVs into Word documents in your agency's branding, with contact details removed and checked. Unlimited CVs from £${PRO.gbp}/month, ten free with no demo. Where each one is the better choice.`,
  alternates: { canonical: 'https://www.venditas.in/hireara-alternative' },
};

/**
 * Inbound page for "HireAra alternative".
 *
 * Research (growth-2026-09 §6) found no vendor owns this search; directories
 * rank for it. The person searching is already paying for, or evaluating, the
 * established UK product, so the page has to be fair to be believed: it says
 * plainly where HireAra is the better buy (CRM integrations, a large vendor,
 * bigger plans) before it says where Venditas is.
 *
 * Every HireAra fact on this page was checked on its own pages on 13 September
 * 2026 and nothing else is claimed. If a fact here goes stale, change the date
 * with it.
 */

const FAQ = [
  {
    q: 'Is Venditas a direct replacement for HireAra?',
    a: "For the core job — a candidate's CV in your agency's branding with the contact details removed — yes. It is not a replacement if you rely on HireAra's CRM integrations. Venditas has no CRM integration yet, so the finished Word file is downloaded and attached or uploaded by hand.",
  },
  {
    q: 'How much does HireAra cost compared with Venditas?',
    a: `HireAra lists £180, £450 and £950 a month plus VAT, capped at 1,500, 5,000 and 12,000 candidates a year respectively, with unlimited users. Venditas is £${PRO.gbp} a month at the founding price for the first ${PRO.foundingSeats} agencies and £${PRO.standardGbp} a month standard, for the whole agency, with unlimited CVs.`,
  },
  {
    q: 'Does HireAra anonymise CVs?',
    a: "The Access Group's HireAra product page says \"Anonymise CVs for compliant submissions\". For how that works in detail, ask HireAra. Venditas removes the candidate's name, email, phone and LinkedIn by default, replaces them with a reference code, and checks every finished document; if a contact detail would still be visible, the request fails instead of returning the file.",
  },
  {
    q: 'Does Venditas integrate with Bullhorn, Vincere or Mercury?',
    a: 'No. Venditas has no CRM integration yet. HireAra lists eight, including Bullhorn, Vincere, Mercury, Salesforce and Access Recruitment CRM. If formatted CVs need to land in your CRM without anyone downloading a file, HireAra is the better fit today.',
  },
  {
    q: 'Is there a limit on how many CVs we can format?',
    a: "Not on Venditas: the Agency plan is unlimited. HireAra's plans are capped by candidates per year — 1,500, 5,000 or 12,000 depending on the plan.",
  },
  {
    q: 'Do we need a demo before we can try Venditas?',
    a: 'No. Ten CVs are free, with no card and no call. Upload a real CV on the home page, set your logo and colour, and judge the output yourself. HireAra is sold demo-first.',
  },
  {
    q: "Will it change what the candidate wrote?",
    a: "No. Venditas copies the candidate's own wording into the document and does not rewrite, summarise or improve it. Any tool that rewrites or summarises a CV can change what the candidate said, and it is the agency that puts that document in front of a client.",
  },
  {
    q: 'Do you store our candidates’ CVs?',
    a: 'No. Each CV is processed in memory and discarded when the request finishes. There is no candidate database behind the product.',
  },
  {
    q: 'Who is behind Venditas?',
    a: 'One person, working from Navi Mumbai, India. Emails are answered by the person who wrote the code, which means real answers and no support queue — and also nobody to escalate to. HireAra has been part of The Access Group since October 2024. Weigh both.',
  },
  {
    q: 'Is there a contract?',
    a: 'No. Venditas is monthly and you can cancel whenever you like.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

// No table style exists outside `.legal`; this only lets cells wrap.
const TABLE = { whiteSpace: 'normal' };

export default function HireAraAlternative() {
  return (
    <div className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <header className="masthead">
        <p className="lbl">
          <time dateTime="2026-09-13">Last updated 13 September 2026</time>
        </p>
        <h1>A HireAra alternative for agencies that want unlimited CVs at a flat price.</h1>
        <p className="standfirst">
          HireAra is the established UK tool for putting candidate CVs into an agency template, and
          for some agencies it is the right one. This page sets out, from each product&apos;s own
          published details, where HireAra is the better choice and where Venditas is. It is written
          by Venditas, so weigh it accordingly.
        </p>
      </header>

      <section className="prose">
        <h2>Side by side</h2>
        <div className="legal">
          <table style={TABLE}>
            <thead>
              <tr>
                <th></th>
                <th>HireAra</th>
                <th>Venditas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Price</strong></td>
                <td>£180, £450 or £950 per month + VAT</td>
                <td>
                  £{PRO.gbp}/month founding price for the first {PRO.foundingSeats} agencies;
                  £{PRO.standardGbp}/month standard
                </td>
              </tr>
              <tr>
                <td><strong>Volume</strong></td>
                <td>1,500, 5,000 or 12,000 candidates per year, by plan</td>
                <td>Unlimited CVs</td>
              </tr>
              <tr>
                <td><strong>Users</strong></td>
                <td>Unlimited</td>
                <td>Whole agency, no per-seat charge</td>
              </tr>
              <tr>
                <td><strong>CRM integrations</strong></td>
                <td>Eight, including Bullhorn, Vincere, Mercury, Salesforce and Access Recruitment CRM</td>
                <td>None yet</td>
              </tr>
              <tr>
                <td><strong>Anonymisation</strong></td>
                <td>
                  Access Group product page: &ldquo;Anonymise CVs for compliant submissions&rdquo;
                </td>
                <td>
                  Name, email, phone and LinkedIn removed by default; every document checked, and
                  the request fails if a contact detail is left in
                </td>
              </tr>
              <tr>
                <td><strong>How you start</strong></td>
                <td>Demo first</td>
                <td>Ten CVs free, no card, no call</td>
              </tr>
              <tr>
                <td><strong>Who runs it</strong></td>
                <td>Part of The Access Group since October 2024</td>
                <td>One founder, working from Navi Mumbai, India</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          HireAra details are from its <a href="https://www.hireara.ai/pricing">pricing page</a>,
          its <a href="https://www.hireara.ai/about-hireara">about page</a> and{' '}
          <a href="https://www.theaccessgroup.com/en-gb/products/hireara/">
            The Access Group&apos;s product page
          </a>
          , checked on 13 September 2026. Prices change, so check them before you buy.
        </p>

        <h2>Where HireAra is the better choice</h2>
        <ul>
          <li>
            <strong>Your CRM is the centre of the workflow.</strong> HireAra lists eight CRM
            integrations, including Bullhorn, Vincere, Mercury, Salesforce and Access Recruitment
            CRM. Venditas has no CRM integration yet: you download a Word file and attach or upload
            it yourself. If consultants would otherwise do that dozens of times a day, the
            integration is worth paying for.
          </li>
          <li>
            <strong>You want an established vendor.</strong> HireAra has been part of The Access
            Group since October 2024, and it is sold with a demo first, which suits a buying process
            that expects one. If your procurement process favours a large supplier, that counts, and
            a one-person business will not pass that test.
          </li>
          <li>
            <strong>You want a larger plan from one supplier.</strong> HireAra&apos;s plans run up
            to 12,000 candidates a year with unlimited users, at £950 a month plus VAT on the top
            plan.
          </li>
        </ul>

        <h2>Where Venditas is the better choice</h2>
        <ul>
          <li>
            <strong>Price.</strong> £{PRO.gbp} a month at the founding price for the first{' '}
            {PRO.foundingSeats} agencies, £{PRO.standardGbp} standard, against HireAra&apos;s
            entry plan at £180 a month plus VAT. <Link href="/pricing">Pricing</Link>.
          </li>
          <li>
            <strong>Unlimited CVs.</strong> No annual cap to keep an eye on. HireAra&apos;s entry
            plan covers 1,500 candidates a year, which is about 125 a month.
          </li>
          <li>
            <strong>Your branding, in Word.</strong> Your logo, colour and footer on a clean,
            consistent layout, in a .docx your consultants can still edit before it goes out. It
            does not load an existing Word template.
          </li>
          <li>
            <strong>Redaction that is checked, not assumed.</strong> The candidate&apos;s name,
            email, phone and LinkedIn are removed by default and replaced with a reference code.
            Every document is checked after it is built, and if a contact detail would still be
            visible the request fails rather than handing you the file.{' '}
            <Link href="/security">How that works</Link>.
          </li>
          <li>
            <strong>The candidate&apos;s words, unchanged.</strong> Tools that rewrite or summarise
            a CV can change what the candidate said. Venditas copies the wording and rewrites
            nothing, so what reaches your client is what the candidate wrote.
          </li>
          <li>
            <strong>No demo needed.</strong> Ten CVs free, no card, no call. You can judge the
            output before you speak to anyone.
          </li>
          <li>
            <strong>Nothing stored, no contract.</strong> CVs are processed in memory and
            discarded. The plan is monthly and you can cancel whenever you like.
          </li>
        </ul>

        <h2>Why the redaction is the part that matters</h2>
        <p>
          Agencies reformat CVs so they look like the agency&apos;s, but the commercial reason is
          that a client who can see a candidate&apos;s email or phone number can hire them directly,
          and the agency loses a placement fee worth thousands. That is why Venditas treats a
          contact detail left in the document as a failure, not a warning. More on{' '}
          <Link href="/candidate-cv-anonymisation-fee-protection">
            why agencies anonymise candidate CVs
          </Link>
          .
        </p>

        <h2>If you are thinking of switching</h2>
        <p>
          Take ten CVs your team has already formatted for clients — pick the messy ones, with two
          columns, tables or scans — run them through Venditas on the <Link href="/">home page</Link>,
          and compare the output with what you actually sent. If a CRM integration is what you would
          miss, those ten will also tell you whether downloading a Word file is something your team
          will put up with.
        </p>

        <h2>Questions</h2>
        {FAQ.map(({ q, a }) => (
          <div className="qa" key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}

        <h2>Read next</h2>
        <ul>
          <li>
            <Link href="/best-cv-formatting-software-uk">
              CV formatting software for UK recruitment agencies, compared
            </Link>{' '}
            — nine tools, with prices and how each one charges.
          </li>
          <li>
            <Link href="/pricing">Pricing</Link> — the founding price and what it includes.
          </li>
          <li>
            <Link href="/security">Security &amp; data</Link> — what happens to a CV you upload.
          </li>
        </ul>
      </section>
    </div>
  );
}
