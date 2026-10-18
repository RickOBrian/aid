#!/bin/bash
# Распаковка состояния AID на новом устройстве (после pack.sh на старом).
# До запуска: установлены git, gh, node, Claude Desktop; выполнен `gh auth login`.
# Ничего существующего не перезаписывает.
#
#   bash unpack.sh ~/aid-handover-YYYYMMDD-HHMM [~/Projects]
set -euo pipefail
umask 077

SRC="${1:?путь к распакованной папке aid-handover-*}"
PROJECTS="${2:-$HOME/Projects}"
mkdir -p "$PROJECTS"
MANIFEST="$SRC/manifest.tsv"

# 1. Основные репозитории (папка = сама себе worktree_of)
tail -n +2 "$MANIFEST" | while IFS=$'\t' read -r folder of branch dirty remote; do
  [ "$folder" = "$of" ] || continue
  if [ ! -e "$PROJECTS/$folder" ]; then
    echo "clone $folder"; git clone -q "$remote" "$PROJECTS/$folder"
  fi
  if [ -n "$branch" ]; then git -C "$PROJECTS/$folder" switch -q "$branch" 2>/dev/null || true; fi
done

# 2. Worktree-папки чатов
tail -n +2 "$MANIFEST" | while IFS=$'\t' read -r folder of branch dirty remote; do
  [ "$folder" != "$of" ] || continue
  [ -e "$PROJECTS/$folder" ] && { echo "skip $folder (уже есть)"; continue; }
  base="$PROJECTS/$of"
  git -C "$base" fetch -q origin
  if [ -n "$branch" ] && git -C "$base" rev-parse --verify -q "origin/$branch" >/dev/null; then
    if git -C "$base" rev-parse --verify -q "$branch" >/dev/null; then
      git -C "$base" worktree add -q "$PROJECTS/$folder" "$branch"
    else
      git -C "$base" worktree add -q --track -b "$branch" "$PROJECTS/$folder" "origin/$branch"
    fi
  else
    echo "$folder: ветки ${branch:-—} нет на origin — от origin/main"
    git -C "$base" worktree add -q --detach "$PROJECTS/$folder" origin/main
  fi
  echo "worktree $folder ← $of ($branch)"
done

# 3. Состояние чатов: CLAUDE.local.md, .claude/intake-user
( cd "$SRC/folders" && find . -type f ) | while read -r f; do
  dst="$PROJECTS/${f#./}"
  mkdir -p "$(dirname "$dst")"
  [ -e "$dst" ] || cp "$SRC/folders/${f#./}" "$dst"
done

# 4. Память Claude по папкам — под путь нового пользователя
enc=$(printf '%s' "$PROJECTS" | sed 's|[/.]|-|g')
for m in "$SRC"/claude/memory/*; do
  [ -d "$m" ] || continue
  dst="$HOME/.claude/projects/$enc-$(basename "$m")/memory"
  mkdir -p "$dst"; cp -Rn "$m"/. "$dst"/
done

# 5. Пользовательские настройки Claude
mkdir -p "$HOME/.claude"
for f in CLAUDE.md settings.json keybindings.json; do
  [ -f "$SRC/claude/$f" ] && [ ! -e "$HOME/.claude/$f" ] && cp "$SRC/claude/$f" "$HOME/.claude/"
done
for d in skills agents; do
  [ -d "$SRC/claude/$d" ] && { mkdir -p "$HOME/.claude/$d"; cp -Rn "$SRC/claude/$d"/. "$HOME/.claude/$d"/; }
done

echo
echo "Готово. Дальше — docs/hub/handover/README.md, шаги 7–9."
