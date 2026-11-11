# Шаг 4: DEV-копия «✅ Taxi for friends — Switched Styles» `4770:4437` (2026-11-10)

Файл New Rider DEV `5mg6h0oB8yRDoUfTruogca`. Разовый вызов use_figma только на четыре узла копии; оригинал `2314:16494`, Alert ×2, Push Notification и остальное не трогались. Основание: ответ arturuxui 5а · 6а · 7б · 8а (`new-rider-drafts.norule-questions.md`). Правила — `new-rider-dev.final.md` §1–2, §4; цели — переменные библиотеки «AID Rider Tokens & Styles» (color-sem, space), текстовые стили по ключам. Сырые цвета меняли только на Sender (§1.4), на Counter и Bottom sheet — нет.

Порядок: чтение (DRY) → снимки до → запись → контрольное чтение → снимки после. Counter `4770:4725` лежит внутри Sender 372, поэтому его 3 замены в Sender не повторяются.

## Что заменено

**Counter `4770:4725` (3):** `[Icon [day]/Accent]` на shape → Icon/Accent (1); `[Text [day]/Constant White]` на тексте → Text/Constant White (1); текстовый стиль `Subtitles/Subtitle 3` (старая копия, ключ a4ca…) → новый Subtitles/Subtitle 3 (a033…, п.27а; этого пункта в задаче не было, взят из маппинга) (1).

**Bottom sheet `4770:4685`:** `{SPx3}` itemSpacing 12 → space-12 (12); `{SPx2}` itemSpacing 8 → space-8 (12, стоят на SLOT-узлах, setBoundVariable принял); `[Text [day]/Primary]` на shape → Icon/Primary (4); `[Icon [day]/Primary]` → Icon/Primary (3). Итого 31.

**Sender 372 `4770:4698` (всего 58 без Counter):**
- Day / Black на тексте → Text/Primary (20), на shape → Icon/Primary (1);
- Day / Gray 60 → Text/Secondary (2); Day / Gray 40 на тексте → Text/Tertiary (1);
- Day / White на shape → Icon/Constant White (4);
- Day / Gray 80 на shape → Pastel/Apu (2; hex `#4e4e60` совпал);
- Icons day/primary 2 → Icon/Primary Inverted (2);
- сырой `#ffffff` на фрейме (тип FRAME) → Background/Primary (2);
- iOS / Subtitle → Outstanding/iOS - Subtitle (13); iOS / Caption → Bodies/Body 3 (9); iOS / H3 → Titles/Title 3 (1).

**Sender 427 `4770:5024` (14):** Day / Black на тексте → Text/Primary (3), на shape → Icon/Primary (1); Day / Gray 40 на тексте → Text/Tertiary (2); Day / White на shape → Icon/Constant White (2); сырой `#ffffff` на фрейме → Background/Primary (5); сырой `#8526ff` на shape → Icon/Accent (2). Текстовых стилей из маппинга здесь нет (24 текста без стиля).

Всего заменено 3 + 31 + 58 + 14 = 106 (без повторов).

Приёмка в Figma: стиль заливки снимается (`setFillStyleIdAsync('')`), заливка привязывается к переменной через `setBoundVariableForPaint`; альфа берётся из переменной. Текстовые стили — `setTextStyleIdAsync` после загрузки шрифтов.

## Контрольное чтение
Остатков по правилам: 0 в Counter, Bottom sheet и Sender 372 (кроме строки ниже), в Sender 427 (кроме строки ниже). Отступов `SPx*` не осталось. Узлов, где замена не прошла, нет: setBoundVariable и setFillStyleId во вложенных инстансах (`I…`) приняты. Единственный сбой — ложный: после привязки SPx3 id слот-детей Bottom sheet пересчитались, и первый проход вернул «node does not exist» для 60 устаревших id; SPx2 добит вторым вызовом, число узлов осталось 186, структура не менялась.

## Осталось и почему
- Bottom sheet, по п.6а: сырые `#ffffff` (5 + 1 на фрейме), `#000000` (2), `#ff0000` (1); эффект `.blur tiny` (1) — не трогались. 2 скрытые (visible=false) белые заливки фреймов остались.
- Sender 372 и 427, нет в маппинге: `Purple` (4+1), `Blue` (2), `Orange` (1), `Green` (3), `Night / Gray 20` (2), `Fill / Light Grey` (2), `Fill / Light` (1); обводки `Buttons day/Pressed` (1), `Day / Gray 20` (1); сырые `#000000`, `#232326`, `#979797`, `#989898`, `#cacacc`, `#c4c4c4`, `#d8d8d8`, `#ebecf0`, `#262626`, `#6d6f75`, `#545665`, `#00579f`, `#3458e8`, `#faa61a`, `#ff7200`, `#ff5f00`, `#eb001b`, `#f79e1b`; `#ffffff` на VECTOR, RECTANGLE, TEXT, BOOLEAN_OPERATION и на INSTANCE; сырые тени (DROP_SHADOW, 12 узлов); градиентные и картинные заливки; 24 текста Sender 427 без текстового стиля.
- Правило есть, цели для типа нет: `Day / White` на TEXT (1, Sender 372 `4770:4731`) и `Day / Gray 40` на VECTOR (1, Sender 427 `4770:5098`) — токена `Icon/*` на текст и `Text/*` на вектор не ставим.
- Alert ×2, Push Notification — не трогались (п.8а).

## Что видно на снимках
Sender 372: подпись кнопки «Заказать» стала крупнее и жирнее (iOS / Subtitle 16/16 → Outstanding/iOS - Subtitle), подписи «Подъезд» светлее. Bottom sheet, Counter, Sender 427 визуально те же.
Снимков в репозиторий не сохранял: лежат в `tool-results` сессии.
