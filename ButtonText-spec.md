# ButtonText — Spec
Уровень: Surface View
Платформы: Web · iOS · Android
Дата: 2026-08-10   Автор: sergej

> **Источник.** Figma-ссылка/node-id для этой сессии предоставлена не была
> (запрошена явно, ответ пользователя — ссылка на страницу презентбука, не
> на Figma-фрейм). Значения ниже извлечены из эталонной production-реализации
> компонента и её презентбук-документации (актуальный живой код, который сам
> презентбук рендерит как источник правды), а не из Figma напрямую. Это
> отступление от исходного плана «Figma → спека» зафиксировано в «Открытые
> вопросы» — при появлении реальной Figma-ссылки токены и состояния нужно
> сверить с фреймом отдельным проходом. Ни одно значение ниже не выдумано:
> каждое взято из кода или помечено ⚠️ TBD, если код тоже не даёт ответа.
>
> **Память.** Компонент уже спекался ранее: `spec-001`
> (`memory/ds-component-spec/log.sergej.json`, 2026-07-24, стадия *draft*,
> 3 открытых вопроса, устаревшая точечная нотация токенов вида
> `color.action.primary.hover`). Эта спека — новая, полная версия по
> актуальному шаблону `ds-component-spec/SKILL.md` v1.3.0, с исчерпывающим
> аудитом токенов на трёх платформах. Старый файл-референс
> `.claude/skills/ds-component-spec/references/ButtonText.md` не изменялся.

## Назначение

Кнопка с текстовым слотом — интерактивный Surface View для запуска действия одним тапом/кликом. Показывает обязательный текстовый лейбл, опциональную ведущую иконку и опциональный числовой индикатор рядом с собой (реализован отдельным компонентом, не частью разметки). Поддерживает 4 размера и 7 типов заливки для разной степени визуального акцента действия. Не имеет составных именованных слотов сверх иконки (нет `trailing`, нет произвольного контента), не заменяет кнопку только с иконкой и не управляет собственной видимостью/позиционированием на экране.

## Уровень и обоснование

**Surface View** — один обязательный контент-элемент (Text) в интерактивной оболочке: фон/рамка + форма (border-radius) + отступы. Icon — вспомогательный Item-примитив, допустимый в Surface View по правилу раздела 5 архитектурного гайда (не образует отдельного именованного слота). Chevron — второй вспомогательный Item-примитив, безусловно добавляемый только в размере Tiny. Counter — единственный потенциально самостоятельный Role/Entity-компонент (CounterValue, свой Surface View spec), но он физически не подключён к рендереру этого компонента (см. таблицу «Item / Structural View» ниже) и не образует второго именованного слота в реализации — порог «≥2 самостоятельных Role/Entity-компонента» (уточнение `ds-component-spec/SKILL.md`, Шаг 2, v1.3.0) не достигнут. Уровень зафиксирован без открытого вопроса.

## Нейминг

Имя: ButtonText
Формула: Button + Text — Role `Button` (интерактивная оболочка с действием), Entity `Text` (единственный обязательный контент)
Слоты (только Structural View): нет — компонент не Structural View

## Item / Structural View

Визуальный состав, по фактической разметке (слева → направо):

| # | Элемент | Уровень | Обязателен | Можно отключить | Описание |
|---|---|---|---|---|---|
| 1 | Icon | Item | Нет | Да | Ведущая иконка перед текстом. Недоступна в size Tiny — там только текст + trailing chevron. Цвет наследуется от текста контейнера (`currentColor`), собственного цветового токена нет. |
| 2 | Text | Item | Да | Нет | Единственный обязательный контент. 1 строка, `overflow: hidden` + `text-overflow: ellipsis` при переполнении. |
| 3 | Chevron | Item | Да (только в size Tiny) | Нет (в Tiny — безусловен) | Trailing chevron-иконка. Существует только в размере Tiny, добавляется без условия — не опция для этого размера. Фиксированный SVG 8×12, не масштabируется с размером кнопки (единственный размер во всей матрице размеров). |
| 4 | Counter | ❖ Surface View (nested, не подключён) | Нет | Да | Числовой индикатор рядом с кнопкой — отдельный DS-компонент **CounterValue** со своим spec. В текущей эталонной реализации **не рендерится как часть разметки ButtonText** (нет prop, нет DOM-узла) — это архитектурно внешний, самостоятельно компонуемый компонент, а не скрытый/условный слот этого компонента. |
| — | Loading dots | Item (замещающий) | — | — | При `loading` полностью замещает Icon+Text+Chevron: 3 точки 6×6px, `border-radius: 50%`, `background: currentColor`, `gap 4px`, blink-анимация 1s infinite с задержками 0/0.15s/0.3s на точках 2 и 3. Цвет — тот же `currentColor`, что у текста текущего варианта/состояния — собственного токена нет и не требуется. |

