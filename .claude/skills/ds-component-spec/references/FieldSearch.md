# FieldSearch — Spec

**Уровень:** Surface View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/search.html` (System Storybook presentbook).

Переименован из `Search` в `FieldSearch` по решению Principal Designer:
конвенция полей ввода в системе использует префикс `Field*`
(`FieldCheckbox`, `FieldRadio`), `Search` без префикса нарушал конвенцию.
Файл `Search.md` удалён, ссылки на компонент в `search.html` обновлены.

## Назначение

Поле поиска с leading-иконкой. Используется в шапке сайта для поиска по гайдам.

## Уровень и обоснование

**Surface View** — подтверждено Principal Designer, пометка ⚠️ снята, решение финальное.

Обоснование (критерий `SKILL.md` v1.3.0, Шаг 2): состав компонента — Icon (Item-примитив, декоративный) + Input (текстовое поле ввода — примитив уровня Item, аналогичный `Text`/`Number` из списка примеров Item, а не самостоятельный переиспользуемый Role/Entity-компонент со своим spec). Ни один элемент не является самостоятельным Role/Entity-компонентом → Surface View.

## Нейминг

- **Имя:** FieldSearch (переименован с `Search`, см. выше)
- **Формула:** Role (Field) + Entity (Search) — соблюдена.
- **Слоты:** нет подтверждённых на уровне API (см. «Открытые вопросы»)

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Leading icon | Item | ⚠️ требует уточнения | ⚠️ требует уточнения | Декоративная иконка поверх поля; цвет — icon-токен. Проверка кода: реализации `FieldSearch`/`Search` в `src/` не найдено (`Grep` по `FieldSearchProps\|SearchProps\|leadingIcon\|icon\?:`) — подтвердить обязательность по коду невозможно, формулировка не меняется. |
| 2 | Input | Item | Да | Нет | Само поле ввода: фон, рамка, типографика, состояния focus/placeholder. Без поля ввода компонент не функционален — обязателен. |

Оба элемента — Item-примитивы (ни один не самостоятельный Role/Entity-компонент) → Surface View (критерий `SKILL.md` v1.3.0, Шаг 2).

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| padding (верт., input) | — | `inset-control-v-s` |
| padding (гориз., input) | — | `inset-control-h-m` |
| padding-left (под иконку) | — | ⚠️ нужно добавить токен: `36px` захардкожен, semantic-токен под отступ иконки в контроле не заведён (Gap) |
| background (default, input) | `core-neutral-x-10` | `bg-base-main-secondary` |
| color (default, input) | `core-neutral-x-100` | `text-primary` |
| color (icon) | `core-neutral-x-60` | `icon-secondary` |
| color (placeholder) | `core-neutral-x-45` | `text-disabled` |
| border-color / outline (focus) | `core-sapphire-55` | `line-accent` |
| background (focus) | `core-neutral-x-0` | `bg-card-main` |
| border | `core-neutral-x-15` | `line-default` |
| border-radius | — | `radius-m` (derived — перекрыт `docs-theme.css` до `radius-full`) |
| typography | — | `label-s-size` / `-lh` / `-weight` |

## Состояния

| Состояние | background | color |
|---|---|---|
| Default | `bg-base-main-secondary` | `text-primary` |
| Focused | `bg-card-main` | `text-primary`, border/outline `line-accent` |

## Реализация — Web (React)

```tsx
<FieldSearch placeholder="Поиск по гайдам…" onChange={...} />
```

⚠️ Компонент в коде отсутствует — API гипотетический.

## Реализация — iOS (SwiftUI)

```swift
FieldSearchView(placeholder: "Поиск по гайдам…")
```

## Реализация — Android (Compose)

```kotlin
FieldSearch(placeholder = "Поиск по гайдам…")
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | role / aria-label | `searchbox`, `aria-label="Поиск"` |
| iOS | accessibilityLabel | «Поиск» |
| Android | contentDescription | «Поиск» |

## Открытые вопросы

1. ~~Архитектурный уровень~~ — закрыто. Подтверждено Principal Designer: **Surface View**.
2. ⚠️ Требует уточнения: обязательность leading-иконки — код проверен (`src/` не содержит реализации `FieldSearch`/`Search`), подтвердить по props невозможно; формулировка не меняется по прямому указанию.
3. ~~Несогласованность именования~~ — закрыто. Компонент переименован в `FieldSearch` (файл `Search.md` удалён, ссылки в `search.html` обновлены).
4. Gap: `padding-left: 36px` захардкожен — semantic-токен под отступ иконки не заведён.
5. Quality note: `width: 280px` на контейнере — ширина конкретного инстанса в шапке сайта, не переиспользуемое значение стиля.

---

**Стадия:** draft
