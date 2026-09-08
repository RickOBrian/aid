# Отчёт: гибкость правил к product-specific exceptions

**Дата:** 2026-08-16  
**Scope:** 6 pipeline gates + 2 portal governance rules + `RULES_OVERVIEW.md`  
**Mode:** read-only (файлы не изменялись)

---

## Сводка

| Правило | Гибкость | Блокирует отклонения? | Язык |
|---|---|---|---|
| `product-context.mdc` | ✅ частично | ⚠️ изоляция — жёстко; carve-outs есть | requirement + carve-out |
| `token-integrity.mdc` | ⚠️ | ❌ gap/hardcode без approval | mostly requirement |
| `component-gate.mdc` | ⚠️ | ❌ без questionnaire | requirement + prototype escape |
| `skills-import-gate.mdc` | ✅ | ⚠️ gaps блокируют | requirement + placeholders |
| `audit-gate.mdc` | ✅ | ✅ read-only, defer/ignore | severity, не blocker label |
| `release-gate.mdc` | ✅ (by design) | N/A на implementation | propose → confirm |
| `token-section-changelog.mdc` | ⚠️ | ❌ merge blocker без changelog | requirement + Icons exception |
| `token-style-changelog-gate.mdc` | ✅ | ⚠️ до анкеты — stop | questionnaire → pending |
| `RULES_OVERVIEW.md` | ⚠️ | отражает жёсткость gates | mostly requirement |

---

## По правилам

### 1. `product-context.mdc` — ✅ гибкий на product level

| Критерий | Оценка |
|---|---|
| Product-specific exceptions | ✅ блоки `For Driver:`, `relatedPrototypes` reference-only, historical products «unless explicit request» |
| Carve-out | ✅ явный: portal rules «must not force an immediate version bump» |
| Блокировка | ⚠️ «Do not start … until user confirms» — stop до подтверждения, не до соответствия стандарту |
| Альтернативы | ✅ pending items, propose path при `null`, отложенный release |

**Цитаты (гибкие):**

> «`token-section-changelog.mdc` and `ds-portal-table-standard.mdc` … **must not force an immediate version bump**»

> «treat a historical/reference product as active **without an explicit request**» (инверсия = explicit request разрешён)

**Пробел:** нет общего шаблона «documented product exception» — только точечные carve-outs.

---

### 2. `token-integrity.mdc` — ⚠️ строгий / ❌ блокирующий для gaps

| Критерий | Оценка |
|---|---|
| Product-specific exceptions | ⚠️ только Driver paths; **нет** path для naming/value deviation |
| Блокировка | ❌ «Do not proceed with implementation until the user resolves all gaps» |
| Альтернативы | ✅ semantic equivalent → ask; hardcode только с explicit approval; prefer reuse |

**Что при несоответствии naming/value standard:**

- **Токен не найден** → gap questionnaire → **stop** ✅ понятно
- **Токен найден, но имя/значение не по DS standard** → **не описано**. Есть только «prefer existing naming patterns» — recommendation, не exception flow
- **Value mismatch** (Figma vs `*Data.ts`) → audit находит «value inconsistencies», но token-integrity не даёт «approved deviation» path

**Блокирующие цитаты:**

> «Do not proceed with implementation until the user resolves all gaps.»

> «Never hardcode hex, rgb, hsl … unless: the user explicitly asks … or … explicitly approves hardcoding»

**Рекомендация vs требование:** «prefer», «avoid duplicating» — recommendation; «Never», «Do not proceed» — requirement без escape для «accepted legacy naming».

---

### 3. `component-gate.mdc` — ⚠️ строгий / ❌ без architecture exception flow

| Критерий | Оценка |
|---|---|
| Product-specific exceptions | ⚠️ `componentsRoot: null` → propose temporary location |
| Блокировка | ❌ «Do not proceed with implementation until the user resolves all questions» |
| Альтернативы | ✅ reuse vs create; prototype + hardcode; pending item; defer until token gaps |

**Что при несоответствии naming/architecture (Role+Entity, Item suffix и т.д.):**

- Proposal questionnaire покрывает **новый** компонент
- **Нет** поля `standardDeviation`, `approvedException`, `temporaryWorkaround`
- **Нет** языка «recommendation» для architecture — только confirm name/path

**Escape hatch (единственный явный):**

> «Do not create a component while required tokens are unresolved, **unless** the user explicitly asks to create a prototype with hardcoded values»

**Блокирующая цитата:**

> «Do not proceed with implementation until the user resolves all questions.»

---

### 4. `skills-import-gate.mdc` — ✅ относительно гибкий

