# Расхождения Figma и Presentbook: токены, стили, иконки (Driver, Rider)

Дата выгрузки: 2026-10-20. Источники: Figma Driver Tokens `ouP1hUC4YjVRpfgdvzy3FA`, Driver Icons `AwRpEGfyeNjRbZP8KGG1wy`, Rider Tokens `yrfG6u9osujKX8e1B14lpT`, Rider Icons `n6LppQbTv85yI29h6u30DI`. Выгрузка Figma — `values/raw/`, данные Presentbook — `values/presentbook.json`, скрипт — `values/compare.py`. Компоненты не сравнивались.

## Сводка

| Продукт | Коллекция | В Figma | В Presentbook | Расхождений | Где в Presentbook |
|---|---|---|---|---|---|
| Driver | color-sem | 132 | 131 | 1 (нет в Presentbook: 1) | `pages/aid-portal/data.ts` |
| Rider | color-sem | 145 | 129 | 40 (другое значение: 15, другое имя: 7, нет в Presentbook: 17, нет в Figma: 1) | `pages/aid-portal/products/rider/colorData.ts` |
| Driver | gradients | 12 | 12 | 0 | `pages/aid-portal/gradientsData.ts` |
| Rider | gradients | 14 | 0 | 14 (нет в Presentbook: 14) | `отсутствует: в products/rider/index.ts нет gradientSections, страницы нет` |
| Driver | typography-sem | 20 | 20 | 0 | `pages/aid-portal/typographyData.ts` |
| Rider | typography-sem (Default + Outstanding) | 25 | 24 | 1 (нет в Presentbook: 1) | `pages/aid-portal/products/rider/typographyData.ts (Default), typographyOutstandingData.ts (Outstanding)` |
| Driver | space | 17 | 19 | 2 (нет в Figma: 2) | `pages/aid-portal/spacingData.ts` |
| Rider | space | 22 | 22 | 0 | `pages/aid-portal/products/rider/spacingData.ts` |
| Driver | radius | 13 | 13 | 0 | `pages/aid-portal/radiusData.ts` |
| Rider | radius | 14 | 14 | 0 | `pages/aid-portal/products/rider/radiusData.ts` |
| Driver | effects (Shadows) | 48 | 48 | 0 | `pages/aid-portal/shadowsData.ts` |
| Rider | effects (Shadows, Glass) | 131 | 106 | 30 (нет в Presentbook: 25, другое значение: 4, другое имя: 1) | `pages/aid-portal/products/rider/shadowData.ts (Shadows), glassData.ts (Glass)` |
| Driver | icons | 315 | 314 | 1 (нет в Presentbook: 1) | `pages/aid-portal/iconsData.ts (+ navigatorIconsData.ts)` |
| Rider | icons | 176 | 129 | 54 (другое имя: 3, нет в Presentbook: 49, нет в Figma: 2) | `pages/aid-portal/products/rider/iconsData.ts` |

Пояснения:
- «В Figma» и «В Presentbook» — число переменных (цвета, отступы, радиусы, эффекты — по каждому свойству отдельно: offset-x, blur, color и т. д.), у типографики — число стилей, у иконок — число компонентов.
- Цвета сравнены по hex и прозрачности (допуск 0.6 п.п.); псевдонимы развёрнуты до конечного значения.
- Не сравнивались (в Presentbook не показываются как отдельные страницы): коллекции typography-core (Driver 30, Rider 40) и icon-sizes (Rider, 1 переменная, 8 режимов); поля paragraph-spacing у typography-sem; угол градиентов и позиции Rider-градиентов; описания токенов.
- Состав стилей типографики и теней (text/effect styles) совпадает с составом переменных; отдельных расхождений по именам стилей, кроме указанных в таблицах, нет. Paint styles Rider (Top, Bottom, Viewpoint, Fade Horizontal, Shimmer) в Presentbook отсутствуют вместе со всей коллекцией gradients.
- Presentbook Rider: отдельной страницы градиентов нет (`products/rider/index.ts` не экспортирует `gradientSections`).

## Driver · color-sem

Где в Presentbook: `pages/aid-portal/data.ts`. Figma: 132, Presentbook: 131.

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| Bg/Accent Secondary | Day #8526FF 10% / Night #8526FF 14% | - | нет в Presentbook |

