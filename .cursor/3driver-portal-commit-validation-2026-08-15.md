---
date: 2026-08-15
scope: driver
type: commit-bundle-validation
mode: read-only
---

# Финальная валидация commit bundles — Driver portal

**Commit plan:** `.cursor/2driver-portal-commit-plan-2026-08-15.md`  
**Build сейчас:** ✅ `npm run build` passed (70 modules)

---

## 3. Фактические пути

| Artifact | Path | Git state |
|---|---|---|
| **ensure script** | `pages/driver-color-tokens/scripts/ensure-token-changelogs.mjs` | untracked |
| **sync script** | `pages/driver-color-tokens/scripts/sync-token-changelogs.mjs` | **tracked** (без изменений) |
| **registry** | `pages/driver-color-tokens/token-changelog-registry.json` | untracked |
| **canonical changelogs** | `tokens/{typography-sem,spacing-sem,radius-sem,effects-shadows}-changelog.json` | untracked (4 new) |
| | `tokens/colors-semantic-changelog.json`, `tokens/icons-changelog.json` | tracked (уже в repo) |
| **mirror changelogs** | `pages/driver-color-tokens/tokens/{typography-sem,spacing-sem,radius-sem,effects-shadows}-changelog.json` | untracked (4 new) |
| | `pages/driver-color-tokens/tokens/colors-semantic-changelog.json`, `icons-changelog.json` | tracked |

**prebuild** (`package.json`):

```json
"prebuild": "node scripts/ensure-token-changelogs.mjs && node scripts/sync-token-changelogs.mjs"
```

---

## 4–6. Проверка bundles (Plan Groups vs Variant A)

