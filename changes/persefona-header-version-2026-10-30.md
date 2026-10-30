# Шапка `readyfordev` — анкета component-gate: HeaderPage (версия), Badge (Size)

От: Designer · Persefona, 2026-10-30. Приёмка — Standards · Persefona. Куратор — PD.
Продукт: persefona. Номер задачи: нет — запрошу у Ops; работа по указанию Standards ·
Persefona (#537). Сборку начинаю только после номера и «принято».

Основание — `persefona-figma-pages` 0.14.0 (#537, 0ddd90c): §6.2 «Шапка компонента после
сборки» и §7.1 «Страница `readyfordev`». Решение PD 2026-10-30, п. 1 (дословно): «В шапке
страницы вместо "сборка" рядом с названием должен появиться крупный бейдж с номером
версии. Номер версии должен быть тапабельным и якорем отправлять к чейнжлогу этой
страницы». §6.2: если у `HeaderPage` нет места под бейдж версии рядом с заголовком, его не
собирают фреймом — lookup, потом component-gate.

Оба компонента — в Persefona Components `X8DoqKC0SKfxb8SoKboo3N`, версия 1.0.0 ещё не
выпущена (pending `component-persefona-1-blocks.json`). Поэтому правка — в ту же
pending-запись, без новой версии и без строки в чейнжлоге. В Figma ничего не менял.

Figma source: HeaderPage `5:77` (ключ `21df81e0…`), Badge `3:90` (ключ набора `685f952d…`).

## 1. Lookup

Снято через Plugin API 2026-10-30, только чтение.

### 1.1. HeaderPage 5:77 — места под версию нет

```
HeaderPage 5:77               вертикаль, 1216 FIXED, отступы spacing-48, шаг spacing-24
├─ Badge 61:268               слот, свойство Badge (SLOT), горизонталь, шаг spacing-8
├─ Header 5:70                вертикаль, FILL, шаг spacing-12
│  ├─ Cover Link 61:273       body-m, text-accent (Show Cover Link)
│  ├─ Title 5:71              display-l 48/56, text-primary, FILL — один текст на всю ширину
│  ├─ Subtitle 5:72           body-m, text-secondary
│  └─ How to Read 5:73        body-m, text-accent (Show How to Read)
└─ Contents 5:74              heading-s + body-s
```

Title растянут на всю ширину Header (FILL), рядом с ним ничего нет. Ряд меток скрыть
можно только переопределением видимости слоя в экземпляре: в панели свойств его нет, в
описании мастера тоже. Пустой слот без такого переопределения даёт отступ `spacing-24`
над Header.

### 1.2. Badge 3:90 — размера нет

Свойства: `Tone` (VARIANT: Neutral, Warning, Success, Error, Info, Vivid Soft, Vivid,
Accent), `Text` (TEXT). Один размер: `label-s` 12/16, отступы `spacing-4` / `spacing-8`,
высота 24, `radius-pill`. Рядом с `display-l` (строка 56) такая метка теряется.

### 1.3. Где стоят экземпляры

HeaderPage — 71 экземпляр в 9 файлах:

| Файл | Экземпляров | Где |
|---|---|---|
| Persefona Components | 11 | Cover 6:162 и 10 страниц зоны 2 |
| Persefona Tokens | 17 | Cover 4:87, 5 витрин, 5 на «👀 Colors · предложения», 6 в Archive |
| Persefona Icons | 1 | Cover 3:101 |
| Rider Components | 14 | сборки и аудиты зоны 3, в т. ч. `✅ Button Floating · construction` (1078:6468, 897:10495) |
| Rider Tokens | 7 | 7 витрин |
| Rider Icons | 1 | Icons 3954:126 |
| Driver Components | 15 | аудиты и сборки зоны 3 |
| Driver Icons | 1 | Icons 5608:63 |
| New Rider DEV | 4 | PRD audit, PRD idea, Tech audit, Tech idea |

Driver Tokens — 0. В New Rider DEV просмотрены только страницы аудитов и идей; снимок
«до» (§3 п. 1) снимаю по всему файлу, число может вырасти. Страниц
`· readyfordev` нет ни в одном файле — живых шапок, которые надо привести, нет.

Badge: экземпляры есть в этих файлах — в слотах шапок, внутри `BadgeChangelog`,
`TableCell Variant=Badge`, в мастерах и на страницах. Пробный подсчёт с фильтром по имени
слоя дал разные числа с подсчётом без фильтра, поэтому числа «до» здесь не привожу.
Считаю одним скриптом до и после (§3 п. 1): все экземпляры, чей мастер входит в набор с
ключом `685f952d…`, включая вложенные, по файлам и по варианту Tone × Size, с id мастера
варианта.

Дубля нет: крупной метки и строки «заголовок + метка» в Kit нет. `BadgeChangelog` —
другой компонент (вид изменения в таблице), версию не показывает.

## 2. Анкета component-gate

### 2.1. Badge — свойство Size (правка)

```
Component: Badge (3:90), правка
Figma source: X8DoqKC0SKfxb8SoKboo3N, 3:90
Change: новое свойство-вариант Size = Small | Large; Small — нынешние 8 вариантов
  (id прежние, к имени добавляется Size=Small), Large — 8 новых. Вариант по умолчанию —
  прежний (Tone=Neutral, теперь Tone=Neutral, Size=Small), стоит левым верхним в сетке
  набора; проверяю скриптом defaultVariant. Порядок свойств: Tone первым, Size вторым.
  В коде — prop size: sm | lg (naming-conventions §4), как Tone → tone.
Tokens required: Large — стиль heading-m (20/28, Google Sans Medium), отступы
  spacing-6 сверху/снизу и spacing-12 по бокам, radius-pill; цвета — те же пары
  bg/text, что у Small того же Tone. Новых токенов нет
Variants: Tone (8) × Size (2) = 16
Properties: Tone (VARIANT), Size (VARIANT), Text (TEXT)
Modes: light
Breaking: no — существующие экземпляры остаются Size=Small, id вариантов прежние
Proposed path: только Figma, sourcePath null
Product: persefona
Confidence: high — нужен в каждой шапке с этапа readyfordev
Naming exception: no
Architecture exception: no
Review at: n/a
Version: до 1.0.0 — правка pending component-persefona-1-blocks.json
```

Large: высота 28 + 2 × 6 = 40, рядом с заголовком 56 — по центру строки.

**Контраст Large — AA.** 20 px Medium по WCAG не «крупный текст» (нужно 24 px или 18,66
px жирным), поэтому порог 4,5:1. Пары те же, что у Small:

| Tone | Фон → текст | Контраст |
|---|---|---|
| Neutral | `bg-accent-status-neutral-main` → `text-neutral` | 5,24 |
| Warning | `bg-accent-status-warning-main` → `text-warning` | 5,50 |
| Success | `bg-accent-status-success-main` → `text-success` | 5,15 |
| Error | `bg-accent-status-error-main` → `text-error` | 5,80 |
| Info | `bg-accent-status-info-main` → `text-info` | 5,53 |
| Vivid Soft | `bg-accent-vivid-fade` → `text-accent-vivid` | 6,65 (в #378 — 6,66: округление) |
| Vivid | `bg-accent-vivid-main` → `text-inverse` | 7,72 |
| Accent | `bg-accent-main` → `text-inverse` | 13,92 |

Все 8 проходят. Цифры — по значениям переменных Tokens на 2026-10-30.

Новое описание набора Badge:

> Короткая метка статуса или категории — одно-два слова. Тон выбирают по смыслу:
> статусные — для состояния, Vivid — для цветного акцента, Accent — для главной метки
> страницы. Large — только версия рядом с заголовком шапки; в остальных местах — Small.

### 2.2. HeaderPage — строка заголовка с версией и переключатель меток (правка)

```
Component: HeaderPage (5:77), правка
Figma source: X8DoqKC0SKfxb8SoKboo3N, 5:77
Change 1: новый фрейм Title Row (горизонталь, FILL, перенос WRAP, шаг spacing-16,
  выравнивание по центру) на месте Title внутри Header; в нём Title (HUG, максимум —
  ширина строки) и Version — вложенный экземпляр Badge Size=Large, Tone=Vivid Soft
  (вопрос 2), текст по умолчанию «x.y.z» — заглушка, чтобы забытый номер был виден.
  Version — открытый вложенный экземпляр (expose nested instance): Text и Tone меняются
  прямо из шапки; Size в панели тоже виден, его не трогают — всегда Large.
  Title: autoResize WIDTH_AND_HEIGHT, maxWidth 1120 (1216 − 2 × spacing-48) — сырое
  число, токена ширины нет: отход, вопрос 6.
  Новое свойство Show Version (BOOLEAN, выкл.).
Change 2: новое свойство Show Badges (BOOLEAN, вкл.) — видимость слота Badge.
  Выключенный слот не даёт отступ над Header.
Tokens required: spacing-16 — шаг Title Row; остальное — Badge Large (§2.1). Новых нет
Variants: нет
Properties: Title, Subtitle, How to Read, Contents (TEXT); Show How to Read,
  Show Cover Link, Show Badges, Show Version (BOOLEAN); Badge (SLOT);
  Version (вложенный Badge: Text, Tone; Size не меняют)
Modes: light
Breaking: no по свойствам — новые переключатели по умолчанию дают прежний вид
  (Show Version выкл., Show Badges вкл.). Риск — переопределения Title, не связанные со
  свойством Title, при переносе слоя в Title Row; проверяет проба §3 п. 2
Proposed path: только Figma, sourcePath null
Product: persefona
Confidence: high — §6.2 требует бейдж у каждой шапки с этапа readyfordev
Naming exception: no
Architecture exception: yes — пересмотр принятого отхода badge 1..4
  (component-deviation-persefona-header-page-badge): контракт становится «0 при
  Show Badges выкл., иначе 1..4»; причина «нижняя граница — одна метка статуса»
  дополняется «кроме шапки readyfordev, где меток нет по §6.2». Тем же PR — actual и
  reason записи об отходе; Designer · Components — о контракте badge в спеке #381
Review at: release
Version: до 1.0.0 — правка pending component-persefona-1-blocks.json
```

```
HeaderPage                    вертикаль
├─ Badge                      слот (Show Badges)
├─ Header
│  ├─ Cover Link              «← Cover» (Show Cover Link)
│  ├─ Title Row               горизонталь, WRAP, шаг spacing-16, по центру
│  │  ├─ Title                display-l, HUG
│  │  └─ Version              Badge Size=Large, Tone=Vivid Soft (Show Version)
│  ├─ Subtitle
│  └─ How to Read
└─ Contents
```

Почему WRAP: у страниц зоны 3 заголовки бывают длинными («🔍 PRD audit · Главная»).
Если заголовок займёт всю ширину, версия уйдёт на следующую строку, а не за край
шапки. У readyfordev заголовок — имя компонента, он короткий. Выравнивание по центру
верно, пока заголовок в одну строку: при WRAP версия переносится раньше, чем сам
заголовок, — Title HUG до 1120, бейдж встаёт рядом только если помещается. Проверяю в
пробе на самом длинном заголовке из снимка.

**Шапка `readyfordev` из этой сборки** (§6.2, §7.1):

| Что | Как |
|---|---|
| Метки над заголовком | Show Badges — выкл. |
| Заголовок | Title = имя компонента |
| Версия | Show Version — вкл., Version Text = номер от инженера, гиперссылка на секцию `Changelog · <Компонент>` (§2.3) |
| Подзаголовок | Subtitle — одна-две фразы на языке дизайнера |
| ← Cover, содержание | как у остальных шапок, последний пункт — «Changelog →» |

Новое описание мастера HeaderPage:

> Шапка служебной страницы, первая в её первой секции: метки, ссылка на обложку,
> заголовок, описание, содержание. Меток от одной до четырёх, первая — статус. Заголовок
> совпадает с именем страницы без значка. С этапа readyfordev меток нет (Show Badges выкл.), заголовок — имя компонента, рядом —
> версия со ссылкой на чейнжлог.

### 2.3. Где живёт ссылка версии

Гиперссылка — на тексте `Text` вложенного экземпляра Version в экземпляре шапки, тип
«ссылка на узел» → секция `Changelog · <Компонент>` той же страницы. В мастере ссылки
нет: у каждой страницы своя секция.

Ссылки в экземплярах сбрасываются при замене мастера и при принятии обновления
библиотеки (#391: Contents и «← Cover»; 2026-10-24 — «← Cover» на пяти страницах Tokens).
Поэтому:

- снимок ссылок «до» (Cover Link, How to Read, Contents, Version) по всем 71 экземпляру —
  перед правкой мастера;
- после публикации и каждого принятия обновления — та же выборка «после», сброшенные
  ссылки ставлю заново по снимку;
- для readyfordev — проверка §7.1 п. 6 дополняется: у Version есть ссылка, она ведёт на
  `Changelog · <Компонент>` этой страницы, и номер в бейдже равен номеру в таблице
  чейнжлога.

Ссылку через свойство компонента не сделать: у TEXT-свойства Figma гиперссылки нет.
По той же причине ссылка, скорее всего, пропадает при смене номера через свойство Text:
текст заменяется целиком. Порядок — сначала номер, потом ссылка; после любой смены
номера ссылку ставят заново (проверяет проба §3 п. 2).

**Предложение к правилу** (меняет Standards · Persefona, не я): в §6.2 к сбрасываемым
ссылкам добавить Version; в §7.1 п. 6 и §9 — «у Version ссылка на `Changelog ·
<Компонент>` этой страницы, номер в бейдже = номеру в таблице». Ссылка ячейки версии в
таблице чейнжлога (§7.1 п. 5) — в ячейке `TableCell`, это экземпляр Kit: её ссылка тоже
сбрасывается при принятии обновления, проверять там же.

## 3. Как собираю и проверяю

1. **Снимок «до»** скриптом (`changes/persefona/snapshots/header-version/`): по каждому
   из 71 экземпляра HeaderPage — ключ мастера, Title, Subtitle, Contents, видимость
   переключателей, метки в слоте (текст, тон), все гиперссылки, высота; число
   экземпляров Badge по Tone в каждом файле.
2. **Проба на копии** мастера HeaderPage на Archive в Components и её экземпляре, как в
   #391: в экземпляре — свой Title, гиперссылки в Cover Link и Contents, две метки.
   Сценарии и условие остановки:
   - а) Title → Title Row: Title, метки и ссылки экземпляра на месте;
   - б) видимость узла SLOT привязывается к BOOLEAN Show Badges; выкл. — отступа нет;
   - в) Version: Text, Tone и ссылка в экземпляре переживают правку мастера; ссылка
     после смены номера через свойство — фиксирую, пропадает ли;
   - г) самый длинный Title из снимка: перенос версии раньше переноса заголовка.
   Любой из а–в **не прошёл** — останавливаюсь и пишу Standards · Persefona до правки
   мастера; г — меняю устройство Title Row вместе с ним. Копия после пробы удаляется.
