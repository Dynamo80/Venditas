import { loadLegal } from '../../lib/legal.mjs';

export const dynamic = 'force-static';
export const metadata = {
  title: 'Privacy — Venditas',
  description: 'What happens to a CV you upload, what we store, and what we never keep.',
};

export default function Page() {
  const { title, html } = loadLegal('privacy');
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>{title}</h1>
      </header>
      <article className="prose legal" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
