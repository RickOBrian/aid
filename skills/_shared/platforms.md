---
destination: skills/_shared/
name: platforms
title: Платформенные правила дизайн-системы
version: "2.0.0"
owner: design-system-team
platforms: [ios, android, web]
stack: Kotlin / Compose Multiplatform (CMP)
---

# Платформенные правила — v2.0.0

Единая кодовая база на Kotlin с Compose Multiplatform (CMP): iOS, Android, Web
(веб — через CMP for Web, без React/TypeScript). Нет раздельных нативных
стеков (SwiftUI/UIKit не используется). API компонента, токены и слоты
описываются один раз и применяются на все три таргета.

Этот файл читается скиллами автоматически — не дублируй эти правила
в отдельных скиллах.

> ⚠️ **Открытый вопрос (требует решения Principal Designer):** для touch target
> и accessibility ниже приведены черновые значения по умолчанию из практики
> Compose/Android (48dp) и общий accessibility-слой CMP. Нужно подтвердить,
> используется ли единое значение touch target на все таргеты, или требуются
> платформенные исключения (например, отдельно для web-курсора).

---

## API компонента (CMP, общий для iOS/Android/Web)

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
- Одна реализация компилируется на iOS, Android и Web — не создавать платформенные форки API

---

## Токены

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
- Темизация через `CompositionLocal`

---

## Доступность

Единый accessibility-слой CMP (`Modifier.semantics { ... }`), фактическое
поведение на экране всё равно зависит от платформенного screen reader
(TalkBack на Android, VoiceOver на iOS, screen reader/keyboard nav в браузере
на Web).

| Свойство / API | Когда использовать |
|---|---|
| `contentDescription` | Всегда для `Image`, `Icon` без текста |
| `semantics { role = Role.Button }` | Для кастомных кликабельных элементов |
| `semantics { disabled() }` | Когда `enabled = false` |
| `semantics { stateDescription }` | Для Switch, Checkbox — текущее состояние |

Платформенная проверка:

| Платформа | Что тестировать |
|---|---|
| Android | TalkBack |
| iOS | VoiceOver (через CMP accessibility bridge) |
| Web | Screen reader + keyboard-навигация (Tab, Enter/Space) |

---

## Touch targets

> Черновое значение по умолчанию — требует подтверждения.

| Платформа | Минимум |
|---|---|
| Android | 48×48dp |
| iOS | 48×48dp (через CMP, единое значение) |
| Web | 48×48px (курсорный ввод допускает меньше, но не рекомендуется) |

- `Modifier.minimumInteractiveComponentSize()` — Compose M3 утилита, применяется на всех таргетах

---

## Кросс-платформенные правила

### Имена слотов (одинаковые на всех платформах)

| Слот | Назначение |
|---|---|
| `leading` | Элемент слева / перед основным контентом |
| `trailing` | Элемент справа / после основного контента |
| `content` | Основной контент (если основного параметра недостаточно) |
| `header` | Заголовочная зона |
| `footer` | Нижняя зона |
| `title` | Заголовок компонента |
| `subtitle` | Подзаголовок |
| `action` | Зона действий (кнопки) |

Не изобретай платформенные варианты: `leading` — не `leftContent`, не `startSlot`.

### Состояния (единая модель)

| Состояние | Android | iOS | Web |
|---|---|---|---|
| default | ✅ | ✅ | ✅ |
| hover | — | — | ✅ (курсор) |
| pressed | ✅ | ✅ | ✅ |
| focused | ✅ | ✅ | ✅ (keyboard focus) |
| active/selected | ✅ | ✅ | ✅ |
| disabled | ✅ | ✅ | ✅ |
| loading | ✅ | ✅ | ✅ |
| ripple | ✅ | — | — |

---

## Проверка интерактивности (обязательный чеклист)

Перед тем как code snippet или реализация интерактивного компонента
(Surface View / Structural View с состоянием) считается готовой — явно
пройти этот чеклист. Reference-only сниппеты без файла в репозитории
**не освобождают** от корректности паттерна: заглушки, ломающие
интерактивность, недопустимы даже в «примерном» коде.

### Состояние и обработчики

- `checked` / `selected` / `value` и аналоги передаются в нативный
  Composable **напрямую** от входных параметров обёртки, не как
  захардкоженные литералы.
- `onCheckedChange` / `onValueChange` / `onClick` **не** заменяются на
  `null` или пустую лямбду `{}` в reference-реализации — это делает
  компонент неинтерактивным при видимой доступности.
- `enabled` учитывает **все** источники недоступности (`isLoading` и т.п.),
  например `enabled = enabled && !isLoading`, а не только один флаг.

Правило действует на все три таргета: реализация одна, и заглушка ломает
интерактивность сразу везде.

### Перед выдачей

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

## Changelog

- **2.0.0** — переход на единый стек Kotlin / Compose Multiplatform (CMP)
  для iOS, Android и Web. Убраны отдельные разделы React/TypeScript и
  SwiftUI как самостоятельные API-конвенции; один общий раздел API и
  токенов для всех таргетов. Touch target и accessibility-таблицы помечены
  как черновые до подтверждения Principal Designer. Чеклист проверки
  интерактивности сохранён и сужен до Compose: подразделы SwiftUI и
  Web/React удалены как неприменимые к новому стеку.
- **1.1.0** — добавлена секция «Проверка интерактивности (обязательный
  чеклист)»: запрет `.constant()` в SwiftUI reference/real code, прямой
  проброс state/callbacks в Compose, общие правила для snippet/sandbox и
  UI-пометки для reference-only.
- **1.0.0** — первая версия: API-конвенции для трёх платформ (Web/React,
  iOS/SwiftUI, Android/Compose), токены, доступность, кросс-платформенные
  слоты и состояния. (устарело)
