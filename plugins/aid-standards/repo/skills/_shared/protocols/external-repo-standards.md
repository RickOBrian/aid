---
destination: skills/_shared/protocols/
name: external-repo-standards
metadata:
  version: "0.1.0"
  kind: protocol
  status: draft
  lastReviewed: "2026-10-22"
  owner: design-system-team
  platforms: [web, ios, android]
description: >
  Как инженер AID и его Claude подключают стандарты дизайн-системы в
  репозитории вне RickOBrian/aid: плагин aid-standards, что читать, какие
  гейты проходить по виду работы, как оформить отклонение. Плюс готовый
  фрагмент CLAUDE.md для такого репозитория.
---

# Стандарты AID во внешнем репозитории

> Статус: Draft · v0.1.0 · обновлено 2026-10-22

---

## 1. Назначение

Решение PD 2026-10-22: инженер, чьи продукты живут вне репозитория AID,
работает по стандартам из репозитория, а не на своё усмотрение. Его
Claude знает и применяет стандарты так же, как Claude PD (правило PD
2026-10-21, `docs/standards-alpha/WORKING-RULES.md`).

Протокол — для любого такого репозитория: плагины Figma, гайды, рабочие
папки без git. Первые пользователи — продукты инженера Library Updater
(раздел 5).

Стандарты живут в одном месте — `RickOBrian/aid`, ветка `main`. Во
внешний репозиторий они не копируются: копия отстаёт с первого мержа.

---

## 2. Подключение

Один раз на машине инженера, в Claude Code:

```
/plugin marketplace add RickOBrian/aid
/plugin install aid-standards@aid
```

Затем `/plugin` → Marketplaces → `aid` → включить auto-update. Без него
стандарты обновляются только командой `/plugin marketplace update aid`.
Подробности и проверка установки — `plugins/aid-standards/README.md`.

Плагин несёт входной скилл `aid-standards`, скиллы `ds-*` и зеркало
нужной части репозитория AID. Пути из стандартов (`skills/_shared/...`)
Claude читает от корня зеркала, `${CLAUDE_PLUGIN_ROOT}/repo/`.

Чтобы плагин предлагался каждому, кто открыл внешний репозиторий, — в его
`.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "aid": { "source": { "source": "github", "repo": "RickOBrian/aid" } }
  },
  "enabledPlugins": { "aid-standards@aid": true }
}
```

Репозиторий AID публичный: доступ на чтение не выдаётся, он есть у всех.

---

## 3. Что читать

По порядку, до первой правки в задаче:

1. Входной скилл `aid-standards`: три запрета, таблица гейтов, где что
   лежит. Claude вызывает его сам; если не вызвал — вызвать явно.
2. `docs/hub/STANDARDS-WORK.md` — гейты по задаче и термины.
3. `docs/standards-alpha/WORKING-RULES.md` — как применять стандарты.
4. `standards-registry.json` — какие стандарты есть, версия и статус.
   Стандарт со статусом `draft` применяется так же, но вопросы к нему
   ожидаемы.
5. Гейты и стандарты по виду работы — раздел 4.

---

## 4. Вид работы → гейты и стандарты

| Работа | Гейты | Стандарты |
|---|---|---|
| Любая работа с токенами, компонентами, Figma | `product-context` | — |
| Значение цвета, отступа, радиуса, типографики | `token-integrity` | `token-rules`, `semantic-*-tokens-guide` |
| Добавить, изменить, переименовать, удалить токен или стиль | `token-change-gate` | `token-rules`, `naming-conventions` |
| Создать, изменить, собрать компонент в библиотеке Figma | `component-gate` | `figma-library-workflow`, `component-standards` |
| Аудит компонента, токенов, чужой библиотеки | `audit-gate` | `ds-component-audit-guide`; оформление в Figma — `figma-library-workflow`, «Оформление аудита в Figma» |
| Перенос компонентов в библиотеку продукта | `component-gate`, `audit-gate` | `ds-component-migration-guide`, `figma-library-workflow` |
| Записи об изменениях библиотеки, версия, changelog | `release-gate` | `changelog-guide`, `semver-guide`, `versioning-strategy`, `component-standards` §15.1 п.10 |
| Гайд для человека | — | `guide-template` |

Гейт читается до работы, а не после. Стандарта на нужный случай нет —
раздел 6, а не своё правило.

---

## 5. Продукты инженера Library Updater

Доска и чаты — `docs/hub/boards/lu.md`.

