---
name: ds-ui-review
metadata:
  version: "1.1.0"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Reviews a component or screen against current B2C UI quality standards and
  proposes specific improvement variants. Two modes: /review scores without
  touching any files; /apply implements one named variant using existing tokens.
  Activate when: «/review», «/apply», «review the component», «score this screen»,
  «check UI quality», «rate the design», «apply variant», «ui review».
---

# ds-ui-review — v1.1.0

Reviews component or screen code against B2C UI quality standards from
`ui-trends-2026.md`. `/review` scores without touching files. `/apply` implements
one named variant from a prior review using existing semantic tokens only.

---

## Context

Read at the start of each session:
- `skills/_shared/ui-trends-2026.md` — scoring reference for trend relevance
- `skills/_shared/token-rules.md` — token constraint reference
- `skills/_shared/platforms.md` — platform implementation rules (MODE 2 only)

If a `_shared/` file is not found — warn explicitly:
«`_shared/<name>` not found, working from built-in rules» and continue.

---

## MODE 1 — /review

**Trigger:** user writes `/review` + component name or file path.

### Step 1. Read target

Locate and read the target component or screen file. Read direct dependencies
(token imports, shared style files) if needed for accurate scoring.
If the path is ambiguous, ask one clarifying question before proceeding.

### Step 2. Load references

Read `skills/_shared/ui-trends-2026.md` and `skills/_shared/token-rules.md`.

### Step 3. Score on 5 axes (1–10)

Evaluate the current implementation. Cite specific lines, values, or token names.

| Axis | What to evaluate |
|---|---|
| **Visual hierarchy** | Weight, size, contrast, and spacing rhythm signal importance correctly |
| **Motion intent** | Transitions are state-feedback, not decoration; spring vs. linear |
| **Density balance** | Information density vs. breathing room; neither crowded nor over-empty |
| **Brand coherence** | Consumer product character; not enterprise or utilitarian in feel |
| **Trend relevance** | Uses patterns from `ui-trends-2026.md`; avoids listed anti-patterns |

### Step 4. Generate improvement variants

Produce exactly 2–3 variants. Each variant requires:
- A short unique kebab-case name (e.g. `weight-shift`, `spring-nav`, `tonal-surface`)
- What changes — specific, observable, visually consequential
- Expected visual impact
- Token implications — existing semantic tokens only; if a new token would be
  required flag it: ⚠️ blocked — token `[name]` does not exist

**HARD CONSTRAINT:** `/review` must never modify existing files or propose new
tokens. Flag any improvement that requires a new token as blocked; do not
invent a token name and proceed. The only file `/review` may create is
`docs/preview-variants.html` — see Step 6.

### Step 5. Output

ALWAYS use this exact structure:

    ## /review [ComponentName]

    ### Scores

    | Axis             | Score | Evidence                                     |
    |------------------|-------|----------------------------------------------|
    | Visual hierarchy | X/10  | [specific line, value, or token]             |
    | Motion intent    | X/10  | [specific line, value, or token]             |
    | Density balance  | X/10  | [specific line, value, or token]             |
    | Brand coherence  | X/10  | [specific line, value, or token]             |
    | Trend relevance  | X/10  | [matched or violated pattern from ui-trends] |

    **Overall:** X/10 — [one-sentence summary of the dominant issue]

    ---

    ### Variant 1: [kebab-name]

    **What changes:** [specific and observable — cite token names or CSS props]
    **Visual impact:** [what the user will see differently]
    **Token implications:** [existing semantic tokens, or ⚠️ blocked — token `[name]` does not exist]
    **Benchmark reference:** [Product — specific observable pattern] — [one sentence why this pattern applies to the current target]

    ### Variant 2: [kebab-name]

    **What changes:** [specific and observable — cite token names or CSS props]
    **Visual impact:** [what the user will see differently]
    **Token implications:** [existing semantic tokens, or ⚠️ blocked — token `[name]` does not exist]
    **Benchmark reference:** [Product — specific observable pattern] — [one sentence why this pattern applies to the current target]

    ### Variant 3: [kebab-name] *(optional)*

    **What changes:** [specific and observable — cite token names or CSS props]
    **Visual impact:** [what the user will see differently]
    **Token implications:** [existing semantic tokens, or ⚠️ blocked — token `[name]` does not exist]
    **Benchmark reference:** [Product — specific observable pattern] — [one sentence why this pattern applies to the current target]

    ---

    *To apply: `/apply [variant name]`*

### Step 6. Generate preview

After outputting the review text, create `docs/preview-variants.html`.

Rules:
- First line of the file must be `<!-- DELETE AFTER REVIEW -->`
- Link `../assets/style.css` so all CSS token vars resolve live
- Render all proposed variants as static side-by-side visual mockups
- Each mockup: variant kebab-name as `<h3>`, then a minimal HTML
  demonstration of the visual element the variant describes
- Use only classes and token vars that already exist in `style.css`
  (including `.token-ref` if applied); do not introduce new CSS
- If a variant's class does not yet exist in `style.css`, render a
  placeholder card with a note: "requires /apply [class-name] first"
- Do not create any other file during `/review`

---

## MODE 2 — /apply

**Trigger:** user writes `/apply` + exact variant name from a previous `/review`.

### Step 1. Validate

Confirm the variant name matches one from the immediately preceding `/review`
in this session. If no prior `/review` exists, stop and ask the user to
run `/review [component]` first.

### Step 2. Load platform rules

Read `skills/_shared/platforms.md`.
Apply changes across Web, iOS, and Android if the component has platform-specific
files. If a platform is not relevant, skip it and state why explicitly.

### Step 3. Apply changes

Rules:
- Existing semantic tokens only — no hardcoded values, no new tokens
- Implement only the named variant — do not fold in other variants or bonus fixes
- If the change requires a token that does not exist, stop:
  ⚠️ cannot apply — token `[name]` does not exist. Run `/review` to see blocked variants.

### Step 4. Commit

```
git add [changed files]
git commit -m "ui(ds-ui-review): apply [variant-name] to [ComponentName]"
```

---

## Tone

- Scores are evidence-based: cite a specific line, value, or token — never generic
- Variants are actionable: name a visual consequence, not an intent
- No generic notes ("improve spacing", "add animation") — every note is specific
- `/review` mode: analytical, read-only, no suggestions beyond the variant list
- `/apply` mode: precise, minimal scope, no scope creep

---

## Versioning

- `patch` — wording corrections
- `minor` — new scoring axis, new variant field, graceful degradation update
- `major` — breaking change to output structure or mode semantics

## Changelog

- **1.1.0** — added `Benchmark reference` field to each variant output block;
  added Step 6 (auto-generate `docs/preview-variants.html` after /review);
  updated HARD CONSTRAINT to permit only `preview-variants.html` creation.
- **1.0.0** — initial release: /review + /apply, 5-axis scoring, variant format.
