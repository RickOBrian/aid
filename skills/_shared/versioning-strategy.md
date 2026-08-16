---
description: >
  Стратегия версионирования токенов, компонентов и skills: SemVer,
  deprecation policy, release trains, cross-platform versioning.
destination: skills/_shared/
name: versioning-strategy
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Versioning Strategy

## Purpose

Этот гайд описывает стратегию версионирования артефактов дизайн-системы aid: когда и как применять SemVer, как группировать изменения в release, и как согласовывать версии между платформами. Стратегия дополняет `docs/semver-guide.md` (правила bump) и `changelog-guide.md` (формат записей) — не заменяет их.

Версия — контракт между дизайном, разработкой, QA и потребителями артефакта. SemVer и changelog фиксируются **только на release boundary** — после явного подтверждения через Release Gate, не во время implementation.

---

## Relationship to other guides

| Гайд | Связь |
|---|---|
| `docs/semver-guide.md` | Базовый SemVer: MAJOR / MINOR / PATCH, зависимости Core → Semantic, Component → Component |
| `changelog-guide.md` | Структура changelog entries, pending → released workflow |
| `.cursor/rules/release-gate.mdc` | Release plan, группировка pending, финализация версий |
| `component-standards.md` | SemVer для компонентов (props, variants, states) |
| `token-rules.md` | Единицы версионирования токенов (Core / Semantic), запрет component-level tokens |
| `naming-conventions.md` | Имена artifact/collection (`Colors/Semantic`, `colors-semantic-changelog.json`) |
| `.cursor/rules/product-context.mdc` | Product-scoped pending queue `changes/<id>/pending/` |

---

## SemVer for tokens

Каждая **token collection** — независимая единица версионирования. Driver collections:

| Collection | Artifact | Changelog |
|---|---|---|
| Colors/Semantic | `Colors/Semantic` | `tokens/colors-semantic-changelog.json` |
| Typography/Semantic | `Typography/Semantic` | `tokens/typography-sem-changelog.json` |
| Spacing/Semantic | `Spacing/Semantic` | `tokens/spacing-sem-changelog.json` |
| Radius/Semantic | `Radius/Semantic` | `tokens/radius-sem-changelog.json` |
| Effects/Shadows | `Effects/Shadows` | `tokens/effects-shadows-changelog.json` |
| Icons | `Icons/Wilhelm` | `tokens/icons-changelog.json` |

Core-уровень (`Colors/Core`, `Spacing/Core` и т.д.) версионируется отдельно, когда Core-гайды или Core JSON существуют в product scope. Semantic ссылается на Core — см. зависимости ниже.

### MAJOR — breaking change

- Токен **удалён** или **переименован**
- Изменён **смысл** semantic-токена (role/category), не только значение
- Удалена секция collection или mode support без backward-compatible alias
- Core MAJOR → обязательный Semantic MAJOR той же итерации

### MINOR — new functionality

- Добавлен новый semantic token
- Добавлена новая секция collection (например новая категория `bg-component`)
- Добавлена поддержка Dark Mode / нового mode в существующей collection
- Добавлены новые иконки в `icons` collection

### PATCH — fix

- Исправлено значение (hex, px, radius) **без** rename и без смены смысла
- Исправлена опечатка в description / docs
- Visual correction, не меняющая API потребителя

### Примеры по коллекциям

| Collection | Change | Bump | Пример |
|---|---|---|---|
| **Colors/Semantic** | Удалён `text-deprecated-secondary` | MAJOR | `1.1.1` → `2.0.0` |
| **Colors/Semantic** | Добавлен `bg-accent-states-hover` | MINOR | `1.0.0` → `1.1.0` |
| **Colors/Semantic** | Fix hex `bg-accent-main` day | PATCH | `1.1.0` → `1.1.1` |
| **Typography/Semantic** | Добавлен `label-xs-weight-strong` | MINOR | `1.0.0` → `1.1.0` |
| **Typography/Semantic** | Rename `body-m` → `body-md` | MAJOR | `1.2.0` → `2.0.0` |
| **Spacing/Semantic** | Добавлен `space-140` | MINOR | `1.0.0` → `1.1.0` |
| **Spacing/Semantic** | Fix `space-16`: 15px → 16px | PATCH | `1.1.0` → `1.1.1` |
| **Radius/Semantic** | Добавлен `radius-pill` | MINOR | `1.0.0` → `1.1.0` |
| **Effects/Shadows** | Изменена структура shadow stack (breaking) | MAJOR | `1.0.0` → `2.0.0` |
| **Effects/Shadows** | Fix blur radius `shadow-3` | PATCH | `1.0.0` → `1.0.1` |
| **Icons** | +10 новых иконок | MINOR | `2.0.0` → `2.1.0` |
| **Icons** | Изменена геометрия используемой иконки | MAJOR | `2.1.0` → `3.0.0` |

