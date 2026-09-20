---
destination: skills/_shared/architecture/
name: component-pipeline-context
metadata:
  version: "0.1.0"
  kind: architecture
  owner: design-system-team
  status: draft
description: >
  Целевой пайплайн реализации компонентов из Figma: source of truth токенов,
  обязательные гейты, Presentbook sandbox, pending changes и release-based
  changelog/versioning. Описывает процесс, а не конкретный инструмент.
---

# Component Pipeline Context

## Назначение

Этот файл — persistent-контекст для Perplexity в Space **Design System Pipeline**.
Он фиксирует рабочий процесс, по которому агент реализует компоненты из Figma
в репозитории `aid` и Presentbook. Использовать его при подготовке промтов,
правил Cursor, планов и аудитов. Не считать этот файл готовой Cursor Rule:
на его основе будут подготовлены отдельные `.cursor/rules/*.mdc`, workflow-гайды
и машиночитаемые реестры.

---

> **Статус артефактов на 2026-09-20.** Часть перечисленных здесь файлов ещё не
> создана — они помечены пометкой «(не создан)». Документ описывает целевой
> пайплайн, а не текущее состояние репозитория. Проверено скриптом
> `scripts/check-docs.mjs`.


## Инструменты и роли

- **Principal Designer** принимает архитектурные, token- и release-решения.
- **Агент** — исполнитель работ в репозитории: читает Figma через MCP,
  создаёт и изменяет код, страницы Presentbook, JSON-реестры и документацию.
  Рабочий инструмент — Claude Code.

> **Смена инструмента (2026-09-20).** Документ писался под Cursor, поэтому
> ниже в процессных шагах сохранилось слово «Cursor» там, где речь идёт о
> роли исполнителя. Читать как «агент». Cursor остаётся легаси — отдельные
> правила в `.cursor/rules/` ещё используются, но source of truth процесса
> здесь, а не в них.

---

## Репозиторий и source of truth

Репозиторий: `aid`.

### Канонические источники

- `skills/_shared/` — канонические human-readable гайды ДС.
- `tokens/<collection>.json` — машиночитаемые данные токен-коллекций;
  эти же данные рендерятся в Presentbook и скачиваются разработчиками как JSON.
- Presentbook — web-витрина и review-среда токенов/компонентов.
- Figma — **reference input**, не source of truth для реализации.
- Git-репозиторий — source of truth принятых и закоммиченных изменений.

### Удалённые источники

Не ссылаться и не восстанавливать без явного решения:
- `.claude/`
- `perplexity-skills/`
- `skills/_shared/protocols/claude-skills-guide.md`
- `docs/design-system/tokens/` как ручное зеркало токен-гайдов

---

## Токены

### Текущий контракт

- Токены отображаются в сверстанных страницах Presentbook.
- Для каждой TokenTable есть скачивание одного универсального JSON.
- JSON одинаков для всех платформ; Swift/Kotlin/CSS-генерация — будущая
  отдельная задача (возможный Style Dictionary pipeline), не часть
  текущего component workflow.
- Коллекции могут иметь произвольные названия, группы и modes. Компоненты
  не должны хардкодить их семантику.
- Для одного внешнего продукта Figma использует modes `day` / `night`,
  внутренне временно применяется mapping `day → light`, `night → dark`.
  Исходные Figma-названия не переименовываются. Решение точечное,
  не становится глобальным правилом для других компаний/китов.

### Архитектурное правило

Целевая модель ДС: `Core → Semantic`.

- Компоненты используют Semantic-токены.
- Core-токены не используются в компонентах напрямую.
- Отдельный component-token layer не создаётся.
- Raw values (hex, px, opacity, radius и т.п.) не вставляются молча.

### Raw value policy

Raw value — не стандартная альтернатива токену. Он допускается только как
явно подтверждённое **temporary exception** с причиной, владельцем и условием
удаления/миграции. Позже registry исключений будет храниться в
docs/exceptions/raw-values.json (не создан).

---

## Component workflow

### Вход

Principal Designer даёт агенту ссылку на Figma. Агент использует Figma MCP,
затем сверяет визуальные свойства с опубликованными token JSON и существующими
компонентами в репозитории.

### Фаза 1 — Discovery (без кода)

Триггерный запрос: «Проанализируй компонент для реализации. Не пиши код до
прохождения composition и token coverage gate».

Агент обязан:

