# Доска AID

Активные задачи по чатам. Ведёт «AID · Hub · Штаб» (`ORCHESTRATION.md`).
Строка закрывается ссылкой на PR или решение и уходит в «Закрыто».

Статусы: `в работе` · `ждёт PD` · `ждёт <чат>` · `блокер` · `сверить`

Первичное заполнение 2026-10-06 — по данным Штаба; строки `сверить`
подтверждает чат-владелец первым ответом.

## Активные

| ID | Чат | Задача | Статус |
|---|---|---|---|
| AID-1 | Все | Переход на оркестрацию: имя `AID · <Тип> · <Название>`, группа «AID», работа из своей папки. Ждут смены папки: Token Comparator, Style Migration, Bot, MCP, Team; не открыт чат «AID · DS · Стандарты» | в работе |
| AID-2 | Стандарты | PATCH гайда цветов: противоречия в §1, §2, §5, §7, §8 `semantic-color-tokens-guide.md` | в очереди |
| AID-3 | Стандарты ← Style Migration | Приёмка `semantic-color-tokens.json`: пометка «примеры», состояния ссылкой на `component-states.json`, структура групп `bg`, статус `draft` | ждёт PD: сейчас или вместе с задачами плагина (Style Migration спросила 2026-10-06) |
| AID-4 | Style Migration | Убрать правку корневого `CLAUDE.md` из `feat/style-migration-spike` (строки стыков уже на `main`, ADR-039) | ждёт PD: чат уберёт по «да» в своём чате |
| AID-5 | Presentbook | ADR-038, часть Presentbook: этапы 4–5 закрыты (#75–#77, #80; `aidteam.pro` переключён 2026-10-03, смоук 7/7). Этап 7: Vercel `aid-ds` запасной до ~2026-10-17, затем отключение и PR без `middleware.ts`/`vercel.json` | ждёт PD (этап 7 после 2026-10-17) |
| AID-10 | Token Comparator | ADR-038, этап 6: код смержен (#78); переключение `api.aidteam.pro`, новый ключ, релиз плагина | сверить |
| AID-11 | Штаб → Стандарты | После этапа 7 ADR-038: корневой `CLAUDE.md` (контуры, «Ветки и деплой», Vercel в полномочиях) — Штаб через PD; `github-sync-architecture.md` §3a и адрес `aid-ds.vercel.app` — Стандарты | ждёт AID-5, AID-10 |
| AID-6 | Bot | PR #71 — контракт пилота «плагин в боте всегда актуальный» | сверить |
| AID-7 | MCP | Исследование: `docs/research.md` | сверить |
| AID-8 | Team | База инженеров и передача задач по имени; хранилище вне публичного репозитория | сверить |
| AID-9 | Штаб | Хвосты, решить с PD: worktree `aid-claude-test` (4 незакоммиченных файла), `aid-governance`, `aid-presentbook-tools`, `aid-token-comparator-v0.1.0`; локальные ветки без upstream `archive/main-wip-pre-cleanup-20260909`, `feat/icons-spike`, `presentbook/icons`, `test/api-aidteam-pro`; три stash (`cursor/*`) | ждёт PD |

## Закрыто

| ID | Чат | Что | Итог |
|---|---|---|---|
| AID-1 · Presentbook | Presentbook | Оркестрация: имя, папка | 2026-10-06: папка верная, detached HEAD на `origin/main` намеренно, ничего не висит |
| AID-1 · Style Migration | Style Migration | Оркестрация: имя, протокол | 2026-10-06: принято; смена папки — у PD в чате |
