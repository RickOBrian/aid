# Changelog

## [0.6.0] - 2026-08-26

### Added
- Rider product onboarding in the DS portal: colors, typography (sem + outstanding), shadows, glass, spacing, radius, icons (129 SVG)
- Product-aware token pages with `/rider/` routes, `ProductAccentScope`, and hub availability via `products/rider/index.ts`
- Rider pending import items under `changes/rider/pending/` for all new token collections
- BadgeCount and BadgeDot component review pages with anatomy, tokens, and changelog artifacts
- Guides hub with versioning guide sync from `docs/semver-guide.md`
- `scripts/import-rider-icons.mjs` — Figma API import for Rider icon catalog and SVG assets

### Changed
- IconsPage, SpacingPage, RadiusPage, ShadowsPage, TypographyPage, DriverColorTokensPage — accept `productId` and load product-specific data
- Radius preview uses product accent CSS vars (`--ds-accent`) instead of hardcoded red
- `ensure-icon-dimensions.mjs` — nested paths for `public/icons/rider/*`
- Token changelog registry — rider collections indexed for portal display

## [0.5.0] - 2026-08-19

### Added
- Driver Switch review page: two-column layout (preview left, Code/API/Release right)
- Shared component review primitives: `ComponentMetaHeader`, `ComponentApiSummary`, `ComponentCodeSnippet`, `CopyButton`, `dsColorSwatch`
- Anatomy inspector pilot for Switch: leader lines, zoom controls, zone callouts
- `skills/component-build-workflow.md` — platform scope gate for component builds
- Component changelog empty state via `ChangelogTable` `emptyMessage` prop

### Changed
- Switch tokens tab: hex + alpha display with color swatches and copy-to-clipboard
- `ComponentReleaseStatus`: release meta separated from token-style changelog table
- `skills/_shared/presentbook-guide.md` v1.1.0 — component page content criteria
- `skills/_shared/platforms.md` v1.1.0 — interactive snippet verification section
- `skills/ds-component-build/SKILL.md` v1.1.0 — platform scope gate step

## [0.4.0] - 2026-06-27

### Added
- `skills/_shared/token-rules.md` v1.3.0 — typography tokens section, role rules, blockers
- `skills/ds-component-spec/SKILL.md` v1.2.0 — «Типографика» section in spec template

## [0.3.2] - 2026-06-27

### Changed
- `.cursorrules` — paths point to `skills/_shared/`, token terminology Core → Semantic → Component

## [0.3.1] - 2026-06-27

### Added
- `PROJECT_STRUCTURE.md` — snapshot of repository tree
- Formatted typography guides in `skills/_shared/` and `perplexity-skills/`

### Changed
- Renamed `docs/design-system/colors/` → `docs/design-system/tokens/`
- `CLAUDE.md` — shared rules now reference `skills/_shared/`, added canonical source note

### Removed
- Empty `.claude/skills/shared/` directory

## [0.3.0] - 2026-06-26

### Added
- `docs/design-system/colors/core-typography-tokens-guide.md`
- `docs/design-system/colors/semantic-typography-tokens-guide.md`
- `docs/design-system/typography/` — SOUZ typography guide (MD + web)
- `perplexity-skills/` — Perplexity skill copies with frontmatter

### Changed
- `docs/design-system/README.md` — typography section and links

## [0.2.1] - 2026-06-24

### Added
- `docs/design-system/colors/core-color-tokens-guide.md`
- `docs/design-system/colors/semantic-color-tokens-guide.md`
- `docs/design-system/README.md` with color guide index

### Changed
- Relocated semantic color tokens guide from `docs/` to `docs/design-system/colors/`

### Removed
- `docs/semantic-color-tokens-guide.md` (relocated to `docs/design-system/colors/`)

## [0.2.0] - 2026-06-24

### Added
- Canonical `skills/_shared/` with token-rules, platforms, and git-workflow guides
- `skills/ds-component-spec/SKILL.md` component specification skill
- `docs/` with claude-skills, component-architecture, semver, and semantic-color-tokens guides
- `.cursor/rules/git-push.mdc` release flow rule
- `memory/ds-component-spec/.gitkeep`

### Changed
- `.gitignore` — ignore `memory/**/*.master.json` and `.claude/intake-user`
- `.claude/skills/ds-component-spec/` — SKILL.md renamed to ds-component-spec-SKILL.md
