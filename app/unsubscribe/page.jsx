import { tokenValid } from '../../lib/unsub.mjs';
import { removeContact } from '../../lib/meter.mjs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Unsubscribe — Venditas' };

/**
 * Opting out happens on load, not on a confirmation click.
 *
 * Asking someone to confirm that they meant it is a dark pattern dressed as
 * politeness: they already clicked unsubscribe, in an email, on purpose. Every
 * extra step is a chance to fail, and a failed opt-out becomes a spam report.
 */
export default async function Unsubscribe({ searchParams }) {
  const params = await searchParams;
  const email = (params?.e || '').toString().trim().toLowerCase();
  const token = (params?.t || '').toString();

  let state = 'invalid';
  if (email && tokenValid(email, token)) {
    state = (await removeContact(email, 'unsubscribed via link')) ? 'done' : 'error';
  }

  return (
    <div className="wrap" style={{ maxWidth: 620 }}>
      <div className="brand" style={{ marginBottom: 28 }}>
        Venditas <span>for recruitment agencies</span>
      </div>

      {state === 'done' && (
        <>
          <h1 style={{ fontSize: 30 }}>Done. You won't hear from us again.</h1>
          <p className="standfirst">
            <strong>{email}</strong> has been removed. No confirmation email — that would rather
            defeat the point.
          </p>
          <p className="standfirst" style={{ fontSize: 15 }}>
            The tool at <a href="/">venditas.in</a> still works if you ever want it. This only
            stops the emails.
          </p>
        </>
      )}

      {state === 'invalid' && (
        <>
          <h1 style={{ fontSize: 30 }}>That link didn't work.</h1>
          <p className="standfirst">
            It may have been broken by your email client. Email{' '}
            <a href="mailto:founder@venditas.in?subject=unsubscribe">founder@venditas.in</a> with
            the word unsubscribe and it will be done by hand, same day.
          </p>
        </>
      )}

      {state === 'error' && (
        <>
          <h1 style={{ fontSize: 30 }}>Something went wrong at our end.</h1>
          <p className="standfirst">
            We couldn't record it just now — which is our fault, not yours. Email{' '}
            <a href="mailto:founder@venditas.in?subject=unsubscribe">founder@venditas.in</a> and
            it will be done by hand.
          </p>
        </>
      )}

      <footer style={{ marginTop: 44 }}>
        <p>Venditas · Bhoomi Elite, Sector 28, Nerul, Navi Mumbai 400706, India</p>
      </footer>
    </div>
  );
}
