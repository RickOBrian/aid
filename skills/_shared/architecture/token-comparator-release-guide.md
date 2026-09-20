---
destination: skills/_shared/architecture/
name: token-comparator-release-guide
metadata:
  version: "1.4.0"
  kind: architecture
  owner: design-system-team
  status: stable
  updated: "2026-09-18"
description: >
  Канонический контекст хранения, сборки, публикации и распространения Figma-плагина
  Token Comparator. Использовать при подготовке GitHub Release, stable download alias,
  Presentbook Tools page и следующих версий плагина.
---

# Token Comparator — Release & Distribution Guide

> **Статус: active · последняя опубликованная версия v1.1.0**
>
> Номера `v0.1.x` в разделах 2–10 — исторические, до перенумерации
> 2026-09-18 (раздел 11).
>
> Source code Token Comparator хранится в `RickOBrian/aid`. ZIP-артефакты
> распространяются через GitHub Releases. Presentbook служит designer-facing
> витриной в разделе Tools и ведёт на постоянный URL последнего опубликованного
> ZIP. Обычный push в `main` никогда не обновляет доступный пользователю ZIP.

---

## 0. Контракт работы

### Роли

- **Principal Designer** принимает решения о версии, публикации и rollout.
- **Perplexity** хранит release-контекст, фиксирует риски, готовит планы и
  готовые промты для Cursor.
- **Cursor** выполняет проверку, сборку, Git-операции, GitHub Release операции
  и изменения Presentbook только после явного подтверждения Principal Designer.

### Границы операций

Cursor не выполняет без явного согласия:

```text
commit / push / PR / merge / tag / GitHub Release
upload или delete release asset
stash pop/drop
worktree remove
```

Для read-only разведки, git-отчётов и механических задач достаточно Composer 2.5
Standard. Frontier-модель нужна только при реальной сложной архитектурной
неопределённости или высокой цене ошибки.

---

## 1. Принятая архитектура

```text
RickOBrian/aid
├── tools/figma-token-comparator/          ← source code плагина
│   ├── manifest.json
│   ├── src/
│   ├── server/
│   ├── dist/                              ← generated build output
│   ├── README-install.txt
│   └── scripts/release.mjs
│
├── Git tag vX.Y.Z
└── GitHub Release vX.Y.Z
    ├── token-comparator-vX.Y.Z.zip        ← immutable versioned artifact
    └── token-comparator.zip               ← stable latest alias

Presentbook
└── /tools/token-comparator                ← designer-facing Tools page
    └── primary CTA → stable latest alias
```

| Система | Роль | Не использовать для |
|---|---|---|
| Git repository | Source of truth исходников, manifest, scripts, release metadata, tags | Хранения ZIP в Git history или `public/` |
| GitHub Releases | Версионированные ZIP, immutable history, rollback | Ручного редактирования исходников |
| Presentbook | Витрина: назначение, install guide, кнопка скачивания | Хранения ZIP, secrets, GitHub config |
| `aid-registry-api` | Backend proposal flow | Release artifacts |

---

## 2. Token Comparator v0.1.0

### Release record

| Поле | Факт |
|---|---|
| Репозиторий | `RickOBrian/aid` |
| Pull request | #15 — `feat(comparator): Token Comparator v0.1.0 UI + packaging` |
| Метод merge | Обычный merge commit, без squash/rebase |
| Merge commit | `89bbf35c6754c1c52f7df21dddd0454da1d06c87` |
| Tag | `v0.1.0`, annotated, указывает на `89bbf35` |
| Release | GitHub Release `v0.1.0` опубликован |
| Figma smoke test | Пройден вручную на финальной сборке из `main @ 89bbf35` |

### Commits в релизе

| Commit | Назначение |
|---|---|
| `75b1b3d` | `feat(comparator): polish propose flow and footer layout` |
| `7a6c85a` | `chore(comparator): add reproducible v0.1.0 packaging` |
| `89bbf35` | Merge PR #15 в `main` |

