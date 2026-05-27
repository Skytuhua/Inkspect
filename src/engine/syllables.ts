// Heuristic English syllable counter, used for the Flesch readability formulas.
// No dictionary — it counts vowel groups with a couple of well-known
// corrections (silent trailing 'e', leading 'y'). It is approximate by design
// (Flesch itself is approximate); tests pin its behaviour on representative
// words.

export function countSyllables(word: string): number {
  const w0 = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w0.length === 0) return 0;
  if (w0.length <= 3) return 1;

  // Drop a silent trailing 'e' that follows a consonant other than 'l'
  // ("make" → "mak", but keep "table"'s 'e' so "-le" stays a syllable).
  let w = w0.replace(/[^laeiouy]e$/, (m) => m[0]);
  // A leading 'y' acts as a consonant ("yellow").
  w = w.replace(/^y/, '');

  const groups = w.match(/[aeiouy]+/g);
  const count = groups ? groups.length : 0;
  return Math.max(1, count);
}

export function countSyllablesInText(words: { lower: string }[]): number {
  let total = 0;
  for (const t of words) total += countSyllables(t.lower);
  return total;
}
