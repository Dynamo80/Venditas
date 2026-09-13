import Link from 'next/link';
import { PRO, ANNUAL } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'Quibench alternative for CV formatting and redaction — Venditas',
  description:
    'Quibench stopped operating in August 2026. If your agency used it to format and anonymise CVs, Venditas does the same job: a Word document in your branding, contact details stripped, from £79/month.',
  alternates: { canonical: 'https://www.venditas.in/quibench-alternative' },
};

/**
 * Inbound page, and a narrow one on purpose.
 *
 * Quibench was the closest UK comparable — CV formatting plus redaction, sold
 * to recruitment agencies — and it shut in August 2026. Its customers still
 * have the job to do and are searching for its name. That is the only search
 * term in this market where a page from a new vendor can rank inside a
 * month, because the incumbent left. Everything here is factual; nothing is
 * claimed about Quibench beyond what its own site says.
 */
export default function QuibenchAlternative() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>If you used Quibench, this is the same job.</h1>
        <p className="standfirst">
          Quibench&apos;s site says it is no longer operating under that brand. The work it did for
          your agency — a candidate CV into your template, contact details removed — still needs
          doing. Venditas does it in about ten seconds, and you can run one right now without signing up.
        </p>
      </header>

      <section className="prose">
        <h2>What carries over</h2>
        <ul>
          <li>
            <strong>Your branding.</strong> Logo, colours, footer. The output is a Word
            document your consultants can still edit.
          </li>
          <li>
            <strong>Redaction on by default.</strong> Name, email, phone and LinkedIn are replaced
            with a reference code. Every document is read back after it is built, and if any
            identifier would still be visible the request fails instead of handing you the file.
            Losing a placement to a client who went direct is the expensive failure, so it is the
            one that is not allowed to fail quietly.
          </li>
          <li>
            <strong>Whatever the candidate sent.</strong> Two-column layouts, tables, PDFs, Word
            files, scans.
          </li>
          <li>
            <strong>Nothing embellished.</strong> Bullets are copied verbatim. A tool that quietly
            improves a candidate&apos;s achievements produces a document you cannot send to a client.
          </li>
        </ul>

        <h2>What is different</h2>
        <ul>
          <li>
            <strong>Nothing about a candidate is stored.</strong> The CV is processed in memory and
            discarded when the request ends. There is no candidate database behind the product, which
            makes the data-protection conversation with your clients unusually short. Details on the{' '}
            <Link href="/security">security page</Link>.
          </li>
          <li>
            <strong>One price for the whole agency.</strong> £{PRO.gbp} a month, unlimited CVs, no
            per-seat charge, or £{ANNUAL.gbp} a year. A founding rate for the first {PRO.foundingSeats}{' '}
            agencies, held for as long as you keep it. <Link href="/pricing">Pricing</Link>.
          </li>
          <li>
            <strong>Built and supported by one person.</strong> If the output gets something wrong
            against your branding, you email the person who can fix it, and it is fixed the same day.
          </li>
        </ul>

        <h2>Other options, honestly</h2>
        <p>
          HireAra is the established UK product, now part of The Access Group, from £180 a month plus
          VAT with a cap on candidates per year. If your CRM is Loxo, Recruit CRM, Zoho Recruit or
          Vincere, it already formats CVs into a template natively and you may not need a separate tool
          at all. Bullhorn and Firefish have a basic built-in formatted CV. If you are on JobAdder or
          Mercury, there is nothing built in.
        </p>

        <h2>Try it on a real CV</h2>
        <p>
          Ten CVs free, no card. Upload one on the <Link href="/">home page</Link>, set your logo and
          colour, and compare the output with what your team produces by hand.
        </p>
      </section>
    </div>
  );
}
