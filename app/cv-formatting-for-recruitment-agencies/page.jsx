import Link from 'next/link';
import { PRO, FREE } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'CV formatting software for recruitment agencies — Venditas',
  description:
    'Reformat candidate CVs into your agency’s branded Word template with contact details removed. Built for UK recruitment agencies that submit CVs to clients. Ten free, then £79/month for the whole agency.',
};

/**
 * The plain-language page for the plain-language search. The home page is
 * the tool; this one answers the question a recruiter types before they know
 * any product names.
 */
export default function CvFormatting() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>CV formatting for recruitment agencies, without the hour it takes.</h1>
        <p className="standfirst">
          A candidate sends a CV in whatever state they made it. Before it reaches your client,
          someone rebuilds it in your template and takes the contact details off. Venditas does that
          part in seconds, and checks its own work.
        </p>
      </header>

      <section className="prose">
        <h2>Why agencies reformat CVs at all</h2>
        <p>
          Presentation is the visible reason. The commercial reason is that a client who can read a
          candidate&apos;s email address can hire them directly, and the agency loses a placement fee
          worth thousands. Reformatting into your template is how the name, phone number, email and
          LinkedIn come off. That is why Venditas treats redaction as the product and the formatting
          as the wrapper: every document is checked after it is built, and if an identifier would
          still be visible the request fails rather than handing you the file.
        </p>

        <h2>What goes in, what comes out</h2>
        <ul>
          <li>In: a PDF or Word CV. Two columns, tables, sidebars, three date formats, scans.</li>
          <li>
            Out: a Word document in your branding, sections in your order, contact details replaced
            with a reference code. Editable, because your consultants will want to edit it.
          </li>
          <li>
            Not changed: the candidate&apos;s own words. Bullets are copied, not improved. A tool that
            embellishes a CV produces something you cannot send to a client as fact.
          </li>
        </ul>

        <h2>What it costs</h2>
        <p>
          {FREE.total} CVs free to try, no card. Then £{PRO.gbp} a month for the whole agency: unlimited
          CVs, no per-seat charge. It is a founding price for the first {PRO.foundingSeats} agencies and
          stays at that rate for as long as you keep it. <Link href="/pricing">Full pricing</Link>.
        </p>

        <h2>Candidate data</h2>
        <p>
          Nothing about a candidate is stored. The CV is processed in memory and discarded when the
          request finishes. Identifiers are stripped locally before any AI model sees the text. The{' '}
          <Link href="/security">security page</Link> says exactly what that means and what is not in
          place, and the <Link href="/dpa">data processing agreement</Link> is published so your
          compliance person can read it before asking.
        </p>

        <h2>Does your CRM already do this?</h2>
        <p>
          Loxo, Recruit CRM, Zoho Recruit and Vincere ship branded CV formatting natively. If you are
          on one of those, check it before paying for anything. Bullhorn, JobAdder and Mercury do not,
          which is who this is built for.
        </p>

        <h2>Try it</h2>
        <p>
          Upload a CV on the <Link href="/">home page</Link>, set your logo and colour, and compare the
          output against what your team produces by hand. If it isn&apos;t as good, tell the person who
          built it and it gets fixed.
        </p>
      </section>
    </div>
  );
}
