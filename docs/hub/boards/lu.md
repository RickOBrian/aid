# Доска LU — Штаб инженера Library Updater

<!-- Шаблон из набора https://github.com/RickOBrian/aid/tree/main/docs/hub/kit.
     Публичный репозиторий — только роли, никаких имён и контактов. -->

Активные задачи по чатам. Ведёт «AID · Hub · Штаб» инженера Library Updater
(`../ORCHESTRATION.md` §9, ADR-041). Задачи — `AID-LU-<n>`. Строка
закрывается ссылкой на PR или решение.

Решения в этом Штабе принимает **инженер Library Updater** — только по
своему продукту. Чужие продукты — issue владельцу (`hub`, `to:<продукт>`),
системный уровень — плюс `decision:pd`.

Статусы: `в работе` · `ждёт инженера` · `ждёт PD` · `ждёт <чат>` · `блокер` · `сверить` · `отложено`

## Чаты

| Чат | Папка | Что правит | Вход в контекст |
|---|---|---|---|
| AID · Hub · Штаб | `<рабочая папка>/AID/aid-hub` | `docs/hub/boards/lu.md` | `docs/hub/ORCHESTRATION.md` → эта доска |
| AID · Plugin · Library Updater | клон `arturuxui/figma-library-updater` | весь репозиторий плагина | его `CLAUDE.md` → `docs/PLAN.md` |

Код плагина — во внешнем репозитории `arturuxui/figma-library-updater`.

## Источники для `/plan`

Кроме источников из `.claude/skills/plan/SKILL.md` (с поправкой: доска —
этот файл, решения — «Решения инженера» ниже):

- PR и CI плагина: `gh pr list --repo arturuxui/figma-library-updater --state open`;
- issues в `RickOBrian/aid` с меткой `to:plugin-library-updater` — после
  регистрации продукта (AID-LU-2).

## Активные

| ID | Чат | Задача | Статус |
|---|---|---|---|
| AID-LU-2 | Hub | Library Updater — продукт AID: строка в таблицах чатов и владельцев, метка `to:plugin-library-updater`, роль в `owners.json` — [#93](https://github.com/RickOBrian/aid/issues/93) | ждёт PD |
| AID-LU-3 | Hub | Проверки для PR из форка, мерж #92 и как Штаб LU обновляет свою доску: PR из форка каждый раз или доступ на запись — [#94](https://github.com/RickOBrian/aid/issues/94) | ждёт PD |
| AID-LU-4 | Plugin · Library Updater | `docs/PLAN.md`: 6б отметить «проверено в Figma» (инженер подтвердил 2026-10-06 в чате этапа 6а, шаг 2) | в работе |
| AID-LU-5 | Plugin · Library Updater | Проверка записи в Figma: 4б Градиенты, 4в Glass, 6а шаг 1, 6в кнопки запуска; вопрос `ALL_SCOPES` у `Controls/*` в Driver — исправить или в `acceptedScopes` | ждёт инженера |

## Вопросы инженера

Списки, собранные скиллом `/plan`: `PLAN-<дата>`, пункты с приоритетом
P0–P3, источник. Пункт закрывается ссылкой на строку в «Решениях».

_Пока списков нет._

## Решения инженера

Формулировка — дословно. Запись на `main` — разрешение начать работу.

| Дата | Задача | Кому | Решение (дословно) |
|---|---|---|---|

## Закрыто

| ID | Чат | Что | Итог |
|---|---|---|---|
| AID-LU-1 | Все | Переход на оркестрацию: имена, группа, работа из своей папки | Готово 2026-10-06: CLAUDE.md плагина — [arturuxui/figma-library-updater#21](https://github.com/arturuxui/figma-library-updater/pull/21); чат плагина в своём клоне на `main` = `29a10c7`, правок в aid и aid-hub нет |
