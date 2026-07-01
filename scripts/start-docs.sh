#!/usr/bin/env bash
# DS Docs — single dev server (static files + token save API)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-3335}"

if lsof -ti ":${PORT}" >/dev/null 2>&1; then
  echo "Stopping process on port ${PORT}…"
  lsof -ti ":${PORT}" | xargs kill -9 2>/dev/null || true
  sleep 0.3
fi

cd "$ROOT"
exec python3 scripts/docs-server.py "$PORT"
