# Artifacts & versioning — ds-component-build reference

Product-scoped paths resolve from `products/<id>/product.json` and
`pages/<presentbook>/component-registry.json`. Driver review sandbox defaults below.

## Color mode mapping (product-scoped)

- Apply Driver `Day`/`Night` → `row.day`/`row.night` **only** when product is
  `driver` or manifest contains explicit `colorModeMapping`
  (`products/driver/product.json`).
- Other products: use manifest mode labels/fields only — never auto-apply
  Driver mapping.
- No `colorModeMapping` in manifest: use actual token modes from product token
  source; do not infer by analogy.

## Artifact paths (Driver review sandbox)

| Artifact | Path |
|---|---|
| Implementation | `pages/driver-color-tokens/components/{Name}.tsx` |
| Metadata | `pages/driver-color-tokens/components/{id}.meta.json` |
| Changelog source | `components/{id}-changelog.json` |
| Pending item | `changes/<product>/pending/component-{slug}.json` |
| Review page | `pages/<presentbook>/{Name}Page.tsx` |
| Registry | `pages/<presentbook>/component-registry.json` |
| Hub route | `hubData.ts` → Components → `{group}` |
| App route | `App.tsx` → `{reviewRoute}` |

## Metadata template

```json
{
  "id": "{componentId}",
  "canonicalName": "{CanonicalName}",
  "aliases": [],
  "product": "{productId}",
  "architectureLevel": "Surface View",
  "supportedPlatforms": ["web"],
  "sourcePath": "pages/driver-color-tokens/components/{Name}.tsx",
  "reviewRoute": "/components/{componentId}",
  "pageFile": "{Name}Page.tsx",
  "componentsGroup": "Controls",
  "changelogSource": "components/{componentId}-changelog.json",
  "currentVersion": null,
  "status": "pending_release",
  "createdDate": "YYYY-MM-DD",
  "figmaSource": "{figma file / node}"
}
```

## Changelog source (unreleased)

```json
{
  "artifact": "{CanonicalName}",
  "componentId": "{componentId}",
  "product": "{productId}",
  "currentVersion": null,
  "releaseStatus": "pending",
  "reviewRoute": "/components/{componentId}",
  "entries": []
}
```

## Pending item (initial release)

```json
{
  "id": "component-{slug}-initial",
  "type": "component",
  "changeType": "added",
  "artifact": "{CanonicalName}",
  "componentId": "{componentId}",
  "product": "{productId}",
  "changeSummary": "...",
  "proposedSemVerImpact": "initial",
  "proposedVersion": "1.0.0",
  "proposedChangelogEntry": {
    "kind": "added",
    "impact": "initial",
    "description": "..."
  },
  "status": "pending",
  "created": "YYYY-MM-DD",
  "author": "{author}"
}
```

## Initial release model

| Phase | `currentVersion` | Pending impact | UI label |
|---|---|---|---|
| Implementation | `null` | `initial` | Not released · Pending initial release |
| Release Gate (approved) | `1.0.0` | moved to `released/` | released entry `type: added`, `impact: initial` |

After first release: minor / patch / major per `versioning-strategy.md` and
`release-gate.mdc`.

## Never during implementation

- bump `currentVersion`;
- append `entries[]`;
- move pending → `released/`;
- release commit or push.

## Optional end-to-end reference (Driver)

Switch — see live files under `pages/driver-color-tokens/components/Switch.tsx`,
`SwitchPage.tsx`, `components/switch-changelog.json`. Use as pattern only; do not
hardcode Switch into universal workflow logic.
