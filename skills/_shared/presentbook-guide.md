---
description: >
  Руководство по созданию token pages, component pages и review sandbox
  в Presentbook (или аналогичном portal): структура, контент, best practices.
destination: skills/_shared/
name: presentbook-guide
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Presentbook Guide

## Purpose

Этот гайд описывает, как создавать и поддерживать страницы Presentbook — product-scoped portal для документирования токенов, компонентов и review sandbox. Presentbook не является source of truth для значений токенов; он **отображает** canonical data из `*Data.ts` и changelog из `tokens/*-changelog.json`.

Цель — единый review surface для design, dev и QA: searchable tables, mode previews, changelog внизу страницы, и (для компонентов) interactive playground с matrix variants × states.

---

## Relationship to other guides

| Гайд | Связь |
|---|---|
| `component-standards.md` | Documentation requirements: stories, props table, variants × states matrix |
| `token-rules.md` | Core → Semantic; что показывать на token page, запрет hardcode в portal UI |
| `platforms.md` | Platform-specific code examples на component pages |
| `changelog-guide.md` | Changelog JSON structure, `loadTokenChangelog`, release boundary |
| `token-section-changelog.mdc` | Обязательный `ChangelogTable` на каждой active token section |
| `testing-strategy.md` | Story-based testing, visual regression matrix |
| `accessibility.md` | Portal a11y: keyboard, contrast, copy actions |
| `naming-conventions.md` | Имена collection, data files, routes |

**Product context:** путь Presentbook берётся из `products/<id>/product.json` → `presentbookRoot`. Для Driver: `pages/driver-color-tokens/`.

---

## Token pages

### Структура token page

Каждая active collection — отдельная страница `*Page.tsx` + data file `*Data.ts` (color: `data.ts`).

```
*Page.tsx
├── DsPageHeader (title, back to hub, search, optional actions)
├── Collection overview (sections / groups)
├── Value table или cards (responsive)
├── Mode columns (Day/Night для color; light/dark где applicable)
├── Optional: JSON view/download, copy-to-clipboard
└── ChangelogTable (loadTokenChangelog(collectionName))
```

**Registry:** `pages/driver-color-tokens/token-changelog-registry.json` — связь `collectionName` ↔ `pageFile` ↔ `artifact`.

### Обязательные секции

| Секция | Назначение | Driver example |
|---|---|---|
| **Page header** | Навигация + поиск | `DsPageHeader` — «Colors», «Spacing» |
| **Description / sections** | Группировка токенов по semantic category | `semanticColorSections` — Bg, Texts, Icons |
| **Value table** | Name, preview, values (hex, px, rem) | `ds-token-table` + `DS_TOKEN_TABLE_STYLE` |
| **Mode switch / columns** | Day + Night для color tokens | Columns Day / Night в `DriverColorTokensPage` |
| **Search** | Filter по имени/id | `searchTokens.ts`, `searchSpacing.ts`, … |
| **Changelog** | Collection version history | `<ChangelogTable data={…} />` внизу страницы |
| **Usage guidelines** | 2–5 do/don't (optional, recommended) | В description секции или intro block |

### Changelog integration

```tsx
import { loadTokenChangelog } from './loadTokenChangelog';
import { ChangelogTable } from './ChangelogTable';
import { DS_CHANGELOG_TABLE_STYLE } from './dsChangelogTable';

const changelog = loadTokenChangelog(collection.collectionName);

// В PAGE_STYLE:
// ${DS_CHANGELOG_TABLE_STYLE}

{changelog ? <ChangelogTable data={changelog} /> : null}
```

- Canonical JSON: `tokens/{collectionName}-changelog.json`
- Mirror (prebuild): `pages/driver-color-tokens/tokens/`
- **Не** редактировать changelog на token page — только display; bumps на release boundary.

### Пример: Driver Colors page

| Element | Implementation |
|---|---|
| Route | `/tokens/colors` (`HUB_ROUTES.colors`) |
| Page | `DriverColorTokensPage.tsx` |
| Data | `data.ts` — `colorTokenCollection`, `semanticColorSections` |
| Collection | `colors-semantic` / artifact `Colors/Semantic` |
| Modes | Day / Night columns + swatch preview |
| Actions | JSON view/download, copy hex |
| Changelog | `loadTokenChangelog('colors-semantic')` |

