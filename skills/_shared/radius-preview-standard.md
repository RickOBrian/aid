---
destination: skills/_shared/
name: radius-preview-standard
---

# Стандарт radius-preview (Guide Page «Скругления»)

Не относится к anatomy halo/anchor/callout (см.
anatomy-annotation-standard.md — тот файл ограничен строго
логикой аннотации anatomy-стейджа). Это отдельная статичная
демонстрационная секция Guide Page, рисующая quarter-circle дугу
поверх превью каждого radius-токена (`renderRadius()` /
`cornerRadius()` в guide-page.js / measure-agents.js).

Превью — либо реальный клон DOM-узла компонента (предпочтительно,
см. §1), либо нейтральный fallback-бокс 72×56 (см. §1.1, только
когда реального клона нет). Дуга в обоих случаях рисуется ОДНИМ
общим механизмом — SVG `<path>`, не CSS border-трюком (см. §2).

## 1. Превью = реальный клон компонента (mountRadiusPreviews)

- `mountRadiusPreviews(container, sample, parts)` в
  measure-agents.js клонирует настоящий DOM-узел компонента внутрь
  `.ds-agent-radius__preview[data-radius-part]`, заменяя нейтральный
  fallback-бокс — дуга должна показывать реальную форму компонента
  (pill Switch, скруглённая Card, …), а не абстрактный прямоугольник.
- `data-radius-part` — id из **`DS_COMPONENT_SPEC.parts`**
  (engineering-audit namespace, тот же, на который ссылается
  `aspects.borders[].part`), НЕ id из `guide.anatomy` (namespace
  визуальной легенды anatomy-стейджа) — эти два списка частей у
  некоторых компонентов называют один и тот же узел по-разному
  (например `root` в spec.parts vs `container` в guide.anatomy).
  `deriveRadius()` в guide-page.js прокидывает `entry.part` без
  переименования.
- Порядок lookup в `mountRadiusPreviews()`:
  1. `DS_COMPONENT_SPEC.parts.find(p => p.id === partId).selector`
     — основной путь; `spec.parts` всегда содержит запись `root` с
     реальным selector'ом (см. любой `*.html` компонент), поэтому
     `root` НЕ требует особого случая — резолвится тем же кодом, что
     и любой другой part.
  2. Если совпадения нет и `partId === 'root'` —
     `sample.firstElementChild || sample` (запасной вариант для
     сэмпла, собранного без соответствующей записи в `spec.parts`).
  3. Если совпадения всё ещё нет — fallback на
     `guide.anatomy`-namespace (`parts.find(p => p.id === partId)`,
     аргумент `parts` в `mountRadiusPreviews`) — на случай, если
     часть определена только там.
  4. Ничего не найдено → превью остаётся нейтральным fallback-боксом
     (см. §1.1) — не ошибка, а штатная деградация.
- Клонированный узел получает класс `.ds-agent-radius__clone`;
  `.ds-agent-radius__preview` — класс `--real` (сбрасывает
  собственный border/background/72×56 у fallback-бокса, чтобы
  показать форму настоящего компонента без обёртки).
- Клон — не тот же самый живой DOM-узел, поэтому CSS-правила,
  зависящие от **соседнего** узла (например
  `.switch[aria-checked="true"] .switch__knob`), не сработают при
  клонировании ОДНОГО дочернего part'а (`knob`) без его родителя
  (`.switch`) — клон покажет part в его собственном базовом
  визуальном состоянии, не в контекстном состоянии соседа. Это
  документированное ограничение подхода "клон одного part'а", не
  баг резолвера.

### 1.1. Fallback-бокс (когда реального клона нет)

- Нейтральный бокс 72×56, `border: 2px solid var(--line-default)`,
  `background: var(--bg-card-main)` — используется, когда
  `mountRadiusPreviews()` не находит DOM-узел (нет `data-radius-part`
  на превью вовсе — легacy-записи, см. ниже — или lookup не дал
  результата).
