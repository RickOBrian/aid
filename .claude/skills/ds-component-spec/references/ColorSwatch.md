# ColorSwatch — Spec

**Уровень:** Surface View
**Платформы:** Web · iOS (planned) · Android (planned)
**Дата:** 2026-07-24 · **Автор:** sergej

Источник: `docs/storybook/components/color-swatch.html` (System Storybook presentbook).

## Назначение

Read-only цветной блок для демонстрации токена: базовый вариант — сплошная заливка, alpha-вариант — сравнение solid/alpha-заливки поверх шахматной подложки. Служебный компонент документации, не продуктовый UI-контрол.

## Уровень и обоснование

**Surface View** — подтверждено Principal Designer, пометка ⚠️ снята, решение финальное.

Обоснование: alpha-вариант (`.color-swatch--alpha`) — это композиция из двух визуальных зон с разным поведением рендера (solid-заливка + заливка поверх шахматной подложки), а не единичный примитив уровня Icon/Text. Это отличает его от `Dot` (Item) — у `Dot` нет внутреннего деления на зоны с разной логикой отображения. Базовый вариант (`.color-swatch`) — простейший случай той же оболочки с одной зоной, уровень компонента фиксируется как Surface View целиком (единая классификация для всех вариантов одного компонента).

Критерий `SKILL.md` v1.3.0 (Шаг 2) для Structural View по-прежнему не достигнут: ни «solid-часть», ни «alpha-часть» не являются самостоятельными переиспользуемыми Role/Entity-компонентами со своим именем/spec — оба варианта остаются в границах Surface View, а не Structural View.

⚠️ Известный пробел (зафиксирован в `SKILL.md` как TODO, не исправляется в рамках этой задачи): критерий v1.3.0 покрывает только развилку Surface View vs Structural View, а не Item vs Surface View — то, что фактически потребовалось для решения по этому компоненту.

## Нейминг

- **Имя:** ColorSwatch
- **Формула:** Entity (Color) + Entity (Swatch) — служебное имя категории документации, формула Role + Entity не применяется буквально (нет глагольной Role); аналогично `Dot`/`Avatar` в списке исключений `SKILL.md`.
- **Слоты:** нет

## Item / Structural View

| # | Элемент | Архитектурный уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Swatch (базовый) | Item | Да | — | Атомарный цветной блок без вложенного контента (единственный Item внутри Surface View-оболочки базового варианта). |
| 2 | Solid-часть (alpha-вариант) | Item | Да, в рамках alpha-варианта | Нет — обе половины обязательны для сравнения | Левая половина alpha-варианта — непрозрачная заливка. |
| 3 | Alpha-часть (alpha-вариант) | Item | Да, в рамках alpha-варианта | Нет | Правая половина — заливка поверх шахматной подложки. |

Ни один элемент не является самостоятельным Role/Entity-компонентом → Structural View исключён по критерию `SKILL.md` v1.3.0. Элементы 2–3 — Item-примитивы внутри одной Surface View-оболочки (композиция solid+alpha) → уровень компонента Surface View.

## Токены

| Свойство | Core | Semantic |
|---|---|---|
| width / height (базовый) | — | ⚠️ нужно добавить токен: `32px` захардкожен, semantic size-токена для габаритов свотча нет (Gap) |
| width (alpha-вариант) | — | ⚠️ тот же захардкоженный размер: `64px` |
| background (fallback) | `core-neutral-x-10` | `bg-base-main-secondary` |
| background (checker) | — | ⚠️ нужно добавить токен: `#ccc` / `#ffffff` захардкожены напрямую (Blocker — прямое нарушение no-hardcode-color-protocol) |
| border | `core-neutral-x-15` | `line-default` |
| border-radius | — | `radius-s` |

## Состояния

Read-only — states не применимы.

## Реализация — Web (React)

```tsx
<ColorSwatch token="bg-accent-main" alpha />
```

## Реализация — iOS (SwiftUI)

```swift
ColorSwatchView(token: "bg-accent-main", showsAlpha: true)
```

## Реализация — Android (Compose)

```kotlin
ColorSwatch(token = "bg-accent-main", showsAlpha = true)
```

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | aria-hidden | да (чисто декоративный, значение токена дублируется текстом рядом) |
| iOS / Android | accessibilityHidden | да |

## Открытые вопросы

1. ~~Архитектурный уровень (Item vs Surface View)~~ — закрыто. Подтверждено Principal Designer: **Surface View** (alpha-вариант — композиция двух визуальных зон с разным поведением рендера, а не единичный примитив уровня Icon/Text). Известный пробел критерия `SKILL.md` v1.3.0 (не покрывает Item vs Surface View) зафиксирован отдельным TODO в `SKILL.md`.
2. ⚠️ Требует уточнения: `width`/`height` (`32px`/`64px`) захардкожены — semantic size-токена для свотча нет.
3. Blocker: `.color-swatch__checker` использует прямые HEX (`#ccc`, `#ffffff`) в `background-image`/`background-color` — прямое нарушение no-hardcode-color-protocol, зафиксировано в presentbook «Нарушения».

---

**Стадия:** draft