## Токены

Компонент — legacy-продуктовый (см. `⚠️` ниже): цвета берутся не из общей Core/Semantic шкалы, а из отдельного legacy-набора продукта (JSON с "сырыми" ARGB-значениями), а отступы/радиусы/типографика — как raw px без токенов вовсе. Это явно задокументировано в самой реализации (комментарии в коде помечают это как временное состояние до появления токенов). Ниже — полный аудит: что уже совпадает с существующими Semantic-токенами (можно использовать как есть) и что требует добавления нового токена.

### Размеры и форма

| Размер | Свойство | Raw-значение (код) | Semantic-токен | Core | Совпадение |
|---|---|---|---|---|---|
| Large | horizontal inset | 24px | ⚠️ нужно добавить: `inset-control-h-xl` | `spacing-24` | Новый шаг шкалы (текущий максимум `inset-control-h-l`=20 не покрывает) |
| Large | vertical inset | 16px | ⚠️ нужно добавить: `inset-control-v-xl` | `spacing-16` | Новый шаг шкалы (текущий максимум `inset-control-v-l`=12) |
| Large | radius | 16px | `radius-xl` (существует) | `shape-corner-16` | ✅ точное совпадение |
| Large | gap (icon↔text) | 8px | `gap-s` (существует) | `spacing-8` | ✅ точное совпадение |
| Large | icon size | 20×20px | ⚠️ нужно добавить: `size-icon-m` | — (нет core-шкалы размеров иконок в репозитории) | Новый токен |
| Large | min-height | 52px | ⚠️ нужно добавить: `size-control-l` | — (нет core-шкалы размеров контрола) | Новый токен |
| Medium | horizontal inset | 16px | `inset-control-h-m` (существует) | `spacing-16` | ✅ точное совпадение |
| Medium | vertical inset | 12px | `inset-control-v-l` (существует — но под чужой буквой размера, см. ⚠️ ниже) | `spacing-12` | ✅ числовое совпадение, ⚠️ буква размера не соответствует (см. «Открытые вопросы») |
| Medium | radius | 12px | `radius-l` (существует) | `shape-corner-12` | ✅ точное совпадение |
| Medium | gap | 8px | `gap-s` (существует) | `spacing-8` | ✅ точное совпадение |
| Medium | icon size | 16×16px | ⚠️ нужно добавить: `size-icon-s` | — | Новый токен |
| Medium | min-height | 44px | ⚠️ нужно добавить: `size-control-m` | — | Новый токен |
| Small | horizontal inset | 12px | `inset-control-h-s` (существует) | `spacing-12` | ✅ точное совпадение |
| Small | vertical inset | 8px | ⚠️ нужно добавить: `inset-control-v-s2` (рабочее имя) | `spacing-8` | Не совпадает ни с одним существующим шагом (`v-s`=6, `v-m`=10) |
| Small | radius | 12px | `radius-l` (существует) | `shape-corner-12` | ✅ точное совпадение |
| Small | gap | 4px | `gap-xs` (существует) | `spacing-4` | ✅ точное совпадение |
| Small | icon size | 16×16px | ⚠️ `size-icon-s` (см. Medium — переиспользуется) | — | Новый токен |
| Small | min-height | 36px | ⚠️ нужно добавить: `size-control-s` | — | Новый токен |
| Tiny | horizontal inset | 12px | `inset-control-h-s` (существует — переиспользуется с Small) | `spacing-12` | ✅ точное совпадение |
| Tiny | vertical inset | 4px | ⚠️ нужно добавить: `inset-control-v-xs2` (рабочее имя) | `spacing-4` | Не совпадает ни с одним существующим шагом (текущий минимум `v-xs`=2) |
| Tiny | radius | pill (9999px) | `radius-full` (существует) | `shape-corner-full` | ✅ точное совпадение |
| Tiny | gap | 4px | `gap-xs` (существует) | `spacing-4` | ✅ точное совпадение |
| Tiny | min-height | 24px | ⚠️ нужно добавить: `size-control-xs` | — | Новый токен; **см. блокер доступности ниже (touch target)** |
| Tiny | min-width | 44px | ⚠️ нужно добавить: `size-control-xs-min-width` (или как отдельное ограничение, не токен размера) | — | Совпадает с минимальным touch target по ширине, но не по высоте |
| Все | chevron size | 8×12px (фиксирован, не масштабируется) | ⚠️ нужно добавить: `size-icon-chevron` | — | Новый токен; единственный размер во всей матрице |
| Secondary (border) | border-width | 2px (default), 1.4px (только Tiny) | ⚠️ нужно добавить: `border-width-m` (2px) | — | 1.4px — нестандартное дробное значение, отдельного токена не предлагается, см. «Открытые вопросы» |
| Outline (border) | border-width | 1px | ⚠️ нужно добавить: `border-width-s` | — | Новый токен |

