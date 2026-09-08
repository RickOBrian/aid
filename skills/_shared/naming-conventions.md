---
description: >
  Руководство по неймингу токенов, компонентов и skills: коллекции,
  уровни (core/semantic), форматы имён, platform-specific префиксы.
destination: skills/_shared/
name: naming-conventions
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Naming Conventions

## Purpose

Этот гайд фиксирует единые правила именования токенов, компонентов и skills в дизайн-системе aid. Согласованный нейминг снижает token gaps при import, упрощает lookup в `*Data.ts` и делает changelog entries однозначными на release boundary.

Нейминг — часть контракта между дизайном, кодом и документацией. Новое имя без проверки по этому гайду и `token-rules.md` — повод остановиться на анкете, а не создавать артефакт молча.

---

## Relationship to other guides

| Гайд | Связь |
|---|---|
| `token-rules.md` | Иерархия Core → Semantic, категории (`bg`, `text`, `inset-*`), стоп-правила |
| `component-standards.md` | Props (`is*`, `on*`), variants, states, slots |
| `platforms.md` | Platform-specific API и префиксы (`isDisabled` vs `enabled`, Asset Catalog paths) |
| `changelog-guide.md` | Имена artifact/collection в changelog; rename → MAJOR |
| `docs/ds-component-architecture-guide.md` | Формула `[Role] + [Entity] + [Qualifier]` для компонентов |
| `.cursor/DS_PIPELINE_CONTEXT.md` | Фактические имена файлов (`data.ts`, `*-sem-changelog.json`) |

---

## Token naming

### Структура имени

Логическая модель (4 сегмента):

```
<collection>.<group>.<property>.<variant>
```

| Сегмент | Назначение | Примеры |
|---|---|---|
| **collection** | Категория токена | `color`, `type`, `space`, `radius`, `shadow`, `icon` |
| **group** | Подгруппа или роль | `neutral`, `accent`, `control`, `heading`, `inset` |
| **property** | Конкретное свойство | `500`, `main`, `primary`, `h-m`, `m` |
| **variant** | Уточнение (опционально) | `hover`, `secondary`, `static`, `ios` |

**Физическая нотация в документации и кросс-платформенном именовании — дефисная**, не точечная:

```
collection-group-property-variant  →  bg-accent-main, space-16, color-neutral-500
```

❌ `color.blue.500`, `bg.accent.main` — точечная нотация запрещена как имя токена.  
✅ Исключение: **iOS Asset Catalog** — точка как разделитель пути в `.xcassets` (`Color("bg.accent.main")`); имя токена остаётся дефисным.

### Collection naming (Driver)

Имена collection для changelog и data-файлов — **фактические имена репозитория**, не абстрактный план:

| Collection | Artifact (changelog) | Changelog file | Data file |
|---|---|---|---|
| Colors/Semantic | `Colors/Semantic` | `tokens/colors-semantic-changelog.json` | `data.ts` |
| Typography/Semantic | `Typography/Semantic` | `tokens/typography-sem-changelog.json` | `typographyData.ts` |
| Spacing/Semantic | `Spacing/Semantic` | `tokens/spacing-sem-changelog.json` | `spacingData.ts` |
| Radius/Semantic | `Radius/Semantic` | `tokens/radius-sem-changelog.json` | `radiusData.ts` |
| Effects/Shadows | `Effects/Shadows` | `tokens/effects-shadows-changelog.json` | `shadowsData.ts` |
| Icons | `Icons/Wilhelm` | `tokens/icons-changelog.json` | `iconsData.ts` |

Поле `collectionName` в data-файле = имя без `-changelog.json` (например `spacing-sem`).

### Core tokens naming

Core — сырые значения **без смысловой нагрузки**. Формула: `<type>-<group>-<step>`.

