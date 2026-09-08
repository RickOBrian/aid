---
date: 2026-08-15
scope: driver
type: driver-portal-review
auditor: audit-gate
mode: read-only
---

# Driver Portal Review — read-only (post Audit Gate)

**Scope:** 13 untracked artifacts + связанные modified deps (`App.tsx`, `hubData.ts` — вне списка, но нужны для merge)  
**Build:** `npm run build` в `pages/driver-color-tokens/` — ✅ passed (70 modules, 364ms)

**Reviewed artifacts:**

- `pages/driver-color-tokens/typographyData.ts`
- `pages/driver-color-tokens/spacingData.ts`
- `pages/driver-color-tokens/radiusData.ts`
- `pages/driver-color-tokens/shadowsData.ts`
- `pages/driver-color-tokens/TypographyPage.tsx`
- `pages/driver-color-tokens/SpacingPage.tsx`
- `pages/driver-color-tokens/RadiusPage.tsx`
- `pages/driver-color-tokens/ShadowsPage.tsx`
- `pages/driver-color-tokens/token-changelog-registry.json`
- `tokens/typography-sem-changelog.json`
- `tokens/spacing-sem-changelog.json`
- `tokens/radius-sem-changelog.json`
- `tokens/effects-shadows-changelog.json`

---

## 1. Page → Data imports

| Page | Data import | Status |
|---|---|---|
| `TypographyPage.tsx` | `./typographyData` (`typographyCollection`, `typographySections`, …) | ✅ |
| `SpacingPage.tsx` | `./spacingData` (`spacingCollection`, `spacingTokens`, …) | ✅ |
| `RadiusPage.tsx` | `./radiusData` (`radiusCollection`, `radiusTokens`, …) | ✅ |
| `ShadowsPage.tsx` | `./shadowsData` (`shadowsCollection`, `shadowSections`, …) | ✅ |

---

## 2. `collectionName` ↔ registry ↔ changelog

| Data file | `collectionName` | Registry | Changelog file | Match |
|---|---|---|---|---|
| `typographyData.ts` | `typography-sem` | ✅ | `tokens/typography-sem-changelog.json` | ✅ |
| `spacingData.ts` | `spacing-sem` | ✅ | `tokens/spacing-sem-changelog.json` | ✅ |
| `radiusData.ts` | `radius-sem` | ✅ | `tokens/radius-sem-changelog.json` | ✅ |
| `shadowsData.ts` | `effects-shadows` | ✅ | `tokens/effects-shadows-changelog.json` | ✅ |

`artifact` в data/registry/changelog согласованы:

- `Typography/Semantic`
- `Spacing/Semantic`
- `Radius/Semantic`
- `Effects/Shadows`

---

## 3. Shared portal components & styles

| Check | Typography | Spacing | Radius | Shadows |
|---|---|---|---|---|
| `DsPageHeader` | ✅ | ✅ | ✅ | ✅ |
| `ChangelogTable` + `loadTokenChangelog` | ✅ | ✅ | ✅ | ✅ |
| `DS_CHANGELOG_TABLE_STYLE` | ✅ | ✅ | ✅ | ✅ |
| `DS_COPYABLE_STYLE` / `DS_TOAST_STYLE` | ✅ | ✅ | ✅ | ✅ |
| `ds-token-table-wrap` / `ds-token-table` | ✅ | ✅ | ✅ | ✅ |
| `DS_TOKEN_TABLE_STYLE` явно | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

**Note:** `DS_CHANGELOG_TABLE_STYLE` включает `${DS_TOKEN_TABLE_STYLE}` (см. `dsChangelogTable.ts:122`), поэтому стили таблиц подтягиваются косвенно — функционально OK, но явный импорт `DS_TOKEN_TABLE_STYLE` по `ds-portal-table-standard.mdc` отсутствует.

`DS_PAGE_HEADER_STYLE` инжектится внутри `DsPageHeader.tsx` — отдельный импорт на страницах не нужен ✅

---

## 4. Hardcoded token values

**Token data в JSX:** ✅ — значения берутся только из `*Data.ts` (`token.valuePxLabel`, `typographyParameterValue()`, `radiusPreviewStyle()`, `shadowPreviewStyle()` и т.д.). Inline token numbers в `*Page.tsx` не найдены.

**Portal/preview chrome:** ⚠️ — hardcoded colors в PAGE_STYLE:

- Spacing preview: `#2c64e3`, `rgba(141, 185, 253, 0.24)`
- Radius preview: `#f04438`, `rgba(240, 68, 56, 0.1)`
- Layout: `#2d2c2e`, `#ffffff`, `#ebedf0`, …

Это не дублирование token values, а UI chrome / visualization — тот же паттерн, что у Colors portal. По `no-hardcode-color-protocol` — ⚠️ non-blocking (не semantic token display).

---

## 5. Registry `pageFile` / `artifact`

