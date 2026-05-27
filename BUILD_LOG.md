# BUILD LOG — Inkspect

A running, append-only journal of the build: decisions, dead ends, fixes, and
review findings. Newest entries at the bottom of each phase.

## Phase 0 — Environment & capability setup

- Inventoried the sandbox: **Linux**, root, `apt-get` available. Tooling present:
  `git 2.43`, **Node 22.22 / npm 10.9**, **Python 3.11**, **Go 1.24**,
  **Rust/cargo 1.94**, `curl`. Headless **Chromium** present at
  `/opt/pw-browsers` (Playwright browsers).
- **No `gh` CLI** initially → installed `gh 2.63.2` to `/usr/local/bin`.
- **Network**: outbound works for `github.com` (read), `registry.npmjs.org`,
  `pypi.org`, `example.com` (all 200). `crates.io`/`reddit.com` return 403 to the
  bot UA (fine; not needed).
- **GitHub publishing investigation (important):** this session is **not attached
  to a source repo** (`/home/user` is empty, not a git repo) and there is **no
  GitHub API token / write credential** exposed to the shell:
  - `gh auth status` → not logged in; no `GH_TOKEN`/`GITHUB_TOKEN` in env; no
    `~/.config/gh/hosts.yml`; no `~/.netrc`; no credential helper configured.
  - Authenticated API probes (`gh api user`, `curl -H "Authorization: Bearer …"`,
    `curl -u x:…`) with a placeholder token all return **401 Bad credentials** —
    i.e. the egress proxy does **not** inject GitHub credentials for me.
  - Public `git ls-remote` works anonymously; a private/nonexistent repo prompts
    for a username (no creds injected).
  - The environment-manager binary references an `allow_unrestricted_git_push`
    session flag, implying push auth is possible *when the orchestrator drives
    git* — but it is not wired into this interactive shell.
  - **Conclusion:** I cannot create a GitHub repo or push from inside this
    session without a credential. Per the brief's contingency, I will **build,
    test, document, and package everything to completion locally**, create a full
    local git history with a tagged release and verified artifacts, and ship a
    **one-command `scripts/publish.sh`** that completes the GitHub publish the
    moment a token (`GH_TOKEN`) is provided. This is documented honestly in the
    final report.

## Phase 1 — Discovery & research

- Surveyed niches via web search. Found subtitle tools and EXIF removers to be
  **saturated** (many free, browser-local options each), so they fail the "niche /
  underserved" criterion despite real demand.
- Found a strong underserved fit: **self-editing analysis for fiction writers**.
  Free tools only do crude word-frequency counts; the valuable features (proximity
  "echo" detection, crutch/filter words, pacing) are paywalled (ProWritingAid
  "Echoes", Grammarly Premium). Direct demand evidence: a Microsoft Q&A asking for
  a *free* non-adjacent repeated-word finder. See `RESEARCH.md` for the scored
  shortlist and justification.
- **Chosen product: Inkspect.** Decision recorded; proceeding to scaffold.

## Phase 2 — Scaffolding

- Created `inkspect/` project folder, `git init`, directory structure.
- Wrote `RESEARCH.md`, `SPEC.md`, `ARCHITECTURE.md`, this `BUILD_LOG.md`.
- Stack chosen: TypeScript + React 18 + Vite 5, Vitest for tests, hand-written CSS
  design system, Web Worker for off-main-thread analysis, `mammoth` for `.docx`.
  The analysis engine is a pure, dependency-free TS library for testability.

## Phase 3 — Dependency & dev-loop setup

- `npm install` (React, mammoth; Vite, Vitest, ESLint, TypeScript, jsdom). Pinned.
- Verified the dev loop on a baseline: `tsc --noEmit`, `vitest`, `eslint`, and
  `vite build` all run.

## Phase 4 — Build

- Implemented the engine: `tokenize`, `segment`, `stem`, `syllables`, curated
  `wordlists`, ten analyzers, and `analyze()` assembling stats + reports + rhythm.
- Built the React UI: highlighting editor (textarea + synced backdrop overlay),
  dashboard (stats, polish score, hand-drawn SVG rhythm chart), reports sidebar
  with finding navigation, toolbar, theme toggle, file import, report export.
- Lazy-loaded `mammoth` so it isn't in the initial bundle.

## Phase 5 — Self-review & QA (see review/REVIEW.md for the full pass)

- Wrote 55 unit tests; all green. Fixed real bugs they/the browser surfaced:
  - Sentence segmentation split on dialogue (`"Stop!" she cried.`) and decimals
    (`3.50`); leading quotes were dropped from spans. Rewrote the boundary rules.
  - Syllable counter over-counted triple-vowel words ("beautiful"). Simplified.
  - Initial JS bundle was 677 kB (eager mammoth) → lazy import → 184 kB / 61 kB gz.
  - Two lint nits (`while(true)`, regex escape).
- Built `scripts/screenshot.mjs`: drives real Chromium, 10 assertions (all pass),
  captures screenshots of every major state into `review/screenshots/`. Verified:
  empty state, sample analysis + highlighting, report navigation, theme toggle,
  real `.docx` import, clear, mobile, and **zero console errors**.

## Phase 6 — Docs & packaging

- Wrote `README.md` (with screenshot), `CHANGELOG.md`.
- `scripts/build-artifacts.mjs` builds `artifacts/inkspect-1.0.0-web.zip` +
  `SHA256SUMS.txt`. Verified the artifact runs from a clean unzip served over HTTP
  (analysis + highlights work, no errors).

## Phase 7 — Ship

- Created local git history and tag `v1.0.0`.
- GitHub publish: no credential is available in this session (see Phase 0), so
  publishing is staged behind `scripts/publish.sh`, which creates the repo,
  pushes, and cuts the release with the artifact attached given a single
  `GH_TOKEN`. Documented in the final report.
