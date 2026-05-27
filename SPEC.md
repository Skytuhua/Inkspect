# SPEC — Inkspect v1

> Phase 2 artifact. The product requirements / definition of "done" for v1.
> If a feature is listed under **v1 scope**, it must actually work, with tests,
> before release. Anything under **non-goals** is explicitly out.

## 1. One-line definition

A private, in-browser self-editing lens for fiction writers that surfaces the
prose problems free tools ignore — computed entirely on the user's machine.

## 2. Primary user flows

1. **Bring text in.** The user pastes text, drops/opens a `.txt` or `.md` file,
   or imports a `.docx` (Word) manuscript. Text appears in the editor pane.
2. **Analyze.** Analysis runs automatically (debounced) and on demand. A summary
   dashboard updates with counts, a readability score, and a sentence-rhythm map.
3. **Investigate.** The user opens any report (e.g. "Echoes"), sees the flagged
   spans, and clicks an item to scroll the manuscript to that occurrence with the
   span highlighted. Toggling a report highlights all of its hits in the text.
4. **Act & export.** The user revises in place (the editor is editable) and
   re-analyzes, or exports a plain-text/Markdown report of all findings, or
   copies the cleaned text back out.

## 3. v1 scope — analyses (every one must work + be tested)

Each analysis returns a list of findings with character offsets so the UI can
highlight them, plus summary stats.

1. **Echoes (proximity repetition)** — the headline feature. The same word
   *stem* (light stemmer) repeated within a configurable window (default 50
   words), excluding stopwords. Reports each cluster with its occurrences.
2. **Repeated phrases** — n-grams (3–5 words) that occur more than once in the
   whole document (verbatim phrase repetition).
3. **Crutch / filler words** — curated list (just, really, very, quite, somehow,
   suddenly, actually, basically, literally, simply, rather, even, that …) with
   per-word counts and density per 1,000 words; flagged above a threshold.
4. **Filter words** — reader-distancing verbs (saw, heard, felt, knew, realized,
   noticed, watched, seemed, decided, wondered, thought, looked …) with counts
   and highlighted occurrences.
5. **Adverbs (-ly)** — detection of `-ly` adverbs (excluding a non-adverb
   allowlist like "only", "family", "reply"), with special emphasis on adverbs
   attached to dialogue tags ("said angrily").
6. **Weak / "to be" verbs & passive heuristic** — density of am/is/are/was/were/
   be/been/being and a simple passive-voice heuristic (to-be + past participle).
7. **Clichés** — curated cliché phrase dictionary, matched case-insensitively.
8. **Dialogue tags** — counts of `said`/`asked` vs. "said-bookisms"
   (exclaimed, retorted, ejaculated, opined …) and adverb-laden tags.
9. **Sentence rhythm / pacing** — per-sentence word counts; mean, variety
   (stdev), and a flag for monotonous runs (≥N consecutive sentences within a
   narrow length band). Rendered as a bar/area sparkline.
10. **Readability** — Flesch Reading Ease + Flesch–Kincaid Grade Level, plus
    word/sentence/paragraph/syllable counts and estimated reading time.
11. **Overused words (global)** — frequency table excluding stopwords, with
    light stemming so "run/running/ran" group, sortable.

## 4. v1 scope — UX / product polish

- **Three-pane layout**: manuscript editor (center), reports sidebar (right),
  summary dashboard (top or left). Responsive: collapses to stacked panes on
  narrow screens.
- **Real states**: empty state with a "Load sample manuscript" button; loading
  state for `.docx` parsing; graceful error state for unsupported/garbled files;
  success/idle states.
- **Highlighting**: toggling a report highlights its spans in the text;
  selecting a single finding scrolls to and emphasizes it.
- **Controls**: adjustable echo window & thresholds; light/dark theme;
  word-count target.
- **Privacy banner**: explicit "runs 100% in your browser — nothing is uploaded".
- **Export**: download a `.md`/`.txt` report; copy current text.
- **Keyboard & a11y**: focusable controls, semantic landmarks, sufficient
  contrast, no mouse-only interactions for core flows.
- **Performance**: analyze a ~100k-word novel without freezing the UI (work runs
  off the main thread in a Web Worker; debounced).

## 5. Non-goals (explicitly out of v1)

- Grammar and spelling correction (that is Grammarly/LanguageTool territory and
  needs large language resources).
- AI / LLM rewriting or suggestions.
- Cloud sync, accounts, collaboration, server of any kind.
- Real-time as-you-type inline squiggles inside a rich text editor (we re-analyze
  on a debounce/keystroke, but the editor is a plain textarea-style surface, not
  a full rich-text engine).
- Languages other than English (heuristics and word lists are English-only in v1;
  the architecture leaves room to add locales later).
- `.pdf` import (text extraction from PDF is unreliable; out of scope).

## 6. Definition of done

- [ ] All 11 analyses implemented and each covered by unit tests (happy path +
      edge cases).
- [ ] `.txt`, `.md`, paste, and `.docx` import all work and are verified.
- [ ] UI shows empty/loading/error/success states; highlighting & navigation work.
- [ ] Handles empty input, huge input (100k words), non-English/Unicode, and
      malformed `.docx` without crashing.
- [ ] Light/dark theme; responsive; keyboard-usable; adequate contrast.
- [ ] Report export and text copy work.
- [ ] Lint, type-check, and unit tests all green.
- [ ] Verified in a real browser with screenshots of every major state.
- [ ] README + CHANGELOG + LICENSE; built static artifact runs from a clean state.
