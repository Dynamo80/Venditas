import Link from 'next/link';
import { PRO, GUARANTEE } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'FAQ — Venditas',
  description:
    'The questions recruitment agencies actually ask before paying: data handling, accuracy, formats, and what happens if it gets one wrong.',
};

/**
 * Ordered by what actually blocks a sale, not by what is easiest to answer. The
 * hard ones — accuracy, data, "why not just use ChatGPT" — come first, because
 * burying them reads as evasion to the person who came here looking for them.
 */
const QUESTIONS = [
  {
    q: 'How accurate is it, really?',
    a: (
      <>
        It copies the candidate's own wording rather than rewriting it, which is the design choice
        that makes accuracy checkable — you can put the original and the output side by side and
        see whether anything moved. Where a CV doesn't state something, the field comes back blank
        rather than guessed, because an invented phone number is far worse than a missing one. It
        should still be read before it goes to a client.
      </>
    ),
  },
  {
    q: "Why not just use ChatGPT?",
    a: (
      <>
        You can, and for one CV it's fine. The differences that matter at volume: this produces a
        Word document in your actual template rather than text you then reformat, it strips contact
        details and <Link href="/security">verifies they're gone</Link>, and it won't quietly
        improve a candidate's achievements — which is exactly what a general chatbot does when you
        ask it to tidy a CV, and exactly what you can't send to a client.
      </>
    ),
  },
  {
    q: 'Do you store our candidates’ CVs?',
    a: (
      <>
        No. The file is read in memory and discarded when the request finishes — no bucket, no
        queue, no backup. We keep your email, your agency name and a count of CVs run.{' '}
        <Link href="/security">The full detail is here</Link>, including who else touches the data.
      </>
    ),
  },
  {
    q: 'Our client asked for a DPA before we can use new tools.',
    a: (
      <>
        Reasonable, and expected — you'd be the controller and we'd be the processor.{' '}
        <Link href="/dpa">There's one here</Link>. If your legal team wants changes, email and
        we'll work through them rather than telling you it's non-negotiable.
      </>
    ),
  },
  {
    q: 'What file formats does it take?',
    a: (
      <>
        PDF and Word (.docx), up to 10MB. Scanned PDFs work too — if there's no text layer, the
        pages are read as images. Legacy .doc files don't work yet; re-save as .docx. Output is
        always .docx so you can edit it.
      </>
    ),
  },
  {
    q: 'What about two-column CVs, tables, and the truly awful ones?',
    a: (
      <>
        Those are the ones it was built against. Sidebars, tables, dates in three different formats
        in the same document, headers and footers that shouldn't end up in the content. A tidy
        single-column CV is easy; the messy ones are the reason this exists.
      </>
    ),
  },
  {
    q: 'Can we keep the candidate’s details on, for internal use?',
    a: <>Yes — there's a checkbox. It's off by default, deliberately, because the expensive mistake only goes one way.</>,
  },
  {
    q: 'How is it priced?',
    a: (
      <>
        Ten CVs free to try. £{PRO.gbp} a month for unlimited after that, with everyone in
        your agency included — no per-seat charge.{' '}
        <Link href="/pricing">Pricing in full</Link>.
      </>
    ),
  },
  {
    q: 'What if it doesn’t work for us?',
    a: <>{GUARANTEE}</>,
  },
  {
    q: 'Who actually answers if something breaks?',
    a: (
      <>
        The person who wrote it. There's no support tier and no queue — which cuts both ways, and{' '}
        <Link href="/about">we say so plainly</Link>.
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>Questions people ask before paying.</h1>
        <p className="standfirst">
          The awkward ones first, because those are the ones you came here for.
        </p>
      </header>

      <section className="prose">
        {QUESTIONS.map(({ q, a }) => (
          <div className="qa" key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}

        <div className="callout" style={{ marginTop: 30 }}>
          <p>
            Something not answered here? <a href="mailto:founder@venditas.in">Email it over</a> —
            it reaches the person who built the thing, and the answer usually comes back the same
            day.
          </p>
        </div>
      </section>
    </div>
  );
}
