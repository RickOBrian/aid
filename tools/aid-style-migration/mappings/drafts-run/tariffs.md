# Tariffs — прогон переноса стилей (2026-11-02)

- Оригинал: `628:199856` («⌛️ Tariffs», 67 корней, 2762 узла); копия «⌛️ Tariffs — Switched Styles»: `5374:563482` (2760 узлов).
- Файл `eSitSKeHzy5fOUF1n3zg2B`, сессия `aecd2cb1-f899-4bd9-b7ed-82fbc8787c94`.
- **Копия уже существовала** к началу прогона (дубль не создавался), и перенос на ней **уже был выполнен ранее**: все три порции ниже вернули `done: []` (идемпотентный прогон ничего нового не заменил). Кто и когда выполнил прошлый прогон — не известно (отчёта в `drafts-run/` нет).
- Порций: 3 (корни 0–34: 865 узлов; 35–49: 1028 узлов; 50–66: 562 узла); всего обойдено 2455 узлов (исключения EX — status bar, home indicator, map, car, keyboard). Ошибок нет (причин `ошибка:` нет). В копии 2 узла меньше, чем в оригинале (2760 против 2762) — причина не выяснялась.
- Скриншот первого корня «Tariffs» (scale 0.5) — вид цел.
- Заменено в этом прогоне: 0. Не заменено: 1058 (по `skipByRoot`; 147 различных причин).

## Заменено

В этом прогоне заменено 0 (всё применимое было перенесено до него). Косвенная оценка сделанного раньше, чтение до/после:

| показатель | оригинал | копия |
|---|---|---|
| заливки/обводки, привязанные к переменной `color-sem` | 44 | 580 |
| заливки/обводки, привязанные к старым коллекциям (Theme, theme, Theme TX, Color, Variable collection; System Colors — 41 в обоих — не считаны) | 218 | 27 |
| привязки отступов/радиусов (любые коллекции) | 187 | 187 |
| текст с библиотечным (remote) стилем | 234 | 234 |

Таблицу «причина → кол-во» по замене получить нельзя: прогон был пустой.

## Не заменено

Сложено по причине из трёх порций. Колонка ID не заполнена: в ответах порций ID были (до 50 на причину), но в отчёт для этой страницы перенесены только счётчики; для точечной проработки повторный вызов `migrate-styles.js` (идемпотентен) на нужных корнях отдаёт ID заново.

