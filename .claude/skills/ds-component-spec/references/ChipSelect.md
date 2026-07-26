# ChipSelect — Spec

**Уровень:** Surface View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/chip-select.html` (System Storybook presentbook).

## Назначение

Пилюля-выбор с текстом и опциональной leading-иконкой. Тапабельна, поддерживает выбранное состояние (`is-active`). Используется для фильтров/выбора одного или нескольких значений.

## Уровень и обоснование

**Surface View** — один основной контент-элемент (текст) в оболочке (фон + форма + отступы) с опциональным вспомогательным элементом (leading icon, Item-примитив), без второго именованного слота. Прямой пример из `ds-component-architecture-guide.md` (раздел 5, 9). По критерию `SKILL.md` v1.3.0 (Шаг 2): внутри — только Item-примитивы (Icon + Text), ни одного самостоятельного Role/Entity-компонента → Surface View. Confidence: medium (структура и уровень подтверждены прямым примером; source of truth — Figma-фрейм с превью нескольких инстансов, не master-компонент; appearance-цвета подобраны по существующим semantic-токенам, не сняты пиксель-в-пиксель).

## Нейминг

- **Имя:** ChipSelect
- **Формула:** Role (Chip) + модификатор поведения (Select) — устоявшееся составное имя по аналогии с исключениями (см. `SKILL.md`, Шаг 3).
- **Слоты:** нет (icon — вспомогательный элемент, не именованный слот)

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Container | Item | Да | Нет | Кликабельная пилюля-оболочка: фон/рамка по appearance (`inverse-neutral` / `fade-neutral` / `fade-accent`), `border-radius`, `padding`. Физически существует в вёрстке (`.chip-select`), ранее не была выделена отдельным Item. |
| 2 | Leading icon | Item | Нет | Да | Опциональный вспомогательный элемент перед текстом (явно зафиксировано в presentbook: «опциональный вспомогательный элемент»). Цвет — `currentColor`, наследует цвет текста активной appearance. |
| 3 | Label | Item | Да | Нет | Прямой текстовый контент; без текста контрол не имеет смысла. |

Все три элемента — Item-примитивы в одной обёртке → Surface View (критерий `SKILL.md` v1.3.0, Шаг 2).

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| gap | — | `gap-xs` |
| padding (верт.) | — | `inset-control-v-s` |
| padding (гориз.) | — | `inset-control-h-m` |
| border-radius | — | `radius-full` |
| typography | — | `label-s-size` / `-lh` / `-weight` |
| background (inverse-neutral, off) | `core-neutral-x-0` | `bg-card-main` |
| color (inverse-neutral, off) | `core-neutral-x-100` | `text-primary` |
| border (inverse-neutral, off) | `core-neutral-x-25` | `line-strong` |
| background (inverse-neutral, on) | `core-neutral-x-98` | `bg-neutral-main` |
| color (inverse-neutral, on) | `core-neutral-x-0` | `text-inverse` |
| background (inverse-neutral, on:pressed) | `core-neutral-x-100` | `bg-neutral-states-pressed` |
| background (fade-neutral, off) | `core-neutral-x-20` | `bg-card-main-secondary` |
| color (fade-neutral, off) | `core-neutral-x-60` | `text-secondary` |
| border (fade-neutral, off) | `core-neutral-x-15` | `line-default` |
| background (fade-neutral, on) | `core-neutral-x-98` | `bg-neutral-main` |
| color (fade-neutral, on) | `core-neutral-x-0` | `text-inverse` |
| background (fade-accent, off) | `core-sapphire-55-a06` | `bg-accent-ghost` |
| color (fade-accent, off) | `core-sapphire-55` | `text-accent` |
| border (fade-accent, off) | `core-sapphire-55-a12` | `bg-accent-fade` |
| background (fade-accent, on) | `core-sapphire-55` | `bg-accent-main` |
| color (fade-accent, on) | `core-neutral-x-0` | `text-inverse` |
| icon color | — | `currentColor` (наследует цвет текста активной appearance) |

## Варианты (fillType × appearance)

| Fill Type | Appearance | Off | On |
|---|---|---|---|
| Inverse | Neutral | `bg-card-main` / `text-primary` | `bg-neutral-main` / `text-inverse` |
| Fade | Neutral | `bg-card-main-secondary` / `text-secondary` | `bg-neutral-main` / `text-inverse` |
| Fade | Accent | `bg-accent-ghost` / `text-accent` | `bg-accent-main` / `text-inverse` |

## Состояния

| Состояние | background | color |
|---|---|---|
| Off | `bg-card-main` | `text-primary` |
| On | `bg-neutral-main` | `text-inverse` |
| On, Pressed | `bg-neutral-states-pressed` | `text-inverse` |

## Реализация — Web (React)

```tsx
<ChipSelect fillType="fade" appearance="accent" active icon={<CheckIcon />}>Label</ChipSelect>
```

## Реализация — iOS (SwiftUI)

```swift
ChipSelectView(text: "Label", fillType: .fade, appearance: .accent, isActive: true, icon: Image(systemName: "checkmark"))
```

## Реализация — Android (Compose)

```kotlin
ChipSelect(text = "Label", fillType = FillType.Fade, appearance = Appearance.Accent, isActive = true, icon = Icons.Check)
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | role / aria-pressed | `button`, `aria-pressed` = состояние `is-active` |
| iOS | accessibilityTraits | `.button`, `.isSelected` при активном состоянии |
| Android | Role.Checkbox/Button + selected | selected = `is-active` |
| Все | touch target | весь пилюльный контейнер (текст + опциональная иконка + padding), отдельного hit-slop нет |

## Открытые вопросы

1. ⚠️ Gap: pressed-фидбек для off-состояния (bordered/tinted) реализован через `filter: brightness(0.94)` без токена — нужен отдельный `*-states-pressed`-токен на семью neutral/accent для off (сейчас есть только `bg-accent-states-pressed`, переиспользованный для fade-accent off, и `bg-neutral-states-pressed` для on).

---

**Стадия:** draft
