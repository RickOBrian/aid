# Chip — Spec

**Уровень:** Surface View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/chip.html` (System Storybook presentbook).

## Назначение

Некликабельная пилюля-тег без слотов, кроме прямого текста. Используется для группировки контента по категории.

## Уровень и обоснование

**Surface View** — один контент-элемент (прямой текст) в оболочке. Прямой пример из `ds-component-architecture-guide.md` (раздел 5, 9). Confidence: high.

## Нейминг

- **Имя:** Chip
- **Формула:** исключение из формулы Role + Entity — устоявшееся имя (см. `SKILL.md`, Шаг 3, список исключений).
- **Слоты:** нет

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Container | Item | Да | Нет | Пилюля-оболочка: рамка (`line-default`), `border-radius`, `padding`; фон — `transparent`. Физически существует в вёрстке (`.chip`), ранее не была выделена отдельным Item. |
| 2 | Label | Item | Да | Нет | Прямой текстовый контент пилюли, без отдельного DOM-узла. |

Оба элемента — Item-примитивы в одной обёртке → Surface View (критерий `SKILL.md` v1.3.0, Шаг 2).

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| gap | — | `gap-xs` |
| padding (верт.) | — | `inset-control-v-xs` |
| padding (гориз.) | — | `inset-control-h-xs` |
| color | `core-neutral-x-60` | `text-secondary` |
| background | — | `transparent` |
| border | `core-neutral-x-15` | `line-default` |
| border-radius | — | `radius-s` |
| typography | — | `meta-xs-size` / `-lh` / `-weight` |
| letter-spacing | — | ⚠️ нужно подключить существующий токен: `meta-xs-tracking` (есть, но не используется — Blocker) |

## Состояния

Не кликабелен — states не применимы (`states: []` в presentbook подтверждает решение).

## Реализация — Web (React)

```tsx
<Chip>Components</Chip>
```

## Реализация — iOS (SwiftUI)

```swift
ChipView(text: "Components")
```

## Реализация — Android (Compose)

```kotlin
Chip(text = "Components")
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | role | нет (не интерактивен) |
| iOS | accessibilityLabel | текст чипа |
| Android | contentDescription | текст чипа |

## Открытые вопросы

1. ⚠️ Требует уточнения: `letter-spacing: 0.04em` захардкожен, хотя токен `meta-xs-tracking` уже существует в Typography Storybook — нужно подключить (Blocker, зафиксирован в presentbook «Нарушения»).

---

**Стадия:** draft
