/**
 * LinkedIn, today: who is due, how many requests have gone out, and a log.
 *
 *   node outreach/linkedin/today.mjs --due        only what is due today
 *   node outreach/linkedin/today.mjs              everything still open, by stage
 *   node outreach/linkedin/today.mjs log "<agency>" <stage> ["name"]
 *        [--at YYYY-MM-DD]   the day it happened, if not today
 *        [--note "text"]
 *        [--profile https://www.linkedin.com/in/...]   saved on the agency's row, so later steps link to them
 *        [--new --site domain]   an agency that is not in tracker.csv yet
 *        [--force]           log a request to an agency emailed in the last 14 days
 *        [--no-ledger]       don't write the shared contact ledger (testing, corrections)
 *   --today YYYY-MM-DD       act as if it were another day, e.g. to check Monday's list on Sunday
 *   node outreach/linkedin/today.mjs --json   every agency and where it stands, for board.mjs
 *
 * The same thing as a page with buttons: node outreach/linkedin/board.mjs
 *
 * Stages, in order: requested accepted msg1 msg2 replied trial paid closed
 *
 * tracker.csv is the plan: one row per agency, with the day it is planned for.
 * events.csv is the history: one row for every change, never edited. The
 * request counters are computed from events.csv, so they are counted, not guessed.
 * `log` appends an event and brings tracker.csv's stage and name up to date.
 *
 * Nothing here touches LinkedIn. Abin sends every request and message by hand.
 * This only reads and writes files. When a request is logged, it also writes the
 * shared contact ledger, so the cold-email batch leaves that agency alone for
 * the cooling-off period (outreach/contacted.mjs).
 *
 * The limits are Abin's: 15 requests a day and 100 in any 7 days. The week-one
 * packs plan fewer (8 a day). The counters warn at the limit.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, loadProspects } from '../prospects.mjs';
import { record, domainOf, recentlyContacted, COOLING_DAYS } from '../contacted.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUTREACH = path.resolve(HERE, '..');
const TRACKER = path.join(HERE, 'tracker.csv');
const EVENTS = path.join(HERE, 'events.csv');
const SENT_LOG = path.join(OUTREACH, 'sent.log');
const LEDGER = path.join(OUTREACH, 'contacted.csv');

const DAY_LIMIT = 15;
const WEEK_LIMIT = 100;
/** LinkedIn and cold email never reach the same agency inside this many days. */
const EMAIL_GAP_DAYS = 14;
const STAGES = ['requested', 'accepted', 'msg1', 'msg2', 'replied', 'trial', 'paid', 'closed'];

// ------------------------------------------------------------------- args
const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(['today', 'at', 'note', 'site', 'profile']);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const name = a.slice(2);
    if (VALUE_FLAGS.has(name)) flags[name] = argv[++i];
    else flags[name] = true;
  } else positional.push(a);
}

