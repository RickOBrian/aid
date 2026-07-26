---
destination: skills/_shared/
name: anatomy-annotation-standard
metadata:
  version: "1.0.0"
  owner: design-system-team
description: >
  Стандарт anatomy-callout/halo в presentbook (Storybook): геометрия
  измерения, визуальный стиль halo, обработка text-node Item без
  собственного DOM-узла и требование к полноте #spec-sample для
  optional-частей. Источник правды для measure-agents.js и guide-page.js.
---

# Anatomy Annotation Standard — v1.0.0

Правила для anatomy-callout (номерные бейджи, линии, hover-halo) в
презентационных страницах компонентов (`docs/storybook/components/*.html`,
`docs/storybook/products/*/components/*.html`). Реализация — в
`docs/storybook/measure-agents.js` (измерение и рендер) и
`docs/storybook/guide-page.js` (нормализация конфига, монтирование стейджа).

Нарушение любого пункта — блокер при ревью presentbook-страницы.

---

## 1. Geometry halo

Halo/anchor вычисляются от **актуального** `getBoundingClientRect()` искомого
DOM-узла (border-box: включает padding и border), а не от закэшированных или
приближённых координат.

- `borderRadius` halo берётся из `getComputedStyle(el).borderRadius` целевого
  элемента — не хардкодится и не наследуется от Container.
- Геометрия пересчитывается **на каждый hover**, после layout reflow —
  `refreshAnatomyHaloGeometry()` вызывается непосредственно перед показом,
  а не один раз при монтировании стейджа.
- Логика применяется **глобально**, для всех anatomy-частей всех
  компонентов — не патчится точечно под конкретный компонент.

Реализация: `refreshAnatomyHaloGeometry()`, `haloRadiusFor()` в
`measure-agents.js`.

---

## 2. Визуальный стиль halo

- `background` halo **всегда прозрачный** (`fill: none`) — halo это контур,
  не заливка. Halo не перекрывает и не маскирует содержимое Container.
- Цвет обводки — фиксированный semantic-токен (`--bg-accent-main`),
  **не связан** с цветом/темой самого Container (светлый или тёмный фон
  подсвечиваемого компонента не влияет на цвет halo).
- Видимость halo управляется исключительно через `opacity` (0 → 1 на
  hover/`.is-active`), а не через `fill`/`background`.
- Правило одинаково для обоих режимов рендера halo (normal-size и tiny-target,
  см. `appendAnatomyHighlight()` / `appendTinyOutline()`) — оба используют
  только stroke, разница между ними — в толщине/opacity обводки, не в наличии
  заливки.

Реализация: `.spec-anatomy-callout__highlight`, `.spec-anatomy-callout__outline`
в `storybook-spec-inspector.css`.

---

## 3. Text-node Item (`targetType: 'text'`)

Если anatomy-Item не имеет собственного DOM-узла (текстовый контент напрямую
в родителе — типичная формулировка description: «без отдельного DOM-узла»,
«прямой текстовый контент», «элемент не выделен в отдельный тег»):

- В конфиге явно указывается `targetType: 'text'`.
- `selector` указывает на родительский элемент, содержащий текст.
- Измерение идёт через Range API (`selectNodeContents` + `getClientRects()`),
  а не через `getBoundingClientRect()` родителя — иначе box совпадает с
  Container и подсветка перекрывает соседние части.
- Не ограничиваться точным совпадением текста description — интерпретировать
  смысл каждого Item индивидуально.

Реализация: `resolveAnatomyTarget()` в `measure-agents.js`.

---

## 4. Полнота `#spec-sample` для optional-Item

Если anatomy-Item имеет `optional: true` и собственный `selector`
(например `.chip-select__icon`, `.badge__icon`), в `#spec-sample` должен
присутствовать **минимум один** вариант, где этот элемент физически есть в
DOM.

- Иначе легенда содержит пункт без соответствующего callout на canvas —
  расхождение легенда/canvas.
- Разметку для отсутствующего варианта переиспользовать из существующих
  preview-блоков файла — не изобретать новую.
- Если у Item нет `selector` (например текстовый counter без отдельного
  узла) — он legend-only по конструкции, это не нарушение.

---

## 5. Регрессионный набор файлов

Presentbook-файлы с `window.DS_COMPONENT_GUIDE.anatomy` — обязательный набор
для полной регрессии после любого изменения `measure-agents.js` или
`guide-page.js`:

- `docs/storybook/components/badge.html`
- `docs/storybook/components/button-icon.html`
- `docs/storybook/components/card.html`
- `docs/storybook/components/chip.html`
- `docs/storybook/components/chip-select.html`
- `docs/storybook/components/color-swatch.html`
- `docs/storybook/components/search.html`
- `docs/storybook/components/table.html`
- `docs/storybook/products/sutochno/components/button-text.html`
- `docs/storybook/products/sutochno/components/counter-value.html`

Для каждого файла на регрессии проверяется:

1. Каждый Item легенды подсвечивается отдельно и корректно при hover.
2. Halo — контур с прозрачным фоном (п.2), геометрия совпадает с реальным
   border-box узла (п.1).
3. Легенда полностью совпадает с canvas (нет пунктов без callout — п.4).

Список обновляется при добавлении нового presentbook-файла с anatomy-конфигом.

---

## Changelog

- **1.0.0** — первая версия. Формализует три правила, применённые и
  подтверждённые на Chip/ChipSelect/Badge (geometry halo, text-node Item,
  полнота spec-sample), плюс правило визуального стиля halo (прозрачный
  background, цвет обводки не связан с Container) — обнаруженное как
  неполно реализованное для `.spec-anatomy-callout__highlight`
  (наличие тональной заливки вместо чистого контура).