| причина | кол-во |
|---|---|
| сырой #000000 [shape] | 140 |
| сырой #ffffff [shape] | 91 |
| сырой #000000 [stroke] | 79 |
| сырой #232326 [shape] | 55 |
| сырой #979797 [shape] | 47 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.10 | 33 |
| шрифт без стиля: SF Pro Text Regular 15/20 | 28 |
| шрифт без стиля: SF Pro Text Semibold 17/24 | 27 |
| [ Night / White] [shape] — нет в маппинге | 22 |
| [iOS / H4] — нет в маппинге | 21 |
| [Orange] [shape] — нет в маппинге | 15 |
| сырой #ffffff [text] | 15 |
| градиент [shape] | 14 |
| сырой #cacacc [shape] | 14 |
| [Day / White] [text/text] — нет правила | 13 |
| сырой #000518@0.08 [shape] | 12 |
| шрифт без стиля: SF Pro Text Semibold 16/16 | 12 |
| шрифт без стиля: SF Pro Text Medium 16/16 | 12 |
| сырой эффект: drop 0,4 r12 s0 #000000@0.15 | 12 |
| сырой #d8d8d8 [shape] | 11 |
| сырой #979797 [stroke] | 11 |
| сырой #ffffff [stroke] | 10 |
| шрифт без стиля: SF Pro Text Regular 17/24 | 10 |
| [Blue] [shape] — нет в маппинге | 9 |
| [Buttons day/Primary] [frame] — нет в маппинге | 9 |
| сырой #ff7200 [shape] | 9 |
| сырой #262626 [text] | 9 |
| [Fill / Light Grey] [shape] — нет в маппинге | 8 |
| градиент [frame] | 7 |
| сырой #ff5f00 [shape] | 7 |
| сырой #eb001b [shape] | 7 |
| сырой #f79e1b [shape] | 7 |
| [Day / Gray 4] [stroke] — нет в маппинге | 7 |
| [Description/descriptionAccent — lion] — нет в маппинге | 6 |
| сырой эффект: drop 0,-4 r8 s0 #000000@0.10 | 6 |
| сырой #8526ff [stroke] | 6 |
| сырой эффект: layer_blur | 6 |
| сырой #989898 [shape] | 6 |
| сырой эффект: drop 0,1 r2 s0 #000000@0.20 | 6 |
| эффект [shadow/diffuse/m] — нет в маппинге | 6 |
| сырой #000518@0.03 [shape] | 5 |
| сырой #ebecf0 [shape] | 5 |
| сырой #00579f [shape] | 5 |
| {Скругления:CRfull}=100 topLeftRadius — нет цели | 4 |
| {Скругления:CRfull}=100 topRightRadius — нет цели | 4 |
| {Скругления:CRfull}=100 bottomLeftRadius — нет цели | 4 |
| {Скругления:CRfull}=100 bottomRightRadius — нет цели | 4 |
| [Action/actionAccent — miniPig] — нет в маппинге | 4 |
| градиент [text] | 4 |
| сырой #3458e9 [stroke] | 4 |
| сырой #4f8ce4 [stroke] | 4 |
| сырой эффект: drop 0,2 r8 s0 #000518@0.12 | 4 |
| сырой эффект: drop 0,4 r16 s0 #000000@0.06 | 4 |
| шрифт без стиля: SF Pro Text Medium 12/auto | 4 |
| [Day / Gray 20] [stroke] — нет в маппинге | 4 |
| сырой эффект: drop 0,3 r1 s0 #000000@0.06 + drop 0,3 r8 s0 #000000@0.15 | 4 |
| сырой #ffffff@0.40 [shape] | 4 |
| шрифт без стиля: SF Pro Display Medium 16/16 | 4 |
| сырой эффект: drop 0,1 r30 s0 #000000@0.12 + drop 0,6 r14 s0 #000000@0.16 | 4 |
| сырой #232326 [text] | 4 |
| {theme:icon/contraste} [shape] — нет в маппинге | 3 |
| эффект [Shadow Up] — нет в маппинге | 3 |
| {Скругления:CRx0}=0 topLeftRadius — нет цели | 3 |
| {Скругления:CRx0}=0 topRightRadius — нет цели | 3 |
| [iOS / H2] — нет в маппинге | 3 |
| [iOS / Body] — нет в маппинге | 3 |
| сырой #e9e9ed [stroke] | 3 |
| [Fill / Light] [shape] — нет в маппинге | 3 |
| шрифт без стиля: SF Pro Display Regular 22/28 | 3 |
| сырой #100f25 [shape] | 3 |
| сырой #c4c4c4 [shape] | 3 |
| сырой #262626 [shape] | 3 |
| [Day / Gray 40] [shape/shape] — нет правила | 3 |
| сырой эффект: drop 0,2 r12 s0 #ab01e0@0.05 + drop 2,2 r12 s0 #ab01e0@0.12 | 3 |
| сырой #9747ff [stroke] | 3 |
| [Green] [shape] — нет в маппинге | 3 |
| {Скругления:CRx0}=0 bottomLeftRadius — нет цели | 2 |
| {Скругления:CRx0}=0 bottomRightRadius — нет цели | 2 |
| [Display/display — whale] — нет в маппинге | 2 |
| {Скругления:BRfull}=100 topLeftRadius — нет цели | 2 |
| {Скругления:BRfull}=100 topRightRadius — нет цели | 2 |
| {Скругления:BRfull}=100 bottomLeftRadius — нет цели | 2 |
| {Скругления:BRfull}=100 bottomRightRadius — нет цели | 2 |
| [Action/action— capybara] — нет в маппинге | 2 |
| [Title/title2 — pig] — нет в маппинге | 2 |
| шрифт без стиля: SF Pro Bold 15/18 | 2 |
| шрифт без стиля: SF Pro Semibold 15/18 | 2 |
| сырой #ffc800 [stroke] | 2 |
| [Day / Gray 4] [frame] — нет в маппинге | 2 |
| [Gradients [day]/Primary] [frame] — нет в маппинге | 2 |
| градиент [stroke] | 2 |
| сырой эффект: drop 0,-2 r12 s0 #000000@0.06 | 2 |
| сырой #4e4e60 [shape] | 2 |
| сырой #4e4e60 [stroke] | 2 |
| сырой #3458e9@0.10 [shape] | 2 |
| сырой эффект: drop 0,2 r4 s0 #1d162d@0.14 | 2 |
| [iOS / Subtitle L] — нет в маппинге | 2 |
| [Day / Gray 4] [shape] — нет в маппинге | 2 |
| сырой #e84342 [shape] | 2 |
| сырой #2787f5 [shape] | 2 |
| шрифт без стиля: SF Pro Text Bold 16/16 | 2 |
| сырой #ff7200 [text] | 2 |
| сырой #eaeaea [frame] | 2 |
| сырой #6d6f75 [text] | 2 |
| [Night / Gray 20] [shape] — нет в маппинге | 2 |
| сырой эффект: drop 0,7 r24 s0 #000000@0.29 | 2 |
| сырой #545665 [shape] | 2 |
| {Theme TX:tx-bg/map} [frame] — нет в маппинге | 1 |
| {Theme:bg/blackConst} «Shadow» — пробел | 1 |
| {Corner Radius:CRx0}=0 bottomLeftRadius — нет цели | 1 |
| {Corner Radius:CRx0}=0 bottomRightRadius — нет цели | 1 |
| сырой #ffffff@0.31 [frame] | 1 |
| эффект [Background Blur/Ultra Thin] — нет в маппинге | 1 |
| [Body/body] — нет в маппинге | 1 |
| эффект [Shadow Surface] — нет в маппинге | 1 |
| {Theme:bg/accentLight} [frame] — нет в маппинге | 1 |
| [BG/bgAirToCoal (day)] [frame] — нет в маппинге | 1 |
| {Theme:input/stroke/selected} [stroke] — нет в маппинге | 1 |
| [Action/actionAccent] — нет в маппинге | 1 |
| шрифт без стиля: ALS Hauss VF Regular 15/20 | 1 |
| сырой эффект: background_blur | 1 |
| сырой #ffc800 [shape] | 1 |
| сырой #fffbdd [shape] | 1 |
| [Buttons day/Primary] [shape] — нет в маппинге | 1 |
| сырой #000000@0.00 [shape] | 1 |
| [Icon [day]/Tertiary Opposite] [shape] — нет в маппинге | 1 |
| сырой #444444 [frame] | 1 |
| сырой #ffffff@0.10 [stroke] | 1 |
| шрифт без стиля: SF Pro Display Bold 22/28 | 1 |
| сырой #000000@0.35 [shape] | 1 |
| сырой эффект: drop 0,0 r12 s0 #000000@0.20 | 1 |
| [Pastel [day]/Homer] [frame] — нет в маппинге | 1 |
| [Icon [day]/Primary Opposite] [shape] — нет в маппинге | 1 |
| сырой эффект: drop 0,0 r34 s0 #000000@0.09 | 1 |
| сырой #ff7200 [stroke] | 1 |
| сырой #000000@0.40 [shape] | 1 |
| сырой эффект: drop 0,-2 r8 s0 #000000@0.08 | 1 |
| сырой #fdf6ff [frame] | 1 |
| сырой эффект: drop 0,2 r12 s0 #ab01e0@0.05 + drop 0,2 r12 s0 #ab01e0@0.05 + drop 2,2 r12 s0 #ab01e0@0.12 + drop 2,2 r12 s0 #ab01e0@0.12 | 1 |
| шрифт без стиля: SF Pro Text Semibold 17/auto | 1 |
| {theme:bg/ashToCoal} [frame] — нет в маппинге | 1 |
| сырой #3458e8 [shape] | 1 |
| шрифт без стиля: SF Pro Display Regular 16/19 | 1 |
| шрифт без стиля: SF Pro Display Regular 16/18 | 1 |
| шрифт без стиля: Scada Regular 28/18 | 1 |
| [Purple] [shape] — нет в маппинге | 1 |
| сырой #faa61a [shape] | 1 |

