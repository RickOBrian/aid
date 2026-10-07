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
| AID-LU-6 | Plugin · Library Updater + Bot · Request | Этап 7 плагина — предложения изменений через бота. Решение владельца бота в [#98](https://github.com/RickOBrian/aid/issues/98): «Бэкенд у LU, бот опрашивает». 7а — режим предложений без бэкенда, [arturuxui/figma-library-updater#24](https://github.com/arturuxui/figma-library-updater/pull/24); бэкенд и endpoint для бота — [#25](https://github.com/arturuxui/figma-library-updater/pull/25), передано в [комментарии к #98](https://github.com/RickOBrian/aid/issues/98#issuecomment-6032675668); ключ инженер передаёт лично. 7в — рассмотрение предложений владельцем, [#26](https://github.com/arturuxui/figma-library-updater/pull/26); новое событие `proposal.withdrawn` — [комментарий к #98](https://github.com/RickOBrian/aid/issues/98#issuecomment-6033648175). 7г (Telegram у дизайнера) — по решению инженера после AID-BOT-4 | ждёт владельца бота: AID-BOT-4 (события и `POST /bot/link`) |
| AID-LU-7 | Plugin · Library Updater | Полировка интерфейса: подсказки с образцами, поиск замены, тёмная тема — [arturuxui/figma-library-updater#27](https://github.com/arturuxui/figma-library-updater/pull/27) (смержен); шаг 2 — группы в списках переменных и стилей, подписи режимов, образцы ссылок — [#28](https://github.com/arturuxui/figma-library-updater/pull/28); дальше — черновик на виду, шапка и вкладки, размер окна | шаг 2 — ждёт проверки и мержа инженером |

## Вопросы инженера

Списки, собранные скиллом `/plan`: `PLAN-<дата>`, пункты с приоритетом
P0–P3, источник. Пункт закрывается ссылкой на строку в «Решениях».

### PLAN-2026-10-07

| # | P | Задача | Вопрос | Источник | Статус |
|---|---|---|---|---|---|
| 1 | P2 | #132 | Форк обновлён, `upstream` есть, скиллы загружены — ответить в #132 «Готово»? да / нет | [#132](https://github.com/RickOBrian/aid/issues/132) | закрыт — «Решения», PLAN-2026-10-07 п.1 |
| 2 | P2 | AID-LU-7 | Полировка интерфейса: #27 смержен; следующий шаг — группы в списке переменных: а — начинать, б — сначала проверка #27 в Figma, в — позже | чат «AID · Plugin · Library Updater», [arturuxui/figma-library-updater#27](https://github.com/arturuxui/figma-library-updater/pull/27) | закрыт — «Решения», PLAN-2026-10-07 п.2 |
| 3 | P3 | Hub | Запушить мерж `upstream/main` в ветку PR #126? да / нет | `git status` в `aid-hub` | закрыт — «Решения», PLAN-2026-10-07 п.3 |

## Решения инженера

Формулировка — дословно. Запись на `main` — разрешение начать работу.

| Дата | Задача | Кому | Решение (дословно) |
|---|---|---|---|
| 2026-10-06 | AID-LU-1 | Plugin · Library Updater | «мержим #21» |
| 2026-10-06 | AID-LU-4 | Plugin · Library Updater | «мержим #22» |
| 2026-10-06 | AID-LU-6 | Hub | «второй вариант, покажи текст issue»; «да, отправляй» — issue #98 |
| 2026-10-06 | AID-LU-6 | Hub | «Да» — уточнённый план комментарием к #98 |
| 2026-10-07 | AID-LU-6 | Hub | «Уже смержил сам, комментарий да» — endpoint комментарием к #98 |
| 2026-10-07 | AID-LU-6 | Hub | «да» — `proposal.withdrawn` комментарием к #98 |
| 2026-10-07 | #132 | Hub | PLAN-2026-10-07 п.1: «Да» — ответить «Готово» в #132 |
| 2026-10-07 | AID-LU-7 | Plugin · Library Updater | PLAN-2026-10-07 п.2: «Уже приступил к следующему шагу» — группы в списке переменных в работе |
| 2026-10-07 | Hub | Hub | PLAN-2026-10-07 п.3: «Да» — мерж `upstream/main` в ветку PR #126 |

## Закрыто

| ID | Чат | Что | Итог |
|---|---|---|---|
| AID-LU-1 | Все | Переход на оркестрацию: имена, группа, работа из своей папки | Готово 2026-10-06: CLAUDE.md плагина — [arturuxui/figma-library-updater#21](https://github.com/arturuxui/figma-library-updater/pull/21); чат плагина в своём клоне на `main` = `29a10c7`, правок в aid и aid-hub нет |
| AID-LU-4 | Plugin · Library Updater | `docs/PLAN.md`: 6б отметить «проверено в Figma» | Готово 2026-10-06: [arturuxui/figma-library-updater#22](https://github.com/arturuxui/figma-library-updater/pull/22) |
| AID-LU-5 | Plugin · Library Updater | Проверка записи в Figma: 4б, 4в, 6а шаг 1, 6в; `ALL_SCOPES` у `Controls/*` в Driver | Готово 2026-10-06: всё проверено инженером в Figma, замечания 6в и `ALL_SCOPES` — [arturuxui/figma-library-updater#23](https://github.com/arturuxui/figma-library-updater/pull/23); этапы 0–6 плагина закрыты |
| AID-LU-2 | Hub | Library Updater — продукт AID | Готово 2026-10-06: решение PD «1а» в [#93](https://github.com/RickOBrian/aid/issues/93); RickOBrian/aid#95 — таблица чатов, владелец в §9, метка `to:plugin-library-updater`, роль `lu-engineer` в `owners.json` |
| AID-LU-3 | Hub | PR из форка и обновление доски LU | Готово 2026-10-06: решения PD «2а», «3в», «а» в [#94](https://github.com/RickOBrian/aid/issues/94) — красные Vercel на PR из форка ожидаемы; доску мержит Штаб PD по §9 «Доски Штабов из форка»; в своём репозитории инженер LU мержит и выпускает сам (§9 «Продукты во внешних репозиториях») |
