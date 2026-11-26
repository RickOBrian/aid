# Сводка прогонов (собрано scripts/report.mjs, руками не править)

## Решения дизайнера

Источник — `mappings/drafts-run/designer-decisions.json`. Комментарии Валентины Волченковой на Switch Audit 6058:94733, 12.11.2026; разбор — designer-review-2026-11-12.md. arturuxui 13.11: делаем всё как сказала дизайнер.
Пропущенные и решённые по строкам страницы в «Незаменённое» и итог «в работе» не входят; сделанные на них замены остаются.

| страница | статус | кто | решение |
|---|---|---|---|
| Backlog UI — Switched Styles | пропущена | дизайнер | Пропускаем секцию, она техническая |
| Errors — Switched Styles | пропущена | arturuxui | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| ✅ GEO Problems — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ Illustrations Request 💅🏻 — Switched Styles | пропущена | дизайнер | скипаем полностью страницу |
| ✅ Navigation 🧭 — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ No car — Switched Styles | пропущена | arturuxui | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| ✅ not work — Switched Styles | пропущена | arturuxui | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| Order Flow — Switched Styles | по строкам (дизайнер) | дизайнер | по строкам: всё «не трогать», кроме Text/Primary и Body 2 (сделано 13.11); SF Pro Display 90 Thin и WB Sans — шрифты заводятся отдельной задачей (Валентина 17.11) |
| ✅ Permissions — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ⌛️ Profile — Switched Styles | пропущена | arturuxui | arturuxui 13.11: «Profile, not work, No car, Errors — тоже пропускаем» (комментариев дизайнера не было) |
| ✅ Service coverage — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ Show my location — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ⌛️ Tariffs — Switched Styles | пропущена | дизайнер | Пропускаем секцию, её дизайн отложен |
| ✅ Taxi for friends — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| test — Switched Styles | пропущена | дизайнер | Пропускаем секцию |
| ✅ Where 🗺️ - Migration — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |
| ✅ Where 🗺️ — Switched Styles | пропущена | дизайнер | Стили уже переменены в файле dev. Что поменялось, хорошо, что нет — скипаем |

Не из 17 копий Drafts (в итог «17 копий» не входят):

- ✅ Permissions — Switched Styles — Файл New Rider DEV: копия «✅ Permissions — Switched Styles» 5167:7511 (задача arturuxui 20.11, правила Drafts HASH 1785929411)
- Pre-final for Style Switch — Секция «Pre-final for Style Switch» 6991:303670 на стр. «Order Flow » — правка на месте (Валентина 17.11)
- Макеты для примерки цветов и шрифтов — Switched Styles — Копия «Макеты для примерки цветов и шрифтов» 7151:54574 (задача arturuxui 18.11)

## Покрытие: состояние копий

Считается всё состояние копии, не замены прогона. Единица — заливка, обводка, шрифт, эффект на видимом узле.
Процент — покрыто / (покрыто + не покрыто). Вне счёта — логотипы, иллюстрации, пины, вставки маркетплейса, определены по именам приближённо.

| страница | заливки | обводки | шрифты | эффекты | всё | покрыто | не покрыто | вне счёта |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Backlog UI — Switched Styles · пропущена, дизайнер | 76 % | 36 % | 84 % | 61 % | **75 %** | 185 | 61 | 14 |
| Errors — Switched Styles · пропущена, arturuxui | 82 % | 18 % | 87 % | 81 % | **81 %** | 1 002 | 234 | 681 |
| ✅ GEO Problems — Switched Styles · пропущена, дизайнер | 92 % | 57 % | 100 % | 75 % | **92 %** | 936 | 83 | 74 |
| ✅ Illustrations Request 💅🏻 — Switched Styles · пропущена, дизайнер | 72 % | 14 % | 92 % | 51 % | **73 %** | 4 121 | 1 493 | 356 |
| ✅ Navigation 🧭 — Switched Styles · пропущена, дизайнер | 79 % | 27 % | 84 % | 59 % | **76 %** | 32 464 | 10 135 | 3 920 |
| ✅ No car — Switched Styles · пропущена, arturuxui | 73 % | 50 % | 81 % | 49 % | **72 %** | 689 | 274 | 26 |
| ✅ not work — Switched Styles · пропущена, arturuxui | 80 % | 67 % | 100 % | 88 % | **84 %** | 318 | 61 | 44 |
| Order Flow — Switched Styles · по строкам (дизайнер), дизайнер | 91 % | 83 % | 98 % | 75 % | **91 %** | 35 087 | 3 417 | 911 |
| ✅ Permissions — Switched Styles · пропущена, дизайнер | 87 % | 62 % | 96 % | 69 % | **86 %** | 1 020 | 162 | 112 |
| ⌛️ Profile — Switched Styles · пропущена, arturuxui | 76 % | 11 % | 72 % | 52 % | **70 %** | 5 187 | 2 275 | 64 |
| ✅ Service coverage — Switched Styles · пропущена, дизайнер | 98 % | 94 % | 100 % | 88 % | **98 %** | 2 543 | 61 | 442 |
| ✅ Show my location — Switched Styles · пропущена, дизайнер | 90 % | 82 % | 92 % | 78 % | **90 %** | 23 686 | 2 748 | 294 |
| ⌛️ Tariffs — Switched Styles · пропущена, дизайнер | 73 % | 13 % | 74 % | 43 % | **68 %** | 971 | 464 | 46 |
| ✅ Taxi for friends — Switched Styles · пропущена, дизайнер | 86 % | 38 % | 87 % | 70 % | **84 %** | 1 460 | 273 | 74 |
| test — Switched Styles · пропущена, дизайнер | 86 % | 64 % | 93 % | 76 % | **86 %** | 2 927 | 472 | 220 |
| ✅ Where 🗺️ - Migration — Switched Styles · пропущена, дизайнер | 88 % | 35 % | 93 % | 48 % | **84 %** | 17 949 | 3 393 | 2 230 |
| ✅ Where 🗺️ — Switched Styles · пропущена, дизайнер | 87 % | 38 % | 93 % | 48 % | **83 %** | 17 708 | 3 634 | 2 230 |
| **Итого, в работе** | — | — | — | — | **—** | 0 | 0 | 0 |
| Итого, все 17 | 85 % | 52 % | 91 % | 61 % | **84 %** | 148 253 | 29 240 | 11 738 |
| Pre-final for Style Switch · не из 17 | 90 % | 71 % | 98 % | 72 % | **90 %** | 18 896 | 2 153 | 549 |