**Итог по пространству:** `radius-*` и `gap-*` полностью покрываются существующей Semantic-шкалой без единого пробела — только `inset-control-h/v-*` и размеры иконки/контрола требуют новых шагов/токенов.

### Типографика

| Размер | font-size / line-height / weight / tracking (код) | Совпадение с существующей ролью | Semantic-токен |
|---|---|---|---|
| Large | 16 / 20 / 500 / 0 | Близко к `label-m` продуктовой шкалы (16/20/**600**/0) — расходится только по weight | ⚠️ нужно добавить/уточнить: `label-m` для этого продукта не подходит (weight не совпадает) — либо новая роль, либо приведение компонента к weight 600 (визуальное изменение) |
| Medium | 14 / 16 / 500 / 0 | Не совпадает ни с одной существующей ролью продукта (`label-s`=14/**20**/**600**/0, `body-s-medium`=14/**20**/500/0) | ⚠️ нужно добавить: новая роль/токен — уникальная комбинация 14px/16px-LH/500 отсутствует в шкале |
| Small | 14 / 16 / 500 / 0 | Идентично Medium — то же расхождение | ⚠️ та же новая роль/токен, что для Medium |
| Tiny | 12 / 16 / 600 / 0.2 | ✅ **точное совпадение** с существующей продуктовой ролью `caption-semi-bold` (12/16/600/0.2) | `caption-semi-bold` (уже существует) — см. «Открытые вопросы»: `caption-*` — не `label-*`, роль применена к контролу вопреки правилу «Label → кнопки» из `semantic-typography-tokens-guide.md` §15 |

### Цвет — по вариантам и состояниям

Ни один из следующих 16 цветов не совпадает численно ни с одним существующим Semantic-цветовым токеном (проверено по HEX против `docs/storybook/storybook-color-tokens.css` — ближайшие есть, но не идентичны, см. «Открытые вопросы»). Все — новые предложенные токены, названы по правилу `<тип>-<роль>-<вариант>` из `token-rules.md`.

| Raw-токен (legacy) | HEX | Роль в компоненте | ⚠️ Предлагаемый Semantic-токен |
|---|---|---|---|
| `main/primary` | `#1C1C1C` | Primary: фон default/pressed-исходный слот; Secondary/Outline/Tertiary/PrimaryInverse/Transparent: цвет текста default; Secondary: цвет рамки default | `bg-surface-strong` (роль bg) / `text-surface-strong` (роль text) / `line-surface-strong` (роль border) — один core-подобный оттенок, три роли |
| `main/basic` | `#FFFFFF` | Primary: цвет текста default/pressed; PrimaryInverse: фон default/pressed | `text-on-surface-strong` (роль text) / `bg-surface-inverse-strong` (роль bg) |
| `gray/02` | `#F1F3FB` | Tertiary: фон default/pressed | `bg-surface-subtle` |
| `gray/03` | `#E7E9F3` | Outline: рамка default; Primary/Tertiary/PrimaryInverse/PrimaryInverseStatic: фон disabled; Secondary/Outline: рамка disabled | `line-surface-default` (роль border) / `bg-surface-disabled` (роль bg) |
| `gray/04` | `#C0C3D3` | Secondary/Outline/Transparent: цвет текста disabled | `text-surface-strong-disabled` |
| `gray/05` | `#979EAA` | Primary/PrimaryInverse/PrimaryInverseStatic: цвет текста disabled | `text-on-surface-strong-disabled` |
| `gray/06` | `#6C7077` | Secondary/Outline: рамка pressed | `line-surface-strong-pressed` |
| `gray/07` | `#43464B` | Primary: фон pressed; Secondary/Outline/Tertiary/PrimaryInverse: цвет текста pressed | `bg-surface-strong-pressed` (роль bg) / `text-surface-strong-pressed` (роль text) |
| `fixed/main/-basic` | `#FFFFFF` (`-static`) | PrimaryInverseStatic: фон default/pressed | `bg-surface-inverse-strong-static` |
| `fixed/main/-primary` | `#1C1C1C` (`-static`) | PrimaryInverseStatic: цвет текста default | `text-inverse-strong-static` |
| `fixed/gray/07` | `#43464B` (`-static`) | PrimaryInverseStatic: цвет текста pressed | `text-inverse-strong-pressed-static` |

