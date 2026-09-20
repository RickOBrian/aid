# План: стандарты компонентов → альфа 0.1.0

> Обновлено 2026-09-20 · набор `0.1.0-alpha` · реестр: `standards-registry.json`

Цель: превратить черновики стандартов в набор, который можно опубликовать
пользователям и на который потом опираются аудит чужих библиотек,
маппинги, опознавание компонентов, плагины и отрисовка компонентов с нуля.

Ядро альфы (ADR-003): `component-standards`, `ds-component-architecture-guide`,
`component-states-guide`, `naming-conventions`, `platforms`.

Статусы задач: `todo` · `in progress` · `done` · `blocked` · `dropped`

---

## Волна 0 — фундамент

Без неё каждая следующая правка множит рассинхрон.

| ID | Задача | Статус |
|---|---|---|
| W0-1 | `standards-registry.json` — реестр стандартов, версий, зависимостей | done |
| W0-2 | Рабочая папка процесса: PLAN / DECISIONS / OPEN-QUESTIONS | done |
| W0-3 | Починить таблицу «Source of truth» в `AGENTS.md` — ведёт в `docs/` вместо `skills/_shared/` | done |
| W0-4 | Сверить дубли `docs/*.md` с каноном | done — см. Q-04 |
| W0-4a | Устранить копии в `docs/` (удалить или редирект) — после W2-2a | blocked |
| W0-5 | Единый шаблон гайда → `skills/_shared/protocols/guide-template.md` v1.0.0 | done |
| W0-6 | Статус `alpha` и новые поля шапки в пяти гайдах ядра — применяется внутри волн 1–2, отдельным проходом не делается (чтобы не бампать версию дважды) | todo |

**Готово, когда:** у каждого гайда ядра одна редакция, один шаблон шапки,
и реестр честно описывает текущее состояние.

---

## Волна 0.5 — инженерия документов

Из аудита `DOC-INFRA-AUDIT.md` (2026-09-20). Делается до Волны 1: пишем
содержание в уже исправную систему, а не в текущую.

| ID | Задача | Статус |
|---|---|---|
| W05-1 | Поле `kind` во frontmatter всех 40 файлов `_shared` (standard / protocol / architecture / notes) | done |
| W05-2 | `scripts/check-docs.mjs`: форма, живость ссылок, сходимость версий, дубли по `name`, сверка с реестром | done |
| W05-3 | Встроить `check-docs` в `prebuild` портала | отложено до Волны 4 |
| W05-4 | Починить 28 битых ссылок и 8 неверных путей | done |
| W05-5 | Починить `.cursor/rules/token-integrity.mdc` — `alwaysApply`-гейт указывает на несуществующий путь | done |
| W05-6 | Починить `CLAUDE.md`: раздел «Скиллы» описывает удалённую `.claude/skills/` | done |
| W05-7 | Устранить третий дубль: `_shared/ds-component-spec.md` v1.2.0 против `ds-component-spec/SKILL.md` v1.3.0 | done |
| W05-8 | `cursor-component-pipeline-context.md`: 9 ссылок на непостроенное — перевести в будущее время или вынести в backlog | done |
| W05-9 | `PROJECT_STRUCTURE.md` генерировать скриптом | todo |
| W05-12 | Создать `skills/ds-component-spec/TESTING.md` — скилл сам требует этот файл, у соседних скиллов он есть | todo |
| W05-10 | Мелочи: `.tmp-qa` в gitignore, `docs/specs/ButtonText-spec.md` из корня, `component-build-workflow.md` на место | done |
| W05-11 | Физическая раскладка `_shared` по жанрам | done — сделано раньше плана: Волна 1 ещё не началась, конфликтовать было не с чем |

---

## Волна 1 — ядро: `component-standards` → 2.0.0-alpha

Закрываем дыры из аудита 2026-09-20. Нумерация совпадает с аудитом.

