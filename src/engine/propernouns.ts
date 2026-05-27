import type { Doc } from './types';

// Proper-noun detection. Repeating a character's or place's name is normal in
// fiction — it is NOT an "echo" or an "overused word" — so we exclude likely
// proper nouns from those reports. A word's lower-case form is treated as a
// proper noun when it is capitalised in a clear majority of its *mid-sentence*
// occurrences (where capitalisation is meaningful, unlike at a sentence start).

/** Word indices (into doc.words) that begin a sentence. */
export function sentenceStartWordSet(doc: Doc): Set<number> {
  const set = new Set<number>();
  for (const s of doc.sentences) set.add(s.wordStart);
  return set;
}

export function detectProperNouns(doc: Doc): Set<string> {
  const starts = sentenceStartWordSet(doc);
  const mid = new Map<string, number>();
  const midCap = new Map<string, number>();

  doc.words.forEach((w, i) => {
    if (starts.has(i)) return; // capitalisation at sentence start is uninformative
    if (w.lower === 'i' || w.lower === "i'm") return;
    const first = w.text[0];
    mid.set(w.lower, (mid.get(w.lower) ?? 0) + 1);
    if (first && /\p{Lu}/u.test(first)) {
      midCap.set(w.lower, (midCap.get(w.lower) ?? 0) + 1);
    }
  });

  const proper = new Set<string>();
  for (const [word, total] of mid) {
    const cap = midCap.get(word) ?? 0;
    if (total >= 1 && cap / total >= 0.6) proper.add(word);
  }
  return proper;
}
