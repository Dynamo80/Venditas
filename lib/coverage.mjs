/**
 * How much of the source CV survived into the output.
 *
 * The worst thing this product can do is drop a section silently. It nearly
 * shipped doing exactly that: a solicitor's ten "Selected matters" vanished
 * because the schema had no field for them, and nothing anywhere noticed. The
 * schema is fixed, but the class of bug isn't — the next CV with an unusual
 * section could do it again.
 *
 * So we measure. Compare the distinct meaningful words in the source against
 * those in the rendered document; a sharp drop means content went missing.
 *
 * Deliberately word-set based rather than a diff. We reorder sections, relabel
 * headings and strip the candidate's name on purpose, so any positional
 * comparison would be noise. What must not happen is words present in the CV
 * being absent from the output.
 */

/** Words worth counting: four letters or more, so "the" and "and" don't pad the score. */
function meaningfulWords(text) {
  return new Set((String(text || '').toLowerCase().match(/[a-z][a-z-]{3,}/g) || []));
}

/**
 * Terms we remove on purpose, and which must not count as loss.
 * Redaction is a feature; the score should not punish it.
 */
function intentionallyRemoved(data) {
  const out = new Set();
  const add = (v) => {
    for (const w of meaningfulWords(v)) out.add(w);
  };
  add(data?.name);
  add(data?.email);
  add(data?.phone);
  for (const l of data?.links || []) add(l);
  return out;
}

/**
 * @returns {{ kept:number, total:number, ratio:number, missing:string[] }}
 */
export function coverage(sourceText, outputText, data = {}) {
  const source = meaningfulWords(sourceText);
  const output = meaningfulWords(outputText);
  const excused = intentionallyRemoved(data);

  const missing = [];
  let total = 0;
  let kept = 0;

  for (const w of source) {
    if (excused.has(w)) continue;
    total++;
    if (output.has(w)) kept++;
    else missing.push(w);
  }

  return {
    kept,
    total,
    ratio: total ? kept / total : 1,
    // A sample, not the lot: this goes to a log, and the whole list of a long
    // CV's vocabulary would be both useless and a quiet way to write candidate
    // content into log storage.
    missing: missing.slice(0, 12),
  };
}

/**
 * Below this, something structural was probably dropped rather than a few
 * stray words being reworded. Set from measurement, not intuition: healthy
 * documents score 92-97%, so 80% is comfortably clear of normal variation
 * while still catching a whole missing section.
 */
export const COVERAGE_FLOOR = 0.8;
