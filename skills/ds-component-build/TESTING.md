# TESTING — ds-component-build

Checklist for skill v1.0.0. Run in fresh Cursor session unless noted.

---

## Activation & short input

- [ ] «Сверстай компонент. Figma: … Product: driver Platform: Web» → skill activates, no long audit/plan dump
- [ ] «сверстай product-кomponent из Figma» → activates
- [ ] «component build» / «новый Product DS Component» → activates
- [ ] Spec-only request («сделай spec») → **does not** activate; `ds-component-spec` instead

## Discovery & UX

- [ ] Resolves product from explicit name / path / open file without redundant questions
- [ ] Resolves canonical name, architecture level, Components group from Figma + repo
- [ ] No second full discovery pass after user answers one decision form
- [ ] No more than one questionnaire packet per blocker round
- [ ] Token + path + motion gaps aggregated into single form when possible

## Figma MCP

- [ ] MCP available → reads frame via Figma MCP / design context
- [ ] MCP unavailable → one explicit message:
      `Figma MCP недоступен — продолжаю по скриншоту, описанию и repository context.`
- [ ] MCP unavailable → continues without auto-block; does not re-request Figma link if already provided
- [ ] MCP unavailable → unverified Figma properties marked as assumptions
- [ ] MCP unavailable → decision form only for material unknowns (tokens, API, states, placement, a11y) not safely resolved from repo

## Blockers & decision form

- [ ] No blockers → starts implementation immediately (no separate IMPLEMENT ritual)
- [ ] Token gap → one compact form; implementation waits
- [ ] Missing path / Components group / registry convention → one decision form with Default
- [ ] Form matches: Нужно решение / Рекомендация / A B C / Default / Последствие

## Tokens & color mode mapping

- [ ] Semantic tokens only; no Core direct; no hardcoded production values
- [ ] **Driver** product → `Day` → light → `row.day`; `Night` → dark → `row.night`
      (from `products/driver/product.json` → `colorModeMapping`)
- [ ] Driver: Day/Night labels preserved; not treated as naming violation
- [ ] **Other product** with Light/Dark or custom mode schema → Driver Day/Night
      mapping **not** applied automatically; manifest mapping used instead
- [ ] Product without `colorModeMapping` → uses actual token modes; no Driver-like inference

## Platform & states

- [ ] Delegates to `platforms.md` + `component-states-guide.md` (not copied into skill output)
- [ ] Web: hover only on Web
- [ ] error state only for form controls
- [ ] loading only when async scenario exists
- [ ] Android ripple only with platform/token evidence
- [ ] Native semantics, keyboard, focus-visible, 44×44px Web target

## Motion

- [ ] Applies safe default when repo/platform convention exists (e.g. 0.15s ease, reduced-motion)
- [ ] Asks about motion only when it affects API, UX, or token decision
- [ ] `prefers-reduced-motion` when animation applied

## Portal UI vs Product DS

- [ ] Portal header/table styles reused on review page only
- [ ] Portal UI control not used as production component basis
- [ ] No metadata/changelog/version for Portal UI artifacts
- [ ] Product source separate from portal infrastructure

## Artifacts & versioning

- [ ] Creates metadata, changelog source, pending item
- [ ] New component: `currentVersion: null`, `releaseStatus: pending`
- [ ] Pending: `proposedSemVerImpact: initial`, `proposedVersion: 1.0.0`, `changeType: added`
- [ ] No released `entries[]` during implementation
- [ ] Nothing moved to `released/`
- [ ] No automatic version bump, final changelog, commit, or push

## Review page & route

- [ ] Component in correct Components group in hub
- [ ] Review page + route + registry entry (if registry exists)
- [ ] Single canonical route; alias has no separate route
- [ ] `ComponentReleaseStatus` is last meaningful block
- [ ] Changelog section visible for unreleased component (Not released / pending panel)
- [ ] Changelog reads component source only — not token changelog
- [ ] `npm run build` passes
- [ ] Route verified in browser or via curl with `Accept: text/html`

## Final summary

- [ ] Short: name, architecture, variants/states/motion, defaults, checks, group, route
- [ ] Verified local URL **or** dev command + expected URL pattern
- [ ] No verified URL claim if changelog block missing or route not checked
- [ ] States version/changelog finalized only at Release Gate

## Reference (optional manual)

- [ ] Switch end-to-end files match patterns in `references/` (not skill logic)
