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
| Backlog UI — Switched Styles | `5371:80571` | 58 | 218 | 2026-11-12 |
| Errors — Switched Styles | `5374:358551` | 195 | 1 564 | 2026-11-12 |
| ✅ GEO Problems — Switched Styles | `5374:885750` | 154 | 356 | 2026-11-12 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | `5374:721192` | 1 123 | 3 159 | 2026-11-12 |
| ✅ Navigation 🧭 — Switched Styles | `5374:207972` | 7 807 | 19 492 | 2026-11-12 |
| ✅ No car — Switched Styles | `5374:1040241` | 242 | 632 | 2026-11-12 |
| ✅ not work — Switched Styles | `5374:738087` | 18 | 251 | 2026-11-12 |
| Order Flow — Switched Styles | `5374:903468` | 21 257 | 5 837 | 2026-11-12 |
| ✅ Permissions — Switched Styles | `5374:1019808` | 162 | 471 | 2026-11-12 |
| ⌛️ Profile — Switched Styles | `5374:527493` | 4 749 | 5 941 | 2026-11-12 |
| ✅ Service coverage — Switched Styles | `5374:86156` | 398 | 792 | 2026-11-12 |
| ✅ Show my location — Switched Styles | `5374:802548` | 6 112 | 4 324 | 2026-11-12 |
| ⌛️ Tariffs — Switched Styles | `5374:563482` | 281 | 783 | 2026-11-12 |
| ✅ Taxi for friends — Switched Styles | `5374:894051` | 269 | 826 | 2026-11-12 |
| test — Switched Styles | `5374:1030847` | 617 | 1 018 | 2026-11-12 |
| ✅ Where 🗺️ - Migration — Switched Styles | `5374:623349` | 2 839 | 6 517 | 2026-11-12 |
| ✅ Where 🗺️ — Switched Styles | `5374:421690` | 2 958 | 6 827 | 2026-11-12 |
| **Итого** | | **49 239** | **59 008** | |

## Незаменённое по всем страницам

