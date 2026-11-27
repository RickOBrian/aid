# Маппинг New Rider DEV — черновик (2026-10-30)

Источник: сравнение пар «оригинал ↔ — Switched Styles» по узлам (GEO Problems,
Service coverage, Where 🗺️), файл `5mg6h0oB8yRDoUfTruogca`. Цель — библиотека
с коллекциями `color-sem`, `typography-sem`. Не утверждён `arturuxui`.

Обозначения: `[…]` — стиль, `{…}` — переменная, `#hex` — сырое значение.
Прозрачность у привязанной заливки не учитывается: это альфа самой переменной
(например, у `Text/Primary` в Day альфа 0.87).

## 1. Цвет — однозначно

| Было | Стало (color-sem) | Где видели |
|---|---|---|
| [Background [day]/Primary] (fill) | Background/Primary | все 3 |
| [Background [day]/Primary] (stroke) | Stroke/Secondary | все 3 |
| [Background [day]/Secondary] | Background/Secondary | все 3 |
| [Background [day]/Quaternary] | Background/Quaternary | GEO |
| [Background [day]/Attention] | Background/Attention | GEO |
| [Background [day]/Constant Dark Secondary] | Background/Constant Dark Secondary | GEO |
| [Bg day/primary] | Background/Primary | все 3 |
| [Text [day]/Primary] — текст | Text/Primary | все 3 |
| [Text [day]/Primary] — вектор | Icon/Primary | GEO |
| [Text [day]/Secondary] — текст | Text/Secondary | все 3 |
| [Text [day]/Secondary] — stroke | Stroke/Separator | GEO |
| [Text [day]/Tertiary], [Texts day/Tertiary] | Text/Tertiary | GEO, Where |
| [Text [day]/Accent] | Text/Accent | все 3 |
| [Text [day]/Constant White] — текст | Text/Constant White | все 3 |
| [Text [day]/Constant White Secondary] | Text/Constant White Secondary | все 3 |
| [Icon [day]/Accent] | Icon/Accent | все 3 |
| [Icon [day]/Secondary] | Icon/Secondary | все 3 |
| [Icon [day]/Tertiary] | Icon/Tertiary | все 3 |
| [Icon [day]/Constant White] | Icon/Constant White | все 3 |
| [Field [day]/Primary] | Field/Primary | все 3 |
| [Button [day]/Primary] | Button/Primary | все 3 |
| [Button [day]/Secondary] | Button/Secondary | GEO |
| [Day / Black] | Text/Primary | Where |
| [Day / Gray 80] | Pastel/Apu | Where |
| [Pastel [day]/Midway] | Pastel/Lenny | все 3 |
| [Pastel [day]/Mantle] | Pastel/Ralph | все 3 |
| [Pastel [day]/Ralph] | Pastel/Ralph | все 3 |
| [Pastel [day]/Liberty] | Pastel/Lisa | все 3 |
| [Pastel [day]/Asphalt] | Pastel/Apu | все 3 |
| [Pastel [day]/Graylord] | Pastel/Barney | все 3 |
| [Pastel [day]/Barney] | Pastel/Barney | все 3 |
| [Pastel [day]/Peach] | Pastel/Bart | все 3 |
| [Pastel [day]/Jasper] | Pastel/Jasper | GEO |
| [Pastel [day]/Nelson] | Stories/Nelson | GEO |
| {Theme/text icon/primary} — текст | Text/Primary | все 3 |
| {Theme/text icon/primary} — вектор | Icon/Primary | все 3 |
| {Theme/text icon/secondary} | Text/Secondary | все 3 |
| {Theme/loader/whiteConst} | Icon/Constant White | все 3 |
| {Theme/bg/level 1 base}, {Color/tx-bg/level 1 base} | Background/Primary | GEO, Where |
| {Color/tx-accent/grey/primary} — текст | Text/Primary | все 3 |
| {Color/tx-accent/grey/light strong} | Icon/Constant White | Service, Where |
| {Color/tx-accent/red/fg} | Icon/Warning | Service, Where |
| {Color/tx-notifications/bg-error} | Background/Zone Warning | Where |
| {Variable collection/Accent Purple} — вектор | Icon/Accent | все 3 |
| {Variable collection/Accent Purple} — текст | Text/Accent | все 3 |
| {Variable collection/Neon Green} — текст / stroke | Text/Neon / Stroke/Neon | Where |
| #ffffff — фон фрейма | Background/Primary | все 3 |
| #ffffff@0.9, #f5f5f5@0.6 | Background/Navbar | все 3 |
| #ededed (Tab) | Background/Tab Selected | все 3 |
| #000000@0.3 | Background/Overlay | все 3 |
| #000000@0.87, #0f0f1f@0.9 | Icon/Primary / Text/Primary | Where, Service |
| #100f25, #2f2e43 (Status Multiple) | Icon/Primary | GEO, Where |
| #8526ff, #7e00e6 | Icon/Accent | Where |
| #8f69ff, #734edf (stroke) | Stroke/Zone Availability | Service |
| #aaff00 (stroke) | Stroke/Neon | Service |
| #ededff | Pastel/Milhouse | Service |
| #ffefeb | Pastel/Tony | Where |

