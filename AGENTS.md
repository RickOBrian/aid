---
destination: ./
---

# AGENTS.md

> Этот файл читается агентами (Cursor, Claude Code) автоматически при старте.
> Обновляется вместе с репо — всегда актуален.

---

## Что это за репо

Дизайн-система **aid** — архитектурная документация и скиллы для трёх платформ:
Web (React + TypeScript), iOS (SwiftUI / UIKit), Android (Jetpack Compose).

Репо не содержит продуктового кода. Только:
- правила и гайды дизайн-системы
- скиллы для AI-агентов
- спецификации компонентов
- логи памяти скиллов

---

## Структура репо

```
aid/
├── skills/                        ← КАНОНИЧЕСКИЕ файлы. Редактируй только здесь.
│   ├── _shared/                   ← Shared-правила: токены, платформы, git, типографика
│   │   ├── token-rules.md         ← Правила токенов Core → Semantic (v1.3.0)
│   │   ├── platforms.md           ← Особенности Web / iOS / Android
│   │   ├── git-workflow.md        ← Git-команды для памяти скиллов
│   │   ├── core-typography-tokens-guide.md
│   │   └── semantic-typography-tokens-guide.md
│   └── ds-component-spec/
│       └── SKILL.md               ← Скилл генерации спеки компонента (v1.2.0)
│
├── docs/                          ← Архитектурные гайды (для людей)
│   ├── design-system/
│   │   ├── colors/                ← Core/Semantic гайды цвета и типографики
│   │   └── typography/            ← Продуктовый типографический гайд
│   ├── ds-component-architecture-guide.md  ← 4-уровневая архитектура компонентов
│   ├── claude-skills-guide.md
│   └── semver-guide.md
│
├── perplexity-skills/             ← Копии для Perplexity Space (с frontmatter)
│                                    НЕ редактируй вручную — синхронизируется из skills/
│
├── .claude/skills/                ← Legacy-копии для Claude Code
│                                    НЕ редактируй вручную
│
├── memory/                        ← Логи памяти скиллов
│   └── ds-component-spec/
│       └── log.<имя>.json         ← Один файл на сотрудника
│
├── .cursor/rules/
│   ├── git-push.mdc               ← Release flow: версия → changelog → push
│   └── ds-import.mdc              ← Импорт файлов из ~/Desktop/ds-import/
│
├── AGENTS.md                      ← Этот файл
├── CLAUDE.md                      ← Контекст для Claude Code
├── PROJECT_STRUCTURE.md           ← Полное дерево файлов
├── CHANGELOG.md
└── VERSION
```

**Главное правило:** `skills/` — единственное место для правок.
Всё остальное синхронизируется из него.

---

## Source of truth

| Вопрос | Где смотреть |
|---|---|
| Правила токенов | `skills/_shared/token-rules.md` |
| Архитектура компонентов | `docs/ds-component-architecture-guide.md` |
| Как генерировать спеку | `skills/ds-component-spec/SKILL.md` |
| Платформенные особенности | `skills/_shared/platforms.md` |
| Версионирование | `docs/semver-guide.md` |
| Git-команды для memory/ | `skills/_shared/git-workflow.md` |

---

## Ключевые правила — читай перед любым изменением

### Токены
- Система двухуровневая: **Core → Semantic**. Component-уровня нет.
- Компоненты ссылаются **только на semantic-токены**.
- Хардкод (`#0057FF`, `font-size: 14px`) — **блокер**.
- Компонент → Core напрямую — **блокер**.
- Подробно: `skills/_shared/token-rules.md`

### Типографика
- Компоненты-контролы (кнопки, чипы, инпуты) → `label-*`
- Заголовки → `heading-*`
- Параграфы и описания → `body-*`
- Body на контроле или Label в параграфе — **блокер**.

### Нейминг компонентов
- Формула: **Role + Entity** (`ButtonText`, `IslandProduct`, `WidgetBalance`)
- Role — всегда первым
- Суффикс `Item` — только внутри коллекций (`List.Item`, `Menu.Item`)
- Подробно: `docs/ds-component-architecture-guide.md` раздел 9

### Версионирование файлов
- `patch` — правка текста
- `minor` — новый раздел или правило
- `major` — смена структуры (breaking)
- Версия растёт только у изменённого файла, не каскадно
- Подробно: `docs/semver-guide.md`

### Нотация токенов
- Дефисная нотация везде: `bg-accent-main`, не `bg.accent.main`

---

## Типы коммитов

| Тип | Когда |
|---|---|
| `feat(skills)` | Новый скилл |
| `fix(skills)` | Правка скилла |
| `spec(ComponentName)` | Новая спека компонента |
| `docs` | Обновление гайда |
| `memory(skill-name)` | Запись в лог памяти |
| `chore` | Структурные изменения без смысловых правок |

---

## Что не делать

- Не редактировать `.claude/skills/` и `perplexity-skills/` вручную
- Не создавать component-уровень токенов
- Не использовать точечную нотацию токенов (`color.blue.500`)
- Не добавлять суффикс `Item` в самостоятельные компоненты
- Не каскадить версии при изменении одного файла
- Не коммитить `.claude/intake-user` (он в `.gitignore`)
