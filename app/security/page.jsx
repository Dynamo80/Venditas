import Link from 'next/link';

export const metadata = {
  title: 'Security & data — Venditas',
  description:
    'What happens to a CV you upload, what we store, who else touches it, and what we do not keep.',
};

/**
 * The page that closes the sale.
 *
 * A recruitment agency is about to send us other people's personal data. Before
 * price or features, they need to know what happens to it. Vague reassurance
 * reads as evasion to anyone who has been through a data audit, so this page is
 * specific to the point of being boring — including about the parts that are
 * genuinely limitations.
 */
export default function Security() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>What happens to a CV you upload.</h1>
        <p className="standfirst">
          You're handing us someone else's personal data. Here is precisely what we do with it,
          including the parts that aren't flattering.
        </p>
      </header>

      <section className="prose">
        <div className="callout">
          <p>
            <strong>Candidate data is never stored.</strong> The file is read in memory, turned
            into a document, and returned in the same request. When that request ends, it is gone.
            There is no bucket, no queue, and no backup containing anyone's CV.
          </p>
        </div>

        <h2>Step by step</h2>
        <ol>
          <li>You upload a CV. It travels over TLS and is held in memory only.</li>
          <li>
            Text is extracted from the file locally — no third party is involved in reading the
            document itself.
          </li>
          <li>
            That text is sent to <strong>Google's Gemini API</strong> to be turned into structured
            fields. This is the one point where a third party sees the content, and it is named
            here rather than buried in a sub-processor list.
          </li>
          <li>A Word document is built from those fields and returned to your browser.</li>
          <li>Everything from steps 1 to 4 is discarded when the request finishes.</li>
        </ol>

        <h2>What we do keep</h2>
        <p>Only what's needed to run the business, and none of it is about a candidate:</p>
        <ul>
          <li>
            <strong>Your email address and agency name</strong>, so we know who is using it and can
            reach you.
          </li>
          <li>
            <strong>A count of how many CVs you've run</strong>, for the daily limit and billing.
          </li>
          <li>
            <strong>A salted hash of your IP address</strong> for rate limiting. Not the address
            itself — we need to count requests, not identify people, and a hash without a salt can
            be reversed by brute force.
          </li>
        </ul>

        <h2>Redaction, and why we verify it</h2>
        <p>
          Contact details are removed by default: name, email, phone and personal links, replaced
          with a reference code. Location survives, because it's useful to a client and doesn't
          identify anyone.
        </p>
        <p>
          The part worth knowing: after the document is built, it is{' '}
          <strong>read back and checked</strong> for those details. If any would still be visible,
          the request fails and you get an error instead of a file. Returning nothing is better
          than returning a CV that costs you a placement.
        </p>

        <h2>Where things run</h2>
        <ul>
          <li>Application and processing: Vercel, in the United States.</li>
          <li>Account and usage records: Supabase, on AWS.</li>
          <li>Field extraction: Google Gemini API.</li>
          <li>The business is operated from India.</li>
        </ul>
        <p>
          If you need this in a signed agreement, the{' '}
          <Link href="/dpa">data processing agreement</Link> covers it.
        </p>

        <h2>What we don't do</h2>
        <ul>
          <li>No training on your data. Nothing you upload is used to improve any model.</li>
          <li>No selling or sharing of your details with anyone.</li>
          <li>No candidate database being quietly accumulated behind the product.</li>
        </ul>

        <h2>Honest limitations</h2>
        <p>
          Stated here rather than discovered later, because you'll find them anyway and it's better
          you hear them from us:
        </p>
        <ul>
          <li>
            <strong>This is a young product run by one person.</strong> It has not been through a
            SOC 2 audit or a penetration test. If your procurement requires either, we're not there
            yet — say so and we'll tell you honestly where we are.
          </li>
          <li>
            <strong>Output is machine-generated and should be read before it goes to a client.</strong>{' '}
            Extraction is deliberately conservative and copies the candidate's own wording rather
            than rewriting it, but no automated process is perfect.
          </li>
          <li>
            <strong>Sub-processors are third parties.</strong> Google and Supabase have their own
            terms and their own track records, and we depend on both.
          </li>
        </ul>

        <h2>Reporting something</h2>
        <p>
          If you find a security problem, email{' '}
          <a href="mailto:founder@venditas.in">founder@venditas.in</a>. It reaches the person who
          wrote the code, not a queue, and you'll get a reply the same day.
        </p>
      </section>
    </div>
  );
}
