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
| `POST /v1/keys` | вход GitHub | выдача личного ключа (`/team-key`); с `agent` — ключа AI-инженера |
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

### Ключ AI-инженера — `team-key --agent ai-<роль>`

ADR-047. Тот же вход GitHub, в `POST /v1/keys` уходит ещё `agent`. Выдаёт
хозяин машины — человек из `people[]` `owners.json`; `agent` — id из
`agents[]` там же. В таблице `keys`: `kind: "agent"`, `login` — хозяин
машины, `name` — id AI. Ключ `aida_…` лежит отдельно от личного: в связке
сервис `team.aidteam.pro/agent/<id>`, на Linux —
`~/.config/aidteam/agent-<id>`. Запросы — `team-api --agent <id> …`.

- Правка ключом AI в истории и ленте: `by: "ai-team"`, `via: "<логин>"`
  → «ai-team (у @логин)». Колонка `events.via` (`init-db` дописывает
  недостающие колонки в существующие таблицы).
- Права AI — свои, не хозяина: правит задачи, где он автор или
  исполнитель; AI на машине PD не получает прав PD.
- Ключ перестаёт работать (403), когда AI или хозяина машины убрали из
  `owners.json`; отзыв — `team-key --agent <id> --revoke`.
- `owners.json` format 2 тоже читается: без `agents[]` ключи AI не
  выдаются.
- Рабочей базе колонку `via` добавляет `init-db` **до** выкладки этого
  кода — выкладка `init-db` не запускает (DevOps · Team Service).

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

## Подключение выкладки — делает PD, один раз

Нужно для `.github/workflows/team-service.yml`. Выполнять после того, как
шлюз `team-tasks` создан. В Терминале, под своим входом; ключ CI сразу
уходит в GitHub и удаляется с диска.

1. Ключ аккаунта `team-tasks-ci` → секрет GitHub:
   ```bash
   yc iam key create --service-account-name team-tasks-ci --folder-name team-tasks --output ~/team-tasks-ci.json
   gh secret set YC_TEAM_TASKS_CI_KEY --repo RickOBrian/aid < ~/team-tasks-ci.json
   rm ~/team-tasks-ci.json
   ```
2. Переменные GitHub — не секреты, идентификаторы:
   ```bash
   gh variable set YC_TEAM_TASKS_FOLDER_ID --repo RickOBrian/aid --body b1g230iiimr8i7irovr3
   gh variable set YC_TEAM_TASKS_RUNTIME_SA_ID --repo RickOBrian/aid --body aje0f9vgvcllh5f1u3qa
   gh variable set YC_TEAM_TASKS_LOCKBOX_ID --repo RickOBrian/aid --body e6q3si45f6958tia6rmf
   gh variable set YC_TEAM_TASKS_YDB_DATABASE --repo RickOBrian/aid --body /ru-central1/b1gnift36qhqvibb4qti/etnrte1m4ushkmmq0uji
   ```
3. Перезапустить выкладку: GitHub → Actions → team-service → Run workflow
   (ветка `main`) или `gh workflow run team-service.yml --repo RickOBrian/aid --ref main`.

## Изменение схемы базы — до мержа

Выкладка (`.github/workflows/team-service.yml`) выкладывает только код и
`init-db` не запускает: у аккаунта CI нет роли на YDB, а роли — решение
PD. Поэтому, если PR меняет схему (новая таблица или колонка в
`scripts/init-db.js`):

1. В описании PR — пометка «меняет схему» и что именно.
2. **До мержа** DevOps · Team Service запускает на рабочей базе
   `node scripts/init-db.js` (без `TABLE_PREFIX`). Скрипт только создаёт
   недостающие таблицы и дописывает колонки, данных не трогает; старый код
   с новыми колонками работает.
3. Мерж — после того, как DevOps подтвердил прогон.

Удалять и переименовывать колонки так нельзя — это отдельное решение с
переносом данных.

## План: ADR-047 — AI-инженеры, куратор, входящие

Решения PD 2026-10-14 (`BOARD.md` «Решения PD»): метка AI у записей
(«1 у них пусть будет метка AI в отличие от людей…»); писать во входящие
может любой, «включая ботов»; чаты на машине человека читают его входящие
его личным ключом («да»). Защита от зацикливания и связь задачи с
запросом — схема Team, на утверждении PD.

1. **`owners.json` format 3** — `people[]` (`kind: "human"`) и `agents[]`
   (`kind: "ai"`, `id: "ai-<роль>"`, `card`, `curator`). Ключи по
   `/team-key` — только `kind: "human"`.
2. **Ключи AI-инженеров** — сделано, см. «Ключ AI-инженера». Вид `agent`: id роли + логин хозяина машины;
   выдаёт хозяин машины `team-key --agent <id>`. В истории: `by: "ai-team"`,
   `via: "<логин>"` → «ai-team (у @логин)».
3. **Куратор** — поле `curator` (логин человека); обязателен, если среди
   исполнителей есть AI; по умолчанию — `agents[].curator`.
4. **Входящие и журнал** — закрыто, только по ключу.

| Запрос | Кто | Что |
|---|---|---|
| `POST /v1/inbox/{addr}` | любой ключ | сообщение, `Idempotency-Key` (7 дней), `replyTo` → цепочка |
| `GET /v1/inbox/{addr}?after=&state=` | владелец адреса или PD | по порядку |
| `POST /v1/inbox/{addr}/ack` | владелец адреса | обработано |
| `POST /v1/inbox/{addr}/{id}/claim` | экземпляр AI | «взял», второй — 409 |
| `GET /v1/inbox/{login}?state=undelivered`, `POST …/delivered` | ключ `bot` | доставка человеку в Telegram |
| `POST/GET /v1/journal/{ai-id}` | ключ этого AI или PD | взял / сделал / решил / заметка |
| `POST /v1/files`, `GET /v1/files/{ref}` | любой ключ / владелец адреса | скрины: только изображения, до 10 МБ, 30 дней |

`{addr}` — id AI (`ai-*`), `bot` или логин человека. Входящие человека
читает только он своим ключом (на своей машине — и его AI-чаты) или PD.

- **Зацикливание:** 3 сообщения подряд в цепочке без человека — 409
  `loop_stopped` и событие куратору; не больше 30 в час от не-людей в одни
  входящие — 429.
- **Задача ↔ запрос:** ссылка `{type: "message", ref: "ai-requests/<id>"}`,
  `GET /v1/tasks?source=…`, лента `?source=ai-requests`.
- **Хранение:** сообщения — 90 дней после ack, неподтверждённые — 180;
  журнал — 1 год; файлы — 30 дней; TTL в YDB и Object Storage.
- Контракт бота — `tools/aid-bot/contracts/requests-intake.md` (#208).

Оценка после шлюза: owners.json — 0,5 ч; ключи AI — 0,5–1 день; куратор —
0,5 дня; входящие и журнал — 2–2,5 дня; шаг набора `kit` — 0,5 ч.

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
- 2026-10-14, вечер — после сбоя: шлюз `team-tasks` создан (временный адрес
  `d5db0pgp8s9h07kv61dp.l5v6loqa.apigw.yandexcloud.net`), API отвечает. Вход
  функции в YDB переведён на IAM-токен из context вызова: MetadataAuthService
  ydb-sdk требует ещё `@yandex-cloud/nodejs-sdk`. Сертификат
  `team.aidteam.pro` всё ещё на проверке — домен подключится после выпуска.
