// Core types for the Inkspect analysis engine.
// The engine is pure TypeScript: no DOM, no React, no I/O. Every finding
// carries exact character offsets back into the original source text so the UI
// can highlight and navigate to it.

export interface Token {
  /** The exact substring as it appears in the source. */
  text: string;
  /** Lower-cased form, apostrophes normalized, for matching. */
  lower: string;
  /** Inclusive start offset into the source string. */
  start: number;
  /** Exclusive end offset into the source string. */
  end: number;
}

export interface Sentence {
  text: string;
  start: number;
  end: number;
  /** Indices into the document's `words` array that fall in this sentence. */
  wordStart: number;
  wordEnd: number; // exclusive
  wordCount: number;
}

export interface Paragraph {
  start: number;
  end: number;
  wordCount: number;
}

export interface Doc {
  text: string;
  /** Word tokens only (punctuation/whitespace excluded), in order. */
  words: Token[];
  sentences: Sentence[];
  paragraphs: Paragraph[];
}

/** A single highlightable issue located in the text. */
export interface Finding {
  start: number;
  end: number;
  /** Human-readable explanation shown in the inspector. */
  message: string;
  /** Optional grouping key (e.g. the stem for an echo cluster). */
  group?: string;
}

export type Severity = 'good' | 'info' | 'warn' | 'high';

export interface Report {
  id: string;
  label: string;
  /** One-line explanation of what this report checks and why it matters. */
  description: string;
  severity: Severity;
  /** Short summary string shown in the report list (e.g. "12 echoes"). */
  summary: string;
  findings: Finding[];
  /** Optional extra rows for the report detail (e.g. per-word counts). */
  rows?: ReportRow[];
}

export interface ReportRow {
  label: string;
  count: number;
  /** Optional per-1000-words density. */
  density?: number;
  /** Optional key used to focus this row's occurrences in the text (matches a
   *  finding's `group`, or the highlighted source text). */
  match?: string;
}

export interface DocStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  syllables: number;
  uniqueWords: number;
  /** Average words per sentence. */
  avgSentenceLength: number;
  /** Standard deviation of sentence length (rhythm variety). */
  sentenceLengthStdev: number;
  longestSentence: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  /** Estimated reading time in minutes at 250 wpm. */
  readingTimeMin: number;
  /** Fraction (0–1) of words that fall inside quotation marks (dialogue). */
  dialogueRatio: number;
}

export interface AnalysisResult {
  stats: DocStats;
  reports: Report[];
  /** Per-sentence word counts, for the rhythm chart. */
  rhythm: number[];
}

export interface AnalyzeOptions {
  /** Window (in words) within which a repeated stem counts as an echo. */
  echoWindow: number;
  /** Minimum cluster size (occurrences) to report an echo. */
  echoMinCount: number;
  /** Crutch/filter density (per 1000 words) above which to escalate severity. */
  densityWarn: number;
  /** Phrase repetition n-gram bounds. */
  minPhraseLen: number;
  maxPhraseLen: number;
  /** A run of >= this many similar-length sentences is flagged as monotonous. */
  monotonyRun: number;
}

export const DEFAULT_OPTIONS: AnalyzeOptions = {
  echoWindow: 50,
  echoMinCount: 2,
  densityWarn: 8,
  minPhraseLen: 3,
  maxPhraseLen: 5,
  monotonyRun: 5,
};
