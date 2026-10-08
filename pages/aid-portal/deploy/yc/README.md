# Presentbook в Яндекс Облаке

Решение — ADR-038. Каталог `presentbook`. Сайт — https://aidteam.pro
(переключён 2026-10-03), превью — https://preview.aidteam.pro/pr-N/.
Vercel больше не используется: резерв `aid-ds` снят решением PD 2026-10-06,
`middleware.ts` и `vercel.json` удалены (этап 7).

## Как устроено

| Адрес | Шлюз | Что отдаёт |
|---|---|---|
| `aidteam.pro/` и маршруты SPA | `presentbook-site` | `index.html` из бакета `presentbook-site` (object_storage, `error_object`) |
| `aidteam.pro/assets|icons|guides/...` | `presentbook-site` | файлы бакета через http-прокси — с их настоящим типом |
| `aidteam.pro/api/login|session|plugin-version` | оба | функция `presentbook-api`, версия с меткой `prod` |
| `preview.aidteam.pro/pr-N/api/...` | `presentbook-preview` | версия `prod` переадресует в версию с меткой `pr-N` — код `api/` из этого PR; нет такой версии — отвечает сама |
| `preview.aidteam.pro/pr-N/...` | `presentbook-preview` | функция `presentbook-api` раздаёт `pr-N/...` из бакета `presentbook-preview`, маршрут без файла → `pr-N/index.html` |

Почему так, а не проще, — прототип 2026-10-02:

- интеграция object_storage отдаёт всё, кроме HTML, как `text/plain`, и
  браузер не запускает модульный JS;
- маршрут «параметр–литерал» (`/{pr}/assets/{path+}`) шлюз разбирает неверно.

Обе особенности не описаны в документации YC — их сторожит
`deploy/yc/smoke.sh` после каждой выкладки.

Вход — вариант 1а ADR-038: статика открыта, интерфейс закрывает клиент
(`AuthGate.tsx` → `GET /api/session`). Пока в Lockbox заглушки `CHANGE_ME`,
функция никого не пускает (`authConfigured` в `handler.ts`).

## Файлы

| Файл | Что это |
|---|---|
| `adapter.ts` | событие Cloud Functions ↔ `Request`/`Response`; обработчики `api/*.ts` не меняются |
| `handler.ts` | функция `presentbook-api`: маршруты `/api/*` и раздача превью |
| `build-function.mjs` | сборка функции в один файл: `npm run build:yc-function` |
| `site.yaml`, `preview.yaml` | спецификации шлюзов с подстановками |
| `apply-gateways.sh` | применить спецификации (вручную, не из CI) |
| `smoke.sh` | смоук-тест выкладки: типы, SPA-пути, API |

Выкладку делает `.github/workflows/presentbook-yc.yml`.

## Ресурсы

