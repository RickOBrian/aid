---
destination: skills/_shared/protocols/gates/
name: token-integrity
metadata:
  version: "1.0.0"
  kind: protocol
  status: stable
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Запрещает использовать значения без подтверждённого источника. Требует token lookup, собирает все пробелы в одну анкету и не позволяет хардкодить, пока не доказано отсутствие токена.
---


# Token Integrity Gate

> Статус: Stable · v1.0.0 · обновлено 2026-09-20

---

## 1. Scope

This rule applies whenever the user asks to:

- read, import, analyse or implement something from a Figma link or frame;
- add, change, delete or use a design token or visual style;
- create, change, compose, audit or implement a component;
- create or change a Presentbook token page, component page or review sandbox;
- prepare component/token changelog, versioning, release bundle, commit or push
  that affects token or component artifacts.

Do not apply this rule to ordinary repository work such as general documentation,
utilities, non-UI refactoring or infrastructure that does not affect those artifacts.

## 2. Product context prerequisite

Before any applicable work, follow `protocols/gates/product-context.md` and resolve the product
context.

Do not start token discovery or implementation until the product context is
confirmed.

## 3. Token source resolution

After product context is confirmed, resolve the token source in this order:

1. `tokenDataRoot` from `products/<id>/product.json` (for Driver:
   `pages/driver-color-tokens/*Data.ts` files).
2. `tokensRoot` from `products/<id>/product.json` (for Driver: `null`).
3. `relatedPrototypes` from `products/<id>/product.json` as reference only.

For Driver:

- canonical token values live in `pages/driver-color-tokens/*Data.ts`;
- `tokens/*-changelog.json` are canonical collection changelogs;
- `pages/driver-color-tokens/token-changelog-registry.json` indexes
  collection changelogs;
- `src/pages/FigmaStyles/` is a reference-only Figma style dump listed in
  `relatedPrototypes`. It is not a token source and must not be used as a
  primary source of truth.

Do not use token values from any other file or product.

## 4. Token lookup procedure

Before using a token value in any implementation, changelog, component or
sandbox, perform a token lookup:

1. Identify the token name or path required by the task (for example
   `color.primary`, `color.bg.surface`, `color.text.primary`).
2. Search in the resolved token source files for an exact match or a
   semantically equivalent token.
3. If an exact match is found, use that token value and record the source
   file path.
4. If no exact match is found, search for semantically equivalent tokens
   (for example `bg.surface` vs `surface.bg`, `text.primary` vs `primary.text`).
5. If a semantically equivalent token is found, propose it and ask the user
   whether to use it or create a new token.
6. If no token is found, treat this as a token gap.

## 5. Token gap handling

When a token gap is detected:

1. Do not hardcode hex, rgb, hsl or any other raw value.
2. Do not silently invent a new token name or path.
3. Collect the gap in a list for the current task with the following fields:

   - `tokenPath`: proposed token path (for example `color.bg.surface`);
   - `figmaName`: original Figma token name or style name, if known;
   - `value`: raw value from Figma or design spec;
   - `mode`: Figma mode or context (for example `light`, `dark`, `mobile`);
     for Driver color tokens use semantic modes in the gap list (`light` /
     `dark`) and map to source fields `day` / `night`; portal labels stay
     `Day` / `Night` (see Driver color mode resolution below);
   - `usage`: where this token is required (component, page, sandbox);
   - `confidence`: `high` | `medium` | `low` based on naming clarity.

4. After scanning all required tokens for the task, if at least one gap exists,
   stop implementation and show a single consolidated questionnaire:

## 6. Token gaps — questionnaire

The following tokens are required but do not exist in the current product scope.

1. `tokenPath`: [path]
   `figmaName`: [name]
   `value`: [value]
   `mode`: [mode]
   `usage`: [usage]
   `confidence`: [high|medium|low]

[Repeat for each gap]

Before implementation:

- confirm which gaps should be created as new tokens;
- specify the target collection and file (for example `color`, `pages/driver-color-tokens/data.ts`);
- or specify existing tokens to reuse instead.

Do not proceed with implementation until the user resolves all gaps.

Unresolved token gaps remain a **hard stop**. Documented standard deviations
(option c below) apply only when a token **exists** but deviates from DS
naming/value standards — not when the token is missing.

## 7. Driver color mode resolution

For product `driver`, color tokens in `pages/driver-color-tokens/data.ts` use
fields `day` and `night` and portal labels `Day` / `Night`.

- `Day` → light mode → read `row.day`
- `Night` → dark mode → read `row.night`

