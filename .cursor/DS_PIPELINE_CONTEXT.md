# DS Pipeline Context

## Current state (as of 2026-08-15)

- 6 gates committed: product-context, token-integrity, component-gate, skills-import-gate, audit-gate, release-gate.
- RULES_OVERVIEW.md согласован с фактической структурой репозитория (data.ts, *-sem-changelog.json).
- Active продукт: driver (единственный в pipeline).
- Driver token sources: data.ts (color), typographyData.ts, spacingData.ts, radiusData.ts, shadowsData.ts, iconsData.ts.
- Changelogs: tokens/colors-semantic-changelog.json, typography-sem-changelog.json, spacing-sem-changelog.json, radius-sem-changelog.json, effects-shadows-changelog.json, icons-changelog.json.
- Release queues: changes/driver/pending/, changes/driver/released/ (пустые).
- Skills (_shared): 22 гайда, включая token-rules.md, platforms.md, детальные color/typography/space guides, component architecture/audit/migration.
- Figma reference: src/pages/FigmaStyles/ (не source of truth).

## Architectural decisions

- Product Gate — обязательный первый шаг для любой работы с Figma, токенами, компонентами, skills, changelog, release.
- Token Integrity — lookup в *Data.ts/data.ts, запрет хардкода без явного разрешения, token gaps → единая анкета.
- Component Gate — componentsRoot: null для Driver, создание компонентов только с явным подтверждением path и coupling с токенами.
- Skills Import — дефолт skills/_shared/, product-scoped skills только с подтверждением.
- Audit — read-only, consolidated report, fixes → pending items, без прямых правок артефактов.
- Release — группировка pending changes, SemVer + changelog только с явным подтверждением, pending → released/, commit/push через git-push.mdc.
- Naming — ориентироваться на фактические имена в репозитории (data.ts, *-sem-changelog.json), не на абстрактный план.

## Pending work (priorities)

Wave 1 (component pipeline core):
- skills/_shared/component-standards.md (new)
- skills/_shared/figma-import-guide.md (new)
- skills/_shared/changelog-guide.md (new)

Wave 2 (naming, versions, accessibility):
- skills/_shared/naming-conventions.md (new)
- skills/_shared/versioning-strategy.md (new)
- skills/_shared/accessibility.md (new)

Wave 3 (testing, Presentbook):
- skills/_shared/testing-strategy.md (new)
- skills/_shared/presentbook-guide.md (new)

Optional:
- .cursor/rules/push-sync-gate.mdc (future rule для post-release sync).

## Constraints

- Не создавать компоненты до явного определения componentsRoot и подтверждения path.
- Не менять token values в рамках audit/release gates.
- Не коммить несколько файлов в одном коммите (правила, overview, skills — отдельно).
- При добавлении новых продуктов обновлять RULES_OVERVIEW.md и этот файл.

## Maintenance: periodic rules audit

- Проводить аудит правил и контекста не реже чем раз в 2 недели или при добавлении:
  - нового gate;
  - нового продукта;
  - существенного изменения структуры токенов/компонентов.
- На аудите проверять:
  - соответствие RULES_OVERVIEW.md и DS_PIPELINE_CONTEXT.md фактической структуре репозитория;
  - отсутствие противоречий между gates;
  - актуальность списков missing/extra файлов;
  - приоритеты pending work.
- Результаты аудита фиксировать в отдельном MD-файле (например `.cursor/audit-YYYY-MM-DD.md`) и при необходимости обновлять этот контекст.

## How to use this file

- Это точка входа для любого нового контекста (включая Cursor).
- Перед генерацией новых файлов или правкой gates — перечитывать этот файл и RULES_OVERVIEW.md.
- При расхождениях между планом и репозиторием — ориентироваться на этот файл.
