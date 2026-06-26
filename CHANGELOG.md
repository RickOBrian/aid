# Changelog

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
