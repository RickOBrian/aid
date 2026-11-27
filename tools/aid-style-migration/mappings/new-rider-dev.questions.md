# Анкета перед прогоном на «✅ Taxi for friends» (2026-11-02)

Ответ одной строкой: `1в 2а 3а …`; без ответа беру ★. Новая библиотека —
«🙋‍♂️ AID Rider Tokens & Styles» (color-sem, typography-sem, space, radius,
текстовые стили и тени; цветовых стилей в ней нет — все цветовые стили старые).
Сверено поиском по библиотеке и по ключам стилей на странице.

## A. Конфликты

1. `[Text [day]/Constant White]` на Rectangle 40902 (1×): а) Background/Primary · б) Icon/Primary Inverted · в) Background/Constant White ★ — «Constant» остаётся белым в обеих темах, а/б в ночи потемнеют.
2. `[White]` — точка в пине (Ellipse 2, 4×): а) Icon/Constant White ★ · б) Icon/Primary Inverted.
3. `#ffffff` — цифра в пине (текст): а) Text/Constant White ★ (в паре с п.2) · б) Text/Primary Inverted.
4. `#ffffff` — Divider в tabbar (stroke): а) Stroke/Secondary ★ (2 страницы из 3) · б) Stroke/Separator.
5. `{Color/tx-accent/grey/primary}` на «Shadow»: а) Background/Constant Dark ★ (GEO — ошибка) · б) Background/Primary.

## B. Замены, которые меняют вид

6. `#8526ff@0.12` — круг Radius в пине (4×): а) Icon/Accent — круг станет сплошным · б) оставить сырым, пробел — предложение токена «Accent 12 %» ★.
7. Зона (на Taxi нет, правило на будущее): `#19191d@0.5` (тёмная) и `#ededff@0.7` (светлая) обе стали Background/Zone Available: а) оставить так · б) тёмная → Background/Zone Unavailable, светлая → Zone Available ★ (уточнить у вас смысл слоя).
8. `#4e4e60` на обводке → Pastel/Apu (переменная фона на stroke): а) оставить Pastel/Apu · б) Stroke/Primary ★ · в) оставить сырым.

## C. Цвет — нет в маппинге (все старые)

9. `[Day / Black]` #0d0c24, #000518 — текст (26×): а) Text/Primary ★ (как в Where) · б) Text/Constant Black.
10. `[Day / Gray 40]` #999ba3 — текст: а) Text/Tertiary ★ · б) Text/Secondary.
11. `[Day / Gray 60]` #666975 — текст: а) Text/Secondary ★ · б) Text/Primary.
12. `[Day / Gray 80]` #4e4e60 — fill: а) Pastel/Apu ★ (как в Where) · б) Icon/Secondary.
13. `[Day / White]` #fff — fill и stroke: а) по типу: вектор/эллипс → Icon/Constant White, прямоугольник → Background/Constant White, stroke → Stroke/Inverted ★ · б) всё → Icon/Constant White.
14. `[Icon [day]/Primary]` — иконки tabbar (8×): а) Icon/Primary ★ · б) оставить.
15. `[Icons day/Secondary Pressed]` #717184 — fill 8×, stroke 10×: а) Icon/Secondary ★ · б) Icon/Tertiary.
16. `[Icon [day]/Secondary Opposite]` #e9eaee — Dragger element: а) Background/Quaternary ★ (так стоит у остальных Dragger на странице) · б) Background/Tertiary.
17. `[Icons day/primary 2]` #fff — «🧩 Color background»: а) Background/Primary ★ (как 🧩 background) · б) Icon/Constant White.
18. `[Texts night/Primary]` #f8faff — вектор в tabbar: а) Icon/Primary Inverted ★ · б) Icon/Constant White.
19. `[Route [day]/Primary]` #393944 — stroke маршрута: а) Route/Primary ★ (в библиотеке есть) · б) Stroke/Primary (так сделано в GEO).
20. `{Variable collection/BG Dark}` #393944 — Selector (4×): а) Background/Constant Dark ★ · б) Background/Constant Dark Secondary.
21. `{Theme/separator/default}` #777788@0.5 — line (3×): а) Background/Separator ★ (как остальные line) · б) Stroke/Separator.
22. `{Color/tx-bg/level −1 muted}` #ededf3: а) Background/Secondary ★ · б) Background/Tertiary.
23. `{Color/tx-bg/banner}` #f5eff6 — Badge: а) Background/Pill Secondary ★ · б) оставить.
24. `{Color/tx-accent/grey/primary}` на векторах (10×): а) Icon/Primary ★.
25. `#000000` — Shadow в пинах: а) Technical/Visible Deep ★ (как в Where) · б) оставить.
26. Прочие сырые hex вне карты: а) менять только однозначные из маппинга (#ffffff фон фрейма, #000000@0.3, NavBar/Tab, #100f25/#2f2e43), остальное оставить ★ · б) разбирать каждый.

## D. Типографика

27. Старые копии с теми же именами: Bodies/Body 2, Body 3, Subtitles/Subtitle 1/2/3, Titles/Title 4 (~80×): а) заменить на новый стиль с тем же именем ★.
28. `[Caption/caption]` ALS Hauss 11/14 — подписи tabbar (19×): а) Captions/Caption 2 ★ (как в Where, +2 px) · б) оставить.
29. `[iOS / Subtitle]` 16/16 и 16/18 (13×): а) Outstanding/iOS - Subtitle ★.
30. `[iOS / Caption]` 14/16 (9×): а) Bodies/Body 3 ★ · б) оставить.
31. `[iOS / H3]` 20/24 (1×): а) Titles/Title 3 · б) оставить ★ (размер не сверен).
32. `[Title/title2]` ALS Hauss Bold 19/23 — Map Pin (4×): а) Outstanding/Title-title2 (NRD) ★.
33. Сырой SF Pro Text Semibold 17/20 — «поиск» в Status Multiple (24×): а) Outstanding/NRD - Body ★ (текст станет уже на ~13 px) · б) оставить.
34. Сырой SF Pro Text Semibold 12/16, капителью (4×): а) Captions/Caption 1 CAP ★ · б) оставить.
35. Сырые SF Pro Text Regular 14/16 (5×) и SF Pro Display Semibold 22/22 (5×) — карточка «На несколько адресов»: а) Bodies/Body 3 и Titles/Title 4 (у второго высота строки 22 → 28) · б) оставить ★.
36. Стили `[?]` из отключённой библиотеки (8×): а) оставить, показать списком ★.

