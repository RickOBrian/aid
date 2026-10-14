# AID Team — сервис задач

Сервис задач команды на `team.aidteam.pro` — ADR-046,
`docs/hub/ORCHESTRATION.md` §10. Продукт «AID · Ops · Team», третий
деплой-контур. Данных о людях здесь нет: репозиторий публичный.

## Решения PD

- 2026-10-13, ADR-046 — сервис задач, поля, статусы, `/team-key`, перенос.
- 2026-10-13, в этом чате: «1 приложение GitHub, 2 ты, 3 писать по
  ключу, 4 имя полностью, фамилия буква+точка» — `/team-key` через GitHub
  OAuth App с Device Flow; инфраструктуру создаёт Team под входом PD;
  читать открыто, писать по личному ключу; отображаемое имя «Имя Ф.».

## Устройство

| Что | Где |
|---|---|
| Каталог Облака | `team-tasks` — отдельно от `team-data`: в сервисе только логины |
| База | YDB serverless `team-tasks`, ежедневный бэкап (7 дней) |
| API | Cloud Function за API Gateway, `https://team.aidteam.pro/v1/…` |
| Сертификат | Certificate Manager `team-aidteam-pro`, Let's Encrypt, проверка CNAME в зоне `aidteam.pro` |
| Секреты | Lockbox `team-tasks-secrets`: `KEY_PEPPER` (хэширование личных ключей) |
| Вход GitHub | OAuth App «AID Team», Device Flow, Client ID `Ov23litYvK5To9WhHv6Z` (не секрет; секрет приложения не создан и не нужен) |
| Код | `tools/aid-team/service/` (этап 2) |
| Деплой | GitHub Actions, workflow — этап 2 (мерж PD: `.github/`) |

Сервисные аккаунты каталога `team-tasks`:

| Аккаунт | Права |
|---|---|
| `team-tasks-runtime` | `ydb.editor`, `functions.functionInvoker` на каталог; чтение `team-tasks-secrets` |
| `team-tasks-ci` | `functions.editor`, `api-gateway.editor`; запуск функции от имени runtime; описание `team-tasks-secrets` |
| `team-tasks-claude` | `editor` только в `team-tasks` — профиль `yc` этого чата `team-tasks` |

## Таблицы (этап 2)

| Таблица | Что |
|---|---|
| `tasks` | задача: id `<продукт>-<n>`, поля §10 |
| `events` | каждая правка: кто, когда, что было и стало — история задачи и лента для бота; только дописывание |
| `counters` | следующий номер в каждом продукте, выдаётся в транзакции |
| `keys` | хэш личного ключа → логин, когда выдан, отозван ли |

Коды продуктов: `hub`, `standards`, `presentbook`, `token-comparator`,
`style-migration`, `mcp`, `bot-request`, `team`, `library-updater`,
`components-swapper` (§10). Люди — логины из `docs/hub/owners.json` на
`main`.

## API v1

| Запрос | Ключ | Что |
|---|---|---|
| `GET /v1/tasks` | нет | список; `status`, `product`, `assignee`, `updatedSince`, `limit` (200, до 500), `cursor`; `include=history` |
| `GET /v1/tasks/{id}` | нет | задача с историей |
| `GET /v1/events?after=` | нет | лента событий для бота |
| `POST /v1/tasks` | личный | новая задача → id |
| `PATCH /v1/tasks/{id}` | личный | статус, «ждёт», исполнители, ссылки, описание |
| `POST /v1/keys` | вход GitHub | выдача личного ключа (`/team-key`) |
| `DELETE /v1/keys/current` | личный | отзыв своего ключа |
| `GET /v1/me` | личный | чей ключ |

Ответы списка и задачи — по контракту с Presentbook: `id, product,
number, title, description, author, assignees[], relatedProducts[],
status, waitingOn, links[], history[], createdAt, updatedAt`; `ETag` и
`304`; ошибки `{error, message}` с 401/403/404.

## Личный ключ — `/team-key`

1. Скилл показывает код и ссылку `github.com/login/device` (GitHub OAuth
   App «AID Team», Device Flow, без прав доступа).
2. Человек подтверждает в браузере; скилл получает токен без прав и
   отправляет его в `POST /v1/keys`.
3. Сервис спрашивает GitHub «кто это», сверяет логин с `owners.json`,
   создаёт ключ, хранит только его хэш.
4. Ключ сразу уходит в связку ключей macOS (`security
   add-generic-password -s team.aidteam.pro -a <логин>`), на Linux — файл
   с правами 0600; на экран и в чат не выводится. Работает одинаково в
   Claude Code и Cursor.

## Код

| Файл | Что |
|---|---|
| `service/src/app.js` | маршруты API v1, права, ETag |
| `service/src/model.js` | поля задачи, статусы, проверка ввода, история |
| `service/src/ydb-store.js` | YDB: номер задачи и запись — в одной транзакции; правка — с проверкой, что задачу не изменили (409) |
| `service/src/sources.js` | `owners.json` с `main`, вход GitHub, имена «Имя Ф.» |
| `service/src/keys.js` | ключи и их хэш (`KEY_PEPPER`) |
| `service/src/index.js` | вход Cloud Function |
| `service/scripts/init-db.js` | создание таблиц (один раз) |
| `service/test/*.test.js` | тесты маршрутов в памяти — `npm test`, в CI |
| `service/test/ydb.int.js` | проверка на настоящей YDB в отдельной папке таблиц `test/` |
| `bin/team-key`, `bin/team-api` | ключ человека и запросы с ним — для скиллов в Claude Code и Cursor |
| `.claude/skills/team-key/` | скилл `/team-key` |
| `.github/workflows/team-service.yml` | тесты на PR, выкладка с `main`, смоук-тест |

Имена «Имя Ф.» отдаются только по сервисному ключу (решение PD
2026-10-14: «Давай тогда логин, но "Команда AID" можно не указывать»);
файл имён `aidteam-team-names/names.json` строится из `people.json`
так же, как `telegram.json` для бота.

## Состояние

- 2026-10-14 — этап 1: каталог, YDB, сервисные аккаунты, Lockbox,
  профиль `team-tasks`, запрос сертификата и CNAME для его проверки.
  GitHub OAuth App «AID Team» зарегистрирован PD, Device Flow проверен.
- 2026-10-14 — этап 2: таблицы `tasks`, `events`, `counters`, `keys`
  созданы; код и 13 тестов; проверка на YDB пройдена (номера по продуктам,
  права, история, лента, конфликт правки 409, отзыв ключа); функция
  `team-tasks` создана, первая версия выложена вручную. Шлюз и домен — после
  сбоя Облака 2026-10-14 (API Gateway недоступен) и выпуска сертификата.
  Ждут PD: ключ CI в GitHub Secrets (этап 2); имена в открытом чтении.