When a task, Figma mode, component theme or token gap uses `light` / `dark`,
map to Driver source fields above. Do **not** treat `Day` / `Night` labels or
`day` / `night` field names as standard deviation, naming blocker or reason for
a per-component exception. Canonical mapping:
`products/driver/product.json` → `colorModeMapping`.

Token names containing `light ind` / `dark ind` (for example `Primary light ind`)
are semantic color roles, not color mode labels — do not confuse with light/dark
theme mapping.

## 8. Standard deviation

When a token **is found** in the product source, but its name or value does
not match the DS standard (naming guide, Figma spec, expected semantic role):

1. Show a single consolidated questionnaire with the deviation and four
   explicit choices. Default recommendation: option **a**.

## 9. Standard deviation — questionnaire

Token: [name/path in source]
Standard expected: [DS standard name/value/role]
Actual in source: [actual name/value]
Usage: [component, page, sandbox]
Confidence: [high|medium|low]

Choose one:

a) **Use existing semantic token** (recommended) — reuse the found token as-is;
   record a pending item if naming/value drift should be tracked for audit.
b) **Add new semantic token** — create a correctly named token in a separate
   implementation task; do not rename silently during this task.
c) **Temporary deviation with documented exception** — proceed only after
   explicit user confirmation; record a pending exception item (see below).
d) **Stop until source of truth is clarified** — do not implement until the
   user resolves Figma vs product source conflict.

If the user chooses **c**, create a pending exception item under
`changes/<id>/pending/` before continuing implementation. Use the unified
exception format (shared with `protocols/gates/component-gate.md` and `protocols/gates/audit-gate.md`):

```json
{
  "id": "token-deviation-[slug]",
  "type": "token",
  "exceptionType": "naming | value | architecture | layout",
  "standard": "[expected DS standard]",
  "actual": "[actual token name/value in source]",
  "reason": "[why deviation is accepted]",
  "recommendation": "[preferred fix or follow-up]",
  "status": "temporary | accepted",
  "reviewAt": "release | next-major",
  "pendingRef": "changes/<id>/pending/[filename].json"
}
```

After the user confirms option **c** and the pending item is recorded,
**proceed with implementation** using the documented deviation. Do not treat
a confirmed documented exception as an unresolved gap.

Options **a** and **b** may proceed after user confirmation without a full
exception block unless audit tracking is requested. Option **d** is a hard
stop until clarified.

Product isolation, release integrity and unresolved token gaps without
approval remain **requirements** — documented exceptions do not override them.

## 10. Классификация значений

Не всякое значение без токена — хардкод. Перед тем как объявить нарушение,
значение классифицируется по шкале, которая уже действует в коде
(`pages/driver-color-tokens/components/anatomyTypes.ts`):

| Вид | Что это | Допустимо |
|---|---|---|
| `semantic-token` | Ссылка на semantic-токен | Да — норма |
| `platform-convention` | Значение, заданное платформой, а не дизайн-системой: touch target 44×44, disabled opacity 40%, системные тайминги | Да, с явной пометкой вида |
| `raw-value` | Геометрия конкретного компонента, которую незачем токенизировать: track 32×20, thumb 16×16 | Да, если зафиксировано в анатомии компонента |
| `hardcode` | Цвет, отступ, радиус или типографика мимо токена | **Нет — блокер** |

Правила применения:

- вид указывается явно рядом со значением (в анатомии компонента, в спеке
  или в комментарии) — «значение без вида» приравнивается к `hardcode`;
- `platform-convention` и `raw-value` не превращают правило в лазейку:
  цвет не может быть `raw-value`, а отступ между элементами — не
  `platform-convention`;
- спор «это хардкод или конвенция» решается видом, а не интонацией.

## 11. Hardcode prohibition

Never hardcode hex, rgb, hsl or any other raw value in components, sandbox
pages, styles or documentation when a token is expected, unless:

- the user explicitly asks to hardcode a value for a prototype or experiment;
- the token gap questionnaire has been shown and the user explicitly approves
  hardcoding for specific tokens.

If the user asks to hardcode, still show the token gap list and ask whether
these values should later be converted to tokens.

## 12. Token reuse and naming

When proposing new tokens:

- prefer existing naming patterns from `pages/driver-color-tokens/*Data.ts`;
- avoid duplicating tokens with slightly different names for the same value;
- if a semantically equivalent token exists, propose reusing it instead of
  creating a new one.

Do not create token files or change token values as part of this rule. That
requires a separate user task.

---

## 13. Changelog

- **1.0.0** — 2026-09-20. Перенесено из .cursor/rules/token-integrity.mdc. Cursor объявлен легаси; правило переписано инструмент-нейтрально и живёт теперь там, где его читает рабочий агент. Прежний файл оставлен указателем.
