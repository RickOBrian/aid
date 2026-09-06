---
destination: skills/_shared/
name: github-sync-architecture
---

# Архитектура: синхронизация реестра решений через GitHub

Статус: **Этап 1 полностью реализован, исправлен, верифицирован вживую и смерджен в `main` (04.09.2026, PR #3).** Плагин `tools/figma-token-comparator/` — часть `main`. **Backend-эндпоинт `/api/registry/propose-decision` реализован и полностью верифицирован живыми curl-тестами.** **✅ МИГРАЦИЯ ЗАВЕРШЕНА (06.09.2026): backend вынесен из presentbook (`aid-ds`) в отдельный standalone-сервис и Vercel-проект `aid-registry-api`, полностью независимый от Presentbook. Верифицирован end-to-end живыми curl-тестами на новом окружении (PR #7).** Следующий шаг — обновление UI плагина (убрать debug-поля токена/owner/repo) и переключение плагина на новый URL. Этот файл — источник правды для всех последующих промтов по фиче; перечитывать целиком перед каждым новым промтом.

## Проблема, которую решаем

Дизайнер разбирает токены в одном наборе макетов, через неделю разбирает другой набор макетов с частично повторяющимися токенами. Нужно не повторять работу — подтягивать уже принятые решения автоматически, при этом:
- решения должны быть общими для команды;
- любое изменение общего реестра решений требует аппрува Principal Designer;
- применение решения к нодам макета ("Применить в макет") — зона рядового дизайнера, аппрува не требует.

## Два разных продукта в этом репозитории — не путать

- **Presentbook** — сайт-документация токенов/компонентов для продуктов Rider, Driver и др. Отдельный продукт Principal Designer, задеплоен на Vercel как проект `aid-ds`. Живёт в `pages/driver-color-tokens/` (~586 файлов: `vite.config`, `App.tsx`, `scripts/*.mjs`, `index.html` и т.д.).
- **Token Comparator** — Figma-плагин (`tools/figma-token-comparator/`), который синхронизируется с общим реестром решений через Git. Backend для него (`/api/registry/propose-decision`) — теперь отдельный сервис `aid-registry-api`, физически и инфраструктурно не связанный с Presentbook.

**Работа над Token Comparator не должна требовать presentbook-инфраструктуру и не должна иметь возможность случайно сломать production presentbook.** Это правило, зафиксированное Principal Designer 06.09.2026, теперь выполнено технически — backend полностью отделён.

## ✅ МИГРАЦИЯ BACKEND ЗАВЕРШЕНА (06.09.2026) — вариант A реализован

### Что было сделано

Backend плагина (`proposeDecision.ts`, `registryGithub.ts`, `registryConfig.ts`, `cors.ts` и связанные файлы) перенесён из `pages/driver-color-tokens/api/registry/` (co-located с Presentbook, архитектурная ошибка, зафиксированная ранее) в `tools/figma-token-comparator/server/` — standalone-сервис, не зависящий от presentbook-инфраструктуры.

**Git**: коммит `5c63dc4` — `feat(registry-api): migrate propose-decision backend out of presentbook into standalone service`, ветка `cursor/propose-decision-endpoint`, запушена в `origin`. Старый co-located backend (`pages/driver-color-tokens/api/registry/`) **не удалён** — оставлен как safety net до подтверждения стабильности нового сервиса в продакшене.

**Новый Vercel-проект**: `aid-registry-api` (Project ID `prj_CREfn3wIRq2Qsk2SeuxSBfnhwcZH`), Root Directory `tools/figma-token-comparator/server`, Framework Preset Other, подключён к `RickOBrian/aid`, полностью отдельно от `aid-ds`.

**Production URL**: `https://aid-registry-api.vercel.app/api/registry/propose-decision`.

### Env-переменные — перенесены, с уроком про Secret-тип

`GITHUB_TOKEN` и `PLUGIN_SHARED_SECRET` перенесены в `aid-registry-api` (Production + Preview). `REGISTRY_OWNER`, `REGISTRY_REPO`, `REGISTRY_PATH`, `REGISTRY_REVIEWER` не переносились — дефолты в `registryConfig.ts` (`RickOBrian`/`aid`/`decisions-registry.json`). `AUTH_COOKIE_SECRET`, `BASIC_AUTH_*` — presentbook-специфичны, не нужны новому сервису.

**Важный урок, зафиксированный на будущее**: Vercel **не отдаёт значения Secret-типа переменных обратно ни через что** — ни `vercel env pull` (возвращает `[SENSITIVE]` placeholder), ни `vercel env run`, ни через UI после сохранения (write-only). Единственный способ перенести Secret-значение между проектами — вручную скопировать из первоисточника (менеджер паролей, `.env` на другом проекте, место первоначального сохранения при создании токена) и вставить через **delete + re-create** в целевом проекте (Edit недоступен для Secret-типа, только Delete → Add New с тем же именем). После любого изменения env обязателен новый деплой (`vercel --prod` или Redeploy в UI) — уже работающий деплой не перечитывает изменённые переменные.

**Инцидент при первом переносе**: первая попытка скопировать `GITHUB_TOKEN` (существующий fine-grained PAT `figma-comparator-backend`) привела к `403 Resource not accessible by personal access token` при создании ветки — токен либо устарел, либо права были недостаточны, либо значение было неверным (нельзя перепроверить, GitHub не показывает значения существующих токенов повторно). Решение: сгенерирован новый fine-grained PAT с явными правами `Contents: Read and write` + `Pull requests: Read and write` на `RickOBrian/aid`, вставлен в `aid-registry-api` → 403 исчез, success-path прошёл полностью.

### Живая curl-верификация нового сервиса (06.09.2026, финальный прогон)

Все проверки выполнены на `https://aid-registry-api.vercel.app/api/registry/propose-decision`:

- CORS preflight (`OPTIONS`) → `204`, `Access-Control-Allow-Origin: *`, методы `POST, OPTIONS`. ✅
- Неверный `sharedSecret` → `401 { error: "unauthorized" }`, CORS-заголовки на месте. ✅
- Пустые `entries` → `400 { error: "invalid_request" }`, валидация срабатывает до проверки secret. ✅
- Полный success-path (сигнатура `curl-smoke-test-DELETE-ME-6`) → `200 { success: true }`. Создана ветка `registry/propose-1788713394776-38a02e6c`, коммит в `decisions-registry.json`, PR #7 открыт с корректным содержимым, skip-reviewer логика сработала (author === reviewer, `RickOBrian`). PR #7 закрыт без мержа, ветка удалена. ✅

**Итог**: миграция кода не сломала ни одной ранее верифицированной части (auth/CORS/validation идентичны старому co-located эндпоинту), полный git-flow (branch → commit → PR → skip reviewer) подтверждён на новом окружении end-to-end.

### Первый деплой — для справки

Первый Production-деплой (`dpl_5kDdWBT25Hfk1diLYoekTeV9QYgQ`) прошёл READY без ошибок сразу — сборка заняла ~4 секунды, 54 пакета, без vite/prebuild (в отличие от presentbook). CLI-деплой запускался из корня репозитория (`/Users/desexpert/Projects/aid`), не из подпапки `server/` — деплой из подпапки давал ошибку двойного пути при резолве Root Directory.

## Открытые вопросы — статус на 06.09.2026, после миграции

1. **`sha` реестра.** ✅ Backend читает сам перед каждым коммитом. При устаревшем `sha` (409 от GitHub) — backend возвращает нейтральную ошибку, retry инициирует сам дизайнер.
2. **`owner`/`repo` раздельно.** ✅ Canonical-формат, дефолты в `registryConfig.ts`.
3. **`ref=main`.** ✅ Всегда явный.
4. **Права токена.** ✅ Новый fine-grained PAT с явными правами Contents + Pull requests (Read and write) на `RickOBrian/aid`.
5. **Тесты.** ✅ `proposeDecision.test.ts` (7/7 passed) + живая curl-верификация всех путей на новом окружении.
6. **Защита `Response`/`Headers` от `undefined`.** ✅ Паттерн сохранён для консистентности (реализовано в `registryGithub.ts`).
7. **Reviewer = author (`422`).** ✅ Решено вариантом "a+", подтверждено на новом окружении (skip-логика сработала в финальном прогоне).
8. **Физическое размещение backend.** ✅ ЗАКРЫТО. Backend в `tools/figma-token-comparator/server/`, собственный Vercel-проект `aid-registry-api`, полностью независим от `aid-ds`/presentbook.
9. **НОВЫЙ, открыт 06.09.2026 — UI плагина.** Debug-поля (GitHub PAT, Owner/Repo, путь к реестру) всё ещё в текущей сборке плагина — технический долг этапа 1, теперь готов к устранению, так как backend-посредник полностью верифицирован. Не начато. Следующий шаг работы.
10. **НОВЫЙ, открыт 06.09.2026 — переключение плагина на новый URL.** Клиентский код плагина (`tools/figma-token-comparator/src/`) может всё ещё указывать на старый co-located эндпоинт или не иметь окончательного URL прописанным. Требует проверки и обновления на `https://aid-registry-api.vercel.app/api/registry/propose-decision`.
11. **НОВЫЙ, открыт 06.09.2026 — судьба старого co-located backend.** `pages/driver-color-tokens/api/registry/` не удалён (safety net). Решение об удалении — отдельным шагом Principal Designer, не раньше подтверждения стабильности нового сервиса в реальном использовании через плагин (не только curl).

Дополнительно из этапа 2 (04.09.2026), актуально: **`git diff main <ветка> --stat` перед PR** — обязательный шаг, подтверждено по итогам инцидента этапа 1.

## ✅ Backend-логика (auth/validation/git-flow) — верифицирована живыми тестами дважды

Логика была впервые проверена вживую на Preview-деплое старой (co-located) структуры, затем повторно — end-to-end — на новом standalone-сервисе после миграции. Оба прогона подтвердили идентичное поведение.

### Первая верификация (co-located структура, до миграции)

**Auth и validation** (без побочных эффектов, без обращения к GitHub):
- Неверный `sharedSecret` → `401 { error: "unauthorized" }`. ✅
- Отсутствие `sharedSecret` / битое тело / отсутствие `proposedBy` / невалидный `decision` / битый JSON → во всех случаях `400 { error: "invalid_request" }`, до GitHub не доходит. ✅
- CORS preflight (`OPTIONS`) → `204`, `Access-Control-Allow-Origin: *`, методы `POST, OPTIONS`, заголовок `Content-Type` — корректно для вызова из Figma plugin sandbox (`Origin: null`). ✅

**Полный success-path** (два раздельных живых прогона на co-located структуре, оба с реальным созданием и последующей чисткой PR):

- **Первый прогон (PR #5)**, до фикса reviewer — ветка `registry/propose-*` создана, коммит в `decisions-registry.json` прошёл, PR #5 открыт. Ответ `{ success: false }` — из-за падения последнего шага `requestPullRequestReviewer`. PR #5 закрыт без мержа, ветка удалена.
- **КРИТИЧЕСКИЙ БАГ, найденный и исправленный (`7500e4f`)**: `GITHUB_TOKEN` и `REGISTRY_REVIEWER` — один и тот же аккаунт (`RickOBrian`), GitHub API возвращает `422 { message: "Review cannot be requested from pull request author." }` — системное ограничение GitHub. Воспроизведено вживую на PR #5.
- **Решение (вариант "a+")**: перед `POST /requested_reviewers` — `GET /pulls/{n}` → сравнение `user.login` с `config.reviewer`. Если совпадают — reviewer-запрос пропускается (явный `console.log`, не молчаливое поглощение ошибки), `{ success: true }` возвращается всё равно. Если не совпадают — обычный запрос. Задел на будущий bot-аккаунт для коммитов.
- **Второй прогон (PR #6), после фикса** — `HTTP 200 { success: true }`. Runtime-лог Vercel подтвердил `[registryGithub] Skipped reviewer request: author and reviewer are the same account (RickOBrian)`. PR #6 создан, закрыт без мержа, ветка удалена.

### Вторая верификация (новый standalone-сервис, после миграции)

См. раздел «Живая curl-верификация нового сервиса» выше — PR #7, идентичный результат.

**Итог**: вся цепочка auth → validation → fetch registry on `main` → create branch → commit `decisions-registry.json` → open PR → (skip or request) reviewer → `{ success: true }` подтверждена живыми тестами дважды: до и после миграции инфраструктуры. Логика файлов при переносе не менялась, только окружение/пути.

## Итог мержа этапа 1 (04.09.2026)

**Финальный PR**: #3, `cursor/figma-comparator-clean → main`. 4 коммита, 28 файлов, только `tools/figma-token-comparator/`, без затрагивания других продуктов репозитория. Смержен вручную Principal Designer через GitHub UI после ручной проверки diff.

**Коммиты, вошедшие в `main`**:
- `d5cbd7a` — `feat(comparator): add GitHub registry read (fetch, auth, error handling)`. 8 файлов.
- `98e68b4` — `feat(comparator): initial commit of figma-token-comparator plugin`. 20 файлов.
- `5ad732c` — `fix(comparator): distinguish inaccessible repo from missing registry file`. 4 файла.
- `29c4bcb` — `fix(comparator): guard against missing response.headers in Figma sandbox`. 1 файл.

**PR #2 закрыт без мержа** — ветка `cursor/figma-token-comparator-github-sync` содержала повреждённую историю (300 файлов, 50+ коммитов, откатывала `.cursor/rules/*`, старую skills-инфраструктуру, `space-context.md` — см. разбор инцидента ниже).

## ⚠️ Инцидент этапа 1: повреждённая ветка перед мержем — обязательно к прочтению перед этапом 2

При открытии первого PR (#2) из ветки `cursor/figma-token-comparator-github-sync` diff показал **300 изменённых файлов, +16609/−2970, 50+ коммитов**, включая удаление старой skills-инфраструктуры, `.cursor/rules/*.mdc`, `space-context.md` — то есть откат общей инфраструктуры DS Pipeline, не связанной с плагином.

**Диагностика показала**: `git merge-base main <ветка>` совпадал с HEAD актуального `main` (т.е. формально ветка "не отставала"), но при этом коммит `9b0866f` (`feat(rules): add audit gate...`), присутствующий в `main`, отсутствовал в `git log` ветки. Вывод: ветка физически не содержала часть файлов инфраструктуры, несмотря на корректный merge-base — вероятная причина в истории переименования ветки без чистого пересоздания от актуального `main`.

**Решение, которое сработало**: не чинить повреждённую ветку, а пересобрать чистую ветку `cursor/figma-comparator-clean` от актуального `main` (`git checkout main && git pull && git checkout -b cursor/figma-comparator-clean`) и перенести только 4 нужных коммита через `git cherry-pick d5cbd7a 98e68b4 5ad732c 29c4bcb` (порядок по времени коммита, не по хэшу). Diff новой ветки — сразу чистые 28 файлов, только insertions.

**Побочный этап диагностики (важно на будущее)**: после пересборки ветки PR #3 первое время всё равно показывал раздутый diff (151 файл, потом 300+) — причина оказалась в том, что локальный `main` был на 25 коммитов впереди `origin/main` (несвязанная работа по presentbook, не запушенная вовремя). GitHub сравнивает PR с `origin/main`, а не с локальным `main` — после `git push origin main` и форсированного пересчёта (`gh api repos/.../pulls/3 -X PATCH -f base=main`) diff схлопнулся до верных 28 файлов, 10971 insertions, 0 deletions.

**Правило на будущее для всех этапов**: перед открытием любого PR — (1) убедиться, что `git log origin/main..main` пуст (т.е. `origin/main` не отстаёт от локального), (2) проверить `git diff main <ветка> --stat` локально до `gh pr create`, а не полагаться только на GitHub UI, который может показывать устаревший кэш. При параллельной работе над несколькими продуктами в одном репозитории (плагин + presentbook) — коммитить и пушить в `main` чаще, не копить много локальных коммитов, это и стало корнем инцидента.

**Незакрытый хвост**: `git stash` с несохранёнными локальными правками presentbook (`wip: driver-color-tokens local changes`) — не восстановлен. Также одно из мест, где физически жил backend плагина до миграции (см. раздел миграции выше).

## Инфраструктура, настроенная в процессе (не относится к коду плагина, но нужна для процесса)

- **GitHub CLI (`gh`) установлен и авторизован** локально у Principal Designer (через Homebrew, `gh auth login`, аккаунт `RickOBrian`, token scopes: `gist`, `read:org`, `repo`). Используется для `gh pr create`, `gh pr view`, `gh pr close --delete-branch`, `gh api` напрямую из терминала Cursor.
- **Vercel Ignored Build Step для `aid-ds`** (presentbook): Settings → Build and Deployment → Ignored Build Step → Behavior "Only build if there are changes in a folder" → `.` (относительно Root Directory `pages/driver-color-tokens`). Эта настройка касается только presentbook-проекта — backend теперь в собственном Vercel-проекте `aid-registry-api` без этой зависимости.
- **`PLUGIN_SHARED_SECRET` и `GITHUB_TOKEN`** — теперь в переменных окружения Vercel-проекта `aid-registry-api` (Preview + Production), не `aid-ds`. Vercel не отдаёт значения encrypted secrets обратно ни через какой канал (CLI `env pull`/`env run` → `[SENSITIVE]` placeholder, UI Edit недоступен для Secret-типа) — единственный способ обновить значение: delete + re-create с реальным значением из первоисточника, затем обязательный новый деплой.

## Живая верификация этапа 1 (04.09.2026, Figma Desktop, реальный GitHub-токен)

Все сценарии пройдены лично Principal Designer с реальным fine-grained PAT (`figma-token-comparator-test`, Contents: Read):

- **Сценарий A (файл не существует)** — репозиторий `RickOBrian/aid`, путь `nonexistent-file.json` → «Реестр ещё не создан в репозитории RickOBrian/aid (nonexistent-file.json). Начать с пустого реестра?» + кнопка. ✅
- **Сценарий B (начать с пустого реестра)** — «Локальный пустой реестр: версия 0, 0 записей, инициализирован 04.09.2026, 15:36:03.» Токен сохраняется между сессиями. ✅
- **Сценарий D (неверный токен)** — «Неверный GitHub-токен.» ✅
- **Сценарий E (репозиторий недоступен)** — «Репозиторий не найден или токен не имеет к нему доступа.» ✅ Главное подтверждение фикса различения 404.
- Сценарий C (существующий валидный `decisions-registry.json`) и сценарий F (rate limit) — не проверялись вживую, низкий риск, можно проверить на этапе 2.

## КРИТИЧЕСКИЙ БАГ, найденный и исправленный в процессе верификации (29c4bcb)

При первом прогоне сценария A вместо ожидаемого сообщения появилась «Неизвестная ошибка при загрузке реестра. Попробуйте ещё раз.» Причина:

```
TypeError: cannot read property 'get' of undefined
  at assertRepoAccessible (PLUGIN_9_SOURCE:910:48)
```

**Причина**: в среде Figma plugin sandbox `response.headers` от `fetch()` не гарантирован так же надёжно, как в браузере/Node.

**Исправление**: безопасное чтение через защищённый доступ к `response.headers` вместо прямого `.get()`.

**Важный вывод для будущих этапов**: код, проходящий `npx tsc --noEmit` и curl-тесты, может содержать баги, специфичные для среды выполнения Figma plugin sandbox. Живая проверка в Figma должна быть частью процесса для клиентского кода плагина, не опциональным финальным штрихом. Backend на Node.js runtime этому конкретному риску не подвержен, но живая curl-верификация всё равно обязательна для сетевой логики.

## ⚠️ UI плагина — технический долг, готов к устранению

Текущий debug-UI плагина (поля GitHub Personal Access Token, Owner/Repo, путь к файлу реестра, кнопки «Сохранить настройки GitHub» / «Загрузить реестр») не должен быть показан рядовому дизайнеру. Backend-посредник теперь полностью реализован и верифицирован (auth, validation, CORS, полный git-flow) на собственном независимом сервисе — условие для перехода на целевой UI выполнено. Следующий шаг: либо убрать debug-поля из обычной сборки, либо спрятать за скрытый admin-режим. См. UX-принцип ниже.

## АРХИТЕКТУРНОЕ РЕШЕНИЕ ЭТАПА 2 — реализовано и верифицировано полностью

### Почему не «токен у каждого дизайнера»

Рядовой дизайнер не должен ничего знать про GitHub-токены, owner/repo, путь к файлу реестра.

### Выбранная модель: serverless-посредник — реализовано, размещение мигрировано, UI ожидает обновления

Дизайнер в плагине никогда не видит и не вводит GitHub-токен, owner/repo, путь к файлу. Вся GitHub-механика — на backend `/api/registry/propose-decision`, теперь в собственном Vercel-проекте `aid-registry-api`, не внутри `aid-ds`/presentbook.

**Поток данных (логика и размещение подтверждены живым тестом)**:
1. Плагин собирает предложенные решения дизайнера локально (`clientStorage`), без обращения к GitHub.
2. По кнопке «Отправить N решений на согласование» плагин шлёт JSON на `POST https://aid-registry-api.vercel.app/api/registry/propose-decision`: `{ sharedSecret, proposedBy, entries: [{ signature, decision, targetVariableId?, targetVariableName?, comment? }] }`.
3. Backend: сравнивает `sharedSecret` constant-time → читает `GITHUB_TOKEN`/`REGISTRY_REVIEWER` из env → читает `sha` реестра из `main` → создаёт ветку `registry/propose-{timestamp}-{hash}` → коммитит `decisions-registry.json` → открывает PR → запрашивает reviewer (или skip, если author === reviewer) → `{ success: true }`.
4. Backend возвращает плагину только статус успеха/ошибки (без ссылки на PR, без деталей git).

**Требования к безопасности backend-эндпоинта (реализовано и верифицировано)**:
- Endpoint принимает запросы от Figma plugin sandbox (CORS `Access-Control-Allow-Origin: *`, методы `POST, OPTIONS`).
- Защита от произвольных внешних вызовов — shared secret между плагином и backend (`PLUGIN_SHARED_SECRET`, сравнивается constant-time через `crypto.timingSafeEqual`).
- Rate limiting — не реализован на этапе 2, отмечен как желательный на будущее.

## UX-принцип для финального UI плагина

Рядовой дизайнер в продакшн-версии плагина **никогда не видит**: GitHub Personal Access Token, поля Owner/Repo, путь к файлу реестра, номер/ссылку PR, термины «коммит»/«ветка»/«merge», технические коды ошибок (401/403/404/409).

Флоу дизайнера в UI:
1. Открывает плагин — реестр решений подгружается автоматически в фоне.
2. Сканирует макет, видит уже принятые решения и предлагает новые.
3. Нажимает одну кнопку **«Отправить N решений на согласование»**.
4. Видит один из двух статусов: **«Отправлено, ждёт согласования Principal Designer»** либо **«Не удалось отправить, попробуйте ещё раз»**.

Admin-режим — скрытый флаг только для Principal Designer (debug-поля этапа 1).

**Важно**: живая верификация в Figma Desktop обязательна перед мерджем любого нового кода в клиентском слое плагина (Figma sandbox risk, см. вывод этапа 1).

## Подтверждённые факты о репозитории

### Карта продуктов (актуально на 06.09.2026, после миграции)

```
RickOBrian/aid
├── tools/figma-token-comparator/     ← Token Comparator плагин (в main, PR #3)
│   └── server/                       ← Backend API, standalone (миграция 06.09.2026)
├── pages/driver-color-tokens/        ← Presentbook (НЕ в main; старый co-located backend не удалён, safety net)
│   ├── [~586 файлов presentbook]     ← только на ветках cursor/figma-styles-page-visualization, cursor/figma-token-comparator-github-sync
│   └── api/registry/                 ← СТАРЫЙ backend, не тронут, кандидат на удаление после стабилизации нового
└── skills/_shared/github-sync-architecture.md ← этот файл
```

```
Vercel aid-registry-api (prj_CREfn3wIRq2Qsk2SeuxSBfnhwcZH)
├── Root Directory: tools/figma-token-comparator/server
├── Production → https://aid-registry-api.vercel.app (READY, верифицирован end-to-end)
└── Полностью независим от aid-ds

Vercel aid-ds (prj_3PgxIPZPSo8F87rdogwcyXuittd6)
├── Production NOW → 72422dcd (presentbook, ветка figma-styles-page-visualization, НЕ main)
└── Production от main → ERROR (Root Directory does not exist, presentbook не в main) — не связано с backend плагина, отдельная проблема Presentbook
```

### GitHub API клиент — клиентский (этап 1) vs backend (этап 2)

`tools/figma-token-comparator/src/lib/githubApi.ts` — клиентский, этап 1, требует проверки/обновления URL (см. открытый вопрос №10). `tools/figma-token-comparator/server/` — backend-модуль (standalone после миграции): `proposeDecision.ts` (orchestration), `registryGithub.ts` (создание ветки/коммита/PR, `requestPullRequestReviewer` с фиксом), `registryConfig.ts` (`owner`/`repo`/`path`/`reviewer` из env, дефолты `RickOBrian`/`aid`/`decisions-registry.json`/`RickOBrian`), `cors.ts`, `proposeDecision.test.ts` (7 тестов).

### Паттерн сообщений UI↔code

UI → code: `save-github-settings`, `load-registry`, `init-empty-registry` (этап 1, debug-режим). code → UI: `init-state`, `github-settings-saved`, `registry-loading`, `registry-loaded`, `registry-not-found`, `registry-initialized`, `error`. **Для целевого UI этапа 2 (следующий шаг)**: добавить `propose-decisions` / `decisions-submitted` / `decisions-submit-failed`.

## Backend GitHub REST client (реализован 05.09.2026)

Первоначальная реализация и восстановление инфраструктуры — в co-located структуре presentbook (`pages/driver-color-tokens/`). **Каноническое размещение после миграции (06.09.2026)** — `tools/figma-token-comparator/server/` (те же модули, та же логика).

Co-located пути (историческая реализация, safety net не удалён):

- `pages/driver-color-tokens/api/registry/propose-decision.ts` — Vercel handler (`OPTIONS` + `POST`), точка входа.
- `pages/driver-color-tokens/api/_lib/proposeDecision.ts` — основная логика эндпоинта.
- `pages/driver-color-tokens/api/_lib/registryGithub.ts` — backend GitHub REST client, независимый от плагина.
- `pages/driver-color-tokens/api/_lib/registryTypes.ts` — типы запроса/реестра.
- `pages/driver-color-tokens/api/_lib/registryConfig.ts` — константы `REGISTRY_OWNER` / `REGISTRY_REPO` / `REGISTRY_PATH` / `REGISTRY_REVIEWER`.
- `pages/driver-color-tokens/api/_lib/security.ts` — `timingSafeEqual` для сравнения `sharedSecret`.
- `pages/driver-color-tokens/api/_lib/cors.ts` — CORS-заголовки и обёртки JSON-ответов.
- `pages/driver-color-tokens/api/_lib/proposeDecision.test.ts` — vitest (изначально 6 тестов; в standalone `server/` — 7/7).

**Инфраструктурная база для backend восстановлена (05.09.2026)**: на `origin/main` каталог `pages/driver-color-tokens/api/*` отсутствовал (не был частью PR #3). Cursor восстановил `api/login.ts`, `api/_lib/session.ts`, `middleware.ts`, `vercel.json`, `.gitignore`, `.env.local.example`, `package.json` из ветки `origin/cursor/figma-token-comparator-github-sync` — той самой ветки с повреждённой историей. **Не проверено на момент первоначальной актуализации файла**: содержат ли эти конкретные восстановленные файлы расхождения с версией, ожидаемой на `main`. Рекомендуется `git diff origin/main origin/cursor/figma-token-comparator-github-sync --stat -- api/login.ts api/_lib/session.ts middleware.ts vercel.json .gitignore` перед мерджем co-located версии.

Middleware bypass добавлен для эндпоинта в co-located presentbook: `if (pathname === '/api/login' || pathname === '/api/registry/propose-decision') { return; }` в `middleware.ts`. Standalone `aid-registry-api` middleware presentbook не использует.

## Формат хранения: `decisions-registry.json`

```json
{
  "schemaVersion": "1.0",
  "registryVersion": 12,
  "updatedAt": "2026-09-10T14:00:00Z",
  "entries": [
    {
      "signature": "hash(property+hex+alpha+bindingType+sourceName)",
      "decision": "mapped | ignored | hardcoded | candidate | value_fix_proposed",
      "targetVariableId": "VariableID:...",
      "targetVariableName": "...",
      "comment": "...",
      "proposedBy": "designer_email_or_id",
      "proposedAt": "ISO timestamp",
      "status": "approved | stale",
      "approvedBy": "principal_designer_id",
      "approvedAt": "ISO timestamp"
    }
  ]
}
```

Backend при мердже новых entries не проставляет `status` вообще — только `proposedAt`/`proposedBy`.

## Флоу дизайнера ("Отправить на ревью") — актуализированный план этапа 2

Технический план интеграции (не дублирует UX-принцип выше — здесь шаги backend и контракт API):

1. Дизайнер сканирует макет, решения копятся в `clientStorage` локально.
2. По кнопке «Отправить N решений на согласование» плагин отправляет решения на `POST https://aid-registry-api.vercel.app/api/registry/propose-decision`. **Кнопка и весь новый UI-флоу пока не реализованы в плагине** — backend существует и верифицирован end-to-end (curl + PR #7); клиентский код требует обновления URL и UI.
3. Backend: читает `sha` реестра из `main` → создаёт ветку `registry/propose-{timestamp}-{shortRandomId}` → коммитит обновлённый `decisions-registry.json` → открывает PR с `requested_reviewers: [RickOBrian]` (или skip, если author === reviewer).
4. При устаревшем `sha` (409 от GitHub) — backend возвращает нейтральную ошибку (`{ success: false }`).

## Что не входит в фичу

Автоматическое разрешение конфликтов двух PR по одной сигнатуре. Real-time уведомления внутри плагина. Хранение "proposed" в самом JSON до мержа. Индивидуальные GitHub-токены для рядовых дизайнеров.

## Порядок реализации

1. ✅ Весь плагин закоммичен и запушен.
2. ✅ GitHub API клиент (этап 1).
3. ✅ Ручная верификация сценариев A, B, D, E в Figma Desktop.
4. ✅ Коммиты этапа 1 запушены.
5. ✅ PR #3 смержен (04.09.2026).
6. ✅ Архитектура этапа 2 зафиксирована (04.09.2026).
7. ✅ Backend-эндпоинт реализован, логика верифицирована живыми curl-тестами (auth, validation, CORS, полный success-path, фикс reviewer `7500e4f`).
8. ✅ Миграция backend в отдельный сервис/Vercel-проект (вариант A) — завершена 06.09.2026, коммит `5c63dc4`, проект `aid-registry-api`.
9. ✅ Повторный curl smoke-test на новом окружении — пройден end-to-end (PR #7), URL обновлён в этом документе.
10. ⏳ **Следующий шаг**: обновление UI плагина под новый флоу «Отправить N решений на согласование», скрытие debug-полей (GitHub PAT, Owner/Repo, путь к реестру) за admin-режим. Требует живой верификации в Figma Desktop.
11. ⏳ Проверка и обновление URL в клиентском коде плагина (`tools/figma-token-comparator/src/lib/githubApi.ts` и связанные) на `https://aid-registry-api.vercel.app/api/registry/propose-decision`.
12. ⏳ Решение об удалении старого co-located backend (`pages/driver-color-tokens/api/registry/`) — не раньше подтверждения стабильности нового сервиса в реальном использовании через плагин.
13. ⏳ Presentbook (586 файлов) — отдельный мердж в `main`, отдельным решением Principal Designer, не связан по времени с Token Comparator.
14. ⏳ Валидация/инвалидация записей реестра при загрузке (этап 3).
15. ⏳ UI: финальная продакшн-полировка (этап 4).

## Примечание о синхронизации этого файла

Этот файл — общий источник правды и для промтов через Perplexity Space, и для прямой работы с Cursor. При расхождении между версией в Perplexity Space и версией в репозитории — **репозиторий считается источником правды**. `.claude/` как путь для инфраструктурных файлов был отменён — все guide-файлы и этот документ живут в `skills/_shared/`, без `.claude/` в пути.