## Rider · color-sem

Где в Presentbook: `pages/aid-portal/products/rider/colorData.ts`. Figma: 145, Presentbook: 129.

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| Background/Success Surface | Day #D6EDE1 100% / Night #283C32 100% | Day #D6EDE1 100% / Night #D6EDE1 100% | другое значение (Night) |
| Background/Attention Surface | Day #F9E8BF 100% / Night #402222 100% | Day #F9E8BF 100% / Night #F9E8BF 100% | другое значение (Night) |
| Background/Warning | Day #E52817 100% / Night #E53828 100% | Day #D62347 100% / Night #D62347 100% | другое значение (Day, Night) |
| Text/Warning | Day #E52817 100% / Night #E53828 100% | Day #D62347 100% / Night #D62347 100% | другое значение (Day, Night) |
| Text/Success | Day #23AD58 100% / Night #D2FF73 100% | Day #23AD58 100% / Night #23AD58 100% | другое значение (Night) |
| Text/Attention Deep | Day #FF7200 100% / Night #FFA173 100% | Day #FF7200 100% / Night #FF7200 100% | другое значение (Night) |
| Icon/Warning | Day #E52817 100% / Night #E53828 100% | Day #D62347 100% / Night #D62347 100% | другое значение (Day, Night) |
| Icon/Success | Day #23AD58 100% / Night #D2FF73 100% | Day #23AD58 100% / Night #23AD58 100% | другое значение (Night) |
| Icon/Attention Deep | Day #FF7200 100% / Night #FFA173 100% | Day #FF7200 100% / Night #FF7200 100% | другое значение (Night) |
| Stroke/Warning | Day #E52817 100% / Night #E53828 100% | Day #D62347 100% / Night #D62347 100% | другое значение (Day, Night) |
| Stroke/Attention Deep | Day #FF7200 100% / Night #FFA173 100% | Day #FF7200 100% / Night #FF7200 100% | другое значение (Night) |
| Technical/Invisible Deep | Day #000000 0% / Night #000000 0% | Day #000000 100% / Night #000000 100% | другое значение (Day, Night) |
| Technical/Invisible Surface | Day #FFFFFF 0% / Night #FFFFFF 0% | Day #FFFFFF 100% / Night #FFFFFF 100% | другое значение (Day, Night) |
| Pastel/Nelson | Day #D6EDE1 100% / Night #393F3C 100% | Day #D6EDE1 100% / Night #393F3B 100% | другое значение (Night) |
| Pastel/Selma | Day #F8E6F3 100% / Night #423D41 100% | Day #F8E6F3 100% / Night #413D40 100% | другое значение (Night) |
| Text/Primary Inverted | Day #FFFFFF 100% / Night #0F0F1F 87% | Text/Primary Opposite | другое имя |
| Text/Secondary Inverted | Day #E9EAEE 100% / Night #393944 100% | Text/Secondary Opposite | другое имя |
| Text/Tertiary Inverted | Day #FFFFFF 38% / Night #0F0F1F 38% | Text/Tertiary Opposite | другое имя |
| Icon/Primary Inverted | Day #FFFFFF 100% / Night #0F0F1F 87% | Icon/Primary Opposite | другое имя |
| Icon/Secondary Inverted | Day #E9EAEE 100% / Night #393944 100% | Icon/Secondary Opposite | другое имя |
| Icon/Tertiary Inverted | Day #FFFFFF 38% / Night #0F0F1F 38% | Icon/Tertiary Opposite | другое имя |
| Stroke/Inverted | Day #393944 100% / Night #D6D7DC 100% | Stroke/Opposite | другое имя |
| Background/Zone Available | Day #EDEDFF 70% / Night #19191D 50% | - | нет в Presentbook |
| Background/Zone Unavailable | Day #8C7AFF 25% / Night #7262DA 25% | - | нет в Presentbook |
| Background/Zone Forbidden | Day #D62347 30% / Night #B01C3A 30% | - | нет в Presentbook |
| Text/Accent Inverted | Day #8526FF 100% / Night #FFD4F8 100% | - | нет в Presentbook |
| Icon/Accent Inverted | Day #8526FF 100% / Night #FFD4F8 100% | - | нет в Presentbook |
| Stroke/Secondary | Day #FFFFFF 100% / Night #393944 100% | - | нет в Presentbook |
| Button/Warning Default | Day #E52817 100% / Night #E53727 100% | - | нет в Presentbook |
| Button/Warning Pressed | Day #BF0020 100% / Night #FF4747 100% | - | нет в Presentbook |
| Stories/Nelson | Day #FAF8DC 100% / Night #FAF8DC 100% | - | нет в Presentbook |
| Stroke/Active Car | Day #FF9AFD 100% / Night #FF9AFD 100% | - | нет в Presentbook |
| Background/Pill Accent | Day #F5EFF6 100% / Night #4D4164 100% | - | нет в Presentbook |
| Background/Pill Secondary | Day #EDEDF3 100% / Night #404047 100% | - | нет в Presentbook |
| Stroke/Zone Availability | Day #8F69FF 100% / Night #734EDF 100% | - | нет в Presentbook |
| Stroke/Zone Forbidden | Day #EC5171 100% / Night #C73553 100% | - | нет в Presentbook |
| Background/PPL Pin/Back | Day #303038 100% / Night #C9D1E4 100% | - | нет в Presentbook |
| Mode Switch | строка: Day / Night | - | нет в Presentbook (не цвет) |
| Background/PPL Pin/Inner | Day #FFFFFF 100% / Night #425076 100% | - | нет в Presentbook |
| Button/Warning | - | Day #D62347 100% / Night #D62347 100% | нет в Figma |