Полная таблица «вариант × состояние → предложенный токен»:

| Variant | default: bg / text / border | pressed: bg / text / border | disabled: bg / text / border |
|---|---|---|---|
| Primary | `bg-surface-strong` / `text-on-surface-strong` / — | `bg-surface-strong-pressed` / `text-on-surface-strong` / — | `bg-surface-disabled` / `text-on-surface-strong-disabled` / — |
| Secondary | — / `text-surface-strong` / `line-surface-strong` (2px, Tiny 1.4px) | — / `text-surface-strong-pressed` / `line-surface-strong-pressed` | — / `text-surface-strong-disabled` / `line-surface-default` |
| Outline | — / `text-surface-strong` / `line-surface-default` (1px) | — / `text-surface-strong-pressed` / `line-surface-strong-pressed` | — / `text-surface-strong-disabled` / `line-surface-default` |
| Tertiary | `bg-surface-subtle` / `text-surface-strong` / — | `bg-surface-subtle` / `text-surface-strong-pressed` / — | `bg-surface-disabled` / `text-surface-strong-disabled` (⚠️ TBD, см. ниже) / — |
| Primary Inverse | `bg-surface-inverse-strong` / `text-surface-strong` / — | `bg-surface-inverse-strong` / `text-surface-strong-pressed` / — | `bg-surface-disabled` / `text-on-surface-strong-disabled` / — |
| Primary Inverse Static | `bg-surface-inverse-strong-static` / `text-inverse-strong-static` / — | `bg-surface-inverse-strong-static` / `text-inverse-strong-pressed-static` / — | `bg-surface-disabled` / `text-on-surface-strong-disabled` / — |
| Transparent | — / `text-surface-strong` / — | — / `text-surface-strong-pressed` / — | — / `text-surface-strong-disabled` / — |

⚠️ **Tertiary disabled text** — в коде используется `gray/04` (`#C0C3D3`, та же роль что Secondary/Outline/Transparent), но это явно помечено в самой реализации как «по аналогии с Transparent, не отдельный Figma-стейт» — не подтверждённое значение, а экстраполяция. Аналогичная пометка «по аналогии, не отдельный Figma-стейт» стоит в коде для **всех** pressed/disabled-ячеек Outline и Tertiary — при появлении реального Figma-фрейма это первое, что нужно перепроверить (см. «Открытые вопросы»).

⚠️ **Hover** (Web-only) реализован не через токен, а через CSS `filter: brightness(0.97)` поверх текущего фона/рамки — нет отдельного `bg-*-hover` токена ни для одного варианта. Формально нарушает `token-rules.md` («Захардкоженное значение вместо токена — блокер»), т.к. `brightness()` — недетерминированный по отношению к конкретному HEX приём, а не токен.

## Варианты

| Variant | Описание |
|---|---|
| Primary | Основной CTA — сплошная тёмная заливка (`bg-surface-strong`) |
| Secondary | Контурная кнопка, рамка 2px (1.4px в Tiny) в цвет текста |
| Outline | Контурная кнопка, тонкая рамка 1px в нейтральном цвете |
| Tertiary | Светло-серая заливка, без рамки |
| Primary Inverse | Светлая заливка — для использования на тёмном фоне |
| Primary Inverse Static | Как Primary Inverse, но фиксированные (не реагирующие на смену темы) цвета |
| Transparent | Только текст, без фона и рамки |

## Состояния

Имена — из `component-states-guide.md` (столбец Figma).