## 2. Цвет — конфликты (нужно решение)

| Было | Варианты | Где |
|---|---|---|
| [Text [day]/Constant White] на Rectangle 40902 | Background/Primary (GEO, Service) · Icon/Primary Inverted (Where) | |
| [White] (Ellipse 2 в пине) | Icon/Constant White (GEO, Service) · Icon/Primary Inverted (Where) | |
| #ffffff — текст «6» в пине | Text/Constant White (Service) · Text/Primary Inverted (GEO, Where) | |
| #ffffff — stroke Divider в tabbar | Stroke/Secondary (GEO, Where) · Stroke/Separator (Service) | |
| {Color/tx-accent/grey/primary} на «Shadow» | Background/Constant Dark (Service, Where) · Background/Primary (GEO, 10×) | |
| #000000 на «Shadow» в пинах | Technical/Visible Deep (Where, 206×) — на других страницах не меняли | |
| #8526ff@0.12 (Radius) | Icon/Accent — теряется прозрачность 12 %, визуально другой круг | Where |
| #19191d@0.5 и #ededff@0.7 (Zone) | оба → Background/Zone Available | Service |
| #4e4e60 (stroke) | Pastel/Apu — переменная фона на обводке | Where |

## 3. Типографика

| Было | Стало | Примечание |
|---|---|---|
| R: SF Pro Text Semibold 17/20 | [Outstanding/NRD - Body] | ширина «поиск» 107 → 94 |
| [Caption/caption] | [Captions/Caption 2] | только Where; в GEO и Service оставлен |
| [Bodies/Body 3 Reg] | [Bodies/Body 3] | Service |
| [Subtitles/Subtitle 3] (старый) | [Subtitles/Subtitle 3] (новый) | одинаковые имена в двух библиотеках |
| [Bodies/Body 2] → [Subtitles/Subtitle 2] | 6× Title в List Item, Where | похоже на ручную правку, не правило |

Новые стили (привязаны к `typography-sem`): Subtitles/Subtitle 2, Bodies/Body 2,
Titles/Large Title. У Titles/Title 4 и Subtitles/Subtitle 3 привязок нет — библиотека не определена.

## 4. Эффекты

[Shadows / Brand button] на кнопке — снят без замены (GEO). [Shadows/Medium] — снят один раз (Service).

## 5. Не заменялось ни на одной странице

- Отступы и радиусы: {Отступы/SPx3}, {Gaps/SPx2} рядом с новыми {space/*}, {radius/*}.
- [Icon [day]/Primary], [Icons day/Secondary Pressed] (tabbar).
- Сырые цвета и шрифты карты (#c4c4c4, #e6e3e9, #000000@0.12, SF Pro Display 10/20 и 11/20).
