# Аудит аналитики на настоящих образцах

Тот же код, что в плагине, запускается в файле образцов через Figma MCP
`use_figma` — **только чтение** (ничего не пишет в файл).

1. `node scripts/audit/build.cjs <id страницы> [runner|analyze] > /tmp/audit.js`
   (`runner` — статусы и спорное; `analyze` — разбор спорных правил:
   компонент, откуда цвет, соседние части)
   (по умолчанию — страница образцов Driver `2430:22084` в файле
   `TLVVI8O6J0FGUcHzxxLq8H`).
2. Перед `use_figma` загрузить навык `skill://figma/figma-use/SKILL.md`
   (`get_figma_skill`), передать `skillNames: "resource:figma-use"`.
3. Вставить содержимое `/tmp/audit.js` в `code` вызова `use_figma`.
4. Результат — статусы правил и спорные роли. Хотите другое — правьте
   хвост `runner.js` (ответ держать < ~15 КБ, без суррогатных пар —
   `clean()`).

Регрессия ошибок аудита — `test/audit.test.ts` на экранах в
`test/fixtures/driver-*.json` (выгружены тем же способом).
