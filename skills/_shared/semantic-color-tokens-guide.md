---
destination: skills/_shared/
name: semantic-color-tokens-guide
metadata:
  version: "1.5.0"
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

> Статус: Stable · v1.5.0

---

Semantic-токены — это смысловой слой поверх Core Color Tokens.
Компоненты ссылаются только на semantic-токены, никогда напрямую на Core.
Governance-правила — в `token-rules.md`.

---

## 1. Принцип

Semantic-токен ссылается на Core Color Token — не хранит HEX напрямую.

<div class="arch-diagram">
  <div class="arch-diagram__row">
    <span class="arch-diagram__layer">Core</span>
    <code class="arch-diagram__name">jasper-65</code>
    <span class="arch-diagram__note">#ef3124</span>
  </div>
  <div class="arch-diagram__connector">semantic ссылается на core</div>
  <div class="arch-diagram__row">
    <span class="arch-diagram__layer">Semantic</span>
    <code class="arch-diagram__name">bg-accent-main</code>
    <span class="arch-diagram__note">→ jasper-65</span>
  </div>
  <div class="arch-diagram__connector">компонент использует semantic</div>
  <div class="arch-diagram__row">
    <span class="arch-diagram__layer">Component</span>
    <code class="arch-diagram__name">background: var(--bg-accent-main)</code>
    <span class="arch-diagram__note"></span>
  </div>
</div>

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

<div class="token-text-demo">
  <span class="token-text-demo__item" style="color:var(--text-primary)">text-primary</span>
  <span class="token-text-demo__item" style="color:var(--text-secondary)">text-secondary</span>
  <span class="token-text-demo__item" style="color:var(--text-disabled)">text-disabled</span>
  <span class="token-text-demo__item token-text-demo__item--on-accent" style="color:var(--text-inverse)">text-inverse</span>
  <span class="token-text-demo__item" style="color:var(--text-accent)">text-accent</span>
  <span class="token-text-demo__item" style="color:var(--text-error)">text-error</span>
  <span class="token-text-demo__item" style="color:var(--text-success)">text-success</span>
</div>

```token-color
text-primary   | rgba(3, 3, 6, 0.88)   | Основной текст
text-secondary | rgba(4, 4, 19, 0.55)  | Второстепенный текст
text-disabled  | rgba(5, 11, 44, 0.18) | Неактивный текст
text-inverse   | #ffffff               | Текст на акцентном фоне
text-accent    | #ef3124               | Акцентный текст и ссылки
text-error     | #ec2d20               | Текст ошибки
text-success   | #0d9336               | Текст успеха
```

```token-color
icon-primary   | #212124 | Основная иконка
icon-secondary | #898991 | Второстепенная иконка
icon-accent    | #ef3124 | Акцентная иконка
icon-inverse   | #ffffff | Иконка на акцентном фоне
icon-disabled  | #d2d3d9 | Неактивная иконка
```

```token-color
line-default | #e7e8eb | Стандартный разделитель и бордер
line-strong  | #d2d3d9 | Усиленный разделитель
line-accent  | #ef3124 | Акцентный бордер (фокус, активное поле)
```

`text` и `icon` — параллельные структуры.
`line` — отдельная ветка, не подгруппа `bg`.

---

## 6. bg-base, bg-card, bg-overlay, bg-modal

```token-color
bg-base-main            | #ffffff             | Основной фон экрана
bg-base-main-secondary  | #f2f3f5             | Вторичный фон экрана
bg-card-main            | #ffffff             | Фон карточки
bg-card-main-secondary  | #edeef0             | Вторичный фон карточки
bg-overlay-main         | rgba(0, 0, 0, 0.60) | Оверлей (полупрозрачный)
bg-modal-main           | #ffffff             | Фон модального окна
bg-modal-main-secondary | #f2f3f5             | Вторичный фон модального окна
```

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

```token-color
bg-accent-main    | #ef3124 | Основной акцентный фон
bg-accent-fade    | #ffdfdf | Приглушённый акцент (main с alpha)
bg-accent-ghost   | #ffebeb | Еле заметный акцент (тише fade)
bg-accent-inverse | #121213 | Инверсный фон (текст поверх — инверсный)
```

`fade` и `ghost` — это `main` с уменьшенной прозрачностью через Core alpha-нотацию.
`inverse` — фон, на котором используется `color-text-inverse` или `color-icon-inverse`.

### Inverse

`inverse` нужен когда элемент отображается на акцентном фоне.

```
Core: jasper-0, jasper-60
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

| Токен                             | Назначение                                      | Core (light)        | Light value | Core (dark)         |
|-----------------------------------|-------------------------------------------------|---------------------|-------------|---------------------|
| `bg-component-skeleton-default`   | Базовый фон заглушки                            | `color-neutral-100` | `#f2f3f5`   | `color-neutral-800` |
| `bg-component-skeleton-shimmer`   | Светлая волна поверх default (shimmer-анимация) | `color-neutral-0`   | `#ffffff`   | `color-neutral-700` |

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

- **1.5.0** — Illustration Logic: секция 1 (Принцип) — arch-diagram Core→Semantic→Component
  (Rule 5); секция 5 (text/icon/line) — live token-text-demo (Rule 1).
  Добавлены CSS-классы `.arch-diagram` и `.token-text-demo` в `style.css`.
- **1.4.0** — секции 5, 6, 7: CSS-переменные заменены на реальные hex/rgba значения в
  `token-color`-блоках — свотчи теперь рендерятся без подключённой theme CSS.
  Секция 11: таблица skeleton дополнена колонкой `Light value` с фактическими значениями
  (`#f2f3f5`, `#ffffff`). Маппинг на основе извлечённых токенов публичной UI-библиотеки (light theme).
- **1.3.0** — секции 5, 6, 7: таблицы заменены на `token-color`-блоки с live-свотчами
  (token-viz.js). Убраны raw HEX-значения из prose-блоков секций 1 и 7 (Inverse).
- **1.2.0** — добавлены skeleton-токены: `bg-component-skeleton-default` и
  `bg-component-skeleton-shimmer` в группу `bg-component-*`
  (раздел 11). Обновлена карта групп bg (раздел 4).
- **1.1.0** — добавлены Core Color Tokens (jasper, citrine); убраны Core-токены
  white/black; добавлен ghost-вариант.
- **1.0.0** — первая версия: Space-токены, dark mode, product и additional,
  static-суффиксы, states.
