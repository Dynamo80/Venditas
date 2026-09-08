'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * The states this page arrives in, all driven by ?state= from the verify route.
 *
 * "expired" covers wrong, already-used and genuinely expired, deliberately:
 * distinguishing them out loud would turn this page into a way of testing
 * whether a token is live.
 */
const LANDED = {
  verified: {
    tone: 'ok',
    head: 'You’re in.',
    body: 'Your account is confirmed. Point it at a real candidate CV — the messier the better, that is what it was built against.',
  },
  expired: {
    tone: 'err',
    head: 'That link has expired.',
    body: 'Links last 45 minutes and work once. Put your address in again and we’ll send a fresh one.',
  },
  missing: { tone: 'err', head: 'That link was incomplete.', body: 'Sign up again below and we’ll send another.' },
  error: { tone: 'err', head: 'Something went wrong.', body: 'That one is on us. Try again, and if it persists, reply to your demo invitation.' },
  'not-configured': { tone: 'err', head: 'Accounts are not switched on yet.', body: 'Reply to your demo invitation and we’ll set you up by hand.' },
};

export default function DemoSignup({ state }) {
  const landed = state ? LANDED[state] : null;
  const [form, setForm] = useState({ name: '', agency: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/demo/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ tone: 'err', text: data.error || 'That did not work. Try again?', appealable: data.appealable });
        return;
      }
      setDone(data.sentTo);
    } catch {
      setMsg({ tone: 'err', text: 'The request failed. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  }

  if (landed?.tone === 'ok') {
    return (
      <div className="panel">
        <div className="msg ok">
          <strong>{landed.head}</strong>
          <p style={{ margin: '6px 0 0' }}>{landed.body}</p>
        </div>
        <p style={{ marginTop: 18 }}>
          <Link href="/" className="act primary">Format a CV</Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="panel">
        <div className="msg ok">
          <strong>Check your inbox.</strong>
          <p style={{ margin: '6px 0 0' }}>
            We’ve sent a confirmation link to <strong>{done}</strong>. It works for 45 minutes,
            once. Nothing is active until you click it.
          </p>
        </div>
        <p className="hint" style={{ marginTop: 14 }}>
          Not there in a couple of minutes? Check spam, then reply to your demo invitation and
          we’ll sort it by hand.
        </p>
      </div>
    );
  }

  return (
    <form className="panel" onSubmit={submit}>
      {landed && (
        <div className={`msg ${landed.tone}`} style={{ marginBottom: 18 }}>
          <strong>{landed.head}</strong>
          <p style={{ margin: '6px 0 0' }}>{landed.body}</p>
        </div>
      )}

      <h2>Your details</h2>
      <p className="hint">
        Your work email if you have one — the account has to reach you later, for an invoice
        or a change to the template. Five CVs on your own candidates, then we talk.
      </p>

      <div className="grid">
        <label>
          <span className="lbl">Your name</span>
          <input type="text" required maxLength={80} value={form.name} onChange={set('name')}
                 placeholder="Ryan Castledine" autoComplete="name" />
        </label>
        <label>
          <span className="lbl">Agency</span>
          <input type="text" required maxLength={80} value={form.agency} onChange={set('agency')}
                 placeholder="Meridian Talent Partners" autoComplete="organization" />
        </label>
        <label>
          <span className="lbl">Work email</span>
          <input type="email" required maxLength={254} value={form.email} onChange={set('email')}
                 placeholder="you@youragency.co.uk" autoComplete="email" />
        </label>
      </div>

      <div className="row">
        <button className="go" type="submit" disabled={busy || !form.name || !form.agency || !form.email}>
          {busy ? 'Checking…' : 'Send my confirmation link'}
        </button>
      </div>

      {msg && (
        <div className={`msg ${msg.tone}`}>
          {msg.text}
          {msg.appealable && (
            <p style={{ margin: '8px 0 0' }}>
              Genuinely run on that address? <Link href="/contact">Tell us</Link> and we’ll open
              the account by hand.
            </p>
          )}
        </div>
      )}

      <p className="consent">
        We’ll email you about your account and about Venditas. One click unsubscribes you from
        the second, and we won’t pass your address to anyone. See our{' '}
        <Link href="/privacy">privacy notice</Link>.
      </p>
    </form>
  );
}
