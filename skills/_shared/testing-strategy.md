---
description: >
  Стратегия тестирования компонентов и токенов: unit, visual regression,
  accessibility, cross-platform testing, CI gate.
destination: skills/_shared/
name: testing-strategy
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Testing Strategy

## Purpose

Этот гайд описывает стратегию тестирования артефактов дизайн-системы aid: токены, компоненты и product portals. Тесты проверяют **уже согласованную** реализацию — после Product Gate, Token Integrity и Component Gate — и не заменяют token lookup, audit или release workflow.

Цель — предсказуемое качество на Web, iOS и Android: корректный API компонента, стабильный visual output, accessibility baseline и отсутствие регрессий при изменении semantic tokens.

---

## Relationship to other guides

| Гайд | Связь |
|---|---|
| `component-standards.md` | Минимальный набор тестов для компонентов (unit, visual, a11y) |
| `accessibility.md` | A11y checklist, axe gate, VoiceOver/TalkBack manual pass |
| `platforms.md` | Platform-specific API и touch targets для test assertions |
| `.cursor/rules/audit-gate.mdc` | Audit — read-only анализ; fixes → pending items, не прямой substitute тестов |
| `component-states-guide.md` | Matrix variants × states для visual и interaction tests |
| `versioning-strategy.md` | QA фиксирует конкретную версию артефакта под тест |
| `changelog-guide.md` | Test scope привязан к release boundary, не к draft pending |

**Audit vs tests:** Audit Gate находит gaps и drift; automated tests **регрессионно защищают** уже принятую реализацию. Audit не блокирует merge сам по себе — CI tests блокируют.

---

## Testing levels

| Level | Scope | Когда применять |
|---|---|---|
| **Unit** | Isolated function/component logic | Props defaults, state transitions, callbacks |
| **Integration** | Component + tokens + child components | Form field + label + error message |
| **Visual regression** | Pixel/layout snapshot | variants × states × modes |
| **Accessibility** | axe + keyboard + SR | Every interactive component |
| **E2E** | Critical user flows | Login, checkout-like flows using DS components |

### Unit tests

**Tokens (Driver):**

- Export presence: token id exists in `*Data.ts` / `data.ts`
- Schema shape: required fields (`collectionName`, `day`/`night` for colors)
- Value type: numbers for spacing/radius, valid hex for colors
- No duplicate ids within collection

**Components:**

- Default props render without throw
- Each `variant` renders distinct output (smoke)
- `isDisabled` / `enabled = false` blocks interaction
- `isLoading` shows spinner, blocks activation
- Callbacks fire on user action (Web: click/keyboard)

### Integration tests

- Component consumes semantic CSS vars / theme tokens — not hardcoded values
- Slot composition: `leading` + `children` + `trailing` render together
- Form controls: label → input → error message association
- Parent passes `isSkeleton` / `isLoading` — child renders correct state

### Visual regression tests

- Snapshot or screenshot per **variant × state × mode** (light/dark)
- Baseline approved in PR review
- Driver portal pages: token table layout smoke (optional, portal-only)

### Accessibility tests

- Automated: axe on component stories and E2E flows
- Manual: keyboard-only, VoiceOver, TalkBack — см. `accessibility.md`

### E2E tests

- Critical paths using DS components end-to-end
- Focus trap in modal flows
- Form validation + error announcement
- Not required for every component — only product-critical flows

---

## Token testing

### What to test

| Check | Method | Blocker |
|---|---|---|
| **Presence** | Token id in canonical `*Data.ts` | Missing token in source |
| **Registry sync** | `collectionName` matches `token-changelog-registry.json` | Registry drift |
| **Value consistency** | Same semantic name → same role across modes | Naming/meaning drift |
| **Mode pairs** | `day` + `night` for color rows where applicable | Incomplete mode support |
| **Contrast** | WCAG AA pairs — см. `accessibility.md` | Contrast failure on primary pairs |
| **No hardcode in consumers** | Grep components for hex outside token loader | Hardcode violation |

### Snapshot tests for token files

```ts
// Example pattern — Driver spacing
import { spacingTokens } from '../pages/driver-color-tokens/spacingData';

test('spacing-sem exports stable token ids', () => {
  expect(spacingTokens.map(t => t.id)).toMatchSnapshot();
});
```