3. **Badge**: переименовать 8 вариантов в `Tone=…, Size=Small` (id прежние), собрать 8
   `Size=Large`, Small — первыми в наборе. Проверка: 0 сырых значений, 16 вариантов,
   ключ набора прежний.
4. **HeaderPage**: Title Row, Version, Show Version, Show Badges, описания мастеров.
5. **Сверка в Components** (до публикации): 11 экземпляров HeaderPage и все Badge — по
   снимку «до», у всех Badge Size=Small, у всех шапок Show Version выкл. и Show Badges
   вкл., высоты прежние.
6. Снимки мастеров (Badge 16 вариантов, HeaderPage в двух видах: обычная шапка и шапка
   readyfordev на примере) → итог Standards · Persefona.
7. Публикует Components человек; обновление в остальных 8 файлах принимает человек.
   До этого — сверяю шапки Rider и Driver с доской «Активные» и предупреждаю Designer ·
   Components и авторов активных задач (Spinner AID-61, Divider AID-62, Button Floating
   и др.), как в #391 и #413. После — сверка п. 5 по всем экземплярам HeaderPage и по всем
   Badge во всех файлах (тот же вариант, Size=Small, число до = после) и восстановление
   сброшенных ссылок по снимку. В Rider и Driver ссылки восстанавливаю только в шапках.
