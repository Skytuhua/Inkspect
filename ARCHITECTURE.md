# ARCHITECTURE — Inkspect

> Phase 2 artifact. Tech-stack rationale, components, data flow, dependencies,
> and licenses.

## 1. Tech stack & rationale

| Choice | What | Why |
|---|---|---|
| **TypeScript** | language | Type safety across a non-trivial analysis engine + UI; catches offset/typing bugs early. |
| **React 18** | UI | The app is genuinely multi-panel and state-heavy (selected finding, active reports, highlight ranges); React keeps that tractable and the code readable for a stranger. |
| **Vite 5** | build/dev | Fast dev loop, first-class TS, trivial static build (`dist/`) that deploys to GitHub Pages and zips as an artifact. |
| **Vitest** | tests | Same toolchain as Vite; fast, ESM-native; perfect for the pure-function engine. |
| **Hand-written CSS** (design tokens via CSS variables) | styling | No utility-class or CSS-in-JS dependency; a small bespoke design system shows craftsmanship and keeps the bundle lean. Light/dark via `data-theme`. |
| **Web Worker** | concurrency | The analysis engine runs off the main thread so a 100k-word manuscript never freezes the UI. |
| **mammoth** (MIT) | `.docx` → text | Writers live in Word/Docs; `.docx` import is a real differentiator. mammoth extracts text client-side, no upload. |
| **Inline SVG** (hand-drawn) | charts | The sentence-rhythm map is drawn directly as SVG — no chart library, bespoke look, zero extra deps. |

**Key principle:** the **analysis engine is a dependency-free, framework-free,
pure-TypeScript library** (`src/engine`). It takes a string and options, returns a
typed `AnalysisResult`. It has no DOM, no React, no I/O — which is why it is
trivially unit-testable and could be reused as an npm package or CLI later.

## 2. Component / data flow

```
                         ┌──────────────────────────────────────┐
  file (.txt/.md/.docx)  │              UI (React)               │
  or paste  ───────────► │  App ─ Toolbar ─ EditorPane           │
                         │      ├ DashboardPane (stats + chart)   │
                         │      └ ReportsPane (report list)       │
                         └───────────────┬──────────────────────┘
                                         │ text + options
                                         ▼
                              ┌────────────────────┐
                              │  analysis.worker    │  (Web Worker)
                              └─────────┬──────────┘
                                        │ calls
                                        ▼
                          ┌──────────────────────────────┐
                          │  src/engine (pure TS library)  │
                          │  tokenizer → sentences →       │
                          │  [echoes, phrases, crutch,     │
                          │   filter, adverbs, weakVerbs,  │
                          │   cliches, dialogueTags,       │
                          │   rhythm, readability,         │
                          │   overused]                    │
                          └──────────────┬────────────────┘
                                         │ AnalysisResult (typed)
                                         ▼
                              highlights + reports + stats
                                         │
                                         ▼
                              UI renders, highlights spans,
                              user clicks finding → scroll/emphasize
```

### Engine pipeline

1. **Tokenize** once: produce `Token[]` with `{ text, start, end, isWord, lower }`
   character offsets. Every analyzer works off this shared token stream so all
   findings carry exact offsets back into the original string for highlighting.
2. **Segment** into sentences and paragraphs (offset-preserving).
3. **Run analyzers** — each is a pure function `(doc: Doc, opts) => Finding[]`/stats.
4. **Assemble** `AnalysisResult { stats, reports: Report[] }` where each `Report`
   has an id, label, severity, summary, and `findings: Finding[]` (each with
   `{ start, end, message }`).

### Why offsets everywhere

Highlighting and click-to-navigate require mapping every finding to an exact
character range in the source text. Computing offsets in the engine (not the UI)
keeps the UI dumb and the logic testable.

## 3. Project layout

```
inkspect/
├─ index.html
├─ src/
│  ├─ engine/            # pure analysis library (no DOM)
│  │  ├─ types.ts
│  │  ├─ tokenize.ts
│  │  ├─ segment.ts
│  │  ├─ stem.ts
│  │  ├─ wordlists.ts
│  │  ├─ syllables.ts
│  │  ├─ analyzers/      # one file per analysis
│  │  └─ index.ts        # analyze(text, opts): AnalysisResult
│  ├─ ui/                # React components
│  ├─ styles/            # CSS design system
│  ├─ worker/            # analysis.worker.ts
│  ├─ sample.ts          # bundled sample manuscript
│  └─ main.tsx
├─ tests/                # Vitest specs for the engine
├─ scripts/              # build-artifacts, screenshot, publish
├─ docs/                 # extra docs
└─ review/               # QA evidence (screenshots, REVIEW.md)
```

## 4. Dependencies & licenses

Runtime:
- **react**, **react-dom** — MIT.
- **mammoth** — MIT (`.docx` text extraction, client-side).

Dev/build:
- **vite**, **@vitejs/plugin-react** — MIT.
- **typescript** — Apache-2.0.
- **vitest** — MIT.
- **eslint** + TS plugins — MIT.

All permissive (MIT/Apache-2.0). No copyleft, no paid services, no network calls
at runtime. The project's own license is **MIT** (see `LICENSE`).

## 5. Performance & robustness notes

- Analysis runs in a **Web Worker**; the UI shows a subtle "analyzing…" state and
  stays responsive. Input is debounced (~400 ms).
- Engine is **O(n)** in tokens for most analyzers; echoes/phrases use windowed/
  hashed passes to stay linear-ish. Targets a 100k-word manuscript in well under a
  second on a typical laptop.
- Defensive parsing: malformed `.docx` → caught, surfaced as an error state;
  empty/whitespace input → clean empty state; enormous input → still completes
  (work off main thread). Unicode/non-Latin text is tokenized without crashing
  (analyses simply find fewer English-specific hits).