| Критерий | Оценка |
|---|---|
| Product-specific exceptions | ✅ product-scoped path «confirmed by the user» |
| Блокировка | ⚠️ gaps блокируют, но есть placeholders escape |
| Альтернативы | ✅ pending item; import with placeholders + resolve later |

**Гибкая цитата:**

> «Do not import skills while required tokens are unresolved, **unless** the user explicitly asks to import with placeholders»

---

### 5. `audit-gate.mdc` — ✅ гибкий для классификации, ⚠️ без blocker/recommendation labels

| Критерий | Оценка |
|---|---|
| Product-specific exceptions | ⚠️ Driver paths; нет «accepted exception registry» |
| Блокировка | ✅ audit read-only — **не блокирует** implementation |
| Альтернативы | ✅ defer, ignore, pending items для selected findings |
| Severity | ✅ `high` / `medium` / `low` + `confidence` |

**Классификация отклонений:**

- `category`: unused | missing | naming | value | drift | other
- **Нет** явных меток: `blocker` vs `recommendation` vs `accepted-exception`
- **Нет** guidance: «naming inconsistency = recommendation unless user marks blocker»

**Гибкие цитаты:**

> «which findings to fix now; **which to defer or ignore**»

> «Do not directly change token files … as part of the audit flow»

**Пробел:** auditor не может формально зафиксировать «это осознанное product exception, не fix».

---

### 6. `release-gate.mdc` — ✅ гибкий by design (на boundary)

| Критерий | Оценка |
|---|---|
| Exceptions | N/A — release не про стандарты, а про grouping pending |
| Блокировка | Только без explicit user confirmation — корректно |
| Альтернативы | ✅ propose SemVer/changelog → user adjusts |

**Цитата:**

> «Do not finalize SemVer or changelog **without explicit user confirmation**»

Жёсткость здесь уместна — это финальный gate, не место для workaround.

---

### 7. `token-section-changelog.mdc` — ⚠️ с одним явным exception

| Критерий | Оценка |
|---|---|
| Product-specific exceptions | ✅ **IconsPage grid UX** — table checklist не применяется |
| Блокировка | ❌ «Отсутствие changelog — **блокer для merge**» |
| Альтернативы | ✅ pending → Release Gate (после недавнего выравнивания) |

**Гибкая цитата:**

> «**`IconsPage.tsx` — grid UX; table-page checklist не применяется**»

**Строгая цитата:**

> «каждый активный раздел … **обязан** иметь таблицу changelog … **блокer для merge**»

Нет path для «временно без ChangelogTable» или «hub-only preview section».

---

### 8. `token-style-changelog-gate.mdc` — ✅ гибкий после выравнивания

| Критерий | Оценка |
|---|---|
| Exceptions | ✅ scope exclusion (docs, refactor, changelog UI) |
| Блокировка | ⚠️ stop до анкеты — gate behavior, не standard deviation |
| Альтернативы | ✅ черновик для release review; pending item; no immediate bump |

**Гибкие цитаты:**

> «предложи **черновик** … (**не применяй сразу**)»

> «**не** обновляй … во время implementation»

**Строгая (уместная):**

> «Не начинай правку до получения ответов» — questionnaire gate, не naming standard.

---

### 9. `RULES_OVERVIEW.md` — ⚠️ отражает жёсткость, слабо — exceptions

- Portal governance упоминает IconsPage exception ✅
- Token Integrity: «**реализация останавливается**» — без mention approved deviations
- Audit: severity в gate, но не в overview
- **Нет** секции «Exception handling» / «Recommendation vs requirement»

---

## Матрица: что уже гибко ✅

1. **Product carve-outs** — `product-context.mdc` (portal bump, historical products by request)
2. **Pending workflow** — все gates + portal rules → `changes/<id>/pending/` → Release Gate
3. **Prototype escapes** — token hardcode, component prototype, skills placeholders
4. **Semantic reuse** — token/component lookup → propose alternative → user chooses
5. **Audit defer/ignore** — не блокирует код
6. **IconsPage grid** — portal governance explicit exception
7. **Release propose/confirm** — adjust SemVer/changelog before finalize

---

## Что слишком строго ⚠️

| Область | Проблема |
|---|---|
| Token naming/value deviation | Нет «approved exception» при существующем токене |
| Component architecture deviation | Proposal не включает standard exception / temporary note |
| Audit taxonomy | severity ≠ blocker/recommendation/accepted-exception |
| Portal merge policy | ChangelogTable — absolute blocker, без preview/hub exception |
| RULES_OVERVIEW | Не документирует philosophy exceptions |

---

## Что блокирующее ❌ (by design, но без escape для documented exceptions)

| Правило | Блокер |
|---|---|
| `token-integrity.mdc` | Any unresolved gap → stop |
| `component-gate.mdc` | Unresolved questionnaire → stop |
| `token-section-changelog.mdc` | No changelog on active section → merge blocker |
| Product isolation | Cross-product mix → «Never» (корректно, без exception path кроме explicit) |

