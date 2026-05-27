import type { Doc, Report, Finding, ReportRow } from '../types';
import { stem } from '../stem';
import { STOPWORDS } from '../wordlists';

// OVERUSED WORDS (global) — document-wide frequency of meaningful words, grouped
// by stem so "walk/walks/walked/walking" count together. Stems whose frequency
// is unusually high relative to document length are flagged and highlightable.

export function analyzeOverused(doc: Doc): Report {
  const positions = new Map<string, number[]>();
  const forms = new Map<string, Set<string>>();

  doc.words.forEach((w, i) => {
    if (w.lower.length < 4) return;
    if (STOPWORDS.has(w.lower)) return;
    if (!/[a-z]/i.test(w.lower)) return;
    const s = stem(w.lower);
    if (s.length < 3) return;
    const arr = positions.get(s);
    if (arr) arr.push(i);
    else positions.set(s, [i]);
    const f = forms.get(s) ?? new Set<string>();
    f.add(w.lower);
    forms.set(s, f);
  });

  // Flag threshold scales with document length (rarer words flagged in shorter
  // texts; common ones tolerated in long ones).
  const contentWords = doc.words.length;
  const threshold = Math.max(4, Math.ceil(contentWords / 400));

  const rows: ReportRow[] = [];
  const findings: Finding[] = [];
  for (const [s, idxs] of positions) {
    const formSet = forms.get(s)!;
    const display = formSet.size === 1 ? [...formSet][0] : `${s}* (${[...formSet].slice(0, 3).join(', ')}${formSet.size > 3 ? '…' : ''})`;
    rows.push({ label: display, count: idxs.length, density: (idxs.length / contentWords) * 1000 });
    if (idxs.length >= threshold) {
      for (const i of idxs) {
        const w = doc.words[i];
        findings.push({
          start: w.start,
          end: w.end,
          group: s,
          message: `Overused: "${w.lower}" — root used ${idxs.length}× in the document`,
        });
      }
    }
  }

  rows.sort((a, b) => b.count - a.count);
  const flaggedStems = new Set(findings.map((f) => f.group));
  const flaggedCount = flaggedStems.size;

  return {
    id: 'overused',
    label: 'Overused words',
    description:
      'The words you lean on most, grouped by root. A few favourites are natural; a long tail of high counts can signal repetitive diction.',
    severity: flaggedCount === 0 ? 'good' : flaggedCount > 15 ? 'high' : flaggedCount > 6 ? 'warn' : 'info',
    summary: flaggedCount === 0 ? 'Well varied' : `${flaggedCount} word${flaggedCount === 1 ? '' : 's'} over ${threshold}×`,
    findings,
    rows: rows.slice(0, 60),
  };
}