| Состояние | Визуальное изменение | Semantic-токен | Реализовано |
|---|---|---|---|
| default | — | — | ✅ |
| hovered | `filter: brightness(0.97)` поверх текущей заливки (только Web) | ⚠️ нет — не токенизировано, см. блокер выше | ✅ (не токен) |
| pressed | Меняется bg/text/border по таблице выше | см. таблицу «Цвет» | ✅ |
| focused | Рамка фокуса при Tab/скринридере | ⚠️ TBD — **в коде нет `:focus-visible` правила вовсе, состояние отсутствует физически** | ❌ **отсутствует — блокер доступности** |
| selected | — | — | Не применимо: кнопка с действием, не переключатель/таб — своего selected-состояния нет по природе компонента |
| disabled | Меняется bg/text/border по таблице выше, `cursor: not-allowed`, неинтерактивен | см. таблицу «Цвет» | ✅ |
| loading | Text/Icon/Chevron скрыты, вместо них — 3 блинкающие точки `currentColor`; `aria-busy="true"`; неинтерактивен (форсирует `disabled`) | — (цвет через `currentColor`, токен не требуется) | ✅ |
| skeleton | — | — | Не реализовано на уровне компонента — по правилу `component-states-guide.md` («кто управляет skeleton» — экран/CollectionView передаёт проп) это ожидаемо, не пробел |
| error | — | — | Не применимо — `error` только для контролов форм (`component-states-guide.md` §5), Button не форм-контрол |

Приоритет поглощения (по `component-states-guide.md`): `disabled` и `loading` перекрывают всё интерактивное; в коде `loading` дополнительно форсирует нативный `disabled` атрибут (`disabled={disabled || loading}`) — соответствует правилу.

## Lifecycle (только Structural View)

нет — компонент не Structural View

## Реализация — Web (React)

Уже существует как эталонная реализация (эта спека построена по её факту, не наоборот).

Props (фактические, из `ButtonTextProps`):
- `children?: ReactNode` — текстовый слот (default: `'Button'`)
- `variant?: 'primary' | 'secondary' | 'outline' | 'tertiary' | 'primaryInverse' | 'primaryInverseStatic' | 'transparent'` (default: `'primary'`)
- `size?: 'large' | 'medium' | 'small' | 'tiny'` (default: `'large'`)
- `icon?: ReactNode` — ведущая иконка; игнорируется при `size="tiny"` и при `loading`
- `disabled?: boolean`
- `loading?: boolean` — форсирует disabled, заменяет контент на dots
- `forceState?: 'pressed'` — демо-only оверрайд для документации/скриншотов, не для продуктового использования
- остальные нативные `<button>`-атрибуты через `...rest` (кроме `children`/`disabled`, переопределённых явно)

Токены: CSS custom properties, выставляемые инлайново на корневой узел (`--sbt-bg`, `--sbt-bg-pressed`, `--sbt-bg-disabled`, `--sbt-text`, `--sbt-text-pressed`, `--sbt-text-disabled`, `--sbt-border`, `--sbt-border-pressed`, `--sbt-border-disabled`, `--sbt-border-width`) — сейчас заполняются raw HEX из legacy-JSON, при миграции на Semantic-токены из таблицы выше меняется только источник значений этих переменных, не разметка.

Пример:
```tsx
<ButtonText variant="primary" size="large" icon={<PlusIcon />} onClick={handleSubmit}>
  Сохранить
</ButtonText>
```

## Реализация — iOS (SwiftUI)

⚠️ TBD — платформа помечена в презентбуке как `planned` (не реализована). Ниже — конвенция по `platforms.md`, спроецированная на состав компонента; сигнатура не подтверждена реальным кодом.

```swift
enum ButtonTextVariant {
    case primary, secondary, outline, tertiary, primaryInverse, primaryInverseStatic, transparent
}

enum ButtonTextSize { case large, medium, small, tiny }

struct ButtonTextView: View {
    let title: String
    var variant: ButtonTextVariant = .primary
    var size: ButtonTextSize = .large
    var icon: Image? = nil          // игнорируется при size == .tiny
    var isDisabled: Bool = false
    var isLoading: Bool = false
    var action: (() -> Void)? = nil

    var body: some View { /* ⚠️ TBD — не реализовано */ }
}
```

