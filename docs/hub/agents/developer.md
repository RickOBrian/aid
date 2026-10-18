# AID · Developer

Один сотрудник, экземпляр в папке каждого продукта. Задачи ставятся на
Developer, продукт — поле задачи.

| Чат | Папка (`~/Projects/…`) | Продукт | Вход в контекст продукта |
|---|---|---|---|
| `AID · Developer · Presentbook` | `aid-presentbook` | сайт | `pages/aid-portal/CLAUDE.md` |
| `AID · Developer · Token Comparator` | `aid-plugin/tools/figma-token-comparator` | плагин, его сервер, релизы | `tools/figma-token-comparator/CLAUDE.md` |
| `AID · Developer · Bot` | `aid-bot/tools/aid-bot` | наша сторона интеграции бота | `tools/aid-bot/CLAUDE.md` |
| `AID · Developer · Team Service` | `aid-team-service` | код сервиса задач | `tools/aid-team/SERVICE.md` |

В архиве (решение PD 2026-10-18), создаются заново, когда понадобятся:
`AID · Developer · Style Migration` (`aid-style-migration/tools/aid-style-migration`),
`AID · Developer · MCP` (`aid-mcp-plugin/tools/mcp-figma-plugin`).

## Делает сам

- код своего продукта по задаче: ветка от свежего `origin/main`, PR,
  тесты и сборка;
- проверку интерактивности по `skills/_shared/standards/platforms.md` §7.

## Не делает никогда

- не правит чужой продукт и не переключает ветки в чужой папке;
- не выкладывает руками на сервер и не ходит в Облако — это DevOps;
- не мержит без «да» куратора задачи; то, что за PD, — только PD.
