---
destination: skills/_shared/
name: token-rules
metadata:
  version: "1.5.1"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Shared-правила дизайн-токенов для всех платформ. Описывает
  двухуровневую модель Core → Semantic, стоп-правила против
  хардкодов и прямых ссылок компонентов на Core, а также
  требования к именованию и состояниям.
---

# Правила токенов дизайн-системы — v1.5.1

Двухуровневая система токенов (Core → Semantic): единые правила для Web, iOS и Android.
Токен — это контракт между дизайном и разработкой. Нарушение правил
на любом уровне — блокер для спеки и для ревью.

---

## Два уровня

```
Core → Semantic
```

| Уровень | Назначение | Пример |
|---|---|---|
| **Core** | Сырые значения без смысловой нагрузки | `color-blue-500`, `shape-corner-8`, `spacing-4` |
| **Semantic** | Назначение токена, независимое от компонента | `color-surface-default`, `color-text-primary`, `color-action-primary` |

---

## Правила уровня Core

- Только сырые значения: HEX, dp/pt, rem, целые числа
- Без смысловой нагрузки в имени: `color-blue-500`, не `color-primary`
- Не используется в компонентах напрямую — только через semantic
- Именование: `<тип>-<группа>-<шаг>` → `color-neutral-0`, `spacing-4`, `shape-corner-8`

**Цветовые группы Core:**
`neutral`, `blue`, `teal`, `green`, `red`, `orange`, `yellow`, `purple`

**Шаги насыщенности:** `0` (белый) → `900` (почти чёрный), шаг 100.
Дополнительные шаги: `50`, `150`, `650` — только если нужна промежуточная ступень.

**Пространственная шкала Core:** `spacing-0` … `spacing-80` (нелинейная — см. `core-space-tokens-guide.md`).

---

## Правила уровня Semantic

- Описывает **назначение**, не цвет: `color-surface-default`, не `color-white`
- Не привязан к конкретному компоненту
- Ссылается на Core: `color-surface-default → color-neutral-0`
- Должен работать в light и dark mode — значение меняется, имя остаётся
- Именование: `<тип>-<роль>-<вариант>` → `color-text-primary`, `color-surface-hover`
- Числа в именах Semantic-токенов запрещены: `inset-control-h-m`, не `inset-control-h-16`

**Категории semantic-токенов цвета:**

| Категория | Назначение | Примеры |
|---|---|---|
| `bg` | Фоны экранов и зон | `bg-base-main`, `bg-base-main-secondary` |
| `text` | Цвет текста | `text-primary`, `text-secondary`, `text-disabled` |
| `icon` | Цвет иконок | `icon-primary`, `icon-secondary`, `icon-accent` |
| `line` | Разделители и бордеры | `line-default`, `line-strong` |
| `bg-accent` | Акцентные фоны (бренд, статусы, продукты) | `bg-accent-main`, `bg-accent-states-hover` |
| `bg-component` | Фоны контролов (форм, переключателей) | `bg-component-states-control-accent-active` |

**Категории semantic-токенов пространства:** `inset-*`, `gap-*`, `radius-*` — см. `semantic-space-tokens-guide.md`.

**Суффиксы:**
- `-static` — значение одинаковое в light и dark mode
- `-static-lm` — зафиксировано в light mode
- `-static-dm` — зафиксировано в dark mode
- `-staticwm` — зафиксировано для White Label / Wealth Management
- `-ios` — только для iOS (например, `bg-accent-states-focused-ios`)
- `-android` — только для Android (например, `bg-accent-states-ripple-android`)

---

## Компоненты и токены

- Отдельный уровень **component‑токенов не используется**.
- Компоненты (кнопки, инпуты, бейджи и т.п.) **ссылаются только на semantic‑токены**.
- Связь «компонент → semantic‑токены» описывается в спецификациях компонентов
  (см. `ds-component-spec`), а не в отдельном уровне токенов.

---

## Состав типографического стиля

Semantic-токен типографики (`heading-m`, `body-s`, `label-m` и т.п.) — это не одно
значение, а **фиксированный набор свойств**. Каждое свойство ссылается на Core-токен
типографики:

| Свойство | Core-токен | Обязательно |
|---|---|---|
| `font-family` | `type-family-*` | да |
| `font-size` | `type-size-*` | да |
| `line-height` | `type-lh-*` | да |
| `font-weight` | `type-weight-*` | да |
| `letter-spacing` (tracking) | `type-tracking-*` | да |

Правила:

- `letter-spacing` (трекинг) — **полноправное свойство** стиля наравне с size, line-height
  и weight, а не опциональная добавка.
- Все свойства обязательны: частичный токен (например, size без line-height, weight или
  letter-spacing) — блокер.
- Свойства ссылаются на Core через semantic-роль; компонент → Core напрямую запрещён.
- `font-weight` любого шага `type-weight-*`, включая `type-weight-700`, допустим для
  любой роли, включая `label-*`, если это задокументировано как отдельный полный
  semantic-токен (пример: `label-xs-weight-strong` — усиленное начертание `label-xs`,
  см. `semantic-typography-tokens-guide.md`, раздел 7.1). Веса не ограничены «своим»
  диапазоном на роль — привязка веса к роли решается на semantic-уровне, не запрещена
  архитектурно.

