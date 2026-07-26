# Badge — Spec

**Уровень:** Surface View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/badge.html` (System Storybook presentbook).

## Назначение

Пилюля-метка статуса без текстового слота-контента — прямой текст, не кликабельна. Всегда стоит рядом с сущностью, которую описывает (документ, компонент, версия). Не заменяет `Chip` (некликабельный тег группировки) и не покрывает интерактивные варианты выбора (`ChipSelect`).

## Уровень и обоснование

**Surface View** — один основной контент-элемент (текст, прямой контент без отдельного DOM-узла) в оболочке (фон + форма + отступы). Именованных слотов нет, вспомогательных элементов нет. Прямой пример из `ds-component-architecture-guide.md` (раздел 5). Confidence: high.

## Нейминг

- **Имя:** Badge
- **Формула:** исключение из формулы Role + Entity — устоявшееся имя (см. `SKILL.md`, Шаг 3, список исключений).
- **Слоты:** нет

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Container | Item | Да | Нет | Пилюля-оболочка: фон (по `variant`), `border-radius`, `padding`. Физически существует в вёрстке (`.badge`), ранее не была выделена отдельным Item. |
| 2 | Label | Item | Да | Нет | Прямой текстовый контент пилюли, без отдельного DOM-узла. Без текста бейдж не имеет смысла. |

Оба элемента — Item-примитивы в одной обёртке → Surface View (критерий `SKILL.md` v1.3.0, Шаг 2).

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| padding (гориз.) | — (spacing-шкала не экспортируется как var, см. `docs/assets/style.css`) | `inset-control-h-xs` |
| padding (верт.) | — | ⚠️ нужно добавить токен: `2px` захардкожен, нет ссылки на inset-токен (Blocker) |
| border-radius | — | `radius-full` |
| typography | — | `label-xs-size` / `label-xs-lh` / `label-xs-weight` |
| background (Stable) | `core-jasper-55` | `bg-accent-status-success` |
| color (Stable) | `core-jasper-75` | `text-success` |
| background (Draft) | `core-citrine-55` | `bg-accent-status-warning` |
| color (Draft) | `core-neutral-x-100` | `text-primary` |
| background (Core) | `core-sapphire-55-a06` | `bg-accent-ghost` |
| color (Core) | `core-sapphire-55` | `text-accent` |
| border (Core) | `core-sapphire-55-a12` | `bg-accent-fade` |
| background (Semantic) | `core-amethyst-55` | `bg-accent-status-attention` |
| color (Semantic) | `core-neutral-x-100` | `text-primary` |

## Варианты (appearance)

| Variant | Описание | Ключевые semantic-токены |
|---|---|---|
| Stable | Стабильный статус | `bg-accent-status-success`, `text-success` |
| Draft | Черновик | `bg-accent-status-warning`, `text-primary` |
| Core | Core-уровень | `bg-accent-ghost`, `text-accent`, border `bg-accent-fade` |
| Semantic | Semantic-уровень | `bg-accent-status-attention`, `text-primary` |

Единственный тип заливки — Tinted; appearance меняет только цветовую пару.

## Состояния

Не кликабелен — states не применимы (`states: []` в presentbook подтверждает решение).

## Реализация — Web (React)

Props: `variant: 'stable' | 'draft' | 'core' | 'semantic'`
Токены: CSS-переменные через design-token-утилиту

```tsx
<Badge variant="stable">Stable</Badge>
```

## Реализация — iOS (SwiftUI)

```swift
BadgeView(text: "Stable", variant: .stable)
```

## Реализация — Android (Compose)

```kotlin
Badge(text = "Stable", variant = BadgeVariant.Stable)
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | role | нет (не интерактивен); текст читается как обычный контент |
| iOS | accessibilityLabel | текст бейджа |
| Android | contentDescription | текст бейджа |
| Все | touch target | не применимо — не кликабелен |

## Открытые вопросы

1. ⚠️ Требует уточнения: `padding` (верт.) `2px` захардкожен — нужно завести inset-токен вместо raw-значения (Blocker, зафиксирован в presentbook «Нарушения»).

---

**Стадия:** draft
