# RESEARCH — Choosing the product

> Phase 1 artifact. Written before any code. Captures the market scan, the
> scored shortlist, the chosen product, and the justification.

## 1. Method

I am an autonomous build agent with a Linux toolbox (Node 22, Python 3.11, Go,
Rust), full outbound internet for package registries, web search, and a headless
Chromium for screenshots. I have **no paid third-party API access** and **no
private data sources**. So the product must be buildable from public, lawful
inputs and ideally run entirely on the user's own machine.

I surveyed several niches with web searches, looking specifically for the
combination that the rubric rewards: a **specific underserved audience**, with
**observable demand**, where **existing free tools are weak**, that is **fully
doable client-side**, **demonstrable**, **finishable**, and **unambiguously
legal**.

## 2. Shortlist and scores

Scored 1–5 per criterion (5 = best). Legal/ethical is a pass/fail gate.

| Idea | Niche | Real demand | Doable client-side | Demonstrable | Defensible scope | Legal | **Weighted total** |
|---|---|---|---|---|---|---|---|
| **Inkspect** — self-editing analyzer for fiction writers (echoes, crutch/filter words, pacing) | 5 | 5 | 5 | 5 | 4 | ✅ | **★ Winner** |
| Subtitle resync + toolkit (SRT/VTT) | 2 | 5 | 5 | 4 | 4 | ✅ | Strong demand, **saturated** |
| EXIF metadata viewer/scrubber | 3 | 4 | 4 | 4 | 4 | ✅ | **saturated** (10+ free local tools) |
| Loan / debt-payoff (avalanche vs snowball) calculator | 3 | 4 | 5 | 4 | 4 | ✅ | Crowded, generic |

Weights (from the brief): Niche **High**, Real demand **High**, Doable **High**,
Demonstrable **Medium**, Defensible **Medium**, Legal **Gate**.

### Why the runners-up lost

- **Subtitle tools**: demand is obviously real (dozens of tools rank for "shift
  subtitles"), but that is exactly the problem — the space is *saturated*,
  including privacy-first, browser-local editors (SubtitleWise, subtitle-editor.org,
  SubtitleTools). One more entrant is not underserved. Fails "niche".
- **EXIF remover**: same story — a search for "remove exif no upload batch"
  returns 10+ free, browser-local tools plus the popular open-source ExifCleaner.
  Saturated.
- **Loan calculator**: useful but generic and crowded; weak "niche" story.

## 3. The chosen product: **Inkspect**

> **Inkspect** is a private, in-browser self-editing lens for fiction writers.
> Paste, drop a `.txt`/`.md`, or import a `.docx` manuscript and Inkspect
> instantly surfaces the prose problems that free tools ignore — repeated words
> and phrases that *echo* within a short span, crutch/filler words, "filter"
> words that distance the reader, adverb and weak-verb overuse, clichés,
> dialogue-tag abuse, and a sentence-rhythm/pacing map — all computed locally so
> a writer's unpublished draft never leaves their machine.

### The target user

Indie novelists, short-story writers, fanfiction authors, and anyone
self-editing long-form fiction before querying agents or self-publishing. They
draft in Word / Google Docs / Scrivener (hence `.docx` import matters), they are
**privacy-sensitive about unpublished work**, and most cannot or will not pay a
recurring subscription for an editing assistant.

### The core problem

Good self-editing means catching the things you can't see by re-reading: the
word you used three times in two sentences, the "just"/"really"/"suddenly"
crutches, the "she felt / he saw / I noticed" filter verbs that hold readers at
arm's length, the wall of same-length sentences that flattens pacing. These are
*mechanical, detectable* problems — but the tools that detect them well
(**ProWritingAid's "Echoes"**, **Grammarly Premium**) are **paid**, and the free
tools (**word-frequency counters**, **Hemingway App**) only do a fraction:
Hemingway flags adverbs/passive/readability but is general-purpose and knows
nothing about *fiction* craft (echoes, filter words, crutch words, said-bookisms);
frequency counters just rank words with no proximity, no stemming, no craft lists.

### Evidence of demand (from the research pass)

- A Microsoft Q&A thread literally titled *"Any free tools to find repeated
  non-adjacent words (similar to the option in Grammarly's Premium offering)?"* —
  a user explicitly asking for a **free** version of the exact killer feature.
- ProWritingAid markets **"Echoes"** (overused words/phrases within a window) as a
  premium report — confirming both the value and the paywall.
- A long tail of craft blog posts ("How to check overused words in your novel",
  "40 crutch words to eliminate", "filter words", "said-bookisms") shows writers
  actively hunting these patterns by hand with find-and-replace — a clunky manual
  workflow begging for a tool.

### Why it's doable, demonstrable, and finishable

- **Doable**: every analysis is a *deterministic text heuristic* — tokenizing,
  sentence splitting, light stemming, curated craft word-lists, proximity windows,
  readability formulas. No ML model, no API, no network. Pure TypeScript.
- **Demonstrable**: a rich multi-panel web UI — highlighted manuscript text, a
  per-issue inspector, a summary dashboard with a hand-drawn sentence-rhythm
  chart — screenshots beautifully.
- **Finishable**: the v1 feature set (see `SPEC.md`) has a sharp core and explicit
  non-goals (no grammar/spell check, no AI rewriting, no cloud).
- **Privacy as a feature, not a footnote**: because every incumbent that does this
  well is a cloud subscription, "100% local, your draft never leaves the browser"
  is a genuine, defensible differentiator for this exact audience.

### Legal / ethical

Fully clean. It processes only text the user themselves provides, sends nothing
anywhere, uses only permissively licensed dependencies, and helps people improve
their own writing. Nothing to defend.

## 4. One-paragraph pitch

*Inkspect is the free, private self-editing tool fiction writers have been asking
for. Drop in your manuscript — `.txt`, Markdown, or a Word `.docx` — and Inkspect
instantly highlights the craft problems that frequency counters miss and that
ProWritingAid and Grammarly charge for: words that echo within a few sentences,
crutch and filler words, reader-distancing "filter" verbs, adverb and weak-verb
overuse, clichés, repetitive dialogue tags, and a sentence-rhythm map that shows
where your pacing flatlines. Everything runs in your browser — your unpublished
draft never touches a server.*
