# Белый фон секций — проход по служебным страницам Persefona, Rider, Driver — 2026-10-28

Правило: `persefona-figma-pages` 0.13.0 §6.3 (коммит 04d06c4, PR #521): фон секции — `bg-surface-main`;
карточки (вид `IslandBlock`) — `bg-surface-main` + рамка `line-default`; `bg-surface-muted` — только панели и
области внутри карточки. Указание PD 2026-10-28: «Это коснется общих правил оформления, а не только этого пейджа».
Разрешение Standards · Persefona: один PR, всё разом, порядок Persefona → Rider → Driver; сначала список на приёмку.

Задача: часть перевода служебных страниц на Kit (AID-64, persefona-6, issue #422). Отдельный номер — если
Standards · Persefona попросит, запрошу у Ops. Куратор Rider и Driver — PD, согласие на правки есть.

**Шаг 1 (этот документ) — только чтение, в Figma ничего не менялось.** Шаг 2 — запись после «принято».

## 1. Как искали

Скрипт `changes/persefona/snapshots/section-bg/scan-sections.js` (только чтение, `use_figma`), по каждому файлу:

- секции верхнего уровня и вложенные — заливка и обводка (переменная Kit / сырой цвет);
- внутри секции: «карточка» — рамка с радиусом 8…99 и заливкой; нужна `bg-surface-main` + `line-default`;
  экземпляр `IslandBlock` — проверяется его корень; «область» — рамка без радиуса с заливкой не `bg-surface-main`
  вне карточки;
- не читаются: сцены (заливка на переменной продукта, картинка, имя `Stage`/`Scene`/`Clone`), мастера компонентов,
  внутренности экземпляров; пилюли с радиусом ≥ 100 (бейджи) — не карточки;
- страницы `---` и `Thumbnail` пропускаются.

Активные задачи — доска `docs/hub/BOARD.md` «Активные» на `origin/main` (6fcc09c) и метки в шапках `HeaderPage`.

## 2. Итог по файлам

| Файл | Секций проверено | Править (моё) | Чужие активные задачи | Чисто |
|---|---|---|---|---|
| Persefona Tokens `YDjPxFrW1yXqm9RzBGQXuc` | 13 | 7 секций | — | Colors, `👀 Colors · предложения`, 3 секции Archive |
| Persefona Components `X8DoqKC0SKfxb8SoKboo3N` | 11 | — | — | всё |
| Persefona Icons `dcccBNrHsTuROv7uUp3NGk` | 0 (Cover — экземпляр) | — | — | всё |
| Rider Tokens `yrfG6u9osujKX8e1B14lpT` | 14 | — | — | всё (#465/#466/#468) |
| Rider Components `79UryRdexwKAv8vDIV5v4v` | 35 (зона 3) | — | фон — 20 секций на 13 страницах, только обводка — ещё 4 | Spinner, Divider (фон) |
| Rider Icons `n6LppQbTv85yI29h6u30DI` | 2 | — (обводка — вопрос 2) | — | фон |
| New Rider DEV `5mg6h0oB8yRDoUfTruogca` | 4 (`🔍 PRD audit · Главная`) | — | — | всё (#523) |
| Driver Tokens `ouP1hUC4YjVRpfgdvzy3FA` | 2 секции + 4 рамки | 2 секции, 4 рамки, 13 карточек — вопрос 3 | — | `CHANGELOG` ×4 |
| Driver Icons `AwRpEGfyeNjRbZP8KGG1wy` | 2 | — (обводка — вопрос 2) | — | фон |
| Driver Components `o0IUYIS7vadbmXPXd81ql9` | 133 | **133 секции** на 12 страницах аудита | — | карточки: все 133 секции — экземпляры `IslandBlock`, уже `bg-surface-main` + `line-default` |

Карточек без `line-default` в переведённых страницах не найдено: все карточки вида `IslandBlock` уже по правилу.
Правка — почти целиком фон секций.

## 3. Список узлов — Persefona

| Файл · страница | Узел | Было | Стало |
|---|---|---|---|
| Tokens · `Space and Radius` 24:313 | секция 31:124 «Space and Radius» | сырой `#FFFFFF`, обводка `#000000` 10 % | `bg-surface-main`, обводка `line-default` (вопрос 2) |
| Tokens · `Typography` 24:459 | секция 31:186 «Typography» | то же | то же |
| Tokens · `Shadows` 24:614 | секция 31:225 «Shadows» | то же | то же |
| Tokens · `Archive` 7:22 | секция 31:334 «Art direction · proposals · 2026-10-23» | то же | то же |
| Tokens · `Archive` 7:22 | секция 43:74 «Driver Color Reference · 2026-10-23» | то же | то же |
| Tokens · `Archive` 7:22 | секция 31:42 «Colors Core · update · 2026-10-23» | то же | то же |
| Tokens · `Archive` 7:22 | секция 31:85 «Colors Semantic · update · 2026-10-23» | то же | то же |

Не трогаю внутри 31:334: карточки и бейджи там — образцы «было / стало» арт-директорского прохода
(«было» намеренно без переменных, `bg-inverse-main` — пример тоста). Это содержимое, не оболочка.

## 4. Список узлов — Rider

Rider Tokens, Rider Icons, New Rider DEV (`🔍 PRD audit · Главная`) — фон по правилу, править нечего.

Rider Components: все служебные страницы зоны 3 — страницы активных задач. **Сам не правлю**, список — для авторов.
Карточки внутри — по правилу; правка только фона секций.

| Страница | Секция | Было | Стало | Автор |
|---|---|---|---|---|
| `🚧 TabBar · construction` 389:47 | 679:4238 «TabBar» | `#FFFFFF` | `bg-surface-main` | AID-43 (designer-2), Designer · Components. Оболочку собирала я (persefona-2) — вопрос 4 |
| то же | 717:4180 «Changelog · TabBar» | `#FFFFFF` | `bg-surface-main` | то же |
| то же | 599:2797 «Аудит TabBar · для истории» | фон по правилу, обводка `#000000` 10 % | обводка — вопрос 2 | то же |
| `🚧 MapPin · construction` 1011:6451 | 1011:6452 «MapPin», 733:4548 «Аудит MapPin · для истории», 1021:10259 «Changelog · MapPin» | `#FFFFFF` | `bg-surface-main` | AID-55 (designer-3) |
| `👀 Button Floating · construction` 1076:5988 | 1076:6011 «Мастер · Button Floating», 1078:6467 «Button Floating», 1078:6787 «Changelog · Button Floating» | `#FFFFFF` | `bg-surface-main` | AID-70, Designer · 💠 FAB |
| `👀 Button Floating · audit` 897:3 | 897:38 | `#FFFFFF` | `bg-surface-main` | AID-70 |
| `👀 Map · construction` 1149:27989 | 1149:28005 «Мастер · Map», 1149:28376 «Map», 1149:28750 «Changelog · Map» | `#FFFFFF` | `bg-surface-main` | AID-71, Designer · AID-71 |
| `👀 Map · audit` 850:10549 | 852:94 | `#FFFFFF` | `bg-surface-main` | AID-71 |
| `👀 Search Field · audit` 806:76 | 1035:22760 | `#FFFFFF` | `bg-surface-main` | AID-65, Designer · 💠 Search Field |
| `👀 Card Service · audit` 845:903 | 845:904 | `#FFFFFF` | `bg-surface-main` | AID-69, Designer · 💠 Card Service |
| `👀 Button · audit` 902:11590 | 902:11592 | `#FFFFFF` | `bg-surface-main` | AID-74 (designer-12) |
| `👀 Pin Car · audit` 853:3928 | 853:3929 | `#FFFFFF` | `bg-surface-main` | AID-72 (designer-11) |
| `👀 Dock NavBar · audit` 928:630 | 928:631 | `#FFFFFF` | `bg-surface-main` | AID-75 (designer-13) |
| `👀 Bottom Sheet · audit` 1093:353 | 1093:354 | `#FFFFFF` | `bg-surface-main` | AID-79, Designer · 💠 Шторка |
| `👀 Icon Surface · audit` 1126:3914 | 1126:3915 | `#FFFFFF` | `bg-surface-main` | AID-81, Designer · 💠 98:9 |
| `👀 Divider · правка` 1142:871 | 1142:872, 1144:655, 1144:1029 | фон по правилу, обводка `#000000` 10 % | обводка — вопрос 2 | AID-62 |

Уже по правилу: `🚧 Spinner · construction` 1033:2, `👀 Spinner · audit` 786:2, `👀 Divider · audit` 773:2 (фон).

Не вношу (сцены и демо, фон продукта): 1078:5988 «Демо · фон выбранного таба ночью» (389:47), 1151:591
«Демо · Map (блок 5)», три чёрные секции 936:11670 «Example», 936:11845 и 936:12013 «Banners» (845:903).
Вне служебных страниц: зона 2 Rider Components — страницы библиотеки без секций, кроме рабочих «to check»
349:3418 (Navigation Bar) и «Section 1» 798:10125 (Search, AID-65).

## 5. Список узлов — Driver

### 5.1 Driver Components — 12 страниц аудита (активных задач на доске нет)

Все секции — фон `bg-surface-muted` → `bg-surface-main`, кроме Search Field (сырой `#FFFFFF` → `bg-surface-main`).
Карточки — экземпляры `IslandBlock`, по правилу. Вне секций — только рабочий набор `.Tab · прототип` 465:512 и
подпись 465:682 на странице Tab (не служебная оболочка, не трогаю).

| Страница | Секции (11, у Comment — 12) | Было фон | Обводка сейчас |
|---|---|---|---|
| `👀 Switch · audit` 425:102 | 425:221, 425:258, 425:269, 425:280, 425:291, 425:302, 425:313, 425:324, 425:335, 425:346, 506:4729 | `bg-surface-muted` | `line-default` |
| `👀 Balance · audit` 452:889 | 452:890, 452:899, 452:947, 452:977, 452:1024, 452:1096, 452:1152, 452:1203, 452:1240, 452:1278, 507:23726 | `bg-surface-muted` | `line-default` |
| `👀 Button · audit` 449:1497 | 449:1498, 449:1501, 449:1503, 449:1505, 449:1507, 449:1509, 449:1511, 449:1513, 449:1515, 449:1517, 507:9441 | `bg-surface-muted` | `line-default` |
| `👀 Checkbox · audit` 454:7720 | 454:7721, 454:7724, 454:7726, 454:7728, 454:7730, 454:7732, 454:7734, 454:7736, 454:7738, 454:7740, 507:13202 | `bg-surface-muted` | `line-default` |
| `👀 Comment · audit` 455:102 | 455:142, 455:290, 455:301, 455:312, 455:323, 455:334, 455:345, 455:356, 455:367, 455:378, 507:20813, 455:8424 | `bg-surface-muted` | `#000000` 10 % — вопрос 2 |
| `👀 Motivation · audit` 455:7078 | 455:7079, 455:7088, 455:7136, 455:7166, 455:7213, 455:7285, 455:7341, 455:7392, 455:7429, 455:7467, 507:18709 | `bg-surface-muted` | `line-default` |
| `👀 Avatar · audit` 460:889 | 460:890, 460:893, 460:895, 460:897, 460:899, 460:901, 460:903, 460:905, 460:907, 460:909, 507:15697 | `bg-surface-muted` | `line-default` |
| `👀 Driver Arrow · audit` 460:2122 | 460:2123, 460:2132, 460:2180, 460:2210, 460:2257, 460:2329, 460:2385, 460:2436, 460:2473, 460:2511, 506:5723 | `bg-surface-muted` | `line-default` |
| `👀 Search Field · audit` 463:9037 | 463:9038 … 463:9047 (10 подряд), 507:24026 | сырой `#FFFFFF` | `#000000` 10 % — вопрос 2 |
| `👀 Tab · audit` 463:9568 | 463:9569, 463:9666, 463:9757, 463:11233, 463:11444, 465:617, 465:757, 467:764, 467:909, 467:1041, 507:17753 | `bg-surface-muted` | `line-default` |
| `👀 Lane Arrow · audit` 472:102 | 472:121, 472:163, 472:174, 472:185, 472:196, 472:207, 472:218, 472:229, 472:240, 472:251, 509:1113 | `bg-surface-muted` | `#000000` 10 % (кроме 509:1113 — `line-default`) — вопрос 2 |
| `👀 Badges · audit` 495:1119 | 495:1120, 495:1129, 495:1168, 495:1207, 495:1246, 495:1285, 495:1324, 495:1363, 495:1402, 495:3522, 503:1349 | `bg-surface-muted` | `line-default` |

Итого 133 секции: 122 — `bg-surface-muted` → `bg-surface-main`, 11 — сырой `#FFFFFF` → `bg-surface-main`.

### 5.2 Driver Tokens — страницы ещё не на Kit (вопрос 3)

На Kit там только таблицы `CHANGELOG` (#436). Оболочка — старая, своя у Driver:

| Страница | Узел | Было | Стало (если вопрос 3 — а) |
|---|---|---|---|
| `✅ Colors` 0:1 | секция 3:6821 «color-sem» | сырой `#000000`, обводка `#000000` 10 % | `bg-surface-main`, `line-default` |
| то же | шапка 115:124 «Header» (r28) | сырой `#F6F6F9`, без обводки | `bg-surface-main` + `line-default` |
| то же | 10 колонок (r32): 7:14 Bg, 7:17 Texts, 7:20 Icons, 7:23 Strokes, 3:7849 Pastels, 7:2 Buttons, 7:5 Controls, 7:8 Fields, 7:11 Messages, 499:15 Boosters | сырой `#FFFFFF`, без обводки | `bg-surface-main` + `line-default` |
| `✅ Gradients` 346:23 | секция 352:2 «our-gradient-styles» | сырой `#000000` | `bg-surface-main`, `line-default` |
| то же | шапка 352:3 «Header» (r28) | сырой `#F6F6F9` | `bg-surface-main` + `line-default` |
| то же | 352:9 «Gradients Content» (r32) | сырой `#FFFFFF` | `bg-surface-main` + `line-default` |
| `✅ Typography` 14:2 | рамка 19:748 «Driver Typography Styles» (r32, не секция) | сырой `#FFFFFF`, обводка `#E1E4EA` | `bg-surface-main` + `line-default` |
| `✅ Shadows` 24:380 | рамка 70:12 «Shadows» | то же | то же |
| `✅ Space` 131:53 | рамка 218:57 «Driver Space Variables» | то же | то же |
| `✅ Radius` 131:54 | рамка 227:2 «Driver Radius Variables» | то же | то же |

Прямо на чёрных секциях текстов нет (только рамки-колонки и шапка) — после смены фона ничего не пропадёт.
Радиусы (28, 32) и устройство страниц — не этого прохода, их меняет полный перевод на Kit.

### 5.3 Driver Icons — фон по правилу

Секции 5608:62 «Icons», 5612:46 «Changelog · Icons» — `bg-surface-main`, без обводки (вопрос 2). 17 черновиков вне
секции — принятое отступление §6.3 (#472).

## 6. Не вношу в проход

- Страницы плагинов и рабочие, не на Kit: `Оформление`, `Маппинг` (до мержа #365 не трогать), `Changes` в Rider
  Tokens и Driver Tokens; `Идеи` 105:115 в Driver Tokens; `_archive` 631:11 в Driver Icons;
  `Components Swapper · …` в New Rider DEV (инструмент Library Updater).
- `💡 Идеи · Главная` 4302:11524 в New Rider DEV — страница Product Logic, без секций, не на Kit (автор: Product Logic).
- `Thumbnail` всех файлов — черновики обложки, решение PD по обложке.

## 7. Шаг 2 — как буду писать (после «принято»)

1. Порядок Persefona → Rider → Driver; Rider — только то, что авторы разрешат (вопрос 1), иначе ничего.
2. Краска: `figma.variables.setBoundVariableForPaint` на SOLID с `color`, равным значению переменной в режиме файла
   (`bg-surface-main` — `#FFFFFF`, `line-default` — значение из Tokens) — иначе рендер иногда показывает её чёрной.
3. Тексты, id, размеры, положение — не меняются. Меняются только `fills`/`strokes` узлов из списка.
4. Снимки до/после выборкой по каждому файлу (страница с наибольшим числом секций) — `changes/persefona/snapshots/section-bg/`.
5. Сверка тем же скриптом: по узлам списка 0 расхождений; чужие страницы — без изменений.
6. Итог — комментарием в PR, Standards · Persefona на приёмку.

## 8. Вопросы на приёмку

1. **Rider Components — 20 секций (фон) и 4 (только обводка) на страницах чужих активных задач (§4).** ★а — разослать список авторам через
   Штаб (одно сообщение со строками по задачам), правят сами; б — правлю я с их «да» в этом же PR (тогда PR ждёт
   ответов 11 чатов).
2. **Обводка секций.** Правило говорит только о фоне. Сейчас обводки разные: `line-default`, сырой `#000000` 10 %
   (обводка секции Figma по умолчанию), нет обводки (Rider Icons, Driver Icons). ★а — в этом же проходе сырую
   обводку `#000000` 10 % → `line-default` (как на Colors, В5 #367); где обводки нет — не добавлять;
   б — обводку не трогать.
3. **Driver Tokens (§5.2)** — страницы ещё не на Kit. ★а — в этом проходе только фон и обводка по списку
   (2 секции, 2 шапки, 11 карточек, 4 рамки), полный перевод на Kit — отдельно, как Rider Tokens;
   б — не трогать до полного перевода.
4. **TabBar 389:47** — оболочку собирала я (persefona-2, #378), страница — AID-43 Designer · Components.
   ★а — согласовать с Designer · Components и сделать в этом PR (две секции); б — как остальные в вопросе 1.
5. **Зависимость от #521.** Правило 0.13.0 пока в ветке `persefona-standards/prd-audit`. ★а — шаг 2 не ждёт мержа
   #521 (разрешение уже дано), этот PR мержится после #521.
