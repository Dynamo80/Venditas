import Link from 'next/link';

export const metadata = {
  title: 'Why recruitment agencies anonymise candidate CVs — fee protection — Venditas',
  description:
    'The commercial reason recruitment agencies anonymise candidate CVs before sending them to clients: fee protection, not diversity. How the practice works, what an anonymised CV looks like, and what changes when the client can identify the candidate directly.',
  alternates: { canonical: 'https://www.venditas.in/candidate-cv-anonymisation-fee-protection' },
};

/**
 * The most commercially distinctive article on the site. Decision 002 makes
 * fee protection the unique positioning — most tools in this space talk
 * about diversity or bias reduction instead. The article explains the
 * commercial reason, the practice, and the limits of anonymisation as a fee
 * protection strategy.
 */
export default function FeeProtection() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>Why recruitment agencies anonymise candidate CVs</h1>
        <p className="standfirst">
          The commercial reason, not the diversity one. A candidate who can be
          identified by the client can be hired directly. Anonymising the CV before it
          leaves the agency is the cheapest way to keep the fee on the table.
        </p>
      </header>

      <section className="prose">
        <h2>The thing nobody else says about this</h2>
        <p>
          Most write-ups about CV anonymisation frame it as a diversity or bias
          measure. That is a real motivation in some settings, but it is not the
          motivation in most UK recruitment agencies, and it is not the reason
          anonymisation is non-negotiable in perm placement. The reason is money.
        </p>
        <p>
          A UK perm placement fee is typically fifteen to twenty-five per cent of the
          candidate&apos;s first-year salary. On a £60,000 role, that is £9,000 to
          £15,000 — earned in a few weeks of work by the recruiter, contingent on the
          candidate being hired through the agency rather than direct. If the client
          receives a CV with the candidate&apos;s name, email and phone number on it,
          the client can hire the candidate without the agency and pay nothing. The
          fee is forfeit the moment the candidate&apos;s contact details leave the
          building.
        </p>
        <p>
          Anonymising the CV — replacing the candidate&apos;s name with a reference code,
          removing the contact details, scrubbing the LinkedIn URL — is the cheapest
          way to keep the fee on the table. It is not the only way; many agencies
          also use written terms with their clients. But the anonymisation is the
          first line, because it works without anyone having to read the terms.
        </p>

        <h2>What an anonymised CV actually looks like</h2>
        <p>
          The change is small and visible at the top of the document: the candidate&apos;s
          name is gone, replaced by a short code (often the agency&apos;s reference for
          the candidate). The contact strip — phone, email, address — is removed. The
          LinkedIn URL is removed. The body of the CV is unchanged: the candidate&apos;s
          experience, education, skills and achievements are presented in the
          candidate&apos;s own words.
        </p>
        <p>
          The convention in UK perm is that the reference code is internal to the
          agency and the client refers to the candidate by code throughout the
          process. The agency holds the mapping between code and candidate. The
          client does not know who the candidate is until a face-to-face meeting is
          scheduled, at which point the candidate&apos;s identity is shared under the
          agency&apos;s terms.
        </p>

        <h2>What it does not do</h2>
        <p>
          Anonymisation is not invisibility. A candidate who has a public LinkedIn
          profile with their current job title and current employer is identifiable
          from their CV body alone, especially in a niche role. A senior engineer
          with three jobs in twenty years at known companies can be narrowed to a
          short list of people by anyone with a search engine. Anonymisation is a
          friction layer, not a wall; it slows the client down enough that the agency
          has time to get in the room.
        </p>
        <p>
          This is why most UK agencies combine anonymisation with a written
          agreement: the anonymisation handles the casual bypass, and the agreement
          handles the deliberate one. Both matter.
        </p>

        <h2>Why this is different from "blind CVs" for diversity</h2>
        <p>
          Blind-CV programmes for diversity typically remove the candidate&apos;s name
          and a small number of demographic markers (gender, age, ethnicity) and ask
          the reader to focus on the experience. The motivation is to give the
          candidate a fairer read. Anonymisation for fee protection removes the same
          identifying markers for a different reason: to keep the recruiter in the
          commercial chain.
        </p>
        <p>
          In practice both motivations lead to similar-looking documents, but they
          imply different obligations. A blind-CV programme asks the reader to
          ignore what has been redacted; a fee-protection anonymisation asks the
          client to ask the agency before identifying the candidate. The first is a
          request; the second is a workflow.
        </p>

        <h2>GDPR and anonymisation — the technical point</h2>
        <p>
          Under UK GDPR, anonymisation is the right concept if the data can no
          longer be linked to an identifiable person by any means reasonably likely
          to be used. Pseudonymisation — replacing the name with a code while the
          rest of the CV identifies the candidate — is <em>not</em> anonymisation in
          the UK GDPR sense; it is a security measure. UK GDPR still applies to the
          pseudonymised CV because the candidate is still identifiable.
        </p>
        <p>
          For fee-protection purposes this distinction does not usually matter. The
          agency is the controller, the pseudonymisation is a measure the agency
          takes within its own processing, and the lawfulness comes from the
          agency&apos;s lawful basis (typically legitimate interests for ongoing
          candidate work). For more on the GDPR side, see{' '}
          <Link href="/gdpr-cv-redaction-recruitment-agencies">
            GDPR-compliant CV handling for recruitment agencies
          </Link>.
        </p>

        <h2>What goes wrong</h2>
        <p>
          The most common failure modes, in roughly the order they happen:
        </p>
        <ul>
          <li>
            <strong>The candidate&apos;s name is left on the CV.</strong> The most
            common cause is a typist who copied the heading from the source and
            forgot to remove it. The fix is a verification step that reads the
            rendered document for identifiers — not a trust-the-step-and-move-on
            step.
          </li>
          <li>
            <strong>Contact details are removed from the body but the email signature
            is left on.</strong> The signature is in the candidate&apos;s own words but
            carries the candidate&apos;s email. The fix is to read the document, not the
            body.
          </li>
          <li>
            <strong>The reference code reveals the candidate&apos;s identity.</strong> A
            code that includes the candidate&apos;s initials or the month they joined the
            database defeats the anonymisation. The fix is a reference code that is
            arbitrary — a serial number is fine.
          </li>
          <li>
            <strong>The LinkedIn URL is left in.</strong> A URL is a unique identifier.
            One click and the client has the candidate&apos;s profile, contacts, and
            history. The fix is to remove URLs alongside names and contact details.
          </li>
          <li>
            <strong>A cover note or email body mentions the candidate by name.</strong>{' '}
            The CV can be perfectly anonymised and the surrounding text can undo it.
            The fix is to use the reference code in the covering email too.
          </li>
        </ul>

        <h2>What Venditas does in this picture</h2>
        <p>
          Venditas anonymises by default: name, email, phone, URLs are replaced
          before the CV is rendered into the agency template. The replacement is
          verified on the rendered document — if an identifier would still be visible
          the request fails, rather than handing back a document with a contact
          detail still in it. The reference code is added in the document header so
          it is the first thing the client sees.
        </p>
        <p>
          What Venditas does <em>not</em> do is write the candidate&apos;s content. The
          CV body is the candidate&apos;s own words. That matters for fee protection
          because a CV the agency has rewritten is a CV the agency cannot sign for;
          it also matters for compliance with the UK Consumer Protection from Unfair
          Trading Regulations, which apply to claims made about candidates.
        </p>

        <h2>If you are reviewing your current workflow</h2>
        <p>
          A few questions worth asking before you change anything:
        </p>
        <ul>
          <li>
            On a typical shortlist, how many CVs go out with the candidate&apos;s name
            still in the file? An honest audit of one shortlist in a quiet week tells
            you more than a policy document.
          </li>
          <li>
            What is your reference-code format? Is it arbitrary (a serial) or does it
            carry information (initials, dates)?
          </li>
          <li>
            When a CV goes to a client, does the covering email use the reference code
            or the candidate&apos;s name?
          </li>
          <li>
            When you change the agency template, do old CVs keep the old reference
            codes, or do they get re-rendered?
          </li>
          <li>
            Do your terms with the client survive a casual mis-step by a consultant
            sending a CV with a name still on it?
          </li>
        </ul>

        <h2>What to read next</h2>
        <ul>
          <li>
            <Link href="/cv-formatting-for-recruitment-agencies">
              CV formatting software for recruitment agencies
            </Link>{' '}
            — the plain-language overview of the tool.
          </li>
          <li>
            <Link href="/gdpr-cv-redaction-recruitment-agencies">
              GDPR-compliant CV handling for recruitment agencies
            </Link>{' '}
            — the legal side of the same workflow.
          </li>
          <li>
            <Link href="/cv-formatting-house-style-consistency">
              CV formatting and house-style consistency across a team
            </Link>{' '}
            — the operational side.
          </li>
          <li>
            <Link href="/contact">Contact</Link> — to ask a question specific to your
            agency&apos;s terms.
          </li>
        </ul>
      </section>
    </div>
  );
}
