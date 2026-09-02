import Link from 'next/link';

/**
 * Site chrome.
 *
 * A recruitment agency about to hand us candidates' personal data is deciding
 * whether we are a real business. A named person, a real postal address and a
 * findable privacy policy do more of that work than any amount of copy — so the
 * footer is a trust asset here, not boilerplate.
 */

export function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        Venditas
      </Link>
      <div className="nav-links">
        <Link href="/pricing">Pricing</Link>
        <Link href="/security">Security</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/about">About</Link>
        <Link href="/" className="nav-cta">Try it free</Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-cols">
        <div>
          <div className="foot-head">Venditas</div>
          <p>
            CVs into your template, with the candidate's contact details stripped. Built for
            recruitment agencies.
          </p>
        </div>
        <div>
          <div className="foot-head">Product</div>
          <Link href="/">Format a CV</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div>
          <div className="foot-head">Trust</div>
          <Link href="/security">Security &amp; data</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/dpa">Data processing</Link>
        </div>
        <div>
          <div className="foot-head">Company</div>
          <Link href="/about">About</Link>
          <a href="mailto:founder@venditas.in">founder@venditas.in</a>
        </div>
      </div>
      <div className="foot-legal">
        <p>
          Venditas · Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India
        </p>
        <p>
          Candidate CVs are processed in memory and discarded. Nothing about a candidate is stored.
        </p>
      </div>
    </footer>
  );
}
