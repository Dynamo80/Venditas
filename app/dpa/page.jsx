import { loadLegal } from '../../lib/legal.mjs';

export const dynamic = 'force-static';
export const metadata = {
  title: 'Data processing agreement — Venditas',
  description: 'The data processing agreement for agencies using Venditas, with sub-processors and transfer terms.',
};

export default function Page() {
  const { title, html } = loadLegal('dpa');
  return (
    <div className="wrap">
      <header className="masthead">
        <h1>{title}</h1>
      </header>
      <article className="prose legal" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
