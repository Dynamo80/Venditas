'use client';

import { useRef, useState } from 'react';

const ACCEPT = '.pdf,.docx,.txt';

export default function Page() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const inputRef = useRef(null);

  function choose(f) {
    if (!f) return;
    setFile(f);
    setMsg(null);
  }

  function onDrop(e) {
    e.preventDefault();
    setOver(false);
    choose(e.dataTransfer.files?.[0]);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file || busy) return;

    setBusy(true);
    setMsg({ tone: 'work', text: 'Reading the CV… this takes about ten seconds.' });

    const body = new FormData(e.currentTarget);
    body.set('cv', file);

    try {
      const res = await fetch('/api/format', { method: 'POST', body });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setMsg({ tone: 'err', text: error || 'Something went wrong. Nothing was saved.' });
        return;
      }

      const blob = await res.blob();
      const ref = res.headers.get('X-Candidate-Ref') || 'candidate';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ref}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMsg({ tone: 'ok', text: `Done — downloaded as ${ref}.docx. Open it and check the formatting.` });
    } catch {
      setMsg({ tone: 'err', text: 'The upload failed. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="brand">
          Venditas <span>for recruitment agencies</span>
        </div>
        <h1>Candidate CVs in your template, with the contact details stripped.</h1>
        <p className="standfirst">
          Drop in whatever mess the candidate sent. Get back a clean Word document in your
          branding, ready to send to a client — with the candidate's name, email, phone and
          LinkedIn removed so nobody goes around you.
        </p>
      </header>

      <form className="panel" onSubmit={submit}>
        <h2>Try it on a real CV</h2>
        <p className="hint">
          Ten CVs free. No card, no account to set up — just your work email so we know
          who you are. The CV itself is processed and discarded, never stored.
        </p>

        <div className="grid">
          <label>
            <span className="lbl">Work email</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@youragency.com"
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span className="lbl">Agency name</span>
            <input type="text" name="agency" placeholder="Meridian Talent Partners" maxLength={80} />
          </label>
          <label>
            <span className="lbl">Contact line for the footer</span>
            <input type="text" name="contact" placeholder="hello@youragency.com" maxLength={80} />
          </label>
          <label>
            <span className="lbl">Brand colour</span>
            <input type="color" name="colour" defaultValue="#33418f" />
          </label>
          <label>
            <span className="lbl">Logo (PNG or JPG, optional)</span>
            <input type="file" name="logo" accept="image/png,image/jpeg" />
          </label>
        </div>

        <div
          className={`drop${over ? ' over' : ''}${file ? ' has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          <strong>{file ? file.name : 'Drop a CV here, or click to choose'}</strong>
          <span>{file ? `${(file.size / 1024).toFixed(0)} KB — click to swap` : 'PDF or Word, up to 10MB'}</span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </div>

        <div className="row">
          <button className="go" type="submit" disabled={!file || !email.trim() || busy}>
            {busy ? 'Working…' : 'Format this CV'}
          </button>
          <label className="check">
            <input type="checkbox" name="redact" value="off" defaultChecked={false} />
            <span>Keep the candidate's contact details (off by default)</span>
          </label>
        </div>

        <p className="consent">
          We'll email you about Venditas. One click unsubscribes you, and we won't pass your
          address to anyone.
        </p>

        {msg && <div className={`msg ${msg.tone}`}>{msg.text}</div>}
      </form>

      <section className="why">
        <div>
          <h3>Contact details gone by default</h3>
          <p>
            Name, email, phone and LinkedIn are removed and replaced with a reference code. Every
            document is checked after it's built — if anything would have leaked, you get an error
            instead of a file.
          </p>
        </div>
        <div>
          <h3>Nothing gets rewritten</h3>
          <p>
            Your candidate's own wording is preserved exactly. This reformats a CV; it does not
            invent achievements or embellish bullets you'll have to defend to a client.
          </p>
        </div>
        <div>
          <h3>Handles the awful ones</h3>
          <p>
            Two-column layouts, sidebars, tables, inconsistent dates, scans. The formats that break
            everything else are the ones this was built against.
          </p>
        </div>
      </section>

    </div>
  );
}
