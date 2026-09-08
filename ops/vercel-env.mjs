/**
 * Print the production environment block, ready to paste into Vercel.
 *
 *   node ops/vercel-env.mjs            print it (secrets masked)
 *   node ops/vercel-env.mjs --reveal   print it for real
 *   node ops/vercel-env.mjs --copy     put the real thing on the clipboard
 *
 * Vercel's "Add New" env var dialog accepts a pasted .env block and splits it
 * into separate variables, so this is one paste rather than nine.
 *
 * --copy is the one to use. A password read off a screen gets retyped, and a
 * retyped password is how you end up with the failure lib/config.mjs exists to
 * diagnose. It also keeps the secret out of the terminal scrollback.
 */

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..'
);

const file = path.join(ROOT, '.env.local');
if (!existsSync(file)) {
  console.error('.env.local not found — run this from the machine that sends outreach.');
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const argv = process.argv.slice(2);
const reveal = argv.includes('--reveal') || argv.includes('--copy');

/**
 * DEMO_SECRET signs the verification links and the session cookies. Without it
 * they are signed with the Supabase service key, which works until the day that
 * key is rotated and every pending link and signed-in browser dies with it.
 * Generated here rather than reused from anything.
 */
const demoSecret = env.DEMO_SECRET || randomBytes(32).toString('base64url');

const SECRET = new Set(['SMTP_PASS', 'SUPABASE_SECRET', 'GEMINI_API_KEY', 'DEMO_SECRET']);
const WANT = [
  ['SMTP_HOST', env.SMTP_HOST],
  ['SMTP_PORT', env.SMTP_PORT || '465'],
  ['SMTP_USER', env.SMTP_USER],
  ['SMTP_PASS', env.SMTP_PASS],
  ['SMTP_FROM_NAME', env.SMTP_FROM_NAME || 'Venditas'],
  ['DEMO_SECRET', demoSecret],
];

const missing = WANT.filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`missing from .env.local: ${missing.join(', ')}`);
  process.exit(1);
}

const block = WANT.map(([k, v]) => `${k}=${v}`).join('\n');
const masked = WANT
  .map(([k, v]) => `${k}=${SECRET.has(k) ? `<${v.length} chars>` : v}`)
  .join('\n');

if (argv.includes('--copy')) {
  // `clip` on Windows, `pbcopy` on macOS, `xclip` elsewhere.
  const cmd = process.platform === 'win32' ? 'clip'
    : process.platform === 'darwin' ? 'pbcopy' : 'xclip';
  const args = cmd === 'xclip' ? ['-selection', 'clipboard'] : [];
  const res = spawnSync(cmd, args, { input: block });
  if (res.error || res.status !== 0) {
    console.error(`could not reach the clipboard (${cmd}). Use --reveal and copy by hand.`);
    process.exit(1);
  }
  console.log('\nOn the clipboard — 6 variables:\n');
  console.log(masked.split('\n').map((l) => '  ' + l).join('\n'));
  console.log(`
Paste into Vercel → Settings → Environment Variables → Add New.
Tick Production (and Preview if you want to test on a branch URL).
Then redeploy: env vars only take effect on the next build.

Verify afterwards:  node ops/preflight.mjs
`);
} else {
  console.log(`\n${reveal ? block : masked}\n`);
  if (!reveal) console.log('Secrets masked. Use --copy to put the real block on the clipboard.\n');
}
