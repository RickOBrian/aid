# Отчёт: репозиторий vs план DS-инфраструктуры

> Read-only сверка. Файлы не создавались и не изменялись (кроме этого отчёта).

## Контекст

Из `.cursor/RULES_OVERVIEW.md`, `products/registry.json`, `products/driver/product.json`:

- Pipeline: **Product Gate → Token Integrity → Component Gate → Skills Import → Audit → Release**
- Единственный **active** продукт: `driver` (`aid: driver`)
- Токены Driver: `pages/aid-portal/*Data.ts` (фактически colors — `data.ts`)
- `componentsRoot: null`, `componentsStatus: "not_started"`
- Skills import default: `skills/_shared/`
- Release queues: `changes/driver/pending/`, `changes/driver/released/`
- Changelog: `tokens/*-changelog.json` + `token-changelog-registry.json`
- Reference-only: `src/pages/FigmaStyles/`

---

## 1. `.cursor/rules/*.mdc`

| Путь | Назначение | Статус vs план |
|---|---|---|
| `.cursor/rules/product-context.mdc` | Product Gate: выбор продукта, изоляция scope, pending changes | **exists** |
| `.cursor/rules/token-integrity.mdc` | Token lookup, gaps, запрет хардкода | **exists** |
| `.cursor/rules/component-gate.mdc` | Component proposal, placement, coupling с токенами | **exists** |
| `.cursor/rules/skills-import-gate.mdc` | Skills import + product context + `skills/_shared/` | **exists** |
| `.cursor/rules/audit-gate.mdc` | Read-only audit, consolidated report, pending items | **exists** |
| `.cursor/rules/release-gate.mdc` | Release boundary: SemVer, changelog, pending → released | **exists** |
| `.cursor/rules/ds-import.mdc` | Технический workflow импорта из `~/Desktop/ds-import/` | extra |
| `.cursor/rules/git-push.mdc` | Release push flow | extra |
| `.cursor/rules/ds-principal.mdc` | Роль Principal Developer, терминология, гайды | extra |
| `.cursor/rules/token-style-changelog-gate.mdc` | Анкета перед изменением токена/стиля | extra |
| `.cursor/rules/token-section-changelog.mdc` | Changelog-таблицы для разделов token portal | extra |
| `.cursor/rules/ds-portal-table-standard.mdc` | Стандарт таблиц DS-портала | extra |
| `.cursor/rules/radius-preview-standard.mdc` | Стандарт radius-preview секции | extra |
| `.cursor/rules/anatomy-standard.mdc` | Стандарт anatomy-аннотаций | extra |

**Итого:** 14 файлов. В плане — 6 gates; все **exists**. Extra — 8 rules.

---

## 2. `.cursor/*.md`

| Путь | Назначение | Статус vs план |
|---|---|---|
| `.cursor/RULES_OVERVIEW.md` | Overview всех gates, execution order, maintenance | **exists** |

**Итого:** 1 файл. В плане — 1; **exists**.

---

## 3. `products/**/*`

| Путь | Назначение | Статус vs план |
|---|---|---|
| `products/registry.json` | Реестр продуктов (driver active, остальные stable/legacy) | **exists** |
| `products/driver/product.json` | Manifest Driver: paths, changelog, release queues | **exists** |

**Итого:** 2 файла в `products/`. В плане — 2; все **exists**.

---

## 4. `skills/_shared/*.md`

### 4a. Файлы из плана

| Путь | Назначение | Статус vs план |
|---|---|---|
| `skills/_shared/standards/token-rules.md` | Правила Core → Semantic токенов | **exists** |
| `skills/_shared/standards/platforms.md` | Особенности Web / iOS / Android | **exists** |
| `skills/_shared/standards/component-standards.md` | Стандарты компонентов (план) | **missing** |
| `skills/_shared/protocols/figma-import-guide.md` | Гайд импорта из Figma (план) | **missing** |
| `skills/_shared/protocols/presentbook-guide.md` | Гайд Presentbook (план) | **missing** |
| `skills/_shared/standards/changelog-guide.md` | Гайд changelog (план) | **missing** |
| `skills/_shared/standards/naming-conventions.md` | Naming conventions (план) | **missing** |
| `skills/_shared/standards/accessibility.md` | Accessibility (план) | **missing** |
| `skills/_shared/standards/testing-strategy.md` | Testing strategy (план) | **missing** |
| `skills/_shared/standards/versioning-strategy.md` | Versioning strategy (план) | **missing** |

### 4b. Extra (есть в репо, не в плане)

