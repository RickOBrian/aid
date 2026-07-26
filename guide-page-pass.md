# Guide Page pass

Отчёт о внедрении шаблона «Developer Guide» для описания компонента в Storybook.

## Что сделано

Реализован reusable **Guide Page layer** — 10-секционный шаблон описания компонента
для designer/product-facing документации, отдельный от существующего engineering
inspection layer (`spec-inspector.js`). Рендерится декларативно из
`window.DS_COMPONENT_GUIDE` в контейнер `<div id="guide-page"></div>`.

### Figma reference

[AGENT] Developer Guide, node `2163:7276` в файле [💎 🦆 DS — Шаблоны гайдов ДС](https://www.figma.com/design/KYF7zGtgKf6iw41xXRDKQq/?node-id=2163-7276).
Конкретные px/radius в референсе — иллюстративны (см. `CLAUDE.md` → «Design System vs UI Kit»):
реализация использует **свои** semantic-токены (`radius-xl`, `gap-l`, `inset-container-*`),
а не буквальные значения из Figma.

## Секции (порядок фиксирован)

1. **Guide Header Detailed** — мокап в боевой среде (placeholder до интеграции скрина), название, описание, версия, статус (Stable/Legacy), статус готовности по платформам (Web/iOS/Android: ready/planned/missing).
2. **Анатомия** — callout-стейдж + легенда. Переиспользует `DS_COMPONENT_SPEC.parts`, если `guide.anatomy` не задан отдельно — данные не дублируются.
3. **Скругления** — `agents.cornerRadius` по каждому radius-токену компонента.
4. **Размеры и отступы** — сначала все размерности (`dimensions`, чипы), затем per-size markup (inset-диаграмма с контентом + gap-bridge), один блок на вариант размера.
5. **Типы заливки** — насыщенность одной семантической группы: Solid → Fade → Ghost → Inverse (последний — с демо-подложкой `backdrop`, т.к. inverse-цвет предназначен для контраста на цветном фоне, не на белой странице).
6. **Appearance** — цветовые варианты внутри одного типа заливки (Main/Success/Warning/Error/Attention), сгруппированы по `fillType`.
7. **Состояния** — Default/Hover/Pressed/Focused/Disabled и т.п.
8. **Область тапа** — рендерится только если `guide.tapArea` задан (компонент/элементы тапабельны).
9. **Ограничения** — min/max width, кол-во строк и т.п., dl-список.
10. **Анимация** — рендерится только если `guide.animation` задан.

Любая секция 3–10 пропускается, если соответствующее поле не передано в `DS_COMPONENT_GUIDE`
(тот же принцип «пустые секции не рендерятся», что и в `spec-inspector.js`).

Секции 2–4 и 7 (анатомия, скругления, размеры/отступы, состояния) не обязательно
передавать явно — они **выводятся из `window.DS_COMPONENT_SPEC`**, той же спеки, что
использует engineering-аудит (`spec-inspector.js`), если поле отсутствует в
`DS_COMPONENT_GUIDE` (`anatomy`/`radius`/`dimensions`/`sizes`/`states`). Явно переданное
поле — даже пустой массив `[]` — приоритетно и трактуется как «скрыть секцию» (используется
для non-interactive компонентов, где авто-вывод states/appearance дал бы шум).

## Затронутые / новые файлы

| Файл | Роль |
|------|------|
| `docs/storybook/guide-page.js` (новый) | Рендерер 10 секций из `DS_COMPONENT_GUIDE`, с fallback-выводом из `DS_COMPONENT_SPEC` |
| `docs/storybook/guide-page.css` (новый) | Стили секций, header, badges, swatch-грид, dim-чипы, constraints |
| `docs/storybook/measure-agents.js` | Вынесена геометрия anatomy callout (`mountAnatomyCallouts`, `findPartEl`) — общая для `spec-inspector.js` и `guide-page.js`, без дублирования |
| `docs/storybook/spec-inspector.js` | Визуальные measure-диаграммы (анатомия/inset/gap/radius-кадры) удалены — теперь только token-аудит: measure-list строки, editable-слой, violations. Визуал — исключительно в Guide Page (см. «Открытый вопрос» ниже) |
| `docs/storybook/components/*.html` (все 9 страниц) | Подключение `guide-page.css`/`.js`, `<div id="guide-page"></div>`, `DS_COMPONENT_GUIDE` — см. таблицу секций по компонентам ниже |

Цвета — только через существующие semantic-токены (`bg-accent-main/fade/ghost/inverse`,
`bg-accent-status-*`, `bg-accent-states-*`, `text-*`). Новых core/semantic токенов
для этого прохода не потребовалось — `color-tokens-registry.md` не менялся.

## Данные компонента: `DS_COMPONENT_GUIDE`

```js
window.DS_COMPONENT_GUIDE = {
  name: 'ButtonText',
  description: '…',
  version: '1.0.0',
  status: 'stable', // 'stable' | 'legacy'
  platforms: [
    { name: 'Web', status: 'ready' },
    { name: 'iOS', status: 'planned' },   // 'ready' | 'planned' | 'missing'
    { name: 'Android', status: 'missing' },
  ],
  // anatomy: не задан → используется DS_COMPONENT_SPEC.parts
  radius: [{ label: 'Container', token: 'radius-full', value: '9999px' }],
  dimensions: [{ label: 'Высота', value: '40px' }],
  sizes: [{
    name: null, // без лейбла — единственный размер
    spacing: [
      { type: 'padding', direction: 'vertical', token: 'inset-control-v-s', value: '8px' },
      { type: 'padding', direction: 'horizontal', token: 'inset-control-h-m', value: '16px' },
      { type: 'gap', direction: 'horizontal', token: 'gap-xs', value: '4px' }, // опционально
    ],
  }],
  fillTypes: [
    { name: 'Solid', bg: 'bg-accent-main', text: 'text-inverse', description: '…' },
    { name: 'Inverse', bg: 'bg-accent-inverse', text: 'text-accent', backdrop: 'bg-accent-main' },
  ],
  appearance: [
    { fillType: 'Solid', variants: [{ name: 'Main', bg: 'bg-accent-main', text: 'text-inverse' }] },
  ],
  states: [{ name: 'Default', bg: 'bg-accent-main', text: 'text-inverse' }],
  tapArea: { text: '…', value: '40×96px' },
  constraints: [{ label: 'Мин. ширина', value: '<code>96px</code> — …' }],
  animation: { text: '…' },
};
```

Подключение (порядок скриптов важен: `measure-agents.js` → `guide-page.js` → рендер;
`DS_COMPONENT_SPEC`/`DS_COMPONENT_GUIDE` должны быть объявлены до вызова `render`):

```html
<div id="guide-page"></div>
…
<script>window.DS_COMPONENT_SPEC = { … };</script>
<script>window.DS_COMPONENT_GUIDE = { … };</script>
<script src="../measure-agents.js"></script>
<script src="../guide-page.js"></script>
<script>DSGuidePage.render(document.getElementById('guide-page'));</script>
<script src="../spec-inspector.js"></script>
```

## Verification

Все 9 страниц прогнаны через headless DOM (jsdom): полный порядок `<script>`-тегов
исполнен как в браузере, проверено отсутствие JS-ошибок и корректный набор
смонтированных секций (см. таблицу ниже) для каждой страницы.

## Открытый вопрос — решён (guide-only)

Изначально на странице был риск дублирования: новый Guide Page (продукт-фейсинг визуал)
и `spec-inspector.js` (тот же визуал + editable-токены/confidence/violations). Решение
принято — **guide-only**: визуальные measure-диаграммы (анатомия, inset/gap-кадры,
radius-кадры) убраны из `spec-inspector.js`, единственное место для них — Guide Page.
`spec-inspector.js` остаётся engineering-слоем: measure-list строки со ссылкой на токен,
inline/dropdown редактирование, confidence, violations — без визуального повтора.

## Роллаут — все 9 component spec pages

Выполнен на всех страницах `docs/storybook/components/*.html`. Секции 3–10 не заполнялись
вручную там, где нет содержательных данных (например, `states`/`fillTypes`/`appearance` для
некликабельных компонентов вроде `Chip`) — вместо этого поле явно выставлено в `[]`, чтобы не
провоцировать шумный auto-вывод из аудит-данных, не предназначенных для этой секции
(например, «variant: stable/draft» у `Badge` — это Appearance, а не Состояния).

| Страница | Анатомия/Скругления/Размеры | Типы заливки / Appearance | Состояния | Тап-область | Ограничения | Анимация |
|---|---|---|---|---|---|---|
| `storybook-button.html` (ButtonText) | явно (флагман) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `card.html` | derived | — | — (non-interactive) | — | ✓ | — |
| `button-icon.html` | derived | — | ✓ | ✓ | ✓ | — |
| `badge.html` | derived | ✓ (Appearance = 4 варианта цвета) | — (non-interactive) | — | — | — |
| `chip.html` | derived | — | — (non-interactive) | — | — | — |
| `chip-select.html` | derived | ✓ (Inverse/Fade × Neutral/Accent) | ✓ (Off/On/Pressed) | ✓ | ✓ (off-pressed gap) | — |
| `search.html` | derived | — | ✓ (Default/Focused) | — | ✓ | — |
| `table.html` | derived | — | — (row-hover — на уровне TableRow, draft) | — | ✓ | — |
| `color-swatch.html` | derived | — | — (read-only) | — | ✓ | — |

## Как раскатить на новую component spec page

1. Подключить `<link rel="stylesheet" href="../guide-page.css">` и `<div id="guide-page"></div>`
   перед существующим `storybook-page-header` (breadcrumb — вынести из `<header>`, выше `guide-page`).
2. Заполнить `DS_COMPONENT_GUIDE` минимумом: `name`, `description`, `version`, `status`, `platforms`.
   Анатомия/скругления/размеры/состояния — по умолчанию выводятся из `DS_COMPONENT_SPEC`;
   переопределять вручную только когда авто-вывод даёт неточный результат.
3. Для fillTypes/appearance/tapArea/constraints/animation — заполнять только там, где данные
   содержательны; для states/anatomy/radius/sizes на non-interactive компонентах — явно `[]`,
   если авто-вывод был бы шумным или семантически неверным (см. таблицу выше).
4. Подключить `guide-page.js` и вызвать `DSGuidePage.render(...)` после определения
   `DS_COMPONENT_SPEC`/`DS_COMPONENT_GUIDE`, до или после `spec-inspector.js` — порядок
   между ними не важен, т.к. они используют независимые DOM-контейнеры и стейджи.