Другие Driver token pages следуют тому же паттерну:

| Section | Page | Data | collectionName |
|---|---|---|---|
| Typography | `TypographyPage.tsx` | `typographyData.ts` | `typography-sem` |
| Spacing | `SpacingPage.tsx` | `spacingData.ts` | `spacing-sem` |
| Radius | `RadiusPage.tsx` | `radiusData.ts` | `radius-sem` |
| Shadows | `ShadowsPage.tsx` | `shadowsData.ts` | `effects-shadows` |
| Icons | `IconsPage.tsx` | `iconsData.ts` | `icons` |

---

## Component pages

> Driver: `componentsRoot: null`, component pages **ещё не созданы**. Структура ниже — target для первого component scope после Component Gate.

### Структура component page

```
ComponentPage.tsx
├── DsPageHeader (component name, version badge)
├── Overview (purpose, architecture level, Figma link)
├── Variants (grid или tabs)
├── States (interactive matrix)
├── Props table (name, type, default, description)
├── Slots (leading, trailing, content, …)
├── Platform examples (Web / iOS / Android snippets)
├── Usage guidelines (do / don't)
├── Playground / sandbox (optional controlled props)
└── Changelog section (component changelog TBD per product)
```

### Interactive sandbox (playground)

- Controlled props panel: `variant`, `size`, `isDisabled`, `isLoading`
- Live preview — isolated iframe или Storybook embed
- Matrix shortcut links: «Open primary × disabled in sandbox»
- Не смешивать несколько компонентов на одной sandbox page без explicit scope

### Changelog section

- Component SemVer independent — см. `versioning-strategy.md`
- Display-only на page; updates через Release Gate
- Link to `changes/<id>/pending/` items for in-progress work (optional)

### Documentation requirements (from component-standards)

1. Story / example — минимум один на variant
2. Props table — public API
3. Variants × states matrix — grid preview
4. Usage guidelines — do / don't

Формат согласуется с `skills/ds-component-spec/SKILL.md`.

---

## Review sandbox

Review sandbox — временная или permanent страница для **design/dev review** до release, не substitute для production docs.

### Когда создавать

| Use case | Sandbox scope |
|---|---|
| New token collection import | Side-by-side Figma vs portal table |
| Component spec review | Variants × states × modes matrix |
| Token value change (pending) | Before/after preview with pending item id |
| Cross-platform parity check | Same component, platform tabs |

### Matrix views (variants × states × modes)

Минимальная review matrix для interactive components:

```
        default   hover   pressed   focused   disabled   loading
primary    ✓        ✓        ✓         ✓          ✓          ✓
secondary  ✓        ✓        ✓         ✓          ✓          —
ghost      ✓        ✓        ✓         ✓          ✓          ✓
```

× **modes:** light, dark (отдельные строки или toggle).

Для token review matrix:

```
token name     day value    night value    contrast OK?
text-primary   …            …              ✓
bg-accent-main …            …              ✓
```

### Design / dev review workflow

1. **Product context** confirmed
2. Sandbox page или branch preview URL shared
3. Reviewers проверяют matrix + changelog placeholder
4. Findings → Audit Gate report или pending items
5. После approval — merge to canonical page + release

**Не** использовать `src/pages/FigmaStyles/` как review source — reference-only.

---

## Portal structure

### Организация разделов

```
Hub (/design-system)
├── Tokens
│   ├── Colors      (/tokens/colors)
│   ├── Typography  (/tokens/typography)
│   ├── Spacing     (/tokens/spacing)
│   ├── Radius      (/tokens/radius)
│   ├── Shadows     (/tokens/shadows)
│   └── Icons       (/tokens/icons)
└── Components      (TBD — placeholder on Driver hub)
    └── [ComponentName]  (/components/…)
```

**Driver files:**

