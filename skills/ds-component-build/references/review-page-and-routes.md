# Review page, routes & changelog block — ds-component-build reference

## Components placement

Every Product DS Component must have:

1. **Components group** — from `skills/_shared/component-categories-guide.md`
   (e.g. Controls, Forms, Navigation).
2. **Review/sandbox page** — `{Name}Page.tsx` in product presentbook root.
3. **Route** — registered in `App.tsx` + `HUB_ROUTES` / `hubData.ts`.
4. **One canonical route** — aliases do not get separate routes or registry rows.
5. **Registry entry** — when `component-registry.json` exists for the product.

If `componentsRoot` is `null` and no approved permanent path exists:

- do not invent `componentsRoot` or global registry architecture;
- show one compact decision form (temporary review sandbox vs defer);
- default recommendation: temporary sandbox under presentbook (Driver pattern).

## Portal UI vs Product DS on review page

Reuse portal **infrastructure only**:

- `DsPageHeader`, `ChangelogTable`, `ComponentReleaseStatus`
- `DS_CHANGELOG_TABLE_STYLE`, `DS_TOKEN_TABLE_STYLE` from `dsChangelogTable.ts`
- `loadComponentChangelog`, `loadComponentPendingItems`

Do **not** import portal controls into product component source.
Do **not** version portal primitives.

## Review page block order

1. Page header + version/status badges
2. Overview (architecture, Figma, tokens, route)
3. Live demo / variants / state matrix
4. Props, slots, platform notes (if applicable)
5. Accessibility / token notes
6. **`ComponentReleaseStatus` — last meaningful block**, containing:
   - released version label (`Not released` if `currentVersion: null`)
   - `Pending initial release` when initial pending exists
   - pending panel with proposed `INITIAL → v1.0.0`
   - component-specific changelog table **or** empty-state message
   - **never** token collection changelog

Missing changelog section = **blocker** — do not return verified URL.

## Changelog table rules

- Reads **only** `components/{componentId}-changelog.json`.
- Unreleased: visible section, no fake released rows.
- Pending changes: pending panel, not as released `entries[]`.
- After Release Gate: `ChangelogTable` shows released entries.

## Verify route

```bash
cd pages/driver-color-tokens && npm run dev
# open http://localhost:3000{reviewRoute}
```

Production check: `npm run build` in presentbook root.

Final summary must include verified local URL or exact dev command + URL pattern.