| Категория | Паттерн | Примеры |
|---|---|---|
| **Color** | `color-<palette>-<step>` | `color-neutral-0`, `color-blue-500`, `color-teal-50` |
| **Typography** | `type-<property>-<step>` | `type-size-16`, `type-weight-700`, `type-lh-24`, `type-tracking-0` |
| **Spacing** | `spacing-<step>` | `spacing-0`, `spacing-4`, `spacing-16`, `spacing-80` |
| **Radius (shape)** | `shape-corner-<step>` | `shape-corner-0`, `shape-corner-8`, `shape-corner-full` |
| **Shadows** | `shadow-<step>` | Core-значения в effects collection (см. `shadowsData.ts`) |
| **Icons** | asset id / filename | `icon-name` в `public/icons/`, id в `iconsData.ts` |

**Цветовые палитры Core:** `neutral`, `blue`, `teal`, `green`, `red`, `orange`, `yellow`, `purple`.  
**Шаги насыщенности:** `0` → `900` с шагом 100; дополнительные `50`, `150`, `650` — только при необходимости.

### Semantic tokens naming

Semantic — **назначение**, не значение. Формула: `<category>-<role>-<variant>` (без чисел в имени пространства).

| Категория | Паттерн | Примеры |
|---|---|---|
| **Color — bg** | `bg-<role>[-<variant>]` | `bg-base-main`, `bg-accent-main`, `bg-accent-states-hover` |
| **Color — text** | `text-<role>` | `text-primary`, `text-secondary`, `text-disabled` |
| **Color — icon** | `icon-<role>` | `icon-primary`, `icon-accent` |
| **Color — line** | `line-<role>` | `line-default`, `line-strong` |
| **Color — bg-accent** | `bg-accent-<role>` | `bg-accent-main`, `bg-accent-states-pressed` |
| **Color — bg-component** | `bg-component-<context>` | `bg-component-states-control-accent-active` |
| **Typography** | `<role>-<size>[-<qualifier>]` | `heading-m`, `body-s`, `label-m`, `label-xs-weight-strong` |
| **Spacing** | `space-<n>` или `inset-<cat>-<axis>-<size>` | `space-16`, `inset-control-h-m`, `gap-m` |
| **Radius** | `radius-<size>` | `radius-s`, `radius-m`, `radius-pill` |
| **Shadows** | `shadow-<n>` | `shadow-1` … `shadow-7` |

**Суффиксы semantic-токенов:**

| Суффикс | Назначение |
|---|---|
| `-static` | Одинаково в light и dark |
| `-static-lm` / `-static-dm` | Зафиксировано для light / dark mode |
| `-staticwm` | White Label / Wealth Management |
| `-ios` | Только iOS (`bg-accent-states-focused-ios`) |
| `-android` | Только Android (`bg-accent-states-ripple-android`) |

### Примеры: правильно и неправильно

| ✅ Правильно | ❌ Неправильно | Почему |
|---|---|---|
| `bg-accent-main` | `color-blue-500` в компоненте | Component → Core напрямую |
| `text-primary` | `color-white` как semantic | Semantic с именем цвета |
| `inset-control-h-m` | `inset-control-h-16` | Число в semantic space-имени |
| `space-16` | `spacing-16` в компоненте | Component → Core spacing |
| `heading-m` | `font-size-16` в UI | Typography role, не raw property |
| `colors-semantic-changelog.json` | `color-changelog.json` | Фактическое имя collection |
| `data.ts` | `colorData.ts` | Фактический path Driver |
| `ButtonText` | `PrimaryButton`, `ButtonPrimary` | Role + Entity, не variant в имени |
| `bg-accent-states-hover` | `button-bg-hover` | Нет component-level tokens |

---

## Component naming

### Формула имени

**[Role] + [Entity] + [Qualifier]** — Role **всегда первым**.

| Часть | Описание | Примеры |
|---|---|---|
| **Role** | Тип компонента | `Button`, `Badge`, `Island`, `Widget`, `Row` |
| **Entity** | Содержимое или сущность | `Text`, `Icon`, `Product`, `Balance` |
| **Qualifier** | Опциональное уточнение | `Floating`, `Compact`, `Inline`, `Grouped` |

**Примеры:**