### Не покрыто: кто закрыл

«Закрыто» — не покрыто на странице, которую пропустили или решили по строкам: менять её не будем, хотя подбор мог бы найтись.
Сюда же входит то, у чего нет токена: на закрытых страницах пробел в анкету не идёт.

| | значений | доля от «всё» |
|---|---:|---:|
| покрыто | 148 253 | 84 % |
| закрыто решением дизайнера | 26 396 | 15 % |
| закрыто решением arturuxui | 2 844 | 2 % |
| **открыто** (страницы в работе) | **0** | **0 %** |
| итого | 177 493 | 100 % |

Покрыто или закрыто решением: **100 %**.

## Замены и пропуски по прогонам

| страница | статус | копия | заменено | не заменено | последний прогон |
|---|---|---|---:|---:|---|
| Backlog UI — Switched Styles | пропущена | `5371:80571` | 58 | 218 | 2026-11-12 |
| 🔹 Components | в работе | `3577:55382` | 2 281 | 1 116 | 2026-11-26 |
| ✅ GEO Problems — Switched Styles | в работе | `4572:14630` | 0 | 289 | 2026-11-26 |
| ✅ Navigation 🧭 | в работе | `2001:68545` | 4 425 | 1 564 | 2026-11-26 |
| ✅ Permissions — Switched Styles | в работе · не из 17 | `5167:7511` | 699 | 281 | 2026-11-20 |
| ✅ Service coverage — Switched Styles | в работе | `4581:28557` | 0 | 286 | 2026-11-26 |
| Taxi Start Page | в работе | `2007:5985` | 252 | 44 | 2026-11-26 |
| test | в работе | `2319:13949` | 956 | 240 | 2026-11-26 |
| Errors — Switched Styles | пропущена | `5374:358551` | 195 | 1 564 | 2026-11-12 |
| ✅ GEO Problems — Switched Styles | пропущена | `5374:885750` | 154 | 356 | 2026-11-12 |
| ✅ Illustrations Request 💅🏻 — Switched Styles | пропущена | `5374:721192` | 1 123 | 3 159 | 2026-11-12 |
| ✅ Navigation 🧭 — Switched Styles | пропущена | `5374:207972` | 7 807 | 19 492 | 2026-11-12 |
| ✅ No car — Switched Styles | пропущена | `5374:1040241` | 242 | 632 | 2026-11-12 |
| ✅ not work — Switched Styles | пропущена | `5374:738087` | 18 | 251 | 2026-11-12 |
| Order Flow — Switched Styles | по строкам (дизайнер) | `5374:903468` | 21 257 | 5 837 | 2026-11-12 |
| ✅ Permissions — Switched Styles | пропущена | `5374:1019808` | 162 | 471 | 2026-11-12 |
| Pre-final for Style Switch | в работе · не из 17 | `6991:303670` | 11 687 | 3 359 | 2026-11-19 |
| Макеты для примерки цветов и шрифтов — Switched Styles | в работе · не из 17 | `7151:54574` | 2 214 | 1 556 | 2026-11-18 |
| ⌛️ Profile — Switched Styles | пропущена | `5374:527493` | 4 749 | 5 941 | 2026-11-12 |
| ✅ Service coverage — Switched Styles | пропущена | `5374:86156` | 398 | 792 | 2026-11-12 |
| ✅ Show my location — Switched Styles | пропущена | `5374:802548` | 6 112 | 4 324 | 2026-11-12 |
| ⌛️ Tariffs — Switched Styles | пропущена | `5374:563482` | 281 | 783 | 2026-11-12 |
| ✅ Taxi for friends — Switched Styles | пропущена | `5374:894051` | 269 | 826 | 2026-11-12 |
| test — Switched Styles | пропущена | `5374:1030847` | 617 | 1 018 | 2026-11-12 |
| ✅ Where 🗺️ - Migration — Switched Styles | пропущена | `5374:623349` | 2 839 | 6 517 | 2026-11-12 |
| ✅ Where 🗺️ — Switched Styles | пропущена | `5374:421690` | 2 958 | 6 827 | 2026-11-12 |
| **Итого, в работе** | | | **22 514** | **8 735** | |
| Итого, 17 копий | | | 57 153 | 62 547 | |
| — из них не заменено, закрыто решением дизайнера | | | | 50 620 | |
| — из них не заменено, закрыто решением arturuxui | | | | 8 388 | |
| — из них не заменено, открыто | | | | 3 539 | |

## Незаменённое по страницам в работе

