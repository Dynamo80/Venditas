import Link from 'next/link';

export const metadata = {
  title: 'Bulk CV formatting for a shortlist — Venditas',
  description:
    'A workflow for formatting a whole shortlist of candidate CVs in one pass: what to prepare, how to keep them consistent, how to keep the redaction right on twelve at once, and the checks before you send to the client.',
  alternates: { canonical: 'https://www.venditas.in/bulk-cv-formatting-shortlist' },
};

/**
 * Workflow article. Targets "format multiple CVs at once" and similar
 * queries — the moment when a recruiter has eight CVs in front of them and a
 * deadline. Written as a checklist with the rationale next to each step, not
 * a feature pitch.
 */
export default function BulkCvFormatting() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>Bulk CV formatting for a shortlist</h1>
        <p className="standfirst">
          A practical workflow for getting a whole shortlist out the door in one pass:
          consistent, anonymised, and read by a human before it leaves. The version of
          this article that applies if your desk runs on urgency.
        </p>
      </header>

      <section className="prose">
        <h2>What "bulk" actually means here</h2>
        <p>
          In a UK perm recruitment context, bulk usually means a shortlist of three to
          twelve CVs for one role, prepared in one session and sent together. It is
          not "a hundred CVs in a graduate assessment centre", and the workflow is
          different. The bottleneck on a shortlist is consistency and the final
          read-through, not throughput.
        </p>
        <p>
          The advice below assumes a shortlist in that range. For higher-volume
          workflows (graduate intake, RPO, assessment centres) the consistent answer
          is the same in principle but different in tooling; that is a separate
          article.
        </p>

        <h2>Before you open the first CV</h2>
        <ul>
          <li>
            <strong>Have the brief in front of you.</strong> The reason a shortlist
            reads as inconsistent is often that it was formatted without re-reading
            the brief. A shortlist written against a brief the consultant does not
            remember looks like six CVs from six searches.
          </li>
          <li>
            <strong>Confirm the agency template.</strong> Logo, colour, footer, section
            order, the reference-code format your client uses. If your team uses a
            tool with a saved template, confirm it is the current one.
          </li>
          <li>
            <strong>Decide the file naming.</strong> Pick the pattern now — role,
            shortlist position, reference code, date. Saving twelve CVs named
            <code> CV-Final-v3.docx</code> at 11pm is the path to sending the wrong
            file to the client.
          </li>
          <li>
            <strong>Decide what is removed.</strong> Name, address, mobile, personal
            email, LinkedIn URL. Write it on a sticky note if necessary. The fastest
            way to miss an identifier on a shortlist is to have decided five minutes
            ago and forgotten by the third CV.
          </li>
        </ul>

        <h2>Do them all in the same session</h2>
        <p>
          This is the single most useful rule for shortlist consistency. The session
          can be thirty minutes or two hours; what matters is that it is one session,
          one template, one person. Starting and stopping breaks the consistency in
          ways that take longer to repair than they save.
        </p>
        <p>
          If the shortlist is too long for one session, split by role, not by time.
          Eight CVs for a perm finance role done in one session will look like one
          agency&apos;s work. The same eight CVs done in two sessions on different days
          will look like two.
        </p>

        <h2>What to do for each CV</h2>
        <ol>
          <li>
            Open the source. Read it. Note the role title, the start and end dates of
            each position, the candidate&apos;s actual job — not the job title the
            candidate gave themselves.
          </li>
          <li>
            Re-render into the agency template. If the source has no text layer
            (scanned), OCR or re-type first; do not skip this step and hope.
          </li>
          <li>
            Verify the redaction. Read the rendered document once for identifiers —
            name, email, phone, address, URLs. Treat it as a check; do not trust that
            it was done.
          </li>
          <li>
            Add the reference code in the agreed place (header strip is the
            convention).
          </li>
          <li>
            Save with the agreed file name. Move to the next CV.
          </li>
        </ol>

        <h2>The check that catches the most mistakes</h2>
        <p>
          Before sending to the client, do one read of the shortlist in order, as a
          client would. The check is not whether the CV is correct — that has been
          checked per CV — but whether the shortlist <em>reads as one document</em>.
          Look for:
        </p>
        <ul>
          <li>Heading styles that vary (sizes, weights, colours).</li>
          <li>Bullet characters that vary.</li>
          <li>Date formats that vary.</li>
          <li>Sections that appear in different orders.</li>
          <li>A reference code that is in different positions on different CVs.</li>
          <li>A CV that is one page while the rest are two, or vice versa, with no
            obvious reason.</li>
        </ul>
        <p>
          If you spot any of these, fix them in the source template, not by editing
          individual CVs. Editing individual CVs produces more drift, not less.
        </p>

        <h2>Where a tool helps and where it does not</h2>
        <p>
          A tool that re-renders and verifies redaction helps with the mechanical
          part: the typist work and the consistency check. It does not help with the
          brief, the role-by-role judgement about what to keep, or the final
          read-through. Those are human steps and stay human.
        </p>
          <p>
            A tool that rewrites, paraphrases or "improves" the candidate&apos;s own
            wording makes this workflow worse, not better. A CV the consultant did not
            write is a CV the consultant cannot sign for, and a shortlist that has been
            quietly embellished is the kind of thing that ends a client relationship.
          </p>

        <h2>What to do if the source CVs are a mess</h2>
        <p>
          Some shortlists arrive with one CV from a Word template, one from a Canva
          design, one scanned from a printed page. Three different problems:
        </p>
        <ul>
          <li>
            <strong>The Canva-style CV</strong> usually has a text layer and a layout
            layer; the content is recoverable, the layout is not. Re-render into the
            agency template; lose the layout, keep the words.
          </li>
          <li>
            <strong>The scanned CV</strong> has to be OCR-ed. The OCR result has to be
            checked against the original — names and figures are the bits that go
            wrong first. Do not OCR in batch and assume.
          </li>
          <li>
            <strong>The Word CV with tables</strong> imports into most editors as a
            table-shaped block of text. Tables do not survive re-rendering cleanly;
            expect to flatten them.
          </li>
        </ul>
        <p>
          When in doubt, the safest move is to use the same source twice and compare
          outputs. If the outputs match, the pipeline is consistent. If they do not,
          fix the pipeline before sending either to the client.
        </p>

        <h2>Sending to the client</h2>
        <ul>
          <li>
            One email, one PDF (or one folder of Word files), a short covering note.
            Do not send twelve CVs as twelve emails.
          </li>
          <li>
            Include the reference codes in the covering note so the client can refer
            to a CV by code without learning the candidate&apos;s name.
          </li>
          <li>
            State the time you sent them and when you will follow up. Hiring managers
            read shortlists in the gaps; tell them when the gap is.
          </li>
        </ul>

        <h2>If you are doing this often</h2>
        <p>
          A team that puts more than a hundred shortlists out a year will benefit
          from a saved template and a documented workflow. A team that puts out a
          thousand will benefit from a tool that holds the template and the
          redaction rules in one place and renders every CV through them. The
          threshold is not "many CVs"; the threshold is "many consultants using the
          same template".
        </p>

        <h2>What to read next</h2>
        <ul>
          <li>
            <Link href="/cv-formatting-house-style-consistency">
              CV formatting and house-style consistency across a team
            </Link>{' '}
            — the article on why consistency is the visible part of the work.
          </li>
          <li>
            <Link href="/how-long-does-it-take-to-reformat-a-cv">
              How long does it take to reformat a candidate CV?
            </Link>{' '}
            — the time budget for a shortlist.
          </li>
          <li>
            <Link href="/pricing">Pricing</Link> — what Venditas costs relative to
            the workflow.
          </li>
          <li>
            <Link href="/">Format a shortlist</Link> — drop up to twenty CVs in at
            once, in your branding, with the contact details removed and checked.
          </li>
          <li>
            <Link href="/contact">Contact</Link> — to ask about larger batch
            workflows for your team.
          </li>
        </ul>
      </section>
    </div>
  );
}
