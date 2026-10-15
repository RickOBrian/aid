# Инфраструктура AID: где что лежит

Справка дежурного AI-инженера `AID · DevOps` (`../agents/devops.md`).
Источники — ADR-038, ADR-046, workflow в `.github/workflows/`. Значений
секретов здесь нет и не будет: только имена переменных и где они живут.
Правила работы с ключами — `../ORCHESTRATION.md` §4 «Секреты».

---

## 1. Облако

- Яндекс Облако, облако `aidteam`. Платёжный аккаунт — физлицо,
  бюджет-оповещение 500 ₽ в месяц (ADR-038).
- Домен `aidteam.pro`: регистратор reg.ru, DNS — Yandex Cloud DNS
  (NS `ns1/ns2.yandexcloud.net`), зона в каталоге `infra`.
- Каталог на контур, у каждого контура свой сервисный аккаунт с правами
  только в своём каталоге:

| Каталог | Что внутри |
|---|---|
| `presentbook` | Presentbook: бакеты сайта и превью, функция, шлюз |
| `registry-api` | API плагина Token Comparator: функция, шлюз |
| `team-tasks` | Сервис задач Team: функция, шлюз, база задач |
| `team-data` | База людей AID Team |
| `infra` | DNS-зона `aidteam.pro` |

- Устройство: статика — Object Storage; функции — Cloud Functions; вход,
  SPA-fallback и свой домен — API Gateway; сертификаты — Certificate
  Manager (Let's Encrypt); секреты — Lockbox.
- Работа из чатов — `yc` только под профилем своего контура
  (`--profile presentbook` / `registry-api` / `team-tasks`); `default` —
  админский вход PD.

---

## 2. Контуры

| Контур | Код | Адрес | Каталог | Чат |
|---|---|---|---|---|
| Presentbook | `pages/aid-portal/` | `aidteam.pro`, превью `preview.aidteam.pro/pr-N/` | `presentbook` | AID · Site · Presentbook |
| Token Comparator (API плагина) | `tools/figma-token-comparator/server/` | `api.aidteam.pro` | `registry-api` | AID · Plugin · Token Comparator |
| Team (сервис задач) | `tools/aid-team/service/` | `team.aidteam.pro` — шлюз и домен ещё не заведены | `team-tasks` | AID · AI Ops · Team |

### Выкладка

| Контур | Workflow | Когда | Что делает |
|---|---|---|---|
| Presentbook | `presentbook-yc.yml` | push в `main` по путям портала, гайдов, токенов, компонентов | сборка → бакет сайта → `aidteam.pro` |
| | | pull request | сборка с `base=/pr-N/` → бакет `presentbook-preview/pr-N/`, смоук-тест, комментарий со ссылкой в PR |
| | | закрытие PR | удаление `presentbook-preview/pr-N/` |
| | | расписание | changelog плагина |
| Token Comparator | `registry-api-deploy.yml` | push в `main` по `tools/figma-token-comparator/server/**` | функция и шлюз `api.aidteam.pro` |
| Team | `team-service.yml` | pull request | тесты сервиса |
| | | push в `main` по `tools/aid-team/service/**` | выкладка функции `team-tasks` |
| Все | `checks.yml` | каждый PR и push | тесты и сборка всех продуктов |

### Переменные GitHub (только имена)

| Контур | Variables | Secrets |
|---|---|---|
| Presentbook | `YC_FOLDER_ID`, `YC_RUNTIME_SA_ID`, `YC_LOCKBOX_AUTH_ID`, `YC_LOCKBOX_GITHUB_ID`, `PRESENTBOOK_SITE_URL`, `PRESENTBOOK_PREVIEW_URL` | `YC_CI_SA_KEY_JSON`, `YC_S3_ACCESS_KEY_ID`, `YC_S3_SECRET_KEY` |
| Token Comparator | `YC_REGISTRY_API_FOLDER_ID`, `YC_REGISTRY_API_RUNTIME_SA_ID`, `YC_REGISTRY_API_LOCKBOX_ID` | `YC_REGISTRY_API_CI_KEY` |
| Team | `YC_TEAM_TASKS_FOLDER_ID`, `YC_TEAM_TASKS_RUNTIME_SA_ID`, `YC_TEAM_TASKS_LOCKBOX_ID`, `YC_TEAM_TASKS_YDB_DATABASE` | `YC_TEAM_TASKS_CI_KEY` |

На 2026-10-14 переменные и секрет Team ещё не заведены — выкладка Team с
`main` падает на шаге «Войти в Облако» ожидаемо; команды для PD выдаёт
Team после шлюза.

### Кто что делает

- Выкладка и правка контура — в чате контура, под его профилем.
- Консоли, ключи, секреты, удаление ресурсов, мерж `.github/` — PD.
- Infra смотрит снаружи и читает GitHub Actions; в Облаке ничего не
  перезапускает и не пересоздаёт.

---

## 3. Как проверить снаружи

Без входа в Облако, с любой машины:

```bash
curl -s -o /dev/null -m 15 -w '%{http_code}\n' https://aidteam.pro
```

| Признак | Что значит |
|---|---|
| `dig +short <адрес>` пуст | нет DNS-записи (наша зона или Cloud DNS) |
| HTTP-ответа нет: таймаут или «Connection reset», а `github.com` отвечает | лежит API Gateway — смотреть status.yandex.cloud |
| HTTP 5xx | шлюз жив, падает функция — логи контура |
| HTTP 200, старое содержимое | выкладка не прошла — GitHub Actions контура |

Судить только по HTTP-ответу. Проверки портов (`nc -z`, «TCP
соединяется») недостоверны: VPN или прокси на машине проверяющего может
принимать соединения на любой порт любого адреса. Так было 2026-10-14
на машине PD.

Статус Облака — `status.yandex.cloud`, зона `ru`. Вкладка «История
событий» во время крупного сбоя может показывать недостоверные данные —
опираться на «Актуальный статус».

---

## 4. Отключение Vercel `aid-registry-api` (AID-15, ADR-038 этап 7)

Состояние на 2026-10-14, проверено снаружи:

- `aid-registry-api.vercel.app/api/registry` отвечает 200 — проект жив;
- Git-интеграция подключена: последний деплой `vercel[bot]` —
  2026-10-07 (Production);
- `aid-ds.vercel.app` — `DEPLOYMENT_NOT_FOUND`, запасной Presentbook на
  Vercel уже не отдаётся;
- `tools/figma-token-comparator/manifest.json` ещё разрешает
  `aid-registry-api.vercel.app`, есть `server/vercel.json` — уходят
  следующим релизом Token Comparator.

Условие начала: Token Comparator подтвердил, что старый адрес никто не
вызывает.

Шаги PD — vercel.com → проект `aid-registry-api`:

1. **Логи.** Logs / Observability → запросы к `/api/registry*` за
   доступный период. Есть вызовы помимо проверок Token Comparator —
   остановиться, сообщить Token Comparator. Хранение логов на Hobby
   короткое: пустые логи не доказывают отсутствие вызовов.
2. **Disconnect Git.** Settings → Git → Disconnect. PR перестают
   получать деплои `vercel[bot]`.
3. **Delete Project.** Settings → General → Delete Project. Прежний
   `PLUGIN_SHARED_SECRET` уходит вместе с проектом; действующий — в
   Lockbox `registry-api` (ADR-038).
4. **Отзыв токена.** Сервер на Vercel ходил в GitHub через переменную
   `GITHUB_TOKEN`.

   > ⚠️ **До отзыва — сверить, что `api.aidteam.pro` в Облаке работает
   > на другом токене** (Lockbox `registry-api`). Если токен тот же,
   > отзыв положит `api.aidteam.pro`. Сверяет чат Token Comparator, когда
   > Облако доступно.

   Затем — отзыв в GitHub → Settings → Developer settings; проверить
   Vercel → Account → Tokens.

Шаги 2–4 — удаление ресурсов и секреты: только PD. После этапа 7 —
правка правил по «Следствиям» ADR-038.

---

## 5. Сбои

### 2026-10-14 · Недоступность зон Yandex Cloud

Причина — на стороне Облака; наши ресурсы не трогали. Время — UTC
(МСК = UTC+3). Источник: команды и логи `yc` чата Team, проверки Infra
снаружи.

| UTC | Что |
|---|---|
| 07:44:35 | последний успешный вызов Облака — версия функции `team-tasks` создана |
| 07:45:01 | первый отказ: `yc serverless api-gateway create` → `Unavailable`; то же для `api-gateway list` из профилей `team-tasks` и `presentbook` |
| ~07:47 | `aidteam.pro`, `api.aidteam.pro`, `*.apigw.yandexcloud.net` — TLS «Connection reset by peer»; консоль и github.com отвечают |
| 07:50:21 | последняя проверка Team — по-прежнему `Unavailable` |
| 08:51 | `aidteam.pro`, `api.`, `preview.` — HTTP-ответа нет (таймаут); консоль не отвечает; status.yandex.cloud — «Недоступность зон Yandex Cloud», зона `ru` почти целиком Unavailable |
| 09:57–09:58 | управление частично вернулось: выкладка PR загрузила файлы в бакет и создала версию функции `presentbook-api`; смоук-тест через шлюз висел до 11:10 и упал |
| 13:21 | `aidteam.pro`, `api.`, `preview.` — по-прежнему таймаут; консоль и Object Storage отвечают; статус — без изменений |
| 19:06:51 | **восстановлено не позже этого времени**: смоук-тест выкладки Presentbook через шлюз прошёл |

Точного времени восстановления шлюза нет: оно между 13:21 и 19:06 UTC.
Сбой шлюза — не меньше 5,5 часа, не больше 11,5 часа.

Затронуто: Presentbook, API плагина (решения из плагина не уходят),
выкладки всех контуров, консоль.

На время сбоя PD поднял копию Presentbook на своём сервере — раздел 6.

---

## 6. Резерв: копия Presentbook на Selectel

Решение PD 2026-10-15 (`../BOARD.md` → «Решения PD»): копия остаётся
**запасной**, работаем полностью в Яндекс Облаке; вопросы и задачи по
копии закрыты.

- Сервер PD на Selectel, адрес `https://<IP>.sslip.io`. IP в репозиторий
  не пишется — у PD и в Штабе.
- `aidteam.pro` и DNS на копию не переключены. Переключение при
  следующем сбое — отдельное решение PD.
- Код — ветка `infra/selectel-mirror`, `pages/aid-portal/deploy/node/`
  (установщик, `update.sh`, юниты, nginx). В `main` не идёт.
- Сейчас на копии `main` от 2026-10-14 (`50cfaf0`, #212), обновления
  нет. Автообновление готово в ветке (адаптер `0761858`), но не
  установлено: таймер `presentbook-update.timer` раз в 2 минуты сверял
  бы `main`, сборка — под пользователем `pbbuild`, root только
  раскладывает готовое, выложенный коммит — `/version.json`. Установка —
  один запуск установщика с `ADAPTER_REF=0761858…` по решению PD.
- Вход — тот же логин и пароль, что у Presentbook; ключ cookie свой.
  `/api/ttm` на копии закрыт.
- На сервере есть чужой сайт; копия живёт рядом и его не трогает.
  Системный Node не меняется: сборка идёт своим Node 24 в
  `/opt/presentbook/node` (владелец root, сверка SHA-256).
- Infra на сервер сам не заходит; разовые действия — только по «да» PD.