### Core → Semantic dependency

```
Colors/Core:     v1.0.0 → v2.0.0   (MAJOR: удалён color-blue-400)
Colors/Semantic: v1.3.0 → v2.0.0   (MAJOR: обязательно, синхронно)
```

Правило распространяется на `Spacing`, `Radius`, `Typography` и другие типы токенов — см. `docs/semver-guide.md`.

---

## SemVer for components

Каждый компонент (`Switch`, `ButtonText`, `BadgeStatus`) — **независимая**
единица версионирования, отдельно от token collections.

Driver artifact paths (review sandbox while `componentsRoot: null`):

| Concern | Path |
|---|---|
| Changelog | `components/{componentId}-changelog.json` |
| Metadata | `pages/driver-color-tokens/components/{id}.meta.json` |
| Registry | `pages/driver-color-tokens/component-registry.json` |
| Pending | `changes/driver/pending/component-*.json` |

Reference component: **Switch** (`componentId: switch`, route `/components/switch`,
`currentVersion: null`, pending initial release → `1.0.0`).

### MAJOR — breaking change

- Компонент удалён или переименован
- Обязательный prop удалён или изменён тип
- Prop переименован (`type` → `variant`)
- Variant или state удалён
- Структура слотов breaking (`leading` → `start`)
- Зависимый компонент после breaking change в parent — MAJOR синхронно

### MINOR — new functionality

- Новый компонент (первый релиз — `1.0.0`, последующие additions — MINOR)
- Новый optional prop
- Новый variant или state (backward-compatible)
- Новый slot (optional)

### PATCH — fix

- Visual fix без изменения props API
- A11y fix без изменения public API
- Docs / story update

### Примеры

| Change | Bump |
|---|---|
| `ButtonText`: prop `type` → `variant` | `1.1.0` → `2.0.0` (MAJOR) |
| `ButtonText`: variant `destructive` added | `1.0.0` → `1.1.0` (MINOR) |
| `ButtonText`: fix hover color mapping | `1.1.0` → `1.1.1` (PATCH) |
| `FieldCheckbox` после MAJOR в `Checkbox` | `1.2.0` → `2.0.0` (MAJOR, sync) |

---

## SemVer for skills

Skills в `skills/_shared/` версионируются через **`metadata.version` во frontmatter** и optional changelog section в конце файла. Отдельный skills changelog file — TBD (см. `changelog-guide.md`).

### Когда skills требуют версионирования

| Требует bump | Не требует bump |
|---|---|
| Новое правило / раздел, меняющий поведение агентов | Typo fix без смысловых изменений |
| Breaking rename термина или структуры гайда | Formatting-only правки |
| Удаление или переименование обязательного workflow step | Internal cross-link fix |
| MAJOR изменение token/component standards | Comment-only правки |

### MAJOR / MINOR / PATCH для skills

| Type | Пример |
|---|---|
| **MAJOR** | Удалён уровень Component tokens из `token-rules.md`; смена формулы нейминга компонентов |
| **MINOR** | Новый раздел «Token coupling» в `component-standards.md`; новый гайд `figma-import-guide.md` v1.0.0 |
| **PATCH** | Уточнение формулировки без изменения правил; fix ссылки на path |

Skills release проходит через Release Gate как **Skills release** — pending item в `changes/<id>/pending/`, финальный bump с подтверждением пользователя.

---

