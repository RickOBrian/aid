---
destination: skills/_shared/protocols/gates/
name: token-change-gate
metadata:
  version: "1.0.0"
  kind: protocol
  status: stable
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Анкета перед изменением токена или стиля и требования к changelog раздела токенов. Объединяет два прежних правила Cursor.
---


# Token Change Gate

> Статус: Stable · v1.0.0 · обновлено 2026-09-20

---

## 1. Анкета перед изменением токена или стиля

Когда пользователь просит добавить, изменить или удалить токен (любого
уровня — Core или Semantic, любой категории — color, space, typography)
или изменить визуальный стиль компонента/страницы — ПЕРЕД тем, как вносить
изменение в код, задай пользователю короткую анкету и жди ответа. Не начинай
правку до получения ответов.

Анкета (задавай все пункты одним сообщением, не по одному):

1. Артефакт: к какой единице версионирования относится изменение?
   (Colors/Core, Colors/Semantic, Spacing/Core, Spacing/Semantic,
   Radius/Core, Radius/Semantic, Typography/Core, Typography/Semantic,
   либо конкретный компонент — если неочевидно из контекста, предложи
   свой вариант и попроси подтвердить)

2. Тип изменения по правилам `skills/_shared/standards/semver-guide.md`:
   - PATCH — исправление, не меняющее структуру и поведение
     (неверный hex, опечатка, визуальный фикс без изменения API)
   - MINOR — новая функциональность без поломки существующего
     (новый токен, новый вариант, новое состояние, новый слот)
   - MAJOR — breaking change (токен удалён/переименован, изменена
     структура, изменён обязательный prop)
   Предложи свою оценку типа на основе описанного изменения и явно
   спроси подтверждение — не выбирай тип молча.

3. Нужно ли заводить запись в changelog для этого изменения?
   (да/нет — по умолчанию предлагай "да", если тип MINOR или MAJOR;
   для PATCH уточни явно, некоторые мелкие фиксы могут не требовать
   отдельной записи)

4. Если да — предложи **черновик** записи для release review в формате:
   { "kind": "added|changed|fixed|removed", "description": "..." }
   и **предложи** целевой SemVer по правилу (не применяй сразу):
   - PATCH: X.Y.Z → X.Y.(Z+1)
   - MINOR: X.Y.Z → X.(Y+1).0
   - MAJOR: X.Y.Z → (X+1).0.0
   Бери текущую версию артефакта из соответствующего
   `tokens/<collection>-changelog.json` (поле `currentVersion`) или из
   frontmatter соответствующего `*-guide.md` файла в `skills/_shared/`,
   если changelog для этого артефакта ещё не существует.

5. Проверь зависимости по правилам `skills/_shared/standards/semver-guide.md`: если изменяемый
   артефакт — Core-уровень, и это MAJOR — спроси, нужно ли синхронно
   поднять MAJOR у соответствующего Semantic-уровня (Core → Semantic
   зависимость). Аналогично для зависимостей компонент → компонент.

Только после того, как пользователь ответил на анкету:

- вноси изменение в код/токены/стили;
- создай pending change item в `changes/<id>/pending/` с ответами анкеты
  (artifact, proposed SemVer type, proposed changelog entry);
- **не** обновляй `tokens/<collection>-changelog.json`, `currentVersion` или
  `metadata.version` в `skills/_shared/` во время implementation.

Финальный SemVer, bump `currentVersion` и запись в release changelog —
только через **Release Gate** (`protocols/gates/release-gate.md`) с явным подтверждением
пользователя на release boundary. См. также `protocols/gates/product-context.md` и
`skills/_shared/standards/changelog-guide.md`.

Не применяй это правило к правкам, не относящимся к токенам/стилям
(рефакторинг кода, документация, исправление опечаток в тексте гайдов,
работа с changelog UI самого сайта).


---

## 2. Changelog раздела токенов

Web-портал `pages/aid-portal/` — каждый **merge-ready активный раздел
токенов** (страница существует и готовится к merge) обязан иметь **таблицу
changelog** внизу.

