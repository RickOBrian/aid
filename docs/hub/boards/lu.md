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
| AID · Plugin · Components Swapper | `<рабочая папка>/Figma Plugin - Components Swapper`; клон `arturuxui/figma-components-swapper` | весь продукт | первое сообщение чата → его план |
| AID · Guide · Git for Beginners | клон `arturuxui/aid-git-guide` | весь репозиторий гайда | его `CLAUDE.md` → `docs/PLAN.md` |

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
| AID-LU-6 | Plugin · Library Updater + Bot · Request | Этап 7 плагина — предложения изменений через бота ([#98](https://github.com/RickOBrian/aid/issues/98)). 7а–7в готовы (#24–#26); бот подключён к серверу LU — AID-BOT-4 готово 2026-10-08. #98 открыт, Штаб LU ведёт там 7г . Проверка на живом сервере 2026-10-09: бот забрал тестовое `proposal.created` за 28 с, сообщение в Telegram пришло; тестовые записи удалены . 7г — «Подключить Telegram» — [#35](https://github.com/arturuxui/figma-library-updater/pull/35) (`6cb6e9c`), проверено `arturuxui` на живом сервере 2026-10-09: `/link`, `proposal.created`, `proposal.resolved` доходят. Релиз [v1.1.0](https://github.com/arturuxui/figma-library-updater/releases/tag/v1.1.0) | этап 7 со стороны LU готов; ждёт @username бота для кнопки «Открыть бота» ([вопрос в #98](https://github.com/RickOBrian/aid/issues/98#issuecomment-6077785298)) |
| AID-LU-9 | Plugin · Components Swapper | Новый продукт: замена компонентов и иконок из чужих библиотек на наши с сохранением контента. Решение PD в [#156](https://github.com/RickOBrian/aid/issues/156): «а» — отдельный продукт, владелец — инженер LU; регистрация — RickOBrian/aid#159. PD планирует позже объединить плагины — замену держать отдельным модулем (`src/core` без UI). Репозиторий [arturuxui/figma-components-swapper](https://github.com/arturuxui/figma-components-swapper); этап 0 — каркас, индекс, скан, библиотеки Rider и спайк API — #1, #2 (смержены); этап 1 — замена по имени с отменой и вложенными, #3, #5, #6 (смержены; на ✅ Driver App • Order 229/229 уверенных пар + 52 вложенных, 0 потерянных текстов); «Растянут» — [#7](https://github.com/arturuxui/figma-components-swapper/pull/7); этап 2а — отвязанные фреймы → наши экземпляры — [#8](https://github.com/arturuxui/figma-components-swapper/pull/8) (поверх #7) | этап 2а — ждёт проверки `arturuxui` в Figma, мерж #7 → #8; дальше 2б — ручные фреймы |
| AID-LU-11 | Guide · Git for Beginners | Новый продукт: гайд по git для новичков — интерактивная веб-версия (симулятор веток, PR и merge, сценарии, глоссарий, «что делать, если…») и PDF из одного источника; учим через веб GitHub и Claude Code на правилах AID. План готов, репозиторий [arturuxui/aid-git-guide](https://github.com/arturuxui/aid-git-guide) заведён до решения PD (позже возможен перенос к PD), кода нет. Решения `arturuxui` 2026-10-09: «1 веб+Claude, 2 да, 3 отдельный репо, 4 продвинутое». Вопросы PD: тип чата, доставка в Presentbook, оформление, видимость, сверка с правилами; найдено расхождение `git-workflow.md` §6 с «Git-полномочиями» | issue к PD — ждёт «да» `arturuxui` в Штабе |

## Вопросы инженера

Списки, собранные скиллом `/plan`: `PLAN-<дата>`, пункты с приоритетом
P0–P3, источник. Пункт закрывается ссылкой на строку в «Решениях».

### PLAN-2026-10-07

| # | P | Задача | Вопрос | Источник | Статус |
|---|---|---|---|---|---|
| 1 | P2 | #132 | Форк обновлён, `upstream` есть, скиллы загружены — ответить в #132 «Готово»? да / нет | [#132](https://github.com/RickOBrian/aid/issues/132) | закрыт — «Решения», PLAN-2026-10-07 п.1 |
| 2 | P2 | AID-LU-7 | Полировка интерфейса: #27 смержен; следующий шаг — группы в списке переменных: а — начинать, б — сначала проверка #27 в Figma, в — позже | чат «AID · Plugin · Library Updater», [arturuxui/figma-library-updater#27](https://github.com/arturuxui/figma-library-updater/pull/27) | закрыт — «Решения», PLAN-2026-10-07 п.2 |
| 3 | P3 | Hub | Запушить мерж `upstream/main` в ветку PR #126? да / нет | `git status` в `aid-hub` | закрыт — «Решения», PLAN-2026-10-07 п.3 |

### PLAN-2026-10-08

| # | P | Задача | Вопрос | Источник | Статус |
|---|---|---|---|---|---|
| 1 | P2 | AID-LU-6 | Ключ к бэкенду LU для бота: а — передал, б — ещё не передал, передам сегодня, в — передал, напомнить в #98 | [#98](https://github.com/RickOBrian/aid/issues/98), утренний сбор | закрыт — «Решения», PLAN-2026-10-08 п.1 |
| 2 | P3 | Hub | PR доски #133 ждёт мержа Штабом PD: а — подождать, б — напомнить в #133 | [#133](https://github.com/RickOBrian/aid/pull/133), утренний сбор | закрыт — «Решения», PLAN-2026-10-08 п.2 |

### PLAN-2026-10-09

Собран утренней задачей.

| # | P | Задача | Вопрос | Статус |
|---|---|---|---|---|
| 1 | P1 | AID-LU-6 | Бот подключён: а — 7г сейчас, б — сначала проверка уведомления на живом сервере, в — позже | закрыт — «Решения» |
| 2 | P2 | AID-LU-6 | #98: а — оставить открытым под 7г, б — закрыть | закрыт — «Решения» |
| 3 | P2 | AID-LU-9 | Решение PD «а» в #156: а — передать и начинать, б — начать позже | закрыт — «Решения» |
| 4 | P3 | AID-LU-10 | Версия в `package.json` 0.1.0 при релизе v1.0.0 — поправить? да / нет | закрыт — «Решения» |
| 5 | P3 | Hub | Обновить доску одним PR из форка? да / нет | закрыт — «Решения» |

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
| 2026-10-08 | AID-LU-6 | Hub | PLAN-2026-10-08 п.1: «Да, 1б, 2б» → «1б» — ключ ещё не передан, инженер передаёт владельцу бота сам сегодня |
| 2026-10-08 | Hub | Hub | PLAN-2026-10-08 п.2: «Да, 1б, 2б» → «2б» — напомнить Штабу PD в #133 |
| 2026-10-08 | AID-LU-6 | Hub | «Ключ передал, так что теперь мяч на их стороне» |
| 2026-10-08 | AID-LU-9 | Hub | «Да» — issue #156 к PD по тексту чата продукта |
| 2026-10-09 | AID-LU-6 | Plugin · Library Updater | PLAN-2026-10-09: «1б, 2а, 3а, 4 да, 5 да» → «1б» — проверить уведомление на живом сервере, затем 7г |
| 2026-10-09 | AID-LU-6 | Hub | «2а» — #98 открыт, Штаб LU ведёт там 7г ([комментарий](https://github.com/RickOBrian/aid/issues/98#issuecomment-6074776340)) |
| 2026-10-09 | AID-LU-9 | Plugin · Components Swapper | «3а» — передать решение PD и начинать работу по плану |
| 2026-10-09 | AID-LU-10 | Plugin · Library Updater | «4 да» — версия 1.0.0 в `package.json` отдельным PR |
| 2026-10-09 | Hub | Hub | «5 да» — обновить доску одним PR |
| 2026-10-09 | AID-LU-11 | Guide · Git for Beginners | «1 веб+Claude, 2 да, 3 отдельный репо, 4 продвинутое» (в чате продукта) |
| 2026-10-09 | AID-LU-11 | Guide · Git for Beginners | «Тестовым новичком буду я сам — буду просто смотреть, что получается»; «гит используем пока мой, после можно будет влить в PD»; «планы запиши уже сейчас, чтобы ничего не потерялось» (в чате продукта) |

## Закрыто

| ID | Чат | Что | Итог |
|---|---|---|---|
| AID-LU-1 | Все | Переход на оркестрацию: имена, группа, работа из своей папки | Готово 2026-10-06: CLAUDE.md плагина — [arturuxui/figma-library-updater#21](https://github.com/arturuxui/figma-library-updater/pull/21); чат плагина в своём клоне на `main` = `29a10c7`, правок в aid и aid-hub нет |
| AID-LU-4 | Plugin · Library Updater | `docs/PLAN.md`: 6б отметить «проверено в Figma» | Готово 2026-10-06: [arturuxui/figma-library-updater#22](https://github.com/arturuxui/figma-library-updater/pull/22) |
| AID-LU-5 | Plugin · Library Updater | Проверка записи в Figma: 4б, 4в, 6а шаг 1, 6в; `ALL_SCOPES` у `Controls/*` в Driver | Готово 2026-10-06: всё проверено инженером в Figma, замечания 6в и `ALL_SCOPES` — [arturuxui/figma-library-updater#23](https://github.com/arturuxui/figma-library-updater/pull/23); этапы 0–6 плагина закрыты |
| AID-LU-2 | Hub | Library Updater — продукт AID | Готово 2026-10-06: решение PD «1а» в [#93](https://github.com/RickOBrian/aid/issues/93); RickOBrian/aid#95 — таблица чатов, владелец в §9, метка `to:plugin-library-updater`, роль `lu-engineer` в `owners.json` |
| AID-LU-3 | Hub | PR из форка и обновление доски LU | Готово 2026-10-06: решения PD «2а», «3в», «а» в [#94](https://github.com/RickOBrian/aid/issues/94) — красные Vercel на PR из форка ожидаемы; доску мержит Штаб PD по §9 «Доски Штабов из форка»; в своём репозитории инженер LU мержит и выпускает сам (§9 «Продукты во внешних репозиториях») |
| AID-LU-7 | Plugin · Library Updater | Полировка интерфейса: подсказки с образцами и поиск замены, тёмная тема, группы в списках, черновик на виду, шапка и вкладки, размер окна | Готово 2026-10-07: проверено инженером в Figma; [#27](https://github.com/arturuxui/figma-library-updater/pull/27), [#28](https://github.com/arturuxui/figma-library-updater/pull/28) (`0427410`), [#29](https://github.com/arturuxui/figma-library-updater/pull/29) (`a019760`), [#30](https://github.com/arturuxui/figma-library-updater/pull/30) (`c6824af`) |
| AID-LU-8 | Plugin · Library Updater | Подсказки в стилях: токены свойства в текстовых стилях, значения других переменных в тенях и градиентах | Готово 2026-10-07: проверено инженером; [#31](https://github.com/arturuxui/figma-library-updater/pull/31) (`96c915e`), [#32](https://github.com/arturuxui/figma-library-updater/pull/32) (`705186d`) |
| AID-LU-10 | Plugin · Library Updater | `version` в `package.json` → 1.0.0, как у релиза v1.0.0 | Готово 2026-10-09: [#34](https://github.com/arturuxui/figma-library-updater/pull/34) (`5fe872d`) |
