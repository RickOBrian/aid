# Структура проекта aid

> Снимок на 2026-06-27 · ветка `main` · v0.3.0

```
aid/
├── .claude
│   ├── rules
│   ├── skills
│   │   ├── _shared
│   │   │   ├── git-workflow.md
│   │   │   ├── platforms.md
│   │   │   └── token-rules.md
│   │   ├── add-skill
│   │   │   ├── references
│   │   │   │   └── .gitkeep
│   │   │   └── SKILL.md
│   │   └── ds-component-spec
│   │       ├── references
│   │       │   ├── .gitkeep
│   │       │   └── ButtonText.md
│   │       └── ds-component-spec-SKILL.md
│   ├── intake-user
│   ├── settings.json
│   └── space-context.md
├── .cursor
│   └── rules
│       ├── ds-import.mdc
│       └── git-push.mdc
├── docs
│   ├── design-system
│   │   ├── tokens
│   │   │   ├── core-color-tokens-guide.md
│   │   │   ├── core-typography-tokens-guide.md
│   │   │   ├── semantic-color-tokens-guide.md
│   │   │   └── semantic-typography-tokens-guide.md
│   │   ├── typography
│   │   │   ├── index.html
│   │   │   ├── typography-guide.css
│   │   │   └── typography-guide.md
│   │   └── README.md
│   ├── claude-skills-guide.md
│   ├── ds-component-architecture-guide.md
│   └── semver-guide.md
├── memory
│   └── ds-component-spec
│       ├── .gitkeep
│       └── log.sergej.json
├── perplexity-skills
│   ├── claude-skills-guide.md
│   ├── core-color-tokens-guide.md
│   ├── core-typography-tokens-guide.md
│   ├── ds-component-architecture-guide.md
│   ├── ds-component-spec-SKILL.md
│   ├── git-workflow.md
│   ├── platforms.md
│   ├── semantic-color-tokens-guide.md
│   ├── semantic-typography-tokens-guide.md
│   ├── semver-guide.md
│   ├── space-context.md
│   └── token-rules.md
├── skills
│   ├── _shared
│   │   ├── component-states-guide.md
│   │   ├── core-space-tokens-guide.md
│   │   ├── core-typography-tokens-guide.md
│   │   ├── ds-component-architecture-guide.md
│   │   ├── git-workflow.md
│   │   ├── platforms.md
│   │   ├── semantic-color-tokens-guide.md
│   │   ├── semantic-space-tokens-guide.md
│   │   ├── semantic-typography-tokens-guide.md
│   │   └── token-rules.md
│   └── ds-component-spec
│       └── SKILL.md
├── .cursorrules
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.local.md
├── CLAUDE.md
├── PROJECT_STRUCTURE.md
└── VERSION
```

## Назначение разделов

| Путь | Назначение |
|------|------------|
| `skills/` | Канонические скиллы и shared-правила дизайн-системы |
| `skills/_shared/` | Shared-гайды: токены, платформы, git, типографика |
| `.claude/skills/` | Legacy-копии скиллов для Claude Code |
| `docs/` | Архитектурные гайды и документация |
| `docs/design-system/colors/` | Гайды Core/Semantic для цвета и типографики |
| `docs/design-system/typography/` | Продуктовый гайд SOUZ (MD + веб) |
| `perplexity-skills/` | Копии гайдов с frontmatter для Perplexity Space |
| `memory/` | Логи памяти скиллов (по пользователям) |
| `.cursor/rules/` | Правила Cursor (release flow и др.) |

## Исключено из дерева

- `.git/`
- `node_modules/` (отсутствует)
- `.DS_Store`