- **Legacy size-таблицы без токена** (`{size, value}` без
  `entry.token`, например `value: 'pill (9999px)'`,
  `value: '16px'`) — сам факт отсутствия `entry.token` НЕ обязателен
  к fallback-боксу: `entry.part` (не `entry.token`) — вот что решает,
  клонировать реальный узел или нет (см. §1). `deriveRadius()`
  проставляет `entry.part` автоматически из `spec.aspects.borders`,
  но `guide.radius`, заданный вручную в `DS_COMPONENT_GUIDE` (а не
  выведенный через `deriveRadius()`), может дописать `entry.part`
  вручную сам — `renderRadius()` прокидывает его как есть
  (`radiusPart: entry.part || ''`), независимо от того, откуда взялся
  массив. Если у компонента при этом есть валидный
  `DS_COMPONENT_SPEC.parts` с нужным id — клон работает даже для
  ручной legacy-таблицы (пример: `counter-value.html`, обе строки
  `{size, value}` вручную помечены `part: 'container'` → реальный
  клон `.scv`).
- **Fallback навсегда, а не временно — только когда клонировать
  физически нечего**, то есть `DS_COMPONENT_SPEC` для страницы вообще
  не определён — задокументированное ограничение именно этой
  категории, не «legacy без token» само по себе.
- **Per-row sample override (`entry.sample` → `sampleHtml` →
  `data-radius-sample-html`)** — legacy size-таблицы (`button-text.html`,
  `counter-value.html`) перечисляют НЕСКОЛЬКО размерных вариантов одного
  и того же `part` (Large/Medium/Small/Tiny, все `part: 'root'`), а
  `mountRadiusPreviews()` получает ОДИН общий `sample` на всю страницу
  (обычно = anatomyPreview, всегда одного конкретного размера). Без
  override каждая строка клонирует один и тот же узел вне зависимости от
  своего лейбла — арка "Tiny — pill (9999px)" рисовала бы скругление
  Large-инстанса. Каждая строка обязана передавать `entry.sample` — HTML
  своего собственного узла (`<button class="sbt sbt--primary sbt--tiny">…`,
  `<span class="scv scv--small">…`) — `cornerRadius()` кладёт его в
  `data-radius-sample-html`, `mountRadiusPreviews()` парсит его в
  приватный detached wrapper для ЭТОЙ строки вместо общего `sample`, лукап
  `spec.parts`/`anatomy.parts` работает по нему как обычно.
- **Источник разметки размера — общий реестр `guide.sizeSamples`, не
  строка внутри radius-таблицы.** `renderRadius()` резолвит
  `sampleHtml` как `entry.sample || sizeSampleHtml(guide, entry.size)`:
  штатный путь — реестр `guide.sizeSamples: [{ id, label, sample }]`,
  который читает и anatomy-стейдж (per-size анатомия с dropdown'ом
  размера, см. anatomy-annotation-standard.md §4.2). Разметка одного
  размера существует в одном месте на всю страницу — расхождение между
  «Скруглениями» и «Анатомией» структурно невозможно, и правка размера
  делается один раз. `entry.sample` остаётся поддержанным как локальный
  escape hatch для строки, чья разметка действительно не совпадает с
  реестровым инстансом — но это исключение, требующее объяснения в
  комментарии рядом.
