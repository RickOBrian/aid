---
description: >
  Accessibility-стандарты дизайн-системы: contrast, focus, keyboard,
  screen reader, platform-specific требования.
destination: skills/_shared/
name: accessibility
metadata:
  version: "1.0.0"
  platforms: [web, ios, android]
  owner: design-system-team
---

# Accessibility

## Purpose

Этот гайд фиксирует accessibility-стандарты дизайн-системы aid для Web, iOS и Android: контраст, фокус, клавиатура, screen reader и минимальные требования к тестированию. Стандарты обязательны для всех Surface View и Structural View компонентов до release.

Accessibility — часть контракта компонента наравне с variants и states. Компонент без соответствия этому гайду и `component-standards.md` не считается готовым к release, даже если визуально совпадает с Figma.

---

## Relationship to other guides

| Гайд | Связь |
|---|---|
| `component-standards.md` | Минимальные a11y requirements, touch targets, disabled behavior |
| `token-rules.md` | Semantic color tokens для текста, иконок, focus/disabled states |
| `platforms.md` | Platform-specific a11y API (ARIA, VoiceOver, TalkBack) |
| `component-states-guide.md` | Focus vs hover, disabled/loading priority, state → token mapping |
| `semantic-color-tokens-guide.md` | Пары text/bg tokens для контраста |
| `naming-conventions.md` | Единые имена states и slots на всех платформах |

---

## Color contrast

### Minimum contrast ratios (WCAG 2.1 AA)

| Content type | Minimum ratio | Notes |
|---|---|---|
| **Normal text** (< 18pt / < 14pt bold) | **4.5:1** | `text-primary`, `text-secondary` на `bg-base-main` |
| **Large text** (≥ 18pt / ≥ 14pt bold) | **3:1** | `heading-*` на surface backgrounds |
| **UI components & graphics** | **3:1** | Borders, icons, focus rings, control outlines |
| **Non-text contrast** | **3:1** | `line-default`, focus indicator vs adjacent colors |

WCAG AAA (7:1 / 4.5:1) — опционально для critical content; не блокер, если AA соблюдён.

### Как проверять contrast

1. **Design phase:** Figma contrast plugin или Stark — проверка пары foreground/background до финализации token value.
2. **Implementation phase:**
   - Web: axe DevTools, Lighthouse, `@axe-core/playwright`
   - Formula: `(L1 + 0.05) / (L2 + 0.05)` где L — relative luminance (WCAG 2.1)
3. **Both modes:** проверять **light и dark** — semantic token name один, значения разные.
4. **Opacity:** учитывать effective color после opacity (например `text-primary` с alpha на `bg-base-main`).

### Token-based contrast (semantic pairs)

Компоненты не подбирают hex — используют **согласованные пары semantic tokens**:

| Foreground | Background | Usage |
|---|---|---|
| `text-primary` | `bg-base-main` | Body text on default surface |
| `text-secondary` | `bg-base-main` | Secondary text (must still meet 4.5:1) |
| `text-inverse` | `bg-accent-main` | Text on accent buttons |
| `icon-primary` | `bg-base-main` | Default icons |
| `icon-inverse` | `bg-accent-main` | Icons on accent surfaces |
| `text-disabled` | `bg-base-main` | Disabled content — **не** primary readable text |
| `line-default` | `bg-base-main` | Borders/dividers (3:1 vs adjacent) |

**Правила:**

- Новая пара foreground/background → token lookup + contrast check перед implementation.
- ⚠️ Token gap → не hardcode «подходящий» hex; создать semantic token через анкету.
- `error` state форм: `text-*` + `line-*` + message text — все пары проверяются отдельно.
- Цвет **не единственный** индикатор: error требует текст сообщения, не только красную рамку.

---

## Focus management

### Focus indicators

Focus indicator **обязателен** для всех интерактивных компонентов.

| Requirement | Standard |
|---|---|
| **Visible** | Минимум 3:1 contrast vs adjacent colors |
| **Non-color-only** | Ring/outline/shadow — не только смена fill |
| **Token-based** | Web: `bg-accent-states-focused`; iOS: `bg-accent-states-focused-ios` |
| **Not removed** | «Minimal design» без focus — **блокер** |

Web: предпочитать `:focus-visible` — focus ring при keyboard navigation, без лишнего ring при mouse click.

```css
/* ✅ Pattern */
outline: 2px solid var(--bg-accent-states-focused);
outline-offset: 2px;
```

### Focus order

