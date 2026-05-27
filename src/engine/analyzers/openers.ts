import type { Doc, Report, Finding, ReportRow } from '../types';

// SENTENCE OPENERS — a classic fiction problem is starting many sentences the
// same way ("She walked… She turned… She sighed…"). We flag runs of >= 3
// consecutive sentences that open with the same word, and report opener
// frequencies so a writer can vary their sentence beginnings.

const RUN_MIN = 3;

export function analyzeOpeners(doc: Doc): Report {
  const findings: Finding[] = [];
  const counts = new Map<string, number>();

  // First word (and its offset) of each sentence.
  const openers: { word: string; start: number; end: number }[] = [];
  for (const s of doc.sentences) {
    const w = doc.words[s.wordStart];
    if (!w) continue;
    openers.push({ word: w.lower, start: w.start, end: w.end });
    counts.set(w.lower, (counts.get(w.lower) ?? 0) + 1);
  }

  // Detect maximal runs of identical consecutive openers.
  let runs = 0;
  let i = 0;
  while (i < openers.length) {
    let j = i;
    while (j + 1 < openers.length && openers[j + 1].word === openers[i].word) j++;
    const len = j - i + 1;
    if (len >= RUN_MIN) {
      runs++;
      for (let k = i; k <= j; k++) {
        findings.push({
          start: openers[k].start,
          end: openers[k].end,
          group: openers[i].word,
          message: `${len} sentences in a row open with "${openers[k].word}" — vary your sentence openings`,
        });
      }
    }
    i = j + 1;
  }

  const total = openers.length;
  const rows: ReportRow[] = [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      density: total > 0 ? (count / total) * 100 : 0,
      match: label,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  const topShare = total > 0 && rows.length > 0 ? rows[0].count / total : 0;
  const severity =
    runs === 0 && topShare < 0.25 ? 'good' : runs > 3 || topShare > 0.4 ? 'high' : 'warn';

  let summary: string;
  if (total === 0) summary = 'No sentences yet';
  else if (runs === 0 && topShare < 0.25) summary = 'Varied openings';
  else summary = `${runs} repeated run${runs === 1 ? '' : 's'}; top "${rows[0].label}" ${Math.round(topShare * 100)}%`;

  return {
    id: 'openers',
    label: 'Sentence openers',
    description:
      'How your sentences begin. Starting many sentences with the same word (often "He"/"She"/"The"/"I") makes prose feel repetitive.',
    severity,
    summary,
    findings,
    rows,
  };
}
