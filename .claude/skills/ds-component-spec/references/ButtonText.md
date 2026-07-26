# ButtonText — Spec

**Уровень:** Surface View  
**Платформы:** Web · iOS · Android  
**Дата:** 2026-06-20 · **Автор:** sergej

## Назначение

Кнопка с текстовой меткой — интерактивный Surface View для основных и вторичных действий, где единственный контент — label. Используется в формах, диалогах, карточках, тулбарах. Не заменяет `ButtonIcon` и не покрывает составные кнопки с слотами `leading` / `trailing`.

## Уровень и обоснование

**Surface View** — один контент-элемент (текст) в оболочке: фон, форма, отступы. Именованных слотов нет. Вспомогательная иконка допустима как prop, но не как второй именованный слот.

## Нейминг

- **Имя:** ButtonText
- **Формула:** Button + Text — Role `Button`, Entity `Text`
- **Слоты:** нет

## Item / Structural View

Визуальный состав ButtonText — три элемента, слева → справа:

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Icon | Item | Нет | Да | Ведущая иконка перед текстом. Недоступна в size `tiny` — там только текст + trailing chevron. Не own-фон/форма — цвет через `currentColor`. |
| 2 | Text | Item | Да | Нет | Единственный обязательный контент кнопки. 1 строка, ellipsis при переполнении. Без текста компонент не имеет смысла — отключить нельзя. |
| 3 | Counter | ❖ Surface View (nested) | Нет | Да | Числовой индикатор (например, счётчик уведомлений) поверх/рядом с кнопкой. Container + Value в pill-обёртке (как Badge/Tag) — отдельный DS-компонент со своим spec: `CounterValue` (`src/components/sutochno/CounterValue.tsx`, presentbook: `docs/storybook/products/sutochno/components/counter-value.html`). Токены/отступы Counter не наследуются от ButtonText. |

Уровень ButtonText остаётся **Surface View**: Icon и Text — Item-примитивы, Counter — единственный самостоятельный Role/Entity-компонент. Порог «≥2 самостоятельных Role/Entity-компонента» из уточнённого правила `ds-component-spec/SKILL.md` (Шаг 2, v1.3.0) не достигнут.

## Токены

| Свойство | Component |
|---|---|
| background (primary) | `button.background.default` → `color.action.primary` |
| background (secondary) | `button.background.secondary` → `color.surface.default` |
| background (ghost) | `button.background.ghost` → `color.transparent` |
| hover / pressed | `button.background.hover` / `.pressed` |
| text | `button.text.primary` / `.secondary` / `.ghost` |
| форма / отступы | `button.corner`, `button.padding.horizontal/vertical` |
| типографика | `button.typography` → `typography.label.medium` |

⚠️ Нужно добавить semantic-токены: `color.action.primary.hover`, `color.action.primary.pressed`, `color.text.on-action`, `color.transparent`, `typography.label.medium`

## Варианты

| Variant | Описание |
|---|---|
| primary | Основное действие, filled |
| secondary | Вторичное действие |
| ghost | Третичное, без фона |

## Состояния

default · hover · pressed · disabled (opacity 40%) · loading (spinner) · focus (focus ring)

## Реализация

### Web (React)

```tsx
<ButtonText variant="primary" size="md" onClick={handleSubmit}>
  Сохранить
</ButtonText>
```

### iOS (SwiftUI)

```swift
ButtonTextView(title: "Сохранить", variant: .primary) {
  handleSubmit()
}
```

### Android (Compose)

```kotlin
ButtonText(
  text = "Сохранить",
  variant = ButtonTextVariant.Primary,
  onClick = { handleSubmit() }
)
```

## Доступность

- Web: `role="button"`, `aria-disabled` / `aria-busy` при disabled/loading
- iOS: `accessibilityLabel` = title, traits `.button`
- Android: `contentDescription` = text
- Touch target: 44×44px / 44×44pt / 48×48dp

## Открытые вопросы

1. Нужен ли `destructive` variant?
2. Spinner при loading — общий `Spinner` Item или inline?
3. Ghost: underline on hover или только смена цвета?

---

**Стадия:** draft