Snapshot changes → review as **token value or structure change** → pending item + release SemVer, не silent approve.

### Cross-platform token verification

- **Single semantic name** across Web, iOS, Android — values may differ by platform suffix (`-ios`, `-android`), names must match spec.
- Web: CSS var resolves to expected computed value in test DOM.
- iOS: Asset Catalog key maps to documented token name.
- Android: `DSTheme.tokens` path matches spec table.
- Cross-platform audit optional via Audit Gate — automated tests per platform codebase.

**Driver canonical sources:** `pages/driver-color-tokens/data.ts`, `typographyData.ts`, `spacingData.ts`, `radiusData.ts`, `shadowsData.ts`, `iconsData.ts`.

---

## Component testing

### Unit tests (props, variants, states, events)

| Area | Assertions |
|---|---|
| **Props** | Defaults, required props, union types rejected at compile time |
| **Variants** | `primary`, `secondary`, `ghost`, `destructive` render without error |
| **States** | `disabled`, `loading`, `error` (form controls only) — см. `component-states-guide.md` |
| **Events** | `onClick`, `onChange` fire once; disabled blocks events |
| **Slots** | `leading`, `trailing`, `children` visible in output |

Invalid combinations (`disabled + loading`) — must not render or must follow priority rules from `component-states-guide.md`.

### Story-based testing

- **Storybook / Presentbook** — primary visual and interaction sandbox.
- Driver portal: `pages/driver-color-tokens/` — token section pages (reference, not component library yet).
- Storybook root: `stories/`, `.storybook/` — component stories when `componentsRoot` exists.
- Each component story covers: default + each variant + key states.
- Interaction tests via Storybook `play` functions (optional) for click/keyboard smoke.

### Visual regression (variants × states × modes)

Minimum matrix per interactive Surface View / Structural View:

```
variants: [primary, secondary, ...]
states:   [default, hover (Web), pressed, focused, disabled, loading]
modes:    [light, dark]
```

- Tooling: Storybook + Chromatic, Playwright screenshots, or Percy — product choice at CI setup.
- Approve baseline changes only with design/DS review.
- PATCH visual fix → update baseline in same PR.

### Accessibility (automated + manual)