| Ресурс | Имя |
|---|---|
| Бакеты (чтение открыто) | `presentbook-site`, `presentbook-preview` |
| Функция | `presentbook-api` |
| Шлюзы | `presentbook-site`, `presentbook-preview` |
| Сервисные аккаунты | `presentbook-runtime` — функция и шлюзы; `presentbook-ci` — GitHub Actions |
| Lockbox | `presentbook-auth`: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`, `AUTH_COOKIE_SECRET`; `presentbook-github`: `GITHUB_RELEASES_TOKEN`; `presentbook-ttm`: `TTM_DATA` — данные страницы `/ttm` |
| Сертификаты | `presentbook-aidteam-pro`, `presentbook-preview-aidteam-pro` |

Роли назначает PD (у рабочего аккаунта роль `editor`, назначать роли он не может):

| Кому | Роль | Где |
|---|---|---|
| `presentbook-runtime` | `storage.viewer` | каталог — шлюз читает `index.html` |
| `presentbook-runtime` | `functions.functionInvoker` | каталог — шлюз вызывает функцию |
| `presentbook-runtime` | `lockbox.payloadViewer` | секреты `presentbook-auth`, `presentbook-github`, `presentbook-ttm` |
| `presentbook-ci` | `storage.editor` | каталог — выкладка и удаление превью |
| `presentbook-ci` | `functions.editor` | каталог — новая версия функции |
| `presentbook-ci` | `iam.serviceAccounts.user` | аккаунт `presentbook-runtime` — функция работает от его имени |
| `presentbook-ci` | `lockbox.viewer` | секреты `presentbook-auth`, `presentbook-github` — `yc` без `version-id` сам находит текущую версию секрета; без роли «flag --secret Permission denied» (первая выкладка, 2026-10-03). `lockbox.payloadViewer` CI не нужна: снята 2026-10-03, выкладка проходит с одной `lockbox.viewer` |

После смены значений в Lockbox нужна новая версия функции: она привязывает
версию секрета на момент выкладки. Её делает следующий push в `main`.

## Версии функции: `prod` и `pr-N`

Шлюзы вызывают функцию по метке `prod`, не `$latest`. Метку `prod` ставит
только выкладка из `main`. Каждый PR выкатывает свою версию с меткой `pr-N`;
сайт её не видит, а превью этого PR шлёт API-запросы в `/pr-N/api/...`
(`apiUrl` в `base.ts`), и версия `prod` переадресует их в `pr-N` — вызов
функции по метке с `integration=raw` и IAM-токеном своего сервисного
аккаунта (`invokePreviewVersion` в `handler.ts`). При закрытии PR метка
`pr-N` снимается.

Версии PR работают с теми же секретами Lockbox, что и `prod`: превью
собираются только для PR из этого репозитория, не из форков.

Откат функции — перенести метку `prod` на прошлую версию:
`yc serverless function version set-tag --id <версия> --tag prod`.

## Страница КПД команды: `/ttm` (AID-13)

Данные страницы закрытые (решение PD «1 а»): репозиторий публичный, и в
коде только вёрстка (`TtmPage.tsx`) и формулы (`ttmModel.ts`). Данные — JSON
в секрете Lockbox `presentbook-ttm`, ключ `TTM_DATA`; форма —
`api/_lib/ttm.ts`.

- `GET /api/ttm` отдаёт JSON только с валидной сессией, без неё — 401.
- Функция читает секрет при запросе, через Lockbox Payload API с IAM-токеном
  своего сервисного аккаунта, а не переменной окружения: у функции на все
  переменные 4 КБ, а JSON — около 11 КБ. Ответ экземпляр держит 5 минут,
  поэтому новая версия функции после правки данных не нужна.
- В CI секрет не читается: в функцию передаётся только его id
  (`TTM_SECRET_ID` из переменной репозитория `YC_LOCKBOX_TTM_ID`; пусто —
  `none`, и `/api/ttm` с сессией отвечает 503).
- Превью данные не получает: `/pr-N/api/ttm` — 404 даже с сессией. Это
  ограничение в коде: версия `pr-N` работает с той же ролью, что и `prod`, и
  PR, меняющий `api/ttm.ts` или `handler.ts`, нужно читать с этим в голове.
- Ошибки чтения пишутся в журнал только статусом, без тела и данных.
- Ссылок на страницу в меню и на других страницах портала нет (решение PD).

Правка данных — новая версия секрета:

```bash
jq -n --rawfile v aid-ttm-data.json '[{key: "TTM_DATA", text_value: $v}]' \
  | yc --profile presentbook lockbox secret add-version --name presentbook-ttm --payload -
```

Локально `npm run dev` берёт данные из `ttm-data.local.json` рядом с
порталом, если он есть (в `.gitignore`).

## История релизов плагина

Changelog на странице Token Comparator строится из релизов GitHub. Список
релизов тянется в Облако дольше 9 секунд (2026-10-06), поэтому его собирает
CI на раннере GitHub — задача «Changelog плагина» в workflow, скрипт
`plugin-history.ts` — и кладёт в бакет сайта: `data/plugin-history.json`.
Функция читает файл по `PLUGIN_HISTORY_URL`. Обновляется при выкладке из
`main`, при публикации релиза и раз в 15 минут. Нет релизов в ответе
GitHub — скрипт падает, прежний файл остаётся.

