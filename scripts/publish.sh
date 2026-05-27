#!/usr/bin/env bash
# One-command GitHub publish for Inkspect.
#
# Prerequisites:
#   - GitHub CLI `gh` installed (https://cli.github.com/), OR a GH_TOKEN env var.
#   - A GitHub token with `repo` scope, provided either via `gh auth login`
#     or `export GH_TOKEN=...`.
#
# Usage:
#   ./scripts/publish.sh [github-username] [repo-name]
#
# Defaults: repo name "inkspect"; username taken from the authenticated account.
#
# What it does:
#   1. Builds release artifacts (artifacts/inkspect-<version>-web.zip + checksums).
#   2. Creates a PUBLIC GitHub repo (if it doesn't exist) and pushes main.
#   3. Sets description + topics.
#   4. Creates tag/release vX.Y.Z with notes and attaches the artifacts.
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION="$(node -p "require('./package.json').version")"
REPO_NAME="${2:-inkspect}"
ZIP="artifacts/inkspect-${VERSION}-web.zip"
DESC="A private, in-browser self-editing lens for fiction writers — echoes, crutch/filter words, clichés, pacing. 100% local."

echo "▶ Inkspect publish — v${VERSION}"

command -v gh >/dev/null || { echo "ERROR: GitHub CLI 'gh' not found."; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "ERROR: not authenticated. Run 'gh auth login' or set GH_TOKEN."; exit 1; }

USER="${1:-$(gh api user --jq .login)}"
SLUG="${USER}/${REPO_NAME}"
echo "  target repo: ${SLUG}"

# 1. Artifacts.
node scripts/build-artifacts.mjs

# 2. Commit anything pending (no-op if clean).
git add -A
git commit -m "chore: release v${VERSION}" >/dev/null 2>&1 || true

# 3. Create the repo if needed and push.
if gh repo view "${SLUG}" >/dev/null 2>&1; then
  echo "  repo exists — pushing"
  git remote add origin "https://github.com/${SLUG}.git" 2>/dev/null || true
  git push -u origin HEAD:main
else
  echo "  creating public repo"
  gh repo create "${SLUG}" --public --source=. --remote=origin --description "${DESC}" --push
fi

# 4. Topics + homepage.
gh repo edit "${SLUG}" \
  --description "${DESC}" \
  --add-topic writing --add-topic fiction --add-topic editor \
  --add-topic writing-tools --add-topic prose --add-topic self-editing \
  --add-topic privacy --add-topic typescript --add-topic react || true

# 5. Tag + release with the artifact attached.
if gh release view "v${VERSION}" --repo "${SLUG}" >/dev/null 2>&1; then
  echo "  release v${VERSION} already exists — uploading assets"
  gh release upload "v${VERSION}" "${ZIP}" artifacts/SHA256SUMS.txt --repo "${SLUG}" --clobber
else
  gh release create "v${VERSION}" "${ZIP}" artifacts/SHA256SUMS.txt \
    --repo "${SLUG}" \
    --title "Inkspect v${VERSION}" \
    --notes-file - <<EOF
First public release of **Inkspect** — a private, in-browser self-editing lens for fiction writers.

Detects the prose problems free tools ignore: echoes, crutch & filler words, filter words, adverbs (incl. on dialogue tags), weak/passive verbs, clichés, said-bookisms, sentence-rhythm flatlines, and overused words — plus readability and a polish score. Imports \`.txt\`, \`.md\`, and Word \`.docx\`. Runs 100% in your browser; nothing is uploaded.

**Artifact:** \`${ZIP##*/}\` is a static site — unzip and serve over HTTP (e.g. \`npx serve\`), or host on any static host. See \`SHA256SUMS.txt\` to verify.

See the [CHANGELOG](CHANGELOG.md) for the full feature list.
EOF
fi

echo ""
echo "✓ Published: https://github.com/${SLUG}"
echo "✓ Release:   https://github.com/${SLUG}/releases/tag/v${VERSION}"