| Путь | Назначение |
|---|---|
| `skills/_shared/protocols/git-workflow.md` | Git-команды для memory скиллов |
| `skills/_shared/standards/no-hardcode-color-protocol.md` | Протокол запрета hardcode цветов |
| `skills/_shared/standards/core-color-tokens-guide.md` | Core color tokens guide |
| `skills/_shared/standards/semantic-color-tokens-guide.md` | Semantic color tokens guide |
| `skills/_shared/standards/core-typography-tokens-guide.md` | Core typography guide |
| `skills/_shared/standards/semantic-typography-tokens-guide.md` | Semantic typography guide |
| `skills/_shared/standards/core-space-tokens-guide.md` | Core space tokens guide |
| `skills/_shared/standards/semantic-space-tokens-guide.md` | Semantic space tokens guide |
| `skills/_shared/standards/radius-preview-standard.md` | Стандарт radius preview |
| `skills/_shared/standards/anatomy-annotation-standard.md` | Стандарт anatomy |
| `skills/_shared/standards/component-categories-guide.md` | Категории компонентов |
| `skills/_shared/standards/component-states-guide.md` | Состояния компонентов |
| `skills/_shared/standards/ds-component-architecture-guide.md` | Архитектура компонентов |
| `skills/_shared/protocols/ds-component-audit-guide.md` | Аудит компонентов |
| `skills/_shared/protocols/ds-component-migration-guide.md` | Миграция компонентов |
| `skills/_shared/architecture/editable-component-spec-layer-guide.md` | Editable spec layer |
| `skills/_shared/protocols/ds-import-json.md` | Импорт JSON в DS |
| `skills/_shared/protocols/docs-design-brief.md` | Design brief для docs |
| `skills/_shared/protocols/docs-visual-language.md` | Visual language docs |
| `skills/_shared/notes/ui-trends-2026.md` | UI trends reference |

**Итого:** 22 файла. В плане — 10; **exists: 2**, **missing: 8**. Extra — 20.

---

## 5. `pages/aid-portal/*`

### 5a. Файлы из плана

| Путь | Назначение | Статус vs план |
|---|---|---|
| `pages/aid-portal/colorData.ts` | Color tokens (план) | **missing** |
| `pages/aid-portal/typographyData.ts` | Semantic typography tokens (Roboto) | **exists** |
| `pages/aid-portal/spacingData.ts` | Semantic spacing tokens | **exists** |
| `pages/aid-portal/radiusData.ts` | Semantic radius tokens | **exists** |
| `pages/aid-portal/shadowsData.ts` | Effects/shadows tokens | **exists** |
| `pages/aid-portal/iconsData.ts` | Icons registry (Wilhelm) | **exists** |
| `pages/aid-portal/token-changelog-registry.json` | Реестр collection changelogs | **exists** |

> **Примечание:** цвета фактически живут в `data.ts`, не в `colorData.ts`.

### 5b. Token data (extra)

| Путь | Назначение |
|---|---|
| `pages/aid-portal/data.ts` | Semantic color tokens — фактический color source |

### 5c. Portal pages & UI (extra)

| Путь | Назначение |
|---|---|
| `pages/aid-portal/App.tsx` | Router приложения |
| `pages/aid-portal/main.tsx` | Entry point Vite |
| `pages/aid-portal/index.html` | HTML shell |
| `pages/aid-portal/HubPage.tsx` | Hub `/design-system` |
| `pages/aid-portal/hubData.ts` | Hub navigation data |
| `pages/aid-portal/DriverColorTokensPage.tsx` | Colors page |
| `pages/aid-portal/TypographyPage.tsx` | Typography page |
| `pages/aid-portal/SpacingPage.tsx` | Spacing page |
| `pages/aid-portal/RadiusPage.tsx` | Radius page |
| `pages/aid-portal/ShadowsPage.tsx` | Shadows page |
| `pages/aid-portal/IconsPage.tsx` | Icons page |
| `pages/aid-portal/ChangelogTable.tsx` | Shared changelog table |
| `pages/aid-portal/DsPageHeader.tsx` | Shared page header |
| `pages/aid-portal/dsChangelogTable.ts` | Shared table styles/tokens |
| `pages/aid-portal/dsDropdownButton.tsx` | Dropdown UI |
| `pages/aid-portal/dsInteractiveCard.ts` | Interactive card styles |
| `pages/aid-portal/dsValueMeta.ts` | Value metadata helpers |
| `pages/aid-portal/loadTokenChangelog.ts` | Changelog loader |
| `pages/aid-portal/IconContextMenu.tsx` | Icons context menu |
| `pages/aid-portal/IconDownloadActions.tsx` | Icons download actions |
| `pages/aid-portal/IconRoundCheckbox.tsx` | Icons round checkbox |
| `pages/aid-portal/downloadIcons.ts` | Icons download logic |
| `pages/aid-portal/iconSelection.ts` | Icons selection logic |

