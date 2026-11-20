# Анкета: шрифты «по участкам» (New Rider Drafts, 17 копий)

Собрано 2026-11-12 чтением всех 17 копий «— Switched Styles» (скрытое и «❌ » пропущено).
Текст «по участкам» — в одном текстовом слое участки с разными стилями или шрифтами. Скрипт такие слои пропускает целиком.

Варианты ответа:
- **а)** весь слой → один стиль;
- **б)** по участкам, каждому участку свой стиль (`setRangeTextStyleIdAsync`);
- **в)** оставить как есть.

Ответ одной строкой, например: `1а 2а 3б 4а 5в`.

## Нужен ответ

| № | Что в слое (участки) | Слоёв | Где | Пример (id · текст участков) | Предложение |
|---|---|---:|---|---|---|
| 1 | [Subtitles/Subtitle 2] + сырой SF Pro Text Semibold 15/110 % | 12 | Where 6, Where - Migration 6 | `I5374:428943;40001108:25773;5374:448753;427:15090;353:11019` · «Парк культуры и отдыха \| Ташкент Сити» | **а)** весь → Subtitle 2. Строка второго участка 16,5 → 20 |
| 2 | [Title/title2 — pig] + сырой ALS Hauss VF Bold 19/23 | 10 | Where 5, Where - Migration 5 | `I5374:425086;2083:2797;2097:3659` · «Выключен \| GPS» | **а)** весь → Outstanding/Title-title2 (NRD), как п.32а |
| 3 | сырой Google Sans Medium 17/20 + [Action/actionAccent] | 4 | Where 2, Where - Migration 2 | `5374:425254` · «~ \| 4 мин» | **а)** весь → Outstanding/NRD - Body (actionAccent → NRD - Body уже в правилах) |
| 4 | [iOS / Caption] + [Subtitles/Subtitle 3] | 7 | Navigation 5, test 2 | `5374:225256` · «Комфорт+ \| Нет машин» | **б)** по участкам: «Комфорт+» → Bodies/Body 3 (п.30а), «Нет машин» остаётся Subtitle 3 |
| 5 | [Subtitles/Subtitle 1] + сырой SF Pro Text Semibold 17/24 | 3 | Navigation | `5374:221114` · «950₽ \| 1180₽» | ? вторая цена: **а)** тоже Subtitle 1; **б)** другой стиль — назовите какой; **в)** оставить. Похоже на старую цену, проверьте зачёркивание |
| 6 | [Titles/Title 4] + сырой SF Pro Display Semibold 22/28 | 2 | Order Flow | `5374:919329` · «Фиксированная высота — \| …» | **а)** весь → Title 4 (22/28) |
| 7 | [Subtitles/Subtitle 2] + сырой SF Pro Text Semibold 15/20 | 1 | Show my location | `I5374:816698;1093:24504;1093:24530` · «БЦ \| Серебрянный город» | **а)** весь → Subtitle 2 |

## Предлагаю не трогать (в)

| Что в слое (участки) | Слоёв | Почему |
|---|---:|---|
| Factor A TRIAL / ALS Hauss VF: два начертания (Black + Medium, Bold + Regular и т. п.) | 156 (Navigation 155, Show my location 1) | Вставки маркетплейса. Правило «ALS Hauss, Factor A не трогаем» (final.md, строка 289) |
| [Description/descriptionAccent — lion] + [Description/description — puma] | 2 | То же: ALS Hauss |
| сырой Inter Bold 32 + Inter Regular 32 | 1 | Служебная подпись «Первый вход…» на доске, не макет |
| Пары библиотечных стилей: [Bodies/Body 3] + [Subtitles/Subtitle 3] (6), [Titles/Title 3] + [Subtitles/Subtitle 1] (1), [Titles/Title 1] + [Bodies/Body 1] (1) | 8 | Оба участка уже на стилях новой библиотеки, менять нечего |

## Отдельная находка: не «участки», а ошибка скрипта

На Navigation около 1 000 текстов помечены Figma как «смешанный шрифт» (`fontName = mixed`), но участок у них один. Самые частые: сырой SF Pro Text Regular 23 на клавиатуре — 589; `[iOS / Body]` — 26; SF Pro Text Semibold 17/20 — 66; SF Pro Text Medium 14/16 — 55.

Скрипт сейчас пропускает их как смешанные. Можно научить его брать стиль единственного участка, и тогда обычные правила возьмут эти тексты (клавиатуру оставим исключённой). Это правка `migrate-styles.js`, анкета для неё не нужна, нужно только ваше «да».

## Ответ arturuxui (2026-11-12)

`1а, 2а, 3а, 4б, 5 ставь Subtitle 1, 6а, 7а, и да на правку скрипта`

- 1 → весь слой Subtitles/Subtitle 2; 2 → Outstanding/Title-title2 (NRD); 3 → Outstanding/NRD - Body;
- 4 → по участкам: [iOS / Caption] → Bodies/Body 3, Subtitle 3 остаётся;
- 5 → весь слой Subtitles/Subtitle 1; 6 → Titles/Title 4; 7 → Subtitles/Subtitle 2;
- «да» на правку `migrate-styles.js`: текст с `fontName = mixed`, но одним сегментом — брать стиль единственного сегмента (клавиатура остаётся исключённой).

Это «да» на внесение правил и прогон на 17 копиях Drafts по RUNBOOK (DRY, затем боевой с большим TOP).

## Отменено решением дизайнера (2026-11-13)

arturuxui 13.11: «Делаем всё как сказала Валентина, даже если это идёт вразрез с моими предыдущими решениями». Разбор комментариев — `drafts-run/designer-review-2026-11-12.md`.

- п.1–5 и 7 — секции Where, Where - Migration, Navigation, test, Show my location пропущены дизайнером: правила не вносятся, прогона нет.
- п.6 (Order Flow, `5374:919329`) — дизайнер: «не трогать». Title 4 не ставится.
- Правка `migrate-styles.js` (один участок при `fontName = mixed`) — нужна была в основном для Navigation, отменена. Скрипт не менялся.