- Tab order **совпадает** с visual reading order (left-to-right, top-to-bottom для LTR).
- DOM order = focus order; не используй `tabindex > 0`.
- `tabindex="-1"` — только для programmatic focus (modal open, skip link target).
- Skip links: «Skip to main content» — first focusable element на странице.

### Focus trapping (modals, dialogs)

| Requirement | Behavior |
|---|---|
| **Trap focus** | Tab/Shift+Tab циклически внутри modal |
| **Initial focus** | First interactive element или dialog title |
| **Return focus** | On close — вернуть focus на trigger element |
| **Escape** | Close modal (если не destructive confirm без explicit pattern) |
| **Backdrop** | Inert background (`inert` attribute / `aria-hidden` on page content) |

Dialog, Sheet, Select dropdown — обязаны реализовать trap + restore focus.

---

## Keyboard navigation

### Keyboard-accessible interactions

Все actions, доступные pointer/touch, **должны быть доступны с клавиатуры**, кроме явно documented exceptions (draw-only gestures).

| Component type | Minimum keyboard support |
|---|---|
| Button | Enter, Space (activation) |
| Link | Enter |
| Checkbox / Radio | Space (toggle/select) |
| Switch | Space |
| Text input | Standard text keys |
| Select / Menu | Arrow keys, Enter, Escape |
| Tabs | Arrow keys (horizontal), Home/End |
| Dialog | Tab cycle, Escape close |

### Standard shortcuts

| Key | Action |
|---|---|
| **Tab** | Next focusable element |
| **Shift + Tab** | Previous focusable element |
| **Enter** | Activate button/link, submit |
| **Space** | Activate button, toggle checkbox/switch |
| **Escape** | Close overlay, dismiss popover |
| **Arrow keys** | Navigate within composite widgets (menu, tabs, radio group) |
| **Home / End** | First/last item in list or tab strip |

### Custom keyboard patterns

- Document custom shortcuts в component spec и Presentbook.
- Не override browser/OS shortcuts без крайней необходимости.
- Roving tabindex для composite widgets (toolbar, tablist) — один tab stop, arrows inside.
- **Disabled** (`isDisabled` / `enabled = false`): элемент **не** в tab order, не activatable.

---

## Screen reader support

### ARIA labels, roles, states

**Prefer native elements** — `<button>`, `<input>`, `<a>` дают semantics бесплатно.

| Pattern | When | Example |
|---|---|---|
| `aria-label` | No visible text (icon-only button) | `aria-label="Close"` |
| `aria-labelledby` | Visible label exists elsewhere | Dialog title → input |
| `aria-describedby` | Helper text, error message | Input + error paragraph |
| `role` | Native element insufficient | `role="button"` on `<div>` — last resort |
| `aria-expanded` | Collapsible (Accordion, Select) | `true` / `false` |
| `aria-selected` | Tabs, listbox options | Sync with `selected` state |
| `aria-disabled="true"` | Custom disabled control | + opacity 40% + no pointer events |
| `aria-live` | Dynamic updates | Toast: `polite`; critical alert: `assertive` |
| `aria-busy="true"` | Loading region | Skeleton / loading container |

### Hidden content (visually hidden but accessible)

- Use visually hidden utility class (`.sr-only` / `.visually-hidden`) — **not** `display: none` or `aria-hidden`.
- Icon + visible text: hide decorative icon from AT (`aria-hidden="true"`), text remains accessible.
- **Never** `aria-hidden` on focusable elements.

### Dynamic content announcements

| Pattern | Announcement |
|---|---|
| Toast / notification | `aria-live="polite"` region |
| Form error on submit | Focus first invalid field + `aria-describedby` error text |
| Loading complete | Move focus or announce via live region |
| Route change (SPA) | Update document title + focus main heading |

Loading state: `aria-busy="true"` on container; button loading — `aria-disabled="true"` + spinner `aria-hidden="true"` or «Loading» in label.

---

## Platform-specific requirements

### Web (React)

| Area | Requirement |
|---|---|
| **Semantics** | Native HTML first; ARIA only when needed |
| **Focus** | `:focus-visible` + token-based outline |
| **Keyboard** | onKeyDown for custom widgets; preventDefault only when handling |
| **Disabled** | `disabled` on native controls; `aria-disabled` + `pointer-events: none` + opacity 40% on custom |
| **Touch target** | Min 44×44px hit area |
| **Color** | `var(--semantic-token)` only — no hardcoded contrast fixes |

```tsx
// ✅ Icon-only button
<button type="button" aria-label="Close dialog" onClick={onClose}>
  <Icon name="close" aria-hidden="true" />
</button>
```

