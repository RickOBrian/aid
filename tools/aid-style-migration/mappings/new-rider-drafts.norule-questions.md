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

## Исполнение 10.11

- Шаг 1: тело на Drafts, HASH 1247608780.
- Шаг 2: DRY `TOP=200` на 17 копиях (в tsv не писался: узлы не меняются, боевые блоки ниже).
- Шаг 3: боевой прогон на 9 копиях, блоки в `results/*.tsv` (TOP=60, без столбца id), `report.mjs`.
  miniPig → Outstanding/NRD - Body: Navigation 198, Where 129, Where - Migration 129, Show my location 81, Errors 16, Tariffs 4, Illustrations 2 (559).
  `Text [day]/Warning` на фрейме → Background/Warning: Where 6, Where - Migration 6, Service coverage 6, Permissions 1 (19).
  Контрольный DRY: 0 на 7 копиях; на Where и Where - Migration по 74 — прежние 73 плюс один miniPig («4 мин») в том же вложенном инстансе `I…429115`, это не заменить.
  Планы и итоги `mig` со всех 17 копий сняты. Шаг 4 (DEV) — не начат.

## Хвост п.4 — короткая анкета (2026-11-10)

Счёт — DRY `TOP=200` 10.11; на Navigation 680 причин ниже порога, там могут быть ещё.

9. **`[Captions/Caption 3]`** (стиль текста) — 159: Where 43, Where - Migration 43, Navigation 35, Show my location 22, Order Flow 12, Service coverage 4.
   Плюс в Profile `[Caption 3/Regular]` 4 и `[Caption 3/Medium]` 3. Значение: SF Pro Semibold 12/16, трекинг 0 (образец «Где я» в Badge Map `5374:88737`).
   В библиотеке такого нет: Caption 1 — SF Pro Text **Regular** 12/16, Caption 1 CAP — Semibold 12/16, но капителью, Caption 2 — Medium 11/14.
   а) не трогать, записать пробел типографики (Semibold 12/16) ★ · б) Captions/Caption 1 (вес падает до Regular) · в) Captions/Caption 1 CAP (регистр меняется).
10. **`{theme:bg/accentSecondary}`** на фрейме — 30: Where 11, Where - Migration 11, Service coverage 6, Errors 2. Значение `f2e6fe` / ночь `2f2640`, образец — Chip `5374:89096` (выбранный чип).
    Кандидаты: Tint/Accent `f9edff / 3c235b` (тот же фиолетовый оттенок и ночью) · Pastel/Milhouse `efe7f9 / 3f3d42` (днём ближе, ночью серый).
    а) Tint/Accent ★ · б) Pastel/Milhouse · в) пробел токена.
    Рядом в Profile `{Theme:controls/bg/accentSecondaryLight/pressed}` 2 — а) туда же, Tint/Accent ★ · б) оставить.
11. **`[Gradients/Top]`** на shape — 4, только Service coverage. Белая растушёвка сверху `ffffff@0.78 → 0` на прямоугольнике «Whitener» 390×116 `5374:88636`.
    Стиль удалённый, в нашей библиотеке из градиентов знаю только Gradients/Shimmer.
    а) оставить, записать пробел ★ · б) искать соответствие в библиотеке градиентов отдельно.
12. **`[Button [day]/Warning]`** на фрейме — 2, Taxi for friends (`5374:895587`, `5374:897379`).
    а) Background/Warning, как п.4 ★ · б) оставить.

## Ответ arturuxui на п.9–12 и исполнение (2026-11-10)

Ответ: 9 — создать `Captions/Caption 1 Semibold` (SF Pro Semibold 12/16, трекинг 0) и привязать `Captions/Caption 3`; 10а; 11 — использовать библиотечный `Gradients/Top`; 12а. Дополнительно: узлы с именем, начинающимся на «❌», не сканируются (узел и всё поддерево).

**Библиотека Rider (`yrfG6u9osujKX8e1B14lpT`), создано, не опубликовано:**
- Текстовый стиль `Captions/Caption 1 Semibold`, ключ `5ef7e054f947aab99fce088cee9e2ed25465f776`: SF Pro Text Semibold 12/16, трекинг 0, регистр обычный.
- Шесть переменных в `typography-sem` (режимы iOS/Android), скрыты от публикации, как у Caption 1 CAP: `Captions/Caption 1 Semibold/{font-family, font-size, font-weight, line-height, letter-spacing, paragraph-spacing}`. Алиасы на typography-core те же, что у Caption 1 CAP: семейство 3:29/3:27, размер 3:30 (12), вес 3:41 (Semibold), интерлиньяж 3:43 (16), трекинг 3:54, абзац 3:61. Новых core-значений не понадобилось.
- Публиковать библиотеку нужно человеку. Пока не опубликована, `importStyleByKeyAsync` падает («Style with key … not found»), поэтому на копиях `Captions/Caption 3` не заменён: правило внесено, узел попадает в пропуски с причиной «стиль не импортируется (не опубликован)» (Where 43, Where - Migration 43, Service coverage 4, Navigation, Show my location, Order Flow — часть ниже порога). После публикации — повторный прогон на этих копиях.
- `Caption 3/Regular` и `Caption 3/Medium` (Profile) — не Semibold 12/16, а ALS Hauss VF 10/16 (Regular и Medium): не маппятся, остаются без правила.

