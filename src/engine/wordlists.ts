// Curated word/phrase lists encoding fiction self-editing craft. These are the
// domain knowledge that makes Inkspect fiction-aware rather than a generic word
// counter. Sources are widely published editing guides (crutch words, filter
// words, said-bookisms, clichés); the lists are hand-assembled, not scraped.

/** Extremely common words excluded from echo/overused detection. */
export const STOPWORDS = new Set<string>([
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'for', 'yet', 'so',
  'of', 'to', 'in', 'on', 'at', 'by', 'up', 'as', 'is', 'it', 'be',
  'am', 'are', 'was', 'were', 'been', 'being', 'do', 'does', 'did',
  'have', 'has', 'had', 'i', 'you', 'he', 'she', 'we', 'they', 'me',
  'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'there', 'here', 'with', 'from',
  'into', 'out', 'off', 'over', 'under', 'then', 'than', 'too', 'not',
  'no', 'if', 'when', 'while', 'who', 'whom', 'whose', 'which', 'what',
  'how', 'why', 'where', 'all', 'any', 'some', 'one', 'will', 'would',
  'can', 'could', 'shall', 'should', 'may', 'might', 'must', 'about',
  'them', 'were', "i'm", "it's", "don't", "didn't", "he's", "she's",
  "they're", "we're", "you're", "that's", "there's", 'her', 'hers',
  'himself', 'herself', 'myself', 'themselves', 'ourselves',
]);

/** Crutch / filler words: weaken prose when overused. */
export const CRUTCH_WORDS = new Set<string>([
  'just', 'really', 'very', 'quite', 'rather', 'somewhat', 'somehow',
  'suddenly', 'actually', 'basically', 'literally', 'simply', 'totally',
  'definitely', 'certainly', 'probably', 'perhaps', 'maybe', 'almost',
  'nearly', 'even', 'still', 'pretty', 'anyway', 'anyways', 'well',
  'absolutely', 'completely', 'utterly',
  'truly', 'honestly', 'seriously', 'apparently', 'obviously', 'clearly',
  'essentially', 'practically', 'virtually', 'merely', 'mostly',
]);

/** Multi-word crutch phrases, detected as consecutive word pairs. */
export const MULTIWORD_CRUTCH: string[][] = [
  ['kind', 'of'], ['sort', 'of'], ['a', 'bit'], ['a', 'lot'],
  ['of', 'course'], ['in', 'order', 'to'], ['for', 'the', 'most', 'part'],
  ['at', 'least'], ['as', 'if'], ['more', 'or', 'less'],
];

/** Filter words: verbs that filter experience through the POV character and
 *  hold the reader at a distance ("she saw the door open" vs "the door opened").
 */
export const FILTER_WORDS = new Set<string>([
  'saw', 'see', 'seen', 'seeing', 'sees',
  'heard', 'hear', 'hears', 'hearing',
  'felt', 'feel', 'feels', 'feeling',
  'knew', 'know', 'knows', 'knowing',
  'realized', 'realize', 'realizes', 'realizing', 'realised',
  'noticed', 'notice', 'notices', 'noticing',
  'watched', 'watch', 'watches', 'watching',
  'looked', 'looks', 'looking',
  'seemed', 'seem', 'seems', 'seeming',
  'decided', 'decide', 'decides', 'deciding',
  'wondered', 'wonder', 'wonders', 'wondering',
  'thought', 'think', 'thinks', 'thinking',
  'remembered', 'remember', 'remembers', 'remembering',
  'wished', 'wish', 'wishes', 'wishing',
  'believed', 'believe', 'believes', 'believing',
  'experienced', 'experience', 'experiences',
  'sensed', 'sense', 'senses', 'sensing',
  'observed', 'observe', 'observes', 'observing',
  'considered', 'consider', 'considers', 'considering',
]);

/** "To be" verbs — high density is a flag for weak, static prose. */
export const TO_BE = new Set<string>([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "i'm",
  "it's", "he's", "she's", "they're", "we're", "you're", "that's",
  "there's", "what's", "who's",
]);

/** Words ending in -ly that are NOT adverbs (so we don't flag them). Includes
 *  -ly nouns/verbs (reply, supply) and the large class of -ly *adjectives*
 *  (friendly, scholarly, cowardly) that would otherwise be mistaken for adverbs. */
