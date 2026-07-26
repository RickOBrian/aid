# TableRow — Spec

**Уровень:** Structural View
**Платформы:** Web (ready) · iOS / Android — вне scope по решению из `spec-003` (см. «Открытые вопросы», п. 3)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/table.html` (слот `content`), `docs/assets/docs-theme.css` (строки 313–329), рендереры инстансов — `docs/storybook/colors-editor.js`, `typography-editor.js`, `product-tokens-viewer.js`, `product-typography-viewer.js`.

Файловая форма ранее закрытой спеки `spec-003` (лог `memory/ds-component-spec/log.sergej.json`, `stage: final`).

## Назначение

Строка таблицы: композиция ячеек одной записи данных под колоночным контрактом родительской `Table`. Опционально кликабельна (`is-clickable`) — тогда получает hover-подсветку и указатель. Не отвечает за раскладку колонок (её задаёт `Table`) и не хранит состояние выбора.

## Уровень и обоснование

**Structural View** — по трём независимым признакам:

1. **Прямой пример в гайде.** `ds-component-architecture-guide.md`, раздел 6: «Row — самый частый Structural View» (ListRow, MenuRow, IslandRow, BottomSheetRow).
2. **Критерий `SKILL.md` v1.3.0 (Шаг 2).** Ячейки строки хостят самостоятельные Role/Entity-компоненты: `ColorSwatch` (`colors-editor.js`, включая alpha-вариант) и `Chip` (`product-tokens-viewer.js`, legacy-метка). Это ≥2 самостоятельных компонента внутри одного → Structural View, а не Surface View.
3. **Самостоятельность и переиспользование.** Строка рендерится четырьмя независимыми модулями и присутствует на всех страницах с таблицами; в `memory/ds-component-migration/log.sergej.json` прямо зафиксировано: «реальные TableRow-инстансы рендерятся этими файлами, не статичным HTML». Поэтому строка вынесена в отдельный spec, а не описана внутри `Table.md`.

Ячейка (`<td>`) собственным компонентом не является: у неё нет имени, вариантов и переиспользования вне строки — это зона с inset и нижним разделителем.

## Нейминг

- **Имя:** TableRow
- **Формула:** Entity (Table) + Role (Row) — исторически принятый порядок для строчных компонентов таблицы; Role-семья Row зафиксирована в разделе 6 гайда.
- **Слоты:** `content` (repeatable — ячейки строки по колоночному контракту `Table`)

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Cell (`<td>`) | Зона строки (Item-контейнер) | Да | Нет | Inset (`inset-control-v-m` / `inset-container-h-s`), нижний разделитель `line-default`, `vertical-align: top`. Количество ячеек задаётся колоночным контрактом `Table`. |
| 2 | Cell text | Item | Да (для текстовых ячеек) | Нет | Значение записи, роль `body-s`. |
| 3 | ColorSwatch в ячейке | ❖ Surface View (nested) | Нет | Да | Встречается в строках `colors-editor.js` (solid и alpha-варианты); отдельный компонент со своим spec (`ColorSwatch.md`). |
| 4 | Chip в ячейке | ❖ Surface View (nested) | Нет | Да | Метка `LEGACY` в строках `product-tokens-viewer.js`; отдельный компонент со своим spec (`Chip.md`). |

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| padding ячейки (верт.) | — | `inset-control-v-m` |
| padding ячейки (гориз.) | — | `inset-container-h-s` |
| border-bottom ячейки | `core-neutral-x-15` | `line-default` |
| border-bottom (последняя строка) | — | `none` — разделитель снимается у `tr:last-child`, чтобы не дублировать рамку wrapper'а |
| typography | — | `body-s-size` / `body-s-lh` |
| background (hover, только `is-clickable`) | `core-sapphire-55-a08` | `bg-accent-states-hover` |
| cursor (`is-clickable`) | — | `pointer` (не токенизируется) |

Собственного фона у строки нет — она наследует `bg-card-main` от таблицы.

## Варианты

| Variant | Описание |
|---|---|
| Default | Некликабельная строка данных: только inset, типографика и разделитель. |
| `is-clickable` | Кликабельная строка: `cursor: pointer` + hover-подсветка ячеек (`bg-accent-states-hover`). |

## Состояния

| Состояние | Визуальное изменение | Semantic-токен |
|---|---|---|
| default | — | — |
| hovered | фон ячеек подсвечивается (только при `is-clickable`, только Web) | `bg-accent-states-hover` |

Остальные состояния (pressed, focused, selected, disabled, loading, skeleton, error) намеренно отсутствуют — решение Principal Designer из `spec-003`: «States for TableRow are not required without a concrete usage scenario, closing as-is». Это декларативное решение, а не отложенный пробел: состояния проектируются при появлении реального сценария.

## Реализация — Web (React)

```tsx
<TableRow isClickable onClick={handleRowClick}>
  <TableRow.Cell>bg-accent-main</TableRow.Cell>
  <TableRow.Cell><ColorSwatch token="bg-accent-main" /></TableRow.Cell>
  <TableRow.Cell><Chip>LEGACY</Chip></TableRow.Cell>
</TableRow>
```

⚠️ Компонента в коде нет — API гипотетический; инстансы собираются строковыми шаблонами в JS-рендерерах.

## Реализация — iOS (SwiftUI)

Вне scope по решению из `spec-003` (нет кейса нативного использования).

## Реализация — Android (Compose)

Вне scope по решению из `spec-003` (нет кейса нативного использования).

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | семантика | нативный `<tr>` внутри `<tbody>`; ячейки — `<td>` |
| Web | клавиатура | ⚠️ при `is-clickable` строка кликабельна только мышью: нет `tabindex`, роли и обработки Enter/Space (см. «Открытые вопросы», п. 1) |
| Web | touch target | высота строки складывается из `inset-control-v-m` (10px × 2) + `body-s-lh` (20px) = 40px — меньше 44px из правил проекта (см. «Открытые вопросы», п. 2) |

## Открытые вопросы

1. ⚠️ Требует уточнения: кликабельная строка (`is-clickable`) не доступна с клавиатуры — нет `tabindex`, роли и клавиатурной активации. Нужно решить, оформляется ли клик на строке как полноценный интерактивный контракт (`role="button"` / ссылка внутри ячейки) или остаётся вспомогательным hover-аффордансом.
2. ⚠️ Требует уточнения: расчётная высота кликабельной строки — 40px против 44px touch target из правил проекта. Увеличивать inset или зафиксировать исключение для табличных строк?
3. ⚠️ Требует уточнения: расхождение по платформам — `spec-003` фиксирует web-only, а `DS_COMPONENT_GUIDE` родительской `table.html` показывает iOS/Android как `planned`. Что считать актуальным?

---

**Стадия:** draft (файловая форма ранее закрытой `spec-003`; открыты вопросы 1–3, найденные при переносе в файл)
