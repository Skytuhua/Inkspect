import type { AnalysisResult } from '../engine';
import { computeScore } from './score';

/** Render the analysis as a shareable Markdown report. */
export function reportToMarkdown(result: AnalysisResult, sourceName: string): string {
  const s = result.stats;
  const score = computeScore(result);
  const lines: string[] = [];
  lines.push(`# Inkspect report — ${sourceName || 'manuscript'}`);
  lines.push('');
  lines.push(`_Generated locally by Inkspect. Nothing was uploaded._`);
  lines.push('');
  lines.push(`**Polish score:** ${score.value}/100 — ${score.caption}`);
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Words | ${s.words.toLocaleString('en-US')} |`);
  lines.push(`| Sentences | ${s.sentences.toLocaleString('en-US')} |`);
  lines.push(`| Paragraphs | ${s.paragraphs.toLocaleString('en-US')} |`);
  lines.push(`| Unique words | ${s.uniqueWords.toLocaleString('en-US')} |`);
  lines.push(`| Avg sentence length | ${s.avgSentenceLength} words |`);
  lines.push(`| Longest sentence | ${s.longestSentence} words |`);
  lines.push(`| Flesch reading ease | ${s.fleschReadingEase} |`);
  lines.push(`| Grade level | ${s.fleschKincaidGrade} |`);
  lines.push(`| Reading time | ~${Math.max(1, Math.round(s.readingTimeMin))} min |`);
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  for (const r of result.reports) {
    lines.push(`### ${r.label} — ${r.summary}`);
    lines.push('');
    lines.push(r.description);
    lines.push('');
    if (r.rows && r.rows.length > 0) {
      lines.push(`| Item | Count | /1k words |`);
      lines.push(`| --- | --- | --- |`);
      for (const row of r.rows.slice(0, 20)) {
        lines.push(`| ${row.label} | ${row.count} | ${row.density !== undefined ? row.density.toFixed(1) : ''} |`);
      }
      lines.push('');
    } else if (r.findings.length === 0) {
      lines.push('_Nothing flagged._');
      lines.push('');
    } else {
      lines.push(`${r.findings.length} highlighted occurrence(s) in the text.`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

/** Trigger a client-side download of a string as a file. */
export function downloadText(filename: string, content: string, mime = 'text/markdown') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
