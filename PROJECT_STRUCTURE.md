# Структура проекта aid

> Снимок на 2026-07-01 · ветка `main` · v0.3.0

```
aid/
├── .claude
│   ├── intake-user
│   ├── rules
│   ├── settings.json
│   ├── skills
│   │   ├── _shared
│   │   │   ├── git-workflow.md
│   │   │   ├── platforms.md
│   │   │   └── token-rules.md
│   │   ├── add-skill
│   │   │   ├── SKILL.md
│   │   │   └── references
│   │   │       └── .gitkeep
│   │   └── ds-component-spec
│   │       ├── ds-component-spec-SKILL.md
│   │       └── references
│   │           ├── .gitkeep
│   │           └── ButtonText.md
│   └── space-context.md
├── .cursor
│   └── rules
│       ├── ds-import.mdc
│       ├── ds-principal.mdc
│       └── git-push.mdc
├── .cursorrules
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.local.md
├── CLAUDE.md
├── PROJECT_STRUCTURE.md
├── VERSION
├── docs
│   ├── assets
│   │   ├── docs-theme.css
│   │   ├── nav.js
│   │   ├── search.js
│   │   ├── style.css
│   │   ├── token-viz.js
│   │   └── vendor
│   │       ├── a11y-dark.min.css
│   │       ├── a11y-light.min.css
│   │       ├── highlight-kotlin.min.js
│   │       ├── highlight-swift.min.js
│   │       ├── highlight.min.js
│   │       ├── lunr.min.js
│   │       └── marked.min.js
│   ├── claude-skills-guide.md
│   ├── design-system
│   │   ├── README.md
│   │   ├── tokens
│   │   │   ├── core-color-tokens-guide.md
│   │   │   ├── core-typography-tokens-guide.md
│   │   │   ├── semantic-color-tokens-guide.md
│   │   │   └── semantic-typography-tokens-guide.md
│   │   └── typography
│   │       ├── index.html
│   │       ├── typography-guide.css
│   │       └── typography-guide.md
│   ├── ds-component-architecture-guide.md
│   ├── guides
│   │   ├── component-states-guide.html
│   │   ├── core-color-tokens-guide.html
│   │   ├── core-space-tokens-guide.html
│   │   ├── core-typography-tokens-guide.html
│   │   ├── ds-component-architecture-guide.html
│   │   ├── semantic-color-tokens-guide.html
│   │   ├── semantic-space-tokens-guide.html
│   │   ├── semantic-typography-tokens-guide.html
│   │   └── template.html
│   ├── index.html
│   ├── preview-variants.html
│   ├── semver-guide.md
│   └── visual-language-test.html
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
├── scripts
│   ├── docs-server.py
│   └── preview.py
└── skills
    ├── _shared
    │   ├── component-states-guide.md
    │   ├── core-color-tokens-guide.md
    │   ├── core-space-tokens-guide.md
    │   ├── core-typography-tokens-guide.md
    │   ├── docs-design-brief.md
    │   ├── docs-visual-language.md
    │   ├── ds-component-architecture-guide.md
    │   ├── git-workflow.md
    │   ├── no-hardcode-color-protocol.md
    │   ├── platforms.md
    │   ├── semantic-color-tokens-guide.md
    │   ├── semantic-space-tokens-guide.md
    │   ├── semantic-typography-tokens-guide.md
    │   ├── token-rules.md
    │   └── ui-trends-2026.md
    ├── ds-component-spec
    │   └── SKILL.md
    ├── ds-ui-review
    │   ├── SKILL.md
    │   └── TESTING.md
    └── guide-lint
        └── SKILL.md
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
