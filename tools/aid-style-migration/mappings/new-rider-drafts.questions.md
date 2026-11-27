# New Rider Drafts — анкета: цвет и тени (2026-11-02)

Собрано чтением 7 страниц (Order Flow, Show my location, Where, Navigation, Illustrations, Tariffs,
Taxi for friends; Profile не прочитался — обрыв MCP). Значения — День / Ночь. ★ — предложение.
Отвечать как раньше: «1а, 2б, 3★ …». Полная таблица ближайших токенов — в конце файла.
Уже в маппинге (final.md §1.3): Theme:text icon/primary|secondary, Color:tx-accent/grey/primary,
Color:tx-bg/level 1 base, Theme:bg/level 1 base, level −1 muted, banner, light strong, red/fg,
Accent Purple, Neon Green, BG Dark — ниже о них только недостающие слоты.

**Ответ arturuxui 02.11: «принять все ★».** Внесено в final.md §9 и migrate-styles.js.

## Цвет

**Серые тексты и иконки**
1. 242429 / efeff5 — `grey/primary` (stroke 489), `Theme TX:grey/primary` (1298), `theme:text/primary`,
   `controls/text icon/primary`, `GEO content/primary`: текст → Text/Primary, вектор → Icon/Primary ★;
   обводка — а) оставить ★ · б) Icon/Primary (без скоупа STROKE — нельзя) · в) предложение Stroke/*.
2. 808093–8f8fa3 / 9b9bb0 — `grey/secondary` (805), `theme:text/secondary`, `Colors:Text-Icon/Secondary`:
   а) Text/Secondary · Icon/Secondary (0f0f1f@0.54 / fff@0.50) ★ · б) Text/Secondary Clean (7e7e86 / 7e7e86).
3. c4c4d4 / 5f5f6d — `grey/tertiary` (4019), `theme:icon/secondary`, `text icon/tertiary`, `theme:text/tertiary`,
   `pageIndicator/*/noActive`: а) Icon/Tertiary · Text/Tertiary (@0.38) ★ · б) Pastel/Hans (e5e6f1 / 3f4048).
4. e0e0eb / 474752 — `grey/quaternary` (389), `switch/bg/defaultOff`: вектор → Icon/Secondary Inverted
   (e9eaee / 393944), обводка → Stroke/Primary (e9eaee / 393944), фрейм → Pastel/Hans ★.
5. Белый константный ffffff — `light const` (993), `whiteConst`, `whitePrimaryConst`, `button/primary/content/*`,
   `buttonBuy/content`: Text/Constant White · Icon/Constant White ★; фрейм `bg/whiteConst`, `switch/circle`
   → Background/Constant White ★.
6. `whiteSecondaryConst` ffffff@0.75: а) Text/Constant White Secondary (@0.50, темнее) · б) оставить ★.
7. Чёрный константный 000000 / 18181b — `dark const` (894), `blackConst` (329+319+152): вектор →
   Icon/Constant Black (0f0f1f@0.87) ★; фрейм → Background/Constant Dark (значение не сверено) ★.
8. `Theme:text icon/blackPrimaryConst` 242429 / 242429 (91, текст): а) оставить ★ · б) предложение Text/Constant Black.
9. Инвертирующиеся: `dark strong` 18181b / fff (365) → Icon/Primary ★; `light strong`, `BG/airToCoal`,
   `stroke/forLevel1`, `contrasteInverted` fff / 18181b → обводка Stroke/Contrast, вектор Icon/Primary Inverted,
   фрейм Background/Primary ★; `primaryInverted` текст → Text/Primary Inverted ★; `primary-Inverted` efeff5 /
   242429 (вектор) → Icon/Secondary Inverted ★.

**Фоны**
10. f6f6f9 / 242429 — `Theme:bg/level 2` (1049), `theme:bg/level 2`, `ashToSmoke`, `skeleton/forLevel1`
    → Background/Secondary (f5f5f5 / 2a2a31) ★.
11. `level 2 alternative` fff / 242429 → Background/Primary ★.
12. `Theme:bg/level -1` f6f6f9 / 000000 (314) → а) Background/Secondary (ночью светлее) ★ · б) оставить.
13. `control/neutral/bg/idle` f6f6f9 / 2f2f37 (676, фреймы) → а) Field/Primary ★ · б) Button/Secondary (e9eaee / 393944).
14. Тонированные фоны без пары: `purple/tint`, `bg/accentSecondary`, `bg/accentLight`, `promo/*/bg/blackberry`
    (лиловые), `promo/bg/sky` (голубой), `promo/bg/green` → а) оставить, пробел для Standards ★ ·
    б) Background/Secondary (оттенок теряется). `promo/bg/red`, `red/tint` → Pastel/Tony ★ (red/tint точно).
15. Карта `tx-bg/map`, `map neue` → не трогаем ★ (как §7).
16. `Theme TX:tx-bg/overlay` 242429@0.40 на векторах (181) → пробел, как Overlay §8.2 ★.

**Акцент (лиловый a73afd → 8526ff AID)**
17. `purple/fg` (565), `bg/accent`, `button/primary/bg`, `text icon/accent`, `text/link`, `icon/primary`,
    `stroke/primary`, `pageIndicator/*/active`, `notification/brandPrimary`, `chips/counter`,
    `control/purple/bg`, `purple/alt`, `purple/bg`: по слоту Text/Accent · Icon/Accent · Stroke/Accent ·
    Background/Accent, кнопки `button/primary/bg` → Button/Primary ★. Оттенок станет AID-лиловым.

**Статусы**
18. Красный: `red/bg` → Stroke/Warning (Δ0); `control/red/bg` → Background/Warning (Δ1); `red/fg`,
    `Theme TX:red/fg`, `promo/content/red`, `text/danger`, `icon/danger` (fa2b55) → Text/Warning · Icon/Warning ★.
19. Оранжевый f24f18 — `control/orange/bg` (860), `Theme TX:orange/bg`, `Jam/High`: а) Icon/Attention Deep
    (ff7200) ★ · б) Icon/Warning (e52817).
20. Жёлтый ffe400 — `control/yellow/bg` (1337), `Jam/Middle`: а) Icon/Attention (значение не сверено, нужен
    импорт для сверки) ★ · б) оставить.
21. Зелёный: `green/bg` 00b23c, `green/alt`, `promo/content/green` → Icon/Success · Text/Success ·
    Background/Success (23ad58; у Icon/Text ночью d2ff73) ★; `brand/green` 48ea4d (491) → а) оставить ★ · б) Success.
22. Синий (`promo/bg/river`, `Accents/Blue`) → оставить ★ (Icon/Special 005aff далеко).
23. iOS системные (`System Colors:*`, `Colors:*`, `Labels - Vibrant`) → не трогаем, как Alert/Push ★.

## Тени

24. Стили с именем новой библиотеки без её ключа: `Shadows/Small` (327), часть `Shadows/Large|Medium`
    → новый стиль с тем же именем (как п.27а для текста) ★.
25. `Shadows / [day] Small`, `Shadows/[day] Small`, `[day] Small`, `Shadows / Bottom-sheet` (0,0 r20 + r4)
    → Shadows/Small ★; `Shadows/[day] Mini` (0,2 r8) → а) Shadows/Small ★ · б) оставить.
26. Сырые, совпадают с новыми точно: 0,6 r20 #000@0.08 (410) → Shadows/Medium; 0,8 r36 @0.16 (177) →
    Shadows/Large Air; тройная 0,3 r5 + 0,1 r18 + 0,6 r10 (427, средний слой @0.08 вместо @0.12) →
    Shadows/Bottom Sheet ★.
27. Driver-тени `shadow/diffuse/s|m|l` (834/886/4, #6c6680), `shadow/close/s` (40): а) s → Shadows/Small,
    m → Shadows/Medium, l → Shadows/Large (цвет станет чёрным) · б) оставить, пробел ★.
28. `Shadows / Brand button`, `[day] Brand button`, `Shadows/Brand button|Button` → снять (как п.38б) ★.
29. Без аналога: `Shadow Tabbar` (174), `Shadow S|M`, `Cards | Shadow *`, `Shadow Up|Down`, `Shadow Surface`,
    `Shadow 2`, `/Input shadow`, `Shadow / Card|bottomSheet|Top`, `Shadows/FAB`, сырая 0,4 r12 @0.10 (1830)
    → оставить, список ★ · б) ближайшие Small/Medium.
30. Размытия и стекло (layer/background blur, `Glass/Navbar`, `Material Blur`, `.blur tiny`, `Ultra Thin`)
    → не трогаем ★.

## Градиенты

31. В новой библиотеке градиентов нет → не трогаем ★.

---

## Приложение: ближайшие color-sem по каждой старой переменной (≥15 применений)

| Было | Кол-во | Слоты | День / ночь | Ближайшие color-sem (Δ = отличие день+ночь) |
|---|---|---|---|---|
| Color:tx-accent/grey/primary | 11207 | shape 2508, text 8210, stroke 489 | 242429 / efeff5 | Text/Primary (0f0f1f@0.87 / f8faff, Δ41)<br>Text/Success (23ad58 / d2ff73, Δ279) |
| Theme:text icon/primary | 4779 | text 3633, shape 1128, frame 10, stroke 8 | 242429 / f6f6f9 | Text/Primary (0f0f1f@0.87 / f8faff, Δ31)<br>Text/Success (23ad58 / d2ff73, Δ284) |
| Color:tx-accent/grey/tertiary | 4019 | shape 3972, text 30, stroke 1, frame 16 | c4c4d4 / 5f5f6d | Icon/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ74)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ113) |
| Theme:text icon/secondary | 2975 | text 2253, shape 722 | 808093 / 9b9bb0 | Text/Secondary Clean (7e7e86 / 7e7e86, Δ72)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ76) |
| Color:tx-bg/level 1 base | 2038 | frame 1989, stroke 30, shape 15, text 4 | fffffe / 222226 | Background/Primary (ffffff / 202024, Δ4)<br>Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ25) |
| Theme:bg/level 1 base | 1523 | frame 790, shape 731, stroke 2 | ffffff / 18181b | Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ13)<br>Background/Primary (ffffff / 202024, Δ14) |
| Color:tx-control/yellow/bg/idle | 1337 | shape 1118, frame 2, stroke 217 | ffe400 / ffe400 | Stroke/Neon (9dff00 / 9dff00, Δ203)<br>Icon/Attention Deep (ff7200 / ff661a, Δ243) |
| Theme TX:tx-accent/grey/primary | 1298 | shape 1284, text 13, frame 1 | 242429 / efeff5 | Icon/Primary (0f0f1f@0.87 / f8faff, Δ41)<br>Icon/Success (23ad58 / d2ff73, Δ279) |
| Theme:bg/level 2 | 1049 | frame 890, shape 159 | f6f6f9 / 242429 | Background/Secondary (f5f5f5 / 2a2a31, Δ16)<br>Field/Primary (f5f5f5 / 2b2d34, Δ20) |
| Color:tx-accent/grey/light const | 993 | shape 455, text 538 | fffffe / ffffff | Text/Constant White (ffffff / f8faff, Δ10)<br>Text/Constant White Secondary (ffffff@0.50 / ffffff@0.50, Δ222) |
| Color:tx-accent/grey/dark const | 894 | frame 349, shape 537, text 8 | 000000 / 000000 | Icon/Constant Black (0f0f1f@0.87 / 0f0f1f@0.87, Δ121)<br>Pastel/Ralph (303038 / 34343d, Δ184) |
| Color:tx-control/orange/bg/idle | 860 | shape 860 | f24f18 / e34914 | Icon/Warning (e52817 / e53828, Δ67)<br>Stroke/Warning (e52817 / e53828, Δ67) |
| Variable collection:Accent Purple | 816 | frame 22, shape 433, text 338, stroke 23 | 8526ff / 8526ff | Icon/Accent (8526ff / 9966ff, Δ67)<br>Stroke/Accent (8526ff / 9966ff, Δ67) |
| Color:tx-bg/level −1 muted | 813 | frame 689, shape 32, stroke 92 | ededf3 / 18181b | Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ21)<br>Background/Separator (777788@0.20 / 777788@0.30, Δ39) |
| Color:tx-accent/grey/secondary | 805 | text 605, stroke 137, shape 63 | 8f8fa3 / 9b9bb0 | Text/Secondary Clean (7e7e86 / 7e7e86, Δ96)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ100) |
| Color:tx-control/neutral/bg/idle | 676 | frame 670, shape 6 | f6f6f9 / 2f2f37 | Field/Primary (f5f5f5 / 2b2d34, Δ10)<br>Button/Disabled (f5f5f5 / 2b2d34, Δ10) |
| Color:tx-accent/purple/fg | 565 | shape 206, text 16, frame 341, stroke 2 | a73afd / aa80ff | Background/Accent (8526ff / 884dff, Δ101)<br>Button/Primary (8526ff / 884dff, Δ101) |
| Theme TX:tx-bg/level 1 base | 504 | frame 504 | fffffe / 222226 | Background/Primary (ffffff / 202024, Δ4)<br>Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ25) |
| Color:tx-brand/green/green | 491 | shape 491 | 48ea4d / 48ea4d | Icon/Success (23ad58 / d2ff73, Δ217)<br>Stroke/Neon (9dff00 / 9dff00, Δ233) |
| theme:icon/whiteConst | 436 | shape 436 | ffffff / ffffff | Icon/Constant White (ffffff / f8faff, Δ9)<br>Stroke/Active Car (ff9afd / ff9afd, Δ202) |
| Color:tx-accent/grey/quaternary | 389 | shape 252, stroke 137 | e0e0eb / 474752 | Pastel/Hans (e5e6f1 / 3f4048, Δ24)<br>Icon/Secondary Inverted (e9eaee / 393944, Δ38) |
| theme:text/primary | 380 | text 379, shape 1 | 242429 / f6f6f9 | Text/Primary (0f0f1f@0.87 / f8faff, Δ31)<br>Text/Success (23ad58 / d2ff73, Δ284) |
| Color:tx-accent/grey/dark strong | 365 | shape 348, stroke 17 | 18181b / ffffff | Icon/Primary (0f0f1f@0.87 / f8faff, Δ54)<br>Icon/Success (23ad58 / d2ff73, Δ308) |
| theme:icon/secondary | 360 | shape 360 | c4c4d4 / 5f5f6d | Icon/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ74)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ113) |
| theme:icon/blackConst | 329 | shape 329 | 18181b / 18181b | Icon/Constant Black (0f0f1f@0.87 / 0f0f1f@0.87, Δ61)<br>Pastel/Ralph (303038 / 34343d, Δ97) |
| Theme:bg/blackConst | 319 | shape 297, frame 21, stroke 1 | 000000 / 000000 | Icon/Constant Black (0f0f1f@0.87 / 0f0f1f@0.87, Δ121)<br>Pastel/Ralph (303038 / 34343d, Δ184) |
| Theme:text icon/tertiary | 316 | text 16, shape 300 | c4c4d4 / 5f5f6d | Icon/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ74)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ113) |
| Theme:bg/level -1 | 314 | frame 262, shape 52 | f6f6f9 / 000000 | Technical/Invisible Deep (000000@0.00 / 000000@0.00, Δ14)<br>Background/Zone Warning (d62347@0.10 / d62347@0.10, Δ41) |
| theme:pageIndicator/standart/noActive | 288 | shape 288 | c4c4d4 / 5f5f6d | Icon/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ74)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ113) |
| Theme:pageIndicator/accent/noActive | 280 | shape 280 | c4c4d4 / 5f5f6d | Icon/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ74)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ113) |
| Color:tx-control/red/tint/idle | 279 | frame 279 | ffece5 / 3a1b19 | Pastel/Tony (ffefeb / 3a1b19, Δ7)<br>Background/Zone Attention (ff7200@0.10 / ff7200@0.10, Δ49) |
| Theme:text icon/whitePrimaryConst | 268 | text 191, shape 77 | ffffff / ffffff | Text/Constant White (ffffff / f8faff, Δ9)<br>Text/Constant White Secondary (ffffff@0.50 / ffffff@0.50, Δ221) |
| Theme TX:tx-accent/red/fg | 247 | text 243, shape 4 | e51300 / ff614d | Text/Warning (e52817 / e53828, Δ92)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ341) |
| Color:tx-accent/grey/light strong | 234 | stroke 2, text 27, shape 152, frame 53 | fffffe / 18181b | Stroke/Contrast (ffffff / 0f0f1f, Δ14)<br>Icon/Primary Inverted (ffffff / 0f0f1f@0.87, Δ16) |
| Color:tx-accent/red/bg | 218 | frame 6, text 1, stroke 211 | e52817 / e53828 | Stroke/Warning (e52817 / e53828, Δ0)<br>Stroke/Zone Forbidden (ec5171 / c73553, Δ152) |
| Theme:separator/default | 196 | shape 196 | 777788@0.50 / a7a7be@0.40 | Icon/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ59)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ82) |
| Theme:text icon/accent | 190 | shape 72, text 118 | a73afd / 998aff | Text/Accent (8526ff / 9966ff, Δ75)<br>Text/Secondary Clean (7e7e86 / 7e7e86, Δ268) |
| Color:tx-accent/green/bg | 185 | shape 89, frame 3, stroke 92, text 1 | 00b23c / 06c45a | Stroke/Neon (9dff00 / 9dff00, Δ370)<br>Route/Primary (393944 / d6d7dc, Δ380) |
| Theme TX:tx-bg/overlay | 181 | shape 181 | 242429@0.40 / 000000@0.64 | Icon/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ116)<br>Technical/Invisible Deep (000000@0.00 / 000000@0.00, Δ151) |
| Color:tx-accent/purple/bg | 181 | shape 15, stroke 136, frame 30 | a73afd / b266ff | Stroke/Accent (8526ff / 9966ff, Δ64)<br>Stroke/Zone Availability (8f69ff / 734edf, Δ127) |
| theme:bg/blackConst | 152 | shape 152 | 000000 / 000000 | Icon/Constant Black (0f0f1f@0.87 / 0f0f1f@0.87, Δ121)<br>Pastel/Ralph (303038 / 34343d, Δ184) |
| theme:bg/ashToSmoke | 151 | frame 151 | f6f6f9 / 242429 | Background/Secondary (f5f5f5 / 2a2a31, Δ16)<br>Field/Primary (f5f5f5 / 2b2d34, Δ20) |
| theme:BG/airToCoal | 142 | shape 124, frame 18 | ffffff / 18181b | Stroke/Contrast (ffffff / 0f0f1f, Δ13)<br>Icon/Primary Inverted (ffffff / 0f0f1f@0.87, Δ15) |
| Variable collection:BG Dark | 135 | frame 135 | 393944 / 393944 | Pastel/Ralph (303038 / 34343d, Δ27)<br>Pastel/Apu (4e4e60 / 2d2d38, Δ62) |
| theme:button/primary/bg/default | 132 | frame 132 | a73afd / a733ff | Background/Accent (8526ff / 884dff, Δ80)<br>Button/Primary (8526ff / 884dff, Δ80) |
| theme:promo/secondary/bg/sky | 130 | frame 76, shape 54 | d8f2fd / 103341 | Background/Zone Unavailable (8c7aff@0.25 / 7262da@0.25, Δ54)<br>Background/Success Surface (d6ede1 / 283c32, Δ58) |
| theme:promo/secondary/bg/blackberry | 120 | frame 114, text 6 | f2e6fe / 2f2640 | Field/Primary (f5f5f5 / 2b2d34, Δ32)<br>Button/Disabled (f5f5f5 / 2b2d34, Δ32) |
| Theme:bg/level 2 alternative | 115 | frame 115 | ffffff / 242429 | Background/Primary (ffffff / 202024, Δ8)<br>Background/Secondary (f5f5f5 / 2a2a31, Δ29) |
| theme:promo/secondary/content/blackberry | 114 | text 114 | a73afd / aa80ff | Text/Accent (8526ff / 9966ff, Δ71)<br>Text/Secondary Clean (7e7e86 / 7e7e86, Δ272) |
| theme:bg/level 2 | 113 | frame 112, shape 1 | f6f6f9 / 242429 | Background/Secondary (f5f5f5 / 2a2a31, Δ16)<br>Field/Primary (f5f5f5 / 2b2d34, Δ20) |
| Color:tx-accent/grey/primary-Inverted | 107 | frame 21, shape 86 | efeff5 / 242429 | Stroke/Separator (777788@0.20 / 777788@0.30, Δ21)<br>Pastel/Barney (eeeeee / 363636, Δ36) |
| Color:tx-accent/red/fg | 102 | text 18, shape 81, frame 3 | e51300 / ff614d | Icon/Warning (e52817 / e53828, Δ92)<br>Stroke/Warning (e52817 / e53828, Δ92) |
| theme:promo/secondary/content/red | 94 | text 84, stroke 10 | fa2b55 / ff4760 | Text/Warning (e52817 / e53828, Δ129)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ300) |
| Theme:stroke/forLevel1 | 93 | stroke 93 | ffffff / 18181b | Stroke/Contrast (ffffff / 0f0f1f, Δ13)<br>Stroke/Secondary (ffffff / 393944, Δ62) |
| theme:icon/contraste | 93 | shape 91, text 2 | 18181b / f6f6f9 | Icon/Primary (0f0f1f@0.87 / f8faff, Δ53)<br>Icon/Success (23ad58 / d2ff73, Δ300) |
| Color:tx-accent/green/alt | 93 | shape 48, text 45 | 009934 / 00ab4c | Pastel/Ralph (303038 / 34343d, Δ246)<br>Pastel/Apu (4e4e60 / 2d2d38, Δ252) |
| Theme:text icon/blackPrimaryConst | 91 | text 85, shape 6 | 242429 / 242429 | Text/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ278)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ313) |
| theme:promo/secondary/bg/red | 84 | frame 84 | feeaee / 49121c | Pastel/Tony (ffefeb / 3a1b19, Δ24)<br>Background/Secondary (f5f5f5 / 2a2a31, Δ60) |
| theme:promo/secondary/bg/green | 84 | frame 84 | e4f8ee / 203c2e | Background/Success Surface (d6ede1 / 283c32, Δ31)<br>Background/Tab Selected (d9d9d9@0.50 / ffffff@0.20, Δ36) |
| theme:promo/secondary/content/green | 84 | text 84 | 1daf66 / 1dcb74 | Text/Success (23ad58 / d2ff73, Δ204)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ238) |
| theme:promo/primary/bg/river | 84 | shape 84 | 0098fe / 0098fe | Icon/Special (005aff / 005aff, Δ124)<br>Stroke/Special Deep (3458e9 / a8c6ff, Δ259) |
| theme:stroke/contrasteInverted | 83 | stroke 79, shape 4 | ffffff / 18181b | Stroke/Contrast (ffffff / 0f0f1f, Δ13)<br>Stroke/Secondary (ffffff / 393944, Δ62) |
| theme:text/tertiary | 81 | text 81 | c4c4d4 / 5f5f6d | Text/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ74)<br>Text/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ119) |
| theme:icon/primary | 78 | shape 75, text 3 | a73afd / aa80ff | Icon/Accent (8526ff / 9966ff, Δ71)<br>Stroke/Accent (8526ff / 9966ff, Δ71) |
| theme:bg/level 1 base | 76 | frame 54, shape 22 | ffffff / 18181b | Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ13)<br>Background/Primary (ffffff / 202024, Δ14) |
| Theme:pageIndicator/accent/active | 73 | shape 73 | a73afd / 998aff | Icon/Accent (8526ff / 9966ff, Δ75)<br>Stroke/Accent (8526ff / 9966ff, Δ75) |
| Theme:bg/whiteConst | 73 | frame 43, shape 30 | ffffff / ffffff | Background/Constant White (ffffff / ffffff, Δ0)<br>Background/PPL Pin/Inner (ffffff / 425076, Δ292) |
| Theme:button/primary/content/primary/default | 72 | shape 63, text 9 | ffffff / ffffff | Icon/Constant White (ffffff / f8faff, Δ9)<br>Stroke/Active Car (ff9afd / ff9afd, Δ202) |
| theme:pageIndicator/standart/active | 72 | shape 72 | a73afd / aa80ff | Icon/Accent (8526ff / 9966ff, Δ71)<br>Stroke/Accent (8526ff / 9966ff, Δ71) |
| theme:button/primary/content/defaultPrimary | 72 | shape 72 | ffffff / ffffff | Icon/Constant White (ffffff / f8faff, Δ9)<br>Stroke/Active Car (ff9afd / ff9afd, Δ202) |
| System Colors:Separators/Non-opaque | 67 | stroke 67 | 545456@0.34 / 545456@0.60 | Stroke/Separator (777788@0.20 / 777788@0.30, Δ79)<br>Stroke/Primary (e9eaee / 393944, Δ85) |
| Theme TX:tx-bg/map | 66 | frame 66 | f1f5ec / 323a4d | Button/Secondary (e9eaee / 393944, Δ25)<br>Background/Pill Secondary (ededf3 / 404047, Δ28) |
| theme:text/danger | 65 | text 65 | fa2b55 / ff4760 | Text/Warning (e52817 / e53828, Δ129)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ300) |
| Theme:bg/accent | 65 | shape 20, frame 45 | a73afd / 7d6aff | Background/Accent (8526ff / 884dff, Δ71)<br>Button/Primary (8526ff / 884dff, Δ71) |
| Color:tx-accent/purple/alt | 63 | text 22, shape 41 | 9022e5 / 9757d9 | Icon/Accent (8526ff / 9966ff, Δ69)<br>Stroke/Accent (8526ff / 9966ff, Δ69) |
| theme:text/link | 62 | text 62 | a73afd / aa80ff | Text/Accent (8526ff / 9966ff, Δ71)<br>Text/Secondary Clean (7e7e86 / 7e7e86, Δ272) |
| theme:text/secondary | 59 | text 57, shape 2 | 8f8fa3 / 9d9dae | Text/Secondary Clean (7e7e86 / 7e7e86, Δ97)<br>Text/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ101) |
| Colors:Labels - Vibrant - Controls/Primary | 58 | text 58 | 1a1a1a / f5f5f5 | Text/Primary (0f0f1f@0.87 / f8faff, Δ56)<br>Text/Success (23ad58 / d2ff73, Δ295) |
| Color:tx-bg/banner | 57 | frame 57 | f5eff6 / 261f2a | Background/Secondary (f5f5f5 / 2a2a31, Δ20)<br>Field/Primary (f5f5f5 / 2b2d34, Δ24) |
| Theme TX:tx-accent/purple/fg | 55 | stroke 12, frame 28, shape 15 | a73afd / aa80ff | Background/Accent (8526ff / 884dff, Δ101)<br>Button/Primary (8526ff / 884dff, Δ101) |
| Theme:text icon/whiteSecondaryConst | 55 | text 55 | ffffff@0.75 / ffffff@0.75 | Text/Constant White (ffffff / f8faff, Δ104)<br>Text/Constant White Secondary (ffffff@0.50 / ffffff@0.50, Δ110) |
| theme:icon/danger | 54 | shape 54 | fa2b55 / ff4760 | Stroke/Zone Forbidden (ec5171 / c73553, Δ109)<br>Icon/Warning (e52817 / e53828, Δ129) |
| Navigator Color:Jam/Middle | 51 | shape 51 | ffe400 / ffe400 | Stroke/Neon (9dff00 / 9dff00, Δ203)<br>Icon/Attention Deep (ff7200 / ff661a, Δ243) |
| Theme TX:tx-accent/orange/bg | 50 | frame 6, shape 42, text 2 | f24f18 / e56000 | Icon/Attention Deep (ff7200 / ff661a, Δ82)<br>Icon/Warning (e52817 / e53828, Δ98) |
| Variable collection:Neon Green | 50 | text 19, stroke 31 | 9dff00 / 9dff00 | Stroke/Neon (9dff00 / 9dff00, Δ0)<br>Stroke/Warning (e52817 / e53828, Δ443) |
| theme:text/whitePrimaryConst | 42 | text 42 | ffffff / ffffff | Text/Constant White (ffffff / f8faff, Δ9)<br>Text/Constant White Secondary (ffffff@0.50 / ffffff@0.50, Δ221) |
| Navigator Color:Jam/High | 40 | shape 40 | ff5413 / ff5413 | Icon/Attention Deep (ff7200 / ff661a, Δ55)<br>Icon/Warning (e52817 / e53828, Δ95) |
| Theme:loader/whiteConst | 39 | shape 39 | ffffff / ffffff | Icon/Constant White (ffffff / f8faff, Δ9)<br>Stroke/Active Car (ff9afd / ff9afd, Δ202) |
| theme:separator/default | 36 | shape 36 | 2d2d53@0.30 / a7a7be@0.40 | Icon/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ58)<br>Pastel/Hans (e5e6f1 / 3f4048, Δ71) |
| Theme:skeleton/forLevel1 | 36 | frame 36 | f6f6f9 / 242429 | Background/Secondary (f5f5f5 / 2a2a31, Δ16)<br>Field/Primary (f5f5f5 / 2b2d34, Δ20) |
| Theme TX:tx-bg/map neue | 34 | frame 34 | e2f2c3 / 12302c | Background/Success Surface (d6ede1 / 283c32, Δ58)<br>Background/Separator (777788@0.20 / 777788@0.30, Δ61) |
| Color:tx-bg/map | 32 | frame 32 | f1f5ec / 323a4d | Button/Secondary (e9eaee / 393944, Δ25)<br>Background/Pill Secondary (ededf3 / 404047, Δ28) |
| theme:tx-bg/level −1 muted | 31 | frame 31 | ededf3 / 18181b | Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ21)<br>Background/Separator (777788@0.20 / 777788@0.30, Δ39) |
| Theme TX:tx-control/purple/bg/idle | 31 | frame 31 | a73afd / a73afd | Background/Accent (8526ff / 884dff, Δ76)<br>Button/Primary (8526ff / 884dff, Δ76) |
| Color:tx-control/red/bg/idle | 31 | frame 31 | e52817 / e53727 | Background/Warning (e52817 / e53828, Δ1)<br>Background/Attention Deep (ff7200 / ff7200, Δ157) |
| theme:notification/brandPrimary | 28 | frame 28 | a73afd / a733ff | Background/Accent (8526ff / 884dff, Δ80)<br>Button/Primary (8526ff / 884dff, Δ80) |
| Theme TX:tx-button/blurring/solid/bg/default | 28 | frame 28 | aaaaab / 272a32 | Background/Overlay (000000@0.30 / 000000@0.30, Δ90)<br>Background/Quaternary (0f0f1f@0.26 / 0f0f1f@0.54, Δ98) |
| Colors:Fill/Messaging Bubble | 27 | shape 27 | e6e5eb / 262629 | Stroke/Separator (777788@0.20 / 777788@0.30, Δ8)<br>Pastel/Barney (eeeeee / 363636, Δ39) |
| Colors:Accents/Blue | 27 | shape 25, text 2 | 0088ff / 0091ff | Icon/Special (005aff / 005aff, Δ101)<br>Stroke/Special Deep (3458e9 / a8c6ff, Δ250) |
| Theme:chips/primary/counter/bg/on/default | 26 | frame 26 | a73afd / 998aff | Background/Accent (8526ff / 884dff, Δ103)<br>Button/Primary (8526ff / 884dff, Δ103) |
| Color:tx-control/purple/tint/idle | 26 | frame 26 | f9edfc / 2b1f2e | Background/Secondary (f5f5f5 / 2a2a31, Δ23)<br>Field/Primary (f5f5f5 / 2b2d34, Δ27) |
| Theme:additional/buttonBuy/content/defaultPrimary | 25 | text 25 | ffffff / ffffff | Text/Constant White (ffffff / f8faff, Δ9)<br>Text/Constant White Secondary (ffffff@0.50 / ffffff@0.50, Δ221) |
| Theme:controls/text icon/primary/default | 24 | text 21, shape 3 | 242429 / efeff5 | Text/Primary (0f0f1f@0.87 / f8faff, Δ41)<br>Text/Success (23ad58 / d2ff73, Δ279) |
| System Colors:Colors/Blue | 24 | text 24 | 007aff / 0a84ff | Text/Accent (8526ff / 9966ff, Δ303)<br>Text/Secondary Clean (7e7e86 / 7e7e86, Δ342) |
| Theme:button/primary/bg/default | 21 | frame 21 | a73afd / 7d6aff | Background/Accent (8526ff / 884dff, Δ71)<br>Button/Primary (8526ff / 884dff, Δ71) |
| Theme TX:tx-accent/purple/bg | 20 | frame 19, shape 1 | a73afd / b266ff | Background/Accent (8526ff / 884dff, Δ88)<br>Button/Primary (8526ff / 884dff, Δ88) |
| theme:stroke/primary | 19 | shape 18, stroke 1 | a73afd / aa80ff | Icon/Accent (8526ff / 9966ff, Δ71)<br>Stroke/Accent (8526ff / 9966ff, Δ71) |
| Theme TX:tx-bg/level −1 muted | 19 | frame 15, stroke 4 | ededf3 / 18181b | Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ21)<br>Background/Separator (777788@0.20 / 777788@0.30, Δ39) |
| Theme:text icon/primaryInverted | 18 | text 15, shape 3 | f6f6f9 / 242429 | Text/Primary Inverted (ffffff / 0f0f1f@0.87, Δ49)<br>Text/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ99) |
| theme:bg/accent | 18 | frame 18 | a73afd / a733ff | Background/Accent (8526ff / 884dff, Δ80)<br>Button/Primary (8526ff / 884dff, Δ80) |
| Theme TX:tx-control/inverted/bg/hover | 18 | frame 18 | 292934 / f2f2f7 | Background/PPL Pin/Back (303038 / c9d1e4, Δ67)<br>Pastel/Ralph (303038 / 34343d, Δ337) |
| Colors:BG/Level-1 | 18 | frame 14, shape 4 | ffffff / 18181b | Background/Navbar (f5f5f5@0.60 / 2a2a31@0.60, Δ13)<br>Background/Primary (ffffff / 202024, Δ14) |
| Colors:Text-Icon/Secondary | 18 | shape 10, text 8 | 8f8fa3 / 9b9bb0 | Icon/Secondary (0f0f1f@0.54 / ffffff@0.50, Δ100)<br>Icon/Tertiary (0f0f1f@0.38 / ffffff@0.38, Δ144) |
| System Colors:Labels/Primary | 18 | text 18 | 000000 / ffffff | Text/Primary (0f0f1f@0.87 / f8faff, Δ97)<br>Text/Success (23ad58 / d2ff73, Δ344) |
| Theme TX:tx-accent/green/bg | 17 | frame 17 | 00b23c / 06c45a | Background/Success (23ad58 / 23ad58, Δ82)<br>Pastel/Apu (4e4e60 / 2d2d38, Δ291) |
| theme:bg/accentSecondary | 17 | frame 17 | f2e6fe / 2f2640 | Field/Primary (f5f5f5 / 2b2d34, Δ32)<br>Button/Disabled (f5f5f5 / 2b2d34, Δ32) |
| Colors:Fills - Vibrant/Tertiary | 17 | shape 17 | ededed / 121212 | Icon/Primary Inverted (ffffff / 0f0f1f@0.87, Δ43)<br>Stroke/Contrast (ffffff / 0f0f1f, Δ45) |
| Theme:bg/accentLight | 16 | frame 10, shape 3, text 3 | f8e7ff / 2a2843 | Field/Primary (f5f5f5 / 2b2d34, Δ33)<br>Button/Disabled (f5f5f5 / 2b2d34, Δ33) |
| Theme TX:tx-accent/orange/tint | 16 | shape 4, text 12 | fdeddc / 431c00 | Text/Primary Inverted (ffffff / 0f0f1f@0.87, Δ102)<br>Text/Disabled (0f0f1f@0.26 / ffffff@0.16, Δ129) |
| theme:switch/bg/defaultOff | 15 | frame 15 | e0e0eb / 474752 | Pastel/Hans (e5e6f1 / 3f4048, Δ24)<br>Background/Pill Secondary (ededf3 / 404047, Δ35) |
| theme:switch/circle/default | 15 | frame 15 | ffffff / ffffff | Background/Constant White (ffffff / ffffff, Δ0)<br>Background/PPL Pin/Inner (ffffff / 425076, Δ292) |
| GEO Theme:content/primary | 15 | shape 15 | 242429 / efeff5 | Icon/Primary (0f0f1f@0.87 / f8faff, Δ41)<br>Icon/Success (23ad58 / d2ff73, Δ279) |

