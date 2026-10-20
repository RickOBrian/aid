---
description: >
  Гайд changelog: изменение в библиотеке Figma сразу получает запись,
  один чейнжлог на тип артефакта, одна запись в Figma и Presentbook,
  версия — на публикации библиотеки.
destination: skills/_shared/standards/
name: changelog-guide
metadata:
  version: "1.1.0"
  kind: standard
  owner: design-system-team
---

# Changelog Guide

> Статус: Draft · v1.1.0 · обновлено 2026-10-20

---

## 1. Purpose

Гайд описывает, как вести changelog токенов, стилей, иконок и компонентов
продукта: когда писать запись, где она живёт и как получает версию.

Правило (решение PD 2026-10-20): **изменение в библиотеке = запись в
changelog в той же работе.** Изменение без записи не закончено. Запись
сразу видна в двух местах — в таблице чейнжлога в файле Figma и на
странице Presentbook, и в обоих местах она одна и та же.

Версию запись получает на **границе релиза — публикации библиотеки в
Figma** (раздел 6). До неё запись стоит в строке «Не опубликовано».

---

## 2. Relationship to other guides

| Артефакт | Связь |
|---|---|
| `skills/_shared/standards/semver-guide.md` | MAJOR / MINOR / PATCH для каждого артефакта |
| `skills/_shared/protocols/gates/release-gate.md` | Граница релиза: версия и дата записи |
| `skills/_shared/protocols/gates/product-context.md` | Контекст продукта до любой работы |
| `skills/_shared/protocols/gates/token-change-gate.md` | Анкета перед изменением токена (artifact, bump type) |
| `pages/aid-portal/token-changelog-registry.json` | Связь коллекции со страницей Presentbook |

---

## 3. Один чейнжлог на тип артефакта

Каждый тип артефакта ведёт свой чейнжлог. Поменяли цвет — запись только в
чейнжлоге цветов; чейнжлог типографики не трогается.

| Тип | Таблица в Figma | Файл в репозитории |
|---|---|---|
| Коллекция токенов (цвета, отступы, радиусы, типографика) | страница чейнжлога коллекции в файле токенов продукта | `tokens/<продукт>-<коллекция>-changelog.json` |
| Стили (тени, стекло, градиенты) | страница чейнжлога стиля в файле токенов | `tokens/<продукт>-effects-<стиль>-changelog.json`, `tokens/<продукт>-gradients-changelog.json` |
| Иконки | страница чейнжлога в файле иконок | `tokens/<продукт>-icons-changelog.json` |
| Компонент | страница чейнжлога компонента в файле компонентов | `components/<componentId>-changelog.json` |

Одна таблица Figma ↔ один JSON ↔ одна страница Presentbook. Файлы Figma
продукта — `figmaFiles` в `products/<id>/product.json`. Не смешивать записи
разных продуктов.

---

## 4. Что требует записи

### Требует

Любое изменение в файле библиотеки продукта:

- добавлен токен, стиль, иконка, компонент, вариант, свойство;
- изменено значение (hex, число, режим Day/Night), scope, свойство компонента;
- переименование или удаление;
- изменено описание токена или компонента, которое видят потребители.

### Не требует

- копии под аудит, прототипы, черновые секции в рабочих файлах макетов;
- локальные коллекции и компоненты вне файла библиотеки;
- вёрстка страниц документации в Figma и Presentbook без изменения значений;
- скрипты и инструменты.

Цифру версии определяет `semver-guide`: переименование и удаление — MAJOR,
добавление — MINOR, исправление значения без изменения API — PATCH.

---

## 5. Формат записи

### Файл коллекции

```json
{
  "artifact": "Rider Colors/Semantic",
  "currentVersion": "1.10.0",
  "figmaTable": { "fileKey": "yrfG6u9osujKX8e1B14lpT", "nodeId": "31:66" },
  "entries": [
    {
      "version": null,
      "date": null,
      "author": "Sergey AI",
      "type": "minor",
      "changes": [
        {
          "kind": "added",
          "description": "Добавлена переменная Button/Warning Pressed",
          "details": "Button/Warning Pressed: Day #BF0020, Night #FF4747"
        }
      ]
    }
  ]
}
```

