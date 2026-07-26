# CounterValue — Spec

**Уровень:** Surface View
**Платформы:** Web (ready) · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/products/sutochno/components/counter-value.html` (Sutochno product presentbook), `src/components/sutochno/CounterValue.tsx`.

## Назначение

Числовой индикатор в виде pill-бейджа. Счётчик непрочитанных уведомлений, сообщений и т.п. Категория Indicators (продукт Sutochno). Структура — из Figma (Components Mobile), цвета — legacy-токены продукта.

## Уровень и обоснование

**Surface View** — один контент-элемент (Value, Item-примитив: число) в оболочке (Container — pill с brand-заливкой). По критерию `SKILL.md` v1.3.0 (Шаг 2): внутри — только Item-примитив, обёрнутый в один смысловой контейнер → Surface View, а не Structural View. Тот же паттерн, что у `Badge`/`Chip`/`Tag`. Ранее этот вывод уже зафиксирован в `.claude/skills/ds-component-spec/references/ButtonText.md` (описание вложенного Counter). Confidence: high.

## Нейминг

- **Имя:** CounterValue
- **Формула:** Role (Counter) + Entity (Value)
- **Слоты:** нет (value — единственный контент)

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Container | Item | Да | Нет | Pill-оболочка с brand-заливкой (`background`, `border-radius: 9999px`, `padding`). Физически существует в вёрстке как отдельный DOM-узел (`.scv`, отличный от `.scv__value`), ранее не была выделена отдельным Item. |
| 2 | Value | Item | Да | Нет | Числовое значение по центру, 1 строка. Без значения индикатор не имеет смысла — обязателен, нельзя отключить (в реализации есть значение по умолчанию `1`). |

Оба элемента (Container + Value) — Item-примитивы в одной обёртке → Surface View (критерий `SKILL.md` v1.3.0, Шаг 2).

## Токены

| Свойство | Core (Sutochno legacy) | Semantic (Sutochno legacy) |
|---|---|---|
| background | см. `tokens/sutochno/legacy/legacy-tokens.json` | `semantic/brand-element` |
| color (value) | см. `tokens/sutochno/legacy/legacy-tokens.json` | `fixed/main/-basic` |
| border-radius | — | pill (`9999px`, raw — токена нет) |
| padding (Medium) | — | `4px 6px` (raw px, токена нет) |
| padding (Small) | — | `2px 4px` (raw px, токена нет) |
| min-size (Medium) | — | `20×20px` (raw px, токена нет) |
| min-size (Small) | — | `16×16px` (raw px, токена нет) |
| typography (Medium) | — | ⚠️ `label-s-strong` — 12/12 Semi Bold (raw px, токена в Sutochno legacy typography нет) |
| typography (Small) | — | ⚠️ `label-xs-strong` — 10/12 Semi Bold (raw px, токена нет) |

## Варианты (fillType)

| Variant | background | color |
|---|---|---|
| Brand Element (единственный) | `semantic/brand-element` | `fixed/main/-basic` |

## Состояния

Read-only индикатор — states не применимы (`states: []`).

## Ограничения

- Overflow: при `value > max` отображается «max+» (например, `99+`).
- Legacy-токены: цвета через `tokens/sutochno/legacy/legacy-tokens.json`; space/radius — raw px до появления токенов.

## Реализация — Web (React)

```tsx
<CounterValue value={1} size="medium" max={99} />
```

Реализовано: `src/components/sutochno/CounterValue.tsx`.

## Реализация — iOS (SwiftUI)

```swift
CounterValueView(value: 1, size: .medium, max: 99)
```

## Реализация — Android (Compose)

```kotlin
CounterValue(value = 1, size = CounterValueSize.Medium, max = 99)
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | aria-label / role | `status`, текст с числовым значением (или «99+» при overflow) |
| iOS | accessibilityLabel | «N новых» / «99+» |
| Android | contentDescription | аналогично |

## Открытые вопросы

1. ⚠️ Требует уточнения: типографика Medium/Small (`label-s-strong`, `label-xs-strong`) — соответствующих токенов в `tokens/sutochno/legacy/typography-styles.json` нет; используются raw px до появления токенов.
2. Space/radius — raw px, токенов в Sutochno legacy пока нет (зафиксировано в JSDoc компонента).

---

**Стадия:** draft
