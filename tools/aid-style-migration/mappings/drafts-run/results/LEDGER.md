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
| Errors — Switched Styles | `5374:358551` | 170 | 1 576 | 2026-11-10 |
| ✅ GEO Problems — Switched Styles | `5374:885750` | 96 | 412 | 2026-11-06 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | `5374:721192` | 1 024 | 3 252 | 2026-11-10 |
| ✅ Navigation 🧭 — Switched Styles | `5374:207972` | 6 292 | 29 484 | 2026-11-10 |
| ✅ No car — Switched Styles | `5374:1040241` | 158 | 711 | 2026-11-06 |
| ✅ not work — Switched Styles | `5374:738087` | 15 | 252 | 2026-11-06 |
| Order Flow — Switched Styles | `5374:903468` | 20 590 | 6 778 | 2026-11-06 |
| ✅ Permissions — Switched Styles | `5374:1019808` | 127 | 506 | 2026-11-10 |
| ⌛️ Profile — Switched Styles | `5374:527493` | 4 612 | 6 225 | 2026-11-06 |
| ✅ Service coverage — Switched Styles | `5374:86156` | 307 | 857 | 2026-11-10 |
| ✅ Show my location — Switched Styles | `5374:802548` | 5 466 | 5 056 | 2026-11-10 |
| ⌛️ Tariffs — Switched Styles | `5374:563482` | 242 | 817 | 2026-11-10 |
| ✅ Taxi for friends — Switched Styles | `5374:894051` | 202 | 882 | 2026-11-06 |
| test — Switched Styles | `5374:1030847` | 544 | 1 046 | 2026-11-06 |
| ✅ Where 🗺️ - Migration — Switched Styles | `5374:623349` | 2 117 | 6 861 | 2026-11-10 |
| ✅ Where 🗺️ — Switched Styles | `5374:421690` | 2 254 | 7 153 | 2026-11-10 |
| **Итого** | | **44 252** | **72 107** | |

## Незаменённое по всем страницам

