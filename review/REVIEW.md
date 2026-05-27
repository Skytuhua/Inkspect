# REVIEW — Inkspect QA

> Phase 5 artifact. Multiple review passes from distinct angles, the findings
> each surfaced, the fix, and the re-verification evidence. Screenshots live in
> `review/screenshots/`. The automated browser verification is
> `scripts/screenshot.mjs` (10 assertions, all passing).

## Evidence index

| State | Screenshot |
|---|---|
| Empty state (dark) | `screenshots/01-empty-dark.png` |
| Sample loaded, Echoes highlighted (dark) | `screenshots/02-sample-echoes-dark.png` |
| Crutch & filler report, finding selected | `screenshots/03-crutch-report-dark.png` |
| Dialogue tags report | `screenshots/04-dialogue-tags-dark.png` |
| Echoes (light theme) | `screenshots/05-sample-echoes-light.png` |
| Real `.docx` import | `screenshots/06-docx-import-dark.png` |
| Mobile / responsive | `screenshots/07-mobile-dark.png` |

## Pass 1 — Functional

Exercised every flow against `SPEC.md` via `scripts/screenshot.mjs` driving a
real Chromium:

- Empty state CTA → load sample → 10 reports render → word count populates → text
  is highlighted. **PASS.**
- Open a report → findings list + per-item nav; "next" selects and scrolls to a
  single emphasised span (`mark.sel` count === 1). **PASS.**
- Theme toggle flips `data-theme` and restyles. **PASS.**
- Real Word `.docx` import via mammoth → "Chapter One" text appears and analysis
  re-runs. **PASS.**
- Clear → returns to empty state. **PASS.**
- **No console or page errors** across the whole run. **PASS.**

Unit coverage: 55 Vitest specs over the engine (tokenizer, segmenter, stemmer,
syllables, all 10 analyzers, end-to-end `analyze`) and the file importer.

### Findings fixed in this pass

1. **Sentence splitting broke on dialogue and decimals.** `"Stop!" she cried.`
   split after `Stop!`, and `3.50` split at the decimal. **Fix:** require
   whitespace after a terminator (kills the `3.50` split) and treat a following
   lower-case word as a continuation (keeps dialogue intact). Re-verified by
   `tests/segment.test.ts`.
2. **Leading quotes were dropped from sentence spans.** Sentence start was the
   first word, excluding an opening `"`. **Fix:** start each sentence at the
   first non-whitespace char after the previous boundary. Verified by the
   "keeps the closing quote" + offset-mapping tests.
3. **"Ready" race in the verifier.** The empty-document result also has 10
   reports, so waiting on report count fired before the real analysis. **Fix:**
   wait on a populated word-count stat.

## Pass 2 — Visual / UX

Reviewed every screenshot as a harsh design critic.

- Hierarchy, spacing, and alignment are consistent; the manuscript reads in a
  serif column while UI chrome stays sans-serif. **Good.**
- Severity is encoded redundantly (coloured dot **and** text summary), not by
  colour alone. **Good for accessibility.**
- The polish score reads `10/100 — "Lots to tighten up"` on the deliberately
  flawed sample, which is the correct, legible signal.
- Both dark and light themes have sufficient contrast for body text, dimmed
  metadata, and highlights.

### Findings fixed

4. **Initial JS bundle was 677 kB** — almost entirely mammoth, loaded eagerly.
   **Fix:** lazy `import('mammoth')` inside the `.docx` branch. Initial bundle
   dropped to **184 kB (61 kB gzip)**; mammoth is a separate chunk fetched only
   when a Word file is opened.

## Pass 3 — Edge cases & robustness

- **Empty / whitespace-only input** → clean empty state, zero findings, no throw
  (`tests/analyze.test.ts`).
- **~150k-word manuscript** → completes in well under a second and the UI stays
  responsive because analysis runs in a **Web Worker** (`analyze` perf test).
- **Non-English / Unicode** (Cyrillic, CJK, accented Latin) → tokenizes without
  crashing; English-specific reports simply find fewer hits.
- **Malformed / binary files** → `.doc`, `.pdf`, and binary-as-`.txt` all produce
  friendly, specific error toasts rather than crashes (`tests/fileImport.test.ts`).
- **Empty `.docx`** → caught and surfaced as an error.

## Pass 4 — Code quality & security

- **No XSS surface:** all manuscript text is rendered through React text nodes
  and `<mark>` children — there is no `dangerouslySetInnerHTML` anywhere.
- **No network at runtime:** the app makes zero fetch/XHR calls; everything is
  local. The privacy claim is therefore literally true.
- **No secrets**, no eval, no unsafe deserialization. `.docx` is parsed by
  mammoth (MIT) entirely client-side.
- **Engine is pure and dependency-free**, which is why it is exhaustively
  unit-testable.
- `tsc --noEmit`, `eslint --max-warnings 0`, and `vitest` are all green.

### Findings fixed

5. **Over-eager syllable rule** double-counted triple-vowel words ("beautiful"
   → 4). **Fix:** simplified to a standard vowel-group counter with silent-e
   handling; pinned by `tests/stem.test.ts`.
6. **Lint:** a `while (true)` and an unnecessary regex escape. **Fixed.**

## Pass 5 — Accessibility & performance

- Buttons have `aria-label`s; the file input is reachable; reports are real
  `<button>`s with `aria-expanded`; the rhythm chart has a `role="img"` label.
- Colour is never the sole signal (text summaries accompany severity colours).
- Performance: 60 fps interaction; heavy work off the main thread; debounced
  re-analysis; long-manuscript chart is downsampled to ≤140 bars.

## Pass 6 — "Would a real user keep this?"

Yes. It does the specific thing the target user (a self-editing novelist) cannot
get free elsewhere — proximity echoes, crutch/filter words, said-bookisms,
pacing — over their own `.docx`, privately, with click-to-locate highlights and
an exportable report. It is fast, looks finished, and respects their draft.

## Result

A full review cycle produced **no remaining material findings**. All automated
checks (55 unit tests + 10 browser assertions) pass; screenshots captured for
every major state.