8. Pending `component-persefona-1-blocks.json`: changeSummary и
   proposedChangelogEntry.description — Badge Size, у HeaderPage версия и переключатель
   меток; `component-deviation-persefona-header-page-badge.json` — actual и reason (§2.2).

Живые страницы `✅ … · readyfordev` не привожу — их пока нет; первую приводит
AI-инженер задачи по §7.1.

## 4. Вопросы

Все — Standards · Persefona.

1. **Стиль цифр версии.** У `code-s` описание «Версии, инлайн-код» — правило Kit
   говорит писать версии кодовым шрифтом. ★а — новый стиль `code-l` (Google Sans Code
   20/28) через token-change-gate: версия выглядит так же, как в таблицах, только
   крупно. б — `heading-m` (20/28 Medium): стиль есть, но тогда описание `code-s` надо
   сузить до «Версии в таблицах, инлайн-код». Контраст от стиля не зависит (§2.1).
2. **Тон версии по умолчанию.** ★а — Vivid Soft: бейдж читается как кликабельный, как
   ссылки `text-accent-vivid` «→» в аудите PRD. Минус: в той же шапке Cover Link и How
   to Read — `text-accent` (графит), ссылки двух цветов; у readyfordev How to Read
   выключен, остаётся «← Cover». б — Neutral: спокойнее, не отличается от меток статуса.
   в — Accent: описание Badge называет его «главной меткой страницы», но графит рядом с
   графитовым заголовком сливается. При а — описание Badge: «Accent — главная метка
   страницы, Vivid Soft Large — версия».
