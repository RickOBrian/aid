# Spec Inspector — missing per-size anatomy

**Status:** known gap (not a bug; intentionally out of scope)  
**Scope:** `docs/storybook/spec-inspector.js` vs `docs/storybook/guide-page.js`  
**Section:** Guide Page «Анатомия» (visual callout stage)  
**Related standard:** `skills/_shared/anatomy-annotation-standard.md` §4.2  
**Introduced in:** `802d1b15f99f62305ca828d96bdfaee2a7496191` — per-size anatomy landed in `guide-page.js` only

## Symptom

`guide-page.js` умеет per-size анатомию: dropdown размера, реестр
`guide.sizeSamples`, фильтрация `parts[].sizes` и override `parts[].bySize`.
На странице, где визуальная анатомия рендерится **только** через
`spec-inspector.js` (без подключённого `guide-page.js`), selector размера
**не появится** — даже если в данных добавить `guide.sizeSamples` /
`parts[].sizes` / `parts[].bySize`.

На component spec pages, где подключены **оба** скрипта, per-size selector
виден в секции «Анатомия» Guide Page; engineering-панель `spec-inspector.js`
по-прежнему читает плоский `DS_COMPONENT_SPEC.parts` без учёта размера.

## Cause

В проекте исторически два слоя inspection на component spec pages:

| Слой | Скрипт | Роль |
|---|---|---|
| **Guide Page** | `guide-page.js` | Designer/product-facing визуал: анатомия, скругления, inset/gap-кадры, состояния |
| **Spec Inspector** | `spec-inspector.js` | Engineering-аудит: measure-list строки, editable-токены, confidence, violations, hit area |

Разделение зафиксировано в `guide-page-pass.md`: визуальные measure-диаграммы
(включая анатомию) **убраны** из `spec-inspector.js`, чтобы не дублировать
Guide Page. Общая геометрия callout (`mountAnatomyCallouts`, `findPartEl`)
вынесена в `measure-agents.js` и используется **только** `guide-page.js`.

Per-size механизм (`normalizeSizeSamples`, `partsForSize`, `anatomySizeSelectHtml`,
`wireAnatomySizeSelect`) реализован **исключительно** в `guide-page.js`.
`spec-inspector.js` не импортирует и не вызывает эти функции; его `parts`
— плоский массив без `sizes` / `bySize`.

## Resolution

Осознанно оставлено за scope коммита `802d1b1` (per-size анатомия ButtonText
на presentbook-странице). Текущее поведение корректно для задачи: единственная
страница с multi-size анатомией — `button-text.html` — рендерит Guide Page
без `spec-inspector.js`.

**Если понадобится per-size и на engineering-слое или на spec-inspector-only
страницах:** подключить `spec-inspector.js` к тому же реестру
`guide.sizeSamples` и правилам `partsForSize()` — отдельная задача с явным
scope (рефакторинг общего size-registry API, синхронизация hit-area measurement
с выбранным размером, регрессия по component spec pages). Не входило в текущий
pass.

## Pages using `spec-inspector.js`

Grep по `docs/storybook/**/*.html` — **10** component spec pages (все также
подключают `guide-page.js`; spec-inspector-only страниц **нет**):

| Page | Path |
|---|---|
| Badge | `docs/storybook/components/badge.html` |
| ButtonIcon | `docs/storybook/components/button-icon.html` |
| Card | `docs/storybook/components/card.html` |
| Chip | `docs/storybook/components/chip.html` |
| ChipSelect | `docs/storybook/components/chip-select.html` |
| ColorSwatch | `docs/storybook/components/color-swatch.html` |
| Search | `docs/storybook/components/search.html` |
| StorybookButton | `docs/storybook/components/storybook-button.html` |
| Switch | `docs/storybook/components/switch.html` |
| Table | `docs/storybook/components/table.html` |

**Guide Page без spec-inspector** (presentbook/product layer) — **2** страницы:

| Page | Path |
|---|---|
| ButtonText | `docs/storybook/products/sutochno/components/button-text.html` |
| CounterValue | `docs/storybook/products/sutochno/components/counter-value.html` |

Per-size анатомия сейчас задействована только на ButtonText (через
`guide-page.js`).

## Do not

- Не ожидать per-size selector на странице без `guide-page.js`, даже при
  наличии `sizeSamples` в данных.
- Не дублировать per-size логику точечно в `spec-inspector.js` под один
  компонент — сначала вынести общий size-registry API.
- Не возвращать visual anatomy-кадры в `spec-inspector.js` (нарушает
  guide-only решение из `guide-page-pass.md`).
