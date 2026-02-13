#!/usr/bin/env bash
set -euo pipefail

EXPECTED_PATH="audio/baby-blue.mp3"

if [[ ! -f "$EXPECTED_PATH" ]]; then
  echo "[FAIL] Missing required audio asset: $EXPECTED_PATH"
  echo "       Fix: add and commit the file before deploying to GitHub Pages."
  exit 1
fi

if [[ ! -s "$EXPECTED_PATH" ]]; then
  echo "[FAIL] Audio asset exists but is empty: $EXPECTED_PATH"
  exit 1
fi

echo "[OK] Found audio asset: $EXPECTED_PATH"

# Optional remote check: pass deployed site URL, e.g.
# ./scripts/audit-audio.sh https://habibfrhn.github.io/Valentine
if [[ "${1:-}" != "" ]]; then
  BASE_URL="${1%/}"
  URL="$BASE_URL/audio/baby-blue.mp3"
  HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -I "$URL" || true)
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo "[OK] Remote asset reachable: $URL"
  else
    echo "[FAIL] Remote asset not reachable yet ($HTTP_CODE): $URL"
    echo "       If file was just pushed, wait for GitHub Pages to finish deploy."
    exit 1
  fi
fi
