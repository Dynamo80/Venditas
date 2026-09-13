/**
 * Build a day's outreach batch.
 *
 *   node outreach/batch.mjs                 build 25, write for review, send nothing
 *   node outreach/batch.mjs --n 10          smaller batch
 *   node outreach/batch.mjs --send --confirm  actually send
 *
 * Sending needs BOTH flags. One flag is too close to a typo for something that
 * mails strangers from a domain we cannot un-burn.
 *
 * Each prospect gets a real sample CV rendered in their own branding, matched
 * to what they recruit for. A finance recruiter opening a software engineer's
 * CV is a much weaker demonstration than one opening a financial controller's.
 *
 * The six sample CVs are extracted once and cached. Rendering is free after
 * that, so a batch of 285 costs six model calls rather than 285.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { render, makeReference } from '../lib/render.mjs';
import { preview } from '../lib/preview.mjs';
import { sampleFor, safeColour, loadSamples, fetchLogo } from './samples.mjs';
import { parseCsv } from './prospects.mjs';
import { send, closeTransport, suppressed, SENDER, DAILY_CAP } from './send.mjs';
import { recentlyContacted, record, COOLING_DAYS, isSendableNow } from './contacted.mjs';
import { scanInbox } from './inbox.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const WANT = Number(opt('n', DAILY_CAP));
const DO_SEND = flag('send') && flag('confirm');

// ------------------------------------------------------------------ message
/** "Opus Recruitment Solutions'", not "Solutions's". */
const possessive = (name) => (/s$/i.test(name) ? `${name}'` : `${name}'s`);

/**
 * `branded` is false when neither a logo nor a verified colour was found. The
 * document is then set in our neutral with the agency's name in type, and
 * calling that "your branding" to someone who pays for a branding tool is a
 * claim they can check in one glance.
 */
function compose(p, { branded = true } = {}) {
  const first = (p.contact_first || '').trim();
  const greeting = first ? `Hi ${first},` : 'Hi,';
  const agency = p.company || 'your agency';
  if (p.incumbent) return composeSwitch(p, greeting, agency, branded);
  if (isNewAgency(p)) return composeNew(p, greeting, agency, branded);

  // The image is shown inline, not attached. A .docx from a stranger is a thing
  // security-aware people do not open, it raises spam scores, and some mail
  // gateways quarantine it outright - and the entire pitch depends on them
  // seeing the document. So they see it, with nothing to open and nothing to
  // trust. The real Word file goes out when they reply.
  const text = `${greeting}

${branded
    ? `The image below is a candidate CV rebuilt in ${possessive(agency)} branding - your
colours, the contact details stripped out, a reference code where the name was.`
    : `The image below is a candidate CV rebuilt for ${agency} - the contact details
stripped out, a reference code where the name was. With your logo and colours
it comes out the same way.`}

It took about ten seconds. I built the thing that made it.

If anyone there still rebuilds CVs into your template by hand before they go to
a client, that is the job it does. Whatever the candidate sent - two columns,
tables, a scan - comes back looking like this.

Reply and I will send the editable Word file, or run one of your own at
${SENDER.site} - ten free, no card.

${SENDER.person}`;

  const html = `<div style="font:15px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14181d;max-width:640px">
<p>${greeting}</p>
<p>${branded
    ? `The image below is a candidate CV rebuilt in <strong>${possessive(agency)}</strong> branding &mdash; your colours, the contact details stripped out, a reference code where the name was.`
    : `The image below is a candidate CV rebuilt for <strong>${agency}</strong> &mdash; the contact details stripped out, a reference code where the name was. With your logo and colours it comes out the same way.`}</p>
<p>It took about ten seconds. I built the thing that made it.</p>
<p>If anyone there still rebuilds CVs into your template by hand before they go to a client, that is the job it does. Whatever the candidate sent &mdash; two columns, tables, a scan &mdash; comes back looking like this.</p>
<p><img src="cid:cvpreview" alt="Candidate CV in ${agency} branding" style="width:100%;max-width:600px;border:1px solid #dfe3e9;border-radius:4px"></p>
<p>Reply and I will send the editable Word file, or run one of your own at <a href="${SENDER.site}">venditas.in</a> &mdash; ten free, no card.</p>
<p>${SENDER.person}</p>
</div>`;

  return { subject: 'a candidate CV in your branding', text, html };
}

/**
 * Registered at Companies House in the last four months (outreach/prospects-new.csv,
 * built by `ops/build-prospects.mjs discover --new`). Decision 017.
 */
const NEW_AGENCY_DAYS = 120;
function isNewAgency(p) {
  const inc = Date.parse(p.incorporated || '');
  return Number.isFinite(inc) && Date.now() - inc < NEW_AGENCY_DAYS * 86400_000;
}

