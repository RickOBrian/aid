---
destination: skills/_shared/
name: token-comparator-release-guide
metadata:
  version: "1.3.0"
  owner: design-system-team
  status: active
  updated: "2026-09-09"
description: >
  Канонический контекст хранения, сборки, публикации и распространения Figma-плагина
  Token Comparator. Использовать при подготовке GitHub Release, stable download alias,
  Presentbook Tools page и следующих версий плагина.
---

# Token Comparator — Release & Distribution Guide

> **Статус: active · v0.1.0 опубликован 2026-09-09**
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

### Packaging contract

ZIP v0.1.0 содержит только:

```text
token-comparator/manifest.json
token-comparator/README-install.txt
token-comparator/dist/code.js
token-comparator/dist/ui.html
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

---

## 3. Download URLs и asset policy

### Stable URL для Presentbook

```text
https://github.com/RickOBrian/aid/releases/latest/download/token-comparator.zip
```

### Mandatory dual asset rule

Каждый будущий GitHub Release должен публиковать два байт-в-байт идентичных ZIP:

| Asset | Назначение |
|---|---|
| `token-comparator-vX.Y.Z.zip` | Immutable versioned artifact |
| `token-comparator.zip` | Stable alias для latest published Release |

**Push в main не обновляет alias.** Alias обновляется только после явной
публикации нового GitHub Release.

### Текущий незакрытый v0.1.0 gate

До реализации Presentbook CTA нужно получить Cursor-отчёт, что:

1. В Release `v0.1.0` существует `token-comparator-v0.1.0.zip`.
2. В Release `v0.1.0` существует `token-comparator.zip`.
3. Alias и versioned asset имеют SHA-256 `b6f0beda8f9a17acdf9fd94b6cbfac579ab986d44877562554892963300c3689`.
4. URL `.../releases/latest/download/token-comparator.zip` отвечает redirect/200, не 404.
5. Старый alias `token-comparator-latest.zip` удалён или явно оставлен.

---

## 4. Release workflow

### Trigger

Release начинается только явной командой Principal Designer.

### Preconditions

До любых write operations Cursor обязан:

1. Уточнить SemVer target и причину версии.
2. Подтвердить, что release code уже в `main`.
3. Не выпускать из WIP, Preview или случайной feature branch.
4. Проверить отсутствие существующего tag/release с тем же номером.
5. Проверить чистоту выбранного release worktree.

### Verification gate

```bash
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
- Figma Desktop smoke test пройден на именно этом ZIP.

### Publication sequence

После явного approval:

1. Собрать `token-comparator-vX.Y.Z.zip` из проверенного commit.
2. Создать байт-идентичную копию `token-comparator.zip`.
3. Создать annotated tag `vX.Y.Z` на проверенном merge commit.
4. Push tag.
5. Создать GitHub Release и upload **обоих** assets.
6. Проверить versioned URL и stable alias URL.
7. Только затем публиковать/мержить Presentbook CTA.

### Rollback

- Не удалять immutable versioned artifact и tag.
- Исправлять через новый semver release.

---

## 5. Presentbook Tools integration

### Целевой маршрут

```text
/tools
/tools/token-comparator
```

### Token Comparator page contract

Primary CTA:

```text
visible label: Скачать плагин для Figma
href: tools-registry.json.downloadUrl
target: _blank
rel: noreferrer noopener
```

`downloadUrl` — единственный source of truth:

```json
{
  "downloadUrl": "https://github.com/RickOBrian/aid/releases/latest/download/token-comparator.zip",
  "downloadLabel": "Скачать плагин для Figma"
}
```

### Merge dependency

Нельзя merge/deploy Presentbook CTA, пока stable URL возвращает 404.

---

## 6. Git safety и cleanup

### Recovery stash

`stash@{1}` — исходный recovery source. Перед `git stash drop stash@{1}` показать
`git stash list`, подтвердить название и получить явное подтверждение.

### Temporary worktree

```text
/Users/desexpert/Projects/aid-token-comparator-v0.1.0
branch: cursor/token-comparator-v0.1.0
```

Можно удалить только отдельным подтверждённым cleanup шагом.

---

## 7. Security

- `PLUGIN_SHARED_SECRET` не должен попасть в Git, ZIP, bundles, UI, URLs, README, logs.
- Если `RickOBrian/aid` private, пользователь должен иметь GitHub access. Проверить этот UX до beta rollout.

---

## 8. Не делать

- Не коммитить ZIP в Git.
- Не публиковать релиз из WIP/Preview/feature branch.
- Не перезаписывать versioned asset после публикации.
- Не считать Vercel green checks проверкой Figma plugin build.
- Не мержить Presentbook CTA до доступности stable alias.

---

## 9. Следующие задачи

1. **Alias gate v0.1.0:** фактически подтвердить `token-comparator.zip` в GitHub Release, проверить SHA и stable URL.
2. **Presentbook PR:** из чистого worktree от `origin/main` применить patch, реализовать CTA и install guide.
3. **Release pipeline PR:** обновить `release.mjs` для dual asset publishing.
4. **Cleanup:** обработать `stash@{1}`, временный worktree отдельными подтверждёнными шагами.

---

## 10. Cleanup-сессия 2026-09-09

### Итоговое состояние (после cleanup)

| Объект | Состояние |
|---|---|
| Основной worktree | clean |
| `main` | `f35561c` |
| `origin/main` | `f35561c` |
| Stash | 3 записи, без изменений |
| Presentbook WIP backup | `/tmp/aid-main-wip-presentbook-20260909/` |
| Полный patch backup | `/tmp/aid-main-wip-pre-cleanup.patch` |

### Что нельзя удалять без отдельного решения

- `stash@{1}: api work in progress`
- `stash@{2}: wip: driver-color-tokens local changes`
- `archive/main-wip-pre-cleanup-20260909`
- `/tmp/aid-main-wip-pre-cleanup.patch`
- `/tmp/aid-main-wip-presentbook-20260909/`
- worktree `/Users/desexpert/Projects/aid-token-comparator-v0.1.0`
- worktree `/Users/desexpert/Projects/aid-presentbook-tools`

---

## Changelog

- **1.3.0 — 2026-09-09.** Cleanup-сессия: фиксация состояния worktree, список артефактов для сохранения.
- **1.2.0 — 2026-09-09.** v0.1.0 release record, stable alias `token-comparator.zip`.
- **1.1.0 — 2026-09-08.** Правила Perplexity vs Cursor и Composer default.
- **1.0.0 — 2026-09-08.** Первое решение по архитектуре release.