## Deprecation policy

Deprecation — мост между backward-compatible coexistence и MAJOR removal. Не удалять токены/components/props без deprecation window, кроме явного emergency fix с user approval.

### Как объявлять deprecation

1. **Pending change item** с типом `deprecated` и migration path.
2. **Changelog entry** на release boundary:
   - `kind: "changed"` или dedicated deprecation note
   - Указать replacement: `text-deprecated-secondary` → use `text-secondary`
3. **In-code / in-spec marker** (когда implementation существует):
   - Web: `@deprecated` JSDoc + console.warn в dev
   - iOS/Android: `@available(*, deprecated, message: "...")` / `@Deprecated`
4. **Documentation**: Presentbook / spec page — banner «Deprecated since vX.Y.Z»

### Timeline: deprecation → removal

| Phase | Duration | Action |
|---|---|---|
| **Announce** | Release N (MINOR) | Deprecation notice + replacement documented |
| **Coexist** | ≥ 1 release cycle (рекомендация: 2 sprints / 4–8 weeks) | Old + new API both work |
| **Remove** | Release N+1 (MAJOR) | Removal in changelog `kind: "removed"` |

Emergency removal (security, legal) — MAJOR без полного window, с explicit user approval и migration guide.

### Communication strategy

| Audience | Channel |
|---|---|
| Design | Figma description + DS changelog |
| Web/iOS/Android devs | Changelog entry + migration snippet in release notes |
| AI agents | Updated skill/guide + `DS_PIPELINE_CONTEXT.md` if structural |
| QA | Fixed version under test — deprecated API still tested until removal release |

---

## Release trains

Release train — группа pending changes, финализируемых в одном release boundary. Не смешивать unrelated artifacts в одном commit без явного combined release request.

### Workflow (pending → released)

```
Implementation tasks
    ↓
changes/<id>/pending/   (one item per logical change)
    ↓
Release Gate — explicit user request
    ↓
Group by artifact → propose SemVer + changelog
    ↓
User confirms each bump
    ↓
Update changelog files + move pending → released/
    ↓
Release commit (release files only) → push via git-push.mdc
```

### Token release

- Scope: one or more token collections (`spacing-sem`, `colors-semantic`, …)
- Artifacts: `tokens/*-changelog.json`, `currentVersion` bump
- Driver mirror: `pages/driver-color-tokens/tokens/` (prebuild sync)
- **Не менять** token values during release — только changelog metadata

### Component release

- Scope: one or more components
- Artifacts: `components/*-changelog.json`, `{id}.meta.json`, registry
- Coupling: verify token dependencies already released or included in same train
- **Do not bump** `currentVersion` or append `entries` during implementation

### Combined release

- Scope: tokens + components (+ skills) in one train
- Group pending items by artifact; **independent SemVer per artifact**
- Propose combined release plan — user confirms each group
- Typical: token MINOR first, then component MINOR consuming new tokens

### Release train rules

| Rule | Rationale |
|---|---|
| One artifact — one logical version bump per release | Avoid ambiguous changelog |
| Highest bump wins within artifact group | 2 PATCH + 1 MINOR → MINOR |
| MAJOR blocks silent combine with unrelated PATCH | Breaking changes need explicit OK |
| Separate commits for rules / skills / release bundles | Repo convention |
| No cross-product release without explicit request | Product isolation |

---

## Cross-platform versioning

Semantic token names и component API contracts **единые** на Web, iOS и Android. Platform-specific детали — в реализации, не в отдельной версии semantic collection.

### Shared version (default)

| Artifact | Cross-platform rule |
|---|---|
| **Semantic tokens** | Одна версия collection (`Colors/Semantic v1.1.0`) для всех платформ |
| **Component spec** | Одна версия компонента в DS spec |
| **Skills / guides** | Одна `metadata.version` |

### Platform-specific tokens

Токены с суффиксами `-ios`, `-android` — часть **той же** semantic collection version:

- `bg-accent-states-focused-ios` добавлен → `Colors/Semantic` MINOR для всех платформ
- Web не использует `-ios`/`-android` tokens — это не отдельная версия collection

### When platform versions diverge