1. Прочитать Figma-фрейм через MCP.
2. Найти существующие компоненты и опубликованные token JSON.
3. Предложить уровень: `Item`, `Surface View`, `Structural View` или `Layout`.
4. Выявить composition dependencies: существующие части, возможные новые
   атомарные/переиспользуемые части, уникальные private details.
5. Сопоставить все визуальные свойства с Semantic-токенами.
6. Не создавать файлы и не писать реализацию до прохождения нужных гейтов.

### Composition gate

Срабатывает до реализации, только если есть неоднозначность.

Агент показывает:
- предлагаемый уровень и обоснование;
- существующие части, которые будут использованы;
- недостающую часть;
- варианты: создать новый reusable компонент / оставить private частью
  родителя / расширить существующий компонент;
- рекомендацию и trade-offs.

Агент **не создаёт новый атомарник автоматически**. Маленькая деталь не
становится Item/Surface View только потому, что её удобно вынести в файл.
Переиспользуемый компонент должен иметь самостоятельную роль и ожидаемую
повторяемость.

### Token coverage gate

Срабатывает до реализации, если хотя бы одно требуемое свойство Figma не
покрыто точным существующим Semantic-токеном.

Агент агрегирует все gaps в одну анкету, а не прерывает работу на каждом
свойстве. Для каждого gap показывает:
- свойство;
- значение из Figma;
- ближайший существующий Semantic-токен;
- оценку несоответствия;
- рекомендуемый вариант.

Варианты решения, в порядке приоритета:

A. Использовать существующий Semantic-токен, если отклонение допустимо.
B. Добавить новый Semantic-токен, если потребность системная.
C. Добавить Core + Semantic, если нужного базового значения нет и оно
   повторяемо.
D. Оформить temporary raw exception — только после явного согласия.

Добавление token/style должно подчиняться отдельному Cursor changelog gate,
но финальные версия и changelog не обновляются на этой стадии: создаётся
pending change item.

### Фаза 2 — Implementation

Начинается только после ответов Principal Designer на требуемые гейты.

Агент:
- создаёт утверждённые токены/исключения и pending change manifest;
- сначала создаёт новый atomic/reusable component, если он утверждён;
- затем собирает родительский компонент;
- применяет только одобренные token references;
- не создаёт компонентный слой токенов;
- создаёт/обновляет Presentbook sandbox компонента;
- не делает финальный changelog, version bump, commit или push без Release gate.

### Фаза 3 — Review sandbox

Каждый новый или существенно изменённый компонент обязан иметь полноценную
review-песочницу в Presentbook. Это не Storybook и не отдельный Storybook engine.

Рекомендуемый маршрут: `/components/<component-kebab-name>`.

Sandbox должен позволять Principal Designer проверять не только визуальное
сходство с Figma, а все corner cases:

- интерактивные controls для variant, size, state, label/content, slots и modes;
- state matrix для всех применимых состояний;
- edge cases: длинный/короткий текст, пустые слоты, экстремальные числа,
  multiline, truncation, overflow, min/max width;
- геометрия: padding, gap, radius, border, outline, elevation, touch target;
- все поддерживаемые mode/темы;
- a11y: keyboard focus, native semantics, Enter/Space для интерактивных частей;
- Token Inspector: `property → token reference → resolved value/mode`;
- список approved raw exceptions, если они есть.

Sandbox должен быть data-driven; не копировать вручную десятки экземпляров
компонента в JSX.

### Review gate

После sandbox агент показывает краткий review summary:
- путь sandbox;
- что реализовано;
- какие токены использованы/добавлены;
- какие pending changes накоплены;
- raw exceptions;
- открытые риски.

Principal Designer выбирает: approve / нужны правки / отклонить.

---

## Release workflow

### Главное правило

Version bump и финальный changelog происходят **не при каждом изменении**,
а перед явным согласованным release push.

Push boundary — не любой `git push` и не автоматическое событие. Это явная
команда Principal Designer, например: «Подготовь релиз текущего набора изменений».

### Pending changes

До release все системно значимые изменения сохраняются как pending manifests:

```text
changes/
  pending/
    <batch-id>.json
  released/
    <batch-id>.json
```

Один pending manifest содержит:
- затронутые компоненты и token collections;
- список изменений (`added`, `changed`, `fixed`, `removed`);
- semver impact каждого изменения (`major`, `minor`, `patch`);
- ссылки на sandbox;
- raw exceptions;
- review status.

### Release gate

По явной команде агент:

1. Собирает все pending changes с момента предыдущего release.
2. Группирует их по артефактам: token collection, component и т.д.
3. Для каждого артефакта определяет максимальный impact:
   `major > minor > patch`.
4. Предлагает версию и единый grouped changelog draft на артефакт.
5. Отдельно проверяет зависимости:
   major Core → синхронный major Semantic того же типа;
   breaking change дочернего компонента → проверка зависимых компонентов.
6. Ждёт явного подтверждения Principal Designer.
7. Только после подтверждения обновляет version/changelog, переносит manifest
   в `changes/released/`, создаёт commit и выполняет push.

### SemVer

Каждый артефакт версионируется независимо:
- `Colors/Semantic`;
- `Typography/Semantic`;
- отдельный компонент, например `ButtonIcon`;
- и т.д.

Правила:
- **MAJOR** — удаление/переименование токена или breaking API/structure.
- **MINOR** — новый токен, вариант, состояние, slot или компонент.
- **PATCH** — исправление значения/визуального дефекта без изменения контракта.

Использование существующего токена без изменения системы не создаёт
changelog entry. Temporary raw exception не повышает версию токен-артефакта,
но фиксируется в exception registry.

---

## Планируемые материалы Cursor

### Always-on Cursor Rules

- `.cursor/rules/ds-principal.mdc`
- `.cursor/rules/token-integrity.mdc`
- .cursor/rules/component-release-gate.mdc (не создан)
- .cursor/rules/figma-import.mdc (не создан)
- `.cursor/rules/git-push.mdc`

### Workflow and shared guides

- `skills/ds-component-build/component-build-workflow.md`
- skills/_shared/component-discovery-guide.md (не создан)
- skills/_shared/token-coverage-guide.md (не создан)
- skills/_shared/component-sandbox-guide.md (не создан)
- skills/_shared/release-bundle-guide.md (не создан)
- skills/_shared/raw-value-exceptions-guide.md (не создан)

### Existing shared sources to reference

- `skills/_shared/standards/token-rules.md`
- `skills/_shared/standards/core-color-tokens-guide.md`
- `skills/_shared/standards/semantic-color-tokens-guide.md`
- `skills/_shared/standards/core-space-tokens-guide.md`
- `skills/_shared/standards/semantic-space-tokens-guide.md`
- `skills/_shared/standards/core-typography-tokens-guide.md`
- `skills/_shared/standards/semantic-typography-tokens-guide.md`
- `skills/_shared/standards/ds-component-architecture-guide.md`
- `skills/_shared/standards/component-categories-guide.md`
- `skills/_shared/standards/component-states-guide.md`
- `skills/_shared/standards/anatomy-annotation-standard.md`
- `skills/_shared/architecture/editable-component-spec-layer-guide.md`
- `skills/_shared/standards/semver-guide.md`
- `skills/_shared/protocols/git-workflow.md`

### Planned machine-readable sources

```text
tokens/
  <collection>.json
  registry.json
  <collection>-changelog.json

components/
  registry.json
  changelog.json

changes/
  pending/
  released/

docs/exceptions/
  raw-values.json
```

### Planned Presentbook infrastructure

- `ComponentSandbox`
- `TokenInspector`
- component pages at `/components/<component-kebab-name>`
- existing TokenTable and ChangelogTable remain token review primitives

---

## Constraints and non-goals

- Do not use Storybook for component sandbox work; use Presentbook pages.
- Do not restore Claude Code-specific folders or instructions.
- Do not create a third component-token layer.
- Do not commit or push automatically during implementation.
- Do not treat a Figma value as a valid production token merely because it
  exists in the Figma frame.
- Do not create reusable atoms automatically without Principal Designer
  approval when there is a composition decision.
- Do not bump version/changelog for each iterative local change.

---

## Open decisions

These points are recommended but not yet implemented/confirmed in code:

1. Use `/components/<component-kebab-name>` as the Presentbook sandbox route.
2. Use an explicit Principal Designer command as the release boundary.
3. Component versions: new components start at `v1.0.0`; exact storage of
   component changelog (individual vs shared file) remains to be finalised.
4. tokens/registry.json (не создан) should be a small index to collection JSON files,
   not a duplicate of all token values.
5. components/registry.json (не создан) should index existing components, level, status,
   source path, sandbox route and version.

---

## Changelog

- **0.1.0** — initial context: component workflow, composition/token gates,
  Presentbook sandbox, pending changes and release-based versioning.