| причина | кол-во | страниц | где | ID |
|---|---:|---:|---|---|
| сырой #c4c4c4 [shape] | 653 | 7 | dev-components, dev-geo-problems, dev-navigation … | I2247:21268;1248:7516 I2247:21268;1248:7522 I2247:21268;1248:7525 |
| сырой эффект: layer_blur | 389 | 7 | dev-components, dev-geo-problems, dev-navigation … | 2247:21050 2247:21064 2247:21080 |
| сырой #000000 [shape] | 375 | 7 | dev-components, dev-geo-problems, dev-navigation … | I2247:21061;991:56 2247:21065 I2247:21074;991:56 |
| [Background [day]/Secondary] [shape/shape] — нет правила | 242 | 7 | dev-components, dev-geo-problems, dev-navigation … | I3196:9916;1242:357 I3196:9917;1244:7534 I3196:9917;1244:7535;589:16 |
| сырой #ffffff [shape] | 178 | 5 | dev-components, dev-geo-problems, dev-navigation … | 2247:21109 3233:26881 3233:26887 |
| сырой эффект: background_blur | 174 | 6 | dev-components, dev-geo-problems, dev-navigation … | I3196:9892;1228:7439 I3196:9892;1228:7441 I3196:9892;1228:7463 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 162 | 7 | dev-components, dev-geo-problems, dev-navigation … | 2247:21051 2247:21065 2247:21081 |
| градиент [shape] | 146 | 5 | dev-components, dev-geo-problems, dev-navigation … | 3077:17932 I3196:11728;115:19 5262:26105 |
| сырой #242428 [text] | 124 | 4 | dev-components, dev-navigation, dev-test … | 2038:6608 2038:6618 2038:6622 |
| сырой #ffffff [text] | 95 | 5 | dev-components, dev-navigation, dev-taxi-start … | I3593:27654;1465:154027 2038:6747 2038:6751 |
| сырой #ff0000 [shape] | 81 | 2 | dev-geo-problems, dev-navigation | 4572:15338 4572:15339 4572:15343 |
| {Color:tx-accent/grey/primary} «Shadow» — пробел | 72 | 5 | dev-components, dev-navigation, dev-taxi-start … | 2247:21050 2247:21080 2247:21093 |
| сырой #ffffff [stroke] | 66 | 6 | dev-components, dev-geo-problems, dev-navigation … | I3196:9892;1228:7446 I3196:9927;1264:101 3233:26878 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.12 + drop 0,0 r1 s0 #000000@0.15 | 62 | 2 | dev-service-coverage, primerka-switched | 4581:28623 4581:28624 4581:28625 |
| градиент [stroke] | 57 | 2 | dev-components, primerka-switched | 3854:3852 3854:3861 3854:3870 |
| [Icons day/Secondary Pressed] → Icon/Secondary [stroke] — скоуп SHAPE_FILL | 57 | 6 | dev-components, dev-geo-problems, dev-navigation … | I3196:9892;1228:7452 I3196:9927;1264:107 I3196:11227;1228:7452 |
| сырой #8626ff [shape] | 55 | 6 | dev-components, dev-geo-problems, dev-navigation … | I3196:9892;1228:7445 I3196:9927;1264:100 3233:26886 |
| сырой #ffffff@0.05 [shape] | 54 | 6 | dev-components, dev-geo-problems, dev-navigation … | 3196:9898 3196:9899 3196:11233 |
| сырой #000000@0.08 [stroke] | 54 | 6 | dev-components, dev-geo-problems, dev-navigation … | 3196:9898 3196:9899 3196:11233 |
| шрифт без стиля: SF Pro Text Semibold 17/20 SMALL_CAPS_FORCED | 52 | 5 | dev-components, dev-navigation, dev-taxi-start … | 2288:22154 2038:6687 2288:22182 |
| сырой #d9d9d9 [shape] | 48 | 3 | dev-components, dev-service-coverage, primerka-switched | 5262:26213 5262:41895 5262:41916 |
| [Gradients/Fade Horizontal] [shape] — нет в маппинге | 48 | 3 | dev-components, dev-navigation, dev-test | 3077:17400 3077:17406 3077:17921 |
| градиент [frame] | 47 | 4 | dev-components, dev-geo-problems, dev-service-coverage … | I3196:11728;115:20 3854:3849 3854:3849 |
| сырой #1d364f [shape] | 45 | 2 | dev-geo-problems, dev-navigation | 4572:15316 4572:15317 4572:15318 |
| сырой #ffb800 [shape] | 45 | 2 | dev-geo-problems, dev-navigation | 4572:15316 4572:15317 4572:15318 |
| сырой #ffffff@0.90 [shape] | 44 | 4 | dev-components, dev-navigation, dev-test … | I3196:9892;1228:7440 I3196:9892;1228:7482 I3196:9892;1228:7464 |
| шрифт без стиля: Google Sans Regular 17/20 | 41 | 4 | dev-navigation, dev-taxi-start, dev-test … | 2038:7622 2038:7677 2038:7881 |
| [pure black] [text] — нет в маппинге | 40 | 1 | dev-components | I3854:4040;400:18443;40006303:62353 I3854:4040;400:18443;40006303:62355 I3854:4040;400:18443;40006303:62377 |
| [Bodies/Body Large] — нет в маппинге | 37 | 2 | dev-components, dev-navigation | 3854:3832 3854:3833 3854:3835 |
| TEXT смешанные заливки — оставлено | 36 | 3 | dev-geo-problems, dev-service-coverage, primerka-switched | I5133:159758;1093:24504;1093:24530 I5133:159768;1093:24504;1093:24530 I5133:159778;1093:24504;1093:24530 |
| шрифт без стиля: SF Pro Display Bold 34/40 | 31 | 1 | dev-components | 3076:21864 3076:21865 3076:21863 |
| {Color:tx-control/neutral/bg/idle} [shape/shape] — нет правила | 30 | 1 | dev-components | I3854:4040;400:18439;400:16501;353:1275 I3854:4040;400:18440;400:16501;353:1275 I3854:4040;400:18441;400:16501;353:1275 |
| сырой #7b2df5 [shape] | 28 | 1 | primerka-switched | I7151:57372;1228:7445 |
| сырой #ffffff@0.10 [shape] | 27 | 6 | dev-components, dev-geo-problems, dev-navigation … | 3196:9900 3196:11235 4572:14807 |
| сырой #000000@0.03 [stroke] | 27 | 6 | dev-components, dev-geo-problems, dev-navigation … | 3196:9900 3196:11235 4572:14807 |
| сырой эффект: drop 0,6 r20 s0 #000000@0.08 + background_blur | 26 | 6 | dev-components, dev-geo-problems, dev-navigation … | I3196:9927;1264:96 I3196:11262;1264:96 I4572:14834;1264:96 |
| шрифт без стиля: SF Pro Text Semibold 14/110.00000238418579 | 25 | 1 | dev-components | 3854:3962 3854:3963 3854:3965 |
| шрифт без стиля: SF Pro Text Regular 17/24 | 24 | 2 | dev-geo-problems, dev-navigation | I4572:15289;1187:96 I4572:15290;1187:30 I4572:15291;1187:96 |
| сырой #ffffff@0.25 [shape] | 24 | 3 | dev-geo-problems, dev-navigation, primerka-switched | 4572:15333 4572:15334 4572:15335 |
| сырой #ffffff@0.10 [stroke] | 23 | 6 | dev-components, dev-geo-problems, dev-navigation … | 3076:21866 3854:3827 5262:159647 |
| сырой #000000@0.12 [shape] | 21 | 3 | dev-navigation, dev-test, primerka-switched | 2038:7587 2038:7986 2038:8023 |
| сырой #ea3323 [shape] | 21 | 1 | primerka-switched | I7151:54629;349:4028;244:1424 |
| {Color:tx-control/purple/bg/idle} [shape/shape] — нет правила | 20 | 1 | dev-components | I3854:4040;400:18430;40006303:59184 I3854:4040;400:18430;40006303:59186 I3854:4043;400:18430;40006303:59184 |
| сырой #f5f5f5 [shape] | 20 | 2 | dev-navigation, dev-test | I2038:7990;1037:164 I2038:7990;1037:169 I2038:7992;3051:20208 |
| шрифт без стиля: Google Sans Medium 14/20 SMALL_CAPS_FORCED | 18 | 1 | dev-components | I3310:14305;45:733 I3310:14308;45:733 I3310:14310;45:733 |
| сырой #e7f5e9 [frame] | 17 | 1 | dev-components | 3310:14305 3310:14308 3310:14310 |
| сырой #2f7d31 [text] | 17 | 1 | dev-components | I3310:14305;45:733 I3310:14308;45:733 I3310:14310;45:733 |
| {theme:promo/primary/bg/neutralPrimary} [shape] — нет в маппинге | 17 | 1 | dev-components | 5262:41897 5262:41918 5262:41939 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 17 | 2 | dev-components, primerka-switched | 3233:26884 3233:26888 3233:26892 |
| {Color:tx-notifications/bg-success} [frame] — нет в маппинге | 16 | 1 | dev-components | 3854:3852 3854:3861 3854:3986 |
| сырой эффект: drop 3,4 r10 s0 #351516@0.08 + glass | 16 | 2 | dev-components, dev-service-coverage | 3854:3897 3854:3933 3854:3951 |
| сырой эффект: drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff + drop 0,0 r250 s0 #ffffff | 16 | 2 | dev-service-coverage, primerka-switched | 4581:28632 4581:28637 I4581:28777;2263:18395 |
| сырой #979797 [shape] | 16 | 1 | primerka-switched | 7151:56531 |
| сырой #ffffff@0.30 [shape] | 15 | 2 | dev-geo-problems, dev-navigation | 4572:15346 4572:15347 4572:15372 |
| шрифт без стиля: Inter Regular 14/20 | 15 | 2 | dev-geo-problems, primerka-switched | 4798:36675 4798:36678 7151:57052 |
| шрифт без стиля: Inter Regular 11/auto | 15 | 2 | dev-geo-problems, primerka-switched | 4798:36676 4798:36679 7151:57053 |
| {Color:tx-bg/level −1 muted} [shape/shape] — нет правила | 15 | 2 | dev-navigation, dev-test | I2038:7592;2038:8697;578:320 I2038:7745;578:320 I2038:7993;2038:8697;578:320 |
| сырой эффект: drop 3,4 r10 s0 #1c361b@0.08 + glass | 14 | 1 | dev-components | 3854:3852 3854:3986 3854:4025 |
| сырой эффект: drop 0,0 r20 s0 #9925fe@0.32 + drop 0,0 r4 s0 #9925fe@0.50 | 14 | 3 | dev-components, dev-navigation, dev-test | 2038:6604 5262:26070 5262:26096 |
| [Gradients/Shimmer] [frame] — нет в маппинге | 14 | 3 | dev-components, dev-navigation, dev-test | 2038:6783 2038:6785 I2038:7749;2038:6629;2038:6783 |
| [Day / White] [text/text] — нет правила | 14 | 1 | dev-navigation | I2038:6368;1991:8564;1746:8329 I2038:6369;2007:8683;1746:8327 I2038:6370;1991:8556;1746:8327 |
| {Color:tx-brand/green/green} [shape] — нет в маппинге | 13 | 2 | dev-components, dev-test | I3077:13173;40006534:14641;40006534:7699 I3854:4040;40000389:28998;40000385:8868;40006534:14641;40006534:7699 I3854:4043;40000389:28998;40000385:8868;40006534:14641;40006534:7699 |
| [Titles/Large Title] — нет в маппинге | 13 | 2 | dev-components, dev-navigation | 3077:13390 2038:8615 2038:8903 |
| сырой #8626ff@0.12 [shape] | 13 | 3 | dev-components, dev-geo-problems, dev-service-coverage | I3196:11728;115:15 I4572:14883;1074:135478 I4581:28567;1074:135478 |
| {Safe zones:safe-top}=62 paddingTop — нет цели | 12 | 1 | dev-components | 3854:4041 3854:4044 3854:4047 |
| шрифт без стиля: WB Sans Medium 24/100 | 12 | 2 | dev-components, dev-test | I3077:13173;40006534:7701 I3854:4040;40000389:28998;40000385:8868;40006534:7701 I3854:4043;40000389:28998;40000385:8868;40006534:7701 |
| шрифт без стиля: SF Pro Text Regular 12/16 | 12 | 5 | dev-components, dev-geo-problems, dev-navigation … | 3196:9905 3196:11240 4572:14812 |
| сырой #fefae5 [frame] | 12 | 1 | primerka-switched | 7151:57051 |
| {Color:tx-notifications/bg-error} [frame] — нет в маппинге | 11 | 1 | dev-components | 3854:3888 3854:3879 3854:3989 |
| {System:Magin Top}=54 paddingTop — нет цели | 11 | 2 | dev-components, dev-test | 3854:4040 3854:4043 3854:4046 |
| сырой #7b2df5@0.12 [shape] | 11 | 1 | primerka-switched | I7151:57677;1074:135478 |
| {Color:tx-brand/pink/idle} [shape] — нет в маппинге | 10 | 1 | dev-components | I3854:4040;400:18430;40006303:59187 I3854:4043;400:18430;40006303:59187 I3854:4046;400:18430;40006303:59187 |
| {Color:tx-brand/pink/blue/idle} [shape] — нет в маппинге | 10 | 1 | dev-components | I3854:4040;400:18430;40006303:59188 I3854:4043;400:18430;40006303:59188 I3854:4046;400:18430;40006303:59188 |
| сырой #ffe1ff [frame] | 10 | 1 | dev-components | I3854:4040;400:18443 I3854:4043;400:18443 I3854:4046;400:18443 |
| шрифт без стиля: WB Sans Medium 17/101.99999809265137 | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62353 I3854:4043;400:18443;40006303:62353 I3854:4046;400:18443;40006303:62353 |
| шрифт без стиля: Inter Variable Medium 12/119.0000057220459 | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62355 I3854:4043;400:18443;40006303:62355 I3854:4046;400:18443;40006303:62355 |
| [accent yellow] [frame] — нет в маппинге | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62373 I3854:4043;400:18443;40006303:62373 I3854:4046;400:18443;40006303:62373 |
| шрифт без стиля: WB Sans Bold 30/108.2064151763916 | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62374 I3854:4043;400:18443;40006303:62374 I3854:4046;400:18443;40006303:62374 |
| [pure black] [frame] — нет в маппинге | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62359 I3854:4043;400:18443;40006303:62359 I3854:4046;400:18443;40006303:62359 |
| шрифт без стиля: WB Sans Bold 30.510181427001953/108.2064151763916 | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62360 I3854:4043;400:18443;40006303:62360 I3854:4046;400:18443;40006303:62360 |
| шрифт без стиля: WB Sans Bold 32/101.99999809265137 | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62377 I3854:4043;400:18443;40006303:62377 I3854:4046;400:18443;40006303:62377 |
| шрифт без стиля: WB Sans Bold 16/101.99999809265137 | 10 | 1 | dev-components | I3854:4040;400:18443;40006303:62381 I3854:4043;400:18443;40006303:62381 I3854:4046;400:18443;40006303:62381 |
| шрифт без стиля: SF Pro Text Medium 12/auto | 10 | 2 | dev-components, primerka-switched | 3233:26882 3233:26898 3233:26495 |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 10 | 2 | dev-components, primerka-switched | 3233:26883 3233:26899 3233:26496 |
| сырой #d62247 [shape] | 10 | 2 | dev-geo-problems, dev-navigation | 4572:15359 4572:15360 4572:15506 |
| [Day / Gray 20] [shape] — нет в маппинге | 10 | 2 | dev-navigation, dev-test | I2038:7070;3:197;1937:2778 I2038:7071;3:197;1937:2778 I2038:7311;3:197;1937:2778 |
| эффект [/Input shadow] — нет в маппинге | 10 | 2 | dev-navigation, dev-test | I2038:7086;11:1235 I2038:7086;11:1852 I2038:7327;11:1235 |
| [Button [day]/Primary] [shape/shape] — нет правила | 10 | 2 | dev-navigation, dev-test | I2038:7088;1037:164 I2038:7088;1037:169 I2038:7329;1037:164 |
| сырой #f5f5f5 [frame] | 10 | 2 | dev-navigation, dev-test | I2038:7990;1037:165 I2038:7992;3051:20209 I2038:8025;1037:165 |
| шрифт без стиля: SF Pro Medium 16/16 | 10 | 1 | primerka-switched | 7151:56549 |
| сырой #9746ff [stroke] | 9 | 1 | dev-components | 2247:21039 2038:6781 2038:6667 |
| сырой #23354d [shape] | 9 | 1 | primerka-switched | 7151:56347 |
| сырой #f4bb40 [shape] | 9 | 1 | primerka-switched | 7151:56347 |
| текст со смешанными стилями — оставлено | 8 | 1 | dev-components | 3076:17678 3076:17720 3076:17763 |
| {Color:tx-notifications/bg-neutral} [frame] — нет в маппинге | 8 | 1 | dev-components | 3854:3906 3854:3915 3854:3933 |
| {Theme TX:tx-accent/grey/tertiary} [text] — нет в маппинге | 8 | 1 | dev-components | 3854:3973 3854:3976 3854:3979 |
| сырой #444444 [frame] | 8 | 3 | dev-components, dev-geo-problems, primerka-switched | 3076:21866 4572:14631 7151:54575 |
| [Captions/Caption CAP] — нет в маппинге | 8 | 1 | dev-navigation | I2052:8360;27:6701 2052:8730 2052:8985 |
| шрифт без стиля: WB Sans Bold 30/100 | 8 | 1 | primerka-switched | I7151:55867;3131:32917;3131:30431 |
| сырой #232326 [shape] | 8 | 1 | primerka-switched | I7151:56170;619:1373 |
| сырой #0f0f1e@0.90 [text] | 8 | 1 | primerka-switched | I7151:56689;1284:42181 |
| [Bg day/secondary] [frame] — нет в маппинге | 7 | 2 | dev-navigation, dev-test | 2038:7077 2038:7318 2038:7572 |
| [Buttons day/fab] [frame] — нет в маппинге | 7 | 2 | dev-navigation, dev-test | 2038:7080 2038:7321 2038:7575 |
| эффект [Shadow 2] — нет в маппинге | 7 | 2 | dev-navigation, dev-test | 2038:7080 2038:7321 2038:7575 |
| {Color:tx-accent/orange/fg} [shape] — нет в маппинге | 6 | 1 | dev-components | I3854:3935;984:21213 I3854:3944;984:21213 I3854:3953;984:21213 |
| {Theme TX:tx-accent/grey/secondary} [shape] — нет в маппинге | 6 | 1 | dev-components | I3854:4096;400:18436;1312:43830;256:650 I3854:4099;400:18436;1312:43830;256:650 I3854:4102;400:18436;1312:43830;256:650 |
| сырой эффект: drop 0,4 r20 s0 #000000@0.06 | 6 | 2 | dev-geo-problems, dev-navigation | 4572:15257 4572:15404 2038:6787 |
| сырой #10754e [shape] | 6 | 2 | dev-geo-problems, dev-navigation | I4572:15290;3872:24490;1562:500 I4572:15437;3872:24490;1562:500 I2038:6828;3872:24490;1562:500 |
| эффект [.blur tiny] — нет в маппинге | 6 | 2 | dev-geo-problems, primerka-switched | I4588:143492;349:4084;244:1423 I7151:54629;349:4028;244:1423 |
| сырой #3a3a3a [frame] | 6 | 2 | dev-navigation, dev-test | 2038:6034 2038:6786 2038:9169 |
| {Color:tx-bg/map} [frame] — нет в маппинге | 6 | 2 | dev-navigation, dev-test | I2038:8705;2038:6612 I2038:8902;2038:8705;2038:6612 I2038:9236;2038:8705;2038:6612 |
| сырой #000000 [frame] | 6 | 2 | dev-service-coverage, primerka-switched | 4581:28558 4581:28764 7151:54704 |
| {System Colors:Labels/Primary} [text] — нет в маппинге | 6 | 1 | primerka-switched | I7151:56157;2189:194705 |
| шрифт без стиля: SF Pro Regular 14/16 | 6 | 1 | primerka-switched | 7151:56510 |
| шрифт без стиля: Google Sans Bold 24/29 | 5 | 1 | dev-navigation | 2038:6107 2038:6589 2038:6591 |
| [Button day/Secondary] [shape] — нет в маппинге | 5 | 2 | dev-navigation, dev-test | I2038:7072;912:2;899:200 I2038:7313;912:2;899:200 I2038:7567;912:2;899:200 |
| [Day / Gray 14] [stroke] — нет в маппинге | 5 | 2 | dev-navigation, dev-test | I2038:7086;11:1235 I2038:7327;11:1235 I2038:7581;11:1235 |
| [Day / Gray 20] [stroke] — нет в маппинге | 5 | 2 | dev-navigation, dev-test | I2038:7086;11:1852 I2038:7327;11:1852 I2038:7581;11:1852 |
| [Day / Gray 4] [frame] — нет в маппинге | 5 | 2 | dev-navigation, dev-test | 2038:7087 2038:7328 2038:7582 |
| [Icon [day]/Primary] [text/text] — нет правила | 5 | 2 | dev-navigation, dev-test | I2038:7087;11:1823;11:1914 I2038:7328;11:1823;11:1914 I2038:7582;11:1823;11:1914 |
| сырой #23569a [shape] | 5 | 1 | primerka-switched | 7151:56590 |
| сырой эффект: drop 3,4 r10 s0 #7c3334@0.08 + background_blur | 4 | 1 | dev-components | 3854:3888 3854:3942 3854:3990 |
| [Background [day]/Attention] [shape/shape] — нет правила | 4 | 1 | dev-navigation | 2038:6804 2038:8039 2038:8344 |
| [Background [day]/Constant Dark Secondary] [shape/shape] — нет правила | 4 | 1 | dev-navigation | 2038:6835 2038:8070 2038:8375 |
| шрифт без стиля: WB Sans Bold 22/auto | 4 | 1 | primerka-switched | I7151:55867;3122:27197 |
| сырой #b1fcc0 [shape] | 4 | 1 | primerka-switched |  |
| сырой #5abd5f [shape] | 4 | 1 | primerka-switched |  |
| сырой #000000 [text] | 4 | 1 | primerka-switched | 7151:57053 |
| {System Colors:Miscellaneous/Alert, Menu, Action Sheet - Separators} [stroke] — нет в маппинге | 4 | 1 | primerka-switched |  |
| {System Colors:Colors/Blue} [text] — нет в маппинге | 4 | 1 | primerka-switched |  |
| сырой #cacacc [shape] | 4 | 1 | primerka-switched | 7151:56650 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 4 | 1 | primerka-switched | 7151:56527 |
| сырой #d8d8d8 [shape] | 4 | 1 | primerka-switched | 7151:56532 |
| сырой #979797 [stroke] | 4 | 1 | primerka-switched | 7151:56532 |
| сырой #ffffff@0.50 [text] | 3 | 1 | dev-components | I3593:27654;1465:154021 I3593:27654;1465:154023;2341:15816 I3593:27654;1465:154028 |
| сырой #4e4e60 [stroke] | 3 | 1 | dev-components | 3233:26879 3233:26492 3233:26619 |
| шрифт без стиля: SF Pro Text Regular 14/110.00000238418579 | 3 | 1 | dev-components | 3854:4001 3854:4004 3854:4007 |
| сырой #ffff00 [text] | 3 | 1 | dev-components | 3854:4055 3854:4080 3854:4093 |
| сырой #d3d3d9 [stroke] | 3 | 1 | dev-components | 5262:26031 I5262:159653;5262:26028 I5262:159653;5262:26031 |
| {Theme:switch/circle/off/default} [frame] — нет в маппинге | 3 | 1 | dev-components | 5262:187126 5262:187132 5262:187138 |
| {Theme:switch/circle/on/default} [frame] — нет в маппинге | 3 | 1 | dev-components | 5262:187129 5262:187135 5262:187141 |
| сырой #fe5f00 [shape] | 3 | 2 | dev-components, dev-test | I5262:159650;3072:124505 I5262:25914;1093:24503;3072:124505 I3032:24564;40006214:22340;40001478:11677;3032:24556;427:15332;427:17588 |
| сырой #ec001b [shape] | 3 | 2 | dev-components, dev-test | I5262:159650;3072:124506 I5262:25914;1093:24503;3072:124506 I3032:24564;40006214:22340;40001478:11677;3032:24556;427:15332;427:17589 |
| сырой #f79e1c [shape] | 3 | 2 | dev-components, dev-test | I5262:159650;3072:124507 I5262:25914;1093:24503;3072:124507 I3032:24564;40006214:22340;40001478:11677;3032:24556;427:15332;427:17590 |
| сырой эффект: inner_shadow | 3 | 1 | dev-service-coverage | I4581:28703;1067:131368 I4581:28717;1074:135196 I4581:28735;1067:131384 |
| {Color:tx-control/red/bg/pressed} [frame] — нет в маппинге | 2 | 1 | dev-components | 3076:21842 3076:21852 |
| сырой #e62818 [shape] | 2 | 1 | dev-components | 3077:13368 3359:14403 |
| сырой #f8faff@0.87 [text] | 2 | 1 | dev-components | I3593:27654;1465:154020 I3593:27654;1465:154023;2341:15815 |
| сырой #d9d9e1@0.50 [stroke] | 2 | 1 | dev-components | 2038:6596 2038:6600 |
| сырой #242428 [stroke] | 2 | 1 | dev-components | 2038:6617 2038:6637 |
| сырой эффект: glass + inner_shadow ×6 + drop 0,8 r15 s0 #000000@0.02 + drop 0,0 r0 s0.5 #e8e8e8 | 2 | 1 | dev-components | 2038:6734 2038:6740 |
| сырой #8626ff [frame] | 2 | 1 | dev-components | 2038:6746 2038:6750 |
| сырой эффект: drop 0,4 r4 s0 #000000@0.25 | 2 | 1 | dev-components | 3854:3849 3854:3983 |
| сырой эффект: drop 3,4 r10 s0 #203d1f@0.08 + background_blur | 2 | 1 | dev-components | 3854:3861 3854:3987 |
| сырой эффект: drop 3,4 r10 s0 #1c361b@0.08 | 2 | 1 | dev-components | 3854:3870 3854:3988 |
| сырой эффект: drop 3,4 r10 s0 #0f0f12@0.08 + glass | 2 | 1 | dev-components | 3854:3906 3854:3992 |
| сырой эффект: glass + drop 3,4 r10 s0 #0f0f12@0.08 | 2 | 1 | dev-components | 3854:3915 3854:3993 |
| сырой эффект: drop 3,4 r10 s0 #0f0f12@0.08 | 2 | 1 | dev-components | 3854:3924 3854:3994 |
| сырой #18181b [frame] | 2 | 1 | dev-components | 3854:4094 3854:4104 |
| сырой #99ffba [shape] | 2 | 1 | dev-components | 5262:26208 5262:26212 |
| сырой #1bc052 [shape] | 2 | 1 | dev-components | 5262:26215 5262:26217 |
| {Theme:switch/bg/off/disabled} [frame] — нет в маппинге | 2 | 1 | dev-components | 5262:187143 5262:187151 |
| {Theme:switch/circle/off/disabled} [frame] — нет в маппинге | 2 | 1 | dev-components | 5262:187144 5262:187152 |
| {Theme:switch/icon/off/disabled} [shape] — нет в маппинге | 2 | 1 | dev-components | I5262:187145;17780:26129;17769:25608;61794:337 I5262:187153;621:297 |
| {Theme:switch/bg/on/disabled} [frame] — нет в маппинге | 2 | 1 | dev-components | 5262:187147 5262:187155 |
| {Theme:switch/circle/on/disabled} [frame] — нет в маппинге | 2 | 1 | dev-components | 5262:187148 5262:187156 |
| {Theme:switch/icon/on/disabled} [shape] — нет в маппинге | 2 | 1 | dev-components | I5262:187149;17780:26129;17769:25608;61794:337 I5262:187157;621:297 |
| сырой #000000@0.05 [shape] | 2 | 1 | dev-geo-problems | 4572:15322 4572:15469 |
| сырой #25444f [shape] | 2 | 1 | dev-geo-problems | 4572:15357 4572:15504 |
| сырой #ff0c3e [shape] | 2 | 1 | dev-geo-problems | 4572:15358 4572:15505 |
| сырой #000000@0.10 [shape] | 2 | 1 | dev-geo-problems | 4572:15361 4572:15508 |
| сырой #000000@0.44 [shape] | 2 | 1 | dev-geo-problems | 4572:15362 4572:15509 |
| сырой #fffae3 [frame] | 2 | 1 | dev-geo-problems | 4798:36674 4798:36677 |
| сырой эффект: drop 0,0 r250 s0 #ffffff@0.50 + drop 0,0 r100 s0 #ffffff | 2 | 1 | dev-service-coverage | 4581:28636 4581:28787 |
| сырой #8a38f5 [stroke] | 1 | 1 | dev-components | 2247:21294 |
| сырой #e53828 [shape] | 1 | 1 | dev-components | 3077:13369 |
| сырой #3d4340 [frame] | 1 | 1 | dev-components | I3593:27654;1465:154018 |
| сырой #363636 [frame] | 1 | 1 | dev-components | I3593:27654;1465:154023 |
| сырой #34343d [frame] | 1 | 1 | dev-components | I3593:27654;1465:154024 |
| сырой #e62818 [frame] | 1 | 1 | dev-components | 3196:12237 |
| сырой #e3f2fd [frame] | 1 | 1 | dev-components | 3315:14324 |
| сырой #1664c0 [text] | 1 | 1 | dev-components | I3315:14324;45:724 |
| сырой #bf0120 [shape] | 1 | 1 | dev-components | 3359:14404 |
| сырой #e53727 [shape] | 1 | 1 | dev-components | 3359:14405 |
| сырой #ff4647 [shape] | 1 | 1 | dev-components | 3359:14406 |
| сырой #16161b [frame] | 1 | 1 | dev-components | 3589:27637 |
| сырой #16161a [frame] | 1 | 1 | dev-components | 3589:27640 |
| шрифт без стиля: Inter Regular 15/auto | 1 | 1 | dev-components | 2038:6622 |
| сырой #9dff00 [frame] | 1 | 1 | dev-components | 2038:6732 |
| сырой #ededed [frame] | 1 | 1 | dev-components | 2038:6778 |
| шрифт без стиля: SF Pro Display Semibold 60/110.00000238418579 | 1 | 1 | dev-components | 3854:3829 |
| шрифт без стиля: SF Pro Display Regular 22/110.00000238418579 | 1 | 1 | dev-components | 3854:3830 |
| сырой #ff00ff [text] | 1 | 1 | dev-components | 3854:4056 |
| сырой #ff00ff [stroke] | 1 | 1 | dev-components | 3854:4057 |
| сырой #656500@0.12 [frame] | 1 | 1 | dev-components | 3854:4079 |
| сырой #ffff00 [stroke] | 1 | 1 | dev-components | 3854:4079 |
| сырой #000000@0.20 [shape] | 1 | 1 | dev-components | 5262:26209 |
| сырой #002f0f [shape] | 1 | 1 | dev-components | 5262:26210 |
| сырой #024d2d [stroke] | 1 | 1 | dev-components | 5262:26214 |
| сырой #c4ffa6 [shape] | 1 | 1 | dev-components | 5262:26218 |
| сырой #004c2c [stroke] | 1 | 1 | dev-components | 5262:26219 |
| {Theme:text icon/transparent} [shape] — нет в маппинге | 1 | 1 | dev-components | 5262:187123 |
| сырой #a73afd [stroke] | 1 | 1 | dev-components | 5262:187123 |
| {Theme:switch/bg/off/default} [frame] — нет в маппинге | 1 | 1 | dev-components | 5262:187125 |
| {Theme:switch/bg/on/default} [frame] — нет в маппинге | 1 | 1 | dev-components | 5262:187128 |
| {Theme:switch/bg/off/hovered} [frame] — нет в маппинге | 1 | 1 | dev-components | 5262:187131 |
| {Theme:switch/bg/on/hovered} [frame] — нет в маппинге | 1 | 1 | dev-components | 5262:187134 |
| {Theme:switch/bg/off/pressed} [frame] — нет в маппинге | 1 | 1 | dev-components | 5262:187137 |
| {Theme:switch/bg/on/pressed} [frame] — нет в маппинге | 1 | 1 | dev-components | 5262:187140 |
| {Color:tx-accent/orange/tint} [frame] — нет в маппинге | 1 | 1 | dev-test | I2319:14017;2038:8707;2038:6612 |
| {Color:tx-control/orange/bg/hover} [text] — нет в маппинге | 1 | 1 | dev-test | I2319:14017;2038:8707;2038:6612;2038:6598 |
| {Color:tx-control/orange/bg/hover} [shape] — нет в маппинге | 1 | 1 | dev-test | I2319:14017;2038:8707;2038:6612;2038:6599;1448:345 |
| {Color:tx-bg/level 1 base} [stroke] — нет правила | 1 | 1 | dev-test | I3032:24564;40006214:22340;40001478:11677;3032:24532;40003372:84930 |