> В commit plan **Group 1 = foundation**, **Group 2 = token pages**, **Group 3 = changelog**.  
> Вопросы 4–6 логичнее сопоставлять с **Variant A commit order** (#1 infra → #2 foundation → #3 pages).

| Check | Target | Result |
|---|---|---|
| **Q4:** prebuild dependencies | Plan **Group 3** / Variant A **Commit 1** | ✅ complete (см. ниже) |
| **Q4:** prebuild in Plan **Group 1** | foundation | ❌ **не содержит** — by design |
| **Q5:** не ломает build | Plan **Group 2** alone (без App) | ✅ OK на текущем HEAD App |
| **Q5:** Variant A **Commit 2** | foundation 4 files | ✅ build OK |
| **Q6:** App imports | Plan **Group 2** + App/hub | ⚠️ **App/hub не в таблице Group 2** — нужно добавить |
| **Q6:** Variant A **Commit 3** | 14 files | ✅ complete |

---

## 7. Валидация по bundles

### Plan Group 1 — Portal foundation

**Proposed files (7):**

```
pages/driver-color-tokens/dsChangelogTable.ts       [modified]
pages/driver-color-tokens/ChangelogTable.tsx        [modified]
pages/driver-color-tokens/DriverColorTokensPage.tsx [modified]
pages/driver-color-tokens/index.html                  [modified]
pages/driver-color-tokens/App.tsx                     [modified]  ← проблема
pages/driver-color-tokens/hubData.ts                  [modified]  ← проблема
pages/driver-color-tokens/IconsPage.tsx               [modified]  ← optional
```

| | |
|---|---|
| **Missing dependencies** | Нет (runtime deps tracked: `dsValueMeta.ts`, `DsPageHeader.tsx`, `loadTokenChangelog.ts`) |
| **Extra files** | `App.tsx`, `hubData.ts` — не foundation-only; `IconsPage.tsx` — отдельная фича |
| **Standalone commit?** | ⚠️ **Частично** — только 4 файла (dsChangelogTable + ChangelogTable + DriverColorTokensPage + index.html). **С App.tsx — ❌** (импортирует 4 untracked pages) |

**Variant A Commit 2 (исправленный Group 1):** ✅ safe standalone

---

### Plan Group 2 — Token pages

**Proposed files (12) — без routing:**

```
TypographyPage.tsx    + typographyData.ts    + searchTypography.ts
SpacingPage.tsx       + spacingData.ts       + searchSpacing.ts
RadiusPage.tsx        + radiusData.ts        + searchRadius.ts
ShadowsPage.tsx       + shadowsData.ts       + searchShadows.ts
```

**+ обязательные для working portal (missing из таблицы plan):**

```
App.tsx      [modified]
hubData.ts   [modified]
```

| | |
|---|---|
| **Missing dependencies** | `App.tsx`, `hubData.ts`; runtime: `ChangelogTable.tsx`, `dsChangelogTable.ts`, `DsPageHeader.tsx`, `loadTokenChangelog.ts` (tracked / из Commit 2); changelog JSON (из Group 3) |
| **Extra files** | none |
| **Standalone commit?** | ❌ **12 files alone** — OK для build **только если App.tsx не коммитится**. ✅ **14 files (+ App + hub)** — OK после Commit 2 + Commit 1 |

**App.tsx imports — все покрыты в Commit 3:**

| Import | File | In bundle? |
|---|---|---|
| `TypographyPage` | untracked | ✅ |
| `SpacingPage` | untracked | ✅ |
| `RadiusPage` | untracked | ✅ |
| `ShadowsPage` | untracked | ✅ |
| `HUB_ROUTES` from `hubData` | modified | ✅ (нужен в bundle) |

**Per-page data/search chain:** ✅ 4/4 complete

---

### Plan Group 3 — Changelog infrastructure

**Proposed files (10):**

```
pages/driver-color-tokens/token-changelog-registry.json
pages/driver-color-tokens/scripts/ensure-token-changelogs.mjs
pages/driver-color-tokens/package.json
tokens/typography-sem-changelog.json
tokens/spacing-sem-changelog.json
tokens/radius-sem-changelog.json
tokens/effects-shadows-changelog.json
pages/driver-color-tokens/tokens/typography-sem-changelog.json   [optional]
pages/driver-color-tokens/tokens/spacing-sem-changelog.json    [optional]
pages/driver-color-tokens/tokens/radius-sem-changelog.json       [optional]
pages/driver-color-tokens/tokens/effects-shadows-changelog.json  [optional]
```

| | |
|---|---|
| **Missing dependencies** | `sync-token-changelogs.mjs` — **не в bundle, но tracked в repo** ✅ достаточно |
| **Extra files** | 4 mirrors — optional если prebuild в CI |
| **Standalone commit?** | ✅ **Да** — 7 core files (registry + ensure + package.json + 4 canonical). Build не ломает. prebuild работает |

**prebuild closure:**

| Dependency | In Group 3? | Status |
|---|---|---|
| `ensure-token-changelogs.mjs` | ✅ | untracked |
| `token-changelog-registry.json` | ✅ | untracked (ensure reads it) |
| `sync-token-changelogs.mjs` | ⚠️ not in bundle | tracked, exists |
| `tokens/*-changelog.json` (canonical) | ✅ 4 new + 2 existing | OK |

---

### Plan Group 4 — Audit docs

```
.cursor/audit-2026-08-15-ds-pipeline.md
.cursor/1audit-2026-08-15-driver-portal-review.md
```

| | |
|---|---|
| **Standalone commit?** | ✅ Да, без runtime impact |

---

### Optional — IconsPage.tsx

```
pages/driver-color-tokens/IconsPage.tsx  [modified]
```

| | |
|---|---|
| **Missing** | none |
| **Standalone?** | ✅ Да |

---

## 8. Отдельные решения

### Mirrors в Git?

| Strategy | When |
|---|---|
| **Не коммитить mirrors** | CI/local всегда `npm run prebuild` перед build — **достаточно canonical** в `tokens/` |
| **Коммитить mirrors** | clone без prebuild, dev без скриптов — **безопаснее для onboarding** |

**Рекомендация:** коммитить **canonical** обязательно; mirrors — optional, но для Driver portal **лучше включить в Commit 1** (Group 3) или явно задокументировать prebuild в CI.

`loadTokenChangelog` читает оба пути (`../../tokens/` + `./tokens/`) — vite embed at build time; prebuild sync гарантирует mirrors перед bundle.

---

### IconsPage.tsx — основная portal feature?

**Нет.** Это **отдельная UX-фича** (selection mode из context menu). Не блокирует Typography/Spacing/Radius/Shadows.  
**Рекомендация:** Variant A **Commit 4** — отдельно от token pages expansion.

---

### Какой вариант коммитов безопаснее?

| Variant | Commits | Safety | Notes |
|---|---|---|---|
| **A** | 5 | ✅ **Safest** | Правильный порядок deps; каждый commit buildable |
| **C** | 3 | ✅ Good | Меньше granularity, тот же dependency order |
| **B** | 8 | ⚠️ Riskier | Каждый section-commit **обязан** обновлять App+hub; легко сломать промежуточный build |

**Рекомендуется Variant A:**

```
Commit 1: Group 3 core (7 files) + optional 4 mirrors
Commit 2: Group 1 minus App/hub/Icons (4 files)
Commit 3: Group 2 + App.tsx + hubData.ts (14 files)
Commit 4: IconsPage.tsx (optional)
Commit 5: audit docs (optional)
```

---

## Findings — расхождения plan vs reality

| # | Issue | Severity |
|---|---|---|
| 1 | Plan **Group 1** включает `App.tsx`/`hubData.ts` — **ломает standalone commit** | 🔴 fix bundle |
| 2 | Plan **Group 2** не перечисляет `App.tsx`/`hubData.ts` — **incomplete для working portal** | 🔴 add to Commit 3 |
| 3 | Q4 «Group 1 = prebuild» — prebuild живёт в **Group 3**, не Group 1 | ℹ️ naming |
| 4 | `sync-token-changelogs.mjs` не в untracked bundle — OK, уже tracked | ✅ |
| 5 | Plan Group 1 label ≠ Variant A Commit 2 — использовать Variant A для execution | ℹ️ |

---

## Summary

| Bundle | Files | Standalone safe? | Build safe? |
|---|---|---|---|
| Group 3 / Commit 1 | 7 (+4 mirrors opt) | ✅ | ✅ |
| Group 1 / Commit 2 | 4 (без App/hub/Icons) | ✅ | ✅ |
| Group 2 / Commit 3 | 14 (+ App/hub) | ✅ после 1+2 | ✅ |
| Icons / Commit 4 | 1 | ✅ | ✅ |
| Audit / Commit 5 | 2 | ✅ | ✅ |

**Plan Group 1 as documented (7 files with App): ❌ not safe standalone.**  
**Variant A corrected order: ✅ validated, build passes on current tree.**

---

*Git add/commit не выполнялись. Файлы не изменялись.*
