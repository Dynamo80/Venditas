import Link from 'next/link';

export const metadata = {
  title: 'How long does it take to reformat a candidate CV? — Venditas',
  description:
    'Realistic time costs for reformatting a candidate CV into an agency template, by hand and with a tool. Where the time goes, what makes a CV take longer, and what to budget for a shortlist.',
  alternates: { canonical: 'https://venditas.in/how-long-does-it-take-to-reformat-a-cv' },
};

/**
 * Targets the long-tail search "how long does it take to reformat a CV" — a
 * question recruiters ask before they decide whether to pay for a tool. The
 * honest answer is "between three and twenty minutes by hand, depending on the
 * source". The article is honest about both the time and the variance.
 */
export default function HowLongDoesItTake() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>How long does it take to reformat a candidate CV?</h1>
        <p className="standfirst">
          Real numbers from real workflows: three to twenty minutes by hand for a
          single CV, with most of the time spent on the bits that look easy. Plus what
          changes when a shortlist arrives all at once.
        </p>
      </header>

      <section className="prose">
        <h2>The short answer</h2>
        <p>
          For a single CV from a candidate who has used a clean template, an experienced
          consultant with a strong house style takes <strong>three to five minutes</strong>{' '}
          by hand. For a CV that arrived as a twelve-page career history in a foreign
          language, with two columns, a sidebar and a scanned page in the middle, the
          same consultant takes <strong>fifteen to twenty minutes</strong> — sometimes
          longer, sometimes not at all if the source is unusable. Those are working
          numbers from agencies running a reformat step before every client submission;
          they are not marketing copy.
        </p>

        <h2>Where the time actually goes</h2>
        <p>
          The visible part of the work is the typist part: change the font, paste in
          the logo, re-order the headings, fix the date format. In practice that is
          the smallest fraction of the time. Most of the time goes to four things that
          do not show up on a stopwatch:
        </p>
        <ul>
          <li>
            <strong>Reading the source CV well enough to re-order it.</strong> A
            consultant has to know which jobs are current, which are old enough to
            compress, what the candidate actually does at work. This is the bit that
            cannot be done by a typist and is not done by a generic tool that
            re-arranges headings.
          </li>
          <li>
            <strong>Taking the personal details off.</strong> Name, address, mobile,
            personal email, LinkedIn, sometimes a photograph. The point of the step
            is the anonymisation, and the cost is the same whether it is done by hand
            or by a tool: every contact point has to be checked.
          </li>
          <li>
            <strong>Re-doing the layout after the content moves.</strong> A two-column
            source does not import into a single-column house template without
            re-flowing the text. Tables become paragraphs. Sidebars move. Headers and
            footers reset.
          </li>
          <li>
            <strong>The final read-through.</strong> The CV has to be re-read before it
            leaves the agency, because an automated step plus a tired consultant is how
            mistakes end up in front of clients.
          </li>
        </ul>

        <h2>What makes a CV take longer</h2>
        <p>
          A handful of source patterns reliably blow past twenty minutes:
        </p>
        <ul>
          <li>
            <strong>Scanned CVs.</strong> A PDF that is a scan of a printed CV has no
            text layer. Every word has to be re-typed, or run through OCR, then
            checked. The check is most of the work.
          </li>
          <li>
            <strong>Long career histories.</strong> Twenty-plus years across six
            employers compresses badly into a one-page UK CV. Choosing what to keep
            and what to cut is a judgement call, not a layout call.
          </li>
          <li>
            <strong>Multi-column or graphic-heavy layouts.</strong> A modern design
            portfolio CV imports as a stack of images. The content is there; the
            structure is not.
          </li>
          <li>
            <strong>Foreign-language sources.</strong> Translation plus reformatting
            is two jobs; one of them has to be done by a human.
          </li>
          <li>
            <strong>Inconsistent date formats and section names.</strong> Every
            variation is a small decision. Small decisions add up.
          </li>
        </ul>

        <h2>What a shortlist does to the maths</h2>
        <p>
          A single CV is a five-minute job. A shortlist of twelve CVs, which is not
          unusual for a perm role, is not a one-hour job for the same reason a
          twelve-page CV is not a one-hour job — it is twelve workflows with shared
          context, and the shared context is what gets lost. Realistic timings for a
          shortlist:
        </p>
        <ul>
          <li>
            <strong>By hand, one consultant:</strong> ninety minutes to three hours,
            depending on the source mix. The bottleneck is the consultant&apos;s
            attention, not the typist work.
          </li>
          <li>
            <strong>By hand, two consultants:</strong> sixty to ninety minutes. Saves
            time on the typist work, costs time on consistency — the two CVs end up
            formatted slightly differently because two people did them.
          </li>
          <li>
            <strong>With a tool that re-renders and verifies redaction:</strong> a few
            seconds per CV for the mechanical part, plus the consultant&apos;s final
            read-through on each. The bottleneck moves from typing to judgement.
          </li>
        </ul>

        <h2>The hidden cost: inconsistency</h2>
        <p>
          The number most agencies do not measure is the one that matters: how
          different do the CVs look to the client? If a shortlist arrives in three
          fonts, two heading styles and four different orderings of the same sections,
          the client notices. It is the visible thing about an agency that has not
          decided what its CV looks like.
        </p>
        <p>
          That is why house-style consistency is treated separately from per-CV time.
          The fastest way to get a shortlist looking uniform is to do them all at the
          same time, in the same session, by the same hand or the same tool — even if
          the per-CV time is the same.
        </p>

        <h2>What Venditas does to the numbers</h2>
        <p>
          Venditas re-renders a CV into your agency&apos;s house template in a few seconds
          and verifies that no identifier is left visible. What it does <em>not</em> do
          is read the CV and decide what matters — a tool that decides what to keep
          and what to cut is a tool that has started to embellish, and that is a
          different product with different risks.
        </p>
        <p>
          The realistic time saving for a single CV is from three to twenty minutes
          down to roughly a minute of waiting plus the consultant&apos;s read-through. The
          bigger win is on shortlists, where twelve CVs done in the same session come
          out in the same template by construction.
        </p>

        <h2>Where the time still goes after the tool</h2>
        <ul>
          <li>
            The consultant&apos;s read-through of the output. Always. Even a clean
            re-render needs a human pair of eyes.
          </li>
          <li>
            Adding the reference code your client uses (or any internal commentary
            that does not belong on the CV).
          </li>
          <li>
            Saving the file with the right name in the right folder, which is where
            most of the "where did that CV go" moments actually start.
          </li>
        </ul>

        <h2>If you are timing this for a business case</h2>
        <p>
          A reasonable rule of thumb for a UK perm desk: budget ten to fifteen minutes
          per CV end-to-end, including the consultant&apos;s read, and a fifty per cent
          reduction in that figure as the benefit of a reformatting tool once the
          team is using it. Annualise against the number of CVs your agency puts in
          front of clients in a year and against the loaded cost of the consultant
          doing the work. The number that matters is the loaded cost, not the
          minutes.
        </p>

        <h2>What to read next</h2>
        <ul>
          <li>
            <Link href="/cv-formatting-house-style-consistency">
              CV formatting and house-style consistency across a team
            </Link>{' '}
            — the article on what the shortlist looks like as a whole.
          </li>
          <li>
            <Link href="/bulk-cv-formatting-shortlist">
              Bulk CV formatting for a whole shortlist
            </Link>{' '}
            — the workflow for twelve-at-once.
          </li>
          <li>
            <Link href="/pricing">Pricing</Link> — what the tool costs relative to the
            time.
          </li>
          <li>
            <Link href="/contact">Contact</Link> — for questions specific to your
            workflow.
          </li>
        </ul>
      </section>
    </div>
  );
}
