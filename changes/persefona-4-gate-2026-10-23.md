# persefona-4 (AID-53, #385) — анкета component-gate: IslandBlock, HeaderPage, Banner

От: Designer · Persefona, 2026-10-23. Приёмка — Standards · Persefona. Куратор — PD.

Основание — ответы Standards · Persefona на вопросы §4 документа
`changes/persefona-4-content-2026-10-23.md` (PR #390, комментарий 2026-10-23):

- 2а — у IslandBlock содержимое становится слотом `content`;
- 3а — у HeaderPage ряд меток становится слотом `badge (repeatable, 1..4)`;
- 5 — у Banner остаётся Info («цитата или справка в гайде»), Error убирается до 1.0.0;
- 6а — у HeaderPage появляется отдельное свойство-ссылка «← Cover», How to Read остаётся
  по спеке #381.

Все три компонента — в Persefona Components `X8DoqKC0SKfxb8SoKboo3N`, версия 1.0.0 ещё не
выпущена (pending). Поэтому правки пишутся в те же pending-записи, без новой версии и без
строки в чейнжлоге. В Figma пока ничего не менял.

## 1. Lookup

Сняты через Plugin API 2026-10-23.

| Компонент | Сейчас | Где используется |
|---|---|---|
| `IslandBlock` 5:114 | `HeaderSection` → фрейм `Content` (текст-заглушка) → `Footer` (Show Footer, Footer Text) | Экземпляров **0** во всех файлах. 22 карточки отвязаны: 10 — блоки гайда TabBar (Rider Components 389:47), 12 — Archive в Persefona Tokens |
| `HeaderPage` 5:77 | фрейм `Badges` из четырёх закреплённых `Badge` → `Header` (Title, Subtitle, How to Read) → `Contents` | **25** экземпляров: Components — 11 (Cover + 10 страниц), Tokens — 12 (Cover, Colors ×2, Space and Radius, Typography, Shadows, Archive ×6), Icons — 1 (Cover), Rider Components — 1 (TabBar 679:4217). Лишние метки скрыты видимостью: удалить слой в экземпляре Figma не даёт |
| `Banner` 40:54 | Tone = Info 40:22 \| Warning 40:26 \| Error 40:29 \| Vivid Soft 40:32 | Error — **0** экземпляров (Components, Tokens, гайд TabBar); в коде портала Error нет. Info — цитата в гайдах Presentbook (#383 п. 13а). Warning и Vivid Soft — в гайде TabBar |

Дубля нет: слот в Kit уже есть у `IslandExample` (Stage), тот же механизм.
Случай для Error (Standards · Persefona, ответ 5): Designer · Components ответил «нет» —
в гайде TabBar только плашка «Обоснованное исключение» (673:4273, Vivid Soft), Error не
нужен ни там, ни в планах.

## 2. Анкета component-gate

### 2.1. IslandBlock — слот `content` (правка)

```
Component: IslandBlock (5:114), правка
Change: фрейм Content → слот Content (тип свойства SLOT), канон — content
  (ds-component-architecture-guide, «Слоты Structural View»); как Stage у IslandExample.
  В слот кладут таблицу, превью, текст — без отвязки карточки.
  Заглушка «Содержимое раздела…» остаётся содержимым слота по умолчанию.
Tokens required: те же — шаг и отступы Content не меняются
Variants: нет
Properties: HeaderSection (вложенный экземпляр), Content (SLOT), Show Footer (BOOLEAN), Footer Text (TEXT)
Modes: light
Breaking: no — экземпляров нет; до 1.0.0
Proposed path: только Figma, sourcePath null
Confidence: high — 22 отвязанные карточки, все ради содержимого
Naming exception: no
Architecture exception: no
Review at: n/a
Version: до 1.0.0 — правка pending component-persefona-1-blocks.json (changeSummary)
```

Отвязанные карточки остаются как есть: их замена на экземпляры — отдельная задача
(ответ 2а). Для гайда TabBar это территория Designer · Components, для Archive Tokens —
моя.

### 2.2. HeaderPage — слот `badge` и ссылка «← Cover» (правка)

```
Component: HeaderPage (5:77), правка
Change 1: фрейм Badges → слот Badges (свойство SLOT, контракт badge (repeatable, 1..4));
  preferredValues — набор Badge 3:90. По умолчанию в слоте две метки:
  «Принято» · Success и «Persefona» · Neutral (вопрос 1).
  Порядок меток — #362 §6.1–6.2 и таблица тонов persefona-4 §2 п. 9.
Change 2: новый слой Cover Link «← Cover» над Title, свойство Show Cover Link (BOOLEAN, вкл.);
  стиль и цвет — как у How to Read: body-m, text-accent, подчёркивание.
  Текст в мастере постоянный; гиперссылку на шапку Cover ставят на экземпляре —
  у каждого файла свой узел (вопрос 2).
  How to Read — по спеке #381: «Как читать эту страницу →».
Tokens required: те же; новых нет
Variants: нет
Properties: Title, Subtitle, How to Read, Contents (TEXT); Show How to Read, Show Cover Link (BOOLEAN); Badges (SLOT)
Modes: light
Breaking: no для макетов — до 1.0.0; 25 экземпляров переносятся по §3
Proposed path: только Figma
Confidence: high — 25 экземпляров, на каждом 2–4 метки, у 15 ссылка на Cover идёт строкой How to Read
Naming exception: no
Architecture exception: yes — диапазон 1..4 (вопрос 3)
Review at: release
Version: до 1.0.0 — правка pending component-persefona-1-blocks.json (changeSummary)
```

```
HeaderPage                    вертикаль
├─ Badges                     слот badge (1..4), горизонталь — Badge
├─ Header
│  ├─ Cover Link              «← Cover» (Show Cover Link)
│  ├─ Title
│  ├─ Subtitle
│  └─ How to Read             «Как читать эту страницу →» (Show How to Read)
└─ Contents
```

Почему ссылка над заголовком: по #362 §6.2 «← Cover» — навигация назад, её ищут в начале
шапки, как хлебную крошку. How to Read — переход вперёд, внутрь страницы, остаётся под
описанием.

### 2.3. Banner — без Error (правка)

```
Component: Banner (40:54), правка
Change: удалить вариант Tone=Error (40:29). Набор: Info | Warning | Vivid Soft.
  Описание мастера уточняется под Info (ниже).
Tokens required: те же; bg-accent-status-error-main и text-error в Banner больше не нужны
  (у Badge и в тексте они остаются)
Variants: Tone=Info|Warning|Vivid Soft
Properties: Title (TEXT), Text (TEXT)
Modes: light
Breaking: no — экземпляров Error нет; до 1.0.0
Proposed path: только Figma
Confidence: high
Naming exception: no
Architecture exception: no
Review at: n/a
Version: до 1.0.0 — правка pending component-persefona-2-banner.json (changeSummary, proposedChangelogEntry)
```

Новое описание мастера Banner (вопрос 4):

> Плашка в тексте гайда. Warning — ограничение инструмента, из-за которого нужно действие
> руками; Vivid Soft — одобренное исключение из стандарта; Info — цитата или справка.
> Заголовок — суть, текст — почему так и что делать. Не для статуса задачи.

Прежнее описание («Не для статуса задачи и не для обычной подсказки») противоречит
ответу 5: Info и есть справка. Строку Tone в §3.3 persefona-4 и раздел «Наполнение»
спеки поправлю тем же текстом.

## 3. Как переношу 25 экземпляров HeaderPage

1. **Снимок «до»** по каждому экземпляру: видимые метки (текст, тон, порядок), Title,
   Subtitle, How to Read, Contents, видимость, гиперссылки.
2. **Проба на копии.** Слот меняют в мастере, и правка сразу доходит до всех экземпляров.
   Поэтому сначала — на временной копии мастера на странице Archive в Components: её
   экземпляр с переопределёнными и скрытыми метками, затем `Badges` → слот, проверка,
   переживают ли переопределения. Копия и её экземпляр после пробы удаляются. Если
   переопределения переживают — в каждом экземпляре удаляю из слота скрытые метки. Если
   нет — собираю метки в слоте каждого экземпляра заново по снимку. В обоих случаях
   скрытых меток после переноса не остаётся.
3. **Ссылка на Cover:** где How to Read сейчас «← Cover» (10 страниц Components, 5 шапок
   на страницах Tokens), включаю Cover Link с гиперссылкой на шапку Cover этого файла,
   How to Read выключаю, пока у страницы нет «как читать» (вопрос 5). На трёх Cover —
   Show Cover Link выкл., How to Read остаётся ссылкой на правило. Archive Tokens (6 шапок,
   там есть и «← Обложка») — только перенос меток в слот, тексты и ссылки как были: архив
   не редактируют. TabBar 679:4217 — Cover Link выкл., How to Read как есть: у Rider
   Components своя обложка.
4. **Сверка «после»:** снимок совпадает с «до», кроме того, что меняется намеренно (п. 2,
   п. 3); у всех 25 экземпляров `mainComponent` прежний, ключ HeaderPage не меняется;
   отвязанных нет.
5. Публикует Components человек; в Tokens, Icons и Rider Components обновление
   библиотеки принимает человек, затем повторяю сверку п. 4 в этих файлах.

Гайд TabBar (679:4217) — оболочка моя по #378, тексты — Designer · Components. Сообщу ему
до переноса.

## 4. Вопросы

1. **Метки по умолчанию в слоте `badge`.** ★а — две: «Принято» · Success и «Persefona» ·
   Neutral, как на каждой странице зоны 2; тот, кто ставит шапку на страницу зоны 3,
   меняет первую и добавляет метку задачи. б — одна метка статуса.
2. **Ссылка на Cover.** ★а — только BOOLEAN Show Cover Link, текст «← Cover» в мастере
   постоянный: другого текста у этой ссылки нет (§2 п. 7 правил подписей). б — ещё и
   TEXT-свойство Cover Link.
3. **Диапазон 1..4 и канон.** В `component-standards` §7.5 Repeatable Slot — «2..N», то
   есть повторение по данным. У HeaderPage меток одна-четыре, и предел задаёт дизайн,
   а не данные. ★а — записать отход: Architecture exception: yes, «badge 1..4: нижняя
   граница — одна метка статуса, верхняя — ширина шапки», Review at: release. б — считать,
   что 1..4 канону не противоречит, без отхода. Если а — кому записать отход в канон: вам
   или через Standards. Ограничение 4 Figma не проверяет (preferredValues только
   подсказывает), поэтому его проверяет сверка (§3 п. 4).
4. **Описание Banner** — текст в §2.3. ★а — принять.
5. **How to Read на страницах без «как читать».** ★а — выключить (Show How to Read
   выкл.), пока у страницы нет такого раздела. б — оставить текст по умолчанию со
   ссылкой на правило #362.

## 5. Что дальше

1. Standards · Persefona принимает §2 и отвечает на §4.
2. Сборка в Components: Banner без Error → IslandBlock со слотом → HeaderPage (слот,
   Cover Link) → перенос 25 экземпляров по §3 → pending → снимки на приёмку.
3. Человек публикует Components и принимает обновление в Tokens, Icons и Rider Components.
4. Раздел «Наполнение» в спеке #381 — моим PR после её мержа, с этими правками.
