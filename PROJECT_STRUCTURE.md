# Структура проекта aid

> Снимок на 2026-07-16 · ветка `main` · v0.3.0

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
│       ├── ds-principal.mdc
│       └── git-push.mdc
├── docs
│   ├── assets
│   │   ├── vendor
│   │   │   ├── a11y-dark.min.css
│   │   │   ├── a11y-light.min.css
│   │   │   ├── highlight-kotlin.min.js
│   │   │   ├── highlight-swift.min.js
│   │   │   ├── highlight.min.js
│   │   │   ├── lunr.min.js
│   │   │   └── marked.min.js
│   │   ├── docs-tables.js
│   │   ├── docs-theme.css
│   │   ├── nav.js
│   │   ├── search.js
│   │   ├── style.css
│   │   └── token-viz.js
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
│   ├── guides
│   │   ├── component-states-guide.html
│   │   ├── core-color-tokens-guide.html
│   │   ├── core-space-tokens-guide.html
│   │   ├── core-typography-tokens-guide.html
│   │   ├── ds-component-architecture-guide.html
│   │   ├── ds-component-audit-guide.html
│   │   ├── ds-component-migration-guide.html
│   │   ├── semantic-color-tokens-guide.html
│   │   ├── semantic-space-tokens-guide.html
│   │   ├── semantic-typography-tokens-guide.html
│   │   └── template.html
│   ├── prototypes
│   │   ├── assets
│   │   │   ├── fonts
│   │   │   │   ├── JTUSjIg1_i6t8kCHKm459W1hyyTh89ZNpQ.woff2
│   │   │   │   ├── JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2
│   │   │   │   ├── Montserrat-500-cyrillic.woff2
│   │   │   │   ├── Montserrat-500-latin.woff2
│   │   │   │   ├── Montserrat-500.ttf
│   │   │   │   ├── Montserrat-600-cyrillic.woff2
│   │   │   │   ├── Montserrat-600-latin.woff2
│   │   │   │   └── Montserrat-600.ttf
│   │   │   ├── badge-icon.png
│   │   │   ├── carousel-default-banner-image.png
│   │   │   ├── clock.png
│   │   │   ├── default-banner-image.png
│   │   │   ├── heart.png
│   │   │   ├── partner-logo.png
│   │   │   └── suitcase.png
│   │   ├── banner-adaptive-demo.html
│   │   ├── serve.py
│   │   └── start-serve.sh
│   ├── storybook
│   │   ├── components
│   │   │   ├── badge.html
│   │   │   ├── button-icon.html
│   │   │   ├── card.html
│   │   │   ├── chip.html
│   │   │   ├── color-swatch.html
│   │   │   ├── search.html
│   │   │   ├── storybook-button.html
│   │   │   └── table.html
│   │   ├── _storybook-nav.json
│   │   ├── colors-editor.js
│   │   ├── colors.html
│   │   ├── components.html
│   │   ├── index.html
│   │   ├── spec-editor.js
│   │   ├── spec-inspector.js
│   │   ├── storybook-color-tokens.css
│   │   ├── storybook-colors.css
│   │   ├── storybook-layout.css
│   │   ├── storybook-spec-inspector.css
│   │   ├── storybook-token-create.css
│   │   ├── storybook-typography-tokens.css
│   │   ├── storybook.js
│   │   ├── token-confirm.js
│   │   ├── token-create.js
│   │   ├── token-store.js
│   │   ├── typography-editor.js
│   │   └── typography.html
│   ├── tokens
│   │   ├── color-tokens-changelog.md
│   │   ├── color-tokens-registry.md
│   │   ├── save-tokens.js
│   │   ├── typography-tokens-changelog.md
│   │   └── typography-tokens-registry.md
│   ├── claude-skills-guide.md
│   ├── ds-component-architecture-guide.md
│   ├── index.html
│   ├── preview-variants.html
│   ├── semver-guide.md
│   └── visual-language-test.html
├── memory
│   ├── ds-component-audit
│   │   ├── .gitkeep
│   │   └── log.sergej.json
│   ├── ds-component-migration
│   │   ├── .gitkeep
│   │   └── log.sergej.json
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
│   ├── preview.py
│   └── start-docs.sh
├── skills
│   ├── _shared
│   │   ├── component-categories-guide.md
│   │   ├── component-states-guide.md
│   │   ├── core-color-tokens-guide.md
│   │   ├── core-space-tokens-guide.md
│   │   ├── core-typography-tokens-guide.md
│   │   ├── docs-design-brief.md
│   │   ├── docs-visual-language.md
│   │   ├── ds-component-architecture-guide.md
│   │   ├── ds-component-audit-guide.md
│   │   ├── ds-component-migration-guide.md
│   │   ├── editable-component-spec-layer-guide.md
│   │   ├── git-workflow.md
│   │   ├── no-hardcode-color-protocol.md
│   │   ├── platforms.md
│   │   ├── semantic-color-tokens-guide.md
│   │   ├── semantic-space-tokens-guide.md
│   │   ├── semantic-typography-tokens-guide.md
│   │   ├── token-rules.md
│   │   └── ui-trends-2026.md
│   ├── ds-component-audit
│   │   ├── references
│   │   │   └── .gitkeep
│   │   ├── SKILL.md
│   │   └── TESTING.md
│   ├── ds-component-migration
│   │   ├── SKILL.md
│   │   └── TESTING.md
│   ├── ds-component-spec
│   │   └── SKILL.md
│   ├── ds-developer-guide
│   │   └── SKILL.md
│   ├── ds-ui-review
│   │   ├── SKILL.md
│   │   └── TESTING.md
│   └── guide-lint
│       └── SKILL.md
├── .cursorrules
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.local.md
├── CLAUDE.md
├── PROJECT_STRUCTURE.md
├── VERSION
└── measure-presentation-pass.md
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