## Driver · gradients

Где в Presentbook: `pages/aid-portal/gradientsData.ts`. Figma: 12, Presentbook: 12.

Расхождений нет.

## Rider · gradients

Где в Presentbook: `отсутствует: в products/rider/index.ts нет gradientSections, страницы нет`. Figma: 14, Presentbook: 0.

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| Top/Step 1-2 | Day #FFFFFF 78% / Night #202024 78% | - | нет в Presentbook |
| Bottom/Step 1-2 | Day #FFFFFF 100% / Night #202024 100% | - | нет в Presentbook |
| Top/Step 3 | Day #FFFFFF 0% / Night #202024 0% | - | нет в Presentbook |
| Bottom/Step 3 | Day #FFFFFF 0% / Night #202024 0% | - | нет в Presentbook |
| Viewpoint/Step 1-2 | Day #793AF5 60% / Night #884DFF 60% | - | нет в Presentbook |
| Fade Horizontal/Step 1 | Day #FFFFFF 0% / Night #202024 0% | - | нет в Presentbook |
| Fade Horizontal/Step 2 | Day #FFFFFF 100% / Night #202024 100% | - | нет в Presentbook |
| Viewpoint/Step 3-4 | Day #793AF5 0% / Night #884DFF 0% | - | нет в Presentbook |
| Shimmer/Step 1 | Day #FFFFFF 0% / Night #202024 0% | - | нет в Presentbook |
| Shimmer/Step 2 | Day #FFFFFF 29% / Night #202024 29% | - | нет в Presentbook |
| Shimmer/Step 3 | Day #FFFFFF 60% / Night #202024 60% | - | нет в Presentbook |
| Shimmer/Step 4 | Day #FFFFFF 87% / Night #202024 87% | - | нет в Presentbook |
| Shimmer/Step 5 | Day #FFFFFF 90% / Night #202024 90% | - | нет в Presentbook |
| Shimmer/Step 6 | Day #FFFFFF 100% / Night #202024 100% | - | нет в Presentbook |

## Driver · typography-sem

Где в Presentbook: `pages/aid-portal/typographyData.ts`. Figma: 20, Presentbook: 20.

Расхождений нет.

## Rider · typography-sem (Default + Outstanding)

Где в Presentbook: `pages/aid-portal/products/rider/typographyData.ts (Default), typographyOutstandingData.ts (Outstanding)`. Figma: 25, Presentbook: 24.

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| Captions/Caption 1 CAP | iOS SF Pro Text 600 12/16 ls 0 | And Roboto 600 12/16 ls 0 | - | нет в Presentbook |

## Driver · space

Где в Presentbook: `pages/aid-portal/spacingData.ts`. Figma: 17, Presentbook: 19.

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| space-96 | - | 96 | нет в Figma |
| space-128 | - | 128 | нет в Figma |

