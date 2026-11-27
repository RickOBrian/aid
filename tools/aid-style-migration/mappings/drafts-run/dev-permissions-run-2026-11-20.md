# DEV: Permissions — копия и прогон (2026-11-20)

Задача arturuxui 20.11: в файле New Rider DEV `5mg6h0oB8yRDoUfTruogca` у Permissions не было копии
«— Switched Styles» (были только у Where, GEO Problems, Service coverage и Taxi for friends).
Сделать копию и прогнать на ней правила, взятые из Drafts.

- Оригинал `2314:23316` «✅ Permissions» не тронут.
- Копия «✅ Permissions — Switched Styles» `5167:7511` (`clone-page.js`) стоит сразу за оригиналом,
  все шрифты загрузились. В оригинале 3 289 узлов.
- Правила те же, что на Drafts: `build-kit.mjs`, HASH 1785929411 (с флагом SKIP и спорными правилами
  анкеты А, NODISPUTE=false — как «Применить всё» 12.11). Тело залито на `figma.root` DEV
  (ключи `mig`: `body`, `runner`, `hash`).
- DRY: 2 069 узлов, будет заменено 699, пропущено 281. Боевой прогон: 699 замен / 281 пропуск,
  ошибок 0. Контрольный DRY: 0 замен. Планы страницы сняты (`CLEAN`).
- Подробности — `results/dev-permissions.tsv`; в `LEDGER.md` страница отмечена «не из 17» (`designer-decisions.json` → `extra`).

Спорные правила, которые сработали: `#ffffff` → Stroke/Secondary на обводке фрейма (4). Правило `#000` текст → Text/Primary
не сработало ни разу.

Что не заменено (281): чаще всего сырой `#c4c4c4` на shape (52, плейсхолдеры картинок), сырые `#000`/`#fff` на shape
(28 и 23), blur-эффекты (layer 15, background 12), стили iOS System Colors и Body/Headline/Footnote из системного
алерта iOS (без маппинга). Полный список — в tsv.

Глазами не сверено: скриншоты до/после не снимались.
На `figma.root` DEV ключи `mig` оставлены. Если правила больше не прогоняем — снять их.
