# Product Registry — read-only аудит репозитория

> Дата: 2026-08-15  
> Режим: read-only (факты по состоянию репозитория на момент аудита)  
> Цель: подготовка `products/registry.json`

---

## Найденные продукты

| Product ID | Название | Основание | Статус |
|---|---|---|---|
| `driver` | aid: driver | Отдельный Vite-портал `pages/driver-color-tokens/`, hub «aid: driver», 6 разделов токенов, пакет `aid-ds` | **Активный** — единственный полностью сверстанный React token portal |
| `ui-kit-a` | UI Kit A | `tokens/ui-kit-a/`, `docs/storybook/_products.json`, Storybook `stories/ui-kit-a/` | Stable — JSON-токены + HTML/Storybook preview |
| `ui-kit-b` | UI Kit B | `tokens/ui-kit-b/`, `docs/storybook/_products.json`, Storybook `stories/ui-kit-b/` | Stable — JSON-токены + HTML/Storybook preview |
| `sutochno` | Sutochno | `tokens/sutochno/`, React `src/components/sutochno/`, HTML `docs/storybook/products/sutochno/` | Legacy — legacy-токены + 2 компонента |
| `design-system` | Design System (HTML specs) | Секция в `docs/storybook/_storybook-nav.json`, generic component pages | Stable/read-only — spec-страницы без product JSON в `tokens/` |
| `figma-styles-driver` | Driver App • Work (Figma dump) | `src/pages/FigmaStyles/`, Storybook `stories/figma-styles/` | Prototype — одна Storybook-страница, данные в TS, не связана с aid-ds portal |

> `docs/storybook-legacy/` — дубликат старого presentbook; **не источник истины** (исключён из registry-черновика).

---

## Реальные пути

### `driver` (aid: driver)

- **tokensRoot:** `null` — в `tokens/` **нет** JSON-бандла driver; значения лежат в TS data-файлах портала
- **componentsRoot:** `null` — React-компонентов продукта нет (только UI портала: `DsPageHeader`, `ChangelogTable` и т.д.)
- **presentbookRoot:** `pages/driver-color-tokens/`
- **routeBase:** `/design-system` (hub), `/tokens/*` (разделы)
- **существующие token files (runtime):**
  - `pages/driver-color-tokens/data.ts` — Colors
  - `pages/driver-color-tokens/typographyData.ts`
  - `pages/driver-color-tokens/spacingData.ts`
  - `pages/driver-color-tokens/radiusData.ts`
  - `pages/driver-color-tokens/shadowsData.ts`
  - `pages/driver-color-tokens/iconsData.ts`
  - `pages/driver-color-tokens/public/icons/**/*.svg` — 178 SVG иконок
- **существующие changelog/version files:**
  - `pages/driver-color-tokens/token-changelog-registry.json` — реестр коллекций
  - `tokens/*-changelog.json` (канон) + зеркало `pages/driver-color-tokens/tokens/*-changelog.json`
  - Коллекции: `colors-semantic`, `typography-sem`, `spacing-sem`, `radius-sem`, `effects-shadows`, `icons`

**Routes (client-side, `hubData.ts` + `App.tsx`):**

| Route | Страница |
|---|---|
| `/` или `/design-system` | Hub |
| `/tokens/colors` | `DriverColorTokensPage.tsx` |
| `/tokens/typography` | `TypographyPage.tsx` |
| `/tokens/spacing` | `SpacingPage.tsx` |
| `/tokens/radius` | `RadiusPage.tsx` |
| `/tokens/shadows` | `ShadowsPage.tsx` |
| `/tokens/icons` | `IconsPage.tsx` |

**Что из `tokens/` реально использует сверстанная страница:** только `tokens/*-changelog.json` (через `loadTokenChangelog.ts`). JSON-бандлы `ui-kit-*` / `sutochno` **не импортируются**.

---

### `ui-kit-a`

- **tokensRoot:** `tokens/ui-kit-a/`
- **componentsRoot:** `null`
- **presentbookRoot:** `docs/storybook/` (HTML) + `stories/ui-kit-a/` + `src/components/TokensOverview.tsx`
- **routeBase:** `/docs/storybook/product.html?product=ui-kit-a`, `/docs/storybook/product-colors.html?product=ui-kit-a`
- **существующие token files:**
  - `tokens/ui-kit-a/core/color.json`
  - `tokens/ui-kit-a/semantic/color.json`
  - `tokens/ui-kit-a/legacy/legacy-tokens.json`
- **существующие changelog/version files:** `null` на product-уровне (нет `*-changelog.json` для ui-kit-a)

---

### `ui-kit-b`