| Поле | Назначение |
|---|---|
| `artifact` | Единица версионирования, как в заголовке таблицы Figma |
| `currentVersion` | Последняя **опубликованная** версия |
| `figmaTable` | Где таблица чейнжлога в Figma: `fileKey` и `nodeId` |
| `entries[]` | От новой записи к старой |
| `entries[].version` | SemVer; `null` — запись «Не опубликовано» |
| `entries[].date` | Дата публикации ISO; `null` до публикации |
| `entries[].author` | Кто внёс изменение: отображаемое имя человека или AI-инженера, как его видят в таблице (имя в Figma, например «Артур», «Sergey AI»). Логин GitHub и id из `docs/hub/owners.json` не пишут ни вместо имени, ни рядом с ним (решение PD 2026-10-20) |
| `entries[].type` | Предлагаемая цифра: `major` / `minor` / `patch` |
| `changes[].kind` | `added` / `changed` / `removed` / `fixed` / `deprecated` |
| `changes[].description` | Одна фраза: что и зачем |
| `changes[].details` | Значения построчно: `Имя: было → стало`, `Имя: Day …, Night …` |

**«Не опубликовано»** — не больше одной записи с `version: null`, всегда
первой. Новые изменения до публикации дописываются в неё же; `type` берёт
самую старшую цифру из её изменений.

### Таблица в Figma

Колонки: Версия | Список изменений | Дата | Автор. В списке изменений на
каждое `changes[]` — бейдж вида (Добавлено, Изменено, Удалено, Исправлено,
Устарело), фраза `description` и строки `details`. Запись «Не опубликовано»
— первая строка, в колонке версии текст «Не опубликовано», дата пустая.
Колонка версии вмещает `10.10.10` в одну строку.

### Компонент

Файл компонента — та же структура с полями из раздела 9: `componentId`,
`product`, `releaseStatus`, `reviewRoute`; до первого релиза
`currentVersion: null`.

---

## 6. Как вносится изменение

```
Правка в библиотеке Figma (variables, стили, иконки, компоненты)
    ↓
В той же работе: изменение дописано в «Не опубликовано»
своего чейнжлога — в JSON и в таблице Figma
    ↓ (PR в main → Presentbook показывает «Не опубликовано»)
…следующие правки дописываются туда же…
    ↓
Граница релиза: публикация библиотеки
    ↓
PD (или владелец продукта) подтверждает версию
    ↓
«Не опубликовано» получает version и date, currentVersion обновлён,
строка в Figma получает версию; библиотека публикуется
с той же версией в описании
```

### Кто и чем

- **Основной путь — Token Comparator** (решение PD 2026-10-20). Дизайнер
  правит variables и нажимает в плагине «Записать изменения». Плагин
  сравнивает текущие variables со снимком последней опубликованной версии,
  собирает запись (`kind`, `details`, `type` — сам, `description` —
  дизайнер дописывает или правит черновик), обновляет таблицу на странице
  Figma и отправляет запись на сервер `api.aidteam.pro`, который открывает
  PR с JSON. Дизайнер вручную JSON не пишет.
- **До готовности плагина** запись в JSON и строку в таблице Figma вносит
  Standards — по своим правкам сама, по правкам других — по их сообщению.
- Для компонентов и иконок плагин показывает, что изменилось (варианты,
  свойства, имена), описание дописывает автор.

### Граница релиза

Версия и дата ставятся только на публикации библиотеки и только после
подтверждения владельца продукта (для продуктов PD — «да» PD, «Только PD»
п. 4 корневого `CLAUDE.md`). Порядок — `release-gate.md`. Запись в
«Не опубликовано» до этого момента — норма, а не нарушение границы.

**Переходное (2026-10-20):** `ChangelogTable` в Presentbook пока ждёт
строковую версию. Пока он не научится показывать `version: null` первой
строкой «Не опубликовано», такая запись живёт в таблице Figma и в ветке,
а в `main` попадает уже с версией.

### Очередь `changes/<id>/pending/`

Для артефактов библиотеки её заменяет запись «Не опубликовано». Старые
файлы очереди переносятся в чейнжлоги при сверке и уходят в
`changes/<id>/released/`.

---

## 7. Product-scoped changelogs

| Ресурс | Путь |
|---|---|
| Файлы Figma продукта | `products/<id>/product.json` → `figmaFiles` |
| Чейнжлоги токенов, стилей, иконок | `tokens/<продукт>-*-changelog.json` |
| Чейнжлоги компонентов | `components/*-changelog.json` |
| Связь со страницами Presentbook | `pages/aid-portal/token-changelog-registry.json`, `pages/aid-portal/component-registry.json` |
| Метаданные компонентов | `pages/aid-portal/components/*.meta.json` |