Допустимо расхождение **implementation lag**, не artifact version:

| Situation | Versioning |
|---|---|
| Web `ButtonText v1.1.0` shipped; iOS still on v1.0.0 | Component version в spec — `1.1.0`; iOS backlog item, не `ButtonText-iOS v1.1.0` |
| iOS-only focused state implemented | Same `ButtonText` MINOR; platform gap tracked in pending/backlog |
| Android ripple token used | `bg-accent-states-ripple-android` in shared `Colors/Semantic` changelog |
| Platform bugfix without API change | PATCH той же component version на affected platform |

**Anti-pattern:** отдельные SemVer для `ButtonText-Web`, `ButtonText-iOS` — используй единую spec version + platform implementation status.

### Platform state matrix (version-neutral)

| State | Web | iOS | Android |
|---|---|---|---|
| hover | ✅ | — | — |
| ripple | — | — | ✅ |
| focused-ios | — | ✅ | — |

Добавление platform-only state — MINOR component + optional semantic token с platform suffix.

---

## Examples

### Token version entry

```json
{
  "artifact": "Spacing/Semantic",
  "currentVersion": "1.1.0",
  "entries": [
    {
      "version": "1.1.0",
      "date": "2026-08-15",
      "author": "sergej",
      "type": "minor",
      "changes": [
        {
          "kind": "added",
          "description": "Добавлен space-140 для extended layout grid"
        }
      ]
    },
    {
      "version": "1.0.0",
      "date": "2026-08-11",
      "author": "sergej",
      "type": "minor",
      "changes": [
        {
          "kind": "added",
          "description": "Первичный набор spacing semantic tokens из Figma"
        }
      ]
    }
  ]
}
```

Bump rule: `1.0.0` → `1.1.0` (MINOR: new token).

### Component version entry (future)

```json
{
  "artifact": "ButtonText",
  "currentVersion": "2.0.0",
  "entries": [
    {
      "version": "2.0.0",
      "date": "2026-09-01",
      "author": "sergej",
      "type": "major",
      "changes": [
        {
          "kind": "removed",
          "description": "Prop `type` удалён — используйте `variant`"
        },
        {
          "kind": "changed",
          "description": "Migration: type=\"primary\" → variant=\"primary\""
        }
      ]
    },
    {
      "version": "1.1.0",
      "date": "2026-08-20",
      "author": "sergej",
      "type": "minor",
      "changes": [
        {
          "kind": "added",
          "description": "Variant destructive для danger actions"
        }
      ]
    }
  ]
}
```

### Deprecation notice

**Pending item** (`changes/driver/pending/2026-08-15-deprecate-text-secondary-old.json`):

```json
{
  "artifact": "Colors/Semantic",
  "type": "deprecation",
  "target": "text-secondary-old",
  "replacement": "text-secondary",
  "removalPlanned": "2.0.0",
  "message": "text-secondary-old deprecated since 1.2.0; removal in 2.0.0"
}
```

**Changelog entry** (release N, MINOR):

```json
{
  "kind": "changed",
  "description": "DEPRECATED: text-secondary-old — use text-secondary. Removal planned in v2.0.0"
}
```

**Changelog entry** (release N+1, MAJOR):

```json
{
  "kind": "removed",
  "description": "Removed text-secondary-old (deprecated since v1.2.0). Use text-secondary"
}
```

---

## Anti-patterns

| Anti-pattern | Почему плохо |
|---|---|
| Bump version during implementation | Нарушает release boundary |
| Silent PATCH for token rename | Rename = MAJOR |
| Core MAJOR without Semantic MAJOR | Broken dependency contract |
| Combined version for all tokens | Collections version independently |
| Platform-specific artifact versions | Fragmentation; use implementation lag tracking |
| Deprecation without replacement | Blocks migration |
| Immediate removal without window | Breaks consumers without notice |
| Changelog without pending item | No audit trail |
| `FigmaStyles` as version source | Reference-only |

---

## Changelog

- **1.0.0** — 2026-08-15. Первая версия: SemVer для tokens/components/skills, deprecation policy, release trains, cross-platform versioning, examples.
