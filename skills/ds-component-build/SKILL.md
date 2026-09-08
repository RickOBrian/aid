---
name: ds-component-build
metadata:
  version: "1.1.0"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Универсальная верстка Product DS Component из Figma для Web / iOS / Android:
  discovery, semantic tokens, review page, metadata, pending changelog.
  Без release/version bump. Активируй когда: «сверстай компонент»,
  «сверстай product-компонент», «component build», «создай компонент из Figma»,
  «новый Product DS Component», короткий запрос с Figma + Product + Platform.
---

# DS Component Build — v1.0.0

Основной Cursor skill для **универсальной верстки** любого Product DS Component
из Figma. Оркестрирует gates и shared guides — **не дублирует** их содержимое.

---

## Portal UI ≠ Product DS Components

**Portal UI** — infrastructure Presentbook: navigation, headers, tables,
cards, filters, portal shell, `ChangelogTable`, `ComponentReleaseStatus`.

**Product DS Components** — versioned product artifacts: source implementation,
API, semantic tokens, metadata, component changelog, pending/release lifecycle,
review page.

Portal primitives — только infrastructure для review page. Не source of truth
для product API, naming, tokens, registry, versioning или release scope.

---

## Обязательное чтение (delegate, не копировать)

| Topic | Source |
|---|---|
| Discovery gate order (Platform scope → Composition → Token coverage) | `skills/component-build-workflow.md` |
| Product / release gates | `.cursor/rules/product-context.mdc`, `component-gate.mdc`, `token-integrity.mdc`, `release-gate.mdc` |
| Tokens | `skills/_shared/token-rules.md` |
| Platforms & a11y | `skills/_shared/platforms.md`, `accessibility.md` |
| States | `skills/_shared/component-states-guide.md` |
| Architecture & categories | `skills/_shared/ds-component-architecture-guide.md`, `component-categories-guide.md` |
| Figma discovery | `skills/_shared/figma-import-guide.md` |
| Review page layout | `skills/_shared/presentbook-guide.md` |
| Versioning | `skills/_shared/changelog-guide.md`, `versioning-strategy.md` |
| Artifact templates | `references/artifacts-and-versioning.md` |
| Routes & changelog block | `references/review-page-and-routes.md` |

---

## Вход пользователя

```text
Сверстай компонент.
Figma: <link>
Product: <product>
Platform: <Web / SwiftUI / Compose>
```

Достаточно. Не проси повторить то, что видно из Figma, repo и rules.

---

## Поведение агента

**Делай:**

- discovery молча;
- краткий product context block, если product не назван явно;
- safe defaults из rules/source of truth **без вопроса**;
- реализацию сразу, если blockers нет;
- одну компактную анкету на blocker round;
- после ответа — продолжай без повторного полного discovery;
- короткий final summary + **verified component-page URL**.

**Не делай:**

- длинный audit, технический план, внутренние рассуждения;
- отдельный шаг IMPLEMENT, если blockers нет;
- больше одного пакета вопросов за раз;
- automatic version bump, final changelog, commit, push;
- изменение token values, Day/Night labels, Figma artifacts.

### Формат анкеты (единственный)

```text
Нужно решение: <что именно>.
Рекомендация: <что предлагаешь и почему>.
A. <вариант>
B. <вариант>
C. <вариант, если нужен>
Default: <безопасный выбор>.
Последствие: <что изменится от выбора>.
```

Агрегируй token gaps + placement + motion gaps в **одну** анкету.

---

## Workflow

### 0. Platform scope gate (mandatory, before Discovery)

Full rule → `skills/component-build-workflow.md` § 1.1. Summary:

- Ask explicitly: «Для каких платформ реализуется этот компонент — Web, iOS,
  Android, или подмножество?»
- Never default silently to all three; never default silently to Web-only.
- No answer → do not proceed to step 4 (Implementation).
- Confirmed scope limits Composition gate (`component-gate.mdc`) and Token
  coverage gate (`token-integrity.mdc`) to the confirmed platforms only.
- Adding a platform to an already-built component later is a separate
  explicit request, not automatic.

### 1. Resolve context

- Product → `products/registry.json`, `products/<id>/product.json`
- Platform target from user (Web / SwiftUI / Compose) — must match platforms
  confirmed in step 0
- **Figma MCP fallback** (if MCP unavailable):
  1. One explicit message: `Figma MCP недоступен — продолжаю по скриншоту, описанию и repository context.`
  2. Continue — do not auto-block implementation.
  3. Mark unverified Figma properties as **assumptions**.
  4. Compact decision form **only** if an assumption affects tokens, API,
     states, placement or accessibility and cannot be resolved safely from
     repository context.
  5. Do not re-request the Figma link if the user already provided it.
