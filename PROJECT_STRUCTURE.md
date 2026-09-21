# Структура проекта aid

> Файл собирается `node scripts/build-structure.mjs`. Руками не править:
> дерево строится из репозитория, таблица назначений — из PURPOSE в скрипте.
> Снимок: 2026-09-21

```
aid/
├── .claude/
├── .cursor/
│   └── rules/
├── .github/
│   └── workflows/
├── .storybook/
├── changes/
│   ├── driver/
│   │   ├── pending/  (13)
│   │   └── released/  (2)
│   └── rider/
│       ├── pending/  (9)
│       └── released/  (1)
├── components/
├── docs/
│   ├── assets/
│   │   └── vendor/  (7)
│   ├── design-system/
│   │   └── typography/  (3)
│   ├── guides/
│   ├── prototypes/
│   │   ├── assets/  (8)
│   │   └── export/  (2)
│   ├── specs/
│   ├── standards-alpha/
│   ├── storybook/
│   │   ├── _known-issues/  (3)
│   │   └── components/  (10)
│   └── tokens/
├── memory/
│   ├── ds-component-audit/
│   ├── ds-component-migration/
│   └── ds-component-spec/
├── pages/
│   └── aid-portal/
│       ├── api/  (2)
│       ├── components/  (24)
│       ├── products/  (2)
│       ├── public/  (2)
│       ├── scripts/  (14)
│       └── tokens/  (14)
├── products/
│   ├── driver/
│   └── rider/
├── scripts/
├── skills/
│   ├── _shared/
│   │   ├── architecture/  (5)
│   │   ├── notes/  (2)
│   │   ├── protocols/  (14)
│   │   └── standards/  (27)
│   ├── ds-component-audit/
│   │   └── references/  (1)
│   ├── ds-component-build/
│   │   └── references/  (2)
│   ├── ds-component-migration/
│   ├── ds-component-spec/
│   ├── ds-developer-guide/
│   ├── ds-import/
│   ├── ds-ui-review/
│   └── guide-lint/
├── src/
│   └── pages/
│       └── FigmaStyles/  (2)
├── stories/
│   └── figma-styles/
├── tokens/
├── tools/
│   └── figma-token-comparator/
│       ├── docs/  (3)
│       ├── scripts/  (2)
│       ├── server/  (9)
│       ├── src/  (6)
│       └── test/  (26)
├── .cursorrules
├── .env.local
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.local.md
├── CLAUDE.md
├── decisions-registry.json
├── guide-page-pass.md
├── measure-presentation-pass.md
├── package-lock.json
├── package.json
├── PROJECT_STRUCTURE.md
├── standards-registry.json
├── tsconfig.json
└── VERSION
```

## Назначение разделов

| Путь | Назначение |
|------|------------|
| `skills/_shared/standards/` | Публикуемые стандарты дизайн-системы |
| `skills/_shared/protocols/` | Как работаем мы: git, скиллы, импорт, форма гайдов |
| `skills/_shared/protocols/gates/` | Обязательные гейты процесса |
| `skills/_shared/architecture/` | Технические описания конкретных фич |
| `skills/_shared/notes/` | Черновики и заметки |
| `skills/` | Скиллы: по папке на скилл, внутри SKILL.md |
| `pages/aid-portal/` | Presentbook: портал дизайн-системы (проект aid-ds на Vercel) |
| `products/` | Манифесты продуктов и их реестр |
| `tokens/` | Changelog коллекций токенов, по префиксу продукта |
| `changes/` | Очереди pending и released по продуктам |
| `docs/standards-alpha/` | Рабочие материалы альфы: план, решения, вопросы |
| `scripts/` | Проверки и генераторы репозитория |
| `tools/` | Плагин Figma Token Comparator и его бэкенд |
| `memory/` | Журналы памяти скиллов, по файлу на человека |
| `.cursor/rules/` | Архив правил Cursor: указатели на переехавшее содержание |
| `.github/workflows/` | CI: проверка документов, типов и сборки портала |

## Исключено из дерева

`node_modules`, `.git`, `dist`, `storybook-static`, `.vercel`, `.DS_Store`, `generated`, `.tmp-qa`

Глубина дерева — два уровня; для папок на нижнем уровне показано число элементов.
