# TESTING — ds-ui-review

Checklist to verify the skill works correctly before merging or after any update.
Run each check in a fresh session unless noted otherwise.

---

## 1. Trigger activation — MODE 1

- [ ] `/review ButtonText` → skill activates, reads the component file, reads `ui-trends-2026.md` and `token-rules.md`
- [ ] `/review src/components/CardProduct.tsx` → activates on a file path
- [ ] `review the component` → activates without the slash command
- [ ] `check UI quality of the login screen` → activates on natural language

## 2. Trigger activation — MODE 2

- [ ] `/apply weight-shift` → activates and looks for a prior `/review` in the session
- [ ] `apply variant spring-nav` → activates on natural language with variant name
- [ ] `/apply` with no prior `/review` in session → stops, asks user to run `/review` first
- [ ] `/apply unknown-variant` → stops, variant name not found in prior review output

## 3. HARD CONSTRAINT enforcement — MODE 1

- [ ] After `/review`, zero files are modified or created
- [ ] After `/review`, no new token names are invented and proposed as usable
- [ ] Improvement that would need a new token is flagged as ⚠️ blocked — not silently omitted and not applied

## 4. Scores output format

- [ ] All 5 axes appear in the table: Visual hierarchy, Motion intent, Density balance, Brand coherence, Trend relevance
- [ ] Each score has an Evidence cell citing a specific line, value, or token name (not generic text)
- [ ] Overall line appears below the table with a single summary sentence
- [ ] Scores are integers 1–10; no decimals, no "N/A"

## 5. Variant format

- [ ] At least 2 variants are produced; no more than 3
- [ ] Each variant has a unique kebab-case name
- [ ] Each variant has all three fields: What changes, Visual impact, Token implications
- [ ] Token implications reference existing semantic tokens by name (e.g. `bg-accent-main`), not descriptions
- [ ] Footer line `*To apply: /apply [variant name]*` is present

## 6. MODE 2 — apply scope

- [ ] Only the named variant is implemented; no other fixes are folded in
- [ ] No hardcoded values in changed files (hex colors, raw px/pt sizes)
- [ ] `platforms.md` is read before making changes
- [ ] Changes applied to all relevant platform files (Web / iOS / Android) if they exist
- [ ] If a platform file does not exist, a note is included in the response explaining why it was skipped

## 7. Token constraint — MODE 2

- [ ] All token references in changed code are semantic-level (e.g. `bg-surface-raised`, not `color-grey-200`)
- [ ] If the variant is marked ⚠️ blocked in the `/review` output, `/apply` on that variant stops with the same blocked message

## 8. Commit message

- [ ] Message format is exactly: `ui(ds-ui-review): apply [variant-name] to [ComponentName]`
- [ ] Commit is not created in `/review` mode

## 9. Graceful degradation

- [ ] `skills/_shared/ui-trends-2026.md` not found → explicit warning printed, skill continues on built-in rules
- [ ] `skills/_shared/token-rules.md` not found → explicit warning printed, skill continues
- [ ] `skills/_shared/platforms.md` not found (MODE 2) → explicit warning printed, skill applies Web-only changes and states why

## 10. Onboarding test

- [ ] A colleague who was not present for skill authoring can run `/review [component]` and get a valid output within 5 minutes of reading only `SKILL.md`
