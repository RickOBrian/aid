# New Rider Drafts — анкета по итогам повторного прогона (2026-11-03)

Источник — `drafts-run/rerun/SUMMARY.md` и отчёты страниц. Значения читались без правок: Drafts
`eSitSKeHzy5fOUF1n3zg2B`, библиотека — файл токенов Rider `yrfG6u9osujKX8e1B14lpT`. Кол-во — нижняя
граница (в отчётах страниц только топ-30 причин). ★ — предложение; до «да» arturuxui ничего не ставится.

## Уже решено раньше — не спрашиваю

| Кандидат | ≈ кол-во | Решение | Где |
|---|---:|---|---|
| эффекты `shadow/diffuse/m`, `/s` | 1 400 | оставить | questions п.27 б) |
| SF Pro Text Semibold 12/13 | 810 | пробел (13 → 16 ломает 2 строки) | sverka п.6 |
| `{Color:tx-brand/green/green}` | 490 | бренд-зелёный не трогаем | final §9 |
| `[Background [day]/Secondary]` на не-фрейме | 730 | пробел: Icon-аналога #f5f5f5 нет | final §8.2 |
| `[Icons day/Secondary Pressed]` на обводке | 330 | библиотека не даёт STROKE-скоуп | final §1 п.15а |
| `{System:Magin Top}` = 54 | 257 | нет `space-54` | final §4 |
| WB Sans 24/100 и др. | 234 | стили WB — отдельным предложением | sverka «WB Sans» |
| ALS Hauss (lion, miniPig, …, 19/22) | — | оставить: вставки маркетплейса | sverka п.5 |
| цвета Mastercard, градиенты, blur, сырые тени | — | вне переноса | final §7 |

## Новые вопросы

| # | Что в макете | Значение | Где / образец | Кол-во | ★ Предложение |
|---|---|---|---|---:|---|
| 1 | `{theme:bg/level -1}` (коллекция `theme`, строчная) [frame] | #f6f6f9 / #000000 | Service coverage, Chip 5 `5374:89097` | 30 | ★ как `Theme:bg/level -1` (questions п.12 а): frame → `Background/Secondary`. Значения те же, отличается только имя коллекции |
| 2 | стиль ` Night / White` [text] | #fafbff, без ночного значения | Illustrations `5374:722561` | 102 | ★ `Text/Constant White` (#fff / #f8faff): белый остаётся белым в обоих режимах. б) `Text/Primary Inverted` — ночью станет тёмным |
| 2а | ` Night / White` [shape] | #fafbff | Illustrations, Capacity `5374:721469` | 97 | ★ `Icon/Constant White` — только если узел в иконке (как правило #232326); иначе оставить |
| 3 | стиль `Gray / 40%` [text] | #9a99a2 | Illustrations «04» `5374:722164` (9 px, opacity узла 0.3) | 96 | ★ `Text/Tertiary` (#0f0f1f@0.38 ≈ #a4a4ab на белом; Secondary ≈ #7d7d84 — дальше). Opacity узла не трогаем |
| 4 | стиль `Night / Gray 20` [shape] | #323233 | Backlog UI, вектор `5371:80597` | 10 | ★ оставить: ночная палитра без пары, мало |
| 5 | текст. стиль `iOS / H4` | SF Pro Display Bold 18/20, ls 0 | Illustrations `5374:721438` | 79 | ★ `Outstanding/NRD - Action Bold` — полное совпадение |
| 6 | текст. стиль `iOS / H2` | SF Pro Display Bold 24/26, ls 0 | Illustrations `5374:722503` | 59 | ★ `Titles/Title 3` (Bold 24/28, ls 0.33) — незначительное отличие: интерлиньяж +2, трекинг +0.33. б) оставить |
| 7 | текст. стиль `Title/title2 — pig` | ALS Hauss VF Bold 19/23 (размеры на переменных) | Errors, Blocked User `I5374:358835;97:15291` | 13 | ★ `Outstanding/Title-title2 (NRD)` (SF Pro Display Bold 19/23) — в библиотеке это явный двойник «title2»; меняется только семейство. б) оставить, как прочие ALS Hauss |
| 8 | текст. стиль `Body/body — horse` | ALS Hauss VF Regular 15/20 | там же `I5374:358835;97:15292` | 11 | ★ вместе с п.7: `Bodies/Body 2` (SF Pro Text Regular 15/20, ls −0.26). При б) в п.7 — тоже оставить |
| 9 | сырой #262626 [text] | — | Backlog UI, «Тарифы → Эконом» `5371:80639` (стиль Body 3) | 71 | ★ `Text/Primary` (как #242429) |
| 10 | сырой #979797 [shape] / [stroke] | — | Backlog UI: Path и Rectangle внутри BooleanOp `Combined Shape` в `Icons / 24 / System / Back` (`5371:80610`, `5371:80611`) | 168 / 32 | ★ детей BooleanOp не трогаем (их заливка не рисуется — видна только заливка самого boolean). Если #979797 на самом boolean/векторе иконки вне boolean → `Icon/Tertiary` (≈ #a4a4ab; Secondary ≈ #7d7d84 дальше) |

## Что пойдёт в скрипт по «да»

- `setAll`: добавить `theme:bg/level -1` к правилу `Theme:bg/level -1` (frame → Background/Secondary);
- `C` (стили заливки): ` Night / White` [text] → Text/Constant White, [shape в иконке] → Icon/Constant White;
  `Gray / 40%` [text] → Text/Tertiary;
- `TS_MAP`: iOS / H4 → Outstanding/NRD - Action Bold; iOS / H2 → Titles/Title 3;
  Title/title2 — pig → Outstanding/Title-title2 (NRD); Body/body — horse → Bodies/Body 2;
- `RAW`: #262626 [text] → Text/Primary; #979797 [shape] в иконке, не ребёнок BooleanOp → Icon/Tertiary;
- затем короткий повторный прогон только страниц, где это встречается: Illustrations, Service coverage,
  Errors, Backlog UI (и проверка остальных — без новых замен, прогон идемпотентен).