/**
 * For an agency that has only just been registered. The only thing it claims
 * to know about them is the registration date, which is public and which they
 * know we can see. It does not congratulate them on a launch: a new company
 * number can be an old agency restructuring, and guessing wrong reads as a
 * mail merge. A new agency has no CV habits yet, so the pitch is to set the
 * habit rather than replace one.
 */
function composeNew(p, greeting, agency, branded = true) {
  const month = new Date(Date.parse(p.incorporated)).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const text = `${greeting}

${agency} was registered at Companies House in ${month}, so you may still be
setting up how candidates go out to clients.

${branded
    ? `The image below is a sample candidate CV already rebuilt in ${possessive(agency)}
branding - contact details stripped out, a reference code where the name was.`
    : `The image below is a sample candidate CV rebuilt for ${agency} - contact details
stripped out, a reference code where the name was. Your logo and colours go on
the same way.`}

Most agencies do that by hand before every submission, so a client cannot go
around them. Venditas does it in about ten seconds from whatever the candidate sent,
keeps the candidate's own wording, and refuses to hand over a document with a
contact detail left in.

Ten free at ${SENDER.site}, no card. After that it is £79 a month for the whole
agency, and that founding price stays for as long as you do.

${SENDER.person}`;

  const html = `<div style="font:15px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14181d;max-width:640px">
<p>${greeting}</p>
<p><strong>${agency}</strong> was registered at Companies House in ${month}, so you may still be setting up how candidates go out to clients.</p>
<p>${branded
    ? `The image below is a sample candidate CV already rebuilt in ${possessive(agency)} branding &mdash; contact details stripped out, a reference code where the name was.`
    : `The image below is a sample candidate CV rebuilt for ${agency} &mdash; contact details stripped out, a reference code where the name was. Your logo and colours go on the same way.`}</p>
<p><img src="cid:cvpreview" alt="Candidate CV in ${agency} branding" style="width:100%;max-width:600px;border:1px solid #dfe3e9;border-radius:4px"></p>
<p>Most agencies do that by hand before every submission, so a client cannot go around them. Venditas does it in about ten seconds from whatever the candidate sent, keeps the candidate&rsquo;s own wording, and refuses to hand over a document with a contact detail left in.</p>
<p>Ten free at <a href="${SENDER.site}">venditas.in</a>, no card. After that it is &pound;79 a month for the whole agency, and that founding price stays for as long as you do.</p>
<p>${SENDER.person}</p>
</div>`;

  return { subject: `a branded CV for ${agency}`, text, html };
}

/**
 * For an agency a competitor names as a customer. It does not explain the job —
 * they bought a tool for it — and it makes no claim about the competitor beyond
 * the public page that lists them. Price and the redaction check are the pitch;
 * a renewal date is the natural moment, so that is the ask.
 */
function composeSwitch(p, greeting, agency, branded = true) {
  const tool = p.incumbent;
  const text = `${greeting}

I saw ${agency} on ${tool}'s customer page, so you already know the job:
a candidate CV in, your branded document out, contact details gone.

${branded
    ? `The image below is a sample candidate rebuilt in ${possessive(agency)} branding by
Venditas, the tool I built for the same job.`
    : `The image below is a sample candidate rebuilt for ${agency} by Venditas, the
tool I built for the same job; your logo and colours go on the same way.`} £79 a month for the whole
agency, unlimited CVs, no contract. It keeps the candidate's own wording rather
than rewriting it, every document is read back after it is built, and it fails
rather than hand you a file with a contact detail left in.

If ${tool} comes up for renewal, it might be worth ten minutes. You can run
your own CVs at ${SENDER.site} - ten free, no card.

${SENDER.person}`;

  const html = `<div style="font:15px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14181d;max-width:640px">
<p>${greeting}</p>
<p>I saw <strong>${agency}</strong> on ${tool}'s customer page, so you already know the job: a candidate CV in, your branded document out, contact details gone.</p>
<p>${branded
    ? `The image below is a sample candidate rebuilt in ${possessive(agency)} branding by Venditas, the tool I built for the same job.`
    : `The image below is a sample candidate rebuilt for ${agency} by Venditas, the tool I built for the same job; your logo and colours go on the same way.`} &pound;79 a month for the whole agency, unlimited CVs, no contract. It keeps the candidate&rsquo;s own wording rather than rewriting it, every document is read back after it is built, and it fails rather than hand you a file with a contact detail left in.</p>
<p><img src="cid:cvpreview" alt="Candidate CV in ${agency} branding" style="width:100%;max-width:600px;border:1px solid #dfe3e9;border-radius:4px"></p>
<p>If ${tool} comes up for renewal, it might be worth ten minutes. You can run your own CVs at <a href="${SENDER.site}">venditas.in</a> &mdash; ten free, no card.</p>
<p>${SENDER.person}</p>
</div>`;

  const subject = branded
    ? `${tool} alternative, in ${possessive(agency)} branding`
    : `${tool} alternative for ${agency}`;
  return { subject, text, html };
}

