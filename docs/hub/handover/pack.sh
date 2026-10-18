#!/bin/bash
# Упаковка локального состояния AID для переезда на новое устройство.
# Запускает PD на старом устройстве. Архив НЕ кладётся в git: передать лично
# (AirDrop, флешка). Секреты (ключи, токены, профили Облака) сюда не попадают;
# нашлось похожее на секрет — архив не собирается.
# Папка — в домашней, не в Desktop/Documents (они синхронизируются с iCloud).
#
#   bash docs/hub/handover/pack.sh [--dry-run] [~/Projects]
#   --dry-run — собрать папку без zip, чтобы прочитать, что попало
set -euo pipefail
umask 077

DRY=0; [ "${1:-}" = "--dry-run" ] && { DRY=1; shift; }
PROJECTS="${1:-$HOME/Projects}"
OUT="$HOME/aid-handover-$(date +%Y%m%d-%H%M)"
EXCL=(--exclude '.env*' --exclude '*.pem' --exclude '*.key' --exclude '*.p12' --exclude 'node_modules' --exclude '.git')
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
  rsync -a "${EXCL[@]}" "$m/" "$OUT/claude/memory/$key/"
done

# Пользовательские настройки Claude: без env (там могут быть токены)
[ -f "$HOME/.claude/CLAUDE.md" ] && cp "$HOME/.claude/CLAUDE.md" "$OUT/claude/"
for d in skills agents; do
  [ -d "$HOME/.claude/$d" ] && rsync -a "${EXCL[@]}" "$HOME/.claude/$d/" "$OUT/claude/$d/"
done
[ -f "$HOME/.claude/keybindings.json" ] && cp "$HOME/.claude/keybindings.json" "$OUT/claude/"
# settings.json: только известные безопасные ключи; hooks и *Helper не переносятся
if [ -f "$HOME/.claude/settings.json" ]; then
  python3 -I -c 'import json,sys
keep=("model","permissions","enabledPlugins","outputStyle","includeCoAuthoredBy","alwaysThinkingEnabled","language","cleanupPeriodDays")
d=json.load(open(sys.argv[1]))
json.dump({k:d[k] for k in keep if k in d},open(sys.argv[2],"w"),indent=2,ensure_ascii=False)' \
    "$HOME/.claude/settings.json" "$OUT/claude/settings.json"
fi

cp "$(dirname "$0")/unpack.sh" "$OUT/"

# Проверка на секреты: нашлось — без архива
PAT='(sk-ant-|sk-proj-|gh[opusr]_[A-Za-z0-9]{20,}|github_pat_|y0_[A-Za-z0-9_-]{20,}|AQVN|YC[AMN][A-Za-z0-9_-]{20,}|t1\.[A-Za-z0-9_-]{20,}|[0-9]{8,10}:[A-Za-z0-9_-]{35}|figd_|xox[abprs]-|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY|Bearer [A-Za-z0-9._~+/-]{16,}|(password|passwd|token|secret|api[_-]?key)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?[^[:space:]"'"'"']{8,})'
HITS=$(grep -rIlEi "$PAT" "$OUT" --exclude=warnings.txt --exclude=unpack.sh || true)
BIN=$(find "$OUT" -type f -exec sh -c '[ "$(file -b --mime-encoding "$1")" = binary ] && echo "$1"' _ {} \; || true)
echo "Папок: $(($(wc -l < "$MANIFEST") - 1)) · собрано в $OUT"
if [ -s "$WARN" ]; then echo; echo "Исправить до передачи:"; cat "$WARN"; fi
if [ -n "$HITS$BIN" ]; then
  echo; echo "СТОП: похоже на секреты или бинарные файлы — архив не собран. Убрать и запустить снова:"
  printf '%s\n' $HITS $BIN
  exit 1
fi
if [ "$DRY" = 1 ]; then echo; echo "dry-run: zip не собран, прочитать папку и удалить её"; exit 0; fi
( cd "$(dirname "$OUT")" && zip -qr "$(basename "$OUT").zip" "$(basename "$OUT")" )
echo "Готово: $OUT.zip — передать лично, затем удалить папку и zip"
