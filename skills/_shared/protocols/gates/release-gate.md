---
destination: skills/_shared/protocols/gates/
name: release-gate
metadata:
  version: "1.0.0"
  kind: protocol
  status: stable
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Формализует границу релиза: группировка pending changes, определение SemVer и запись changelog только на release boundary.
---


# Release Gate

> Статус: Stable · v1.0.0 · обновлено 2026-09-20

---

## 1. Scope

This rule applies whenever the user asks to:

- release, version or publish tokens, components, styles or skills;
- finalize SemVer, changelog or release notes for a product;
- move changes from `changes/<id>/pending/` to `changes/<id>/released/`;
- prepare a release commit, tag or push that affects versioned artifacts.

Do not apply this rule to ordinary repository work such as general documentation,
utilities, non-UI refactoring or infrastructure that does not affect those artifacts.

## 2. Product context prerequisite

Before any applicable work, follow `protocols/gates/product-context.md` and resolve the product
context.

Do not start any release flow until the product context is confirmed.

## 3. Release scope resolution

After product context is confirmed, resolve the release scope in this order:

1. Explicit release target named by the user (for example "release Driver tokens",
   "release Button component", "release all Driver changes").
2. Current open-file or working-area context (for example a pending change file,
   token file or component file).
3. The only eligible `active`/`onboarding` product in registry.

For Driver:

- pending changes live in `changes/driver/pending/`;
- released changes live in `changes/driver/released/`;
- token changelogs: `tokens/*-changelog.json` (Driver collections only);
- component changelogs: `components/*-changelog.json` (Product DS Components);
- component registry: `pages/aid-portal/component-registry.json`;
- component metadata: `pages/aid-portal/components/*.meta.json`;
- `pages/aid-portal/token-changelog-registry.json` indexes token
  collection changelogs and can be used as a reference.

Do not release tokens, components or skills across multiple products in a single
run unless the user explicitly asks for a cross-product release.

## 4. Version and changelog boundary (all artifact types)

Version and final changelog **must not** change during:

- local implementation edits;
- review iterations;
- preview or sandbox updates;
- temporary placement decisions (`componentsRoot: null` review sandbox).

They update **only** on Release Gate when:

1. Principal Designer explicitly requests release/push preparation;
2. Cursor groups all pending changes since the previous release;
3. Cursor proposes SemVer impact, new version, and grouped changelog draft;
4. Principal Designer explicitly confirms version, changelog, and push;
5. Only after confirmation: update artifact version + changelog, move pending
   to `released/`, create release commit, push via `protocols/git-workflow.md`.

Cursor proposes; Principal Designer confirms. Version, changelog, and push
are one linked operation — never split across silent auto-bumps.

## 5. Release types

When the user asks for a release, classify it into one or more types:

1. **Token release**:
   - finalize SemVer for one or more token collections;
   - finalize changelog entries for token collections;
   - move related pending changes to released.

2. **Component release**:
   - finalize SemVer for one or more components;
   - finalize changelog entries for components;
   - move related pending changes to released.

3. **Skills release** (if applicable):
   - finalize SemVer for one or more skills;
   - finalize changelog entries for skills;
   - move related pending changes to released.

4. **Combined release**:
   - release multiple artifact types (tokens, components, skills) together;
   - group pending changes by artifact and finalize versions jointly.

## 6. Release procedure

For any release type:

1. Do not start release silently in the background.
2. Show a brief release plan:
   - product context;
   - release type(s);
   - artifacts to release (tokens, components, skills);
   - pending change files to include.
3. Ask the user to confirm or adjust the plan.
4. After confirmation, load and group all relevant pending changes from
   `changes/<id>/pending/`.

## 7. Pending changes grouping

Group pending changes by artifact:

1. By token collection (for example `color`, `typography`, `spacing`).
2. By component (for example `Button`, `Input`, `Modal`).
3. By skill (for example `icon-set`, `illustration-set`).
4. By release type (token, component, skills, combined).

For each group:

- list all pending change items;
- summarize the changes (added, changed, removed tokens/components/skills);
- propose a SemVer bump (major, minor, patch) based on the nature of changes;
- propose a changelog entry (in plain text or Markdown).

## 8. SemVer and changelog determination

For each artifact group:

1. Propose a SemVer bump based on:
   - breaking changes (removed tokens/components, renamed tokens, changed API);
   - new features (added tokens/components/skills, new variants or modes);
   - fixes (value corrections, documentation updates, minor adjustments).

For **components** (in addition to tokens/skills):

| Change | Typical impact |
|---|---|
| First approved release of new Product DS Component | **INITIAL** → `1.0.0` (entry: `type: "added"`, `impact: "initial"`) |
| New public variant/state/slot (after first release) | MINOR |
| Visual/token fix without public API change | PATCH |
| Removal, rename, breaking prop/slot/structure | MAJOR |

Do **not** use `currentVersion: "0.0.0"` for unreleased components — use
`null` until the first Release Gate approval sets `1.0.0`.

Cursor **only proposes** impact, version, and changelog draft. Principal
Designer confirms before any file update, commit, or push.
2. Propose a changelog entry summarizing the changes.
3. Show the proposed SemVer and changelog to the user.
4. Ask the user to:
   - confirm or adjust the SemVer bump;
   - confirm or edit the changelog entry;
   - confirm whether to proceed with this release.

Do not finalize SemVer or changelog without explicit user confirmation.

## 9. Release artifacts creation

After SemVer and changelog are confirmed:

1. For token releases:
   - update or create collection changelog files (for example
     `tokens/driver-colors-semantic-changelog.json` or Driver-equivalent when defined);
   - update `pages/aid-portal/token-changelog-registry.json` if needed.
2. For component releases:
   - update or create `components/{componentId}-changelog.json`;
   - update `pages/aid-portal/components/{id}.meta.json`
     (`currentVersion`, `status`);
   - update `pages/aid-portal/component-registry.json` if needed.
3. For skills releases:
   - update or create skill changelog files (when skills changelog structure
     is defined).
4. Move processed pending change files from `changes/<id>/pending/` to
   `changes/<id>/released/`, preserving history.

Do not change token values, component implementations or skills as part of the
release flow. That must be done in separate tasks before release.

## 10. Release commit and push

After release artifacts are created:

1. Stage only release-related files:
   - updated changelog files;
   - moved pending change files (if tracked);
   - any release metadata files.
2. Show the planned commit message and files to be committed.
3. Ask the user to confirm the commit.
4. After commit, ask the user whether to push immediately or defer.
5. If push is approved, follow `protocols/git-workflow.md` for the push flow.

Do not push release commits without explicit user approval.

---

## 11. Changelog

- **1.0.0** — 2026-09-20. Перенесено из .cursor/rules/release-gate.mdc. Cursor объявлен легаси; правило переписано инструмент-нейтрально и живёт теперь там, где его читает рабочий агент. Прежний файл оставлен указателем.