| ID | Задача | Дыра | Статус |
|---|---|---|---|
| W1-1 | Матрица применимости по уровням: какие разделы обязательны для Item / Surface View / Structural View / Layout | 2.1 | todo |
| W1-2 | Полный список состояний, включая `indeterminate` (есть в коде, нет в гайде); матрица строится только из допустимых комбинаций | 1.1, 2.9 | todo |
| W1-3 | Классификация значений по шкале `semantic-token / platform-convention / raw-value / hardcode` (ADR-006); снять спор про opacity 40% | 1.3 | todo |
| W1-4 | Раздел «Escape hatches»: ref forwarding, `className`/`style`, проброс `aria-*`/`id`, `data-testid`, полиморфизм, запрет слепого spread | 2.4 | todo |
| W1-5 | Deprecation lifecycle: помеченный проп живёт минимум один MINOR, удаление — в MAJOR | 2.5 | todo |
| W1-6 | Content resilience: длинный текст, обрезка, пусто, локализация, RTL, формат чисел + обязательная story «худший случай» | 2.6 | todo |
| W1-7 | Size / density contract: что меняет `size`; инвариант — touch target не уменьшается | 2.7 | todo |
| W1-8 | Repeatable Slot и Cell Span в props-стандартах | 2.2 | todo |
| W1-9 | Controlled / uncontrolled: `defaultValue`, запрет смены режима в runtime, `value` без `onChange` = read-only | 2.14 | todo |
| W1-10 | Порог «variant или новый компонент» | 2.14 | todo |
| W1-11 | Структура файлов для iOS и Android, не только Web | 2.3 | todo |
| W1-12 | Definition of Done + связка с чек-листом интерактивности из `platforms.md` и гейтами | 2.10, 2.11, 2.12 | todo |
| W1-13 | Убрать продуктовую колонку Driver, перенести в `products/<id>/product.json` | 2.12 | todo |
| W1-14 | Single source of truth: мини-таблицы a11y / testing заменить ссылкой + компонентной дельтой; снять «Wave 2 / Wave 3» | 1.4 | todo |
| W1-15 | Починить ссылки: `docs/semver-guide.md` → канон; `space-8/16` → `inset-*`; слоты привести к канону | 1.2, 1.5, 1.7 | todo |
| W1-16 | Свой раздел Changelog | 2.13 | todo |

**Почему 2.0.0, а не 1.1.0:** правила меняются несовместимо — состояния,
классификация значений, обязательный DoD. По `semver-guide` это MAJOR.

---

## Волна 2 — соседние гайды ядра

| ID | Задача | Статус |
|---|---|---|
| W2-1 | `component-states-guide`: `indeterminate`, сверка комбинаций с кодом | todo |
| W2-2 | `ds-component-architecture-guide`: разнести `destructive` (variant) и `ButtonDestructive` (имя); привести глоссарий `danger` → `destructive` | todo |
| W2-2a | Вернуть в таблицу Role-семей колонку «Когда использовать», потерянную при переходе v1.0.0 → v1.3.0 (Tag = статика, Chip = интерактив, Island = повторяемый, Widget = штучный) | todo |
| W2-3 | `naming-conventions`: сверка с архитектурой, единые regex-правила | todo |
| W2-4 | `platforms`: расхождение версии (frontmatter 1.1.0 / заголовок 1.0.0); `is*` vs Compose `enabled` оформить как таблицу паритета | todo |
| W2-5 | Сквозная сверка терминов между пятью гайдами ядра | todo |

---

## Волна 3 — машинный слой

Пишется параллельно волнам 1–2 (ADR-004), проверяется здесь.

| ID | Задача | Статус |
|---|---|---|
| W3-1 | `component-standards.json`: уровни, обязательность разделов, DoD | todo |
| W3-2 | `component-states.json`: состояния, маппинг платформ, матрица комбинаций | todo |
| W3-3 | `component-architecture.json`: уровни, слоты, Role-семьи | todo |
| W3-4 | `naming.json`: правила имён как проверяемые выражения | todo |
| W3-5 | Расширить скилл `guide-lint` — перечень расхождений готов в `guide-template.md` §8; там же почина требует мёртвая ссылка на `.claude/git-workflow.md` | todo |

---

## Волна 4 — публикация

| ID | Задача | Статус |
|---|---|---|
| W4-1 | Страница-рендерер markdown в Presentbook (ADR-002) | todo |
| W4-2 | Расширить `guide-registry.json` на пять гайдов ядра | todo |
| W4-3 | Перевести «Версионность» со своей TSX-страницы на рендерер, источник — канон | todo |
| W4-4 | Changelog каждого гайда в портале (механизм `loadGuideChangelog` уже есть) | todo |
| W4-5 | Preview → проверка → merge → отдельное решение о promote | todo |

**Важно:** promote в production — отдельное явное решение, не следствие
merge (`github-sync-architecture.md` §3a).

---

## Что дальше, за альфой

Задачи, ради которых всё это строится. В альфу не входят, но влияют на то,
как пишется машинный слой:

- аудит чужих макетов, библиотек и компонентов;
- маппинг чужих компонентов на наши стандарты;
- опознавание компонента по коду и по скриншоту;
- плагины для работы с компонентами;
- отрисовка компонентов с нуля по стандартам.
