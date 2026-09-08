---
date: 2026-08-15
scope: driver
type: commit-plan
mode: read-only
---

# Driver Portal — Commit Plan (read-only)

**Источники:** `.cursor/audit-2026-08-15-ds-pipeline.md`, `.cursor/1audit-2026-08-15-driver-portal-review.md`  
**Примечание:** driver portal review лежит как `1audit-2026-08-15-driver-portal-review.md` (префикс `1` — опечатка в имени).

**Вне scope Driver portal (не включать в portal bundle):**

| File | Status | Why excluded |
|---|---|---|
| `.cursor/mcp.json` | untracked | Cursor config |
| `.cursor/rules/ds-portal-table-standard.mdc` | untracked | governance rule |
| `.cursor/rules/token-section-changelog.mdc` | untracked | governance rule |
| `.cursor/rules/token-style-changelog-gate.mdc` | untracked | governance rule |
| `docs/ds-infrastructure-plan-audit.md` | untracked | unrelated audit |
| `docs/product-registry-audit.md` | untracked | unrelated audit |

---

## Full inventory — Driver portal working set

### Group 1 — Portal foundation

| File | Git state | Depends on | Separate commit? |
|---|---|---|---|
| `pages/driver-color-tokens/dsChangelogTable.ts` | **modified** (tracked) | — | ✅ да (build Colors/Icons OK) |
| `pages/driver-color-tokens/ChangelogTable.tsx` | **modified** (tracked) | `dsChangelogTable.ts` | ⚠️ только с `dsChangelogTable.ts` |
| `pages/driver-color-tokens/DriverColorTokensPage.tsx` | **modified** (tracked) | `dsChangelogTable.ts`, `dsValueMeta.ts` (tracked) | ⚠️ с foundation styles |
| `pages/driver-color-tokens/index.html` | **modified** (tracked) | — | ✅ да (Roboto для Typography) |
| `pages/driver-color-tokens/App.tsx` | **modified** (tracked) | все 4 новых `*Page.tsx` | ❌ нет — сломает build без pages |
| `pages/driver-color-tokens/hubData.ts` | **modified** (tracked) | — | ⚠️ лучше с `App.tsx` + pages |
| `pages/driver-color-tokens/IconsPage.tsx` | **modified** (tracked) | — | ✅ да (icon selection UX, не блокирует token pages) |

**Уже tracked, без изменений (runtime deps, коммит не нужен):**

- `DsPageHeader.tsx`, `loadTokenChangelog.ts`, `dsValueMeta.ts`, `HubPage.tsx`
- `searchTokens.ts`, `searchIcons.ts`
- `scripts/sync-token-changelogs.mjs`
- `pages/driver-color-tokens/tokens/colors-semantic-changelog.json`, `icons-changelog.json` (mirrors)
- `tokens/colors-semantic-changelog.json`, `icons-changelog.json` (canonical)

---

### Group 2 — Token pages

| File | Git state | Depends on | Separate commit? |
|---|---|---|---|
| `pages/driver-color-tokens/TypographyPage.tsx` | **untracked** | `typographyData.ts`, `searchTypography.ts`, foundation, changelog | ⚠️ per-section OK |
| `pages/driver-color-tokens/typographyData.ts` | **untracked** | — | ⚠️ с `TypographyPage.tsx` |
| `pages/driver-color-tokens/searchTypography.ts` | **untracked** | `typographyData.ts` | ❌ только с Typography bundle |
| `pages/driver-color-tokens/SpacingPage.tsx` | **untracked** | `spacingData.ts`, `searchSpacing.ts`, foundation, changelog | ⚠️ per-section OK |
| `pages/driver-color-tokens/spacingData.ts` | **untracked** | — | ⚠️ с `SpacingPage.tsx` |
| `pages/driver-color-tokens/searchSpacing.ts` | **untracked** | `spacingData.ts` | ❌ только с Spacing bundle |
| `pages/driver-color-tokens/RadiusPage.tsx` | **untracked** | `radiusData.ts`, `searchRadius.ts`, foundation, changelog | ⚠️ per-section OK |
| `pages/driver-color-tokens/radiusData.ts` | **untracked** | — | ⚠️ с `RadiusPage.tsx` |
| `pages/driver-color-tokens/searchRadius.ts` | **untracked** | `radiusData.ts` | ❌ только с Radius bundle |
| `pages/driver-color-tokens/ShadowsPage.tsx` | **untracked** | `shadowsData.ts`, `searchShadows.ts`, foundation, changelog | ⚠️ per-section OK |
| `pages/driver-color-tokens/shadowsData.ts` | **untracked** | — | ⚠️ с `ShadowsPage.tsx` |
| `pages/driver-color-tokens/searchShadows.ts` | **untracked** | `shadowsData.ts` | ❌ только с Shadows bundle |

