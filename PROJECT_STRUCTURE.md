# Структура проекта aid

> Снимок на 2026-08-11 · ветка `cursor/figma-styles-page-visualization`

```
aid/
├── .cursor
│   └── rules
│       ├── anatomy-standard.mdc
│       ├── ds-import.mdc
│       ├── ds-principal.mdc
│       ├── git-push.mdc
│       └── radius-preview-standard.mdc
├── .storybook
│   ├── addons
│   │   └── ui-kit-sidebar
│   │       └── register.ts
│   ├── main.ts
│   ├── manager.ts
│   └── preview.tsx
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
│   │   ├── banner-adaptive-demo.html
│   │   ├── serve.py
│   │   └── start-serve.sh
│   ├── storybook
│   │   ├── components
│   │   │   ├── badge.html
│   │   │   ├── button-icon.html
│   │   │   ├── card.html
│   │   │   ├── chip-select.html
│   │   │   ├── chip.html
│   │   │   ├── color-swatch.html
│   │   │   ├── search.html
│   │   │   ├── storybook-button.html
│   │   │   ├── switch.html
│   │   │   └── table.html
│   │   ├── _known-issues
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
│   ├── storybook-legacy
│   ├── tokens
│   │   ├── color-tokens-changelog.md
│   │   ├── color-tokens-registry.md
│   │   ├── package.json
│   │   ├── save-tokens.js
│   │   ├── typography-tokens-changelog.md
│   │   └── typography-tokens-registry.md
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
│   ├── ds-component-spec
│   │   ├── .gitkeep
│   │   ├── backlog.json
│   │   └── log.sergej.json
│   └── ds-import-log.jsonl
├── scripts
│   ├── docs-server.py
│   ├── preview.py
│   ├── start-docs.sh
│   └── test-load-tokens.mjs
├── skills
│   ├── _shared
│   │   ├── anatomy-annotation-standard.md
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
│   │   ├── ds-import-json.md
│   │   ├── editable-component-spec-layer-guide.md
│   │   ├── git-workflow.md
│   │   ├── no-hardcode-color-protocol.md
│   │   ├── platforms.md
│   │   ├── radius-preview-standard.md
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
├── src
│   ├── components
│   │   ├── sutochno
│   │   │   ├── ButtonText.tsx
│   │   │   └── CounterValue.tsx
│   │   └── TokensOverview.tsx
│   ├── pages
│   │   └── FigmaStyles
│   │       ├── FigmaStylesPage.tsx
│   │       └── data.ts
│   └── tokens
│       ├── applyTokenBundle.ts
│       ├── index.node.ts
│       ├── index.ts
│       ├── loadTokens.browser.ts
│       ├── loadTokens.ts
│       ├── types.ts
│       └── validateStandardToken.ts
├── stories
│   ├── figma-styles
│   │   └── FigmaStylesPage.stories.tsx
│   ├── sutochno
│   │   ├── components
│   │   └── tokens
│   ├── ui-kit-a
│   │   ├── components
│   │   └── tokens
│   └── ui-kit-b
│       ├── components
│       └── tokens
├── tokens
│   ├── sutochno
│   │   ├── core
│   │   ├── legacy
│   │   └── semantic
│   ├── ui-kit-a
│   │   ├── core
│   │   ├── legacy
│   │   └── semantic
│   └── ui-kit-b
│       ├── core
│       ├── legacy
│       └── semantic
├── .cursorrules
├── .gitignore
├── AGENTS.md
├── ButtonText-spec.md
├── CHANGELOG.md
├── CLAUDE.local.md
├── CLAUDE.md
├── PROJECT_STRUCTURE.md
├── VERSION
├── guide-page-pass.md
├── measure-presentation-pass.md
├── package.json
├── package-lock.json
├── tsconfig.json
└── zoom1.png
```

## Назначение разделов

| Путь | Назначение |
|------|------------|
| `skills/` | Канонические скиллы и shared-правила дизайн-системы |
| `skills/_shared/` | Shared-гайды: токены, платформы, git, типографика |
| `docs/` | Архитектурные гайды и документация |
| `docs/design-system/tokens/` | Зеркало/копии Core/Semantic token guides (статус синхронизации — открытый вопрос) |
| `docs/design-system/typography/` | Продуктовый гайд SOUZ (MD + веб) |
| `docs/storybook/` | Presentbook: spec-страницы компонентов, token editors |
| `docs/storybook-legacy/` | Архивная копия presentbook |
| `src/` | React-компоненты и token loader (Web) |
| `stories/` | Storybook stories |
| `.storybook/` | Конфиг Storybook-портала |
| `tokens/` | Token JSON bundles (ui-kit-a, ui-kit-b, sutochno) |
| `memory/` | Логи памяти скиллов (по пользователям) |
| `.cursor/rules/` | Правила Cursor (release flow, import, anatomy, radius-preview) |
| `scripts/` | Dev-серверы и утилиты |

## Исключено из дерева

- `.git/`
- `node_modules/` (в `.gitignore`)
- `storybook-static/` (build-артефакт, в `.gitignore`)
- `dist/` (в `.gitignore`)
- `.DS_Store`
