---
destination: skills/_shared/
name: ds-component-architecture-guide
metadata:
  version: "1.3.0"
  owner: design-system-team
  platforms: [web, ios, android]
description: >
  Четырёхуровневая архитектура компонентов дизайн-системы:
  Item → Surface View → Structural View → Layout.
  Правила определения уровня, нейминга, слотов, состояний и lifecycle.
---

# Архитектура компонентов дизайн-системы

> Статус: Draft · v1.3.0

---

## 1. Четыре уровня — быстрая таблица

| Уровень | Назначение | Примеры |
|---------|-----------|---------|
| 1 — Item | Только контент, без оболочки | Icon, Text, Image, Number, Dot |
| 2 — Surface View | Один контент-элемент в оболочке | Badge, Button, Avatar, Tag, Switch |
| 3 — Structural View | Два+ именованных слота, составной макет | ListRow, Island, Widget, NavBar |
| 4 — Layout | Только расстановка группы компонентов | VStack, HStack, Grid, List |

Вопросы для быстрого определения уровня:
1. Только контент без оболочки (фона/формы)? → Item
2. Один визуальный элемент в оболочке? → Surface View
3. Несколько именованных слотов? → Structural View
4. Только расстановка компонентов? → Layout

---

## 2. Дерево компонентов — пример

```
AppSurface (Layout)
└── VStack (Layout)
    ├── IslandProduct (Structural View)
    │   ├── SurfaceMedia (Surface View)
    │   │   └── Image (Item)
    │   ├── Text (Item)
    │   └── BadgeStatus (Surface View)
    │       └── Text (Item)
    └── WidgetBalance (Structural View)
        ├── Text (Item)
        ├── Number (Item)
        └── HStack (Layout)
            └── ButtonIcon (Surface View)
                └── Icon (Item)
```

Правила чтения дерева:
- Item — всегда листья
- Surface View и Structural View — промежуточные узлы
- Layout — не имеет дизайна, только расстановка

---

## 3. App Surface

| Токен | Назначение |
|-------|-----------|
| `AppSurface` / `PageSurface` | Корневой фон экрана |
| `Screen` | Полноэкранный контейнер |
| `Section` | Семантическая зона экрана |
| `Zone`  | Вложенная зона внутри Section |

App Surface — не уровень архитектуры. Это корневой контейнер экрана,
который задаёт фон и не управляет UI-логикой.

---

## 4. Level 1 — Item

Item содержит только контент. Никаких фонов, форм и отступов.

| Компонент | Примечание |
|-----------|-----------|
| Icon | SVG-иконка |
| Text | Текстовый элемент |
| Image | Изображение |
| Number | Числовое значение |
| Count | Счётчик |
| Dot | Индикаторная точка |
| AvatarImage | Изображение аватара |

Item — строительный блок. Он не знает о контексте — только о своём содержимом.
`IconItem`, `TextItem` — неправильные имена для самостоятельных компонентов.
`Item` допустим только как вложенный элемент коллекции: `List.Item`, `Menu.Item`, `Accordion.Item`.

---

## 5. Level 2 — Surface View

Surface View — один основной контент-элемент в оболочке (фон + форма + отступы).
Вспомогательный элемент допустим (иконка рядом с текстом в Badge),
если нет второго **именованного** слота.

| Компонент | Примечание |
|-----------|-----------|
| Badge | Бейдж без вариантов |
| BadgeStatus | Бейдж со статусной точкой |
| BadgeCount | Бейдж с числом |
| Tag | Тег, фильтр |
| Chip | Chip-контрол |
| IconSurface | Иконка в оболочке |
| ButtonIcon | Кнопка-иконка |
| Avatar | Аватар с online-badge |
| AvatarButton | Avatar как кнопка |
| ButtonText | Текстовая кнопка |
| Switch | Переключатель |
| Checkbox | Чекбокс |
| Radio | Радиокнопка |

**Граничные случаи:**
- Switch, Checkbox, Radio без внешнего Label → Surface View.
  С внешним Label (FieldCheckbox, FieldRadio) → Structural View.
- StatTile кажется Surface View, но у него два равнозначных именованных слота
  (Label + Value) → Structural View.
- Именованные варианты формы: `IconSurface`, `MediaSurface` — Surface View,
  не самостоятельные уровни.

---

