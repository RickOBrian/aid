---
destination: skills/_shared/
name: semantic-space-tokens-guide
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Semantic-уровень пространственных токенов: inset-*, gap-*, radius-*. Именованные алиасы поверх Core-шкалы. Единственный уровень, который используют компоненты напрямую.
---

# Semantic Space Tokens Guide

Гайд описывает Semantic-уровень пространственных токенов: именованные алиасы поверх Core-шкалы `spacing-N` и `shape-corner-N`. Semantic-токены — единственный уровень, который используют компоненты напрямую.

Core-примитивы описаны в `core-space-tokens-guide.md`.

---

## 1. Принципы Semantic-уровня

- **Компоненты ссылаются только на Semantic.** Прямое использование `spacing-N` или `shape-corner-N` в коде компонента — нарушение слоёности и блокер по `token-rules.md`.
- **Ценность Semantic — развязка.** Если завтра «стандартный горизонтальный padding контрола m-size» должен вырасти с 16 до 20px — меняется одна строка в Semantic, все компоненты подтягиваются. При прямом использовании Core пришлось бы найти и обновить каждое место.
- **Числа в именах — только для Core.** На Semantic-уровне используются функциональные суффиксы (`xs/s/m/l/xl`) или функциональные имена (`none/full`). Это обязательное условие: Semantic-токен с числом в имени — красный флаг.
- **Независимые шкалы по категориям.** `inset-control-h-m` и `inset-container-h-m` могут указывать на разные значения. Буква `m` не означает «одно и то же число» глобально — она означает «среднее в своей категории».

---

## 2. Категории Semantic-токенов

Пространственные Semantic-токены делятся на три направления:

| Направление | Токен-префикс | Что описывает |
|---|---|---|
| Внутренний отступ | `inset-*` | padding компонентов |
| Расстояние между элементами | `gap-*` | gap в Layout-компонентах |
| Скругление | `radius-*` | border-radius компонентов |

---

## 3. Токены `inset-*` — внутренний отступ

### 3.1. Почему `inset`, а не `padding`

`padding` — CSS-свойство. На iOS то же значение применяется через `.padding()`, на Android через `contentPadding` или `PaddingValues`. `inset` описывает смысл (внутренний отступ, вдавленность), а не платформенное свойство — по той же причине цветовой токен называется `color-surface-default`, а не `background-color-default`.

### 3.2. Оси: `-h-` и `-v-`

Оси `h` (horizontal) и `v` (vertical) существуют потому, что у контролов горизонтальный и вертикальный padding принципиально разные. Слитный `inset-m` не покрывает этот кейс без потери семантики.

- `h` = horizontal = left/right / leading/trailing / start/end
- `v` = vertical = top/bottom / block / vertical

Буква `m` на оси `h` и оси `v` в одной категории **не обязана** указывать на одно числовое значение. Это нормально: оси — независимые шкалы.

### 3.3. Четыре категории `inset-*`

Разделение на категории решает проблему «букв будет слишком много». Каждая категория имеет свой диапазон значений и свой набор из 4–5 суффиксов — без `xxl`, `xxxl`, `xxxxxl`.

---

#### `inset-control-*` — контролы

Применяется к Surface View компонентам с интерактивной оболочкой: `ButtonText`, `Tag`, `Chip`, `Badge`, `Input`, `Select`.

Характеристика: tight padding, горизонтальный значительно больше вертикального.

| Токен | Core-алиас | Значение |
|---|---|---|
| `inset-control-h-xs` | `spacing-6` | 6 |
| `inset-control-h-s` | `spacing-12` | 12 |
| `inset-control-h-m` | `spacing-16` | 16 |
| `inset-control-h-l` | `spacing-20` | 20 |
| `inset-control-v-xs` | `spacing-2` | 2 |
| `inset-control-v-s` | `spacing-6` | 6 |
| `inset-control-v-m` | `spacing-10` | 10 |
| `inset-control-v-l` | `spacing-12` | 12 |

**Тест на ButtonText:**

| Размер кнопки | Горизонталь | Вертикаль |
|---|---|---|
| size-s | `inset-control-h-s` → 12 | `inset-control-v-s` → 6 |
| size-m | `inset-control-h-m` → 16 | `inset-control-v-m` → 10 |
| size-l | `inset-control-h-l` → 20 | `inset-control-v-l` → 12 |

---

#### `inset-row-*` — строчные компоненты

Применяется к Structural View со строчной структурой: `ListRow`, `MenuRow`, `BottomSheetRow`, `IslandRow`.

Характеристика: широкий горизонтальный отступ, высота определяет плотность списка.

| Токен | Core-алиас | Значение |
|---|---|---|
| `inset-row-h-s` | `spacing-12` | 12 |
| `inset-row-h-m` | `spacing-16` | 16 |
| `inset-row-h-l` | `spacing-20` | 20 |
| `inset-row-v-xs` | `spacing-8` | 8 |
| `inset-row-v-s` | `spacing-12` | 12 |
| `inset-row-v-m` | `spacing-16` | 16 |

