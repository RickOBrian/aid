---
destination: skills/_shared/
name: semantic-color-tokens-guide
metadata:
  version: "1.2.0"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Semantic-слой цветовых токенов дизайн-системы. Описывает структуру
  bg/text/icon/line групп, нотацию -static/-staticwm/-ios/-android,
  состояния компонентов (bg-accent-states-*, bg-component-states-*),
  skeleton-токены и product/additional-группы. Компоненты ссылаются
  только на semantic-токены, никогда напрямую на Core.
---


# Semantic Color Tokens

Semantic-токены — это смысловой слой поверх Core Color Tokens.
Компоненты ссылаются только на semantic-токены, никогда напрямую на Core.
Governance-правила — в `token-rules.md`.

---

## 1. Принцип

Semantic-токен ссылается на Core Color Token — не хранит HEX напрямую.

```
Core Color Token: jasper-65 = #2C64E3
Semantic Token:   bg-accent-main → jasper-65 = #2C64E3
```

Core → Semantic. Semantic → Core HEX.
Core-токены называются по цвету (jasper, citrine); semantic — по назначению (brand, status, product).

### Figma-реализация

Semantic-токены — это Figma Variables.
Хранятся в отдельной Variable Collection.
Связываются со Style Dictionary.
Экспортируются на все платформы автоматически.

---

## 2. Структура имён

```
bg - accent - product - marketplace - main - secondary - static
```

Имя читается слева направо: категория → группа → подгруппа → вариант → модификатор.
Semantic-токены не содержат числа и не называются цветами.
Semantic — это назначение, не цвет.
Core-токены называются по цвету (jasper, citrine).

---

## 3. Категории

| Категория | Назначение                              |
|-----------|-----------------------------------------|
| `bg`      | Фоны — экраны, зоны, компоненты        |
| `text`    | Цвет текста                             |
| `icon`    | Цвет иконок                             |
| `line`    | Разделители и бордеры                   |

Внутри каждой категории — группы по назначению.

---

## 4. Карта групп bg

```
bg
├── base          — базовые фоны экрана
├── card          — фоны карточек
├── overlay       — полупрозрачные оверлеи
├── modal         — фоны модальных окон
├── accent
│   ├── main/fade/ghost   — акцентные фоны
│   ├── states            — состояния компонентов
│   ├── product           — продуктовые цвета
│   ├── status            — статусы (attention, success, warning, error)
│   └── additional        — доп. цвета (чарты, кастомные)
└── component
    ├── form              — контролы форм
    ├── control           — прочие контролы
    ├── floating          — плавающие элементы
    ├── skeleton          — заглушки при загрузке  ← new in v1.2.0
    └── states            — form-focused и др.
```

---

## 5. text, icon, line

| Группа | Назначение        | Примеры                                         |
|--------|-------------------|-------------------------------------------------|
| `text` | Цвет текста       | `text-primary`, `text-secondary`, `text-disabled` |
| `icon` | Цвет иконок       | `icon-primary`, `icon-secondary`, `icon-accent` |
| `line` | Бордеры, делители | `line-default`, `line-strong`                   |

`text` и `icon` — параллельные структуры.
`line` — отдельная ветка, не подгруппа `bg`.

---

## 6. bg-base, bg-card, bg-overlay, bg-modal

| Токен                    | Назначение                        |
|--------------------------|-----------------------------------|
| `bg-base-main`           | Основной фон экрана               |
| `bg-base-main-secondary` | Вторичный фон экрана              |
| `bg-card-main`           | Фон карточки                      |
| `bg-card-main-secondary` | Вторичный фон карточки            |
| `bg-overlay-main`        | Оверлей (полупрозрачный)          |
| `bg-modal-main`          | Фон модального окна               |
| `bg-modal-main-secondary`| Вторичный фон модального окна     |

`bg-base-main` — первичный фон. `bg-base-main-secondary` — вторичный.

### product и additional внутри accent

| Подгруппа    | Назначение                                      |
|--------------|-------------------------------------------------|
| `product`    | Продуктовые цвета: marketplace, loyalty, premium |
| `additional` | Кастомные цвета: чарты, специальные             |
| `status`     | Статусы: attention, success, warning, error     |

- `product` — цвета конкретных продуктовых направлений.
- `additional` — не системные цвета; используются точечно.

---

## 7. bg-accent-* variants

| Variant  | Назначение                                        |
|----------|---------------------------------------------------|
| `main`   | Основной акцентный фон                            |
| `fade`   | Приглушённый акцент (с alpha-XX из Core)          |
| `ghost`  | Еле заметный акцент (ещё тише fade)               |
| `inverse`| Инверсный фон — текст поверх должен быть инверсным |

`fade` и `ghost` — это `main` с уменьшенной прозрачностью через Core alpha-нотацию.
`inverse` — фон, на котором используется `color-text-inverse` или `color-icon-inverse`.

### Inverse

`inverse` нужен когда элемент отображается на акцентном фоне.

```
Core: jasper-0 = #FFFFFF, jasper-60 = #7B2BE0
Semantic: brand-main → jasper-60, brand-inverse → jasper-0
```

Core white и black — это Core `0` и `100`, не отдельные токены.

---

## 8. -primary, -secondary, -tertiary

