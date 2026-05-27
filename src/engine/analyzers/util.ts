import type { Doc, Finding, ReportRow, Severity } from '../types';

/** Density per 1,000 words. */
export function density(count: number, totalWords: number): number {
  if (totalWords === 0) return 0;
  return (count / totalWords) * 1000;
}

export function severityFromDensity(d: number, warn: number): Severity {
  if (d === 0) return 'good';
  if (d >= warn * 1.75) return 'high';
  if (d >= warn) return 'warn';
  return 'info';
}

/**
 * Flag every word whose lower-cased form is in `set`. Returns findings (one per
 * occurrence) and per-word count rows sorted by frequency.
 */
export function markWordSet(
  doc: Doc,
  set: Set<string>,
  message: (form: string, count: number) => string,
): { findings: Finding[]; rows: ReportRow[]; total: number } {
  const counts = new Map<string, number>();
  const positions: number[] = [];
  doc.words.forEach((w, i) => {
    if (set.has(w.lower)) {
      counts.set(w.lower, (counts.get(w.lower) ?? 0) + 1);
      positions.push(i);
    }
  });
  const findings: Finding[] = positions.map((i) => {
    const w = doc.words[i];
    return {
      start: w.start,
      end: w.end,
      group: w.lower,
      message: message(w.lower, counts.get(w.lower) ?? 1),
    };
  });
  const rows: ReportRow[] = [...counts.entries()]
    .map(([label, count]) => ({ label, count, density: density(count, doc.words.length), match: label }))
    .sort((a, b) => b.count - a.count);
  return { findings, rows, total: positions.length };
}
