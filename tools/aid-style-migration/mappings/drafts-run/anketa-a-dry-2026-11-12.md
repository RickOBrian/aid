# Анкета группы А: DRY по 17 копиям (2026-11-12)

Только подсчёт, узлы не менялись. Правила — `scripts/migrate-styles.js` (ответ arturuxui 2026-11-12, описание — `new-rider-dev.final.md` §9, «Анкета группы А»). Файл Drafts `eSitSKeHzy5fOUF1n3zg2B`, HASH тела 2639523941, по RUNBOOK: тело на `figma.root`, `run-page.js` с `DRY=true`, порции по 25 с. Оригиналы и страница Switch Audit не читались и не менялись. Служебные ключи `mig` сняты с `figma.root` и со всех 17 страниц (`CLEAN`).

Счёт ниже — только узлы, которые попадают под новые правила. В выводе прогона есть и старые правила (радиусы, отступы на вложенных инстансах Where и Where - Migration: `{Скругления:BRx4}` 28, `{Spacing:*}`, `theme:*`), они в счёт не входят.

## Правила по номерам колонок

| № | Правило |
|---:|---|
| 1 | #000 текст → Text/Primary (кроме «beta», «васаби», «минск») |
| 2 | #232326 текст → Text/Primary |
| 3 | #6d6f75 текст → Text/Secondary |
| 4 | Route/Primary: обводка #000 на фигуре и `{dark strong}`, только w4 |
| 5 | #fff обводка фрейма → Stroke/Secondary (кольцо Avatar) |
| 6 | #ff661a на фигуре → Icon/Attention Deep |
| 7 | #f3f3f3 на фрейме → Background/Secondary |
| 8 | белые драгеры (#fff @0.32/0.62/0.8x, #f6f6f9 @0.54/0.3x) → Icon/Constant White Secondary |
| 9 | #cacad1@0.72 → Icon/Disabled |
| 10 | `{grey/secondary}` обводка → Stroke/Disabled |
| 11 | обводки #e52817 → Stroke/Warning, #8526ff → Stroke/Accent, #e9e9ed → Stroke/Primary |
| 12 | переменные фреймов: `primary-Inverted` → Background/Secondary, `neutral/bg/idle` → Field/Primary, `purple/tint/idle` → Background/Pill Accent, `grey/tertiary` → Background/Tertiary, `purple/bg/idle` → Button/Primary |
| 13 | стили `[Purple]` → Icon/Accent, `[Orange]` → Icon/Attention Deep, `[Day / Gray 40]` → Icon/Tertiary |
| 14 | градиент → Gradients/Top |
| 15 | градиент → Gradients/Fade Horizontal |
| 16 | градиент → Gradients/Shimmer |
| 17 | тени: Brand Button, Medium (сырая), Small (`Shadow S`), Mini (`shadow/close/s`) |
| 18 | шрифты без стиля → Caption 1 / Subtitle 3 / Caption 2 |

## Счёт: правило × страница

| страница | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | итого |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Backlog UI | 0 | 8 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 5 | 0 | 1 | 0 | 0 | 0 | 22 |
| Errors | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 9 | 4 | 0 | 0 | 23 |
| GEO Problems | 36 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 1 | 11 | 0 | 58 |
| Illustrations Request | 8 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 32 | 30 | 6 | 0 | 14 | 6 | 99 |
| Navigation | 428 | 17 | 0 | 0 | 28 | 0 | 0 | 0 | 0 | 110 | 12 | 6 | 111 | 277 | 422 | 6 | 74 | 11 | 1502 |
| No car | 2 | 28 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 16 | 0 | 19 | 1 | 4 | 0 | 0 | 0 | 84 |
| not work | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 3 |
| Order Flow | 54 | 4 | 2 | 106 | 73 | 40 | 49 | 18 | 9 | 14 | 10 | 12 | 3 | 56 | 21 | 7 | 130 | 32 | 640 |
| Permissions | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 20 | 0 | 0 | 7 | 0 | 35 |
| Profile | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 0 | 72 | 1 | 0 | 0 | 42 | 127 |
| Service coverage | 24 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | 30 | 0 | 1 | 0 | 81 |
| Show my location | 45 | 1 | 0 | 174 | 195 | 12 | 0 | 0 | 0 | 11 | 0 | 58 | 2 | 1 | 31 | 0 | 50 | 44 | 624 |
| Tariffs | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 19 | 0 | 3 | 2 | 0 | 0 | 39 |
| Taxi for friends | 6 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 8 | 21 | 7 | 0 | 15 | 0 | 65 |
| test | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 4 | 25 | 38 | 0 | 4 | 0 | 73 |
| Where | 9 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 4 | 153 | 132 | 26 | 100 | 0 | 427 |
| Where - Migration | 9 | 8 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 1 | 6 | 153 | 132 | 26 | 100 | 0 | 445 |
| **Итого** | **635** | **76** | **28** | **287** | **297** | **52** | **49** | **18** | **9** | **136** | **60** | **80** | **216** | **854** | **837** | **72** | **506** | **135** | **4347** |

Где что внутри колонки (по прогонам):

- Колонка 11: #8526ff — Backlog 2, Navigation 12, No car 7, Order Flow 1, Illustrations 1, Tariffs 6, Taxi 1, test 2, Where-M 2; #e9e9ed — Backlog 2, No car 9, Order Flow 1, Tariffs 3, Taxi 1, Where-M 2; #e52817 — только Order Flow 8 (линии `ic_close_large`, w3).
- Колонка 5 по весу обводки: w4 — Order Flow 60, Show my location 148, Navigation 6, not work 1; w2.72 (Driver Image 34x34) — Order Flow 12, Show my location 31; w6 (Avatar в Slot/Island) — Order Flow 1, Show my location 12; w3 — Show my location 4, Navigation 1; **w2 — Navigation 11, w1.75 — Navigation 8, w51 — Navigation 2** (см. «Сомнительное»).
- Колонка 8: Order Flow — #fff@0.62 10, @0.80 3, @0.32 3, #f6f6f9@0.54 1, @0.30 1.
- Колонка 17: Medium — Where 95, Where-M 95, Order Flow 25, Navigation 59, Taxi 15, Illustrations 14, GEO 10, Permissions 7, test 4, Service 1; Brand Button — Order Flow 4, Navigation 1; Small — Order Flow 89, Show my location 24, Navigation 14, Where 3, Where-M 3; Mini — Show my location 26, Order Flow 12, Where 2, Where-M 2, GEO 1.
- Колонка 18: Caption 1 (12/16, 12/14) — Show my location 39, Order Flow 20, Navigation 7, Illustrations 6; Caption 2 (Google Sans 11/14) — Profile 42, Order Flow 9, Navigation 4; Subtitle 3 (Medium 14/14) — Show my location 5, Order Flow 3.

## Сверка с таблицей анкеты (Order Flow на 09.11)

Совпало: #000 текст 54 (в анкете ~53), #ff661a 40, #cacad1 9, Stroke/Disabled 14, #e52817 8, #8526ff 1, #e9e9ed 1, Whitener 56, Medium 25, Mini 12, кольцо Avatar 73, Brand Button 4, шрифты 14 + 6 + 3 + 9, переменные фреймов 3/3/2/3/1.
Разошлось: Route/Primary 100 + 6 (в анкете 81 + 6; страница менялась), `[Shadow S]` 89 (в анкете 13), #f3f3f3 49 (47), белые драгеры 18 (~25), Fade Horizontal 21 (в анкете только «Label Fade» 4: правило по значению берёт ещё маски `Fade` 24x20), Shimmer 7 (в анкете «Loading Fade» 2).

## Сомнительное по контексту (проверено на Order Flow только анкетой, на остальных — образцами)

Сверка по 3–5 образцам на правило и страницу (образцы печатал прогон). Контекст явно не тот или нужен ваш взгляд:

1. **#000 текст — подписи доски, не UI (правило 1).** Крупный шрифт (>= 40 px), подписи сцен: GEO Problems 36 (`5374:885753`, `5374:885754`, `5374:885755`, `5374:885756`, Roboto 65 px: «Этап», «GPS lost», …), Permissions 2 (`5374:1020415` «Базовый флоу», `5374:1020416`), Taxi 4 (`5374:897392`, `5374:897393`, «Добавления с алерта…», 87 px), Where 5 и Where-M 5 (`5374:423736`, `5374:423737` «Пассажир едет…», в Where-M `5374:625395`, `5374:625396`), Navigation 3 (`5374:249756`, `5374:249757`, `5374:249766`, секция 3d). Всего 55 узлов; в прогоне они помечены суффиксом «[шрифт >= 40: подпись доски?]». Остальное по образцам — рабочий UI (Service coverage «Регион не поддерживается», No car «Ищем водителя…», Order Flow Title/Subtitle).
2. **Navigation, #000 текст 428.** По скану почти все чёрные тексты в секции Misc `5374:207973` (экраны WB; 1254 чёрных текстов в секции, из них 4 экрана уже помечены ❌), ещё Tabbar Navigation, Status Island, «Тексты_финал», «Для бренда». Это не Rider-макеты; решение «Text/Primary» там — на ваш взгляд. Образцы: `I5374:209862;2268:54805` «Такси», `I5374:209876;2279:105523` «172943».
3. **Stroke/Secondary на белой обводке фрейма — не кольцо Avatar (правило 5), только Navigation:** `I5374:209848;2077:16221`, `I5374:209848;2077:16232`, `I5374:209848;2077:18187` (Frame 2131329822, w2, 178x98) — 11 узлов w2; `5374:212762`, `5374:212766`, `I5374:212800;2759:51235`, `I5374:212800;2759:51239` (Group 1, w1.75, 24x24, Mask/Club) — 8; **`5374:213213` и `5374:214094` («Корзина», белая обводка w51 на экране 390x705)** — 2, явно не кольцо. Остальное — кольца Avatar w4/w6/w2.72 (Order Flow, Show my location, Navigation Profile `5374:212772`). Образцы w3 «Images 48x48» (`I5374:804460`, `I5374:804486`, Show my location) и «Clipper» `5374:223325` (Navigation) — похоже на аватары, но не уточнялись.
4. **Stroke/Disabled на Navigation — разделители, не зачёркнутая цена (правило 10).** 110 узлов: «Line < Vertical Separator», w2, 0x12 (`5374:224990`, `5374:224992`, `5374:225015`, `5374:225017`). Правильный контекст (Old Price, Line 2): Order Flow 14, Show my location 11 (`I5374:803393;…;40003372:84928`), Profile 1 (`5374:527832`, «Line 2 < Container»).
5. **`primary-Inverted` → Background/Secondary на крупных карточках (правило 12), Profile:** `5374:538846` («Frame 2136140744», 358x143) и `5374:538890` («Frame 2147240038 < Island», 358x143). В анкете это «Frame 4» (аватар-подложка 50x50), здесь большие карточки — днём белый фон станет серым, если `primary-Inverted` светлее Background/Secondary (значения переменных я не читал). Аватар-подложки (нормально по анкете): Order Flow `5374:904905` и ещё 2, Show my location 17 (`I5374:803280;40007536:…` Slot 72x72, `I5374:803372;…` Driver Image 50x50), Where `5374:429030` / Where-M `5374:630689` (Badge 28x28).
6. **Route/Primary только w4 (правило 4).** Raw #000 без ограничения по весу цеплялся за не-маршруты (рамки «Container [Button] -->» w3 105x352 `5374:1020391`, «IMAGE …» w3 `5374:1020392`, «photo_2026-08-17…» w1 `5374:86741`, векторы иконки Union w2 `I5374:1021157;1932:113`), поэтому в скрипт добавлено условие w4. Пропущено «не w4»: Navigation 292 (w2 144, w1 97, w1.91 28, w0.5 23), Tariffs 79 (w4.5 30, w2 19, w1.73 15, w5 15), Illustrations ~36 (w4.5 12, w2 12, w1.73 6, w5 6), Profile 30 (w2), Taxi 17 (w3 15, w2 2), Where и Where-M по 16 (w3 10, w2 6), Permissions 13 (w3 11, w2 2), Show my location 6 (w1), Service 1 (w1). Образцы w4: «Route < Route/Map Interface 227x21», «Route < Route Elements 290x27» — маршруты. В Tariffs/Illustrations ещё вложенные векторы w4.5/w5 (`…;647:102128;647:102121`), что это, не смотрел; под правило не попали.
7. **Gradients/Fade Horizontal: направление.** В библиотеке стопы `ffffff@0 → ffffff@1`, у узлов `ffffff → ffffff@0` (обратно); итоговое направление зависит от `gradientTransform`, глазами не проверялось. 837 узлов, из них 422 на Navigation и 264 на Where/Where-M — маски «Fade» внутри вложенных инстансов (`Mask < Fade 75x20`, `Mask < Atoms / linearShade 32x20`), а не «Label Fade». Перед заменой стоит сверить визуально 2–3 штуки.
8. **Gradients/Top: стопы.** В библиотеке три стопа (0.78 в 0 и в 20 %, 0 в 100 %), у «Whitener» два (0.78 → 0). После замены плавность чуть изменится. 854 узла, везде «Whitener 390x116».
9. **Gradients/Shimmer — 72 узла,** 33 стопа совпадают с библиотекой по значениям (`ffffff@0 → 0.29 → 0.6 → 0.87 → 1 …`); образцы «Gradient < Fade-Simple 716x716» (GEO, `I5374:886523;40001007:26289;5374:887214;1075:43848`). Нужен глаз на Where/Where-M 26 + 26.
10. **Brand Button на Navigation:** `I5374:237105;1764:8290` («🧩 Color background < standard/QR», 72x72) — в анкете тень кнопки, здесь фон QR-блока. Order Flow 4 (`I5374:918983;69:109;5374:934839` и ещё 3, «standard < Container [Button]») — правильный контекст.
11. **`[Orange]` на Switch-маске.** `5374:721291` («Mask < Switch», Illustrations), `I5374:803643;669:697;6657:5605/5606` (Show my location): стиль на маске переключателя. Вреда нет (маска не рисуется), но это не «иконка Адрес».
12. **Tariffs, #8526ff → Stroke/Accent w1.5:** «BG [6 24 10 8] < Tarif / Card / Unselected» (`5374:563507` и ещё 3 в образцах) — фиолетовая обводка у «Unselected» карточки; в test, Illustrations, Navigation то же. Проверить, что это нужная обводка выбранной карточки, а не артефакт имени.

Контекст в порядке по образцам: Text/Secondary «Подача/В пути» (Group 103), Text/Primary «5 мин», «Title» в Forms/List, Icon/Attention Deep `Rating Star` (`I5374:803294;…`), Background/Secondary в `Content < Bottom sheet` (`5871:182778`, `5871:182865`, `5374:918615`), драгеры `.Dragger 24x4`, Icon/Disabled (`I5871:177423;1029:41970` Dragger 32x4), Shadows/Mini `Input < Address Input`, Shadows/Medium на корнях экранов 390x844, Caption 2 на Tab «Такси/Доставка», Caption 1 «Чат с водителем», Field/Primary `Button content < Button / Tertiary`, Pill Accent `Chip < ChipGroup`.

## Что не внесено и почему

- **Шрифты «по участкам»** (смешанные начертания: 17/20 → NRD - Body, 16/16 → iOS - Subtitle, 15/20 → Body 2, `[iOS / Body]` → iOS - Body). Скрипт ставит текстовый стиль на весь узел (`setTextStyleIdAsync`), по диапазонам не умеет, а для смешанных участков не определено, какому участку какой стиль. Реализуемо через `setRangeTextStyleIdAsync` по сегментам, но нужен явный маппинг «начертание участка → стиль». В DRY такие тексты остаются в причинах «шрифт без стиля: A + B»; в выводе виден только Navigation (ALS Hauss VF Bold + Regular 13/15 — 204 узла, Factor A TRIAL Black + Medium 10/11 — 110), эти семейства вне правил анкеты. Узлов SF Pro со смешанными начертаниями 17/20, 16/16, 15/20 в отфильтрованном выводе не было (причины ниже топа я не просматривал целиком).
- **Пробки** (Slow/Free/Congested) — закрыты 11.11, в анкету не входят.
- **Stroke/Contrast** — в библиотеке нет, как вы указали, кольцо Avatar → Stroke/Secondary.
- **`Gradients/Fade Horizontal` и `Shadows/Brand Button`:** ключей не было ни в скрипте, ни в `final.md`; нашлись через `search_design_system` по библиотеке «🙋‍♂️ AID Rider Tokens & Styles»: Fade Horizontal `851eb7b21722a2574d26d5a5025a216c5fa57662`, Brand Button `e4b79782d9cde7419400b2136ec0e9cd2db1dd07`; `Shadows/Mini` взят из `new-rider-drafts.coverage-questions.md` (`76009ef2…`) и совпал с поиском.
- **Тени с несколькими эффектами:** Medium ставится только при точном совпадении всего списка эффектов узла (`D 0,0 r20 #000@0.06` одиночная); Brand Button — только пара `D 0,4 r20 #8526ff + D 0,8 r14 #003dac`. Подборы анкеты с «префиксом» (больше эффектов) не применяются, чтобы не потерять остальные тени.
- **Градиенты** меняются, только если на узле ровно одна видимая заливка.

## Побочные эффекты DRY

`importVariableByKeyAsync` / `importStyleByKeyAsync` в DRY тоже выполняются: в файл Drafts подтянуты ссылки на библиотечные переменные (Route/Primary, Stroke/Disabled, Background/Pill Accent, Field/Primary и др.) и стили (Shadows/Mini, Shadows/Brand Button, Gradients/Fade Horizontal, Gradients/Shimmer, Gradients/Top) — так же, как на прошлых DRY. Ещё один read-only вызов импортировал три градиентных стиля для чтения стопов. Узлы страниц не менялись.

## Изменённые файлы (не закоммичены)

- `tools/aid-style-migration/scripts/migrate-styles.js` — правила анкеты А, фильтр `OUTNAME`, примеры узлов под правилами (`samples`), условие w4 для Route/Primary, суффиксы в счёте (вес обводки, шрифт >= 40).
- `tools/aid-style-migration/scripts/run-page.js` — сбор примеров в `agg.samp`, строки `X` в итоге (отчёт `report.mjs` их не знает, в DRY не запускался).
- `tools/aid-style-migration/mappings/new-rider-dev.final.md` — §9, раздел «Анкета группы А (2026-11-12)».
- Этот файл.

Прогон на копиях по этим правилам: `node scripts/build-kit.mjs` (HASH 2639523941) и заливка `upload.js`, затем `DRY=false` по RUNBOOK — после вашего «да» по счёту выше.
