# persefona-6 (AID-64, #422) — чейнжлоги и аудиты библиотек на Kit: инвентаризация

От: Designer · Persefona, 2026-10-25. Приёмка — Standards · Persefona. Куратор — PD.

Основание — указание PD 2026-10-25 (запись — PR #421), правило страниц Figma #362 0.10.0
(`products/persefona/rules/persefona-figma-pages.md` §6.5 «Уже сделанные таблицы», §6.6).
Это шаг 1 из 4: только инвентаризация. В Figma ничего не менялось. Снято через Plugin API
2026-10-25: таблицы — по слою `Changelog Table Body` (и `Data Container`), аудиты — по
`audit|аудит|предаудит` в именах страниц, секций и фреймов, во всех страницах, включая
`Archive`.

Префикс имени файла `persefona-6` уже есть у `persefona-6-presentbook-2026-10-23.md`
(AID-52, внутри — `presentbook-6`). Номер задачи от Ops — persefona-6, поэтому имя
оставлено; если нужно, переименую.

## 1. Файлы

| Файл | Ключ | Таблиц | Аудитов |
|---|---|---|---|
| Rider · токены | `yrfG6u9osujKX8e1B14lpT` | 8 + образец на `Оформление` | 0 |
| Driver · токены | `ouP1hUC4YjVRpfgdvzy3FA` | 4 + образец на `Оформление` | 0 (см. §3.3) |
| Rider · иконки | `n6LppQbTv85yI29h6u30DI` | 1 | 0 |
| Driver · иконки | `AwRpEGfyeNjRbZP8KGG1wy` | 1 | 0 |
| Rider · компоненты | `79UryRdexwKAv8vDIV5v4v` | 1 (TabBar, уже Kit) | 3 (§3) |
| Driver · компоненты | `o0IUYIS7vadbmXPXd81ql9` | 0 | 0 |
| Persefona Tokens | `YDjPxFrW1yXqm9RzBGQXuc` | 0 | 0 |
| Persefona Components | `X8DoqKC0SKfxb8SoKboo3N` | 1 (мастер TableChangelog 5:354, Kit) | 0 |
| Persefona Icons | `dcccBNrHsTuROv7uUp3NGk` | 0 | 0 |

В `Archive` ни в одном файле секций аудита и таблиц чейнжлога нет: в `Archive` Rider
Components 465:630 лежит только `.Button Standart BACKUP`.

**Persefona.** Переводить нечего: единственная таблица — мастер `TableChangelog`, он и
есть Kit. У коллекций и стилей Persefona Tokens таблиц нет: Kit не выпущен (pending
1.0.0), таблицы появятся при выпуске по §6.5. В эту задачу не входит.

## 2. Таблицы чейнжлога

Все `figmaTable` из `tokens/*-changelog.json` и pending Rider Gradients найдены и
указывают на внешний фрейм `CHANGELOG`. Устройство у всех таблиц токенов одно:

```
CHANGELOG (figmaTable)
├─ __Changelog Header        экземпляр локального компонента (эмодзи + «Changelog • …»)
└─ Changelog Table           фрейм
   ├─ Table Header           фрейм: 4 × __Changelog Table Header (локальный компонент)
   └─ Changelog Table Body   фрейм
      └─ Changes Row × N     фрейм
         ├─ __Changelog Table Cell   фрейм (версия, дата, автор — тот же фрейм)
         └─ {Chnagelog_Cell}         фрейм — ячейка изменений: бейдж, фраза, {separator}
```

Устройство образца Kit `TableChangelog` 5:354 такое же, уровень в уровень: `HeaderSection`
→ `Table` → `Table Header` (4 × `TableCell` Header) → `Changelog Table Body` → `Changes Row`
(`TableCell` Default, `Changes Cell`, `TableCell` × 2). Поэтому перевод на месте —
это Swap экземпляров и перепривязка заливок и стилей. Фреймы остаются.

| # | Файл · страница | figmaTable (корень) | JSON | Строк | Бейджи: имя слоя → компонент | Сырых заливок · текстов без стиля |
|---|---|---|---|---|---|---|
| 1 | Rider · `✅ Colors` | 31:66 | `rider-colors-semantic-changelog` | 13 | `__Changelog Badge` × 26 | 234 · 121/121 |
| 2 | Rider · `✅ Gradients` | 316:142 | pending `token-rider-gradients-changelog-2026-10-20` | 3 | `Badge` × 4 ⚠ | 54 · 25/25 |
| 3 | Rider · `✅ Typography` | 11:502 | `rider-typography-sem-changelog` | 3 | `Badge` × 3 ⚠ | 51 · 24/24 |
| 4 | Rider · `✅ Typography` | 184:971 `CHANGELOG Outstanding` | `rider-typography-sem-out-changelog` | 1 | `Badge` × 1 ⚠ | 25 · 10/10 |
| 5 | Rider · `✅ Shadows` | 21:15 | `rider-effects-shadows-changelog` | 2 | `__Changelog Badge` × 1, `Badge` × 1 | 33 · 16/16 |
| 6 | Rider · `✅ Glass` | 71:17 | `rider-effects-glass-changelog` | 1 | `__Changelog Badge` × 1 | 25 · 10/10 |
| 7 | Rider · `✅ Space` | 208:54 | `rider-space-changelog` | 1 | `Badge` × 1 ⚠ | 25 · 10/10 |
| 8 | Rider · `✅ Radius` | 204:50 | `rider-radius-changelog` | 1 | `Badge` × 1 ⚠ | 25 · 10/10 |
| 9 | Rider · `Оформление` | 1:16 (образец) | — | 2 | `Badge` × 4 | 45 · 22/22 |
| 10 | Driver · `✅ Colors` | 45:905 | `driver-colors-semantic-changelog` | 15 | `__Changelog Badge` × 4, `Badge` × 15 | 215 · 107/107 |
| 11 | Driver · `✅ Gradients` | 352:204 | `driver-gradients-changelog` | 2 | `Badge` × 2 ⚠ | 37 · 16/16 |
| 12 | Driver · `✅ Typography` | 49:13 | `driver-typography-sem-changelog` | 4 | `__Changelog Badge` × 4 | 53 · 28/28 |
| 13 | Driver · `✅ Shadows` | 51:24 | `driver-effects-shadows-changelog` | 1 | `Badge` × 1 ⚠ | 25 · 10/10 |
| 14 | Driver · `Оформление` | 45:899 (образец) | — | 2 | `Badge` × 4 | 43 · 22/22 |
| 15 | Rider · иконки `Icons` | 3703:4 | `rider-icons-changelog` | 7 | `__Changelog Badge` × 12 (remote) | ⚠ нет `Changelog Table Body` (§2.2) |
| 16 | Driver · иконки `Icons` | 5503:18 | `driver-icons-changelog` | 2 | `Badge` × 2 (remote) ⚠ | 37 · 16/16 |
| — | Rider · компоненты `🚧 TabBar · сборка` | 678:4607 | — (не выпущен) | 1 | `BadgeChangelog` (Kit) | 0 · 0/9 — уже Kit, не трогать |

У `driver-radius-sem-changelog` и `driver-spacing-sem-changelog` поля `figmaTable` нет, и
таблиц на этих страницах тоже нет. Это не входит в задачу (по §6.5 таблица должна быть,
завести её — отдельная работа на стороне Driver).

Шрифты в таблицах — Google Sans (у Rider Colors ещё Inter, у Driver Icons — Google Sans
Flex). Ни один текст не на стиле.

### 2.1 Что из Kit

| Часть | Сейчас | Станет |
|---|---|---|
| `CHANGELOG`, `Changelog Table`, `Table Header`, `Changelog Table Body`, `Changes Row`, `__Changelog Table Cell`, `{Chnagelog_Cell}`, `{separator}` | фреймы, сырые цвета | те же узлы; заливки, обводки, отступы, радиусы — на переменные Kit, тексты — на стили `persefona/*` |
| `__Changelog Header` | экземпляр локального компонента | Swap → `HeaderSection` |
| `__Changelog Table Header` × 4 | экземпляры локального компонента | Swap → `TableCell` `Variant=Header` |
| Бейдж | `__Changelog Badge` / `Badge` → локальный `__Changelog Badge` (`Change Status=…`) | Swap → `BadgeChangelog` (`Change=Added\|Removed\|Edited`); значение варианта — то же |
| Версия, дата, автор | тексты во фрейме `__Changelog Table Cell` | остаются фреймом, текст — `persefona/body-m` (как `TableCell` Default) |

Swap поменяет имя слоя на имя компонента, поэтому после замены я возвращаю имя слоя
явно. Имена `Changelog Table Body`, `Changes Row`, `{separator}` не меняются.

### 2.2 Расхождения с контрактом плагина

`writeUnpublishedRow` (`tools/figma-token-comparator/src/lib/changelogTable.ts`) берёт
образец бейджа только из слоя с именем `__Changelog Badge`, за которым идёт текст.

- **⚠ Бейдж с именем `Badge`.** В таблицах 2, 3, 4, 7, 8, 11, 13, 16 ни одного
  `__Changelog Badge` нет. Плагин там уже сейчас упадёт с «нет строки-образца с бейджем
  и фразой». Это не следствие перевода, расхождение есть уже сейчас. Вопрос 1.
- **⚠ Rider Icons без `Changelog Table Body`.** Строки лежат во фрейме `Data Container`
  вместе со строкой заголовков `Table Header Row`. Плагин ищет тело только по имени
  `Changelog Table Body`, поэтому эту таблицу сейчас не найдёт. Шапка таблицы — фрейм
  `Changelog Header` с текстами, а не экземпляр. Вопрос 2.

## 3. Аудиты и предаудиты

| # | Файл · страница | Узел | Зона | Состояние | В задаче |
|---|---|---|---|---|---|
| А1 | Rider · компоненты `🚧 TabBar · сборка` 389:47 | секция `Аудит TabBar · для истории` 599:2797 | 3 | старое оформление: 1154 сырых заливки, 389/671 текстов без стиля, SF Pro Text | да — образец PD |
| А2 | Rider · компоненты `🚧 Map Pin · аудит` 733:4364 | секция 733:4548 | 3 | почти Kit: `HeaderPage`, `HeaderSection` × 8, `Badge` × 28; 50 сырых заливок, 4/393 текстов без стиля | нет, вопрос 3 |
| А3 | Rider · компоненты `🚧 Divider · аудит` 773:2 | секция 773:31 | 3 | AID-62, в работе | нет — #422 «Не входит», страницу не трогаю |
| А4 | Rider · компоненты `👀 Spinner · audit` 786:2 | — | 3 | AID-61; имя уже по §5 (латиница — разрешена PD, переход один цикл); шапки `HeaderPage` нет | нет; шапку ставит тот, кто переводит страницу на Kit |
| А5 | Rider · компоненты `👀 Map Pin · аудит` 733:4365, `👀 Divider · аудит` 773:33 | шапки `HeaderPage` | 3 | нет ссылки «← Cover» (#362 §6.2: `Show Cover Link` выкл.); страницы `Cover` в Rider · компоненты сейчас нет — ссылке некуда вести | нет; ставит тот, кто переводит страницу на Kit (вместе с `Cover`) |
| — | Driver · токены `Идеи` | секция `скиллы для аудита` 105:115 | 3 | заметки об идеях, не аудит | нет |

**Значок 👀 (#362 0.10.1–0.10.2, согласие PD 2026-10-25 «я даю свои согласия, куратор Driver я»).**
Страницы аудита Rider и Driver — 🚧 → 👀, слово `· аудит` кириллицей (латиница — вторым проходом).
Шапка: первая метка «Аудит» → статус «Смотреть и решать» · Warning (тон «На приёмке» из
persefona-4-content §2), метка задачи с исполнителем остаётся, 👀 в метку не ставится.

| Узел | Было | Стало | Шапка |
|---|---|---|---|
| 733:4364 | `🚧 Map Pin · аудит` | `👀 Map Pin · аудит` | 733:4365: «Аудит» · Vivid Soft → «Смотреть и решать» · Warning |
| 773:2 | `🚧 Divider · аудит` | `👀 Divider · аудит` | 773:33: «Аудит» · Vivid Soft → «Смотреть и решать» · Warning |

В Driver (компоненты, токены, иконки) и в Rider токенах и иконках страниц аудита нет.

Сделано в Figma 2026-10-25 (разрешение пользователя в чате): обе страницы и обе метки; снимки —
`changes/persefona/snapshots/kit-migration/header-map-pin-audit.png`, `header-divider-audit.png`.

### 3.1 TabBar 599:2797 — блоки и Kit

Карточки блоков — белые фреймы с радиусом 24. Внутри у каждой шапка (метки, заголовок,
подзаголовок), подсекции и плашка «Для инженера».

| Блок | Части | Kit |
|---|---|---|
| `Обложка · TabBar · нижняя навигация Rider` 439:1421 | шапка с метками, «Как читать этот пейдж» (5 пунктов), «Содержание» (таблица) | `HeaderPage`: Title, Subtitle, метки — слот `Badge`, «Как читать» — How to Read, «Содержание» — Contents со ссылками на блоки |
| 0–7 (440, 441, 443, 444, 445, 446, 433, 447:1421/1041/1647) — карточка | фрейм r24 | `IslandBlock`, содержимое — в слот `Content` |
| Шапка блока | метки + заголовок + подзаголовок | `HeaderSection` (номер и название, одна строка подзаголовка); метки — `Badge` |
| «Для инженера» | текст | часть `IslandBlock` «Для инженера» |
| `Подсекция · …` → `Заголовок` + `Таблица` (разбор по параметрам, состояния, сводка, «Что именно поменялось») | таблица фреймами | `TableComparison` + `TableCell` (Header, Default, Before/After, Badge); заголовок подсекции — стиль `persefona/heading-s` |
| Сцены: «Сравнение иконок», «Варианты» фона, «Таб — компонент», «Бар — переключение», примеры трудных случаев, «Экраны Было/Стало», «Крупно» | сцены на цветах Rider | `IslandExample` (`Stage` — слот; сцена — на color-sem Rider, как в гайде TabBar) |
| Панели «Итог по цветам», «Как потрогать вживую», «Что дальше» | заголовок + пункты | `Banner` `Info` — только если пункты помещаются в Title/Text. Иначе фрейм на переменных и стилях Kit (вопрос 4) |
| «7. Итоги аудита» → `Вопрос 1…8` | карточки вопросов: номер, вопрос, варианты, ★ | **в Kit нет** — §3.2 |
| `▶ Прототип · перетекание · день/ночь` 557:4249, 557:4287 | точки старта прототипа | остаются фреймами верхнего уровня, иначе потеряются точки старта. Обводка и радиус — на Kit; фон — цвет сцены Rider, не меняется |

### 3.2 Чего в Kit нет

- **Карточка вопроса** (номер, формулировка, варианты, рекомендация ★, ответ). Такие
  карточки есть в итогах всех трёх аудитов Rider (TabBar «Вопрос 1–8», Map Pin «7. Что
  ждёт решения», Divider). Lookup по Kit: `IslandBlock` — карточка блока, а не пункт;
  `Banner` — пометка без вариантов; `TableComparison` — сравнение, а не выбор. Нужна
  анкета `component-gate`. До приёмки карточки собираю фреймом на переменных и стилях Kit
  (§6.6 «Чего в Kit нет»). Вопрос 5.
- **Список пунктов** («Как читать», «Итог», «Как потрогать»). Отдельного компонента не
  предлагаю: это текст `persefona/body-m` с номером `persefona/label-s` во фрейме на
  переменных Kit.

### 3.3 Находка в правиле

§6.6 «Что из Kit» называет `IslandDocBlock`. В Kit такого компонента нет: при переходе на
латиницу выбрано имя `IslandBlock` (#362 0.4.2, #368 §2). Нужно поправить правило
(Standards · Persefona).

## 4. Порядок работ после «принято»

0. **Человек** подключает Persefona Tokens и Components в Rider · токены, Driver · токены,
   Rider · иконки, Driver · иконки (Rider · компоненты уже подключён). PD предупреждён
   как куратор задачи 2026-10-25.
1. Таблицы 1–16 по §2.1, файл за файлом. Перед каждой — снимок «до» и отпечаток (id
   корня, тела, строк, ячеек изменений, тексты строк по порядку); после — тот же
   отпечаток, id и тексты должны совпасть, корень — с `figmaTable`.
2. `writeUnpublishedRow` — на одной таблице каждого файла (Rider · токены, Driver ·
   токены, Rider · иконки, Driver · иконки), на копии таблицы, как в #392; копию после
   прогона удаляю, оригинал не трогаю.
3. Аудит А1: снимки «до» по блокам, текстовый отпечаток (id → characters), перевод по
   §3.1, отпечаток «после» — тексты 1:1. Новые компоненты — только после приёмки анкеты
   (вопрос 5).
4. Итог — в PR со снимками → Standards · Persefona.

## 5. Вопросы к Standards · Persefona

1. **Бейджи с именем `Badge`** (§2.2). ★а — при Swap на `BadgeChangelog` имя слоя
   ставлю `__Changelog Badge` во всех таблицах. Это приводит их к контракту, а
   вложенность не меняется. б — имя оставить как есть, а плагин научить искать бейдж
   по главному компоненту (задача Developer · Token Comparator).
2. **Rider Icons 3703:4** (§2.2). ★а — переименовать `Data Container` в
   `Changelog Table Body`, `Table Header Row` вынести из тела в отдельный фрейм
   `Table Header` над телом (как в таблицах токенов); узлы строк и ячеек не меняются,
   `figmaTable` прежний. б — оставить устройство, перевести только вид; плагин в этой
   таблице так и не будет работать.
3. **Аудит Map Pin 733:4548** (AID-55, в работе у Designer · Components, уже почти на
   Kit). ★а — в эту задачу не брать: автор доводит его по правилу §6.6, остаток (50
   сырых заливок, 4 текста без стиля) проверяется на его приёмке. б — переведу я после
   того, как он закончит аудит.
4. **Панели с пунктами** в А1. ★а — `Banner` `Info`, если текст панели помещается в
   Title + Text без потери пунктов; иначе фрейм на переменных и стилях Kit. б — всегда
   фрейм.
5. **Карточка вопроса** (§3.2). ★а — отдельная анкета `component-gate` (рабочее имя
   `CardQuestion`) следующим PR этой задачи; в А1 до её приёмки — фреймы на Kit. б —
   только фреймы на Kit, без компонента.
6. **Образцы таблиц на `Оформление`** (9, 14), без `figmaTable`. ★а — перевести на месте
   вместе с остальными: с них копируют новые таблицы. б — не трогать: новые таблицы и
   так вставляются из образца Kit (§6.5 «Вид»).
7. **Заголовок таблицы.** По §6.5 он совпадает с `artifact` в JSON (`Rider Space`),
   сейчас в таблицах написано «Changelog • …». ★а — при Swap на `HeaderSection` ставлю
   текст из `artifact`. б — текст не меняю, только вид.

Самопроверка: все 14 `figmaTable` (13 в `tokens/*-changelog.json` + pending Rider Gradients) из репозитория найдены в Figma, узлы совпали;
устройство таблиц сверено с мастером `TableChangelog` 5:354 и с `changelogTable.ts`.
