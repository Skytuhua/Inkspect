import type { AnalysisResult, AnalyzeOptions, Doc, DocStats } from './types';
import { DEFAULT_OPTIONS } from './types';
import { tokenize } from './tokenize';
import { segmentSentences, segmentParagraphs } from './segment';
import { countSyllablesInText } from './syllables';
import { detectProperNouns } from './propernouns';
import { analyzeEchoes } from './analyzers/echoes';
import { analyzePhrases } from './analyzers/phrases';
import { analyzeCrutch } from './analyzers/crutch';
import { analyzeFilterWords } from './analyzers/filterWords';
import { analyzeAdverbs } from './analyzers/adverbs';
import { analyzeWeakVerbs } from './analyzers/weakVerbs';
import { analyzeCliches } from './analyzers/cliches';
import { analyzeDialogueTags } from './analyzers/dialogueTags';
import { analyzeRhythm } from './analyzers/rhythm';
import { analyzeOverused } from './analyzers/overused';

export * from './types';

/** Build the shared document model (tokens, sentences, paragraphs) once. */
export function buildDoc(text: string): Doc {
  const words = tokenize(text);
  const sentences = segmentSentences(text, words);
  const paragraphs = segmentParagraphs(text, words);
  return { text, words, sentences, paragraphs };
}

function round(n: number, dp = 1): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}

function computeStats(doc: Doc): DocStats {
  const words = doc.words.length;
  const sentences = doc.sentences.length;
  const syllables = countSyllablesInText(doc.words);
  const unique = new Set(doc.words.map((w) => w.lower)).size;

  const lens = doc.sentences.map((s) => s.wordCount).filter((n) => n > 0);
  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const variance = lens.length ? lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length : 0;
  const stdev = Math.sqrt(variance);
  const longest = lens.length ? Math.max(...lens) : 0;

  const wps = sentences > 0 ? words / sentences : 0;
  const spw = words > 0 ? syllables / words : 0;
  const flesch = words > 0 && sentences > 0 ? 206.835 - 1.015 * wps - 84.6 * spw : 0;
  const fk = words > 0 && sentences > 0 ? 0.39 * wps + 11.8 * spw - 15.59 : 0;

  return {
    characters: doc.text.length,
    words,
    sentences,
    paragraphs: doc.paragraphs.length,
    syllables,
    uniqueWords: unique,
    avgSentenceLength: round(wps),
    sentenceLengthStdev: round(stdev),
    longestSentence: longest,
    fleschReadingEase: round(Math.max(0, Math.min(120, flesch))),
    fleschKincaidGrade: round(Math.max(0, fk)),
    readingTimeMin: round(words / 250),
  };
}

/** Run the full analysis. Pure: same text + options always yields the same result. */
export function analyze(text: string, options: Partial<AnalyzeOptions> = {}): AnalysisResult {
  const opts: AnalyzeOptions = { ...DEFAULT_OPTIONS, ...options };
  const doc = buildDoc(text);
  const proper = detectProperNouns(doc);

  const reports = [
    analyzeEchoes(doc, opts, proper),
    analyzePhrases(doc, opts),
    analyzeCrutch(doc, opts),
    analyzeFilterWords(doc, opts),
    analyzeAdverbs(doc, opts),
    analyzeWeakVerbs(doc, opts),
    analyzeDialogueTags(doc),
    analyzeCliches(doc),
    analyzeRhythm(doc, opts),
    analyzeOverused(doc, proper),
  ];

  return {
    stats: computeStats(doc),
    reports,
    rhythm: doc.sentences.map((s) => s.wordCount),
  };
}
