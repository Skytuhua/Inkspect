# Changelog

All notable changes to Inkspect are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
[Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-05-27

A second review round added new fiction-focused capabilities and polish.

### Added

- **Sentence Openers report:** flags runs of consecutive sentences that begin
  with the same word (the classic "She… She… She…" problem) and shows opener
  frequencies — a common fiction self-editing check.
- **Dialogue ratio:** the dashboard now shows the percentage of words inside
  quotation marks vs. narrative.
- **Clickable word breakdowns:** click any word/phrase in a report's breakdown
  to highlight just that item in the manuscript and step through its
  occurrences, with a focus chip to clear it.

### Tests

- 62 unit tests (added coverage for sentence openers and the dialogue ratio)
  and a 14-assertion browser verification run.

## [1.0.0] — 2026-05-27

First public release.

### Added

- **Analysis engine** (pure TypeScript, dependency-free) with ten fiction-focused
  reports:
  - Echoes (proximity repetition, stemmed, adjustable window)
  - Repeated phrases (verbatim 3–5 word n-grams)
  - Crutch & filler words (single and multi-word, with density)
  - Filter words
  - Adverbs (-ly), with emphasis on dialogue-tag adverbs
  - Weak verbs & passive-voice heuristic
  - Dialogue tags (neutral vs. said-bookisms)
  - Clichés (curated dictionary)
  - Sentence rhythm / monotony detection
  - Overused words (root-grouped frequency)
- **Readability**: Flesch Reading Ease, Flesch–Kincaid grade, full document
  stats, reading time, and an at-a-glance polish score.
- **Editor** with live re-analysis and click-to-locate highlighting; per-report
  finding navigation.
- **Import** from `.txt`, `.md`, and Word `.docx` (parsed locally via mammoth).
- **Export** a Markdown report; copy the manuscript text.
- **Light / dark themes**, responsive layout, keyboard-reachable controls.
- Runs analysis in a **Web Worker**; handles 100k+ word manuscripts smoothly.
- 100% client-side — no network requests at runtime.

### Craft accuracy

- **Proper-noun awareness:** character and place names are detected and excluded
  from the Echoes and Overused-words reports (repeating a name is not an echo).
- Expanded the non-adverb `-ly` allowlist so adjectives like "scholarly",
  "cowardly", and "friendly" are no longer mistaken for adverbs.
- Tightened the cliché dictionary to complete phrases (fewer false positives).

### Engineering

- 58 unit tests (engine + importer) and an 11-assertion real-browser verification
  script with screenshot capture.
- Lazy-loaded `.docx` parser keeps the initial bundle at ~62 kB gzipped.
- Synchronous fallback if the analysis Web Worker is unavailable.
- Memoised highlight rendering for smooth typing on long manuscripts.

### UX

- Drag-and-drop file loading with a drop overlay.