- **Источник `entry.sample` — только фактически отрендеренный DOM, не
  аналогия с соседней строкой.** `entry.sample` пишется вручную как
  HTML-литерал в `DS_COMPONENT_GUIDE`, поэтому ничего не мешает написать
  структурно правдоподобную, но неполную разметку — компилятора/линтера,
  сверяющего её с реальным компонентом, нет. Обязательный источник —
  outerHTML реального узла этого конкретного size/variant, скопированный
  через devtools (или взятый из live-рендерера той же страницы, если он
  есть — `renderMatrix()`/`renderStates()` и т.п.), а не написанный по
  памяти или скопированный с другого варианта с заменой класса размера.
  Если у варианта есть обязательный дочерний элемент, которого нет у
  других вариантов (например trailing chevron только в Tiny у ButtonText,
  при этом leading icon недоступна именно в Tiny) — это ДОЛЖНО быть
  подтверждено сверкой с реальным DOM перед добавлением `sample`, а не
  предположено по аналогии с соседним размером. Прецедент: `sample` для
  Tiny в `button-text.html` был написан по аналогии с Large/Medium/Small
  и не содержал chevron, хотя `createButton()` добавляет его безусловно
  при `size === 'tiny'` — см. retroactive-проверку в git-истории этого
  файла.
- **Self-review перед коммитом `sample`-правок для multi-variant
  компонента** — сравнить количество и состав дочерних элементов между
  ВСЕМИ строками одного компонента (не смотреть на каждую строку
  изолированно): выписать список тегов/классов детей для каждой строки и
  сопоставить их. Если один вариант содержит элемент (icon/chevron/badge),
  которого нет в остальных — явно решить и зафиксировать (в PR-описании
  или соседнем комментарии), обоснованно это отсутствие/наличие
  (элемент действительно опциональный и намеренно опущен, например icon с
  `optional: true` в `spec.parts`) или является упущением (элемент
  безусловный для этого варианта в коде компонента, как chevron у Tiny) —
  просто скопировать паттерн соседней строки без этой сверки запрещено.
- `renderRadius()` компенсирует отсутствие токена (не отсутствие
  part), пытаясь распарсить px из `entry.value`
  (`parseLegacyRadiusPx()` — первое `\d+px` в строке, покрывает и
  `'16px'`, и `'pill (9999px)'`) и выставляет `radiusStyle`/
  `data-resolve-radius` на fallback-бокс напрямую — только у
  fallback-бокса (когда до него всё-таки дошло, то есть `entry.part`
  не задан или не резолвится), реального клона это не касается (тот
  получает border-radius от собственного production CSS-класса).

## 2. Геометрия дуги — единый SVG-рендерер для клона и fallback

- `.ds-agent-radius__arc` — не CSS-квадрат с двумя border'ами, а
  контейнер для SVG `<path>`, строящегося в JS. Один и тот же код
  (`resolveRadiusArcs()`) обслуживает и реальный клон, и
  fallback-бокс — арка не «плывёт» отдельно от реальной геометрии в
  обоих случаях.
- `target` = `.ds-agent-radius__clone` внутри превью, если он есть,
  иначе сам `.ds-agent-radius__preview` (fallback).
- `arcSize = min(realRadiusPx, min(target.width, target.height) / 2)`:
  - `realRadiusPx` — `getComputedStyle(target).borderTopRightRadius`
    (реальный px токена, читается с самого `target`, не с превью-
    обёртки — для реального клона это его собственный
    production-класс, для fallback — inline `border-radius`,
    выставленный `cornerRadius()`/`renderRadius()`).
  - Clamp — тот же, что применяет сам браузер, когда uniform-radius
    превышает половину меньшей стороны (`radius-full` на не
    квадратном target).
- Путь: `M (0,0) A arcSize arcSize 0 0 1 (arcSize,arcSize)` в
  локальных координатах `.ds-agent-radius__arc` (сам arc-контейнер
  размером `arcSize × arcSize`, позиционирован `position: absolute`
  внутри `.ds-agent-radius__preview` через `top`/`right`, вычисленные
  как разница между `target.getBoundingClientRect()` и
  `preview.getBoundingClientRect()`) — это ТОЧНАЯ кривая скругления
  верхне-правого угла `target`, не приблизительная форма.
