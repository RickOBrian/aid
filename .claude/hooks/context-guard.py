#!/usr/bin/env python3
"""Предохранитель контекста (ORCHESTRATION §12, решение PD 2026-10-18).

UserPromptSubmit: если последний шаг чата прочитал больше LIMIT токенов
контекста, добавляет к сообщению напоминание сохранить состояние и
перезапуститься. Ничего не блокирует; ошибки молча пропускает.
"""
import json, os, sys

LIMIT = int(os.environ.get("AID_CONTEXT_LIMIT", "150000"))

def last_context(path):
    with open(path, "rb") as f:
        f.seek(0, 2)
        f.seek(max(0, f.tell() - 400_000))
        lines = f.read().decode("utf-8", "ignore").splitlines()
    for line in reversed(lines):
        try:
            e = json.loads(line)
        except ValueError:
            continue
        u = (e.get("message") or {}).get("usage") if e.get("type") == "assistant" else None
        if u:
            return sum(u.get(k) or 0 for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
    return 0

try:
    ctx = last_context(json.load(sys.stdin)["transcript_path"])
except Exception:
    sys.exit(0)
if ctx > LIMIT:
    print(f"[context-guard] Контекст чата ~{ctx // 1000} тыс. токенов (порог {LIMIT // 1000} тыс.). "
          "Каждый шаг перечитывает его целиком. Доведи текущий шаг до безопасной точки, "
          "запиши состояние в CLAUDE.local.md своей папки и перезапустись "
          "(clear_session \"self\"), ORCHESTRATION §12. Если задача почти закрыта — сначала закрой.")
