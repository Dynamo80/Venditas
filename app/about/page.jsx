import Link from 'next/link';

export const metadata = {
  title: 'About Venditas',
  description: 'Who builds this, why it exists, and how to reach a human.',
};

/**
 * Being small is only a liability if you hide it. An agency deciding whether to
 * trust us with candidate data would rather read a straight account of what
 * this is than a "we" that implies a team which doesn't exist.
 */
export default function About() {
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>A small tool that does one job properly.</h1>
        <p className="standfirst">
          Venditas reformats candidate CVs into your agency's template and strips the contact
          details. That's the whole product. It isn't trying to become your CRM.
        </p>
      </header>

      <section className="prose">
        <h2>Why this exists</h2>
        <p>
          Every recruitment agency does the same thing several times a day: a candidate sends a CV
          in whatever state they made it, and before it reaches a client somebody rebuilds it in the
          agency's own template and takes the personal details off. It's a job people are paid to
          do, nobody enjoys, and no amount of experience makes faster.
        </p>
        <p>
          The reason it exists at all is commercial rather than cosmetic. A client who can see a
          candidate's email can hire them directly, and the agency loses a fee worth thousands. So
          the formatting is really about the redaction — which is why{' '}
          <Link href="/security">every document is checked after it's built</Link> rather than
          trusted to have worked.
        </p>

        <h2>Who's behind it</h2>
        <p>
          One person, working from Navi Mumbai. Emails go to the same address that appears on this
          page and are answered by the person who wrote the code — which means you get real answers
          about how it works, and there is nobody to escalate to when something breaks. Both halves
          of that are true and you should weigh them.
        </p>

        <h2>What we won't do</h2>
        <ul>
          <li>
            <strong>Rewrite your candidates.</strong> The tool copies their wording. It doesn't
            invent achievements you'd then have to defend to a client.
          </li>
          <li>
            <strong>Keep candidate data.</strong> Files are processed and discarded. There's no
            candidate database quietly accumulating behind this.
          </li>
          <li>
            <strong>Become a CRM.</strong> You already have one you didn't choose. This works
            alongside it and asks for no migration.
          </li>
        </ul>

        <h2>Getting in touch</h2>
        <p>
          <a href="mailto:founder@venditas.in">founder@venditas.in</a> — for anything at all,
          including telling us it handled a CV badly. That's the most useful message you can send,
          and it gets a same-day reply.
        </p>
        <p>Venditas · Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India</p>
      </section>
    </div>
  );
}