**Правила `migrate-styles.js`:**
- `Captions/Caption 3` → `Captions/Caption 1 Semibold` (ждёт публикации).
- `{theme:bg/accentSecondary}` и `{Theme:controls/bg/accentSecondaryLight/pressed}` на фрейме → Tint/Accent.
- `[Button [day]/Warning]` на фрейме → Background/Warning.
- `[Gradients/Top]`: стиль на 4 прямоугольниках «Whitener» в Service coverage — уже библиотечный (ключ `60768af36ab7413fa8e0b2bdb8f5c47a01d4893f`, удалённым не был). Замены не нужно: правило (импорт по ключу и `setFillStyleIdAsync`) оставлено на случай копий с другим ключом, на совпадающий ключ молчит. Прежняя причина «[Gradients/Top] — нет в маппинге» ушла.
- Пропуск узла и поддерева с именем на «❌» — в обходе `migrate-styles.js` и в разбиении корней `run-page.js`.

**Прогон (HASH 1347609489):** DRY → CLEAN → боевой → контрольный DRY → CLEAN.
Заменено: `theme:bg/accentSecondary` → Tint/Accent: Where 11, Where - Migration 11, Navigation 6, Service coverage 6, Errors 2 (36); `accentSecondaryLight/pressed` → Tint/Accent: Profile 2; `Button [day]/Warning` → Background/Warning: Taxi for friends 2. Итого 40. Show my location и Order Flow боевым прогоном не гонялись: по DRY новых замен 0 (только Caption 3 до публикации).
Контроль: 0 на Navigation, Service coverage, Errors, Profile, Taxi for friends; на Where и Where - Migration по 74 (тот же остаток во вложенном инстансе `I…429115`).

## Стили для старых Caption 3/Regular и Caption 3/Medium (2026-11-10)

Задача arturuxui: старые `Caption 3/Regular` и `Caption 3/Medium` из Profile (ALS Hauss VF 10/16, трекинг 0 %, регистр обычный) заменить нашими стилями с теми же метриками, но гарнитурой Caption 1 (SF Pro Text на iOS, Roboto на Android — переменная font-family, как у Caption 1).

Имена `Captions/Caption 3` и `Captions/Caption 3 Medium` в библиотеке были свободны (ни стиля, ни переменных). Оговорка: на копиях всё ещё висит прежний стиль с тем же именем `Captions/Caption 3` (ключ `a51b3a21…`, SF Pro Semibold 12/16, удалён из библиотеки), и по п.9 он маппится на `Captions/Caption 1 Semibold`. Новый `Captions/Caption 3` (Regular 10/16) — другой стиль под тем же именем; правила различают их по ключу и имени-источнику, но людям это путать не стоит.

**Создано в библиотеке Rider, не опубликовано:**
- `Captions/Caption 3` — SF Pro Text Regular 10/16, трекинг 0, ключ `0ef7069b3e53687e26689565e2596e45d8312cfe`.
- `Captions/Caption 3 Medium` — SF Pro Text Medium 10/16, трекинг 0, ключ `1e8270a4e9882df354b5d44debaa19452abc2029`.
- `typography-core`: новая `Font Size/fs-10` = 10 (id `1778:195`, скоуп FONT_SIZE, скрыта от публикации, как fs-11). Размера 10 в core не было; остальные значения — существующие: ff-sf-pro-text (3:29) / ff-roboto (3:27), fw-400 (3:39) / fw-500 (3:40), lh-16 (3:43), ls-0 (3:54), ps-0 (3:61).
- `typography-sem` (iOS/Android), по 6 переменных на стиль, скоупы по образцу Caption 1 Semibold, скрыты от публикации: `Captions/Caption 3/{font-family, font-size, font-weight, line-height, letter-spacing, paragraph-spacing}` и `Captions/Caption 3 Medium/{…}`.

**Правила `migrate-styles.js`:** `Caption 3/Regular` → `Captions/Caption 3`, `Caption 3/Medium` → `Captions/Caption 3 Medium`. Ключи в NEWTS. Тело залито на figma.root Drafts, HASH 1839953805. Копии не гонялись: сначала публикация библиотеки (вместе с `Captions/Caption 1 Semibold`), потом прогон.

## Прогон Caption после публикации библиотеки (2026-11-11)

arturuxui опубликовал библиотеку Rider: `Captions/Caption 1 Semibold`, `Captions/Caption 3`, `Captions/Caption 3 Medium` импортируются по ключу. Тело на Drafts — HASH 1839953805. Порядок: CLEAN → DRY → CLEAN → боевой (TOP=60, столбец id срезан) → CLEAN → контрольный DRY → CLEAN, по 7 копиям.

Заменено (всего 160 + 7 = 167):
- `[Captions/Caption 3]` → Captions/Caption 1 Semibold: Where 43, Where - Migration 43, Navigation 35, Show my location 22, Order Flow 12, Service coverage 4, Profile 1 (159 + 1 = 160).
- `[Caption 3/Regular]` → Captions/Caption 3: Profile 4.
- `[Caption 3/Medium]` → Captions/Caption 3 Medium: Profile 3.
- Прочее в блоках (Where и Where - Migration по 74) — прежние замены, которые не удержались во вложенном инстансе (в «replaced» они входят, как раньше).

Контроль (DRY после прогона): 0 на Navigation, Show my location, Order Flow, Service coverage, Profile; на Where и Where - Migration по 74 — прежний остаток во вложенном инстансе `I…429115`.
Navigation: экраны «❌ Главная страница» (5 узлов) пропускаются обходом; счёт узлов и пропусков там 104 773 / 26 963 (без Caption 3 было 26 998), прежнее падение уже учтено в прогоне 10.11.
Планы `mig` на страницах сняты; на figma.root Drafts остаются body/runner/hash.