- `ButtonText` → Role=Button, Entity=Text
- `ButtonIcon` → Role=Button, Entity=Icon
- `IslandProduct` → Role=Island, Entity=Product
- `WidgetBalance` → Role=Widget, Entity=Balance
- `BadgeStatus`, `BadgeCount` → Role=Badge, Entity=Status/Count

❌ `PrimaryButton`, `ButtonPrimary` — variant не входит в имя компонента.  
❌ `TextButton` — Entity не должна стоять первой.

**Исключения (устоявшиеся имена):** `Avatar`, `Badge`, `Dialog`, `Toast`, `Tooltip`, `Switch` — не следуют формуле, когда роль очевидна из одного слова. См. `docs/ds-component-architecture-guide.md`, раздел 9.

**Item-level:** `Icon`, `Text`, `Image` — **без суффикса `Item`**.  
Суффикс `Item` — только внутри коллекций: `List.Item`, `Menu.Item`, `Accordion.Item`.

### Variants, states, slots

| Концепт | Где живёт | Naming |
|---|---|---|
| **Variant** | Prop `variant` | `primary`, `secondary`, `ghost`, `destructive` — lowercase, union type |
| **State** | CSS / platform state | `default`, `hover`, `pressed`, `focused`, `disabled`, `loading` |
| **Size** | Prop `size` | `sm`, `md`, `lg` |
| **Slots** | Props / ViewBuilder | `leading`, `trailing`, `content`, `header`, `footer`, `title`, `subtitle`, `action` |

Figma component property `Variant=Primary` → prop `variant="primary"`, **не** новый компонент `ButtonPrimary`.

States map на semantic tokens (`bg-accent-states-hover`), не на отдельные component tokens — component-level token layer не используется.

### Связь с ds-component-architecture-guide.md

| Уровень | Naming hint |
|---|---|
| **Item** | По типу контента: `Icon`, `Text`, `Image` |
| **Surface View** | Role + Entity: `ButtonText`, `BadgeStatus` |
| **Structural View** | Role + Entity + слоты: `IslandProduct`, `RowList` |
| **Layout** | Направление / контейнер: `VStack`, `HStack`, `ScrollView` |

---

## Skills naming

### Файлы в `skills/_shared/`

| Паттерн | Назначение | Примеры |
|---|---|---|
| `<topic>.md` | Общий shared-гайд | `token-rules.md`, `platforms.md`, `git-workflow.md` |
| `<topic>-guide.md` | Thematic guide | `changelog-guide.md`, `figma-import-guide.md`, `naming-conventions.md` |
| `core-<domain>-tokens-guide.md` | Core token collection | `core-color-tokens-guide.md`, `core-space-tokens-guide.md` |
| `semantic-<domain>-tokens-guide.md` | Semantic token collection | `semantic-color-tokens-guide.md`, `semantic-space-tokens-guide.md` |
| `ds-<topic>-guide.md` | DS process / audit | `ds-component-audit-guide.md`, `ds-component-migration-guide.md` |
| `<component-topic>-standard.md` | Стандарт / protocol | `anatomy-annotation-standard.md`, `radius-preview-standard.md` |
| `component-<aspect>-guide.md` | Component-related | `component-states-guide.md`, `component-categories-guide.md` |

**Правила:**

- kebab-case, lowercase, расширение `.md`
- Frontmatter обязателен: `destination`, `name`, `metadata.version`
- Поле `name` = имя файла без `.md` (`naming-conventions`)
- Не дублировать topic в разных naming patterns без причины

### Product-scoped skills

По умолчанию skills импортируются в `skills/_shared/`. Product-scoped path (например `skills/driver/`) — **только с явным подтверждением** пользователя. Не создавать product-scoped директории молча — см. `skills-import-gate.mdc`.

### Platform-specific skills

Platform-specific детали — **внутри shared-гайда** (секция по платформе) или через суффиксы в **token names** (`-ios`, `-android`), а не отдельные файлы `*-ios-guide.md`, если нет явной необходимости.

