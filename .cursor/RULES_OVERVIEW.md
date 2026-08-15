# Cursor Rules Overview — Design System Pipeline

## Purpose

Этот набор правил формализует pipeline дизайн-системы в Cursor: от Figma и импорта до токенов, компонентов, skills и release. Правила защищают от «тихих» изменений — когда агент сам выбирает продукт, хардкодит значения, создаёт файлы вне scope или сразу пишет SemVer/changelog без согласования. Каждый gate требует явного product context и останавливает работу на анкете, пока пользователь не подтвердит следующий шаг.

## Products context

- **active/onboarding продукты:** `driver` (`aid: driver`, status: `active`) — единственный продукт в pipeline; `onboarding`-продуктов в registry пока нет.
- **Driver:**
  - токены: `pages/driver-color-tokens/*Data.ts` (`data.ts`, `typographyData.ts`, `spacingData.ts`, `radiusData.ts`, `shadowsData.ts`, `iconsData.ts`);
  - `componentsRoot: null`, `componentsStatus: "not_started"` — канонической директории компонентов пока нет;
  - skills: дефолтное назначение импорта — `skills/_shared/` (product-scoped skills не созданы);
  - release-очереди: `changes/driver/pending/` (pending changes) и `changes/driver/released/` (обработанные release);
  - changelog: `tokens/*-changelog.json` + реестр `pages/driver-color-tokens/token-changelog-registry.json`;
  - reference-only: `src/pages/FigmaStyles/` (не source of truth).

**Исторические продукты** (`ui-kit-a`, `ui-kit-b`, `sutochno`, `design-system`) — status `stable`/`legacy`; не участвуют в pipeline без явного запроса.

---

## Rules list

### 1. Product Context Gate (`product-context.mdc`)

- **When it applies:** Любая работа с Figma, токенами, стилями, компонентами, Presentbook sandbox, changelog или release artifacts.
- **What it enforces:**
  - Читать `products/registry.json` и работать только с `active`/`onboarding` продуктами.
  - Разрешать продукт по явному имени → пути → контексту файла → Figma → единственному eligible продукту.
  - Показывать блок подтверждения product context до начала реализации.
  - Изолировать данные продуктов: не смешивать токены/компоненты разных продуктов.
  - Записывать изменения в `changes/<id>/pending/`; SemVer/changelog — только на release boundary.
- **Key artifacts:** `products/registry.json`, `products/<id>/product.json`, `changes/<id>/pending/`, `changes/<id>/released/`.
- **Example dialog:**
  ```
  ## Product context
  Product: aid: driver (`driver`)
  Status: active
  Token source: pages/driver-color-tokens
  Components: not created yet
  Presentbook: pages/driver-color-tokens
  Release queue: changes/driver

  Continue in this scope.
  Confirm this product or specify another.
  ```

### 2. Token Integrity Gate (`token-integrity.mdc`)

- **When it applies:** Использование, добавление или изменение design tokens и visual styles; любая реализация, где нужны token values (компоненты, sandbox, Figma import).
- **What it enforces:**
  - После Product Gate — lookup токена в `tokenDataRoot` продукта (для Driver: `*Data.ts`).
  - Exact match → использовать и зафиксировать source path; semantic equivalent → спросить reuse vs create.
  - Token gap → единая анкета «Token gaps detected»; реализация останавливается.
  - Запрет хардкода hex/rgb/hsl без явного разрешения пользователя.
  - Предпочитать reuse существующих токенов; не создавать token files в рамках этого gate.
- **Key artifacts:** `pages/driver-color-tokens/*Data.ts`, `tokens/*-changelog.json`, `token-changelog-registry.json`; не использовать `src/pages/FigmaStyles/` как source.
- **Example dialog:**
  ```
  ## Token gaps detected

  1. tokenPath: bg-accent-main
     figmaName: bg/accent/main
     value: #0057FF
     mode: light
     usage: Button component
     confidence: high

  Before implementation:
  - confirm which gaps should be created as new tokens;
  - specify target collection and file;
  - or specify existing tokens to reuse instead.
  ```

### 3. Component Gate (`component-gate.mdc`)

- **When it applies:** Создание, изменение, аудит или реализация UI-компонентов; Presentbook component pages и sandbox.
- **What it enforces:**
  - Lookup компонента в `componentsRoot` продукта; при `null` — не создавать папки молча.
  - Новый компонент → structured proposal (имя, Figma, tokens, variants, modes, path, confidence).
  - Связка с `token-integrity.mdc`: все required tokens проходят lookup; gaps блокируют реализацию.
  - Pending change item в `changes/<id>/pending/`; без немедленного SemVer/changelog.
- **Key artifacts:** `componentsRoot` из `product.json`, `changes/<id>/pending/`; для Driver `componentsRoot: null`.
- **Example dialog:**
  ```
  ## New component proposal

  Component: Button
  Figma source: https://figma.com/design/.../Button
  Tokens required: bg-accent-main, text-primary
  Variants: primary, secondary, ghost
  Modes: light, dark
  Proposed path: products/driver/components/Button/Button.tsx
  Confidence: high

  Before implementation:
  - confirm the component name and path;
  - confirm which tokens must be created or reused;
  - confirm whether to create now or defer until token gaps are resolved.
  ```

### 4. Skills Import Gate (`skills-import-gate.mdc`)

- **When it applies:** Импорт skills/tokens/styles через Figma MCP или `ds-import.mdc`; создание или реорганизация файлов в `skills/`.
- **What it enforces:**
  - Product context + destination path до запуска import flow.
  - Дефолт: `skills/_shared/`; product-scoped paths — только с подтверждением.
  - Координация с `ds-import.mdc` (техника) + product scope (куда и зачем).
  - Token lookup для skills с зависимостью от токенов; gaps блокируют импорт.
  - Pending change item; без финального SemVer при импорте.
