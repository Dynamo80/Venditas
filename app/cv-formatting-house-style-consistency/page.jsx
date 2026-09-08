import Link from 'next/link';

export const metadata = {
  title: 'CV formatting and house-style consistency across a recruitment team — Venditas',
  description:
    'Why shortlists look inconsistent, what good house-style consistency looks like for a UK recruitment agency, and how a single template plus a single workflow keeps every CV in a shortlist looking like it came from the same team.',
  alternates: { canonical: 'https://venditas.in/cv-formatting-house-style-consistency' },
};

/**
 * Targets "consistent CV formatting recruitment agency" — a workflow question
 * that has nothing to do with the AI debate and everything to do with how a
 * shortlist lands in front of a client. Honest about what is and is not a
 * template problem.
 */
export default function HouseStyleConsistency() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>CV formatting and house-style consistency across a recruitment team</h1>
        <p className="standfirst">
          Why shortlists from the same agency look different depending on which
          consultant touched them, what consistent house style actually means, and the
          small changes that bring twelve CVs into line without slowing the desk down.
        </p>
      </header>

      <section className="prose">
        <h2>The problem clients actually see</h2>
        <p>
          A UK perm recruitment desk typically sends a shortlist of three to eight CVs
          to a hiring client for one role. The client reads them in order, against the
          brief, and forms an opinion of the agency that is partly about the candidates
          and partly about the work. The visible part of the work is whether the CVs
          look like they came from the same place.
        </p>
        <p>
          In practice they often do not. The first CV is in Calibri with a green
          accent, the second in Arial with a blue heading, the third uses bullet
          characters the agency has never used elsewhere. The hiring manager may not
          say anything; the next brief goes to a competitor. This is the problem that
          house style is meant to solve, and the reason it matters more than any single
          CV ever does.
        </p>

        <h2>What a house style actually is</h2>
        <p>
          A house style is the bundle of decisions a recruitment agency makes about
          what a CV leaving the agency looks like. It includes:
        </p>
        <ul>
          <li>
            <strong>Typography</strong> — one font family for body, one for headings,
            consistent point sizes for each section.
          </li>
          <li>
            <strong>Colour</strong> — one accent colour for headings and rules, used
            the same way every time.
          </li>
          <li>
            <strong>Branding</strong> — agency logo, contact strip on the footer, the
            agency&apos;s name in the document header.
          </li>
          <li>
            <strong>Section order</strong> — the order in which Profile, Experience,
            Education, Skills and other sections appear.
          </li>
          <li>
            <strong>Treatment of personal details</strong> — what is removed, what is
            replaced with a reference code, where the reference code appears.
          </li>
          <li>
            <strong>Bullet style and date format</strong> — small decisions that read
            as one CV vs another on a tired afternoon.
          </li>
        </ul>
        <p>
          A house style is not a Word template with the agency logo in the header.
          Those exist in most agencies and are used by some consultants, ignored by
          others, and unrecognisable in the rest of the output. A house style is the
          rule about how a CV is finished, plus the workflow that enforces it.
        </p>

        <h2>Why the workflow is the harder part</h2>
        <p>
          The cheapest way to get an inconsistent shortlist is to have a Word template
          and rely on consultants to use it. Word templates are flexible, which is
          their strength and their problem: a consultant under time pressure will open
          the template, paste in the content, then fix the awkward line break in
          exactly the way that breaks the template. Two weeks later the template has
          drifted into eleven slightly different versions in eleven consultant folders.
        </p>
        <p>
          The fix is not a better template. The fix is a single point at which the CV
          is rendered, after which it cannot be edited without losing the brand. Two
          ways to get there:
        </p>
        <ul>
          <li>
            <strong>A single owner.</strong> One person in the agency finishes CVs.
            Everyone else sends the source and waits. This is what the largest UK
            agencies do; it does not scale to smaller teams.
          </li>
          <li>
            <strong>A single tool.</strong> Every consultant uses the same tool, with
            the same saved template, and the output is rendered in one place. The
            tool does not allow the typist to drift.
          </li>
        </ul>

        <h2>What consistency buys you</h2>
        <p>
          The case for house style is not aesthetic. It is commercial and operational.
          Commercially, a shortlist that reads as one document is read as one
          recommendation; the agency is the curator. Operationally, a CV that is in
          the agency&apos;s template is faster to read internally because the consultant
          who picks it up next knows where the dates are.
        </p>
        <p>
          None of this requires a tool. A team that meets for thirty minutes once a
          quarter to argue about Calibri versus Arial and then commits to one will
          have a more consistent output than a team that buys a tool and lets
          consultants configure it independently. The tool helps; the decision matters
          more.
        </p>

        <h2>The minimum house style for a UK perm desk</h2>
        <p>
          If your team is starting from nothing, the smallest set of decisions that
          reads as a house is:
        </p>
        <ul>
          <li>One font family, two weights (regular and semibold).</li>
          <li>One accent colour, used for headings and one rule under the heading.</li>
          <li>Sections in a fixed order: Profile, Experience, Education, Skills.</li>
          <li>One bullet character (a simple round bullet is fine).</li>
          <li>One date format: month and year, with the longer end of the role listed first.</li>
          <li>Personal details stripped and replaced with a reference code in the document header.</li>
        </ul>
        <p>
          That is the minimum. It is also most of what a client notices. Everything
          beyond it — section dividers, custom fonts, an agency logo at a precise
          position — is taste, not consistency.
        </p>

        <h2>What Venditas does for consistency</h2>
        <p>
          Venditas holds one saved template per agency: logo, colours, section order,
          footer text. Every CV is rendered through the same template. The
          redaction-style treatment (name replaced with a reference code, contact
          details removed) is the same on every output. Two consultants using
          Venditas for two different CVs produce the same kind of document by
          construction.
        </p>
        <p>
          What Venditas does <em>not</em> do is decide what the agency&apos;s style should
          be. That is the agency&apos;s call and stays the agency&apos;s call; the tool only
          enforces the call once it has been made.
        </p>

        <h2>What to do this week</h2>
        <ol>
          <li>
            Pick the one font and one accent colour. Stop there. Consistency is
            stronger than taste.
          </li>
          <li>
            Fix the section order. Put it in writing. The order matters more than the
            section titles.
          </li>
          <li>
            Decide what comes off every CV going to a client — name, address, mobile,
            personal email, LinkedIn. Write it down.
          </li>
          <li>
            Save the resulting template once. If your team uses a tool, save it there.
            If your team uses Word, save it as the only template in the shared drive
            that consultants are allowed to use.
          </li>
          <li>
            Pick the reference code format (a short agency-internal code, or the
            candidate&apos;s initials plus a serial number). Use the same one on every CV.
          </li>
        </ol>

        <h2>What to read next</h2>
        <ul>
          <li>
            <Link href="/bulk-cv-formatting-shortlist">
              Bulk CV formatting for a whole shortlist
            </Link>{' '}
            — the workflow for getting twelve CVs out the same way in one session.
          </li>
          <li>
            <Link href="/how-long-does-it-take-to-reformat-a-cv">
              How long does it take to reformat a candidate CV?
            </Link>{' '}
            — the time-cost side of the same problem.
          </li>
          <li>
            <Link href="/candidate-cv-anonymisation-fee-protection">
              Why agencies anonymise CVs at all
            </Link>{' '}
            — the commercial reason for the redaction step.
          </li>
          <li>
            <Link href="/contact">Contact</Link> — to ask about setting up a saved
            template for your team.
          </li>
        </ul>
      </section>
    </div>
  );
}
