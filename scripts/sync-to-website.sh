#!/usr/bin/env bash
# Copy the built game into the erikmillerhlt.com site repo, which serves it at /play/.
# Usage: scripts/sync-to-website.sh [path-to-erikmillerhlt-checkout]
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SITE="${1:-$HERE/../erikmillerhlt}"
[ -d "$SITE" ] || { echo "Site checkout not found at $SITE" >&2; exit 1; }
if command -v rsync >/dev/null 2>&1; then
  mkdir -p "$SITE/play"
  rsync -a --delete --exclude '.DS_Store' "$HERE/dist/" "$SITE/play/"
else
  rm -rf "$SITE/play"
  cp -R "$HERE/dist" "$SITE/play"
fi
echo "Synced dist/ -> $SITE/play/ ($(find "$SITE/play" -type f | wc -l) files). Commit in the site repo to deploy."
