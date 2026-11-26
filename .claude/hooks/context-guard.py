#!/usr/bin/env python3
"""Предохранитель контекста (ORCHESTRATION §12, решение PD 2026-10-18).

UserPromptSubmit: если последний шаг чата прочитал больше LIMIT токенов
контекста, добавляет к сообщению напоминание сохранить состояние и
перезапуститься; если CLAUDE.local.md папки больше
AID_STATE_LIMIT байт — напоминание свернуть его (save-state §5, AID-112).
Ничего не блокирует; ошибки молча пропускает.
"""
import json, os, sys


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
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

try:
    LIMIT = int(os.environ.get("AID_CONTEXT_LIMIT", "150000"))
    ctx = last_context(data["transcript_path"])
except Exception:
    ctx = 0
if ctx > LIMIT:
    print(f"[context-guard] Контекст чата ~{ctx // 1000} тыс. токенов (порог {LIMIT // 1000} тыс.). "
          "Каждый шаг перечитывает его целиком. Доведи текущий шаг до безопасной точки, "
          "запиши состояние в CLAUDE.local.md своей папки и перезапустись "
          "(clear_session \"self\"), ORCHESTRATION §12. Если задача почти закрыта — сначала закрой.")

# Размер файла состояния (AID-112): больше лимита — сворачивать, не дописывать.
try:
    STATE_LIMIT = int(os.environ.get("AID_STATE_LIMIT", "15000"))
    size = os.path.getsize(os.path.join(data.get("cwd") or os.getcwd(), "CLAUDE.local.md"))
except Exception:
    size = 0
if size > STATE_LIMIT:
    print(f"[context-guard] CLAUDE.local.md — {size // 1000} КБ (лимит {STATE_LIMIT // 1000} КБ), "
          "он читается на каждом старте. Не дописывай в него без сворачивания: "
          "/save-state compact (скилл save-state §5).")