Каждый продукт в `products/registry.json` имеет свой `releaseRoot`. Не
смешивать changelog entries разных продуктов.

---

## 8. Examples

### Токен — добавлен (MINOR)

```json
{
  "kind": "added",
  "description": "Добавлен space-140 в spacing-sem (Figma spacing table)",
  "details": "space-140: 140"
}
```

Bump: `1.0.0` → `1.1.0`

### Токен — исправлено значение (PATCH)

```json
{
  "kind": "fixed",
  "description": "Исправлен hex bg-accent-main в режиме Day",
  "details": "bg-accent-main Day: #0057FF → #0056FF"
}
```

Bump: `1.1.0` → `1.1.1`

### Токен — переименован (MAJOR)

```json
{
  "kind": "changed",
  "description": "Переименована Button/Warning: появились состояния",
  "details": "Button/Warning → Button/Warning Default"
}
```

Bump: `1.9.0` → `2.0.0` — экземпляры и код со старым именем ломаются.

### Токен — удалён (MAJOR)

```json
{
  "kind": "removed",
  "description": "Удалён text-deprecated-secondary — заменён на text-secondary"
}
```

Bump: `1.1.1` → `2.0.0`

### Компонент — первый релиз

Первая опубликованная запись компонента:

```json
{
  "version": "1.0.0",
  "date": "2026-08-16",
  "author": "Sergey AI",
  "type": "added",
  "impact": "initial",
  "changes": [
    {
      "kind": "added",
      "description": "Switch: Surface View on/off control; states checked, loading, disabled; Web"
    }
  ]
}
```

Ставит `currentVersion: "1.0.0"`; до первого релиза `currentVersion: null`.

---

## 9. Component changelog

Отдельно от коллекций токенов, один файл на компонент.

```json
{
  "artifact": "Switch",
  "componentId": "switch",
  "product": "driver",
  "currentVersion": null,
  "releaseStatus": "pending",
  "reviewRoute": "/components/switch",
  "entries": []
}
```

| Field | Назначение |
|---|---|
| `componentId` | Registry slug (`switch`) |
| `currentVersion` | Последняя опубликованная версия; `null` до первого релиза |
| `releaseStatus` | `pending` до первого релиза, затем `released` |
| `reviewRoute` | Маршрут песочницы в Presentbook |
| `entries[].impact` | `initial` для первого релиза, затем `major` / `minor` / `patch` |
| `entries[].changes[].relatedTokenChanges` | Необязательно: связанные релизы токенов |

**Portal UI is not versioned.** `ChangelogTable`, `ComponentReleaseStatus` и
стили `dsChangelogTable.ts` — примитивы портала, не компоненты продукта.

---

## 10. Anti-patterns

| Anti-pattern | Почему плохо |
|---|---|
| Изменение в библиотеке без записи | Потребители не узнают об изменении |
| Запись только в Figma или только в JSON | Figma и Presentbook расходятся |
| Версия или дата до публикации библиотеки | Нарушает границу релиза |
| Изменение цвета в чейнжлоге типографики | Один тип артефакта — один чейнжлог |
| Записи разных продуктов в одном файле | Нарушает изоляцию продуктов |
| `minor` для переименования или удаления | Это MAJOR: ломает экземпляры и код |
| Абстрактные имена (color-changelog.json) | Имя по продукту и коллекции: `rider-colors-semantic-changelog.json` |

---

## 11. Changelog

- **1.1.0** — 2026-10-20. Решение PD: изменение в библиотеке сразу получает запись; один чейнжлог на тип артефакта; одна запись в таблице Figma и в Presentbook; граница релиза — публикация библиотеки, до неё запись «Не опубликовано» (`version: null`); поля `figmaTable` и `details`; основной путь записи — кнопка в Token Comparator; очередь `changes/<id>/pending/` для библиотек заменена.
- **1.0.2** — 2026-10-09. Убрана ссылка на дамп `src/pages/FigmaStyles/`: артефакт легаси-Storybook, удаляется (ADR-044).
- **1.0.1** — предыдущие версии до введения раздела; история — в git.
