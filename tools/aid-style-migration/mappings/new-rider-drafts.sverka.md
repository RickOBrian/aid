# New Rider Drafts — сверка кандидатов п.4–8 (2026-11-03)

Только чтение. Значения библиотеки — из файла токенов Rider `yrfG6u9osujKX8e1B14lpT`
(коллекции color-sem, typography-sem/core и текстовые стили совпадают по именам с
«AID Rider Tokens & Styles»); в Drafts ничего не импортировано. Образцы узлов — на копиях
Navigation, Order Flow, GEO Problems (ID ниже). ★ — предложение; до «да» arturuxui
ничего не ставится.

## Цвет

| # | Что в макете | Значение (день / ночь) | Образец | ★ Предложение |
|---|---|---|---|---|
| 4 | `{Color:tx-accent/grey/primary}` на обводке, 488 | #242429 / #efeff5 | 5374:214696 «Number» в Card; Arrow I5374:886523;…;5374:887200 | ★ `Stroke/Inverted` (#393944 / #d6d7dc) — та же полярность (тёмная днём, светлая ночью), чуть мягче. `Stroke/Contrast` (#fff / #0f0f1f) и `Stroke/Primary` (#e9eaee / #393944) — обратная полярность, не подходят |
| 4а | тот же токен на «Shadow» (VECTOR в Map Pin), 370 | — | I5374:214338;5374:243164 | оставить: пин карты, вне переноса |
| 7 | `[Texts day/primary 1]` [text], 239 | стиль заливки #000000@0.87, ночного значения нет | 5374:216615 (шторка, Tabs) | ★ `Text/Primary` (#0f0f1f@0.87 / #f8faff): днём визуально то же; ночью станет светлым — сейчас текст ночью остаётся чёрным |
| 8 | сырой #232326 [shape], 636 | — | Icon / Menu I5374:215567;1934:2684; Battery в iOS Status Bar I5374:215559;… | ★ `Icon/Primary` только если ближайший инстанс-предок — иконка (`Icon…`/`icon…`) и не Status Bar; Status Bar — вне переноса (iOS system) |
| 8 | сырой #242429 [text], 335 | = день tx-accent/grey/primary | I5374:209862;…;2268:59899 «Самокаты» (WB Sans) | ★ `Text/Primary` |
| 8 | сырой #000000@0.08 [stroke] + #ffffff@0.05 [shape], по 486 | — | 5374:215930 Ellipse в Pickup point (пин карты) | оставить: декор пина карты, вне переноса |

## Текстовые стили (п.5)

| Стиль в макете | Параметры | Стиль AID Rider | Итог |
|---|---|---|---|
| `[Titles/Title 1]` 396 | SF Pro Display Bold 34/40, ls 0.36 | Titles/Title 1 — то же | ★ заменить (полное совпадение) |
| `[Captions/Caption]` 401 | SF Pro Text Regular 12/16, ls 0 | Captions/Caption 1 — то же | ★ заменить (полное) |
| `[iOS / Subtitle L]` 242 | SF Pro Display Medium 18/20, ls 0 | Outstanding/iOS - Subtitle L — то же | ★ заменить (полное) |
| lion 563, description 386, puma 305, miniPig 559, chameleon 279 (+ Uppercace/… 84) | ALS Hauss VF: Medium 13/17; Regular 13/17; Medium 17/20; Medium 11/14 UPPER | семейства ALS Hauss в токенах нет; кеглей 13 нет | ★ оставить: стили маркетплейса WB в вставках (сниппеты, бейджи, TX List Item) |

## Шрифты без стиля (п.6)

| Шрифт | Кол-во | Стиль AID Rider | Итог |
|---|---:|---|---|
| SF Pro Text Regular 15/20, ls −0.26 | 289 | Bodies/Body 2 — то же | ★ заменить (полное) |
| SF Pro Text Semibold 15/20, ls −0.23 | 296 | Subtitles/Subtitle 2 (ls −0.26) | ★ заменить (отличие: трекинг −0.23 → −0.26) |
| SF Pro Text Semibold 12/13 | 816 | ближайший Caption 1 CAP 12/16 SMALL CAPS | оставить, пробел: интерлиньяж 13 → 16 ломает подписи в 2 строки (5374:903597 «Чат с поддержкой») |
| ALS Hauss VF (17/20, 13/17, 15/18, 11/14 …), Factor A TRIAL (10/11, 15/17 …) | ~1 900 | семейств нет | ★ оставить: вставки маркетплейса и рейтинги |
| WB Sans Logo 28/21, WB Sans 15.09/13.21 | 97 | — | оставить: логотип и масштабированный текст |

Шрифт с несколькими начертаниями в узле (ключ «… + …») скрипт не трогает.

### WB Sans — какие стили нужны (создание — отдельным предложением, не сейчас)

В typography-core есть `ff-wb-sans` (и `ff-wb-font`), стилей WB нет.

| Предлагаемый стиль | Параметры | Где | Кол-во | Не хватает токенов |
|---|---|---|---:|---|
| WB / Number L | WB Sans Medium 24/24, ls −2% | цифры в NavBar («28 300») | 344 | ls −2% (−0.48) |
| WB / Tab | WB Sans Regular 16/14 | подписи табов сервисов («магазин») | 264 | fs-16 |
| WB / Tile | WB Sans Regular 19/auto, ls 1%, lowercase | плитки сервисов («Самокаты») | 39 | fs-19, ls 1% |

## Что пойдёт в скрипт по «да»

- `C`/`setAll`: tx-accent/grey/primary [stroke] → Stroke/Inverted; `Texts day/primary 1` [text] → Text/Primary;
- `RAW`: #232326 [shape] в иконке → Icon/Primary; #242429 [text] → Text/Primary;
- `TS_MAP`: Titles/Title 1, Captions/Caption → Caption 1, iOS / Subtitle L → Outstanding/iOS - Subtitle L;
  без стиля: SF Pro Text Regular 15/20 → Body 2, Semibold 15/20 → Subtitle 2;
- затем повторный прогон копий по незаменённому вместе с BYVAL (радиусы 0/100/18, отступ 18).
