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
| AID-BOT-5 | Bot | AID-12 Штаба PD — уведомления в Telegram между Штабами (ADR-042, `../ORCHESTRATION.md` §9), опрос GitHub ([#136](https://github.com/RickOBrian/aid/issues/136)), контракт [#137](https://github.com/RickOBrian/aid/pull/137), срок 15.10. После ADR-046 — только R4–R7 (`for:`, `decision:pd`, `to:<продукт>`, упоминания в issues с `hub`); R1–R3 не делаются (решение PD в #136); события сервиса задач — отдельный контракт с Team. В #136 ответ: ключ бота читает только `aidteam-team-bot`. Код R4–R7 — PR #10 в репозитории бота, на сервере с 2026-10-14: источники читаются, опрос раз в 30 с без ошибок | ждёт PD: тест меткой `for:effects121-lang` и v0.3.0 по R4–R7 |

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
| AID-BOT-8 | Bot | Follow-up ревью #4: таймаут скачивания и `Accept` | 2026-10-13: PR #6 смержен и на сервере; пункты 1–2 — PR #5 |
| AID-BOT-9 | Bot | Исходящие через GitHub: issue с меткой `bot:send` в репозитории бота → сообщение в Telegram (PR #7) — Штаб пишет через бота | 2026-10-13: включено на сервере, `GH_TOKEN` (только репозиторий бота, Issues: read and write); первая отправка доставлена, бот ответил в issue и закрыл её |
| AID-BOT-6 | Bot | AID-6 Штаба PD — пилот «плагин в боте всегда актуальный» | 2026-10-13: на сервере (PR #4–#6), проверка §8 пройдена, отчёт в [#71](https://github.com/RickOBrian/aid/pull/71) |
| AID-BOT-7 | Hub | Контракт `plugin-release.md` v0.2.0 по ревью чата Bot · Request | Approve владельца в [#170](https://github.com/RickOBrian/aid/pull/170); ждёт мержа PD |
