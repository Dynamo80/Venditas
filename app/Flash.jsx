'use client';

import { useEffect, useState } from 'react';

const MESSAGES = {
  ok: { tone: 'ok', text: "You're on the list. We'll only mail you when something actually breaks." },
  invalid: { tone: 'warn', text: "That address didn't look right — mind checking it?" },
  error: { tone: 'crit', text: "Something broke on our end. Try again in a moment." },
};

/**
 * Read on the client so the page itself stays static: this banner appears for
 * one person after one redirect, and it isn't worth making every request
 * render dynamically on a day when there might be a lot of them.
 */
export default function Flash() {
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get('subscribed');
    if (!state || !MESSAGES[state]) return;
    setMsg(MESSAGES[state]);
    // Drop the parameter so a refresh doesn't replay the message.
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  if (!msg) return null;
  return (
    <div className={`flash ${msg.tone}`} role="status">
      {msg.text}
    </div>
  );
}
