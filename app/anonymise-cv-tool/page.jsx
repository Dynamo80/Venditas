import Link from 'next/link';
import Formatter from '../Formatter';

export const metadata = {
  title: 'Free CV anonymiser for recruiters — Venditas',
  description:
    "Remove a candidate's name, email, phone and LinkedIn from a CV before it goes to a client. Ten CVs free, no card. The finished document is checked for leaks before you get it.",
  alternates: { canonical: 'https://www.venditas.in/anonymise-cv-tool' },
};

export default function AnonymiseCvTool() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>Free CV anonymiser for recruiters</h1>
        <p className="standfirst">
          Take the candidate&apos;s name, email, phone number and LinkedIn off a CV before it goes
          to a client, so the client has no easy way to reach them except through you. Ten CVs
          free, no card.
        </p>
      </header>

      <Formatter variant="anonymise" />

      <section className="prose" style={{ marginTop: 44 }}>
        <h2>What comes out</h2>
        <p>
          The candidate&apos;s name, email address, phone number and LinkedIn are removed. The name
          is replaced with a reference code, so you and your client can still talk about the same
          person without either of you writing their name down.
        </p>

        <h2>Checked, not assumed</h2>
        <p>
          Contact details hide in awkward places: the Word header, a text box, a second column.
          So the finished document is read back after it is built, and if any of those details
          would still be visible, you get an error instead of a file. A tool that quietly leaks a
          mobile number is worse than no tool, because you find out when the client has already
          called.
        </p>

        <h2>What stays, and why</h2>
        <p>
          Employers, job titles, dates, qualifications and the candidate&apos;s own wording all
          stay, because a client needs them to judge the candidate. Nothing is rewritten or
          summarised. That also means a determined client could still search for someone from
          their history: anonymising removes the easy route to the candidate, not every route.
        </p>

        <div className="callout">
          <p>
            <strong>
              Agencies don&apos;t anonymise CVs for tidiness. They do it because a client with the
              candidate&apos;s number doesn&apos;t need the agency for the second conversation.
            </strong>
          </p>
        </div>

        <h2>Questions</h2>
        <div className="qa">
          <h3>Is it really free?</h3>
          <p>
            Ten CVs are free with a work email and no card. After that it is{' '}
            <Link href="/pricing">£79 a month for the whole agency</Link>, unlimited CVs.
          </p>
        </div>
        <div className="qa">
          <h3>Do you keep the CV?</h3>
          <p>
            No. It is processed in memory and discarded. See{' '}
            <Link href="/security">security and data</Link> for exactly what happens to it, and{' '}
            <Link href="/privacy">the privacy policy</Link> for who else is involved.
          </p>
        </div>
        <div className="qa">
          <h3>Can it carry our agency&apos;s branding at the same time?</h3>
          <p>
            Yes. Open &ldquo;Add your agency&apos;s branding too&rdquo; above and add your
            name, colour and logo. You get back a Word document in your branding with the contact
            details already gone, and the browser can remember your branding for next time.
          </p>
        </div>
        <div className="qa">
          <h3>Can I do a whole shortlist?</h3>
          <p>Yes. Drop up to twenty CVs at once. Each one counts as one of the ten free CVs.</p>
        </div>
        <div className="qa">
          <h3>What files work?</h3>
          <p>
            PDF and Word (.docx), up to 10MB, including two-column layouts and tables. Older .doc
            files need saving as .docx first.
          </p>
        </div>
      </section>
    </div>
  );
}
