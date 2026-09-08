---
destination: skills/_shared/
name: github-sync-architecture
metadata:
  version: "1.2.0"
  owner: design-system-team
  status: active
  updated: "2026-09-08"
description: >
  Каноническая архитектура синхронизации реестра решений Token Comparator
  через GitHub: production submit-flow, review projection в Pull Request,
  deployment policy, границы данных, верификация и актуальный backlog.
  Включает Presentbook git/deploy workflow и инцидент 2026-09-08
  (расхождение main и реального Presentbook).
---

# Архитектура: синхронизация реестра решений через GitHub

> **Статус: active · production E2E validated · 2026-09-08**
>
> Token Comparator (`tools/figma-token-comparator/`) отправляет решения из Figma
> через standalone backend `aid-registry-api` в GitHub Pull Request. Канонический
> реестр — `decisions-registry.json`; GitHub PR body — отдельная
> человекочитаемая review-проекция. Presentbook (`pages/driver-color-tokens/`)
> с 2026-09-08 полностью восстановлен в `main` после структурного инцидента.
> Этот файл — источник правды для последующих промтов, реализации и аудитов
> по registry proposal pipeline и по Presentbook git/deploy workflow.
> Перечитывать целиком перед началом нового изменения этого контура.

---

## 1. Назначение и границы

### Два независимых продукта

| Продукт | Назначение | Расположение | Vercel-проект |
|---|---|---|---|
| **Token Comparator** | Figma-плагин для scan, comparison, решения и proposal в общий registry | `tools/figma-token-comparator/` | `aid-registry-api` для backend |
| **Presentbook** | Web-витрина и review-среда токенов/компонентов | `pages/driver-color-tokens/` | `aid-ds` |

Backend Token Comparator физически и инфраструктурно отделён от Presentbook:

```text
Token Comparator
  └── tools/figma-token-comparator/server/
        └── standalone Vercel project: aid-registry-api

Presentbook
  └── pages/driver-color-tokens/
        └── separate Vercel project: aid-ds
```

**Граница обязательна:** изменения Token Comparator и `aid-registry-api` не
должны требовать инфраструктуру Presentbook и не должны иметь возможность
случайно сломать production Presentbook.

### Роли

- **Principal Designer** принимает design-, mapping-, review-, merge- и
  release-решения, включая merge и production promote для Presentbook.
- **Cursor** исследует репозиторий, реализует согласованные изменения,
  выполняет локальные проверки и git-операции только по явной команде.
- **Backend** технически создаёт proposal branch, commit и Pull Request, но
  никогда не принимает design-решение вместо Principal Designer.

---

## 2. Канонические источники

| Артефакт | Роль | Не является |
|---|---|---|
| Git-репозиторий `RickOBrian/aid` | Source of truth принятых и закоммиченных изменений | Локальный Figma clientStorage |
| `decisions-registry.json` | Canonical machine-readable registry решений | Человекочитаемый review-интерфейс |
| GitHub Pull Request body | Human-readable review projection конкретного proposal batch | Source of truth или input для approve/runtime flow |
| Figma файл и Token Comparator | Input для Scan / Compare / Apply и источник review context | Canonical источник принятых registry decisions |
| `figma.clientStorage` | Локальный draft/history и submitted tracking | Надёжный источник GitHub lifecycle status |
| `main` (ветка) | Source of truth для Presentbook frontend + products/ | Автоматически равный production deployment |

### Ключевая граница данных

```text
Canonical registry data
  → decisions-registry.json
  → используется для загруженного registry / compare / matching

Transient review metadata
  → proposal payload
  → GitHub PR body
  → только для человеческого review
```

PR body не должен парситься approval-flow, runtime-кодом плагина или
registry-loader'ом. Изменение форматирования PR body не должно влиять на
корректность canonical registry.

**Дополнительно с 2026-09-08:** `main` является source of truth и для
Presentbook (frontend + `products/`), но это не означает автоматическое
равенство с production. См. §3a про разделение merge и promote.

---

## 3. Production и deployment policy

### `aid-registry-api`

| Параметр | Значение |
|---|---|
| Vercel project | `aid-registry-api` |
| Project ID | `prj_CREfn3wIRq2Qsk2SeuxSBfnhwcZH` |
| Root Directory | `tools/figma-token-comparator/server` |
| Production URL | `https://aid-registry-api.vercel.app` |
| Production Branch | `main` |
| Production domain assignment | Auto-assign Custom Production Domains: enabled |

### Правило веток

```text
Push в feature branch
  → Vercel Preview deployment
  → production alias не меняется

Merge / push в main
  → Vercel Production deployment
  → aid-registry-api.vercel.app обновляется после Ready deployment
```

Локальная сборка плагина и production deployment backend — разные операции:

```text
npm run build
  → обновляет локальные dist/code.js, dist/ui.bundle.js, dist/ui.html
  → Figma Desktop может использовать новый клиентский код
  → НЕ обновляет backend на Vercel

push + merge в main + Ready Production deployment
  → обновляет server-side API
  → меняет код, который создаёт GitHub PR body
```

Не считать новый локальный `dist/` доказательством того, что production backend
работает на тех же изменениях. Для server-side фич обязателен отдельный
production deployment check.

### Sparse proposal branches и Vercel checks

Proposal branches `registry/propose-*` намеренно содержат только файл
`decisions-registry.json`. Поэтому Vercel checks для проектов с Root Directory
`tools/figma-token-comparator/server` или `pages/driver-color-tokens` могут
показывать Error: этих директорий в sparse proposal branch нет.

Это не является ошибкой registry submission и не блокирует review предложений.
Однако такой шум ухудшает читаемость PR и остаётся P1 инфраструктурной задачей:
нужна безопасная стратегия ignored-build/deployment для sparse proposal branches
без ослабления настоящих production checks.

---

## 3a. Presentbook git/deploy workflow

> Добавлено 2026-09-08 после структурного инцидента (см. §9a). Обязательно к
> прочтению перед любой работой над `pages/driver-color-tokens/`.

### `aid-ds`

| Параметр | Значение |
|---|---|
| Vercel project | `aid-ds` |
| Root Directory | `pages/driver-color-tokens` |
| Production URL | `https://aid-ds.vercel.app` |
| Production Branch | `main` |
| Production promote | **Ручной, отдельное явное решение** — не auto-promote при каждом merge |

### Принцип: merge ≠ promote

`main` может быть обновлён и рабочим, а production — сознательно оставаться на
предыдущем deployment, пока Principal Designer явно не решит promote. Это два
разных, независимых решения:

```text
PR → Preview deployment → ручная проверка → merge в main
                                                  │
                                                  ▼
                                    main обновлён, собирается
                                                  │
                                                  ▼
                          отдельное явное решение: promote → production
```

Auto-promote с `main` не включён намеренно. Причина: production должен
оставаться стабильным до тех пор, пока Principal Designer не подтвердит на
Preview, что login flow, HubPage, Product Switcher (driver+rider) и все token
pages работают корректно.

### Обязательный цикл для каждой задачи

```text
1. git checkout main && git pull origin main
2. git checkout -b presentbook/<short-task-name>
3. Локальная разработка: cd pages/driver-color-tokens && npm run dev
4. Pre-push gate: npm run build && npm run typecheck:api — обязательны
   до commit. Если build падает локально — не продолжать.
5. Commit (логические, не смешанные) + push feature branch
6. PR в main → Vercel Preview deployment
7. Ручная проверка Preview: login flow, HubPage, Product Switcher
   (driver+rider), все token pages (200, без console errors)
8. Merge — явное решение Principal Designer, только после проверки Preview
9. Promote production — отдельное явное решение, отдельно от merge
```

### Критичные файлы (pre-flight check)

Перед началом любой работы или после checkout проверять наличие:

```text
pages/driver-color-tokens/App.tsx
pages/driver-color-tokens/main.tsx
pages/driver-color-tokens/index.html
pages/driver-color-tokens/vite.config.ts
pages/driver-color-tokens/package.json
pages/driver-color-tokens/scripts/*.mjs
products/registry.json
products/driver/product.json
products/rider/product.json
```

Отсутствие `products/registry.json` — тихий сбой: `SWITCHABLE_PRODUCTS = []`,
Product Switcher пустой, `/rider/*` routing не распознаётся. Не считать
отсутствие ошибкой сборки — это ошибка данных, которая не бросает exception.

### Скиллы

Зафиксированы как воспроизводимые команды (2026-09-08):

| Скилл | Триггер | Делает | Не делает |
|---|---|---|---|
| `start-presentbook` | «старт презентбук» | sync main → новая ветка `presentbook/<task>` → pre-flight check критичных файлов → `npm install && npm run dev` | commit, push, PR, deploy |
| `push-presentbook` | «push presentbook» | pre-push verification gate (критичные файлы + `npm run build` + `npm run typecheck:api`) → commit → push → PR в main | merge, promote production |
| `push-token-comparator` | «push Token Comparator» | typecheck/build плагина и сервера → commit → push feature branch → PR в main | merge, promote production, трогает Presentbook |

Merge и promote остаются вне скиллов — это осознанные разовые решения
Principal Designer, а не часть автоматизированного потока.

---

## 4. Proposal flow

### Целевой lifecycle

```text
Scan in Figma
  → Compare against library + approved registry
  → Apply decision
  → local StoredDecision / clientStorage
  → Submit pending decisions
  → POST aid-registry-api
  → registry/propose-* branch
  → commit decisions-registry.json
  → GitHub Pull Request OPEN
  → Principal Designer review
  → merge OR close
```

