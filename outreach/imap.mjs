/**
 * Minimal IMAP, written directly because the registry was unreachable.
 *
 * Two jobs, both of which the SMTP-only sender could not do:
 *
 *   APPEND — put a copy of every outbound message in the Sent folder. Sending
 *   is SMTP; the Sent folder is IMAP. A mail client writes that copy itself
 *   after sending, and a script talking SMTP never does — so the founder had
 *   twenty-five emails go out and an empty Sent folder, with no way to tell
 *   whether anything had happened.
 *
 *   SEARCH/FETCH — read the inbox for bounces and replies. Until now the only
 *   evidence a message arrived was the relay saying it had accepted it, which
 *   is not the same thing.
 *
 * Only the handful of commands needed for those two, deliberately. A full IMAP
 * client is a large and unpleasant thing and none of the rest is wanted here.
 */

import tls from 'node:tls';

const CRLF = '\r\n';

export class Imap {
  constructor({ host, port = 993, user, pass }) {
    Object.assign(this, { host, port, user, pass });
    this.tag = 0;
    this.buffer = '';
    this.pending = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.sock = tls.connect({ host: this.host, port: this.port, servername: this.host }, () => {});
      this.sock.setEncoding('utf8');
      this.sock.on('data', (d) => this._onData(d));
      this.sock.on('error', reject);
      // The server greets first; nothing may be sent until it has.
      this.greeting = new Promise((res) => { this._greet = res; });
      this.greeting.then(resolve);
      setTimeout(() => reject(new Error('imap connect timeout')), 20000);
    });
  }

  _onData(chunk) {
    this.buffer += chunk;
    if (this._greet && /^\* (OK|PREAUTH)/m.test(this.buffer)) {
      const g = this._greet; this._greet = null; this.buffer = ''; g();
      return;
    }
    if (!this.pending) return;
    const { tag, resolve, reject } = this.pending;
    // A tagged response on its own line ends the command.
    const done = new RegExp(`^${tag} (OK|NO|BAD)([^\\r\\n]*)`, 'm').exec(this.buffer);
    if (!done) {
      // A literal continuation: the server is ready for the payload.
      if (this.pending.literal && /^\+/m.test(this.buffer)) {
        const payload = this.pending.literal;
        this.pending.literal = null;
        this.sock.write(payload + CRLF);
      }
      return;
    }
    const body = this.buffer;
    this.buffer = '';
    this.pending = null;
    if (done[1] === 'OK') resolve(body);
    else reject(new Error(`${done[1]}${done[2]}`));
  }

  send(command, literal = null) {
    return new Promise((resolve, reject) => {
      const tag = `A${String(++this.tag).padStart(4, '0')}`;
      this.pending = { tag, resolve, reject, literal };
      this.sock.write(`${tag} ${command}${CRLF}`);
      setTimeout(() => {
        if (this.pending?.tag === tag) {
          this.pending = null;
          reject(new Error(`imap timeout: ${command.slice(0, 40)}`));
        }
      }, 30000);
    });
  }

  async login() {
    // Quoted, because a password containing a space or a bracket would
    // otherwise be parsed as two arguments.
    return this.send(`LOGIN "${this.user}" "${this.pass.replace(/(["\\])/g, '\\$1')}"`);
  }

  async listFolders() {
    const res = await this.send('LIST "" "*"');
    return [...res.matchAll(/^\* LIST \([^)]*\) "[^"]*" "?([^"\r\n]+)"?/gm)].map((m) => m[1]);
  }

  /** Put a copy of an outbound message in Sent, so the founder can see it. */
  async append(folder, raw, flags = '\\Seen') {
    const bytes = Buffer.byteLength(raw, 'utf8');
    return this.send(`APPEND "${folder}" (${flags}) {${bytes}}`, raw);
  }

  async select(folder) {
    return this.send(`SELECT "${folder}"`);
  }

  /** @returns {number[]} message sequence numbers */
  async search(criteria) {
    const res = await this.send(`SEARCH ${criteria}`);
    const line = /^\* SEARCH([^\r\n]*)/m.exec(res);
    if (!line || !line[1].trim()) return [];
    return line[1].trim().split(/\s+/).map(Number).filter(Boolean);
  }

  /** Headers only: enough to spot a bounce or a reply without pulling bodies. */
  async headers(seq) {
    const res = await this.send(`FETCH ${seq} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])`);
    const out = {};
    for (const [, k, v] of res.matchAll(/^(From|Subject|Date):\s*([^\r\n]*)/gim)) {
      out[k.toLowerCase()] = v.trim();
    }
    return out;
  }

  async logout() {
    try { await this.send('LOGOUT'); } catch { /* closing anyway */ }
    this.sock?.destroy();
  }
}

/** Sent is called different things by different providers. Find the real one. */
export function pickFolder(folders, candidates) {
  for (const want of candidates) {
    const hit = folders.find((f) => f.toLowerCase() === want.toLowerCase());
    if (hit) return hit;
  }
  for (const want of candidates) {
    const hit = folders.find((f) => f.toLowerCase().includes(want.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}
