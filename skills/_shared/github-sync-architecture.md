---
destination: skills/_shared/
name: github-sync-architecture
---

# Архитектура: синхронизация реестра решений через GitHub

Статус: **Этап 1 полностью реализован, исправлен, верифицирован вживую и смерджен в `main` (04.09.2026, PR #3).** Плагин `tools/figma-token-comparator/` — часть `main`. **Архитектура этапа 2 зафиксирована (04.09.2026) — backend-посредник, без прямого GitHub-доступа из плагина.** Реализация backend-эндпоинта `propose-decision` выполнена Cursor (05.09.2026) в ветке `cursor/propose-decision-endpoint`, тесты пройдены (6/6), typecheck чист. Коммит/push этой реализации ещё не выполнены на момент актуализации файла. Этот файл — источник правды для всех последующих промтов по фиче; перечитывать целиком перед каждым новым промтом.

## Проблема, которую решаем

Дизайнер разбирает токены в одном наборе макетов, через неделю разбирает другой набор макетов с частично повторяющимися токенами. Нужно не повторять работу — подтягивать уже принятые решения автоматически, при этом:
- решения должны быть общими для команды;
- любое изменение общего реестра решений требует аппрува Principal Designer;
- применение решения к нодам макета ("Применить в макет") — зона рядового дизайнера, аппрува не требует.

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

## Инфраструктура, настроенная в процессе (не относится к коду плагина, но нужна для процесса)

- **GitHub CLI (`gh`) установлен и авторизован** локально у Principal Designer (через Homebrew, `gh auth login`, аккаунт `RickOBrian`, token scopes: `gist`, `read:org`, `repo`). Используется для `gh pr create`, `gh pr view`, `gh api` напрямую из терминала Cursor.
- **Vercel Ignored Build Step настроен для проекта `aid-ds`** (presentbook): Settings → Build and Deployment → Ignored Build Step → Behavior "Only build if there are changes in a folder" → `./pages/driver-color-tokens`.
- **Переменные окружения Vercel для `aid-ds` добавлены (04.09.2026)**: `GITHUB_TOKEN` (fine-grained PAT, права `Contents: Read and write` + `Pull requests: Read and write`, доступ только к `RickOBrian/aid`) и `PLUGIN_SHARED_SECRET` (случайная строка, общий секрет между плагином и backend-эндпоинтом) — обе для Production/Preview/Development.

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

**Важный вывод для будущих этапов**: код, проходящий `npx tsc --noEmit` и curl-тесты, может содержать баги, специфичные для среды выполнения Figma plugin sandbox. Живая проверка в Figma должна быть частью процесса для этапа 2, не опциональным финальным штрихом.

## ⚠️ UI этапа 1 — известный технический долг, обязателен к устранению до раскатки на команду

Текущий UI плагина (поля GitHub Personal Access Token, Owner/Repo, Путь к файлу реестра, кнопки «Сохранить настройки GitHub» / «Загрузить реестр») — это **отладочный интерфейс для верификации этапа 1 Principal Designer**, не продакшн-UI для команды. Он не должен быть показан рядовому дизайнеру ни при каких обстоятельствах.

## АРХИТЕКТУРНОЕ РЕШЕНИЕ ЭТАПА 2 (зафиксировано 04.09.2026): backend-посредник вместо прямого GitHub-доступа из плагина

### Выбранная модель: serverless-посредник на Vercel

Дизайнер в плагине никогда не видит и не вводит GitHub-токен, owner/repo, путь к файлу. Вся GitHub-механика (создание ветки, коммит, открытие PR) переносится с клиента (Figma plugin sandbox) на backend.

**Поток данных**:
1. Плагин собирает предложенные решения дизайнера локально (`clientStorage`), без обращения к GitHub.
2. По кнопке «Отправить N решений на согласование» плагин шлёт JSON с решениями на эндпоинт вида `POST /api/registry/propose-decision`.
3. Backend читает административный GitHub PAT из переменных окружения Vercel (`process.env.GITHUB_TOKEN`) — токен никогда не покидает сервер и не передаётся клиенту.
4. Backend сам выполняет: чтение текущего `sha` реестра → создание ветки от `main` → коммит обновлённого `decisions-registry.json` → открытие PR с `requested_reviewers: [Principal Designer]`.
5. Backend возвращает плагину только статус успеха/ошибки (без ссылки на PR, без деталей git).

**Требования к безопасности backend-эндпоинта**:
- Endpoint должен принимать запросы от Figma plugin sandbox (нужна корректная настройка CORS).
- Защита от произвольных внешних вызовов — shared secret между плагином и backend (`PLUGIN_SHARED_SECRET`, сравнивается constant-time через `crypto.timingSafeEqual`).
- Rate limiting на эндпоинте — не реализован на этапе 2, отмечен как желательный на будущее.

## UX-принцип для финального UI плагина

Рядовой дизайнер в продакшн-версии плагина **никогда не видит**: GitHub Personal Access Token, поля Owner/Repo, путь к файлу реестра, номер/ссылку PR, термины «коммит»/«ветка»/«merge», технические коды ошибок (401/403/404/409).

Флоу дизайнера в UI:
1. Открывает плагин — реестр решений подгружается автоматически в фоне.
2. Сканирует макет, видит уже принятые решения и предлагает новые.
3. Нажимает одну кнопку **«Отправить N решений на согласование»**.
4. Видит один из двух статусов: **«Отправлено, ждёт согласования Principal Designer»** либо **«Не удалось отправить, попробуйте ещё раз»**.

## Открытые вопросы этапа 2 — решения зафиксированы 04.09.2026

1. **`sha` реестра.** Backend читает актуальный `sha` реестра сам перед каждым коммитом. При устаревшем `sha` (409 от GitHub) — backend возвращает нейтральную ошибку, retry инициирует сам дизайнер.
2. **`owner`/`repo` раздельно**, не составная строка.
3. **`ref=main` вместо default branch** — решено безусловно.
4. **Права токена**: единый административный токен на backend с `contents:write` + `pull_requests:write`.
5. **Тесты**: минимальный мок `fetch` реализован (`api/_lib/proposeDecision.test.ts`, vitest, 6 тестов проходят), плюс обязательная ручная верификация в Figma Desktop перед мерджем нового сетевого пути — не опциональна.
6. **Защита `Response`/`Headers` от `undefined`** — обязательный паттерн, реализовано в `api/_lib/registryGithub.ts`.
7. **`git diff main <ветка> --stat` перед PR** — обязательный шаг, подтверждено по итогам инцидента этапа 1.

## Backend GitHub REST client (реализован 05.09.2026)

- `api/registry/propose-decision.ts` — Vercel handler (`OPTIONS` + `POST`), точка входа.
- `api/_lib/proposeDecision.ts` — основная логика эндпоинта.
- `api/_lib/registryGithub.ts` — backend GitHub REST client, независимый от плагина.
- `api/_lib/registryTypes.ts` — типы запроса/реестра.
- `api/_lib/registryConfig.ts` — константы `REGISTRY_OWNER` / `REGISTRY_REPO` / `REGISTRY_PATH` / `REGISTRY_REVIEWER`.
- `api/_lib/security.ts` — `timingSafeEqual` для сравнения `sharedSecret`.
- `api/_lib/cors.ts` — CORS-заголовки и обёртки JSON-ответов.
- `api/_lib/proposeDecision.test.ts` — vitest, 6 тестов.

**Инфраструктурная база для backend восстановлена (05.09.2026)**: на `origin/main` каталог `pages/driver-color-tokens/api/*` отсутствовал (не был частью PR #3). Cursor восстановил `api/login.ts`, `api/_lib/session.ts`, `middleware.ts`, `vercel.json`, `.gitignore`, `.env.local.example`, `package.json` из ветки `origin/cursor/figma-token-comparator-github-sync` — той самой ветки с повреждённой историей. **Не проверено на момент актуализации файла**: содержат ли эти конкретные восстановленные файлы расхождения с версией, ожидаемой на `main`. Рекомендуется `git diff origin/main origin/cursor/figma-token-comparator-github-sync --stat -- api/login.ts api/_lib/session.ts middleware.ts vercel.json .gitignore` перед мерджем.

Middleware bypass добавлен для нового эндпоинта: `if (pathname === '/api/login' || pathname === '/api/registry/propose-decision') { return; }` в `middleware.ts`.

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

1. Дизайнер сканирует макет, решения копятся в `clientStorage` локально.
2. По кнопке «Отправить N решений на согласование» плагин отправляет решения на backend-эндпоинт `POST /api/registry/propose-decision`. **Кнопка и весь новый UI-флоу пока не реализованы в плагине** — backend существует и верифицируется независимо через curl.
3. Backend: читает `sha` реестра из `main` → создаёт ветку `registry/propose-{timestamp}-{shortRandomId}` → коммитит обновлённый `decisions-registry.json` → открывает PR с `requested_reviewers: [RickOBrian]`.
4. При устаревшем `sha` (409 от GitHub) — backend возвращает нейтральную ошибку (`{ success: false }`).

## Порядок реализации — актуальный статус

1. ✅ Плагин закоммичен и запушен, смержен в PR #3.
2. ✅ Архитектура этапа 2 зафиксирована.
3. ✅ Переменные окружения `GITHUB_TOKEN` и `PLUGIN_SHARED_SECRET` добавлены в Vercel.
4. ✅ Backend-эндпоинт реализован в ветке `cursor/propose-decision-endpoint`, тесты 6/6, typecheck чист.
5. ⏳ Коммит и push кода эндпоинта — не выполнены на момент актуализации файла.
6. ⏳ Проверка восстановленной API-инфраструктуры на расхождения с main — не выполнена.
7. ⏳ Чек-лист перед PR (`git log origin/main..main` пуст, diff только по нужной папке) — не пройден.
8. ⏳ Открытие PR, ручная верификация (curl-сценарии, проверка PR/ветки в GitHub), мердж.
9. ⏳ Обновление UI плагина под новый флоу «Отправить N решений на согласование».
10. ⏳ Валидация/инвалидация записей реестра при загрузке (этап 3).

## Примечание о синхронизации этого файла

Этот файл — общий источник правды и для промтов через Perplexity Space, и для прямой работы с Cursor. При расхождении между версией в Perplexity Space и версией в репозитории — **репозиторий считается источником правды**. `.claude/` как путь для инфраструктурных файлов был отменён — все guide-файлы и этот документ живут в `skills/_shared/`, без `.claude/` в пути.