### Submit flow

1. Figma Plugin сканирует layout, строит `LayoutRecord[]` и получает контекст:
   property, binding type, source name/value, representative node path/name,
   count и другие scan-time данные.
2. Comparator сопоставляет записи с library tokens и загруженным registry.
3. Principal Designer или дизайнер выполняет Apply для решения (`mapped`,
   `ignored`, `value_fix_proposed` и т. п.).
4. Плагин сохраняет решение в `figma.clientStorage` как `StoredDecision`.
5. Пользователь нажимает «Отправить N решений на согласование».
6. Плагин отправляет proposal batch в production endpoint:
   `POST https://aid-registry-api.vercel.app/api/registry/propose-decision`.
7. Backend валидирует request, читает актуальный registry из `main`, создаёт
   уникальную `registry/propose-{timestamp}-{hash}` branch, коммитит canonical
   registry file и открывает GitHub PR в `main`.
8. После успешного Submit UI сообщает:

   ```text
   Отправлено, ждёт согласования Principal Designer
   ```

9. Principal Designer вручную принимает решение по GitHub PR.

### Policy после Submit

После успешного Submit:

| Действие | Автоматически |
|---|---|
| PR остаётся OPEN | Да |
| Proposal branch сохраняется | Да |
| Cleanup | Нет |
| Auto-merge | Нет |
| Auto-close | Нет |
| Auto-delete branch | Нет |
| Merge / close / delete branch | Только по явному решению Principal Designer |

Backend не должен самостоятельно закрывать PR, мержить его или удалять
proposal branch. Исключение — явно обозначенный тестовый cleanup по отдельной
команде Principal Designer.

---

## 5. Canonical registry

### Формат `decisions-registry.json`

```json
{
  "schemaVersion": "1.0",
  "registryVersion": 1,
  "updatedAt": "2026-09-07T13:43:06.501Z",
  "entries": [
    {
      "signature": "hash(property+hex+alpha+bindingType+sourceName)",
      "decision": "mapped | ignored | hardcoded | candidate | value_fix_proposed",
      "targetVariableId": "VariableID:...",
      "targetVariableName": "...",
      "comment": "...",
      "proposedBy": "designer name or id",
      "proposedAt": "ISO timestamp",
      "status": "approved | stale",
      "approvedBy": "principal designer id",
      "approvedAt": "ISO timestamp"
    }
  ]
}
```

`RegistryFileEntry` остаётся compact machine/audit моделью. В неё не добавлять
presentation context только ради GitHub review.

### Canonical поля

| Поле | Назначение |
|---|---|
| `signature` | Стабильный идентификатор source matching case |
| `decision` | Тип решения |
| `targetVariableId` | Точный Figma Variable ID target, если применимо |
| `targetVariableName` | Имя target token для audit/readability |
| `comment` | Обоснование решения, если применимо |
| `proposedBy`, `proposedAt` | Audit информации proposal |
| `status`, `approvedBy`, `approvedAt` | Lifecycle/audit поля canonical entry |

### Что запрещено хранить в canonical registry

Следующие поля — transient review metadata. Они не должны быть добавлены в
`RegistryFileEntry`, записаны в `decisions-registry.json`, использованы как
canonical matching rule или считаны runtime registry-loader'ом:

```text
sourceProperty
sourceBindingType
sourceName
sourceDisplayValue
nodePath
nodeName
occurrenceCount
targetCollectionName
targetModeName
targetDisplayValue
proposedModeName
currentLibraryValue
proposedValue
```

Причина: это snapshot конкретного Scan/Apply события. Node path и node name
меняются при перестройке Figma; impact count относится к конкретному scan;
resolved display value token может измениться в library. Эти данные нужны для
решения человека в момент review, а не как долговечное правило registry.

---

## 6. Human-readable PR review projection

### Назначение

Raw JSON diff полезен для git history, но Principal Designer не должен вручную
сопоставлять `signature` с Figma-слоем или угадывать смысл Variable ID. Поэтому
backend формирует PR body как human-readable Markdown projection proposal batch.

`decisions-registry.json` остаётся в **Files changed** как компактный audit
artifact. Карточки для решения находятся во вкладке **Conversation** в
описании PR.

### Data flow review metadata

```text
ComparisonResult / LayoutRecord / ComparisonTarget
  → ApplyDecisionMessage payload
  → StoredDecision in figma.clientStorage
  → ProposeDecisionEntryPayload
  → backend whitelist validation
  → buildPullRequestBody
  → GitHub PR description
```

Все review metadata fields optional и additive. Старые решения, созданные
версией плагина без этих полей, не должны ломать Submit или PR creation.

### Карточки PR body

PR body начинает batch summary:

```markdown
## Решения для ревью

Предложено: <proposedBy>
Время: <timestamp>
Решений: <count>

Технический source of truth: `decisions-registry.json`.
```

