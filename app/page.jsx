import { getIndex } from '../lib/db.mjs';
import Flash from './Flash.jsx';

export const revalidate = 60;

/**
 * Status is derived from availability over the window, not from the single most
 * recent sample. One failed probe is a blip; a pattern is an incident, and
 * calling a blip an outage is the fastest way to lose an audience's trust.
 */
function classify(s) {
  if (!s || !s.samples) return { key: 'none', label: 'No data' };
  if (s.availability < 0.9) return { key: 'down', label: 'Down' };
  if (s.availability < 0.995 || !s.latestOk) return { key: 'slow', label: 'Degraded' };
  return { key: 'up', label: 'Operational' };
}

function Spark({ buckets }) {
  if (!buckets?.length) return <div className="spark" aria-hidden="true" />;
  const vals = buckets.filter(Boolean).map((b) => b.ms).filter((n) => Number.isFinite(n));
  const max = vals.length ? Math.max(...vals) : 1;

  return (
    <div className="spark" role="img" aria-label={`Median response time, last ${buckets.length} hours`}>
      {buckets.map((b, i) => {
        if (!b || !Number.isFinite(b.ms)) return <i key={i} className="gap" style={{ height: 2 }} />;
        const h = Math.max(3, Math.round((b.ms / max) * 30));
        const bad = b.availability < 0.9;
        return <i key={i} className={bad ? 'bad' : ''} style={{ height: h }} />;
      })}
    </div>
  );
}

function Metric({ value, unit = 'ms' }) {
  if (!Number.isFinite(value)) return <div className="metric empty num">—</div>;
  return (
    <div className="metric num">
      {value}
      <span className="unit">{unit}</span>
    </div>
  );
}

export default async function Page() {
  const { configured, providers, regions, windowHours } = await getIndex();
  const hasData = providers.some((p) => p.edge?.samples || p.inference?.samples);

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="brand">
          <span className="brand-name">Bellwether</span>
          <span className="brand-tag">AI API reliability index</span>
        </div>
        <h1>Independent measurements of the APIs you ship on.</h1>
        <p className="standfirst">
          Continuous probes against OpenAI, Anthropic, Google, Groq, Mistral and Cohere.
          Not their status pages — ours. Free to read, always.
        </p>
        <div className="meta">
          <span>
            Window <b>{windowHours}h</b>
          </span>
          <span>
            Measured from <b>{regions.length ? regions.join(', ') : '—'}</b>
          </span>
          <span>
            Updated <b>{new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC</b>
          </span>
        </div>
      </header>

      <Flash />

      {!hasData ? (
        <div className="empty-state">
          <h2>Collecting.</h2>
          <p>
            {configured
              ? 'The probes are running. This page fills in as measurements land — no backfill, no synthetic data, so it stays empty until there is something true to show.'
              : 'Not yet connected to the measurement store. Once it is, this page fills in from live probes.'}
          </p>
        </div>
      ) : (
        <div className="board">
          <div className="board-head">
            <div>Provider</div>
            <div>Status</div>
            <div>Median response, {windowHours}h</div>
            <div className="num">p50</div>
            <div className="num">p95</div>
          </div>

          {providers.map((p) => {
            // Real generation latency where we have a key for it; otherwise the
            // edge measurement, which is honest about being a different thing.
            const s = p.inference?.samples ? p.inference : p.edge;
            const st = classify(s);
            const kind = p.inference?.samples ? 'inference' : 'edge only';

            return (
              <div className="row" key={p.id}>
                <div>
                  <div className="pname">{p.name}</div>
                  <div className="psub">
                    {kind}
                    {s?.samples ? ` · ${s.samples} samples` : ''}
                  </div>
                </div>
                <div>
                  <span className={`pill ${st.key}`}>{st.label}</span>
                </div>
                <Spark buckets={s?.buckets} />
                <Metric value={s?.p50} />
                <Metric value={s?.p95} />
              </div>
            );
          })}
        </div>
      )}

      <section className="cta">
        <h2>Get told before your users tell you.</h2>
        <p>
          The index above is the present tense, and it stays free. What a team needs at 3am is
          history, an alert, and evidence it can paste into an incident channel — that is the
          paid part.
        </p>
        <form className="form" action="/api/subscribe" method="post">
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            aria-label="Email address"
          />
          <button type="submit">Get alerts</button>
        </form>
        <p className="note">One email when a provider you watch degrades. Unsubscribe in one click.</p>
      </section>

      <footer>
        <p>
          Bellwether measures publicly documented API endpoints from its own infrastructure. It is
          not affiliated with any provider listed. Method and known limits are published in full —
          a measurement you cannot audit is just an assertion.
        </p>
      </footer>
    </div>
  );
}
