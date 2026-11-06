# Прогон: «✅ Show my location» (New Rider Drafts)

Дата: 2026-11-03. Файл `eSitSKeHzy5fOUF1n3zg2B`.

- Оригинал: `2202:89169`. Копия: `5374:802548` «✅ Show my location — Switched Styles».
- Копия **уже была** (создана раньше), 77 корней — состав совпал с оригиналом по именам (после `loadAsync`), недокопированного нет, `clone-roots.js` не понадобился.
- Прежний прогон был **частичным**: порции 0 (≈1 776 узлов) дали `done 0` — перенесено ранее; остальные порции давали заменённое при первом проходе. Остаток этого прохода — ниже.
- Всего на копии 62 596 узлов (после полной загрузки страницы); обработано в 53 порциях (519 корней-единиц: крупные секции Misc, Rework v.1/v.2/v.3, Ride Cancellation — разбиты на детей), по каждой ≤10 корней и ≤2 500 узлов. Узлов, дошедших до проверки (без status bar/map/car/keyboard): 50 973.
- Ошибок скрипта нет (счётчики `ошибка` в пропусках отсутствуют). Транспорт MCP обрывался 5 раз (ответ потерян, порции записались в Figma идемпотентно): после обрыва недостающие порции перезапускались. Если оборвавшийся вызов успел часть применить, «Заменено» по порциям 4–5, 33, 47–52 могло недосчитаться — эти узлы потом попали бы в «уже перенесено» и в таблицу не вошли.
- Заменено: **42 140**. Не заменено: **10 290** (281 причина).
- Крупные корни, разбитые на детей (Misc, Rework v.1/v.2/v.3, Ride Cancellation – By Client ×2 и их крупные подсекции — 11 контейнеров): их собственные свойства (заливки секций и т. п.) **не проверены**.
- Скриншот секции New Layout (0.25) — вид не развалился: экраны, текст, кнопки, свитчи на месте.

## Заменено

Всего 42 140. Топ-40 причин (остальные — ~130 причин по 1–10 раз, суммарно ≈ 600):

| причина | кол-во |
|---|---|
| {Gaps:SPx4} → space-16 | 4101 |
| {Gaps:SPx2} → space-8 | 4015 |
| {Gaps:SPx3} → space-12 | 3397 |
| {Color:tx-accent/grey/primary} → Text/Primary (text) | 3032 |
| {Color:tx-accent/grey/tertiary} → Icon/Tertiary (shape) | 1947 |
| {Radius:CRx4} → radius-16 | 1932 |
| {Отступы:SPx2} → space-8 | 1703 |
| {Gaps:SPx1} → space-4 | 1381 |
| [Bodies/Body 2] (стар.) → [Bodies/Body 2] | 1333 |
| {Spacing:SPx3} → space-12 | 1257 |
| {Gaps:SPx0,5} → space-2 | 967 |
| {Gaps:SPx5} → space-20 | 862 |
| {Отступы:SPx1,5} → space-6 | 820 |
| {Color:tx-bg/level 1 base} → Background/Primary (frame) | 787 |
| {Color:tx-accent/grey/primary} → Icon/Primary (shape) | 775 |
| [Subtitles/Subtitle 1] (стар.) → [Subtitles/Subtitle 1] | 700 |
| {Gaps:SPx1,5} → space-6 | 684 |
| {Theme:text icon/primary} → Text/Primary (text) | 643 |
| [Subtitles/Subtitle 2] (стар.) → [Subtitles/Subtitle 2] | 596 |
| {Theme TX:tx-accent/grey/primary} → Icon/Primary (shape) | 551 |
| {Radius:CRx3} → radius-12 | 520 |
| {Color:tx-control/yellow/bg/idle} → Icon/Attention (shape) | 481 |
| {Gaps:SPx15} → space-60 | 384 |
| {Radius:CRx6} → radius-24 | 380 |
| {Gaps:SPx0} → space-0 | 373 |
| {Theme:text icon/secondary} → Text/Secondary (text) | 372 |
| {Color:tx-control/orange/bg/idle} → Icon/Attention Deep (shape) | 370 |
| {Radius:CRx7} → radius-28 | 366 |
| {Color:tx-accent/grey/light const} → Text/Constant White (text) | 339 |
| {Color:tx-control/neutral/bg/idle} → Field/Primary (frame) | 334 |
| [Subtitles/Subtitle 3] (стар.) → [Subtitles/Subtitle 3] | 309 |
| {Color:tx-accent/grey/secondary} → Text/Secondary (text) | 274 |
| {Color:tx-accent/grey/light const} → Icon/Constant White (shape) | 272 |
| {Theme TX:tx-bg/level 1 base} → Background/Primary (frame) | 245 |
| {Color:tx-accent/grey/dark const} → Icon/Constant Black (shape) | 242 |
| {Color:tx-bg/level −1 muted} → Background/Secondary (frame) | 235 |
| {Color:tx-accent/grey/dark const} → Background/Constant Dark (frame) | 223 |
| [Bodies/Body 3] (стар.) → [Bodies/Body 3] | 207 |
| {Color:tx-accent/grey/dark strong} → Icon/Primary (shape) | 202 |
| {Size:24} → radius-24 | 200 |

