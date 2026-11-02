# Маппинг New Rider DEV — итог для прогона (2026-11-02)

Собран из `new-rider-dev.draft.md` (сравнение трёх пар «оригинал ↔ Switched»)
и ответов arturuxui 02.11 в `new-rider-dev.questions.md` (номера `п.N` — оттуда).
Файл `5mg6h0oB8yRDoUfTruogca`, библиотека-цель — «🙋‍♂️ AID Rider Tokens & Styles»
(color-sem, typography-sem, space, radius, текстовые стили, тени).

Обозначения: `[…]` — стиль, `{…}` — переменная, `#hex` — сырое значение.
Альфа привязанной заливки — альфа самой переменной, отдельно не переносится.

## 0. Правила прогона

1. **Не-фрейм ≠ `Background/*`.** На векторы, эллипсы, прямоугольники, линии и
   текст `Background/*` не вешаем — для них `Icon/*`, `Text/*`, `Stroke/*`
   (`tools/aid-style-migration/CLAUDE.md`). Если строка ниже даёт `Background/*`,
   а узел — не фрейм (FRAME, COMPONENT, INSTANCE, SECTION), замену пропускаем и
   пишем узел в список «на решение» (§8).
2. Тип узла решает выбор там, где строка разделена «текст / вектор / stroke».
3. Сырые hex меняем только из §1.4; остальное оставляем (п.26а).
4. Не трогаем: §7.
5. Прогон — по экранам; после каждого экрана скриншот и сводка «было → стало».

## 1. Цвет

### 1.1. Стили `[… [day]/…]` и старые `Day / …`

