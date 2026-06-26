---
name: "token-rules"
description: "Правила трёхуровневой системы токенов Core → Semantic → Component. Активируй при работе с токенами, именованием, аудитом токенов."
---
---
title: Правила токенов дизайн-системы
version: "1.0.0"
owner: design-system-team
---

# Правила токенов дизайн-системы — v1.0.0

Трёхуровневая система токенов: единые правила для Web, iOS и Android.
Токен — это контракт между дизайном и разработкой. Нарушение правил
на любом уровне — блокер для спеки и для ревью.

---

## Три уровня

```
Primitive → Semantic → Component
```

| Уровень | Назначение | Пример |
|---|---|---|
| **Primitive** | Сырые значения без смысловой нагрузки | `color.blue.500`, `shape.corner.8`, `spacing.4` |
| **Semantic** | Назначение токена, независимое от компонента | `color.surface.default`, `color.text.primary`, `color.action.primary` |
| **Component** | Конкретный компонент, ссылается только на semantic | `button.background.default`, `badge.text`, `input.border.focused` |

---

## Правила уровня Primitive

- Только сырые значения: HEX, dp/pt, rem, целые числа
- Без смысловой нагрузки в имени: `color.blue.500`, не `color.primary`
- Не используется в компонентах напрямую — только через semantic
- Именование: `<тип>.<группа>.<шаг>` → `color.neutral.0`, `spacing.4`, `shape.corner.8`

**Цветовые группы primitive:**
`neutral`, `blue`, `teal`, `green`, `red`, `orange`, `yellow`, `purple`

**Шаги насыщенности:** `0` (белый) → `900` (почти чёрный), шаг 100.
Дополнительные шаги: `50`, `150`, `650` — только если нужна промежуточная ступень.

---

## Правила уровня Semantic

- Описывает **назначение**, не цвет: `color.surface.default`, не `color.white`
- Не привязан к конкретному компоненту
- Ссылается на primitive: `color.surface.default → color.neutral.0`
- Должен работать в light и dark mode — значение меняется, имя остаётся
- Именование: `<тип>.<роль>.<вариант>` → `color.text.primary`, `color.surface.hover`

**Категории semantic-токенов цвета:**

| Категория | Назначение | Примеры |
|---|---|---|
| `bg` | Фоны экранов и зон | `bg.base.main`, `bg.base.main-secondary` |
| `text` | Цвет текста | `text.primary`, `text.secondary`, `text.disabled` |
| `icon` | Цвет иконок | `icon.primary`, `icon.secondary`, `icon.accent` |
| `line` | Разделители и бордеры | `line.default`, `line.strong` |
| `bg.accent` | Акцентные фоны (бренд, статусы, продукты) | `bg.accent.main`, `bg.accent.states.hover` |
| `bg.component` | Фоны контролов (форм, переключателей) | `bg.component.states.control.accent.active` |

**Суффиксы:**
- `-static` — значение одинаковое в light и dark mode
- `-static-lm` — зафиксировано в light mode
- `-static-dm` — зафиксировано в dark mode
- `-staticwm` — зафиксировано для White Label / Wealth Management
- `-ios` — только для iOS (например, `bg.accent.states.focused-ios`)
- `-android` — только для Android (например, `bg.accent.states.ripple-android`)

---

## Правила уровня Component

- Ссылается на semantic, **никогда напрямую на primitive**
- Именование: `<компонент>.<свойство>.<состояние>` → `button.background.default`
- Допустим только когда semantic-токена недостаточно для точности

**Когда component-токен оправдан:**
- Компонент имеет уникальную комбинацию значений, которую нельзя покрыть одним semantic
- Нужна явная связь токена с компонентом для документации

**Когда component-токен избыточен:**
- Значение полностью совпадает с semantic — просто используй semantic напрямую
- Создание component-токена ради наличия слоя — антипаттерн

---

## Блокеры (стоп-правила)

Следующее **запрещено** и является блокером в спеке и ревью:

| Нарушение | Пример | Как исправить |
|---|---|---|
| Захардкоженное значение вместо токена | `background: #0057FF` | `background: color.action.primary` |
| Component → Primitive напрямую | `button.bg → color.blue.500` | `button.bg → color.action.primary → color.blue.500` |
| Semantic-токен с именем цвета | `color.blue` как semantic | `color.action.primary` |
| Разные токены для одного смысла | `button.bg.default` и `button.background.default` | Унифицировать именование |

---

## Отсутствующий semantic-токен

Если нужный semantic-токен не существует — **не используй primitive напрямую**.
Отметь явно в спеке:

```
⚠️ нужно добавить токен: color.surface.accent-subtle
```

И опиши предлагаемое значение:
```
color.surface.accent-subtle → color.teal.50 (light) / color.teal.900 (dark)
```

---

## Состояния и соответствие платформ

| Состояние | Web | iOS | Android |
|---|---|---|---|
| hover | `bg.accent.states.hover` | — | — |
| pressed | `bg.accent.states.pressed` | `bg.accent.states.pressed` | `bg.accent.states.pressed` |
| active | `bg.accent.states.active` | `bg.accent.states.active` | `bg.accent.states.active` |
| disabled | `bg.accent.states.disable` | `bg.accent.states.disable` | `bg.accent.states.disable` |
| focused | `bg.accent.states.focused` | `bg.accent.states.focused-ios` | — |
| ripple | — | — | `bg.accent.states.ripple-android` |

Суффикс `-ios` — только в iOS-реализации.
Суффикс `-android` — только в Android-реализации.
Web не использует `-ios` и `-android` токены.

---

## Changelog

- **1.0.0** — первая версия: три уровня, блокеры, состояния,
  соответствие платформ, суффиксы static/staticwm.