Прочее заметное: `#ffffff → Background/Primary (frame)` 84; `#8526ff@0.12 → Icon/Accent + слой 12 %` 53; `[Shadows/[day] Large] → [Shadows/Large]` 30; `[Shadows / Brand button] → снята` 3; `[iOS / Subtitle] (стар.) → [Outstanding/iOS - Subtitle]` 12; `[iOS / Caption] (стар.) → [Bodies/Body 3]` 3.

## Не заменено

Всего 10 290 пропусков, 281 причина. ID — как возвращает скрипт (`I…` — вложенный в экземпляр узел; префикс `5374:` опущен у ID без `I`, у ID с `I` показан в начале). Для строк 1–25 — до 3 ID, ниже — 2 ID (в Figma полный список до 50 ID был собран, но в файл попали сокращённые: полный список не поместился в рабочий контекст; повторный прогон на копии выдаёт его заново, прогон идемпотентен).

| причина | кол-во | ID узлов |
|---|---|---|
| {Button:Border radius}=18 topLeftRadius — нет цели | 955 | I5374:802565;40006948:13774, 802595, 802596 |
| {Button:Border radius}=18 topRightRadius — нет цели | 955 | I5374:802565;40006948:13774, 802595, 802596 |
| {Button:Border radius}=18 bottomLeftRadius — нет цели | 955 | I5374:802565;40006948:13774, 802595, 802596 |
| {Button:Border radius}=18 bottomRightRadius — нет цели | 955 | I5374:802565;40006948:13774, 802595, 802596 |
| эффект [shadow/diffuse/m] — нет в маппинге | 446 | I5374:802560;40000385:8868, 802565, 802578 |
| сырой эффект: layer_blur | 393 | I5374:803118;1067:131367, I5374:803294;40007495:44585;40007507:36185;40007507:36140 |
| шрифт без стиля: SF Pro Text Semibold 12/13 | 315 | 803458, 803462, 803466 |
| эффект [shadow/diffuse/s] — нет в маппинге | 302 | 802560, 802576, 802628 |
| сырой #000000 [shape] | 272 | I5374:802563;1037:166;589:194, I5374:802789;1037:166;589:194 |
| {System:Magin Top}=54 paddingTop — нет цели | 257 | 802550, 802566, 802618 |
| градиент [shape] | 239 | 803098, I5374:803119;1074:135481 |
| {Color:tx-brand/green/green} [shape] — нет в маппинге | 235 | I5374:802560;40000385:8868;40006534:14641;40006534:7699 |
| шрифт без стиля: WB Sans Medium 24/100 | 234 | I5374:802560;40000385:8868;40006534:7701 |
| сырой #ffffff [stroke] | 210 | I5374:802565;40007495:32144;40008793:92370, I5374:802586;40008793:92370 |
| сырой #ff5f00 [shape] | 201 | I5374:802565;40007187:67012;40007187:43967;427:17588 |
| сырой #eb001b [shape] | 201 | I5374:802565;40007187:67012;40007187:43967;427:17589 |
| сырой #f79e1b [shape] | 201 | I5374:802565;40007187:67012;40007187:43967;427:17590 |
| градиент [frame] | 180 | I5374:803119;1093:24175, 803202, 803221 |
| сырой #ffffff [shape] | 178 | I5374:803142;40001108:25773;5374:817787;40001611:17557;1937:2777 |
| {Color:tx-accent/grey/primary} [stroke] — нет правила | 177 | I5374:802565;40006948:13758, 802584, 802636 |
| сырой #000000 [stroke] | 174 | 802557, 802573, 802625 |
| [Titles/Title 1] — нет в маппинге | 154 | I5374:802565;40006948:13760, 802585, 802637 |
| сырой #d9d9d9 [shape] | 107 | I5374:803140;40001108:25773;5374:817780;427:15332;40001108:28677 |
| шрифт без стиля: SF Pro Regular 17/22 | 96 | I5374:803697;40001403:28636;40001069:17932;126:59452 |
| сырой эффект: drop 0,3 r1 s0 #000000@0.06 + drop 0,3 r8 s0 #000000@0.15 | 87 | I5374:802599;40007787:45030;5374:817569;2421:224414, 803126 |
| [Action/actionAccent — miniPig] — нет в маппинге | 81 | 804382;91:1957, 804396;3605:99827 |
| {Theme TX:tx-bg/overlay} [shape] — нет в маппинге | 76 | 802669;40001063:14769, 802722;40001063:14769 |
| {System Colors:Separators/Non-opaque} [stroke] — нет в маппинге | 62 | 803123;2189:195907, 803123;2189:195944 |
| сырой #000000 [frame] | 61 | 803679, 804228;2781:9134 |
| [Caption2/Regular] — нет в маппинге | 60 | 804072;40001097:25307, 804072;40001097:25313 |
| {Color:tx-control/yellow/bg/idle} [stroke] — нет правила | 56 | 808244, 808304 |
| сырой #000000 [text] | 45 | 803657, 804420;40006695:21046 |
| сырой #ffffff [text] | 40 | 803094, 803264 |
| градиент [stroke] | 36 | 803406;400:18443, 804725;1446:2160 |
| сырой #00b23c [stroke] | 32 | 808243, 808308 |
| сырой эффект: background_blur | 31 | 803825, 803976 |
| эффект [shadow/close/s] — нет в маппинге | 26 | 804118;40001460:8579, 804118;40001460:11872 |
| шрифт без стиля: SF Pro Text Regular 12/14 | 24 | 806684, 806688 |
| {Color:tx-bg/level −1 muted} [stroke] — нет правила | 24 | 808299, 808623 |
| {Color:tx-accent/green/bg} [stroke] — нет правила | 24 | 808303, 808627 |
| эффект [Shadow S] — нет в маппинге | 24 | 808305, 808629 |
| {Color:tx-control/purple/tint/idle} [frame] — нет в маппинге | 23 | 804672, 804715 |
| [Captions/Caption 3] — нет в маппинге | 22 | — |
| сырой #ff0000 [shape] | 20 | 803530, 803531 |
| сырой #f6f6f9 [frame] | 19 | 803319, 803320 |
| сырой #100f25 [shape] | 18 | — |
| шрифт без стиля: SF Pro Text Medium 14/110.00000238418579 | 18 | — |
| [Title/title2 — pig] — нет в маппинге | 18 | — |
| шрифт без стиля: ALS Hauss VF Medium 19/20 | 18 | — |
| {Color:tx-accent/grey/primary-Inverted} [frame/frame] — нет правила | 17 | 804460;40006739:17632, 804486;40006745:17679 |
| сырой эффект: inner_shadow + inner_shadow + inner_shadow | 16 | 804460;40006739:18655, 804460;40006739:18657 |
| шрифт без стиля: SF Pro Text Regular 12/16 | 15 | — |
| сырой #ffffff@0.10 [stroke] | 14 | 803679, 804060 |
| [Body/body — horse] — нет в маппинге | 14 | — |
| {Color:tx-accent/grey/tertiary} [frame/frame] — нет правила | 13 | 804695, 806787;40006689:21137 |
| сырой #232326 [shape] | 12 | 803506, 803589 |
| {Color:tx-accent/grey/primary} «Shadow» — пробел | 12 | 803118;1067:131367, 808246;1074:135167 |
| сырой эффект: drop 0,1 r0 s0 #ffffff@0.30 + inner_shadow | 12 | 803118;1067:131368, 808246;1074:135168 |
| сырой #ff661a [shape] | 12 | — |
| {Color:tx-bg/level 1 base} [stroke] — нет правила | 12 | 804671 |
| сырой #ffc800 [stroke] | 12 | — |
| {Theme TX:tx-accent/orange/tint} [text] — нет в маппинге | 12 | — |
| сырой эффект: drop 3,4 r10 s0 #361616@0.08 + glass | 12 | 807753;15:3905, 808019;15:3905 |
| сырой #26013e@0.25 [shape] | 11 | 803386;40007540:53521, 803387;40007540:53521 |
| {Color:tx-accent/grey/dark strong} [stroke] — нет правила | 11 | 804118;40001453:30457, 811103;40001453:30457 |
| {Color:tx-accent/grey/secondary} [stroke] — нет правила | 11 | — |
| сырой эффект: drop 0,-10 r80 s0 #ffffff | 11 | — |
| сырой #505050 [frame] | 11 | 806316, 806554 |
| сырой эффект: drop 0,-4 r16 s0 #000000@0.12 + noise | 10 | 803202, 803221 |
| сырой #0f013e@0.16 [shape] | 10 | 806229, 806281 |
| сырой #ff7200 [shape] | 10 | 817034;40001075:11430, 817179;40001075:11430 |
| {System Colors:Colors/Blue} [text] — нет в маппинге | 9 | 803123;2189:195906, 803123;2189:195908 |
| сырой #1d354f [shape] | 9 | 803508, 803509 |
| сырой #ffb800 [shape] | 9 | 803508, 803509 |
| {Скругления:CRx0}=0 bottomLeftRadius — нет цели | 9 | 804228;2781:9135, 804228;2900:9478 |
| {Скругления:CRx0}=0 bottomRightRadius — нет цели | 9 | 804228;2781:9135, 804228;2900:9478 |
| {Theme TX:tx-bg/map} [frame] — нет в маппинге | 9 | 804228;2781:9101, 804229 |
| [pure black] [text] — нет в маппинге | 8 | — |
| {Corner Radius:CRx0}=0 bottomLeftRadius — нет цели | 8 | 804262, 804276 |
| {Corner Radius:CRx0}=0 bottomRightRadius — нет цели | 8 | 804262, 804276 |
| {theme:stroke/blackConst} [shape] — нет в маппинге | 8 | — |
| шрифт без стиля: ALS Hauss VF Regular 48/48 | 8 | 804460;40006739:18655, 804486;40006745:17673 |
| {Theme:text icon/primary} [stroke] — нет правила | 8 | 804460;40006739:18658, 804486;40006745:17676 |
| сырой #2f2e43 [shape] | 8 | 804460;40006739:17633, 804486;40006745:17680 |
| {Color:tx-accent/grey/dark const} [text/text] — нет правила | 8 | — |
| сырой эффект: drop 0,4 r12 s0 #000000@0.10 | 7 | 802563, 802564 |
| эффект [Material Blur] — нет в маппинге | 7 | 804072;40001097:25303, 804104;40001097:25303 |
| [Footnote/Regular] — нет в маппинге | 7 | 803123;2189:195901, 804072;40001069:17905 |
| сырой #000000@0.10 [shape] | 7 | 803553, 804275;3406:39453 |
| сырой эффект: drop 0,14 r64 s0 #f24f18@0.00 | 7 | — |
| сырой эффект: drop 0,-8 r20 s0 #2d2d53@0.12 | 7 | 804259;2314:4610, 804262 |
| сырой #ff661a [text] | 7 | — |
| шрифт без стиля: ALS Hauss VF Bold 15/20 | 7 | — |
| сырой эффект: drop 3,4 r10 s0 #1d361b@0.08 | 7 | 805743;15:3905, 808984;15:3905 |
| сырой #c4c4c4 [shape] | 6 | 803660;52:3315;52:3327, 803661;52:3315;52:3331 |
| {Gaps:SPx4,5}=18 paddingTop — нет цели | 6 | — |
| сырой #181819 [shape] | 6 | — |
| текст со смешанными стилями — оставлено | 6 | — |
| {Color:tx-control/neutral/bg/idle} [shape/shape] — нет правила | 6 | — |
| [iOS / H2] — нет в маппинге | 6 | 803626, 803657 |
| сырой #999999@0.97 [frame] | 6 | 804072;40001097:25303, 804104;40001097:25303 |
| сырой #5c5c5c [frame] | 6 | 804072;40001097:25303, 804104;40001097:25303 |
| сырой #661aff [frame] | 6 | 804072;40001075:10742, 804104;40001075:10742 |
| сырой #ff00ff [shape] | 6 | — |
| [Subheadline/Emphasized] — нет в маппинге | 6 | 804072;40001069:17904, 804104;40001069:17904 |
| {iOS Colors:Fills/Tertiary} [frame] — нет в маппинге | 6 | 804072;40001069:17907, 804104;40001069:17907 |
| {System Colors:Labels/Secondary} [text] — нет в маппинге | 6 | — |
| шрифт без стиля: SF Pro Semibold 16/21 | 6 | — |
| шрифт без стиля: SF Pro Regular 17/24 | 6 | 804072;40001069:17942, 804104;40001069:17942 |
| сырой #ffc800 [shape] | 6 | — |
| сырой #fffbdd [shape] | 6 | — |
| {Color:tx-accent/red/bg} [frame/frame] — нет правила | 6 | 804684, 804740 |
| шрифт без стиля: SF Pro Semibold 14/120.00000476837158 | 6 | — |
| {Theme TX:tx-control/neutral/bg/idle} [frame] — нет в маппинге | 5 | — |
| TEXT смешанные заливки — оставлено | 5 | — |
| {Color:tx-control/purple/bg/idle} [shape] — нет в маппинге | 5 | — |
| [Day / Gray 20] [shape] — нет в маппинге | 5 | 803649;669:723;1935:30, 803652;669:723;1944:70 |
| шрифт без стиля: ALS Hauss VF Regular 15/20 | 5 | 804386;98:375 |
| эффект [Shadow Up] — нет в маппинге | 5 | 804278, 804310 |
| эффект [Shadow Down] — нет в маппинге | 5 | 804279, 804311 |
| {Скругления:CRx0}=0 topLeftRadius — нет цели | 5 | 804279, 804311 |
| {Скругления:CRx0}=0 topRightRadius — нет цели | 5 | 804279, 804311 |
| {theme:icon/contraste} [shape] — нет в маппинге | 5 | 804279;400:1773;586:144, 804311;400:1773;586:144 |
| сырой эффект: drop 0,4 r24 s0 #10032b@0.07 | 5 | 804674, 804717 |
| шрифт без стиля: SF Pro Text Medium 14/14 | 5 | 806291;5374:806805, 809495;3327:145606 |
| сырой #99ffbb [shape] | 4 | — |
| сырой #014d2d [stroke] | 4 | — |
| сырой #1cc052 [shape] | 4 | — |
| сырой #ffffff@0.25 [shape] | 4 | 803525, 803526 |
| [Day / Black] [stroke] — нет правила | 4 | 803654;669:723;7570:38, 803654;669:723;7570:39 |
| сырой #ffe2f1 [frame] | 4 | 803660, 803661 |
| [Day / Black] [frame/frame] — нет правила | 4 | 803660;52:3317, 803661;52:3317 |
| [ Night / White] [text] — нет в маппинге | 4 | 803660;52:3319, 803661;52:3319 |
| сырой #ccced9 [shape] | 4 | — |
| сырой эффект: drop 0,-6 r64 s0 #ffffff | 4 | 804228;2900:9478, 804277;237:849 |
| {Скругления:BRx0}=0 topLeftRadius — нет цели | 4 | 804228;2781:9145, 804275;3285:66765 |
| {Скругления:BRx0}=0 topRightRadius — нет цели | 4 | 804228;2781:9145, 804275;3285:66765 |
| {Theme TX:tx-accent/orange/tint} [shape] — нет в маппинге | 4 | — |
| шрифт без стиля: ALS Hauss VF Medium 17/22 | 4 | 804259;2314:4624, 804343;2314:4624 |
| сырой эффект: drop 0,-6 r30 s0 #267366@0.10 | 4 | 804278;2328:7237, 804310;2328:3346 |
| {Theme:bg/level -1} [shape/shape] — нет правила | 4 | — |
| {Navigator Color:Jam/Low} [shape] — нет в маппинге | 4 | — |
| {Theme TX:tx-button/blurring/solid/content/defaultPrimary} [stroke] — нет в маппинге | 4 | — |
| сырой #b099bf [shape] | 4 | — |
| сырой #ff00ff@0.62 [shape] | 4 | — |
| сырой #ffb2ff [shape] | 4 | — |
| [Body/body] — нет в маппинге | 4 | 804384;98:375, 804388;98:375 |
| {theme:icon/tertiary} [shape] — нет в маппинге | 4 | — |
| сырой #ffffff@0.31 [frame] | 4 | — |
| эффект [Background Blur/Ultra Thin] — нет в маппинге | 4 | — |
| {Color:tx-bg/level 1 base} [text/text] — нет правила | 4 | 804667, 804668 |
| {Color:tx-accent/red/tint} [frame] — нет в маппинге | 4 | 806784, 810776 |
| эффект [.blur tiny] — нет в маппинге | 4 | 806789;67:2462, 810781;67:2462 |
| сырой #ff4a33 [shape] | 4 | — |
| [Body/Regular] — нет в маппинге | 3 | 803123;2189:195906, 803123;2189:195908 |
| {Color:tx-accent/red/fg} [frame/frame] — нет правила | 3 | 803221, 803239 |
| {Color:tx-accent/green/fg-inverted} [frame] — нет в маппинге | 3 | 803202, 804807;40004841:66861 |
| {Color:tx-accent/purple/fg-inverted} [frame] — нет в маппинге | 3 | 803414, 803415 |
| {Color:tx-brand/pink/idle} [shape] — нет в маппинге | 3 | — |
| {Color:tx-brand/pink/blue/idle} [shape] — нет в маппинге | 3 | — |
| сырой #ffffff@0.30 [shape] | 3 | 803538, 803539 |
| сырой #cacacc [shape] | 3 | 803597, 803600 |
| [iOS / Subtitle L] — нет в маппинге | 3 | 803627, 803635 |
| [Day / Gray 4] [shape] — нет в маппинге | 3 | 803628, 803637;600:72 |
| {Theme:bg/accentLight} [shape] — нет в маппинге | 3 | — |
| {Theme:bg/accentLight} [text] — нет в маппинге | 3 | 804259;2314:4624, 804343;2314:4624 |
| {Theme:additional/buttonBuy/bg/default} [frame] — нет в маппинге | 3 | 804267, 804351 |
| сырой #1d1d22 [frame] | 3 | 804267, 804351 |
| {Corner Radius:CRx0}=0 topLeftRadius — нет цели | 3 | 804271, 804355 |
| {Corner Radius:CRx0}=0 topRightRadius — нет цели | 3 | 804271, 804355 |
| {Gaps:SPx11}=44 paddingBottom — нет цели | 3 | 804420;40006695:21044, 804460;40006739:17591 |
| {Color:tx-accent/orange/tint} [frame] — нет в маппинге | 3 | 804682, 804738 |
| {Color:tx-bg/map} [frame] — нет в маппинге | 3 | 804704, 804749 |
| {Safe zones:safe-top}=42 paddingTop — нет цели | 3 | 805743, 808984 |