- **tokensRoot:** `tokens/ui-kit-b/`
- **componentsRoot:** `null`
- **presentbookRoot:** `docs/storybook/` + `stories/ui-kit-b/` + `src/components/TokensOverview.tsx`
- **routeBase:** `/docs/storybook/product.html?product=ui-kit-b`, `/docs/storybook/product-colors.html?product=ui-kit-b`
- **существующие token files:**
  - `tokens/ui-kit-b/core/color.json`
  - `tokens/ui-kit-b/semantic/color.json`
  - `tokens/ui-kit-b/legacy/legacy-tokens.json`
- **существующие changelog/version files:** `null`

---

### `sutochno`

- **tokensRoot:** `tokens/sutochno/`
- **componentsRoot:** `src/components/sutochno/`
- **presentbookRoot:** `docs/storybook/products/sutochno/` + `stories/sutochno/`
- **routeBase:** `/docs/storybook/product.html?product=sutochno`, component pages под `docs/storybook/products/sutochno/components/`
- **существующие token files:**
  - `tokens/sutochno/legacy/legacy-tokens.json`
  - `tokens/sutochno/legacy/typography-styles.json`
  - `tokens/sutochno/core/.gitkeep` — **пусто**
  - `tokens/sutochno/semantic/.gitkeep` — **пусто**
- **существующие changelog/version files:** `null` на product-уровне
- **componentRegistry (de facto):** `docs/storybook/_products.json` → `button-text`, `counter-value`

**React-компоненты:**

| Компонент | Путь | Story |
|---|---|---|
| `ButtonText` | `src/components/sutochno/ButtonText.tsx` | `stories/sutochno/components/ButtonText.stories.tsx` |
| `CounterValue` | `src/components/sutochno/CounterValue.tsx` | `stories/sutochno/components/CounterValue.stories.tsx` |

---

### `design-system` (HTML generic specs)

- **tokensRoot:** `null` — отдельной папки в `tokens/` нет
- **componentsRoot:** `null` (React); spec-HTML в `docs/storybook/components/`
- **presentbookRoot:** `docs/storybook/`
- **routeBase:** `/docs/storybook/typography.html`, `/docs/storybook/colors.html`, `/docs/storybook/components/*.html`
- **существующие token files (docs runtime):**
  - `docs/tokens/color-tokens-registry.md` + `docs/tokens/typography-tokens-registry.md`
  - CSS генерируется через `docs/tokens/save-tokens.js`
- **существующие changelog/version files:**
  - `docs/tokens/color-tokens-changelog.md`
  - `docs/tokens/typography-tokens-changelog.md`

---

### `figma-styles-driver` (prototype)

- **tokensRoot:** `null`
- **componentsRoot:** `null`
- **presentbookRoot:** `src/pages/FigmaStyles/`
- **routeBase:** Storybook story `Figma Styles/Driver v1` (не отдельный URL presentbook)
- **существующие token files:** `src/pages/FigmaStyles/data.ts` (hardcoded Figma styles)
- **существующие changelog/version files:** `null`

---

## `tokens/` — сводка

**Product bundles (папки):** `ui-kit-a/`, `ui-kit-b/`, `sutochno/`

**Только `.gitkeep`:** `tokens/sutochno/core/`, `tokens/sutochno/semantic/`

**Changelog JSON на корне `tokens/` (driver portal, не product bundles):**

- `colors-semantic-changelog.json`
- `typography-sem-changelog.json`
- `spacing-sem-changelog.json`
- `radius-sem-changelog.json`
- `effects-shadows-changelog.json`
- `icons-changelog.json`

**Загрузчик JSON-токенов:** `src/tokens/loadTokens.ts` — только `ui-kit-a | ui-kit-b | sutochno`. Driver **не подключён**.

---

## Текущий активный продукт

- **Название:** `driver` (aid: driver / aid-ds)
- **Почему определён как активный:**
  - Единственный продукт с полноценным React token portal и 6 живыми разделами
  - Активная разработка в `pages/driver-color-tokens/` (Spacing, Radius, Typography, Shadows, Icons, Colors)
  - Changelog-инфраструктура: `token-changelog-registry.json` + `tokens/*-changelog.json`
  - Root scripts: `dev:driver-colors`, `build:driver-colors`
  - Title страницы: «aid: driver»
- **Страница токенов:** `pages/driver-color-tokens/` (hub + section pages)
- **Текущий route:** `/design-system`, `/tokens/colors|typography|spacing|radius|shadows|icons`
- **Источники данных токенов:**
  - **Значения:** TS data-файлы в `pages/driver-color-tokens/*Data.ts` + `data.ts`
  - **Иконки:** `pages/driver-color-tokens/public/icons/`
  - **Версии/changelog:** `tokens/*-changelog.json` (канон) через `loadTokenChangelog.ts`
  - **Не используются:** `tokens/ui-kit-*`, `tokens/sutochno`, `src/tokens/loadTokens.ts`