### 5d. Search modules (extra)

| Путь | Назначение |
|---|---|
| `pages/aid-portal/searchTokens.ts` | Search colors |
| `pages/aid-portal/searchTypography.ts` | Search typography |
| `pages/aid-portal/searchSpacing.ts` | Search spacing |
| `pages/aid-portal/searchRadius.ts` | Search radius |
| `pages/aid-portal/searchShadows.ts` | Search shadows |
| `pages/aid-portal/searchIcons.ts` | Search icons |

### 5e. Changelog mirror (extra)

| Путь | Назначение |
|---|---|
| `pages/aid-portal/tokens/colors-semantic-changelog.json` | Mirror changelog colors |
| `pages/aid-portal/tokens/typography-sem-changelog.json` | Mirror typography |
| `pages/aid-portal/tokens/spacing-sem-changelog.json` | Mirror spacing |
| `pages/aid-portal/tokens/radius-sem-changelog.json` | Mirror radius |
| `pages/aid-portal/tokens/effects-shadows-changelog.json` | Mirror shadows |
| `pages/aid-portal/tokens/icons-changelog.json` | Mirror icons |

### 5f. Scripts & config (extra)

| Путь | Назначение |
|---|---|
| `pages/aid-portal/package.json` | NPM dependencies |
| `pages/aid-portal/package-lock.json` | NPM lockfile |
| `pages/aid-portal/vite.config.ts` | Vite config |
| `pages/aid-portal/vercel.json` | Vercel deploy config |
| `pages/aid-portal/.gitignore` | Git ignore |
| `pages/aid-portal/scripts/ensure-token-changelogs.mjs` | Prebuild changelog bootstrap |
| `pages/aid-portal/scripts/sync-token-changelogs.mjs` | Changelog sync |
| `pages/aid-portal/scripts/sync-icons-from-figma.mjs` | Figma icons sync |
| `pages/aid-portal/scripts/download-icons-from-manifest.mjs` | Icons download |
| `pages/aid-portal/scripts/fetch-remaining-icons.mjs` | Fetch missing icons |
| `pages/aid-portal/scripts/list-icons.mjs` | List icons utility |
| `pages/aid-portal/scripts/icons-manifest.json` | Icons manifest |

### 5g. Assets (extra)

| Путь | Назначение |
|---|---|
| `pages/aid-portal/public/icons/action/*.svg` | Action icons |
| `pages/aid-portal/public/icons/controls/*.svg` | Controls icons |
| `pages/aid-portal/public/icons/informative/*.svg` | Informative icons |
| `pages/aid-portal/public/icons/operations/*.svg` | Operations icons |
| `pages/aid-portal/public/icons/alternative/*.svg` | Alternative icons |

**Итого SVG:** 178 файлов в 5 категориях.

---

## 6. `tokens/*.json` (корень `tokens/`)

| Путь в плане | Путь в репозитории | Назначение | Статус vs план |
|---|---|---|---|
| `tokens/color-changelog.json` | `tokens/colors-semantic-changelog.json` | Changelog colors | plan path **missing**; semantic file **exists** |
| `tokens/typography-changelog.json` | `tokens/typography-sem-changelog.json` | Changelog typography | plan path **missing** |
| `tokens/spacing-changelog.json` | `tokens/spacing-sem-changelog.json` | Changelog spacing | plan path **missing** |
| `tokens/radius-changelog.json` | `tokens/radius-sem-changelog.json` | Changelog radius | plan path **missing** |
| `tokens/shadows-changelog.json` | `tokens/effects-shadows-changelog.json` | Changelog shadows | plan path **missing** |
| `tokens/icons-changelog.json` | `tokens/icons-changelog.json` | Changelog icons | **exists** |

**Итого:** 6 JSON в корне `tokens/`. По именам плана — **exists: 1**, **missing: 5** (но semantic-эквиваленты есть).

---

## 7. `changes/driver/pending/*` и `changes/driver/released/*`

| Путь | Назначение | Статус vs план |
|---|---|---|
| `changes/driver/pending/` | Директория pending changes | **exists** (пустая) |
| `changes/driver/pending/.gitkeep` | Placeholder | extra |
| `changes/driver/released/` | Директория released changes | **exists** (пустая) |
| `changes/driver/released/.gitkeep` | Placeholder | extra |

**Итого:** обе директории из плана — **exists**. Pending items пока нет.

---

## 8. `src/pages/FigmaStyles/**/*`

