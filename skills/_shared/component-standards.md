---
description: >
  Стандарты UI-компонентов: props, variants, states, accessibility,
  coupling с токенами, тестирование.
destination: skills/_shared/
name: component-standards
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Component Standards

## Purpose

Этот гайд фиксирует обязательные стандарты реализации UI-компонентов дизайн-системы: структура файлов, props, variants, states, coupling с semantic-токенами, accessibility и документация. Стандарты применяются после Component Gate и Product Context Gate — до начала реализации компонента.

Компонент без соответствия этим стандартам не считается готовым к release, даже если визуально совпадает с Figma.

---

## Relationship to other guides

| Гайд | Связь |
|---|---|
| `ds-component-architecture-guide.md` | Уровень компонента (Item → Surface View → Structural View → Layout), слоты, нейминг Role + Entity |
| `skills/ds-component-spec/SKILL.md` | Генерация полной спеки компонента для Web / iOS / Android |
| `component-states-guide.md` | Нейминг и логика состояний (default, hovered, pressed, disabled и др.) |
| `token-rules.md` | Core → Semantic, запрет hardcode и прямых ссылок Component → Core |
| `platforms.md` | API props, touch targets, accessibility по платформам |
| `changelog-guide.md` | Как фиксировать изменения компонента в release workflow |
| `docs/semver-guide.md` | SemVer для компонентов (MAJOR / MINOR / PATCH) |

---

## Component anatomy

Каждый компонент уровня Surface View и выше включает:

1. **Implementation** — платформенная реализация (React / SwiftUI / Compose).
2. **Props interface** — типизированный контракт API.
3. **Variants** — визуальные или смысловые варианты (`primary`, `secondary`, `ghost`).
4. **States** — интерактивные состояния (`default`, `hovered`, `pressed`, `disabled`, `loading` и др.).
5. **Docs** — story / example, props table, variants × states matrix, usage guidelines.

### Пример структуры (Web)

```
components/
└── ButtonText/
    ├── ButtonText.tsx          # реализация
    ├── ButtonText.types.ts     # props interface (опционально отдельно)
    ├── ButtonText.stories.tsx  # Presentbook / Storybook
    ├── ButtonText.test.tsx     # unit + a11y tests
    └── index.ts                # public export
```

> Для Driver `componentsRoot` пока `null` — путь создаётся только после подтверждения в Component Gate.

---

## Props standards

### Naming conventions

- **Boolean:** `isDisabled`, `isLoading`, `isSelected` (префикс `is`) — см. `platforms.md`.
- **Callbacks:** `onClick`, `onChange`, `onBlur` (префикс `on`).
- **Variants / size:** `variant`, `size` — union types, не magic strings.
- **Slots:** `leading`, `trailing`, `children` — React.ReactNode или платформенный эквивалент.

### Required vs optional

- Обязательные props — только то, без чего компонент теряет смысл (`children` для ButtonText).
- Визуальные defaults — через optional props с дефолтным значением (`variant="primary"`).
- Не делать required props для того, что имеет разумный default.

### Typing (TypeScript)

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

- Union types вместо `enum` объектов.
- Не использовать `any` для slot props.
- Экспортировать props interface как public API.

### Controlled / uncontrolled

- **Controlled:** значение и `onChange` приходят снаружи (`value` + `onChange`).
- **Uncontrolled:** внутренний state + optional `defaultValue`.
- Не смешивать controlled и uncontrolled в одном компоненте без явной документации.

---

## Variants and states

### Variants

Variant описывает **appearance**, не интерактивность:

| Variant | Назначение |
|---|---|
| `primary` | Основное действие |
| `secondary` | Вторичное действие |
| `ghost` | Минимальный visual weight |
| `destructive` | Опасное действие (не путать с `error` state) |

Variants определяются в Figma как component properties и мапятся на props `variant`.

### States

States описывают **интерактивность и feedback** — см. `component-states-guide.md`:

| Figma | Web | Когда |
|---|---|---|
| default | default | Базовое состояние |
| hovered | hover | Только Web |
| pressed | active | Нажатие |
| focused | focused | Клавиатурный фокус |
| disabled | disabled | Недоступен (opacity 40% + неинтерактивен) |
| loading | loading | Спиннер внутри |

### Variants × states

- Каждая комбинация `variant × state` должна иметь token mapping.
- Недопустимые комбинации — см. `component-states-guide.md` (например `disabled + loading`).
- Матрица variants × states обязательна в документации компонента.

---

## Token coupling

### Как компоненты используют токены

| Категория | Примеры semantic-токенов | Driver source |
|---|---|---|
| Color | `bg-accent-main`, `text-primary` | `data.ts` |
| Typography | `label-m`, `body-s` | `typographyData.ts` |
| Spacing | `space-8`, `space-16` | `spacingData.ts` |
| Radius | `radius-m`, `radius-pill` | `radiusData.ts` |
| Shadows | `shadow-1` … `shadow-7` | `shadowsData.ts` |
| Icons | icon assets | `iconsData.ts` + `public/icons/` |

Компоненты ссылаются **только на semantic-токены**, никогда на Core напрямую — см. `token-rules.md`.

### Запрет хардкода

- ⚠️ HEX, rgb, hsl, px для цветов/spacing/radius в implementation — **блокер**.
- Перед использованием значения — token lookup по `.cursor/rules/token-integrity.mdc`.
- Token gap → единая анкета; реализация останавливается до ответа пользователя.

### Примеры (Web)

```tsx
// ✅ Правильно
backgroundColor: 'var(--bg-accent-main)';
padding: 'var(--inset-control-h-m)';

// ❌ Неправильно
backgroundColor: '#0057FF';
padding: '16px';
```

---

## Accessibility requirements

Минимальные требования до появления `accessibility.md` (Wave 2):

| Требование | Стандарт |
|---|---|
| Contrast | Минимум WCAG AA (4.5:1 для текста, 3:1 для крупного) |
| Focus indicator | Видимый focus ring через semantic token (`bg-accent-states-focused`) |
| Keyboard navigation | Tab order, Enter/Space для activation |
| Screen reader | `aria-label` для icon-only controls; `role` только когда нативный элемент не подходит |
| Disabled | `aria-disabled="true"` + opacity 40% + pointer-events: none |
| Touch target | Web: 44×44px min; iOS: 44×44pt; Android: 48×48dp — см. `platforms.md` |

Подробности и платформенные исключения — в будущем `accessibility.md`.

---

## Testing requirements

Минимальный набор до появления `testing-strategy.md` (Wave 3):

| Тип | Что тестировать |
|---|---|
| Unit | Props defaults, variant rendering, disabled/loading behavior, callback invocation |
| Visual regression | Snapshot / screenshot каждого variant × state |
| Accessibility | axe / jest-axe: contrast, aria attributes, keyboard focus |

Тесты не заменяют token lookup и Component Gate — они проверяют уже согласованную реализацию.

---

## Documentation requirements

Каждый компонент в Presentbook / Storybook включает:

1. **Story / example** — минимум один interactive example на variant.
2. **Props table** — name, type, default, description.
3. **Variants × states matrix** — таблица или grid preview.
4. **Usage guidelines** — do / don't (2–5 пунктов каждый).

Формат документации согласуется с `skills/ds-component-spec/SKILL.md`.

---

## Versioning and changelog

- Версия компонента — independent SemVer — см. `docs/semver-guide.md`.
- **MAJOR:** удалён/переименован prop, variant, slot; breaking API change.
- **MINOR:** новый variant, state, slot; backward-compatible feature.
- **PATCH:** visual fix, docs, a11y fix без изменения API.

Во время реализации изменения записываются в `changes/<id>/pending/` — не в changelog напрямую. Финальный changelog entry — на release boundary — см. `changelog-guide.md` и `.cursor/rules/release-gate.mdc`.