Суффиксы `-primary`, `-secondary`, `-tertiary` обозначают иерархию внутри группы.
Не путать с `bg-base-main` — это не primary.
`bg-base-main` — первый уровень. `bg-base-main-secondary` и `bg-base-main-tertiary` — вложенные уровни.
`-primary` не дублирует `main`; `-primary` — это иерархия внутри secondary-уровня.

---

## 9. Модификаторы

### -static

Токен с `-static` одинаковый в light и dark mode.

```
bg-accent-product-marketplace-main         → light: jasper-55, dark: jasper-75
bg-accent-product-marketplace-main-static  → light: jasper-55, dark: jasper-55
```

Используй `-static` когда цвет не должен меняться между режимами.

### -staticwm (White Label / Wealth Management)

WM — отдельный визуальный режим поверх light/dark.
`-staticwm` зафиксирован для WM, независимо от light/dark.

### -static-lm / -static-dm

| Суффикс      | Значение                              |
|--------------|---------------------------------------|
| `-static-lm` | Зафиксирован в light mode             |
| `-static-dm` | Зафиксирован в dark mode              |

```
bg-base-main light → jasper-5, dark → jasper-90
static-lm bg-base-main → jasper-5 в light
static-dm bg-base-main → jasper-90 в dark
```

### -states (bg-accent-states-* и bg-component-states-*)

Состояния компонентов. Нейминг в Figma, маппинг платформ и правила комбинирования —
в `component-states-guide.md`.

| Состояние (Figma) | Web                               | iOS                               | Android                           |
|-------------------|-----------------------------------|-----------------------------------|-----------------------------------|
| hovered           | `bg-accent-states-hover`          | —                                 | —                                 |
| pressed           | `bg-accent-states-pressed`        | `bg-accent-states-pressed`        | `bg-accent-states-pressed`        |
| selected / active | `bg-accent-states-active`         | `bg-accent-states-active`         | `bg-accent-states-active`         |
| disabled          | `bg-accent-states-disable`        | `bg-accent-states-disable`        | `bg-accent-states-disable`        |
| focused           | `bg-accent-states-focused`        | `bg-accent-states-focused-ios`    | —                                 |
| ripple            | —                                 | —                                 | `bg-accent-states-ripple-android` |

### -ios, -android

`-ios` — токен используется только в iOS-реализации.
`-android` — только в Android.
Web не использует `-ios` и `-android` токены.
Figma содержит все варианты; платформа берёт только свой столбец.

---

## 10. bg-component-states-*

`bg-component-states-*` — состояния конкретных типов компонентов.
Это не дублирование `bg-accent-states-*` — у них разная семантика:
- `bg-accent-states-*` — универсальные состояния для акцентных компонентов
- `bg-component-states-*` — состояния специфичных контролов (форм, переключателей)

Структура:
- `control` — переключатели, чекбоксы, радио-кнопки
- `form` — поля ввода, дропдауны

```
bg-component-states-control-accent-active
bg-component-states-form-focused
bg-component-states-form-error
```

Для chart-фонов используется отдельная нотация:
`...-accent-additional-chart-fade` → `...-chart-fade`

---

## 11. bg-component-skeleton-* ← new in v1.2.0

Skeleton — двуслойная анимация ожидания данных.
Токены живут в группе `bg-component-*`: это состояние отображения компонента,
а не акцентный или базовый фон экрана.

| Токен                           | Назначение                                    | Core (light)        | Core (dark)         |
|---------------------------------|-----------------------------------------------|---------------------|---------------------|
| `bg-component-skeleton-default` | Базовый фон заглушки                          | `color-neutral-100` | `color-neutral-800` |
| `bg-component-skeleton-shimmer` | Светлая волна поверх default (shimmer-анимация) | `color-neutral-50`  | `color-neutral-700` |

**Правила использования:**
- `bg-component-skeleton-default` — фон всей области-заглушки
- `bg-component-skeleton-shimmer` — движущаяся полоса поверх default (gradient или отдельный слой)
- Оба токена адаптируются к light/dark mode
- Не используй `bg-base-*` для скелетонов — это разные семантики

---

## 12. Additional

`additional` — нестандартные цвета, используемые точечно.

```
bg-accent-additional-chart-a-main
bg-accent-additional-chart-b-main
bg-accent-additional-chart-c-fade
```

`product` — цвета продуктовых направлений:

```
bg-accent-product-loyalty-main
bg-accent-product-insurance-fade
bg-accent-product-marketplace-main
```

Все product-токены ссылаются на Core Color Tokens.

---

## 13. static-lm / static-dm в Figma

Используй Variable Collection Switcher.

1. Открой Variables
2. Выбери нужную коллекцию
3. Переключи mode
4. Switch → Appearance → light/dark mode → Appearance

---

## Changelog

- **1.2.0** — добавлены skeleton-токены: `bg-component-skeleton-default` и
  `bg-component-skeleton-shimmer` в группу `bg-component-*`
  (раздел 11). Обновлена карта групп bg (раздел 4).
- **1.1.0** — добавлены Core Color Tokens (jasper, citrine); убраны Core-токены
  white/black; добавлен ghost-вариант.
- **1.0.0** — первая версия: Space-токены, dark mode, product и additional,
  static-суффиксы, states.