| `collectionName` | `pageFile` | File exists | `artifact` ↔ data |
|---|---|---|---|
| `typography-sem` | `TypographyPage.tsx` | ✅ | ✅ |
| `spacing-sem` | `SpacingPage.tsx` | ✅ | ✅ |
| `radius-sem` | `RadiusPage.tsx` | ✅ | ✅ |
| `effects-shadows` | `ShadowsPage.tsx` | ✅ | ✅ |
| `colors-semantic` | `DriverColorTokensPage.tsx` | ✅ (tracked) | ✅ |
| `icons` | `IconsPage.tsx` | ✅ (tracked) | ✅ |

---

## 6. Routes sync

| Route key | `hubData.ts` | `App.tsx` | `product.json` |
|---|---|---|---|
| hub | `/design-system` | ✅ | ✅ |
| colors | `/tokens/colors` | ✅ | ✅ |
| typography | `/tokens/typography` | ✅ | ✅ |
| spacing | `/tokens/spacing` | ✅ | ✅ |
| radius | `/tokens/radius` | ✅ | ✅ |
| shadows | `/tokens/shadows` | ✅ | ✅ |
| icons | `/tokens/icons` | ✅ | ✅ |

**Routes:** ✅ полностью синхронизированы.

---

## 7. Changelog JSON — canonical schema

Все 4 файла соответствуют `skills/_shared/changelog-guide.md`:

- `artifact`, `currentVersion`, `entries[]`
- `entries[].version/date/author/type`
- `changes[].kind/description`

**Changelog schema:** ✅

---

## 8. Build / typecheck

| Check | Result |
|---|---|
| `npm run build` | ✅ success |
| Dedicated `typecheck` script | ❌ отсутствует в `package.json` |
| `tsconfig.json` | ❌ отсутствует (TS через Vite/esbuild) |

Build прошёл как implicit compile check. Отдельный `tsc --noEmit` недоступен без tsconfig.

---

## 9. Git state

**`git diff --stat` (modified, staged нет):**

```
 pages/driver-color-tokens/App.tsx                  |  36 ++++
 pages/driver-color-tokens/ChangelogTable.tsx       |  25 ++-
 pages/driver-color-tokens/DriverColorTokensPage.tsx |  64 +------
 pages/driver-color-tokens/IconsPage.tsx            |  10 +-
 pages/driver-color-tokens/dsChangelogTable.ts      | 188 +++++++++++++++++----
 pages/driver-color-tokens/hubData.ts               |  34 +++-
 pages/driver-color-tokens/index.html               |   4 +-
 pages/driver-color-tokens/package.json             |   2 +-
 8 files changed, 260 insertions(+), 103 deletions(-)
```

**Untracked (audit scope):** все 13 файлов из списка — `??`

**Зависимости вне scope (нужны для работы, тоже untracked):**

- `searchTypography.ts`, `searchSpacing.ts`, `searchRadius.ts`, `searchShadows.ts`
- `scripts/ensure-token-changelogs.mjs`
- `pages/driver-color-tokens/tokens/*-changelog.json` (mirrors)

---

## Блокирующие проблемы

1. **Incomplete commit bundle** — 4 новые страницы не merge-ready сами по себе: routing в `App.tsx`, hub cards в `hubData.ts`, shared styles в `dsChangelogTable.ts` — modified, но не закоммичены. Search helpers и prebuild script — untracked. Merge только scope-файлов сломает portal на чистой ветке.

2. **Все audit-scope артефакты untracked** — 4 data, 4 pages, registry, 4 changelog JSON не в git history. Блокер для merge/release по Audit Gate findings.

---

## Non-blocking замечания

1. **`DS_TOKEN_TABLE_STYLE` не импортирован явно** — стили таблиц приходят через `DS_CHANGELOG_TABLE_STYLE`; для соответствия `ds-portal-table-standard.mdc` лучше добавить явный импорт.

2. **Hardcoded portal/preview colors** — accent colors в spacing/radius preview и layout hex в PAGE_STYLE; не token data, но расходится с рекомендацией `DS_PORTAL_LAYOUT_TOKENS`.

3. **Page-local CSS дублирует layout tokens** — `#2d2c2e`, `#ebedf0`, padding breakpoints повторяются на каждой странице вместо shared shell styles.

4. **Нет dedicated typecheck** — build OK, но strict TS check не формализован.

5. **Prebuild side effect** — `npm run build` запускает `ensure-token-changelogs.mjs` + `sync-token-changelogs.mjs` (mirror sync в `pages/driver-color-tokens/tokens/`). Для read-only review это ожидаемо, но стоит учитывать при diff review.

---

## Summary

| Area | Verdict |
|---|---|
| Data ↔ Page wiring | ✅ |
| collectionName ↔ registry ↔ changelog | ✅ |
| Shared header/changelog/table classes | ✅ (⚠️ explicit `DS_TOKEN_TABLE_STYLE`) |
| No hardcoded token values in pages | ✅ |
| Registry accuracy | ✅ |
| Routes sync | ✅ |
| Changelog canonical schema | ✅ |
| Build | ✅ |
| Git / merge readiness | ❌ blocking |

---

## Recommendation

Перед merge собрать единый commit bundle:

- 4 pages + 4 data + 4 search helpers
- registry + 4 canonical changelogs + mirrors
- `App.tsx` + `hubData.ts` + `dsChangelogTable.ts`
- prebuild scripts

Либо несколько логических commits, но не только scope-13 из audit list.
