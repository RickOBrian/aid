# Сводка прогонов (собрано scripts/report.mjs, руками не править)

## Покрытие: состояние копий

Считается всё состояние копии, не замены прогона. Единица — заливка, обводка, шрифт, эффект на видимом узле.
Процент — покрыто / (покрыто + не покрыто). Вне счёта — логотипы, иллюстрации, пины, вставки маркетплейса, определены по именам приближённо.

| страница | заливки | обводки | шрифты | эффекты | всё | покрыто | не покрыто | вне счёта |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Backlog UI — Switched Styles | 76 % | 36 % | 84 % | 61 % | **75 %** | 185 | 61 | 14 |
| Errors — Switched Styles | 82 % | 18 % | 87 % | 81 % | **81 %** | 1 002 | 234 | 681 |
| ✅ GEO Problems — Switched Styles | 92 % | 57 % | 100 % | 75 % | **92 %** | 936 | 83 | 74 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | 72 % | 14 % | 92 % | 51 % | **73 %** | 4 121 | 1 493 | 356 |
| ✅ Navigation 🧭 — Switched Styles | 79 % | 31 % | 78 % | 54 % | **75 %** | 40 831 | 13 335 | 6 129 |
| ✅ No car — Switched Styles | 74 % | 50 % | 81 % | 49 % | **72 %** | 689 | 271 | 29 |
| ✅ not work — Switched Styles | 81 % | 67 % | 100 % | 88 % | **85 %** | 318 | 58 | 47 |
| Order Flow — Switched Styles | 94 % | 89 % | 98 % | 75 % | **93 %** | 35 145 | 2 472 | 1 763 |
| ✅ Permissions — Switched Styles | 87 % | 62 % | 96 % | 69 % | **86 %** | 1 020 | 162 | 112 |
| ⌛️ Profile — Switched Styles | 76 % | 11 % | 72 % | 52 % | **70 %** | 5 187 | 2 249 | 91 |
| ✅ Service coverage — Switched Styles | 98 % | 94 % | 100 % | 88 % | **97 %** | 2 536 | 68 | 442 |
| ✅ Show my location — Switched Styles | 94 % | 82 % | 92 % | 78 % | **92 %** | 23 686 | 2 145 | 897 |
| ⌛️ Tariffs — Switched Styles | 73 % | 13 % | 74 % | 43 % | **68 %** | 971 | 464 | 46 |
| ✅ Taxi for friends — Switched Styles | 86 % | 38 % | 87 % | 70 % | **84 %** | 1 460 | 273 | 74 |
| test — Switched Styles | 86 % | 64 % | 93 % | 76 % | **86 %** | 2 927 | 472 | 220 |
| ✅ Where 🗺️ - Migration — Switched Styles | 88 % | 35 % | 93 % | 48 % | **84 %** | 17 949 | 3 385 | 2 238 |
| ✅ Where 🗺️ — Switched Styles | 87 % | 38 % | 93 % | 48 % | **83 %** | 17 708 | 3 626 | 2 238 |
| **Итого** | 86 % | 53 % | 89 % | 60 % | **84 %** | 156 671 | 30 851 | 15 451 |

## Замены и пропуски по прогонам

| страница | копия | заменено | не заменено | последний прогон |
|---|---|---:|---:|---|
| Backlog UI — Switched Styles | `5371:80571` | 58 | 217 | 2026-11-12 |
| Errors — Switched Styles | `5374:358551` | 195 | 1 551 | 2026-11-12 |
| ✅ GEO Problems — Switched Styles | `5374:885750` | 154 | 355 | 2026-11-12 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | `5374:721192` | 1 123 | 3 153 | 2026-11-12 |
| ✅ Navigation 🧭 — Switched Styles | `5374:207972` | 7 807 | 25 489 | 2026-11-12 |
| ✅ No car — Switched Styles | `5374:1040241` | 242 | 628 | 2026-11-12 |
| ✅ not work — Switched Styles | `5374:738087` | 18 | 251 | 2026-11-12 |
| Order Flow — Switched Styles | `5374:903468` | 21 257 | 5 809 | 2026-11-12 |
| ✅ Permissions — Switched Styles | `5374:1019808` | 162 | 471 | 2026-11-12 |
| ⌛️ Profile — Switched Styles | `5374:527493` | 4 749 | 5 940 | 2026-11-12 |
| ✅ Service coverage — Switched Styles | `5374:86156` | 398 | 762 | 2026-11-12 |
| ✅ Show my location — Switched Styles | `5374:802548` | 6 112 | 4 293 | 2026-11-12 |
| ⌛️ Tariffs — Switched Styles | `5374:563482` | 281 | 778 | 2026-11-12 |
| ✅ Taxi for friends — Switched Styles | `5374:894051` | 269 | 819 | 2026-11-12 |
| test — Switched Styles | `5374:1030847` | 617 | 980 | 2026-11-12 |
| ✅ Where 🗺️ - Migration — Switched Styles | `5374:623349` | 2 839 | 6 359 | 2026-11-12 |
| ✅ Where 🗺️ — Switched Styles | `5374:421690` | 2 958 | 6 669 | 2026-11-12 |
| **Итого** | | **49 239** | **64 524** | |

