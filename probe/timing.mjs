/**
 * Timed HTTPS request.
 *
 * `fetch` cannot tell us where the time went, and "where the time went" is the
 * entire product. So we drop to node:https and hook the socket lifecycle to
 * separate DNS from TCP from TLS from the server actually thinking.
 *
 * A connection reused from a keep-alive pool would report ~0ms for dns/tcp/tls
 * and quietly corrupt the series, so every probe opens its own socket.
 */

import https from 'node:https';
import { URL } from 'node:url';

const round = (n) => (n == null ? null : Math.round(n * 100) / 100);

/**
 * @returns {Promise<{ok:boolean, httpStatus:number|null, dnsMs, tcpMs, tlsMs,
 *                     ttfbMs, totalMs, bytes:number, body:string, error:string|null}>}
 */
export function timedRequest(url, {
  method = 'GET',
  headers = {},
  body = null,
  timeoutMs = 15000,
  keepBody = false,
  maxBodyBytes = 256 * 1024,
} = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const t0 = performance.now();
    let tDns = null, tTcp = null, tTls = null, tFirstByte = null;

    let settled = false;
    const finish = (extra) => {
      if (settled) return;
      settled = true;
      const totalMs = performance.now() - t0;
      resolve({
        ok: false,
        httpStatus: null,
        dnsMs: round(tDns),
        // Each phase is reported as its own duration, not a cumulative offset:
        // "TLS took 190ms" is answerable, "TLS finished at 340ms" is not.
        tcpMs: round(tTcp != null && tDns != null ? tTcp - tDns : tTcp),
        tlsMs: round(tTls != null && tTcp != null ? tTls - tTcp : null),
        ttfbMs: round(tFirstByte),
        totalMs: round(totalMs),
        bytes: 0,
        body: '',
        error: null,
        ...extra,
      });
    };

    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method,
        headers: { 'user-agent': 'Bellwether/1.0 (+https://venditas.in/about)', ...headers },
        agent: new https.Agent({ keepAlive: false }),
        timeout: timeoutMs,
      },
      (res) => {
        let bytes = 0;
        let chunks = '';
        res.on('data', (c) => {
          if (tFirstByte == null) tFirstByte = performance.now() - t0;
          bytes += c.length;
          if (keepBody && chunks.length < maxBodyBytes) chunks += c.toString('utf8');
        });
        res.on('end', () => {
          // A response with an empty body still has a meaningful TTFB.
          if (tFirstByte == null) tFirstByte = performance.now() - t0;
          finish({
            ok: true,
            httpStatus: res.statusCode,
            bytes,
            body: chunks,
          });
        });
        res.on('error', (e) => finish({ error: `response: ${e.message}` }));
      }
    );

    req.on('socket', (socket) => {
      socket.on('lookup', () => { tDns = performance.now() - t0; });
      socket.on('connect', () => { tTcp = performance.now() - t0; });
      socket.on('secureConnect', () => { tTls = performance.now() - t0; });
    });

    req.on('timeout', () => {
      req.destroy();
      finish({ error: `timeout after ${timeoutMs}ms` });
    });
    req.on('error', (e) => finish({ error: e.message }));

    if (body) req.write(body);
    req.end();
  });
}
