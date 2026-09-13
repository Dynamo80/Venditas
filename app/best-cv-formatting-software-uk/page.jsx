import Link from 'next/link';
import { PRO } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'CV formatting software for UK recruitment agencies (2026), compared — Venditas',
  description:
    'Nine CV formatting tools for recruitment agencies compared: published prices, how each one charges, anonymisation, CRM integrations and output format. How to choose, and an FAQ. Last updated 13 September 2026.',
  alternates: { canonical: 'https://www.venditas.in/best-cv-formatting-software-uk' },
};

/**
 * Comparison page for the commercial search.
 *
 * Research (growth-2026-09 §6): searches like "best CV formatting software UK"
 * are won by vendor-written comparisons with a table, an FAQ and a visible
 * "last updated" date, and AI answer engines repeat those pages. Venditas was
 * on none of them.
 *
 * The rules for keeping it: every competitor fact is one checked on that
 * vendor's own pages on the date shown; a dash means "not verified", never
 * "no"; Venditas is labelled as ours; nothing is said about a competitor's
 * quality. Fee protection is the argument in "how to choose", not the keyword.
 */

const UPDATED = '13 September 2026';

const VENDORS = [
  {
    name: 'Allsorter',
    price: 'Quote only',
    unit: '—',
    anon: '—',
    crm: 'Bullhorn Marketplace; JobAdder partner',
    output: '—',
  },
  {
    name: 'Candidately',
    price: '$1.00 per exported resume',
    unit: 'Per export; unlimited users; Client Portal separate',
    anon: '—',
    crm: 'Bullhorn',
    output: '—',
  },
  {
    name: 'CVFormatter',
    price: '$79/month for 100 CVs; $299/month for 500',
    unit: 'CV allowance per plan',
    anon: 'On all tiers',
    crm: 'JobAdder',
    output: 'Word, PDF, weblink',
  },
  {
    name: 'Daxtra Styler',
    price: 'Quote only',
    unit: '—',
    anon: 'Redacts contact details',
    crm: '—',
    output: '—',
  },
  {
    name: 'FormaCV',
    price: '$0.99 per CV',
    unit: 'Per CV; no seats',
    anon: 'Yes',
    crm: '—',
    output: 'DOCX, PDF',
  },
  {
    name: 'Formatix.AI',
    price: '£20 / £50 / £100 / £200 per month',
    unit: '20 / 55 / 120 / 260 credits; credits do not expire',
    anon: '—',
    crm: '—',
    output: '—',
  },
  {
    name: 'HireAra',
    price: '£180 / £450 / £950 per month + VAT',
    unit: '1,500 / 5,000 / 12,000 candidates per year; unlimited users',
    anon: 'Access Group product page: “Anonymise CVs for compliant submissions”',
    crm: 'Eight, including Bullhorn, Vincere, Mercury, Salesforce, Access Recruitment CRM',
    output: '—',
  },
  {
    name: 'RapidRecruit',
    price: '£299 / £499 / £999 + VAT',
    unit: '150 / 300 / 1,000 credits; extra credits £2',
    anon: 'Not mentioned on its pricing page',
    crm: '—',
    output: '—',
  },
  {
    name: 'Venditas (our product)',
    price: `£${PRO.gbp}/month founding price (first ${PRO.foundingSeats} agencies); £${PRO.standardGbp}/month standard`,
    unit: 'Per agency; unlimited CVs; no per-seat charge',
    anon: 'Name, email, phone, LinkedIn removed by default; every document checked, fails if one is left in',
    crm: 'None yet',
    output: 'Word (.docx)',
  },
];