| причина | кол-во | страниц | где | ID |
|---|---:|---:|---|---|
| сырой эффект: layer_blur | 4 346 | 17 | backlog-ui, errors, geo-problems … | I5371:80825;4270:112360 I5374:358560;218:116 5374:886148 |
| сырой #c4c4c4 [shape] | 3 868 | 15 | errors, geo-problems, illustrations … | I5374:358587;2498:9996;69:109;5377:474204;1465:154025;1248:7516 I5374:886133;1228:7454 5374:721262 |
| сырой #000000 [shape] | 3 714 | 17 | backlog-ui, errors, geo-problems … | 5371:80712 I5374:358559;349:4028;244:1424 5374:886149 |
| градиент [shape] | 3 024 | 17 | backlog-ui, errors, geo-problems … | I5371:80719;257:2838 I5374:358630;4365:206498 I5374:886217;1074:135481 |
| сырой #ffffff [shape] | 2 265 | 17 | backlog-ui, errors, geo-problems … | 5371:80580 I5374:358559;349:4028;244:1423 I5374:886522;40001108:25773;5374:887148;40001611:17557;1937:2777 |
| сырой эффект: background_blur | 1 749 | 13 | errors, geo-problems, illustrations … | I5374:358834;4906:196320;2646:2330;494:15686 I5374:886133;1228:7439 I5374:722037;1228:7439 |
| [Background [day]/Secondary] [shape/shape] — нет правила | 1 395 | 10 | geo-problems, illustrations, navigation … | I5374:886158;1244:7535;589:16 I5374:721536;1242:357 I5374:214271;1242:357 |
| сырой #d9d9d9 [shape] | 1 239 | 12 | errors, geo-problems, navigation … | I5374:358922;3075:5595 I5374:886535;40001108:25773;5374:887255;427:15332;40001108:28677 I5374:209991;2165:44685;2077:16575 |
| сырой #ffffff@0.90 [shape] | 1 162 | 8 | illustrations, navigation, order-flow … | I5374:722037;1228:7440 I5374:214282;1264:96 I5374:918263;1228:7440 |
| градиент [frame] | 923 | 15 | errors, geo-problems, illustrations … | I5374:358834;4906:196320;2646:2348 I5374:886217;1093:24175 I5374:727389;2036:4147 |
| градиент [stroke] | 881 | 14 | backlog-ui, errors, geo-problems … | 5371:80576 I5374:358834;4906:196320;2646:2330;494:16458 I5374:886523;40001007:26289;5374:887202 |
| шрифт без стиля: SF Pro Text Semibold 12/13 | 789 | 3 | no-car, order-flow, show-my-location | 5374:1040970 5374:903752 5374:803458 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 765 | 15 | errors, geo-problems, illustrations … | I5374:358560;218:117 5374:886149 I5374:721530;19:89300 |
| сырой #ffffff [stroke] | 729 | 15 | backlog-ui, errors, geo-problems … | 5371:80575 I5374:358922;3075:5614;1826:32799 I5374:886133;1228:7446 |
| сырой #ff0000 [shape] | 658 | 12 | backlog-ui, errors, geo-problems … | I5371:80720;349:4084;244:1424 I5374:358559;349:4028;244:1424 5374:886691 |
| [Gradients/Fade Horizontal] [shape] — нет в маппинге | 644 | 14 | backlog-ui, errors, illustrations … | I5371:80816;257:2574 I5374:358981;2856:34111;2856:33979;431:1658;435:2547 I5374:721586;907:124133;907:124558 |
| сырой #ffffff [text] | 620 | 15 | backlog-ui, errors, geo-problems … | 5371:80600 I5374:358834;4906:196320;2646:2347 5374:885789 |
| сырой #f79e1b [shape] | 565 | 13 | illustrations, navigation, no-car … | I5374:721390;1944:9 I5374:220616;1944:9 I5374:1040980;3374:165305;1093:24503;3072:124507 |
| сырой #ff5f00 [shape] | 561 | 13 | illustrations, navigation, no-car … | I5374:721390;1944:7 I5374:220616;1944:7 I5374:1040980;3374:165305;1093:24503;3072:124505 |
| сырой #eb001b [shape] | 561 | 13 | illustrations, navigation, no-car … | I5374:721390;1944:8 I5374:220616;1944:8 I5374:1040980;3374:165305;1093:24503;3072:124506 |
| {System:Magin Top}=54 paddingTop — нет цели | 545 | 9 | backlog-ui, geo-problems, no-car … | 5371:80724 5374:886518 5374:1040911 |
| {Color:tx-brand/green/green} [shape] — нет в маппинге | 519 | 5 | backlog-ui, no-car, order-flow … | I5371:80820;40000385:8868;3866:93273;40006534:7699 I5374:1040557;40000385:8868;3866:93273;40006534:7699 I5374:903637;40000385:8868;3866:93273;40006534:7699 |
| сырой #ffffff@0.05 [shape] | 486 | 9 | geo-problems, illustrations, navigation … | 5374:886139 5374:722043 5374:215930 |
| сырой #000000@0.08 [stroke] | 486 | 9 | geo-problems, illustrations, navigation … | 5374:886139 5374:722043 5374:215930 |
| [Icons day/Secondary Pressed] → Icon/Secondary [stroke] — скоуп SHAPE_FILL | 467 | 9 | geo-problems, illustrations, navigation … | I5374:886133;1228:7452 I5374:722037;1228:7452 I5374:214282;1264:107 |
| {Color:tx-accent/grey/primary} «Shadow» — пробел | 368 | 12 | errors, illustrations, navigation … | I5374:358587;2189:196066;2189:196058 I5374:721530;19:89299 I5374:214338;5374:243164 |
| сырой #1d354f [shape] | 351 | 6 | geo-problems, illustrations, navigation … | 5374:886669 5374:722360 5374:218296 |
| сырой #ffb800 [shape] | 351 | 6 | geo-problems, illustrations, navigation … | 5374:886669 5374:722360 5374:218296 |
| шрифт без стиля: Factor A TRIAL Medium 10/11 | 350 | 1 | navigation | I5374:212724;2199:28009;2199:28002 |
| шрифт без стиля: WB Sans Medium 24/100 | 344 | 2 | order-flow, show-my-location | I5871:168783;40000385:8868;40006534:7701 I5374:802560;40000385:8868;40006534:7701 |
| сырой #232326 [shape] | 324 | 9 | illustrations, navigation, no-car … | 5374:721220 I5374:215559;625:482;619:1373 5374:1040403 |
| [Description/description] — нет в маппинге | 300 | 2 | navigation, profile | 5374:214691 5374:528152 |
| градиент [text] | 299 | 8 | errors, illustrations, navigation … | I5374:358834;4906:196320;2646:2349 I5374:727398;4906:196320;2646:2349 I5374:209991;2165:47497 |
| [Description/descriptionAccent — lion] — нет в маппинге | 269 | 5 | errors, navigation, tariffs … | I5374:358976;409:1590 I5374:209991;2165:44685;2064:74823 I5374:563664;121:166 |
| сырой #a4a4bf [text] | 244 | 1 | navigation | I5374:212724;2199:28009;2199:28002 |
| сырой #ffffff@0.10 [shape] | 243 | 9 | geo-problems, illustrations, navigation … | 5374:886141 5374:722045 5374:918271 |
| сырой #000000@0.03 [stroke] | 243 | 9 | geo-problems, illustrations, navigation … | 5374:886141 5374:722045 5374:918271 |
| сырой #979797 [shape] | 234 | 7 | backlog-ui, illustrations, no-car … | 5371:80610 5374:721249 5374:1040280 |
| сырой эффект: drop 0,6 r20 s0 #000000@0.08 + background_blur | 233 | 8 | geo-problems, navigation, order-flow … | 5374:885832 I5374:918298;1264:96 I5374:1020975;2194:200050;1264:96 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.12 + drop 0,0 r1 s0 #000000@0.15 | 231 | 10 | backlog-ui, illustrations, no-car … | 5371:80723 5374:724195 5374:1040438 |
| #000000 → Route/Primary [stroke] — не w4 (w2) | 221 | 8 | illustrations, navigation, permissions … | I5374:721347;1932:113 I5374:212724;3087:25772;2216:41798 I5374:1021157;1932:113 |
| [Paragraph/paragraphAccent] — нет в маппинге | 210 | 2 | navigation, profile | 5374:214689 5374:539488 |
| [Day / White] [text/text] — нет правила | 197 | 8 | illustrations, navigation, permissions … | 5374:721283 I5374:215288;1746:8347;1746:8329 5374:1021082 |
| [Gradients/Shimmer] [frame] — нет в маппинге | 193 | 13 | errors, geo-problems, illustrations … | I5374:358580;471:162368 I5374:886511;471:162368 I5374:721586;907:124131;835:112322;471:162368 |
| сырой #cacacc [shape] | 186 | 9 | illustrations, navigation, no-car … | 5374:721216 I5374:215559;625:482;619:1369 5374:1040399 |
| сырой #000000 [frame] | 184 | 10 | errors, illustrations, navigation … | I5374:358834;4906:196320;2646:2346 I5374:727389;2036:4148 I5374:209991;2165:44685;2077:16568 |
| сырой #d34dc6@0.30 [shape] | 180 | 1 | navigation | 5374:215600 |
| {Theme TX:tx-bg/overlay} [shape] — нет в маппинге | 177 | 4 | order-flow, show-my-location, where-migration … | I5871:168825;40001063:14769 I5374:802669;40001063:14769 I5374:630607;40001063:14769 |
| [Day / Gray 20] [shape] — нет в маппинге | 175 | 6 | illustrations, navigation, show-my-location … | I5374:722510;669:723;1945:2847 I5374:215577;1935:30 I5374:803648;669:723;1945:2847 |
| эффект [Shadow Up] — нет в маппинге | 164 | 8 | errors, permissions, profile … | 5374:358980 5374:1020561 5374:529603 |
| сырой #ffc800 [stroke] | 162 | 7 | errors, illustrations, navigation … | I5374:358836;1168:1949;1157:1873;3263:22958 I5374:727396;1168:1949;1157:1873;3263:22958 I5374:804228;2781:9146;1168:1949;1157:1873;3263:22958 |
| {theme:icon/contraste} [shape] — нет в маппинге | 159 | 6 | errors, navigation, show-my-location … | I5374:358976;409:1561 I5374:804279;400:1773;586:144 I5374:563664;121:164 |
| шрифт без стиля: WB Sans Regular 16/14 | 158 | 1 | navigation | I5374:209715;1:35489 |
| сырой эффект: inner_shadow | 156 | 8 | backlog-ui, errors, illustrations … | I5371:80825;4270:112359 I5374:358797;4270:112359 I5374:727362;4270:112359 |
| сырой #ffffff@0.25 [shape] | 156 | 6 | geo-problems, illustrations, navigation … | 5374:886686 5374:722377 5374:218313 |
| сырой #ff10d7 [shape] | 152 | 2 | order-flow, profile | 5871:184640 5374:533920 |
| [Day / Gray 4] [frame] — нет в маппинге | 147 | 10 | illustrations, navigation, permissions … | 5374:724291 5374:216624 5374:1020158 |
| шрифт без стиля: Google Sans Regular 17/20 | 138 | 6 | illustrations, navigation, taxi … | 5374:721549 I5374:228143;233:106845 5374:897947 |
| сырой #ffffff@0.10 [stroke] | 131 | 16 | backlog-ui, errors, geo-problems … | 5371:80572 5374:358552 5374:885751 |
| [Text [day]/Primary] [stroke] — нет правила | 130 | 3 | illustrations, where-migration, where | I5374:721194;1895:188848;69:114;5374:727417;1122:865 5374:633232 5374:431573 |
| [Body/body] — нет в маппинге | 127 | 9 | errors, illustrations, navigation … | I5374:358834;4906:196324;286:7048 I5374:727398;4906:196324;286:7048 5374:1020791 |
| [Titles/Large Title] — нет в маппинге | 124 | 7 | navigation, order-flow, permissions … | 5871:184606 5374:1020415 5374:528107 |
| шрифт без стиля: SF Pro Text Semibold 17/20 SMALL_CAPS_FORCED | 119 | 7 | illustrations, navigation, order-flow … | I5374:721586;907:124126 I5374:229165;5374:243102 I5374:919279;2038:6715 |
| сырой #ffffff@0.30 [shape] | 117 | 6 | geo-problems, illustrations, navigation … | 5374:886699 5374:722390 5374:218326 |
| TEXT смешанные заливки — оставлено | 117 | 8 | geo-problems, navigation, order-flow … | I5374:886481;1093:24504;1093:24530 I5374:912511;40007217:34955;40007495:39497;40007495:32737;40001298:18988 5374:541847 |
| шрифт без стиля: Factor A TRIAL Bold 15/17 | 116 | 1 | navigation | I5374:212724;3087:25773 |
| шрифт без стиля: WB Sans Medium 20/20 | 116 | 2 | order-flow, profile | 5871:184732 5374:530858 |
| [Gradients [day]/Primary] [frame] — нет в маппинге | 114 | 10 | geo-problems, illustrations, navigation … | 5374:885809 I5374:722033;16654:175213 5374:1019862 |
| шрифт без стиля: Factor A TRIAL Black 15/17 | 114 | 1 | navigation | I5374:212724;2199:28009;2199:28000 |
| шрифт без стиля: Factor A TRIAL Black 10/11 + Factor A TRIAL Medium 10/11 | 110 | 1 | navigation | I5374:212724;2190:27549 |
| эффект [/Input shadow] — нет в маппинге | 110 | 4 | navigation, test, where-migration … | I5374:216382;11:1235 I5374:1031148;11:1235 I5374:623800;11:1235 |
| шрифт без стиля: SF Pro Semibold 18/28 | 109 | 1 | navigation | I5374:215400;10464:35321 |
| сырой #f18a00 [text] | 108 | 1 | navigation | I5374:212724;2190:27724 |
| сырой #99ffbb [shape] | 108 | 3 | order-flow, profile, show-my-location | I5871:184744;3131:34069;1312:94;2938:20004 I5374:534169;5374:541266;1312:94;2938:20004 I5374:803388;40007540:53530;40007187:66955;40007187:43967;427:17632 |
| сырой #014d2d [stroke] | 108 | 3 | order-flow, profile, show-my-location | I5871:184744;3131:34069;1312:94;2938:20010 I5374:534169;5374:541266;1312:94;2938:20010 I5374:803388;40007540:53530;40007187:66955;40007187:43967;427:17638 |
| сырой #1cc052 [shape] | 108 | 3 | order-flow, profile, show-my-location | I5871:184744;3131:34069;1312:94;2938:20011 I5374:534169;5374:541266;1312:94;2938:20011 I5374:803388;40007540:53530;40007187:66955;40007187:43967;427:17639 |
| #000000 → Route/Primary [stroke] — не w4 (w1) | 106 | 5 | navigation, service-coverage, show-my-location … | I5374:212727;2199:28009;2199:27996 5374:86741 I5374:804275;3406:38819;1255:2416;1485:2290;4632:230 |
| [Stroke [day]/Primary] [stroke] — нет в маппинге | 104 | 6 | illustrations, navigation, profile … | I5374:722033;16043:156948;2154:8647;778:2 I5374:216382;11:1235 5374:529229 |
| {Color:tx-bg/level −1 muted} [stroke] — нет правила | 99 | 2 | order-flow, show-my-location | 5374:904676 5374:808299 |
| [Day / Gray 4] [shape] — нет в маппинге | 97 | 6 | illustrations, navigation, show-my-location … | I5374:721274;5254:1061;5254:269 I5374:215652;1903:4848 5374:803628 |
| сырой #ff813b [shape] | 96 | 2 | order-flow, profile | 5871:184652 5374:533232 |
| шрифт без стиля: SF Pro Regular 17/22 | 96 | 1 | show-my-location | I5374:803697;40001403:28636;40001069:17932;126:59452 |
| [Icon [day]/Primary Opposite] [shape] — нет в маппинге | 94 | 3 | illustrations, navigation, tariffs | I5374:721311;1037:49;832:19 I5374:215294;4733:26136;1396:16 I5374:564439;1037:49;832:19 |
| текст со смешанными стилями — оставлено | 93 | 8 | illustrations, navigation, order-flow … | 5374:724197 I5374:912511;40007217:34955;40007495:39497;40007495:32737;40001298:18988 5374:533702 |
| сырой эффект: drop 0,-10 r80 s0 #ffffff | 92 | 2 | navigation, show-my-location | 5374:231971 I5374:804228;2781:9134;1070:18232;237:849 |
| сырой #ff0000@0.21 [shape] | 90 | 1 | navigation | 5374:215654 |
| шрифт без стиля: SF Pro Bold 21.760000228881836/100 | 89 | 1 | navigation | 5374:214697 |
| сырой #000518@0.08 [shape] | 87 | 8 | illustrations, navigation, permissions … | 5374:721323 5374:1021073 5374:563564 |
| сырой #000000 [text] | 87 | 2 | order-flow, profile | 5374:918749 5374:530207 |
| сырой #00579f [shape] | 86 | 8 | backlog-ui, navigation, no-car … | 5371:80665 5374:1040339 5374:918953 |
| [Action/action— capybara] — нет в маппинге | 86 | 5 | errors, show-my-location, tariffs … | I5374:358981;3439:86016;431:1658;435:2535 I5374:804396;3605:99828 I5374:563669;628:200862;431:1658;435:2535 |
| сырой эффект: drop 0,4 r20 s0 #000000@0.06 | 86 | 6 | geo-problems, illustrations, navigation … | 5374:886610 5374:722681 5374:220548 |
| [Icon [day]/Special] [shape] — нет в маппинге | 86 | 1 | navigation | I5374:215295;735:18 |
| [Icon [day]/Primary Opposite] [stroke] — нет в маппинге | 86 | 1 | navigation | I5374:215295;735:18 |
| сырой #a73afd [shape] | 85 | 5 | navigation, permissions, profile … | I5374:212724;2199:28009;2323:36251 5374:1020519 I5374:534024;5374:541279;111717:160053;433:12936;433:12363;4416:8571 |
| [1 light yellow] [shape] — нет в маппинге | 85 | 2 | order-flow, profile | 5871:184703 5374:530206 |
| шрифт без стиля: SF Pro Text Medium 14/16 | 84 | 2 | navigation, test | I5374:225333;471:162338 I5374:1030917;471:162338 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 83 | 9 | backlog-ui, illustrations, navigation … | 5371:80606 5374:721242 5374:1040276 |
| [Blue] [shape] — нет в маппинге | 83 | 9 | illustrations, navigation, permissions … | I5374:721351;1609:1657 I5374:1021084;1609:1657 5374:86777 |
| [Button [day]/Primary] [shape/shape] — нет правила | 83 | 3 | navigation, test, where-migration | I5374:215294;1764:8290 I5374:1031150;1037:164 I5374:623803;1037:164 |
| {Theme TX:tx-bg/map} [frame] — нет в маппинге | 82 | 8 | errors, navigation, permissions … | 5374:358974 5374:1020492 5374:529586 |
| сырой #ffc800 [shape] | 81 | 7 | errors, illustrations, navigation … | I5374:358836;1168:1949;1157:1873;3263:22958 I5374:727396;1168:1949;1157:1873;3263:22958 I5374:804228;2781:9146;1168:1949;1157:1873;3263:22958 |
| сырой #fffbdd [shape] | 81 | 7 | errors, illustrations, navigation … | I5374:358836;1168:1949;1157:1876 I5374:727396;1168:1949;1157:1876 I5374:804228;2781:9146;1168:1949;1157:1876 |
| сырой #ac7ca2@0.32 [shape] | 81 | 1 | navigation | 5374:231967 |
| шрифт без стиля: SF Pro Text Semibold 17/24 | 79 | 3 | illustrations, navigation, tariffs | I5374:721509;647:1978;5374:727427;647:101965 I5374:564637;5374:564702;5374:564954;647:102187 |
| сырой #000000@0.25 [frame] | 79 | 1 | navigation | I5374:215399;10411:17582 |
| сырой #ffffff@0.25 [frame] | 79 | 1 | navigation | I5374:215399;10411:17582 |
| сырой #444444@0.60 [frame] | 79 | 1 | navigation | I5374:215399;10411:17582 |
| сырой #f8f8f8@0.20 [frame] | 79 | 1 | navigation | I5374:215399;10411:17582 |
| сырой эффект: drop 0,8 r15 s0 #000000@0.02 + drop 0,0 r0 s0.5 #e8e8e8 + drop -1.25,0 r0 s-0.75 #d0d0d0 + drop 1.25,0 r0 s-0.75 #d0d0d0 | 79 | 1 | navigation | I5374:215399;10411:17582 |
| сырой эффект: glass + inner_shadow + inner_shadow + inner_shadow | 79 | 1 | navigation | I5374:215399;10411:17583 |
| [Day / Gray 80] [text/text] — нет правила | 79 | 2 | navigation, where | I5374:220784;8304:9663 I5374:448032;8304:9715 |
| сырой #d62347 [shape] | 78 | 6 | geo-problems, illustrations, navigation … | 5374:886712 5374:722403 5374:218339 |
| [Button day/Secondary] [shape] — нет в маппинге | 78 | 5 | illustrations, navigation, test … | I5374:722033;16654:175199;912:2;899:200 I5374:216380;912:2;899:200 I5374:1031134;912:2;899:200 |
| шрифт без стиля: ALS Hauss VF Regular 15/20 | 75 | 7 | errors, illustrations, profile … | I5374:358956;286:7048 I5374:727393;286:7048 5374:529568 |
| сырой #000000@0.20 [shape] | 75 | 5 | navigation, order-flow, profile … | I5871:184744;3131:34069;1312:94;2938:20005 I5374:534169;5374:541266;1312:94;2938:20005 I5374:803388;40007540:53530;40007187:66955;40007187:43967;427:17633 |
| [Body/bodyAccent — buffalo] — нет в маппинге | 73 | 6 | errors, illustrations, navigation … | I5374:358835;97:15288;627:1119;29:11509 I5374:727371;3168:13324;3159:2544 I5374:209991;2165:44685;2077:19358 |
| шрифт без стиля: WB Sans Bold 12/120.00000476837158 | 73 | 2 | order-flow, profile | 5871:184714 5374:528574 |
| сырой #d8d8d8 [shape] | 72 | 10 | backlog-ui, illustrations, navigation … | 5371:80611 5374:721250 5374:1040281 |
| сырой #a73afd [stroke] | 72 | 2 | navigation, profile | I5374:209995;2138:23226 5374:528036 |
| [Bg day/secondary] [frame] — нет в маппинге | 71 | 6 | navigation, permissions, taxi … | 5374:216613 5374:1020145 5374:896678 |
| [Buttons day/fab] [frame] — нет в маппинге | 71 | 6 | navigation, permissions, taxi … | 5374:216616 5374:1020148 5374:896681 |
| эффект [Shadow 2] — нет в маппинге | 71 | 6 | navigation, permissions, taxi … | 5374:216616 5374:1020148 5374:896681 |
| сырой #b066ff [shape] | 71 | 2 | order-flow, profile | 5871:184699 5374:530842 |
| сырой эффект: inner_shadow + inner_shadow | 69 | 5 | errors, illustrations, navigation … | I5374:358834;4906:196320;2646:2330;496:22880 I5374:727398;4906:196320;2646:2330;496:22880 I5374:212728;3238:57048;3194:59286 |
| {System Colors:Separators/Non-opaque} [stroke] — нет в маппинге | 69 | 3 | permissions, show-my-location, taxi | I5374:1021285;2189:195907 I5374:803123;2189:195907 5374:898269 |
| сырой #979797 [stroke] | 68 | 9 | backlog-ui, illustrations, navigation … | 5371:80611 5374:721250 5374:1040281 |
| [Green] [shape] — нет в маппинге | 68 | 8 | backlog-ui, illustrations, navigation … | I5371:80762;1945:3103 I5374:723706;600:76;1963:47 I5374:1040311;1945:3103 |
| [Title/title1Regular] — нет в маппинге | 68 | 2 | navigation, profile | I5374:214462;54:67292;54:67246 5374:538228 |
| сырой #000000 [stroke] | 67 | 9 | errors, illustrations, navigation … | I5374:358834;4906:196320;2646:2337 I5374:727398;4906:196320;2646:2337 5374:1019809 |
| шрифт без стиля: SF Pro Text Regular 17/24 | 67 | 5 | illustrations, tariffs, taxi … | I5374:721509;647:1978;5374:727427;737:102792 I5374:564637;5374:564702;5374:564954;737:102821 5374:895811 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 66 | 7 | backlog-ui, no-car, order-flow … | 5371:80577 5374:1040247 5374:918892 |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 66 | 9 | backlog-ui, illustrations, navigation … | 5371:80591 5374:721317 5374:1040261 |
| {Color:tx-accent/purple/fg-inverted} [frame] — нет в маппинге | 64 | 2 | profile, show-my-location | 5374:528057 5374:803414 |
| шрифт без стиля: WB Sans Bold 30/100 | 63 | 1 | profile | 5374:530283 |
| шрифт без стиля: SF Pro Regular 14/16 | 63 | 4 | service-coverage, taxi, where-migration … | 5374:86288 5374:898018 5374:625332 |
| [Day / Gray 20] [stroke] — нет в маппинге | 62 | 8 | backlog-ui, illustrations, navigation … | I5371:80635;625:810 I5374:721253;6936:6213;625:810 I5374:215685;625:810 |
| [Action/actionAccent] — нет в маппинге | 62 | 7 | errors, navigation, profile … | I5374:358886;2605:6175 5374:529800 I5374:804384;431:1658;435:2544 |
| [Description/description — puma] — нет в маппинге | 62 | 1 | navigation | I5374:209991;2165:44685;2077:28520;2:17345 |
| сырой эффект: drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff | 60 | 1 | service-coverage | 5374:86863 |
| [Caption2/Regular] — нет в маппинге | 60 | 1 | show-my-location | I5374:803697;40001403:28636;40001097:25307 |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow | 59 | 4 | errors, illustrations, navigation … | I5374:358922;3075:5573 I5374:727389;2036:4150 I5374:804278;2229:48781;2229:19970;2223:2090 |
| [Display/display — whale] — нет в маппинге | 58 | 4 | errors, tariffs, where-migration … | I5374:358981;2785:78499;525:3285;129:393 I5374:563669;628:200853;525:3285;129:393 I5374:626722;2785:78499;525:3285;129:393 |
| сырой #000000@0.10 [shape] | 58 | 6 | geo-problems, illustrations, navigation … | 5374:886714 5374:722405 I5374:209991;2165:44685;2077:16229 |
| {Colors:Labels - Vibrant - Controls/Primary} [text] — нет в маппинге | 58 | 1 | navigation | I5374:215401;5535:23120 |
| сырой #18181b [shape] | 56 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2322 I5374:727398;4906:196320;2646:2322 |
| сырой #a73afd [text] | 56 | 1 | navigation | I5374:212724;2199:28009;2199:28000 |
| [Icon [day]/Primary] [text/text] — нет правила | 55 | 4 | navigation, test, where-migration … | I5374:1031149;11:1823;11:1914 I5374:623802;11:1823;11:1914 I5374:422143;11:1823;11:1914 |
| сырой #fff7e2 [frame] | 55 | 4 | permissions, taxi, where-migration … | 5374:1020421 5374:896938 5374:625385 |
| {theme:separator/default} [shape] — нет в маппинге | 54 | 5 | errors, navigation, show-my-location … | I5374:358981;2785:78497;100:119 I5374:804396;3605:99840;100:119 I5374:626722;2785:78497;100:119 |
| [Day / Black] [stroke] — нет правила | 54 | 5 | illustrations, navigation, show-my-location … | I5374:723550;669:723;7570:38 I5374:803654;669:723;7570:38 I5374:625558;11:1823;11:1503;1934:2678 |
| сырой эффект: drop 0,0 r20 s0 #9925ff@0.32 + drop 0,0 r4 s0 #9925ff@0.50 | 54 | 4 | illustrations, navigation, order-flow … | I5374:721586;907:124129;835:115375 5871:175951 I5374:1031809;835:115375 |
| [Caption/captionUppercace — chameleon] — нет в маппинге | 54 | 1 | navigation | I5374:209991;2165:44685;2077:28889;97:89691;97:103347;97:99899;30006:1215 |
| сырой эффект: glass + inner_shadow + inner_shadow + inner_shadow + drop 0,8 r15 s0 #000000@0.02 + drop 0,0 r0 s0.5 #e8e8e8 + inner_shadow + inner_shadow + inner_shadow | 54 | 1 | navigation | 5374:214395 |
| сырой #002f0f [shape] | 54 | 3 | order-flow, profile, show-my-location | I5871:184744;3131:34069;1312:94;2938:20006 I5374:534169;5374:541266;1312:94;2938:20006 I5374:803388;40007540:53530;40007187:66955;40007187:43967;427:17634 |
| сырой #c3ffa6 [shape] | 54 | 3 | order-flow, profile, show-my-location | I5871:184744;3131:34069;1312:94;2938:20014 I5374:534169;5374:541266;1312:94;2938:20014 I5374:803388;40007540:53530;40007187:66955;40007187:43967;427:17642 |
| сырой #ebecf0 [shape] | 53 | 10 | backlog-ui, illustrations, navigation … | 5371:80633 5374:721240 5374:1040303 |
| шрифт без стиля: SF Pro Text Medium 16/16 | 52 | 9 | backlog-ui, illustrations, navigation … | 5371:80663 5374:721212 5374:1040337 |
| {Theme TX:tx-button/blurring/solid/bg/default} [frame] — нет в маппинге | 52 | 4 | errors, show-my-location, where-migration … | I5374:358997;401:2067;91:1950 I5374:804380;123:179;185:777 I5374:626738;401:2067;91:1950 |
| сырой #ffffff@0.50 [shape] | 51 | 1 | navigation | I5374:215400;10464:35323 |
| шрифт без стиля: WB Sans Bold 22/auto | 51 | 1 | profile | 5374:528934 |
| шрифт без стиля: SF Pro Medium 16/16 | 50 | 3 | taxi, where-migration, where | 5374:898057 5374:625670 5374:424011 |
| [Day / Gray 4] [stroke] — нет в маппинге | 49 | 4 | illustrations, navigation, show-my-location … | 5374:721260 5374:803647 5374:564388 |
| сырой #ff0000 [text] | 49 | 1 | navigation | I5374:215400;10464:35321 |
| эффект [Shadow Tabbar] — нет в маппинге | 48 | 1 | navigation | I5374:209991;2165:119370 |
| сырой #000000@0.06 [frame] | 48 | 1 | navigation | I5374:212728;2190:27381 |
| [Text [day]/Primary Opposite] [text] — нет в маппинге | 48 | 1 | navigation | I5374:222608;4736:26233;4736:26227 |
| сырой #f5f5f5 [shape] | 48 | 2 | navigation, test | I5374:1032052;1037:164 |
| шрифт без стиля: WB Sans Bold 14.58742904663086/auto | 48 | 2 | order-flow, profile | 5871:184704 5374:533295 |
| шрифт без стиля: Roboto Regular 15/20 | 48 | 2 | where-migration, where | I5374:625479;599:2051 I5374:423820;599:2051 |
| шрифт без стиля: WB Sans Medium 20/auto | 47 | 2 | order-flow, profile | 5871:184720 5374:533434 |
| сырой #444444 [frame] | 46 | 13 | backlog-ui, errors, geo-problems … | 5371:80572 5374:358552 5374:885751 |
| [iOS / Body] — нет в маппинге | 46 | 7 | backlog-ui, illustrations, navigation … | 5371:80765 5374:721254 5374:1040314 |
| [Stroke [day]/Accent] [stroke] — нет в маппинге | 46 | 2 | navigation, where-migration | 5374:220576 I5374:626032;11:1852 |
| #000000 → Route/Primary [stroke] — не w4 (w3) | 46 | 4 | permissions, taxi, where-migration … | 5374:1020391 5374:895934 5374:625417 |
| сырой #ff7200 [shape] | 45 | 8 | backlog-ui, illustrations, no-car … | 5371:80619 I5374:721303;684:146;5506:14696 5374:1040289 |
| [Bodies/Body Large] — нет в маппинге | 45 | 2 | no-car, order-flow | 5374:1040923 5871:172059 |
| сырой #f2bfbf [frame] | 45 | 5 | permissions, service-coverage, taxi … | 5374:1019810 5374:86744 5374:897386 |
| [Caption/caption — cat] — нет в маппинге | 44 | 1 | navigation | I5374:209991;2165:40277;2064:69045 |
| сырой эффект: drop 0,5 r5 s0 #4e0000@0.20 | 44 | 1 | navigation | I5374:212920;3194:58603 |
| [Gray] [frame] — нет в маппинге | 44 | 1 | navigation | 5374:212974 |
| {Theme:text icon/whiteSecondaryConst} [text] — нет в маппинге | 43 | 5 | errors, navigation, profile … | I5374:358982;1352:5983;1369:2187 5374:528152 I5374:626723;1352:5983;1369:2187 |
| [Background [night]/Primary] [frame] — нет в маппинге | 43 | 5 | illustrations, navigation, test … | I5374:722757;1037:165 5374:1031743 5374:628967 |
| [Pastel [day]/Apu] [shape] — нет в маппинге | 43 | 1 | navigation | I5374:222608;4736:26233;4736:26226 |
| сырой эффект: drop 0,0 r8.699999809265137 s0 #000000@0.20 | 43 | 2 | order-flow, profile | 5871:184728 5374:534008 |
| #000000 → Route/Primary [stroke] — не w4 (w4.5) | 42 | 2 | illustrations, tariffs | I5374:721509;647:1978;5374:727427;647:102128;647:102121 I5374:564637;5374:564702;5374:564954;647:102191;647:102121 |
| шрифт без стиля: WB Sans Medium 22/100 | 42 | 2 | order-flow, profile | 5871:184710 5374:533425 |
| [Description/descriptionAccent] — нет в маппинге | 41 | 5 | errors, navigation, profile … | I5374:358941;5930:6224 5374:528158 5374:626912 |
| сырой #ffffff@0.31 [frame] | 41 | 7 | errors, show-my-location, tariffs … | I5374:358979;175:2156 I5374:804310;2328:2805;175:2156 I5374:563667;175:2156 |
| эффект [Background Blur/Ultra Thin] — нет в маппинге | 41 | 7 | errors, show-my-location, tariffs … | I5374:358979;175:2156 I5374:804310;2328:2805;175:2156 I5374:563667;175:2156 |
| эффект [Shadow Surface] — нет в маппинге | 41 | 6 | errors, navigation, show-my-location … | I5374:358981;2785:78499;525:3284 5374:804686 I5374:563669;628:200853;525:3284 |
| сырой #000000@0.05 [shape] | 41 | 6 | geo-problems, illustrations, navigation … | 5374:886675 5374:722366 5374:803514 |
| [Stroke [day]/Disabled] [stroke] — нет в маппинге | 41 | 4 | illustrations, navigation, profile … | I5374:722885;1843:8261 I5374:541810;2868:6260;2:28998;1843:8261 I5374:625559;11:1852 |
| сырой #ffffff@0.60 [frame] | 40 | 1 | navigation | I5374:209991;2165:40277;2064:61725;13534:57642;16325:93099;13562:67051 |
| сырой эффект: drop 0,4 r16 s0 #000518@0.10 | 40 | 1 | navigation | 5374:215572 |
| сырой #24444f [shape] | 39 | 6 | geo-problems, illustrations, navigation … | 5374:886710 5374:722401 5374:803549 |
| сырой #ff0e3e [shape] | 39 | 6 | geo-problems, illustrations, navigation … | 5374:886711 5374:722402 5374:803550 |
| сырой #000000@0.44 [shape] | 39 | 6 | geo-problems, illustrations, navigation … | 5374:886715 5374:722406 5374:803554 |
| [Fill / Light Grey] [shape] — нет в маппинге | 38 | 7 | backlog-ui, no-car, order-flow … | 5371:80674 5374:1040348 5374:918962 |
| [Day / Black] [frame/frame] — нет правила | 38 | 2 | illustrations, show-my-location | I5374:723553;2076:194720 I5374:803660;52:3317 |
| {Color:tx-bg/level −1 muted} [shape/shape] — нет правила | 38 | 4 | illustrations, navigation, taxi … | I5374:721586;907:124127;578:320 I5374:898257;907:124127;578:320 I5374:1031654;907:124127;578:320 |
| шрифт без стиля: ALS Hauss VF Medium 17/20 | 38 | 1 | navigation | I5374:209991;2165:44685;2077:17516;4071:42527;4044:44884 |
| сырой #0f754e [shape] | 37 | 4 | geo-problems, navigation, taxi … | I5374:886643;3872:24490;1562:500 I5374:897829;3872:24490;1562:500 I5374:1030890;3872:24490;1562:500 |
| [ Night / White] [shape] — не иконка | 37 | 2 | illustrations, tariffs | 5374:721469 5374:563851 5374:564597 |
| сырой #000000@0.12 [shape] | 37 | 6 | illustrations, navigation, taxi … | 5374:721581 5374:897656 5374:1031649 |
| сырой #9dff00 [frame] | 37 | 1 | navigation | 5374:214419 |
| [Background [day]/Attention] [shape/shape] — нет правила | 37 | 3 | navigation, taxi, test | 5374:897805 5374:1030866 |
| [Background [day]/Constant Dark Secondary] [shape/shape] — нет правила | 37 | 3 | navigation, taxi, test | 5374:897836 5374:1030897 |
| сырой #0f013e@0.16 [shape] | 37 | 3 | no-car, order-flow, show-my-location | 5374:1040914 5374:905225 5374:806229 |
| шрифт без стиля: Roboto Regular 65.25/85 | 36 | 1 | geo-problems | 5374:885753 |
| шрифт без стиля: SF Pro Display Regular 12/28 | 36 | 3 | illustrations, where-migration, where | 5374:722168 5374:649772 5374:448113 |
| шрифт без стиля: SF Pro Display Regular 17/28 | 36 | 3 | illustrations, where-migration, where | 5374:722172 5374:649776 5374:448117 |
| шрифт без стиля: SF Pro Display Regular 21/28 | 36 | 3 | illustrations, where-migration, where | 5374:722176 5374:649780 5374:448121 |
| [Background [night]/Primary] [shape] — нет в маппинге | 36 | 3 | illustrations, where-migration, where | I5374:722757;1037:164 I5374:628971;1037:164 I5374:427312;1037:164 |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow + inner_shadow + inner_shadow + inner_shadow | 36 | 1 | navigation |  |
| сырой #848e99 [shape] | 36 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Black 40/15 | 36 | 1 | navigation |  |
| шрифт без стиля: Google Sans Medium 15/20 | 36 | 1 | navigation |  |
| сырой эффект: inner_shadow + background_blur | 34 | 1 | navigation |  |
| [Day / Gray 14] [stroke] — нет в маппинге | 34 | 3 | navigation, test, where-migration | I5374:1031148;11:1235 I5374:623800;11:1235 |
| сырой #3458e9 [stroke] | 33 | 4 | illustrations, navigation, tariffs … | 5374:721332 5374:563579 5374:563691 |
| {Color:tx-bg/map} [frame] — нет в маппинге | 33 | 4 | illustrations, navigation, show-my-location … | I5374:721586;907:124135;859:104817 5374:804704 I5374:1032688;907:124135;859:104817 |
| сырой #505050 [frame] | 33 | 2 | order-flow, show-my-location | 5374:904552 5374:806316 |
| сырой эффект: drop 0,-4 r8 s0 #000000@0.10 | 32 | 8 | illustrations, navigation, permissions … | 5374:721334 5374:1021069 5374:563485 |
| шрифт без стиля: SF Pro Bold 15/18 | 32 | 3 | tariffs, where-migration, where | I5374:563686;2083:2797;2097:3645 I5374:626745;2083:2797;2097:3645 I5374:425086;2083:2797;2097:3645 |
| шрифт без стиля: SF Pro Semibold 15/18 | 32 | 3 | tariffs, where-migration, where | I5374:563686;2083:2797;2097:3647 I5374:626745;2083:2797;2097:3647 I5374:425086;2083:2797;2097:3647 |
| сырой #000000@0.40 [shape] | 31 | 5 | backlog-ui, errors, illustrations … | I5371:80825;4270:112414 I5374:358797;4270:112414 5374:721395 |
| шрифт без стиля: SF Pro Semibold 10/12 | 31 | 1 | navigation |  |
| сырой #989898 [shape] | 30 | 6 | backlog-ui, no-car, tariffs … | 5371:80706 5374:1040380 5374:563991 |
| [BG/bgAirToCoal (day)] [frame] — нет в маппинге | 30 | 6 | errors, navigation, profile … | I5374:358981;3439:86014 5374:529555 I5374:563669;628:200860 |
| шрифт без стиля: ALS Hauss VF Regular 13/17 UPPER | 30 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 13/15 + ALS Hauss VF Regular 13/15 | 30 | 1 | navigation |  |
| эффект [Shadow / bottomSheet] — нет в маппинге | 30 | 1 | navigation |  |
| сырой эффект: drop 0,2 r4 s0 #000000@0.15 | 30 | 1 | navigation |  |
| сырой эффект: drop 0,2 r4 s0 #1d162d@0.14 | 30 | 6 | navigation, permissions, service-coverage … | 5374:1020488 5374:86778 5374:564019 |
| сырой #100f25 [shape] | 30 | 4 | navigation, order-flow, show-my-location … | I5374:917699;40007507:36140 I5374:803294;40007495:44585;40007507:36185;40007507:36140 I5374:564325;40007507:36140 |
| эффект [.blur tiny] — нет в маппинге | 29 | 8 | backlog-ui, errors, illustrations … | I5371:80720;349:4084;244:1423 I5374:358559;349:4028;244:1423 I5374:727399;97:15295;7892:7436;7470:13530 |
| {Theme:bg/level 2} [shape/shape] — нет правила | 29 | 8 | backlog-ui, errors, illustrations … | I5371:80825;4270:112355 I5374:358797;4270:112355 I5374:727362;4270:112355 |
| шрифт без стиля: ALS Hauss VF Medium 11/14 | 29 | 4 | errors, navigation, where-migration … | I5374:358982;1352:5983;1369:2187 I5374:626723;1352:5983;1369:2187 I5374:425064;1352:5983;1369:2187 |
| сырой #242429 [stroke] | 29 | 2 | navigation, test | 5374:1031865 |
| сырой #f5f5f5 [frame] | 29 | 2 | navigation, test | I5374:1032052;1037:165 |
| {System Colors:Colors/Blue} [text] — нет в маппинге | 29 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194713 I5374:803123;2189:195906 I5374:897665;5374:898324 |
| сырой #d85d00 [shape] | 28 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2330;494:16064 I5374:727398;4906:196320;2646:2330;494:16064 |
| сырой эффект: drop 0,7 r9 s0 #ffffff | 28 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2330;494:17578 I5374:727398;4906:196320;2646:2330;494:17578 |
| сырой #eaeaea [shape] | 28 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2330;496:20944 I5374:727398;4906:196320;2646:2330;496:20944 |
| шрифт без стиля: ALS Hauss VF Medium 15/18 | 28 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w1.9130436182022095) | 28 | 1 | navigation |  |
| сырой #3458e9@0.10 [shape] | 28 | 6 | navigation, permissions, service-coverage … | 5374:1020486 5374:86776 5374:564017 |
| шрифт без стиля: WB Sans Bold 11/auto | 28 | 1 | profile | 5374:530804 |
| шрифт без стиля: WB Sans Bold 20/auto | 28 | 1 | profile | 5374:530851 |
| сырой эффект: drop 0,8 r20 s0 #2d2d53@0.12 | 27 | 6 | errors, permissions, profile … | 5374:358997 5374:1020578 5374:529619 |
| [Bodies / Body 1] — нет в маппинге | 27 | 3 | illustrations, where-migration, where | 5374:724161 I5374:625383;1169:1 I5374:423724;1169:1 |
| [Text [day]/Accent] [shape/shape] — нет правила | 27 | 4 | navigation, profile, taxi … | 5374:538382 5374:896691 5374:447808 |
| [Night / Gray 20] [shape] — нет в маппинге | 26 | 7 | backlog-ui, illustrations, no-car … | 5371:80597 I5374:723531;600:72 5374:1040267 |
| [Text [night]/Primary] [text] — нет в маппинге | 26 | 3 | illustrations, where-migration, where | I5374:722760;1037:141;904:2 I5374:628974;3051:20211 I5374:427315;3051:20211 |
| [Button [day]/Disabled] [frame] — нет в маппинге | 26 | 4 | illustrations, navigation, where-migration … | I5374:722033;16654:175213;1351:51 I5374:649817;1351:51 5374:447425 |
| [Stroke [day]/Opposite] [stroke] — нет в маппинге | 26 | 4 | illustrations, navigation, where-migration … | 5374:722633 I5374:625439;11:1852 I5374:423780;11:1852 |
| сырой #f0f0fa [frame] | 26 | 1 | navigation |  |
| сырой #a4a4bf [stroke] | 26 | 1 | navigation |  |
| [Day / Gray 20] [text] — нет в маппинге | 26 | 1 | navigation |  |
| сырой #ffffff@0.10 [frame] | 26 | 2 | navigation, profile | 5374:528155 |
| сырой эффект: drop 3,4 r10 s0 #361616@0.08 + glass | 26 | 2 | order-flow, show-my-location | I5374:905614;15:3905 I5374:807753;15:3905 |
| [Button [day]/Constant White] [frame] — нет в маппинге | 26 | 1 | profile | 5374:528161 |
| шрифт без стиля: ALS Hauss VF Medium 17/22 | 26 | 3 | show-my-location, where-migration, where | I5374:804259;2314:4624 I5374:629808;127:166;2356:2143 I5374:428149;127:166;2356:2143 |
| [Text [day]/Disabled] [text] — нет в маппинге | 25 | 4 | illustrations, navigation, where-migration … | I5374:722033;16654:175213;1351:51;1037:196 I5374:649817;1351:51;1037:196 I5374:447425;1037:196 |
| {Colors:Accents/Blue} [shape] — нет в маппинге | 25 | 1 | navigation |  |
| шрифт без стиля: Google Sans Regular 15/18 | 25 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Medium 15/22 | 25 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 15.357471466064453/21.681137084960938 | 25 | 1 | profile | I5374:541804;1284:42181 |
| шрифт без стиля: ALS Hauss VF Medium 19/23 | 24 | 3 | errors, where-migration, where | I5374:358982;1345:2064 I5374:626723;1345:2064 I5374:425064;1345:2064 |
| [Night / Gray 40] [shape] — нет в маппинге | 24 | 1 | illustrations | 5374:722574 |
| шрифт без стиля: SF Pro Display Regular 6.5/28 | 24 | 3 | illustrations, where-migration, where | 5374:722165 5374:649769 5374:448110 |
| сырой #212121 [shape] | 24 | 3 | illustrations, navigation, show-my-location | 5374:723529 5374:803633 |
| [BG/bgAirToCoal (day)] [shape] — нет в маппинге | 24 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Medium 15/17 | 24 | 1 | navigation |  |
| сырой #1b1c1d [shape] | 24 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 15/auto | 24 | 2 | navigation, test | 5374:1031877 |
| сырой #f6f6f9 [frame] | 24 | 2 | navigation, show-my-location | 5374:803319 |
| {System Colors:Labels/Primary} [text] — нет в маппинге | 24 | 4 | permissions, show-my-location, taxi … | I5374:1021196;2189:194705 I5374:803123;2189:195900 I5374:897665;5374:898318 |
| сырой #8c7aff@0.30 [shape] | 24 | 1 | service-coverage | 5374:87405 |
| шрифт без стиля: SF Pro Text Medium 12/auto | 24 | 3 | tariffs, where-migration, where | 5374:564023 5374:564035 5374:634058 |
| сырой #ff7200 [text] | 23 | 7 | illustrations, navigation, no-car … | 5374:721212 5374:1040395 5374:803593 |
| #000000 → Route/Primary [stroke] — не w4 (w5) | 23 | 4 | illustrations, tariffs, where-migration … | I5374:721509;647:1978;5374:727427;647:102128;647:102125 I5374:564637;5374:564702;5374:564954;647:102191;647:102125 I5374:629815;98:371;98:402;2217:2028 |
| шрифт без стиля: WB Sans Logo Regular 28/21 | 23 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 15/20 SMALL_CAPS_FORCED | 23 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w0.5) | 23 | 1 | navigation |  |
| сырой #d6d7dc [text] | 23 | 2 | navigation, where | I5374:448033;8304:9663 |
| сырой эффект: drop 0,7 r24 s0 #000000@0.29 | 22 | 6 | backlog-ui, no-car, tariffs … | 5371:80599 5374:1040269 5374:564783 |
| сырой #545665 [shape] | 22 | 6 | backlog-ui, no-car, tariffs … | 5371:80603 5374:1040273 5374:564787 |
| сырой #ffe2f1 [frame] | 22 | 2 | illustrations, show-my-location | 5374:723553 5374:803660 |
| шрифт без стиля: WB Sans Logo Regular 13.090909004211426/11.454545021057129 | 22 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 11/14 | 22 | 1 | navigation |  |
| сырой эффект: glass + inner_shadow + inner_shadow + inner_shadow + drop 0,8 r15 s0 #000000@0.02 + drop 0,0 r0 s0.5 #e8e8e8 + drop -0.75,0 r0 s-0.75 #d0d0d0@0.25 + drop 0.75,0.75 r0 s-0.75 #d0d0d0@0.50 | 22 | 1 | navigation |  |
| {Theme:bg/level -1} [shape/shape] — нет правила | 22 | 3 | navigation, profile, show-my-location | 5374:539074 I5374:804278;2328:7237;1212:2007 |
| сырой #9747ff [stroke] | 22 | 7 | navigation, order-flow, show-my-location … | 5871:174405 5374:806793 5374:564700 |
| [Gray Scale/Gray 900] [text] — нет в маппинге | 22 | 1 | profile | 5374:539280 |
| сырой эффект: background_blur + noise + drop 0,4 r12 s0 #bf80ff@0.10 | 22 | 2 | where-migration, where | 5374:626900 5374:425241 |
| шрифт без стиля: ALS Hauss VF Medium 19/22 | 21 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2347 I5374:727398;4906:196320;2646:2347 |
| сырой #fbe5f9 [shape] | 21 | 2 | illustrations, navigation | 5374:722485 |
| #000000 → Route/Primary [stroke] — не w4 (w1.7333333492279053) | 21 | 2 | illustrations, tariffs | I5374:721509;647:1978;5374:727427;647:102128;647:102124 I5374:564637;5374:564702;5374:564954;647:102191;647:102124 |
| [Pastel [day]/Lenny] [frame] — нет в маппинге | 21 | 4 | illustrations, navigation, permissions … | 5374:721936 5374:1019855 5374:625343 |
| сырой #4f8ce4 [stroke] | 21 | 4 | illustrations, navigation, tariffs … | 5374:721333 5374:563580 5374:563692 |
| шрифт без стиля: SF Pro Text Semibold 15/22 | 21 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 15/22 | 21 | 1 | navigation |  |
| сырой #131313 [frame] | 20 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2348 I5374:727389;2036:4183 |
| {Radius:CRx10}=40 topLeftRadius — нет цели | 20 | 3 | errors, illustrations, service-coverage | 5374:358788 5374:724189 5374:86855 |
| {Radius:CRx10}=40 topRightRadius — нет цели | 20 | 3 | errors, illustrations, service-coverage | 5374:358788 5374:724189 5374:86855 |
| {Radius:CRx10}=40 bottomLeftRadius — нет цели | 20 | 3 | errors, illustrations, service-coverage | 5374:358788 5374:724189 5374:86855 |
| {Radius:CRx10}=40 bottomRightRadius — нет цели | 20 | 3 | errors, illustrations, service-coverage | 5374:358788 5374:724189 5374:86855 |
| сырой #ece3ff [frame] | 20 | 2 | illustrations, navigation | 5374:722776 |
| сырой #e6eff8 [frame] | 20 | 2 | illustrations, navigation | 5374:722891 |
| [Night / Black] [text] — нет в маппинге | 20 | 3 | illustrations, navigation, show-my-location | I5374:723706;600:75 I5374:803637;600:75 |
| шрифт без стиля: WB Sans Regular 19/auto LOWER | 20 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Bold 17/23 | 20 | 1 | navigation |  |
| шрифт без стиля: SF Pro Semibold 17/28 | 20 | 1 | navigation |  |
| сырой #ff8b8b [shape] | 20 | 1 | navigation |  |
| сырой эффект: drop 0,1 r4 s0 #000518@0.15 | 20 | 1 | navigation |  |
| шрифт без стиля: SF Pro Semibold 17/24 | 20 | 2 | where-migration, where | I5374:625336;1122:546 I5374:423677;1122:546 |
| сырой #8f8fa3 [shape] | 19 | 8 | backlog-ui, errors, illustrations … | I5371:80825;4270:112419 I5374:358797;4270:112419 I5374:727362;4270:112419 |
| [Background [night]/Secondary] [frame] — нет в маппинге | 19 | 4 | illustrations, navigation, where-migration … | 5374:722765 5374:628991 5374:427332 |
| сырой #9d9db2 [frame] | 19 | 2 | navigation, test | 5374:1031718 |
| шрифт без стиля: SF Pro Display Regular 22/28 | 19 | 3 | navigation, tariffs, test | 5374:564317 5374:564319 5374:1032882 |
| шрифт без стиля: WB Sans Medium 14/120.00000476837158 | 19 | 1 | profile | 5374:528103 |
| шрифт без стиля: WB Sans Bold 15.918210983276367/auto | 19 | 1 | profile | 5374:530832 |
| {Theme:input/stroke/selected} [stroke] — нет в маппинге | 19 | 3 | tariffs, where-migration, where | 5374:563679 I5374:629624;401:2067 I5374:427965;401:2067 |
| сырой #262626 [shape] | 18 | 3 | illustrations, navigation, tariffs | I5374:721348;1934:2685 I5374:564476;1934:2685 |
| [Gray / 70%] [text] — нет в маппинге | 18 | 3 | illustrations, where-migration, where | 5374:722181 5374:649785 5374:448126 |
| шрифт без стиля: SF Pro Display Regular 23/28 | 18 | 3 | illustrations, where-migration, where | 5374:722181 5374:649785 5374:448126 |
| [Pastel [day]/Milhouse] [frame] — нет в маппинге | 18 | 2 | illustrations, navigation | 5374:722889 |
| сырой #f8e6f3 [frame] | 18 | 2 | illustrations, navigation | 5374:722890 |
| сырой #000000@0.30 [shape] | 18 | 3 | illustrations, navigation, show-my-location | I5374:722033;15858:171819;4361:38116 I5374:804228;2781:11251;2781:9199;2583:5531 |
| шрифт без стиля: SF Pro Text Bold 16/16 | 18 | 5 | illustrations, navigation, no-car … | 5374:721211 5374:1040394 5374:803592 |
| сырой #e8b6ff [stroke] | 18 | 1 | navigation |  |
| {Colors:Fill/Messaging Bubble} [shape] — нет в маппинге | 18 | 1 | navigation |  |
| сырой #a73afd@0.10 [frame] | 18 | 1 | navigation |  |
| шрифт без стиля: Google Sans Bold 24/29 | 18 | 1 | navigation |  |
| {Color:tx-bg/level 1 base} [stroke] — нет правила | 18 | 3 | navigation, profile, show-my-location | 5374:536881 I5374:803393;40006214:22340;40001478:11677;5374:818350;40003372:84930 |
| шрифт без стиля: Inter Bold 16/16 | 18 | 1 | order-flow | 5374:918723 |
| {Color:tx-control/purple/bg/idle} [shape/shape] — нет правила | 18 | 4 | order-flow, show-my-location, where-migration … | I5374:918346;40006303:59184 I5374:803406;400:18430;40006303:59184 I5374:630599;40006303:59184 |
| шрифт без стиля: SF Pro Text Medium 14/110.00000238418579 | 18 | 1 | show-my-location | I5374:804071;40001108:25773;5374:818838 |
| шрифт без стиля: ALS Hauss VF Medium 19/20 | 18 | 1 | show-my-location | I5374:804259;2314:4619;305:1432;309:1387 |
| сырой #2e2e3c [shape] | 18 | 2 | where-migration, where | I5374:642119;578:417 I5374:440460;578:417 |
| сырой эффект: drop 0,3 r5 s0 #000000@0.20 + drop 0,1 r18 s0 #000000@0.18 + drop 0,6 r10 s0 #000000@0.14 | 17 | 2 | illustrations, navigation | 5374:722621 |
| [Pastel [day]/Lisa] [frame] — нет в маппинге | 17 | 3 | illustrations, navigation, where-migration | 5374:721903 5374:623568 |
| {Colors:Fills - Vibrant/Tertiary} [shape] — нет в маппинге | 17 | 1 | navigation |  |
| сырой #cacad1 [shape] | 17 | 1 | order-flow | 5374:918695 |
| сырой эффект: drop 3,4 r10 s0 #1d361b@0.08 | 17 | 2 | order-flow, show-my-location | I5374:903780;15:3905 I5374:805743;15:3905 |
| шрифт без стиля: WB Sans Logo Regular 17.15379524230957/auto | 17 | 1 | profile | I5374:534024;5374:541279;111717:160053;259:7531 |
| [pink/WB pink 500] [shape] — нет в маппинге | 17 | 1 | profile | I5374:534024;5374:541279;111717:160053;433:12936;433:12363;4415:5571 |
| шрифт без стиля: SF Pro Regular 17/24 | 17 | 2 | service-coverage, show-my-location | 5374:86185 I5374:803697;40001403:28636;40001069:17942 |
| сырой #faa61a [shape] | 16 | 7 | backlog-ui, no-car, order-flow … | 5371:80672 5374:1040346 5374:918960 |
| сырой #1d1c1e [frame] | 16 | 6 | errors, navigation, permissions … | 5374:358852 5374:210303 5374:1020491 |
| [Title/title1 — elephant] — нет в маппинге | 16 | 6 | errors, illustrations, navigation … | I5374:358835;97:15293;3107:24017;3014:22403 I5374:727399;97:15293;3107:24017;3014:22403 I5374:804228;2898:10365;2898:9749;178:635 |
| [Pastel [day]/Bart] [frame] — нет в маппинге | 16 | 2 | illustrations, permissions | 5374:721985 5374:1019871 |
| шрифт без стиля: SF Pro Display Medium 16/16 | 16 | 3 | illustrations, navigation, tariffs | 5374:721437 5374:564565 5374:564570 |
| сырой эффект: drop 0,0 r20 s0 #000000@0.10 | 16 | 3 | illustrations, navigation, show-my-location | 5374:722477 5374:803624 |
| сырой #000000@0.03 [frame] | 16 | 1 | navigation |  |
| [Description/descriptionUppercace — hamster] — нет в маппинге | 16 | 1 | navigation |  |
| сырой #fff6c2 [frame] | 16 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w2.240000009536743) | 16 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w2.5) | 16 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Bold 11/14 | 16 | 1 | navigation |  |
| [Body/bodyAccent] — нет в маппинге | 16 | 2 | navigation, profile | 5374:529567 |
| сырой эффект: noise | 16 | 3 | navigation, where-migration, where | 5374:626748 5374:425089 |
| сырой #f5f5f6 [shape] | 16 | 2 | navigation, taxi | 5374:897159 |
| шрифт без стиля: SF Pro Display Semibold 44/48 | 16 | 2 | navigation, test | 5374:1032650 |
| {Theme:skeleton/whiteConstOpacity} [frame] — нет в маппинге | 16 | 2 | navigation, profile | 5374:528154 |
| [Body/Regular] — нет в маппинге | 16 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194713 I5374:803123;2189:195906 I5374:897665;5374:898324 |
| эффект [Material Blur] — нет в маппинге | 16 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194703;510:79117 I5374:803123;2189:195898;510:79117 I5374:897665;5374:898316;510:79117 |
| [Footnote/Regular] — нет в маппинге | 16 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194706 I5374:803123;2189:195901 I5374:897665;5374:898319 |
| шрифт без стиля: WBGS Medium 24/29 | 16 | 1 | profile | 5374:528147 |
| шрифт без стиля: WB Sans Bold 18/auto | 16 | 1 | profile | 5374:530319 |
| [Caption 2/Regular] — нет в маппинге | 16 | 1 | profile | 5374:539313 |
| сырой эффект: drop 0,0 r250 s0 #ffffff@0.50 + drop 0,0 r100 s0 #ffffff | 16 | 1 | service-coverage | 5374:87054 |
| сырой #ffffff@0.75 [frame] | 16 | 2 | where-migration, where | 5374:626919 5374:425260 |
| сырой #acb2bf [shape] | 16 | 2 | where-migration, where | I5374:626927;6517:791 I5374:425268;6517:791 |
| сырой #3458e8 [shape] | 15 | 6 | backlog-ui, no-car, tariffs … | 5371:80583 5374:1040253 5374:564767 |
| [Fill / Light] [shape] — нет в маппинге | 15 | 6 | backlog-ui, no-car, tariffs … | 5371:80690 5374:1040364 5374:563975 |
| [Background day/Primary] [frame] — нет в маппинге | 15 | 2 | illustrations, navigation | 5374:722621 |
| сырой эффект: glass + inner_shadow + inner_shadow + inner_shadow + drop 0,8 r15 s0 #000000@0.02 + drop 0,0 r0 s0.5 #e8e8e8 | 15 | 1 | navigation |  |
| {Theme:text icon/blackPrimaryConst} [text] — нет в маппинге | 15 | 2 | navigation, profile | 5374:538168 |
| эффект [Shadow / Card] — нет в маппинге | 15 | 3 | navigation, where-migration, where | 5374:648999 5374:447340 |
| {Theme:bg/blackConst} «Shadow» — пробел | 15 | 4 | navigation, tariffs, where-migration … | I5374:563664;121:163 I5374:630188;121:163 I5374:428529;121:163 |
| сырой эффект: drop 0,4 r24 s0 #10032b@0.07 | 15 | 2 | navigation, show-my-location | 5374:804674 |
| сырой #e0e0eb [frame] | 15 | 1 | profile | 5374:528095 |
| [pure black] [text] — нет в маппинге | 15 | 2 | profile, show-my-location | I5374:541799;400:18443;40006303:62353 I5374:803406;400:18443;40006303:62353 |
| сырой #8c7aff [shape] | 15 | 1 | service-coverage | 5374:86347 |
| шрифт без стиля: SF Pro Semibold 22/28 | 15 | 3 | service-coverage, where-migration, where | 5374:86184 I5374:625345;1149:63 I5374:423686;1149:63 |
| шрифт без стиля: SF Pro Semibold 16/16 | 15 | 3 | taxi, where-migration, where | 5374:898019 5374:625632 5374:423973 |
| сырой #70707f [shape] | 14 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112412 I5374:358797;4270:112412 I5374:727362;4270:112412 |
| сырой #656573 [shape] | 14 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112420 I5374:358797;4270:112420 I5374:727362;4270:112420 |
| сырой #ffffff@0.20 [shape] | 14 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112422 I5374:358797;4270:112422 I5374:727362;4270:112422 |
| сырой #fb8437 [shape] | 14 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2330;494:16636 I5374:727398;4906:196320;2646:2330;494:16636 |
| сырой эффект: drop 0,4 r4 s0 #000000@0.25 + inner_shadow | 14 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2330;494:17745 I5374:727398;4906:196320;2646:2330;494:17745 |
| сырой эффект: drop 0,0.5 r0 s0 #ed8221 | 14 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2330;496:20944 I5374:727398;4906:196320;2646:2330;496:20944 |
| сырой #131313 [shape] | 14 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2339 I5374:727398;4906:196320;2646:2339 |
| сырой эффект: drop 0,0 r1 s0 #000000@0.20 | 14 | 3 | illustrations, navigation, show-my-location | 5374:722351 5374:803499 |
| шрифт без стиля: SF Pro Display Semibold 16/16 | 14 | 3 | illustrations, navigation, show-my-location | 5374:722353 5374:803501 |
| шрифт без стиля: SF Pro Display Semibold 10/10 | 14 | 3 | illustrations, navigation, show-my-location | 5374:722354 5374:803502 |
| [Icon [night]/Accent] [shape] — нет в маппинге | 14 | 3 | illustrations, where-migration, where | I5374:723908;1228:7444 I5374:628974;3051:20210;454:27 I5374:427315;3051:20210;454:27 |
| [Text [night]/Secondary] [text] — нет в маппинге | 14 | 3 | illustrations, where-migration, where | I5374:723934;1149:10 I5374:628983;1122:546 I5374:427324;1122:546 |
| {Colors:BG/Level-1} [frame] — нет в маппинге | 14 | 1 | navigation |  |
| сырой #8f8fa3 [text] | 14 | 1 | navigation |  |
| сырой #fafafc [shape] | 14 | 1 | navigation |  |
| сырой эффект: drop 0,4 r16 s0 #000000@0.10 | 14 | 1 | navigation |  |
| сырой #5c5c65 [text] | 14 | 2 | navigation, test | 5374:1031856 |
| {theme:promo/primary/bg/neutralPrimary} [shape] — нет в маппинге | 14 | 1 | order-flow | 5871:175988 |
| шрифт без стиля: ALS Hauss VF Book 90/85 | 14 | 4 | order-flow, show-my-location, where-migration … | I5374:909219;69:109;5374:930930 I5374:808541;69:109;5374:820801 I5374:630284;2132:7158 |
| сырой #a76feb [frame] | 14 | 1 | profile | 5374:528157 |
| сырой эффект: drop 0,0.9033806920051575 r1.806761384010315 s0 #000000@0.12 + drop 0,0 r0.9033806920051575 s0 #000000@0.15 | 14 | 1 | profile | 5374:541804 |
| шрифт без стиля: WB Sans Medium 40/auto | 13 | 2 | errors, illustrations | I5374:358788;40007404:39090 I5374:724189;2158:84569 |
| сырой #3458e9 [shape] | 13 | 2 | illustrations, navigation | 5374:722352 |
| сырой эффект: drop 0,0 r2 s0 #000000@0.20 | 13 | 1 | navigation |  |
| сырой #ededed [shape] | 13 | 1 | navigation |  |
| сырой #ffffff@0.50 [stroke] | 13 | 2 | navigation, test | 5374:1031749 |
| сырой #fffffe@0.12 [frame] | 13 | 2 | navigation, test | 5374:1031750 |
| сырой #1a1a1a [frame] | 13 | 2 | navigation, order-flow | 5374:922898 |
| шрифт без стиля: WB Sans Bold 44/auto | 13 | 1 | profile | 5374:528117 |
| сырой #000000@0.38 [shape] | 13 | 3 | service-coverage, where-migration, where | 5374:88845 5374:630101 5374:428442 |
| сырой #c85626 [frame] | 12 | 2 | errors, illustrations | I5374:358922;3075:5617 I5374:727389;2036:4170 |
| сырой #ff6a00 [frame] | 12 | 2 | errors, illustrations | I5374:358922;3075:5619 I5374:727389;2036:4172 |
| сырой #ffffff@0.40 [shape] | 12 | 2 | illustrations, tariffs | 5374:721307 5374:564435 5374:564436 |
| шрифт без стиля: SF Pro Display Regular 9/28 | 12 | 3 | illustrations, where-migration, where | 5374:722164 5374:649768 5374:448109 |
| [Gray / 10%] [stroke] — нет в маппинге | 12 | 3 | illustrations, where-migration, where | 5374:722179 5374:649783 5374:448124 |
| сырой #000518@0.03 [shape] | 12 | 2 | illustrations, tariffs | 5374:721448 5374:563807 5374:563813 |
| [Icon [night]/Primary] [shape] — нет в маппинге | 12 | 3 | illustrations, where-migration, where | I5374:723908;1228:7449 I5374:629006;1264:104 I5374:427347;1264:104 |
| сырой #ffd000 [frame] | 12 | 3 | illustrations, navigation, show-my-location | 5374:723527 5374:803631 |
| сырой #c4cdd5 [stroke] | 12 | 3 | illustrations, navigation, show-my-location | 5374:723528 5374:803632 |
| [Pastel [day]/Homer] [frame] — нет в маппинге | 12 | 5 | illustrations, service-coverage, tariffs … | 5374:721311 5374:86823 5374:564439 |
| шрифт без стиля: ALS Hauss VF Medium 15/20 | 12 | 1 | navigation |  |
| {theme:promo/secondary/bg/sky} [frame] — нет в маппинге | 12 | 1 | navigation |  |
| {theme:promo/secondary/bg/sky} [shape] — нет в маппинге | 12 | 1 | navigation |  |
| сырой #ffffff@0.70 [shape] | 12 | 1 | navigation |  |
| [Uppercace/captionUppercace — chameleon] — нет в маппинге | 12 | 1 | navigation |  |
| {theme:promo/secondary/bg/blackberry} [frame] — нет в маппинге | 12 | 1 | navigation |  |
| {theme:promo/secondary/bg/green} [frame] — нет в маппинге | 12 | 1 | navigation |  |
| {theme:promo/primary/bg/river} [shape] — нет в маппинге | 12 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 11/14 UPPER | 12 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 36/auto LOWER | 12 | 1 | navigation |  |
| сырой #ededf2 [frame] | 12 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Medium 13/20 | 12 | 1 | navigation |  |
| сырой #303030 [stroke] | 12 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Black 11/17.967525482177734 | 12 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w2.3333334922790527) | 12 | 1 | navigation |  |
| шрифт без стиля: Google Sans Regular 11/14 | 12 | 1 | navigation |  |
| [Icon [night]/Success] [shape] — нет в маппинге | 12 | 1 | navigation |  |
| сырой #7000ff [shape] | 12 | 1 | navigation |  |
| [Pastel [day]/Milhouse] [shape] — нет в маппинге | 12 | 1 | navigation |  |
| [Action/action] — нет в маппинге | 12 | 1 | navigation |  |
| сырой эффект: drop 0,8 r15 s0 #000000@0.02 + drop 0,0 r0 s0.5 #e8e8e8 + drop -1.25,0 r0 s-0.75 #d0d0d0 + drop 1.25,0 r0 s-0.75 #d0d0d0 + inner_shadow + inner_shadow + inner_shadow + glass | 12 | 1 | navigation |  |
| сырой #d9d9d9 [stroke] | 12 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w0.9766503572463989) | 12 | 1 | navigation |  |
| {Theme:text icon/primary} [frame/frame] — нет правила | 12 | 3 | navigation, where-migration, where | 5374:626932 5374:425273 |
| сырой #ff00ff [shape] | 12 | 4 | navigation, show-my-location, taxi … | I5374:803697;40001403:28636;40001075:10742;207:51803 I5374:897999;40004746:24141;40004730:30963 I5374:1033436;40004746:24141;40004730:30963 |
| [Text/Regular] — нет в маппинге | 12 | 1 | profile | 5374:539312 |
| {Theme TX:tx-accent/orange/tint} [text] — нет в маппинге | 12 | 1 | show-my-location | I5374:804259;2314:7790;305:1431 |
| сырой #4e4e60 [stroke] | 12 | 3 | tariffs, where-migration, where | 5374:563997 5374:564166 5374:634055 |
| сырой #f5f5f6 [frame] | 12 | 1 | taxi | 5374:897153 |
| сырой #e4e4e7 [frame] | 12 | 2 | where-migration, where | 5374:624292 5374:422633 |
| [Strokes day/Card] [stroke] — нет в маппинге | 12 | 2 | where-migration, where | 5374:649014 5374:447355 |
| шрифт без стиля: Scada Regular 28/18 | 11 | 6 | backlog-ui, no-car, tariffs … | 5371:80618 5374:1040288 5374:564802 |
| {Theme:bg/accentLight} [frame] — нет в маппинге | 11 | 4 | errors, tariffs, where-migration … | I5374:358941;5930:6223 I5374:563669;628:200856;98:376;2064:2712 I5374:630219;1050:18413;98:376;2064:2712 |
| шрифт без стиля: Roboto Bold 65.25/85 | 11 | 4 | geo-problems, show-my-location, where-migration … | 5374:885789 5374:803264 5374:626009 |
| [Titles/Title 2] — нет в маппинге | 11 | 4 | illustrations, navigation, order-flow … | 5374:722652 5374:921088 I5374:804119;40001870:9985;40001007:26289;5561:145075;40001298:18988 |
| [Buttons day/Primary] [frame] — нет в маппинге | 11 | 2 | illustrations, tariffs | 5374:721518 5374:563866 5374:563867 |
| {Color:tx-accent/orange/fg-inverted} [shape] — нет в маппинге | 11 | 1 | navigation |  |
| сырой #793af5 [shape] | 11 | 1 | navigation |  |
| [Pastel [day]/Hans] [frame] — нет в маппинге | 11 | 1 | navigation |  |
| [Paragraph/paragraph] — нет в маппинге | 11 | 1 | navigation |  |
| шрифт без стиля: WB Sans Medium 17/17 | 11 | 1 | navigation |  |
| [Icon [day]/Success] [shape] — нет в маппинге | 11 | 3 | navigation, where-migration, where | 5374:628791 5374:427132 |
| [Title/title1] — нет в маппинге | 11 | 2 | navigation, profile | 5374:539129 |
| сырой эффект: glass | 11 | 2 | navigation, profile | 5374:539222 |
| {Safe zones:safe-top}=62 paddingTop — нет цели | 11 | 1 | order-flow | 5871:183138 |
| сырой #2f2e43 [shape] | 11 | 2 | order-flow, show-my-location | 5374:904906 I5374:804460;40006739:17633 |
| {Color:tx-brand/pink/idle} [shape] — нет в маппинге | 11 | 4 | order-flow, show-my-location, where-migration … | I5374:918346;40006303:59187 I5374:803406;400:18430;40006303:59187 I5374:630599;40006303:59187 |
| {Color:tx-brand/pink/blue/idle} [shape] — нет в маппинге | 11 | 4 | order-flow, show-my-location, where-migration … | I5374:918346;40006303:59188 I5374:803406;400:18430;40006303:59188 I5374:630599;40006303:59188 |
| {System Colors:Miscellaneous/Alert, Menu, Action Sheet - Separators} [stroke] — нет в маппинге | 11 | 2 | permissions, taxi | I5374:1021196;2189:194712 I5374:897665;5374:898323 |
| шрифт без стиля: WB Sans Bold 32/100 | 11 | 1 | profile | 5374:529799 |
| сырой #26013e@0.25 [shape] | 11 | 1 | show-my-location | I5374:803386;40007540:53521 |
| {Theme:button/secondary/bg/default} [frame] — нет в маппинге | 10 | 3 | errors, illustrations, show-my-location | I5374:358834;4906:196326 I5374:727371;3168:13324 I5374:804228;2781:9145;4192:28390;2690:6562 |
| [Icon [night]/Secondary Opposite] [shape] — нет в маппинге | 10 | 1 | illustrations | I5374:722762;2:41302;2301:15473;764:31 |
| сырой эффект: drop 0,2 r8 s0 #000518@0.12 | 10 | 2 | illustrations, tariffs | 5374:721433 5374:563800 5374:563819 |
| [Pastel [day]/Apu] [frame] — нет в маппинге | 10 | 2 | illustrations, navigation | 5374:721890 |
| [Buttons day/Primary] [shape] — нет в маппинге | 10 | 6 | illustrations, navigation, permissions … | I5374:722527;5254:499;5254:269 I5374:1021079;5254:269 I5374:563777;1903:4800 |
| [Text [day]/Tertiary] [stroke] — нет правила | 10 | 2 | illustrations, navigation | 5374:722654 |
| [Night / Gray 8] [text] — нет в маппинге | 10 | 3 | illustrations, navigation, show-my-location | 5374:723703 5374:803656 |
| сырой эффект: drop 0,1 r10 s0 #10032b@0.17 | 10 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 10/22 | 10 | 1 | navigation |  |
| сырой #ffffff@0.90 [text] | 10 | 1 | navigation |  |
| {Colors:Text-Icon/Secondary} [shape] — нет в маппинге | 10 | 1 | navigation |  |
| сырой #5f5f5f [shape] | 10 | 1 | navigation |  |
| сырой #8f8fa3@0.75 [stroke] | 10 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Medium 12/17 | 10 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w1.2000000476837158) | 10 | 1 | navigation |  |
| сырой #c7e4cd [shape] | 10 | 1 | navigation |  |
| сырой #ddd5e8 [shape] | 10 | 1 | navigation |  |
| сырой #f9eed8 [shape] | 10 | 1 | navigation |  |
| сырой #eadbd6 [shape] | 10 | 1 | navigation |  |
| сырой #f5e6f4 [shape] | 10 | 1 | navigation |  |
| сырой #e6f1f3 [shape] | 10 | 1 | navigation |  |
| сырой #333746 [text] | 10 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Medium 18/20 | 10 | 1 | navigation |  |
| сырой #e2e2e2 [stroke] | 10 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 17/17 | 10 | 3 | navigation, where-migration, where | I5374:630284;2132:7168;2132:3890 I5374:428625;2132:7168;2132:3890 |
| сырой #661aff [frame] | 10 | 4 | navigation, show-my-location, taxi … | I5374:803697;40001403:28636;40001075:10742 I5374:897999;40004746:24141 I5374:1033436;40004746:24141 |
| сырой #b3b3b3@0.82 [frame] | 10 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194703;510:79117 I5374:803123;2189:195898;510:79117 I5374:897665;5374:898316;510:79117 |
| сырой #383838 [frame] | 10 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194703;510:79117 I5374:803123;2189:195898;510:79117 I5374:897665;5374:898316;510:79117 |
| [Headline/Regular] — нет в маппинге | 10 | 3 | permissions, show-my-location, taxi | I5374:1021196;2189:194705 I5374:803123;2189:195900 I5374:897665;5374:898318 |
| шрифт без стиля: WB Sans Bold 22/100 | 10 | 1 | profile | 5374:531611 |
| шрифт без стиля: SF Pro Text Semibold 14/16 | 10 | 1 | profile | 5374:533496 |
| шрифт без стиля: WB Sans Bold 12/115.55050611495972 | 10 | 1 | profile | 5374:538556 |
| [Gray Scale/Gray 500] [text] — нет в маппинге | 10 | 1 | profile | 5374:539326 |
| шрифт без стиля: WB Sans Medium 12/16 | 10 | 1 | profile | 5374:540419 |
| {Color:tx-accent/grey/dark const} [text/text] — нет правила | 10 | 2 | profile, show-my-location | 5374:538825 I5374:804807;40004841:66861;40004769:34875 |
| сырой #f96c88 [shape] | 10 | 1 | service-coverage | 5374:87731 |
| сырой эффект: drop 0,-4 r16 s0 #000000@0.12 + noise | 10 | 1 | show-my-location | 5374:803202 |
| шрифт без стиля: Roboto Bold 65.25/87 | 10 | 3 | taxi, where-migration, where | 5374:897392 5374:625395 5374:423736 |
| эффект [Cards \| Shadow S] — нет в маппинге | 10 | 2 | where-migration, where | I5374:630770;686:41696 I5374:429111;686:41696 |
| {Theme:stroke/secondary} [stroke] — нет в маппинге | 9 | 5 | backlog-ui, errors, illustrations … | I5371:80825;4270:112410 I5374:358797;4270:112410 I5374:727362;4270:112410 |
| сырой #661aff [shape] | 9 | 3 | errors, navigation, profile | I5374:358922;3075:5583 5374:529903 |
| {Color:tx-accent/orange/tint} [frame] — нет в маппинге | 9 | 4 | illustrations, navigation, show-my-location … | I5374:721586;907:124137;859:104817 5374:804682 I5374:1032688;907:124137;859:104817 |
| шрифт без стиля: ALS Hauss VF Bold 13/17 | 9 | 1 | navigation |  |
| [Background [day]/Primary Overlay] [frame] — нет в маппинге | 9 | 1 | navigation |  |
| {Theme TX:tx-control/ghost/bg/idle} [frame] — нет в маппинге | 9 | 1 | navigation |  |
| сырой #cccccc [shape] | 9 | 1 | navigation |  |
| сырой #070707 [shape] | 9 | 1 | navigation |  |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow + drop 1,1 r1 s0 #000000@0.30 | 9 | 1 | navigation |  |
| [Title/title3] — нет в маппинге | 9 | 2 | navigation, profile | 5374:539227 |
| сырой #181819 [shape] | 9 | 3 | order-flow, profile, show-my-location | I5374:917738;40008797:93159 5374:538866 I5374:803294;40007495:44585;40007507:35770;40008797:93422;40008797:93159 |
| шрифт без стиля: SF Pro Semibold 13.550710678100586/110.00000238418579 | 9 | 1 | profile | I5374:541799;400:18439;427:15746 |
| {Color:tx-control/neutral/bg/idle} [shape/shape] — нет правила | 9 | 2 | profile, show-my-location | I5374:541799;400:18439;400:16501;353:1275 I5374:803406;400:18439;400:16501;353:1275 |
| шрифт без стиля: SF Pro Medium 14/16 | 9 | 3 | service-coverage, where-migration, where | 5374:86287 5374:625331 5374:423672 |
| сырой #000000@0.00 [shape] | 8 | 5 | backlog-ui, errors, illustrations … | I5371:80825;4270:112442 I5374:358797;4270:112442 I5374:727362;4270:112442 |
| {Theme:button/tertiary/bg/default} [frame] — нет в маппинге | 8 | 2 | errors, illustrations | I5374:358835;97:15288;627:1119 I5374:727399;97:15288;627:1119 |
| {Theme:button/tertiary/content/primary/default} [text] — нет в маппинге | 8 | 2 | errors, illustrations | I5374:358835;97:15288;627:1119;29:11509 I5374:727399;97:15288;627:1119;29:11509 |
| [.auto tint/white] [shape] — нет в маппинге | 8 | 4 | errors, illustrations, no-car … | I5374:358835;97:15295;7892:7436;7470:13530 I5374:727399;97:15295;7892:7436;7470:13530 5374:1041002 |
| шрифт без стиля: SF Pro Display Medium 24/26 | 8 | 1 | geo-problems | 5374:885948 |
| {Color:tx-control/orange/bg/hover} [text] — нет в маппинге | 8 | 3 | illustrations, navigation, test | I5374:721586;907:124137;859:104817;859:104780 I5374:1032688;907:124137;859:104817;859:104780 |
| шрифт без стиля: ALS Hauss VF Medium 13/14 | 8 | 1 | navigation |  |
| сырой #000000@0.04 [shape] | 8 | 1 | navigation |  |
| сырой #292b53@0.03 [shape] | 8 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 10/14 | 8 | 1 | navigation |  |
| {Colors:Text-Icon/Primary} [shape] — нет в маппинге | 8 | 1 | navigation |  |
| {Colors:Text-Icon/Secondary} [text] — нет в маппинге | 8 | 1 | navigation |  |
| сырой эффект: drop 0,5 r5 s0 #000000 + drop 0,0 r3.999999761581421 s0 #00eaff + inner_shadow + inner_shadow | 8 | 1 | navigation |  |
| сырой эффект: drop 0,5 r5 s0 #000000 + drop 0,0 r2.5 s0 #00eaff + inner_shadow + inner_shadow | 8 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Black 24/17 | 8 | 1 | navigation |  |
| сырой #a4a4bf [shape] | 8 | 1 | navigation |  |
| сырой #9a1aff [shape] | 8 | 1 | navigation |  |
| сырой #000000@0.05 [frame] | 8 | 1 | navigation |  |
| сырой #eaeaf6 [frame] | 8 | 1 | navigation |  |
| сырой #ff7b00@0.10 [frame] | 8 | 1 | navigation |  |
| сырой #ff7b00 [stroke] | 8 | 1 | navigation |  |
| сырой #8526ff [frame] | 8 | 1 | navigation |  |
| сырой #010101 [text] | 8 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 64/auto | 8 | 1 | navigation |  |
| [Night / Black] [shape] — нет в маппинге | 8 | 2 | navigation, show-my-location | I5374:803637;600:76;1963:47 |
| {theme:icon/tertiary} [shape] — нет в маппинге | 8 | 2 | navigation, show-my-location | I5374:804396;3605:99846;379:1418;372:1387 |
| сырой #8a38f5 [stroke] | 8 | 5 | navigation, no-car, profile … | 5374:1041384 5374:540948 5374:650046 |
| сырой #ededff@0.70 [shape] | 8 | 2 | order-flow, service-coverage | 5871:188035 I5374:88620;1738:82100 |
| [Buttons day/Pressed] [stroke] — нет в маппинге | 8 | 4 | permissions, taxi, where-migration … | 5374:1021105 5374:895878 5374:648999 |
| сырой #ff6b15 [shape] | 8 | 1 | profile | 5374:539096 |
| [Background palette/Blank] [frame] — нет в маппинге | 8 | 1 | profile | 5374:539269 |
| [Extended palette/Red 900] [text] — нет в маппинге | 8 | 1 | profile | 5374:539305 |
| шрифт без стиля: ALS Hauss VF Regular 14/20 | 8 | 1 | profile | 5374:539325 |
| {theme:stroke/blackConst} [shape] — нет в маппинге | 8 | 1 | show-my-location | I5374:804278;2328:7237;1212:2036;1138:7255 |
| шрифт без стиля: ALS Hauss VF Regular 48/48 | 8 | 1 | show-my-location | I5374:804278;2229:48781;2229:19970;2223:2090 |
| {Theme:text icon/primary} [stroke] — нет правила | 8 | 1 | show-my-location | I5374:804278;2229:48781;2229:19970;2223:2095 |
| [Subheadline/Emphasized] — нет в маппинге | 8 | 3 | show-my-location, taxi, test | I5374:803697;40001403:28636;40001069:17904 I5374:897999;40004730:30953 I5374:1033436;40004730:30953 |
| шрифт без стиля: SF Pro Semibold 15/20 | 8 | 2 | where-migration, where | I5374:625327;3051:20211 I5374:423668;3051:20211 |
| {theme:bg/level −1 muted} [frame] — нет в маппинге | 8 | 2 | where-migration, where | I5374:629807;129:2199;129:395;1891:16587 I5374:428148;129:2199;129:395;1891:16587 |
| сырой эффект: drop 0,4 r20 s0 #595064@0.06 + drop 0,4 r20 s0 #424a5a@0.04 | 8 | 2 | where-migration, where | 5374:644097 5374:442438 |
| сырой #eeeeee [stroke] | 8 | 2 | where-migration, where | 5374:644133 5374:442474 |
| сырой эффект: drop 0,4 r12 s0 #595064@0.06 + drop 0,-4 r12 s0 #003dac@0.04 | 8 | 2 | where-migration, where | 5374:644133 5374:442474 |
| сырой эффект: inner_shadow + layer_blur | 7 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112407 I5374:358797;4270:112407 I5374:727362;4270:112407 |
| сырой #000000@0.70 [shape] | 7 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112423 I5374:358797;4270:112423 I5374:727362;4270:112423 |
| сырой #c7c7d7@0.60 [shape] | 7 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112427 I5374:358797;4270:112427 I5374:727362;4270:112427 |
| сырой #ffffff@0.80 [shape] | 7 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112439 I5374:358797;4270:112439 I5374:727362;4270:112439 |
| сырой #ffffff@0.32 [shape] | 7 | 4 | backlog-ui, errors, illustrations … | I5371:80825;4270:112441 I5374:358797;4270:112441 I5374:727362;4270:112441 |
| сырой #ff8533 [shape] | 7 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2318 I5374:727398;4906:196320;2646:2318 |
| {theme:notification/warningPrimary} [shape] — нет в маппинге | 7 | 2 | errors, illustrations | I5374:358834;4906:196320;2646:2319 I5374:727398;4906:196320;2646:2319 |
| {theme:bg/airToCoal} [frame] — нет в маппинге | 7 | 6 | errors, illustrations, navigation … | I5374:358835;97:15295 I5374:727399;97:15295 5374:1020788 |
| {Color:tx-control/orange/bg/hover} [shape] — нет в маппинге | 7 | 3 | illustrations, navigation, test | I5374:721586;907:124137;859:104817;859:104781;1448:345 I5374:1032688;907:124137;859:104817;859:104781;1448:345 |
| шрифт без стиля: ALS Hauss VF Medium 13/17 | 7 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Regular 13/17 | 7 | 1 | navigation |  |
| {Color:tx-accent/grey/light strong} [text/text] — нет правила | 7 | 1 | navigation |  |
| сырой #efe7f9 [frame] | 7 | 1 | navigation |  |
| сырой #717199 [shape] | 7 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 32.97789764404297/37.68902587890625 | 7 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 12/auto | 7 | 2 | navigation, show-my-location | 5374:817503 |
| сырой #f5f5f8 [frame] | 7 | 2 | navigation, test | 5374:1031842 |
| {Color:tx-accent/purple/fg-inverted} [shape] — нет в маппинге | 7 | 2 | navigation, profile | 5374:541718 |
| {Safe zones:safe-top}=42 paddingTop — нет цели | 7 | 2 | order-flow, show-my-location | 5374:903780 5374:805743 |
| {Color:tx-accent/red/tint} [frame] — нет в маппинге | 7 | 2 | order-flow, show-my-location | 5374:904943 5374:806784 |
| {Theme:stroke/primary} [stroke] — нет в маппинге | 7 | 4 | permissions, profile, where-migration … | 5374:1020525 5374:539605 5374:630320 |
| [Body/Emphasized] — нет в маппинге | 7 | 2 | permissions, taxi | I5374:1021196;2189:194711 I5374:897665;5374:898326 |
| шрифт без стиля: WB Sans Bold 14/120.00000476837158 | 7 | 1 | profile | 5374:528323 |
| сырой #b17aff [stroke] | 7 | 1 | service-coverage | 5374:86323 |
| сырой эффект: drop 0,14 r64 s0 #f24f18@0.00 | 7 | 1 | show-my-location | I5374:804228;2781:9134;1070:18232;237:848 |
| сырой эффект: drop 0,-8 r20 s0 #2d2d53@0.12 | 7 | 1 | show-my-location | I5374:804228;2781:11251;2781:9181 |
| сырой #ff661a [text] | 7 | 1 | show-my-location | I5374:804275;3406:38819;1255:2416;1485:2288 |
| шрифт без стиля: ALS Hauss VF Bold 15/20 | 7 | 1 | show-my-location | I5374:804275;3406:38819;1255:2416;1485:2288 |
| шрифт без стиля: SF Pro Display Regular 16/19 | 6 | 3 | backlog-ui, no-car, tariffs | 5371:80600 5374:1040270 5374:564784 |
| шрифт без стиля: SF Pro Display Regular 16/18 | 6 | 3 | backlog-ui, no-car, tariffs | 5371:80604 5374:1040274 5374:564788 |
| сырой #a73afd [frame] | 6 | 2 | errors, illustrations | I5374:358922;3075:5579 I5374:727389;2036:4159 |
| сырой #000041 [frame] | 6 | 2 | errors, illustrations | I5374:358922;3075:5613 I5374:727389;2036:4166 |
| {theme:filledArea/bg/default} [frame] — нет в маппинге | 6 | 2 | errors, illustrations | I5374:358835;97:15293;3107:24017 I5374:727399;97:15293;3107:24017 |
| {Theme:input/bg/default} [frame] — нет в маппинге | 6 | 2 | errors, illustrations | I5374:358835;97:15293;3107:24021 I5374:727399;97:15293;3107:24021 |
| {Theme:input/stroke/default} [stroke] — нет в маппинге | 6 | 2 | errors, illustrations | I5374:358835;97:15293;3107:24021 I5374:727399;97:15293;3107:24021 |
| {Theme:additional/buttonBuy/bg/default} [frame] — нет в маппинге | 6 | 3 | errors, illustrations, show-my-location | 5374:358958 5374:727395 5374:804267 |
| [Background [day]/Quaternary] [shape/shape] — нет правила | 6 | 1 | illustrations | 5374:722620 |
| [Text [night]/Constant White] [text] — нет в маппинге | 6 | 1 | illustrations | I5374:723935;1149:48 |
| сырой #e84342 [shape] | 6 | 2 | illustrations, tariffs | 5374:721295 5374:564423 5374:564553 |
| сырой #2787f5 [shape] | 6 | 2 | illustrations, tariffs | 5374:721296 5374:564424 5374:564554 |
| сырой #eaeaea [frame] | 6 | 2 | illustrations, tariffs | 5374:721517 5374:564690 5374:564692 |
| [Essential/Lemon] [frame] — нет в маппинге | 6 | 3 | illustrations, where-migration, where | 5374:722155 5374:649759 5374:448100 |
| сырой эффект: drop 0,1 r30 s0 #000000@0.12 + drop 0,6 r14 s0 #000000@0.16 | 6 | 2 | illustrations, tariffs | 5374:721516 5374:564644 5374:564659 |
| шрифт без стиля: ALS Hauss VF Medium 14/20 | 6 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 30/17.967525482177734 | 6 | 1 | navigation |  |
| сырой #000000@0.15 [shape] | 6 | 1 | navigation |  |
| сырой эффект: drop 8,8 r16 s0 #ffffff | 6 | 1 | navigation |  |
| [Title/title1reg — giraffe] — нет в маппинге | 6 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 12/10 | 6 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Regular 11/14 UPPER | 6 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 13/12 | 6 | 1 | navigation |  |
| сырой #7900f2 [shape] | 6 | 1 | navigation |  |
| сырой #ededf2 [shape] | 6 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Black 17/20 | 6 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Medium 11/14 | 6 | 1 | navigation |  |
| сырой #e8b6ff [shape] | 6 | 1 | navigation |  |
| сырой #e8b5ff [text] | 6 | 1 | navigation |  |
| сырой #ffffff@0.60 [text] | 6 | 1 | navigation |  |
| сырой #000000@0.04 [frame] | 6 | 1 | navigation |  |
| сырой #5f5f5f [stroke] | 6 | 1 | navigation |  |
| сырой эффект: drop 0,11 r23 s0 #000000@0.10 + drop 0,42 r42 s0 #000000@0.09 + drop 0,95 r57 s0 #000000@0.05 + drop 0,168 r67 s0 #000000@0.01 + drop 0,263 r74 s0 #000000@0.00 | 6 | 1 | navigation |  |
| сырой #f4f4f6 [shape] | 6 | 1 | navigation |  |
| сырой #262626 [frame] | 6 | 1 | navigation |  |
| сырой #9a1aff [frame] | 6 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Bold 17/20 | 6 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Extrabold 17/23 + Factor A TRIAL Bold 17/23 | 6 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Black 10.5/11.899999618530273 | 6 | 1 | navigation |  |
| сырой #c3c3ca@0.30 [frame] | 6 | 1 | navigation |  |
| сырой #000518@0.08 [stroke] | 6 | 1 | navigation |  |
| сырой #8e8e93 [text] | 6 | 1 | navigation |  |
| сырой #1a1f71 [shape] | 6 | 1 | navigation |  |
| сырой эффект: drop 0,3 r5 s0 #000000@0.20 + drop 0,6 r10 s0 #000000@0.14 | 6 | 1 | navigation |  |
| сырой эффект: drop -0.5,-0.5 r1 s0 #000000@0.50 + drop 0.5,0.5 r0.5 s0 #ffffff@0.30 | 6 | 1 | navigation |  |
| сырой эффект: drop 0,0 r24 s0 #6c6680@0.24 | 6 | 3 | navigation, where-migration, where | 5374:630646 5374:428987 |
| {Color:tx-notifications/bg-success} [frame] — нет в маппинге | 6 | 1 | order-flow | I5871:183138;1376:22172 |
| сырой эффект: drop 3,4 r10 s0 #1d361b@0.08 + glass | 6 | 1 | order-flow | I5871:183138;1376:22172 |
| сырой эффект: drop 3,4 r10 s0 #0f0f12@0.08 | 6 | 2 | order-flow, show-my-location | I5871:169127;15:3905 I5374:809532;15:3905 |
| сырой #ff22e2 [frame] | 6 | 3 | permissions, where-migration, where | 5374:1020527 5374:630322 5374:428663 |
| сырой #000000@0.32 [frame] | 6 | 3 | permissions, where-migration, where | 5374:1020532 5374:630327 5374:428668 |
| сырой #500000 [frame] | 6 | 3 | permissions, where-migration, where | 5374:1020532 5374:630327 5374:428668 |
| сырой #9800ff [shape] | 6 | 3 | permissions, where-migration, where | 5374:1020538 5374:630333 5374:428674 |
| сырой #7204bc [shape] | 6 | 3 | permissions, where-migration, where | 5374:1020546 5374:630341 5374:428682 |
| сырой эффект: inner_shadow + drop 0,2 r1 s0 #f844ff + drop 0,1 r1 s0 #ffffff@0.90 | 6 | 3 | permissions, where-migration, where | 5374:1020554 5374:630349 5374:428690 |
| эффект [Shadow Down] — нет в маппинге | 6 | 2 | permissions, show-my-location | 5374:1020829 5374:804279 |
| сырой #c4c4d4 [frame] | 6 | 1 | profile | 5374:527770 |
| шрифт без стиля: SF Pro Regular 12.647329330444336/14.45409107208252 | 6 | 1 | profile | I5374:541799;400:18439;427:15748 |
| шрифт без стиля: Golos Text Regular 20/auto | 6 | 1 | profile | 5374:542480 |
| сырой #e4e4ff [shape] | 6 | 1 | service-coverage | 5374:86999 |
| сырой #999999@0.97 [frame] | 6 | 1 | show-my-location | I5374:803697;40001403:28636;40001097:25303 |
| сырой #5c5c5c [frame] | 6 | 1 | show-my-location | I5374:803697;40001403:28636;40001097:25303 |
| {iOS Colors:Fills/Tertiary} [frame] — нет в маппинге | 6 | 1 | show-my-location | I5374:803697;40001403:28636;40001069:17907 |
| {System Colors:Labels/Secondary} [text] — нет в маппинге | 6 | 1 | show-my-location | I5374:803697;40001403:28636;40001069:17907;2522:16894 |
| шрифт без стиля: SF Pro Semibold 16/21 | 6 | 1 | show-my-location | I5374:803697;40001403:28636;40001069:17907;2522:16894 |
| {Color:tx-accent/red/bg} [frame/frame] — нет правила | 6 | 1 | show-my-location | 5374:804684 |
| шрифт без стиля: SF Pro Semibold 14/120.00000476837158 | 6 | 1 | show-my-location | I5374:804807;40004841:66861;40004769:34875 |
| [Background [night]/Secondary] [shape] — нет в маппинге | 6 | 2 | where-migration, where | I5374:628986;1242:357 I5374:427327;1242:357 |
| {Theme:text icon/accent} «Shadow» — пробел | 6 | 2 | where-migration, where | I5374:630128;121:169 I5374:428469;121:169 |
| {theme:promo/secondary/content/neutralSecondary} [stroke] — нет в маппинге | 6 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;903:31304 I5374:429115;924:18645;626:29016;903:31344;903:31304 |
| сырой #0e1820@0.76 [shape] | 5 | 2 | illustrations, show-my-location | 5374:722540 5374:803579 |
| сырой #ff00ff [frame] | 5 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 15/20 | 5 | 1 | navigation |  |
| {Kit:Component Stroke} [stroke] — нет в маппинге | 5 | 1 | navigation |  |
| {Theme TX:tx-bg/map neue} [frame] — нет в маппинге | 5 | 1 | navigation | 5374:209990 |
| шрифт без стиля: Google Sans Medium 17/20 | 5 | 1 | navigation |  |
| сырой #282828 [frame] | 5 | 1 | navigation |  |
| сырой #1b1b1b [shape] | 5 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 40.04458999633789/56.533538818359375 | 5 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 32.972938537597656/37.68335723876953 | 5 | 1 | navigation |  |
| [iOS / H1] — нет в маппинге | 5 | 2 | navigation, profile | 5374:529377 |
| сырой #3a3a3a [frame] | 5 | 2 | navigation, test | 5374:243207 5374:1030848 |
| сырой #252526 [frame] | 5 | 1 | order-flow | 5374:904550 |
| {persefona-semantic:text/text-secondary} [text] — нет в маппинге | 5 | 1 | order-flow | I5374:922110;1095:348;5:76 |
| [persefona/body-s] — нет в маппинге | 5 | 1 | order-flow | I5374:922110;1095:348;5:76 |
| {Color:tx-notifications/bg-error} [frame] — нет в маппинге | 5 | 1 | order-flow | I5871:187913;1376:22172 |
| шрифт без стиля: WB Sans Bold 20/115.55050611495972 | 5 | 1 | profile | 5374:538555 |
| [Gray Scale/Gray 600] [text] — нет в маппинге | 5 | 1 | profile | 5374:539467 |
| шрифт без стиля: SF Pro Text Semibold 12/16 | 5 | 1 | profile | 5374:540706 |
| шрифт без стиля: Golos Text Medium 24/auto | 5 | 1 | profile | 5374:541847 |
| сырой #ff6e8b [shape] | 5 | 1 | service-coverage | 5374:87736 |
| сырой #ec5171 [stroke] | 5 | 1 | service-coverage | 5374:87737 |
| сырой #19191d@0.50 [shape] | 5 | 1 | service-coverage | I5374:88621;1738:82100 |
| {theme:icon/warning} [shape] — нет в маппинге | 5 | 3 | show-my-location, where-migration, where | I5374:804396;3605:99846;379:1417;372:1384 I5374:630774;924:18645;626:29016;903:31344;924:12672;919:135468;634:29498;923:11604 I5374:429115;924:18645;626:29016;903:31344;924:12672;919:135468;634:29498;923:11604 |
| {theme:button/buy/content/default} [text] — нет в маппинге | 5 | 3 | show-my-location, where-migration, where | I5374:804396;3605:99847;127:166;2345:6744 I5374:630284;2132:7171;127:166;126:195;29:10236 I5374:428625;2132:7171;127:166;126:195;29:10236 |
| {System Colors:Miscellaneous/Text Field - BG} [frame] — нет в маппинге | 5 | 1 | taxi | 5374:898267 |
| {System Colors:Miscellaneous/Text Field - Outline} [stroke] — нет в маппинге | 5 | 1 | taxi | 5374:898267 |
| шрифт без стиля: SF Pro Regular 16/19 | 5 | 3 | taxi, where-migration, where | 5374:898029 5374:625642 5374:423983 |
| шрифт без стиля: SF Pro Regular 16/18 | 5 | 3 | taxi, where-migration, where | 5374:898033 5374:625646 5374:423987 |
| шрифт без стиля: SF Pro Regular 16/22 | 5 | 3 | taxi, where-migration, where | 5374:898073 5374:625686 5374:424027 |
| шрифт без стиля: SF Pro Bold 16/16 | 5 | 3 | taxi, where-migration, where | 5374:898153 5374:625766 5374:424107 |
| сырой #48ea4d [shape] | 4 | 2 | errors, order-flow | I5374:358746;349:4030;250:14;5374:359200;238:8;3867:1026 I5374:921087;349:4030;250:14;5374:935850;238:8;3867:1026 |
| сырой #f7ccff [shape] | 4 | 2 | errors, illustrations | I5374:358952;2036:4155 I5374:727389;2036:4155 |
| сырой #ff00ff [text] | 4 | 2 | errors, illustrations | I5374:358834;4906:196326;2605:6175 I5374:727371;3168:13324;3159:2544 |
| [Text/textSecondary (day)] [text] — нет в маппинге | 4 | 2 | errors, illustrations | I5374:358835;97:15292 I5374:727399;97:15292 |
| {theme:filledArea/stroke/defaultOFF} [stroke] — нет в маппинге | 4 | 2 | errors, illustrations | I5374:358835;97:15293;3107:24017 I5374:727399;97:15293;3107:24017 |
| сырой #d9d9d9@0.00 [shape] | 4 | 2 | errors, illustrations | I5374:358835;97:15294;28208:15102;28208:14578 I5374:727399;97:15294;28208:15102;28208:14578 |
| сырой #000000@0.10 [stroke] | 4 | 3 | errors, navigation, permissions | 5374:358852 5374:1020798 |
| сырой #000000@0.50 [shape] | 4 | 2 | errors, navigation | 5374:359005 |
| сырой #e5e5e5 [frame] | 4 | 1 | geo-problems | 5374:885947 |
| сырой эффект: drop 0,2 r0 s0 #000000@0.10 | 4 | 1 | geo-problems | 5374:885947 |
| [Icon [day]/Accent] [stroke] — нет правила | 4 | 1 | geo-problems | 5374:885959 |
| сырой #e9eaee [shape] | 4 | 1 | illustrations | I5374:721193;1895:188848;69:114;5374:727408 |
| [Field [day]/Focused] [frame] — нет в маппинге | 4 | 1 | illustrations | I5374:721194;1895:188848;69:114;5374:727417 |
| сырой #303038 [frame] | 4 | 1 | illustrations | 5374:721924 |
| [Texts night/Primary] [text/text] — нет правила | 4 | 1 | illustrations | 5374:722597 |
| [Text [day]/Accent] [stroke] — нет правила | 4 | 1 | illustrations | 5374:722266 |
| [Night / Gray 14] [shape] — нет в маппинге | 4 | 1 | illustrations | 5374:722549 |
| сырой #392d39 [shape] | 4 | 1 | illustrations | 5374:722557 |
| [Night / Gray 20] [stroke] — нет в маппинге | 4 | 1 | illustrations | 5374:722581 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.06 | 4 | 1 | illustrations | 5374:722614 |
| [Button [night]/Secondary] [shape] — нет в маппинге | 4 | 1 | illustrations | I5374:722760;3188:34978;899:200 |
| [Text [night]/Accent] [text] — нет в маппинге | 4 | 3 | illustrations, where-migration, where | 5374:723920 5374:628978 5374:427319 |
| [Icon [night]/Constant White] [shape] — нет в маппинге | 4 | 3 | illustrations, where-migration, where | 5374:723926 I5374:628980;1365:10727 I5374:427321;1365:10727 |
| [wbWallet/actionAccent] [frame] — нет в маппинге | 4 | 1 | navigation |  |
| {theme:promo/secondary/bg/blackberry} [text] — нет в маппинге | 4 | 1 | navigation |  |
| {Theme:text icon/blackPrimaryConst} [shape] — нет в маппинге | 4 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 16/16 | 4 | 1 | navigation |  |
| сырой #6b2cfe [frame] | 4 | 1 | navigation |  |
| {theme:button/inline/secondary/default} [text] — нет в маппинге | 4 | 1 | navigation |  |
| {theme:button/inline/secondary/default} [shape] — нет в маппинге | 4 | 1 | navigation |  |
| [Title/title3 — bear] — нет в маппинге | 4 | 1 | navigation |  |
| сырой #7900f2 [frame] | 4 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 19/17 LOWER | 4 | 1 | navigation |  |
| {Colors:BG/Level-1} [shape] — нет в маппинге | 4 | 1 | navigation |  |
| сырой #201b32 [frame] | 4 | 1 | navigation |  |
| сырой эффект: drop 0,2.5 r2.5 s0 #000000 + drop 0,0 r1.9999998807907104 s0 #00eaff + inner_shadow + inner_shadow | 4 | 1 | navigation |  |
| сырой эффект: drop 0,2.5 r2.5 s0 #000000 + drop 0,0 r1.25 s0 #00eaff + inner_shadow + inner_shadow | 4 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Medium 22.5/80.0000011920929 UPPER | 4 | 1 | navigation |  |
| сырой #ff0000 [frame] | 4 | 1 | navigation |  |
| сырой #d9b2ff [frame] | 4 | 1 | navigation |  |
| сырой эффект: drop -3.6953279972076416,7.390655994415283 r18.476638793945312 s0 #919191@0.05 + drop -12.933648109436035,31.410289764404297 r33.25795364379883 s0 #919191@0.04 + drop -27.7149600982666,68.36357116699219 r44.34394073486328 s0 #919191@0.03 + drop -49.88692855834961,121.94583129882812 r53.58226013183594 s0 #919191@0.01 + drop -77.60188293457031,190.3094024658203 r57.277584075927734 s0 #919191@0.00 + background_blur + inner_shadow + inner_shadow | 4 | 1 | navigation |  |
| {Theme TX:tx-accent/purple/tint} [shape] — нет в маппинге | 4 | 1 | navigation |  |
| сырой эффект: texture + layer_blur | 4 | 1 | navigation |  |
| сырой #00e1ff [shape] | 4 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Bold 17/22.999998092651367 | 4 | 1 | navigation |  |
| сырой эффект: drop 0,12 r42 s-4 #18274b@0.12 + drop 0,8 r18 s-6 #18274b@0.12 | 4 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Black 30/15 | 4 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Black 17.5/15 | 4 | 1 | navigation |  |
| сырой #fbff00 [shape] | 4 | 1 | navigation |  |
| сырой #fffb00 [shape] | 4 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w3.25) | 4 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Bold 24.375/27.625 | 4 | 1 | navigation |  |
| сырой эффект: drop 0,8 r24 s-4 #18274b@0.02 + drop 0,6 r12 s-6 #18274b@0.04 | 4 | 1 | navigation |  |
| [Utility/Red Overlay 10%] [frame] — нет в маппинге | 4 | 1 | navigation |  |
| [Red] [frame] — нет в маппинге | 4 | 1 | navigation |  |
| сырой #f0114c [text] | 4 | 1 | navigation |  |
| сырой #000000@0.02 [frame] | 4 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Medium 15/17 + Factor A TRIAL Bold 15/17 | 4 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Bold 15/14 | 4 | 1 | navigation |  |
| сырой #ff7b00 [frame] | 4 | 1 | navigation |  |
| [Purple] [stroke] — нет правила | 4 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Bold 24/26 | 4 | 1 | navigation |  |
| [Icon [day]/Secondary] [text/text] — нет правила | 4 | 1 | navigation |  |
| [Icon [day]/Secondary Clean] [shape] — нет в маппинге | 4 | 1 | navigation |  |
| [Pastel [day]/Homer] [shape] — нет в маппинге | 4 | 1 | navigation |  |
| сырой эффект: drop 0,2.25 r13.5 s0 #10032b@0.07 | 4 | 1 | navigation |  |
| шрифт без стиля: SF Pro Medium 15/20 | 4 | 1 | navigation |  |
| {Colors:Miscellaneous/Tab Bar Selection} [text] — нет в маппинге | 4 | 1 | navigation |  |
| шрифт без стиля: SF Pro Bold 15/20 | 4 | 1 | navigation |  |
| сырой #f3f2f4 [shape] | 4 | 1 | navigation |  |
| сырой #666974 [text] | 4 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Regular 16/22 | 4 | 1 | navigation |  |
| сырой эффект: drop 0,1.5384615659713745 r4.615385055541992 s0 #000000@0.10 | 4 | 1 | navigation |  |
| сырой эффект: drop 0,9.422256469726562 r28.266769409179688 s0 #000000@0.10 | 4 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Medium 25.911205291748047/32.97789764404297 | 4 | 1 | navigation |  |
| сырой эффект: drop 0,9.420839309692383 r28.26251792907715 s0 #000000@0.10 | 4 | 1 | navigation |  |
| [TX Body/tx body regular--ml] — нет в маппинге | 4 | 2 | navigation, show-my-location | I5374:804805;4502:20761;4522:18967;4482:7422 |
| {Theme:controls/text icon/accent/default} [text] — нет в маппинге | 4 | 3 | navigation, where-migration, where | I5374:630774;924:18646;5121:103262;1404:25924;92019:15344;92254:28899;92019:14506 I5374:429115;924:18646;5121:103262;1404:25924;92019:15344;92254:28899;92019:14506 |
| {Color:tx-accent/green/fg} [text] — нет в маппинге | 4 | 2 | navigation, show-my-location | 5374:804705 |
| [Text [day]/Success] [frame] — нет в маппинге | 4 | 4 | navigation, permissions, where-migration … | 5374:1020484 5374:627373 5374:425714 |
| {Theme TX:tx-bg/level −1 muted} [stroke] — нет правила | 4 | 1 | order-flow | 5374:918722 |
| {Theme TX:tx-accent/grey/primary-Inverted} [text] — нет в маппинге | 4 | 1 | order-flow | 5374:918729 |
| шрифт без стиля: SF Pro Display Light 68/48 | 4 | 2 | order-flow, show-my-location | I5374:909292;69:109;5374:931015 I5374:808614;69:109;5374:820886 |
| сырой эффект: drop 0,2 r8 s0 #000518@0.10 | 4 | 2 | permissions, taxi | 5374:1021105 5374:895878 |
| [Background [day]/Constant White Secondary] [frame] — нет в маппинге | 4 | 1 | profile | 5374:538381 |
| шрифт без стиля: WB Sans Medium 16/110.00000238418579 | 4 | 1 | profile | 5374:538868 |
| сырой #7e01fb [shape] | 4 | 1 | profile | 5374:539075 |
| сырой #727272@0.60 [frame] | 4 | 1 | profile | 5374:539222 |
| сырой #f3f3f5 [frame] | 4 | 1 | profile | 5374:539297 |
| [Gray Scale/Gray 200] [shape] — нет в маппинге | 4 | 1 | profile | 5374:539302 |
| шрифт без стиля: ALS Hauss VF Regular 10/auto | 4 | 1 | profile | 5374:539305 |
| [Gray Scale/Gray 100] [frame] — нет в маппинге | 4 | 1 | profile | 5374:539322 |
| шрифт без стиля: ALS Hauss VF Regular 12/12 | 4 | 1 | profile | 5374:539328 |
| шрифт без стиля: SF Pro Text Regular 13.550710678100586/18.06761360168457 | 4 | 1 | profile | I5374:541810;2868:6251;1187:31 |
| сырой #ffe1ff [frame] | 4 | 2 | profile, show-my-location | I5374:541799;400:18443 I5374:803406;400:18443 |
| [accent yellow] [frame] — нет в маппинге | 4 | 2 | profile, show-my-location | I5374:541799;400:18443;40006303:62373 I5374:803406;400:18443;40006303:62373 |
| [pure black] [frame] — нет в маппинге | 4 | 2 | profile, show-my-location | I5374:541799;400:18443;40006303:62359 I5374:803406;400:18443;40006303:62359 |
| сырой эффект: drop 0,-6 r64 s0 #ffffff | 4 | 1 | show-my-location | I5374:804228;2900:9478 |
| сырой #ccced9 [shape] | 4 | 1 | show-my-location | I5374:804228;2898:10365;2898:9750;2304:28367;2304:27489;2055:65042 |
| {Theme TX:tx-accent/orange/tint} [shape] — нет в маппинге | 4 | 1 | show-my-location | I5374:804228;2781:9145;4210:29698;2690:6562;2715:2324 |
| сырой эффект: drop 0,-6 r30 s0 #267366@0.10 | 4 | 1 | show-my-location | I5374:804278;2328:7237 |
| {Theme TX:tx-button/blurring/solid/content/defaultPrimary} [stroke] — нет в маппинге | 4 | 1 | show-my-location | I5374:804278;2328:7237;1212:2036;1126:14491 |
| сырой #b099bf [shape] | 4 | 1 | show-my-location | I5374:804278;2328:7237;1212:2036;1138:7297 |
| сырой #ff00ff@0.62 [shape] | 4 | 1 | show-my-location | I5374:804278;2229:48781;2229:19970;2223:2019 |
| сырой #ffb2ff [shape] | 4 | 1 | show-my-location | I5374:804278;2229:48781;2229:19970;2223:2021 |
| {Color:tx-bg/level 1 base} [text/text] — нет правила | 4 | 1 | show-my-location | 5374:804667 |
| сырой #ff4a33 [shape] | 4 | 1 | show-my-location | I5374:807971;3141:176311;208:11108;3072:146262 |
| сырой эффект: drop 0,4 r16 s0 #000000@0.06 | 4 | 1 | tariffs | 5374:564008 5374:564011 |
| шрифт без стиля: SF Pro Regular 15/20 | 4 | 2 | where-migration, where | I5374:625345;1149:64 I5374:423686;1149:64 |
| сырой #f5ffe0 [frame] | 4 | 2 | where-migration, where | 5374:626747 5374:425088 |
| сырой #ffffff@0.75 [shape] | 4 | 2 | where-migration, where | 5374:626901 5374:425242 |
| сырой #f9d9ff [frame] | 4 | 2 | where-migration, where | 5374:626905 5374:425246 |
| сырой #6a00ff [shape] | 4 | 2 | where-migration, where | 5374:626910 5374:425251 |
| сырой эффект: background_blur + noise + drop 0,-4 r12 s0 #bf80ff@0.10 | 4 | 2 | where-migration, where | 5374:626923 5374:425264 |
| сырой #eb80ff [shape] | 4 | 2 | where-migration, where | 5374:626957 5374:425298 |
| [Icon [night]/Tertiary] [shape] — нет в маппинге | 4 | 2 | where-migration, where | I5374:628986;1243:7465;597:0 I5374:427327;1243:7465;597:0 |
| {Theme TX:tx-accent/red/tint} [frame] — нет в маппинге | 4 | 2 | where-migration, where | 5374:629676 5374:428017 |
| сырой эффект: drop 0,-4 r16 s0 #4a3654@0.20 | 4 | 2 | where-migration, where | I5374:630284;2132:7152 I5374:428625;2132:7152 |
| {Theme:button/❌buy/bg/default} [frame] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630284;2132:7171;127:166;126:195 I5374:428625;2132:7171;127:166;126:195 |
| шрифт без стиля: SF Pro Text Medium 15/20 | 4 | 2 | where-migration, where | 5374:630651 5374:428992 |
| {theme:overlay/fullScreen} [frame] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630770;686:41695;634:28346 I5374:429111;686:41695;634:28346 |
| {theme:icon/contraste} [text] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630770;686:41697;928:2624 I5374:429111;686:41697;928:2624 |
| шрифт без стиля: SF Pro Text Bold 17/auto | 4 | 2 | where-migration, where | I5374:630770;686:41697;928:2624 I5374:429111;686:41697;928:2624 |
| {Navigator Color:Exception} [frame] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;924:13271 I5374:429115;924:18645;626:29016;903:31344;924:13271 |
| эффект [Cards \| Shadow M] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;924:13271 I5374:429115;924:18645;626:29016;903:31344;924:13271 |
| {Navigator Color:Exception} [shape] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;924:13271;923:11623 I5374:429115;924:18645;626:29016;903:31344;924:13271;923:11623 |
| {theme:promo/secondary/content/neutralPrimary} [shape] — нет в маппинге | 4 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;903:31317;826:32594 I5374:429115;924:18645;626:29016;903:31344;903:31317;826:32594 |
| сырой #8526ff@0.12 [stroke] | 4 | 2 | where-migration, where | 5374:643813 5374:442154 |
| {Theme:bg/level 1 base} [stroke] — нет правила | 3 | 2 | geo-problems, show-my-location | I5374:886523;40001007:26289;5374:887199 I5374:804228;2781:11251;2781:11150;2781:9151;1454:26572 |
| сырой #000000@0.35 [shape] | 3 | 2 | illustrations, tariffs | 5374:721251 5374:564379 |
| сырой эффект: drop 0,0 r12 s0 #000000@0.20 | 3 | 2 | illustrations, tariffs | 5374:721252 5374:564380 |
| сырой эффект: drop 0,0 r34 s0 #000000@0.09 | 3 | 2 | illustrations, tariffs | 5374:721313 5374:564441 |
| сырой #ff7200 [stroke] | 3 | 2 | illustrations, tariffs | 5374:721341 5374:564469 |
| сырой эффект: drop 0,-2 r8 s0 #000000@0.08 | 3 | 2 | illustrations, tariffs | 5374:721489 5374:564617 |
| шрифт без стиля: SF Pro Text Semibold 17/auto | 3 | 2 | illustrations, tariffs | I5374:721509;647:1978;5374:727429;647:101968 I5374:564682;5374:564702;5374:564972;647:101968 |
| сырой #ff5227 [frame] | 3 | 1 | navigation |  |
| сырой #a73afe [frame] | 3 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 18/16 | 3 | 1 | navigation |  |
| сырой #242429 [frame] | 3 | 1 | navigation |  |
| сырой #00dd4b [frame] | 3 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 10/9 UPPER | 3 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 36/32 | 3 | 1 | navigation |  |
| сырой #e0e0e7 [frame] | 3 | 1 | navigation |  |
| сырой #00bf40 [shape] | 3 | 1 | navigation |  |
| [Title/title4] — нет в маппинге | 3 | 1 | navigation |  |
| сырой #23ad58 [frame] | 3 | 1 | navigation |  |
| [Action/actionAccentMono] — нет в маппинге | 3 | 1 | navigation |  |
| сырой эффект: drop 0,4 r24 s0 #10032b@0.12 | 3 | 1 | navigation |  |
| шрифт без стиля: WB Sans Logo Regular 16/14 | 3 | 1 | navigation |  |
| шрифт без стиля: WB Sans Logo Regular 11/14 | 3 | 1 | navigation |  |
| сырой эффект: drop 0,3.25 r19.5 s0 #10032b@0.07 | 3 | 1 | navigation |  |
| шрифт без стиля: Google Sans Bold 56/38 | 3 | 1 | navigation |  |
| шрифт без стиля: Inter Semi Bold 12/auto UPPER | 3 | 1 | navigation |  |
| сырой эффект: glass + drop 0,4 r12 s0 #000000@0.10 | 3 | 1 | navigation |  |
| шрифт без стиля: Google Sans Regular 13/14 | 3 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 40/auto | 3 | 1 | navigation |  |
| сырой #ffffff@0.57 [frame] | 3 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 40.03856658935547/56.5250358581543 | 3 | 1 | navigation |  |
| сырой эффект: drop 2,2 r2 s0 #c7c6c7@0.40 + drop 1,1 r0 s0 #c7c6c7@0.30 + inner_shadow | 3 | 1 | navigation |  |
| сырой эффект: drop 2,2 r2 s0 #ffffff@0.31 | 3 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w0.25) | 3 | 1 | navigation |  |
| сырой эффект: drop 2,2 r2 s0 #c7c6c7@0.40 + drop 1,1 r0 s0 #c7c6c7@0.30 | 3 | 1 | navigation |  |
| сырой эффект: drop 1,1 r1 s0 #ffffff + inner_shadow | 3 | 1 | navigation |  |
| сырой эффект: drop 0.5,0 r0 s0 #ffffff | 3 | 1 | navigation |  |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow + noise | 3 | 1 | navigation |  |
| сырой эффект: drop -1,4 r2 s0 #000000 + drop 1,4 r2 s0 #000000 | 3 | 1 | navigation |  |
| сырой эффект: layer_blur + drop -2,0 r6 s0 #ffffff | 3 | 1 | navigation |  |
| сырой #737373 [shape] | 3 | 1 | navigation |  |
| сырой эффект: drop 0,-1 r2 s0 #000000 | 3 | 1 | navigation |  |
| сырой эффект: drop 0,0.5 r1.5 s0 #cdcdcf + drop 0,-1 r2 s0 #000000 | 3 | 1 | navigation |  |
| сырой эффект: drop 0,1 r0 s0 #ffffff | 3 | 1 | navigation |  |
| сырой эффект: drop 1,0 r0 s0 #ffffff@0.25 | 3 | 1 | navigation |  |
| сырой эффект: drop 1,1 r1 s0 #ebebeb@0.30 + inner_shadow + layer_blur + noise | 3 | 1 | navigation |  |
| сырой #9933ff@0.10 [stroke] | 3 | 1 | navigation |  |
| сырой эффект: drop 1,1 r1 s0 #000000@0.30 + inner_shadow + inner_shadow + inner_shadow | 3 | 1 | navigation |  |
| сырой #ffffff@0.20 [frame] | 3 | 2 | navigation, profile | 5374:539234 |
| {Theme:text icon/quaternary} [shape] — нет в маппинге | 3 | 2 | navigation, order-flow | 5374:918716 |
| {Color:tx-accent/green/fg} [shape] — нет в маппинге | 3 | 2 | navigation, order-flow | I5374:918350;40001108:25773;5374:934421;115:5510 |
| сырой #454545 [frame] | 3 | 2 | navigation, test | 5374:1032651 |
| сырой #0f0f1f@0.54 [text] | 3 | 3 | navigation, where-migration, where | I5374:628540;1149:10 I5374:426881;1149:10 |
| сырой эффект: drop 0,1 r6 s0 #0d0c24@0.18 | 3 | 2 | navigation, profile | 5374:529224 |
| сырой эффект: drop 0,1 r9 s0 #000000@0.12 | 3 | 2 | navigation, profile | 5374:529227 |
| сырой #1d1d1e@0.87 [frame] | 3 | 1 | order-flow | 5871:190014 |
| сырой #8526ff@0.20 [shape] | 3 | 2 | order-flow, service-coverage | 5374:926089 5374:87437 |
| {Theme TX:tx-bg/overlay} [frame] — нет в маппинге | 3 | 1 | profile | 5374:528040 |
| шрифт без стиля: SF Pro Display Regular 14/16 | 3 | 1 | profile | 5374:529413 |
| сырой #003876 [frame] | 3 | 1 | profile | 5374:539069 |
| сырой #ff0093 [shape] | 3 | 1 | profile | 5374:539108 |
| сырой #ffffff@0.60 [stroke] | 3 | 1 | profile | 5374:539266 |
| [Brand Scale/Brand 900] [text] — нет в маппинге | 3 | 1 | profile | 5374:539367 |
| [Caption 2/Medium] — нет в маппинге | 3 | 1 | profile | 5374:539464 |
| [Primary/Black] [text] — нет в маппинге | 3 | 1 | profile | 5374:541795 |
| шрифт без стиля: SF Pro Text Semibold 15.357471466064453/21.681137084960938 | 3 | 1 | profile | I5374:541799;400:18444;242:17776 |
| шрифт без стиля: SF Pro Text Regular 12.647329330444336/14.45409107208252 | 3 | 1 | profile | I5374:541799;400:18444;242:17777 |
| {Theme TX:tx-accent/grey/secondary} [shape] — нет в маппинге | 3 | 2 | profile, show-my-location | I5374:541799;400:18436;1312:43830;256:650 I5374:803406;400:18436;1312:43830;256:650 |
| сырой #1c1c1c [shape] | 3 | 1 | service-coverage | 5374:86965 |
| {Color:tx-accent/red/fg} [frame/frame] — нет правила | 3 | 1 | show-my-location | 5374:803221 |
| {Color:tx-accent/green/fg-inverted} [frame] — нет в маппинге | 3 | 1 | show-my-location | 5374:803202 |
| {Theme:bg/accentLight} [shape] — нет в маппинге | 3 | 1 | show-my-location | I5374:804259;2314:4623;2296:2668 |
| {Theme:bg/accentLight} [text] — нет в маппинге | 3 | 1 | show-my-location | I5374:804259;2314:4624 |
| сырой #1d1d22 [frame] | 3 | 1 | show-my-location | 5374:804267 |
| {Gaps:SPx11}=44 paddingBottom — нет цели | 3 | 1 | show-my-location | I5374:804420;40006695:21044 |
| сырой эффект: drop 0,2 r12 s0 #ab01e0@0.05 + drop 2,2 r12 s0 #ab01e0@0.12 | 3 | 1 | tariffs | I5374:564637;5374:564702;5374:564954 |
| сырой #bf80ff [shape] | 2 | 1 | errors | I5374:358922;3075:5577 |
| сырой #9933ff [shape] | 2 | 1 | errors | I5374:358922;3075:5594 |
| [Text/textPrimary (day)] [text] — нет в маппинге | 2 | 2 | errors, illustrations | I5374:358835;97:15291 I5374:727399;97:15291 |
| {theme:filledArea/stroke/defaultON} [stroke] — нет в маппинге | 2 | 2 | errors, illustrations | I5374:358835;97:15293;3107:24019 I5374:727399;97:15293;3107:24019 |
| [.auto tint/auto] [shape] — нет в маппинге | 2 | 2 | errors, illustrations | I5374:358835;97:15295;7892:7436;7470:13531 I5374:727399;97:15295;7892:7436;7470:13531 |
| {theme:bg/level 2} [shape/shape] — нет правила | 2 | 2 | errors, illustrations | I5374:358846;3811:66084 I5374:727378;3811:66084 |
| {theme:stroke/secondary} [stroke] — нет в маппинге | 2 | 2 | errors, illustrations | I5374:358846;3811:110348 I5374:727378;3811:110348 |
| шрифт без стиля: SF Pro Display Bold 16/16 | 2 | 1 | illustrations | 5374:722445 |
| сырой #ffeadf [shape] | 2 | 1 | illustrations | 5374:722491 |
| сырой #e6f5f8 [shape] | 2 | 1 | illustrations | 5374:722497 |
| сырой #232324 [frame] | 2 | 1 | illustrations | 5374:722552 |
| сырой #453229 [shape] | 2 | 1 | illustrations | 5374:722563 |
| сырой #2d3739 [shape] | 2 | 1 | illustrations | 5374:722569 |
| [Backgrounds night/Overlay] [frame] — нет в маппинге | 2 | 1 | illustrations | 5374:722592 |
| [Texts night/Secondary] [text] — нет в маппинге | 2 | 1 | illustrations | 5374:722598 |
| [Buttons night/Primary] [shape] — нет в маппинге | 2 | 1 | illustrations | I5374:722599;5254:499;5254:269 |
| сырой #656b85@0.06 [shape] | 2 | 1 | illustrations | 5374:722613 |
| [Button [day]/Secondary] [shape/shape] — нет правила | 2 | 1 | illustrations | 5374:722625 |
| [Pastel [day]/Frog] [frame] — нет в маппинге | 2 | 1 | illustrations | 5374:722630 |
| [Stroke [night]/Opposite] [stroke] — нет в маппинге | 2 | 1 | illustrations | 5374:722683 |
| [Stroke [night]/Disabled] [stroke] — нет в маппинге | 2 | 1 | illustrations | I5374:722769;1843:8261 |
| [Pastel [night]/Lenny] [frame] — нет в маппинге | 2 | 1 | illustrations | 5374:722773 |
| [Pastel [night]/Jasper] [frame] — нет в маппинге | 2 | 1 | illustrations | 5374:722774 |
| [Pastel [night]/Moe] [frame] — нет в маппинге | 2 | 1 | illustrations | 5374:722775 |
| [Shadows [night]/Primary] [shape] — нет в маппинге | 2 | 1 | illustrations | 5374:722791 |
| сырой #0e131a@0.71 [shape] | 2 | 1 | illustrations | 5374:723482 |
| сырой #f8f4e6 [frame] | 2 | 1 | illustrations | 5374:723718 |
| сырой #e5f4fb [frame] | 2 | 1 | illustrations | 5374:723719 |
| сырой #e2d9ea [frame] | 2 | 1 | illustrations | 5374:723720 |
| сырой #d5dce2 [frame] | 2 | 1 | illustrations | 5374:723721 |
| сырой #443e3a [frame] | 2 | 1 | illustrations | 5374:723727 |
| сырой #3a444b [frame] | 2 | 1 | illustrations | 5374:723728 |
| сырой #392d39 [frame] | 2 | 1 | illustrations | 5374:723729 |
| сырой #343142 [frame] | 2 | 1 | illustrations | 5374:723730 |
| сырой #f8f4e6 [shape] | 2 | 1 | illustrations | 5374:723733 |
| сырой #e5f4fb [shape] | 2 | 1 | illustrations | 5374:723734 |
| сырой #e2d9ea [shape] | 2 | 1 | illustrations | 5374:723735 |
| сырой #d5dce2 [shape] | 2 | 1 | illustrations | 5374:723736 |
| сырой #443e3a [shape] | 2 | 1 | illustrations | 5374:723737 |
| сырой #3a444b [shape] | 2 | 1 | illustrations | 5374:723738 |
| сырой #343142 [shape] | 2 | 1 | illustrations | 5374:723740 |
| сырой эффект: drop 0,-4 r20 s0 #000000@0.12 + drop 0,-4 r4 s0 #000000@0.08 | 2 | 1 | illustrations | 5374:723927 |
| [Text [night]/Constant White] [shape] — нет в маппинге | 2 | 1 | illustrations | 5374:723932 |
| сырой #3d4340 [frame] | 2 | 1 | illustrations | 5374:723934 |
| сырой #34343d [frame] | 2 | 1 | illustrations | 5374:723935 |
| сырой #3b3838 [frame] | 2 | 1 | illustrations | 5374:723936 |
| сырой #2d2d38 [frame] | 2 | 1 | illustrations | 5374:723937 |
| сырой #363636 [frame] | 2 | 1 | illustrations | 5374:723938 |
| [Pastel [night]/Bart] [frame] — нет в маппинге | 2 | 1 | illustrations | 5374:723939 |
| сырой #808080 [frame] | 2 | 1 | navigation |  |
| сырой #4d4d4d [frame] | 2 | 1 | navigation |  |
| сырой #8f8d8e [shape] | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 24/17.967525482177734 | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 18.48000144958496/23.717134475708008 | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 24/26 | 2 | 1 | navigation |  |
| {Theme:controls/bg/neutralLight/default} [frame] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #9200ff [text] | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold 15/18 | 2 | 1 | navigation |  |
| сырой #059400 [shape] | 2 | 1 | navigation |  |
| сырой #059400 [stroke] | 2 | 1 | navigation |  |
| [wbWallet/bgLvl4] [frame] — нет в маппинге | 2 | 1 | navigation |  |
| {Скругления:CRx10}=40 bottomLeftRadius — нет цели | 2 | 1 | navigation |  |
| {Скругления:CRx10}=40 bottomRightRadius — нет цели | 2 | 1 | navigation |  |
| [Title/title4 — crocodile] — нет в маппинге | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Regular Italic 66/auto | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Bold Italic 16/auto | 2 | 1 | navigation |  |
| сырой #803fce [shape] | 2 | 1 | navigation |  |
| сырой #efe3fd [frame] | 2 | 1 | navigation |  |
| сырой #cd90ff@0.24 [shape] | 2 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 28/14 | 2 | 1 | navigation |  |
| {theme:button/inline/whiteConst/default} [text] — нет в маппинге | 2 | 1 | navigation |  |
| {theme:button/inline/whiteConst/default} [shape] — нет в маппинге | 2 | 1 | navigation |  |
| {Theme:controls/text icon/secondary/default} [text] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #2b50bc [frame] | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 10/9 | 2 | 1 | navigation |  |
| сырой #499d98 [frame] | 2 | 1 | navigation |  |
| сырой #c8fddb [text] | 2 | 1 | navigation |  |
| {Theme:bg/level 1 Inverted} [frame] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #040404 [shape] | 2 | 1 | navigation |  |
| сырой #8f1efe [shape] | 2 | 1 | navigation |  |
| сырой #cc99ff [shape] | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 13/13 | 2 | 1 | navigation |  |
| сырой #8000ff [shape] | 2 | 1 | navigation |  |
| шрифт без стиля: WB Sans Regular 18/25.5 | 2 | 1 | navigation |  |
| сырой #0e0b19 [frame] | 2 | 1 | navigation |  |
| эффект [Shadow M] — нет в маппинге | 2 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w2.6666667461395264) | 2 | 1 | navigation |  |
| сырой #3d0d80 [shape] | 2 | 1 | navigation |  |
| {Colors:Text-Icon/Primary-Inverted} [stroke] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Text-Icon/Success} [shape] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Text-Icon/Primary-Inverted} [text] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:BG/Danger} [frame] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Text-Icon/White} [text] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Text-Icon/Tertiary} [shape] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Text-Icon/Accent} [shape] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #0a0910 [shape] | 2 | 1 | navigation |  |
| сырой эффект: drop 0,4.92307710647583 r29.538463592529297 s0 #10032b@0.12 | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 19.69230842590332/19.69230842590332 | 2 | 1 | navigation |  |
| сырой #f6f6f9 [shape] | 2 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Black 15/7.5 | 2 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Black 8.75/7.5 | 2 | 1 | navigation |  |
| сырой эффект: drop 0,0.625 r0.625 s0 #b82c00@0.25 | 2 | 1 | navigation |  |
| шрифт без стиля: Mabry Pro Black 12.5/80.0000011920929 UPPER | 2 | 1 | navigation |  |
| сырой #ff0000@0.50 [frame] | 2 | 1 | navigation |  |
| сырой #dbcaff [frame] | 2 | 1 | navigation |  |
| сырой эффект: drop 0,5 r15 s-2.5 #18274b@0.08 + drop 0,3.75 r7.5 s-3.75 #18274b@0.12 | 2 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Black 9.375/10.625 UPPER | 2 | 1 | navigation |  |
| шрифт без стиля: Factor A TRIAL Black 15/14 + Factor A TRIAL Bold 15/14 | 2 | 1 | navigation |  |
| сырой #9a1aff [text] | 2 | 1 | navigation |  |
| сырой #000000@0.08 [frame] | 2 | 1 | navigation |  |
| сырой #ffffff@0.75 [text] | 2 | 1 | navigation |  |
| #000000 → Route/Primary [stroke] — не w4 (w1.1666667461395264) | 2 | 1 | navigation |  |
| сырой эффект: background_blur + inner_shadow | 2 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Black 11/11 UPPER | 2 | 1 | navigation |  |
| сырой #8f8fa3 [stroke] | 2 | 1 | navigation |  |
| шрифт без стиля: Inter Bold 32/auto | 2 | 1 | navigation |  |
| [Texts day/Primary] [text] — нет в маппинге | 2 | 1 | navigation |  |
| {Kit:Subcomponent Fill} [shape] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Labels - Vibrant - Controls/Secondary} [text] — нет в маппинге | 2 | 1 | navigation |  |
| {Colors:Accents/Blue} [text] — нет в маппинге | 2 | 1 | navigation |  |
| {Color:tx-accent/orange/alt} [shape] — нет в маппинге | 2 | 1 | navigation |  |
| {Color:tx-accent/orange/alt} [text] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #f3f2f4 [frame] | 2 | 1 | navigation |  |
| сырой #333333 [frame] | 2 | 1 | navigation |  |
| сырой #ffd54f [frame] | 2 | 1 | navigation |  |
| сырой #ffca28 [stroke] | 2 | 1 | navigation |  |
| сырой #ff8a65 [frame] | 2 | 1 | navigation |  |
| сырой #f4511e [stroke] | 2 | 1 | navigation |  |
| сырой #8e8e93 [shape] | 2 | 1 | navigation |  |
| сырой #c7c7cc [shape] | 2 | 1 | navigation |  |
| сырой #f3e4d4 [frame] | 2 | 1 | navigation |  |
| сырой #19226d [shape] | 2 | 1 | navigation |  |
| сырой эффект: drop 0,2 r8 s0 #000000@0.15 | 2 | 1 | navigation |  |
| [Red] [shape] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #000518 [text] | 2 | 1 | navigation |  |
| сырой #f5f5f5@0.50 [frame] | 2 | 1 | navigation |  |
| шрифт без стиля: Google Sans Medium 15/18 | 2 | 1 | navigation |  |
| [Bodies/Body_1] — нет в маппинге | 2 | 1 | navigation |  |
| [Background [night]/Quaternary] [shape] — нет в маппинге | 2 | 1 | navigation |  |
| [Icon [day]/Constant White Secondary] [frame] — нет в маппинге | 2 | 1 | navigation |  |
| сырой #d9d9e0@0.50 [stroke] | 2 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 13/20 SMALL_CAPS_FORCED | 2 | 1 | navigation |  |
| сырой #4d4164 [frame] | 2 | 1 | navigation |  |
| сырой #ffffff@0.57 [stroke] | 2 | 1 | navigation |  |
| шрифт без стиля: WB Sans Medium 40.0385627746582/40.0385627746582 | 2 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 96/auto | 2 | 1 | navigation | 5374:250537 |
| [Text [day]/Secondary] [shape/shape] — нет правила | 2 | 2 | navigation, profile | I5374:541810;2868:6252;454:27 |
| [Icon [day]/Disabled] [shape] — нет в маппинге | 2 | 2 | navigation, profile | I5374:541810;2868:6267;4049:25106;409:37 |
| сырой #7b61ff [stroke] | 2 | 2 | navigation, show-my-location | 5374:803124 |
| {Theme:checkbox/content/off/idle/default} [shape] — нет в маппинге | 2 | 1 | no-car | I5374:1041383;4811:52503;4811:52402;28292:561 |
| сырой #cacad1 [stroke] | 2 | 1 | order-flow | 5871:182808 |
| сырой #242429 [shape] | 2 | 1 | order-flow | 5374:918705 |
| {Theme TX:tx-accent/grey/light strong} [text] — нет в маппинге | 2 | 1 | order-flow | 5374:918723 |
| шрифт без стиля: SF Pro Text Semibold 66/20 | 2 | 1 | order-flow | 5374:919283 |
| сырой #9dff00@0.20 [shape] | 2 | 1 | order-flow | 5374:926088 |
| {System Colors:Overlays/Default} [frame] — нет в маппинге | 2 | 1 | permissions | 5374:1020835 |
| [Accent/Title 2] — нет в маппинге | 2 | 1 | profile | 5374:527824 |
| [Accent/Title 3] — нет в маппинге | 2 | 1 | profile | 5374:527830 |
| [white] [shape] — нет в маппинге | 2 | 1 | profile | 5374:529464 |
| шрифт без стиля: WB Sans Bold 19.884681701660156/auto | 2 | 1 | profile | 5374:530207 |
| сырой #ff8139 [shape] | 2 | 1 | profile | 5374:533503 |
| [Day / Gray 14] [shape] — нет в маппинге | 2 | 1 | profile | 5374:538793 |
| сырой #f4e7ff [frame] | 2 | 1 | profile | 5374:539054 |
| шрифт без стиля: WB Sans Medium 44/44 | 2 | 1 | profile | 5374:539122 |
| {Theme:skeleton/forLevel1} [stroke] — нет правила | 2 | 1 | profile | 5374:539126 |
| [Body/bodyStrikethrough — zebra] — нет в маппинге | 2 | 1 | profile | 5374:539130 |
| {Theme:tabBar/bg} [frame] — нет в маппинге | 2 | 1 | profile | 5374:539214 |
| {Theme:bg/whiteConst} [text/text] — нет правила | 2 | 1 | profile | 5374:539227 |
| [B4 Regular] — нет в маппинге | 2 | 1 | profile | 5374:539280 |
| {Theme:bg/purpleLight} [frame] — нет в маппинге | 2 | 1 | profile | 5374:539496 |
| {Theme:progressBar/empty} [shape] — нет в маппинге | 2 | 1 | profile | 5374:539499 |
| сырой #b7d6ff [frame] | 2 | 1 | profile | 5374:539522 |
| сырой #ff18d2 [frame] | 2 | 1 | profile | 5374:539557 |
| {Theme:controls/bg/whiteConst/default} [frame] — нет в маппинге | 2 | 1 | profile | 5374:539563 |
| {Theme:controls/bg/gradient/pressed} [frame] — нет в маппинге | 2 | 1 | profile | 5374:539564 |
| сырой #ffffff@0.40 [frame] | 2 | 1 | profile | 5374:539565 |
| сырой #ff48c2 [stroke] | 2 | 1 | profile | 5374:539566 |
| эффект [Shadow/Top] — нет в маппинге | 2 | 1 | profile | 5374:539577 |
| сырой эффект: drop 0,0 r14.45409107208252 s0 #6c6680@0.16 | 2 | 1 | profile | I5374:541799;40000389:28998 |
| шрифт без стиля: WB Sans Bold 27.56230926513672/108.2064151763916 | 2 | 1 | profile | I5374:541799;400:18443;40006303:62360 |
| шрифт без стиля: WB Sans Bold 28.90818214416504/101.99999809265137 | 2 | 1 | profile | I5374:541799;400:18443;40006303:62377 |
| шрифт без стиля: WB Sans Bold 14.45409107208252/101.99999809265137 | 2 | 1 | profile | I5374:541799;400:18443;40006303:62381 |
| {Color:tx-accent/grey/tertiary} [stroke] — нет правила | 2 | 2 | profile, show-my-location | 5374:527826 I5374:803413;40001007:26289;5374:818386;427:15354;40001657:53879 |
| сырой #b8a1ff [stroke] | 2 | 1 | service-coverage | 5374:86353 |
| шрифт без стиля: Roboto Bold 32.25/43 | 2 | 1 | service-coverage | 5374:86739 |
| сырой #0e2623 [frame] | 2 | 1 | service-coverage | 5374:86961 |
| сырой #19221d [frame] | 2 | 1 | service-coverage | 5374:87693 |
| сырой #17171b [shape] | 2 | 1 | service-coverage | 5374:87697 |
| сырой #e6e6e6 [frame] | 2 | 2 | service-coverage, where-migration | 5374:86738 5374:625318 |
| сырой эффект: drop 0,1 r20 s0 #000000@0.05 | 2 | 1 | show-my-location | 5374:803309 |
| шрифт без стиля: WB Sans Medium 17/101.99999809265137 | 2 | 1 | show-my-location | I5374:803406;400:18443;40006303:62353 |
| шрифт без стиля: Inter Variable Medium 12/119.0000057220459 | 2 | 1 | show-my-location | I5374:803406;400:18443;40006303:62355 |
| шрифт без стиля: WB Sans Bold 30/108.2064151763916 | 2 | 1 | show-my-location | I5374:803406;400:18443;40006303:62374 |
| шрифт без стиля: WB Sans Bold 30.510181427001953/108.2064151763916 | 2 | 1 | show-my-location | I5374:803406;400:18443;40006303:62360 |
| шрифт без стиля: WB Sans Bold 32/101.99999809265137 | 2 | 1 | show-my-location | I5374:803406;400:18443;40006303:62377 |
| шрифт без стиля: WB Sans Bold 16/101.99999809265137 | 2 | 1 | show-my-location | I5374:803406;400:18443;40006303:62381 |
| шрифт без стиля: ALS Hauss VF Regular 44/44 | 2 | 1 | show-my-location | I5374:804228;2781:11251;2781:11150;2781:9155 |
| {theme:button/secondary/bg/default} [frame] — нет в маппинге | 2 | 1 | show-my-location | I5374:804228;2898:10365;2898:9750;2304:27941 |
| {theme:promo/secondary/content/neutralSecondary} [text] — нет в маппинге | 2 | 1 | show-my-location | I5374:804228;2898:10365;2898:9750;2304:27941;2304:27487 |
| эффект [Shadow Down V] — нет в маппинге | 2 | 1 | show-my-location | I5374:804228;2781:9144 |
| {theme:tx-regime/basic/secondary} [shape] — нет в маппинге | 2 | 1 | show-my-location | I5374:804228;2781:9145;4192:28390;2690:6562;2690:6588 |
| {theme:tx-regime/basic/primary} [shape] — нет в маппинге | 2 | 1 | show-my-location | I5374:804228;2781:9145;4192:28390;2690:6562;2690:6110;20726:1723 |
| {Theme TX:tx-accent/orange/bg} [text/text] — нет правила | 2 | 1 | show-my-location | I5374:804310;2328:2807;2229:15197;98:376;2229:21858 |
| {Color:tx-control/yellow/bg/idle} [frame/frame] — нет правила | 2 | 1 | show-my-location | I5374:804808;40004841:67361 |
| сырой эффект: drop 0,-2 r12 s0 #000000@0.06 | 2 | 1 | tariffs | 5374:563874 5374:564042 |
| сырой #4e4e60 [shape] | 2 | 1 | tariffs | 5374:563962 5374:564131 |
| [Vibrant Labels/Vibrant Secondary] [text] — нет в маппинге | 2 | 2 | taxi, test | I5374:897999;40004730:30961 I5374:1033436;40004730:30961 |
| шрифт без стиля: SF Pro Regular 13/20 | 2 | 2 | taxi, test | I5374:897999;40004730:30961 I5374:1033436;40004730:30961 |
| [Subheadline/Regular] — нет в маппинге | 2 | 2 | taxi, test | I5374:897999;40004730:30956 I5374:1033436;40004730:30956 |
| сырой #756d6d [frame] | 2 | 1 | test | 5374:1033440 |
| сырой #6a00ff [frame] | 2 | 2 | where-migration, where | 5374:627118 5374:425459 |
| сырой #ffe2e2 [frame] | 2 | 2 | where-migration, where | 5374:627194 5374:425535 |
| [Text [day]/Disabled] [shape] — нет в маппинге | 2 | 2 | where-migration, where | I5374:627332;1037:166;788:15 I5374:425673;1037:166;788:15 |
| [Background [night]/Primary] [stroke] — нет в маппинге | 2 | 2 | where-migration, where | 5374:628981 5374:427322 |
| сырой #202024@0.90 [shape] | 2 | 2 | where-migration, where | I5374:629006;1264:96 I5374:427347;1264:96 |
| сырой эффект: drop 0,4 r24 s0 #000000@0.26 + background_blur | 2 | 2 | where-migration, where | I5374:629006;1264:96 I5374:427347;1264:96 |
| сырой эффект: drop 0,6 r20 s0 #8526ff@0.12 + drop 0,6 r12 s0 #f126ff@0.04 + drop 0,-6 r20 s0 #8526ff@0.12 | 2 | 2 | where-migration, where | 5374:629295 5374:427636 |
| #000000 → Route/Primary [stroke] — не w4 (w3.5) | 2 | 2 | where-migration, where | I5374:629815;98:371;98:402;2217:2027 I5374:428156;98:371;98:402;2217:2027 |
| сырой #1f1d12 [shape] | 2 | 2 | where-migration, where | 5374:630098 5374:428439 |
| {Color:tx-control/neutral/bg/hover} [frame] — нет в маппинге | 2 | 2 | where-migration, where | 5374:630645 5374:428986 |
| {Padding:Map Botton padding}=68 paddingBottom — нет цели | 2 | 2 | where-migration, where | I5374:630770;686:41695 I5374:429111;686:41695 |
| {theme:bg/whiteConst} [frame] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630770;686:41696;727:47648 I5374:429111;686:41696;727:47648 |
| {.core:blueberry/670} [frame] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;923:11627 I5374:429115;924:18645;626:29016;903:31344;923:11627 |
| {.core:blueberry/670} [shape] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;923:11627;923:11611 I5374:429115;924:18645;626:29016;903:31344;923:11627;923:11611 |
| {theme:chips/primary/chevronIcon/disabled} [shape] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630774;924:18645;626:29016;903:31344;903:31318;897:31295 I5374:429115;924:18645;626:29016;903:31344;903:31318;897:31295 |
| {theme:notification/successPrimary} [stroke] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630774;924:18645;642:113324;642:131876 I5374:429115;924:18645;642:113324;642:131876 |
| {theme:text/primaryInverted} [text] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630774;924:18645;642:113324;642:131878 I5374:429115;924:18645;642:113324;642:131878 |
| {theme:notification/dangerPrimary} [frame] — нет в маппинге | 2 | 2 | where-migration, where | I5374:630774;924:18645;642:115972;653:34260 I5374:429115;924:18645;642:115972;653:34260 |
| сырой эффект: drop 0,4 r12 s0 #8526ff@0.06 + drop 0,4 r12 s0 #003dac@0.04 | 2 | 2 | where-migration, where | 5374:643813 5374:442154 |
| сырой #e4e4e7 [stroke] | 2 | 2 | where-migration, where | 5374:645258 5374:443599 |
| шрифт без стиля: SF Pro Display Medium 16/18 | 2 | 2 | where-migration, where | 5374:649096 5374:447437 |
| шрифт без стиля: SF Pro Display Semibold 18/20 | 2 | 2 | where-migration, where | 5374:649097 5374:447438 |
| {theme:button/primary/content/default} [text] — нет в маппинге | 1 | 1 | errors | I5374:359012;286:5729;286:5722;25:9630 |
| [Background [day] / Promo ] [shape] — нет в маппинге | 1 | 1 | geo-problems | 5374:885834 |
| эффект [Up / 1] — нет в маппинге | 1 | 1 | illustrations | 5374:724149 |
| {Color:Background/overlay} [shape] — нет в маппинге | 1 | 1 | illustrations | 5374:724151 |
| {Color:Background/fade} [frame] — нет в маппинге | 1 | 1 | illustrations | 5374:724152 |
| {Color:Pastel/Shame} [shape] — нет в маппинге | 1 | 1 | illustrations | 5374:724157 |
| {Color:Texts/primary 1} [text] — нет в маппинге | 1 | 1 | illustrations | 5374:724160 |
| [Headlines / Headline 6] — нет в маппинге | 1 | 1 | illustrations | 5374:724160 |
| {Color:Texts/secondary} [text] — нет в маппинге | 1 | 1 | illustrations | 5374:724161 |
| {Color:Buttons/primary} [frame] — нет в маппинге | 1 | 1 | illustrations | 5374:724163 |
| {Color:Texts/primary 2} [text] — нет в маппинге | 1 | 1 | illustrations | I5374:724163;927:5 |
| шрифт без стиля: Roboto Medium 18/24 | 1 | 1 | illustrations | I5374:724163;927:5 |
| {Color:Buttons/secondary} [frame] — нет в маппинге | 1 | 1 | illustrations | 5374:724164 |
| сырой #000000@0.15 [frame] | 1 | 1 | illustrations | 5374:724165 |
| шрифт без стиля: Roboto Medium 14/auto | 1 | 1 | illustrations | I5374:724165;9992:76 |
| шрифт без стиля: SF Pro Display Semibold 180/20 | 1 | 1 | illustrations | 5374:724188 |
| сырой #e2e2e9 [frame] | 1 | 1 | navigation |  |
| {Theme:stroke/whiteConst} [stroke] — нет в маппинге | 1 | 1 | navigation |  |
| {theme:promo/secondary/content/peach} [shape] — нет в маппинге | 1 | 1 | navigation |  |
| сырой #ffff89 [shape] | 1 | 1 | navigation |  |
| {Theme TX:tx-accent/green/fg} [stroke] — нет в маппинге | 1 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Medium 15/18 + ALS Hauss VF Regular 15/18 | 1 | 1 | navigation |  |
| сырой #ff7c7c [shape] | 1 | 1 | navigation |  |
| шрифт без стиля: WB-Font Regular 20.117647171020508/20.117647171020508 | 1 | 1 | navigation |  |
| сырой #a0a091@0.06 [shape] | 1 | 1 | navigation |  |
| шрифт без стиля: WB-Font Regular 19/19 | 1 | 1 | navigation |  |
| сырой #f3e5ff [shape] | 1 | 1 | navigation |  |
| сырой #f65570 [shape] | 1 | 1 | navigation |  |
| сырой #201b32 [stroke] | 1 | 1 | navigation |  |
| сырой #f9ed00 [text] | 1 | 1 | navigation |  |
| шрифт без стиля: Inter Bold 32/auto + Inter Regular 32/auto | 1 | 1 | navigation |  |
| сырой #0088ff [shape] | 1 | 1 | navigation |  |
| сырой #7a52ef [shape] | 1 | 1 | navigation |  |
| сырой #9292a2 [stroke] | 1 | 1 | navigation |  |
| сырой #0d0c24 [stroke] | 1 | 1 | navigation |  |
| {Theme:counterNotification/primary/bg} [frame] — нет в маппинге | 1 | 1 | navigation |  |
| сырой #717199 [text] | 1 | 1 | navigation |  |
| сырой #b506fd@0.50 [frame] | 1 | 1 | navigation |  |
| сырой #0011ff@0.60 [frame] | 1 | 1 | navigation |  |
| сырой #6b2cfe [shape] | 1 | 1 | navigation |  |
| сырой #c399ff [stroke] | 1 | 1 | navigation |  |
| [Icon [day]/Constant Black] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| сырой #202024 [frame] | 1 | 1 | navigation |  |
| сырой #d62347 [frame] | 1 | 1 | navigation |  |
| сырой #f0f0f0 [shape] | 1 | 1 | navigation |  |
| сырой #9dff00@0.12 [frame] | 1 | 1 | navigation |  |
| сырой #f9f9fb@0.85 [frame] | 1 | 1 | navigation |  |
| сырой #1c1c1e [text] | 1 | 1 | navigation |  |
| шрифт без стиля: Inter Bold 24/auto | 1 | 1 | navigation |  |
| шрифт без стиля: Inter Regular 14/auto | 1 | 1 | navigation |  |
| сырой #f2f2f5 [stroke] | 1 | 1 | navigation |  |
| шрифт без стиля: Google Sans Regular 24/26 | 1 | 1 | navigation |  |
| сырой #f5f5f5@0.20 [frame] | 1 | 1 | navigation |  |
| [Pastel [day]/Moe] [frame] — нет в маппинге | 1 | 1 | navigation |  |
| сырой эффект: drop 0,6 r14 s0 #000000@0.16 | 1 | 1 | navigation |  |
| [Pastel [day]/Moe] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| [Pastel [day]/Lisa] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| [Pastel [day]/Lenny] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| [Pastel [day]/Bart] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| [Pastel [day]/Joe] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| [Pastel [day]/Hans] [shape] — нет в маппинге | 1 | 1 | navigation |  |
| сырой #f5ede6 [shape] | 1 | 1 | navigation |  |
| шрифт без стиля: ALS Hauss VF Regular 15/18 | 1 | 1 | navigation |  |
| сырой #9e9ea4 [shape] | 1 | 1 | navigation |  |
| сырой #ededed [frame] | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Semibold 120/48 | 1 | 1 | navigation |  |
| сырой #949494 [stroke] | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 20/20 | 1 | 1 | navigation |  |
| сырой #ededf3 [shape] | 1 | 1 | navigation |  |
| сырой #ff9afd [stroke] | 1 | 1 | navigation |  |
| сырой #f5eff6 [shape] | 1 | 1 | navigation |  |
| сырой #4d4164 [shape] | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 226.73861694335938/264.52838134765625 | 1 | 1 | navigation |  |
| сырой эффект: drop 0,14.133384704589844 r47.11128234863281 s0 #000000@0.08 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 40.04458999633789/47.11128234863281 SMALL_CAPS_FORCED | 1 | 1 | navigation |  |
| сырой эффект: drop 0,2.3555641174316406 r0 s0 #ffffff@0.30 + inner_shadow | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Bold 44.75571823120117/54.177974700927734 | 1 | 1 | navigation |  |
| сырой эффект: drop 0,7.066692352294922 r11.777820587158203 s0 #000000@0.20 + drop 0,2.3555641174316406 r42.40015411376953 s0 #000000@0.08 + drop 0,14.133384704589844 r23.555641174316406 s0 #000000@0.14 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 35.33346176147461/47.11128234863281 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Semibold 51.822410583496094/65.95579528808594 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 35.33346176147461/47.11128234863281 | 1 | 1 | navigation |  |
| шрифт без стиля: Google Sans Regular 40.04458999633789/47.11128234863281 | 1 | 1 | navigation |  |
| сырой эффект: glass + inner_shadow + inner_shadow + inner_shadow + drop 0,18.844512939453125 r35.33346176147461 s0 #000000@0.02 + drop 0,0 r0 s1.1777820587158203 #e8e8e8 + drop -2.944455146789551,0 r0 s-1.7666730880737305 #d0d0d0 + drop 2.944455146789551,0 r0 s-1.7666730880737305 #d0d0d0 | 1 | 1 | navigation |  |
| сырой эффект: drop 0,14.131257057189941 r47.10419464111328 s0 #000000@0.08 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 40.0385627746582/47.10419464111328 SMALL_CAPS_FORCED | 1 | 1 | navigation |  |
| сырой эффект: drop 0,2.3552098274230957 r0 s0 #ffffff@0.30 + inner_shadow | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Bold 44.748985290527344/54.16982650756836 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Medium 25.90730857849121/32.972938537597656 | 1 | 1 | navigation |  |
| сырой эффект: drop 0,7.065628528594971 r11.77604866027832 s0 #000000@0.20 + drop 0,2.3552098274230957 r42.39377212524414 s0 #000000@0.08 + drop 0,14.131257057189941 r23.55209732055664 s0 #000000@0.14 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Semibold 35.328147888183594/47.10419464111328 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 28.262514114379883/32.972938537597656 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Display Semibold 51.81461715698242/65.94587707519531 | 1 | 1 | navigation |  |
| шрифт без стиля: SF Pro Text Regular 35.328147888183594/47.10419464111328 | 1 | 1 | navigation |  |
| шрифт без стиля: Google Sans Regular 40.0385627746582/47.10419464111328 | 1 | 1 | navigation |  |
| сырой эффект: drop 0,21.877090454101562 r15.91061019897461 s0 #000000@0.65 | 1 | 1 | navigation |  |
| сырой #766b94 [shape] | 1 | 1 | navigation |  |
| сырой #151515 [frame] | 1 | 1 | navigation |  |
| сырой #222222 [frame] | 1 | 1 | navigation | 5374:207973 |
| сырой #313131 [frame] | 1 | 1 | navigation | 5374:209837 |
| сырой #161519 [frame] | 1 | 1 | navigation | 5374:210433 |
| сырой #393939 [frame] | 1 | 1 | navigation | 5374:231913 |
| сырой #1e1d1d [frame] | 1 | 1 | navigation | 5374:235560 |
| {Color:tx-accent/green/fg} [stroke] — нет в маппинге | 1 | 1 | order-flow | I5374:918350;40001108:25773;5374:934421;115:5511 |
| сырой #8e8e95 [shape] | 1 | 1 | order-flow | 5374:918710 |
| сырой #c4c4d4 [shape] | 1 | 1 | order-flow | 5374:918713 |
| сырой #aeaeb2 [shape] | 1 | 1 | order-flow | 5374:918714 |
| сырой #e0e0eb [shape] | 1 | 1 | order-flow | 5374:918717 |
| сырой #d1d1d8 [shape] | 1 | 1 | order-flow | 5374:918718 |
| {Theme TX:tx-neutral/black const} [text] — нет в маппинге | 1 | 1 | order-flow | 5374:918721 |
| шрифт без стиля: Inter Bold 50/auto | 1 | 1 | order-flow | 5374:918721 |
| {Theme TX:tx-accent/grey/light const} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918725 |
| {Theme TX:tx-accent/grey/dark strong} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918728 |
| {Theme TX:tx-accent/grey/primary} [frame/frame] — нет правила | 1 | 1 | order-flow | 5374:918731 |
| {Theme TX:tx-accent/grey/primary-Inverted} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918734 |
| {Theme TX:tx-accent/grey/secondary} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918737 |
| {Theme TX:tx-accent/grey/tertiary} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918740 |
| {Theme TX:tx-accent/grey/quaternary} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918743 |
| {Theme TX:tx-accent/grey/light strong} [frame] — нет в маппинге | 1 | 1 | order-flow | 5374:918746 |
| сырой #f3f3f3 [shape] | 1 | 1 | order-flow | 5374:918845 |
| шрифт без стиля: SF Pro Display Semibold 88/48 | 1 | 1 | order-flow | 5374:918887 |
| [Bodies/Body 2 Reg] — нет в маппинге | 1 | 1 | order-flow | I5871:183135;40001007:26289;5871:183164 |
| сырой эффект: drop 0,6 r20 s0 #ffffff@0.04 | 1 | 1 | order-flow | 5374:921598 |
| сырой #03ff0b@0.05 [frame] | 1 | 1 | order-flow | 5374:922717 |
| сырой #9dff00@0.50 [stroke] | 1 | 1 | order-flow | 5374:922717 |
| сырой #26e2ff@0.20 [shape] | 1 | 1 | order-flow | 5374:926090 |
| сырой #5bdeff [stroke] | 1 | 1 | order-flow | 5374:926811 |
| сырой #261d28 [frame] | 1 | 1 | order-flow | 5871:190796 |
| сырой #f501fe@0.32 [frame] | 1 | 1 | order-flow | 5871:191392 |
| сырой #000000@0.87 [frame] | 1 | 1 | order-flow | 5374:926095 |
| {Color:tx-accent/grey/light const} [stroke] — нет правила | 1 | 1 | profile | 5374:527831 |
| сырой #e8e8e8 [frame] | 1 | 1 | profile | 5374:528037 |
| сырой #e9eaee [frame] | 1 | 1 | profile | 5374:528661 |
| {Theme:text icon/warning} [text] — нет в маппинге | 1 | 1 | profile | 5374:529567 |
| сырой #060606 [frame] | 1 | 1 | profile | 5374:533188 |
| шрифт без стиля: Google Sans Regular 13/17 | 1 | 1 | profile | I5374:536411;5374:541282 |
| [Captions/Caption CAP] — нет в маппинге | 1 | 1 | profile | 5374:538168 |
| [Symbol · Title/title1Regular] — нет в маппинге | 1 | 1 | profile | 5374:538231 |
| шрифт без стиля: WB Sans Bold 24/auto | 1 | 1 | profile | 5374:538297 |
| [Text [day]/Success] [shape] — нет в маппинге | 1 | 1 | profile | 5374:538387 |
| [Text [day]/Special] [shape] — нет в маппинге | 1 | 1 | profile | 5374:538390 |
| шрифт без стиля: WB Sans Bold 30/32 | 1 | 1 | profile | 5374:538393 |
| [Day / Gray 60] [stroke] — нет правила | 1 | 1 | profile | 5374:538802 |
| [Day / Gray 8] [stroke] — нет в маппинге | 1 | 1 | profile | 5374:538807 |
| шрифт без стиля: WB Sans Regular 26/auto | 1 | 1 | profile | 5374:538831 |
| сырой #fb29d9 [shape] | 1 | 1 | profile | 5374:538834 |
| сырой #ff00aa [shape] | 1 | 1 | profile | 5374:538835 |
| сырой #bf01ff [shape] | 1 | 1 | profile | 5374:538836 |
| сырой #909090 [shape] | 1 | 1 | profile | 5374:538839 |
| шрифт без стиля: WB Sans Bold 22/110.00000238418579 | 1 | 1 | profile | 5374:538851 |
| сырой #969696 [shape] | 1 | 1 | profile | 5374:538863 |
| сырой #ff6b15 [frame] | 1 | 1 | profile | 5374:539091 |
| сырой #ff8138 [frame] | 1 | 1 | profile | 5374:539093 |
| сырой #000000@0.32 [shape] | 1 | 1 | profile | 5374:539233 |
| [New/Pink] [stroke] — нет в маппинге | 1 | 1 | profile | 5374:539270 |
| [New/Purple] [frame] — нет в маппинге | 1 | 1 | profile | 5374:539271 |
| [New/Black] [text] — нет в маппинге | 1 | 1 | profile | 5374:539325 |
| сырой #fdfafa [shape] | 1 | 1 | profile | 5374:539461 |
| сырой эффект: drop 0,-3 r8 s0 #000000@0.04 | 1 | 1 | profile | 5374:539483 |
| сырой #fc4847 [frame] | 1 | 1 | profile | 5374:539484 |
| [New/White] [stroke] — нет в маппинге | 1 | 1 | profile | 5374:539486 |
| сырой #fc4847 [stroke] | 1 | 1 | profile | 5374:539487 |
| {Theme:controls/bg/neutralInvertedOpacity/default} [frame] — нет в маппинге | 1 | 1 | profile | 5374:539489 |
| шрифт без стиля: WB Sans Regular 24/28 | 1 | 1 | profile | 5374:539503 |
| {Corner Radius:CRx4}=16 topLeftRadius на TEXT — не ставим | 1 | 1 | profile | 5374:539503 |
| {Corner Radius:CRx4}=16 topRightRadius на TEXT — не ставим | 1 | 1 | profile | 5374:539503 |
| {Corner Radius:CRx4}=16 bottomLeftRadius на TEXT — не ставим | 1 | 1 | profile | 5374:539503 |
| {Corner Radius:CRx4}=16 bottomRightRadius на TEXT — не ставим | 1 | 1 | profile | 5374:539503 |
| {Theme:bg/accentSecondary} [shape] — нет в маппинге | 1 | 1 | profile | 5374:539515 |
| сырой #65a3f4 [shape] | 1 | 1 | profile | 5374:539523 |
| {Theme:controls/bg/accentLight/pressed} [frame] — нет в маппинге | 1 | 1 | profile | 5374:539530 |
| {Corner Radius:CRx10}=40 bottomLeftRadius — нет цели | 1 | 1 | profile | 5374:539557 |
| {Corner Radius:CRx10}=40 bottomRightRadius — нет цели | 1 | 1 | profile | 5374:539557 |
| {theme:notification/brandSecondary} [frame] — нет в маппинге | 1 | 1 | profile | 5374:539605 |
| шрифт без стиля: WB Sans Medium 90/auto | 1 | 1 | profile | 5374:541795 |
| сырой эффект: drop 0,0 r21.681137084960938 s0 #6c6680@0.24 | 1 | 1 | profile | I5374:541799;40000389:28998;40000385:8868 |
| шрифт без стиля: WB Sans Medium 21.681137084960938/100 | 1 | 1 | profile | I5374:541799;40000389:28998;40000385:8868;40006534:7701 |
| сырой эффект: drop 0,0.9033806920051575 r27.101421356201172 s0 #000000@0.12 + drop 0,5.420284271240234 r12.647329330444336 s0 #000000@0.16 | 1 | 1 | profile | I5374:541799;400:18432 |
| шрифт без стиля: SF Pro Regular 15.357471466064453/auto | 1 | 1 | profile | I5374:541799;400:18436;256:419 |
| шрифт без стиля: WB Sans Medium 15.357471466064453/101.99999809265137 | 1 | 1 | profile | I5374:541799;400:18443;40006303:62353 |
| шрифт без стиля: Inter Variable Medium 10.840568542480469/119.0000057220459 | 1 | 1 | profile | I5374:541799;400:18443;40006303:62355 |
| шрифт без стиля: WB Sans Bold 27.101421356201172/108.2064151763916 | 1 | 1 | profile | I5374:541799;400:18443;40006303:62374 |
| шрифт без стиля: SF Pro Semibold 15.357471466064453/110.00000238418579 | 1 | 1 | profile | I5374:541800;481:18332;481:18327;481:18321 |
| шрифт без стиля: WB Sans Medium 14.45409107208252/101.99999809265137 | 1 | 1 | profile | I5374:541800;481:18332;688:12891;40006303:62403 |
| шрифт без стиля: WB Sans Bold 23.114059448242188/108.2064151763916 | 1 | 1 | profile | I5374:541800;481:18332;688:12891;40006303:62385 |
| сырой эффект: drop 0,3.61352276802063 r10.840568542480469 s0 #000000@0.10 | 1 | 1 | profile | I5374:541810;2868:6211 |
| сырой эффект: drop 0,7.22704553604126 r32.521705627441406 s0 #000000@0.16 | 1 | 1 | profile | I5374:541810;2868:6219 |
| шрифт без стиля: SF Pro Text Medium 12.647329330444336/14.45409107208252 | 1 | 1 | profile | I5374:541810;2868:6220 |
| шрифт без стиля: SF Pro Text Regular 10.840568542480469/14.45409107208252 | 1 | 1 | profile | I5374:541810;2868:6221 |
| сырой эффект: drop 0,0.9033806920051575 r0 s0 #ffffff@0.30 + inner_shadow | 1 | 1 | profile | I5374:541810;2868:6224 |
| сырой эффект: drop 0,2.710142135620117 r4.516903400421143 s0 #000000@0.20 + drop 0,0.9033806920051575 r16.260852813720703 s0 #000000@0.08 + drop 0,5.420284271240234 r9.033806800842285 s0 #000000@0.14 | 1 | 1 | profile | I5374:541810;2868:6228 |
| шрифт без стиля: SF Pro Display Bold 27.101421356201172/28.90818214416504 | 1 | 1 | profile | I5374:541810;2868:6246 |
| шрифт без стиля: Golos Text Regular 26/auto | 1 | 1 | profile | 5374:541816 |
| шрифт без стиля: WB Sans Regular 30/auto | 1 | 1 | profile | 5374:541818 |
| сырой #5f5f5f [frame] | 1 | 1 | service-coverage | 5374:86233 |
| сырой #e7daf2 [shape] | 1 | 1 | service-coverage | 5374:86380 |
| сырой #b8a1ff [shape] | 1 | 1 | service-coverage | 5374:86650 |
| сырой #152410 [frame] | 1 | 1 | service-coverage | 5374:87658 |
| сырой #a69eda [shape] | 1 | 1 | service-coverage | 5374:88054 |
| {Theme TX:tx-danger/red/solid} [frame] — нет в маппинге | 1 | 1 | service-coverage | 5374:88994 |
| сырой #f33b2a [frame] | 1 | 1 | service-coverage | 5374:89016 |
| сырой #3b334d [frame] | 1 | 1 | service-coverage | 5374:89724 |
| сырой #b089ff [text] | 1 | 1 | service-coverage | 5374:89726 |
| сырой #6b49d0 [stroke] | 1 | 1 | service-coverage | 5374:89760 |
| сырой #60ff3c [stroke] | 1 | 1 | show-my-location | 5374:803092 |
| сырой #121212 [frame] | 1 | 1 | show-my-location | 5374:803263 |
| сырой #e1102e [shape] | 1 | 1 | show-my-location | 5374:803640 |
| шрифт без стиля: SF Pro Bold 20/22 | 1 | 1 | show-my-location | I5374:803664;9:2028 |
| [Android / Body] — нет в маппинге | 1 | 1 | show-my-location | I5374:804107;40000167:14176;40000167:14158 |
| шрифт без стиля: ALS Hauss VF Medium 24/32 | 1 | 1 | show-my-location | I5374:804228;2781:11251;2781:11150;2781:9157 |
| шрифт без стиля: ALS Hauss VF Medium 32/32 | 1 | 1 | show-my-location | I5374:804228;2781:11251;2781:11150;2781:9158 |
| шрифт без стиля: ALS Hauss VF Bold 24/32 + ALS Hauss VF Medium 24/32 | 1 | 1 | show-my-location | I5374:804228;2781:11251;2781:11150;2781:9160 |
| эффект [Shadow Up V] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2898:10365 |
| сырой эффект: drop 0,-6 r64 s0 #006aff | 1 | 1 | show-my-location | I5374:804228;2898:10365;2898:9747;237:848 |
| {Theme TX:tx-accent/purple/tint} [frame] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2898:10365;2898:9750;2304:27708 |
| {theme:tx-regime/home/primary} [shape] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2781:9145;4210:29698;2690:6562;2715:2326;2707:2316 |
| {Theme TX:tx-accent/blue/tint} [shape] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2781:9145;4210:31340;2690:6562;2715:2366 |
| {theme:tx-regime/errands/primary} [shape] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2781:9145;4210:31340;2690:6562;2715:2368;2036:4652 |
| {Theme TX:tx-accent/green/tint} [shape] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2781:9145;4210:31552;2690:6562;2715:2410 |
| {theme:tx-regime/around/primary} [shape] — нет в маппинге | 1 | 1 | show-my-location | I5374:804228;2781:9145;4210:31552;2690:6562;2715:2412;2116:3882 |
| сырой эффект: drop 0,-6 r64 s0 #00ff55 | 1 | 1 | show-my-location | I5374:804277;237:848 |
| сырой #000000@0.60 [shape] | 1 | 1 | show-my-location | 5374:804395 |
| сырой эффект: drop 0,-6 r64 s0 #00ffbb + drop 0,0 r48 s0 #00ff55 | 1 | 1 | show-my-location | I5374:804396;3605:101074;237:848 |
| шрифт без стиля: SF Pro Display Semibold 60/48 | 1 | 1 | show-my-location | 5374:806720 |
| [Icon [day]/Tertiary Opposite] [shape] — нет в маппинге | 1 | 1 | tariffs | 5374:564004 |
| шрифт без стиля: SF Pro Display Bold 22/28 | 1 | 1 | tariffs | 5374:564318 |
| сырой #fdf6ff [frame] | 1 | 1 | tariffs | I5374:564667;5374:564702;5374:564964 |
| сырой эффект: drop 0,2 r12 s0 #ab01e0@0.05 + drop 0,2 r12 s0 #ab01e0@0.05 + drop 2,2 r12 s0 #ab01e0@0.12 + drop 2,2 r12 s0 #ab01e0@0.12 | 1 | 1 | tariffs | I5374:564667;5374:564702;5374:564964 |
| {theme:bg/ashToCoal} [frame] — нет в маппинге | 1 | 1 | tariffs | 5374:564755 |
| сырой #d1d5db [frame] | 1 | 1 | taxi | 5374:895808 |
| сырой #787878 [frame] | 1 | 1 | taxi | 5374:898215 |
| {System Colors:Miscellaneous/_Kit Section Fill} [shape] — нет в маппинге | 1 | 1 | taxi | 5374:898258 |
| {System Colors:Miscellaneous/Alert, Menu, Action Sheet - Separators} [frame] — нет в маппинге | 1 | 1 | taxi | 5374:898310 |
| сырой #b174ff [stroke] | 1 | 1 | test | 5374:1032300 |
| [Field [night]/Primary] [frame] — нет в маппинге | 1 | 1 | where | I5374:427324;1122:541 |
| [Text day/Primary] [text] — нет в маппинге | 1 | 1 | where | I5374:447457;912:3;904:2 |
| сырой #faf1ff [frame] | 1 | 1 | where | 5374:448355 |
| сырой #e52817 [frame] | 1 | 1 | where | 5374:448366 |
