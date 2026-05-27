// A light, conservative stemmer used to group word variants for echo and
// overused-word detection (e.g. "walk", "walks", "walked", "walking" → "walk").
// This is intentionally simpler than a full Porter stemmer: it favours
// predictable grouping over linguistic completeness, plus a small table of
// common irregulars so that, say, "ran" groups with "run".

const IRREGULARS: Record<string, string> = {
  // verbs
  ran: 'run', run: 'run', running: 'run', runs: 'run',
  went: 'go', gone: 'go', goes: 'go', going: 'go',
  said: 'say', says: 'say', saying: 'say',
  saw: 'see', seen: 'see', sees: 'see', seeing: 'see',
  came: 'come', comes: 'come', coming: 'come',
  took: 'take', taken: 'take', takes: 'take', taking: 'take',
  knew: 'know', known: 'know', knows: 'know', knowing: 'know',
  thought: 'think', thinks: 'think', thinking: 'think',
  felt: 'feel', feels: 'feel', feeling: 'feel',
  found: 'find', finds: 'find', finding: 'find',
  told: 'tell', tells: 'tell', telling: 'tell',
  held: 'hold', holds: 'hold', holding: 'hold',
  stood: 'stand', stands: 'stand', standing: 'stand',
  gave: 'give', given: 'give', gives: 'give', giving: 'give',
  made: 'make', makes: 'make', making: 'make',
  got: 'get', gotten: 'get', gets: 'get', getting: 'get',
  began: 'begin', begun: 'begin', begins: 'begin', beginning: 'begin',
  // to be
  is: 'be', am: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be',
  // irregular plurals
  men: 'man', man: 'man', women: 'woman', woman: 'woman',
  children: 'child', child: 'child', feet: 'foot', foot: 'foot',
  teeth: 'tooth', tooth: 'tooth', mice: 'mouse', mouse: 'mouse',
  people: 'person', person: 'person',
};

function endsWithDoubleConsonant(s: string): boolean {
  const n = s.length;
  return n >= 2 && s[n - 1] === s[n - 2] && /[bcdfghjklmnpqrstvwxz]/.test(s[n - 1]);
}

/** Reduce a word to a grouping stem. Pure and deterministic. */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/’/g, "'").replace(/^[''-]+|[''-]+$/g, '');
  if (w.length === 0) return word.toLowerCase();
  if (IRREGULARS[w]) return IRREGULARS[w];
  if (w.length <= 3) return w;

  // Possessives.
  w = w.replace(/'s$/, '').replace(/s'$/, 's');

  // -ly adverbs → base ("quickly" → "quick"), but keep short words intact.
  if (w.endsWith('ly') && w.length > 4) {
    const base = w.slice(0, -2);
    if (base.length >= 3) w = base;
  }

  // -ing / -ed with consonant de-doubling and silent-e restoration heuristics.
  if (w.endsWith('ing') && w.length > 5) {
    let base = w.slice(0, -3);
    if (endsWithDoubleConsonant(base)) base = base.slice(0, -1);
    w = base;
  } else if (w.endsWith('ed') && w.length > 4) {
    let base = w.slice(0, -2);
    if (endsWithDoubleConsonant(base)) base = base.slice(0, -1);
    w = base;
  }

  // Plurals / 3rd person.
  if (w.endsWith('ies') && w.length > 4) {
    w = w.slice(0, -3) + 'y';
  } else if (w.endsWith('es') && w.length > 4 && /(s|x|z|ch|sh)es$/.test(word.toLowerCase())) {
    w = w.slice(0, -2);
  } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    w = w.slice(0, -1);
  }

  return w;
}
