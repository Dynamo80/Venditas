/**
 * Inference probes: a real generation request against each provider.
 *
 * Every probe uses the same prompt, temperature 0 and the same output cap, so
 * the series stays comparable across providers and across months. Change the
 * constants below and you have broken every historical comparison, so don't.
 *
 * A provider activates only when its key is present in the environment, which
 * is how the whole thing stays free: no key, no inference probe, and the edge
 * probe still runs.
 */

import { timedRequest } from './timing.mjs';

export const PROMPT = 'Reply with exactly this word and nothing else: ok';
export const MAX_TOKENS = 16;

const openAiCompatible = (url, keyEnv, model) => ({
  keyEnv,
  build: (key) => ({
    url,
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: PROMPT }],
      max_tokens: MAX_TOKENS,
      temperature: 0,
    }),
  }),
  tokensOut: (j) => j?.usage?.completion_tokens ?? null,
});

export const INFERENCE = {
  google: {
    keyEnv: 'GEMINI_API_KEY',
    build: (key) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`,
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }] }],
        generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0 },
      }),
    }),
    tokensOut: (j) => j?.usageMetadata?.candidatesTokenCount ?? null,
  },

  groq: openAiCompatible('https://api.groq.com/openai/v1/chat/completions', 'GROQ_API_KEY', 'llama-3.1-8b-instant'),
  mistral: openAiCompatible('https://api.mistral.ai/v1/chat/completions', 'MISTRAL_API_KEY', 'mistral-small-latest'),
  openai: openAiCompatible('https://api.openai.com/v1/chat/completions', 'OPENAI_API_KEY', 'gpt-4o-mini'),

  anthropic: {
    keyEnv: 'ANTHROPIC_API_KEY',
    build: (key) => ({
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: MAX_TOKENS,
        temperature: 0,
        messages: [{ role: 'user', content: PROMPT }],
      }),
    }),
    tokensOut: (j) => j?.usage?.output_tokens ?? null,
  },

  cohere: {
    keyEnv: 'COHERE_API_KEY',
    build: (key) => ({
      url: 'https://api.cohere.com/v2/chat',
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'command-r7b-12-2024',
        max_tokens: MAX_TOKENS,
        temperature: 0,
        messages: [{ role: 'user', content: PROMPT }],
      }),
    }),
    tokensOut: (j) => j?.usage?.tokens?.output_tokens ?? null,
  },
};

/** Which providers have a key available right now. */
export function activeInferenceProviders() {
  return Object.entries(INFERENCE)
    .filter(([, cfg]) => !!process.env[cfg.keyEnv])
    .map(([id]) => id);
}

export async function probeInference(providerId) {
  const cfg = INFERENCE[providerId];
  if (!cfg) return null;
  const key = process.env[cfg.keyEnv];
  if (!key) return null;

  const spec = cfg.build(key);
  const r = await timedRequest(spec.url, {
    method: spec.method,
    headers: { 'content-type': 'application/json', ...spec.headers },
    body: spec.body,
    keepBody: true,
    timeoutMs: 30000,
  });

  let tokensOut = null;
  let error = r.error;
  const httpOk = r.httpStatus != null && r.httpStatus >= 200 && r.httpStatus < 300;

  if (httpOk) {
    try {
      tokensOut = cfg.tokensOut(JSON.parse(r.body));
    } catch {
      // A 2xx we cannot parse is a real failure worth recording, not a shrug.
      error = 'unparseable response body';
    }
  } else if (!error && r.httpStatus != null) {
    error = `http ${r.httpStatus}: ${r.body.slice(0, 180)}`;
  }

  return {
    kind: 'inference',
    ok: httpOk && !error,
    http_status: r.httpStatus,
    dns_ms: r.dnsMs,
    tcp_ms: r.tcpMs,
    tls_ms: r.tlsMs,
    ttfb_ms: r.ttfbMs,
    total_ms: r.totalMs,
    tokens_out: tokensOut,
    error: error ? String(error).slice(0, 500) : null,
  };
}