**Automated (every component PR):**

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('ButtonText has no a11y violations', async () => {
  const { container } = render(<ButtonText>Save</ButtonText>);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Manual (before release):** checklist from `accessibility.md` — keyboard, SR, touch targets, light/dark.

---

## Platform-specific testing

### Web (React)

| Type | Tools |
|---|---|
| Unit | Jest / Vitest + React Testing Library |
| Component a11y | jest-axe, @axe-core/react |
| E2E | Playwright |
| Visual | Playwright screenshots, Chromatic + Storybook |
| Lint | ESLint jsx-a11y plugin |

Prefer `@testing-library/user-event` over fireEvent for realistic keyboard/pointer.

### iOS (SwiftUI / UIKit)

| Type | Tools |
|---|---|
| Unit | XCTest |
| UI | XCUITest for critical flows |
| Snapshot | swift-snapshot-testing / Xcode snapshot |
| A11y manual | VoiceOver on device, Accessibility Inspector |

Assert `accessibilityLabel`, traits, `isAccessibilityElement` grouping for composite controls.

### Android (Jetpack Compose)

| Type | Tools |
|---|---|
| Unit | JUnit |
| UI | Compose UI Test (`createComposeRule`) |
| Snapshot | Paparazzi / Compose screenshot tests |
| A11y manual | TalkBack, Accessibility Scanner |

Assert `contentDescription`, `semantics { role }`, `enabled` / `disabled()` state.

---

## CI gate

### What blocks merge

| Gate | Condition | Applies to |
|---|---|---|
| **Unit tests** | All pass | Components, token loader utilities |
| **Typecheck** | `tsc --noEmit` pass | Web TS codebase |
| **A11y automated** | axe: 0 critical, 0 serious | Component stories / E2E |
| **Visual regression** | No unapproved diff vs baseline | Component matrix |
| **Lint** | No new jsx-a11y errors | Web components |
| **Build** | Storybook / portal build pass | `build-storybook`, `build:driver-colors` |

Token-only PRs (Driver `*Data.ts`): unit/snapshot tests for token files; visual portal check optional manual until automated.

### Minimum coverage requirements

Coverage **percentage** — не primary metric для DS. Используй **matrix coverage**:

| Artifact | Minimum |
|---|---|
| **Component** | All variants + states in stories; unit tests for defaults, disabled, loading, primary callback |
| **Interactive component** | axe clean + keyboard smoke test |
| **Token collection** | Snapshot or schema test for full token list |
| **Release candidate** | Manual a11y pass completed for changed components |

Target line coverage (если CI настроен): **≥ 80%** on component logic files — guideline, not substitute for matrix coverage.

### Visual regression baseline management

1. Baselines stored in CI provider (Chromatic) or committed snapshot folder — **one strategy per repo**, documented in CI config.
2. Intentional visual change → designer approval → update baseline in same PR.
3. Unintentional diff → fix implementation, not baseline.
4. Dark mode baselines **separate** from light — both required for color-dependent components.

---

## Manual testing checklist

Перед release компонента или token collection (дополнение к `accessibility.md`):

### Keyboard-only navigation

- [ ] Complete primary flow without mouse
- [ ] Tab order matches visual order
- [ ] Enter/Space activate controls
- [ ] Escape closes overlays
- [ ] Arrow keys work in menus/tabs/select

### Screen reader pass

- [ ] Web: NVDA/VoiceOver (desktop) or axe + spot check
- [ ] iOS: VoiceOver on device — labels, traits, hints
- [ ] Android: TalkBack — contentDescription, state announcements
- [ ] Dynamic content (toast, errors) announced

### Light/dark mode verification

- [ ] All semantic pairs readable in both modes
- [ ] Focus ring visible in both modes
- [ ] States (hover Web, pressed, disabled) distinct in both modes

### Touch targets

- [ ] Web: 44×44px minimum interactive area
- [ ] iOS: 44×44pt
- [ ] Android: 48×48dp

---

## Tools matrix

| Test type | Web | iOS | Android | Design / Tokens |
|---|---|---|---|---|
| **Unit** | Jest, Vitest, RTL | XCTest | JUnit | Node scripts on `*Data.ts` |
| **Integration** | RTL + MSW (optional) | XCTest + mocks | Compose Test | Portal smoke scripts |
| **Visual regression** | Chromatic, Playwright | SnapshotTesting | Paparazzi | Figma compare (manual) |
| **A11y automated** | jest-axe, axe-playwright | Accessibility Inspector (partial) | Accessibility Scanner (partial) | Stark, Figma contrast |
| **A11y manual** | Keyboard, NVDA/VO | VoiceOver | TalkBack | — |
| **E2E** | Playwright, Cypress | XCUITest | Espresso / Compose UI | — |
| **Audit / drift** | Audit Gate report | Audit Gate report | Audit Gate report | Figma vs `*Data.ts` |
| **Documentation** | Storybook | SwiftUI Previews | @Preview | Driver portal pages |

---

## Anti-patterns

| Anti-pattern | Почему плохо | Как исправить |
|---|---|---|
| Tests before Component Gate | Testing wrong API | Gate → implement → test |
| Snapshot-only, no behavior tests | Miss logic regressions | Add RTL unit tests |
| Single default story only | Variants/states untested | Full matrix in Storybook |
| Approve visual diff without design review | Silent visual drift | Require DS/design OK |
| axe pass = a11y done | SR/keyboard gaps remain | Manual checklist |
| Testing `FigmaStyles` as source | Reference-only | Test `*Data.ts` / components |
| 100% coverage goal on presentational code | Low value, high cost | Matrix coverage |
| Flaky E2E without retry discipline | CI noise | Stable selectors, wait strategies |
| Skip dark mode in visual tests | Mode regressions | Separate baselines |
| Audit fixes without tests | Regression repeats | Add test + pending item |
| Cross-product token tests | Product isolation violation | Test Driver scope only |
| Mock all tokens as `#000` | Hides contrast issues | Use real semantic vars in tests |

---

## Changelog

- **1.0.0** — 2026-08-15. Первая версия: testing levels, token/component strategy, platform tools, CI gate, manual checklist, tools matrix, anti-patterns.