## 6. Level 3 — Structural View

Structural View имеет два и более именованных слота и составной внутренний макет.
Задаёт компоненту смысловую роль.

### Row-компоненты

| Компонент | Назначение |
|-----------|-----------|
| ListRow | Строка списка |
| BottomSheetRow | Строка в шторке |
| IslandRow | Строка в Island |
| MenuRow | Строка меню |
| TableRow | Строка таблицы (repeatable cell-слот, см. раздел 9 «Исключение: Row-компоненты») |

### Field-компоненты

| Компонент | Состав |
|-----------|-------|
| StatTile | Label + Value + Trend |
| FieldCheckbox | Checkbox + Label |
| FieldRadio | Radio + Label |

### Island и Widget

| Вопрос | Island | Widget |
|--------|--------|--------|
| Больше 3 элементов? | ✓ (могут быть) | Обычно ≤ 3 |
| Список внутри? | GridList (IslandRules, IslandHotel) | Редко |
| Компактный блок аналитики? | — | WidgetBalance, WidgetSummary |

Критерий: Island — составной блок с контентом и структурой.
Widget — самодостаточный аналитический блок с фиксированной структурой.
Island может содержать Grid и List. Widget — нет.

### Специальные Structural View

| Компонент | Назначение |
|-----------|-----------|
| Banner | Информационный баннер |
| Toast | Уведомление |
| EmptyState | Состояние пустоты |

### Навигационные

| Компонент | Состав |
|-----------|-------|
| NavBar | Header + кнопки |
| TabBar | Набор Tab-кнопок |
| Menu | MenuRow-элементы |
| BottomSheet | Header + Body + Footer |
| Dialog | Header + Body + Footer |
| SidePanel | Панель |

---

## 7. Level 4 — Layout

Layout — только расстановка группы компонентов. Нет собственного дизайна.

| Компонент | Параметр |
|-----------|---------|
| VStack | gap |
| HStack | gap |
| List | — |
| GroupedList | — |
| Grid | gap |
| Carousel | — |
| Wrap | Перенос строк |

Layout не управляет состояниями empty / loading / error.
Решение что рендерить (данные / skeleton / EmptyState / ошибку) — на стороне
вызывающего экрана или CollectionView.
Layout — это чистая расстановка. Логика в нём — антипаттерн.

---

## 8. Поведение компонентов

### Состояния

Нейминг состояний, маппинг платформ, правила комбинирования и приоритет
поглощения — в `component-states-guide.md`.

**Item** — собственных состояний нет. Получает цвет/opacity от родителя через токены.

**Surface View** — несёт локальные состояния одного визуального ядра:

| Состояние | Описание                           |
|-----------|------------------------------------|
| default   | Нормальное состояние               |
| hovered   | Наведение курсора (только Web)     |
| pressed   | Момент нажатия                     |
| focused   | Фокус (клавиатура, скринридер)     |
| selected  | Выбранное состояние                |
| disabled  | Неактивное состояние               |
| loading   | Спиннер внутри компонента          |
| skeleton  | Серые заглушки при первой загрузке |
| error     | Ошибка валидации (только контролы форм) |

**Structural View** — несёт те же состояния и дополнительно:

| Состояние            | Описание                                                                |
|----------------------|-------------------------------------------------------------------------|
| expanded / collapsed | Для аккордеонов, шторок, разворачиваемых блоков                         |
| loading (составной)  | Отдельные зоны компонента могут быть в loading независимо друг от друга |
| disabled (составной) | Отдельные слоты могут быть disabled, не переводя весь компонент         |

### Lifecycle Structural View

Компоненты с поведением появления/исчезновения (BottomSheet, Dialog, Menu, Toast)
требуют явного определения кто управляет их lifecycle.

**Правило:** компонент **не управляет собственным появлением**. Он принимает
проп `isVisible` / `isPresented` и управляет только анимацией внутри себя.
Решение показать или скрыть — всегда на стороне вызывающего экрана или координатора.

| Зона ответственности              | Компонент | Вызывающий экран |
|-----------------------------------|-----------|-----------------|
| Анимация появления / исчезновения | ✅         | ❌               |
| Решение когда показать            | ❌         | ✅               |
| Решение когда скрыть              | ❌         | ✅               |
| Передача данных внутрь            | ❌         | ✅               |