Токены (⚠️ имена по конвенции `DSTokens`, значения — из предложенных Semantic-токенов выше, требуют регистрации в Asset Catalog под теми же именами с точечной нотацией пути, см. правило-исключение для iOS в `ds-principal.mdc`):

```swift
extension DSTokens {
    struct ButtonText {
        static let backgroundPrimaryDefault  = Color("bg.surface.strong")
        static let backgroundPrimaryPressed  = Color("bg.surface.strong.pressed")
        static let backgroundDisabled        = Color("bg.surface.disabled")
        static let textOnStrong              = Color("text.on-surface.strong")
        static let textOnStrongDisabled      = Color("text.on-surface.strong.disabled")
        // ... остальные роли — см. полную таблицу «Цвет» выше
        static let cornerLarge  = CGFloat(16)   // radius-xl
        static let cornerMedium = CGFloat(12)   // radius-l
        static let cornerSmall  = CGFloat(12)   // radius-l
        static let cornerTiny   = CGFloat(9999) // radius-full → используется как .clipShape(Capsule())
    }
}
```

Доступность: `accessibilityLabel` = видимый текст (уже доступен нативно из `Text`); при `isLoading` — `accessibilityLabel` дополняется индикатором прогресса (`accessibilityValue` или отдельный `ProgressView` с `accessibilityHidden(false)`), т.к. blink-точки не озвучиваются VoiceOver сами по себе.

## Реализация — Android (Compose)

⚠️ TBD — платформа помечена в презентбуке как `planned` (не реализована). Сигнатура ниже — полная, детерминированная проекция Web-реализации на конвенции `platforms.md`, готовая к разработке без дополнительных уточнений по составу API (токены цвета — см. пометки ⚠️ выше, они не готовы независимо от платформы).

```kotlin
enum class ButtonTextVariant {
    Primary, Secondary, Outline, Tertiary, PrimaryInverse, PrimaryInverseStatic, Transparent
}

enum class ButtonTextSize { Large, Medium, Small, Tiny }

@Composable
fun ButtonText(
    text: String,
    modifier: Modifier = Modifier,
    variant: ButtonTextVariant = ButtonTextVariant.Primary,
    size: ButtonTextSize = ButtonTextSize.Large,
    icon: (@Composable () -> Unit)? = null,   // игнорируется при size == Tiny и при isLoading
    enabled: Boolean = true,
    isLoading: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val tokens = DSTheme.tokens.buttonText
    val sizeTokens = when (size) {
        ButtonTextSize.Large  -> tokens.size.large
        ButtonTextSize.Medium -> tokens.size.medium
        ButtonTextSize.Small  -> tokens.size.small
        ButtonTextSize.Tiny   -> tokens.size.tiny
    }
    val colorTokens = when (variant) {
        ButtonTextVariant.Primary              -> tokens.color.primary
        ButtonTextVariant.Secondary            -> tokens.color.secondary
        ButtonTextVariant.Outline              -> tokens.color.outline
        ButtonTextVariant.Tertiary             -> tokens.color.tertiary
        ButtonTextVariant.PrimaryInverse       -> tokens.color.primaryInverse
        ButtonTextVariant.PrimaryInverseStatic -> tokens.color.primaryInverseStatic
        ButtonTextVariant.Transparent          -> tokens.color.transparent
    }
    val isEnabled = enabled && !isLoading
    val stateColors = when {
        !isEnabled                     -> colorTokens.disabled
        // pressed отслеживается через collectIsPressedAsState() на interactionSource
        else                            -> colorTokens.default
    }

    Box(
        modifier = modifier
            .defaultMinSize(minWidth = sizeTokens.minWidth, minHeight = sizeTokens.minHeight)
            .minimumInteractiveComponentSize()
            .clip(RoundedCornerShape(sizeTokens.corner))
            .background(stateColors.background ?: Color.Transparent)
            .then(
                if (stateColors.border != null)
                    Modifier.border(sizeTokens.borderWidth, stateColors.border, RoundedCornerShape(sizeTokens.corner))
                else Modifier
            )
            .clickable(
                enabled = isEnabled,
                role = Role.Button,
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(color = tokens.ripple.color), // ⚠️ TBD — bg-surface-strong-ripple-android не существует, см. «Открытые вопросы»
                onClick = { onClick?.invoke() },
            )
            .padding(horizontal = sizeTokens.insetH, vertical = sizeTokens.insetV)
            .semantics {
                contentDescription = text
                if (isLoading) stateDescription = "Loading"
                if (!isEnabled) disabled()
            },
        contentAlignment = Alignment.Center,
    ) {
        if (isLoading) {
            ButtonTextLoadingDots(color = stateColors.content)
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(sizeTokens.gap), verticalAlignment = Alignment.CenterVertically) {
                if (icon != null && size != ButtonTextSize.Tiny) {
                    Box(Modifier.size(sizeTokens.iconSize)) { icon() }
                }
                Text(text = text, style = sizeTokens.textStyle, color = stateColors.content, maxLines = 1, overflow = TextOverflow.Ellipsis)
                if (size == ButtonTextSize.Tiny) {
                    Icon(painter = painterResource(R.drawable.ic_button_text_chevron), contentDescription = null, tint = stateColors.content, modifier = Modifier.size(width = 8.dp, height = 12.dp))
                }
            }
        }
    }
}
```