---

#### `inset-container-*` — контейнеры

Применяется к Structural View с контентной оболочкой: `Island`, `Widget`, `Dialog`, `BottomSheet`, `Toast`, `Banner`, `Card`.

Характеристика: более симметричный padding, может быть одинаковым по обеим осям.

| Токен | Core-алиас | Значение |
|---|---|---|
| `inset-container-h-s` | `spacing-12` | 12 |
| `inset-container-h-m` | `spacing-16` | 16 |
| `inset-container-h-l` | `spacing-24` | 24 |
| `inset-container-h-xl` | `spacing-32` | 32 |
| `inset-container-v-s` | `spacing-12` | 12 |
| `inset-container-v-m` | `spacing-16` | 16 |
| `inset-container-v-l` | `spacing-24` | 24 |
| `inset-container-v-xl` | `spacing-32` | 32 |

---

#### `inset-screen-*` — экранные зоны

Применяется к навигационным и layout-компонентам уровня экрана: `NavBar`, `TabBar`, `PageSurface`, `Section`, `Zone`. Изолируется отдельно, потому что это responsive/platform-зависимая история.

| Токен | Core-алиас | Значение |
|---|---|---|
| `inset-screen-h-s` | `spacing-16` | 16 |
| `inset-screen-h-m` | `spacing-24` | 24 |
| `inset-screen-h-l` | `spacing-32` | 32 |
| `inset-screen-v-s` | `spacing-12` | 12 |
| `inset-screen-v-m` | `spacing-16` | 16 |
| `inset-screen-v-l` | `spacing-24` | 24 |

> Примечание: `NavBar` и `TabBar` — Structural View в архитектуре компонентов, но по характеру padding принадлежат к `inset-screen-*`, а не `inset-container-*`. Это осознанное решение: экранный контекст важнее архитектурного уровня.

### 3.4. Политика расширения

Если компоненту нужен отступ вне существующих суффиксов — сначала задать вопрос: это уникальный кейс или системный паттерн? Если системный — добавляем токен в соответствующую категорию. Если уникальный — переосмыслить дизайн.

---

## 4. Токены `gap-*` — расстояние между элементами

### 4.1. Кто использует `gap-*`

`gap-*` используют Layout-компоненты: `VStack`, `HStack`, `Grid`, `Wrap`, `List`, `Carousel`. Structural View и Surface View не должны задавать gap через этот токен — они управляют только своим внутренним padding.

### 4.2. Шкала

| Токен | Core-алиас | Значение | Применение |
|---|---|---:|---|
| `gap-none` | `spacing-0` | 0 | Плотная укладка без зазора |
| `gap-xs` | `spacing-4` | 4 | Иконка + лейбл, tight inline группы |
| `gap-s` | `spacing-8` | 8 | Компактные списки, строчные группы |
| `gap-m` | `spacing-16` | 16 | Стандартный gap в карточных сетках |
| `gap-l` | `spacing-24` | 24 | Широкие макеты, сетки островов |
| `gap-xl` | `spacing-32` | 32 | Крупные layout-блоки |

---

## 5. Токены `radius-*` — скругление

### 5.1. Почему не `shape-corner-N`

`shape-corner-N` — Core-примитив с числом в имени. Semantic-уровень обязан скрыть это число за именем с ролью, чтобы при необходимости изменить все «маленькие радиусы» — поменять один алиас, а не искать по кодовой базе.

### 5.2. Шкала

| Токен | Core-алиас | Значение | Применение |
|---|---|---:|---|
| `radius-none` | `shape-corner-0` | 0 | Без скругления |
| `radius-s` | `shape-corner-4` | 4 | Badge, Tag, Checkbox, Radio |
| `radius-m` | `shape-corner-8` | 8 | ButtonText, Input, маленькие карточки |
| `radius-l` | `shape-corner-12` | 12 | Island, Widget среднего размера |
| `radius-xl` | `shape-corner-16` | 16 | Крупные карточки, Bottom Sheet |
| `radius-2xl` | `shape-corner-24` | 24 | Modal, Dialog, крупные контейнеры |
| `radius-full` | `shape-corner-full` | 9999 | Аватары, pill-кнопки, fully rounded |

> **Исключение `2xl`:** единственный суффикс с цифрой — необходим, потому что `xl` и финальный «крупный» радиус — разные шаги, а `xxxl` было бы хуже. Конвенция `2xl` общепринята в индустрии (Tailwind, Material).

### 5.3. Соответствие категориям компонентов

| Категория компонентов | Рекомендуемые радиусы |
|---|---|
| Surface View контролы (Button, Tag, Chip, Badge) | `radius-s`, `radius-m`, `radius-full` |
| Structural View строки (ListRow, MenuRow) | `radius-none` или `radius-s` |
| Structural View контейнеры (Island, Widget) | `radius-l`, `radius-xl` |
| Structural View системные (Dialog, BottomSheet) | `radius-xl`, `radius-2xl` |
| Навигация (NavBar, TabBar) | `radius-none` |

