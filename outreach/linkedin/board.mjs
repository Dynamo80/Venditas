/**
 * LinkedIn, today, as a page with buttons instead of a terminal.
 *
 *   node outreach/linkedin/board.mjs            opens http://127.0.0.1:4777
 *   node outreach/linkedin/board.mjs --no-open  just serve it
 *
 * Or double-click outreach/linkedin/board.cmd.
 *
 * Every read and every write goes through today.mjs (`--json` to read, `log` to
 * write), so the page and the terminal share one tracker, one set of limits and
 * one rule for what is due. The page adds what a terminal can't: a button that
 * opens the right LinkedIn search, the message already filled in with their name,
 * the sample CV ready to copy, and one click to log.
 *
 * WHAT IT DOES NOT DO
 *
 * It never touches LinkedIn. Connect and Send are clicks made on linkedin.com,
 * because the account is the asset (START-HERE.md) and automating it is how
 * accounts get restricted.
 *
 * Opening a search does not log a request. Only "I sent the request" does. A
 * request logged but never sent still counts against the 15-a-day limit, and still
 * holds that agency back from cold email for 21 days.
 *
 * It listens on 127.0.0.1 only, and it refuses a write that does not come from its
 * own page, so another website open in the same browser cannot log anything.
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TODAY_MJS = path.join(HERE, 'today.mjs');
const RENDERS = path.join(HERE, 'renders');
const PORT = Number(process.env.BOARD_PORT || 4777);
// 127.0.0.1 rather than localhost: on this machine localhost resolves to IPv6
// first, and the server listens on IPv4 only.
const URL_BASE = `http://127.0.0.1:${PORT}`;
const HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
const STAGES = ['requested', 'accepted', 'msg1', 'msg2', 'replied', 'trial', 'paid', 'closed'];

// ------------------------------------------------------------------ today.mjs

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [TODAY_MJS, ...args], { cwd: path.resolve(HERE, '..', '..'), windowsHide: true });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => resolve({ code, out, err }));
    child.on('error', (e) => resolve({ code: 1, out: '', err: e.message }));
  });
}

// ---------------------------------------------------------------------- packs

/**
 * What the day packs know that the tracker doesn't: the search that finds the
 * person, where the agency is, and a line in its own words.
 */
function packDetails() {
  const out = new Map();
  for (const f of readdirSync(HERE).filter((n) => /^\d{4}-\d{2}-\d{2}\.md$/.test(n)).sort()) {
    const text = readFileSync(path.join(HERE, f), 'utf8').replace(/\r/g, '');
    for (const block of text.split(/^### /m).slice(1)) {
      const head = /^\d+\.\s+(.+?)\s+\(([^)]*)\)\s*$/m.exec(block);
      if (!head) continue;
      out.set(head[1].trim().toLowerCase(), {
        about: head[2].trim(),
        query: /Search[^`\n]*`([^`]+)`/.exec(block)?.[1] || '',
        words: /Their own words:\s*"([^"]+)"/.exec(block)?.[1] || '',
      });
    }
  }
  return out;
}

/** The three messages, word for word, from the first pack that carries them. */
function messages() {
  for (const f of readdirSync(HERE).filter((n) => /^\d{4}-\d{2}-\d{2}\.md$/.test(n)).sort()) {
    const text = readFileSync(path.join(HERE, f), 'utf8').replace(/\r/g, '');
    const grab = (label) => new RegExp(`\\*\\*${label}[^\\n]*\\n+\`\`\`\\n([\\s\\S]*?)\\n\`\`\``).exec(text)?.[1] || '';
    const found = { A: grab('Message one A'), B: grab('Message one B'), two: grab('Message two') };
    if (found.A || found.B || found.two) return found;
  }
  return { A: '', B: '', two: '' };
}

// ----------------------------------------------------------------------- http

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req, limit = 10_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const clean = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').replace(/^-+/, '').trim().slice(0, max);

async function today(req, res, query) {
  const args = ['--json'];
  if (/^\d{4}-\d{2}-\d{2}$/.test(query.get('today') || '')) args.push('--today', query.get('today'));
  const r = await run(args);
  if (r.code !== 0) return send(res, 500, { error: (r.err || r.out || 'today.mjs failed').trim() });
  const data = JSON.parse(r.out);
  const packs = packDetails();
  for (const item of data.items) Object.assign(item, packs.get(item.agency.toLowerCase()) || {});
  data.messages = messages();
  send(res, 200, data);
}

async function logStage(req, res) {
  // A JSON body and a custom header: a form or image on another website cannot
  // send either without the browser first asking this server, which never says yes.
  if (!/application\/json/.test(req.headers['content-type'] || '') || req.headers['x-board'] !== '1') {
    return send(res, 403, { ok: false, error: 'Writes come from the board page only.' });
  }
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { ok: false, error: 'Unreadable request.' });
  }
  const agency = clean(body.agency, 200);
  const stage = clean(body.stage, 20);
  if (!agency) return send(res, 400, { ok: false, error: 'No agency given.' });
  if (!STAGES.includes(stage)) return send(res, 400, { ok: false, error: `Unknown stage "${stage}".` });

  const args = ['log', agency, stage];
  const name = clean(body.name, 100);
  if (name) args.push(name);
  const profile = clean(body.profile, 300);
  if (profile) args.push('--profile', profile);
  const note = clean(body.note, 200);
  if (note) args.push('--note', note);
  if (/^\d{4}-\d{2}-\d{2}$/.test(body.today || '')) args.push('--today', body.today);
  if (body.force === true) args.push('--force');

  const r = await run(args);
  if (r.code !== 0) {
    const error = (r.err || r.out || 'Not logged.').trim();
    return send(res, 200, { ok: false, error, canForce: /--force/.test(error) && body.force !== true });
  }
  const first = r.out.split('\n').map((l) => l.trim()).filter(Boolean);
  send(res, 200, { ok: true, message: first.slice(0, 2).join('\n') });
}

function render(res, pathname) {
  const file = decodeURIComponent(pathname.slice('/renders/'.length));
  if (!/^[A-Za-z0-9._-]+\.(png|docx)$/.test(file)) return send(res, 404, { error: 'not found' });
  const full = path.join(RENDERS, file);
  if (!existsSync(full)) return send(res, 404, { error: 'not found' });
  res.writeHead(200, {
    'content-type': file.endsWith('.png') ? 'image/png' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'cache-control': 'no-store',
  });
  createReadStream(full).pipe(res);
}

const server = http.createServer(async (req, res) => {
  // Only this machine's own name for itself, so a website that points a
  // domain at 127.0.0.1 cannot talk to the board either.
  if (!HOSTS.has(req.headers.host || '')) return send(res, 421, { error: 'wrong host' });
  const { pathname, searchParams } = new URL(req.url, URL_BASE);
  try {
    if (req.method === 'GET' && pathname === '/') {
      return send(res, 200, readFileSync(path.join(HERE, 'board.html')), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && pathname === '/api/today') return await today(req, res, searchParams);
    if (req.method === 'POST' && pathname === '/api/log') return await logStage(req, res);
    if (req.method === 'GET' && pathname.startsWith('/renders/')) return render(res, pathname);
    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 500, { ok: false, error: e.message });
  }
});

function openBrowser() {
  if (process.argv.includes('--no-open')) return;
  if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', URL_BASE], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`\n  The board is already running: ${URL_BASE}\n`);
    openBrowser();
    process.exit(0);
  }
  console.error(e.message);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  LinkedIn board: ${URL_BASE}`);
  console.log('  Same tracker as today.mjs. Close this window to stop it.\n');
  openBrowser();
});
