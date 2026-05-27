import type { Doc, Report, Finding, AnalyzeOptions } from '../types';

// SENTENCE RHYTHM / PACING — varied sentence length is what gives prose rhythm.
// A long run of similar-length sentences reads as monotonous. We flag maximal
// runs of >= `monotonyRun` consecutive sentences whose lengths sit within a
// narrow band (max − min ≤ 3 words). The per-sentence word counts are returned
// separately (by index.ts) for the rhythm chart.

export function analyzeRhythm(doc: Doc, opts: AnalyzeOptions): Report {
  const lens = doc.sentences.map((s) => s.wordCount);
  const findings: Finding[] = [];
  const minRun = opts.monotonyRun;
  const band = 3;

  let i = 0;
  let monotonousRuns = 0;
  while (i < lens.length) {
    let j = i;
    let lo = lens[i];
    let hi = lens[i];
    while (j + 1 < lens.length) {
      const nlo = Math.min(lo, lens[j + 1]);
      const nhi = Math.max(hi, lens[j + 1]);
      if (nhi - nlo > band) break;
      lo = nlo;
      hi = nhi;
      j++;
    }
    const runLen = j - i + 1;
    if (runLen >= minRun && lens[i] > 0) {
      monotonousRuns++;
      findings.push({
        start: doc.sentences[i].start,
        end: doc.sentences[j].end,
        group: 'monotony',
        message: `${runLen} consecutive sentences of ${lo}–${hi} words — vary length to improve pacing`,
      });
    }
    i = j + 1;
  }

  return {
    id: 'rhythm',
    label: 'Sentence rhythm',
    description:
      'Long runs of same-length sentences flatten pacing. Mixing short and long sentences gives prose momentum.',
    severity: monotonousRuns === 0 ? 'good' : monotonousRuns > 3 ? 'high' : 'warn',
    summary:
      monotonousRuns === 0
        ? 'Varied pacing'
        : `${monotonousRuns} monotonous run${monotonousRuns === 1 ? '' : 's'}`,
    findings,
  };
}
