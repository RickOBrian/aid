---
title: Typography Tokens Registry
updated: 2026-07-07
---

# Typography Tokens Registry

Single source of truth for typography tokens used in the Storybook typography editor
(`docs/storybook/typography.html`). Update this file every time a new token or style
is created — `docs/storybook/storybook-typography-tokens.css` is generated from it by
`docs/tokens/save-tokens.js`, do not hand-edit that CSS file.

Composition rule (see `skills/_shared/token-rules.md`, "Состав типографического стиля"):
every `heading-*` / `body-*` / `label-*` / `meta-*` role must define all four properties —
`size`, `lh`, `weight`, `tracking`. Standalone tokens (`font-*`, `leading-*`, `tracking-*`)
are single values and are not part of a role.

| Token | Category | Value | Used in |
|-------|----------|-------|---------|
| --font-body | font-family | 'Google Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif | typography.html |
| --font-mono | font-family | 'JetBrains Mono', 'Fira Code', monospace | typography.html |
| --heading-xl-size | font-size | 32px | typography.html |
| --heading-xl-lh | line-height | 40px | typography.html |
| --heading-xl-weight | font-weight | 700 | typography.html |
| --heading-xl-tracking | letter-spacing | -0.3px | typography.html |
| --heading-l-size | font-size | 28px | typography.html |
| --heading-l-lh | line-height | 36px | typography.html |
| --heading-l-weight | font-weight | 700 | typography.html |
| --heading-l-tracking | letter-spacing | -0.2px | typography.html |
| --heading-m-size | font-size | 24px | typography.html |
| --heading-m-lh | line-height | 32px | typography.html |
| --heading-m-weight | font-weight | 700 | typography.html |
| --heading-m-tracking | letter-spacing | -0.1px | typography.html |
| --heading-s-size | font-size | 20px | typography.html |
| --heading-s-lh | line-height | 28px | typography.html |
| --heading-s-weight | font-weight | 700 | typography.html |
| --heading-s-tracking | letter-spacing | 0px | typography.html |
| --heading-xs-size | font-size | 16px | typography.html |
| --heading-xs-lh | line-height | 20px | typography.html |
| --heading-xs-weight | font-weight | 600 | typography.html |
| --heading-xs-tracking | letter-spacing | 0px | typography.html |
| --body-l-size | font-size | 16px | typography.html |
| --body-l-lh | line-height | 28px | typography.html |
| --body-l-weight | font-weight | 400 | typography.html |
| --body-l-tracking | letter-spacing | 0px | typography.html |
| --body-m-size | font-size | 14px | typography.html |
| --body-m-lh | line-height | 26px | typography.html |
| --body-m-weight | font-weight | 400 | typography.html |
| --body-m-tracking | letter-spacing | 0px | typography.html |
| --body-s-size | font-size | 13px | typography.html |
| --body-s-lh | line-height | 22px | typography.html |
| --body-s-weight | font-weight | 400 | typography.html |
| --body-s-tracking | letter-spacing | 0.1px | typography.html |
| --label-l-size | font-size | 16px | typography.html |
| --label-l-lh | line-height | 20px | typography.html |
| --label-l-weight | font-weight | 500 | typography.html |
| --label-l-tracking | letter-spacing | 0px | typography.html |
| --label-m-size | font-size | 14px | typography.html |
| --label-m-lh | line-height | 18px | typography.html |
| --label-m-weight | font-weight | 500 | typography.html |
| --label-m-tracking | letter-spacing | 0px | typography.html |
| --label-s-size | font-size | 13px | typography.html |
| --label-s-lh | line-height | 16px | typography.html |
| --label-s-weight | font-weight | 500 | typography.html |
| --label-s-tracking | letter-spacing | 0.1px | typography.html |
| --label-xs-size | font-size | 12px | typography.html |
| --label-xs-lh | line-height | 14px | typography.html |
| --label-xs-weight | font-weight | 500 | typography.html |
| --label-xs-tracking | letter-spacing | 0.2px | typography.html |
| --meta-xs-size | font-size | 11px | typography.html |
| --meta-xs-lh | line-height | 14px | typography.html |
| --meta-xs-weight | font-weight | 500 | typography.html |
| --meta-xs-tracking | letter-spacing | 0.2px | typography.html |