**Правило `contentDescription`:** всегда равен видимому тексту кнопки (`text`) — компонент никогда не бывает icon-only, поэтому пропа `contentDescription` отдельно от `text` не требуется. Ведущая иконка и chevron — чисто декоративные (`contentDescription = null` на `Icon`), т.к. их смысл уже озвучен текстом.

**`minimumInteractiveComponentSize()`:** обязателен на корневом `Box` — Compose M3 утилита раздвигает зону тапа до 48×48dp независимо от визуального размера. Критично для **Tiny** (визуальный min-height 24dp < 48dp) — без этого модификатора Tiny физически не проходит touch target минимум ни на одной платформе (см. блокер ниже).

**Ripple-токен:** ⚠️ TBD — `tokens.ripple.color` не существует ни в одном списке выше. Рекомендация до появления реального токена: тонировать ripple цветом `stateColors.content` (текста/иконки текущего варианта) с alpha по умолчанию Material (не задавать отдельный alpha-токен без подтверждения дизайна).

## Доступность

| Платформа | Свойство | Значение |
|---|---|---|
| Web | `role` | нативный `<button>` — роль не переопределяется |
| Web | `aria-disabled` / встроенный `disabled` | нативный HTML `disabled` атрибут при `disabled \|\| loading` |
| Web | `aria-busy` | `true` при `loading` |
| Web | `:focus-visible` | ⚠️ **отсутствует в реализации — блокер доступности, требует добавления до релиза на новую платформу/пересмотра текущей** |
| iOS | `accessibilityLabel` | видимый текст кнопки |
| iOS | `accessibilityTraits` | `.button`; `.notEnabled` при disabled |
| Android | `contentDescription` | видимый текст кнопки (см. правило выше) |
| Android | `semantics { role = Role.Button }` | да |
| Android | `semantics { disabled() }` | при `enabled = false` |
| Все | touch target | Large/Medium/Small — соответствуют (min-height 52/44/36px... **Small 36px < 44px минимума — тоже не проходит без расширения зоны тапа**, см. ниже); **Tiny — 24px высота с 44px min-width — прямое нарушение минимума 44×44px/44×44pt/48×48dp по высоте**, компенсируется только на Android через `minimumInteractiveComponentSize()` (см. Android-секцию); Web/iOS-реализации такого автоматического расширения зоны тапа не имеют — **нужно решение Principal Designer** |
| Все | keyboard | Tab-фокус работает нативно (`<button>`), Enter/Space активируют нативно; визуальное кольцо фокуса — отсутствует (см. `:focus-visible` выше) |

## Открытые вопросы

