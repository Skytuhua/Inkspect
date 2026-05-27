import type { Doc, Report, Finding, AnalyzeOptions, ReportRow } from '../types';
import { NON_ADVERB_LY, NEUTRAL_TAGS, SAID_BOOKISMS } from '../wordlists';
import { density, severityFromDensity } from './util';

// ADVERBS — words ending in -ly that are genuine adverbs (excluding an allowlist
// of -ly non-adverbs like "only", "family"). Adverbs glued to dialogue tags
// ("said softly") get a stronger message, since editors single those out.

function isAdverb(lower: string): boolean {
  if (!lower.endsWith('ly')) return false;
  if (lower.length < 4) return false;
  if (NON_ADVERB_LY.has(lower)) return false;
  return true;
}

export function analyzeAdverbs(doc: Doc, opts: AnalyzeOptions): Report {
  const findings: Finding[] = [];
  const counts = new Map<string, number>();
  let tagAdverbs = 0;

  doc.words.forEach((w, i) => {
    if (!isAdverb(w.lower)) return;
    counts.set(w.lower, (counts.get(w.lower) ?? 0) + 1);

    const prev = doc.words[i - 1]?.lower;
    const next = doc.words[i + 1]?.lower;
    const nearTag =
      (prev && (NEUTRAL_TAGS.has(prev) || SAID_BOOKISMS.has(prev))) ||
      (next && (NEUTRAL_TAGS.has(next) || SAID_BOOKISMS.has(next)));

    if (nearTag) {
      tagAdverbs++;
      const tag = NEUTRAL_TAGS.has(prev ?? '') || SAID_BOOKISMS.has(prev ?? '') ? prev : next;
      findings.push({
        start: w.start,
        end: w.end,
        group: '-ly + tag',
        message: `Adverb "${w.text}" on the dialogue tag "${tag}" — consider stronger action or dialogue instead`,
      });
    } else {
      findings.push({
        start: w.start,
        end: w.end,
        group: '-ly adverb',
        message: `Adverb "${w.text}"`,
      });
    }
  });

  const total = findings.length;
  const d = density(total, doc.words.length);
  const rows: ReportRow[] = [...counts.entries()]
    .map(([label, count]) => ({ label, count, density: density(count, doc.words.length), match: label }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  let severity = severityFromDensity(d, opts.densityWarn);
  if (tagAdverbs > 0 && severity === 'info') severity = 'warn';

  const tagNote = tagAdverbs > 0 ? `, ${tagAdverbs} on dialogue tags` : '';
  return {
    id: 'adverbs',
    label: 'Adverbs (-ly)',
    description:
      '-ly adverbs. A few are fine; clusters (especially on dialogue tags like "said quietly") often signal telling instead of showing.',
    severity,
    summary: total === 0 ? 'None found' : `${total} (${d.toFixed(1)}/1k words${tagNote})`,
    findings,
    rows,
  };
}
