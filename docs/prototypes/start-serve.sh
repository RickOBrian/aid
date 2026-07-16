#!/usr/bin/env bash
# Keeps the banner demo server alive — restarts on unexpected exit.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-9876}"

while true; do
  echo "[serve] starting on :${PORT} ($(date '+%H:%M:%S'))"
  python3 serve.py "$PORT" || true
  echo "[serve] exited, restart in 1s…"
  sleep 1
done