## skipByRoot

| экран | пропусков |
|---|---|
| 415 5374:564458 | 120 |
| Tariff Selection / From Search Screen 🎞️ 5374:563618 | 111 |
| Pricing 5374:563872 | 92 |
| Pricing 5374:564040 | 92 |
| 0 5374:564757 | 143 |
| 16 5374:564329 | 85 |
| iPhone 11 Pro Max - 1025 5374:563688 | 81 |
| Tariffs 5374:564633 | 53 |
| Tariffs 5374:564648 | 53 |
| Tariffs 5374:564663 | 54 |
| Tariffs 5374:564678 | 54 |
| Tariffs 5374:563483 | 22 |
| Frame 78749694 5374:564209 | 22 |
| Tariff Card 5374:564723 | 30 |
| Notes 5374:564316 | 10 |
| icon 5374:564696 | 9 |
| Default car 5374:564325 | 6 |
| Bottom 5374:563865 | 4 |
| Bottom 5374:564693 | 4 |
| Button 5374:563868 | 3 |
| Bottom sheet 5374:564700 | 3 |
| 24/Stroke/calendarSelected 5374:564750 | 2 |
| icon 5374:564697 | 1 |
| Car Illustration 5374:564708 | 1 |
| 24/Stroke/calendarNotSelected 5374:564751 | 1 |
| 24/Fill/calendarNotSelectedFill 5374:564752 | 1 |
| Divider 5374:564755 | 1 |