## Rider · space

Где в Presentbook: `pages/aid-portal/products/rider/spacingData.ts`. Figma: 22, Presentbook: 22.

Расхождений нет.

## Driver · radius

Где в Presentbook: `pages/aid-portal/radiusData.ts`. Figma: 13, Presentbook: 13.

Расхождений нет.

## Rider · radius

Где в Presentbook: `pages/aid-portal/products/rider/radiusData.ts`. Figma: 14, Presentbook: 14.

Расхождений нет.

## Driver · effects (Shadows)

Где в Presentbook: `pages/aid-portal/shadowsData.ts`. Figma: 48, Presentbook: 48.

Расхождений нет.

## Rider · effects (Shadows, Glass)

Где в Presentbook: `pages/aid-portal/products/rider/shadowData.ts (Shadows), glassData.ts (Glass)`. Figma: 131, Presentbook: 106.

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| Shadows/Active Car/Level 1/color | 000000@0.08 | - | нет в Presentbook |
| Shadows/Active Car/Level 1/blur | 3 | - | нет в Presentbook |
| Shadows/Active Car/Level 1/spread | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 1/offset-x | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 1/offset-y | 1 | - | нет в Presentbook |
| Shadows/Active Car/Level 2/color | FF00FB@0.12 | - | нет в Presentbook |
| Shadows/Active Car/Level 2/blur | 3 | - | нет в Presentbook |
| Shadows/Active Car/Level 2/spread | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 2/offset-x | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 2/offset-y | -2 | - | нет в Presentbook |
| Shadows/Active Car/Level 3/color | FF00FB@0.12 | - | нет в Presentbook |
| Shadows/Active Car/Level 3/blur | 3 | - | нет в Presentbook |
| Shadows/Active Car/Level 3/spread | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 3/offset-x | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 3/offset-y | 2 | - | нет в Presentbook |
| Shadows/Active Car/Level 4/color | FF00FB@0.12 | - | нет в Presentbook |
| Shadows/Active Car/Level 4/blur | 3 | - | нет в Presentbook |
| Shadows/Active Car/Level 4/spread | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 4/offset-x | -2 | - | нет в Presentbook |
| Shadows/Active Car/Level 4/offset-y | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 5/color | FF00FB@0.12 | - | нет в Presentbook |
| Shadows/Active Car/Level 5/blur | 3 | - | нет в Presentbook |
| Shadows/Active Car/Level 5/spread | 0 | - | нет в Presentbook |
| Shadows/Active Car/Level 5/offset-x | 2 | - | нет в Presentbook |
| Shadows/Active Car/Level 5/offset-y | 0 | - | нет в Presentbook |
| Glass/Navbar/Glass/light-intensity | Day 25 / Night 25 | Day 0.25 / Night 0.25 | другое значение (шкала: Figma 0-100, Presentbook 0-1) |
| Glass/Navbar/Glass/refraction | Day 70 / Night 70 | Day 0.7 / Night 0.7 | другое значение (шкала: Figma 0-100, Presentbook 0-1) |
| Glass/Navbar/Glass/dispersion | Day 20 / Night 20 | Day 0.2 / Night 0.2 | другое значение (шкала: Figma 0-100, Presentbook 0-1) |
| Glass/Navbar/Glass/frost | 50 | Glass/Navbar/Glass/radius = 50 | другое имя |
| Glass/Navbar/Glass/splay | Day 20 / Night 20 | Day 0.2 / Night 0.2 | другое значение (шкала: Figma 0-100, Presentbook 0-1) |

## Driver · icons

Где в Presentbook: `pages/aid-portal/iconsData.ts (+ navigatorIconsData.ts)`. Figma: 315, Presentbook: 314.

сравнение по node id компонента на странице Icons

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| info_filled | 5552:25 [informative] | - | нет в Presentbook |

## Rider · icons

Где в Presentbook: `pages/aid-portal/products/rider/iconsData.ts`. Figma: 176, Presentbook: 129.

сравнение по node id; Presentbook хранит имена без префикса ic_, при сравнении префикс ic_ у Figma отброшен