- `.ds-agent-radius__arc-svg` — обязательно `display: block`. `<svg>`
  по умолчанию `display: inline` с `vertical-align: baseline`, поэтому
  внутри `.ds-agent-radius__arc` (который сам становится block из-за
  `position: absolute`, но остаётся inline-formatting-context для
  СВОЕГО контента) браузер резервирует под svg высоту строки, заданную
  амбиентным `line-height`, а не собственной высотой svg — рисунок
  визуально съезжает вниз от вычисленного `top` на разницу между
  `line-height` и высотой svg. На крупной арке (ButtonText, ~20px) гэп
  тонет в округлении и незаметен; на маленькой (CounterValue, полный
  круг, ~14px arc-бокс) гэп в несколько px читается как «арка не
  совпадает с компонентом». `display: block` убирает svg из
  inline-контекста — коробка всегда точно совпадает с host'ом
  независимо от шрифта.
- `.ds-agent-radius__arc` — всегда sibling клона внутри
  `.ds-agent-radius__preview`, НИКОГДА не вставляется внутрь самого
  клона: клон — точная копия production-узла, и трогать его
  `position`/детей ради арки нельзя (может сломать layout-контекст
  клона, например абсолютно позиционированных детей).
- Вычисляется `resolveRadiusArcs()` в measure-agents.js — одной
  функцией для ВСЕХ `.ds-agent-radius__preview[data-resolve-radius]`
  на странице, не инлайново на каждый вызов `cornerRadius()`.
  Запускается ПОСЛЕ `mountRadiusPreviews()` (клон должен уже быть
  в DOM — иначе арка посчитается по геометрии fallback-бокса вместо
  реального клона).

## 3. Обязательный вызов для новых страниц

- Любая страница, использующая `renderRadius()`/`cornerRadius()`
  (секция «Скругления»), ОБЯЗАНА вызвать (в этом порядке)
  `agents.mountRadiusPreviews(container, sample, parts)`, затем
  `agents.resolveRadiusArcs(container)` — после того, как
  отрендеренные секции вставлены в DOM.
- В `guide-page.js` это уже сделано централизовано — оба вызова в
  `render()` сразу после `container.innerHTML = ...` и
  `mountAnatomyStage(...)`, `mountRadiusPreviews` строго ПЕРЕД
  `resolveRadiusArcs`. Любой компонент, рендерящийся через
  `DSGuidePage.render()`, получает оба автоматически — отдельный
  вызов не нужен.
- Если radius-превью рендерится ВНЕ `DSGuidePage.render()`
  (кастомный рендер-пайплайн новой страницы/раздела) — оба вызова
  нужно добавить туда явно, в том же порядке. Без
  `mountRadiusPreviews` превью останется на generic fallback-боксе
  даже если реальный DOM-узел доступен; без `resolveRadiusArcs` дуга
  не появится вовсе — оба случая регресс, не альтернативное
  допустимое поведение.
- Пересчёт статичный, один раз при инициализации страницы —
  hover/resize логика не нужна (в отличие от anatomy halo).

## 4. Запрещено

- Точечно инлайнить border-radius или геометрию дуги в HTML-шаблоне
  `cornerRadius()` вместо `resolveRadiusArcs()`.
- Оставлять `data-resolve-radius` на превью без последующего вызова
  `resolveRadiusArcs()` после вставки в DOM.
- Вызывать `resolveRadiusArcs()` до `mountRadiusPreviews()` (арка
  посчитается по fallback-геометрии, а не по реальному клону).
- Рисовать дугу CSS-приёмом (два `border` + `border-*-radius` на
  дочернем квадрате) — только SVG `<path>`, см. §2.
- Возвращать CSS `border-*-radius: inherit` на `.ds-agent-radius__arc`
  или на сам SVG-контейнер.
- Вставлять `.ds-agent-radius__arc`/SVG внутрь клона
  (`.ds-agent-radius__clone`) — только как sibling внутри
  `.ds-agent-radius__preview`, см. §2.
