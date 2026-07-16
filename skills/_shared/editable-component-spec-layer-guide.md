---
destination: skills/_shared/
name: editable-component-spec-layer-guide
metadata:
  version: "1.0.0"
  owner: design-system-team
  platforms: [web]
description: >
  Гайд по editable-слою component spec pages в System Storybook: scope,
  гарантии, ограничения и следующие шаги. Описывает существующую
  web-реализацию (spec-editor.js, edit-биндинги, componentEdits) без
  проектирования новой архитектуры. Дополняет presentation framework
  spec-inspector.js и данные DS_COMPONENT_SPEC на страницах
  docs/storybook/components/.
---

# Editable Component Spec Layer — Guide — v1.0.0

> Статус: Stable · v1.0.0 · Web (System Storybook)

Гайд фиксирует статус и границы editable-слоя для component spec pages:
что уже гарантируется, что осознанно не гарантируется, и какие шаги
следуют дальше. Текст основан на verification pass (браузер + юнит-тесты
канала `componentEdits`); архитектуру слоя не переопределяет.

Связанные артефакты реализации: `docs/storybook/spec-editor.js`,
`docs/storybook/spec-inspector.js`, `docs/tokens/save-tokens.js`
(канал `componentEdits`).

---

## Editable component spec layer — статус и границы

### Scope

Архитектурный принцип. Editable-слой надстроен над component spec pages:
каждая страница классифицирована, а её поля делятся на editable
(прямое значение, token-backed, typography-роль) и derived.
Вложенные компоненты в scope не входят — их internals остаются
в границах собственных spec pages. Покрытие полное, а не пилотное:
обработаны все компонентные страницы, при этом «подключён» и
«имеет editable-поля» — разные состояния, и отсутствие биндингов
может быть осознанным решением, а не пропуском.

Web-специфика. `spec-editor.js` подключён ко всем 8 страницам
`docs/storybook/components/`: ButtonIcon (5 биндингов), StorybookButton (6),
Search (9), Badge (12), Chip (8), Card (12), Table (9). ColorSwatch подключён,
но намеренно имеет 0 биндингов и полностью derived — из-за захардкоженных
цветов (checker HEX под no-hardcode protocol), захардкоженных размеров и того,
что его canonical stylesheet к странице не подключён. Не охваченных страниц нет.

### Guarantees

Архитектурный принцип. Слой гарантирует single source of truth с
автоматической propagation: изменение editable-поля правит канонический
источник и расходится по потребителям без ручного поиска мест.
Token-backed поля меняются только через typed-выбор внутри совместимого
семейства токенов; несовместимые семейства недоступны структурно.
Derived-поля намеренно не редактируемы — это относится к вычисляемым
значениям (hit area), к internals вложенных компонентов и к
захардкоженным цветам, которые по протоколу нельзя править сырым значением.

Web-специфика. Правка применяется в CSSOM того же правила, из которого
читается значение, поэтому превью, сэмплы и резолвнутые значения
обновляются вживую немедленно. Apply & Save пишет изменение в канонический
CSS на диске, и это подтверждено обратимым round-trip на Chip:
`gap-xs → gap-s` дал единственную строку в diff и смену hash,
обратная правка вернула файл к исходному hash. Сохранение атомарно
в пределах запроса; побочно верификация вычищает stray-остатки,
доводя рабочее дерево до чистого состояния относительно HEAD.

### Limitations

Архитектурный принцип. Есть override/duplicate blind spot: любое правило,
чью декларацию перекрывает или дублирует другой источник, слой намеренно
оставляет derived, и это ручная разметка в данных страницы, а не авто-детект.
Один биндинг адресует одно правило — значение, размазанное по нескольким
источникам, не редактируется атомарно. Матчинг семейства выводится из
текущего токена поля, поэтому поле без исходного токена dropdown
не получает.

Web-специфика. Value-поля меняют сырое значение (например, `36px → 48px`)
и не конвертируют его в токен; захардкоженные цвета не редактируемы by design.
На практике blind spot проявляется как derived-пометки в данных страниц:
`border-radius` и focus outline через `docs-theme.css`, дублированные bg
у Badge и Table, hover/border у Card. У Table сюда же попадает row spacing/hover
как nested-scope TableRow.

### Next steps

Архитектурный принцип. Broader rollout: текущий scope закрыт, но при
добавлении новых component pages нужен тот же паттерн биндингов —
это кандидат на skill или шаблон. Rename layer остаётся отдельным:
переименование самих токенов идёт через rename-flow в token editor
и со spec-полями не связано — editable-слой меняет только значение
или ссылку поля. Better override resolution — вычислять winning rule
и определять перекрытые декларации автоматически, чтобы не держать
derived-разметку вручную.

Web-специфика. Точечные улучшения реализации: токенизация hardcoded value
прямо из inline-редактора (предложить или создать токен вместо правки
сырого значения) и поддержка мультиселекторных полей для значений,
живущих в нескольких stylesheet'ах. Авто-определение override через CSSOM —
это web-конкретизация принципа better override resolution.