- **Key artifacts:** `skills/_shared/`, `~/Desktop/ds-import/`, `ds-import.mdc`, `changes/<id>/pending/`.
- **Example dialog:**
  ```
  Before import, confirm:
  - Product: driver
  - Destination: skills/_shared/
  - Scope: shared (not product-specific)

  Planned structure:
  skills/_shared/button-component-guide.md

  Proceed with import?
  ```

### 5. Audit Gate (`audit-gate.mdc`)

- **When it applies:** Аудит токенов, компонентов, skills; поиск unused/missing/inconsistent; сравнение Figma с реализацией.
- **What it enforces:**
  - Audit plan (product, тип, файлы, формат) → подтверждение → сканирование.
  - Классификация: token / component / skills / Figma-mismatch audit.
  - Consolidated report с полями type, category, path, expected, actual, impact, confidence.
  - Audit read-only: fixes → pending items; прямые правки артефактов запрещены.
  - SemVer/changelog — только через Release Gate.
- **Key artifacts:** `*Data.ts`, `componentsRoot`, `skills/_shared/`, `changes/<id>/pending/`, `token-changelog-registry.json`.
- **Example dialog:**
  ```
  ## Audit plan
  Product: driver
  Type: Token audit + Figma mismatch
  Scan: pages/driver-color-tokens/*Data.ts, Figma node 1763:113
  Output: structured table

  Confirm or adjust the plan?

  [After scan]
  Which findings to fix now? Which to defer?
  Create pending change items for selected findings?
  ```

### 6. Release Gate (`release-gate.mdc`)

- **When it applies:** Release, versioning, publish tokens/components/skills; move pending → released; release commit/tag/push.
- **What it enforces:**
  - Release plan → подтверждение → группировка pending changes по artifact.
  - Propose SemVer bump + changelog entry; финализация только с явным OK пользователя.
  - Update changelog files; move pending → `released/`; не менять token values / implementations.
  - Stage только release files; commit и push — с подтверждением (`git-push.mdc`).
- **Key artifacts:** `changes/<id>/pending/`, `changes/<id>/released/`, `tokens/*-changelog.json`, `token-changelog-registry.json`.
- **Example dialog:**
  ```
  ## Release plan
  Product: driver
  Type: Token release
  Artifacts: spacing-sem, radius-sem
  Pending: changes/driver/pending/spacing-*.json

  Proposed SemVer: spacing-sem 1.0.0 → 1.1.0 (minor)
  Changelog: Added space-140 token

  Confirm SemVer and changelog? Proceed with release?
  ```

---

## Execution order

Типичный end-to-end сценарий:

1. **User request:** «Импортировать токены из Figma и сделать компонент Button».
2. **Product Gate** — подтвердить `driver`, показать token source и release queue.
3. **Token Integrity** — lookup required tokens из Figma; показать gaps или подтвердить reuse.
4. **Skills Import Gate** (если импорт skills) — destination `skills/_shared/`, координация с `ds-import.mdc`.
5. **Component Gate** — proposal Button, coupling с tokens, подтверждение path при `componentsRoot: null`.
6. **Implementation** — отдельные задачи; каждое изменение → pending item в `changes/driver/pending/`.
7. **Audit Gate** (optional) — plan → scan → report → pending items для выбранных findings.
8. **Release Gate** — group pending → SemVer + changelog → move to `released/` → commit (push по OK).

```
User request
    ↓
Product Gate
    ↓
Token Integrity ──┐
Component Gate  ──┼── (parallel where applicable)
Skills Import   ──┘
    ↓
Implementation → changes/<id>/pending/
    ↓
Audit Gate (optional) → more pending items
    ↓
Release Gate → changelog + released/
    ↓
Commit / Push (explicit approval)
```

---

## Optional extensions

### Push & Sync Gate (будущее правило)

Может формализовать post-release sync: проверка, что remote содержит все release commits; синхронизация changelog mirror (`pages/driver-color-tokens/tokens/`); блокировка force-push и cross-branch merges без review. Дополнит `git-push.mdc` product-scoped проверками.

---

## Maintenance notes

### Как добавлять новые правила

1. Создать `.cursor/rules/<name>.mdc` с frontmatter `description` и `alwaysApply: true/false`.
2. Указать **Scope** — когда правило применяется и когда нет.
3. Добавить **Product context prerequisite** — ссылка на `product-context.mdc`.
4. Не дублировать логику существующих gates; делегировать (например token lookup → `token-integrity.mdc`).
5. Обновить этот `RULES_OVERVIEW.md` — добавить секцию в Rules list и скорректировать Execution order.
6. Коммитить правило отдельно от implementation changes.

### Как обновлять при новых продуктах или `componentsRoot`

1. Добавить продукт в `products/registry.json` + `products/<id>/product.json`.
2. Создать `changes/<id>/pending/` и `changes/<id>/released/`.
3. Заполнить `tokenDataRoot`, `tokensRoot`, `componentsRoot`, `releaseRoot` — `null` для ещё не созданных путей.
4. Обновить секцию **Products context** в этом overview.
5. В product-specific gates (Token Integrity, Component, Release) — добавить блок «For `<id>`:» только если пути отличаются от Driver defaults.
6. При появлении `componentsRoot` для Driver — обновить Component Gate examples и Maintenance notes; не менять gate-логику, только product manifest.