### Recovery context

UI-изменения были найдены не в отдельной ветке, а в `stash@{1}`:

```text
stash label: api work in progress
created: 2026-09-08 12:09
```

В отдельном worktree от `origin/main` они были восстановлены через `git apply`,
а не `stash pop`, и закоммичены в `75b1b3d`.

Recovery scope:

```text
tools/figma-token-comparator/src/code.ts
tools/figma-token-comparator/src/comparators/types.ts
tools/figma-token-comparator/src/messages.ts
tools/figma-token-comparator/src/ui.html
tools/figma-token-comparator/src/ui.ts
```

Функционально включены visual polish, propose modal и перенос Propose action в
footer. Проверенные markers:

```text
ds-table-footer__start
tc-propose-modal__toolbar
```

### Packaging contract

Release packaging добавлен commit `7a6c85a`:

```text
tools/figma-token-comparator/package.json          ← npm run release:pack
tools/figma-token-comparator/README-install.txt
tools/figma-token-comparator/scripts/release.mjs
```

ZIP v0.1.0 содержит только:

```text
token-comparator/manifest.json
token-comparator/README-install.txt
token-comparator/dist/code.js
token-comparator/dist/ui.html
```

ZIP не включает:

```text
node_modules/
src/
server/
.git/
.env / .env.local
credentials / PLUGIN_SHARED_SECRET
.DS_Store
local logs, caches, temporary artifacts
```

Проверенный SHA-256 финального v0.1.0 ZIP:

```text
b6f0beda8f9a17acdf9fd94b6cbfac579ab986d44877562554892963300c3689
```

### Установка в Figma Desktop

1. Скачать ZIP.
2. Распаковать архив в новую папку, не поверх старой сборки.
3. В Figma Desktop открыть `Plugins → Development → Import plugin from manifest…`.
4. Выбрать `token-comparator/manifest.json` внутри распакованного ZIP.
5. Для обновления импортировать manifest из новой распакованной версии.

ZIP нельзя импортировать в Figma напрямую. Перед проверкой новой сборки следует
удалить/отключить старую development plugin registration, чтобы не тестировать
устаревший manifest path.

---

## 3. Download URLs и asset policy

### Stable URL для Presentbook

Кнопка Presentbook должна использовать **ровно один** URL:

```text
https://github.com/RickOBrian/aid/releases/latest/download/token-comparator.zip
```

Постоянное имя alias asset:

```text
token-comparator.zip
```

Не использовать в UI:

```text
token-comparator-latest.zip
token-comparator-v0.1.0.zip
ссылку на исходники или tree branch
ссылку на конкретный commit
```

### Versioned URL

Каждый релиз дополнительно имеет immutable asset:

```text
token-comparator-vX.Y.Z.zip
```

Пример:

```text
https://github.com/RickOBrian/aid/releases/download/v0.1.0/token-comparator-v0.1.0.zip
```

Versioned URL применяется для аудита, rollback, конкретных release notes и
воспроизводимости. Он не является primary CTA в Presentbook.

### Mandatory dual asset rule

Каждый будущий GitHub Release должен публиковать два байт-в-байт идентичных ZIP:

| Asset | Назначение |
|---|---|
| `token-comparator-vX.Y.Z.zip` | Immutable versioned artifact |
| `token-comparator.zip` | Stable alias для latest published Release |

**Push в main не обновляет alias.** Alias обновляется только после явной
публикации нового GitHub Release. Это защищает дизайнеров от непроверенного
кода, который мог попасть в main между релизами.

### Текущий незакрытый v0.1.0 gate

После первоначальной публикации v0.1.0 был добавлен/планировался alias с именем
`token-comparator-latest.zip`, но принято новое публичное имя: `token-comparator.zip`.

До реализации Presentbook CTA нужно получить фактический Cursor-отчёт, что:

1. В Release `v0.1.0` существует `token-comparator-v0.1.0.zip`.
2. В Release `v0.1.0` существует `token-comparator.zip`.
3. Alias и versioned asset имеют SHA-256
   `b6f0beda8f9a17acdf9fd94b6cbfac579ab986d44877562554892963300c3689`.
4. URL `.../releases/latest/download/token-comparator.zip` отвечает redirect/200,
   а не 404.
5. Старый alias `token-comparator-latest.zip`, если был создан, удалён или явно
   оставлен по отдельному решению. Он не используется в Presentbook.

Не считать этот gate пройденным только по плану или по ожидаемому результату.

---

## 4. Release workflow

### Trigger

Release начинается только явной командой Principal Designer, например:

```text
Опубликуй Token Comparator v0.1.1
```

Это означает подготовку и публикацию версии для дизайнеров, а не просто
локальный `npm run build`.

### Preconditions

До любых write operations Cursor обязан:

1. Уточнить SemVer target и причину версии — по `semver-guide.md`, раздел
   «Инструменты». Проставить версию в `package.json` и дату в
   `src/lib/changelog.ts`: `test/changelog.test.ts` не пропустит версию без
   записи или без даты.
2. Подтвердить, что release code уже в `main`, либо подготовить отдельный PR.
3. Не выпускать из WIP, Preview или случайной feature branch.
4. Проверить отсутствие существующего tag/release с тем же номером.
5. Проверить чистоту выбранного release worktree.
6. Изолировать несвязанный WIP, если основной worktree грязный.

### Verification gate

На выбранном release commit:

```text
cd tools/figma-token-comparator
npm ci
npm run typecheck
npm run build
npm run release:pack
```

Обязательно подтвердить:

- manifest paths существуют в staged ZIP;
- ZIP соответствует allowlist;
- forbidden files и secrets отсутствуют;
- реальные секреты не содержатся в dist/code.js, `dist/ui.html` или ZIP;
- уникальные markers ожидаемых UI изменений находятся в ZIP;
- Figma Desktop smoke test пройден на именно этом ZIP;
- если используется main, build берётся из актуального merge commit, а не из
  устаревшего локального worktree.

Vercel checks не заменяют typecheck/build/package Figma plugin: это другой
build target.

### Publication sequence

После явного approval:

1. Собрать `token-comparator-vX.Y.Z.zip` из проверенного commit.
2. Создать байт-идентичную копию `token-comparator.zip`.
3. Создать annotated tag `vX.Y.Z` на проверенном merge commit.
4. Push tag.
5. Создать GitHub Release и upload **обоих** assets.
6. Проверить versioned URL и stable alias URL.
7. Только затем публиковать/мержить Presentbook CTA или metadata, если они
   зависят от нового asset.

Если Presentbook CTA уже опубликована, новый stable alias должен быть доступен
сразу после GitHub Release publication.

### Rollback

- Не удалять immutable versioned artifact и tag как способ rollback.
- Исправлять через новый semver release.
- При необходимости новый релиз может нести последнюю проверенную сборку с
  более высоким номером.
- После rollback/release проверить stable alias и Presentbook CTA.

---

## 5. Presentbook Tools integration

### Целевой маршрут

```text
/tools
/tools/token-comparator
```

При product prefix ожидаются также варианты:

```text
/driver/tools
/driver/tools/token-comparator
```

Presentbook использует client-side routing через `window.location.pathname`, не
React Router.

### Текущий WIP и изоляция

Основной worktree ранее был в состоянии:

```text
/Users/desexpert/Projects/aid
branch: main @ 33dc4c3
origin/main: 89bbf35
```

В нём находятся незакоммиченные Presentbook Tools изменения:

```text
pages/aid-portal/App.tsx                 modified
pages/aid-portal/hubData.ts              modified
pages/aid-portal/ToolsHubPage.tsx        untracked
pages/aid-portal/TokenComparatorPluginPage.tsx  untracked
pages/aid-portal/tools-registry.json     untracked
```

