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
- **Legacy size-таблицы без токена** (`button-text.html`,
  `counter-value.html` — записи `{size, value}` без `entry.token`,
  например `value: 'pill (9999px)'`) — задокументированное
  ограничение: у таких записей нет `entry.part` (в спеке этих
  страниц borders/radius не привязаны к `spec.parts`), поэтому
  `mountRadiusPreviews()` их не трогает, и они ВСЕГДА остаются на
  fallback-боксе — не временный недочёт, а стабильное поведение для
  этой категории данных.
- `renderRadius()` компенсирует отсутствие токена, пытаясь
  распарсить px из `entry.value` (`parseLegacyRadiusPx()` — первое
  `\d+px` в строке, покрывает и `'16px'`, и `'pill (9999px)'`) и
  выставляет `radiusStyle`/`data-resolve-radius` на fallback-бокс
  напрямую — только у fallback-бокса, реального клона это не
  касается (тот получает border-radius от собственного production
  CSS-класса).

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