---

## Предложение registry

Черновик с **реальными** путями; `null` = физически отсутствует.

```json
{
  "schemaVersion": "0.1.0",
  "repoVersion": "0.4.0",
  "defaultReleaseRoot": "CHANGELOG.md",
  "products": [
    {
      "id": "driver",
      "label": "aid: driver",
      "status": "active",
      "tokensRoot": null,
      "tokenDataRoot": "pages/driver-color-tokens",
      "tokenDataFiles": [
        "pages/driver-color-tokens/data.ts",
        "pages/driver-color-tokens/typographyData.ts",
        "pages/driver-color-tokens/spacingData.ts",
        "pages/driver-color-tokens/radiusData.ts",
        "pages/driver-color-tokens/shadowsData.ts",
        "pages/driver-color-tokens/iconsData.ts"
      ],
      "tokenAssetsRoot": "pages/driver-color-tokens/public/icons",
      "componentsRoot": null,
      "presentbookRoot": "pages/driver-color-tokens",
      "presentbookType": "react-vite",
      "routeBase": "/design-system",
      "tokenRoutes": {
        "hub": "/design-system",
        "colors": "/tokens/colors",
        "typography": "/tokens/typography",
        "spacing": "/tokens/spacing",
        "radius": "/tokens/radius",
        "shadows": "/tokens/shadows",
        "icons": "/tokens/icons"
      },
      "tokenRegistry": "pages/driver-color-tokens/token-changelog-registry.json",
      "changelogRoot": "tokens",
      "changelogMirrorRoot": "pages/driver-color-tokens/tokens",
      "componentRegistry": null,
      "releaseRoot": null,
      "notes": "Значения токенов в TS, не в tokens/*.json. Changelog — единственная связь с tokens/."
    },
    {
      "id": "ui-kit-a",
      "label": "UI Kit A",
      "status": "stable",
      "tokensRoot": "tokens/ui-kit-a",
      "tokenDataRoot": null,
      "tokenDataFiles": [
        "tokens/ui-kit-a/core/color.json",
        "tokens/ui-kit-a/semantic/color.json",
        "tokens/ui-kit-a/legacy/legacy-tokens.json"
      ],
      "tokenAssetsRoot": null,
      "componentsRoot": null,
      "presentbookRoot": "docs/storybook",
      "presentbookType": "html",
      "routeBase": "/docs/storybook/product.html?product=ui-kit-a",
      "tokenRoutes": {
        "colors": "/docs/storybook/product-colors.html?product=ui-kit-a"
      },
      "tokenRegistry": "docs/storybook/_products.json",
      "changelogRoot": null,
      "componentRegistry": "docs/storybook/_products.json",
      "storybookRoot": "stories/ui-kit-a",
      "releaseRoot": null
    },
    {
      "id": "ui-kit-b",
      "label": "UI Kit B",
      "status": "stable",
      "tokensRoot": "tokens/ui-kit-b",
      "tokenDataRoot": null,
      "tokenDataFiles": [
        "tokens/ui-kit-b/core/color.json",
        "tokens/ui-kit-b/semantic/color.json",
        "tokens/ui-kit-b/legacy/legacy-tokens.json"
      ],
      "tokenAssetsRoot": null,
      "componentsRoot": null,
      "presentbookRoot": "docs/storybook",
      "presentbookType": "html",
      "routeBase": "/docs/storybook/product.html?product=ui-kit-b",
      "tokenRoutes": {
        "colors": "/docs/storybook/product-colors.html?product=ui-kit-b"
      },
      "tokenRegistry": "docs/storybook/_products.json",
      "changelogRoot": null,
      "componentRegistry": "docs/storybook/_products.json",
      "storybookRoot": "stories/ui-kit-b",
      "releaseRoot": null
    },
    {
      "id": "sutochno",
      "label": "Sutochno",
      "status": "legacy",
      "tokensRoot": "tokens/sutochno",
      "tokenDataRoot": null,
      "tokenDataFiles": [
        "tokens/sutochno/legacy/legacy-tokens.json",
        "tokens/sutochno/legacy/typography-styles.json"
      ],
      "tokenAssetsRoot": null,
      "componentsRoot": "src/components/sutochno",
      "presentbookRoot": "docs/storybook/products/sutochno",
      "presentbookType": "html",
      "routeBase": "/docs/storybook/product.html?product=sutochno",
      "tokenRoutes": {
        "colors": "/docs/storybook/product-colors.html?product=sutochno",
        "typography": "/docs/storybook/product-typography.html?product=sutochno"
      },
      "tokenRegistry": "docs/storybook/_products.json",
      "changelogRoot": null,
      "componentRegistry": "docs/storybook/_products.json",
      "storybookRoot": "stories/sutochno",
      "releaseRoot": null,
      "notes": "core/ и semantic/ — только .gitkeep"
    },
    {
      "id": "design-system",
      "label": "Design System (HTML specs)",
      "status": "stable",
      "tokensRoot": null,
      "tokenDataRoot": "docs/tokens",
      "tokenDataFiles": [
        "docs/tokens/color-tokens-registry.md",
        "docs/tokens/typography-tokens-registry.md"
      ],
      "componentsRoot": null,
      "presentbookRoot": "docs/storybook",
      "presentbookType": "html",
      "routeBase": "/docs/storybook",
      "tokenRoutes": {
        "typography": "/docs/storybook/typography.html",
        "colors": "/docs/storybook/colors.html",
        "components": "/docs/storybook/components.html"
      },
      "tokenRegistry": "docs/tokens/color-tokens-registry.md",
      "changelogRoot": "docs/tokens",
      "componentRegistry": "docs/storybook/_storybook-nav.json",
      "releaseRoot": null,
      "notes": "Registry в Markdown, не JSON. Отдельного product-id в tokens/ нет."
    },
    {
      "id": "figma-styles-driver",
      "label": "Driver App • Work (Figma styles dump)",
      "status": "prototype",
      "tokensRoot": null,
      "tokenDataRoot": "src/pages/FigmaStyles",
      "tokenDataFiles": ["src/pages/FigmaStyles/data.ts"],
      "componentsRoot": null,
      "presentbookRoot": "src/pages/FigmaStyles",
      "presentbookType": "storybook-only",
      "routeBase": null,
      "tokenRegistry": null,
      "changelogRoot": null,
      "componentRegistry": null,
      "storybookRoot": "stories/figma-styles",
      "releaseRoot": null
    }
  ]
}
```

