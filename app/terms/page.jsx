import { loadLegal } from '../../lib/legal.mjs';

export const dynamic = 'force-static';
export const metadata = {
  title: 'Terms — Venditas',
  description: 'Terms of service for Venditas, including the limits of machine-generated output.',
};

export default function Page() {
  const { title, html } = loadLegal('terms');
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>{title}</h1>
      </header>
      <article className="prose legal" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