- If Figma MCP is available → read frame via MCP / design context.
- Existing component lookup per `component-gate.mdc`

### 2. Discovery (silent)

Определи из Figma + repo:

- canonical name, aliases (aliases — не отдельные components/routes)
- architecture level, Components group
- API: props, variants, values, states
- semantic tokens (lookup in product `*Data.ts`)
- motion: apply safe default (`0.15s ease`, `prefers-reduced-motion`) if
  repo/platform convention exists; спроси только если влияет на API/UX/tokens
- platform states per `component-states-guide.md`:
  hover Web-only; error form-only; loading only with async scenario;
  Android ripple only with evidence
- **Color mode mapping (product-scoped only):** apply **only** when
  `Product: driver` or `products/<id>/product.json` defines explicit
  `colorModeMapping`. For Driver canonical source:
  `products/driver/product.json` → `colorModeMapping` —
  `Day` = light = `row.day`; `Night` = dark = `row.night`
  (Driver terminology, not naming violation). For other products: read
  manifest first; use its explicit mode labels/fields — do **not** assume
  Day/Night or Light/Dark. If manifest has no color mode mapping: use actual
  token modes from product token source; do not invent Driver-like mapping.

### 3. Blockers only → one form

Stop only for:

- unresolved semantic token gaps;
- missing approved component path / Components group / registry convention;
- motion decision affecting API or missing coverage.

Otherwise → **Step 4 immediately**.

### 4. Implementation

- Product source component (semantic tokens only; no Core; no hardcode)
- Platform rules from `platforms.md` — не копируй в skill
- Web Driver sandbox default when `componentsRoot: null` and path approved/deferred to temporary sandbox

### 5. Artifacts (pending-first)

Create per `references/artifacts-and-versioning.md`:

- metadata (`currentVersion: null`)
- component changelog source (`entries: []`)
- pending item (`proposedSemVerImpact: initial`, `proposedVersion: 1.0.0`, `changeType: added`)

Never bump version or write release entries.

### 6. Review page & navigation

Per `references/review-page-and-routes.md`:

- Components group + hub entry + route
- `ComponentReleaseStatus` **last meaningful block** (pending panel + component changelog table/empty state)
- `Not released` / `Pending initial release`; pending shows `INITIAL → v1.0.0`
- Missing changelog section = **blocker**

### 7. Verify

- `npm run build` in presentbook root
- Open component route; confirm changelog block renders
- Confirm `released/` unchanged

### 8. Final summary (short)

```text
Component: [name] ([architecture level])
Platform scope: [confirmed in step 0, e.g. Web, iOS, Android]
Implementation status per platform: [repo file exists | reference-only per platforms.md | not started]
Variants / states / motion: [...]
Defaults / decisions: [...]
Components group: [...]
Route: [/components/...]
Checks: build ✓, route ✓, changelog block ✓
Released version: Not released (pending initial v1.0.0)
Review page: [verified local URL | npm run dev command + URL pattern]
```

Version/changelog/release — only on explicit Release Gate request.

---

## Initial release & Release Gate

| When | Rule |
|---|---|
| Implementation | `currentVersion: null`, pending `impact: initial` |
| First Release Gate | propose `1.0.0`, entry `type: added`, `impact: initial` |
| After first release | minor / patch / major per `release-gate.mdc` |

Cursor proposes; Principal Designer confirms; version + changelog + push — one linked operation.

---

## Safety (never automatic)

- token value edits; Day/Night rename; Figma artifact edits
- release version/changelog outside Release Gate
- `git add`, commit, push, reset, checkout, clean

---

## Anti-patterns

| Anti-pattern | Why |
|---|---|
| Portal UI as Product Component | Wrong artifact |
| `currentVersion: "0.0.0"` for unreleased | Implies phantom public version |
| Token changelog on component page | Wrong source |
| Switch-specific logic in skill | Use `references/` example only |
| Long audit before build | Bad UX |

---

## Changelog

- **1.1.0** — 2026-08-18. Adds mandatory Platform scope gate (step 0, before Discovery) — delegates to `skills/component-build-workflow.md`; final summary now reports platform scope + implementation status per platform.
- **1.0.0** — 2026-08-16. Universal Figma→component build orchestration: short UX, gates delegation, initial-release model, review-page changelog block, TESTING.md.
