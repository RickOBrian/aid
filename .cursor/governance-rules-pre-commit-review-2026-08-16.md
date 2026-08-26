# Отчёт: governance rules перед коммитом

**Дата:** 2026-08-16  
**Scope:** `.cursor/rules/ds-portal-table-standard.mdc`, `token-section-changelog.mdc`, `token-style-changelog-gate.mdc`  
**Mode:** read-only review (файлы не изменялись, коммит/push не выполнялись)

---

## Статус по файлам

| Файл | Вердикт | Комментарий |
|---|---|---|
| `ds-portal-table-standard.mdc` | ⚠️ minor issues | Ссылки и структура в целом верны; мелкие пробелы в покрытии |
| `token-section-changelog.mdc` | ⚠️ minor issues | Реестр и чеклист совпадают с порталом; есть устаревший текст и неоднозначный путь |
| `token-style-changelog-gate.mdc` | ⚠️ minor issues | Логика анкеты согласована с semver/changelog; есть расхождение с release-flow |

**Blocking issues:** нет — коммит правил не заблокирован.

---

## 1. Противоречия с 6 pipeline gates

### Существенное расхождение (не blocking, но зафиксировать)

| Источник | Что требует |
|---|---|
| `token-style-changelog-gate.mdc` | После анкеты сразу обновлять `tokens/<collection>-changelog.json` и `currentVersion` |
| `token-section-changelog.mdc` (чеклист) | «При правке токенов — обновлён JSON + currentVersion» |
| `product-context.mdc` | Pending items в `changes/<id>/pending/`; **не финализировать** SemVer/changelog при implementation; `token-section-changelog.mdc` **must not force an immediate version bump** |
| `release-gate.mdc` | SemVer + changelog только на release boundary с явным OK |

`product-context.mdc` уже содержит carve-out для portal rules, но текст `token-style-changelog-gate` и чеклист `token-section-changelog` всё ещё описывают немедленный bump. На практике агент может получить конфликтующие инструкции.

### Остальное — без конфликтов

- `ds-portal-table-standard` — UI-стандарт портала, не дублирует product/token/release gates
- `token-section-changelog` — дополняет Token Integrity / Release (registry, `ChangelogTable`, prebuild), не подменяет Product Gate
- `token-style-changelog-gate` — pre-implementation questionnaire, совместима с Audit Gate (read-only) и Skills Import

---

## 2. Ссылки на несуществующие файлы

| Ссылка в правиле | Факт | Статус |
|---|---|---|
| `dsChangelogTable.ts`, `ChangelogTable.tsx`, `loadTokenChangelog.ts`, `DsPageHeader.tsx` | Есть в `pages/driver-color-tokens/` | ✅ |
| `token-changelog-registry.json` | Есть | ✅ |
| `scripts/ensure-token-changelogs.mjs` | Фактически: `pages/driver-color-tokens/scripts/ensure-token-changelogs.mjs` | ⚠️ путь без префикса портала — двусмысленно |
| `semver-guide.md` | Фактически: `docs/semver-guide.md` | ⚠️ нет полного пути |
| `tokens/<collection>-changelog.json` | 6 файлов на месте | ✅ |
| Перекрёстные `.mdc` ссылки | Все три файла существуют (untracked) | ✅ |

---

## 3. Соответствие фактической структуре портала

| Проверка | Результат |
|---|---|
| 6 разделов в реестре (`Colors`, `Icons`, `Typography`, `Shadows`, `Spacing`, `Radius`) | ✅ совпадает с `token-changelog-registry.json` и страницами |
| `ChangelogTable` + `loadTokenChangelog` на страницах | ✅ все 6 `*Page.tsx` |
| Классы changelog: `ds-token-table dctp-table dctp-changelog-table` | ✅ в `ChangelogTable.tsx` |
| `DS_TOKEN_TABLE_STYLE` + `ds-token-table` | ✅ на 5 table-страницах; `IconsPage` — grid UX, без token-table (ожидаемо) |
| `DsPageHeader` | ✅ на всех 6 страницах |
| `prebuild` → `ensure-token-changelogs.mjs` | ✅ в `pages/driver-color-tokens/package.json` |
| Эталонные страницы в `ds-portal-table-standard` | ⚠️ 5 из 6; `IconsPage` не указан (другой layout) |
| «Отложенные Spacing, Radius» в `token-section-changelog` | ⚠️ устарело — разделы уже активны с 2026-08-16 |

---

## 4. RULES_OVERVIEW.md

**Упоминания:** ни один из трёх `.mdc` не упомянут (grep — 0 совпадений).

**Audit 2026-08-15:** секция Gates фиксирует только 6 pipeline gates; governance rules не перечислены.

**Нужно ли добавить:** да, но **отдельным коммитом** — по `RULES_OVERVIEW.md` Maintenance («обновить overview при добавлении правила») и по `DS_PIPELINE_CONTEXT.md` Constraints («правила и overview — отдельно»).

Рекомендуемая секция: **Portal governance** (не расширять список «6 gates», а добавить подраздел с `alwaysApply` и scope).

---

## 5. Рекомендация по коммиту

**Коммитить все 3 файла одним коммитом** — они взаимосвязаны (cross-ref, единый portal governance layer).

Пример сообщения:

```
chore(rules): add Driver portal governance rules
```

### Не blocking, но после коммита правил

1. Отдельный коммит — обновить `RULES_OVERVIEW.md` (Portal governance subsection)
2. Позже — выровнять текст `token-style-changelog-gate` / `token-section-changelog` с `product-context` (pending vs immediate bump)
3. Поправить пути: `docs/semver-guide.md`, `pages/driver-color-tokens/scripts/ensure-token-changelogs.mjs`
4. Убрать «отложенный Spacing, Radius» в `token-section-changelog`

---

## 6. git status --short (на момент проверки)

```
?? .cursor/2driver-portal-commit-plan-2026-08-15.md
?? .cursor/3driver-portal-commit-validation-2026-08-15.md
?? .cursor/audit-2026-08-16-ds-pipeline-final.md
?? .cursor/mcp.json
?? .cursor/rules/ds-portal-table-standard.mdc
?? .cursor/rules/token-section-changelog.mdc
?? .cursor/rules/token-style-changelog-gate.mdc
?? docs/ds-infrastructure-plan-audit.md
?? docs/product-registry-audit.md
```
