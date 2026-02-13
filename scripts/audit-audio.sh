#!/usr/bin/env bash
set -euo pipefail

PRIMARY_PATH="audio/baby-blue.mp3"
FALLBACK_PATH="audio/baby-blue.wav"

if [[ -f "$PRIMARY_PATH" && -s "$PRIMARY_PATH" ]]; then
  CHOSEN_PATH="$PRIMARY_PATH"
elif [[ -f "$FALLBACK_PATH" && -s "$FALLBACK_PATH" ]]; then
  CHOSEN_PATH="$FALLBACK_PATH"
else
  echo "[FAIL] Missing required audio asset. Expected one of:"
  echo "       - $PRIMARY_PATH"
  echo "       - $FALLBACK_PATH"
  echo "       Fix: add and commit at least one file before deploying to GitHub Pages."
  exit 1
fi

echo "[OK] Found audio asset: $CHOSEN_PATH"

# Optional remote check: pass deployed site URL, e.g.
# ./scripts/audit-audio.sh https://habibfrhn.github.io/Valentine
if [[ "${1:-}" != "" ]]; then
  BASE_URL="${1%/}"
  URL_PRIMARY="$BASE_URL/audio/baby-blue.mp3"
  URL_FALLBACK="$BASE_URL/audio/baby-blue.wav"

  HTTP_PRIMARY=$(curl -sS -o /dev/null -w "%{http_code}" -I "$URL_PRIMARY" || true)
  HTTP_FALLBACK=$(curl -sS -o /dev/null -w "%{http_code}" -I "$URL_FALLBACK" || true)

  if [[ "$HTTP_PRIMARY" == "200" ]]; then
    echo "[OK] Remote asset reachable: $URL_PRIMARY"
  elif [[ "$HTTP_FALLBACK" == "200" ]]; then
    echo "[OK] Remote fallback asset reachable: $URL_FALLBACK"
  else
    echo "[FAIL] Remote assets not reachable yet ($HTTP_PRIMARY / $HTTP_FALLBACK):"
    echo "       - $URL_PRIMARY"
    echo "       - $URL_FALLBACK"
    echo "       If files were just pushed, wait for GitHub Pages to finish deploy."
    exit 1
  fi
fi
