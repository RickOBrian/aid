---
destination: skills/_shared/
name: docs-visual-language
metadata:
  version: "1.0.0"
  owner: design-system-team
description: >
  Visual language reference for the aid documentation portal.
  Defines surface style, typography, color use, components, and
  data visualization rules. Apply when authoring guide illustrations,
  component previews, or any visual element on a docs page.
---

# Docs Visual Language — aid Portal

---

## Surface & Depth

- **Background** — light warm-neutral (`#EBEBEB` tone), never pure white. Warmth signals approachability; clinical white reads as unfinished.
- **Cards** — white or `--bg-card-main` with `border-radius: 20–28px`. Large radius signals intentional, premium craft.
- **Nested radius rule** — inner element radius = parent radius minus the padding between them. If a card has `r-24` and 8px padding, its inner element gets `r-16`. Flat nesting looks broken.
- **Shadows** — soft, large spread, low opacity (e.g. `0 8px 32px rgba(0,0,0,0.06)`). Never sharp (`blur < 4px`) or dark (opacity > 0.2). Shadow communicates layer, not drama.
- **Glassmorphism** — only for floating or overlay elements (tooltips, popovers, modals). Never as a base card style. Base cards use solid surfaces.
- **No visible borders** — depth comes exclusively from shadow and surface-color difference. A 1px border on a card that shares parent background is a ghost artifact.

---

## Typography

- **Display values** (KPIs, metrics, counts) — `font-weight: 700–800`, large scale, `font-variant-numeric: tabular-nums`. Numbers that shift width while animating destroy layout.
- **Size contrast** — strong gap between display value and its label. A label at the same size as its value has no hierarchy.
- **Labels** — `--label-xs` or small regular weight, `--text-secondary` or faint color, uppercase with `letter-spacing: 0.06em` OR small regular weight. Pick one style, stay consistent.
- **Body** — regular weight (400), generous line-height (`1.5–1.65`). Dense body text signals an unedited document.
- **Font** — geometric sans-serif (Inter, DM Sans, or similar). No decorative, slab, or display fonts in UI copy. Decorative fonts in a DS guide teach incorrect practice by example.

---

## Color

- **Base** — neutral warm-gray surfaces. Cool gray reads as legacy enterprise; warm gray reads as considered product.
- **Accent** — one color, vivid and saturated (lime green / chartreuse character works well with warm gray). Accent must be visible at small sizes; washed-out accents fail their purpose.
- **Accent surface area** — 10–15% of visual area maximum. Accent on badges, active states, highlights, and key CTAs only. More than 15% and it stops being an accent.
- **Dark pill buttons** — `background: var(--text-primary)`, `color: var(--bg-base-main)`. Used for primary CTA only. One per view. Avoid on secondary or tertiary actions.
- **No gradients on interactive elements** — gradients make state changes (hover, pressed) hard to communicate cleanly. Flat fills with token-driven state shifts only.

---

## Components

- **Shape language** — all interactive elements use pill shape (`border-radius: 9999px`) or large-radius cards (20–28px). Square-cornered interactive elements feel mismatched.
- **Navigation** — pill-shaped active state, no underlines, no left-border indicators. Underlines and borders belong in text content, not nav.
- **Avatars** — circular, overlapping stack. Gap between overlapping avatars: 2–4px. Use `--bg-card-main` ring to separate from background.
- **Tags / chips** — pill, neutral fill (`--bg-base-main-secondary`), light or no border. Max one accent-colored chip visible at a time unless in a legend context.
- **Icons** — outline or rounded style only, 20–24px, `--icon-secondary` default color. Filled icons reserved for active/selected state only. Do not mix outline and filled in the same context.

---

## Data Visualization

- **Axes** — minimal: label only, no tick marks, no box frames. Clean data space reduces cognitive load.
- **Gridlines** — none, or very faint (`--line-default` at 30% opacity). Data speaks; gridlines assist at most.
- **Data labels** — floating pill chips positioned above data points. Same visual language as UI chips.
- **Area fills** — hatched pattern or very low opacity fill (< 0.12). Solid fills compete with UI surfaces.
- **Comparison areas** — subtle, layered transparencies, labeled at edges not inside the area. Interior labels cause clutter when areas overlap.

---

## Illustration & Preview Rules

Apply when building illustrations for guide pages:

- **Device mockups** — `border-radius: 32–40px`, subtle shadow (`0 16px 48px rgba(0,0,0,0.10)`), dark thin frame only (2–3px). No bezels, no hardware buttons, no screen glare.
- **Component previews** — always on `--bg-base-main` or `--bg-base-main-secondary` surface (warm gray), never on white. White preview areas look unfinished or copy-pasted.
- **Interactive demos** — pill buttons, spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`), token-driven colors. Static demos that don't respond to hover signal low fidelity.
- **No sharp corners in illustrations** — a square-cornered element in a guide example teaches the wrong geometry. Every preview element follows the same radius rules as production components.
- **No multiple accent colors simultaneously** — one accent per view. Two vivid colors in one illustration create a false signal that both are valid at once.
