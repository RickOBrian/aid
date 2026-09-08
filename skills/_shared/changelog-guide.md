---
description: >
  Гайд changelog: структура, workflow pending → released,
  SemVer, product-scoped changelogs для токенов и компонентов.
destination: skills/_shared/
name: changelog-guide
metadata:
  version: "1.0.0"
  owner: design-system-team
---

# Changelog Guide

## Purpose

Этот гайд описывает, как вести changelog для токенов, компонентов и skills в product-scoped pipeline: формат записей, когда обновлять changelog, и как pending changes превращаются в финальные SemVer entries на release boundary.

Changelog — контракт между дизайном, разработкой и release. Запись в changelog без release approval — anti-pattern.

---

## Relationship to other guides

| Артефакт | Связь |
|---|---|
| `docs/semver-guide.md` | MAJOR / MINOR / PATCH для каждого артефакта |
| `.cursor/rules/release-gate.mdc` | Release boundary: group pending → SemVer + changelog |
| `.cursor/rules/product-context.mdc` | Product-scoped pending items в `changes/<id>/pending/` |
| `.cursor/rules/token-style-changelog-gate.mdc` | Анкета перед изменением токена (artifact, bump type) |
| `pages/driver-color-tokens/token-changelog-registry.json` | Реестр collection changelogs (Driver) |

---

## Changelog types

| Тип | Файл / location | Status |
|---|---|---|
| **Token collection** | `tokens/colors-semantic-changelog.json`, … | ✅ Driver |
| **Component** | `components/{componentId}-changelog.json` + `pages/driver-color-tokens/components/{id}.meta.json` | ✅ Driver (review sandbox; `componentsRoot: null`) |
| **Skills** | TBD (`metadata.version` in frontmatter + optional changelog file) | 🔜 |

Mirror для Driver portal: `pages/driver-color-tokens/tokens/` (sync prebuild).

---

## Changelog structure

### Обязательные поля (token collection)

```json
{
  "artifact": "Colors/Semantic",
  "currentVersion": "1.0.0",
  "entries": [
    {
      "version": "1.0.0",
      "date": "2026-08-11",
      "author": "sergej",
      "type": "minor",
      "changes": [
        {
          "kind": "added",
          "description": "Первичный набор semantic color tokens из Figma"
        }
      ]
    }
  ]
}
```

| Поле | Назначение |
|---|---|
| `artifact` | Единица версионирования (Colors/Semantic, Spacing/Semantic) |
| `currentVersion` | Текущая версия collection |
| `entries[].version` | SemVer entry |
| `entries[].date` | ISO date |
| `entries[].author` | Author |
| `entries[].type` | `major` / `minor` / `patch` |
| `changes[].kind` | `added` / `changed` / `removed` / `fixed` / `deprecated` |
| `changes[].description` | Human-readable description |

### Формат записей

| kind | Когда использовать |
|---|---|
| `added` | Новый токен, variant, component, skill |
| `changed` | Изменено значение или behavior без breaking API |
| `removed` | Удалён токен / component / variant (обычно MAJOR) |
| `fixed` | Bug fix, visual correction без API change |
| `deprecated` | Public API marked deprecated; removal planned in future MAJOR |

### Component changelog (Product DS Components)

Independent from token collections. One changelog file per component.

```json
{
  "artifact": "Switch",
  "componentId": "switch",
  "product": "driver",
  "currentVersion": null,
  "releaseStatus": "pending",
  "reviewRoute": "/components/switch",
  "entries": []
}
```

| Field | Назначение |
|---|---|
| `componentId` | Registry slug (`switch`) |
| `currentVersion` | Last **released** version; `null` until first Release Gate |
| `releaseStatus` | `pending` until first Release Gate; `released` after |
| `reviewRoute` | Presentbook sandbox route |
| `entries[].impact` | `initial` for first release; then `major` / `minor` / `patch` |
| `entries[].type` | First release: `"added"`; later entries follow SemVer bump type |
| `entries[].changes[].relatedTokenChanges` | Optional linked token release ids |

**Portal UI is not versioned.** `ChangelogTable`, `ComponentReleaseStatus`, and
`dsChangelogTable.ts` styles are portal primitives — reuse for display, do not
treat as Product DS Components.

