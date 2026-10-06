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
| `aidteam.pro/api/login|session|plugin-version` | оба | функция `presentbook-api` |
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
| Lockbox | `presentbook-auth`: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`, `AUTH_COOKIE_SECRET`; `presentbook-github`: `GITHUB_RELEASES_TOKEN` |
| Сертификаты | `presentbook-aidteam-pro`, `presentbook-preview-aidteam-pro` |

Роли назначает PD (у рабочего аккаунта роль `editor`, назначать роли он не может):

| Кому | Роль | Где |
|---|---|---|
| `presentbook-runtime` | `storage.viewer` | каталог — шлюз читает `index.html` |
| `presentbook-runtime` | `functions.functionInvoker` | каталог — шлюз вызывает функцию |
| `presentbook-runtime` | `lockbox.payloadViewer` | секреты `presentbook-auth`, `presentbook-github` |
| `presentbook-ci` | `storage.editor` | каталог — выкладка и удаление превью |
| `presentbook-ci` | `functions.editor` | каталог — новая версия функции |
| `presentbook-ci` | `iam.serviceAccounts.user` | аккаунт `presentbook-runtime` — функция работает от его имени |
| `presentbook-ci` | `lockbox.viewer` | секреты `presentbook-auth`, `presentbook-github` — `yc` без `version-id` сам находит текущую версию секрета; без роли «flag --secret Permission denied» (первая выкладка, 2026-10-03). `lockbox.payloadViewer` CI не нужна: снята 2026-10-03, выкладка проходит с одной `lockbox.viewer` |

После смены значений в Lockbox нужна новая версия функции: она привязывает
версию секрета на момент выкладки. Её делает следующий push в `main`.
