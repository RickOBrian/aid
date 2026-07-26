# Table — Spec

**Уровень:** Structural View
**Платформы:** Web (ready) · iOS / Android — вне scope по решению из `spec-002` (см. «Открытые вопросы», п. 4)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/table.html` (presentbook), `docs/assets/docs-theme.css` (строки 274–329), рендереры строк — `docs/storybook/colors-editor.js`, `typography-editor.js`, `product-tokens-viewer.js`, `product-typography-viewer.js`, `docs/assets/docs-tables.js`.

Файловая форма ранее закрытой спеки `spec-002` (лог `memory/ds-component-spec/log.sergej.json`, `stage: final`). При переносе в файл найдены расхождения с логом — вынесены в «Открытые вопросы».

## Назначение

Табличное представление данных: опциональная шапка с именами колонок и повторяющиеся строки. Используется на страницах токенов (`colors.html`, `typography.html`, product-viewer'ы) и в гайдах документации. Не отвечает за сортировку, фильтрацию, пагинацию и выбор строк — таких механизмов в реализации нет.

## Уровень и обоснование

**Structural View**, не Layout. Обоснование по трём признакам из `ds-component-architecture-guide.md`:

1. **Собственное оформление.** `.table-wrap` задаёт рамку (`line-default`), скругление (`radius-l`), `overflow: hidden`; `table` — фон `bg-card-main`; `thead` — собственный фон и типографику. Layout по разделу 7 гайда «никогда не трогает внутренний дизайн» и не имеет собственной поверхности (VStack, HStack, Grid, List). Table имеет — значит это не Layout.
2. **Именованные слоты + внутренний макет.** Два слота: `header` (опциональный, `<thead>`) и `content` (repeatable, `<tbody>`, каждый `<tr>` — экземпляр `TableRow`). Раздел 6: Structural View — компонент с несколькими именованными слотами и внутренним макетом.
3. **Смысловая роль.** Table задаёт колоночный контракт, общий для шапки и строк: ширина и порядок колонок в `<thead>` определяют раскладку всех `TableRow`. Layout только расставляет готовые дочерние элементы и не связывает их общим контрактом.

**Layout-уровня DS-компонента внутри Table нет.** Вертикальная раскладка строк выполняется нативным `<table>`/`<tbody>` — это внутренний макет Structural View, а не отдельный компонент системы. Внешнее размещение самой таблицы на странице — задача родительского Layout (см. нарушение с `margin-bottom` в «Открытых вопросах», п. 2).

## Разбивка по уровням архитектуры

| Уровень | Что относится | Почему |
|---|---|---|
| **Item** | Текст заголовка колонки (контент `<th>`), значение ячейки (контент `<td>`) | Только контент: нет собственного фона, формы, отступов — inset приходит от ячейки. |
| **Surface View** | Собственных нет. Вложенными приходят `ColorSwatch` (`colors-editor.js`) и `Chip` (`product-tokens-viewer.js`) — как контент ячеек | Ячейки (`<th>`/`<td>`) не выделены в отдельный компонент: нет имени, вариантов и переиспользования вне Table — это зоны с inset и разделителем, а не Surface View. |
| **Structural View** | `TableRow` (строка как композиция ячеек, собственное поведение `is-clickable`) и сама `Table` | Строка — самостоятельная переиспользуемая сущность, рендерится четырьмя независимыми модулями; см. `TableRow.md`. |
| **Layout** | Нет DS-компонента этого уровня | Раскладка строк — нативный `<tbody>` внутри Structural View; внешнее положение таблицы задаёт родительский Layout страницы. |

## Нейминг

- **Имя:** Table
- **Формула:** устоявшееся имя (как Dialog/Badge в списке исключений `SKILL.md`, Шаг 3); Role + Entity не применяется буквально.
- **Слоты:** `header` (опциональный), `content` (repeatable) — стандартные имена из раздела 9 гайда.

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Header (слот `header`) | Зона Structural View (`<thead>`) | Нет | Да | Опциональный слот, зафиксирован как опциональный в presentbook-контракте; CSS наличия `<thead>` не требует. Содержит header-ячейки с Item-текстом. |
| 2 | Header cell label | Item | Да, если слот `header` присутствует | Нет | Текст имени колонки: `label-xs` strong, uppercase, `text-secondary`. |
| 3 | Row (слот `content`) | ❖ Structural View (nested) | Да | Нет | Repeatable-слот: каждый `<tr>` — экземпляр `TableRow` (`TableRow.md`). Без строк таблица не несёт данных. |
| 4 | Cell (`<td>` / `<th>`) | Зона внутри строки (Item-контейнер) | Да | Нет | Inset + нижний разделитель; собственного компонента-ячейки в системе нет (см. «Разбивка по уровням»). |
| 5 | Cell content | Item / ❖ Surface View (nested) | Да | Нет | Обычно текст (Item). В live-инстансах встречаются вложенные `ColorSwatch` и `Chip` — самостоятельные компоненты со своими spec. |

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| border (wrapper) | `core-neutral-x-15` | `line-default` |
| border-radius (wrapper) | — | `radius-l` |
| margin-bottom (wrapper) | — | убран из компонента — решено (`spec-010`, см. «Открытые вопросы», п. 2); внешний отступ теперь задаёт родительский Layout-контейнер |
| background (table) | `core-neutral-x-0` | `bg-card-main` |
| background (thead / th) | `core-neutral-x-10` | `bg-base-main-secondary` |
| color (th) | `core-neutral-x-60` | `text-secondary` |
| padding ячейки (верт., th/td) | — | `inset-control-v-m` |
| padding ячейки (гориз., th/td) | — | `inset-container-h-s` |
| border-bottom (th/td) | `core-neutral-x-15` | `line-default` |
| typography (th) | — | `label-xs-size` / `label-xs-lh` / `label-xs-weight-strong` |
| letter-spacing (th) | — | ⚠️ `0.05em` захардкожен; `label-tracking-uppercase-header` описан только в `semantic-typography-tokens-guide.md` — не заведён ни на Core (`type-tracking-0_6`), ни на Semantic уровне системы токенов (Blocker, см. «Открытые вопросы», п. 1) |
| typography (td) | — | `body-s-size` / `body-s-lh` |
| background строки (hover, `is-clickable`) | `core-sapphire-55-a08` | `bg-accent-states-hover` — контракт разворачивается в `TableRow.md` |

## Варианты

| Variant | Описание |
|---|---|
| Static | Статичная разметка в HTML; `docs-tables.js` автоматически оборачивает любой `<table>` в `.table-wrap`. |
| Interactive-generated | Строки рендерятся JS-шаблоном (`typography-editor.js`, `colors-editor.js`, `product-tokens-viewer.js`, `product-typography-viewer.js`); mapping этой группы на компонентную модель не решён (`memory/ds-component-migration/log.sergej.json`, `migration-001`). |

## Состояния

Собственных состояний у Table нет — компонент не интерактивен (`interactive: false` в presentbook). Строковые состояния (`hover` при `is-clickable`) описаны в `TableRow.md`. Состояния коллекции (empty / loading / error) Table не обрабатывает — по разделу 7 гайда это ответственность родительского экрана или CollectionView.

## Реализация — Web (React)

```tsx
<Table
  header={<TableRow header cells={['Token', 'Value', 'Status']} />}
  content={rows.map(row => <TableRow key={row.id} cells={row.cells} isClickable />)}
