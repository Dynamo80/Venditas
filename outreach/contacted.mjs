/**
 * One record of who has been contacted, across every channel.
 *
 * WHY THIS EXISTS
 * 145 of the agencies in prospects.csv are UK, and the LinkedIn plan targets
 * exactly the same people. A connection request on Tuesday and a cold email on
 * Thursday, from the same person, about the same product, reads as a machine
 * working a list — which is precisely the impression that loses this audience.
 * Recruiters recognise a sales sequence professionally; getting caught running
 * one is worse than not running one.
 *
 * So both channels read and write the same ledger, and neither touches anyone
 * the other reached inside the cooling-off window.
 *
 *   node outreach/contacted.mjs                  show the ledger
 *   node outreach/contacted.mjs add <who> <ch>   record a touch
 *
 * Keyed by domain, not email address. An agency is one organisation: emailing
 * info@ and messaging the founder on LinkedIn is two approaches to the same
 * company, and the ledger has to know that.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const LEDGER = path.join(ROOT, 'outreach', 'contacted.csv');

/** Days before the other channel may approach the same agency. */
export const COOLING_DAYS = 21;

/** info@acme.co.uk -> acme.co.uk ; https://www.acme.co.uk/x -> acme.co.uk */
export function domainOf(value) {
  if (!value) return null;
  let s = String(value).trim().toLowerCase();
  if (s.includes('@')) s = s.split('@')[1];
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  return s || null;
}

function rows() {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, 'utf8')
    .split('\n')
    .slice(1)
    .filter((l) => l.trim())
    .map((l) => {
      const [domain, channel, at, note] = l.split(',');
      return { domain, channel, at, note };
    });
}

export function record(who, channel, note = '') {
  const domain = domainOf(who);
  if (!domain) return false;
  if (!existsSync(LEDGER)) {
    writeFileSync(LEDGER, 'domain,channel,at,note\n');
  }
  appendFileSync(LEDGER, `${domain},${channel},${new Date().toISOString()},${note.replace(/[,\n]/g, ' ')}\n`);
  return true;
}

/**
 * Has this agency been approached recently, on any channel?
 * @returns {{contacted:boolean, channel?:string, daysAgo?:number}}
 */
export function recentlyContacted(who, withinDays = COOLING_DAYS) {
  const domain = domainOf(who);
  if (!domain) return { contacted: false };
  const cutoff = Date.now() - withinDays * 86400_000;
  for (const r of rows()) {
    if (r.domain !== domain) continue;
    const t = Date.parse(r.at);
    if (Number.isFinite(t) && t >= cutoff) {
      return { contacted: true, channel: r.channel, daysAgo: Math.floor((Date.now() - t) / 86400_000) };
    }
  }
  return { contacted: false };
}

if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/') || process.argv[1]?.endsWith('contacted.mjs')) {
  const [cmd, who, channel, ...rest] = process.argv.slice(2);
  if (cmd === 'add' && who && channel) {
    record(who, channel, rest.join(' '));
    console.log(`recorded: ${domainOf(who)} via ${channel}`);
  } else {
    const all = rows();
    console.log(`\n${all.length} touches recorded · cooling-off ${COOLING_DAYS} days\n`);
    const byChannel = {};
    for (const r of all) byChannel[r.channel] = (byChannel[r.channel] || 0) + 1;
    for (const [c, n] of Object.entries(byChannel)) console.log(`  ${c.padEnd(12)} ${n}`);
    console.log();
    for (const r of all.slice(-12)) {
      console.log(`  ${r.at?.slice(0, 10)}  ${r.channel?.padEnd(10)} ${r.domain}`);
    }
    console.log();
  }
}

/**
 * Is it a sensible moment to email a UK recruitment agency?
 *
 * Saturday and Sunday are out: a cold email landing then is read on Monday
 * under the weekend's backlog, if at all. Before 07:00 and after 18:00 UK are
 * also poor — an email at 4am is at the bottom of the pile by the time anyone
 * looks.
 */
export function isSendableNow(now = new Date()) {
  // UK is UTC+1 from late March to late October.
  const month = now.getUTCMonth();
  const ukOffset = month >= 2 && month <= 9 ? 1 : 0;
  const uk = new Date(now.getTime() + ukOffset * 3600_000);
  const day = uk.getUTCDay();
  const hour = uk.getUTCHours();
  if (day === 0 || day === 6) return { ok: false, why: 'weekend in the UK' };
  if (hour < 7) return { ok: false, why: `${hour}:00 UK — too early` };
  if (hour >= 18) return { ok: false, why: `${hour}:00 UK — after hours` };
  return { ok: true, why: `${hour}:00 UK, weekday` };
}
