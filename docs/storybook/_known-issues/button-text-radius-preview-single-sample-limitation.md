# ButtonText — radius-preview single-sample limitation

**Status:** known limitation (not a bug)  
**Component:** `docs/storybook/products/sutochno/components/button-text.html`  
**Section:** Guide Page «Скругления»  
**Related standard:** `skills/_shared/radius-preview-standard.md` §1  
**Related precedent:** `docs/storybook/_known-issues/switch-knob-radius-preview-limitation.md`

## Symptom

После добавления `window.DS_COMPONENT_SPEC` в `button-text.html`
(коммит `2f45a08`) секция
«Скругления» клонирует реальную кнопку вместо fallback-бокса 72×56 — но
`mountRadiusPreviews()` использует **один и тот же** DOM-сэмпл (`.sbt.sbt--large`
из `guide.anatomyPreview`) для всех 4 записей: **Large**, **Medium**, **Small**,
**Tiny**.

`getComputedStyle(clone).borderTopRightRadius` у всех 4 превью равен **16px**
(значение Large), тогда как подписи в `guide.radius` указывают:

| Запись | Подпись (`guide.radius`) | Фактический `cloneRadius` на превью |
|---|---|---|
| Large | 16px | 16px ✓ |
| Medium | 12px | 16px ✗ |
| Small | 12px | 16px ✗ |
| Tiny | pill (9999px) | 16px ✗ |

Визуальный радиус на скрине не совпадает с подписанным значением для **3 из 4**
записей. Дуга (`resolveRadiusArcs()`) корректна относительно **фактически
отрендеренного** угла клона (16 px), но не отражает per-size radius из
legacy-таблицы.

## Cause

Presentbook-страница `button-text.html` рендерит для anatomy-демонстрации
**один** живой инстанс кнопки — Large (`anatomyPreview`: `.sbt.sbt--primary
.sbt--large`). Отдельных DOM-узлов для Medium / Small / Tiny на странице нет.

`mountRadiusPreviews()` клонирует найденный узел по `spec.parts` / `entry.part`
(`root` → `.sbt`) из этого единственного сэмпла **без variant-подстановки**
под каждый размер: все 4 radius-записи получают один и тот же клон с классом
`sbt--large` и его `border-radius: 16px`.

До добавления `DS_COMPONENT_SPEC` fallback-бокс хотя бы показывал корректное
значение radius через inline `radiusStyle` (`parseLegacyRadiusPx()`), пусть и
на обобщённом прямоугольнике — trade-off «реальная форма vs per-size radius».

## Resolution

Архитектурное ограничение подхода «клон единственного сэмпла без per-entry
variant» — тот же класс, что у Switch Knob (клон part'а без контекстного
состояния родителя), см. `switch-knob-radius-preview-limitation.md`.

Исправление не требуется, если принято показывать единственный доступный
инстанс как есть.

**Если понадобится per-size radius в превью:** одно из двух — отдельная задача
с явным scope, не точечный патч под ButtonText:

1. **Per-size сэмплы на странице** — добавить в presentbook-слой 4 живых
   инстанса кнопки (Large / Medium / Small / Tiny) и привязать каждую запись
   `guide.radius` к своему сэмплу (или расширить `mountRadiusPreviews()` /
   `radius-preview-standard.md` правилом «entry → конкретный selector/variant»).
2. **Variant-aware клонирование** — общее решение уровня
   `radius-preview-standard.md` / `measure-agents.js`: клон с подстановкой
   size-класса из метаданных `entry` (например `entry.size` → `.sbt--medium`),
   а не один DOM-узел на все записи.

## Do not

- Не патчить `mountRadiusPreviews()` только для ButtonText.
- Не подменять per-size radius inline на клоне (точечный обход, не устранение
  отсутствия сэмпла).
- Не вставлять SVG-дугу внутрь клона (нарушает §2 `radius-preview-standard.md`).