| Было | Стало (color-sem) | Источник |
|---|---|---|
| [Background [day]/Primary] — fill фрейма | Background/Primary | draft |
| [Background [day]/Primary] — stroke | Stroke/Secondary | draft |
| [Background [day]/Primary] — fill не-фрейма («🧩 background», 30×) | **§8, кандидат Icon/*** | правило 1 |
| [Background [day]/Secondary] — фрейм / не-фрейм (6×) | Background/Secondary / **§8** | draft, правило 1 |
| [Background [day]/Quaternary] | Background/Quaternary | draft |
| [Background [day]/Attention] — фрейм / вектор | Background/Attention / **§8** | draft, правило 1 |
| [Background [day]/Constant Dark Secondary] — фрейм / вектор | Background/Constant Dark Secondary / **§8** | draft, правило 1 |
| [Bg day/primary] | Background/Primary (не-фрейм — §8) | draft |
| [Text [day]/Primary] — текст / вектор | Text/Primary / Icon/Primary | draft |
| [Text [day]/Secondary] — текст / stroke | Text/Secondary / Stroke/Separator | draft |
| [Text [day]/Tertiary], [Texts day/Tertiary] | Text/Tertiary | draft |
| [Text [day]/Accent] | Text/Accent | draft |
| [Text [day]/Constant White] — текст | Text/Constant White | draft |
| [Text [day]/Constant White] — Rectangle 40902 | Icon/Constant White | п.1 |
| [Text [day]/Constant White Secondary] | Text/Constant White Secondary | draft |
| [Texts night/Primary] — вектор в tabbar | Icon/Constant White | п.18б |
| [Icon [day]/Primary] — иконки tabbar | Icon/Primary | п.14а |
| [Icon [day]/Accent] | Icon/Accent | draft |
| [Icon [day]/Secondary] | Icon/Secondary | draft |
| [Icons day/Secondary Pressed] — fill и stroke | Icon/Secondary (stroke — тоже, токен Icon на обводке иконки) | п.15а |
| [Icon [day]/Tertiary] | Icon/Tertiary | draft |
| [Icon [day]/Constant White] | Icon/Constant White | draft |
| [Icon [day]/Secondary Opposite] — Dragger element | Background/Quaternary (не-фрейм — §8) | п.16а |
| [Icons day/primary 2] — «🧩 Color background» | Icon/Primary Inverted | п.17 |
| [White] — точка в пине (Ellipse 2) | Icon/Constant White | п.2а |
| [Field [day]/Primary] | Field/Primary | draft |
| [Button [day]/Primary] | Button/Primary | draft |
| [Button [day]/Secondary] | Button/Secondary | draft |
| [Route [day]/Primary] — stroke маршрута | Route/Primary | п.19а |
| [Day / Black] — текст | Text/Primary | п.9а |
| [Day / Gray 40] — текст | Text/Tertiary | п.10а |
| [Day / Gray 60] — текст | Text/Secondary | п.11а |
| [Day / Gray 80] — fill | Pastel/Apu — **только если hex Apu = #4e4e60** (§8) | п.12а, п.8 |
| [Day / White] — fill / stroke | Icon/Constant White / Stroke/Inverted | п.13 |

### 1.2. Pastel

| Было | Стало |
|---|---|
| [Pastel [day]/Midway] | Pastel/Lenny |
| [Pastel [day]/Mantle], [Pastel [day]/Ralph] | Pastel/Ralph |
| [Pastel [day]/Liberty] | Pastel/Lisa |
| [Pastel [day]/Asphalt] | Pastel/Apu |
| [Pastel [day]/Graylord], [Pastel [day]/Barney] | Pastel/Barney |
| [Pastel [day]/Peach] | Pastel/Bart |
| [Pastel [day]/Jasper] | Pastel/Jasper |
| [Pastel [day]/Nelson] | Stories/Nelson |

### 1.3. Переменные старых коллекций

| Было | Стало | Источник |
|---|---|---|
| {Theme/text icon/primary} — текст / вектор | Text/Primary / Icon/Primary | draft |
| {Theme/text icon/secondary} | Text/Secondary | draft |
| {Theme/loader/whiteConst} | Icon/Constant White | draft |
| {Theme/bg/level 1 base}, {Color/tx-bg/level 1 base} | Background/Primary (не-фрейм — §8) | draft |
| {Theme/separator/default} — line | Background/Separator → **§8** (line — не-фрейм; кандидат Stroke/Separator) | п.21а, правило 1 |
| {Color/tx-bg/level −1 muted} | Background/Secondary (не-фрейм — §8) | п.22а |
| {Color/tx-bg/banner} — Badge | Background/Pill Secondary (не-фрейм — §8) | п.23а |
| {Color/tx-accent/grey/primary} — текст / вектор | Text/Primary / Icon/Primary | draft, п.24а |
| {Color/tx-accent/grey/primary} — «Shadow» | Background/Constant Dark (не-фрейм — §8) | п.5а |
| {Color/tx-accent/grey/light strong} | Icon/Constant White | draft |
| {Color/tx-accent/red/fg} | Icon/Warning | draft |
| {Color/tx-notifications/bg-error} | Background/Zone Warning (не-фрейм — §8) | draft |
| {Variable collection/Accent Purple} — текст / вектор | Text/Accent / Icon/Accent | draft |
| {Variable collection/Neon Green} — текст / stroke | Text/Neon / Stroke/Neon | draft |
| {Variable collection/BG Dark} — Selector | Background/Constant Dark | п.20а |

### 1.4. Сырые значения (меняем только эти)

| Было | Стало | Источник |
|---|---|---|
| #ffffff — фон фрейма | Background/Primary | draft |
| #ffffff — цифра в пине (текст) | Text/Constant White | п.3а |
| #ffffff — Divider в tabbar (stroke) | Stroke/Secondary | п.4а |
| #ffffff@0.9, #f5f5f5@0.6 — NavBar | Background/Navbar | draft |
| #ededed — Tab | Background/Tab Selected | draft |
| #000000@0.3 | Background/Overlay (не-фрейм — §8) | draft |
| #000000@0.87, #0f0f1f@0.9 — вектор / текст | Icon/Primary / Text/Primary | draft |
| #100f25, #2f2e43 — Status Multiple | Icon/Primary | draft |
| #8526ff, #7e00e6 | Icon/Accent | draft |
| #8526ff@0.12 — круг Radius в пине | Icon/Accent + слою непрозрачность 12 % | п.6а |
| #000000 — Shadow в пинах | Technical/Visible Deep | п.25а |
| #8f69ff, #734edf — stroke | Stroke/Zone Availability | draft |
| #aaff00 — stroke | Stroke/Neon | draft |
| #4e4e60 — stroke | Pastel/Apu — только если hex совпал (§8) | п.8 |
| #ededff | Pastel/Milhouse | draft |
| #ffefeb | Pastel/Tony | draft |
| #19191d@0.5, #ededff@0.7 — зоны | **не трогать** в этом прогоне (на Taxi нет) | п.7 |

## 2. Типографика

| Было | Стало | Источник |
|---|---|---|
| Старые копии: Bodies/Body 2, Body 3, Subtitles/Subtitle 1/2/3, Titles/Title 4 | новый стиль с тем же именем | п.27а |
| [Bodies/Body 3 Reg] | [Bodies/Body 3] | draft |
| [Caption/caption] ALS Hauss 11/14 — tabbar | [Captions/Caption 2] (+2 px) | п.28а |
| [iOS / Subtitle] 16/16, 16/18 | [Outstanding/iOS - Subtitle] | п.29а |
| [iOS / Caption] 14/16 | [Bodies/Body 3] | п.30а |
| [iOS / H3] 20/24 | [Titles/Title 3] | п.31а |
| [Title/title2] ALS Hauss Bold 19/23 — Map Pin | [Outstanding/Title-title2 (NRD)] | п.32а |
| Сырой SF Pro Text Semibold 17/20 — «поиск» | [Outstanding/NRD - Body] (уже на ~13 px) | п.33а |
| Сырой SF Pro Text Semibold 12/16, капитель | [Captions/Caption 1 CAP] | п.34а |
| Сырой SF Pro Text Regular 14/16 — «На несколько адресов» | [Bodies/Body 3] | п.35а |
| Сырой SF Pro Display Semibold 22/22 — там же | [Titles/Title 4] (строка 22 → 28) | п.35а |
| Стили `[?]` из отключённой библиотеки | оставить, вывести списком | п.36а |
| [Bodies/Body 2] → [Subtitles/Subtitle 2] в List Item (Where) | не правило, не переносим | draft |

## 3. Эффекты

| Было | Стало | Источник |
|---|---|---|
| [Shadows/[day] Medium] | Shadows/Medium | п.37а |
| [Shadows/[day] Large] | Shadows/Large | п.37а |
| [Shadows / Brand button] | снять | п.38б |
| [Shadow 6] — BottomSheet | Shadows/Bottom Sheet | п.39а |

## 4. Отступы и радиусы

| Было | Стало | Источник |
|---|---|---|
| {Gaps/SPx2} = 8 | space/space-8 | п.40а |
| {Gaps/SPx3}, {Отступы/SPx3} = 12 | space/space-12 | п.40а |
| {Corner radius/BRx6} = 24 | radius/radius-24 | п.40а |
| {System/…}, {Breakpoint/…}, {Locale · Font Family/…} | уходят вместе со стилями §2 | п.41а |
| Любая старая переменная отступа (gap, padding) со значением N | space/space-N, если такая есть в библиотеке | arturuxui 02.11, скан Drafts |
| Любая старая переменная радиуса (углы) со значением N | radius/radius-N, если такая есть в библиотеке | arturuxui 02.11, скан Drafts |

Правило «то же значение»: значение старой переменной берётся по первому режиму, алиасы
раскрываются. Нет `space-N` / `radius-N` с тем же N — не трогаем, в список (в Drafts это
`Button:Border radius`=18, `System:Magin Top`=54, CRx10=40).

## 7. Не трогаем

- Системный iOS: Alert 2314:17569, 2314:18840; Push Notification 2314:18618 (п.42а).
- Карта: подписи SF Pro Display 10/20 и 11/20, фигуры, картинки, градиенты (п.43а).
- Экраны «Sender 372» 2314:18094 и «427» 2314:18619 — целиком (п.44б).
- Мастер Bottom sheet 2314:17429 (п.45а).
- Status bar, home indicator, клавиатуры, Car.
- Зоны #19191d@0.5 / #ededff@0.7 (п.7).

## 8. На решение до прогона

Сверено 02.11 чтением файла (страницы Where и GEO Switched, без правок).
Значения — Day / Night. Скоупы библиотеки `Background/*` допускают SHAPE_FILL:
правило 1 — решение arturuxui, а не ограничение библиотеки.

**8.1. Hex Pastel/Apu** = #4e4e60 / #2d2d38 — совпал. п.12 (fill) → Pastel/Apu.
п.8 (stroke) — **нельзя**: скоупы Apu `FRAME_FILL, SHAPE_FILL`, без STROKE.
Stroke/Primary = #e9eaee / #393944 — другой цвет. Варианты: а) оставить сырым ★ ·
б) Stroke/Primary (обводка посветлеет) · в) предложение токена.

**8.2. Кандидаты для `Background/*` на не-фреймах**

| Узел (было) | Значение было | Кандидат | Значение кандидата | Оценка |
|---|---|---|---|---|
| «🧩 background», [Background [day]/Primary] (30×) | #fff / #202024 | Icon/Primary Inverted ★ | #fff / #0f0f1f@0.87 | день совпал, ночь близко; Icon/Constant White ночью остаётся белым — хуже |
| line, {Theme/separator/default} (3×) | #777788@0.5 | Stroke/Separator ★ | #777788@0.20 / @0.30 | = Background/Separator; у Stroke/Separator есть SHAPE_FILL |
| Dragger element, [Icon [day]/Secondary Opposite] | #e9eaee | Icon/Disabled ★ | #0f0f1f@0.26 / #fff@0.16 | день = Background/Quaternary, как у остальных Dragger |
| вектор, [Background [day]/Attention] | #ffc700 | Icon/Attention | не сверено | в файле не используется |
| вектор, [Background [day]/Constant Dark Secondary] | #393944 | Icon/Constant Black? | не сверено | точного Icon нет — пробел |
| векторы, [Background [day]/Secondary] (6×) | #f5f5f5 / #2a2a31 | — | — | Icon-аналога нет — пробел |
| «Shadow», {Color/tx-accent/grey/primary} | тёмный | Technical/Visible Deep (#000, ALL_FILLS) | #000 / #000 | как п.25; или Icon/Constant Black (не сверено) |
| #000000@0.3 на прямоугольнике | #000@0.3 | — | — | Icon-аналога Overlay нет — пробел |
| Badge {Color/tx-bg/banner}, Zone Warning | — | — | — | проверить на прогоне: скорее фреймы, тогда правило не задевает |

Не сверены: Icon/Attention, Icon/Constant Black, Icon/Secondary Inverted и другие,
которых нет на страницах файла. Узнать значение — импортировать переменную из
библиотеки в файл (без привязки); это запись в файл, только по «да».

Пробелы (Background/Secondary, Constant Dark Secondary, Overlay на не-фреймах):
а) оставить старый стиль, список после прогона ★ · б) исключение из правила 1 ·
в) предложение токенов `Icon/*` в Standards одной анкетой.

**8.3. [Day / White] на фрейме** (п.13 сказан для fill без разбора типа): на фрейме
Icon/* не ставим — предлагаю Background/Constant White (#fff / #fff) ★.

**Ответ arturuxui 02.11: «да, по ★».** Итог:
- #4e4e60 на обводке — оставить сырым (8.1а);
- «🧩 background» → Icon/Primary Inverted; line {Theme/separator/default} → Stroke/Separator;
  Dragger → Icon/Disabled; вектор Attention → Icon/Attention (значение не сверено, импорт
  для сверки не разрешён — на прогоне не ставим, в список);
- Background/Secondary, Constant Dark Secondary, Overlay, «Shadow» на не-фреймах —
  оставить старый стиль, вывести списком после прогона (пробелы, а);
- [Day / White] на фрейме → Background/Constant White.

## 9. New Rider Drafts (2026-11-02)

Анкета — `new-rider-drafts.questions.md` (31 п.). **Ответ arturuxui 02.11: «принять все ★».**
Правила внесены в `scripts/migrate-styles.js` (блок `setAll`, `FX_MAP`, `RAWFX`). Важное:
- `Color:tx-accent/grey/light strong` на векторе теперь Icon/Primary Inverted (было Icon/Constant White, §1.3):
  переменная инвертируется ночью (п.9).
- Лиловый a73afd → токены Accent AID 8526ff (п.17) — заметная смена оттенка.
- Icon/Attention (жёлтый, п.20) и Background/Constant Dark (п.7) не сверены: сверить на сухом прогоне.
- Shadows/Small: ключ нового стиля не известен — до его получения строки п.24–25 пропускаются.
- Не трогаем: тонированные фоны, бренд-зелёный, синий, оверлей на векторах, iOS-системные,
  карта, тени без аналога, размытия, градиенты.