Они не находятся в `origin/main`. Локальная `presentbook/icons` устарела;
`origin/presentbook/icons` не существует. Для реализации нельзя использовать её
как base branch.

Текущий WIP изолирован в patch вне репозитория:

```text
/tmp/aid-pr-a-presentbook-tools.patch
```

Patch содержит **только**:

```text
pages/aid-portal/App.tsx
pages/aid-portal/hubData.ts
pages/aid-portal/ToolsHubPage.tsx
pages/aid-portal/TokenComparatorPluginPage.tsx
pages/aid-portal/tools-registry.json
```

Patch не содержит `tools/figma-token-comparator/**`. Изменения tracked files
между base `33dc4c3` и `origin/main @ 89bbf35` отсутствуют; ожидается clean
apply на свежий worktree от `origin/main`, но перед apply обязателен
`git apply --check`.

### Scope будущего Presentbook PR

Один целостный UI PR:

```text
feat(presentbook): add Tools hub and Token Comparator download
```

Создаётся в новой чистой ветке от `origin/main @ 89bbf35` (например,
`feat/presentbook-tools-download`) и содержит только пять Tools files.

Не включать:

```text
tools/figma-token-comparator/package.json
tools/figma-token-comparator/README-install.txt
tools/figma-token-comparator/scripts/release.mjs
```

Эти локальные файлы в основном worktree являются дубликатами уже смерженного
packaging scope и не должны попасть в Presentbook PR.

### Token Comparator page contract

Страница `TokenComparatorPluginPage` не должна оставаться placeholder.

Primary CTA:

```text
visible label: Скачать плагин для Figma
href: tools-registry.json.downloadUrl
target: _blank
rel: noreferrer noopener
```

Рекомендуемый optional `aria-label`:

```text
Скачать Token Comparator для Figma Desktop (ZIP, откроется в новой вкладке)
```

`downloadUrl` должен быть единственным source of truth:

```json
{
  "downloadUrl": "https://github.com/RickOBrian/aid/releases/latest/download/token-comparator.zip",
  "downloadLabel": "Скачать плагин для Figma"
}
```

Не добавлять без отдельной продуктовой потребности:

```text
releaseVersion
zipSha256
githubRepoUrl
sourcePath as visible link
```

На странице не хардкодить `v0.1.0` или future SemVer. Рекомендуемый текст:

```text
Скачивается последняя опубликованная версия плагина.
```

Install block:

1. Скачайте ZIP и распакуйте архив.
2. В Figma Desktop откройте `Plugins → Development → Import plugin from manifest…`.
3. Выберите `token-comparator/manifest.json` в распакованной папке.
4. Для обновления повторите импорт manifest из новой распакованной версии.

Не добавлять:

- ссылку на source tree;
- client-side fetch к GitHub API;
- GitHub secrets, API URLs, file/node IDs;
- hardcoded hex colors.

Использовать существующие portal accent/layout patterns, `ProductAccentScope` и
действующий focus-visible pattern для button-like external CTA.

### Merge dependency

Нельзя merge/deploy Presentbook CTA, пока stable URL с
`token-comparator.zip` возвращает 404. Сначала завершить alias gate (§3), затем
реализовать и мержить Tools page.

### Post-merge checks

- `/tools` открывает Tools hub.
- `/tools/token-comparator` открывает Token Comparator page.
- Карточка ведёт на корректный route.
- CTA href точно равен stable URL с `token-comparator.zip`.
- CTA содержит `target="_blank"` и `rel="noreferrer noopener"`.
- В UI/href нет hardcoded SemVer.
- Нет source link или browser-side GitHub API request.
- Нет новых hardcoded hex colors.
- `curl -I -L` stable URL не возвращает 404.
- Portal build и релевантные type checks проходят.

---

## 6. Git safety и cleanup

### Main worktree

Не выполнять `git pull`, checkout или reset в грязном основном worktree, пока
Presentbook WIP и локальные packaging duplicates не изолированы patch/commit или
не обработаны явным решением. Не force-push без анализа divergence и явного
approval.