### 5.4. Топология углов

Как и на Core-уровне: `radius-*` задаёт значение, не к каким углам применять. Bottom Sheet скруглён только сверху — это логика компонента, не задача токена.

---

## 6. Антипаттерны

| Антипаттерн | Проблема | Решение |
|---|---|---|
| `spacing-16` в коде компонента напрямую | Обход Semantic, потеря развязки | `inset-control-h-m` |
| `shape-corner-8` в коде компонента напрямую | То же | `radius-m` |
| `inset-control-h-16` (число в имени) | Нарушение принципа Semantic | `inset-control-h-m` |
| `gap-*` в Surface View или Structural View | Gap — задача Layout | Padding внутри компонента → `inset-*` |
| Добавление `inset-control-h-xxl` без проверки дизайна | Раздувает шкалу без основания | Сначала анализ: уникальный кейс или паттерн? |
| Общий `inset-m` без категории и оси | Невозможно покрыть асимметрию | `inset-{category}-{axis}-{size}` |

---

## 7. Связь с системой

| Документ | Связь |
|---|---|
| `core-space-tokens-guide.md` | Source of truth для числовых значений (`spacing-N`, `shape-corner-N`) |
| `token-rules.md` | Компонент ссылается только на Semantic, прямой Core — блокер |
| `ds-component-architecture-guide.md` | Категории `inset-*` согласованы с уровнями компонентов (Item / Surface View / Structural View / Layout) |
| `ds-component-spec.md` | В шаблоне спеки строки padding и border-radius должны ссылаться на `inset-*` и `radius-*` |
| `platforms.md` | Оси `h/v` транслируются в платформенные свойства: Web (padding-inline / padding-block), iOS (horizontal / vertical), Android (start+end / top+bottom) |

---

## 8. Приложение: полная таблица Semantic → Core

| Semantic-токен | Core-алиас | Значение |
|---|---|---:|
| `inset-control-h-xs` | `spacing-6` | 6 |
| `inset-control-h-s` | `spacing-12` | 12 |
| `inset-control-h-m` | `spacing-16` | 16 |
| `inset-control-h-l` | `spacing-20` | 20 |
| `inset-control-v-xs` | `spacing-2` | 2 |
| `inset-control-v-s` | `spacing-6` | 6 |
| `inset-control-v-m` | `spacing-10` | 10 |
| `inset-control-v-l` | `spacing-12` | 12 |
| `inset-row-h-s` | `spacing-12` | 12 |
| `inset-row-h-m` | `spacing-16` | 16 |
| `inset-row-h-l` | `spacing-20` | 20 |
| `inset-row-v-xs` | `spacing-8` | 8 |
| `inset-row-v-s` | `spacing-12` | 12 |
| `inset-row-v-m` | `spacing-16` | 16 |
| `inset-container-h-s` | `spacing-12` | 12 |
| `inset-container-h-m` | `spacing-16` | 16 |
| `inset-container-h-l` | `spacing-24` | 24 |
| `inset-container-h-xl` | `spacing-32` | 32 |
| `inset-container-v-s` | `spacing-12` | 12 |
| `inset-container-v-m` | `spacing-16` | 16 |
| `inset-container-v-l` | `spacing-24` | 24 |
| `inset-container-v-xl` | `spacing-32` | 32 |
| `inset-screen-h-s` | `spacing-16` | 16 |
| `inset-screen-h-m` | `spacing-24` | 24 |
| `inset-screen-h-l` | `spacing-32` | 32 |
| `inset-screen-v-s` | `spacing-12` | 12 |
| `inset-screen-v-m` | `spacing-16` | 16 |
| `inset-screen-v-l` | `spacing-24` | 24 |
| `gap-none` | `spacing-0` | 0 |
| `gap-xs` | `spacing-4` | 4 |
| `gap-s` | `spacing-8` | 8 |
| `gap-m` | `spacing-16` | 16 |
| `gap-l` | `spacing-24` | 24 |
| `gap-xl` | `spacing-32` | 32 |
| `radius-none` | `shape-corner-0` | 0 |
| `radius-s` | `shape-corner-4` | 4 |
| `radius-m` | `shape-corner-8` | 8 |
| `radius-l` | `shape-corner-12` | 12 |
| `radius-xl` | `shape-corner-16` | 16 |
| `radius-2xl` | `shape-corner-24` | 24 |
| `radius-full` | `shape-corner-full` | 9999 |

---

## Changelog

- **1.0.0** — Первая версия. `inset-*` с осями h/v и четырьмя категориями (control, row, container, screen). `gap-*` для Layout. `radius-*` как Semantic-алиасы над `shape-corner-N`.
