# Card — Spec

**Уровень:** Structural View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/card.html` (System Storybook presentbook).

## Назначение

Карточка-контейнер для превью сущности: заголовок с бейджем статуса, описание и футер с метаданными (тег + версия).

## Уровень и обоснование

**Structural View** — подтверждено Principal Designer, пометка ⚠️ снята, решение финальное.

Обоснование (критерий `SKILL.md` v1.3.0, Шаг 2): внутри Card используются два самостоятельных переиспользуемых Role/Entity-компонента — `Badge` (в зоне header) и `Chip` (в зоне footer), у каждого свой spec. Это ≥2 самостоятельных Role/Entity-компонента внутри одного компонента → Structural View, а не Surface View (где допустимы только Item-примитивы в одной обёртке).

## Нейминг

- **Имя:** Card
- **Формула:** исключение из формулы Role + Entity — устоявшееся имя, аналогично Avatar/Badge/Dialog (см. `SKILL.md`, Шаг 3).
- **Слоты (предполагаемые, не подтверждённые):** header, description, footer

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Header / Title | Item | ⚠️ не найдена реализация для проверки props | ⚠️ не найдена реализация для проверки props | Текст названия сущности (`card__name`). В `src/` нет компонента `Card` — проверить фактические props невозможно. |
| 2 | Header / Status Badge | ❖ Surface View (nested) | ⚠️ не найдена реализация для проверки props | ⚠️ не найдена реализация для проверки props | Вложенный компонент `Badge` (`Badge.md`) для статуса. В `src/` нет компонента `Card` — проверить фактические props невозможно. |
| 3 | Description | Item | ⚠️ не найдена реализация для проверки props | ⚠️ не найдена реализация для проверки props | Текстовое описание, line-clamp 2 строки. В `src/` нет компонента `Card` — проверить фактические props невозможно. |
| 4 | Footer / Tag | ❖ Surface View (nested) | ⚠️ не найдена реализация для проверки props | ⚠️ не найдена реализация для проверки props | Вложенный компонент `Chip` (`Chip.md`) с типом/категорией. В `src/` нет компонента `Card` — проверить фактические props невозможно. |
| 5 | Footer / Version | Item | ⚠️ не найдена реализация для проверки props | ⚠️ не найдена реализация для проверки props | Текст версии (`card__version`). В `src/` нет компонента `Card` — проверить фактические props невозможно. |

Проверка проведена по инструкции Principal Designer: искал `Card`/`CardProps` в `src/` (`Grep` по `interface.*Card|type CardProps|function Card|const Card`) — реализации не найдено, только статичная разметка в presentbook. Обязательность/опциональность элементов 1–5 остаётся открытым вопросом с уточнённой формулировкой (см. «Открытые вопросы»). Только Container-обёртка (не входит в таблицу) точно обязателен.

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| padding (верт.) | — | `inset-container-v-m` |
| padding (гориз.) | — | `inset-container-h-m` |
| header gap | — | `gap-s` |
| header margin-bottom | — | `gap-s` |
| footer gap | — | `gap-xs` |
| footer margin-top | — | `gap-m` |
| background | `core-neutral-x-0` | `bg-card-main` |
| color (name) | `core-neutral-x-100` | `text-primary` |
| color (description) | `core-neutral-x-60` | `text-secondary` |
| border-color (hover) | `core-sapphire-55` | `line-accent` (derived — дублируется правилом `.card:hover` в `docs-theme.css`) |
| border | `core-neutral-x-15` | `line-default` (derived — перекрыт `docs-theme.css`) |
| border-radius | — | `radius-l` (derived — перекрыт `docs-theme.css` до `0`) |
| typography (header) | — | `heading-xs-size` / `-lh` / `-weight` |
| typography (description) | — | `body-s-size` / `-lh` / `-weight` |
| typography (footer version) | — | `label-xs-size` / `-lh` / `-weight` |

## Состояния

| Состояние | border-color |
|---|---|
| Default | `line-default` |
| Hover | `line-accent` |

## Ограничения

- Описание: максимум 2 строки, переполнение обрезается (`line-clamp`).

## Реализация — Web (React)

```tsx
<Card>
  <Card.Header title="Card Name" badge={<Badge variant="draft">Draft</Badge>} />
  <Card.Description>Пример описания карточки…</Card.Description>
  <Card.Footer tag={<Chip>Type</Chip>} version="v1.0.0" />
</Card>
```

⚠️ API выше — гипотетический, не подтверждён исходной реализацией.

## Реализация — iOS (SwiftUI)

```swift
CardView(title: "Card Name", badge: .draft, description: "…", tag: "Type", version: "v1.0.0")
```

## Реализация — Android (Compose)

```kotlin
Card(title = "Card Name", badge = BadgeVariant.Draft, description = "…", tag = "Type", version = "v1.0.0")
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | семантика | контейнер как `article`/`section`, заголовок — `heading` уровня, соответствующего контексту списка |
| iOS | accessibilityElement | группировка заголовка + описания + футера в один элемент чтения |
| Android | contentDescription | аналогично |

## Открытые вопросы

1. ~~Архитектурный уровень (Surface View vs Structural View)~~ — закрыто. Подтверждено Principal Designer: **Structural View** (композиция из 2 самостоятельных Role/Entity-компонентов — Badge, Chip).
2. ⚠️ Не найдена реализация для проверки props: обязательность и возможность отключения элементов 1–5 (header title, header badge, description, footer tag, footer version) — в `src/` нет компонента `Card`, проверка по коду невозможна. Остаётся открытым до появления реализации.
3. Нарушений no-hardcode-color-protocol не найдено — все цвета через semantic-токены.

---

**Стадия:** draft
