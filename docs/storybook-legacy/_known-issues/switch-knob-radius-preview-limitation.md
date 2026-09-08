# Switch Knob — radius-preview off-size limitation

**Status:** known limitation (not a bug)  
**Component:** `docs/storybook/components/switch.html`  
**Section:** Guide Page «Скругления»  
**Related standard:** `skills/_shared/radius-preview-standard.md` §1

## Symptom

В секции «Скругления» запись **Knob** (`part: 'knob'`, `radius-full`) показывает
клон `.switch__knob` размером **16×16 px** (off-state), тогда как в живом сэмпле
при `aria-checked="true"` knob — **22×22 px** (on-state).

## Cause

`mountRadiusPreviews()` клонирует **только** DOM-узел part'а (`.switch__knob`),
без родительского `.switch`. Стили on-state заданы контекстным селектором:

```css
.switch[aria-checked="true"] .switch__knob {
  left: 22px;
  width: 22px;
  height: 22px;
}
```

Без родителя с `aria-checked="true"` клон остаётся в базовом off-размере.
Дуга (`resolveRadiusArcs()`) корректна относительно **фактически отрендеренного**
угла клона (8 px radius при 16 px knob), но не отражает on-state сэмпла.

## Resolution

Архитектурное ограничение подхода «клон одного part'а без соседа» — зафиксировано
в `radius-preview-standard.md` §1. Исправление не требуется, если принято показывать
part в его собственном базовом визуальном состоянии.

**Если понадобится on-state в превью:** клонировать минимальный контекст
(например, обёртку `.switch[aria-checked="true"]` + `.switch__knob`) — отдельная
задача с явным scope, не точечный патч под Switch.

## Do not

- Не патчить `mountRadiusPreviews()` только для Switch.
- Не вставлять SVG-дугу внутрь клона (нарушает §2 стандарта).
