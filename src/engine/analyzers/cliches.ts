import type { Doc, Report, Finding, ReportRow } from '../types';
import { CLICHES } from '../wordlists';

// CLICHÉS — match curated cliché phrases case-insensitively against the source.
// We search the raw lower-cased text (with apostrophes folded) and require word
// boundaries so "time will tell" doesn't match inside another word.

export function analyzeCliches(doc: Doc): Report {
  const hay = doc.text.toLowerCase().replace(/’/g, "'");
  const findings: Finding[] = [];
  const rows = new Map<string, number>();

  for (const phrase of CLICHES) {
    let from = 0;
    for (;;) {
      const idx = hay.indexOf(phrase, from);
      if (idx === -1) break;
      const before = idx === 0 ? ' ' : hay[idx - 1];
      const afterPos = idx + phrase.length;
      const after = afterPos >= hay.length ? ' ' : hay[afterPos];
      const boundaryBefore = !/[a-z0-9]/.test(before);
      const boundaryAfter = !/[a-z0-9]/.test(after);
      if (boundaryBefore && boundaryAfter) {
        findings.push({
          start: idx,
          end: afterPos,
          group: phrase,
          message: `Cliché: "${doc.text.slice(idx, afterPos)}"`,
        });
        rows.set(phrase, (rows.get(phrase) ?? 0) + 1);
      }
      from = idx + phrase.length;
    }
  }

  findings.sort((a, b) => a.start - b.start);
  const rowList: ReportRow[] = [...rows.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const total = findings.length;

  return {
    id: 'cliches',
    label: 'Clichés',
    description:
      'Worn-out stock phrases readers have seen a thousand times. Replacing them with fresh, specific images sharpens prose.',
    severity: total === 0 ? 'good' : total > 6 ? 'high' : total > 2 ? 'warn' : 'info',
    summary: total === 0 ? 'None found' : `${total} cliché${total === 1 ? '' : 's'}`,
    findings,
    rows: rowList.slice(0, 50),
  };
}
