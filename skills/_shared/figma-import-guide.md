---
description: >
  Гайд импорта из Figma: токены, компоненты, product context,
  mapping modes/variants, post-import validation.
destination: skills/_shared/
name: figma-import-guide
metadata:
  version: "1.0.1"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Figma Import Guide

## Purpose

Этот гайд описывает, как импортировать токены и компоненты из Figma в scope продукта дизайн-системы: что считать source of truth, как мапить Figma variables/styles на token collections, и как пройти post-import validation через gates pipeline.

Гайд дополняет технический workflow `.cursor/rules/ds-import.mdc` и product-scoped правила `.cursor/rules/skills-import-gate.mdc` — не заменяет их.

---

## Relationship to other guides

| Артефакт | Связь |
|---|---|
| `.cursor/rules/ds-import.mdc` | Технический import из `~/Desktop/ds-import/` → `skills/_shared/` |
| `.cursor/rules/skills-import-gate.mdc` | Product context, destination, shared vs product-scoped |
| `.cursor/rules/product-context.mdc` | Обязательное подтверждение продукта до импорта |
| `.cursor/rules/token-integrity.mdc` | Token lookup, gaps, запрет hardcode |
| `.cursor/rules/component-gate.mdc` | Component proposal при импорте компонентов |
| `token-rules.md` | Что считать Core vs Semantic токеном |
| `component-standards.md` | Стандарты реализации после импорта |

---

## Source of truth

| Источник | Роль |
|---|---|
| **Product token data** (`pages/driver-color-tokens/*Data.ts` для Driver) | Canonical token values |
| **Figma file (design)** | Design intent, variants, modes — источник для import/discovery |
| **`src/pages/FigmaStyles/`** | Reference-only dump; **не** source of truth |
| **`tokens/*-changelog.json`** | Version history; не источник значений |

### Когда Figma приоритетна

- Первичный import новой коллекции токенов.
- Discovery variants/states нового компонента.
- Сравнение design intent vs implementation (audit).

### Когда implementation приоритетна

- Token уже существует в `*Data.ts` / `data.ts` — reuse, не перезапись.
- Release boundary — changelog фиксирует implementation, не Figma draft.
- `FigmaStyles` dump — только reference для сравнения.

---

## Import workflow

Высокоуровневый процесс (детали ds-import — в `.cursor/rules/ds-import.mdc`):

```
1. Product Context Gate     → подтвердить продукт (driver)
2. Skills Import Gate       → destination: skills/_shared/ (по дефолту)
3. Figma discovery          → variables, styles, components
4. Token / Component mapping → collections, modes, variants
5. Token Integrity          → lookup + gap questionnaire
6. Implementation           → *Data.ts, component files (отдельная задача)
7. Pending change item      → changes/<id>/pending/
8. Release Gate             → SemVer + changelog (позже)
```

Не запускать import silently. Показать план и дождаться подтверждения.

---

## Token import

### Mapping Figma → token collections (Driver)

| Figma section / type | Driver collection | Target file |
|---|---|---|
| Color variables / styles | Colors/Semantic | `data.ts` |
| Typography styles | Typography/Semantic | `typographyData.ts` |
| Spacing | Spacing/Semantic | `spacingData.ts` |
| Corner radius | Radius/Semantic | `radiusData.ts` |
| Effects / shadows | Effects/Shadows | `shadowsData.ts` |
| Icons | Icons/Wilhelm | `iconsData.ts` + `public/icons/` |

### Modes

| Figma mode | Driver token mapping | Platform theme |
|---|---|---|
| Light / Day | `day` field in color rows | light mode |
| Dark / Night | `night` field in color rows | dark mode |
| Mobile / Desktop | Document in pending item; не смешивать без explicit mode token | — |

Driver color mode mapping: `Day` represents light mode; `Night` represents dark
mode. The `Day`/`Night` labels are current product terminology and must be
preserved. Use their semantic mapping when implementing platform themes or
component modes. This is not a token naming violation and does not require a
per-component exception. Any future rename to `Light`/`Dark` requires an
explicit product and release decision.

Canonical metadata: `products/driver/product.json` → `colorModeMapping`.
Source fields in `pages/driver-color-tokens/data.ts`: `day` (light), `night`
(dark). Portal column labels stay `Day` / `Night`.

Token names such as `Primary light ind` are semantic roles, not color mode
labels — do not treat them as Light/Dark theme modes.

### Variants в Figma

Figma component variants (`Primary`, `Secondary`) — это **component props**, не token names. При import токенов не создавай `color-button-primary` — используй semantic categories (`bg-accent-main`, `text-primary`).

### Token import checklist

- [ ] Product context confirmed
- [ ] Каждый Figma token прошёл lookup в `*Data.ts` / `data.ts`
- [ ] Gaps собраны в единую анкету
- [ ] Нет hardcoded values в implementation
- [ ] Pending change item создан

---

## Component import

### Workflow

1. **Component Gate** — structured proposal (name, Figma source, tokens, variants, modes, path).
2. **Figma frame analysis** — auto layout, variants, component properties.
3. **Token coupling** — list all required tokens; run token lookup.
4. **Path confirmation** — при `componentsRoot: null` (Driver) path не создаётся молча.

### Variants и states из Figma

| Figma | Implementation |
|---|---|
| Component property `Variant=Primary` | prop `variant="primary"` |
| State `Hover=true` | state `hovered` (Web) — см. `component-states-guide.md` |
| Auto layout padding/gap | semantic spacing tokens (`space-*`, `inset-*`) |
| Fill / stroke styles | semantic color tokens из `data.ts` |

### Auto layout

- Padding → `inset-*` semantic tokens, не raw px.
- Gap → `gap-*` или `space-*` по `semantic-space-tokens-guide.md`.
- Corner radius → `radius-*` из `radiusData.ts`.

---

## Post-import validation

После import (или перед implementation):

1. **Token lookup** — `.cursor/rules/token-integrity.mdc` для каждого required token.
2. **Gap detection** — consolidated questionnaire если gaps exist.
3. **Audit (optional)** — `.cursor/rules/audit-gate.mdc`: Figma vs implementation mismatch.
4. **Pending change** — запись в `changes/<id>/pending/` — `.cursor/rules/product-context.mdc`.

Не финализировать SemVer/changelog при import — только pending items.

---

## Common pitfalls

| Ошибка | Как избежать |
|---|---|
| Import в wrong product scope | Product Context Gate first |
| Hardcode Figma hex в component | Token Integrity Gate |
| `FigmaStyles` как source of truth | Только reference; canonical — `*Data.ts` |
| Создание `colorData.ts` вместо `data.ts` | Ориентироваться на фактический naming Driver |
| Import skills вне `skills/_shared/` | Skills Import Gate + user confirmation |
| Immediate changelog bump | Pending → Release Gate |
| Component folder без path confirmation | Component Gate при `componentsRoot: null` |
| Figma Light/Dark vs Driver Day/Night treated as naming drift | Product terminology; map semantically | `colorModeMapping` in `product.json` |
