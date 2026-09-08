import DemoSignup from './DemoSignup.jsx';

export const metadata = {
  title: 'Set up your Venditas account',
  description:
    'Confirm your work email and your Venditas account is ready — your branded template, contact details stripped, on your own candidate CVs.',
  alternates: { canonical: 'https://venditas.in/demo' },
  // Nothing here belongs in a search index: it is the page you land on from a
  // demo invitation, and half its states are error messages.
  robots: { index: false, follow: false },
};

export default async function DemoPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>Set up your account</h1>
        <p className="standfirst">
          One confirmation email, and the tool is yours to point at your own candidate CVs —
          your branding, contact details stripped, as many as the trial allows.
        </p>
      </header>
      <DemoSignup state={params?.state || null} />
    </div>
  );
}
