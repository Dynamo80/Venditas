'use client';

import { useEffect, useRef, useState } from 'react';
import { INVOICE_URL, MEETING_URL, PAY_URL, PRO } from '../lib/pricing.mjs';

const ACCEPT = '.pdf,.docx,.txt';

/** A shortlist, not an archive. Each CV is still one request and one of the trial's ten. */
const MAX_FILES = 20;

/**
 * Saved branding lives in this browser's localStorage and nowhere else.
 *
 * The pricing page promised "set it once", and the obvious build is an account
 * table on our side. This is smaller and keeps decision 006 honest by
 * construction: nothing about the agency is stored on a server, so there is
 * nothing to breach, export or delete on request. The cost is that it does not
 * follow someone to another computer, and the page says so.
 */
const STORE = 'venditas.branding.v1';
/** localStorage holds about 5MB per site; a base64 logo is a third larger than the file. */
const MAX_SAVED_LOGO_BYTES = 1024 * 1024;
/** The server's limit (lib/template.mjs), and the largest template worth keeping in the browser. */
const MAX_TEMPLATE_BYTES = 2 * 1024 * 1024;
const MAX_SAVED_TEMPLATE_BYTES = 1.5 * 1024 * 1024;

function loadBranding() {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBranding(branding) {
  try {
    localStorage.setItem(STORE, JSON.stringify(branding));
    return true;
  } catch {
    return false;
  }
}

function forgetBranding() {
  try {
    localStorage.removeItem(STORE);
  } catch {
    // Storage blocked (private window): there was nothing saved to forget.
  }
}

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function download(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * The upload form, shared by the homepage and the anonymiser page.
 *
 * `variant="anonymise"` leads with removing contact details: branding is
 * optional and folded away, and redaction cannot be switched off, because a
 * page that promises anonymisation should not offer a way out of it.
 */
export default function Formatter({ variant = 'full' }) {
  const anonymise = variant === 'anonymise';

  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [contact, setContact] = useState('');
  const [colour, setColour] = useState('#33418f');
  const [logoFile, setLogoFile] = useState(null);
  const [savedLogo, setSavedLogo] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [savedTemplate, setSavedTemplate] = useState(null);
  const [remember, setRemember] = useState(true);
  const [keepContacts, setKeepContacts] = useState(false);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [results, setResults] = useState([]);
  const [restored, setRestored] = useState(false);
  /** Shown above the form when a personal link from our email set it up. */
  const [welcome, setWelcome] = useState(null);
  const inputRef = useRef(null);
  const logoRef = useRef(null);
  const templateRef = useRef(null);
  const urlsRef = useRef([]);

  useEffect(() => {
    const saved = loadBranding();
    if (saved) {
      if (saved.email) setEmail(saved.email);
      if (saved.agency) setAgency(saved.agency);
      if (saved.contact) setContact(saved.contact);
      if (saved.colour) setColour(saved.colour);
      if (saved.logo?.dataUrl) setSavedLogo(saved.logo);
      if (saved.template?.dataUrl) setSavedTemplate(saved.template);
      setRestored(true);
    }

    // A personal link from our email (lib/prefill.mjs): the agency's name, colour
    // and logo go straight in, so one CV shows them what the email showed them.
    // Branding they saved themselves always wins over the link.
    const token = new URLSearchParams(window.location.search).get('for');
    if (token && !saved?.agency) {
      fetch(`/api/prefill?for=${encodeURIComponent(token)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((p) => {
          if (!p?.agency) return;
          setAgency(p.agency);
          if (p.colour) setColour(p.colour);
          if (p.logo) setSavedLogo({ name: 'your logo', dataUrl: p.logo, fromLink: true });
          setWelcome(`Set up for ${p.agency}${p.logo ? ', with your logo and colour already in' : ''}. Add your work email and drop in one of your own CVs.`);
        })
        .catch(() => {});
    }

    return () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function choose(list) {
    const picked = [...(list || [])];
    if (!picked.length) return;
    setFiles(picked.slice(0, MAX_FILES));
    setResults([]);
    setMsg(
      picked.length > MAX_FILES
        ? { tone: 'err', text: `That's ${picked.length} files. Up to ${MAX_FILES} go at once, so the first ${MAX_FILES} are selected.` }
        : null
    );
  }

  function onDrop(e) {
    e.preventDefault();
    setOver(false);
    choose(e.dataTransfer.files);
  }

  function forget() {
    forgetBranding();
    setSavedLogo(null);
    setRestored(false);
    setAgency('');
    setContact('');
    setColour('#33418f');
    if (logoRef.current) logoRef.current.value = '';
    setLogoFile(null);
    setSavedTemplate(null);
    if (templateRef.current) templateRef.current.value = '';
    setTemplateFile(null);
  }

  function chooseTemplate(file) {
    if (file && file.size > MAX_TEMPLATE_BYTES) {
      setMsg({ tone: 'err', text: `That template is ${(file.size / 1048576).toFixed(1)}MB. The limit is 2MB.` });
      if (templateRef.current) templateRef.current.value = '';
      setTemplateFile(null);
      return;
    }
    setTemplateFile(file || null);
  }

  async function remembered() {
    if (!remember) {
      forgetBranding();
      return;
    }
    let logo = savedLogo;
    if (logoFile) {
      logo = logoFile.size <= MAX_SAVED_LOGO_BYTES
        ? { name: logoFile.name, dataUrl: await readAsDataUrl(logoFile).catch(() => null) }
        : null;
      if (!logo?.dataUrl) logo = null;
    }
    let template = savedTemplate;
    if (templateFile) {
      template = templateFile.size <= MAX_SAVED_TEMPLATE_BYTES
        ? { name: templateFile.name, dataUrl: await readAsDataUrl(templateFile).catch(() => null) }
        : null;
      if (!template?.dataUrl) template = null;
    }
    // The browser may refuse a large template. Branding without it is still worth keeping.
    if (saveBranding({ email, agency, contact, colour, logo, template })) {
      setSavedLogo(logo);
      setSavedTemplate(template);
      setRestored(true);
    } else if (saveBranding({ email, agency, contact, colour, logo })) {
      setSavedLogo(logo);
      setSavedTemplate(null);
      setRestored(true);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!files.length || busy) return;

    setBusy(true);
    setResults([]);
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];

    let logoBlob = null;
    let logoName = null;
    if (logoFile) {
      logoBlob = logoFile;
      logoName = logoFile.name;
    } else if (savedLogo?.dataUrl) {
      logoBlob = await fetch(savedLogo.dataUrl).then((r) => r.blob()).catch(() => null);
      logoName = savedLogo.name;
    }

    let templateBlob = null;
    let templateName = null;
    if (templateFile) {
      templateBlob = templateFile;
      templateName = templateFile.name;
    } else if (savedTemplate?.dataUrl) {
      templateBlob = await fetch(savedTemplate.dataUrl).then((r) => r.blob()).catch(() => null);
      templateName = savedTemplate.name;
    }

    const out = [];
    // Once the trial or the day's limit says no, every later file would get the
    // same answer. Stop asking, and say which ones were not sent.
    let stopped = null;
    let stoppedReason = null;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (stopped) {
        out.push({ name: f.name, tone: 'skip', text: 'Not sent' });
        continue;
      }
      setMsg({
        tone: 'work',
        text: files.length > 1
          ? `Formatting ${i + 1} of ${files.length}: ${f.name}. About ten seconds each.`
          : 'Reading the CV… this takes about ten seconds.',
      });

      const body = new FormData();
      body.set('cv', f);
      body.set('email', email);
      body.set('agency', agency);
      body.set('contact', contact);
      body.set('colour', colour);
      if (logoBlob) body.set('logo', logoBlob, logoName || 'logo.png');
      if (templateBlob) body.set('template', templateBlob, templateName || 'template.docx');
      if (!anonymise && keepContacts) body.set('redact', 'off');

      try {
        const res = await fetch('/api/format', { method: 'POST', body });
        if (!res.ok) {
          const { error, reason } = await res.json().catch(() => ({}));
          out.push({ name: f.name, tone: 'err', text: error || 'Something went wrong. Nothing was saved.', reason });
          if (res.status === 429 || reason === 'disposable') {
            stopped = error || 'Limit reached.';
            stoppedReason = reason;
          }
        } else {
          const blob = await res.blob();
          const ref = res.headers.get('X-Candidate-Ref') || 'candidate';
          const url = URL.createObjectURL(blob);
          urlsRef.current.push(url);
          download(url, `${ref}.docx`);
          out.push({ name: f.name, tone: 'ok', ref, url });
        }
      } catch {
        out.push({ name: f.name, tone: 'err', text: 'The upload failed. Check your connection and try again.' });
        stopped = 'The connection failed.';
      }
      setResults([...out]);
    }

    const ok = out.filter((r) => r.tone === 'ok');
    if (ok.length) await remembered();

    if (files.length === 1) {
      const [only] = out;
      setMsg(
        only.tone === 'ok'
          ? {
              tone: 'ok',
              text: anonymise
                ? `Done — downloaded as ${only.ref}.docx. Name, email, phone and LinkedIn were removed, and the document was checked for them before it came back.`
                : `Done — downloaded as ${only.ref}.docx. Open it and check the formatting.`,
            }
          : { tone: 'err', text: only.text, buy: only.reason === 'trial-used' }
      );
      setResults([]);
    } else if (stopped) {
      setMsg({ tone: 'err', text: `${ok.length} of ${files.length} formatted. ${stopped}`, buy: stoppedReason === 'trial-used' });
    } else {
      setMsg({
        tone: ok.length === files.length ? 'ok' : 'err',
        text: `${ok.length} of ${files.length} formatted and downloaded. If your browser blocked some of the downloads, each file is linked below.`,
      });
    }
    setBusy(false);
  }

  const brandingFields = (
    <div className="grid">
      <label>
        <span className="lbl">Agency name</span>
        <input
          type="text"
          name="agency"
          placeholder="Meridian Talent Partners"
          maxLength={80}
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
        />
      </label>
      <label>
        <span className="lbl">Contact line for the footer</span>
        <input
          type="text"
          name="contact"
          placeholder="hello@youragency.com"
          maxLength={80}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </label>
      <label>
        <span className="lbl">Brand colour</span>
        <input type="color" name="colour" value={colour} onChange={(e) => setColour(e.target.value)} />
      </label>
      <div>
        <label>
          <span className="lbl">Logo (PNG or JPG, optional)</span>
          <input
            ref={logoRef}
            type="file"
            name="logo"
            accept="image/png,image/jpeg"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
        </label>
        {savedLogo && !logoFile && (
          <p className="saved">
            {savedLogo.fromLink ? 'Using the logo from your website.' : `Using your saved logo, ${savedLogo.name}.`}
            <button type="button" className="linkish" onClick={() => setSavedLogo(null)}>
              Don&apos;t use it
            </button>
          </p>
        )}
      </div>
      <div>
        <label>
          <span className="lbl">Your own Word template (.docx, optional)</span>
          <input
            ref={templateRef}
            type="file"
            name="template"
            accept=".docx,.dotx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => chooseTemplate(e.target.files?.[0] || null)}
          />
        </label>
        <p className="saved">
          Its header, footer, fonts and margins are kept, and they replace the logo and footer
          line above. Type {'{{CV}}'} where the CV should go, or it fills the page.
        </p>
        {savedTemplate && !templateFile && (
          <p className="saved">
            Using your saved template, {savedTemplate.name}.
            <button type="button" className="linkish" onClick={() => setSavedTemplate(null)}>
              Don&apos;t use it
            </button>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{anonymise ? 'Anonymise a CV' : 'Try it on a real CV'}</h2>
      <p className="hint">
        {anonymise
          ? 'Ten CVs free, no card. Name, email, phone and LinkedIn come out, a reference code goes in, and the finished document is checked for them before you get it. The CV is processed and discarded, never stored.'
          : 'Ten CVs free. No card, no account to set up — just your work email so we know who you are. Drop in a whole shortlist if you like; each CV counts as one. The CVs themselves are processed and discarded, never stored.'}
      </p>

      {welcome && <div className="msg ok">{welcome}</div>}

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
      </div>

      {anonymise ? (
        <details className="brand-fields" open={restored}>
          <summary>Add your agency&apos;s branding too (optional)</summary>
          {brandingFields}
        </details>
      ) : (
        <div className="brand-fields">{brandingFields}</div>
      )}

      <div
        className={`drop${over ? ' over' : ''}${files.length ? ' has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <strong>
          {files.length === 0
            ? 'Drop CVs here, or click to choose'
            : files.length === 1
              ? files[0].name
              : `${files.length} CVs selected`}
        </strong>
        <span>
          {files.length
            ? 'Click to choose different files'
            : `PDF or Word, up to 10MB each · a whole shortlist at once, up to ${MAX_FILES}`}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => choose(e.target.files)}
        />
      </div>

      <div className="row">
        <button className="go" type="submit" disabled={!files.length || !email.trim() || busy}>
          {busy
            ? 'Working…'
            : files.length > 1
              ? `Format ${files.length} CVs`
              : anonymise ? 'Anonymise this CV' : 'Format this CV'}
        </button>
        {!anonymise && (
          <label className="check">
            <input type="checkbox" checked={keepContacts} onChange={(e) => setKeepContacts(e.target.checked)} />
            <span>Keep the candidate&apos;s contact details (off by default)</span>
          </label>
        )}
      </div>

      <div className="row remember">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Remember my email and branding on this computer</span>
        </label>
        {restored && (
          <button type="button" className="linkish" onClick={forget}>
            Forget saved branding
          </button>
        )}
      </div>

      <p className="consent">
        We&apos;ll email you about Venditas. One click unsubscribes you, and we won&apos;t pass your
        address to anyone. Saved branding stays in this browser; it is never sent to us except with
        a CV you format.
      </p>

      {msg && (
        <div className={`msg ${msg.tone}`}>
          {msg.text}
          {/* The ten are used up: the most qualified moment on the site, so the
              next step is a button rather than an address to copy. Decision 014. */}
          {msg.buy && (
            <div className="row" style={{ marginTop: 12 }}>
              <a className="go" href={PAY_URL || INVOICE_URL}>
                Carry on: £{PRO.gbp}/month, unlimited
              </a>
              <a className="linkish" href={MEETING_URL} target="_blank" rel="noopener">
                Or book 30 minutes
              </a>
            </div>
          )}
        </div>
      )}

      {results.length > 1 && (
        <ul className="results">
          {results.map((r, i) => (
            <li key={`${r.name}-${i}`}>
              <span className="fname">{r.name}</span>
              {r.tone === 'ok' ? (
                <a href={r.url} download={`${r.ref}.docx`}>{r.ref}.docx</a>
              ) : (
                <span className={r.tone}>{r.text}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