### iOS (SwiftUI / UIKit)

| Area | Requirement |
|---|---|
| **VoiceOver** | Test on real device |
| **Labels** | `accessibilityLabel` for elements without visible text |
| **Traits** | `.button`, `.isSelected`, `.isDisabled`, `.isHeader` |
| **Values** | `accessibilityValue` for Switch, Slider |
| **Hints** | `accessibilityHint` — optional, action outcome |
| **Grouping** | `accessibilityElement(children: .combine)` or `.ignore` for composite controls |
| **Focus** | `bg-accent-states-focused-ios`; no hover states |
| **Touch target** | Min 44×44pt |

```swift
Button(action: action) { ... }
  .accessibilityLabel("Close")
  .accessibilityAddTraits(.isButton)
  .disabled(isDisabled)
```

### Android (Jetpack Compose)

| Area | Requirement |
|---|---|
| **TalkBack** | Test on device/emulator |
| **Descriptions** | `contentDescription` for Icon/Image without text |
| **Semantics** | `semantics { role = Role.Button }` for custom clickables |
| **Disabled** | `enabled = false` + `semantics { disabled() }` |
| **State** | `stateDescription` for Switch, Checkbox |
| **Touch target** | Min 48×48dp; `Modifier.minimumInteractiveComponentSize()` |
| **Focus order** | Compose traversal order matches visual order |

```kotlin
IconButton(onClick = onClose, modifier = Modifier.semantics {
    contentDescription = "Close"
}) { ... }
```

---

## Testing requirements

### Automated a11y tests

| Layer | Tool | Scope |
|---|---|---|
| Unit / component | jest-axe, @axe-core/react | Per story / component render |
| E2E | @axe-core/playwright | Critical user flows |
| CI gate | axe violations = 0 critical/serious | Block merge on regression |

Minimum automated checks:

- Color contrast (where axe supports token-computed colors)
- Missing labels on interactive elements
- Invalid ARIA attributes
- Focusable elements with duplicate IDs

### Manual testing checklist

- [ ] Keyboard-only: complete primary flow without mouse
- [ ] Focus visible on every interactive element
- [ ] Tab order matches visual order
- [ ] Modal: trap, Escape, focus restore
- [ ] Screen reader: all controls announced correctly
- [ ] Disabled controls skipped in tab order, announced as disabled
- [ ] Error states: message read, not color-only
- [ ] Light and dark mode contrast verified
- [ ] Touch targets meet platform minimums

### Tools

| Platform | Tools |
|---|---|
| **Web** | axe DevTools, Lighthouse, WAVE, keyboard only |
| **iOS** | VoiceOver (Settings → Accessibility), Accessibility Inspector |
| **Android** | TalkBack, Accessibility Scanner |
| **Design** | Figma contrast plugins, Stark |
| **Cross-platform** | Component Presentbook + manual matrix variants × states |

Automated tests **не заменяют** VoiceOver/TalkBack manual pass для composite components.

---

## Anti-patterns

| Anti-pattern | Почему плохо | Как исправить |
|---|---|---|
| Color-only state (error, selected) | WCAG 1.4.1 failure | Add icon, text, pattern, border |
| Removing focus outline globally | Keyboard users lost | `:focus-visible` + token ring |
| `outline: none` without replacement | Invisible focus | Token-based focus indicator |
| `div` + `onClick` without keyboard | Not keyboard accessible | Use `<button>` or full keyboard handler + role |
| Icon button without label | SR announces «button» only | `aria-label` / `accessibilityLabel` |
| `tabindex > 0` | Broken focus order | Fix DOM order |
| Focus trap without Escape | User trapped | Escape closes + restores focus |
| Disabled but still focusable/clickable | Confusing UX | Remove from tab order + `pointer-events: none` |
| `aria-hidden` on interactive content | Hidden from SR but focusable | Remove from tab order or don't hide |
| Hardcoded contrast fix | Breaks theming | Fix semantic token pair |
| Hover-only affordance on Web | Keyboard users miss feedback | Focus + pressed states |
| `error` state on Button | Wrong semantic | `variant="destructive"` |
| Skip VoiceOver/TalkBack testing | Mobile a11y gaps | Manual pass on device |
| Opacity-only disabled (no AT state) | SR may not know disabled | `aria-disabled` / traits / semantics |

---

## Changelog

- **1.0.0** — 2026-08-15. Первая версия: WCAG AA contrast, focus/keyboard/screen reader standards, platform requirements, testing checklist, anti-patterns.
