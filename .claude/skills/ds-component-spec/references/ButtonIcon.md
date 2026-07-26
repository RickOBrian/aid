# ButtonIcon — Spec

**Уровень:** Surface View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/button-icon.html` (System Storybook presentbook).

## Назначение

Кнопка без текстового слота — единственный контент — иконка. Компактный контрол для одного действия. Role-семья `Button`.

## Уровень и обоснование

**Surface View** — единственный контент-элемент (Icon, Item-примитив) в кликабельной оболочке (фон, рамка, скругление, состояния). Прямой пример из `ds-component-architecture-guide.md` (раздел 5, 9, дерево — раздел 2). Confidence: high.

## Нейминг

- **Имя:** ButtonIcon
- **Формула:** Role (Button) + Entity (Icon)
- **Слоты:** нет (icon — единственный контент, не именованный слот)

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Container | Item | Да | Нет | Кликабельная оболочка контрола: фон, рамка, `border-radius`, фиксированный размер 36×36px. Физически существует в вёрстке (`.btn-icon`), ранее не была выделена отдельным Item. |
| 2 | Icon | Item | Да | Нет | Единственный контент контрола; цвет управляется icon-токенами через `currentColor`. Без иконки кнопка пуста — обязателен. |

Оба элемента — Item-примитивы в одной обёртке → Surface View (критерий `SKILL.md` v1.3.0, Шаг 2).

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| width / height | — | ⚠️ нужно добавить токен: `36px` захардкожен, semantic size-токена для габаритов контрола нет (Gap) |
| background (default) | — | `transparent` (прямое значение, без токена — допустимо для «нет заливки») |
| color (default, icon) | `core-neutral-x-60` | `icon-secondary` |
| background (hover) | `core-sapphire-55-a08` | `bg-accent-states-hover` |
| color (hover, icon) | `core-neutral-x-90` | `icon-primary` |
| border | `core-neutral-x-15` | `line-default` |
| border-radius | — | `radius-m` (derived — перекрыт `docs-theme.css` до `radius-full`, canonical-правка не даёт видимого live-эффекта) |

## Состояния

| Состояние | background | icon color |
|---|---|---|
| Default | `bg-base-main` | `icon-secondary` |
| Hover | `bg-accent-states-hover` | `icon-primary` |

## Реализация — Web (React)

```tsx
<ButtonIcon icon={<CompassIcon />} aria-label="Открыть настройки" onClick={...} />
```

## Реализация — iOS (SwiftUI)

```swift
ButtonIcon(systemImage: "gearshape") { ... }
```

## Реализация — Android (Compose)

```kotlin
ButtonIcon(icon = Icons.Settings, onClick = { ... })
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | aria-label | обязателен (нет текстового контента) |
| iOS | accessibilityLabel | обязателен |
| Android | contentDescription | обязателен |
| Все | touch target | физический контейнер 36×36px — **меньше** 44×44pt/dp/px, зафиксированного в правилах проекта (Gap, см. «Открытые вопросы») |

## Открытые вопросы

1. ⚠️ Требует уточнения: `36×36px` — нет semantic size-токена для габаритов контрола (например, `size-control-m`); нужно завести.
2. Touch target `36px` < 44px — quality note, зафиксировано в presentbook «Нарушения», не блокирует спеку, но требует решения на уровне токена размера.

---

**Стадия:** draft