---

## Platform-specific naming

### Web (React + TypeScript)

| Область | Convention |
|---|---|
| **Token CSS var** | `--<token-name>` kebab-case: `var(--bg-accent-main)` |
| **Component file** | PascalCase: `ButtonText.tsx` |
| **Props — boolean** | `isDisabled`, `isLoading`, `isSelected` |
| **Props — callbacks** | `onClick`, `onChange`, `onBlur` |
| **Props — variants** | `variant?: 'primary' \| 'secondary'` |
| **Enum props** | Union types, не TypeScript `enum` |

### iOS (SwiftUI / UIKit)

| Область | Convention |
|---|---|
| **Component struct** | `[Name]View`: `ButtonTextView` |
| **Variant enum** | `[Component]Variant`: `ButtonTextVariant.primary` |
| **Size enum** | `[Component]Size`: `ButtonTextSize.md` |
| **Token in code** | `Color("bg.accent.main")` — точка = путь Asset Catalog, не token notation |
| **DSTokens extension** | Группировка по компоненту: `DSTokens.Button.backgroundDefault` |
| **Boolean props** | `isDisabled`, `isLoading` (как Web) |
| **Platform tokens** | Суффикс `-ios` в semantic token name |

### Android (Jetpack Compose)

| Область | Convention |
|---|---|
| **Composable** | PascalCase function: `ButtonText` |
| **Variant enum** | `ButtonTextVariant.Primary` (PascalCase members) |
| **Enabled state** | `enabled: Boolean` — **не** `isEnabled` (Compose convention) |
| **Modifier** | `modifier: Modifier = Modifier` — последний параметр перед lambdas |
| **Tokens** | `DSTheme.tokens.button.backgroundDefault` |
| **Platform tokens** | Суффикс `-android` в semantic token name |

### Cross-platform invariants

Одинаковые на всех платформах:

- Имена **semantic tokens** (дефисная нотация)
- Имена **слотов**: `leading`, `trailing`, `content`, `header`, `footer`
- Имена **variants**: `primary`, `secondary`, `ghost`
- Имена **states** в документации: `default`, `hover`, `pressed`, `disabled`, `loading`

---

## Anti-patterns

| Anti-pattern | Почему плохо | Как исправить |
|---|---|---|
| Точечная нотация токенов (`color.blue.500`) | Нарушает стандарт DS | Дефис: `color-blue-500` |
| Component-level token (`button-bg-primary`) | Component token layer не используется | Semantic: `bg-accent-main` |
| Variant в имени компонента (`ButtonPrimary`) | Variant = prop, не имя | `ButtonText` + `variant="primary"` |
| Entity перед Role (`TextButton`) | Ломает IDE-группировку | `ButtonText` |
| `IconItem`, `TextItem` на Item-level | Item ≠ collection item | `Icon`, `Text` |
| Числа в semantic space names | Блокер по `token-rules.md` | `inset-control-h-m`, не `-16` |
| Semantic с именем цвета (`color-white`) | Смысл привязан к значению | `text-primary`, `bg-base-main` |
| Абстрактные changelog names | Не совпадает с репо | `colors-semantic-changelog.json` |
| `colorData.ts` для Driver color | Фактический файл — `data.ts` | Смотреть `DS_PIPELINE_CONTEXT.md` |
| Дубли одного смысла | Audit noise, token drift | `button-bg-default` + `button-background-default` → одно имя |
| Figma variant → token name 1:1 | Variants ≠ tokens | Prop + semantic category |
| Product-scoped skill path без OK | Нарушает Skills Import Gate | Default: `skills/_shared/` |
| Rename без MAJOR changelog | Breaking change скрыт | `removed` + `added` или MAJOR bump — см. `changelog-guide.md` |
| `FigmaStyles` как naming source | Reference-only | Canonical: `*Data.ts` / `data.ts` |

---

## Changelog

- **1.0.0** — 2026-08-15. Первая версия: token/component/skills naming, collection names Driver, platform conventions, anti-patterns.