Хвост из 80 причин с количеством 1–2 (всего ≈ 110 пропусков) — в основном `сырой #hex`, `сырой эффект: drop …`, `шрифт без стиля: …` (ALS Hauss VF, WB Sans, SF Pro, Roboto, Inter), `[Day / Gray …]`, `[Night / …]`, `[iOS / H4]`, `эффект [Shadows/FAB]`, `эффект [Shadow Down V]`, `эффект [Shadow Surface]`, `{System Colors:Labels/Primary}`, `{theme:tx-regime/*}`, `{Theme TX:tx-accent/{blue,green,purple}/tint}`, `{Скругления:BRx0}=0 …`, `{Corner radius:BRx0}=0 …`, `[Action/action— capybara]`, `[Title/title1 — elephant]`, `[Body/bodyAccent — buffalo]`, `[Headline/Regular]`, `[Android / Body]`, `[Titles/Title 2]`, `[TX Body/tx body regular--ml]`: в файл отдельными строками не вынесены (контекст), воспроизводятся повторным прогоном.

## skipByRoot

Всего 10 290 пропусков на 301 корне (по имени + id). Топ-30:

| экран | пропусков |
|---|---|
| Security & Help 5374:804060 | 207 |
| 414_Order_Arriving 5374:803488 | 182 |
| Entrance 5374:808358 | 148 |
| Entrance 5374:811872 | 148 |
| Get a Ride / Free Waiting 5374:804229 | 134 |
| Safety 5374:809775 | 132 |
| Safety 5374:813293 | 132 |
| В отдельной задаче отмена заказа! 5374:815219 | 132 |
| Stops 5374:809542 | 128 |
| Stops 5374:813060 | 128 |
| Get a Ride / Start / Expanded 5374:804313 | 127 |
| Get a Ride / Start / Expanded 5374:804810 | 127 |
| Order Found 5374:804228 | 103 |
| Stops 5374:806316 | 99 |
| Safety 5374:806554 | 89 |
| Map / Drop Off / Final 5374:804365 | 85 |
| Pay 5374:803410 | 79 |
| TX Slider 5374:804671 | 79 |
| Trip Details 5374:809958 | 78 |
| Trip Details 5374:813477 | 78 |
| Main 5374:804635 | 77 |
| In Trip / Expanded 5374:803697 | 73 |
| In Trip / Expanded 5374:804125 | 73 |
| Main 5374:804867 | 72 |
| Search 5374:811049 | 70 |
| Search 5374:814588 | 70 |
| Comment 5374:803389 | 67 |
| Ride / Continued 5374:804294 | 67 |
| Search 5374:803388 | 66 |
| Search 5374:809431 | 60 |

(ещё 271 корень — меньше 60 пропусков на каждый; полный список воспроизводится повторным прогоном.)