| Продукт | Что делает | С чего начать |
|---|---|---|
| Library Updater | Снимок библиотеки, «было — стало», kind и semver, записи в таблицу CHANGELOG в Figma, предложения изменений | `release-gate`, `changelog-guide`, `semver-guide`; имена токенов — `naming-conventions` |
| Components Swapper | Замена компонентов и иконок из чужих библиотек на компоненты AID, замер внедрения | `product-context`, `component-gate` (аналог по смыслу); замер — `skills/_shared/notes/aid-adoption-measurement.md`, списки библиотек — раздел 8 |
| Components Rework (без git) | Аудит локальных компонентов и перенос в библиотеки компонентов продукта | `figma-library-workflow` целиком, аудит — по его «Оформлению аудита в Figma» |
| Git for Beginners | — | Гайд ведут чаты PD (решение PD 2026-10-22); фрагмент не нужен |

Скилл со стороны (например свой скилл миграции) не отменяет стандарт:
при расхождении действует стандарт AID, а расхождение — вопрос по
разделу 6.

---

## 6. Отклонение и пробел

- **Отклонение** — работа по-другому, чем требует стандарт. Единственный
  пункт, которому нужно согласование PD (решение PD 2026-10-21). До
  решения — работа по стандарту. Issue в `RickOBrian/aid` с метками
  `decision:pd` и `to:ds-standards`: правило (файл и раздел), что
  предлагается, почему.
- **Пробел** — стандарта на случай нет. Не додумывать: issue с меткой
  `to:ds-standards`, вопрос с вариантами.
- **Противоречие** между стандартами или между стандартом и задачей —
  назвать явно в issue `to:ds-standards`, не выбирать молча.
- **Правка стандарта** — PR в `RickOBrian/aid`, зона Standards. Файлы в
  `${CLAUDE_PLUGIN_ROOT}` не правятся: кэш перезаписывается при
  обновлении.

Всё, что соответствует логике стандартов и не противоречит ей, инженер
делает сам, без согласования.

---

## 7. Фрагмент CLAUDE.md

Вставить в `CLAUDE.md` в корне внешнего репозитория (или рабочей папки
без git) как есть. Строку «Продукт» заполнить.

```markdown
## Стандарты AID

Продукт: <название> · продукты AID, с которыми работает: driver, rider.

Работа идёт по стандартам дизайн-системы AID из `RickOBrian/aid` (`main`),
а не на своё усмотрение (решение PD 2026-10-22). Стандарты приходят
плагином `aid-standards@aid`; не установлен — остановиться и попросить
инженера поставить (`/plugin marketplace add RickOBrian/aid`,
`/plugin install aid-standards@aid`).

Перед задачей с токенами, компонентами, Figma, changelog или версией —
вызвать скилл `aid-standards` и прочитать гейты по виду работы из
`skills/_shared/protocols/external-repo-standards.md` §4 (пути — от
`${CLAUDE_PLUGIN_ROOT}/repo/`).

Три запрета — всегда:
- не создавать компонент молча — сначала lookup и предложение;
- не подставлять значение без токена — сначала lookup, пробелы в одну анкету;
- не писать версию и changelog вне границы релиза.

Стандарты в этот репозиторий не копировать. Отклонение от стандарта —
только по решению PD: issue в `RickOBrian/aid` с метками `decision:pd` и
`to:ds-standards`, до решения — по стандарту. Стандарта нет или он
противоречит задаче — issue `to:ds-standards`, своё правило не вводить.
```

---

## 8. Списки библиотек для замера внедрения

Ответ на вопрос из #280. Списки библиотек для счёта `aid` / `legacy`
(`aid-adoption-measurement.md` §2) живут в манифесте продукта
`products/<id>/product.json`:

- **`aid`** — файлы из `figmaFiles` (`components`, `icons`, `tokens`),
  ключ — `fileKey`. Отдельный список не заводится.
- **`legacy`** — поле `figmaLegacyLibraries.items`: массив
  `{ "label", "fileKey", "url" }`, по одному на старую библиотеку
  продукта.
- Всё остальное внешнее — `other`.

Ключ — `fileKey` файла библиотеки, не имя: имена повторяются и меняются.
Plugin API не отдаёт файл библиотеки у экземпляра; как сканер сопоставляет
главный компонент с файлом (ключи компонентов, снятые в файле библиотеки,
или REST API Figma), — решение владельца сканера.

Старые библиотеки вносит тот, кто их знает, — PR в `RickOBrian/aid`,
правка `figmaLegacyLibraries` продукта; `products/` — зона Standards, PR
мержит Standards.

---

## 9. Changelog

- **0.1.0** — 2026-10-22. Первая версия: допуск Штаба LU к стандартам
  репозитория (решение PD 2026-10-22, #314, #280) — подключение плагином,
  гейты по виду работы, отклонение через `decision:pd`, фрагмент
  CLAUDE.md, место списков библиотек для замера.