**Skeleton / Loading — разделение ответственности:**
- Компонент **принимает проп** (`isSkeleton`, `isLoading`) и рендерит нужный вид
- Экран или CollectionView **решает когда** передать этот проп — исходя из состояния данных
- Компонент не знает об источнике данных; экран не знает как рендерить заглушку

---

## 9. Нейминг

### Формула: Role + Entity

- **Role** — тип компонента: `Button`, `Badge`, `Island`, `Widget`, `Row`, `Field`, `Surface`
- **Entity** — тип содержимого: `Text`, `Icon`, `Product`, `Balance`
- **Qualifier** (опционально) — `Floating`, `Compact`, `Inline`, `Grouped`

| Компонент    | Role    | Entity  |
|--------------|---------|---------|
| ButtonText   | Button  | Text    |
| ButtonIcon   | Button  | Icon    |
| IslandProduct| Island  | Product |
| WidgetBalance| Widget  | Balance |

Role — первый в имени. IDE-автодополнение группирует по Role.
Button → ButtonText, ButtonIcon, ButtonDestructive.
Entity не дублируется: Avatar, Badge, Tag, Chip, Dialog — устоявшиеся имена без формулы.

### Role-семьи

| Role   | Уровень        | Варианты                           |
|--------|----------------|------------------------------------|
| Button | Surface View   | ButtonText, ButtonIcon             |
| Badge  | Surface View   | BadgeStatus, BadgeCount            |
| Tag    | Surface View   | TagFilter, TagCategory             |
| Chip   | Surface View   | ChipFilter, ChipInput              |
| Row    | Structural View| RowList, RowMenu                   |
| Island | Structural View| IslandProduct, IslandHotel         |
| Widget | Structural View| WidgetBalance, WidgetSummary       |

### Исключение: Row-компоненты

Устоявшиеся Row-компоненты (`ListRow`, `MenuRow`, `BottomSheetRow`, `IslandRow`,
`TableRow`) сохраняют legacy-формулу Entity+Role (Row — в конце имени) и не
переименовываются в формат RoleX. `RowList`/`RowMenu` в таблице Role-семей
выше — иллюстративный пример формулы, не действующее имя компонента.

Новые Row-компоненты, вводимые после v1.1.0, также следуют устоявшемуся
паттерну Entity+Row для консистентности с уже существующими именами, а не
формуле Role+Entity из этого раздела.

### Слоты Structural View

| Слот      | Назначение                    | Реализация                     |
|-----------|-------------------------------|--------------------------------|
| `leading` | Ведущий элемент (левый/верх)  | React props, SwiftUI @ViewBuilder, Compose lambda |
| `content` | Основной контент              | — |
| `trailing`| Завершающий элемент           | — |
| `badge`   | Оверлейный бейдж              | — |
| `header`  | Заголовочная зона             | — |
| `footer`  | Нижняя зона                   | — |

Слоты — кросс-платформенные. Одинаковые имена на Web, iOS, Android.

### Repeatable Slot

Repeatable Slot — слот, который повторяется переменное число раз (2..N)
внутри одного Structural View, в отличие от фиксированных именованных
слотов (leading/content/trailing). Используется когда количество
однотипных дочерних элементов определяется данными, а не дизайном
(например: ячейки строки таблицы, колонки, повторяющиеся карточки в
динамическом гриде).

Правила:

- Repeatable Slot обозначается в спеке как `cell (repeatable, 2..N)` или
  аналогично, с указанием диапазона.
- Компонент с Repeatable Slot может дополнительно поддерживать
  `colSpan`/`rowSpan` (Cell Span) — объединение соседних повторяющихся
  элементов в один визуальный блок.
- Cell Span задаётся как проп на уровне самого повторяющегося элемента
  (например `TableCell`), а не на родителе.
- Repeatable Slot — валидный паттерн Structural View, не требует
  понижения уровня до Layout, если сам компонент не является чистым
  списком/сеткой без семантики (в этом случае используется Layout:
  Grid/List).

**Пример — TableRow / TableCell с colSpan:**

```tsx
<TableRow>
  <TableCell colSpan={2}>Категория и назначение</TableCell>
  <TableCell>Значение</TableCell>
</TableRow>
```

Здесь `TableRow` задаёт Repeatable Slot `cell`, а `colSpan` на конкретном
`TableCell` объединяет первые два повторяющихся элемента в один блок —
проп находится на дочернем элементе, не на `TableRow`.

