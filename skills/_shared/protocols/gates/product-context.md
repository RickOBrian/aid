---
destination: skills/_shared/protocols/gates/
name: product-context
metadata:
  version: "1.0.0"
  kind: protocol
  status: stable
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Обязательный гейт: подтверждение продукта до любой работы с Figma, токенами, компонентами, Presentbook, changelog и release. Изолирует данные продуктов друг от друга.
---


# Product Context Gate

> Статус: Stable · v1.0.0 · обновлено 2026-09-20

---

## 1. Scope

This rule applies only when the user asks to:

- read, import, analyse or implement something from a Figma link or frame;
- add, change, delete or use a design token or visual style;
- create, change, compose, audit or implement a component;
- create or change a Presentbook token page, component page or review sandbox;
- prepare component/token changelog, versioning, release bundle, commit or push
  that affects token or component artifacts.

Do not apply this rule to ordinary repository work such as general documentation,
utilities, non-UI refactoring or infrastructure that does not affect those artifacts.

## 2. Eligible products

Before applicable work, read `products/registry.json`.

Only products with status `active` or `onboarding` participate in the
component/token pipeline.

Products with any other status, including `stable`, `legacy`, `prototype` or
`archived`, are historical/reference products. Do not automatically select,
suggest, read token values from, or write component/release artifacts to them.

Do not suggest or select `ui-kit-a`, `ui-kit-b`, `sutochno` or
`design-system` for new work unless the user explicitly asks to work with that
historical product.

## 3. Product resolution

Before reading token values, starting Figma discovery, creating or changing a
component, Presentbook page, registry, changelog, pending/released manifest,
commit or push, resolve the product context in this order:

1. Product ID or label explicitly named by the user.
2. Explicit path, route, token collection or component path.
3. Current open-file or working-area context.
4. Figma file or frame name/context.
5. The only eligible `active`/`onboarding` product in registry.

Never resolve a product only from a similar token name, colour or component name.

## 4. Product confirmation

If the user explicitly named an eligible product and the path/context matches
the registry, display this brief confirmation before implementation:

## 5. Product context
Product: [label] (`[id]`)
Status: [status]
Token source: [tokensRoot or tokenDataRoot]
Components: [componentsRoot or “not created yet”]
Presentbook: [presentbookRoot]
Release queue: [releaseRoot]

Continue in this scope.

If the user did not explicitly name a product, but Cursor resolves it with high
confidence, show the same block and ask:
“Confirm this product or specify another.”

If several eligible products exist and the product cannot be resolved with high
confidence, stop and show a numbered choice containing only eligible products.

Do not start Figma discovery or implementation until the user confirms the
product context.

## 6. New product onboarding

If the user asks to create a new product, or names a product absent from the
registry:

1. Do not create files or folders yet.
2. Ask this questionnaire and wait for explicit confirmation:

## 7. New product

1. Product ID, kebab-case
   Proposed: [id]

2. Display name
   Proposed: [label]

3. Initial status
   Default: `onboarding`
   Alternative: `active`

4. Current token source
   A. Existing local token JSON/TS files — user will provide the path
   B. Figma MCP — tokens must first be imported and published
   C. No tokens yet

5. Presentbook location
   Propose a separate product scope inside the current active React portal,
   but do not create routes before confirmation.

6. Components
   A. Do not create components yet
   B. Start the first component after token preparation

3. After explicit confirmation only:
   - add the product to `products/registry.json`;
   - create `products/<id>/product.json`;
   - create `changes/<id>/pending/.gitkeep`;
   - create `changes/<id>/released/.gitkeep`;
   - use `null` for paths not created yet;
   - do not create tokens, components, sandbox, changelog or routes without
     a separate user task.

## 8. Product isolation

After confirmation, use only paths and data of the selected product from
`products/registry.json` and `products/<id>/product.json`, when it exists.

Never:
- use token values of another product;
- create/change a component outside the selected product scope;
- write changelog or pending/released manifest for another product;
- mix tokens/components of different products in one sandbox page;
- treat a historical/reference product as active without an explicit request.

If a required path is `null`, say so and propose the path to create inside the
selected product scope. Do not create the structure silently.

After product context is confirmed, still follow these rules for the same task:
- token/style changes must be recorded as pending change items under
  `changes/<id>/pending/`; do not finalise SemVer, collection changelog,
  component changelog, commit or push during implementation;
- final SemVer and changelog are determined only at an explicitly requested
  product release boundary, after the user reviews and approves the grouped
  pending changes for each affected artifact;
- `protocols/gates/token-change-gate.md` and `protocols/portal-table-standard.md` remain
  responsible for Driver portal token section pages in
  `pages/driver-color-tokens/`, but must not force an immediate version bump;
- `protocols/git-workflow.md` applies only after explicit user approval to commit/push.
  Product release bundles belong under `changes/<id>/`;
- `skills/ds-import/SKILL.md` is a separate skills-import workflow; resolve product
  context before deciding where imported artifacts belong.

## 9. Product facts resolution

Факты продукта не дублируются в этом гейте. Единственный источник —
`products/<id>/product.json`, индекс продуктов — `products/registry.json`.

Читать оттуда: `tokensRoot`, `tokenDataFiles`, `componentsRoot`,
`componentRegistry`, `changelogFiles`, `releaseRoot`, `presentbookRoot`,
`platformModel`, `colorModeMapping`.

Если поле `null` или `declared: false` — это не повод подставить умолчание.
Спросить.

Ниже — правила, которых в манифесте нет и быть не может:

- UI самого портала (`ChangelogTable`, `ComponentReleaseStatus` и подобные)
  **не является** компонентом дизайн-системы продукта: версия и changelog
  компонента ему не назначаются;
- версия компонента и финальная запись changelog обновляются **только** на
  Release Gate — не во время реализации, превью или обновления sandbox;
- данные одного продукта не смешиваются с данными другого: токены,
  компоненты, changelog и release-очереди изолированы по продукту.

---

## 10. Changelog

- **1.0.0** — 2026-09-20. Перенесено из .cursor/rules/product-context.mdc. Cursor объявлен легаси; правило переписано инструмент-нейтрально и живёт теперь там, где его читает рабочий агент. Прежний файл оставлен указателем.
