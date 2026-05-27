import type { Doc, Report, AnalyzeOptions, ReportRow } from '../types';
import { CRUTCH_WORDS, MULTIWORD_CRUTCH } from '../wordlists';
import { markWordSet, density, severityFromDensity } from './util';

// CRUTCH / FILLER WORDS — "just", "really", "very", "suddenly"… plus multi-word
// fillers ("kind of", "sort of"). Counts, density per 1k words, and highlights.

export function analyzeCrutch(doc: Doc, opts: AnalyzeOptions): Report {
  const { findings, rows, total } = markWordSet(
    doc,
    CRUTCH_WORDS,
    (form, count) => `Crutch word "${form}" (${count}× in document)`,
  );

  // Multi-word fillers.
  const mwRows: ReportRow[] = [];
  for (const phrase of MULTIWORD_CRUTCH) {
    const positions: number[] = [];
    for (let i = 0; i + phrase.length <= doc.words.length; i++) {
      let match = true;
      for (let k = 0; k < phrase.length; k++) {
        if (doc.words[i + k].lower !== phrase[k]) {
          match = false;
          break;
        }
      }
      if (match) positions.push(i);
    }
    if (positions.length > 0) {
      const text = phrase.join(' ');
      mwRows.push({ label: text, count: positions.length, density: density(positions.length, doc.words.length), match: text });
      for (const i of positions) {
        findings.push({
          start: doc.words[i].start,
          end: doc.words[i + phrase.length - 1].end,
          group: text,
          message: `Filler phrase "${text}" (${positions.length}× in document)`,
        });
      }
    }
  }

  const allRows = [...rows, ...mwRows].sort((a, b) => b.count - a.count);
  const totalAll = total + mwRows.reduce((s, r) => s + r.count, 0);
  const d = density(totalAll, doc.words.length);
  return {
    id: 'crutch',
    label: 'Crutch & filler words',
    description:
      'Filler words like "just", "really", "very" and "suddenly" that dilute prose when overused. Lower density is better.',
    severity: severityFromDensity(d, opts.densityWarn),
    summary: totalAll === 0 ? 'None found' : `${totalAll} (${d.toFixed(1)}/1k words)`,
    findings,
    rows: allRows.slice(0, 50),
  };
}

export function analyzeFromSet(
  doc: Doc,
  id: string,
  label: string,
  description: string,
  set: Set<string>,
  noun: string,
  warn: number,
): Report {
  const { findings, rows, total } = markWordSet(
    doc,
    set,
    (form, count) => `${noun} "${form}" (${count}× in document)`,
  );
  const d = density(total, doc.words.length);
  return {
    id,
    label,
    description,
    severity: severityFromDensity(d, warn),
    summary: total === 0 ? 'None found' : `${total} (${d.toFixed(1)}/1k words)`,
    findings,
    rows: rows.slice(0, 50),
  };
}
