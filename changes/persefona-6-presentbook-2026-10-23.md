# presentbook-6 (AID-52, #379) — Presentbook на Persefona Kit: было → станет

От: Designer · Persefona · AID-52, 2026-10-23. Кому: Standards · Persefona (приёмка).
Куратор — PD. Код по этой спеке пишет Developer · Persefona · AID-52 после приёмки.

Статус: **принята с правками** ([комментарий приёмки](https://github.com/RickOBrian/aid/pull/383#issuecomment-6371434223)),
правки внесены, ждёт «соответствует». В коде и в Figma ничего не менялось. Здесь описано,
какой стиль Presentbook (`pages/aid-portal/`) какой токен или блок Kit заменяет. Чего в Kit
нет, собрано в анкету §7. Новых токенов и компонентов я не заводил: заявка на них идёт к
Designer · Persefona после ответов.

## 0. Основа и границы

**Источники Kit.** Имена токенов взяты из черновика
`changes/persefona-1-tokens-draft-2026-10-23.md` (#354). Значения и шкала — из
арт-директорского прохода `changes/persefona-1-art-direction-2026-10-23.md` (#358, решение
PD 2026-10-23). Правила вида — `products/persefona/rules/persefona-visual-language.md`
(#361, версия 1.1.0, c9a97fd, ещё не смержен). Блоки — `changes/persefona/pending/component-persefona-1-*.json`,
их спека — `docs/persefona/components-spec.md` (#381). Шаблон гайда — #378: он принят с
правками, итог в [комментарии приёмки](https://github.com/RickOBrian/aid/pull/378#issuecomment-6371226734).
После приёмки IslandNote называется **Banner**, BadgeMarker — **TagMarker**, а у TableCell
появился Variant=Badge.

**Состояния.** Hover, pressed, selected, disabled и focused рисуются только токенами
`bg-accent-states-hover` / `-pressed` / `-active` / `-disable` / `-focused` поверх фона блока
(`component-states-guide` §2, #361 §6.3), а не цветами поверхности. В Kit этих токенов нет:
их заводит пачка №0 (§8) до любого интерактивного блока. Переход — 150 мс `ease` (#361 §6.4).

**Инвентарь.** Это источник колонки «было»: стили по экранам, со ссылками `file:line`.
Он собран 2026-10-23 и хранится вне репозитория, в заметках задачи. Частоты значений
есть в аудите `changes/persefona-1-audit-2026-10-23.md` §2.

**Снимки «было».** Лежат в `changes/persefona/snapshots/presentbook/0-before-*.png`: 13
экранов, 1440 px, локальный `npm run dev`, данные из `main` на 2026-10-23.

**Стык с Designer · Persefona** (ответ 2026-10-23). У гайда на портале нет своего вида.
Он собирается по шаблону #378: шапка, разделы, таблицы, выноски и бейджи те же, что в
Figma. Маркер анатомии на странице компонента — TagMarker на iolite. Набросков
интерактивных блоков (кнопка, сегмент, табы, меню, тост и т. п.) в Kit нет. Анкета по
ним — здесь, в §7.2, сборка — у Designer · Persefona.

**Что не меняется:**

- превью и данные Driver и Rider: образцы токенов, живые компоненты, их `--ds-switch-*`,
  `--ds-badge-*`. Это контент, а не хром;
- состав и порядок блоков страницы компонента (`component-page-baseline`): меняется
  только оформление;
- цвет продукта в хроме разделов Driver и Rider (`--ds-accent*`). PD п. 9 #354: «хром
  портала не меняется». В Kit он становится подгруппой `product` (§1.1, §7.1, п. 1а);
- маршруты, тексты, поведение.

## 1. Основы: стиль портала → токен Kit

Правило для всех экранов. Значения Kit не повторяю: они в переменных Figma
(`YDjPxFrW1yXqm9RzBGQXuc`), в коде — `--pf-<имя>`.

### 1.1 Цвет

| Роль | Было в портале | Станет |
|---|---|---|
| Основной текст | `#2D2C2E`, `rgba(0,0,0,.87)`, `.7` в тексте | `text-primary` |
| Вторичный текст, подписи, мета | `rgba(0,0,0,.54)`, `.45` | `text-secondary` |
| Заголовок группы, счётчик, подпись к альфе, «пусто» | `.38`, `.32` | `text-secondary`: это смысловой текст, а `text-muted` для него не годится (#354 §5, п. 6а) |
| Плейсхолдер, разделитель «·» | `.38` | `text-muted` |
| Отключённое | `.26`, `opacity .4 / .52 / .38` | `text-disabled`, `icon-disabled`, без прозрачности (§7.1, п. 7а; #361 §6.3) |
| Поверхность | `#FFFFFF` | `bg-surface-main` |
| Шапка таблицы, превью хаба | `#F5F5F5` | `bg-surface-muted` |
| Hover и pressed кнопки, строки, пункта меню, карточки | `#F5F5F5`, `rgba(245,245,245,.72/.48)`, `#F0F4FF` | `bg-accent-states-hover` / `bg-accent-states-pressed` поверх фона блока (пачка №0) |
| Выбранный пункт (сегмент, таб, чип) вне разделов продукта | `--ds-accent-bg` + `--ds-accent` | `bg-accent-main` + `text-inverse`; у таба — `text-accent` и линия `bg-accent-main` |
| Зебра, блок кода, панель песочницы, колонка канбана | `#FAFAFA` | `bg-surface-zebra` |
| Рамка, разделитель | `#EBEDF0`, `#F0F0F0` | `line-default` |
| Рамка при наведении | `#D0D4DC`, `#D7DADE`, а в задачах и управлении — `var(--ds-accent)` | `line-hover` |
| Тост, блок «Night», заливка кнопки входа и галочки | `#2D2C2E`; hover `#1A1A1B` | `bg-inverse-main` + `text-inverse`; hover — `bg-accent-states-hover` поверх (§7.1, п. 8в) |
| Рамка блока «Night» в анатомии | `#3A393B` | без рамки: `bg-inverse-main` отделяется от фона сам |
| Ошибка входа | `#C62828` | `text-error` |
| Иконки 16 px (назад, шеврон, скачать, меню) | `currentColor` от `.54` / `.87` | `icon-secondary`; при наведении — `icon-primary` |
| Ссылка вне разделов продукта | `var(--ds-accent)` (по умолчанию синий Driver) без подчёркивания | `text-accent` с подчёркиванием (#354 §6, п. 1) |
| Рамка образца цвета | `rgba(0,0,0,.12)` | `line-default` |
| Цвет продукта в хроме Driver и Rider: сегмент, таб, ссылка, кнопка «Скачать» | `--ds-accent`, `--ds-accent-bg` | `text-accent-product-driver` / `-rider`, `bg-accent-product-driver-fade` / `-rider-fade`; режимов нет, портал подставляет пару раздела в `--ds-accent*`. Core — новые ступени с нейтральными именами, источник — `PRODUCT_ACCENT` в `dsProductAccent.ts` (§7.1, п. 1а) |
| Затемнение под модалкой и меню продукта | `rgba(0,0,0,.38)`, `color-mix(#2D2C2E 40%)`, белое `.12` с размытием | `bg-overlay` → Core `graphite-100-a40`, без размытия (§7.1, п. 7а) |

### 1.2 Статусы и метки → `Badge` (Tone)

Мягкие бейджи — без рамки (#361 §4.2). Текст — `label-s`, форма — `radius-pill`.

| Где | Было | Станет |
|---|---|---|
| «Ждёт», публикация гайда, «не опубликовано» | `#FFF8E6` / `#F0D48A` / `#8A6A00` | `Badge` Warning |
| «Выпущено», «скопировано», «supported» | `#EEF8F1` / `#B9E6C9` / `#1F7A3F` | `Badge` Success |
| «Нет данных», версия, статус гайда «Альфа», тег задачи | `#F5F5F5` + рамка `#EBEDF0` | `Badge` Neutral |
| Вид значения: semantic / platform / raw / hardcode | 4 пары Material, 10 px · 600 · капс | `Badge` Success / Info / Warning / Error (§7.1, п. 4) |
| Точка вида изменения в changelog | `#23AD58` · `#005AFF` · `#F0A11D` · `#9E9E9E` · `#D62347` | цвет `text-success` · `text-info` · `text-warning` · `text-neutral` · `text-error` (#354 §3.1; §7.1, п. 5) |
| «Пример» в задачах и ТТМ (пунктирная рамка) | рамка `dashed .54` | `Badge` Neutral |
| Главный тег задачи, «AI» в команде | `--ds-accent-bg` / `--ds-accent` | `Badge` Vivid Soft (§7.1, п. 2а) |
| Импакт в release status | `rgba(0,0,0,.06)` | `Badge` Neutral |
| Плашка «ждёт согласования» в гайде, баннер «нет реализации» в коде | фон `#FFFDF5`, рамка `#F0D48A`, текст `#8A6A00` | `Banner` Warning (#378, бывший IslandNote) |

### 1.3 Типографика

Гарнитура — Google Sans, код — Google Sans Code (#354 §6, п. 2а). Веса только 400 и 500
(#361 §5.1): весь портальный 600 становится 500. Порталу больше не нужно грузить 600 и
700, а Roboto в интерфейсе не используется (проверит Developer). Три системных моно-стека
сводятся к одному `type-family-mono-1`.

| Было | Где | Станет |
|---|---|---|
| 48/56 · −0.02em | заголовок хаба, пункты меню продукта | `display-l` |
| 28/36, 32/40, 36/44 | h1 в шапке страницы, управление, ТТМ | `heading-l` 32/40 (§7.1, п. 3) |
| 18/24, 20/28, 22/28 · 600 | h2 разделов, changelog, release, диалог задачи, ТТМ, Team | `heading-m` 20/28 |
| 16/24 · 600, 15/20, 18/24 в карточках хабов | h3 гайда, карточка, имя в Team, деталь анатомии, модалка JSON | `heading-s` 16/24 |
| 14/20, 14/22, 16/26 (лид плагина) | основной текст | `body-m` 14/22 |
| 13/16, 13/18, 13/20 | таблицы, мета, списки изменений | `body-s` 13/20 |
| 14 · 500, 13/16 · 500 | кнопки, табы, сегменты, поля, имя токена в таблице, заголовок карточки задачи | `label-m` 14/20 · 500 — новый стиль (§7.1, п. 6а) |
| 12/16 · 500, 11/16 · 500 | бейджи, мелкие кнопки, hex в value-meta | `label-s` 12/16 · 500 |
| 12/18, 11/14, 10/12 · 400 | подписи, автор, альфа, даты в мобильной карточке | `body-xs` 12/16 · 400 — новый стиль (§7.1, п. 6а) |
| капс: 11/16 · 500 · .06em, .08em; 12/500/.04em; 13/600/.04em; 11/600/.04em; 10/600/.03em | шапки таблиц, группы хаба, подписи полей, h2 «CODE» и «API» | `label-xs-caps` 11/16 · 500 · 0.6, `text-secondary` |
| mono 12/20, 12.5/20, 13/18 | блоки кода, API, JSON | `code-m` 13/20 · 400 |
| mono 11, 12, 12.5, 13/16 · 500 | инлайн-код, версии, значения мета, путь | `code-s` 12/16 · 400 |
| mono 15/600 | имя компонента в мета-шапке | `heading-s` + псевдоним `code-s` |
| JSON в модалке: Google Sans 12/18 | тело модалки | `code-m`: JSON — это код |

### 1.4 Радиус, отступы, тень, фокус

| Было | Станет |
|---|---|
| 8 — таблицы, карточки хабов, кнопки, поля, меню, канбан | `radius-m` |
| 12 — мета-карточки, блоки тем, панели release, модалка JSON, песочница | `radius-l` |
| 16 — карточка входа, меню продукта | `radius-xl` |
| 999 — бейджи, чипы | `radius-pill` |
| 4, 6, 3, 2 — теги, пункт меню, кнопка копирования, зум, сегменты ТТМ | `radius-s`; 6 и 3 уходят (PD 2а) |
| 10 — поле и кнопка входа | `radius-m` |
| Отступы 2–64 по шагу 4, а также 6 и 10 | `spacing-<n>`, как есть |
| Отступы вне шкалы: 14 (ячейки мобильных карточек, код), 18 (код, цитата), 36, 56, 72 | 14 → `spacing-16`, 18 → `spacing-16`, 56 → `spacing-48`, 72 → `spacing-64`. 36 — это высота контрола, а не отступ: правило платформы в спеке компонента (§7.1, п. 9а) |
| Тени: меню и тост `0 8 24 .12/.16`, выпадающий список `color-mix 16%` | `shadow-1` |
| Тени: меню продукта `0 12 40 .14`, вход `.08`, модалка JSON `0 16 48 .16` | `shadow-2` |
| Свечение анатомии `0 0 0 4px rgba(accent,.18)`, `0 2px 8px / 0 4px 14px` | `shadow-1` без свечения |
| Три вида фокуса: `2px rgba(45,44,46,.32)`, `2px var(--ds-accent)` с отступом 2 или −2, `box-shadow 0 0 0 2px .24` | один вид: кольцо 2 px `line-focus` с зазором 2 px; на `bg-inverse-main` — `line-focus-inverse` (#361 §6.2). Фокус никогда не берёт цвет продукта (§7.1, п. 1а) |
| Затемнение под модалкой: `rgba(0,0,0,.38)`, `color-mix(#2D2C2E 40%)` | `bg-overlay` (§1.1) |
| Переходы: `.15s ease`, `.12s`, `.18s` | одно правило: 150 мс `ease`, без токенов (#361 §6.4) |
| Точки перелома 1100, 1024, 900, 768, 767, 720, 640, 600, 480 | 480 · 768 · 1024 · 1280, мобильная раскладка — меньше 768 (#361 §6.5). Developer снимает «было \| стало» на каждой точке |

## 2. Общие элементы всех экранов

| Элемент | Было | Станет |
|---|---|---|
| Поле страницы | `40 48 64` и `48 48 64` в хабах; на мобиле `20 16 40` и `24 16 48` | одно поле: `spacing-40` / `spacing-48` / `spacing-64`, на мобиле `spacing-20` / `spacing-16` / `spacing-40` |
| Шапка страницы `DsPageHeader` | назад 36×36, h1 28/36, переключатель, поиск, линия снизу, после неё отступ 32 | назад — `ButtonIcon` (§7.2), h1 — `heading-l`, линия — `line-default`, поиск — `FieldSearch` (§7.2) |
| Переключатель продукта и меню | пункты 48/56 `.38 → .87`, `shadow` `0 12 40`, затемнение — белое `.12` с размытием | пункты `display-l`: обычный — `text-secondary`, текущий и наведённый — `text-primary`; меню — `bg-surface-main`, `radius-xl`, `shadow-2`; затемнение — `bg-overlay` без размытия |
| Заголовок раздела h2 | 18/24 · 500, отступ снизу 16 | `heading-m`, `spacing-16` |
| Таблица (токены, гайд, changelog) | рамка `#EBEDF0`, `r8`; шапка `#F5F5F5` 11 px капс `.54`; ячейка `10 16`; разделитель сверху у строки | рамка как у `TableComparison`: `line-default`, `radius-m`. Шапка — `TableCell` Header (`bg-surface-muted`, `label-xs-caps`, `text-primary`), ячейка — `TableCell` Default (`spacing-16` / `spacing-12`, линия снизу), зебра — `bg-surface-zebra` |
| Строка токена в таблицах Colors, Spacing, Radius | имя 14/20 · 500, значение 11/14 · 500, альфа 10/12 | имя — `label-m`, hex — `code-s` `text-primary`, альфа — `body-xs` `text-secondary`. Порядок колонок не меняется: колонки портала (Day, Night, описание) — не те же, что у `TokenRow`, поэтому строка остаётся строкой таблицы, а не экземпляром `TokenRow` |
| Changelog `ChangelogTable` | заголовок 18/24, версия mono 13 · 500, изменения 13 и 14 px вперемешку, точка 8 px | заголовок — `HeaderSection`-уровень `heading-m`; таблица — как `TableChangelog` (колонки и шаги совпадают); версия — `code-s`; текст изменения — `body-s`; точка — §1.2 |
| Мета-список (гайд, мета компонента, release) | сетка 150/160 + 1fr, 13/20, рамка, `r12`, поля 16/20 | **нет блока** → `ListMeta` (§7.2, имя черновое). Ключ — `body-s` `text-secondary`, значение — `body-s` или `code-s` `text-primary`, рамка `line-default`, `radius-l`, поля `spacing-16` / `spacing-20` |
| Блок кода (API, сниппет, `pre` в гайде, установка плагина) | `#FAFAFA`, рамка, `r8`/`r12`, поля 14/18, mono 12/20 | **нет блока** → `BlockCode` (§7.2, имя черновое): `bg-surface-zebra`, `line-default`, `radius-m`, `spacing-16`, `code-m` |
| Инлайн-код | mono 12.5, `#F5F5F5`, поля 2/5, `r4` | `code-s`, `bg-surface-muted`, `spacing-2` / `spacing-4`, `radius-s` |
| Кнопка копирования | 11/16 `.54`, рамка, `r6`; после копирования — зелёная плашка | **нет блока** → `ButtonCopy` (§7.2); состояние «скопировано» — `Badge` Success вместо перекраски кнопки |
| Тост | `#2D2C2E`, 13/16, `r8`, тень `.16`; три разных отступа снизу | **нет блока** → `Toast` (§7.2): `bg-inverse-main`, `text-inverse`, `body-s`, `radius-m`, `shadow-1`, отступ снизу `spacing-24` везде |
| Кнопки JSON, «Скачать», «Ещё», выбор формата | две одинаковые копии CSS: 13/16 · 500, рамка, `r8`, поля 8/12 | **нет блока** → `ButtonText` Secondary и `ButtonGroup` (§7.2) |
| Выпадающее меню (скачать, контекстное, выбор в задачах) | `#FFF`, рамка, `r8`, `shadow .12`, пункт 13/16 `r6` | **нет блока** → `Menu` + `MenuRow` (§7.2): `bg-surface-main`, `line-default`, `radius-m`, `shadow-1`, пункт — `body-s`, `radius-s`, hover — `bg-accent-states-hover` |
| Сегмент (платформа, режим, фильтр ТТМ, песочница) | рамка, `r8`, кнопка 13 px `.7`; нажатая — `--ds-accent-bg` + `--ds-accent` | **нет блока** → `SegmentedControl` (§7.2, имя черновое); выбранный — в разделе продукта `bg-accent-product-<продукт>-fade` + `text-accent-product-<продукт>`, вне его — `bg-accent-main` + `text-inverse` (§1.1) |
| Табы страницы компонента | 14 · 500 `.54`; выбранный — цвет и линия `--ds-accent` | **нет блока** → `Tabs` (§7.2, имя черновое); выбранный — `text-accent-product-<продукт>` и линия того же цвета в разделе продукта, вне его — §1.1 |
| Карточка-ссылка (хабы, управление, задача, команда) | `ds-interactive-card` `r8`, hover рамки `#D0D4DC` или акцент, hover фона `.48`/`.72` | **нет блока** → `IslandLink` (§7.2): `bg-surface-main`, `line-default` → `line-hover`, hover фона — `bg-accent-states-hover`, `radius-m`, фокус по §1.4 |
| Модалка JSON и диалог задачи | `r12` и `r8`, тень `0 16 48`; на мобиле — лист снизу | **нет блока** → `Dialog` (§7.2): `radius-xl`, `shadow-2`, затемнение `bg-overlay` |
| Чекбокс выбора иконок | круг 20, рамка `.26`, отмеченный — `#2D2C2E` | **нет блока** → `Checkbox` Shape=Round (§7.2): `line-hover` → `bg-accent-main` + `icon-inverse` |

## 3. Экраны

Снимок «было» — в начале строки. Снимков «станет» здесь нет: Kit для интерактива ещё не
собран (§7.2). Developer · Persefona снимает «было | стало» по каждому экрану в PR кода,
по `WORKING-RULES` §7.

### 3.1 Хаб продукта — `0-before-01-hub-driver.png`

| Элемент | Было | Станет |
|---|---|---|
| Заголовок «aid: driver» | 48/56, `.87` | `display-l`, `text-primary` |
| Подпись группы TOKENS / COMPONENTS | 11/16 · .08em, `.38` | `label-xs-caps`, `text-secondary` |
| Пункт: иконка-символ, название 18/24, описание 14/20 `.54` | hover фона `.72`, `r12`, поля 4/0 | `IslandLink` в плоском виде (без рамки): название — `heading-s`, описание — `body-m` `text-secondary`, hover — `bg-accent-states-hover`, `radius-m`. Символы Unicode ◐ Aa ↔ остаются до набора иконок разделов (§7.1, п. 12а) |
| Бейдж «Нет данных» | серый с рамкой | `Badge` Neutral |
| «Скоро» | `opacity .52` | `text-disabled` |

### 3.2 Хабы Tools, Guides, Components — `0-before-13-guides-hub.png`

| Элемент | Было | Станет |
|---|---|---|
| Подпись группы | 11/16 · .06em, `.32` у Guides и Components, `.38` у Tools | `label-xs-caps` `text-secondary` у всех трёх |
| Карточка | превью `#F5F5F5` 128 px, тело 16, заголовок 18/24, описание 14/20 | `IslandLink`: превью — `bg-surface-muted`, тело — `spacing-16`, заголовок — `heading-s`, описание — `body-m` `text-secondary` |
| Версия гайда | серый бейдж, mono 11 | `Badge` Neutral; текст — `label-s` (моно в бейдже не нужен) |
| Группа «ждут согласования» | пунктир `#F0D48A`, фон `#FFFDF5`, заголовок `#8A6A00` | группа как остальные; над ней — `Badge` Warning «Ждёт согласования» без пунктирной рамки |
| Автор | 13/18 `.54` | `body-s` `text-secondary` |

### 3.3 Страницы токенов — `0-before-03-colors.png`, `-04-typography.png`, `-06-radius.png`, `-08-icons.png`

| Элемент | Было | Станет |
|---|---|---|
| Таблицы | §2 «Таблица» | §2 |
| Образец цвета | 32 и 28, `r4`, рамка `.12`, шашечка `#EEE` | `radius-s`, рамка `line-default`; шашечка — `bg-surface-muted` |
| Группа в Typography и Shadows | `#F5F5F5`, 13/16 · 500 | `bg-surface-muted`, `label-m` |
| Строка стиля: подпись и подпись под образцом | 11/14 `.54` / `.38` | `label-xs-caps` `text-secondary` / `body-xs` `text-secondary` |
| Образец тени | 200×80, `r16`, белый | `radius-xl`, `bg-surface-main`; сама тень — данные продукта |
| Сцена Glass | декоративный градиент с цветами Driver и Rider | не меняется: это фон образца продукта, а не хром |
| Визуал Spacing | полоса `#2C64E3`, заливка `rgba(141,185,253,.24)` | как `TokenRow` Swatch=Bar: полоса `bg-accent-vivid-main` (#381 §9; §7.1, п. 2) |
| Визуал Radius | `--ds-accent-bg` + рамка 4 px `--ds-accent` | как `TokenRow` Swatch=Corner: `bg-surface-muted`, обводка `line-hover` |
| Icons: панель выбора | `#FAFAFA`, рамка, `r8` | `bg-surface-zebra`, `line-default`, `radius-m`; счётчик — `body-s` `text-secondary` |
| Icons: сетка, ячейка | превью 48, подписи 11/14 и 13/16 | подпись — `code-s` (имя иконки) и `body-xs` (размер) |
| Пустой поиск | 14/20 `.54` | `body-m` `text-secondary` |

### 3.4 Страница компонента — `0-before-11-component-switch.png`

| Элемент | Было | Станет |
|---|---|---|
| Мета-шапка | карточка `r12`, строка заголовка `#FAFAFA`, имя mono 15/600 | `ListMeta` (§2); имя — `heading-s`, псевдоним — `code-s` `text-secondary`; строка заголовка — `bg-surface-zebra` |
| Ссылка Figma | mono 12, `--ds-accent` | `code-s`, `text-accent-product-<продукт>` (§1.1) |
| Песочница | `#FAFAFA`, рамка, `r12`; подписи 11/600 `.45` | `bg-surface-zebra`, `line-default`, `radius-l`; подписи — `label-xs-caps` `text-secondary`; сегменты — `SegmentedControl` |
| Табы | §2 | `Tabs` |
| Блок «Day» / «Night» | рамка, `r12`, 24; Night — `#2D2C2E`, подпись `rgba(255,255,255,.7)` | Day — `line-default`, `radius-l`, `spacing-24`; Night — `bg-inverse-main`, подпись `text-inverse` |
| CODE / API | h2 13/600 капс `.45`; блок кода `r12` | h2 — `label-xs-caps`; блок — `BlockCode` |
| Карточки API | `r12`, h3 11/600 капс `.38`, флаг 10/600 | `radius-l`; h3 — `label-xs-caps` `text-secondary`; флаг — `Badge` Success / Neutral |
| Release status | §1.2, мета `r12`, панель `#FFFDF5` | бейджи — `Badge`; мета — `ListMeta`; панель «ждёт» — `Banner` Warning |
| Анатомия | маркер — круг с рамкой 2 px `--ds-accent`, линия `--ds-accent` 1.5 px · .55, ореол и свечение; номер в списке — круг `--ds-accent`; hover — `--ds-accent-bg` и `color-mix` | маркер и номер — `TagMarker`: круг `bg-accent-vivid-main`, цифра `text-inverse`, точка и линия — `icon-accent-vivid`. Выбранная зона: рамка `icon-accent-vivid`, `shadow-1` без свечения. Hover в списке — `bg-accent-states-hover`. Зум — `ButtonIcon`, hover — `bg-accent-states-hover` вместо `#F0F4FF` |
| Чип вида значения | 4 пары Material | §1.2 |
| Сцена анатомии | `#FAFAFA`, `r12`, поля 72/48 | `bg-surface-zebra`, `radius-l`, `spacing-64` / `spacing-48` |

### 3.5 Гайд — `0-before-14-guide.png`

По шаблону #378: тот же вид, что в Figma. Ширина колонки чтения 820 не меняется.

| Элемент | Было | Станет |
|---|---|---|
| Обложка | заголовок только в шапке 28/36, мета-карточка: версия, статус, сверено, источник | `HeaderPage`: бейджи (статус — `Badge` Neutral, версия — `Badge` Neutral, «ждёт согласования» — `Badge` Warning), заголовок `display-l`, описание `body-m` `text-secondary`, ниже — `ListMeta` (сверено, источник, скачать). Как быть с h1 в шапке страницы — в панели остаётся «Guides», название гайда только в обложке (§7.1, п. 3а) |
| h2 «1. Артефакты…» | 22/28 · 600, линия сверху, отступы 48/16/24 | `HeaderSection`: `heading-l` 32/40; линия сверху остаётся — `line-default`, `spacing-48` |
| h3, h4 | 16/24 · 600 | h3 — `heading-m` 20/28, h4 — `heading-s` |
| Текст, списки | 14/22 | `body-m` |
| Таблица | рамки у каждой ячейки | §2: рамка таблицы и линии строк, без вертикальных линий |
| Цитата | линия слева 3 px, зебра, `r 0 8 8 0` | `Banner` Info (§7.1, п. 13а) |
| `details` | рамка, зебра, `r8` | `line-default`, `bg-surface-zebra`, `radius-m`; заголовок — `label-m` |
| Подпись к схеме | 11 px · .06em капс | `label-xs-caps` `text-secondary` |
| Навигация по главам | рамка, `r12`, 14/20, hover — зебра | `IslandLink`, `radius-m` |
| Ссылки | `--ds-accent` без подчёркивания | §1.1 «Ссылка» |

### 3.6 Страница плагина — `0-before-16-token-comparator.png`

| Элемент | Было | Станет |
|---|---|---|
| Лид | 16/26 `.54` | `body-m` `text-secondary` |
| Раздел | 20/28 | `heading-m` |
| Кнопка «Скачать» | заливка `--ds-accent`, белый текст, hover `brightness(.95)` | `ButtonText` Primary (§7.2); цвет — §1.1: в разделе продукта пара `product`, вне его — `bg-accent-main` |
| Шаги установки, «недоступно» | зебра, `r8`, 14/22 | `bg-surface-zebra`, `radius-m`, `body-m` |
| Заметки к версии | h3 16/24, код mono 13 | `heading-s`, `code-s` |

### 3.7 Управление, задачи, команда, ТТМ — `0-before-18-tasks.png`, `-19-team.png`, `-20-ttm.png`

Эти страницы не относятся к продукту, но берут синий Driver как акцент по умолчанию.
Kit-акцент здесь — графит (§7.1, п. 1а).

| Элемент | Было | Станет |
|---|---|---|
| Надзаголовок «УПРАВЛЕНИЕ» | 11/16 капс `.54` | `label-xs-caps` `text-secondary` |
| h1 | 32/40 (ТТМ — 36/44) | `heading-l` |
| «Пример» | пунктирная рамка | `Badge` Neutral |
| Выбор продукта, «обновлено» | поле 36, рамка, `r8`; hover — акцент | `FieldSelect` (§7.2); hover — `line-hover` |
| Чипы исполнителей | `r999`, рамка; нажатый — акцент | `Chip` (§7.2): нажатый — `bg-accent-main` + `text-inverse`; hover — `bg-accent-states-hover` |
| Колонка канбана | зебра, рамка, `r8`, заголовок 14/20 | `bg-surface-zebra`, `line-default`, `radius-m`; заголовок — `label-m`, счётчик — `body-s` `text-secondary` |
| Карточка задачи | рамка, `r8`; hover — акцент; id 12/16, название 14/20 · 500, мета 12/16 | `IslandLink`; id — `code-s` `text-secondary`, название — `label-m`, мета — `body-xs`, теги — §1.2 |
| Диалог задачи | `r8`, h2 22/28 | `Dialog`, h2 — `heading-m` |
| Карточка человека | `r8`, имя 16/24, логин 12, бейдж AI — акцент | `radius-m`, `heading-s`, `code-s`, `Badge` Vivid Soft |
| ТТМ: KPI | 36/44 · 500, ведущая карточка — фон и цвет акцента | `heading-l` 32/40 (таблично); ведущая — графит: `bg-inverse-main` + `text-inverse` (§7.1, п. 2а) |
| ТТМ: график «до / после» | до `#FFAA00` (токен Driver Bg·Attention), после — `--ds-accent` | до — `text-warning`, после — `text-accent` (графит, не vivid) до отдельной задачи на цвета данных (§7.1, п. 14а) |
| ТТМ: сетка и подписи графика | `T.border`, 12 px | `line-default`, `body-xs` |
| ТТМ: сегмент, select, бейджи | как в задачах | `SegmentedControl`, `FieldSelect`, `Badge` |

### 3.8 Вход, «не найдено», «раздел недоступен» — `0-before-21-login.png`

| Элемент | Было | Станет |
|---|---|---|
| Карточка входа | `r16`, тень `0 12 40 .08`, 32 | `radius-xl`, `shadow-2`, `spacing-32` |
| Заголовок | 22/28 `.87` | `heading-m` `text-primary` |
| Подпись поля | 13/16 · 500 `.54` | `label-s` `text-secondary` |
| Поле | 14/20, рамка, `r10`, фокус — рамка `.32` | `FieldText` (§7.2): `body-m`, `line-default`, `radius-m`, фокус — кольцо `line-focus` |
| Кнопка «Войти» | `#2D2C2E`, hover `#1A1A1B`, `r10` | `ButtonText` Primary: `bg-accent-main` + `text-inverse`, `radius-m`; hover — `bg-accent-states-hover` поверх |
| Ошибка | 13/18 `#C62828` | `body-s` `text-error` |
| «Не найдено» | фон `#F5F5F5`, текст 18 px, inline-стили | `bg-surface-main`, текст `heading-m`, ссылка `text-accent` |
| «Раздел недоступен» | 14/20 `.54` | `body-m` `text-secondary` |

## 4. Порядок перевода (для Developer)

0. Пачка №0 (§8): токены `bg-accent-states-*` в Kit — до любого интерактивного блока.
1. Переменные `--pf-*` (Semantic и нужные Core) — одним файлом на портал; вместо
   `DS_PORTAL_LAYOUT_TOKENS` и литералов. Стек и раскладку объявляет Developer ·
   Persefona (`product.json` → `platformModel`).
2. Текстовые стили — CSS-классы или переменные по §1.3; подключить Google Sans Code;
   600 и 700 больше не грузить.
3. Общие элементы §2, у которых есть блок в Kit: таблица, `Badge`, changelog, мета.
4. Интерактивные блоки §7.2 — после их сборки в Kit и ответов анкеты.
5. По экранам §3: снимки «было | стало» в PR на каждой точке перелома (480 · 768 · 1024 ·
   1280), приёмка UI — Standards · Persefona.

Попутно в коде портала, без влияния на вид: `.dgp` занят и Glass, и Gradients; Switch,
BadgeCount и BadgeDot — почти копии CSS; кнопки JSON и «Скачать» продублированы. Перевод
на общие блоки снимает это сам.

## 5. Контраст (AA)

Пары, которые появляются в портале впервые:

| Пара | Контраст | |
|---|---|---|
| `text-secondary` на `bg-surface-muted` (шапки таблиц, группы) | 4.78 (#358 А) | ✓ |
| `text-secondary` на `bg-surface-zebra` (подписи песочницы, колонки канбана) | 4.99 | ✓ |
| `text-inverse` на `bg-inverse-main` (тост, Night, кнопка) | 13.9 | ✓ |
| `text-accent-vivid` на `bg-accent-vivid-fade` (бейдж Vivid Soft) | **не замерен** — Designer · Persefona снимет до сборки (ответ 2026-10-23) | условие для §1.2 |
| Кольцо `line-focus` 3:1 на `bg-surface-zebra` и `bg-surface-muted` | проверить при сборке `SegmentedControl` | |

Сейчас в портале есть пара ниже AA: текст Rider `#9747FF` на `#F5EDFF` — 3.96 (#354
§6, п. 9). Рекомендация — текст на ступень темнее, фон прежний; это меняет хром, вопрос PD задаёт
Standards · Persefona (ответ 1а).

## 6. Противоречия, найденные по ходу

1. **#361 §3.2 и решение PD.** В #361 сказано: «Хром портала остаётся без цвета продукта
   (PD, п. 9 #354)». А в #354 §6 п. 9 решено наоборот: «хром портала не меняется»,
   вариант (в) — убрать цвет продукта — не принят. Сейчас хром несёт цвет продукта.
   **Закрыто:** #361 1.1.0 (c9a97fd), §3.2 — хром в разделах Driver и Rider несёт цвет продукта.
2. **«Шапка страницы — всегда `display-l`»** (#361 §5.2, §8) написано для служебной
   страницы Figma. У портальной страницы шапка — это панель навигации: назад, переключатель,
   поиск. Если поставить туда 48/56 на каждой из 20 страниц, панель вырастет на 20 px, а
   содержимое уедет вниз. **Закрыто:** #361 §5.2 — в панели `heading-l`, ответ 3а.
3. **`docs-visual-language`** описывает другой портал (аудит #350 §3). Находка
   повторяется: перевод Presentbook на Kit делает его устаревшим окончательно.

## 7. Анкета — одним списком

Ответ вида «1а 2а 3а…». ★ — рекомендация.

**Ответ Standards · Persefona 2026-10-23:** 1а (с правкой имён) · 2а без KPI · 3а·а · 4а ·
5а · 6а · 7а · 8в · 9а · 10а · 11а · 12а · 13а · 14а (с правкой) · 15а и пачка №0 · 16а · 17а.
Что изменилось против рекомендации:

- **1а** — имена с продуктом внутри: `text-accent-product-driver`, `bg-accent-product-driver-fade`,
  то же для `-rider`; режимов нет. Rider 3.96 — вопрос PD задаёт Standards · Persefona;
- **2а** — без ведущего KPI ТТМ: он графит (`bg-inverse-main` + `text-inverse`). Область vivid
  записана в #361 §3.2;
- **8в** — hover на тёмном — `bg-accent-states-hover` поверх `bg-accent-main`, не «без смены»
  и не `bg-inverse-hover`;
- **13а** — описание `Banner` дополнить: «примечание в тексте гайда»;
- **14а** — «после» — `text-accent` (графит), не vivid: vivid для данных не используется;
- **15а** — перед первой волной пачка №0 (состояния).

Правила по ответам 3, 7, 10, 11 — в #361 1.1.0 (§5.2, §6.3, §6.4, §6.5).

### 7.1 Токены и правила

1. **Цвет продукта в хроме** (сегмент, табы, ссылки, фокус, кнопка «Скачать» в разделах
   Driver и Rider). PD: хром не меняется. В Kit нет токена для цвета продукта.
   а) ★ Semantic-ветка `accent-product` по `semantic-color-tokens-guide` (подгруппа
   `product`): `bg-accent-product-<продукт>-fade`, `text-accent-product-<продукт>`.
   Значения задаются на уровне разделов Driver и Rider и не ссылаются на токены продуктов:
   это цвет метки, а не токен Driver. Фокус — всегда `line-focus` (графит), не цвет
   продукта. Пару Rider (3.96) поднять до AA ступенью темнее — вопрос к PD через Standards ·
   Persefona, так как это меняет хром;
   б) оставить `--ds-accent*` вне Kit как записанное исключение;
   в) графитовый хром (`bg-accent-main`, `text-accent` с подчёркиванием), цвет продукта —
   только метка. Это новый ответ PD на п. 9.
   На страницах вне продукта (управление, задачи, команда, ТТМ, вход) — во всех вариантах
   графит Kit, а не синий Driver по умолчанию.
2. **Где цветной акцент `vivid`.** ★а — главный тег задачи, «AI» у человека, ведущий KPI
   ТТМ, полоса Spacing (как у `TokenRow` Bar); при условии AA из §5. б — только бейджи,
   а полоса Spacing и KPI — графит.
3. **h1 на странице портала.** ★а — `heading-l` 32/40 в панели навигации на всех
   страницах; `display-l` — только у хаба и у обложки гайда (`HeaderPage`). Правило #361
   §5.2 уточняется: «шапка служебной страницы Figma». б — `display-l` везде.
   На странице гайда h1 в панели повторяет заголовок обложки. ★а — в панели остаётся
   «Guides», а название гайда стоит только в обложке; б — оставить оба.
4. **Вид значения → тон Badge.** ★а — semantic → Success, platform → Info, raw →
   Warning, hardcode → Error. б — все Neutral, отличие по тексту.
5. **Вид изменения в changelog.** На портале их 5, у `BadgeChangelog` — 3 (Added,
   Removed, Edited). ★а — на портале остаётся точка 8 px цвета `text-<x>` по #354 §3.1, а
   `BadgeChangelog` не трогается. б — расширить `BadgeChangelog`: Fixed → Warning,
   Deprecated → Neutral; Changed = Edited.
6. **Два текстовых стиля.** Порталу не хватает:
   - стиля управления: кнопка, таб, сегмент, имя токена, заголовок карточки — 14 · 500.
     ★ `label-m` 14/20 · 500;
   - подписи 400 мельче 13: альфа, дата, автор, подписи графика. ★ `body-xs` 12/16 · 400.
   а) ★ завести оба (`token-change-gate`, пачкой у Designer · Persefona); б) обойтись
   `label-s` (500) и `body-s` (13).
7. **Затемнение и отключённое.** а) ★ `bg-overlay` → новая Core `graphite-100-a40` — для
   модалки и диалога. Меню продукта сейчас подсвечивает фон белым `.12` с размытием 2 px —
   оно переходит на тот же `bg-overlay`, а размытие убирается. Отключённое — цветом
   (`text-disabled`, `icon-disabled`), токенов прозрачности нет. б) затемнение без токена,
   как исключение.
8. **Наведение на тёмное.** Кнопка входа при наведении — `#1A1A1B`. ★а — без смены
   цвета: hover — только курсор, фокус — кольцо. б — завести `bg-inverse-hover`.
9. **Размеры контролов.** Высота 36 и минимальная цель 44 используются в портале, токенов
   размера в Kit нет. ★а — размер описывается в спеке компонента как правило платформы, по
   образцу ответа 11а в #378 (толщина линии маркера); б — Core `size-*`.
10. **Переходы.** ★а — одно правило для состояний — 150 мс ease — в #361 (раздел
    «Движение»), без токенов. Анимация графика ТТМ — контент, правило её не касается.
    б — токены `motion-*`.
11. **Точки перелома.** Их 9, «мобильная» — то 767, то 768, то 600. ★а — правило в #361:
    480 · 768 · 1024 · 1280, без токенов. б — оставить как есть.
12. **Иконки хаба** — символы Unicode системным шрифтом; у Colors и Gradients одинаковый
    ◐. В Kit файл Icons пустой (#362 §10.4). ★а — заявка Designer · Persefona на набор
    иконок разделов (11 штук, 16 и 28 px, `icon-secondary`); до него символы остаются.
    б — убрать иконки.
13. **Цитата в гайде** (`>` в markdown). ★а — `Banner` Info; б — `Banner` Neutral, если
    #378 его заведёт; в — без блока, `body-m` `text-secondary` с отступом.
14. **Цвета графика ТТМ.** «До» — токен Driver, «после» — цвет продукта, а ТТМ не
    относится к продукту. ★а — «до» — `text-warning`, «после» — `text-accent-vivid` до
    отдельной задачи на цвета данных; б — сразу завести палитру данных Kit.

### 7.2 Блоки, которых нет в Kit — анкета `component-gate`

Lookup по файлу Persefona Components (`X8DoqKC0SKfxb8SoKboo3N`, 9 компонентов из #381) и
по принятым #378 (`IslandExample`, `Banner`, `TagMarker`, `TableCell` Variant=Badge).
Совпадений нет: все блоки Kit статичные (#381, «Состояния»). Аналоги в Driver и Rider не
используются: это другие продукты.

Общее для всех. Режим — `light`. Путь — Figma Persefona Components, код —
`pages/aid-portal/` у Developer · Persefona (раскладку объявляет он). Состояния — по
`component-states-guide` §2: hovered → `bg-accent-states-hover`, pressed →
`bg-accent-states-pressed`, selected → `bg-accent-states-active`, disabled →
`bg-accent-states-disable` и `text-disabled` / `icon-disabled`, focused →
`bg-accent-states-focused` и кольцо `line-focus`. Слой состояния — поверх фона блока;
цветами поверхности состояния не рисуются (#361 §6.3). В колонке «Tokens required» —
только покой и выбранный цвет, состояния у всех 16 блоков одинаковые. Токенов
`bg-accent-states-*` в Kit нет — пачка №0 (§8). Имена латиницей, Role первым (#362 §10,
architecture-guide §9). `ListMeta`, `BlockCode`, `SegmentedControl`, `Tabs` — имена
черновые: вопрос у Standards (рекомендация Standards · Persefona — `IslandMeta`, `IslandCode`).

| # | Component | Где на портале | Tokens required | Variants / Properties | Confidence |
|---|---|---|---|---|---|
| 1 | `ButtonText` | «Скачать», «Показать JSON», «Войти», «Выбрать все» | Primary: `bg-accent-main`, `text-inverse`; Secondary: `bg-surface-main`, `line-default`, `text-primary`; `label-m`, `radius-m`, `spacing-8` / `spacing-12` | Variant = Primary \| Secondary; Size = M (36) \| L (44); Icon (bool) | high — 6 мест |
| 2 | `ButtonIcon` | назад, переключатель продукта, зум, «ещё», закрыть | `icon-secondary`, при наведении `icon-primary`; `radius-m` | Size = 28 \| 36 \| 44 | high |
| 3 | `ButtonGroup` | формат + скачать + ещё, JSON + скачать | общая рамка `line-default`, `radius-m`, внутренние линии `line-default` | слот из `ButtonText` / `ButtonIcon` | medium — 2 места, одинаковые |
| 4 | `ButtonCopy` | значения токенов, мета, сниппеты | `label-s`, `text-secondary`, `line-default`, `radius-s`; «скопировано» — `Badge` Success | State = Idle \| Copied | high |
| 5 | `SegmentedControl` | платформа, режим, Day/Night, фильтр ТТМ | рамка `line-default`, `radius-m`; пункт `label-m` `text-secondary`; выбранный — `bg-accent-product-<продукт>-fade` + `text-accent-product-<продукт>` в продукте, `bg-accent-main` + `text-inverse` вне его | Size = S \| M; слот пунктов | high — 7 мест |
| 6 | `Tabs` | страница компонента | `label-m` `text-secondary` → `text-primary`; выбранный — `text-accent-product-<продукт>` и линия 2 px того же цвета в продукте, `text-accent` и `bg-accent-main` вне его; линия низа `line-default` | слот `.Tab` | high |
| 7 | `FieldText` / `FieldSearch` | вход, поиск в шапке | `body-m`, `bg-surface-main`, `line-default` → `line-hover`, плейсхолдер `text-muted`, фокус — кольцо, ошибка — `text-error` | Search (иконка, очистка) | high |
| 8 | `FieldSelect` | продукт в задачах, ТТМ | как `FieldText` + шеврон `icon-secondary`; открывает `Menu` | Multi (чекбоксы) | medium |
| 9 | `Menu` + `MenuRow` | скачать, контекстное меню иконки, выбор | §2 «Выпадающее меню» | Row: Default \| Checked \| Disabled | high |
| 10 | `Chip` | исполнители в задачах | `radius-pill`, `line-default`, `body-s`; pressed — `bg-accent-main` + `text-inverse`; счётчик `body-xs` | Pressed (bool), Count (text) | medium. Отличие от `Badge`: нажимается |
| 11 | `IslandLink` | хабы, гайды, управление, задачи, навигация гайда | §2 «Карточка-ссылка»; плоский вид хаба — без рамки | Variant = Outlined \| Plain; слоты preview, content | high — 6 экранов |
| 12 | `ListMeta` | мета гайда, мета компонента, release | §2 «Мета-список» | Value = Text \| Code \| Badge \| Link | high. Имя — вопрос Standards |
| 13 | `BlockCode` | API, сниппет, `pre` в гайде, установка | §2 «Блок кода» | Title (bool), ButtonCopy (bool) | high. Имя — вопрос Standards |
| 14 | `Toast` | копирование | §2 «Тост» | Action (bool) — тогда фокус `line-focus-inverse` | high |
| 15 | `Dialog` | JSON, задача | `bg-surface-main`, `radius-xl`, `shadow-2`, `bg-overlay` (§7.1, п. 7); заголовок `heading-m`; на мобиле — лист снизу | Size = M (720) \| L (960) | medium |
| 16 | `Checkbox` Shape=Round | выбор иконок | `line-hover` → `bg-accent-main` + `icon-inverse`; Indeterminate | Shape = Round; State = Off \| On \| Mixed | medium — одно место |

Вопросы по блокам:

15. **Объём первой сборки.** ★а — блоки 1, 2, 4, 5, 6, 9, 11, 12, 13, 14: без них не
    переводится ни один экран; 3, 7, 8, 10, 15, 16 — второй волной. б — все 16 сразу.
16. **Где они живут.** ★а — в Persefona Components, рядом с блоками #381, общие с
    плагинами AID. б — локально в портале (тогда это не Kit, и правило PD «не плодить» не
    выполняется).
17. **`ButtonCopy` и `Toast`.** Сейчас копирование показывает и плашку на кнопке, и тост.
    ★а — оставить только состояние Copied на кнопке, тост — для копирования из ячейки без
    кнопки. б — оставить оба.

## 8. После ответов

1. Правки по ответам внесены (2026-10-23); дальше — «соответствует» от Standards · Persefona.
2. **Пачка №0** — Designer · Persefona по `token-change-gate`: `bg-accent-states-hover`,
   `-pressed`, `-active`, `-disable`, `-focused`; значения — прозрачности графита. Идёт до
   любого интерактивного блока.
3. Заявка Designer · Persefona: токены §7.1 — п. 1а (`accent-product-driver` / `-rider`),
   п. 6а (`label-m`, `body-xs`), п. 7а (`bg-overlay`, `graphite-100-a40`) — пачкой по
   `token-change-gate`; описание `Banner` (п. 13а); набор иконок разделов (п. 12а); блоки
   §7.2 — первая волна по ответу 15а.
4. Developer · Persefona · AID-52 переводит портал по §4; блоки §7.2 — после их сборки.