#### `mapped`

Для mapping-карточки показывать доступный context:

- `🟢 Использовать токен` и короткое node name; fallback — signature;
- node path;
- source property;
- затронуто слоёв (`occurrenceCount`);
- текущее source HEX/RGBA;
- target token name;
- resolved target HEX/RGBA;
- collection/mode;
- компактную строку `source → token → target`;
- `Комментарий: —`, если comment отсутствует;
- `<details>` с signature, targetVariableId, proposedBy и proposedAt.

#### `ignored`

Для ignore-карточки показывать:

- `🔴 Игнорировать`;
- node context, source value и source property, если доступны;
- `Тип источника` для `sourceBindingType`;
- impact count, если доступен;
- `Причина: <comment>`;
- точный fallback `Причина: не указана`, если comment отсутствует;
- technical details с signature, proposedBy, proposedAt.

#### `value_fix_proposed`

Не склеивать value-fix context в comment. Отдельно показывать:

- token / collection / mode;
- current library value;
- proposed value;
- comment;
- technical details.

#### Future / unknown decision

Decision renderer использует central mapping `decision → icon + human label`.
Неизвестный тип решения не должен вызывать exception; fallback:

```text
⚪ Неизвестное решение: `raw_decision`
```

#### Legacy fallback

Если review metadata отсутствует, body остаётся валидным, не показывает
`undefined`, `null`, пустые строки или выдуманные значения. Использовать
signature как title fallback и вывести:

```text
Контекст слоя недоступен: решение предложено версией плагина без review metadata.
```

### Validated live example

Production visual smoke test подтвердил карты PR body для реальных `mapped`
решений:

- `Dragger element`: `#E9EAEE → Text/Secondary Opposite → #E9EAEE`;
- `__Changelog Badge`: `#E8F5E9 → Stories/Smithers → #EFF6E5`.

В GitHub Conversation были видны node path, property, occurrence count, source
HEX, target token, target HEX, `color-sem / Day`, comment fallback и collapsed
technical details. Это подтверждает, что review projection читается человеком
и не заменяет canonical JSON diff.

