---
destination: skills/_shared/protocols/
name: git-workflow
metadata:
  version: "1.2.1"
  kind: protocol
  owner: design-system-team
description: >
  Единые git-команды для синхронизации памяти скиллов: модель «один файл
  на человека», типы коммитов, структура memory/ и онбординг.
---


# Git Workflow для памяти скиллов

> Статус: Draft · v1.2.1 · обновлено 2026-09-20

---

Единые git-команды для синхронизации памяти скиллов.
Все скиллы ссылаются на этот файл — не дублируй команды в SKILL.md.

---

## 1. Синхронизация памяти после каждой записи

```bash
git pull --rebase
git add memory/<skill-name>/log.<имя>.json
git commit -m "<тип>(<skill>): <что произошло>"
git push
```

**`--rebase` обязателен.** Подтягивает чужие изменения перед своими.
Личный log-файл не конфликтует с чужими — ребейз проходит чисто.
Никогда не используй `--merge` для синхронизации memory/.

---

## 2. Типы коммитов

| Тип | Когда использовать | Пример |
|---|---|---|
| `memory(<skill>)` | Запись в журнал памяти | `memory(ds-component-spec): add BadgeStatus spec` |
| `spec(<component>)` | Новая спека компонента | `spec(ButtonText): add spec v1.0.0` |
| `audit(<target>)` | Результат аудита | `audit(tokens): ButtonText primitive refs` |
| `migrate(<component>)` | Pilot/rollout миграции legacy → canonical компонент | `migrate(TableRow): pilot 2 file(s)` |
| `feat(skills)` | Новый скилл | `feat(skills): add ds-token-audit v1.0.0` |
| `fix(skills)` | Правка существующего скилла | `fix(skills): update ds-component-spec triggers` |
| `docs` | Обновление гайда | `docs: update semver-guide to v1.2.0` |

---

## 3. Структура memory/

```
memory/
├── ds-component-spec/
│   ├── log.ivanov.json      ← личный файл каждого сотрудника
│   ├── log.petrov.json
│   └── .gitkeep
├── ds-token-audit/
│   ├── log.ivanov.json
│   └── .gitkeep
└── .gitkeep
```

**Модель: один файл на человека.**
- Имя файла берётся из `.claude/intake-user`
- Каждый пишет только в свой файл → нет git-конфликтов
- При анализе Claude читает все `log.*.json` → общая картина команды

---

## 4. .gitignore

Генерируемые сводные файлы и личный конфиг — не коммитить:

```
memory/**/*.master.json
.claude/intake-user
```

`*.master.json` — агрегированные файлы, которые Claude может генерировать
для анализа. Они строятся из личных log-файлов и не должны попадать в репо.

---

## 5. Онбординг нового сотрудника

```bash
# 1. Клонировать репо
git clone <repo-url>
cd <repo-root>

# 2. Создать личный идентификатор
echo "ivanov" > .claude/intake-user

# 3. Открыть Claude Code в корне проекта
# 4. Написать триггерную фразу нужного скилла
```

Файл `.claude/intake-user` — одна строка, фамилия латиницей строчными буквами.
Он в `.gitignore` — каждый создаёт его сам.

---

## 6. Push и релизный флоу

Перенесено из .cursor/rules/git-push.mdc (2026-09-20). Решение о самом
релизе — за `protocols/gates/release-gate.md`; здесь только механика.

When user says "push", "пуш", "запусти пуш", or "commit and push" —
execute the full release flow below without asking for confirmation,
unless noted otherwise.

### Step 1 — Analyze changes

Run: git status --short

If output is empty — reply "✅ Nothing to commit, working tree clean" and stop.

Check current branch: git branch --show-current
If branch is not "main" — warn: "⚠️ You are on branch <name>, not main. Push here? (yes/no)"
Stop and wait for confirmation before proceeding.

From the list of changed files, determine bump type:
- patch → token value edits, doc updates, typos, fixes
- minor → new component spec, new tokens group, new platform support, new skill/rule
- major → breaking token rename, architecture change, removed component

If bump type cannot be determined from file names alone — ask ONE question:
"patch, minor, or major?"

### Step 2 — Bump version

Look for version in this order:
1. package.json → field "version"
2. VERSION file in repository root
3. If neither exists — create VERSION file in repository root with content: 0.1.0

Calculate next version by semver rules.
Write the new version back to the same file.
Verify the written value matches expected new version before proceeding.

### Step 3 — Update CHANGELOG.md

File location: repository root. Create if missing.
Date format: ISO 8601 — YYYY-MM-DD.
Prepend the following block (include only sections that have entries):

    ## [X.Y.Z] - YYYY-MM-DD

    ### Added
    - ...

    ### Changed
    - ...

    ### Fixed
    - ...

    ### Removed
    - ...

List renamed or new tokens explicitly.
Mark breaking changes with ⚠️ BREAKING.

### Step 4 — Commit and push

Commit message must always be in English, ASCII only.

git add -A
git commit -m "<type>(scope): <what changed> vX.Y.Z"

- type: feat | fix | chore | docs | refactor
- scope: based on actually changed files.
  If multiple areas changed, pick most significant:
  tokens > components > platforms > docs > rules
- Example: feat(tokens): add semantic surface tokens v0.3.0

git push origin main

### Step 5 — Confirm

Print:
✅ Pushed vX.X.X → vX.Y.Z
📝 Commit: <commit message>
📋 Changelog entry added

---

## 7. Changelog

- **1.2.1** — 2026-09-20. guide-lint: нормализация формы.
- **1.2.0** — 2026-09-20. Добавлен раздел «Push и релизный флоу»,
  перенесённый из `skills/_shared/protocols/git-workflow.md`: Cursor легаси, механика
  push переехала к остальным git-правилам.
- **1.1.0** — добавлен тип коммита `migrate(<component>)` для
  pilot/rollout миграции legacy-компонентов (`ds-component-migration`).
- **1.0.0** — первая версия: команды синхронизации, типы коммитов,
  структура memory/, .gitignore, онбординг.