### Антипаттерны нейминга

- `Badge`, `BadgeCount`, `IconSurface`, `Tag`, `Avatar` — Surface View, не Item
- `IconItem` — неверно. Правильно: `Icon` (Item)
- `Surface` как постфикс без смысла: `Badge`, `TextSurface` — нет, `Avatar`, `AvatarSurface` — нет
- Island и Widget не взаимозаменяемы. Grid/List → Island. Аналитика → Widget

---

## 10. Контрольные вопросы

**Уровень:**
- Только контент без оболочки? → Item
- Один элемент в оболочке? → Surface View
- Несколько именованных слотов? → Structural View
- Только расстановка? → Layout

**Нейминг:**
- Понятна ли Role из имени?
- Island или Widget?
- Нет ли числа или цвета в имени?

**Токены:**
- Item: нет padding/background — только typography-style и color-token?
- Surface View / Structural View: нет margin; есть variant и shape/size?
- Layout: только gap, нет состояний?

**Слоты Structural View:**
- Использованы стандартные имена: leading, content, trailing, header, footer?

**Lifecycle Structural View:**
- `isVisible` / `isPresented` снаружи, анимация внутри?

**Состояния:**
- Используется нейминг из таблицы Figma в `component-states-guide.md`?
- Skeleton/Loading — через проп снаружи?

---

## Глоссарий

| Термин | Определение |
|--------|-------------|
| Item | Атомарный контент-компонент без оболочки |
| Surface View | Компонент с оболочкой, один визуальный элемент |
| Structural View | Компонент с несколькими именованными слотами |
| Layout | Компонент-расстановщик без дизайна |
| App Surface | Корневой фон экрана, не уровень архитектуры |
| Slot | Именованная зона Structural View: leading, content, trailing, header, footer |
| Variant | Визуальный вариант компонента: primary, secondary, ghost, danger |
| Lifecycle | Управление появлением/скрытием Structural View |
| CollectionView | Оркестратор рендеринга: данные / skeleton / EmptyState / ошибка |

---

## Changelog

### v1.3.0 — 2026-07-03

**[Add] Repeatable Slot and Cell Span as valid Structural View patterns (раздел 6, «Слоты Structural View»)**
- Добавлен подраздел «Repeatable Slot» — слот с переменным числом повторений (2..N), в отличие от фиксированных именованных слотов
- Задокументирован `colSpan`/`rowSpan` (Cell Span) как проп повторяющегося дочернего элемента (например `TableCell`), не родителя
- Явно зафиксировано: Repeatable Slot не понижает уровень до Layout, если компонент не является чистым списком/сеткой без семантики
- Добавлен пример на основе `TableRow`/`TableCell` с `colSpan`
- Закрывает открытый вопрос №1 из спеки TableRow (`memory/ds-component-spec/log.sergej.json`, spec-003)

### v1.2.0 — 2026-07-03

**[Add] Documented naming exception: Row-suffix components (XRow) keep legacy Entity+Role formula instead of Role+Entity (раздел 9)**
- Добавлен подраздел «Исключение: Row-компоненты» сразу после таблицы Role-семей
- `ListRow`, `MenuRow`, `BottomSheetRow`, `IslandRow`, `TableRow` явно закреплены как Entity+Role, не переименовываются в RoleX
- Новые Row-компоненты после v1.1.0 следуют этому же устоявшемуся паттерну
- `TableRow` добавлен в таблицу «Row-компоненты» (раздел 6) по итогам аудита audit-003 (`memory/ds-component-audit/log.sergej.json`)

### v1.1.0 — 2026-06-28

**[Add] Состояния Surface View — расширена таблица (раздел 8)**
- Добавлены `skeleton` и `error` в таблицу состояний Surface View
- Добавлена ссылка на `component-states-guide.md` как источник правил нейминга
- Уточнено разделение ответственности skeleton/loading: компонент рендерит по пропу, экран решает когда

### v7 — 2026-06-18 (предыдущая версия)
- Lifecycle Structural View
- Structural View: expanded/collapsed, loading/disabled (составные)
- Surface View / Structural View уточнены граничные случаи
- Lifecycle в глоссарии (раздел 10)
- Structural View: слот footer (раздел 9)
