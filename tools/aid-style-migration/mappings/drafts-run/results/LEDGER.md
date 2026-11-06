# Сводка прогонов (собрано scripts/report.mjs, руками не править)

## Покрытие: состояние копий

Считается всё состояние копии, не замены прогона. Единица — заливка, обводка, шрифт, эффект на видимом узле.
Процент — покрыто / (покрыто + не покрыто). Вне счёта — логотипы, иллюстрации, пины, вставки маркетплейса, определены по именам приближённо.

| страница | заливки | обводки | шрифты | эффекты | всё | покрыто | не покрыто | вне счёта |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Backlog UI — Switched Styles | 65 % | 0 % | 84 % | 61 % | **66 %** | 163 | 83 | 14 |
| Errors — Switched Styles | 81 % | 18 % | 86 % | 81 % | **80 %** | 974 | 246 | 697 |
| ✅ GEO Problems — Switched Styles | 91 % | 52 % | 100 % | 71 % | **91 %** | 923 | 96 | 74 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | 70 % | 13 % | 91 % | 47 % | **72 %** | 4 036 | 1 576 | 358 |
| ✅ Navigation 🧭 — Switched Styles | 75 % | 25 % | 77 % | 50 % | **72 %** | 39 927 | 15 799 | 6 710 |
| ✅ No car — Switched Styles | 63 % | 14 % | 81 % | 49 % | **63 %** | 609 | 355 | 29 |
| ✅ not work — Switched Styles | 81 % | 33 % | 100 % | 88 % | **84 %** | 316 | 60 | 47 |
| Order Flow — Switched Styles | 93 % | 65 % | 98 % | 73 % | **92 %** | 35 362 | 3 177 | 1 763 |
| ✅ Permissions — Switched Styles | 85 % | 62 % | 96 % | 67 % | **85 %** | 1 005 | 177 | 112 |
| ⌛️ Profile — Switched Styles | 75 % | 11 % | 68 % | 53 % | **69 %** | 5 385 | 2 452 | 101 |
| ✅ Service coverage — Switched Styles | 97 % | 94 % | 100 % | 88 % | **97 %** | 2 529 | 75 | 442 |
| ✅ Show my location — Switched Styles | 93 % | 39 % | 91 % | 76 % | **89 %** | 23 241 | 2 767 | 976 |
| ⌛️ Tariffs — Switched Styles | 71 % | 3 % | 73 % | 43 % | **65 %** | 936 | 495 | 50 |
| ✅ Taxi for friends — Switched Styles | 84 % | 33 % | 87 % | 69 % | **83 %** | 1 432 | 301 | 74 |
| test — Switched Styles | 83 % | 60 % | 93 % | 75 % | **84 %** | 2 862 | 537 | 220 |
| ✅ Where 🗺️ - Migration — Switched Styles | 87 % | 34 % | 93 % | 43 % | **83 %** | 17 517 | 3 689 | 2 366 |
| ✅ Where 🗺️ — Switched Styles | 85 % | 38 % | 93 % | 43 % | **82 %** | 17 294 | 3 912 | 2 366 |
| **Итого** | 84 % | 38 % | 89 % | 57 % | **81 %** | 154 511 | 35 797 | 16 399 |

## Замены и пропуски по прогонам

| страница | копия | заменено | не заменено | последний прогон |
|---|---|---:|---:|---|
| Backlog UI — Switched Styles | `5371:80571` | 36 | 239 | 2026-11-06 |
| Errors — Switched Styles | `5374:358551` | 154 | 1 587 | 2026-11-06 |
| ✅ GEO Problems — Switched Styles | `5374:885750` | 96 | 412 | 2026-11-06 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | `5374:721192` | 1 022 | 3 250 | 2026-11-06 |
| ✅ Navigation 🧭 — Switched Styles | `5374:207972` | 6 094 | 29 660 | 2026-11-06 |
| ✅ No car — Switched Styles | `5374:1040241` | 158 | 711 | 2026-11-06 |
| ✅ not work — Switched Styles | `5374:738087` | 15 | 252 | 2026-11-06 |
| Order Flow — Switched Styles | `5374:903468` | 20 590 | 6 778 | 2026-11-06 |
| ✅ Permissions — Switched Styles | `5374:1019808` | 126 | 507 | 2026-11-06 |
| ⌛️ Profile — Switched Styles | `5374:527493` | 4 612 | 6 225 | 2026-11-06 |
| ✅ Service coverage — Switched Styles | `5374:86156` | 301 | 863 | 2026-11-06 |
| ✅ Show my location — Switched Styles | `5374:802548` | 5 385 | 5 119 | 2026-11-06 |
| ⌛️ Tariffs — Switched Styles | `5374:563482` | 238 | 820 | 2026-11-06 |
| ✅ Taxi for friends — Switched Styles | `5374:894051` | 202 | 882 | 2026-11-06 |
| test — Switched Styles | `5374:1030847` | 544 | 1 046 | 2026-11-06 |
| ✅ Where 🗺️ - Migration — Switched Styles | `5374:623349` | 1 909 | 6 981 | 2026-11-06 |
| ✅ Where 🗺️ — Switched Styles | `5374:421690` | 2 046 | 7 273 | 2026-11-06 |
| **Итого** | | **43 528** | **72 605** | |