### Recovery stash

`stash@{1}` содержит исходный recovery source и должен был сохраняться до:

1. merge PR #15;
2. подтверждения commits `75b1b3d`/`7a6c85a` в `origin/main`;
3. tag `v0.1.0`;
4. успешного final Figma smoke test;
5. опубликованного GitHub Release.

Эти release gates выполнены. Однако `git stash drop stash@{1}` — отдельная
необратимая операция: перед ней показать `git stash list`, подтвердить, что
нужный stash всё ещё называется `api work in progress`, и получить явное
подтверждение Principal Designer.

### Temporary worktree

Recovery worktree:

```text
/Users/desexpert/Projects/aid-token-comparator-v0.1.0
branch: cursor/token-comparator-v0.1.0
```

Его можно удалить только отдельным подтверждённым cleanup шагом после проверки,
что `origin/main` содержит release commits, tag и release существуют. Не
удалять автоматом вместе с merge или release.

---

## 7. Security и access

- `PLUGIN_SHARED_SECRET` не должен попадать в Git, ZIP, bundles, UI, URLs,
  README, logs или Presentbook.
- Если persistent shared secret доступен runtime-клиенту Figma plugin, он не
  является настоящим секретом. Для широкого rollout рассмотреть user/session
  auth, short-lived scoped tokens или server-side broker.
- Если `RickOBrian/aid` private, пользователь должен иметь GitHub access для
  direct asset download. Presentbook auth не даёт GitHub asset access сам по
  себе. Проверить этот UX до beta rollout.

---

## 8. Не делать

- Не коммитить ZIP в Git, `public/`, `dist/` history или Presentbook assets.
- Не распространять ZIP вручную через чат как постоянный канал.
- Не публиковать релиз из WIP/Preview/feature branch.
- Не перезаписывать versioned asset после публикации.
- Не считать Vercel green checks проверкой Figma plugin build.
- Не обновлять stable download link при каждом push.
- Не мержить Presentbook CTA до доступности stable alias.
- Не смешивать Token Comparator release tooling и Presentbook Tools UI scope.

---

## 9. Следующие задачи

1. **Alias gate v0.1.0:** фактически подтвердить/закончить `token-comparator.zip`
   в GitHub Release `v0.1.0`, проверить SHA и stable URL.
2. **Presentbook PR:** из чистого worktree от `origin/main` применить
   `/tmp/aid-pr-a-presentbook-tools.patch`, реализовать CTA и install guide,
   затем review → commit → PR → Preview → merge.
3. **Release pipeline PR:** обновить `release.mjs`/runbook так, чтобы каждый
   future release создавал и публиковал versioned ZIP + `token-comparator.zip`.
4. **Cleanup:** отдельными подтверждениями обработать `stash@{1}`, временный
   worktree и stale local branches только после проверки актуального состояния.

---

## 10. Cleanup-сессия 2026-09-09

### Исходное состояние (до cleanup)

**Основной worktree:**

