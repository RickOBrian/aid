---
name: "platforms"
description: "Платформенные особенности Web, iOS, Android в дизайн-системе. Активируй при обсуждении платформенной специфики компонентов и токенов."
---
---
title: Платформенные правила дизайн-системы
version: "1.0.0"
owner: design-system-team
platforms: [web, ios, android]
---

# Платформенные правила — v1.0.0

Особенности реализации компонентов на Web, iOS и Android.
Этот файл читается скиллами автоматически — не дублируй эти правила
в отдельных скиллах.

---

## Web (React + TypeScript)

### API компонента

```tsx
interface ButtonTextProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

- API описывается через `interface` в TypeScript
- Булевы пропы: `isDisabled`, `isLoading` (префикс `is`)
- Колбэки: `onClick`, `onChange`, `onBlur` (префикс `on`)
- Слоты: через `children`, `leading`, `trailing` (React.ReactNode)
- Enum-пропы: union types `'primary' | 'secondary'`, не enum-объекты

### Токены

- CSS-переменные через design-token утилиту: `var(--color-surface-default)`
- Именование переменной: kebab-case от имени токена
- Темизация через CSS custom properties на `:root` и `[data-theme="dark"]`

### Доступность

| Свойство | Когда использовать |
|---|---|
| `role` | Только если нативный элемент не подходит (`role="button"` на `<div>`) |
| `aria-label` | Когда нет видимого текста (иконка-кнопка) |
| `aria-disabled` | `true` когда компонент disabled — вместо `disabled` атрибута для кастомных элементов |
| `aria-expanded` | Для раскрывающихся компонентов (Accordion, Select) |
| `aria-live` | Для динамически обновляемого контента (Toast, уведомления) |

- Touch target: минимум `44×44px`
- Keyboard: Tab фокус, Enter/Space активация для кнопок
- Предпочитать нативные HTML-элементы (`<button>`, `<input>`) — они дают семантику бесплатно

---

## iOS (SwiftUI)

### API компонента

```swift
struct ButtonTextView: View {
    let title: String
    var variant: ButtonTextVariant = .primary
    var size: ButtonTextSize = .md
    var isDisabled: Bool = false
    var isLoading: Bool = false
    var action: (() -> Void)? = nil

    var body: some View { ... }
}

enum ButtonTextVariant { case primary, secondary, ghost }
enum ButtonTextSize { case sm, md, lg }
```

- Структура: `struct [ComponentName]View: View`
- Enum для вариантов: `[ComponentName]Variant`, `[ComponentName]Size`
- Слоты через `@ViewBuilder`: `var leading: (() -> some View)? = nil`
- Опциональные действия: `var action: (() -> Void)? = nil`

### Токены

```swift
// DSTokens extension
extension DSTokens {
    struct Button {
        static let backgroundDefault = Color("bg.accent.main")
        static let backgroundHover   = Color("bg.accent.states.pressed")
        static let corner            = CGFloat(8)
    }
}

// Использование
.background(DSTokens.Button.backgroundDefault)
.cornerRadius(DSTokens.Button.corner)
```

- Токены через `DSTokens` extension
- Цвета через `Color("token.name")` из Asset Catalog
- Размеры через `CGFloat` константы

### Доступность

| Свойство | Когда использовать |
|---|---|
| `accessibilityLabel` | Всегда для элементов без видимого текста |
| `accessibilityTraits` | `.button`, `.image`, `.isSelected`, `.isDisabled` |
| `accessibilityValue` | Для Switch, Slider — текущее значение |
| `accessibilityHint` | Что произойдёт при активации (опционально) |

- Touch target: минимум `44×44pt`
- `accessibilityElement(children: .ignore)` для составных компонентов
- Тестировать с VoiceOver на реальном устройстве

---

## Android (Compose)

### API компонента

```kotlin
@Composable
fun ButtonText(
    text: String,
    variant: ButtonTextVariant = ButtonTextVariant.Primary,
    size: ButtonTextSize = ButtonTextSize.Md,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) { ... }

enum class ButtonTextVariant { Primary, Secondary, Ghost }
enum class ButtonTextSize { Sm, Md, Lg }
```

- `@Composable` функция, имя с заглавной буквы
- Enum: `[ComponentName]Variant`, `[ComponentName]Size`
- `modifier: Modifier = Modifier` — всегда последним параметром перед лямбдами
- Слоты через `@Composable` лямбды: `leadingContent: (@Composable () -> Unit)? = null`
- Булев параметр: `enabled` (не `isEnabled` — Compose-конвенция)

### Токены

```kotlin
// DSTheme
@Composable
fun ButtonText(...) {
    val tokens = DSTheme.tokens
    Box(
        modifier = modifier
            .background(
                color = tokens.button.backgroundDefault,
                shape = RoundedCornerShape(tokens.button.corner)
            )
    )
}
```

- Токены через `DSTheme.tokens.[компонент].[свойство]`
- Цвета: `Color` из Compose
- Размеры: `Dp` через `tokens.[компонент].corner.dp`
- Темизация через `CompositionLocal` и `MaterialTheme`

### Доступность

| Свойство | Когда использовать |
|---|---|
| `contentDescription` | Всегда для `Image`, `Icon` без текста |
| `semantics { role = Role.Button }` | Для кастомных кликабельных элементов |
| `semantics { disabled() }` | Когда `enabled = false` |
| `semantics { stateDescription }` | Для Switch, Checkbox — текущее состояние |

- Touch target: минимум `48×48dp`
- `Modifier.minimumInteractiveComponentSize()` — Compose M3 утилита
- Тестировать с TalkBack

---

## Кросс-платформенные правила

### Имена слотов (одинаковые на всех платформах)

| Слот | Назначение |
|---|---|
| `leading` | Элемент слева / перед основным контентом |
| `trailing` | Элемент справа / после основного контента |
| `content` | Основной контент (если `children` недостаточно) |
| `header` | Заголовочная зона |
| `footer` | Нижняя зона |
| `title` | Заголовок компонента |
| `subtitle` | Подзаголовок |
| `action` | Зона действий (кнопки) |

Не изобретай платформенные варианты: `leading` — не `leftContent`, не `startSlot`.

### Touch targets

| Платформа | Минимум |
|---|---|
| Web | 44×44px |
| iOS | 44×44pt |
| Android | 48×48dp |

### Состояния (единая модель)

| Состояние | Web | iOS | Android |
|---|---|---|---|
| default | ✅ | ✅ | ✅ |
| hover | ✅ | — | — |
| pressed | ✅ | ✅ | ✅ |
| focused | ✅ | ✅ (focused-ios) | — |
| active/selected | ✅ | ✅ | ✅ |
| disabled | ✅ | ✅ | ✅ |
| loading | ✅ | ✅ | ✅ |
| ripple | — | — | ✅ |

---

## Changelog

- **1.0.0** — первая версия: API-конвенции для трёх платформ,
  токены, доступность, кросс-платформенные слоты и состояния.
