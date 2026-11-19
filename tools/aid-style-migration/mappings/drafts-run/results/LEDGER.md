# Сводка прогонов (собрано scripts/report.mjs, руками не править)

## Решения дизайнера

Источник — `mappings/drafts-run/designer-decisions.json`. Комментарии Валентины Волченковой на Switch Audit 6058:94733, 12.11.2026; разбор — designer-review-2026-11-12.md. arturuxui 13.11: делаем всё как сказала дизайнер.
Пропущенные и решённые по строкам страницы в «Незаменённое» и итог «в работе» не входят; сделанные на них замены остаются.

| страница | статус | решение |
|---|---|---|
| Backlog UI — Switched Styles | пропущена | Пропускаем секцию, она техническая |
| Errors — Switched Styles | пропущена | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| ✅ GEO Problems — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ Illustrations Request 💅🏻 — Switched Styles | пропущена | скипаем полностью страницу |
| ✅ Navigation 🧭 — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ No car — Switched Styles | пропущена | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| ✅ not work — Switched Styles | пропущена | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| Order Flow — Switched Styles | по строкам (дизайнер) | по строкам: всё «не трогать», кроме Text/Primary и Body 2 (сделано 13.11); SF Pro Display 90 Thin — пробел типографики |
| ✅ Permissions — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ⌛️ Profile — Switched Styles | пропущена | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| ✅ Service coverage — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ Show my location — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ⌛️ Tariffs — Switched Styles | пропущена | Пропускаем секцию, её дизайн отложен |
| ✅ Taxi for friends — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| test — Switched Styles | пропущена | Пропускаем секцию |
| ✅ Where 🗺️ - Migration — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ Where 🗺️ — Switched Styles | пропущена | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |

## Покрытие: состояние копий

Считается всё состояние копии, не замены прогона. Единица — заливка, обводка, шрифт, эффект на видимом узле.
Процент — покрыто / (покрыто + не покрыто). Вне счёта — логотипы, иллюстрации, пины, вставки маркетплейса, определены по именам приближённо.

| страница | заливки | обводки | шрифты | эффекты | всё | покрыто | не покрыто | вне счёта |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Backlog UI — Switched Styles · пропущена | 76 % | 36 % | 84 % | 61 % | **75 %** | 185 | 61 | 14 |
| Errors — Switched Styles · пропущена | 82 % | 18 % | 87 % | 81 % | **81 %** | 1 002 | 234 | 681 |
| ✅ GEO Problems — Switched Styles · пропущена | 92 % | 57 % | 100 % | 75 % | **92 %** | 936 | 83 | 74 |
| ✅ Illustrations Request 💅🏻 — Switched Styles · пропущена | 72 % | 14 % | 92 % | 51 % | **73 %** | 4 121 | 1 493 | 356 |
| ✅ Navigation 🧭 — Switched Styles · пропущена | 79 % | 27 % | 84 % | 59 % | **76 %** | 32 464 | 10 135 | 3 920 |
| ✅ No car — Switched Styles · пропущена | 73 % | 50 % | 81 % | 49 % | **72 %** | 689 | 274 | 26 |
| ✅ not work — Switched Styles · пропущена | 80 % | 67 % | 100 % | 88 % | **84 %** | 318 | 61 | 44 |
| Order Flow — Switched Styles · по строкам (дизайнер) | 91 % | 83 % | 98 % | 75 % | **91 %** | 35 087 | 3 417 | 911 |
| ✅ Permissions — Switched Styles · пропущена | 87 % | 62 % | 96 % | 69 % | **86 %** | 1 020 | 162 | 112 |
| ⌛️ Profile — Switched Styles · пропущена | 76 % | 11 % | 72 % | 52 % | **70 %** | 5 187 | 2 275 | 64 |
| ✅ Service coverage — Switched Styles · пропущена | 98 % | 94 % | 100 % | 88 % | **98 %** | 2 543 | 61 | 442 |
| ✅ Show my location — Switched Styles · пропущена | 90 % | 82 % | 92 % | 78 % | **90 %** | 23 686 | 2 748 | 294 |
| ⌛️ Tariffs — Switched Styles · пропущена | 73 % | 13 % | 74 % | 43 % | **68 %** | 971 | 464 | 46 |
| ✅ Taxi for friends — Switched Styles · пропущена | 86 % | 38 % | 87 % | 70 % | **84 %** | 1 460 | 273 | 74 |
| test — Switched Styles · пропущена | 86 % | 64 % | 93 % | 76 % | **86 %** | 2 927 | 472 | 220 |
| ✅ Where 🗺️ - Migration — Switched Styles · пропущена | 88 % | 35 % | 93 % | 48 % | **84 %** | 17 949 | 3 393 | 2 230 |
| ✅ Where 🗺️ — Switched Styles · пропущена | 87 % | 38 % | 93 % | 48 % | **83 %** | 17 708 | 3 634 | 2 230 |
| **Итого, в работе** | — | — | — | — | **—** | 0 | 0 | 0 |
| Итого, все 17 | 85 % | 52 % | 91 % | 61 % | **84 %** | 148 253 | 29 240 | 11 738 |