- Путь: `/Users/desexpert/Projects/aid`
- Branch: `main`
- HEAD: `33dc4c3`
- `origin/main`: `f35561c` (включает merge PR #15 и PR #16)
- Статус: `behind origin/main` на 5 commits

**Локальный WIP (грязный working tree):**

Modified tracked:

- `pages/aid-portal/App.tsx` (+14 строк)
- `pages/aid-portal/hubData.ts` (+17 строк)
- `tools/figma-token-comparator/package.json` (+3/-1)

Untracked:

- `pages/aid-portal/TokenComparatorPluginPage.tsx`
- `pages/aid-portal/ToolsHubPage.tsx`
- `pages/aid-portal/tools-registry.json`
- `tools/figma-token-comparator/README-install.txt`
- `tools/figma-token-comparator/scripts/release.mjs`

Этот WIP частично дублировал уже merged PR #15 (plugin packaging) и PR #16 (Presentbook tools).

**Stash:**

- `stash@{0}`: pre-merge-presentbook working tree cleanup
- `stash@{1}`: api work in progress
- `stash@{2}`: wip: driver-color-tokens local changes

**Worktrees:**

- `/Users/desexpert/Projects/aid` — основной, `main @ 33dc4c3`
- `/Users/desexpert/Projects/aid-presentbook-tools` — `feat/presentbook-tools-download @ 09eba93`
- `/Users/desexpert/Projects/aid-token-comparator-v0.1.0` — detached @ `89bbf35`

### Выполненные шаги

**A. Backup основного WIP (read-only):**

- Patch: `/tmp/aid-main-wip-pre-cleanup.patch`
  - Размер: ~19 KB (~603 строки)
  - SHA-256: `f90b7a4ac32a75052e87dbf73d1ec431c867c04368f9ec599079f2fea768fd28`
  - Scope: `pages/aid-portal/` + `tools/figma-token-comparator/`

- Archive branch: `archive/main-wip-pre-cleanup-20260909 → 33dc4c3`

- Inventory: `/tmp/aid-main-wip-pre-cleanup-20260909.txt`

**B. Сравнение WIP vs origin/main:**

Tracked diff (vs локальный HEAD 33dc4c3) — все три файла идентичны `origin/main`:

- `pages/aid-portal/App.tsx`
- `pages/aid-portal/hubData.ts`
- `tools/figma-token-comparator/package.json`

Untracked:

| Файл | Статус | Вывод |
|---|---|---|
| `TokenComparatorPluginPage.tsx` | отличается от `origin/main` | локальный WIP без download UI/guard |
| `ToolsHubPage.tsx` | отличается от `origin/main` | локальный WIP с hardcoded colors |
| `tools-registry.json` | отличается от `origin/main` | нет `downloadUrl` / `downloadLabel` |
| `README-install.txt` | идентичен `origin/main` | safe to remove |
| `scripts/release.mjs` | идентичен `origin/main` | safe to remove |

**C. Сохранение отличающегося Presentbook WIP:**

- Каталог: `/tmp/aid-main-wip-presentbook-20260909/`
- Файлы:
  - `pages/aid-portal/TokenComparatorPluginPage.tsx`
  - `pages/aid-portal/ToolsHubPage.tsx`
  - `pages/aid-portal/tools-registry.json`
- Manifest: `/tmp/aid-main-wip-presentbook-20260909/MANIFEST.sha256`

SHA-256 всех трёх файлов совпали с оригиналами.

**D. Сброс tracked-дубликатов:**

```bash
git restore -- \
  pages/aid-portal/App.tsx \
  pages/aid-portal/hubData.ts \
  tools/figma-token-comparator/package.json
```

**E. Удаление untracked plugin-дубликатов:**

Удалены после byte-verify:

- `tools/figma-token-comparator/README-install.txt`
- `tools/figma-token-comparator/scripts/release.mjs`

Presentbook untracked-файлы не удалялись на этом этапе.

**F. Fast-forward main:**

```bash
rm -- \
  pages/aid-portal/TokenComparatorPluginPage.tsx \
  pages/aid-portal/ToolsHubPage.tsx \
  pages/aid-portal/tools-registry.json

git pull --ff-only origin main
```

Результат:

- `main` обновлён: `33dc4c3 → f35561c`
- Working tree: clean

### Итоговое состояние (после cleanup)

| Объект | Состояние |
|---|---|
| Основной worktree | clean |
| `main` | `f35561c` |
| `origin/main` | `f35561c` |
| `archive/main-wip-pre-cleanup-20260909` | `33dc4c3` (не изменялась) |
| Stash | 3 записи, без изменений |
| Worktrees | 3 штуки, не удалялись |
| Presentbook WIP backup | `/tmp/aid-main-wip-presentbook-20260909/` |
| Полный patch backup | `/tmp/aid-main-wip-pre-cleanup.patch` |

### Что нельзя удалять без отдельного решения

- `stash@{1}: api work in progress`
- `stash@{2}: wip: driver-color-tokens local changes`
- `archive/main-wip-pre-cleanup-20260909`
- `/tmp/aid-main-wip-pre-cleanup.patch`
- `/tmp/aid-main-wip-presentbook-20260909/`
- worktree `/Users/desexpert/Projects/aid-token-comparator-v0.1.0`
- worktree `/Users/desexpert/Projects/aid-presentbook-tools` (после отдельной проверки)

---

## 11. Перенумерация версий 2026-09-18

Первые релизы выходили как `0.1.x`, и цифра поднималась в последнем разряде
независимо от содержания: `v0.1.2` добавил типографику, но вышел как PATCH.
Номера приведены к `semver-guide.md` (раздел «Инструменты»), включая уже
опубликованные:

| Было | Стало | Коммит | Что это |
|---|---|---|---|
| `v0.1.0` | `v1.0.0` | `89bbf35` | Первая версия: цвета |
| `v0.1.1` | `v1.0.1` | `89bbf35` | Та же сборка, новые ключи доступа |
| `v0.1.2` | `v1.1.0` | `e7dc252` | Типографика и исправления аудита |

Что сделано:

- новые аннотированные теги поставлены на те же коммиты;
- три GitHub Release переведены на новые теги и переименованы, в описание
  добавлена строка о прежнем номере, упоминания версий в тексте заменены;
- архив `token-comparator-v0.1.2.zip` переименован в
  `token-comparator-v1.1.0.zip`. Содержимое не менялось: он по-прежнему
  побайтно совпадает с `token-comparator.zip` (SHA-256 `54e3c9d6…33741b`).
  Внутри архива в `README-install.txt` осталось «v0.1.2» — пересборка
  изменила бы байты;
- старые теги `v0.1.0`, `v0.1.1`, `v0.1.2` удалены — по решению Principal
  Designer, чтобы не жили две нумерации. Ссылок на них не было: у
  версионного архива 0 скачиваний, Presentbook ведёт на
  `releases/latest/download/token-comparator.zip`;
- тег `archived/cursor/token-comparator-v0.1.0` не тронут — это архив ветки,
  не релиз.

Установленным плагинам перенумерация незаметна: номер версии в интерфейсе
появился только в чейнджлоге v1.2.0, идентификатор плагина в Figma не менялся.

---

## Changelog

- **1.4.0 — 2026-09-18.** Раздел 11: перенумерация версий плагина по SemVer
  (`v0.1.0/0.1.1/0.1.2` → `v1.0.0/1.0.1/1.1.0`), удаление старых тегов.
  В «Preconditions» — выбор версии по `semver-guide.md` и обязательная запись
  в чейнджлоге плагина.
- **1.3.0 — 2026-09-09.** Добавлена секция 10: полная фиксация cleanup-сессии
  основного worktree 2026-09-09 — исходное состояние, выполненные шаги, итоговое
  состояние, список артефактов, которые нельзя удалять без отдельного решения.
  Актуализирован статус основного worktree: `main @ f35561c`, working tree clean.
- **1.2.0 — 2026-09-09.** Зафиксирован фактический выпуск Token Comparator
  v0.1.0: recovery из stash, commits, PR #15, merge commit, tag, GitHub Release,
  final Figma smoke test, ZIP contract и SHA. Уточнён публичный stable alias:
  `token-comparator.zip` вместо `token-comparator-latest.zip`. Добавлены
  изоляция Presentbook Tools WIP, CTA contract, dependency gate и следующий
  dual-asset release pipeline.
- **1.1.0 — 2026-09-08.** Добавлены правила Perplexity vs Cursor и Composer
  default для задач release workflow.
- **1.0.0 — 2026-09-08.** Первое решение: исходники в Git, ZIP artifacts в
  GitHub Releases, versioned artifacts и stable latest URL, Presentbook Tools
  как distribution entry point, release gates и rollout phases.