| причина | кол-во | страниц | где | ID |
|---|---:|---:|---|---|
| градиент [shape] | 5 351 | 17 | backlog-ui, errors, geo-problems … | I5371:80719;257:2838 5374:886135 I5374:1040425;257:2574 |
| сырой эффект: layer_blur | 4 495 | 17 | backlog-ui, errors, geo-problems … | I5371:80825;4270:112360 5374:886148 I5374:1040915;40006663:32110 |
| сырой #000000 [shape] | 3 949 | 16 | backlog-ui, errors, geo-problems … | 5371:80712 5374:886149 5374:1040386 |
| сырой #c4c4c4 [shape] | 3 836 | 12 | errors, geo-problems, illustrations … | I5374:886133;1228:7454 I5374:918263;1228:7454 5374:895831 |
| сырой #ffffff [shape] | 2 511 | 16 | backlog-ui, errors, illustrations … | 5371:80580 5374:1040250 I5374:738091;4270:112359 |
| сырой эффект: background_blur | 1 848 | 12 | errors, geo-problems, illustrations … | I5374:886133;1228:7439 5374:903698 5374:527501 |
| [Background [day]/Secondary] [shape/shape] — нет правила | 1 312 | 7 | illustrations, navigation, permissions … | 5374:1030874 |
| градиент [frame] | 1 218 | 12 | errors, illustrations, navigation … | I5374:738191;1093:24175 I5871:168781;1093:24175 5374:528138 |
| сырой #d9d9d9 [shape] | 1 160 | 5 | navigation, permissions, profile … | 5374:527495 |
| сырой #ffffff@0.90 [shape] | 1 157 | 7 | illustrations, navigation, order-flow … | I5374:918263;1228:7440 I5374:1031083;1228:7440 |
| сырой #000000 [stroke] | 1 110 | 12 | errors, illustrations, navigation … | 5374:738189 5374:904026 5374:895934 |
| сырой #ffffff [stroke] | 1 081 | 12 | backlog-ui, errors, illustrations … | 5371:80575 5374:1040245 I5374:738198;3888:101735;40008793:92370 |
| градиент [stroke] | 833 | 9 | backlog-ui, errors, illustrations … | 5371:80576 I5374:903780;15:3905 5374:530807 |
| сырой #000000 [text] | 787 | 6 | geo-problems, navigation, permissions … | 5374:885753 5374:530207 |
| шрифт без стиля: SF Pro Text Semibold 12/13 | 786 | 2 | order-flow, show-my-location | 5374:903752 |
| сырой #ffffff [text] | 676 | 12 | backlog-ui, errors, geo-problems … | 5371:80600 5374:885789 5374:1040270 |
| сырой #ff0000 [shape] | 648 | 9 | errors, geo-problems, illustrations … | 5374:886691 I5374:738091;4270:112406 5374:897877 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 646 | 12 | errors, geo-problems, illustrations … | 5374:886149 I5374:738134;218:49 5374:894234 |
| [Description/descriptionAccent — lion] — нет в маппинге | 563 | 5 | errors, navigation, tariffs … |  |
| {System:Magin Top}=54 paddingTop — нет цели | 524 | 3 | not-work, order-flow, show-my-location | 5374:738182 5374:903625 |
| {Color:tx-brand/green/green} [shape] — нет в маппинге | 513 | 2 | order-flow, show-my-location | I5374:903637;40000385:8868;3866:93273;40006534:7699 |
| сырой #ff5f00 [shape] | 493 | 4 | not-work, order-flow, show-my-location … | I5374:738206;40007187:43967;427:17588 I5374:903770;1093:24503;3072:124505 |
| сырой #eb001b [shape] | 493 | 4 | not-work, order-flow, show-my-location … | I5374:738206;40007187:43967;427:17589 I5374:903770;1093:24503;3072:124506 |
| сырой #f79e1b [shape] | 492 | 3 | order-flow, show-my-location, tariffs | I5374:903770;1093:24503;3072:124507 |
| шрифт без стиля: Factor A TRIAL Medium 10/11 | 445 | 1 | navigation |  |
| градиент [text] | 365 | 6 | errors, navigation, profile … | 5374:530270 |
| [Description/description] — нет в маппинге | 364 | 1 | navigation |  |
| сырой #ffffff@0.05 [shape] | 362 | 5 | illustrations, permissions, taxi … | 5374:894224 |
| сырой #000000@0.08 [stroke] | 362 | 5 | illustrations, permissions, taxi … | 5374:894224 |
| [Icons day/Secondary Pressed] → Icon/Secondary [stroke] — скоуп SHAPE_FILL | 348 | 4 | illustrations, permissions, where-migration … |  |
| шрифт без стиля: WB Sans Medium 24/100 | 344 | 2 | order-flow, show-my-location | I5871:168783;40000385:8868;40006534:7701 |
| сырой #1d354f [shape] | 333 | 4 | geo-problems, illustrations, navigation … | 5374:886669 5374:1032151 |
| сырой #ffb800 [shape] | 333 | 4 | geo-problems, illustrations, navigation … | 5374:886669 5374:1032151 |
| {Color:tx-accent/grey/primary} «Shadow» — пробел | 308 | 8 | errors, illustrations, navigation … | I5374:1031665;19:89299 |
| [Description/description — puma] — нет в маппинге | 305 | 1 | navigation |  |
| сырой #232326 [shape] | 304 | 6 | illustrations, navigation, permissions … |  |
| сырой #a4a4bf [text] | 299 | 1 | navigation |  |
| [Caption/captionUppercace — chameleon] — нет в маппинге | 279 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 16/14 | 264 | 1 | navigation |  |
| сырой #000000 [frame] | 261 | 4 | errors, navigation, service-coverage … |  |
| {Color:tx-control/yellow/bg/idle} [stroke] — нет правила | 242 | 2 | order-flow, show-my-location | 5374:903634 |
| сырой эффект: drop 0,0 r20 s0 #000000@0.06 | 236 | 6 | geo-problems, illustrations, permissions … | 5374:885794 5374:894053 |
| сырой #979797 [shape] | 232 | 6 | backlog-ui, no-car, tariffs … | 5371:80610 5374:1040280 5374:898039 |
| сырой #ffc800 [stroke] | 228 | 5 | errors, navigation, show-my-location … |  |
| шрифт без стиля: ALS Hauss VF Medium 17/20 | 221 | 1 | navigation |  |
| [Paragraph/paragraphAccent] — нет в маппинге | 209 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Regular 13/17 UPPER | 204 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 13/15 + ALS Hauss VF Regular 13/15 | 204 | 1 | navigation |  |
| [Day / White] [text/text] — нет правила | 188 | 3 | illustrations, navigation, tariffs |  |
| сырой #d34dc6@0.30 [shape] | 180 | 1 | navigation |  |
| [Body/bodyAccent — buffalo] — нет в маппинге | 179 | 2 | errors, navigation |  |
| сырой #cacacc [shape] | 175 | 6 | illustrations, navigation, permissions … |  |
| эффект [Shadow Tabbar] — нет в маппинге | 174 | 1 | navigation |  |
| сырой эффект: drop 0,6 r20 s0 #000000@0.08 + background_blur | 174 | 3 | permissions, where-migration, where |  |
| сырой #ffffff@0.10 [shape] | 171 | 4 | permissions, taxi, where-migration … | 5374:894226 |
| сырой #000000@0.03 [stroke] | 171 | 4 | permissions, taxi, where-migration … | 5374:894226 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.12 + drop 0,0 r1 s0 #000000@0.15 | 167 | 6 | no-car, permissions, service-coverage … | 5374:1040438 5374:896938 |
| эффект [Shadow Up] — нет в маппинге | 156 | 6 | errors, permissions, service-coverage … |  |
| шрифт без стиля: Factor A TRIAL Bold 15/17 | 156 | 1 | navigation |  |
| [Caption/caption — cat] — нет в маппинге | 156 | 1 | navigation |  |
| {Theme:bg/level 2} [shape/shape] — нет правила | 156 | 2 | navigation, not-work | I5374:738091;4270:112355 |
| шрифт без стиля: Factor A TRIAL Black 15/17 | 154 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 15/18 | 152 | 1 | navigation |  |
| сырой #ffffff@0.25 [shape] | 148 | 4 | geo-problems, illustrations, navigation … | 5374:886686 5374:1032168 |
| {theme:icon/contraste} [shape] — нет в маппинге | 147 | 3 | tariffs, where-migration, where |  |
| сырой #00b23c [stroke] | 143 | 2 | order-flow, show-my-location | 5374:903633 |
| сырой #ff10d7 [shape] | 140 | 1 | profile | 5374:533920 |
| сырой #f18a00 [text] | 138 | 1 | navigation |  |
| [Day / Gray 20] [shape] — нет в маппинге | 138 | 1 | navigation |  |
| [Text [day]/Primary] [stroke] — нет правила | 128 | 2 | where-migration, where |  |
| шрифт без стиля: Factor A TRIAL Black 10/11 + Factor A TRIAL Medium 10/11 | 125 | 1 | navigation |  |
| [BG/bgAirToCoal (day)] [shape] — нет в маппинге | 124 | 1 | navigation |  |
| {Color:tx-accent/grey/secondary} [stroke] — нет правила | 121 | 2 | navigation, show-my-location |  |
| шрифт без стиля: Google Sans Regular 17/20 | 120 | 2 | navigation, test | 5374:1031684 |
| сырой эффект: inner_shadow | 119 | 5 | backlog-ui, errors, illustrations … | I5371:80825;4270:112359 I5374:738091;4270:112359 |
| [Day / Gray 4] [frame] — нет в маппинге | 118 | 3 | navigation, permissions, service-coverage |  |
| {theme:promo/secondary/bg/blackberry} [frame] — нет в маппинге | 114 | 1 | navigation |  |
| шрифт без стиля: WB Sans Medium 20/20 | 114 | 1 | profile | 5374:530858 |
| [Captions/Caption 3] — нет в маппинге | 112 | 4 | service-coverage, show-my-location, where-migration … |  |
| [Body/body] — нет в маппинге | 110 | 4 | errors, permissions, where-migration … |  |
| шрифт без стиля: SF Pro Semibold 18/28 | 109 | 1 | navigation |  |
| [Titles/Large Title] — нет в маппинге | 107 | 2 | permissions, profile | 5374:528107 |
| [Description/descriptionUppercace — hamster] — нет в маппинге | 102 | 1 | navigation |  |
| сырой #99ffbb [shape] | 102 | 1 | profile | I5374:534169;5374:541266;1312:94;2938:20004 |
| сырой #014d2d [stroke] | 102 | 1 | profile | I5374:534169;5374:541266;1312:94;2938:20010 |
| сырой #1cc052 [shape] | 102 | 1 | profile | I5374:534169;5374:541266;1312:94;2938:20011 |
| сырой #a73afd [shape] | 98 | 2 | navigation, permissions |  |
| шрифт без стиля: SF Pro Regular 17/22 | 96 | 1 | show-my-location |  |
| [Icon [day]/Primary Opposite] [shape] — нет в маппинге | 91 | 1 | navigation |  |
| сырой #ff0000@0.21 [shape] | 90 | 1 | navigation |  |
| сырой #ff813b [shape] | 90 | 1 | profile | 5374:533232 |
| шрифт без стиля: SF Pro Bold 21.760000228881836/100 | 89 | 1 | navigation |  |
| [Icon [day]/Special] [shape] — нет в маппинге | 86 | 1 | navigation |  |
| [1 light yellow] [shape] — нет в маппинге | 82 | 1 | profile | 5374:530206 |
| [Action/action— capybara] — нет в маппинге | 78 | 2 | where-migration, where |  |
| {Theme TX:tx-bg/overlay} [shape] — нет в маппинге | 76 | 1 | show-my-location |  |
| шрифт без стиля: WB Sans Bold 12/120.00000476837158 | 70 | 1 | profile | 5374:528574 |
| сырой #b066ff [shape] | 68 | 1 | profile | 5374:530842 |
| шрифт без стиля: SF Pro Text Semibold 17/24 | 67 | 2 | illustrations, tariffs |  |
| [Gradients [day]/Primary] [frame] — нет в маппинге | 66 | 5 | geo-problems, illustrations, permissions … | 5374:885809 |
| сырой #ffc800 [shape] | 65 | 3 | errors, where-migration, where |  |
| сырой #fffbdd [shape] | 65 | 3 | errors, where-migration, where |  |
| шрифт без стиля: ALS Hauss VF Regular 15/20 | 64 | 2 | where-migration, where |  |
| {Theme TX:tx-bg/map} [frame] — нет в маппинге | 63 | 3 | permissions, service-coverage, where-migration |  |
| шрифт без стиля: WB Sans Bold 30/100 | 63 | 1 | profile | 5374:530283 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 62 | 5 | backlog-ui, no-car, tariffs … | 5371:80577 5374:1040247 |
| {System Colors:Separators/Non-opaque} [stroke] — нет в маппинге | 62 | 1 | show-my-location |  |
| шрифт без стиля: SF Pro Text Regular 17/24 | 62 | 3 | tariffs, where-migration, where |  |
| сырой эффект: drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff | 60 | 1 | service-coverage |  |
| [Caption2/Regular] — нет в маппинге | 60 | 1 | show-my-location |  |
| шрифт без стиля: SF Pro Regular 14/16 | 57 | 3 | service-coverage, where-migration, where |  |
| [Display/display — whale] — нет в маппинге | 56 | 3 | errors, where-migration, where |  |
| [Gradients/Shimmer] [frame] — нет в маппинге | 53 | 4 | errors, show-my-location, where-migration … |  |
| [Blue] [shape] — нет в маппинге | 53 | 5 | permissions, service-coverage, tariffs … |  |
| эффект [/Input shadow] — нет в маппинге | 52 | 2 | where-migration, where |  |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 51 | 4 | backlog-ui, illustrations, no-car … | 5371:80606 5374:1040276 |
| сырой #00579f [shape] | 50 | 3 | backlog-ui, no-car, tariffs | 5371:80665 5374:1040339 |
| {Theme TX:tx-button/blurring/solid/bg/default} [frame] — нет в маппинге | 50 | 2 | where-migration, where |  |
| TEXT смешанные заливки — оставлено | 50 | 2 | where-migration, where |  |
| сырой #18181b [shape] | 48 | 1 | errors |  |
| сырой #fff7e2 [frame] | 48 | 2 | where-migration, where |  |
| шрифт без стиля: Roboto Regular 15/20 | 48 | 2 | where-migration, where |  |
| [Orange] [shape] — нет в маппинге | 45 | 3 | backlog-ui, illustrations, tariffs | I5371:80631;1609:1657 |
| {theme:separator/default} [shape] — нет в маппинге | 44 | 2 | where-migration, where |  |
| [Action/actionAccent] — нет в маппинге | 41 | 3 | errors, where-migration, where |  |
| сырой #232326 [text] | 40 | 3 | backlog-ui, no-car, tariffs | 5371:80591 5374:1040261 |
| шрифт без стиля: SF Pro Medium 16/16 | 40 | 2 | where-migration, where |  |
| сырой #ffffff@0.10 [stroke] | 37 | 4 | backlog-ui, not-work, service-coverage … | 5371:80572 5374:738088 |
| [ Night / White] [shape] — не иконка | 37 | 2 | illustrations, tariffs |  |
| шрифт без стиля: Roboto Regular 65.25/85 | 36 | 1 | geo-problems | 5374:885753 |
| сырой #ffffff@0.30 [shape] | 36 | 3 | geo-problems, illustrations, test | 5374:886699 5374:1032181 |
| [Day / Black] [stroke] — нет правила | 36 | 2 | where-migration, where |  |
| сырой #ff7200 [shape] | 35 | 3 | illustrations, show-my-location, tariffs |  |
| [Day / Black] [frame/frame] — нет правила | 34 | 1 | illustrations |  |
| [Button day/Secondary] [shape] — нет в маппинге | 33 | 2 | illustrations, where-migration |  |
| шрифт без стиля: SF Pro Text Medium 16/16 | 32 | 3 | backlog-ui, no-car, tariffs | 5371:80663 5374:1040337 |
| сырой #d8d8d8 [shape] | 32 | 3 | backlog-ui, no-car, tariffs | 5371:80611 5374:1040281 |
| сырой #979797 [stroke] | 32 | 3 | backlog-ui, no-car, tariffs | 5371:80611 5374:1040281 |
| сырой #ffffff@0.31 [frame] | 32 | 2 | where-migration, where |  |
| эффект [Background Blur/Ultra Thin] — нет в маппинге | 32 | 2 | where-migration, where |  |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow | 31 | 2 | errors, show-my-location |  |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 30 | 3 | backlog-ui, no-car, tariffs | 5371:80591 5374:1040261 |
| [Icon [day]/Primary] [text/text] — нет правила | 30 | 2 | where-migration, where |  |
| шрифт без стиля: SF Pro Bold 15/18 | 30 | 2 | where-migration, where |  |
| шрифт без стиля: SF Pro Semibold 15/18 | 30 | 2 | where-migration, where |  |
| [Day / Gray 4] [stroke] — нет в маппинге | 29 | 2 | illustrations, tariffs |  |
| {System Colors:Colors/Blue} [text] — нет в маппинге | 29 | 3 | permissions, show-my-location, taxi | I5374:897665;5374:898324 |
| сырой #000518@0.08 [shape] | 28 | 2 | illustrations, tariffs |  |
| [Fill / Light Grey] [shape] — нет в маппинге | 26 | 3 | backlog-ui, no-car, tariffs | 5371:80674 5374:1040348 |
| эффект [shadow/close/s] — нет в маппинге | 26 | 1 | show-my-location |  |
| [Button [day]/Primary] [shape/shape] — нет правила | 26 | 1 | where-migration |  |
| сырой #d85d00 [shape] | 24 | 1 | errors |  |
| сырой эффект: drop 0,7 r9 s0 #ffffff | 24 | 1 | errors |  |
| сырой эффект: inner_shadow + inner_shadow | 24 | 1 | errors |  |
| сырой #eaeaea [shape] | 24 | 1 | errors |  |
| шрифт без стиля: SF Pro Display Regular 12/28 | 24 | 1 | illustrations |  |
| шрифт без стиля: SF Pro Display Regular 17/28 | 24 | 1 | illustrations |  |
| шрифт без стиля: SF Pro Display Regular 21/28 | 24 | 1 | illustrations |  |
| [Stroke [day]/Primary] [stroke] — нет в маппинге | 24 | 1 | illustrations |  |
| [Night / Gray 40] [shape] — нет в маппинге | 24 | 1 | illustrations |  |
| сырой #8c7aff@0.30 [shape] | 24 | 1 | service-coverage |  |
| шрифт без стиля: SF Pro Text Regular 12/14 | 24 | 1 | show-my-location |  |
| {Color:tx-bg/level −1 muted} [stroke] — нет правила | 24 | 1 | show-my-location |  |
| {Color:tx-accent/green/bg} [stroke] — нет правила | 24 | 1 | show-my-location |  |
| эффект [Shadow S] — нет в маппинге | 24 | 1 | show-my-location |  |
| шрифт без стиля: SF Pro Text Semibold 17/20 SMALL_CAPS_FORCED | 24 | 1 | test | I5374:1030858;2645:221737 |
| {Color:tx-control/purple/tint/idle} [frame] — нет в маппинге | 23 | 1 | show-my-location |  |
| сырой #100f25 [shape] | 21 | 2 | show-my-location, tariffs |  |
| сырой #000000@0.40 [shape] | 20 | 3 | backlog-ui, errors, not-work | I5371:80825;4270:112414 I5374:738091;4270:112414 |
| {System Colors:Labels/Primary} [text] — нет в маппинге | 20 | 2 | permissions, taxi | I5374:897665;5374:898318 |
| сырой #ebecf0 [shape] | 19 | 3 | backlog-ui, illustrations, tariffs | 5371:80633 |
| сырой #f6f6f9 [frame] | 19 | 1 | show-my-location |  |
| сырой #6d6f75 [text] | 18 | 2 | backlog-ui, no-car | 5371:80590 5374:1040260 |
| [Green] [shape] — нет в маппинге | 18 | 2 | backlog-ui, no-car | I5371:80762;1945:3103 I5374:1040311;1945:3103 |
| шрифт без стиля: ALS Hauss VF Medium 19/22 | 18 | 1 | errors |  |
| [Text [night]/Primary] [text] — нет в маппинге | 18 | 1 | illustrations |  |
| сырой #ffe2f1 [frame] | 18 | 1 | illustrations |  |
| сырой #989898 [shape] | 18 | 2 | no-car, tariffs | 5374:1040380 |
| шрифт без стиля: SF Pro Text Medium 14/110.00000238418579 | 18 | 1 | show-my-location |  |
| шрифт без стиля: ALS Hauss VF Medium 19/20 | 18 | 1 | show-my-location |  |
| сырой #131313 [frame] | 17 | 1 | errors |  |
| {Color:tx-accent/grey/primary-Inverted} [frame/frame] — нет правила | 17 | 1 | show-my-location |  |
| шрифт без стиля: SF Pro Display Regular 6.5/28 | 16 | 1 | illustrations |  |
| сырой эффект: drop 0,3 r5 s0 #000000@0.20 + drop 0,1 r18 s0 #000000@0.18 + drop 0,6 r10 s0 #000000@0.14 | 16 | 1 | illustrations |  |
| [Background [night]/Primary] [shape] — нет в маппинге | 16 | 1 | illustrations |  |
| [Background [night]/Primary] [frame] — нет в маппинге | 16 | 1 | illustrations |  |
| [Pastel [day]/Bart] [frame] — нет в маппинге | 16 | 2 | illustrations, permissions |  |
| сырой эффект: drop 0,0 r250 s0 #ffffff@0.50 + drop 0,0 r100 s0 #ffffff | 16 | 1 | service-coverage |  |
| эффект [.blur tiny] — нет в маппинге | 15 | 3 | errors, not-work, permissions | I5374:738142;349:4028;244:1423 |
| сырой #262626 [shape] | 15 | 2 | illustrations, tariffs |  |
| сырой #f2bfbf [frame] | 15 | 2 | permissions, service-coverage |  |
| сырой #8c7aff [shape] | 15 | 1 | service-coverage |  |
| шрифт без стиля: SF Pro Text Regular 12/16 | 15 | 1 | show-my-location |  |
| {Radius:CRx10}=40 topLeftRadius — нет цели | 14 | 2 | errors, service-coverage |  |
| {Radius:CRx10}=40 topRightRadius — нет цели | 14 | 2 | errors, service-coverage |  |
| {Radius:CRx10}=40 bottomLeftRadius — нет цели | 14 | 2 | errors, service-coverage |  |
| {Radius:CRx10}=40 bottomRightRadius — нет цели | 14 | 2 | errors, service-coverage |  |
| сырой #fbe5f9 [shape] | 14 | 1 | illustrations |  |
| [Background day/Primary] [frame] — нет в маппинге | 14 | 1 | illustrations |  |
| сырой эффект: drop 0,8 r20 s0 #2d2d53@0.12 | 13 | 2 | permissions, service-coverage |  |
| {Color:tx-accent/grey/tertiary} [frame/frame] — нет правила | 13 | 1 | show-my-location |  |
| сырой #505050 [frame] | 13 | 1 | show-my-location |  |
| [Bodies / Body 1] — нет в маппинге | 13 | 1 | where |  |
| сырой #fb8437 [shape] | 12 | 1 | errors |  |
| сырой эффект: drop 0,4 r4 s0 #000000@0.25 + inner_shadow | 12 | 1 | errors |  |
| сырой эффект: drop 0,0.5 r0 s0 #ed8221 | 12 | 1 | errors |  |
| сырой #131313 [shape] | 12 | 1 | errors |  |
| [Day / Gray 4] [shape] — нет в маппинге | 12 | 1 | illustrations |  |
| [Gray / 70%] [text] — нет в маппинге | 12 | 1 | illustrations |  |
| шрифт без стиля: SF Pro Display Regular 23/28 | 12 | 1 | illustrations |  |
| [Button [day]/Disabled] [frame] — нет в маппинге | 12 | 1 | illustrations |  |
| [Text [day]/Disabled] [text] — нет в маппинге | 12 | 1 | illustrations |  |
| сырой #d62347 [shape] | 12 | 1 | illustrations |  |
| сырой #ff661a [shape] | 12 | 1 | show-my-location |  |
| {Color:tx-bg/level 1 base} [stroke] — нет правила | 12 | 1 | show-my-location |  |
| {Theme TX:tx-accent/orange/tint} [text] — нет в маппинге | 12 | 1 | show-my-location |  |
| сырой эффект: drop 3,4 r10 s0 #361616@0.08 + glass | 12 | 1 | show-my-location |  |
| сырой #f5f5f6 [frame] | 12 | 1 | taxi | 5374:897153 |
| сырой #f5f5f5 [shape] | 12 | 1 | test | I5374:1032052;1037:164 |
| шрифт без стиля: SF Pro Semibold 22/28 | 11 | 1 | service-coverage |  |
| шрифт без стиля: SF Pro Regular 17/24 | 11 | 1 | service-coverage |  |
| сырой #26013e@0.25 [shape] | 11 | 1 | show-my-location |  |
| {Color:tx-accent/grey/dark strong} [stroke] — нет правила | 11 | 1 | show-my-location |  |
| сырой эффект: drop 0,-10 r80 s0 #ffffff | 11 | 1 | show-my-location |  |
| сырой #c85626 [frame] | 10 | 1 | errors |  |
| сырой #ff6a00 [frame] | 10 | 1 | errors |  |
| сырой #f96c88 [shape] | 10 | 1 | service-coverage |  |
| сырой эффект: drop 0,-4 r16 s0 #000000@0.12 + noise | 10 | 1 | show-my-location |  |
| сырой #0f013e@0.16 [shape] | 10 | 1 | show-my-location |  |
| {Color:tx-bg/level −1 muted} [shape/shape] — нет правила | 10 | 1 | test | I5374:1031654;907:124127;578:320 |
| [Buttons day/Primary] [frame] — нет в маппинге | 9 | 1 | tariffs |  |
| сырой #444444 [frame] | 8 | 3 | backlog-ui, not-work, service-coverage | 5371:80572 5374:738088 |
| сырой #70707f [shape] | 8 | 2 | errors, not-work | I5374:738091;4270:112412 |
| сырой #656573 [shape] | 8 | 2 | errors, not-work | I5374:738091;4270:112420 |
| сырой #ffffff@0.20 [shape] | 8 | 2 | errors, not-work | I5374:738091;4270:112422 |
| шрифт без стиля: SF Pro Display Medium 24/26 | 8 | 1 | geo-problems | 5374:885948 |
| шрифт без стиля: WB Sans Medium 40/auto | 7 | 1 | errors |  |
| сырой #b17aff [stroke] | 7 | 1 | service-coverage |  |
| сырой #ff8533 [shape] | 6 | 1 | errors |  |
| {theme:notification/warningPrimary} [shape] — нет в маппинге | 6 | 1 | errors |  |
| {Theme:button/secondary/bg/default} [frame] — нет в маппинге | 6 | 1 | errors |  |
| шрифт без стиля: Roboto Bold 65.25/85 | 6 | 1 | geo-problems | 5374:885789 |
| сырой #e4e4ff [shape] | 6 | 1 | service-coverage |  |
| сырой #ededff@0.70 [shape] | 6 | 1 | service-coverage |  |
| {theme:bg/accentSecondary} [frame] — нет в маппинге | 6 | 1 | service-coverage |  |
| сырой эффект: drop 0,-4 r8 s0 #000000@0.10 | 6 | 1 | tariffs |  |
| сырой #8526ff [stroke] | 6 | 1 | tariffs |  |
| [Purple] [shape] — нет в маппинге | 5 | 2 | backlog-ui, permissions | I5371:80627;1609:1657 |
| сырой #a73afd [frame] | 5 | 1 | errors |  |
| сырой #000041 [frame] | 5 | 1 | errors |  |
| [.auto tint/white] [shape] — нет в маппинге | 5 | 1 | permissions |  |
| сырой #1d1c1e [frame] | 5 | 2 | permissions, service-coverage |  |
| шрифт без стиля: SF Pro Medium 14/16 | 5 | 1 | service-coverage |  |
| сырой #ff6e8b [shape] | 5 | 1 | service-coverage |  |
| сырой #ec5171 [stroke] | 5 | 1 | service-coverage |  |
| сырой #19191d@0.50 [shape] | 5 | 1 | service-coverage |  |
| сырой #000000@0.38 [shape] | 5 | 1 | service-coverage |  |
| сырой #000518@0.03 [shape] | 5 | 1 | tariffs |  |
| {Theme:button/tertiary/bg/default} [frame] — нет в маппинге | 4 | 1 | errors |  |
| {Theme:button/tertiary/content/primary/default} [text] — нет в маппинге | 4 | 1 | errors |  |
| {Theme:bg/accentLight} [frame] — нет в маппинге | 4 | 1 | errors |  |
| [Description/descriptionAccent] — нет в маппинге | 4 | 1 | errors |  |
| [Body/Regular] — нет в маппинге | 4 | 1 | permissions |  |
| [Gradients/Top] [shape] — нет в маппинге | 4 | 1 | service-coverage |  |
| сырой #3458e9 [stroke] | 4 | 1 | tariffs |  |
| сырой #4f8ce4 [stroke] | 4 | 1 | tariffs |  |
| сырой эффект: drop 0,2 r8 s0 #000518@0.12 | 4 | 1 | tariffs |  |
| сырой эффект: drop 0,4 r16 s0 #000000@0.06 | 4 | 1 | tariffs |  |
| шрифт без стиля: SF Pro Text Medium 12/auto | 4 | 1 | tariffs |  |
| сырой #ffffff@0.40 [shape] | 4 | 1 | tariffs |  |
| шрифт без стиля: SF Pro Display Medium 16/16 | 4 | 1 | tariffs |  |
| [Day / Gray 20] [stroke] — нет в маппинге | 4 | 1 | tariffs |  |
| сырой эффект: drop 0,1 r30 s0 #000000@0.12 + drop 0,6 r14 s0 #000000@0.16 | 4 | 1 | tariffs |  |
| сырой #1c1c1c [shape] | 3 | 1 | service-coverage |  |
| шрифт без стиля: SF Pro Display Regular 22/28 | 3 | 1 | tariffs |  |
| [iOS / Body] — нет в маппинге | 3 | 1 | tariffs |  |
| сырой #e9e9ed [stroke] | 3 | 1 | tariffs |  |
| [Fill / Light] [shape] — нет в маппинге | 3 | 1 | tariffs |  |
| [Day / Gray 40] [shape/shape] — нет правила | 3 | 1 | tariffs |  |
| сырой эффект: drop 0,2 r12 s0 #ab01e0@0.05 + drop 2,2 r12 s0 #ab01e0@0.12 | 3 | 1 | tariffs |  |
| сырой #3458e8 [shape] | 2 | 1 | backlog-ui | 5371:80583 |
| [Night / Gray 20] [shape] — нет в маппинге | 2 | 1 | backlog-ui | 5371:80597 |
| сырой эффект: drop 0,7 r24 s0 #000000@0.29 | 2 | 1 | backlog-ui | 5371:80599 |
| сырой #545665 [shape] | 2 | 1 | backlog-ui | 5371:80603 |
| сырой эффект: inner_shadow + layer_blur | 2 | 1 | not-work | I5374:738091;4270:112407 |
| {Theme:stroke/secondary} [stroke] — нет в маппинге | 2 | 1 | not-work | I5374:738091;4270:112410 |
| сырой #8f8fa3 [shape] | 2 | 1 | not-work | I5374:738091;4270:112419 |
| сырой #000000@0.70 [shape] | 2 | 1 | not-work | I5374:738091;4270:112423 |
| сырой #c7c7d7@0.60 [shape] | 2 | 1 | not-work | I5374:738091;4270:112427 |
| сырой #ffffff@0.80 [shape] | 2 | 1 | not-work | I5374:738091;4270:112439 |
| сырой #ffffff@0.32 [shape] | 2 | 1 | not-work | I5374:738091;4270:112441 |
| сырой #000000@0.00 [shape] | 2 | 1 | not-work | I5374:738091;4270:112442 |
| [Bg day/secondary] [frame] — нет в маппинге | 2 | 1 | permissions |  |
| [Buttons day/fab] [frame] — нет в маппинге | 2 | 1 | permissions |  |
| эффект [Shadow 2] — нет в маппинге | 2 | 1 | permissions |  |
| {Theme:stroke/primary} [stroke] — нет в маппинге | 2 | 1 | permissions |  |
| сырой #ff22e2 [frame] | 2 | 1 | permissions |  |
| сырой #000000@0.32 [frame] | 2 | 1 | permissions |  |
| сырой #500000 [frame] | 2 | 1 | permissions |  |
| сырой #9800ff [shape] | 2 | 1 | permissions |  |
| сырой #7204bc [shape] | 2 | 1 | permissions |  |
| сырой эффект: inner_shadow + drop 0,2 r1 s0 #f844ff + drop 0,1 r1 s0 #ffffff@0.90 | 2 | 1 | permissions |  |
| {System Colors:Overlays/Default} [frame] — нет в маппинге | 2 | 1 | permissions |  |
| сырой #b3b3b3@0.82 [frame] | 2 | 1 | permissions |  |
| сырой #383838 [frame] | 2 | 1 | permissions |  |
| эффект [Material Blur] — нет в маппинге | 2 | 1 | permissions |  |
| [Headline/Regular] — нет в маппинге | 2 | 1 | permissions |  |
| сырой #b8a1ff [stroke] | 2 | 1 | service-coverage |  |
| шрифт без стиля: Roboto Bold 32.25/43 | 2 | 1 | service-coverage |  |
| сырой #8526ff@0.20 [shape] | 2 | 1 | service-coverage |  |
| сырой #0e2623 [frame] | 2 | 1 | service-coverage |  |
| сырой #19221d [frame] | 2 | 1 | service-coverage |  |
| сырой #17171b [shape] | 2 | 1 | service-coverage |  |
| ошибка: in get_strokes: The node with id "I5374:922110;1095:415;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922110;1095:415;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922111;1095:809;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922111;1095:809;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922112;1095:809;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922112;1095:809;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922131;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922131;599:2880;599:2845;599:2809;3867:457 |
| ошибка: in get_strokes: The node with id "I5374:922132;1095:809;599:2880;599:2845;599:2809;3867:457" does not exist | 1 | 1 | order-flow | I5374:922132;1095:809;599:2880;599:2845;599:2809;3867:457 |
| сырой #5f5f5f [frame] | 1 | 1 | service-coverage |  |
| сырой #e7daf2 [shape] | 1 | 1 | service-coverage |  |
| сырой #b8a1ff [shape] | 1 | 1 | service-coverage |  |
| сырой #e6e6e6 [frame] | 1 | 1 | service-coverage |  |
| сырой #3458e9@0.10 [shape] | 1 | 1 | service-coverage |  |
| сырой эффект: drop 0,2 r4 s0 #1d162d@0.14 | 1 | 1 | service-coverage |  |