**Hard coupling:** `App.tsx` импортирует все 4 page components → **routing commit обязан включать все 4 pages или идти после них**.

---

### Group 3 — Changelog infrastructure

| File | Git state | Depends on | Separate commit? |
|---|---|---|---|
| `pages/driver-color-tokens/token-changelog-registry.json` | **untracked** | — | ❌ с `ensure-token-changelogs.mjs` |
| `pages/driver-color-tokens/scripts/ensure-token-changelogs.mjs` | **untracked** | `token-changelog-registry.json` | ❌ с registry |
| `pages/driver-color-tokens/package.json` | **modified** (tracked) | `ensure-token-changelogs.mjs` | ❌ с ensure script |
| `tokens/typography-sem-changelog.json` | **untracked** | registry bootstrap | ⚠️ с infra bundle |
| `tokens/spacing-sem-changelog.json` | **untracked** | registry bootstrap | ⚠️ с infra bundle |
| `tokens/radius-sem-changelog.json` | **untracked** | registry bootstrap | ⚠️ с infra bundle |
| `tokens/effects-shadows-changelog.json` | **untracked** | registry bootstrap | ⚠️ с infra bundle |
| `pages/driver-color-tokens/tokens/typography-sem-changelog.json` | **untracked** | canonical + `sync-token-changelogs.mjs` | ✅ optional (prebuild sync) |
| `pages/driver-color-tokens/tokens/spacing-sem-changelog.json` | **untracked** | canonical + sync | ✅ optional |
| `pages/driver-color-tokens/tokens/radius-sem-changelog.json` | **untracked** | canonical + sync | ✅ optional |
| `pages/driver-color-tokens/tokens/effects-shadows-changelog.json` | **untracked** | canonical + sync | ✅ optional |

**Pipeline:** `prebuild` → `ensure-token-changelogs.mjs` → `sync-token-changelogs.mjs`  
Ensure создаёт changelog **только если `pageFile` существует** — canonical JSON для 4 новых collections уже на диске; mirrors можно не коммитить, если prebuild всегда запускается перед build.

---

### Group 4 — Audit documentation

| File | Git state | Depends on | Separate commit? |
|---|---|---|---|
| `.cursor/audit-2026-08-15-ds-pipeline.md` | **untracked** | — | ✅ да |
| `.cursor/1audit-2026-08-15-driver-portal-review.md` | **untracked** | — | ✅ да (переименовать → `audit-2026-08-15-driver-portal-review.md`) |

Не влияют на runtime portal.

---

## Dependency graph (кратко)

```
token-changelog-registry.json
    └── ensure-token-changelogs.mjs
            └── package.json (prebuild)
                    └── tokens/*-changelog.json (canonical)
                            └── sync-token-changelogs.mjs
                                    └── pages/.../tokens/* (mirrors)

dsChangelogTable.ts
    └── ChangelogTable.tsx
    └── DriverColorTokensPage.tsx
    └── *Page.tsx (4 new)

typographyData.ts → TypographyPage.tsx → searchTypography.ts
spacingData.ts    → SpacingPage.tsx    → searchSpacing.ts
radiusData.ts     → RadiusPage.tsx     → searchRadius.ts
shadowsData.ts    → ShadowsPage.tsx    → searchShadows.ts

hubData.ts ──┐
App.tsx ─────┼── все 4 *Page.tsx (imports)
index.html ──┘   Roboto font для Typography
```

