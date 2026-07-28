---
destination: skills/_shared/
name: radius-preview-standard
---

# Стандарт radius-preview (Guide Page «Скругления»)

Не относится к anatomy halo/anchor/callout (см.
anatomy-annotation-standard.md — тот файл ограничен строго
логикой аннотации anatomy-стейджа). Это отдельная статичная
демонстрационная секция Guide Page, рисующая quarter-circle дугу
поверх нейтрального превью-бокса для каждого radius-токена
(`renderRadius()` / `cornerRadius()` в guide-page.js /
measure-agents.js).

## 1. Геометрия дуги

- `.ds-agent-radius__arc` — квадратный child-бокс размером
  `arcSize × arcSize` внутри `.ds-agent-radius__preview`, с
  `border-top` + `border-right` + `border-top-right-radius: arcSize`.
- `arcSize = min(realRadiusPx, min(previewBox.width, previewBox.height) / 2)`:
  - `realRadiusPx` — `getComputedStyle(previewEl).borderTopRightRadius`
    (реальный px-размер токена).
  - `previewBox` — `getBoundingClientRect()` самого превью-бокса
    (border-box, как он фактически отрендерен).
- Вычисляется `resolveRadiusArcs()` в measure-agents.js — одной
  функцией для ВСЕХ `.ds-agent-radius__preview[data-resolve-radius]`
  на странице, не инлайново на каждый вызов `cornerRadius()`.
- `width` / `height` / `border-top-right-radius` дуги всегда
  выставляются вместе, через inline style. Никогда — через CSS
  `border-*-radius: inherit`: это пулит несвязанный с реальными
  габаритами превью-бокса unclamped-радиус и ломает пропорции дуги.

## 2. Обязательный вызов для новых страниц

- Любая страница, использующая `renderRadius()`/`cornerRadius()`
  (секция «Скругления»), ОБЯЗАНА вызвать
  `agents.resolveRadiusArcs(container)` один раз после того, как
  отрендеренные секции вставлены в DOM.
- В `guide-page.js` это уже сделано централизовано — вызов в
  `render()` сразу после `container.innerHTML = ...` и
  `mountAnatomyStage(...)`. Любой компонент, рендерящийся через
  `DSGuidePage.render()`, получает это автоматически — отдельный
  вызов не нужен.
- Если radius-превью рендерится ВНЕ `DSGuidePage.render()`
  (кастомный рендер-пайплайн новой страницы/раздела) — вызов
  `resolveRadiusArcs(container)` нужно добавить туда явно. Без
  него дуга останется в CSS-fallback (статичный 24×24 квадрат без
  border-radius), не совпадающий с реальным радиусом токена — это
  регресс, не альтернативное допустимое поведение.
- Пересчёт статичный, один раз при инициализации страницы —
  hover/resize логика не нужна (в отличие от anatomy halo).

## 3. Запрещено

- Точечно инлайнить border-radius дуги в HTML-шаблоне
  `cornerRadius()` вместо `resolveRadiusArcs()`.
- Оставлять `data-resolve-radius` на превью без последующего
  вызова `resolveRadiusArcs()` после вставки в DOM.
- Возвращать CSS `border-*-radius: inherit` на `.ds-agent-radius__arc`.
