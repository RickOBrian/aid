# persefona-4 (AID-53, #385) — анкета component-gate: IslandBlock, HeaderPage, Banner

От: Designer · Persefona, 2026-10-23. Приёмка — Standards · Persefona. Куратор — PD.

Основание — ответы Standards · Persefona на вопросы §4 документа
`changes/persefona-4-content-2026-10-23.md` (PR #390, комментарий 2026-10-23):

- 2а — у IslandBlock содержимое становится слотом `content`;
- 3а — у HeaderPage ряд меток становится слотом `badge (repeatable, 1..4)`: имя и диапазон
  приняты, открыт только способ записать отход от канона (вопрос 3);
- 5 — у Banner остаётся Info («цитата или справка в гайде»), Error убирается до 1.0.0;
- 6а — у HeaderPage появляется отдельное свойство-ссылка «← Cover», How to Read остаётся
  по спеке #381.

Все три компонента — в Persefona Components `X8DoqKC0SKfxb8SoKboo3N`, версия 1.0.0 ещё не
выпущена (pending). Поэтому правки пишутся в те же pending-записи, без новой версии и без
строки в чейнжлоге. В Figma пока ничего не менял.

Figma source: Persefona Components `X8DoqKC0SKfxb8SoKboo3N` — IslandBlock `5:114`,
HeaderPage `5:77`, Banner `40:54`.

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
Figma source: X8DoqKC0SKfxb8SoKboo3N, 5:114
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
Version: до 1.0.0 — правка pending component-persefona-1-blocks.json (§5 п. 4)
```

Новое описание мастера IslandBlock:

> Карточка одного раздела служебной страницы: заголовок, содержимое в слоте и строка «Для
> инженера». Строку выключают, если разработчику в разделе нечего взять.

Отвязанные карточки остаются как есть: их замена на экземпляры — отдельная задача
(ответ 2а). Для гайда TabBar это территория Designer · Components, для Archive Tokens —
моя.

### 2.2. HeaderPage — слот `badge` и ссылка «← Cover» (правка)

```
Component: HeaderPage (5:77), правка
Figma source: X8DoqKC0SKfxb8SoKboo3N, 5:77
Change 1: фрейм Badges → слот. Свойство в Figma — Badge (SLOT), с заглавной, как остальные
  свойства Kit; контракт в спеке и отходе — badge (repeatable, 1..4), принят Standards ·
  Persefona (3а); слой остаётся Badges.
  preferredValues — набор Badge 3:90. По умолчанию в слоте две метки:
  «Принято» · Success и «Persefona» · Neutral (вопрос 1).
  Порядок меток — #362 §6.1–6.2 и таблица тонов persefona-4 §2 п. 9.
Change 2: новый слой Cover Link «← Cover» над Title, свойство Show Cover Link (BOOLEAN, вкл.);
  токены: стиль body-m, цвет text-accent, подчёркивание — как у How to Read.
  Текст в мастере постоянный; гиперссылку на шапку Cover ставят на экземпляре —
  у каждого файла свой узел (вопрос 2; переопределение ссылки проверяет проба §3 п. 2).
  How to Read — по спеке #381: «Как читать эту страницу →».
Tokens required: те же; новых нет
Variants: нет
Properties: Title, Subtitle, How to Read, Contents (TEXT); Show How to Read, Show Cover Link (BOOLEAN); Badge (SLOT)
Modes: light
Breaking: yes — для 25 экземпляров: метки переходят в слот, при провале пробы
  собираются заново по снимку (§3); до 1.0.0, новой версии не нужно
Proposed path: только Figma
Confidence: high — 25 экземпляров, на каждом 2–4 метки, у 15 ссылка на Cover идёт строкой How to Read
Naming exception: no
Architecture exception: yes — badge 1..4 при каноне Repeatable Slot 2..N (вопрос 3)
Review at: release
Version: до 1.0.0 — правка pending component-persefona-1-blocks.json (§5 п. 4)
```

```
HeaderPage                    вертикаль
├─ Badges                     слот, свойство Badge (badge 1..4), горизонталь — Badge
├─ Header
│  ├─ Cover Link              «← Cover» (Show Cover Link)
│  ├─ Title
│  ├─ Subtitle
│  └─ How to Read             «Как читать эту страницу →» (Show How to Read)
└─ Contents
```

Почему ссылка над заголовком — моё решение, правилом страниц не задано (вопрос 6):
«← Cover» — навигация назад, её ищут в начале шапки. How to Read — переход вперёд, внутрь
страницы, остаётся под описанием.

Новое описание мастера HeaderPage (лимит меток — словами, потому что Figma его не
проверяет, §3 п. 4):

> Шапка служебной страницы, первая в её первой секции: метки, ссылка на обложку,
> заголовок, описание, содержание. Меток от одной до четырёх, первая — статус. Заголовок
> совпадает с именем страницы без значка.

### 2.3. Banner — без Error (правка)

```
Component: Banner (40:54), правка
Figma source: X8DoqKC0SKfxb8SoKboo3N, 40:54
Change: удалить вариант Tone=Error (40:29). Набор: Info 40:22 | Warning 40:26 | Vivid Soft 40:32.
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
Version: до 1.0.0 — правка pending component-persefona-2-banner.json (§5 п. 4)
```

Новое описание мастера Banner (вопрос 4):

> Плашка в тексте гайда. Warning — ограничение инструмента, из-за которого нужно действие
> руками; Vivid Soft — одобренное исключение из стандарта; Info — цитата или справка в
> гайде. Заголовок — суть, текст — почему так и что делать. Не для статуса задачи.

Прежнее описание («Не для статуса задачи и не для обычной подсказки») противоречит
ответу 5: Info и есть справка.

## 3. Как переношу 25 экземпляров HeaderPage

Состав: 10 + 5 + 3 + 6 + 1 = 25 — 10 страниц Components и 5 шапок на страницах Tokens
(Colors ×2, Space and Radius, Typography, Shadows) переводятся на Cover Link; 3 Cover
(Components, Tokens, Icons); 6 шапок Archive Tokens; 1 — гайд TabBar 679:4217.

1. **Снимок «до»** по каждому экземпляру: видимые метки (текст, тон, порядок), Title,
   Subtitle, How to Read, Contents, видимость, гиперссылки.
2. **Проба на копии.** Слот меняют в мастере, и правка сразу доходит до всех экземпляров.
   Поэтому сначала — на временной копии мастера на странице Archive в Components и её
   экземпляре: в экземпляре переопределены тексты и тоны меток, одна метка скрыта, у How
   to Read стоит гиперссылка.
   - Проверяю: можно ли превратить фрейм `Badges` с вложенными экземплярами в слот
     напрямую и что станет с его содержимым (останется содержимым слота по умолчанию или
     пропадёт). Если напрямую нельзя — слот создаётся на месте фрейма, метки по умолчанию
     кладутся в него заново.
   - Сверяю экземпляр с его снимком по пяти признакам: текст меток, видимость, тон,
     порядок, гиперссылки.
   - Добавляю Cover Link и проверяю, что гиперссылку на узел можно поставить в экземпляре
     и она переживает обновление мастера.
   - **Прошла**, если все пять признаков совпали и ссылка Cover Link ставится в
     экземпляре. Тогда в каждом экземпляре удаляю из слота скрытые метки.
   - **Не прошла по меткам** — собираю метки в слоте каждого экземпляра заново по
     снимку. **Не ставится ссылка** — останавливаюсь и пишу Standards · Persefona до
     правки мастера: ссылку тогда не доказать без копии, вопрос 2 решается заново.
   - Копия и её экземпляр после пробы удаляются. Скрытых меток после переноса не
     остаётся.
3. **Ссылка на Cover.** У 15 экземпляров, где How to Read сейчас «← Cover» (10 страниц
   Components, 5 шапок Tokens), включаю Cover Link с гиперссылкой на шапку Cover этого
   файла; How to Read выключаю — только при ответе 5а. При 5б How to Read получает текст
   по умолчанию со ссылкой на правило. На трёх Cover — Show Cover Link выкл., How to Read
   остаётся ссылкой на правило. Archive Tokens (6 шапок, там есть и «← Обложка») — метки
   переносятся в слот механически, тексты и ссылки не правятся. TabBar 679:4217 — Cover
   Link выкл., How to Read как есть: у Rider Components своя обложка.
4. **Сверка «после»:** снимок совпадает с «до», кроме того, что меняется намеренно (п. 2,
   п. 3); у всех 25 экземпляров `mainComponent` прежний, ключ HeaderPage не меняется;
   отвязанных нет; в каждом слоте от одной до четырёх меток. Сверка разовая: границы
   1..4 Figma не проверяет (preferredValues только подсказывает), поэтому дальше это
   открытый риск — его закрывает только описание мастера (§2.2) и приёмка страниц.
5. Публикует Components человек; в Tokens, Icons и Rider Components обновление
   библиотеки принимает человек, затем повторяю сверку п. 4 в этих файлах.

Гайд TabBar (679:4217) — оболочка моя по #378, тексты — Designer · Components. Сообщу ему
до переноса.

## 4. Вопросы

Все — Standards · Persefona.

1. **Метки по умолчанию в слоте `badge`.** ★а — две: «Принято» · Success и «Persefona» ·
   Neutral, как на каждой странице зоны 2; тот, кто ставит шапку на страницу зоны 3,
   меняет первую и добавляет метку задачи. б — одна метка статуса.
2. **Ссылка на Cover.** ★а — только BOOLEAN Show Cover Link, текст «← Cover» в мастере
   постоянный: другого текста у этой ссылки нет (§2 п. 7 правил подписей). б — ещё и
   TEXT-свойство Cover Link.
3. **Как записать отход badge 1..4 от канона.** Слот и диапазон приняты (3а). В
   `component-standards` §7.5 Repeatable Slot — «2..N», повторение по данным; у HeaderPage
   нижняя граница — одна метка статуса, верхняя — ширина шапки. ★а — отход по
   component-gate §9: pending `component-deviation-persefona-header-page-badge` и блок
   `exceptions` во frontmatter спеки #381 (§5 п. 5), канон не правится; status
   `accepted`, reviewAt `release`. б — считать, что 1..4 канону не противоречит, без
   записи.
4. **Описание Banner** — текст в §2.3. ★а — принять.
5. **How to Read на 15 страницах без «как читать».** ★а — выключить (Show How to Read
   выкл.), пока у страницы нет такого раздела. б — оставить текст по умолчанию со
   ссылкой на правило; номер PR в текст макета не пишется.
6. **Место Cover Link.** ★а — над Title, первой строкой шапки после меток. б — рядом с
   How to Read, под описанием.

## 5. Что дальше

Принято Standards · Persefona 2026-10-23, §4 — все ★а. Правка приёмки: свойства-слоты в
Figma с заглавной — Content и Badge; контракт в спеке и отходе — строчными.


1. Standards · Persefona принимает §2 и отвечает на §4.
2. Сборка в Components: Banner без Error → IslandBlock со слотом → HeaderPage (проба §3
   п. 2, слот, Cover Link) → перенос 25 экземпляров по §3 → снимки на приёмку.
3. Описания мастеров IslandBlock, HeaderPage, Banner в Figma — текстом из §2.1–2.3.
4. Pending:
   - `component-persefona-1-blocks.json` — changeSummary: слот content у IslandBlock,
     слот badge (1..4) и Cover Link у HeaderPage; proposedChangelogEntry.description —
     с упоминанием слотов;
   - `component-persefona-2-banner.json` — changeSummary: Tone = Info | Warning | Vivid
     Soft, варианты 40:22, 40:26, 40:32, назначение под Info;
     proposedChangelogEntry.description — без Error.
5. При 3а — pending `component-deviation-persefona-header-page-badge.json` (exceptionType
   architecture, standard «Repeatable Slot 2..N», actual «badge 1..4», reason, status,
   reviewAt, pendingRef → `component-persefona-1-blocks.json`) и блок `exceptions` во
   frontmatter спеки #381 — моим PR после её мержа (в ветку Designer · Components не
   коммичу).
6. Правки `changes/persefona-4-content-2026-10-23.md`: §3.3 — строка Tone без Error,
   пример «Исключение · Error» в «Не так» заменить; §3.4 — снять временное правило «How to
   Read служит ссылкой на Cover», меток — слот badge; §3.6 — убрать «Пока Content не
   слот»; §4 — отметить, что вопросы 2, 3, 5, 6 закрыты этой анкетой.
7. Человек публикует Components и принимает обновление в Tokens, Icons и Rider Components.
8. Раздел «Наполнение» в спеке #381 — моим PR после её мержа, с этими правками.

## 6. Сборка — 2026-10-23

Persefona Components `X8DoqKC0SKfxb8SoKboo3N`. Ключи компонентов прежние: HeaderPage
`21df81e0…`, IslandBlock `0e644cfd…`, Banner `619f8973…`.

| Компонент | Что сделано | Узлы |
|---|---|---|
| Banner 40:54 | Вариант Tone=Error 40:29 удалён; Tone = Info \| Warning \| Vivid Soft; описание по §2.3. Содержание страницы Banner — без Error | 40:22, 40:26, 40:32 |
| IslandBlock 5:114 | Фрейм Content → слот, свойство `Content` (SLOT); шаг `spacing-16` перенесён, заглушка — содержимое по умолчанию; описание по §2.1 | слот 61:266 |
| HeaderPage 5:77 | Фрейм Badges → слот, свойство `Badge` (SLOT), preferredValues — Badge 3:90, по умолчанию «Принято» · Success и «Persefona» · Neutral; шаги `spacing-*` перенесены. Cover Link «← Cover» над Title — `persefona/body-m`, `text/text-accent`, свойство Show Cover Link (вкл.); описание по §2.2 | слот 61:268, Cover Link 61:273 |

Отличия от анкеты:

- **Слой слота называется как свойство** — `Badge`, а не `Badges`. В Figma имя слоя
  слота и имя свойства связаны: переименование одного меняет другое.
- **Cover Link без подчёркивания** — как How to Read: у How to Read подчёркивания нет,
  в §2.2 оно было указано ошибочно.

**Проба §3 п. 2** (копия мастера и её экземпляр на Archive, после пробы удалены):

| Проверка | Итог |
|---|---|
| Фрейм с экземплярами → слот напрямую | Нельзя: API даёт только `createSlot()`. Слот создаётся на месте фрейма, метки переносятся в него и становятся содержимым по умолчанию |
| Переопределения меток в экземпляре (текст, видимость, тон, порядок) | **Не переживают**: экземпляр показывает содержимое слота по умолчанию |
| Гиперссылка How to Read в экземпляре | Переживает |
| Гиперссылка Cover Link ставится в экземпляре и переживает правку мастера | Да |

Проба по меткам не прошла → метки каждого экземпляра собраны заново по снимку «до»
(`changes/persefona/snapshots/gate/headerpage-before.json`, 25 экземпляров). Ссылка
прошла → вопрос 2 не пересматривается.

**Перенос в Components — 11 из 25:**

- 10 страниц зоны 2 — метки «Принято» · Success, «Persefona» · Neutral (как в снимке);
  Cover Link вкл., гиперссылка на шапку Cover 6:162; Show How to Read выкл. (5а). До
  этого у «← Cover» в How to Read гиперссылки не было — теперь есть.
- Cover 6:162 — три метки по снимку, Show Cover Link выкл., How to Read как был.
- Сверка: в трёх мастерах 0 непривязанных заливок и обводок, 0 текстов без стиля;
  экземпляров HeaderPage в файле 11, IslandBlock 0.

**Ждёт публикации Components** (человек), затем — Tokens (12), Icons (1), Rider
Components (1): человек принимает обновление, я собираю метки по снимку и ставлю Cover
Link по §3 п. 3, сверка §3 п. 4.
