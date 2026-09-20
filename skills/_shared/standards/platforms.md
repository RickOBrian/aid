---
destination: skills/_shared/standards/
name: platforms
metadata:
  version: "1.2.1"
  status: alpha
  lastReviewed: "2026-09-20"
  machineFile: null
  kind: standard
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Конвенции реализации компонентов по стекам: API props, токены,
  доступность, touch targets, кросс-платформенные слоты и обязательный
  чеклист интерактивности. Стек продукта читается из его манифеста.
---


# Платформенные правила

> Статус: Alpha · v1.2.1 · обновлено 2026-09-20

Конвенции реализации компонентов по стекам. Файл читается автоматически —
не дублируй эти правила в отдельных гайдах и скиллах.

---

## 1. Платформа, стек и продукт

Это три разные вещи, и раньше они жили в одном слове.

| Понятие | Что означает | Где объявлено |
|---|---|---|
| Платформа | Где работает продукт: `web`, `ios`, `android` | `products/<id>/product.json` → `platformModel.targets` |
| Стек | Чем реализовано: `react`, `swiftui`, `compose`, `cmp` | `products/<id>/product.json` → `platformModel.stacks` |
| Продукт | Чей это UI Kit | `products/registry.json` |

Одна платформа может обслуживаться разными стеками в разных продуктах.
Поэтому разделы ниже описывают **конвенции стека**, а не «правила iOS».

Пока у продукта `platformModel.declared: false` — стек уточняется, а не
подставляется умолчанием.

**Kotlin Compose Multiplatform (`cmp`).** Конвенции API и токенов берутся
из раздела Compose. Платформенные отличия выносятся в `expect`/`actual`;
кросс-платформенные правила (слоты, состояния, touch targets) применяются
к общему модулю. Отдельного раздела `cmp` не заводится, пока хотя бы один
продукт не объявит этот стек.

---

## 2. Паритет пропов между стеками

Имена пропов не обязаны совпадать буквально. Обязан совпадать смысл.

| Смысл | React | SwiftUI | Compose |
|---|---|---|---|
| Недоступность | `isDisabled` | `isDisabled` | `enabled` (инвертирован) |
| Загрузка | `isLoading` | `isLoading` | `isLoading` |
| Выбранность | `isSelected` | `isSelected` | `selected` |
| Действие | `onClick` | `action` | `onClick` |
| Изменение значения | `onChange` | `onChange` | `onValueChange` |
| Вариант | `variant` | `variant` | `variant` |
| Размер | `size` | `size` | `size` |

Правило: общий контракт компонента описывается в терминах смысла, а
платформенное имя берётся из этой таблицы. Расхождение имени — не
нарушение; расхождение набора возможностей — нарушение.

Инвертированные пропы (`enabled` против `isDisabled`) требуют внимания при
переносе: `enabled = !isDisabled && !isLoading`, а не `enabled = !isDisabled`.

---

## 3. Web (React + TypeScript)

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

## 4. iOS (SwiftUI)

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

## 5. Android (Compose)

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

## 6. Кросс-платформенные правила

### Имена слотов

Канон слотов — в `ds-component-architecture-guide.md`, раздел «Слоты
Structural View». Имена одинаковы на всех стеках; различается только
способ передачи: пропы в React, `@ViewBuilder` в SwiftUI, лямбды в Compose.

Не изобретай платформенные варианты: `leading`, не `leftContent` и не
`startSlot`.

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

## 7. Проверка интерактивности (обязательный чеклист)

Перед тем как code snippet или реализация интерактивного компонента
(Surface View / Structural View с состоянием) считается готовой — явно
пройти этот чеклист. Reference-only сниппеты без файла в репозитории
**не освобождают** от корректности паттерна: заглушки, ломающие
интерактивность, недопустимы даже в «примерном» коде.

### SwiftUI

- Любой `Binding`, передаваемый в интерактивный элемент (`Toggle`,
  `Slider`, `TextField` и т.п.), должен быть **настоящим двусторонним**
  `Binding` — через `@State`, `@Binding`, или вычисляемый
  `Binding(get:set:)`. **Не** `.constant(...)`.
- `.constant(...)` допустим **только** в Preview / `#Preview` /
  Xcode preview provider — **никогда** в реальном или reference-компоненте,
  который позиционируется как рабочий пример использования.
- Если компонент принимает `action` / `onChange` как параметр — явно
  проверить, что путь от пользовательского взаимодействия до вызова
  колбэка **не прерывается** внутри тела компонента (read-only Binding
  = hard stop).

### Compose

- `checked` / `selected` / `value` и аналоги передаются в нативный
  Composable **напрямую** от входных параметров обёртки, не как
  захардкоженные литералы.
- `onCheckedChange` / `onValueChange` / `onClick` **не** заменяются на
  `null` или пустую лямбду `{}` в reference-реализации — это делает
  компонент неинтерактивным при видимой доступности.
- `enabled` учитывает **все** источники недоступности (`isDisabled`,
  `isLoading` и т.п.), например `enabled = enabled && !isLoading`, а не
  только один флаг.

### Web (React)

- Controlled props (`checked`, `value`) не подменяются константами в
  обёртке; `onChange` / `onClick` не заменяются на `undefined` или
  no-op, если компонент позиционируется как интерактивный.
- `disabled` / `aria-disabled` / `aria-busy` должны согласованно
  отражать все блокирующие состояния (`isDisabled`, `isLoading`).

### Общее (все платформы)

- Перед выдачей snippet или сборкой Presentbook sandbox для
  интерактивного компонента — подтвердить в review summary, что состояние
  и обработчики событий **реально связаны**, а не заглушены константой /
  пустой функцией.
- Если код **не запускался и не собирался** (reference-only без файла в
  репозитории) — в UI явно указывать:
  1. «reference implementation, не проверено сборкой»;
  2. «интерактивность не верифицирована вручную — проверьте перед
     использованием как основы для реального кода».

---

## 8. Changelog

- **1.2.1** — 2026-09-20. Собственная таблица слотов заменена ссылкой на
  канон: `title`, `subtitle` и `action` жили только здесь и отсутствовали
  в архитектурном гайде — теперь они в каноне.
- **1.2.0** — 2026-09-20. Введено различение платформы, стека и продукта:
  стек читается из `products/<id>/product.json` → `platformModel`, разделы
  описывают конвенции стека, а не «правила платформы» (ADR-015). Добавлен
  раздел «Паритет пропов между стеками» — расхождение имени не нарушение,
  расхождение возможностей нарушение; отмечена ловушка инвертированного
  `enabled`. Описано, как применять конвенции к стеку `cmp`. Устранено
  расхождение версии: заголовок показывал v1.0.0 при frontmatter 1.1.0.
  Форма приведена к `guide-template.md`.
- **1.1.0** — добавлена секция «Проверка интерактивности (обязательный
  чеклист)»: запрет `.constant()` в SwiftUI reference/real code, прямой
  проброс state/callbacks в Compose, общие правила для snippet/sandbox и
  UI-пометки для reference-only.
- **1.0.0** — первая версия: API-конвенции для трёх платформ,
  токены, доступность, кросс-платформенные слоты и состояния.
