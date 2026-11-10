# Анкета: стили без правила и остаток New Rider DEV (2026-11-10)

Собрано чтением, в Figma ничего не менялось. ★ — мой вариант. Ответ строкой: «1а 2а 3б …».
Счёт Drafts — по последнему блоку каждой страницы в `drafts-run/results/*.tsv` (в tsv только топ-60 причин страницы).

## Drafts — без правила

1. **Сырой `#979797`** — 168 на заливке shape (No car 90, Tariffs 47, Taxi 16, Backlog UI 15) и 32 на обводке.
   Образец `5371:80610`: Path внутри `Combined Shape` (BOOLEAN_OPERATION) иконки `Icons / 24 / System / Back`.
   У детей булевой операции заливка не рисуется, видна заливка самой операции. Правило это уже учитывает.
   а) оставить, на вид не влияет ★ · б) всё равно привязать к Icon/Tertiary (`0f0f1f@0.38`) ради чистоты замера.
2. **`[ Night / White]` не на иконке** — 12 (Tariffs). Образец `5374:563851`: «9:41» в `Time` / `whiteStatus`, то есть status bar.
   а) оставить: status bar исключён намеренно ★ · б) Icon/Constant White (`ffffff / f8faff`).
3. **`[Action/actionAccent — miniPig]`** — 355 (Where 129, Where - Migration 129, Show my location 81, Errors 16).
   Стиль другой системы: ALS Hauss VF Medium 17/20, трекинг 0; образец — кнопка «Выйти».
   а) Outstanding/NRD - Body (SF Pro Semibold 17/20: размер и интерлиньяж те же, гарнитура другая) ★ ·
   б) Outstanding/NRD - Action Bold · в) не трогать, записать пробел типографики.
4. **Ниже топ-60 на страницах:** `Text [day]/Warning` на фрейме, `theme:bg/accentSecondary`, `Caption 3`, `Gradients/Top`.
   Точного счёта в tsv нет. В color-sem нет `Background/Accent Secondary`; Text/Warning `e52817`, Background/Warning `e52817 / da2b1a`.
   а) прогнать DRY с `TOP=200` на всех копиях (узлы не меняются, ~17 вызовов), потом решить по каждому ★ ·
   б) `Text [day]/Warning` на фрейме → Background/Warning сразу, остальные — пробелами в общую анкету.

## New Rider DEV — копия «✅ Taxi for friends — Switched Styles» `4770:4437`

Тела скрипта в DEV нет. Если на п.5–6 будет «да», правки пойдут разовым вызовом только на копию, оригинал `2314:16494` не трогается.

5. **Counter** `4770:4725` (в Suggest, 3 узла): `[Icon [day]/Accent]` на shape и `[Text [day]/Constant White]` на тексте.
   Оба уже есть в маппинге (→ Icon/Accent, Text/Constant White), в прогоне 02.11 узел пропущен.
   а) перенести ★ · б) оставить.
6. **Bottom sheet** `4770:4685` (экземпляр бывшего мастера 2314:17429, 186 узлов; п.45а «не в этом прогоне»).
   Осталось: `{Отступы:SPx3}` 12 и `{Gaps:SPx2}` 12 (itemSpacing → space-12 / space-8 по маппингу), `[Text [day]/Primary]` на shape 4, `[Icon [day]/Primary]` 3,
   сырой `#ffffff` 5 + 1 на фрейме, `#000000` 2, `#ff0000` 1, `[.blur tiny]` 1.
   а) перенести то, что есть в маппинге (отступы и два стиля); сырые и `.blur tiny` оставить ★ · б) не трогать (п.45а в силе).
7. **Sender 372** `4770:4698` (155 узлов) и **427** `4770:5024` (209): старые экраны (п.44б «не трогать целиком»).
   Там Day / Black, iOS / Subtitle, iOS / Caption, [Blue] / [Purple] / [Green], сырые `#979797` / `#232326`, картинки.
   а) оставить, п.44б в силе ★ · б) перенести по маппингу то, что в нём есть.
8. **Alert** ×2 и **Push Notification** — системные компоненты iOS: `System Colors:*`, `[Material Blur]`, `[Headline/Regular]` и т. п.
   а) оставить: это платформенный UI, не Rider ★ · б) искать соответствия.

## Ответ arturuxui (2026-11-10)

1а · 2а · 3а · 4 — `Text [day]/Warning` на фрейме → Background/Warning сразу; DRY с `TOP=200` на всех копиях, потом решить по каждому · 5а · 6а · 7б · 8а.

Правила в `migrate-styles.js` внесены 10.11: `Action/actionAccent — miniPig` → Outstanding/NRD - Body, `Text [day]/Warning` {frame} → Background/Warning.

План исполнения:
1. `build-kit` → залить тело на Drafts (новый HASH; runner тот же, можно заливкой только тела).
2. DRY `TOP=200` по 17 копиям (id — `LEDGER.md`), строки в `results/<slug>.tsv`, `CLEAN=true`, `report.mjs`. По хвосту п.4 — короткая анкета.
3. Боевой прогон (DRY=false) на копиях, где DRY показал miniPig / Text [day]/Warning (Where, Where - Migration, Show my location, Errors + найденные), затем контрольный DRY.
4. DEV-копия `4770:4437`, разовым вызовом только на копию, оригинал не трогать: Counter `4770:4725` (п.5а); Bottom sheet `4770:4685` — отступы SPx3/SPx2 и стили из маппинга, сырые и `.blur tiny` не трогать (п.6а); Sender 372 `4770:4698` и 427 `4770:5024` — всё, что есть в маппинге (п.7б). Alert/Push не трогать (8а). Снимки до/после.