---

## Цитаты, которые стоит изменить (при следующем обновлении)

### `token-integrity.mdc`

**Сейчас:**

> «Do not proceed with implementation until the user resolves all gaps.»

**Предложение:** добавить после блока:

> If the user explicitly approves a **documented exception** (reuse non-standard name, keep legacy value, temporary hardcode), record it in a pending item with `exceptionType`, `reason`, `expiry` or `reviewAtRelease`; proceed only after confirmation.

**Сейчас:** нет секции про naming/value drift при **найденном** токене.

**Предложение:** новая секция «Standard deviation» — recommend fix → user may choose: fix now | defer | accept as product exception.

---

### `component-gate.mdc`

**Сейчас:**

> «Do not proceed with implementation until the user resolves all questions.»

**Предложение:** в questionnaire добавить:

> `- confirm architecture/naming standard compliance or document an approved exception`

**Сейчас:** proposal fields без `standardDeviation`.

**Предложение:** поле `namingException` / `architectureNote` в pending item.

---

### `audit-gate.mdc`

**Сейчас:**

> «group by severity (`high`, `medium`, `low`)»

**Предложение:** добавить `disposition`: `blocker` | `recommendation` | `accepted-exception` | `deferred`

**Сейчас:** нет guidance для naming/value findings.

**Предложение:**

> Naming/value drift → default **recommendation**; **blocker** only if breaks token lookup, release, or user marks as blocker.

---

### `token-section-changelog.mdc`

**Сейчас:**

> «Отсутствие changelog — блокer для merge.»

**Предложение:**

> «**Requirement** for merge-ready token sections. Hub-only or WIP sections without `pageFile` — changelog not required until page opens.»

---

### `RULES_OVERVIEW.md`

**Добавить** (новая подсекция, не меняя gates):

> **Recommendation vs requirement:** gates use questionnaires and pending items; hard stops apply to product isolation, unresolved gaps, and release without approval. Documented product exceptions go to pending + optional audit `accepted-exception`.

---

## Рекомендации

### Какие правила обновить (приоритет)

1. **`token-integrity.mdc`** — high: standard deviation flow (found token, non-standard name/value)
2. **`component-gate.mdc`** — high: naming/architecture exception + component description note
3. **`audit-gate.mdc`** — medium: disposition taxonomy (blocker vs recommendation vs accepted-exception)
4. **`token-section-changelog.mdc`** — low: soften merge blocker для WIP/hub-only
5. **`RULES_OVERVIEW.md`** — medium: секция Exception philosophy (overview only)

`product-context.mdc`, `release-gate.mdc`, `token-style-changelog-gate.mdc` — **менять не обязательно**; уже поддерживают pending + explicit approval.

### Язык: recommendation vs requirement

| Тип | Формулировка | Когда |
|---|---|---|
| **Requirement** | «must», «обязан», «блокer», «Never» | product isolation, unresolved gaps без approval, release без OK |
| **Recommendation** | «prefer», «should», «рекомендуется» | naming patterns, reuse, architecture Role+Entity |
| **Exception path** | «unless user explicitly approves documented exception» | legacy naming, grid UX, prototype hardcode, placeholders |

Шаблон для правил:

> **Recommend** [standard]. **Require** user confirmation before deviation. **Record** exception in `changes/<id>/pending/` with reason; **classify** in audit as `accepted-exception`.

### Как документировать temporary exceptions в component descriptions

Предложенный минимальный формат (pending item или component spec frontmatter):

```yaml
exceptions:
  - id: btn-legacy-name
    type: naming | architecture | token | layout
    standard: "Role+Entity → ButtonText"
    actual: "Button"
    reason: "Figma library legacy; rename in v2"
    status: temporary | accepted
    reviewAt: release | next-major
    pendingRef: changes/driver/pending/button-naming-exception.json
```

В тексте component description / spec:

> **Standard deviation (accepted):** Component name `Button` deviates from Role+Entity (`ButtonText`). Approved temporary exception; tracked in `changes/driver/pending/…`. Review at next component release.

Audit finding для такого case:

> `disposition: accepted-exception`, `severity: low`, `impact: documentation only`

---

## Вывод

Pipeline **уже гибок** в зонах: product context, pending → release, prototype/placeholder escapes, audit defer/ignore, IconsPage grid exception.

**Не хватает** формального слоя для **осознанных отклонений от naming/value/architecture standards**, когда артефакт существует, но не соответствует DS guide. Сейчас агент видит либо «prefer standard», либо «stop until resolved» — без среднего пути «documented exception + proceed».
