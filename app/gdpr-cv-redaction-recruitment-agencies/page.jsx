import Link from 'next/link';

export const metadata = {
  title: 'GDPR-compliant CV handling for recruitment agencies — Venditas',
  description:
    'How UK and EU recruitment agencies handle candidate CVs under UK GDPR and the Data Protection Act 2018: lawful basis, minimisation, anonymisation, sub-processors and what an ICO complaint looks like in practice.',
  alternates: { canonical: 'https://venditas.in/gdpr-cv-redaction-recruitment-agencies' },
};

/**
 * The honest version of this question. Most articles on this topic are written
 * by CV-formatting tools trying to sell redaction as a feature; this one is
 * written by a recruitment-agency tool that does redaction by default and is
 * still careful about what it claims.
 *
 * Three things this article does not do: promise CV redaction makes a
 * recruiter GDPR-compliant (it does not — lawful basis and retention matter
 * more); claim Venditas is the only way to handle this (it is one option);
 * suggest candidates' rights are satisfied by redaction alone.
 */
export default function GdprCvRedaction() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>GDPR-compliant CV handling for recruitment agencies</h1>
        <p className="standfirst">
          A practical read on what UK GDPR and the Data Protection Act 2018 actually
          require when a candidate&apos;s CV passes through your agency. Re-identified
          candidates, anonymous shortlists, what to put in your privacy notice, and
          what the ICO tends to act on.
        </p>
      </header>

      <section className="prose">
        <h2>What this article is and is not</h2>
        <p>
          It is a working summary for a recruitment-agency owner or operations lead who
          has to make decisions about CVs every week and would like a calmer read than
          the ICO guidance page. It is not legal advice. If a question here changes
          whether you can run a process, the answer is to ask a solicitor — UK GDPR is
          statutory and the case law moves.
        </p>
        <p>
          Venditas is a CV reformatting tool that anonymises candidate CVs by default.
          Where the article describes what the law requires, it does so on its own
          merits. Where it describes what Venditas does, it says so plainly.
        </p>

        <h2>The first question: who is the data controller?</h2>
        <p>
          When a candidate sends their CV to a recruitment agency, the agency is the{' '}
          <strong>data controller</strong>. The agency decides why the data is being
          processed, what counts as a successful match, who sees the CV, how long it
          is held and when it is deleted. Any third party that handles the CV on the
          agency&apos;s behalf — including a CV formatting tool — is a{' '}
          <strong>data processor</strong> under Article 28 UK GDPR and needs a written
          contract that sets out what they can and cannot do with the data.
        </p>
        <p>
          This matters because the controller has the obligations. The processor has
          fewer, but they are not nothing, and the contract (a Data Processing
          Agreement) is the bit the ICO actually checks when something goes wrong.
        </p>

        <h2>The second question: what is your lawful basis?</h2>
        <p>
          The lawful bases for processing candidate data are listed in Article 6(1)
          UK GDPR. For most recruitment work the relevant ones are:
        </p>
        <ul>
          <li>
            <strong>6(1)(a) consent</strong> — the candidate has given clear, specific,
            informed consent. Hard to rely on at scale and easy to withdraw.
          </li>
          <li>
            <strong>6(1)(b) contract</strong> — processing is needed to take steps at
            the candidate&apos;s request before entering a contract. Limited to early-stage
            recruitment activity.
          </li>
          <li>
            <strong>6(1)(f) legitimate interests</strong> — the agency has a legitimate
            interest, the processing is necessary to achieve it, and the candidate&apos;s
            rights do not override. The most common basis for ongoing CV storage. A
            Legitimate Interests Assessment (LIA) is required and should be written down.
          </li>
        </ul>
        <p>
          Whichever basis you choose, two things follow. First, you must tell the
          candidate which basis you are relying on (in your privacy notice, at the
          point of collection, or both). Second, the basis has to be true — relying on
          legitimate interests when consent was clearly given, or vice versa, is a
          record-keeping failure the ICO will note.
        </p>

        <h2>Data minimisation: what should be on a CV going to a client?</h2>
        <p>
          Article 5(1)(c) UK GDPR requires that personal data be{' '}
          <strong>adequate, relevant and limited</strong> to what is necessary. A CV sent
          to a hiring client is almost always over-shared by default: it carries the
          candidate&apos;s home address, personal mobile, personal email, LinkedIn URL,
          sometimes a date of birth and a photograph. None of that is necessary for the
          client to assess suitability for a role. The Information Commissioner has
          been clear in published guidance that controllers are expected to take
          reasonable steps to minimise.
        </p>
        <p>
          In practice this is what most UK agencies already do by hand: open the
          candidate&apos;s CV, delete the contact details, replace the candidate&apos;s name
          with a reference code, save and forward. The reason to talk about it as a
          GDPR question rather than a workflow question is that the manual approach is
          prone to being skipped on a Friday afternoon. The legal duty does not vary
          with the day of the week.
        </p>

        <div className="callout">
          <p>
            <strong>Anonymisation vs pseudonymisation.</strong> UK GDPR applies to{' '}
            <em>personal data</em> — data relating to an identified or identifiable
            person. Truly anonymous data is out of scope. Replacing a name with a
            reference code while leaving the rest identifiable is{' '}
            <em>pseudonymisation</em>, which is a security measure, not an exemption.
            The candidate is still a data subject; UK GDPR still applies. This is the
            technical point that catches a lot of well-intentioned policies.
          </p>
        </div>

        <h2>Special-category data on CVs</h2>
        <p>
          CVs frequently contain data that is special-category under Article 9 — for
          example, photographs (biometric data when processed for identification),
          health disclosures, trade union membership, criminal-record declarations.
          The lawful basis for special-category processing is stricter (Article 9(2)
          plus a Schedule 1 condition under the Data Protection Act 2018). The short
          version: most agencies should not be passing this through to a client at the
          shortlist stage, and a tool that re-renders a CV should not be inventing,
          retaining or learning from it.
        </p>

        <h2>Sub-processors and the supply chain</h2>
        <p>
          When an agency uses a third-party tool to handle CVs, that tool becomes a
          processor. If the tool in turn uses another provider — for storage, AI
          inference, hosting, email — those providers are sub-processors and must be
          listed in the DPA and, in practice, in the controller&apos;s own Article 30
          record. The ICO is consistent on this point in its audit work: undisclosed
          sub-processors are a recurring finding.
        </p>
        <p>
          For a CV-processing tool, the realistic list to expect is: a cloud host, an
          AI inference provider, an email provider for transactional messages, and
          (sometimes) a database for account data. Each is a separate processor
          relationship with its own safeguards, region and breach-notification terms.
          The agency&apos;s DPA with the tool needs to surface them.
        </p>

        <h2>International transfers</h2>
        <p>
          If a candidate&apos;s CV leaves the UK — to a US-based AI inference endpoint, for
          example — that is an Article 46 restricted transfer and needs a transfer
          mechanism: the UK International Data Transfer Agreement (IDTA), the EU
          Standard Contractual Clauses, or reliance on an adequacy decision. The UK
          has an adequacy decision for the EU, and the EU has one for the UK (until
          June 2025 reviews); the US does not have a general adequacy decision, so
          transfers to US sub-processors are typically covered by SCCs or, for some
          providers, the EU-US Data Privacy Framework.
        </p>
        <p>
          The agency does not have to repeat this paperwork for every sub-processor;
          the tool&apos;s DPA and the underlying contracts carry it. But the agency does
          need to know the regions and the mechanism, and to keep a record.
        </p>

        <h2>Candidate rights you have to handle</h2>
        <p>
          Candidates have the rights in Articles 15 to 22 — access, rectification,
          erasure, restriction, objection, portability, and (in some processing) no
          solely-automated decision-making. Anonymising the CV on the way to the
          client does not stop these rights applying to the CV the agency holds.
          Erasure in particular is the one that breaks sloppy processes: the agency
          has to be able to delete a candidate&apos;s CV from its systems, including from
          any processor or sub-processor that holds a copy.
        </p>

        <h2>Retention</h2>
        <p>
          Article 5(1)(e) requires that data be kept no longer than is necessary. The
          Information Commissioner&apos;s <em>Employment Practices</em> guidance and most
          sector practice point to a CV retention period in the order of six to
          twenty-four months, depending on the role and the candidate&apos;s expressed
          preference, with a clear end date and a documented deletion routine. A tool
          that holds CV content beyond the moment of processing is, in this
          framework, an unnecessary risk.
        </p>

        <h2>What an ICO complaint looks like in practice</h2>
        <p>
          Most complaints the ICO receives about recruitment agencies are not about
          redaction. They are about three things: a candidate who asked to be forgotten
          and heard nothing; a CV forwarded to a client that contained data the
          candidate had asked to be removed; and a breach involving candidate CVs that
          was not reported within 72 hours. Reasonable steps in all three areas depend
          more on the agency&apos;s process than on any tool the agency uses.
        </p>

        <h2>What Venditas does, in this context</h2>
        <p>
          Venditas is a processor. The agency remains the controller. What Venditas
          does, that is relevant to this article:
        </p>
        <ul>
          <li>
            Identifiers (name, email, phone, URLs) are replaced with placeholders
            <em> locally</em> on the agency&apos;s request, before any AI inference call.
            The inference endpoint therefore sees a CV with no contact details.
          </li>
          <li>
            The output document is checked after it is built. If an identifier would
            still be visible, the request fails rather than handing back a document
            with a contact detail still in it.
          </li>
          <li>
            CV content is processed in memory and discarded when the request finishes.
            Nothing about a candidate is stored by Venditas.
          </li>
          <li>
            The data processing agreement is published at <Link href="/dpa">/dpa</Link>{' '}
            with the sub-processor list, regions and transfer mechanisms named.
          </li>
        </ul>
        <p>
          None of this makes an agency GDPR-compliant on its own. It is one piece of a
          process that the agency owns: lawful basis, candidate notice, retention,
          rights handling, breach response. Done well, the right tool saves time and
          removes the easy mistakes; it does not replace the harder ones.
        </p>

        <h2>A short checklist before you buy or renew a CV tool</h2>
        <ul>
          <li>
            Does the DPA name every sub-processor and the region the data is in?
          </li>
          <li>
            Is the transfer mechanism for any non-UK sub-processor named, and is it
            current?
          </li>
          <li>
            Does the tool hold the CV after the request finishes? If so, for how long,
            and where?
          </li>
          <li>
            Does the tool log CV content for debugging? Who can see the logs?
          </li>
          <li>
            Does the tool offer a written security disclosure and an honest list of
            what is <em>not</em> in place (no SOC 2, no penetration test)?
          </li>
          <li>
            Can the agency delete a candidate&apos;s CV from the tool on request, or is
            the tool a dead end for erasure?
          </li>
        </ul>

        <h2>Where to read more</h2>
        <ul>
          <li>
            <Link href="/security">Venditas — security and data</Link> — the sub-processor
            list and what is and is not in place.
          </li>
          <li>
            <Link href="/privacy">Venditas — privacy notice</Link> — the lawful bases,
            retention and contact for data requests.
          </li>
          <li>
            <Link href="/dpa">Venditas — data processing agreement</Link> — the draft
            for your compliance team.
          </li>
          <li>
            <Link href="/candidate-cv-anonymisation-fee-protection">Why agencies anonymise CVs at all</Link> —
            the commercial reason, not just the legal one.
          </li>
          <li>
            <Link href="/contact">Contact</Link> — to send a DPA, ask a question or
            report a security issue.
          </li>
        </ul>
      </section>
    </div>
  );
}