1. **Источник — не Figma.** Спека построена по production-коду и презентбуку, не по Figma-фрейму (ссылка не была предоставлена). При появлении реальной Figma-ссылки — свериться отдельным проходом, особенно по ячейкам, помеченным в коде как «по аналогии, не отдельный Figma-стейт» (все pressed/disabled Outline и Tertiary, pressed PrimaryInverseStatic).
2. **Конфликт с существующим `bg-accent-main`.** В системе уже существует Semantic-токен `bg-accent-main` (→ `core-sapphire-55`, синий), но цвет этого компонента (`#1C1C1C`, почти чёрный) с ним не совпадает и не пересекается по смыслу («accent» в остальной системе = синий бренд-акцент). Все 16 цветовых токенов в этой спеке предложены в отдельном неймспейсе (`bg-surface-strong-*`, не `bg-accent-*`), чтобы не создавать одноимённый токен с другим значением. Нужно решение Principal Designer: (а) это осознанно отдельная, немигрированная цветовая идентичность легаси-продукта, которая должна остаться как отдельная группа токенов навсегда, или (б) компонент должен быть визуально приведён к `bg-accent-main` (синий) как часть будущей миграции — два разных пути с разным результатом.
3. **Отсутствие `:focus-visible`.** Кнопка не имеет визуального кольца фокуса вовсе — блокер по правилам `component-states-guide.md` («не отключай focused ради минимализма — это блокер доступности»). Нужен явный токен рамки фокуса и его добавление в реализацию.
4. **Touch target Tiny (24px) и Small (36px).** Оба меньше минимума 44×44px/pt (48dp на Android). Tiny частично компенсируется `min-width: 44px`, но не по высоте. Нужно решение: расширять зону тапа инвизбл-падингом (Web/iOS) по аналогии с `minimumInteractiveComponentSize()` на Android, либо явно задокументировать как принятое исключение для этих двух размеров.
5. **Типографика Tiny использует роль `caption-semi-bold`, не `label-*`.** По правилу `semantic-typography-tokens-guide.md` §15 («Label → Item компоненты (кнопки, поля, чипы)») контрол должен использовать `label-*`. Точное числовое совпадение (12/16/600/0.2) есть только с `caption-semi-bold` — нужно решение: завести новую `label-*`-роль с идентичными числами (более консистентно с правилом) или сделать документированное исключение для этого компонента.
6. **Typography Large/Medium/Small не совпадают ни с одной существующей ролью.** Large почти совпадает с `label-m` (расхождение только в font-weight: 500 вместо 600); Medium/Small (14px/16px-LH/500) не совпадают ни с чем в текущей продуктовой шкале. Нужно решение: завести новые роли под эти точные числа или скорректировать компонент под ближайшую существующую роль (изменит визуал).
7. **`inset-control-v-*` не покрывает 3 из 4 вертикальных отступов.** Только Medium (12px) совпадает с существующим шагом (`v-l`), причём под несовпадающей буквой размера (у кнопки это Medium, у шкалы — «l»). Large (16px), Small (8px), Tiny (4px) не совпадают ни с одним шагом. Нужно решение: расширить шкалу новыми шагами или привести компонент к существующим (визуальное изменение отступов).
8. **Hover не токенизирован.** `filter: brightness(0.97)` — не Semantic-токен, формальный блокер по `token-rules.md`. Нужно решение: ввести `bg-*-hover`/аналог для каждого варианта или явно принять `filter`-приём как задокументированное исключение для hover (в отличие от pressed/disabled, которые уже токенизированы).
9. **`border-width: 1.4px`** (Secondary + Tiny) — нестандартное дробное значение, не входит ни в один предложенный `border-width-*` токен. Нужно решение: округлить до 1px/2px (визуальное изменение) или завести отдельный `border-width-xs` под это единственное значение.
10. **Ripple-токен Android** не существует ни в каком виде — секция Android содержит временную рекомендацию (тонировать ripple цветом контента), не подтверждённое значение.
11. **iOS/Android — `planned`, не реализованы.** Сигнатуры в этой спеке — детерминированная проекция Web-реализации по `platforms.md`, а не перенос существующего кода. Готовы к разработке, но не верифицированы существующей платформенной реализацией (в отличие от Web-секции).

## Самопроверка

- Все секции шаблона присутствуй без исключений — да.
- Значения без привязки к конкретному semantic-токену — нет (каждое либо привязано к существующему, либо помечено ⚠️ с конкретным предложенным именем и raw-значением).
- Таблица состояний покрывает все применимые состояния Surface View, включая явно отсутствующее `focused` — да.
- Android-секция — полная сигнатура, enum'ы, размерные/цветовые токены по пути `DSTheme.tokens.buttonText.*`, `contentDescription`, `minimumInteractiveComponentSize()`, ripple-токен (с пометкой TBD) — да.
- Воспроизводимость другим агентом без доступа к Figma — да, весь материал взят из детерминированного production-кода, а не из визуальной интерпретации.
- Упоминания названия продукта/бренда — исключены по всему файлу (источники — «продукт», «легаси-продуктовый набор», без названия).

---

**Стадия:** draft (11 открытых вопросов, требуют решения Principal Designer)
