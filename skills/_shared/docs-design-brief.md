---
destination: skills/_shared/
name: docs-design-brief
metadata:
  version: "1.1.0"
  owner: design-system-team
---

# Docs Design Brief — aid Portal

---

## 1. Reader Profile

Designers and developers who arrive with a specific rule or token in mind —
mid-task, context-switching from Figma or an IDE. New joiners with no prior
system context must reach a correct implementation decision from a single
page, without asking anyone.

## 2. Emotional Target

After opening any guide page: "I understand exactly what rule applies here and why —
I can implement it correctly right now."
Not: uncertain whether an example is current; forced to cross-reference three pages.

## 3. Benchmark References

- **Stripe Docs** — every constraint has a runnable example; reading without acting is not a valid page state.
- **Apple HIG** — every behavioral rule has a do/don't image pair; text never stands alone as sole evidence.
- **Radix UI** — anatomy diagram before any code block; structure is visible before implementation detail.
- **Linear Docs** — prose and visuals at 1:1 density; no section exceeds one scroll gesture.

## 4. Required UI Patterns

- **Token swatch** — 40×40px filled block, token name in monospace below,
  resolved value in secondary text; used for color, radius, space.
- **Token table** — three columns: token name (monospace) | resolved value |
  usage note; striped rows, no vertical borders.
- **Callout** — full-width, 4px left border; `.callout-note` (blue), `.callout-warning` (yellow),
  `.callout-blocker` (red); 14px/20px body; never a substitute for a rule explanation.
- **Do / Don't pair** — two equal-width columns, green ✓ / red ✗ badge
  top-left; visual fills column, 12px caption below. Every blocker rule
  in the system requires a corresponding pair.
- **Architecture diagram** — SVG or HTML, max-width 640px, centered,
  1px `--line-default` border, 8px radius. Hierarchy and flow only.

## 5. Illustration Logic

Rules are triggered by content type. When authoring or updating a guide page,
scan each section and apply the first matching rule:

**Rule 1 — Color token mentioned**
Trigger: section describes a token whose value is a color (`bg-*`, `text-*`, `icon-*`, `line-*`)
Illustration: render the token name as live text styled with that token value.
NOT a colored square — the text itself is the swatch.
Example: `text-primary` label rendered in `var(--text-primary)`,
`text-secondary` in `var(--text-secondary)`, etc.

**Rule 2 — Component mentioned by name**
Trigger: section title or first paragraph names a UI component
(Button, Input, Card, Badge, Chip, Tag, etc.)
Illustration: build a minimal live HTML example of that component
using existing CSS classes and semantic tokens.
The example must be interactive (hover states work) and sit in a
`.do-dont__body` or dedicated `.component-preview` block.

**Rule 3 — Rule or constraint described**
Trigger: section contains a do/don't, blocker, or usage rule
Illustration: `.do-dont` grid with ✓ correct and ✗ incorrect examples side by side.

**Rule 4 — Platform difference described**
Trigger: section mentions Web/iOS/Android behavior differences
Illustration: three-column block with platform labels, showing the
same token applied in each platform's syntax.

**Rule 5 — Architecture or hierarchy described**
Trigger: section describes a token hierarchy, layer structure, or naming convention
Illustration: inline ASCII or SVG tree diagram, max-width 640px,
using `--line-default` border and `--text-secondary` labels.

**Rule 6 — Interactive component possible**
Trigger: section describes states (hover, pressed, disabled, focused)
Illustration: render a live component that cycles through states on click,
or shows all states side by side with state labels.

Priority: if multiple rules match, apply the highest-numbered matching rule.
Never add an illustration that doesn't match any rule — whitespace is better than noise.

---

## 6. Hard Constraints

- **No raw hex or hardcoded values in examples** — semantic token name only;
  raw values appear solely in the token table resolved-value column. An
  example with `#0057FF` teaches the wrong practice directly.
- **No Figma screenshot as sole documentation** — screenshots supplement,
  never replace a textual rule + token reference; screenshots drift silently.
- **No rule without a visual anchor on the same page** — at least one
  do/don't pair or annotated diagram required; prose-only rules get skipped.
- **No centered body text** — left-aligned only; centered reserved for
  swatch labels. Centered runs over 3 lines fail WCAG 1.4.8.

## 7. Shared CSS Contract

`docs/assets/style.css` exposes exactly these classes. No inline styles,
no per-page overrides.

| Class                 | Renders                                           |
|-----------------------|---------------------------------------------------|
| `.token-swatch`       | 40×40px block + token name + resolved value       |
| `.token-swatch-space` | Scaled fill bar representing a space value        |
| `.token-table`        | Striped 3-col table: name / value / usage         |
| `.callout-note`       | Blue left-border info box                         |
| `.callout-warning`    | Yellow left-border warning box                    |
| `.callout-blocker`    | Red left-border stop-rule box                     |
| `.do-dont`            | Two-column grid with ✓ / ✗ header badges          |
| `.arch-diagram`       | Centered block, max-width 640px, 1px border, r-8  |
| `.token-ref`          | Inline monospace chip for token names in prose    |

## 8. Design Principle

Show the rule, then prove it on the same page —
a rule without a visual example that would fail it is incomplete.

Visual language reference: see `skills/_shared/docs-visual-language.md`