Оба решения были приняты и смержены Principal Designer 2026-09-07 (PR #12).

---

## 7. Backend contract и безопасность

### Endpoint

```text
POST https://aid-registry-api.vercel.app/api/registry/propose-decision
```

Базовый request contract:

```json
{
  "sharedSecret": "plugin build-time secret",
  "proposedBy": "Figma current user name or fallback id",
  "entries": [
    {
      "signature": "...",
      "decision": "mapped",
      "targetVariableId": "VariableID:...",
      "targetVariableName": "...",
      "comment": "..."
    }
  ]
}
```

Review metadata передаётся дополнительными optional полями только для
формирования PR body. Backend должен whitelist-валидировать эти поля, но не
прокидывать их в `buildProposedEntries` и registry serialization.

### Валидация review metadata

- Optional review string fields принимаются только как строки.
- `occurrenceCount` принимается только как finite positive integer.
- `0`, отрицательные значения, дроби, `NaN`, `Infinity` и строки отклоняются.
- Unknown request fields не становятся неявным input для registry.
- `buildProposedEntries` использует явный allowlist canonical полей, а не
  object spread исходного proposal entry.

### Secrets и auth

- `PLUGIN_SHARED_SECRET` используется для plugin → backend request и
  сравнивается constant-time до доступа к GitHub.
- `GITHUB_TOKEN` существует только в Vercel env `aid-registry-api` и имеет
  минимум `Contents: Read and write` + `Pull requests: Read and write` на
  `RickOBrian/aid`.
- Не передавать GitHub PAT в обычный UI плагина.
- Не логировать/не включать в PR body, registry JSON, тестовые snapshot'ы,
  docs или ошибки: `PLUGIN_SHARED_SECRET`, `GITHUB_TOKEN`, Figma PAT,
  Authorization values, env values, Figma file keys, node IDs или raw
  Variables API payloads.
- Secret-type values Vercel write-only: нельзя безопасно получить их обратно
  через dashboard или CLI. При замене: delete + re-create из доверенного
  первоисточника, затем новый deployment.
- `aid-ds` (Presentbook) хранит только auth-secrets: `BASIC_AUTH_USER`,
  `BASIC_AUTH_PASSWORD`, `AUTH_COOKIE_SECRET`. Registry-related env
  (`PLUGIN_SHARED_SECRET`, `GITHUB_TOKEN`, `REGISTRY_*`) — только в
  `aid-registry-api`, не должны присутствовать в `aid-ds` (см. §9a).

### CORS

Для Figma plugin sandbox (`Origin: null`) endpoint поддерживает:

```text
OPTIONS → 204
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
```

---

## 8. GitHub review policy

### Principal Designer decision

Principal Designer проверяет proposal PR через:

1. **Conversation** — human-readable decision cards.
2. **Files changed** — canonical JSON diff.
3. **Checks** — только релевантные runtime/build status.

Принимать или отклонять нужно semantic mapping, а не формат JSON:

- source context соответствует реальному Figma case;
- target token семантически корректен;
- target variable ID соответствует token name;
- разница source/target value приемлема, если она есть;
- comment/причина достаточны для неоднозначных решений.

Для инфраструктурных PR (не registry proposal, например Presentbook merge)
review проходит через тот же принцип: build/typecheck checks + обязательная
ручная проверка Preview deployment, а не только зелёные automated checks.

### Self-review limitation

GitHub не позволяет автору PR формально выбрать **Approve** или **Request
changes** на собственном PR. В текущем owner-managed workflow технический
GitHub author proposal PR и Principal Designer могут быть одним аккаунтом
`RickOBrian`.

Поэтому текущая operational policy:

- Principal Designer выполняет осознанный manual merge для принятого решения;
- Principal Designer закрывает PR без merge для отклонённого решения;
- не пытаться обходить GitHub self-review restriction;
- если формальный approval должен стать обязательным, нужен второй human
  reviewer, отдельный GitHub account или отдельная GitHub App policy.

Это ограничение не блокирует merge, если `main` не защищён required-review
rule. Если branch protection будет включён позже, workflow необходимо
пересмотреть до включения mandatory approvals.

### Merge и proposal branch

- Для accepted registry proposal предпочтителен merge commit: он сохраняет
  отдельный audit commit решения в `main`.
- После merge одноразовую `registry/propose-*` branch можно удалить.
- Закрытый тестовый PR и его branch удаляются только при явно обозначенном
  cleanup decision.
- Тот же принцип применяется к инфраструктурным merge (например,
  `merge/presentbook-into-main`, PR #13): merge commit, ручная проверка
  Preview перед merge, удаление одноразовой ветки после merge.

---

## 9. Validation history

### Этап 1 — registry read

PR #3 (`cursor/figma-comparator-clean → main`) был вручную проверен и merged
04.09.2026. Он добавил initial Token Comparator и GitHub registry read path.
Figma Desktop live tests подтвердили базовые состояния: отсутствующий registry,
локальная инициализация пустого registry, неверный token и недоступный repo.

### Backend migration

06.09.2026 backend был перенесён из co-located Presentbook структуры в
`tools/figma-token-comparator/server/`:

```text
5c63dc4 feat(registry-api): migrate propose-decision backend out of presentbook into standalone service
```

Новый standalone service `aid-registry-api` прошёл live curl verification:
CORS, invalid request, unauthorized, GitHub branch → commit → PR flow и
skip-reviewer behavior для author === reviewer. PR #7 был test artifact и
закрыт без merge.

### Task 2 — production submit flow

```text
380f1fe feat(plugin): add production submit flow with admin mode and backend registry sync
```

Реализованы `currentuser` permission, build-time secret injection,
production backend client, submitted signatures tracking, admin/UI и
production registry status. Commit был проверен в isolated staged snapshot:
plugin typecheck/build и server TypeScript/regression tests прошли.

### Human-readable review projection

```text
772255b feat(registry-api): add human-readable PR review projection for proposed decisions
```

Реализованы Apply-time transient snapshot, propagation через payload,
backend whitelist validation, отдельный PR body renderer и тесты.

Commit был проверен в isolated staged snapshot:

- plugin typecheck/build — PASS;
- server TypeScript — PASS;
- Vitest — 32/32 PASS;
- review metadata присутствует в PR body;
- review metadata отсутствует в serialized `decisions-registry.json`;
- approve-flow не парсит PR body;
- secret leakage не обнаружен.

### Production release и live E2E

PR #4 (`cursor/propose-decision-endpoint → main`) был merged merge commit:

```text
c3ac4014cdb473859302bfbf47eb9728d34478cd
Merge pull request #4 from RickOBrian/cursor/propose-decision-endpoint
```

После merge Vercel production deployment `aid-registry-api` стал Ready с
source `main @ c3ac401`. Следующий live Submit из Figma создал proposal PR с
новым human-readable PR body; visual smoke test пройден.

### Первый принятый registry proposal

PR #12 (`registry/propose-1788788586501-308ddbbb → main`) был проверен через
human-readable cards и смержен 2026-09-07. Первые два реальных `mapped`
решения (`Dragger element`, `__Changelog Badge`) стали canonical.

### Test artifacts

- PR #5: выявил GitHub `422` при попытке request reviewer, совпадающего с
  author; закрыт без merge.
- PR #6: подтвердил skip-reviewer fix; закрыт без merge.
- PR #7: standalone backend curl smoke test; закрыт без merge.
- PR #8: P5 Figma Desktop live test, 6 entries от `Sergey AI`; намеренно
  закрыт без merge, ветка удалена.
- Старый P6 proposal, созданный до production release Commit B, отображал
  legacy `signature → decision` body; это подтвердило различие между локальным
  build плагина и ещё не обновлённым production backend.

Test artifacts не трактовать как approved registry decisions.

---

## 9a. Инцидент 2026-09-08: main не содержал Presentbook

### Симптом

Локальный dev-сервер Presentbook (`localhost:3000`) после checkout потерял
большую часть страниц и функционал. Production (`aid-ds.vercel.app`) при этом
работал нормально.

### Корневая причина

`main` никогда не содержал полного Presentbook. История разошлась на ветке
`cursor/propose-decision-endpoint`: она была создана с нуля как API-only stub
(коммит `6d7982b`) и смержена в `main` через PR #4, не принеся с собой frontend.
`pages/driver-color-tokens/` в `main` содержал только 18 API-файлов вместо
полного Presentbook (~586 файлов + `products/`).

Production жил на устаревшем ручном деплое (`npx vercel --prod`, 30 Aug,
снимок с ветки `cursor/figma-styles-page-visualization`), который никогда не
обновлялся из `main`. Попытки автодеплоя с `main` падали по двум причинам:

| Deployment | Статус | Причина |
|---|---|---|
| `aid-4hpajnt6m` | Error | `MODULE_NOT_FOUND` на `prebuild` — `scripts/*.mjs` отсутствовали в `main` |
| `aid-73ovbnhg3` | Canceled | Ignored Build Step: diff не затрагивал `pages/driver-color-tokens/` |

Локально к моменту диагностики также присутствовал гибрид: 578 staged файлов
восстановлены из `origin/cursor/figma-styles-page-visualization`, но не
закоммичены — рабочее дерево не совпадало ни со старым, ни с новым состоянием.

Миграция backend (`5c63dc4`, 06.09.2026) не была причиной: она не вносила
изменений в `pages/driver-color-tokens/`.

### Восстановление

1. Локальный localhost восстановлен немедленно через checkout нужных путей
   из `origin/cursor/figma-styles-page-visualization` (`pages/driver-color-tokens/`,
   `products/`) без commit/push/deploy — production не был затронут.
2. Подготовлен conflict-resolution checklist для структурного merge
   `cursor/figma-styles-page-visualization → main`.
3. Legacy co-located registry API (`pages/driver-color-tokens/api/registry/`,
   связанные `_lib` файлы, `vitest.config.ts`) удалён при merge — pre-check
   подтвердил, что плагин использует исключительно
   `https://aid-registry-api.vercel.app`, co-located path нигде не
   референсится.
4. `.claude/**` и `perplexity-skills/**` удалены как устаревшие зеркала
   (осознанное решение, зафиксированное в коммите `0f963f0` на
   `figma-styles`); канон консолидирован в `skills/_shared/`.
   `.claude/space-context.md` сохранён отдельно как единственный файл,
   для которого `.claude/` остаётся обязательным destination.
5. Merge выполнен в отдельной ветке `merge/presentbook-into-main`, двумя
   раздельными коммитами:
   - `df8368b` — merge: restore Presentbook frontend + products from
     figma-styles, consolidate skills into skills/_shared/ (759 файлов);
   - `7e50d55` — chore: remove legacy co-located registry API, auth-only
     middleware (14 файлов).
6. PR #13 прошёл все Vercel Preview checks (aid-ds, aid-registry-api, dist,
   server) и ручную проверку Principal Designer: login flow, HubPage,
   Product Switcher (driver+rider), все token pages — без ошибок.
7. Смержен merge-commit'ом (`7e8ac3b`, 2026-09-08 09:39:52 UTC), ветка
   `merge/presentbook-into-main` удалена.

### Итоговое состояние на 2026-09-08

`main` содержит полный Presentbook frontend, `products/`, консолидированные
`skills/_shared/`, актуальные `.cursor/` pipeline gates. Production
`aid-ds.vercel.app` **намеренно не promoted** — остаётся на прежнем
deployment до отдельного явного решения Principal Designer (см. §3a).

### Извлечённые правила (зафиксированы в §3a)

- Каждая задача по Presentbook начинается от синхронизированного `main` в
  новой ветке, никогда не в `main` напрямую.
- `npm run build` обязателен локально до commit — тот же класс ошибки
  (`MODULE_NOT_FOUND`) обнаруживается за секунды локально вместо падения
  деплоя.
- Merge и production promote — два независимых явных решения, не одно.
- При структурных merge между сильно разошедшимися ветками — обязательна
  явная классификация каждого staged deletion вне ожидаемого scope
  (осознанное cleanup-решение vs побочный эффект расхождения истории)
  перед commit.

---

## 10. Current state

### Подтверждённое состояние на 2026-09-08

| Область | Статус |
|---|---|
| Standalone backend `aid-registry-api` | Production Ready |
| Production Branch (registry API) | `main` |
| Production submit flow | Live verified |
| Human-readable PR body | Live visual E2E verified |
| Canonical/transient data boundary | Enforced in code and tests |
| Task 2 implementation | Merged in `main` via PR #4 |
| Первый accepted registry proposal | Merged via PR #12 (2026-09-07) |
| Presentbook в `main` | Восстановлен полностью via PR #13 (2026-09-08) |
| Legacy co-located registry API | Удалён (PR #13) |
| `.claude/` / `perplexity-skills/` | Удалены, консолидированы в `skills/_shared/` (space-context.md сохранён) |
| Production `aid-ds.vercel.app` | На прежнем deployment; promote — открытое отдельное решение |
| `cursor/propose-decision-endpoint` | Preserved after merge; do not delete without explicit decision |

### Открытое операционное решение

Production Presentbook (`aid-ds.vercel.app`) не promoted с `main` после PR #13.
Следующий шаг — по готовности Principal Designer: проверить, что автодеплой
`main` → Vercel Preview/Production candidate теперь проходит успешно (main
содержит полный Presentbook), затем принять отдельное решение о promote.

---

## 11. Known limitations и backlog

### P0 — следующий функциональный slice

1. **Proposal lifecycle sync в Figma.**
   `tc_submitted_signatures` сейчас знает, что signature была отправлена, но
   не синхронизирует состояния GitHub/registry: `open`, `merged/approved`,
   `closed/rejected`, `stale`. Нужен reconciliation flow, чтобы закрытые
   предложения можно было корректно пересмотреть, а merged записи узнавались
   как canonical.

2. **Success UI с PR number и URL.**
   Response API должен возвращать PR number и URL; UI плагина должен показывать
   понятный статус, например `Отправлено на согласование · PR #<number>`, и
   явное действие `Открыть PR`. Сейчас дизайнер вынужден искать PR вручную.

3. **Plugin distribution page.**
   Раздел `/tools/token-comparator` в Presentbook с кнопкой скачивания
   актуального ZIP, версией, датой и changelog. Источник ZIP — GitHub
   Releases; версия и changelog обновляются по команде Principal Designer
   («опубликовать новую версию» → Cursor публикует релиз, ссылка на странице
   автоматически указывает на новую версию). Не реализовано.

4. **UI polish плагина под стиль Presentbook.**
   Аудит и приведение цветов/отступов/типографики UI Token Comparator к
   паттернам Presentbook. Промт подготовлен, не выполнялся.

### P1 — надёжность и review hygiene

5. **Duplicate open proposal prevention.**
   Не создавать второй `registry/propose-*` PR для той же signature, пока
   существует предыдущий open proposal.

6. **Vercel checks для sparse proposal branches.**
   Настроить ignored-build/deployment strategy для `registry/propose-*`, чтобы
   не получать ожидаемые Error checks из-за отсутствующих Root Directory, не
   ослабляя реальные production checks.

7. **Rate limiting.**
   Endpoint защищён shared secret, но отдельное rate limiting пока не
   реализовано. Определить подход до расширения числа пользователей плагина.

8. **Production promote для Presentbook.**
   После PR #13 `main` полностью восстановлен, но `aid-ds.vercel.app` не
   promoted. Требуется: (a) подтвердить, что автодеплой `main` теперь
   успешен; (b) отдельное явное решение Principal Designer о promote.

### P2 — policy и test completeness

9. **Formal reviewer policy.**
   Если required formal approval станет обязательным, назначить второй human
   reviewer, отдельный account или GitHub App workflow. Не имитировать
   self-approval.

10. **Explicit Infinity test.**
    `occurrenceCount` implementation уже отклоняет `Infinity` через
    `Number.isFinite`, но отдельный unit test на этот случай ещё не добавлен.

11. **CI guard против повторного расхождения main/Presentbook.**
    GitHub Action: `npm run build` в `pages/driver-color-tokens/` на каждый
    PR, затрагивающий эту директорию. Блокирующая проверка: директория не
    может содержать меньше N файлов или отсутствовать `App.tsx` /
    `scripts/`. Предотвращает повторение инцидента §9a. Не реализовано.

~~Судьба старого co-located backend~~ — закрыто: удалён в PR #13 (2026-09-08),
после подтверждённого pre-check, что плагин использует исключительно
`aid-registry-api`.

---

## 12. Operational checks и гейты

### Перед изменением plugin/client слоя

- Локальный typecheck/build обязателен.
- Figma Desktop live verification обязательна: plugin sandbox может отличаться
  от browser/Node runtime.
- Не считать curl tests достаточными для UI/client behavior.

### Перед изменением backend proposal flow

- Проверить request validation, CORS, auth ordering и canonical registry
  serialization.
- Проверить live behavior отдельно от локального build.
- При server-side изменении не считать feature готовой, пока code не достиг
  production deployment нужной ветки и deployment не стал Ready.

### Перед изменением Presentbook

- Всегда начинать от синхронизированного `main` в новой ветке
  `presentbook/<task>` (скилл `start-presentbook`).
- Pre-flight: проверить наличие критичных файлов (§3a) перед началом работы.
- `npm run build && npm run typecheck:api` обязательны локально до commit.
- Push только через `push-presentbook` (включает pre-push verification gate).
- Merge — только после ручной проверки Vercel Preview (login, HubPage,
  Product Switcher driver+rider, все token pages).
- Promote production — отдельное явное решение, никогда не автоматическое
  следствие merge.

### Перед commit/push/merge

- Разделять независимые concerns по commits: submit plumbing, review projection,
  docs и unrelated artifacts не смешивать без причины.
- Проверять `git status --short`, `git diff --check`, staged file list и
  отсутствие unrelated/untracked noise.
- Для mixed staging использовать `git add -p` и, при высокой цене ошибки,
  isolated snapshot из `git write-tree` + `git archive`.
- Push, merge, close PR и branch deletion — только после явного решения
  Principal Designer.
- Для структурных merge между разошедшимися ветками: явно классифицировать
  каждое staged deletion вне ожидаемого scope (осознанное cleanup vs
  побочный эффект расхождения истории) перед commit — см. §9a.

### Для proposal PR review

- Проверять **Conversation** для human-readable cards.
- Проверять **Files changed** для canonical registry diff.
- Не ожидать formal Approve от того же GitHub account, который является PR
  author.
- Merge только после semantic review target token и визуального impact.

### Для инфраструктурных PR (Presentbook merge, structural changes)

- Проверять все Vercel Preview checks (aid-ds, aid-registry-api, dist, server)
  зелёные.
- Обязательна ручная проверка живого Preview URL — зелёные automated checks
  подтверждают только сборку, не поведение auth/routing.
- Не promote production автоматически после merge.

---

## 13. Historical record

### Incident: reviewer equals author

GitHub не позволяет запросить review у PR author. Первый live path вернул
`422 Review cannot be requested from pull request author`. Решение: backend
получает PR author и пропускает `requestPullRequestReviewer`, если он совпадает
с configured reviewer; proposal flow при этом возвращает success. Это поведение
подтверждено live и остаётся корректным до появления отдельной reviewer policy.

### Incident: corrupted pre-merge branch

Первый PR #2 содержал повреждённую историю и большой несвязанный diff. Рабочее
решение: создать чистую branch от актуального `main`, перенести только нужные
commits и проверить `git diff main <branch> --stat` перед PR creation. Правило
сохраняется: перед PR сверять актуальность local/main и remote/main, а также
полный diff ветки против base branch.

### Incident: main не содержал Presentbook (2026-09-08)

См. полное описание в §9a. Кратко: `main` расходился с реальным Presentbook
на протяжении нескольких дней из-за истории веток `cursor/propose-decision-
endpoint` (API-only с нуля) и ручных production deploys с
`cursor/figma-styles-page-visualization`, минуя `main`. Восстановлено через
контролируемый structural merge (PR #13) с явной классификацией каждого
staged deletion. Извлечённые правила зафиксированы в §3a и §12.

### Vercel Secret handling

Secret-type Vercel values нельзя прочитать обратно. Перенос/замена secret
выполняется только из доверенного первоисточника через delete + re-create, после
чего необходим redeploy. Никогда не пытаться извлечь или вывести secret в
terminal/report/PR.

---

## Changelog

- **1.2.0 — 2026-09-08.** Задокументирован инцидент расхождения `main` и
  реального Presentbook (§9a): корневая причина, восстановление localhost,
  structural merge PR #13, удаление legacy co-located registry API,
  консолидация `.claude/`/`perplexity-skills/` в `skills/_shared/`. Добавлен
  раздел §3a — Presentbook git/deploy workflow: разделение merge и production
  promote, обязательный pre-push gate, скиллы `start-presentbook`,
  `push-presentbook`, `push-token-comparator`. Обновлён backlog: закрыт пункт
  про legacy backend, добавлены plugin distribution page, UI polish, CI guard
  против повторного расхождения main/Presentbook, открытое решение о
  production promote.
- **1.1.0 — 2026-09-07.** Полная актуализация после production Task 2 и
  human-readable registry proposal review flow: зафиксированы standalone
  deployment policy (`main` → Production, feature branch → Preview), canonical
  registry vs transient review metadata boundary, PR lifecycle policy,
  GitHub self-review limitation, validated production release PR #4, live
  visual E2E review projection и приоритетный backlog.
- **1.0.0 — 2026-09-06.** Миграция propose-decision backend из Presentbook в
  standalone `aid-registry-api`, live curl verification и базовая архитектура
  registry sync.
</content>