During implementation: `currentVersion` stays `null` for unreleased components
(or at last released value after first release); pending work lives in
`changes/<id>/pending/` only.

## When to update changelog

### Требует changelog entry

- Новый semantic token или collection section
- Изменение token value (hex, spacing number, radius)
- Новый component или variant
- Breaking rename / removal
- MAJOR / MINOR / PATCH bump по `docs/semver-guide.md`

### Не требует changelog entry

- Typo fix в docs / comments без изменения values
- Refactor без изменения public API или token values
- Portal UI styling (table headers, layout) без token change
- Internal script changes

> Cosmetic portal changes — не token artifact. Token value change — всегда pending item, даже если UI не менялся.

---

## Changelog workflow

```
Implementation task
    ↓
Pending change item → changes/<id>/pending/
    ↓
(repeat for each change)
    ↓
Release Gate (explicit user request)
    ↓
Group pending by artifact
    ↓
Propose SemVer + changelog entry → user confirms
    ↓
Update tokens/*-changelog.json (or component/skills changelog)
    ↓
Move pending → changes/<id>/released/
    ↓
Commit release files only → push via git-push.mdc
```

### Во время реализации

- **Не** писать в `tokens/*-changelog.json` напрямую.
- **Не** bump `currentVersion` без release approval.
- Создавать pending change item в `changes/<id>/pending/`.

### На release boundary

- Группировать pending items по artifact (collection, component, skill).
- Propose SemVer bump — см. `docs/semver-guide.md`.
- Показать proposed changelog entry — user confirms.
- Update changelog file + move pending → released.

---

## Product-scoped changelogs

### Driver

| Resource | Path |
|---|---|
| Token values | `pages/driver-color-tokens/data.ts`, `*Data.ts` |
| Changelog files | `tokens/colors-semantic-changelog.json`, … |
| Registry | `pages/driver-color-tokens/token-changelog-registry.json` |
| Pending queue | `changes/driver/pending/` |
| Released queue | `changes/driver/released/` |
| Component registry | `pages/driver-color-tokens/component-registry.json` |
| Component metadata | `pages/driver-color-tokens/components/*.meta.json` |
| Component changelogs | `components/*-changelog.json` |

### Другие продукты

Каждый продукт в `products/registry.json` имеет свой `releaseRoot`. Changelog paths — из `products/<id>/product.json`. Не смешивать changelog entries разных продуктов.

---

## Examples

### Token — added (MINOR)

```json
{
  "kind": "added",
  "description": "Добавлен space-140 в spacing-sem (Figma spacing table)"
}
```

Bump: `1.0.0` → `1.1.0`

### Token — changed (PATCH)

```json
{
  "kind": "fixed",
  "description": "Исправлен hex bg-accent-main day mode: #0057FF → #0056FF"
}
```

Bump: `1.1.0` → `1.1.1`

### Token — removed (MAJOR)

```json
{
  "kind": "removed",
  "description": "Удалён text-deprecated-secondary — заменён на text-secondary"
}
```

Bump: `1.1.1` → `2.0.0`

### Component — initial release (Release Gate only)

Pending item during implementation (`proposedSemVerImpact: "initial"`,
`proposedVersion: "1.0.0"`, `changeType: "added"`); first release entry:

```json
{
  "version": "1.0.0",
  "date": "2026-08-16",
  "author": "sergej",
  "type": "added",
  "impact": "initial",
  "changes": [
    {
      "kind": "added",
      "description": "Switch: Surface View on/off control; states checked, loading, disabled; Web"
    }
  ]
}
```

Sets `currentVersion: "1.0.0"` — unreleased components keep `currentVersion: null`.

### Skills — changed (PATCH)

```json
{
  "kind": "changed",
  "description": "component-standards: добавлен раздел Token coupling"
}
```

---

## Anti-patterns

| Anti-pattern | Почему плохо |
|---|---|
| Changelog entry без pending item | Нет audit trail |
| Bump version during implementation | Нарушает release boundary |
| Mixed product entries in one changelog | Product isolation violation |
| `kind: changed` для breaking rename | Должен быть `removed` + `added` или MAJOR `changed` |
| Changelog в commit с unrelated files | Один artifact — один commit |
| Using `FigmaStyles` values in changelog | Reference-only source |
| Abstract names (`color-changelog.json`) | Use actual names (`colors-semantic-changelog.json`) |