| токен | Figma | Presentbook | вид |
|---|---|---|---|
| share _android | 1713:151 [Actions] | share__android [actions] | другое имя |
| drag | 3766:75 [Actions] | - | нет в Presentbook |
| placeholder | 3804:38 [Actions] | - | нет в Presentbook |
| addresse_home | 3766:65 [Addresses] | - | нет в Presentbook |
| addresse_work | 3766:68 [Addresses] | - | нет в Presentbook |
| finish_flag | 3766:63 [Addresses] | - | нет в Presentbook |
| tree | 3766:70 [Addresses] | - | нет в Presentbook |
| circle | 3766:73 [Addresses] | - | нет в Presentbook |
| passenger | 3766:61 [Addresses] | - | нет в Presentbook |
| forbidden | 3745:11 [informative] | - | нет в Presentbook |
| question | 3755:73 [informative] | - | нет в Presentbook |
| question_smooth | 3813:58 [informative] | - | нет в Presentbook |
| no_location | 3763:6 [informative] | - | нет в Presentbook |
| spasibo_color | 1562:639 [Brands] | spasibo_color_2 [brands] | другое имя |
| mirbg_color | 1562:656 [Brands] | mirbg_color_2 [brands] | другое имя |
| succes | 1:2638 [Status] | - | нет в Presentbook |
| error | 1:2639 [Status] | - | нет в Presentbook |
| accommodation_main | 1:2884 [Markers] | - | нет в Presentbook |
| business_atm | 1:2877 [Markers] | - | нет в Presentbook |
| business_main | 1:2878 [Markers] | - | нет в Presentbook |
| business_petrolstation | 1:2879 [Markers] | - | нет в Presentbook |
| business_touristinformation | 1:2891 [Markers] | - | нет в Presentbook |
| eatdrink_barpub | 1:2887 [Markers] | - | нет в Presentbook |
| eatdrink_coffee | 1:2888 [Markers] | - | нет в Presentbook |
| eatdrink_main | 1:2889 [Markers] | - | нет в Presentbook |
| facilities_bank | 1:2880 [Markers] | - | нет в Presentbook |
| facilities_education | 1:2883 [Markers] | - | нет в Presentbook |
| facilities_hospital | 1:2892 [Markers] | - | нет в Presentbook |
| sights_attraction | 1:2890 [Markers] | - | нет в Presentbook |
| sights_religious | 1:2882 [Markers] | - | нет в Presentbook |
| transport_aerial | 1:2865 [Markers] | - | нет в Presentbook |
| transport_airport | 1:2866 [Markers] | - | нет в Presentbook |
| transport_bus | 1:2867 [Markers] | - | нет в Presentbook |
| transport_ferry | 1:2868 [Markers] | - | нет в Presentbook |
| transport_inclined | 1:2869 [Markers] | - | нет в Presentbook |
| transport_rail_regional | 1:2870 [Markers] | - | нет в Presentbook |
| facilities_parking | 1:2871 [Markers] | - | нет в Presentbook |
| goingout_cinema | 1:2885 [Markers] | - | нет в Presentbook |
| goingout_main | 1:2881 [Markers] | - | нет в Presentbook |
| leisure_amusement | 1:2872 [Markers] | - | нет в Presentbook |
| leisure_sport | 1:2873 [Markers] | - | нет в Presentbook |
| leisure_zoo | 1:2874 [Markers] | - | нет в Presentbook |
| natural_main | 1:2875 [Markers] | - | нет в Presentbook |
| shopping_main | 1:2886 [Markers] | - | нет в Presentbook |
| shopping_pharmacy | 1:2876 [Markers] | - | нет в Presentbook |
| adress | 1:2894 [Markers] | - | нет в Presentbook |
| adress_to | 1:2893 [Markers] | - | нет в Presentbook |
| forbidden | 735:82 [Scooters] | - | нет в Presentbook |
| parking | 735:83 [Scooters] | - | нет в Presentbook |
| no_parking | 735:84 [Scooters] | - | нет в Presentbook |
| parking_tarif | 735:86 [Scooters] | - | нет в Presentbook |
| speed | 735:85 [Scooters] | - | нет в Presentbook |
| radiobutton_on | - | 1:2399 [controls] | нет в Figma (на странице Icons) |
| radiobutton_off | - | 494:9 [controls] | нет в Figma (на странице Icons) |