3. **Как прятать метки.** ★а — Show Badges (BOOLEAN) на слоте. б — переопределять
   видимость слоя в экземпляре: работает, но не видно в панели. в — удалять метки из
   слота: пустой слот оставляет отступ 24 над заголовком.
4. **Версия — вложенный экземпляр или слот.** ★а — вложенный экземпляр Badge
   (открытый): один бейдж, Text и Tone видны в панели шапки. б — второй слот: гибче,
   но при переводе фрейма в слот содержимое экземпляров терялось (проба #391), а
   свойства бейджа в слоте из панели шапки не видны.
5. **Перенос строки.** ★а — Title Row с WRAP. б — без переноса, Title FILL и версия
   справа у края шапки: версия уходит от заголовка, «рядом» не выполняется.
6. **maxWidth 1120 у Title.** ★а — сырое число как отход (токена ширины нет; ширина
   шапки 1216 тоже фиксирована). б — Title FILL внутри Title Row без WRAP — см. 5б.

## 5. Приёмка — 2026-10-30

Принято Standards · Persefona с правками, без повторной приёмки. Ответы §4: 1а — `code-l`
через token-change-gate (mono, 20/28, начертание 400 или 500 — по снимку рядом с
`display-l`; анкета до сборки Badge Large); 2а Vivid Soft; 3а; 4а; 5а; 6а — maxWidth 1120
отходом в pending с причиной. Отход badge 0..4 принят. Предложение §2.3 внесено в правило
(#537, 161c592: §6.2, §7.1 п. 6, §9).

Правки: П1 — в описании HeaderPage фраза про число меток осталась одна (сделано);
П2 — итог пробы §3 п. 2 в) про ссылку при смене номера записать сюда; П3 — номер задачи
от Ops до сборки.

Порядок: анкета `code-l` → номер → проба а–г → сборка → сверка §3 п. 5–6 Standards ·
Persefona. Rider и Driver до публикации Components не трогать.
