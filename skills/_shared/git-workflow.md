---
title: Git Workflow для памяти скиллов
version: "1.1.0"
owner: design-system-team
---

# Git Workflow для памяти скиллов — v1.1.0

Единые git-команды для синхронизации памяти скиллов.
Все скиллы ссылаются на этот файл — не дублируй команды в SKILL.md.

---

## Синхронизация памяти после каждой записи

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

## Типы коммитов

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

## Структура memory/

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

## .gitignore

Генерируемые сводные файлы и личный конфиг — не коммитить:

```
memory/**/*.master.json
.claude/intake-user
```

`*.master.json` — агрегированные файлы, которые Claude может генерировать
для анализа. Они строятся из личных log-файлов и не должны попадать в репо.

---

## Онбординг нового сотрудника

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

## Changelog

- **1.1.0** — добавлен тип коммита `migrate(<component>)` для
  pilot/rollout миграции legacy-компонентов (`ds-component-migration`).
- **1.0.0** — первая версия: команды синхронизации, типы коммитов,
  структура memory/, .gitignore, онбординг.