## Замены и пропуски по прогонам

| страница | статус | копия | заменено | не заменено | последний прогон |
|---|---|---|---:|---:|---|
| Backlog UI — Switched Styles | пропущена | `5371:80571` | 58 | 218 | 2026-11-12 |
| Errors — Switched Styles | пропущена | `5374:358551` | 195 | 1 564 | 2026-11-12 |
| ✅ GEO Problems — Switched Styles | пропущена | `5374:885750` | 154 | 356 | 2026-11-12 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | пропущена | `5374:721192` | 1 123 | 3 159 | 2026-11-12 |
| ✅ Navigation 🧭 — Switched Styles | пропущена | `5374:207972` | 7 807 | 19 492 | 2026-11-12 |
| ✅ No car — Switched Styles | пропущена | `5374:1040241` | 242 | 632 | 2026-11-12 |
| ✅ not work — Switched Styles | пропущена | `5374:738087` | 18 | 251 | 2026-11-12 |
| Order Flow — Switched Styles | по строкам (дизайнер) | `5374:903468` | 21 257 | 5 837 | 2026-11-12 |
| ✅ Permissions — Switched Styles | пропущена | `5374:1019808` | 162 | 471 | 2026-11-12 |
| Pre-final for Style Switch | в работе | `6991:303670` | 11 687 | 3 359 | 2026-11-19 |
| Макеты для примерки цветов и шрифтов — Switched Styles | в работе | `7151:54574` | 2 214 | 1 556 | 2026-11-18 |
| ⌛️ Profile — Switched Styles | пропущена | `5374:527493` | 4 749 | 5 941 | 2026-11-12 |
| ✅ Service coverage — Switched Styles | пропущена | `5374:86156` | 398 | 792 | 2026-11-12 |
| ✅ Show my location — Switched Styles | пропущена | `5374:802548` | 6 112 | 4 324 | 2026-11-12 |
| ⌛️ Tariffs — Switched Styles | пропущена | `5374:563482` | 281 | 783 | 2026-11-12 |
| ✅ Taxi for friends — Switched Styles | пропущена | `5374:894051` | 269 | 826 | 2026-11-12 |
| test — Switched Styles | пропущена | `5374:1030847` | 617 | 1 018 | 2026-11-12 |
| ✅ Where 🗺️ - Migration — Switched Styles | пропущена | `5374:623349` | 2 839 | 6 517 | 2026-11-12 |
| ✅ Where 🗺️ — Switched Styles | пропущена | `5374:421690` | 2 958 | 6 827 | 2026-11-12 |
| **Итого, в работе** | | | **13 901** | **4 915** | |
| Итого, все 17 | | | 63 140 | 63 923 | |

## Незаменённое по страницам в работе

