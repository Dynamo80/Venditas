import Link from 'next/link';
import { MEETING_URL } from '../../lib/pricing.mjs';

export const metadata = {
  title: 'Contact Venditas — support, security and billing',
  description:
    'How to reach Venditas for support, security disclosures, billing questions, DPA review and data requests. Book a 30-minute call, or email a named person who replies within a working day.',
  alternates: { canonical: 'https://www.venditas.in/contact' },
};

/**
 * One page, every reason someone might write to us. Recruiters trialling the
 * tool, CISOs asking about data, billing questions, a data-subject access
 * request from a candidate, and the occasional person who has spotted a bug.
 *
 * No form on purpose: the privacy notice only covers what is sent to us by
 * email. Adding a form would add a processor, a retention question, and an
 * entry on the Article 30 record. For a one-person business that receives
 * maybe ten messages a day, an email is the right answer.
 */
export default function Contact() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>Contact Venditas</h1>
        <p className="standfirst">
          One address, several reasons to use it. Pick the subject line that fits and the
          right person reads it.
        </p>
      </header>

      <section className="prose">
        <h2>The address</h2>
        <p>
          Everything goes to <a href="mailto:founder@venditas.in">founder@venditas.in</a>.
          A named human reads it — usually Abin Johnson, the person who built Venditas —
          and replies within a working day during UK and India business hours.
        </p>
        <p>
          For anything that needs a paper reply or a signed document, the postal address is
          on every legal page and at the foot of this one.
        </p>

        <h2>Or book half an hour</h2>
        <p>
          <a href={MEETING_URL} target="_blank" rel="noopener noreferrer">
            Book 30 minutes with Abin
          </a>{' '}
          — a walkthrough on one of your own CVs, a billing or invoicing question, or a
          compliance team that would rather talk to a person than read another PDF. Same
          person who answers the email; sometimes a call is simply quicker.
        </p>
        <p>
          Nothing needs booking before you try it. The{' '}
          <Link href="/">tool is open</Link> and the first ten CVs need no card and no
          conversation.
        </p>

        <h2>What to put in the subject line</h2>
        <p>So the message lands with the right context from the first word:</p>
        <ul>
          <li>
            <strong>Support — "…"</strong> — a question about how the tool works, a CV that
            came out wrong, a colour or logo that didn&apos;t apply, anything that stops you
            using the result. This is the one we answer fastest.
          </li>
          <li>
            <strong>Billing — "…"</strong> — invoicing, payment details, annual plans, VAT
            or tax questions, agency-name corrections on receipts.
          </li>
          <li>
            <strong>Security disclosure</strong> — for reporting a vulnerability. We aim to
            acknowledge within 48 hours. The <Link href="/security">security page</Link> sets
            out what we will and will not promise in response.
          </li>
          <li>
            <strong>DPA review</strong> — if your compliance team wants the data processing
            agreement countersigned, send it as a PDF and the fields to fill in. The
            current draft is on <Link href="/dpa">/dpa</Link>.
          </li>
          <li>
            <strong>Data request</strong> — access, correction or deletion of personal data held
            about you. We hold your email address, agency name, and request counters keyed to
            salted SHA-256 hashes of your IP and email address — daily ones kept for 90
            days, a trial total for 24 months from your last CV; nothing else
            (see <Link href="/privacy">privacy</Link>). Verification is by email.
          </li>
          <li>
            <strong>Candidate access request</strong> — if you are a candidate whose CV was
            processed by a recruiter using Venditas, the recruiter is the data controller.
            Write to the recruiter directly. If you cannot reach them, write to us and we
            will tell you which agency handled your CV.
          </li>
        </ul>

        <h2>What we will not do by email</h2>
        <ul>
          <li>
            We will not ask for your password, your card number, or to move the conversation
            off email to a less-secure channel.
          </li>
          <li>
            We will not share your message with a third party without your written consent,
            except where required by law.
          </li>
          <li>
            We will not add you to a marketing list. Outreach is opt-in only and uses a
            one-click unsubscribe on every message — the <Link href="/unsubscribe">unsubscribe
            page</Link> removes you in one step, no questions.
          </li>
        </ul>

        <div className="callout">
          <p>
            <strong>If you are a UK or EU recruitment agency</strong> considering Venditas for
            candidate CV handling and your DPO has questions before you can sign a DPA,
            please write directly. We&apos;ve answered most of them before and can usually
            settle it in one thread.
          </p>
        </div>

        <h2>Postal address</h2>
        <p>
          Venditas<br />
          Bhoomi Elite, Sector 28, Nerul<br />
          Navi Mumbai 400706<br />
          India
        </p>
        <p className="standfirst" style={{ fontSize: 14 }}>
          Sole trader: Abin Johnson. The privacy notice names this address as the
          establishment for the purposes of UK GDPR Article 27 correspondence until a UK
          representative is appointed (see <Link href="/privacy">privacy</Link> for the
          current status).
        </p>
      </section>
    </div>
  );
}