## E. Эффекты

37. `[Shadows/[day] Medium]` (22×) и `[Shadows/[day] Large]` (1×): а) Shadows/Medium и Shadows/Large ★ (параметры совпадают).
38. `[Shadows / Brand button]` (4×): а) Shadows/Brand Button ★ (в библиотеке есть; в GEO тень сняли — похоже на ошибку) · б) снять.
39. `[Shadow 6]` — BottomSheet в Address Search: а) Shadows/Bottom Sheet ★ · б) оставить.

## F. Отступы и радиусы

40. По значению: `{Gaps/SPx2}`=8 → space/space-8; `{Gaps/SPx3}`, `{Отступы/SPx3}`=12 → space/space-12; `{Corner radius/BRx6}`=24 → radius/radius-24 (~145 привязок): а) заменить ★ · б) не трогать.
41. `{System/…}`, `{Breakpoint/…}`, `{Locale · Font Family/…}` — уходят вместе с заменой стилей п.27–28: а) ок ★.

## G. Что не трогаем

42. Системный iOS: Alert (2314:17569, 2314:18840) и Push Notification (2314:18618): а) игнорировать целиком ★ · б) переносить.
43. Карта: подписи SF Pro Display 10/20 и 11/20, фигуры, картинки, градиенты: а) игнорировать ★.
44. Экраны «Sender 372» (2314:18094) и «427» (2314:18619) — старые экраны со стилями Day / Gray, [Blue], [Purple], [Green], [Orange], [Fill / Light …], iOS-шрифтами: а) не трогать, кроме п.9–13 · б) не трогать целиком ★ · в) переносить полностью.
45. Мастер Bottom sheet (2314:17429): а) не трогать в этом прогоне ★ · б) переносить — только по отдельному «да».

## Ответы arturuxui (02.11)

1 → Icon/Constant White (правило: на не-фреймы Background/* не вешаем) · 2а · 3а · 4а · 5а ·
6а + слою круга непрозрачность 12 % (решение arturuxui) · 7 — пока оставить; потом сверить цвета зон
с Zone Unavailable/Available (разные цвета = доступность) · 8 — Pastel/Apu, только если его hex = #4e4e60 (сверить) ·
9а 10а 11а 12а · 13 → Icon/Constant White (fill) и Stroke/Inverted (stroke) · 14а 15а 16а ·
17 → Icon/Primary Inverted · 18б (Icon/Constant White) · 19а–37а · 38б (Brand button снять) ·
39а 40а 41а 42а 43а · 44б (Sender 372 и 427 не трогать целиком) · 45а (мастер не трогать).

Открыто после ответов: правило «не-фрейм ≠ Background/*» задевает строки маппинга —
[Background [day]/Primary] на векторах (30× «🧩 background»), [Background [day]/Secondary] на векторах (6×),
Background/Attention и Constant Dark Secondary на векторе, Text Constant White на Rectangle 40902.
Предложить кандидатов Icon/* одним мини-списком до прогона.