| Concern | Path |
|---|---|
| Portal root | `pages/driver-color-tokens/` |
| Hub config | `hubData.ts` — `HUB_SECTIONS`, `HUB_ROUTES` |
| Routing | `App.tsx` — pathname → page component |
| Shared header | `DsPageHeader.tsx` |
| Table styles | `dsChangelogTable.ts` — `DS_TOKEN_TABLE_STYLE`, `DS_PORTAL_LAYOUT_TOKENS` |
| Changelog UI | `ChangelogTable.tsx`, `loadTokenChangelog.ts` |
| Prebuild | `scripts/ensure-token-changelogs.mjs` |

### Навигация

- Hub → section card → token page
- Token page → back link to hub (`DsPageHeader` back button)
- Cross-links между collections — только через hub, не ad-hoc sidebar (пока нет global nav component)
- Routes из `products/driver/product.json` → `tokenRoutes` — single source for path names

### Driver portal как пример

| Property | Value |
|---|---|
| Product | `driver` |
| presentbookRoot | `pages/driver-color-tokens` |
| presentbookType | `react-vite` |
| Dev | `npm run dev:driver-colors` |
| Build | `npm run build:driver-colors` |
| routeBase | `/design-system` |

Исторические product portals (`docs/storybook/` для ui-kit-a/b) — reference architecture, **не** template для нового Driver work без explicit request.

---

## Best practices

### Что включать

- Данные **только** из canonical `*Data.ts` / `data.ts` — no duplicate token values in page file
- Search/filter для collections > ~20 items
- Copy actions для token names и values (hex, px)
- Responsive table → card fallback на mobile
- `ChangelogTable` на каждой active token section
- `collectionName` в data file совпадает с registry и changelog filename
- Semantic section titles aligned with Figma / token guides

### Что не включать

- Hardcoded token values только для portal demo (блокер по token-rules)
- Changelog edits inline on page
- Mixed product token values on one page
- `FigmaStyles` dump as displayed values
- Component-level token names in tables (semantic only)
- Release SemVer bumps during page implementation

### Performance considerations

- `useMemo` для filtered lists (search)
- Lazy load heavy sections (icons grid) where needed
- Avoid rendering full JSON modal until requested
- Icon assets from `public/icons/` — static paths, no runtime fetch storm
- Large tables: zebra rows via CSS, virtualize only if >500 rows

### Maintenance

- Новая collection → registry entry + `*Page.tsx` + `*Data.ts` + prebuild changelogs
- Обновление `hubData.ts` + `App.tsx` routes + `product.json` tokenRoutes
- Portal layout changes → update `DS_PORTAL_LAYOUT_TOKENS` once, not per page
- Periodic audit: portal values vs `*Data.ts` (Audit Gate)
- Wave completion → update `DS_PIPELINE_CONTEXT.md`

---

## Anti-patterns

| Anti-pattern | Почему плохо | Как исправить |
|---|---|---|
| Token page without changelog | Blocks merge per token-section-changelog | Add `ChangelogTable` + registry |
| Values hardcoded in `*Page.tsx` | Drift from canonical source | Import from `*Data.ts` |
| `colorData.ts` naming | Driver uses `data.ts` | Follow actual paths |
| Skip registry entry | prebuild won't create changelog | Add to `token-changelog-registry.json` |
| Inline table styles per page | Inconsistent portal UI | `DS_TOKEN_TABLE_STYLE` + `ds-token-table` |
| Presentbook as source of truth | Wrong direction | Data file → page display |
| Sandbox without product scope | Product isolation violation | Confirm product context |
| Single mode column for color | Incomplete semantic contract | Day + Night columns |
| Component page before Component Gate | Wrong path/API | Gate first |
| Duplicate routes in App without hubData sync | Broken navigation | Single `HUB_ROUTES` source |
| Copy historical storybook structure blindly | Wrong product paths | Use `products/<id>/product.json` |
| Edit changelog JSON during implementation | Violates release boundary | Pending item → Release Gate |

---

## Changelog

- **1.0.0** — 2026-08-15. Первая версия: token/component page structure, review sandbox, Driver portal reference, best practices, anti-patterns.