// ------------------------------------------------------------------ dates
// Calendar days in the machine's own timezone (IST for Abin), because "sent a
// request today" means his today, not UTC's.
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isYmd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
const toDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
/** Whole calendar days from a to b (positive when b is later). */
const daysFrom = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
const pretty = (s) => toDate(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

if (flags.today && !isYmd(flags.today)) fail(`--today needs YYYY-MM-DD, got "${flags.today}"`);
if (flags.at && !isYmd(flags.at)) fail(`--at needs YYYY-MM-DD, got "${flags.at}"`);
const TODAY = flags.today || ymd(new Date());

function fail(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

// -------------------------------------------------------------------- csv
const cell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvLine = (cols) => cols.map(cell).join(',') + '\n';

const readTracker = () => (existsSync(TRACKER) ? parseCsv(readFileSync(TRACKER, 'utf8')) : []);
const readEvents = () => (existsSync(EVENTS) ? parseCsv(readFileSync(EVENTS, 'utf8')) : []);

function writeTracker(rows) {
  writeFileSync(
    TRACKER,
    csvLine(['date', 'name', 'agency', 'stage', 'notes']) +
      rows.map((r) => csvLine([r.date, r.name, r.agency, r.stage, r.notes])).join('')
  );
}

function appendEvent(e) {
  if (!existsSync(EVENTS)) writeFileSync(EVENTS, csvLine(['at', 'date', 'agency', 'stage', 'name', 'note']));
  appendFileSync(EVENTS, csvLine([e.at, e.date, e.agency, e.stage, e.name, e.note]));
}

const noteField = (notes, key) => (new RegExp(`(?:^|;)\\s*${key}\\s+([^;\\s]+)`, 'i').exec(notes || '') || [])[1] || null;

/** Replace or add "key value" in a row's notes, which are "; "-separated. */
function setNoteField(notes, key, value) {
  const parts = String(notes || '')
    .split(';')
    .map((p) => p.trim())
    .filter((p) => p && !new RegExp(`^${key}\\s`, 'i').test(p));
  parts.push(`${key} ${value}`);
  return parts.join('; ');
}

// ------------------------------------------------------ who was emailed
let prospectIndex = null;
function prospectFor(agency) {
  if (!prospectIndex) {
    prospectIndex = new Map();
    try {
      for (const p of loadProspects()) {
        const k = (p.company || '').trim().toLowerCase();
        if (k && !prospectIndex.has(k)) prospectIndex.set(k, p);
      }
    } catch { /* no prospect lists on this machine: fall back to the site in the notes */ }
  }
  return prospectIndex.get(String(agency).trim().toLowerCase()) || null;
}

/** The latest cold email to each address and each domain, from sent.log and the ledger. */
function emailHistory() {
  const byAddress = new Map();
  const byDomain = new Map();
  const keep = (map, key, date) => {
    if (key && (!map.has(key) || map.get(key) < date)) map.set(key, date);
  };
  if (existsSync(SENT_LOG)) {
    for (const l of readFileSync(SENT_LOG, 'utf8').split('\n')) {
      const [ts, to] = l.split('\t');
      if (!ts || !to || !to.includes('@')) continue;
      const t = new Date(ts);
      if (Number.isNaN(t.getTime())) continue;
      const address = to.trim().toLowerCase();
      const domain = domainOf(address);
      if (domain === 'venditas.in') continue; // our own test sends
      keep(byAddress, address, ymd(t));
      keep(byDomain, domain, ymd(t));
    }
  }
  if (existsSync(LEDGER)) {
    for (const l of readFileSync(LEDGER, 'utf8').split('\n').slice(1)) {
      const [domain, channel, at] = l.split(',');
      if (channel !== 'email' || !domain) continue;
      const t = new Date(at);
      if (!Number.isNaN(t.getTime())) keep(byDomain, domain.trim(), ymd(t));
    }
  }
  return { byAddress, byDomain };
}

/**
 * Emailed in the last 14 days? Matched on the prospect's email address, on that
 * address's domain, and on the agency's website domain, because info@ one week
 * and the founder on LinkedIn the next is still the same agency twice.
 */
function emailedRecently(agency, notes, hist) {
  const p = prospectFor(agency);
  const site = domainOf(noteField(notes, 'site') || p?.website);
  const email = (p?.email || '').trim().toLowerCase();
  const dates = [hist.byAddress.get(email), hist.byDomain.get(domainOf(email)), hist.byDomain.get(site)].filter(Boolean);
  // The shared ledger's own check as well, for anything recorded there by another sender.
  for (const who of [site, email].filter(Boolean)) {
    const seen = recentlyContacted(who, EMAIL_GAP_DAYS);
    if (seen.contacted && seen.channel === 'email') dates.push(addDays(ymd(new Date()), -seen.daysAgo));
  }
  if (!dates.length) return null;
  const last = dates.sort().pop();
  if (daysFrom(last, TODAY) >= EMAIL_GAP_DAYS) return null;
  return { last, until: addDays(last, EMAIL_GAP_DAYS) };
}

// ------------------------------------------------------------------ state
function buildState() {
  const tracker = readTracker();
  const events = readEvents();
  const byKey = new Map();
  const key = (a) => String(a).trim().toLowerCase();
  for (const r of tracker) {
    byKey.set(key(r.agency), { agency: r.agency, planned: r.date, name: r.name, notes: r.notes, stage: '', dates: {} });
  }
  const ordered = [...events].sort((a, b) => `${a.date}${a.at}`.localeCompare(`${b.date}${b.at}`));
  for (const e of ordered) {
    const k = key(e.agency);
    if (!byKey.has(k)) byKey.set(k, { agency: e.agency, planned: '', name: '', notes: '', stage: '', dates: {} });
    const s = byKey.get(k);
    s.stage = e.stage;
    s.dates[e.stage] = e.date;
    if (e.name) s.name = e.name;
  }
  return { tracker, events, agencies: [...byKey.values()] };
}

function counters(events) {
  const requests = events.filter((e) => e.stage === 'requested');
  return {
    today: requests.filter((e) => e.date === TODAY).length,
    week: requests.filter((e) => { const d = daysFrom(e.date, TODAY); return d >= 0 && d < 7; }).length,
  };
}

function printCounters(c) {
  console.log(`  requests today          ${String(c.today).padStart(3)} / ${DAY_LIMIT}`);
  console.log(`  requests, last 7 days   ${String(c.week).padStart(3)} / ${WEEK_LIMIT}   (today and the 6 days before)`);
  if (c.today >= DAY_LIMIT) console.log(`\n  !! DAILY LIMIT: ${c.today} of ${DAY_LIMIT} requests sent today. Send no more today.`);
  if (c.week >= WEEK_LIMIT) console.log(`\n  !! 7-DAY LIMIT: ${c.week} of ${WEEK_LIMIT} requests in 7 days. Send no more until the count drops.`);
  else if (c.week >= WEEK_LIMIT * 0.8) console.log(`\n  !  ${c.week} requests in 7 days, close to the ${WEEK_LIMIT} limit.`);
}

/** Where one agency stands today, and whether anything is due. */
function classify(s, hist) {
  const stage = s.stage || 'planned';
  if (stage === 'paid' || stage === 'closed') return { stage, done: true };
  const excluded = emailedRecently(s.agency, s.notes, hist);
  if (excluded) return { stage, excluded, why: `emailed ${pretty(excluded.last)}, skip until ${pretty(excluded.until)}` };

  const since = (st) => (s.dates[st] ? daysFrom(s.dates[st], TODAY) : null);
  if (stage === 'planned') {
    if (!s.planned) return { stage, why: 'no date planned' };
    const d = daysFrom(s.planned, TODAY);
    if (d === 0) return { stage, due: 'connect', why: 'planned for today' };
    if (d > 0) return { stage, due: 'connect', why: `planned ${pretty(s.planned)}, carried over` };
    return { stage, why: `planned ${pretty(s.planned)}` };
  }
  if (stage === 'requested') {
    const d = since('requested');
    return { stage, why: `requested ${plural(d, 'day')} ago${d >= 28 ? ', pending 4 weeks: withdraw it' : ''}` };
  }
  if (stage === 'accepted') {
    const d = since('accepted');
    if (d >= 1 && d <= 3) return { stage, due: 'msg1', why: `accepted ${plural(d, 'day')} ago` };
    if (d > 3) return { stage, late: 'msg1', why: `accepted ${d} days ago, past the 1-3 day window` };
    return { stage, why: `accepted today; message one from ${pretty(addDays(s.dates.accepted, 1))}, never the same day` };
  }
  if (stage === 'msg1') {
    const d = since('msg1');
    if (d >= 5 && d <= 7) return { stage, due: 'msg2', why: `message one ${d} days ago, no reply` };
    if (d > 7) return { stage, late: 'msg2', why: `message one ${d} days ago, past the 5-7 day window` };
    return { stage, why: `message one ${plural(d, 'day')} ago; message two from ${pretty(addDays(s.dates.msg1, 5))} if no reply` };
  }
  if (stage === 'msg2') {
    const d = since('msg2');
    return { stage, why: `message two ${plural(d, 'day')} ago; no more messages${d >= 7 ? ', log it closed' : ''}` };
  }
  return { stage, conversation: true, why: `${stage} since ${pretty(s.dates[stage])}; answer the same day` };
}

function describe(s, c) {
  const who = s.name ? ` (${s.name})` : '';
  return `    ${s.agency}${who} - ${c.why}`;
}

function pointer(s, action) {
  const pack = s.planned ? `${s.planned}.md` : 'the playbook';
  const render = noteField(s.notes, 'render');
  if (action === 'connect') return `      find the person: search hint in ${pack}; connect with no note`;
  if (action === 'msg1') return `      message one in ${pack}${render ? `, attach ${render}` : ''}`;
  return `      message two in ${pack}; after it, no more messages`;
}

// ------------------------------------------------------------------- show
function show({ dueOnly }) {
  const { events, agencies } = buildState();
  const hist = emailHistory();
  const rows = agencies.map((s) => ({ s, c: classify(s, hist) }));

  console.log(`\nLinkedIn - ${pretty(TODAY)} ${TODAY.slice(0, 4)}${dueOnly ? ' - due today' : ' - everything open'}`);
  console.log('-'.repeat(66));
  printCounters(counters(events));
  const packToday = path.join(HERE, `${TODAY}.md`);
  if (existsSync(packToday)) console.log(`\n  today's pack: outreach/linkedin/${TODAY}.md`);

  const section = (title, list, withPointer) => {
    console.log(`\n  ${title}: ${list.length}`);
    for (const { s, c } of list) {
      console.log(describe(s, c));
      if (withPointer) console.log(pointer(s, withPointer));
    }
  };

  if (dueOnly) {
    section('CONNECT (no note)', rows.filter((r) => r.c.due === 'connect'), 'connect');
    section('FIRST MESSAGE (attach the render)', rows.filter((r) => r.c.due === 'msg1'), 'msg1');
    section('SECOND MESSAGE (last one)', rows.filter((r) => r.c.due === 'msg2'), 'msg2');
    const late = rows.filter((r) => r.c.late);
    if (late.length) section('Missed the window (send today or log closed)', late);
    const talk = rows.filter((r) => r.c.conversation);
    if (talk.length) section('Conversations to answer', talk);
    const skip = rows.filter((r) => r.c.excluded);
    if (skip.length) section('Emailed recently: skip, not due', skip);
    console.log('\n  after each action:  node outreach/linkedin/today.mjs log "<agency>" <stage> ["name"]');
  } else {
    for (const stage of ['planned', ...STAGES.filter((st) => st !== 'paid' && st !== 'closed')]) {
      const list = rows.filter((r) => !r.c.done && !r.c.excluded && r.c.stage === stage);
      if (!list.length) continue;
      console.log(`\n  ${stage.toUpperCase()}: ${list.length}`);
      for (const { s, c } of list) console.log(`${describe(s, c)}${c.due ? `   <- DUE: ${c.due}` : ''}${c.late ? `   <- LATE: ${c.late}` : ''}`);
    }
    const skip = rows.filter((r) => r.c.excluded);
    if (skip.length) section('EMAILED RECENTLY (skip)', skip);
    const paid = rows.filter((r) => r.c.stage === 'paid').length;
    const closed = rows.filter((r) => r.c.stage === 'closed').length;
    console.log(`\n  paid: ${paid}   closed: ${closed}`);
  }
  console.log();
}

// -------------------------------------------------------------------- log
function log() {
  const [query, stage, name = ''] = positional.slice(1);
  if (!query || !stage) fail('usage: node outreach/linkedin/today.mjs log "<agency>" <stage> ["name"]');
  if (!STAGES.includes(stage)) fail(`stage must be one of: ${STAGES.join(' ')}`);
  // Checked before anything is written, so a bad URL cannot leave an event
  // logged with the tracker row not updated.
  const profile = flags.profile ? String(flags.profile).trim().split('?')[0].replace(/\/$/, '') : '';
  if (profile && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^\s/?#;]+$/i.test(profile)) {
    fail(`--profile must be a LinkedIn profile URL (https://www.linkedin.com/in/...), got "${flags.profile}"`);
  }
  const date = flags.at || TODAY;

  const tracker = readTracker();
  const q = query.trim().toLowerCase();
  let row = tracker.find((r) => r.agency.trim().toLowerCase() === q);
  if (!row) {
    const matches = tracker.filter((r) => r.agency.toLowerCase().includes(q));
    if (matches.length === 1) row = matches[0];
    else if (matches.length > 1) fail(`"${query}" matches ${matches.length} agencies: ${matches.map((m) => m.agency).join(', ')}. Use the full name.`);
  }
  if (!row) {
    if (!flags.new) {
      const first = q.split(/\s+/)[0];
      const near = tracker.filter((r) => r.agency.toLowerCase().includes(first)).map((r) => r.agency);
      fail(`"${query}" is not in tracker.csv.${near.length ? ` Did you mean: ${near.join(', ')}?` : ''} To add a new agency: --new --site <domain>`);
    }
    row = { date, name: '', agency: query.trim(), stage: '', notes: flags.site ? `site ${domainOf(flags.site)}` : '' };
    tracker.push(row);
  }

  const hist = emailHistory();
  const excluded = emailedRecently(row.agency, row.notes, hist);
  if (stage === 'requested' && excluded && !flags.force) {
    fail(`${row.agency} was emailed ${pretty(excluded.last)}. Skip until ${pretty(excluded.until)}. If the request has already gone, log it with --force.`);
  }

  appendEvent({ at: new Date().toISOString(), date, agency: row.agency, stage, name, note: flags.note || '' });
  row.stage = stage;
  if (name) row.name = name;
  if (profile) row.notes = setNoteField(row.notes, 'profile', profile);
  writeTracker(tracker);
  console.log(`\n  logged  ${date}  ${row.agency}${name ? ` (${name})` : ''}  ->  ${stage}`);

  if (stage === 'requested') {
    const who = noteField(row.notes, 'site') || prospectFor(row.agency)?.website || prospectFor(row.agency)?.email;
    if (flags['no-ledger']) console.log('  contact ledger not written (--no-ledger)');
    else if (who && record(who, 'linkedin', `linkedin request ${row.agency}${name ? ` ${name}` : ''}`)) {
      console.log(`  held back from cold email for ${COOLING_DAYS} days (outreach/contacted.csv)`);
    } else {
      console.log('  !! no website known for this agency, so the contact ledger was NOT written. Add "site <domain>" to its notes.');
    }
  }
  console.log();
  printCounters(counters(readEvents()));
  console.log();
}

// ------------------------------------------------------------------- json
/**
 * Everything the terminal view shows, as data, for board.mjs. The board does no
 * date arithmetic of its own: every "due", "late" and "emailed recently" is
 * decided here, by the same classify() the terminal uses.
 */
function json() {
  const { events, agencies } = buildState();
  const hist = emailHistory();
  const items = agencies.map((s) => {
    const c = classify(s, hist);
    const notes = s.notes || '';
    return {
      agency: s.agency,
      name: s.name || '',
      planned: s.planned || '',
      stage: c.stage,
      due: c.due || null,
      late: c.late || null,
      conversation: Boolean(c.conversation),
      done: Boolean(c.done),
      excluded: c.excluded || null,
      why: c.why || '',
      site: noteField(notes, 'site') || domainOf(prospectFor(s.agency)?.website) || '',
      render: noteField(notes, 'render') || '',
      // Message one A carries their logo or icon; B is for a render with the name only.
      variant: /\bname only\b/i.test(notes) ? 'B' : /\b(logo|icon mark)\b/i.test(notes) ? 'A' : null,
      profile: noteField(notes, 'profile') || '',
      dates: s.dates,
    };
  });
  process.stdout.write(JSON.stringify({
    today: TODAY,
    limits: { day: DAY_LIMIT, week: WEEK_LIMIT },
    counters: counters(events),
    stages: STAGES,
    items,
  }));
}

// ------------------------------------------------------------------- main
if (flags.help || positional[0] === 'help') {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
} else if (positional[0] === 'log') {
  log();
} else if (flags.json) {
  json();
} else {
  show({ dueOnly: Boolean(flags.due) });
}