## Незаменённое по всем страницам

| причина | кол-во | страниц | где | ID |
|---|---:|---:|---|---|
| сырой эффект: layer_blur | 4 404 | 15 | backlog-ui, errors, geo-problems … | I5371:80825;4270:112360 I5374:358560;218:116 5374:886148 |
| сырой #c4c4c4 [shape] | 3 824 | 10 | geo-problems, illustrations, navigation … | I5374:886133;1228:7454 5374:721262 I5374:211920;1248:7510 |
| сырой #000000 [shape] | 3 638 | 15 | backlog-ui, errors, geo-problems … | 5371:80712 I5374:358559;349:4028;244:1424 5374:886149 |
| градиент [shape] | 3 372 | 13 | backlog-ui, errors, geo-problems … | I5371:80719;257:2838 I5374:358630;4365:206498 I5374:886217;1074:135481 |
| сырой #ffffff [shape] | 1 933 | 12 | backlog-ui, errors, illustrations … | 5371:80580 I5374:358559;349:4028;244:1423 5374:721206 |
| [Background [day]/Secondary] [shape/shape] — нет правила | 1 178 | 4 | illustrations, navigation, test … | I5374:721536;1242:357 I5374:214271;1242:357 5374:1030874 |
| сырой эффект: background_blur | 1 160 | 6 | geo-problems, illustrations, permissions … | I5374:886133;1228:7439 I5374:722037;1228:7439 5374:1020102 |
| сырой #d9d9d9 [shape] | 946 | 2 | profile, service-coverage | 5374:527495 5374:86246 |
| сырой #ffffff@0.90 [shape] | 820 | 2 | where-migration, where | I5374:623539;1228:7440 I5374:421880;1228:7440 |
| шрифт без стиля: SF Pro Text Semibold 12/13 | 786 | 2 | order-flow, show-my-location | 5374:903752 5374:803458 |
| градиент [stroke] | 592 | 2 | errors, profile | I5374:358834;4906:196320;2646:2330;494:16458 5374:530807 |
| сырой #ff5f00 [shape] | 486 | 3 | not-work, order-flow, show-my-location | I5374:738206;40007187:43967;427:17588 I5374:903770;1093:24503;3072:124505 I5374:802565;40007187:67012;40007187:43967;427:17588 |
| сырой #ffffff [stroke] | 433 | 4 | backlog-ui, no-car, where-migration … | 5371:80575 5374:1040245 I5374:623539;1228:7446 |
| [Icons day/Secondary Pressed] → Icon/Secondary [stroke] — скоуп SHAPE_FILL | 332 | 2 | where-migration, where | I5374:623539;1228:7452 I5374:421880;1228:7452 |
| градиент [frame] | 309 | 5 | errors, not-work, permissions … | I5374:358834;4906:196320;2646:2348 I5374:738191;1093:24175 5374:1020529 |
| сырой #eb001b [shape] | 285 | 2 | not-work, order-flow | I5374:738206;40007187:43967;427:17589 I5374:903770;1093:24503;3072:124506 |
| сырой #f79e1b [shape] | 285 | 2 | not-work, order-flow | I5374:738206;40007187:43967;427:17590 I5374:903770;1093:24503;3072:124507 |
| {System:Magin Top}=54 paddingTop — нет цели | 258 | 2 | not-work, show-my-location | 5374:738182 5374:802550 |
| {Color:tx-brand/green/green} [shape] — нет в маппинге | 235 | 1 | show-my-location | I5374:802560;40000385:8868;40006534:14641;40006534:7699 |
| шрифт без стиля: WB Sans Medium 24/100 | 234 | 1 | show-my-location | I5374:802560;40000385:8868;40006534:7701 |
| сырой #ff0000 [shape] | 200 | 4 | geo-problems, illustrations, not-work … | 5374:886691 5374:722382 I5374:738091;4270:112406 |
| сырой #979797 [shape] | 152 | 3 | backlog-ui, no-car, tariffs | 5371:80610 5374:1040280 5374:563976 |
| сырой #ff10d7 [shape] | 140 | 1 | profile | 5374:533920 |
| градиент [text] | 128 | 1 | profile | 5374:530270 |
| шрифт без стиля: WB Sans Medium 20/20 | 110 | 1 | profile | 5374:530858 |
| сырой эффект: inner_shadow | 88 | 3 | backlog-ui, errors, not-work | I5371:80825;4270:112359 I5374:358797;4270:112359 I5374:738091;4270:112359 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.12 + drop 0,0 r1 s0 #000000@0.15 | 84 | 3 | permissions, service-coverage, taxi | 5374:1019810 5374:86711 5374:896938 |
| сырой #ffffff [text] | 77 | 5 | backlog-ui, no-car, not-work … | 5371:80600 5374:1040270 5374:738180 |
| сырой эффект: drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff | 60 | 1 | service-coverage | 5374:86863 |
| сырой #18181b [shape] | 48 | 1 | errors | I5374:358834;4906:196320;2646:2322 |
| сырой #00579f [shape] | 45 | 2 | backlog-ui, no-car | 5371:80665 5374:1040339 |
| шрифт без стиля: Roboto Regular 65.25/85 | 36 | 1 | geo-problems | 5374:885753 |
| #000000 → Route/Primary [stroke] — не w4 (w4.5) | 30 | 1 | tariffs | I5374:564637;5374:564702;5374:564954;647:102191;647:102121 |
| сырой #ffffff@0.05 [shape] | 30 | 1 | taxi | 5374:894224 |
| сырой #000000@0.08 [stroke] | 30 | 1 | taxi | 5374:894224 |
| шрифт без стиля: SF Pro Text Semibold 17/24 | 27 | 1 | tariffs | I5374:564637;5374:564702;5374:564954;647:102187 |
| сырой #d8d8d8 [shape] | 21 | 2 | backlog-ui, no-car | 5371:80611 5374:1040281 |
| сырой #979797 [stroke] | 21 | 2 | backlog-ui, no-car | 5371:80611 5374:1040281 |
| шрифт без стиля: SF Pro Text Medium 16/16 | 20 | 2 | backlog-ui, no-car | 5371:80663 5374:1040337 |
| сырой #232326 [shape] | 20 | 1 | tariffs | I5374:563780;619:1373 |
| #000000 → Route/Primary [stroke] — не w4 (w2) | 19 | 1 | tariffs | I5374:563864;1932:113 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 18 | 2 | backlog-ui, no-car | 5371:80577 5374:1040247 |
| [Green] [shape] — нет в маппинге | 18 | 2 | backlog-ui, no-car | I5371:80762;1945:3103 I5374:1040311;1945:3103 |
| сырой #1d354f [shape] | 18 | 1 | geo-problems | 5374:886669 |
| сырой #ffb800 [shape] | 18 | 1 | geo-problems | 5374:886669 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 17 | 2 | not-work, permissions | I5374:738134;218:49 5374:1020112 |
| эффект [Shadow Up] — нет в маппинге | 15 | 1 | permissions | 5374:1020561 |
| сырой #000000@0.40 [shape] | 12 | 2 | backlog-ui, not-work | I5371:80825;4270:112414 I5374:738091;4270:112414 |
| #000000 → Route/Primary [stroke] — не w4 (w3) | 11 | 1 | permissions | 5374:1020391 |
| сырой #000000 [stroke] | 10 | 1 | permissions | 5374:1019809 |
| [Gradients [day]/Primary] [frame] — нет в маппинге | 8 | 1 | geo-problems | 5374:885809 |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 4 | 1 | backlog-ui | 5371:80591 |
| [Fill / Light Grey] [shape] — нет в маппинге | 4 | 1 | backlog-ui | 5371:80674 |
| сырой #70707f [shape] | 4 | 1 | not-work | I5374:738091;4270:112412 |
| сырой #656573 [shape] | 4 | 1 | not-work | I5374:738091;4270:112420 |
| сырой #ffffff@0.20 [shape] | 4 | 1 | not-work | I5374:738091;4270:112422 |
| эффект [.blur tiny] — нет в маппинге | 4 | 1 | not-work | I5374:738142;349:4028;244:1423 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 3 | 1 | backlog-ui | 5371:80606 |
| {Theme:bg/level 2} [shape/shape] — нет правила | 2 | 1 | not-work | I5374:738091;4270:112355 |
| сырой эффект: inner_shadow + layer_blur | 2 | 1 | not-work | I5374:738091;4270:112407 |
| {Theme:stroke/secondary} [stroke] — нет в маппинге | 2 | 1 | not-work | I5374:738091;4270:112410 |
| сырой #8f8fa3 [shape] | 2 | 1 | not-work | I5374:738091;4270:112419 |
| сырой #000000@0.70 [shape] | 2 | 1 | not-work | I5374:738091;4270:112423 |
| сырой #c7c7d7@0.60 [shape] | 2 | 1 | not-work | I5374:738091;4270:112427 |
| сырой #ffffff@0.80 [shape] | 2 | 1 | not-work | I5374:738091;4270:112439 |
| сырой #ffffff@0.32 [shape] | 2 | 1 | not-work | I5374:738091;4270:112441 |
| сырой #000000@0.00 [shape] | 2 | 1 | not-work | I5374:738091;4270:112442 |
| [Gradients/Shimmer] [frame] — нет в маппинге | 2 | 1 | not-work | I5374:738129;471:162368 |
| сырой #444444 [frame] | 1 | 1 | not-work | 5374:738088 |
| сырой #ffffff@0.10 [stroke] | 1 | 1 | not-work | 5374:738088 |
