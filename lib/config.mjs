/**
 * Resolving secrets from the environment, defensively.
 *
 * A secret pasted out of a masked field arrives full of U+2022 bullets — the
 * dots the UI was drawing, not the value underneath. It looks plausible, it is
 * the right length, and it fails deep inside an HTTP client with an error about
 * ByteString conversion that names nothing useful.
 *
 * So: accept the key under more than one name, take the first one that is
 * actually usable, and say clearly which was used. A second name matters more
 * than it sounds — re-entering a variable that already exists means opening a
 * form pre-filled with bullets, and a fresh name has no such trap.
 */

/** Header values must be Latin-1. Anything outside printable ASCII is a paste artefact. */
export function isCleanSecret(value) {
  if (typeof value !== 'string' || !value) return false;
  return /^[\x20-\x7e]+$/.test(value);
}

/**
 * @returns {{ value: string|null, name: string|null, rejected: string[] }}
 */
export function pickSecret(...names) {
  const rejected = [];
  for (const name of names) {
    const raw = process.env[name];
    if (!raw) continue;
    const value = raw.trim();
    if (isCleanSecret(value)) return { value, name, rejected };
    rejected.push(name);
  }
  return { value: null, name: null, rejected };
}

export const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim() || null;

/**
 * SUPABASE_SECRET is the preferred name. SUPABASE_SERVICE_KEY is still honoured
 * so an existing deployment keeps working.
 */
export const supabaseKey = pickSecret('SUPABASE_SECRET', 'SUPABASE_SERVICE_KEY');

export const geminiKey = pickSecret('GEMINI_API_KEY');