---

## Отсутствующие зоны

Пути, которых **сейчас нет**, но понадобятся для полноценного product registry:

| Путь | Для кого | Зачем |
|---|---|---|
| `products/registry.json` | repo | Целевой registry (ещё не создан) |
| `tokens/driver/` | driver | JSON-бандл токенов (сейчас только TS + changelog) |
| `tokens/driver/core/`, `tokens/driver/semantic/` | driver | Core/Semantic JSON, если уйти от TS-hardcode |
| `src/components/driver/` | driver | Product-specific React components |
| `tokens/ui-kit-a/*-changelog.json` | ui-kit-a | Product-level versioning |
| `tokens/ui-kit-b/*-changelog.json` | ui-kit-b | Product-level versioning |
| `tokens/sutochno/core/*.json` | sutochno | Папка пустая (.gitkeep) |
| `tokens/sutochno/semantic/*.json` | sutochno | Папка пустая (.gitkeep) |
| `pages/driver-color-tokens/components/` | driver | Component catalog (hub placeholder `href: null`) |
| `products/<id>/release/` или per-product CHANGELOG | all | Сейчас только repo-level `CHANGELOG.md` + `VERSION` |
| `componentRegistry` JSON для driver / ui-kit-* | driver, ui-kit-a/b | Единый machine-readable component registry |
| `docs/storybook/_products.json` entry for `driver` | driver | Driver portal не зарегистрирован в HTML presentbook products |

---

## Дополнительные наблюдения

1. **Два параллельных presentbook-слоя:** HTML (`docs/storybook/`) и React (`pages/driver-color-tokens/`). Активный token UI — второй.
2. **`src/pages/`** содержит только `FigmaStyles/` — driver portal **не** в `src/pages/`.
3. **Storybook** (`stories/`, `.storybook/`) — entry points для ui-kit-a/b, sutochno, FigmaStyles; driver portal **не** подключён к Storybook.
4. **`docs/tokens/*-registry.md`** — источник истины для HTML typography/colors editor, **не** для aid: driver portal.
5. **Changelog driver** versioned per collection (`currentVersion` в JSON), repo `CHANGELOG.md` — про skills/docs, не про driver tokens.

---

## Связанные файлы (справочник)

| Назначение | Путь |
|---|---|
| Repo version | `VERSION` (0.4.0) |
| Repo changelog | `CHANGELOG.md` |
| Driver changelog registry | `pages/driver-color-tokens/token-changelog-registry.json` |
| HTML products manifest | `docs/storybook/_products.json` |
| HTML nav | `docs/storybook/_storybook-nav.json` |
| Token loader (JSON kits) | `src/tokens/loadTokens.ts` |
| Storybook config | `.storybook/main.ts` |
| Driver dev script | `package.json` → `dev:driver-colors` |
