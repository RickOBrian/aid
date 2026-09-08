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

Репо содержит документацию дизайн-системы, skill-гайды для AI-агентов, логи памяти
скиллов, а также рабочий Web-слой: Storybook-портал (`src/`, `stories/`, `.storybook/`),
token JSON (`tokens/`) и presentbook (`docs/storybook/` — ~10 spec-страниц, активная
зона последних коммитов).

Код iOS и Android в репозитории **физически отсутствует** — для этих платформ есть
только документация и skill-гайды.

---

## Структура репозитория верхнего уровня

| Каталог | Назначение |
|---|---|
| `.cursor/` | Правила Cursor (`.cursor/rules/*.mdc`) |
| `docs/` | Архитектурные гайды, presentbook, token registry, HTML-просмотр |
| `memory/` | Логи памяти скиллов (`log.<имя>.json`) |
| `scripts/` | Dev-серверы и утилиты (`docs-server.py`, `preview.py`) |
| `skills/` | **Канонические** скиллы и shared-гайды — единственное место для правок |
| `src/` | React-компоненты и token loader (Web) |
| `stories/` | Storybook stories |
| `tokens/` | Token JSON bundles (ui-kit-a, ui-kit-b, sutochno) |

---

## Структура репо (детальнее)

```
aid/
├── skills/                        ← КАНОНИЧЕСКИЕ файлы. Редактируй только здесь.
│   ├── _shared/                   ← Shared-правила: токены, платформы, git, типографика
│   │   ├── token-rules.md         ← Правила токенов Core → Semantic (v1.5.1)
│   │   ├── platforms.md           ← Особенности Web / iOS / Android
│   │   ├── git-workflow.md        ← Git-команды для памяти скиллов
│   │   ├── core-typography-tokens-guide.md
│   │   └── semantic-typography-tokens-guide.md
│   └── ds-component-spec/
│       └── SKILL.md               ← Скилл генерации спеки компонента (v1.3.0)
│
├── docs/                          ← Архитектурные гайды (для людей)
│   ├── design-system/
│   │   ├── tokens/                ← Core/Semantic гайды цвета и типографики
│   │   └── typography/            ← Продуктовый типографический гайд
│   ├── storybook/                 ← Presentbook: spec-страницы компонентов
│   ├── ds-component-architecture-guide.md
│   └── semver-guide.md
│
├── src/                           ← React-компоненты, token loader
├── stories/                       ← Storybook stories
├── .storybook/                    ← Конфиг Storybook-портала
├── tokens/                        ← Token JSON bundles
│
├── memory/                        ← Логи памяти скиллов
│   └── ds-component-spec/
│       └── log.<имя>.json
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

**Главное правило:** `skills/` — единственное место для правок shared-гайдов и скиллов.
Остальные копии и зеркала синхронизируются из него или помечены как открытый вопрос
(см. `docs/design-system/tokens/`).

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

- Не создавать component-уровень токенов
- Не использовать точечную нотацию токенов (`color.blue.500`)
- Не добавлять суффикс `Item` в самостоятельные компоненты
- Не каскадить версии при изменении одного файла