const FAQ = [
  {
    q: 'What is CV formatting software for recruitment agencies?',
    a: "It takes a candidate's CV in whatever layout they sent and rebuilds it in the agency's house style — logo, colours, consistent headings — usually with the candidate's contact details removed so it can go to a client. The tools on this page all do a version of that. They differ mainly in how they charge, which CRMs they connect to and what file they give back.",
  },
  {
    q: 'Why do recruitment agencies remove contact details from CVs before sending them to clients?',
    a: "Mostly to protect the fee. A client who can see a candidate's email address or phone number can contact them directly and hire them without the agency, and the placement fee is lost. Removing the name, email, phone and LinkedIn, and referring to the candidate by a reference code, keeps the introduction going through the agency.",
  },
  {
    q: 'What is the difference between an anonymised CV and a blind CV?',
    a: "The document looks much the same: identifying details removed, experience left in. A blind CV is usually about reducing bias in who gets shortlisted. An agency's anonymised CV is usually about stopping the client from going around the agency. Whichever reason applies, the things to check are which details a tool removes and whether the finished document is checked.",
  },
  {
    q: 'How much does CV formatting software cost in the UK?',
    a: `As published on ${UPDATED}: per-CV pricing from $0.99 per CV (FormaCV) and $1.00 per exported resume (Candidately); plans from £20 a month for 20 credits (Formatix.AI) and $79 a month for 100 CVs (CVFormatter); HireAra from £180 a month plus VAT; RapidRecruit from £299 plus VAT for 150 credits. Allsorter and Daxtra Styler quote on request. Venditas, our own product, is £${PRO.gbp} a month at the founding price for the first ${PRO.foundingSeats} agencies and £${PRO.standardGbp} a month standard, with unlimited CVs.`,
  },
  {
    q: 'Which CV formatting tools integrate with Bullhorn?',
    a: 'Of the tools on this page: HireAra lists Bullhorn among its eight CRM integrations, Candidately lists a Bullhorn integration, and Allsorter is on the Bullhorn Marketplace. Venditas has no CRM integration yet.',
  },
  {
    q: 'Which CV formatting tools work with JobAdder?',
    a: 'CVFormatter lists a JobAdder integration and Allsorter is a JobAdder partner. Venditas has no CRM integration yet; its output is a Word file you attach or upload yourself.',
  },
  {
    q: 'Which tools produce a PDF as well as a Word document?',
    a: 'CVFormatter offers Word, PDF and a weblink, and FormaCV offers DOCX and PDF. Venditas produces Word (.docx) only, so consultants can edit the document before it goes out. For the other tools we have not verified the output formats, so ask the vendor.',
  },
  {
    q: 'Can I try CV formatting software for free?',
    a: 'Some tools have a free start. Venditas gives ten CVs free with no card, and Formatix.AI gives 10 free credits. Running your own real CVs through a trial tells you more than any comparison page, this one included.',
  },
  {
    q: 'Do these tools charge per user?',
    a: 'Of those that publish it, none charges per seat: HireAra and Candidately include unlimited users, FormaCV charges per CV with no seats, and Venditas charges per agency with no per-seat charge. For the others, check the vendor.',
  },
  {
    q: 'Can AI CV formatting change what the candidate wrote?',
    a: "It can. Any tool that rewrites or summarises a CV can change what the candidate actually said, and it is the agency that sends that document to a client. When you trial a tool, put the original next to the output and read both. Venditas copies the candidate's wording and does not rewrite it.",
  },
  {
    q: 'Is it safe under UK GDPR to upload candidate CVs to a formatting tool?',
    a: 'It can be, with the right paperwork. Your agency is the controller and the tool is the processor, so ask each vendor for a data processing agreement and for how long CVs are kept. Venditas processes CVs in memory and does not store them, and publishes its data processing agreement on its site.',
  },
  {
    q: 'How was this comparison put together?',
    a: `Prices, pricing units and features come from each vendor's own pricing or product pages, checked on ${UPDATED}. A dash in the table means we did not verify it, not that the tool lacks it. Venditas publishes this page and Venditas is one of the products in it. If anything here is wrong or out of date, email founder@venditas.in and it will be corrected.`,
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

export default function BestCvFormattingSoftwareUk() {
  return (
    <div className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <header className="masthead">
        <p className="lbl">
          <time dateTime="2026-09-13">Last updated {UPDATED}</time>
        </p>
        <h1>CV formatting software for UK recruitment agencies (2026)</h1>
        <p className="standfirst">
          Nine tools that turn a candidate&apos;s CV into an agency-branded document: what each one
          publishes as its price, how it charges, whether it anonymises, which CRMs it connects to
          and what file you get back.
        </p>
      </header>

      <section className="prose">
        <div className="callout">
          <p>
            <strong>Who wrote this.</strong> This page is published by Venditas, and Venditas is one
            of the nine products in it, labelled as ours. Every competitor detail comes from that
            vendor&apos;s own pages, checked on {UPDATED}, and nothing else is claimed about them.
          </p>
        </div>

        <h2>The comparison</h2>
        <p>Alphabetical. A dash means we did not verify it, not that the tool lacks it.</p>
        <div className="legal">
          <table style={TABLE}>
            <thead>
              <tr>
                <th>Tool</th>
                <th>Price</th>
                <th>Pricing unit</th>
                <th>Anonymisation</th>
                <th>CRM integrations</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {VENDORS.map((v) => (
                <tr key={v.name}>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.price}</td>
                  <td>{v.unit}</td>
                  <td>{v.anon}</td>
                  <td>{v.crm}</td>
                  <td>{v.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Prices are shown in the currency each vendor uses, with &ldquo;+ VAT&rdquo; where the
          vendor states it. They change, so check the vendor&apos;s page before you buy.
        </p>

        <h2>Each tool, briefly</h2>

        <h3>Allsorter</h3>
        <p>
          Quote only; its site cites &ldquo;400+ organisations&rdquo;. It is on the Bullhorn Marketplace and is
          a JobAdder partner, so it is worth a conversation if your team works in either CRM and you
          are happy to talk to sales for a price.{' '}
          <a href="https://www.allsorter.com/pricing">Allsorter pricing</a>.
        </p>

        <h3>Candidately</h3>
        <p>
          $1.00 per exported resume with unlimited users, and a Bullhorn integration. Its Client
          Portal is listed separately. Paying per export suits an agency whose volume varies month to
          month. <a href="https://www.candidately.com/pricing">Candidately pricing</a>.
        </p>

        <h3>CVFormatter</h3>
        <p>
          $79 a month for 100 CVs or $299 a month for 500, with anonymisation on all tiers and a
          JobAdder integration. Output can be Word, PDF or a weblink.{' '}
          <a href="https://www.cvformatter.co/pricing">CVFormatter pricing</a>.
        </p>

        <h3>Daxtra Styler</h3>
        <p>
          Quote only. Daxtra&apos;s product page says Styler redacts contact details and applies
          branding.{' '}
          <a href="https://www.daxtra.com/products/resume-formatting-anonymizing-software/">
            Daxtra Styler
          </a>
          .
        </p>

        <h3>FormaCV</h3>
        <p>
          $0.99 per CV with no seats, anonymisation, and DOCX or PDF output. Per-CV pricing keeps the
          cost in step with the work.{' '}
          <a href="https://formacv.ai/pricing">FormaCV pricing</a>.
        </p>

        <h3>Formatix.AI</h3>
        <p>
          £20, £50, £100 or £200 a month for 20, 55, 120 or 260 credits, and the credits do not
          expire. 10 free credits to start.{' '}
          <a href="https://formatix.ai/pricing">Formatix.AI pricing</a>.
        </p>

        <h3>HireAra</h3>
        <p>
          The established UK product, part of The Access Group since October 2024. £180, £450 or £950
          a month plus VAT, capped at 1,500, 5,000 or 12,000 candidates a year, with unlimited users
          and eight CRM integrations including Bullhorn, Vincere, Mercury, Salesforce and Access
          Recruitment CRM. The Access product page says &ldquo;Anonymise CVs for compliant
          submissions&rdquo;. Sold demo-first. It lists the most CRM integrations of the tools on this
          page. <a href="https://www.hireara.ai/pricing">HireAra pricing</a>; our longer{' '}
          <Link href="/hireara-alternative">HireAra comparison</Link>.
        </p>

        <h3>RapidRecruit</h3>
        <p>
          £299, £499 or £999 plus VAT for 150, 300 or 1,000 credits, with extra credits at £2.
          Anonymisation is not mentioned on its pricing page, so ask if you need it.{' '}
          <a href="https://rapidrecruit.ai/pricing">RapidRecruit pricing</a>.
        </p>

        <h3>Venditas (our product)</h3>
        <p>
          £{PRO.gbp} a month at the founding price for the first {PRO.foundingSeats} agencies, then
          £{PRO.standardGbp}; the whole agency, unlimited CVs, no per-seat charge, no contract. Ten
          CVs free with no card. Output is a Word (.docx) file in your branding — logo, colour,
          footer. The candidate&apos;s name, email, phone and LinkedIn are removed by default and
          replaced with a reference code; every document is checked after it is built, and the
          request fails rather than return a file with a contact detail left in. The
          candidate&apos;s wording is kept as written, and CVs are processed in memory, not stored.
          There is no CRM integration yet, and it is run by one founder working from Navi Mumbai,
          India. <Link href="/pricing">Pricing</Link>.
        </p>

        <h2>How to choose</h2>

        <h3>How many CVs you send to clients a month</h3>
        <p>
          Count a normal month, not a busy one. If it is a handful a week, per-CV pricing or credits
          that do not expire usually cost least. If it is dozens a week, a plan without a cap stops
          anyone counting. Where there is a cap, turn it into a monthly number: 1,500 candidates a
          year is about 125 a month, and CVFormatter&apos;s $79 plan is 100 CVs.
        </p>

        <h3>Whether it has to connect to your CRM</h3>
        <p>
          If consultants need formatted CVs to land in the CRM without downloading and re-uploading,
          only a tool with that integration will do. On this page: HireAra (eight CRMs including
          Bullhorn, Vincere, Mercury, Salesforce and Access Recruitment CRM), Candidately (Bullhorn),
          CVFormatter (JobAdder) and Allsorter (Bullhorn Marketplace, JobAdder partner). Venditas has
          none yet.
        </p>

        <h3>Whether you need the redaction checked</h3>
        <p>
          A client who can read a candidate&apos;s email or phone number can hire them directly, and
          the placement fee goes with it. So the question to ask every vendor, us included, is what
          happens when anonymisation misses something — a phone number in a footer, an email in a
          text box. Does the tool tell you, or hand you the file? Venditas checks the finished
          document and fails the request rather than return one with a contact detail left in.{' '}
          <Link href="/candidate-cv-anonymisation-fee-protection">
            Why agencies anonymise CVs
          </Link>
          .
        </p>

        <h3>Word or PDF</h3>
        <p>
          Word if consultants edit the CV before it goes out, PDF if you want it fixed exactly as
          formatted. CVFormatter (Word, PDF, weblink) and FormaCV (DOCX, PDF) offer both. Venditas
          gives Word (.docx) only.
        </p>

        <h3>Whether it keeps the candidate&apos;s words</h3>
        <p>
          Tools that rewrite or summarise a CV can change what the candidate said. Run the same real
          CV through each trial and read the output against the original, line by line.
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
            <Link href="/hireara-alternative">HireAra alternative</Link> — where HireAra is the better
            choice and where Venditas is.
          </li>
          <li>
            <Link href="/anonymise-cv-tool">Anonymise a CV</Link> — the free tool.
          </li>
          <li>
            <Link href="/gdpr-cv-redaction-recruitment-agencies">
              GDPR-compliant CV handling for recruitment agencies
            </Link>{' '}
            — the data-protection side.
          </li>
          <li>
            <Link href="/quibench-alternative">If you used Quibench</Link> — it stopped operating in
            August 2026.
          </li>
        </ul>

        <div className="callout">
          <p>
            Try Venditas on ten real CVs, free and with no card, on the{' '}
            <Link href="/">home page</Link>. Compare the output with what your team sends today.
          </p>
        </div>
      </section>
    </div>
  );
}
