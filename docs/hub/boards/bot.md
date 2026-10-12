# Доска BOT — Штаб инженера бота

<!-- Шаблон из набора https://github.com/RickOBrian/aid/tree/main/docs/hub/kit.
     Публичный репозиторий — только роли, никаких имён и контактов. -->

Активные задачи по чатам. Ведёт «AID · Hub · Штаб» инженера бота
(`../ORCHESTRATION.md` §9, ADR-041). Задачи — `AID-BOT-<n>`. Строка
закрывается ссылкой на PR или решение.

Решения в этом Штабе принимает **инженер бота** — только по своему
продукту (Bot · Request). Чужие продукты — issue владельцу (`hub`,
`to:<продукт>`), системный уровень — плюс `decision:pd`.

Статусы: `в работе` · `ждёт инженера` · `ждёт PD` · `ждёт <чат>` · `блокер` · `сверить` · `отложено`

## Чаты

| Чат | Папка | Что правит | Вход в контекст |
|---|---|---|---|
| AID · Hub · Штаб | `~/Projects/aid-hub` | `docs/hub/boards/bot.md` | `docs/hub/ORCHESTRATION.md` → эта доска |
| AID · Bot · Request | `~/Projects/aid-bot-request`, клон репозитория бота | весь репозиторий бота | его `CLAUDE.md` → `BOT-OVERVIEW.md` |

Код бота — во внешнем приватном репозитории `effects121-lang/ds-request-bot`.
Контракт бота с продуктами AID — `tools/aid-bot/` в этом репозитории, ведёт
PD; правки в нём — через PR PD, инженер бота — ревьюер.

## Источники для `/plan`

Кроме источников из `.claude/skills/plan/SKILL.md` (с поправкой: доска —
этот файл, решения — «Решения инженера» ниже, вопросы — к инженеру бота):

- issues в `RickOBrian/aid` с меткой `to:bot-request`, а также issues с
  `hub`, где в тексте упомянут бот, пока метку не поставили;
- открытые вопросы контракта: `tools/aid-bot/OPEN-QUESTIONS.md` на
  `origin/main`;
- PR и CI бота: `gh pr list --repo effects121-lang/ds-request-bot --state open`.

## Активные

| ID | Чат | Задача | Статус |
|---|---|---|---|
| AID-BOT-5 | Bot | AID-12 Штаба PD — уведомления в Telegram о задачах между Штабами (ADR-042, `../ORCHESTRATION.md` §9): опрос GitHub вместо webhook ([#136](https://github.com/RickOBrian/aid/issues/136)), контракт уведомлений [#137](https://github.com/RickOBrian/aid/pull/137) v0.2.0, срок 15.10. 2026-10-08: Request changes в #137 — R3 при закрытии issue, R7 в задачах без метки `hub`, ответ `/start` посторонним, разбор комментариев через issue | ждёт PD: v0.3.0 по ревью #137 |
| AID-BOT-6 | Bot | AID-6 Штаба PD — пилот «плагин в боте всегда актуальный»: контракт `tools/aid-bot/contracts/plugin-release.md` ([#71](https://github.com/RickOBrian/aid/pull/71)). Код в `main` бота: PR #4 (2026-10-09) и #5 — анонс не теряется из-за разметки | ждёт инженера: проверка §8 на сервере, затем отчёт в #71 |
| AID-BOT-7 | Hub | Контракт `plugin-release.md` v0.2.0 по ревью чата Bot · Request — PD выпустил [#170](https://github.com/RickOBrian/aid/pull/170), сверен с кодом бота: совпадает | ждёт инженера: Approve #170 |
| AID-BOT-8 | Bot | Follow-up ревью #4 от чата Bot · Request: обрезка заметок и повтор анонса — закрыты в #5 (чат бота); таймаут скачивания и `Accept` — PR #6 (Штаб); откат и возврат Latest дают повторный анонс — в контракт | ждёт инженера: мерж PR #6 |

## Вопросы инженера

Списки, собранные скиллом `/plan`: `PLAN-<дата>`, пункты с приоритетом
P0–P3, источник. Пункт закрывается ссылкой на строку в «Решениях».

_Пока списков нет._

## Решения инженера

Формулировка — дословно. Запись на `main` — разрешение начать работу.

| Дата | Задача | Кому | Решение (дословно) |
|---|---|---|---|
| 2026-10-12 | AID-BOT-6, AID-BOT-8 | Чат Bot · Request | «а» — код бота по AID-BOT-6 и его follow-up (AID-BOT-8) пишет Штаб; чат Bot · Request — ревью. Так чаты не правят бота наперегонки |
| 2026-10-06 | AID-BOT-3 | Штаб LU, [#98](https://github.com/RickOBrian/aid/issues/98#issuecomment-6016709105) | «Бэкенд у LU, бот опрашивает» |

## Закрыто

| ID | Чат | Что | Итог |
|---|---|---|---|
| AID-BOT-3 | Bot | Ответ Штабу LU по этапу 7 плагина | решение в [#98](https://github.com/RickOBrian/aid/issues/98#issuecomment-6016709105) |
| AID-BOT-1 | Все | Переход на оркестрацию: имена, группа, работа из своей папки | 2026-10-06: папка сменена (`BOARD.md`, AID-1 · Bot) |
| AID-BOT-2 | Hub | Путь к доске в `owners.json` → `board` ([#99](https://github.com/RickOBrian/aid/issues/99)) | 2026-10-08: [#100](https://github.com/RickOBrian/aid/pull/100) смержен, путь вписан в `owners.json` |
| AID-BOT-4 | Bot | Опрос бэкенда предложений LU и уведомления в Telegram — по решению в [#98](https://github.com/RickOBrian/aid/issues/98#issuecomment-6016709105) | 2026-10-08: реализовано в репозитории бота, PR #2 «События Library Updater в Telegram и /link» смержен |