---

## Исключения / не забыть

**Среди изменений Driver portal ничего критичного не пропущено** — все runtime-файлы учтены.

**Дополнительно в modified, но не обязательно для 4 token pages:**

- `IconsPage.tsx` — selection mode из context menu (отдельная фича)

**Governance rules** (`.cursor/rules/ds-portal-table-standard.mdc`, `token-section-changelog.mdc`) документируют стандарты portal, но **не нужны для `npm run build`**. Рекомендуется отдельный docs/rules commit после portal.

**Mirrors** (`pages/driver-color-tokens/tokens/*` для 4 collections): можно не коммитить, если CI/local всегда запускает `prebuild`. Для clone-without-prebuild — включить в Group 3.

---

## Рекомендуемый порядок коммитов

### Вариант A — 5 commits (рекомендуется)

| # | Commit | Files | Message hint |
|---|---|---|---|
| **1** | Changelog infrastructure | `token-changelog-registry.json`, `scripts/ensure-token-changelogs.mjs`, `package.json`, 4× `tokens/*-changelog.json` | `feat(driver): add token changelog registry and bootstrap scripts` |
| **2** | Portal foundation (shared) | `dsChangelogTable.ts`, `ChangelogTable.tsx`, `DriverColorTokensPage.tsx`, `index.html` | `refactor(driver): unify portal table styles and changelog layout` |
| **3** | Token pages (all 4 sections) | 4× `*Page.tsx`, 4× `*Data.ts`, 4× `search*.ts`, `App.tsx`, `hubData.ts` | `feat(driver): add Typography, Spacing, Radius and Shadows token pages` |
| **4** | Icons UX (optional) | `IconsPage.tsx` | `feat(driver): add icon selection from context menu` |
| **5** | Audit docs (optional) | 2× `.cursor/audit-*.md` | `docs(audit): add DS pipeline and Driver portal review reports` |

**Commit 3 mirrors (optional add-on to #1 or #3):**  
4× `pages/driver-color-tokens/tokens/*-changelog.json`

---

### Вариант B — 8 commits (per-section granularity)

| # | Commit |
|---|---|
| 1 | Changelog infra (как выше) |
| 2 | Portal foundation (как выше) |
| 3 | Typography: `typographyData.ts` + `searchTypography.ts` + `TypographyPage.tsx` + partial `App.tsx`/`hubData.ts` |
| 4 | Spacing: аналогично |
| 5 | Radius: аналогично |
| 6 | Shadows: аналогично |
| 7 | Icons UX |
| 8 | Audit docs |

Каждый section-commit **должен обновлять `App.tsx` + `hubData.ts`**, иначе промежуточные commits не собираются.

---

### Вариант C — минимум 3 commits (strict bundle)

| # | Commit |
|---|---|
| 1 | Group 3 entire |
| 2 | Group 1 minus `App.tsx`/`hubData.ts` |
| 3 | Group 2 + `App.tsx` + `hubData.ts` |

---

## Блокеры merge (из audits, для commit plan)

1. **13 scope-файлов + 8 modified + 7 support untracked** — без bundle portal не merge-ready.
2. **`App.tsx` нельзя коммитить отдельно** от 4 `*Page.tsx`.
3. **`package.json` prebuild** бессмыслен без `ensure-token-changelogs.mjs` + registry.
4. **Changelog mirrors** — либо commit, либо гарантировать `prebuild` в CI.

---

## Summary counts

| Category | Modified | Untracked | Total |
|---|---|---|---|
| Portal foundation | 7 | 0 | 7 |
| Token pages | 0 | 12 | 12 |
| Changelog infra | 1 | 9 | 10 |
| Audit docs | 0 | 2 | 2 |
| **Driver portal total** | **8** | **23** | **31** |

---

*Git commands не выполнялись. Файлы не изменялись.*
