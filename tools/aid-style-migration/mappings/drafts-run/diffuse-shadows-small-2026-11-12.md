# Тень diffuse → Shadows/Small: проверка на 17 копиях Drafts (2026-11-12)

Итог: заменять нечего. Правило `shadow/diffuse/m`, `shadow/diffuse/s` → `Shadows/Small` уже есть в `scripts/migrate-styles.js` (`FX_MAP`, комментарий «анкета покрытия п.7») и применено на всех копиях при прогоне 06.11 (первая, боевая запись в `results/*.tsv`, `dry=0`). Новых замен в этом прогоне нет, правило в скрипт не добавлялось.

## Что сделано

- `node scripts/build-kit.mjs`: HASH 2639523941 (тот же, что на прогоне 12.11 — скрипт не менялся). Тело залито на `figma.root` (ключи `mig`: body, runner, hash — оставлены).
- DRY по 17 копиям (`DRY=true`): правило ловит 0 узлов с diffuse/m|s; в «не заменено» строк «эффект [shadow/diffuse/…] — нет в маппинге» тоже нет. Замен вообще 0; Where и Where - Migration — по 75 (вложенный инстанс, известная норма). Ошибок 0.
- Прямое чтение эффект-стилей на Order Flow и Navigation (findAll по effectStyleId): `shadow/diffuse/m` и `/s` нет; `Shadows/Small` — 590 (Order Flow) и 251 (Navigation). На Navigation остались `shadow/diffuse/l` (4 узла) — по заданию не трогали.
- Боевой прогон и CLEAN не выполнялись (нечего применять). После DRY выполнен CLEAN на всех 17 копиях (`cleaned: true`) — планов на копиях нет.
- `results/*.tsv` и `LEDGER.md` не менялись.

## Ранее заменено (06.11, из results/*.tsv)

| страница | diffuse/m | diffuse/s |
|---|---:|---:|
| Backlog UI | 1 | 1 |
| GEO Problems | 3 | 2 |
| Illustrations Request | 2 | 0 |
| Navigation | 34 | 236 |
| No car | 5 | 4 |
| not work | 1 | 0 |
| Order Flow | 427 | 297 |
| Profile | 79 | 4 |
| Show my location | 446 | 302 |
| Tariffs | 6 | 0 |
| Where - Migration | 8 | 9 |
| Where | 8 | 9 |
| Errors, Permissions, Service coverage, Taxi, test | 0 | 0 |
| Итого | 1 020 | 864 |

Всего 1 884 узла, ожидание «около 1 800» совпало.

## Для глаз

Узлы со `Shadows/Small` (бывшие diffuse): взять из `results/*.tsv` не получится (там нет примеров для этого правила); достаточно открыть на Order Flow `5374:903482` и `5374:903637` (экраны, где было 427/297 diffuse) и на Navigation `5374:210477` (в старом отчёте navigation.md — diffuse/s).
