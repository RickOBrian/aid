#!/bin/bash
# Упаковка локального состояния AID для переезда на новое устройство.
# Запускает PD на старом устройстве. Архив НЕ кладётся в git: передать лично
# (AirDrop, флешка). Секреты (ключи, токены, профили Облака) сюда не попадают.
#
#   bash docs/hub/handover/pack.sh [~/Projects]
set -euo pipefail

PROJECTS="${1:-$HOME/Projects}"
OUT="$HOME/Desktop/aid-handover-$(date +%Y%m%d-%H%M)"
mkdir -p "$OUT/folders" "$OUT/claude/memory"
MANIFEST="$OUT/manifest.tsv"
printf 'folder\tworktree_of\tbranch\tdirty\tremote\n' > "$MANIFEST"
WARN="$OUT/warnings.txt"; : > "$WARN"

for dir in "$PROJECTS"/aid*; do
  [ -d "$dir/.git" ] || [ -f "$dir/.git" ] || continue
  name=$(basename "$dir")
  common=$(cd "$dir" && cd "$(git rev-parse --git-common-dir)/.." && basename "$PWD")
  branch=$(git -C "$dir" branch --show-current || true)
  dirty=$(git -C "$dir" status --porcelain | wc -l | tr -d ' ')
  remote=$(git -C "$dir" remote get-url origin 2>/dev/null || true)
  printf '%s\t%s\t%s\t%s\t%s\n' "$name" "$common" "$branch" "$dirty" "$remote" >> "$MANIFEST"
  [ "$dirty" != "0" ] && echo "$name: $dirty незакоммиченных файлов — закоммитить и запушить до переезда" >> "$WARN"
  if [ -n "$branch" ] && ! git -C "$dir" rev-parse --verify -q "origin/$branch" >/dev/null; then
    echo "$name: ветка $branch не запушена — запушить до переезда" >> "$WARN"
  fi
  # CLAUDE.local.md — состояние чатов (в git его нет)
  found=0
  while IFS= read -r f; do
    rel="${f#$dir/}"
    mkdir -p "$OUT/folders/$name/$(dirname "$rel")"
    cp "$f" "$OUT/folders/$name/$rel"; found=1
    age=$(( ( $(date +%s) - $(stat -f %m "$f") ) / 86400 ))
    [ "$age" -ge 2 ] && echo "$name/$rel: не обновлялся $age дн. — попросить чат сохранить состояние" >> "$WARN"
  done < <(find "$dir" -maxdepth 4 -name CLAUDE.local.md -not -path '*/node_modules/*')
  [ "$found" = 0 ] && echo "$name: нет CLAUDE.local.md — попросить чат сохранить состояние" >> "$WARN"
  [ -f "$dir/.claude/intake-user" ] && { mkdir -p "$OUT/folders/$name/.claude"; cp "$dir/.claude/intake-user" "$OUT/folders/$name/.claude/"; }
done

# Память Claude по папкам (~/.claude/projects/<путь>/memory)
for m in "$HOME"/.claude/projects/*Projects-aid*/memory; do
  [ -d "$m" ] || continue
  key=$(basename "$(dirname "$m")" | sed 's/.*-Projects-//')
  cp -R "$m" "$OUT/claude/memory/$key"
done

# Пользовательские настройки Claude: без env (там могут быть токены)
[ -f "$HOME/.claude/CLAUDE.md" ] && cp "$HOME/.claude/CLAUDE.md" "$OUT/claude/"
[ -d "$HOME/.claude/skills" ] && cp -R "$HOME/.claude/skills" "$OUT/claude/"
[ -d "$HOME/.claude/agents" ] && cp -R "$HOME/.claude/agents" "$OUT/claude/"
[ -f "$HOME/.claude/keybindings.json" ] && cp "$HOME/.claude/keybindings.json" "$OUT/claude/"
if [ -f "$HOME/.claude/settings.json" ]; then
  python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); d.pop("env",None); json.dump(d,open(sys.argv[2],"w"),indent=2,ensure_ascii=False)' \
    "$HOME/.claude/settings.json" "$OUT/claude/settings.json"
fi

# Грубая проверка на секреты в упакованном
if grep -rIlE '(sk-ant-|ghp_|github_pat_|AQVN|t1\.[A-Za-z0-9_-]{20,}|BEGIN [A-Z ]*PRIVATE KEY)' "$OUT" >> "$WARN.secrets" 2>/dev/null; then
  echo "ВНИМАНИЕ: похоже на секреты в файлах (см. warnings.txt.secrets) — убрать до передачи" >> "$WARN"
fi

cp "$(dirname "$0")/unpack.sh" "$OUT/"

( cd "$(dirname "$OUT")" && zip -qr "$(basename "$OUT").zip" "$(basename "$OUT")" )
echo "Готово: $OUT.zip"
echo "Папок: $(($(wc -l < "$MANIFEST") - 1))"
if [ -s "$WARN" ]; then echo; echo "Исправить до передачи:"; cat "$WARN"; fi