| Путь | Назначение | Статус vs план |
|---|---|---|
| `src/pages/FigmaStyles/` | Reference-only Figma style dump (directory) | **exists** |
| `src/pages/FigmaStyles/data.ts` | Figma styles data dump | extra |
| `src/pages/FigmaStyles/FigmaStylesPage.tsx` | Figma styles visualization page | extra |

**Итого:** директория из плана — **exists**. Внутри — 2 implementation files (extra).

---

## Сводка по плану

### ✅ Exists (все пункты плана, которые реально есть)

**Cursor rules (7/7):**

- `.cursor/rules/product-context.mdc`
- `.cursor/rules/token-integrity.mdc`
- `.cursor/rules/component-gate.mdc`
- `.cursor/rules/skills-import-gate.mdc`
- `.cursor/rules/audit-gate.mdc`
- `.cursor/rules/release-gate.mdc`
- `.cursor/RULES_OVERVIEW.md`

**Products (2/2):**

- `products/registry.json`
- `products/driver/product.json`

**Skills (2/10):**

- `skills/_shared/standards/token-rules.md`
- `skills/_shared/standards/platforms.md`

**Driver tokens (6/7):**

- `pages/aid-portal/typographyData.ts`
- `pages/aid-portal/spacingData.ts`
- `pages/aid-portal/radiusData.ts`
- `pages/aid-portal/shadowsData.ts`
- `pages/aid-portal/iconsData.ts`
- `pages/aid-portal/token-changelog-registry.json`

**Tokens changelog (1/6 по имени плана):**

- `tokens/icons-changelog.json`

**Release queues (2/2):**

- `changes/driver/pending/`
- `changes/driver/released/`

**Figma reference (1/1):**

- `src/pages/FigmaStyles/`

---

### ❌ Missing (в плане, нет в репозитории)

| # | Путь |
|---|---|
| 1 | `pages/aid-portal/colorData.ts` |
| 2 | `skills/_shared/standards/component-standards.md` |
| 3 | `skills/_shared/protocols/figma-import-guide.md` |
| 4 | `skills/_shared/protocols/presentbook-guide.md` |
| 5 | `skills/_shared/standards/changelog-guide.md` |
| 6 | `skills/_shared/standards/naming-conventions.md` |
| 7 | `skills/_shared/standards/accessibility.md` |
| 8 | `skills/_shared/standards/testing-strategy.md` |
| 9 | `skills/_shared/standards/versioning-strategy.md` |
| 10 | `tokens/color-changelog.json` |
| 11 | `tokens/typography-changelog.json` |
| 12 | `tokens/spacing-changelog.json` |
| 13 | `tokens/radius-changelog.json` |
| 14 | `tokens/shadows-changelog.json` |

**Итого missing по именам плана: 14.**

---

### ➕ Extra (есть в репо, не упомянуты в плане)

**Cursor rules (8):**

- `ds-import.mdc`, `git-push.mdc`, `ds-principal.mdc`
- `token-style-changelog-gate.mdc`, `token-section-changelog.mdc`, `ds-portal-table-standard.mdc`
- `radius-preview-standard.mdc`, `anatomy-standard.mdc`

**Skills (20):** см. раздел 4b.

**Driver portal (~50+ файлов + 178 SVG):**

- `data.ts` (вместо `colorData.ts`)
- Pages: Hub, Colors, Typography, Spacing, Radius, Shadows, Icons
- Search modules, shared UI, scripts, config
- Changelog mirror в `pages/aid-portal/tokens/`

**Tokens changelog (semantic naming, 5 файлов):**

- `tokens/colors-semantic-changelog.json`
- `tokens/typography-sem-changelog.json`
- `tokens/spacing-sem-changelog.json`
- `tokens/radius-sem-changelog.json`
- `tokens/effects-shadows-changelog.json`

**FigmaStyles (2 файла):**

- `src/pages/FigmaStyles/data.ts`
- `src/pages/FigmaStyles/FigmaStylesPage.tsx`

**Release queues:**

- `changes/driver/pending/.gitkeep`
- `changes/driver/released/.gitkeep`

---

## Комментарий по расхождениям

План описывает **целевую минимальную инфраструктуру**; репозиторий уже содержит **рабочий Driver portal** и **6 committed gates**, но naming расходится с планом: цвета в `data.ts`, changelogs с суффиксами `-sem` / `-semantic` / `-effects-shadows`. **8 новых skills из плана ещё не созданы** — вместо них используются более детальные существующие гайды (color/typography/space/component-*). План стоит обновить под фактические имена из `registry.json` / `product.json`, либо провести отдельную задачу на миграцию naming — без смешивания с implementation work.
