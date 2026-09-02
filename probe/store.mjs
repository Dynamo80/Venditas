/**
 * Supabase access over plain REST. No SDK: this file has to run unchanged in a
 * GitHub Action, a Supabase Edge Function and on a laptop.
 */

const URL_BASE = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. See .env.example');
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`supabase ${res.status} on ${path}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function getProviders() {
  return rest('providers?select=*&order=sort.asc');
}

export async function insertProbes(rows) {
  if (!rows.length) return null;
  return rest('probes', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  });
}

/** Status pages repeat themselves constantly; the unique index absorbs it. */
export async function upsertStatusEvents(rows) {
  if (!rows.length) return null;
  return rest('status_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' },
    body: JSON.stringify(rows),
  });
}

export async function countProbes() {
  const res = await fetch(`${URL_BASE}/rest/v1/probes?select=id`, {
    headers: { ...headers, Prefer: 'count=exact', Range: '0-0' },
  });
  return res.headers.get('content-range') || '?';
}