// --------------------------------------------------------------------- main
async function main() {
  // Every list, not just the first one. prospects.csv was hand-researched;
  // prospects-uk-2.csv comes from ops/build-prospects.mjs; prospects-in-1.csv
  // is India. One agency can appear in two lists, so rows are merged on the
  // email domain (or the site's domain when no address is published), first
  // list wins.
  const dir = path.join(ROOT, 'outreach');
  const csvs = readdirSync(dir).filter((f) => /^prospects.*\.csv$/i.test(f)).sort();
  if (!csvs.length) {
    console.error('no outreach/prospects*.csv found');
    process.exit(1);
  }

  // Read the mailbox before doing anything else. Two failures this prevents,
  // both of which get worse the longer nobody looks:
  //
  //   Someone who replied gets chased by the next batch or the follow-up, which
  //   tells the one interested person that nobody read them.
  //
  //   A dead address gets mailed again. Repeat bounces are among the clearest
  //   signals a provider uses to decide a domain sends rubbish.
  try {
    const seen = await scanInbox({ apply: true });
    if (seen.replies.length || seen.bounces.length) {
      console.log(`\ninbox: ${seen.replies.length} repl${seen.replies.length === 1 ? 'y' : 'ies'}, ${seen.bounces.length} bounce(s) — applied`);
      for (const r of seen.replies) console.log(`  REPLIED  ${r.from}  "${r.subject.slice(0, 50)}"`);
      for (const b of seen.bounces) console.log(`  BOUNCED  ${b.failed || 'unknown'} — suppressed`);
    } else {
      console.log('\ninbox: no replies, no bounces');
    }
  } catch (e) {
    // A mailbox we cannot read is a reason to stop, not to guess. Sending into
    // silence risks chasing someone who already answered.
    console.error(`
Cannot read the mailbox: ${e.message}`);
    console.error('Refusing to send — fix this first, or pass --skip-inbox if you are certain.');
    if (!flag('skip-inbox')) { closeTransport(); process.exit(1); }
  }

  const byKey = new Map();
  for (const f of csvs) {
    for (const p of parseCsv(readFileSync(path.join(dir, f), 'utf8'))) {
      const e = (p.email || '').trim().toLowerCase();
      let key = e.includes('@') ? e.split('@')[1] : '';
      if (!key) { try { key = new URL(p.website).hostname.replace(/^www\./, ''); } catch { key = p.company; } }
      if (!byKey.has(key)) byKey.set(key, { ...p, list: f });
    }
  }
  const all = [...byKey.values()];
  console.log(`lists: ${csvs.map((f) => f.replace(/^prospects-?|\.csv$/g, '') || '1').join(', ')} · ${all.length} agencies after merging`);
  const skip = suppressed();
  const sentLog = existsSync(path.join(ROOT, 'outreach', 'sent.log'))
    ? readFileSync(path.join(ROOT, 'outreach', 'sent.log'), 'utf8').toLowerCase()
    : '';

  // Flagged during list-building: these publish an address on a domain
  // unrelated to the agency, which is either stale or someone else's inbox.
  // Cheaper to drop two prospects than to cold-email the wrong company.
  const FLAGGED = /complete dental staffing|dentemp/i;

  const eligible = all.filter((p) => {
    const e = (p.email || '').trim().toLowerCase();
    if (!e || !e.includes('@')) return false;
    if (skip.has(e)) return false;
    if (sentLog.includes(e)) return false;
    if (FLAGGED.test(p.company || '')) return false;

    // Has LinkedIn already approached this agency? A connection request on
    // Tuesday and a cold email on Thursday, same sender, same product, reads as
    // a machine working a list - and recruiters spot that professionally.
    const seen = recentlyContacted(p.email || p.website);
    if (seen.contacted) return false;

    return true;
  });

  // Ordering, most important first.
  //
  // UK before US: the research was unambiguous that UK and EU agencies
  // submitting under a client template feel this, and US in-house talent teams
  // largely do not.
  //
  // Then agencies whose logo we can actually fetch. Logos verified 10/10 on
  // sampling; brand colours did not — only 41 of 244 came from an agency's own
  // SVG, the rest were inferred, and an earlier pass had returned WordPress's
  // admin blue for a third of the list. A real logo carries the
  // personalisation on its own; a wrong accent colour actively undermines an
  // email claiming to be in their branding. So lead with the ones we are sure
  // about.
  //
  // Before all of that: agencies already paying a competitor for this exact job
  // (outreach/prospects-hot.csv, each with the public page that says so). They
  // need no convincing that the problem exists, only that this is cheaper.
  //
  // Next: agencies registered in the last four months. They are choosing how
  // CVs go to clients right now, and have no template habit to replace.
  // Ireland counts with the UK (decision 017).
  const score = (p) => {
    const hot = p.incumbent || p.evidence_url ? -10 : 0;
    const fresh = !hot && isNewAgency(p) ? -6 : 0;
    const uk = /united kingdom|uk|england|scotland|wales|ireland/i.test(p.country || '') ? 0 : 4;
    const logo = /^https?:\/\//.test(p.logo_url || '') && !/\.ico(\?|$)/i.test(p.logo_url) ? 0 : 2;
    const colour = /^#?[0-9a-f]{6}$/i.test((p.brand_colour || '').trim()) ? 0 : 1;
    return hot + fresh + uk + logo + colour;
  };
  eligible.sort((a, b) => score(a) - score(b));

  const when = isSendableNow();
  if (DO_SEND && !when.ok) {
    console.error(`\nRefusing to send: ${when.why}.`);
    console.error('Pass --anyway if you have a reason.');
    if (!flag('anyway')) { closeTransport(); process.exit(1); }
  }

  const batch = eligible.slice(0, WANT);
  console.log(`\n${all.length} prospects · ${eligible.length} eligible · taking ${batch.length}`);
  console.log(`mode: ${DO_SEND ? 'SEND' : 'dry run, nothing will be sent'}\n`);

  const needed = [...new Set(batch.map((p) => sampleFor(p.specialism, p.company)).filter(Boolean))];
  console.log(`samples needed: ${needed.length}`);
  const samples = await loadSamples(needed);

  const outDir = path.join(ROOT, 'outreach', 'batches', new Date().toISOString().slice(0, 10));
  mkdirSync(outDir, { recursive: true });

  const manifest = [];
  for (const p of batch) {
    const file = sampleFor(p.specialism, p.company);
    const data = samples[file];
    if (!data) continue;

    const verified = safeColour(p.brand_colour);
    const colour = verified || '1F4E5F';
    const logo = await fetchLogo(p.logo_url);

    // One reference per candidate, shared by the image and the document. Two
    // different codes for the same person is the kind of detail that makes a
    // careful reader distrust everything else on the page.
    const reference = makeReference(data.name);

    const docx = await render(data, {
      name: p.company,
      colour,
      footer: p.company,
      contact: p.website || null,
      logo: logo?.data,
      logoType: logo?.type,
    }, { reference });

    const { subject, text, html } = compose(p, { branded: Boolean(logo || verified) });
    const png = await preview(data, {
      name: p.company, colour, footer: p.company, logo: logo?.data, logoType: logo?.type,
    }, reference);
    const safe = (p.company || 'agency').replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40);
    // Both are written for review. Only the PNG is sent.
    writeFileSync(path.join(outDir, `${safe}.docx`), docx);
    writeFileSync(path.join(outDir, `${safe}.png`), png);

    manifest.push({
      company: p.company, email: p.email, country: p.country,
      specialism: p.specialism, sample: file, colour,
      logo: Boolean(logo), subject,
    });

    if (DO_SEND) {
      const r = await send({
        to: p.email,
        fromName: `${SENDER.person} at ${SENDER.company}`,
        subject,
        text,
        html,
        attachments: [
          // Inline, not an attachment they must open. `cid` binds it to the
          // <img> in the html above.
          { filename: 'cv-preview.png', content: png, cid: 'cvpreview', contentDisposition: 'inline' },
        ],
      });
      if (r.sent) record(p.email, 'email', p.company || '');
      console.log(`  ${r.sent ? 'sent' : `skipped (${r.skipped})`}  ${p.email}`);
    } else {
      console.log(`  built  ${(p.company || '').padEnd(34).slice(0, 34)} ${file.replace('.pdf', '').padEnd(28)} ${logo ? 'logo' : '    '} #${colour}${verified ? '' : ' (default - unverified colour rejected)'}`);
    }
  }

  writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const sampleText = compose(batch[0] || {}).text;
  writeFileSync(path.join(outDir, 'email.txt'), sampleText);

  console.log(`\n${manifest.length} built -> ${outDir}`);
  console.log(`  with logo: ${manifest.filter((m) => m.logo).length}`);
  if (!DO_SEND) console.log('\nNothing sent. Review the .docx files, then: --send --confirm');
  closeTransport();
}

main().catch((e) => {
  console.error('batch failed:', e.message);
  closeTransport();
  process.exit(1);
});