**Requirement** для merge-ready token sections. Hub-only или WIP sections без
`pageFile` в registry — changelog **не требуется** до открытия страницы.
Отсутствие changelog на merge-ready section — блокер для merge.

## 3. Автоматическое создание (обязательно)

Реестр: `pages/aid-portal/token-changelog-registry.json`

Скрипт: `pages/aid-portal/scripts/ensure-token-changelogs.mjs` (запускается в `prebuild`)

**При создании нового раздела:**

1. Добавить запись в `token-changelog-registry.json`:
   - `collectionName`, `artifact`, `pageFile` (имя `*Page.tsx`)
   - `bootstrap` — первая запись 1.0.0 (или дефолт создастся скриптом)
2. Создать `*Page.tsx` и data-файл с `collectionName`
3. Подключить на странице `ChangelogTable` + `loadTokenChangelog`
4. Запустить `npm run prebuild` — скрипт **сам создаст**
   `tokens/<collectionName>-changelog.json` в корне репо и в
   `pages/aid-portal/tokens/`, если файла ещё нет и `pageFile` существует

Changelog **не создаётся** для записей реестра, пока нет файла страницы —
это нормально для отложенных разделов на hub.

## 4. Что должно быть на странице

1. JSON: `tokens/<collectionName>-changelog.json` (канон) + зеркало в
   `pages/aid-portal/tokens/` (sync prebuild)
2. В data-файле раздела: `collectionName` = имя файла без <section>-changelog.json
3. Внизу страницы:
   - `loadTokenChangelog(collection.collectionName)`
   - `<ChangelogTable data={…} />`
   - `DS_CHANGELOG_TABLE_STYLE` в PAGE_STYLE
4. Таблицы данных — по `protocols/portal-table-standard.md` (table-страницы):
   - `DS_TOKEN_TABLE_STYLE` + классы `ds-token-table-wrap` / `ds-token-table`
   - layout-токены из `DS_PORTAL_LAYOUT_TOKENS` (`dsChangelogTable.ts`)
   - **`IconsPage.tsx` — grid UX; table-page checklist не применяется**
5. При изменении токенов — анкета `protocols/gates/token-change-gate.md`; pending item в
   `changes/<id>/pending/`; **не** bump `currentVersion` и **не** править release
   changelog во время implementation. SemVer, `currentVersion` и запись в
   `tokens/<collection>-changelog.json` — только через **Release Gate**
   (`protocols/gates/release-gate.md`) с явным подтверждением. См. `protocols/gates/product-context.md`,
   `skills/_shared/standards/changelog-guide.md`.

## 5. Реестр разделов

| Раздел | collectionName | pageFile | Changelog |
|--------|----------------|----------|-----------|
| Colors | `colors-semantic` | DriverColorTokensPage.tsx | ✅ |
| Icons | `icons` | IconsPage.tsx | ✅ |
| Typography | `typography-sem` | TypographyPage.tsx | ✅ |
| Shadows | `effects-shadows` | ShadowsPage.tsx | ✅ |
| Spacing | `spacing-sem` | SpacingPage.tsx | ✅ |
| Radius | `radius-sem` | RadiusPage.tsx | ✅ |

## 6. Чеклист для агента

- [ ] Запись в `token-changelog-registry.json`
- [ ] `collectionName` в data-файле раздела
- [ ] `ChangelogTable` на странице
- [ ] `DS_TOKEN_TABLE_STYLE` + `ds-token-table` для table-страниц (см.
      `protocols/portal-table-standard.md`; **не** для `IconsPage.tsx` — grid UX)
- [ ] `npm run prebuild` — bootstrap/mirror changelog-файлы на месте
- [ ] При правке токенов — pending item в `changes/<id>/pending/`; release
      changelog и `currentVersion` — только на Release Gate

---

## 7. Changelog

- **1.0.0** — 2026-09-20. Перенесено из .cursor/rules/token-style-changelog-gate.mdc + `skills/_shared/protocols/gates/token-change-gate.md`. Cursor объявлен легаси; правило переписано инструмент-нейтрально и живёт теперь там, где его читает рабочий агент. Прежний файл оставлен указателем.