/>
```

⚠️ Компонента в коде нет — API гипотетический; в репозитории только статичная разметка и JS-рендереры строк.

## Реализация — iOS (SwiftUI)

Вне scope по решению из `spec-002` (нет кейса нативного использования).

## Реализация — Android (Compose)

Вне scope по решению из `spec-002` (нет кейса нативного использования).

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | семантика | нативные `<table>` / `<thead>` / `<tbody>` / `<th scope="col">` — заголовки колонок должны объявляться через `scope` |
| Web | клавиатура | при `is-clickable` строка должна быть достижима с клавиатуры (сейчас — только `cursor: pointer`, без `tabindex`/роли; см. `TableRow.md`) |
| Web | aria-sort | не применяется — сортировки нет |

## Открытые вопросы

1. **Blocker — открыт.** `.table-wrap th { letter-spacing: 0.05em }` остаётся хардкодом. Токен `label-tracking-uppercase-header` существует только в документации (`semantic-typography-tokens-guide.md`) — физически не заведён ни на Core-уровне (`type-tracking-0_6`), ни на Semantic-уровне системы токенов (нет CSS-переменных ни в `docs/assets/style.css`, ни в `docs-theme.css`). Это отдельная задача «завести токен на обоих уровнях», не правка `.table-wrap th` (подтверждено в `memory/ds-component-spec/log.sergej.json`, `spec-010`).
2. **Blocker — решён (`spec-010`, 2026-07-25).** `.table-wrap { margin-bottom: 1.5em }` удалён из компонента — Structural View больше не задаёт себе внешний отступ. Отступ перенесён на родительский Layout-контейнер: `.guide-content .table-wrap { margin-bottom: var(--gap-l) }` в `docs/assets/docs-theme.css` — единственное место, где `.table-wrap` рендерится в потоке контента без собственного group-отступа (`colors.html`/`typography.html` не затронуты — там отступ между таблицами уже задавали `.color-token-group`/`.storybook-token-group`). См. `memory/ds-component-spec/log.sergej.json` (`spec-010`).
3. ⚠️ Требует уточнения: `table.html` ссылается на раздел «Repeatable Slot / Cell Span» в `ds-component-architecture-guide.md` (v1.3.0), но такого раздела в файле нет. Вопрос: раздел не был добавлен или переименован? От этого зависит формальный статус контракта repeatable-слота.
4. ⚠️ Требует уточнения: расхождение по платформам — `spec-002`/`spec-003` фиксируют web-only («iOS/Android осознанно убраны из scope»), а `DS_COMPONENT_GUIDE` в `table.html` показывает iOS/Android как `planned`. Что считать актуальным?
5. ⚠️ Требует уточнения: контракт колонок — количество колонок и обязательность `<th>` для каждой колонки нигде не зафиксированы (в presentbook 3 колонки, в live-таблицах редакторов 5). Нужен ли явный column-контракт и поддержка `colspan`?
6. ⚠️ Требует уточнения: сортировка и пагинация. В коде их нет (проверено: нет `aria-sort`, `data-sort`, sortable-заголовков, пагинации; `.sort()` в JS — только подготовка данных). Вопрос: планируются ли они в контракте Table и, если да, оформляются ли как отдельные компоненты (sort-контрол в `<th>` → Surface View; пагинация → отдельный Structural View), а не как внутренняя логика Table?

---

**Стадия:** draft (файловая форма ранее закрытой `spec-002`; открыты вопросы 1, 3–6 — вопрос 2 закрыт `spec-010`)