Детали шкал Core (`type-size-*`, `type-lh-*`, `type-weight-*`, `type-tracking-*`) —
в `core-typography-tokens-guide.md`; правила ролей и их состав —
в `semantic-typography-tokens-guide.md`.

---

## Блокеры (стоп-правила)

Следующее **запрещено** и является блокером в спеке и ревью:

| Нарушение | Пример | Как исправить |
|---|---|---|
| Захардкоженное значение вместо токена | `background: #0057FF` | `background: color-action-primary` |
| Компонент → Core напрямую | `button-bg → color-blue-500` | `button-bg → color-action-primary → color-blue-500` |
| Компонент → `spacing-N` напрямую | `padding → spacing-16` | `padding → inset-control-h-m → spacing-16` |
| Semantic-токен с именем цвета | `color-blue` как semantic | `color-action-primary` |
| Semantic-токен с числом в имени | `inset-control-h-16` | `inset-control-h-m` |
| Разные токены для одного смысла | `button-bg-default` и `button-background-default` | Унифицировать именование |

---

## Границы категорий — стоп-правила

### Типографика vs Цвет

Типографика отвечает **ТОЛЬКО** за форму текста:

- font-family, font-size, font-weight, line-height, letter-spacing

Цвет текста — это **НЕ** типографика. Он живёт в Semantic Color Tokens, категория `text`:

- `text-primary`, `text-secondary`, `text-muted`, `text-disabled`, `text-inverse` → semantic-color
- `icon-primary`, `icon-secondary`, `icon-accent` → semantic-color

❌ **Запрещено:** typography token со значением цвета (`#hex`, `rgba`, `var(--core-*)` с цветом)  
❌ **Запрещено:** в таблице типографики отображать токены с color-значениями  
✅ **Правило:** если значение токена — цвет, токен принадлежит color-группе, не typography

### Пространство vs Цвет vs Типографика

Каждый токен принадлежит **ровно одной** категории.  
Определяется по **значению**, не по контексту использования:

| Значение токена | Категория |
|---|---|
| `#hex`, `rgba`, `oklch` | color |
| `px`, `rem`, `em` (размер текста) | typography |
| `px`, `rem` (отступы, радиусы) | space |
| font-name, font-stack | typography |
| unitless number (font-weight) | typography |

---

## Отсутствующий semantic-токен

Если нужный semantic-токен не существует — **не используй Core напрямую**.
Отметь явно в спеке:

```
⚠️ нужно добавить токен: color-surface-accent-subtle
```

И опиши предлагаемое значение:

```
color-surface-accent-subtle → color-teal-50 (light) / color-teal-900 (dark)
```

---

## Состояния и соответствие платформ

Нейминг состояний в Figma, логика поглощения и правила комбинирования — в `component-states-guide.md`.

Таблица токенов по платформам:

| Состояние (Figma) | Web | iOS | Android |
|---|---|---|---|
| hovered | `bg-accent-states-hover` | — | — |
| pressed | `bg-accent-states-pressed` | `bg-accent-states-pressed` | `bg-accent-states-pressed` |
| selected / active | `bg-accent-states-active` | `bg-accent-states-active` | `bg-accent-states-active` |
| disabled | `bg-accent-states-disable` | `bg-accent-states-disable` | `bg-accent-states-disable` |
| focused | `bg-accent-states-focused` | `bg-accent-states-focused-ios` | — |
| ripple | — | — | `bg-accent-states-ripple-android` |

Суффикс `-ios` — только в iOS-реализации.
Суффикс `-android` — только в Android-реализации.
Web не использует `-ios` и `-android` токены.

---

## Changelog

- **1.5.1** — 2026-07-03. Уточнено в разделе «Состав типографического
  стиля»: `font-weight` (включая `type-weight-700`) допустим для любой
  роли, включая `label-*`, если задокументирован как отдельный полный
  semantic-токен (пример: `label-xs-weight-strong`). Основание — спека
  `spec-002` (`memory/ds-component-spec/log.sergej.json`).
- **1.5.0** — добавлен раздел «Состав типографического стиля»: фиксированный набор свойств semantic-токена типографики (font-family, font-size, line-height, font-weight, letter-spacing/tracking) с явным указанием, что трекинг — полноправное обязательное свойство.
- **1.4.0** — добавлен раздел «Границы категорий — стоп-правила»: типографика vs цвет, пространство vs цвет vs типографика; правило определения категории по значению токена.
- **1.3.1** — раздел «Состояния» переработан: убраны колонки платформ-кода (они в `component-states-guide.md`), добавлена строка `selected/active`, добавлена ссылка на `component-states-guide.md`.
- **1.3.0** — версия синхронизирована с репо после миграции на двухуровневую архитектуру; frontmatter приведён к skill-совместимому формату (name, metadata, description).
- **1.2.1** — добавлены ссылки на `core-space-tokens-guide.md` и `semantic-space-tokens-guide.md`; добавлены блокеры для прямого использования `spacing-N` в компонентах и чисел в именах Semantic-токенов пространства.
- **1.2.0** — переход на двухуровневую модель токенов (Core → Semantic), уровень Component исключён из правил; уточнены формулировки блокеров.
- **1.1.0** — нотация токенов приведена к дефисной (`-`) как дефолтной для всех платформ. Заменены все примеры: точечная нотация (`color.blue.500`) → дефисная (`color-blue-500`).
- **1.0.0** — первая версия: система токенов, блокеры, состояния, соответствие платформ, суффиксы static/staticwm.
