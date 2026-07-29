# ColorSwatch — missing storybook-colors.css, zero-size radius-preview

**Status:** open  
**Component:** `docs/storybook/components/color-swatch.html`  
**Section:** Guide Page «Скругления» (и, вероятно, anatomy stage)  
**Token affected:** `radius-s` (Swatch / `part: 'root'`)

## Symptom

`mountRadiusPreviews()` находит и клонирует `.color-swatch:not(.color-swatch--alpha)`,
но `getBoundingClientRect()` даёт **0×0**. `resolveRadiusArcs()` не рисует дугу
(`arcSize = 0`). Токен `radius-s` не демонстрируется.

## Cause

Стили `.color-swatch` (размер 32×32, `border-radius: var(--radius-s)`, border)
определены в `docs/storybook/storybook-colors.css`, но этот файл **не подключён**
в `<head>` `color-swatch.html`.

Текущие stylesheets на странице:

- `../../assets/style.css`
- `../../assets/docs-theme.css`
- `../storybook-color-tokens.css`
- `../storybook-layout.css`
- `../storybook-spec-inspector.css`
- `../guide-page.css`

`storybook-colors.css` отсутствует — элемент в `#spec-sample` / anatomyPreview
не имеет габаритов и radius даже до клонирования.

## Proposed fix

```html
<link rel="stylesheet" href="../storybook-colors.css">
```

Добавить в `<head>` `color-swatch.html` (рядом с остальными storybook-стилями).
Проверить регрессию: anatomy stage, секция «Скругления», spec-inspector swatches.

## Do not

- Не дублировать правила `.color-swatch` inline или в `guide-page.css`.
- Не менять production-код компонента — только presentbook-слой.
