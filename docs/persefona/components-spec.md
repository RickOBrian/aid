# Persefona Components — спецификация компонентов

> Задача persefona-3 (AID-51, #376) · черновик для приёмки Standards · Persefona · куратор PD · 2026-10-23
>
> Источник — файл Figma **Persefona Components** (`X8DoqKC0SKfxb8SoKboo3N`), снято через Plugin API 23.10.
> Токены — библиотека **Persefona Tokens** (`YDjPxFrW1yXqm9RzBGQXuc`), коллекции `persefona-core` и `persefona-semantic`.
> Записи о сборке — `changes/persefona/pending/component-persefona-1-*.json`.

Спека описывает, что уже собрано. Она ничего не меняет в файле. Где сборка
расходится со стандартом или ей не хватает свойства, это записано в
«Открытых вопросах» в конце, а не исправлено молча.

---

## Как читать

Persefona — UI Kit служебных сред AID: страницы аудита и сборки, гайды,
витрины токенов, чейнжлоги, интерфейс Presentbook и плагинов. Kit не
используется в Driver и Rider.

Все девять компонентов — строительные блоки **служебной страницы** в
Figma. Страница собирается так:

```
HeaderPage                       ← обложка, одна на страницу
IslandBlock                      ← карточка раздела, по одной на раздел
 ├─ HeaderSection                ← номер, название и подзаголовок раздела
 ├─ Content                      ← содержимое: таблица, превью, текст
 │   ├─ TableComparison          ← «было | стало», из TableCell
 │   ├─ TableChangelog           ← образец чейнжлога для Token Comparator
 │   └─ TokenRow × N             ← строки справочника токенов
 └─ Footer «Для инженера»
Badge                            ← метки статуса: на обложке, в таблицах, в тексте
```

У каждого компонента ниже: **назначение → уровень → анатомия → свойства →
токены → связи**. Состояний у компонентов Kit нет: все они статичные, не
нажимаются и не наводятся. Поэтому раздел «Состояния» один, общий, в конце.

**Темы.** В `persefona-semantic` сейчас один режим, `light`. Ночная тема
добавится режимом коллекции, и компоненты при этом не изменятся: все цвета
привязаны к semantic-токенам.

**Платформы.** Поверхности Kit — Figma и веб. Стек кода не объявлен
(`products/persefona/product.json` → `platformModel.declared: false`), поэтому
разделов «Реализация — Web / iOS / Android» в спеке нет. Их допишет
Developer · Persefona, когда объявит стек. Префикс CSS-переменных в коде будет
`--pf-`.

---

## Сводка

| Компонент | Уровень | Что это | Ключ | Узел |
|---|---|---|---|---|
| Badge | Surface View | Метка статуса | `685f952d…` | 3:90 |
| BadgeChangelog | Surface View | Метка вида изменения в чейнжлоге | `c2a13105…` | 5:153 |
| HeaderPage | Structural View | Обложка служебной страницы | `21df81e0…` | 5:77 |
| HeaderSection | Surface View | Заголовок раздела | `09e45bfb…` | 2:136 |
| IslandBlock | Structural View | Карточка раздела | `0e644cfd…` | 5:114 |
| TableCell | Surface View | Ячейка таблицы | `abb512e2…` | 2:118 |
| TableComparison | Structural View | Таблица «было \| стало» | `e748921f…` | 5:240 |
| TableChangelog | Structural View (образец) | Таблица чейнжлога для плагина | `2e43ff48…` | 5:354 |
| TokenRow | Surface View | Строка справочника токенов | `7b101990…` | 3:395 |

---

## 1. Badge

**Назначение.** Короткая метка статуса или категории: «Не опубликовано»,
«Черновик», «Ждёт решения», вид изменения. Метка не нажимается и не
заменяет кнопку. Длинный текст в неё не кладут: метка держит одно-два слова.

**Уровень — Surface View.** Внутри один текстовый элемент в оболочке:
фон, форма pill и отступы.

**Анатомия.**

```
Badge (auto-layout →, hug)
 └─ Text
```

**Свойства.**

| Свойство | Тип | Значения | По умолчанию |
|---|---|---|---|
| `Tone` | variant | Neutral, Warning, Success, Error, Info, Vivid Soft, Vivid, Accent | Neutral |
| `Text` | text | — | «Метка» |

**Токены.**

| Часть | Токен |
|---|---|
| Отступы | `spacing-8` по горизонтали, `spacing-4` по вертикали |
| Скругление | `radius-pill` |
| Текст | стиль `persefona/label-s` (12/16, 500) |
| Рамка | нет |

| Tone | Фон | Текст | Когда |
|---|---|---|---|
| Neutral | `bg-accent-status-neutral-main` | `text-neutral` | Нейтральный факт: тип, этап, номер |
| Warning | `bg-accent-status-warning-main` | `text-warning` | Ждёт решения, есть риск |
| Success | `bg-accent-status-success-main` | `text-success` | Принято, добавлено |
| Error | `bg-accent-status-error-main` | `text-error` | Ошибка, удалено, запрет |
| Info | `bg-accent-status-info-main` | `text-info` | Справка, изменено |
| Vivid Soft | `bg-accent-vivid-fade` | `text-accent-vivid` | Цветной акцент, мягкий |
| Vivid | `bg-accent-vivid-main` | `text-inverse` | Цветной акцент, яркий |
| Accent | `bg-accent-main` (графит) | `text-inverse` | Главная метка страницы |

Статусные тона (Neutral…Info) — мягкие: фон и текст одного статуса. Vivid и
Vivid Soft — цветной акцент iolite. Их ставят только там, где акцент нужен в
цвете, а не в графите.

**Связи.** Используется в HeaderPage (метки обложки) и BadgeChangelog.

---

## 2. BadgeChangelog

**Назначение.** Метка вида изменения в строке чейнжлога. Нужна, чтобы
плагин Token Comparator ставил метку по смыслу изменения, не выбирая тон
вручную.

**Уровень — Surface View.** Это обёртка над одним Badge с готовым
соответствием «вид изменения → тон».

**Анатомия.**

```
BadgeChangelog
 └─ Badge (экземпляр)
```

**Свойства.**

| Свойство | Тип | Значения | Что внутри |
|---|---|---|---|
| `Change` | variant | Added, Removed, Edited | Badge Success / Error / Info |

`Change` — единственное свойство. «Исправлено» и «Устарело» плагин пишет
подписью поверх варианта Edited.

**Токены.** Свои не задаёт, все наследует от Badge. Если поменять Badge,
BadgeChangelog поменяется вместе с ним.

**Связи.** Внутри — Badge. Используется в TableChangelog (слой
`__Changelog Badge`).

---

## 3. HeaderPage

**Назначение.** Обложка служебной страницы: аудита, сборки, гайда, витрины.
Отвечает на вопросы «что это за страница», «в каком она статусе» и «где
что лежит». На странице одна, всегда первая.

**Уровень — Structural View.** Внутри два самостоятельных компонента
(Badge и тексты заголовка) и блок содержания.

**Анатомия.**

```
HeaderPage (auto-layout ↓, шаг spacing-24, поля spacing-48)
 ├─ Badges        — ряд меток (Badge × 4), перенос строк
 ├─ Header        — шаг spacing-12
 │   ├─ Title
 │   ├─ Subtitle
 │   └─ How to Read   — ссылка «Как читать эту страницу →»
 └─ Contents      — шаг spacing-8
     ├─ Contents Title   «Содержание»
     └─ Contents Items   нумерованный список разделов
```

**Свойства.**

| Свойство | Тип | По умолчанию |
|---|---|---|
| `Title` | text | «Компонент · что это» |
| `Subtitle` | text | «Одно-два предложения: что это, где используется, из чего состоит.» |
| `How to Read` | text | «Как читать эту страницу →» |
| `Show How to Read` | boolean | вкл. |
| `Contents` | text | «1. Раздел / 2. Раздел / 3. Раздел» |

**Токены.**

| Часть | Токен |
|---|---|
| Фон | `bg-surface-main` |
| Рамка | `line-default` |
| Скругление | `radius-l` |
| Поля / шаг | `spacing-48` / `spacing-24` |
| Title | `persefona/display-l` (48/56), `text-primary` |
| Subtitle | `persefona/body-m` (14/22), `text-secondary` |
| How to Read | `persefona/body-m`, `text-accent` (графит), подчёркивание |
| Contents Title | `persefona/heading-s` (16/24), `text-primary` |
| Contents Items | `persefona/body-s` (13/20), `text-secondary` |
| Ряд меток | шаг `spacing-8` по обеим осям |

**Связи.** Внутри — Badge. Используется в начале каждой служебной страницы
(в файле Components сейчас 8 экземпляров).

---

## 4. HeaderSection

**Назначение.** Заголовок раздела служебной страницы: номер и название, под
ними — одна строка о том, что в разделе и как его читать.

**Уровень — Surface View.** Внутри два текстовых примитива в одном
контейнере, собственного фона нет.

**Анатомия.**

```
HeaderSection (auto-layout ↓, шаг spacing-8, ширина fill)
 ├─ Title
 └─ Subtitle
```

**Свойства.**

| Свойство | Тип | По умолчанию |
|---|---|---|
| `Title` | text | «1. Раздел» |
| `Subtitle` | text | «Что в разделе и как его читать.» |
| `Show Subtitle` | boolean | вкл. |

**Токены.**

| Часть | Токен |
|---|---|
| Title | `persefona/heading-l` (32/40), `text-primary` |
| Subtitle | `persefona/body-m` (14/22), `text-secondary` |
| Шаг | `spacing-8` |

**Связи.** Используется в IslandBlock и TableChangelog.

---

## 5. IslandBlock

**Назначение.** Карточка одного раздела служебной страницы. Собирает
заголовок раздела, содержимое и строку «Для инженера». Строка нужна там,
где разработчику важны токены, свойства и ограничения.

**Уровень — Structural View.** Внутри HeaderSection и самостоятельная
область содержимого.

**Анатомия.**

```
IslandBlock (auto-layout ↓, шаг spacing-24, поля spacing-48)
 ├─ HeaderSection (экземпляр)
 ├─ Content     — шаг spacing-16; сейчас внутри текст-заглушка
 └─ Footer      — линия сверху, отступ spacing-16
     ├─ Label   «Для инженера»
     └─ Text
```

**Свойства.**

| Свойство | Тип | По умолчанию |
|---|---|---|
| `Show Footer` | boolean | вкл. |
| `Footer Text` | text | «Токены, свойства и ограничения, которые нужны при переносе в код.» |

Заголовок раздела меняют через свойства вложенного HeaderSection.

**Токены.**

| Часть | Токен |
|---|---|
| Фон | `bg-surface-main` |
| Рамка | `line-default` |
| Скругление | `radius-l` |
| Поля / шаг | `spacing-48` / `spacing-24` |
| Content, шаг | `spacing-16` |
| Footer | линия `line-default` сверху, отступ `spacing-16`, шаг `spacing-4` |
| Footer Label | `persefona/label-xs-caps` (11/16, 500, разрядка), `text-secondary` |
| Footer Text | `persefona/body-s` (13/20), `text-secondary` |

**Связи.** Внутри — HeaderSection. В Content кладут TableComparison,
TableChangelog, TokenRow, превью компонентов и текст.

---

## 6. TableCell

**Назначение.** Одна ячейка таблицы Kit. Из неё собираются TableComparison
и шапка TableChangelog. Отдельно, вне таблицы, не используется.

**Уровень — Surface View.** Внутри один текст в оболочке: фон, нижняя
граница и отступы.

**Анатомия.**

```
TableCell (auto-layout →)
 └─ Text
```

**Свойства.**

| Свойство | Тип | Значения | По умолчанию |
|---|---|---|---|
| `Variant` | variant | Header, Default, Before, After | Header |
| `Text` | text | — | «Значение» |

| Variant | Фон | Текст | Когда |
|---|---|---|---|
| Header | `bg-surface-muted` | `label-xs-caps`, `text-primary` | Шапка колонки |
| Default | `bg-surface-main` | `body-s`, `text-primary` | Обычная ячейка |
| Before | `bg-surface-main` | `body-s`, `text-secondary` | Колонка «было», визуально тише |
| After | `bg-surface-main` | `body-s`, `text-primary` | Колонка «стало» |

**Токены.**

| Часть | Токен |
|---|---|
| Отступы | `spacing-16` по горизонтали, `spacing-12` по вертикали |
| Граница | `line-default`, только снизу (1) |

**Связи.** Используется в TableComparison (все ячейки) и TableChangelog
(шапка, ячейки версии, даты и автора).

---

## 7. TableComparison

**Назначение.** Таблица «было | стало» и любые сравнения по колонкам:
параметр, старое значение, новое значение.

**Уровень — Structural View.** Строки из нескольких TableCell в общей
рамке со своим фоном и скруглением.

**Анатомия.**

```
TableComparison (auto-layout ↓)
 └─ Row × N (auto-layout →)
     └─ TableCell × M
```

Первая строка — ячейки Header, остальные — Default / Before / After.

**Свойства.** Своих свойств нет. Строку добавляют копированием строки,
колонку — копированием ячейки во всех строках. Текст и вариант меняют на
вложенных TableCell.

**Токены.**

| Часть | Токен |
|---|---|
| Фон | `bg-surface-main` |
| Рамка | `line-default` |
| Скругление | `radius-m` |

**Связи.** Внутри — TableCell. Ставится в Content карточки IslandBlock.

---

## 8. TableChangelog

**Назначение.** Образец таблицы чейнжлога, которую читает и дописывает
плагин Token Comparator (changelog-guide §5). Это заготовка, а не живой
компонент: её вставляют и **сразу отвязывают** (Detach instance), потому что
плагин работает только с фреймами.

**Уровень — Structural View (образец).** Внутри HeaderSection, TableCell и
BadgeChangelog.

**Анатомия.** Имена слоёв со звёздочкой — контракт плагина, их не
переименовывают.

```
TableChangelog (auto-layout ↓, шаг spacing-24)
 ├─ HeaderSection (экземпляр)
 └─ Table — рамка
     ├─ Table Header — TableCell Header × 4: Версия | Список изменений | Дата | Автор
     └─ Changelog Table Body *
         └─ Changes Row * × N
             ├─ TableCell        — версия
             ├─ Changes Cell     — шаг spacing-8
             │   ├─ __Changelog Badge *   (BadgeChangelog)
             │   ├─ Description
             │   ├─ Details
             │   ├─ {separator} *         между записями
             │   └─ …следующая запись
             ├─ TableCell        — дата
             └─ TableCell        — автор
```

**Свойства.** Нет: после отвязки это фреймы.

**Токены.**

| Часть | Токен |
|---|---|
| Рамка таблицы | `bg-surface-main`, `line-default`, `radius-m` |
| Changes Cell | `bg-surface-main`, граница `line-default`, отступы `spacing-16` / `spacing-12`, шаг `spacing-8` |
| Шаг между заголовком и таблицей | `spacing-24` |

**Связи.** Внутри — HeaderSection, TableCell и BadgeChangelog. Читает и
пишет — Token Comparator (`writeUnpublishedRow`).

---

## 9. TokenRow

**Назначение.** Строка справочника токенов на витринах Kit: Colors, Space and
Radius, Typography, Shadows. В строке токен, его значение с образцом, ссылка
на core-токен и то, где его применять.

**Уровень — Surface View.** Внутри только текстовые примитивы и образец,
самостоятельных компонентов нет. Это граничный случай, см. «Открытые
вопросы».

**Анатомия.**

```
TokenRow (auto-layout →)
 ├─ Token   — Name + Path
 ├─ Value   — Swatch (Fill) + Value
 ├─ Core    — только Table=Semantic и Type
 └─ Usage   — Table=Core и Semantic
```

Все ячейки выровнены по верху, первая строка всех текстов стоит на одной
базовой линии. Поэтому у Usage отступ сверху `spacing-6`, а не `spacing-8`:
так компенсируется высота строки 20 против 16 у соседних текстов.

**Свойства.**

| Свойство | Тип | Значения | По умолчанию |
|---|---|---|---|
| `Table` | variant | Core, Semantic, Type | Core |
| `Swatch` | variant | Solid, Split, Bar, Corner, None, Shadow, Sample | Solid |
| `Zebra` | variant | Off, On | Off |
| `Name` | text | — | «graphite-50» |
| `Path` | text | — | «graphite/graphite-50» |
| `Value` | text | — | «#000000» |
| `Core` | text | — | «graphite-70» |
| `Usage` | text | — | «Где применять» |

Допустимые сочетания `Table × Swatch` (20 вариантов вместе с Zebra):

| Table | Колонки (ширина) | Swatch |
|---|---|---|
| Core | Token 272 · Value 232 · Usage 612 | Solid, Split, Bar, Corner, None |
| Semantic | Token 352 · Value 232 · Core 172 · Usage 360 | Solid, Split, Corner, Shadow |
| Type | Token 300 · Value 464 · Core 352 | Sample |

| Swatch | Что показывает |
|---|---|
| Solid | Заливку цвета. В экземпляре заливку Fill переопределяют переменной токена |
| Split | Полупрозрачный цвет на двух подложках. Левая половина — сырой `#000000`, это записанное исключение (#367 п. 5) |
| Bar | Отступ: полоса `bg-accent-vivid-main` высотой 16, ширина равна значению spacing |
| Corner | Радиус: слот `bg-surface-muted`, обводка `line-hover`, угол на переменной радиуса |
| Shadow | Тень на образце |
| Sample | Образец текстового стиля |
| None | Без образца |

**Токены.**

| Часть | Токен |
|---|---|
| Фон | `bg-surface-main` |
| Граница | `line-default`, только снизу |
| Отступы ячеек | `spacing-16` по горизонтали, `spacing-8` по вертикали (Usage сверху — `spacing-6`) |
| Name | `persefona/label-s`, `text-primary` |
| Path | `persefona/code-s`, `text-secondary` |
| Value | `persefona/code-s`, `text-primary` |
| Usage | `persefona/body-s`, `text-secondary` |
| Образец | `radius-s`, рамка `line-default` |

**Связи.** Используется на витринах токенов (файл Persefona Tokens). Шапку
таблицы над строками собирают из TableCell Header.

---

## Состояния

Все девять компонентов статичные: hover, pressed, focused, selected и
disabled у них нет. Интерактивна только ссылка How to Read в HeaderPage, и
это гиперссылка Figma, а не состояние компонента. Состояния понадобятся,
когда Kit придёт в интерфейс Presentbook и плагинов. Тогда их зададут по
`component-states-guide` вместе с объявлением стека.

## Доступность

В этой задаче не описывается. Доступность будет отдельной глобальной
задачей на токены и компоненты (решение PD 2026-10-22). Единственное, что
видно уже сейчас: Before в TableCell отличается от After только цветом
текста. Поэтому смысл колонки
должен быть в подписи шапки, а не только в цвете.

---

## Открытые вопросы

Здесь собрано то, что я увидел при снятии спеки. Ничего из этого в файле
не правил: Kit — зона Designer · Persefona, правила — Standards · Persefona.

| # | Что | Почему важно | Кому |
|---|---|---|---|
| 1 | В **IslandBlock** область Content — обычный фрейм с текстом-заглушкой, а не слот | Чтобы положить таблицу, приходится отвязывать экземпляр или править заглушку. Слот `content` (канон имён слотов) убрал бы это | Designer · Persefona |
| 2 | В **HeaderPage** ряд меток — четыре закреплённых Badge без свойств | Нельзя сделать две метки или пять, не отвязав экземпляр. Варианты: слот `header` или boolean на каждую метку | Designer · Persefona |
| 3 | В описаниях мастеров есть история решений: «(PD 2026-10-23)», «решение 7а», «#367 п. 5» | Описание читает дизайнер в панели Figma, история ему не нужна. Её место — чейнжлог и `changes/` | Standards · Persefona |
| 4 | В описании **TableComparison** — старое имя «Ячейка таблицы» | Компонент называется TableCell, поиск по старому имени ничего не найдёт | Designer · Persefona |
| 5 | Нейминг: Role `Header`, `Table`, `Token` нет в таблице Role-семей (ds-component-architecture-guide §9). У **TokenRow** роль стоит вторым словом (`Row`), а по формуле Role + Entity должна быть первой | Либо добавить семьи в §9, либо записать исключения, как с `Dock` у TabBar | Standards · Persefona |
| 6 | Уровень **TokenRow** граничный: формально Surface View (внутри только примитивы), по смыслу — строка таблицы, как ListRow (Structural View) | От уровня зависят правила слотов и раскладки в коде | Standards · Persefona |
| 7 | **TableChangelog** — образец «вставить и отвязать», а не компонент для экземпляров | Стоит записать в стандарте, что образцы-заготовки — допустимый вид мастера, и как их помечать | Standards · Persefona |
| 8 | Версии в описаниях нет | По гайду сборки первая строка описания — `<Имя> · не опубликовано` или версия. Если правило распространяется и на Kit, его нужно применить | Standards · Persefona |
