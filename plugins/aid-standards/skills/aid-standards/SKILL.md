---
name: aid-standards
description: >
  Стандарты дизайн-системы AID (продукты Driver, Rider): вход перед любой
  работой с токенами, цветами, отступами, радиусами, типографикой, иконками,
  компонентами, макетами Figma, гайдами, Presentbook, changelog и релизом —
  на React, SwiftUI или Compose. Даёт три запрета, таблицу гейтов по задаче,
  реестр стандартов, Figma-файлы продуктов и значения токенов. Вызывать в
  начале такой задачи, до первого значения или компонента в коде.
---

# Стандарты AID

Источник — репозиторий `RickOBrian/aid`, ветка `main`. Плагин несёт его
стандарты как есть: версия плагина — SHA коммита в `main`, обновляется
вместе с ним.

## Как читать пути

Документы стандартов пишут пути **от корня репозитория AID**
(`skills/_shared/...`, `products/<id>/product.json`). В плагине корень
репозитория AID — это

```
${CLAUDE_PLUGIN_ROOT}/repo/
```

Любой путь из гейта, стандарта или скилла `ds-*` читать как
`${CLAUDE_PLUGIN_ROOT}/repo/<путь>`. Путь из документа, которого там нет
(например `changes/`, `scripts/`, `docs/hub/` кроме `STANDARDS-WORK.md`), —
это внутренняя кухня AID: в продуктовом репозитории его не создавать, а
сказать об этом явно.

Пути проекта, в котором идёт работа (код продукта), — как обычно, от его
корня. Плагин только читается: файлы в `${CLAUDE_PLUGIN_ROOT}` не править —
кэш перезаписывается при обновлении.

## Три запрета — всегда, без чтения файлов

- не создавать компонент молча — сначала lookup и предложение;
- не подставлять значение без токена — сначала lookup, пробелы в одну анкету;
- не писать версию и changelog вне границы релиза.

## Гейты — прочитать до работы, а не после

Полная таблица и термины — `repo/docs/hub/STANDARDS-WORK.md`. Коротко:

| Когда | Протокол (от `repo/`) |
|---|---|
| Любая работа с токенами, компонентами, Figma, changelog, релизом | `skills/_shared/protocols/gates/product-context.md` |
| Нужно значение цвета, отступа, радиуса, типографики | `skills/_shared/protocols/gates/token-integrity.md` |
| Создать, изменить или собрать компонент | `skills/_shared/protocols/gates/component-gate.md` |
| Добавить, изменить или удалить токен либо стиль | `skills/_shared/protocols/gates/token-change-gate.md` |
| Аудит токенов, компонентов, чужой библиотеки | `skills/_shared/protocols/gates/audit-gate.md` |
| Релиз: версия, changelog | `skills/_shared/protocols/gates/release-gate.md` |

Базовые правила по задаче: токены — `skills/_shared/standards/token-rules.md`,
код компонента на React / SwiftUI / Compose —
`skills/_shared/standards/platforms.md`, имена —
`skills/_shared/standards/naming-conventions.md`.

## Где что лежит

| Что | Путь от `repo/` |
|---|---|
| Продукты, их статусы, папки Figma (`figmaFolders`) | `products/registry.json` |
| Продукт: платформы, рабочие Figma-файлы (`figmaFiles`), где значения токенов (`tokenDataFiles`) | `products/<id>/product.json` |
| Значения токенов Driver | `pages/aid-portal/*Data.ts`, `pages/aid-portal/data.ts` (цвета) |
| Значения токенов Rider | `pages/aid-portal/products/rider/*Data.ts` |
| История токенов | `tokens/<product>-<collection>-changelog.json` |
| Реестр компонентов | `pages/aid-portal/component-registry.json` |
| Версии и статусы стандартов | `standards-registry.json` |
| Все стандарты | `skills/_shared/standards/` |
| Как работают со стандартами (правила, решения, открытые вопросы) | `docs/standards-alpha/` — начать с `WORKING-RULES.md` |

Канон значений — `tokenDataFiles` продукта; Figma — источник для сверки.
Значения в гайдах — иллюстрации структуры, не требования.

## Скиллы плагина

`/aid-standards:ds-component-spec`, `ds-component-build`,
`ds-component-audit`, `ds-component-migration`, `ds-ui-review`,
`ds-developer-guide`, `ds-import`, `guide-lint`. Пути внутри них — тоже
от `repo/`, по правилу выше.

## Если чего-то нет

- Нужного гайда или токена нет — сказать явно, не додумывать правило;
  пробелы — одной анкетой.
- Figma MCP не подключён — попросить JSON или скриншот.
- Стандарт противоречит другому или задаче — назвать противоречие, а не
  выбирать молча. Вопрос к стандартам — issue в `RickOBrian/aid`.