## Незаменённое по всем страницам

| причина | кол-во | страниц | где | ID |
|---|---:|---:|---|---|
| градиент [shape] | 5 351 | 17 | backlog-ui, errors, geo-problems … | I5371:80719;257:2838 I5374:358587;2189:196082 5374:886135 |
| сырой эффект: layer_blur | 4 489 | 16 | backlog-ui, errors, geo-problems … | I5371:80825;4270:112360 I5374:358560;218:116 5374:886148 |
| сырой #000000 [shape] | 3 949 | 16 | backlog-ui, errors, geo-problems … | 5371:80712 I5374:358559;349:4028;244:1424 5374:886149 |
| сырой #c4c4c4 [shape] | 3 824 | 10 | geo-problems, illustrations, navigation … | I5374:886133;1228:7454 5374:721262 I5374:211920;1248:7510 |
| сырой #ffffff [shape] | 2 511 | 16 | backlog-ui, errors, illustrations … | 5371:80580 I5374:358559;349:4028;244:1423 5374:721206 |
| сырой эффект: background_blur | 1 810 | 10 | geo-problems, illustrations, navigation … | I5374:886133;1228:7439 I5374:722037;1228:7439 5374:208824 |
| [Background [day]/Secondary] [shape/shape] — нет правила | 1 309 | 6 | illustrations, navigation, permissions … | I5374:721536;1242:357 I5374:214271;1242:357 I5374:1020975;2194:200039;1242:357 |
| градиент [frame] | 1 194 | 10 | errors, navigation, not-work … | I5374:358834;4906:196320;2646:2348 I5374:208023;2276:25079 I5374:738191;1093:24175 |
| сырой #d9d9d9 [shape] | 1 055 | 3 | profile, service-coverage, show-my-location | 5374:527495 5374:86246 I5374:803140;40001108:25773;5374:817780;427:15332;40001108:28677 |
| сырой #ffffff [stroke] | 1 046 | 9 | backlog-ui, navigation, no-car … | 5371:80575 I5374:209731;2759:51235 5374:1040245 |
| сырой #000000 [stroke] | 1 035 | 8 | illustrations, navigation, not-work … | I5374:721347;1932:113 I5374:209726;3087:25772;2216:41798 5374:738189 |
| сырой #ffffff@0.90 [shape] | 1 010 | 6 | illustrations, order-flow, permissions … | I5374:722037;1228:7440 I5374:918263;1228:7440 I5374:1020975;2194:200015;1228:7440 |
| шрифт без стиля: SF Pro Text Semibold 12/13 | 786 | 2 | order-flow, show-my-location | 5374:903752 5374:803458 |
| сырой #000000 [text] | 742 | 5 | geo-problems, navigation, permissions … | 5374:885753 I5374:209726;3087:25773 5374:1019858 |
| градиент [stroke] | 699 | 4 | backlog-ui, errors, order-flow … | 5371:80576 I5374:358834;4906:196320;2646:2330;494:16458 I5374:903780;15:3905 |
| сырой #ff0000 [shape] | 616 | 6 | geo-problems, illustrations, navigation … | 5374:886691 5374:722382 5374:218318 |
| сырой #ffffff [text] | 600 | 9 | backlog-ui, geo-problems, illustrations … | 5371:80600 5374:885789 5374:721317 |
| [Description/descriptionAccent — lion] — нет в маппинге | 550 | 3 | navigation, where-migration, where | I5374:209839;2015:54412;4502:20761;4522:18967;4482:7422 I5374:626717;409:1590 I5374:425058;409:1590 |
| {System:Magin Top}=54 paddingTop — нет цели | 524 | 3 | not-work, order-flow, show-my-location | 5374:738182 5374:903625 5374:802550 |
| {Color:tx-brand/green/green} [shape] — нет в маппинге | 513 | 2 | order-flow, show-my-location | I5374:903637;40000385:8868;3866:93273;40006534:7699 I5374:802560;40000385:8868;40006534:14641;40006534:7699 |
| сырой #ff5f00 [shape] | 486 | 3 | not-work, order-flow, show-my-location | I5374:738206;40007187:43967;427:17588 I5374:903770;1093:24503;3072:124505 I5374:802565;40007187:67012;40007187:43967;427:17588 |
| сырой #eb001b [shape] | 486 | 3 | not-work, order-flow, show-my-location | I5374:738206;40007187:43967;427:17589 I5374:903770;1093:24503;3072:124506 I5374:802565;40007187:67012;40007187:43967;427:17589 |
| сырой #f79e1b [shape] | 485 | 2 | order-flow, show-my-location | I5374:903770;1093:24503;3072:124507 I5374:802565;40007187:67012;40007187:43967;427:17590 |
| шрифт без стиля: Factor A TRIAL Medium 10/11 | 445 | 1 | navigation | I5374:209726;2190:27724 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 385 | 8 | errors, geo-problems, not-work … | I5374:358560;218:117 5374:886149 I5374:738134;218:49 |
| [Description/description] — нет в маппинге | 364 | 1 | navigation | I5374:209745;1269:9517 |
| [Action/actionAccent — miniPig] — нет в маппинге | 355 | 4 | errors, show-my-location, where-migration … | I5374:358834;4906:196326;2605:6175 I5374:804228;2781:9134;4202:29304;2671:3648;1289:4780 I5374:626722;2785:78496;431:1658;435:2551 |
| шрифт без стиля: WB Sans Medium 24/100 | 344 | 2 | order-flow, show-my-location | I5871:168783;40000385:8868;40006534:7701 I5374:802560;40000385:8868;40006534:7701 |
| сырой #ffffff@0.05 [shape] | 342 | 4 | permissions, taxi, where-migration … | 5374:1020102 5374:894224 5374:623544 |
| сырой #000000@0.08 [stroke] | 342 | 4 | permissions, taxi, where-migration … | 5374:1020102 5374:894224 5374:623544 |
| [Icons day/Secondary Pressed] → Icon/Secondary [stroke] — скоуп SHAPE_FILL | 332 | 2 | where-migration, where | I5374:623539;1228:7452 I5374:421880;1228:7452 |
| [Description/description — puma] — нет в маппинге | 305 | 1 | navigation | I5374:208130;23445:60397 |
| сырой #a4a4bf [text] | 299 | 1 | navigation | I5374:209726;2190:27761 |
| [Caption/captionUppercace — chameleon] — нет в маппинге | 279 | 1 | navigation | I5374:208120;30006:1220 |
| шрифт без стиля: WB Sans Regular 16/14 | 264 | 1 | navigation | 5374:208837 |
| сырой эффект: drop 0,0 r20 s0 #000000@0.06 | 222 | 5 | geo-problems, permissions, taxi … | 5374:885794 5374:1019929 5374:894053 |
| {Color:tx-control/yellow/bg/idle} [stroke] — нет правила | 186 | 1 | order-flow | 5374:903634 |
| сырой эффект: drop 0,6 r20 s0 #000000@0.08 + background_blur | 172 | 2 | where-migration, where | I5374:623775;1264:96 I5374:422116;1264:96 |
| сырой #979797 [shape] | 168 | 4 | backlog-ui, no-car, tariffs … | 5371:80610 5374:1040280 5374:563976 |
| сырой #ffffff@0.10 [shape] | 167 | 3 | taxi, where-migration, where | 5374:894226 5374:623546 5374:421887 |
| сырой #000000@0.03 [stroke] | 167 | 3 | taxi, where-migration, where | 5374:894226 5374:623546 5374:421887 |
| сырой #ff10d7 [shape] | 140 | 1 | profile | 5374:533920 |
| градиент [text] | 132 | 1 | profile | 5374:530270 |
| сырой эффект: inner_shadow | 116 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112359 I5374:358797;4270:112359 I5374:727362;4270:112359 |
| шрифт без стиля: WB Sans Medium 20/20 | 114 | 1 | profile | 5374:530858 |
| сырой #00b23c [stroke] | 111 | 1 | order-flow | 5374:903633 |
| сырой #1d354f [shape] | 108 | 3 | geo-problems, illustrations, test | 5374:886669 5374:722360 5374:1032151 |
| сырой #ffb800 [shape] | 108 | 3 | geo-problems, illustrations, test | 5374:886669 5374:722360 5374:1032151 |
| [Titles/Large Title] — нет в маппинге | 105 | 1 | profile | 5374:528107 |
| сырой #99ffbb [shape] | 102 | 1 | profile | I5374:534169;5374:541266;1312:94;2938:20004 |
| сырой #014d2d [stroke] | 102 | 1 | profile | I5374:534169;5374:541266;1312:94;2938:20010 |
| сырой #1cc052 [shape] | 102 | 1 | profile | I5374:534169;5374:541266;1312:94;2938:20011 |
| шрифт без стиля: SF Pro Regular 17/22 | 96 | 1 | show-my-location | I5374:803697;40001403:28636;40001069:17932;126:59452 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.12 + drop 0,0 r1 s0 #000000@0.15 | 95 | 4 | no-car, permissions, service-coverage … | 5374:1040438 5374:1019810 5374:86711 |
| сырой #ff813b [shape] | 90 | 1 | profile | 5374:533232 |
| [1 light yellow] [shape] — нет в маппинге | 82 | 1 | profile | 5374:530206 |
| сырой #000000 [frame] | 78 | 2 | errors, show-my-location | I5374:358834;4906:196320;2646:2346 5374:803278 |
| {Theme TX:tx-bg/overlay} [shape] — нет в маппинге | 76 | 1 | show-my-location | I5374:802669;40001063:14769 |
| шрифт без стиля: WB Sans Bold 12/120.00000476837158 | 70 | 1 | profile | 5374:528574 |
| сырой #b066ff [shape] | 68 | 1 | profile | 5374:530842 |
| шрифт без стиля: SF Pro Text Semibold 17/24 | 67 | 2 | illustrations, tariffs | I5374:721509;647:1978;5374:727427;647:101965 I5374:564637;5374:564702;5374:564954;647:102187 |
| сырой #232326 [shape] | 64 | 2 | illustrations, tariffs | 5374:721220 I5374:563780;619:1373 |
| шрифт без стиля: WB Sans Bold 30/100 | 63 | 1 | profile | 5374:530283 |
| {System Colors:Separators/Non-opaque} [stroke] — нет в маппинге | 62 | 1 | show-my-location | I5374:803123;2189:195907 |
| сырой эффект: drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff | 60 | 1 | service-coverage | 5374:86863 |
| сырой #18181b [shape] | 48 | 1 | errors | I5374:358834;4906:196320;2646:2322 |
| сырой #cacacc [shape] | 48 | 2 | illustrations, tariffs | 5374:721216 I5374:563780;619:1369 |
| сырой #00579f [shape] | 45 | 2 | backlog-ui, no-car | 5371:80665 5374:1040339 |
| [Orange] [shape] — нет в маппинге | 45 | 3 | backlog-ui, illustrations, tariffs | I5371:80631;1609:1657 5374:721291 I5374:563551;1609:1657 |
| {Color:tx-accent/grey/primary} «Shadow» — пробел | 45 | 3 | permissions, service-coverage, test | I5374:1020937;2189:196066;2189:196058 I5374:88454;1535:157209;1398:153775 I5374:1031665;19:89299 |
| эффект [Shadow Up] — нет в маппинге | 39 | 2 | permissions, service-coverage | 5374:1020561 5374:88797 |
| сырой #232326 [text] | 36 | 2 | backlog-ui, no-car | 5371:80591 5374:1040261 |
| шрифт без стиля: Roboto Regular 65.25/85 | 36 | 1 | geo-problems | 5374:885753 |
| [Gradients [day]/Primary] [frame] — нет в маппинге | 34 | 2 | geo-problems, illustrations | 5374:885809 I5374:722033;16654:175213 |
| [Day / Black] [frame/frame] — нет правила | 34 | 1 | illustrations | I5374:723553;2076:194720 |
| шрифт без стиля: SF Pro Text Medium 16/16 | 32 | 3 | backlog-ui, no-car, tariffs | 5371:80663 5374:1040337 5374:563945 |
| сырой #d8d8d8 [shape] | 32 | 3 | backlog-ui, no-car, tariffs | 5371:80611 5374:1040281 5374:563994 |
| сырой #979797 [stroke] | 32 | 3 | backlog-ui, no-car, tariffs | 5371:80611 5374:1040281 5374:563994 |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 30 | 3 | backlog-ui, no-car, tariffs | 5371:80591 5374:1040261 5374:563587 |
| {Theme TX:tx-bg/map} [frame] — нет в маппинге | 30 | 2 | permissions, service-coverage | 5374:1020492 5374:88782 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 29 | 3 | backlog-ui, no-car, tariffs | 5371:80606 5374:1040276 5374:563860 |
| сырой #d85d00 [shape] | 24 | 1 | errors | I5374:358834;4906:196320;2646:2330;494:16064 |
| сырой эффект: drop 0,7 r9 s0 #ffffff | 24 | 1 | errors | I5374:358834;4906:196320;2646:2330;494:17578 |
| сырой эффект: inner_shadow + inner_shadow | 24 | 1 | errors | I5374:358834;4906:196320;2646:2330;496:22880 |
| сырой #eaeaea [shape] | 24 | 1 | errors | I5374:358834;4906:196320;2646:2330;496:20944 |
| сырой #ffffff@0.25 [shape] | 24 | 2 | geo-problems, test | 5374:886686 5374:1032168 |
| сырой #8c7aff@0.30 [shape] | 24 | 1 | service-coverage | 5374:87405 |
| шрифт без стиля: SF Pro Text Semibold 17/20 SMALL_CAPS_FORCED | 24 | 1 | test | I5374:1030858;2645:221737 |
| сырой #ffc800 [stroke] | 22 | 1 | errors | I5374:358836;1168:1949;1157:1873;3263:22958 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 18 | 2 | backlog-ui, no-car | 5371:80577 5374:1040247 |
| сырой #6d6f75 [text] | 18 | 2 | backlog-ui, no-car | 5371:80590 5374:1040260 |
| [Fill / Light Grey] [shape] — нет в маппинге | 18 | 2 | backlog-ui, no-car | 5371:80674 5374:1040348 |
| [Green] [shape] — нет в маппинге | 18 | 2 | backlog-ui, no-car | I5371:80762;1945:3103 I5374:1040311;1945:3103 |
| шрифт без стиля: ALS Hauss VF Medium 19/22 | 18 | 1 | errors | I5374:358834;4906:196320;2646:2347 |
| сырой #ffffff@0.30 [shape] | 18 | 2 | geo-problems, test | 5374:886699 5374:1032181 |
| сырой #131313 [frame] | 17 | 1 | errors | I5374:358834;4906:196320;2646:2348 |
| сырой эффект: drop 0,0 r250 s0 #ffffff@0.50 + drop 0,0 r100 s0 #ffffff | 16 | 1 | service-coverage | 5374:87054 |
| {System Colors:Labels/Primary} [text] — нет в маппинге | 16 | 1 | taxi | I5374:897665;5374:898318 |
| шрифт без стиля: Google Sans Regular 17/20 | 16 | 1 | test | 5374:1031684 |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow | 15 | 1 | errors | I5374:358922;3075:5573 |
| сырой #f2bfbf [frame] | 15 | 2 | permissions, service-coverage | 5374:1019810 5374:86744 |
| сырой #8c7aff [shape] | 15 | 1 | service-coverage | 5374:86347 |
| {System Colors:Colors/Blue} [text] — нет в маппинге | 15 | 1 | taxi | I5374:897665;5374:898324 |
| [Day / White] [text/text] — нет правила | 13 | 1 | tariffs | I5374:563777;1903:4801 |
| сырой #000000@0.40 [shape] | 12 | 2 | backlog-ui, not-work | I5371:80825;4270:112414 I5374:738091;4270:112414 |
| сырой #fb8437 [shape] | 12 | 1 | errors | I5374:358834;4906:196320;2646:2330;494:16636 |
| сырой #989898 [shape] | 12 | 1 | no-car | 5374:1040380 |
| сырой #000518@0.08 [shape] | 12 | 1 | tariffs | 5374:563564 |
| [ Night / White] [shape] — не иконка | 12 | 1 | tariffs | 5374:563851 |
| сырой #f5f5f6 [frame] | 12 | 1 | taxi | 5374:897153 |
| сырой #f5f5f5 [shape] | 12 | 1 | test | I5374:1032052;1037:164 |
| шрифт без стиля: SF Pro Semibold 22/28 | 11 | 1 | service-coverage | 5374:86184 |
| шрифт без стиля: SF Pro Regular 17/24 | 11 | 1 | service-coverage | 5374:86185 |
| сырой #f96c88 [shape] | 10 | 1 | service-coverage | 5374:87731 |
| шрифт без стиля: SF Pro Text Regular 17/24 | 10 | 1 | tariffs | I5374:564637;5374:564702;5374:564954;737:102821 |
| {Color:tx-bg/level −1 muted} [shape/shape] — нет правила | 10 | 1 | test | I5374:1031654;907:124127;578:320 |
| шрифт без стиля: SF Pro Display Medium 24/26 | 8 | 1 | geo-problems | 5374:885948 |
| шрифт без стиля: Roboto Bold 65.25/85 | 6 | 1 | geo-problems | 5374:885789 |
| сырой #70707f [shape] | 4 | 1 | not-work | I5374:738091;4270:112412 |
| сырой #656573 [shape] | 4 | 1 | not-work | I5374:738091;4270:112420 |
| сырой #ffffff@0.20 [shape] | 4 | 1 | not-work | I5374:738091;4270:112422 |
| эффект [.blur tiny] — нет в маппинге | 4 | 1 | not-work | I5374:738142;349:4028;244:1423 |
| сырой #444444 [frame] | 3 | 2 | backlog-ui, not-work | 5371:80572 5374:738088 |
| сырой #ffffff@0.10 [stroke] | 3 | 2 | backlog-ui, not-work | 5371:80572 5374:738088 |
| сырой #3458e8 [shape] | 2 | 1 | backlog-ui | 5371:80583 |
| [Night / Gray 20] [shape] — нет в маппинге | 2 | 1 | backlog-ui | 5371:80597 |
| сырой эффект: drop 0,7 r24 s0 #000000@0.29 | 2 | 1 | backlog-ui | 5371:80599 |
| сырой #545665 [shape] | 2 | 1 | backlog-ui | 5371:80603 |
| [Purple] [shape] — нет в маппинге | 2 | 1 | backlog-ui | I5371:80627;1609:1657 |
| сырой #ebecf0 [shape] | 2 | 1 | backlog-ui | 5371:80633 |
| {Theme:bg/level 2} [shape/shape] — нет правила | 2 | 1 | not-work | I5374:738091;4270:112355 |
| сырой эффект: inner_shadow + layer_blur | 2 | 1 | not-work | I5374:738091;4270:112407 |
| {Theme:stroke/secondary} [stroke] — нет в маппинге | 2 | 1 | not-work | I5374:738091;4270:112410 |
| сырой #8f8fa3 [shape] | 2 | 1 | not-work | I5374:738091;4270:112419 |
| сырой #000000@0.70 [shape] | 2 | 1 | not-work | I5374:738091;4270:112423 |
| сырой #c7c7d7@0.60 [shape] | 2 | 1 | not-work | I5374:738091;4270:112427 |
| сырой #ffffff@0.80 [shape] | 2 | 1 | not-work | I5374:738091;4270:112439 |
| сырой #ffffff@0.32 [shape] | 2 | 1 | not-work | I5374:738091;4270:112441 |
| сырой #000000@0.00 [shape] | 2 | 1 | not-work | I5374:738091;4270:112442 |
| ошибка: in get_strokes: The node with id "I5374:922110;1095:415;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922110;1095:415;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922111;1095:809;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922111;1095:809;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922112;1095:809;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922112;1095:809;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922131;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922131;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922132;1095:809;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922132;1095:809;599:2880;599:2845;599:2809;3867:457 |
