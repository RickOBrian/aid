# Повторный прогон New Rider Drafts — сводка (2026-11-03)

Правила: BYVAL (радиусы 0 / 100 / 18, отступ 18 — `final.md` §4) и сверка п.4–8 (`new-rider-drafts.sverka.md`,
`final.md` §9). Файл `eSitSKeHzy5fOUF1n3zg2B`; оригиналы не тронуты, копии не клонировались, узлы не
создавались и не удалялись. По одному агенту Sonnet на страницу; ошибок скрипта нет ни на одной странице.
Собственные свойства крупных корней, разбитых на детей, в этот раз прогнаны (SHALLOW) — замен не дали,
только сырые заливки (#444444 / #3a3a3a на фреймах, #ffffff@0.10 на обводках).

| страница | копия | заменено | не заменено |
|---|---|---:|---:|
| Backlog UI | `5371:80571` | 14 | 261 |
| not work | `5374:738087` | 6 | 261 |
| No car | `5374:1040241` | 68 | 797 |
| Tariffs | `5374:563482` | 101 | 957 |
| Permissions | `5374:1019808` | 44 | 589 |
| GEO Problems | `5374:885750` | 31 | 517 |
| Taxi | `5374:894051` | 51 | 1 033 |
| Errors | `5374:358551` | 80 | 1 662 |
| test | `5374:1030847` | 167 | 1 423 |
| Service coverage | `5374:86156` | 36 | 1 136 |
| Illustrations | `5374:721192` | 173 | 4 099 |
| Profile | `5374:527493` | 3 968 | 8 040 |
| Where | `5374:421690` | 837 | 8 578 |
| Where-Migration | `5374:623349` | 837 | 7 987 |
| Show my location | `5374:802548` | 4 220 | 6 078 |
| Order Flow | `5374:903468` | 5 482 | 7 624 |
| Navigation | `5374:207972` | 2 714 | 33 143 |
| **Итого** | | **18 829** | **84 185** |

«Не заменено» — сумма по отчётам страниц; один узел может давать причину несколько раз.

## Что дало больше всего замен

- `{Button:Border radius}` = 18 → radius-16: ≈ 7 950 (Show my location 3 820, Order Flow 4 100, остальное — Profile, GEO).
- Радиусы 0 / full → radius-flat / radius-pill: ≈ 3 500 по всем страницам.
- Текстовые стили: Caption → Caption 1, Title 1 / Subtitle 1, 2 (стар.) → новые, iOS / Subtitle L → Outstanding.
- Цвета по сверке: #242429 → Text/Primary, #232326 → Icon/Primary, Texts day/primary 1 → Text/Primary,
  `{Color:tx-accent/grey/primary}` → Stroke/Inverted (обводка) / Text/Primary (текст).
- Шрифты без стиля SF Pro Text 15/20 → Subtitle 2 (Semibold) / Body 2 (Regular).

## Кандидаты в анкету (нет правила, часто)

| что | где больше всего | ≈ кол-во |
|---|---|---:|
| эффекты `shadow/diffuse/m`, `shadow/diffuse/s` | Show my location, Order Flow | 1 400 |
| шрифт без стиля SF Pro Text Semibold 12/13 | Show my location, Order Flow | 810 |
| `{Color:tx-brand/green/green}` [shape] | Show my location, Order Flow | 490 |
| `[Background [day]/Secondary]` [shape] | Where, Where-Migration, test | 730 |
| `[Icons day/Secondary Pressed]` в обводке (скоуп SHAPE_FILL) | Where, Where-Migration | 330 |
| `{System:Magin Top}` = 54 paddingTop — нет цели | Show my location | 257 |
| WB Sans Medium 24/100 | Show my location | 234 |
| стили «Night / White», «Gray / 40%» | Illustrations | 270 |
| стили miniPig / pig / horse, ALS Hauss Medium 19/22 | Errors | 58 |
| `{theme:bg/level -1}` [frame] | Service coverage | 30 |

Вне переноса (оставляем): сырые #000000 / #c4c4c4 / #ffffff на шейпах иллюстраций, градиенты, layer_blur,
background_blur, сырая тень drop 0,4 r12 #000000@0.10, цвета Mastercard (#ff5f00, #eb001b, #f79e1b).

## Замечания

- Taxi: секция «ЗАДАЧА» на копии скрыта (`visible = false`) — не менялось; оригинал не сверялся.
- Illustrations: счёт узлов без `loadAsync` занижен (6 612 вместо 15 498 при skipInvisibleInstanceChildren);
  узлы на месте. Скрипт не заходит в скрытых детей инстансов.
- Profile: скрытый ребёнок инстанса `I5374:539492;4881:183661` недоступен по id — пропущен.
- Хвосты малых причин (за пределами топ-30) в отчётах страниц не сохранены.

## Прогон по анкете (2026-11-06)

Правила анкеты `new-rider-drafts.rerun-questions.md` (коммит 890f0d2), 4 копии, по одному агенту Sonnet за раз.
Ничего не клонировалось, не создавалось и не удалялось; ключи pluginData `mig` очищены; ошибок скрипта нет.
Отчёты — `rerun/<slug>-2.md`.

| страница | копия | заменено | не заменено | было не заменено |
|---|---|---:|---:|---:|
| Illustrations | `5374:721192` | 354 | 3 745 | 4 099 |
| Service coverage | `5374:86156` | 30 | 1 106 | 1 136 |
| Errors | `5374:358551` | 24 | 1 638 | 1 662 |
| Backlog UI | `5371:80571` | 14 | 247 | 261 |
| **Итого** | | **422** | **6 736** | **7 158** |

| правило | кол-во |
|---|---:|
| `[ Night / White]` → Text/Constant White (text) | 102 |
| `[Gray / 40%]` → Text/Tertiary (text) | 96 |
| `[iOS / H2]` → Titles/Title 3 | 59 |
| `[iOS / H4]` → Outstanding/NRD - Action Bold | 58 |
| `{theme:bg/level -1}` → Background/Secondary (frame) | 30 |
| `#262626` → Text/Primary (text) | 26 |
| `[ Night / White]` → Icon/Constant White (shape) | 20 |
| `[Title/title2 — pig]` → Outstanding/Title-title2 (NRD) | 17 |
| `[Body/body — horse]` → Bodies/Body 2 | 14 |

Illustrations: счётчик порции 6 не засчитан (сбой агрегатора агента, замены применились). Пропусков стало меньше
ровно на 354, так что потери в счёте, вероятно, нет; DRY-прогоном не проверялось.

Осталось без правила: `[ Night / White]` [shape] не на иконке 55 (Illustrations), `Action/actionAccent — miniPig` 16
(Errors), `#979797` [shape] не на иконке 15 (Backlog UI), `[Text [day]/Warning]` [frame] 6, `{theme:bg/accentSecondary}`
[frame] 6, `[Captions/Caption 3]` 4, `[Gradients/Top]` [shape] 4 (Service coverage). `#979797` в иконке не встретился.
