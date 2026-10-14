# Структура проекта aid

> Файл собирается `node scripts/build-structure.mjs`. Руками не править:
> дерево строится из репозитория, таблица назначений — из PURPOSE в скрипте.
> Снимок: 2026-10-09

```
aid/
├── .claude/
│   └── skills/
│       ├── delegate/  (1)
│       ├── plan/  (1)
│       ├── task/  (1)
│       └── team/  (1)
├── .cursor/
│   └── rules/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── changes/
│   ├── driver/
│   │   ├── pending/  (16)
│   │   └── released/  (5)
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
│   ├── hub/
│   │   ├── boards/  (3)
│   │   └── kit/  (5)
│   ├── prototypes/
│   │   ├── assets/  (8)
│   │   └── export/  (2)
│   ├── standards-alpha/
│   └── tokens/
├── memory/
│   ├── ds-component-audit/
│   ├── ds-component-migration/
│   └── ds-component-spec/
├── pages/
│   └── aid-portal/
│       ├── api/  (5)
│       ├── components/  (38)
│       ├── deploy/  (1)
│       ├── products/  (2)
│       ├── public/  (2)
│       ├── scripts/  (14)
│       └── tokens/  (15)
├── products/
│   ├── driver/
│   └── rider/
├── scripts/
├── skills/
│   ├── _shared/
│   │   ├── architecture/  (5)
│   │   ├── notes/  (2)
│   │   ├── protocols/  (14)
│   │   └── standards/  (28)
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
├── tokens/
├── tools/
│   ├── aid-bot/
│   │   └── contracts/  (1)
│   ├── aid-style-migration/
│   ├── aid-team/
│   │   └── schema/  (1)
│   ├── figma-token-comparator/
│   │   ├── docs/  (3)
│   │   ├── scripts/  (2)
│   │   ├── server/  (10)
│   │   ├── src/  (6)
│   │   └── test/  (27)
│   └── mcp-figma-plugin/
├── .cursorrules
├── .env.local
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.local.md
├── CLAUDE.md
├── decisions-registry.json
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