export const NON_ADVERB_LY = new Set<string>([
  // nouns / verbs ending in -ly
  'only', 'family', 'reply', 'rely', 'apply', 'supply', 'imply', 'comply',
  'multiply', 'ally', 'rally', 'tally', 'belly', 'jelly', 'bully', 'lily',
  'holly', 'folly', 'ply', 'fly', 'butterfly', 'dragonfly', 'anomaly',
  'panoply', 'monopoly', 'assembly', 'italy', 'duly', 'wholly',
  // adjectives ending in -ly (describe nouns, not verbs)
  'silly', 'fully', 'jolly', 'lovely', 'lonely', 'lively', 'likely', 'ugly',
  'early', 'daily', 'holy', 'ghastly', 'friendly', 'deadly', 'orderly',
  'elderly', 'cuddly', 'wobbly', 'bristly', 'curly', 'burly', 'gnarly',
  'pearly', 'surly', 'homely', 'timely', 'costly', 'ghostly', 'monthly',
  'weekly', 'yearly', 'nightly', 'worldly', 'measly', 'beastly', 'kingly',
  'queenly', 'saintly', 'scholarly', 'cowardly', 'brotherly', 'sisterly',
  'motherly', 'fatherly', 'heavenly', 'leisurely', 'unruly', 'grisly',
  'comely', 'seemly', 'unseemly', 'portly', 'stately', 'courtly', 'princely',
  'womanly', 'manly', 'godly', 'lowly', 'oily', 'wily', 'chilly', 'frilly',
  'prickly', 'crinkly', 'sprightly', 'unsightly', 'knightly', 'earthly',
  'miserly', 'sickly', 'kindly', 'goodly', 'shapely', 'lordly', 'beggarly',
  'scaly', 'steely', 'smelly', 'woolly',
]);

/** Dialogue tag verbs that are unobtrusive and generally fine. */
export const NEUTRAL_TAGS = new Set<string>(['said', 'asked', 'replied']);

/** "Said-bookisms": fancy dialogue tags editors flag as overwrought. */
export const SAID_BOOKISMS = new Set<string>([
  'exclaimed', 'retorted', 'ejaculated', 'opined', 'expostulated',
  'interjected', 'queried', 'enquired', 'inquired', 'remarked', 'declared',
  'announced', 'proclaimed', 'pronounced', 'uttered', 'voiced', 'articulated',
  'gushed', 'chortled', 'guffawed', 'simpered', 'smirked', 'sneered',
  'snarled', 'growled', 'hissed', 'spat', 'barked', 'bellowed', 'roared',
  'screeched', 'shrieked', 'wailed', 'sobbed', 'blurted', 'stammered',
  'stuttered', 'gasped', 'breathed', 'panted', 'chuckled', 'laughed',
  'giggled', 'snorted', 'huffed', 'scoffed', 'quipped', 'mused', 'ventured',
  'asserted', 'affirmed', 'admonished', 'cautioned', 'chimed', 'commented',
]);

/** Common clichés (lower-cased). Matched as whole phrases, case-insensitive. */
export const CLICHES: string[] = [
  'at the end of the day', 'avoid like the plague', 'back against the wall',
  'ball is in your court', 'beat around the bush', 'beating a dead horse',
  'better late than never', 'bite the bullet', 'blessing in disguise',
  'bolt from the blue', 'breath of fresh air', 'bull in a china shop',
  'calm before the storm', 'cat got your tongue', 'cold feet', 'cool as a cucumber',
  'crystal clear', 'cry over spilled milk', 'dead as a doornail',
  'diamond in the rough', 'dime a dozen', 'drop in the bucket',
  'easier said than done', 'every cloud has a silver lining',
  'face the music', 'fit as a fiddle', 'few and far between',
  'fish out of water', 'for all intents and purposes', 'gift of the gab',
  'grass is always greener', 'hard as a rock', 'head over heels',
  'heart of gold', 'heart skipped a beat', 'hit the nail on the head',
  'in the nick of time', 'it goes without saying', 'last but not least',
  'light as a feather', 'like a deer in the headlights', 'method to the madness',
  'needle in a haystack', 'nip it in the bud', 'once in a blue moon',
  'only time will tell', 'on cloud nine', 'out of the blue', 'par for the course',
  'piece of cake', 'plenty of fish in the sea', 'pull yourself together',
  'quiet as a mouse', 'raining cats and dogs', 'read between the lines',
  'right as rain', 'rude awakening', 'sharp as a tack', 'sick as a dog',
  'sigh of relief', 'six of one', 'sleep like a baby', 'smooth as silk',
  'sticking out like a sore thumb', 'storm in a teacup', 'take it with a grain of salt',
  'the calm before the storm', 'the writing on the wall', 'think outside the box',
  'thick as thieves', 'time will tell', 'tip of the iceberg', 'tired but happy',
  'to make a long story short', 'tongue in cheek', 'too good to be true',
  'under the weather', 'water under the bridge', 'weather the storm',
  'white as a sheet', 'whole nine yards', 'wolf in sheep\'s clothing',
  'a heart of stone', 'pale as a ghost', 'time flies when',
  'tears streamed down', 'his blood ran cold', 'her blood ran cold',
  'a shiver ran down', 'butterflies in her stomach', 'butterflies in his stomach',
  'butterflies in my stomach', 'lost track of time', 'heart in her throat',
  'heart in his throat', 'a sinking feeling', 'against all odds',
  'in the blink of an eye', 'when all is said and done', 'last straw',
];