| причина | кол-во | страниц | где | ID |
|---|---:|---:|---|---|
| сырой #c4c4c4 [shape] | 328 | 1 | primerka-switched | I7151:55858;1465:154025;1248:7516 |
| сырой эффект: layer_blur | 116 | 1 | primerka-switched | I7151:54621;218:48 |
| сырой эффект: background_blur | 90 | 1 | primerka-switched | I7151:56072;1228:7439 |
| сырой #000000 [shape] | 78 | 1 | primerka-switched | I7151:54629;349:4028;244:1424 |
| сырой #ffffff [shape] | 70 | 1 | primerka-switched | I7151:54629;349:4028;244:1423 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 59 | 1 | primerka-switched | I7151:54621;218:49 |
| градиент [shape] | 54 | 1 | primerka-switched | I7151:54678;1074:135481 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.12 + drop 0,0 r1 s0 #000000@0.15 | 37 | 1 | primerka-switched | 7151:56429 |
| сырой #ffffff [stroke] | 36 | 1 | primerka-switched | I7151:56072;1228:7446 |
| градиент [frame] | 30 | 1 | primerka-switched | I7151:54678;1093:24175 |
| [Icons day/Secondary Pressed] → Icon/Secondary [stroke] — скоуп SHAPE_FILL | 30 | 1 | primerka-switched | I7151:56072;1228:7452 |
| сырой #ffffff@0.05 [shape] | 30 | 1 | primerka-switched | 7151:56078 |
| сырой #000000@0.08 [stroke] | 30 | 1 | primerka-switched | 7151:56078 |
| TEXT смешанные заливки — оставлено | 28 | 1 | primerka-switched |  |
| сырой #7b2df5 [shape] | 28 | 1 | primerka-switched | I7151:57372;1228:7445 |
| сырой #d9d9d9 [shape] | 22 | 1 | primerka-switched | I7151:55867;3131:32917;3131:30428 |
| сырой #ea3323 [shape] | 21 | 1 | primerka-switched | I7151:54629;349:4028;244:1424 |
| [Background [day]/Secondary] [shape/shape] — нет правила | 21 | 1 | primerka-switched | I7151:56096;1242:357 |
| сырой #ffffff [text] | 16 | 1 | primerka-switched | 7151:54667 |
| сырой #979797 [shape] | 16 | 1 | primerka-switched | 7151:56531 |
| сырой #ffffff@0.10 [shape] | 15 | 1 | primerka-switched | 7151:56080 |
| сырой #000000@0.03 [stroke] | 15 | 1 | primerka-switched | 7151:56080 |
| сырой эффект: drop 0,6 r20 s0 #000000@0.08 + background_blur | 15 | 1 | primerka-switched | I7151:56107;1264:96 |
| шрифт без стиля: Inter Regular 14/20 | 13 | 1 | primerka-switched | 7151:57052 |
| шрифт без стиля: Inter Regular 11/auto | 13 | 1 | primerka-switched | 7151:57053 |
| сырой #fefae5 [frame] | 12 | 1 | primerka-switched | 7151:57051 |
| сырой #7b2df5@0.12 [shape] | 11 | 1 | primerka-switched | I7151:57677;1074:135478 |
| сырой #ffffff@0.10 [stroke] | 10 | 1 | primerka-switched | 7151:54575 |
| шрифт без стиля: SF Pro Medium 16/16 | 10 | 1 | primerka-switched | 7151:56549 |
| сырой #23354d [shape] | 9 | 1 | primerka-switched | 7151:56347 |
| сырой #f4bb40 [shape] | 9 | 1 | primerka-switched | 7151:56347 |
| шрифт без стиля: WB Sans Bold 30/100 | 8 | 1 | primerka-switched | I7151:55867;3131:32917;3131:30431 |
| сырой #232326 [shape] | 8 | 1 | primerka-switched | I7151:56170;619:1373 |
| сырой #0f0f1e@0.90 [text] | 8 | 1 | primerka-switched | I7151:56689;1284:42181 |
| сырой #242428 [text] | 8 | 1 | primerka-switched | I7151:56749;907:124131;859:104820 |
| сырой #000000@0.12 [shape] | 8 | 1 | primerka-switched | 7151:56148 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 8 | 1 | primerka-switched | 7151:56497 |
| сырой эффект: drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff | 8 | 1 | primerka-switched | 7151:57742 |
| градиент [stroke] | 6 | 1 | primerka-switched | 7151:56173 |
| сырой #444444 [frame] | 6 | 1 | primerka-switched | 7151:54575 |
| {System Colors:Labels/Primary} [text] — нет в маппинге | 6 | 1 | primerka-switched | I7151:56157;2189:194705 |
| шрифт без стиля: SF Pro Regular 14/16 | 6 | 1 | primerka-switched | 7151:56510 |
| эффект [.blur tiny] — нет в маппинге | 5 | 1 | primerka-switched | I7151:54629;349:4028;244:1423 |
| сырой #ffffff@0.90 [shape] | 5 | 1 | primerka-switched | I7151:56072;1228:7440 |
| {Color:tx-accent/grey/primary} «Shadow» — пробел | 5 | 1 | primerka-switched | I7151:56145;1067:131367 |
| сырой #23569a [shape] | 5 | 1 | primerka-switched | 7151:56590 |
| шрифт без стиля: SF Pro Text Semibold 17/20 SMALL_CAPS_FORCED | 5 | 1 | primerka-switched | I7151:56141;2645:221737 |
| шрифт без стиля: WB Sans Bold 22/auto | 4 | 1 | primerka-switched | I7151:55867;3122:27197 |
| сырой #b1fcc0 [shape] | 4 | 1 | primerka-switched |  |
| сырой #5abd5f [shape] | 4 | 1 | primerka-switched |  |
| сырой #000000 [text] | 4 | 1 | primerka-switched | 7151:57053 |
| сырой #000000 [frame] | 4 | 1 | primerka-switched | 7151:54704 |
| {System Colors:Miscellaneous/Alert, Menu, Action Sheet - Separators} [stroke] — нет в маппинге | 4 | 1 | primerka-switched |  |
| {System Colors:Colors/Blue} [text] — нет в маппинге | 4 | 1 | primerka-switched |  |
| сырой #cacacc [shape] | 4 | 1 | primerka-switched | 7151:56650 |
| сырой #ffffff@0.25 [shape] | 4 | 1 | primerka-switched | 7151:56364 |
| шрифт без стиля: Google Sans Regular 17/20 | 4 | 1 | primerka-switched | 7151:56439 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 4 | 1 | primerka-switched | 7151:56527 |
| сырой #d8d8d8 [shape] | 4 | 1 | primerka-switched | 7151:56532 |
| сырой #979797 [stroke] | 4 | 1 | primerka-switched | 7151:56532 |
| шрифт без стиля: SF Pro Text Medium 12/auto | 4 | 1 | primerka-switched | 7151:57074 |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 4 | 1 | primerka-switched | 7151:57075 |
