# Measure presentation pass

Отчёт о перестройке presentation spatial-значений на component spec pages.

## Что сделано

Внедрён reusable **spatial measure presentation layer** в общем inspection framework (`spec-inspector.js` + `storybook-spec-inspector.css`). Логика применяется автоматически ко всем 8 component spec pages, где объявлены `aspects.spacing` и/или `aspects.borders` — без дублирования разметки на каждой странице.

### Принципы presentation (по Figma reference, только композиция)

1. **Один тип пространственного отношения = один measure-кадр** — не смешиваем outer inset, inner gap, zone offset и radius в одном preview.
2. **Классификация по смыслу**, не по порядку в spec:
   - `outer-inset` — padding / inset / margin контейнера;
   - `inner-gap` — gap между соседними слотами;
   - `zone-offset` — margin-top / margin-bottom между зонами;
   - `inner-offset` — направленный внутренний отступ (padding-left под иконку и т.п.);
   - `radius` — отдельный visual block в borders;
   - `border-line` — только таблица значений, без spatial frame.
3. **Двухслойная подача**: сверху visual measure-кадр, ниже блок «Привязка и редактирование» с существующими `spec-measure` строками (editable framework не тронут).
4. **Nested scope** — записи частей с `part.nested` выносятся в отдельный dashed-контейнер «Nested scope» с attribution-ссылкой; measure родителя не смешивается с internals вложенного компонента.
5. **Source chips** на callout'ах: `editable` | `token` | `hardcode` | `derived` — без подмены derived в editable.
6. **Ось измерения** — метка `vert` / `horiz` / `gap` / `above` / `below` на каждом callout.
7. **Масштаб band/gap** — ширина inset-band и gap-bridge берётся из resolved px токена (или shorthand `8px 16px`), с clamp 6–48px для читаемости диаграммы.

## Затронутые файлы

| Файл | Роль |
|------|------|
| `docs/storybook/spec-inspector.js` | Классификация spatial groups, diagram renderers, nested partition, refresh spatial annotations |
| `docs/storybook/storybook-spec-inspector.css` | Стили measure-кадров: inset shell, gap bridge, zone offset, radius corner, nested scope |

Component spec pages **не менялись** — presentation наследуется из `DS_COMPONENT_SPEC.aspects` через общий inspector.

## Как теперь показывается

### Radius
- Отдельная группа **Corner radius** в блоке «Границы и радиусы».
- Visual: box с унаследованным `border-radius` от semantic-токена, corner callout, label с chip + token + resolved px.
- Derived (без `edit`) — пометка «derived — декларация может перекрываться другим stylesheet» (например ButtonIcon, Card hover border).

### Outer spacing
- Группа **Outer / container inset**.
- Visual: shell top/left/right/bottom bands с подписями сторон; band-height/width из resolved токена.
- Примеры: Card container padding, Chip inset-control, Search input padding, Table header cell padding.

### Inner gaps
- Группа **Inner slot-to-slot gaps**.
- Visual: bridge `slot A —— measure —— slot B` с dimension line; ширина bridge ≈ resolved gap.
- Примеры: Card header/footer gap, Chip root gap.

### Zone spacing
- Группа **Zone spacing** для margin-top / margin-bottom между зонами.
- Visual: vertical stack upper zone → arrow → callout → lower zone.
- Примеры: Card header margin-bottom, footer margin-top.

### Derived / hardcode / nested

| Case | Presentation |
|------|----------------|
| **editable + token** | chip `editable`, typed dropdown в measure-строке ниже |
| **token, no edit** | chip `token` или `derived` (если override) |
| **hardcode** | chip `hardcode`, dashed red styling в measure-строке; band size из literal value |
| **nested part** | отдельный `spec-spatial-scope--nested`, dashed border, ссылка на spec вложенного компонента |
| **inner-offset** | отдельная группа (Search padding-left под иконку) |

## Browser verification

Проверено локально на `http://localhost:3335`:

- **Card** — 3 spacing-группы (outer inset, inner gap, zone offset) + radius frame; editable dropdowns работают.
- **Table** — parent header inset + nested scope для TableRow с attribution.
- **Chip** — gap + outer inset в отдельных кадрах.
- **Search** — outer inset (vert/horiz axes) + inner offset (padding-left 36px, hardcode chip) в отдельных кадрах.

После `DSSpecInspector.refresh()` (theme switch / post-edit) обновляются resolved значения в callout'ах и band/gap размеры диаграмм.

## Ограничения

1. **Схематичные диаграммы**, не pixel-perfect overlay на живой сэмпл — цель: топология и ось, не 1:1 с DOM.
2. **Классификация по `property` string** — нестандартные названия попадают в `other`; при необходимости уточнять property в spec data.
3. **Shorthand padding** парсится только для literal `Npx` форм (`8px 16px`); calc/rem не масштабируют band.
4. **Border stroke** без spatial frame — только measure-таблица (намеренно: stroke ≠ геометрия inset).
5. **ButtonIcon / ColorSwatch** — spacing пуст или минимален; radius может быть derived.
6. **Figma reference** (`node-id=1374-5663`) — MCP не вернул node (возможно удалён или недоступен); композиция кадров реализована по требованиям задачи и существующим паттернам repo. Токены, значения и naming — только из repo.

## Reusable pattern (для новых spec pages)

Достаточно объявить записи в `aspects.spacing` / `aspects.borders` с понятным `property`:

```js
spacing: [
  { part: 'root', property: 'padding (верт.)', token: 'inset-control-v-s', edit: { … } },
  { part: 'root', property: 'gap', token: 'gap-xs', edit: { … } },
  { part: 'header', property: 'margin-bottom', token: 'gap-s', edit: { … } },
],
borders: [
  { part: 'root', property: 'border-radius', token: 'radius-m', edit: { … } },
]
```

Inspector автоматически разложит по spatial groups и отрисует measure-кадры.
