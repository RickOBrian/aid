---
name: ds-component-migration
metadata:
  version: "1.2.1"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Находит legacy-реализации уже утверждённого канонического компонента
  дизайн-системы в репозитории и мигрирует их на новый компонент поэтапно:
  discovery → mapping → pilot → batch rollout → cleanup. Массовый рефактор
  не выполняется без явного подтверждения на каждом гейте.
  Активируется строго по команде: «/migrate_component [ComponentName]»,
  «/migrate_component pilot», «/migrate_component rollout»,
  «/migrate_component cleanup», «/migrate_component status».
---

# DS Component Migration — v1.2.1

Находит legacy-реализации канонического компонента (например `Table` /
`TableRow`) в репозитории, строит mapping legacy-разметки на
props/слоты нового компонента и переносит код пятью управляемыми фазами.
Каждая фаза, которая меняет файлы, требует отдельного явного
подтверждения. Skill не переписывает весь репозиторий за один запуск.

---

## Активация — строго по команде

- `/migrate_component [ComponentName]` — старт или resume сессии.
  Выполняет **Phase 1 (Discovery)** и **Phase 2 (Mapping)** — только чтение
  и анализ, без изменения файлов.
- `/migrate_component pilot` — **Phase 3**. Требует подтверждённый mapping
  из активной сессии.
- `/migrate_component rollout` — **Phase 4**. Требует отдельное явное
  подтверждение после одобренного pilot.
- `/migrate_component cleanup` — **Phase 5**. Проверка остатков legacy и
  follow-up список.
- `/migrate_component status` — показать текущую фазу и состояние сессии
  без пересканирования репозитория.

Фразы вида «мигрируй компонент», «перепиши legacy Table» без команды —
**не триггер**. Попроси использовать `/migrate_component`.

---

## Контекст окружения

Прочитай в начале сессии:
- `.claude/intake-user` — кто запустил (фамилия латиницей)
- `skills/_shared/ds-component-architecture-guide.md` — уровни архитектуры,
  нужен для сверки слотов при mapping
- `skills/_shared/token-rules.md` — Core → Semantic, мигрированный код не
  должен вносить хардкод вместо старого хардкода
- `skills/_shared/platforms.md` — особенности Web / iOS / Android при
  переносе props/слотов
- `skills/_shared/no-hardcode-color-protocol.md` — обязательно перед
  правкой любого `*.html`, `*.css`, `*.scss` в Pilot/Rollout
- `skills/_shared/git-workflow.md` — команды синхронизации памяти и push
- `memory/ds-component-migration/log.*.json` — активные/прошлые сессии
  миграции (Шаг 0.2)
- `memory/ds-component-spec/log.*.json` — спека канонического компонента:
  источник props/слотов для mapping
- `memory/ds-component-audit/log.*.json` — убедиться, что компонент не сам
  помечен Legacy

**Канонический источник правды — Git-репозиторий и `skills/_shared/`.**
Если в `docs/` встречаются копии гайдов (например
`docs/design-system/tokens/*.md`) — это устаревшие копии для чтения
человеком, не source of truth. Никогда не бери правила токенов/архитектуры
оттуда, только из `skills/_shared/`.

**Graceful degradation:**
- `.claude/intake-user` не найден → спроси имя, покажи существующие
  `memory/ds-component-migration/log.*.json`, создай файл.
- `skills/_shared/ds-component-architecture-guide.md` или `platforms.md`
  не найден → предупреди «файл не найден, работаю на встроенных правилах
  уровней/платформ» и используй общие принципы: слоты `leading/content/
  trailing/header/footer`, touch target 44×44pt (iOS) / 48×48dp (Android) /
  44px (Web).
- `skills/_shared/no-hardcode-color-protocol.md` не найден → предупреди,
  но всё равно не вноси хардкод цвета — используй уже существующие в
  legacy-коде токены/переменные, если они есть, иначе останови файл как
  manual review.

---

## Шаг 0.1. Два порога запуска — Discovery/Pilot и Rollout

Это два разных порога готовности, не один и тот же уровень. Дальше по
скиллу везде, где встречается «Порог 1»/«Порог 2» — ссылка сюда.

### Порог 1 — старт Discovery и Pilot

Проверь `memory/ds-component-spec/log.*.json` на запись с `component ==
[ComponentName]`.

- **Записи нет** → **останови работу**: «Спеки для `[ComponentName]` не
  найдено. Сначала пройди `ds-component-audit` → `ds-component-spec`,
  миграция без спеки не выполняется.»
- **Запись есть, `stage: draft` (или есть `open_questions`)** → Discovery
  и Pilot **разрешены**, но только в **read-only-совместимом режиме**:
  перед выводом каждой фазы явно помечай
  «⚠️ spec draft, open questions: [список из спеки]».
- **Запись есть, `stage: final`** → Discovery/Pilot без ограничений.

Для старта Discovery/Pilot достаточно, что спека **существует** —
`stage: draft` не блокирует, только помечает вывод. Audit уже отражён в
самой спеке (спека не пишется без предшествующего вердикта), отдельно
перепроверять `ds-component-audit` на этом пороге не нужно.

### Порог 2 — старт Batch Rollout (строже Порога 1)

Спека `[ComponentName]` **и каждого** `related_components` должна быть
`stage: final`, `open_questions: 0`. Если хотя бы одна из них — `draft`
или с открытыми вопросами → **Rollout не выполняется**, независимо от
подтверждения человека. При попытке `/migrate_component rollout`
останови работу и явно назови, какая именно спека ещё не финализирована
и какой открытый вопрос остался (не просто «заблокировано»).

Не гадай props/слоты по коду legacy-реализации — mapping строится от
канонической спеки к legacy, не наоборот.

---

## Шаг 0.2. Разделение ответственности — не смешивать с audit/spec

Этот skill не выполняет вердикты «Match/New/Ambiguous» (это
`ds-component-audit`) и не пишет спецификации (это `ds-component-spec`).

Если в ходе Discovery встречается разметка, которая **не похожа** на
legacy-версию `[ComponentName]`, а выглядит как отдельный, не описанный
компонент — не анализируй её вердиктом внутри этой сессии. Зафиксируй
файл в отдельном списке «Вне скоупа — возможно, отдельный компонент» и
предложи отдельный явный запуск `ds-component-audit`.

---

## Стратегия экономии токенов (обязательна к соблюдению)

1. **Discovery first.** Пока Discovery не завершён и не показан — никакого
   кода не читать построчно сверх того, что нужно для группировки
   совпадений (поиск по маркерам, не построчный анализ каждого файла).
2. **Pilot before batch.** Batch Rollout невозможен без прошедшего Pilot
   на этой же mapping-версии.
3. **Никаких повторных full-repo сканов**, если скоуп и legacy-маркеры не
   менялись с последнего Discovery в активной сессии
   (`memory/ds-component-migration/log.*.json`, поле `scope_signature`).
   `/migrate_component status` и Phase 2–4 переиспользуют список файлов из
   записи Discovery вместо повторного поиска по репозиторию.
4. **Compact output по умолчанию.** Discovery и Rollout не показывают diff
   целиком — только summary и список путей. Полные before/after — только
   для 1–2 файлов Pilot (Phase 3), и то в сокращённом виде (ключевые
   фрагменты, не весь файл).
5. **Не читай повторно `skills/_shared/*` файлы**, уже прочитанные в этой
   сессии, если их содержимое не могло измениться между твоими шагами.

---

## Phase 1 — Discovery

Вход:
- `component` — имя канонического компонента (обязательно)
- `related_components` — связанные подкомпоненты (опционально, например
  `TableRow`, `TableCell` для `Table`)
- `legacy_markers` — список маркеров для поиска: CSS-классы, HTML-теги,
  старые имена компонентов/функций (обязательно; если не передан —
  спроси одним вопросом, не угадывай маркеры)
- `scope` — пути поиска (например `docs/`, `storybook/`, `src/`); если не
  передан — предложи разумный дефолт для репозитория и подтверди одной
  строкой

Процесс:
1. Найди вхождения `legacy_markers` в пределах `scope` (поиск по
   маркерам, не чтение каждого файла целиком).
2. Сгруппируй результаты:
   - **Точные совпадения** — маркер встречается в контексте, однозначно
     соответствующем роли `[ComponentName]`.
   - **Похожие паттерны** — маркер есть, но контекст отличается
     (другая вложенность, смешение с другой разметкой рядом).
   - **Неоднозначные случаи** — неясно, относится ли вообще к
     `[ComponentName]`, или это Шаг 0.2 (вне скоупа).
3. Выбери 1–3 файла для pilot: критерии — представительность паттерна
   (покрывает самый частый случай группы «точные совпадения»),
   компактность файла, отсутствие смешения с неоднозначной разметкой.
4. **Ничего не переписывай на этом шаге.**

Вывод — см. шаблон в разделе «Формат вывода», секция Discovery.

---

## Phase 2 — Mapping

Для каждой группы из Discovery определи:
- **Direct replace** — legacy-разметка однозначно заменяется новым
  компонентом, props/слоты выводятся механически.
- **Manual review** — замена меняет поведение/структуру достаточно,
  что автоматическая замена рискованна.
- **Props/slot mapping** — таблица: legacy-атрибут/класс/дочерний элемент
  → prop/слот `[ComponentName]` из его спеки
  (`memory/ds-component-spec/log.*.json`).

**Если mapping неоднозначен** — задай **максимум 3 вопроса**, строго до
Phase 3. Формат — совместимый с Cursor `AskQuestion`: один вопрос за раз,
2–3 варианта (A/B/C), короткие лейблы без пояснений внутри варианта.
Пример:

    Вопрос: группа «похожие паттерны» (12 файлов, `.table-wrap` без
    `data-sortable`) — как маппить?
    A: как TableRow без сортировки
    B: manual review, не автоматизировать
    C: показать 3 примера перед решением

**Если неоднозначности нет** — явно напиши «Вопросов нет, mapping
однозначен для всех групп» и переходи к готовности Pilot.

**Отдельный gate — группы, генерируемые JS (не статичным HTML).** Если
разметка группы физически рендерится JS-шаблоном (template literals,
`.map()` над данными и т.п.), а не лежит статично в файле — даже при
визуальном совпадении с `direct replace` эта группа **не наследует**
общее подтверждение mapping. Правка кода, который генерирует разметку —
не то же самое, что правка самой разметки: нужен **отдельный явный
запрос на изменение именно генерирующего кода**, прежде чем Pilot или
Rollout тронут эту группу. До этого подтверждения группа остаётся
`deferred`, перечисляется отдельным списком в выводе, не молчаливо
пропускается.

Gate: Phase 3 не начинается, пока mapping не имеет статуса `confirmed`
(вопросы заданы и отвечены, либо изначально не требовались). JS-generated
группы могут оставаться `deferred` даже при `mapping.status: confirmed`
для остальных групп — это не блокирует Pilot по не-JS группам.

---

## Phase 3 — Pilot Migration

Запуск: `/migrate_component pilot`. Требует mapping со статусом
`confirmed` в активной сессии (иначе — останови и укажи, что нужно
завершить Phase 2).

Мигрируй **только 1–2 файла** из `pilot_candidates`, выбранных на
Discovery. Не расширяй список без отдельного запроса.

Для каждого файла:
- **Было** — компактный фрагмент legacy-разметки (не весь файл)
- **Стало** — компактный фрагмент с новым компонентом
- **Удалённые legacy-паттерны** — какие классы/теги/имена ушли
- **Новые компоненты/props** — что используется вместо них

**Риск сломать структуру** (нестандартная вложенность, инлайновые
обработчики без явного эквивалента, смешанная разметка) → не форсируй
замену. Останови файл, пометь `manual_review`, объясни причину одной
строкой, продолжи с оставшимся(-и) pilot-файлом(-ами).

После pilot — явно спроси подтверждение перед Phase 4:
«Pilot одобрен? Batch Rollout затронет ещё [N] файлов из скоупа.»
Не переходи к Phase 4 без ответа.

---

## Phase 4 — Batch Rollout

Запуск: `/migrate_component rollout`. Требует отдельное явное
подтверждение после Pilot (Шаг Phase 3), полученное **в этом же диалоге
или явно повторно** — не считай прошлое общее согласие достаточным, если
между Pilot и Rollout прошла отдельная реплика без подтверждения.

Дополнительный гейт (см. Шаг 0.1, Порог 2): если спека `[ComponentName]`
**или любого** `related_components` всё ещё `stage: draft` — Rollout не
выполняется, независимо от подтверждения.

Применяй **уже подтверждённый** mapping (Phase 2) к оставшимся файлам
скоупа группы «точные совпадения» и подтверждённых `direct replace`
групп. Группы `manual_review` и неразрешённые «неоднозначные случаи» —
**не трогай**, они остаются в follow-up (Phase 5). Группы, помеченные
`deferred` как JS-generated (Phase 2, «Отдельный gate»), — тоже не
трогай, даже если они входили в `direct replace`, пока не получено
отдельное подтверждение именно на изменение генерирующего кода.

Не показывай diff каждого файла. Вывод — только:
- список изменённых путей
- одна строка на файл: что заменено

См. шаблон в разделе «Формат вывода», секция Rollout.

---

## Phase 5 — Cleanup / Follow-up

Запуск: `/migrate_component cleanup` (можно сразу предложить после
Rollout, но не выполнять автоматически без ответа).

1. Проверь остатки `legacy_markers` — только в файлах из исходного
   скоупа Discovery плюс файлы, изменённые в Rollout (не весь репозиторий
   заново).
2. Сформируй follow-up список:
   - что не мигрировано (группы `manual_review`, неразрешённые
     неоднозначные случаи, `deferred` JS-generated группы)
   - что требует ручного UI-review (файлы, помеченные в Phase 3/4 как
     рискованные)
   - какие storybook/docs примеры ещё нужно добавить для покрытия
     мигрированных случаев
3. **Закрытие сессии.** Если после проверки остатков `legacy_markers`
   ничего не найдено **и** follow-up список пуст → присвой одновременно
   `phase: closed` **и** `rollout.status: completed` (см. «Память» —
   соотношение этих двух полей). Если что-то осталось (follow-up
   непустой или legacy-вхождения найдены) → `phase` остаётся `cleanup`,
   `rollout.status` остаётся `completed_partial`, сессия считается
   открытой до отдельного повторного запуска `/migrate_component
   cleanup` после устранения причин.

---

## Формат вывода

ALWAYS use this exact structure for the relevant phase. Each section is
mandatory; if empty, write «нет», don't omit it.

### Discovery (Phase 1)

    # Discovery: [ComponentName]
    Скоуп: [пути] · Маркеры: [список]

    ## Найдено
    Файлов всего: [N]

    | Группа              | Файлов | Примеры путей (до 3) |
    |----------------------|--------|------------------------|
    | Точные совпадения    | [N]    | [path, path, path]     |
    | Похожие паттерны     | [N]    | [path, path]           |
    | Неоднозначные случаи | [N]    | [path]                 |
    | Вне скоупа (Шаг 0.2) | [N]    | [path]                 |

    ## Кандидаты на pilot
    1. [path] — [почему выбран]
    2. [path] — [почему выбран]

    ## Следующий шаг
    Подтверди mapping (Phase 2) ниже, затем `/migrate_component pilot`.

### Mapping (Phase 2, продолжение того же вывода)

    ## Mapping

    | Группа | Действие | Props/слоты [ComponentName] |
    |--------|----------|------------------------------|
    | [группа] | [direct replace / manual review] | [маппинг] |

    ## Уточняющие вопросы
    Вопросов нет, mapping однозначен / [до 3 вопросов, формат A/B/C]

### Pilot (Phase 3)

    # Pilot: [ComponentName] — [N] файл(ов)

    ## [path/to/file]
    Было:
    ```[lang]
    [короткий фрагмент]
    ```
    Стало:
    ```[lang]
    [короткий фрагмент]
    ```
    Удалено: [legacy-классы/теги]
    Использовано: [новые props/слоты]
    Статус: migrated / manual_review — [причина, если manual_review]

    ## Подтверждение
    Pilot одобрен? Batch Rollout затронет ещё [N] файлов.

### Rollout (Phase 4)

    # Rollout: [ComponentName]
    Изменено файлов: [N]

    | Путь | Что заменено |
    |------|----------------|
    | [path] | [1 строка] |

    Осталось неоднозначных: [N] (см. Cleanup)
    Осталось legacy-вхождений: [N]

### Cleanup (Phase 5)

    # Cleanup: [ComponentName]

    ## Остатки legacy
    нет / [список путей]

    ## Follow-up
    - Manual review: [список / нет]
    - Storybook/docs примеры к добавлению: [список / нет]
    - Не мигрировано (причина): [список / нет]

    ## Статус сессии
    closed — легаси не найдено, follow-up пуст / cleanup — сессия открыта, см. follow-up выше

---

## Память

Файл: `memory/ds-component-migration/log.<имя>.json`
Имя берётся из `.claude/intake-user`.

Формат одной записи (сессия миграции одного компонента):

```json
{
  "id": "migration-001",
  "component": "TableRow",
  "related_components": ["Table"],
  "legacy_markers": [".table-wrap", ".old-table-row"],
  "scope": ["docs/storybook/"],
  "scope_signature": "table-wrap|old-table-row::docs/storybook/",
  "phase": "pilot",
  "discovery": {
    "date": "2026-07-04",
    "files_found": 14,
    "groups": {
      "exact_match": ["docs/storybook/components.html"],
      "similar_pattern": [],
      "ambiguous": []
    },
    "pilot_candidates": ["docs/storybook/components.html"]
  },
  "mapping": {
    "status": "confirmed",
    "decisions": [
      {"group": "exact_match", "action": "direct_replace"}
    ],
    "open_questions": []
  },
  "pilot": {
    "status": "approved",
    "files": ["docs/storybook/components.html"],
    "manual_review_flagged": []
  },
  "rollout": {
    "status": "not_started",
    "files_changed": 0,
    "remaining_ambiguous": 0
  },
  "cleanup": {
    "follow_up": []
  },
  "date": "2026-07-04",
  "_owner": "sergej"
}
```

`scope_signature` — ключ для решения «нужен ли новый full-scope скан».
Если `[ComponentName] + legacy_markers + scope` совпадают с последней
записью — переиспользуй `discovery.groups` вместо повторного поиска.

### Допустимые значения статусов (закрытый список)

`phase` (сессия целиком, строго в этом порядке, `closed` — терминальное):
`discovery` → `mapping` → `pilot` → `rollout` → `cleanup` → `closed`.
Условие присвоения `closed` — см. Phase 5, пункт 3.

`pilot.status` — Pilot никогда не блокируется готовностью спеки
(Порог 1 допускает `draft`), поэтому у него нет состояний
`blocked`/`ready`:
- `not_started` — pilot ещё не выполнялся. То, что pilot-скоуп уже
  выбран, видно по непустому `discovery.pilot_candidates`/`pilot.files`
  — отдельного статуса для этого не заводим (ранее использовавшееся
  значение `scoped_not_started` объединено с `not_started` по этой
  причине).
- `completed_pending_approval` — pilot выполнен, diff показан, ждёт
  подтверждения.
- `approved` — pilot подтверждён.

`rollout.status` — набор отличается от `pilot.status`, потому что
Rollout (в отличие от Pilot) блокируется Порогом 2:
- `not_started` — rollout ещё не запускался.
- `blocked` — Порог 2 не пройден, причина — в `rollout.blocked_reason`.
- `ready` — Порог 2 пройден, ждёт отдельного явного подтверждения на
  запуск.
- `completed_partial` — rollout выполнен для безопасных прямых
  совпадений; что осталось — в `remaining_ambiguous`/
  `deferred_not_touched`/`out_of_scope_untouched`. Это значение
  присваивается **сразу по итогам Phase 4**, независимо от того,
  окажется ли позже, что скоуп на самом деле закрыт полностью —
  Phase 4 сама по себе никогда не знает финальный ответ, это подтверждает
  только Phase 5 (см. `completed` ниже).
- `completed` — терминальное значение для rollout: все файлы скоупа
  мигрированы, `cleanup.follow_up` пуст. **Присваивается не на Phase 4, а
  на Phase 5**, вместе с `phase: closed` — это **одновременное
  присвоение одним и тем же действием** (Phase 5, пункт 3 «Закрытие
  сессии»), не два независимых события в разное время. Причина: условие
  для `completed` включает пустой `cleanup.follow_up`, а этот список
  формируется только в Phase 5 — Phase 4 физически не может знать, что
  follow-up окажется пустым, поэтому сразу после rollout всегда стоит
  `completed_partial`, апгрейд до `completed` — только через Cleanup.

**После каждой фазы, меняющей состояние сессии:**
1. Обнови запись (`phase`, соответствующий блок).
2. Синхронизируй по `skills/_shared/git-workflow.md`. Если файл
   недоступен — используй встроенные команды:

```bash
git pull --rebase
git add memory/ds-component-migration/log.<имя>.json
git commit -m "memory(ds-component-migration): [ComponentName] phase [N]"
git push
```

**Push не выполняется без моего явного подтверждения** — предложи
команды выше как следующий шаг вместо автоматического запуска.
`git pull --rebase` — обязателен перед push, не заменяй на `--merge`.

**После Pilot/Rollout, меняющих файлы репозитория** (не только память) —
коммит кода отдельно от коммита памяти, тоже только с подтверждением:

```bash
git add [изменённые файлы pilot/rollout]
git commit -m "migrate([ComponentName]): pilot [N] file(s)"
# или
git commit -m "migrate([ComponentName]): rollout [N] file(s)"
```

---

## Тон

Компактный и фазовый: одна фаза за раз, без забегания вперёд. Никаких
диффов на весь репозиторий — только summary и списки путей, кроме
Pilot, где показываются 1–2 сокращённых before/after. Неоднозначность —
всегда вопрос до правки, не предположение после. Явно останавливайся при
риске сломать структуру, а не «пробуй и смотри». Если ambiguities нет —
пиши это явно, не пропускай секцию молча.

---

## Версионирование и changelog

Версия — только в `metadata.version`:
- `patch` (1.0.X) — правка текста, уточнение формулировок
- `minor` (1.X.0) — новая секция шаблона, новое правило фазы
- `major` (X.0.0) — смена порядка/состава фаз (breaking)

### Changelog

- **1.2.1** — добавлено терминальное значение `rollout.status: completed`
  (полное, не `_partial`, завершение — все файлы скоупа мигрированы,
  `cleanup.follow_up` пуст). Уточнено соотношение с `phase: closed`:
  оба присваиваются **одновременно, одним действием на Phase 5**
  (пункт 3 «Закрытие сессии»), не раздельно на Phase 4/Phase 5 —
  `completed_partial` всегда стоит сразу после Phase 4, апгрейд до
  `completed` возможен только через Cleanup, т.к. условие зависит от
  `cleanup.follow_up`, которого на Phase 4 ещё не существует.
- **1.2.0** — по итогам первой реальной сессии (`migration-001`,
  Table/TableRow) и разбора `ds-component-migration-guide.md` v1.0.0:
  (1) Шаг 0.1 переписан как два явных порога — Порог 1 (Discovery/Pilot,
  спека существует, `draft` допустим) и Порог 2 (Rollout, спека
  `[ComponentName]` **и всех** `related_components` — `final`,
  `open_questions: 0`); Phase 4 сверяется теперь со всеми
  related_components, не только с основным компонентом. (2) Добавлен
  явный gate для JS-generated групп (Phase 2/4) — такая группа не
  наследует общее подтверждение mapping, нужен отдельный запрос на
  правку генерирующего кода, до этого остаётся `deferred`. (3) Добавлен
  терминальный статус `phase: closed` (Phase 5, пункт 3) с условием
  присвоения (легаси не найдено и follow-up пуст); в шаблон вывода
  Cleanup добавлена секция «Статус сессии». (4) В «Память» зафиксирован
  закрытый enum статусов: `phase` (discovery → mapping → pilot → rollout
  → cleanup → closed), `pilot.status` (not_started /
  completed_pending_approval / approved — без blocked/ready, Pilot не
  блокируется Порогом 2), `rollout.status` (not_started / blocked /
  ready / completed_partial); `scoped_not_started` объединён с
  `not_started` (различие выражается через `pilot.files`/
  `discovery.pilot_candidates`, не через статус).
- **1.1.0** — Шаг 0.1: явное правило для спеки в `stage: draft` / с
  открытыми вопросами — Discovery и Pilot разрешены в read-only-режиме
  с пометкой «⚠️ spec draft, open questions: [...]», Batch Rollout
  блокируется до перевода спеки в `stage: final`.
- **1.0.0** — первая версия. Пять фаз: Discovery → Mapping → Pilot →
  Batch Rollout → Cleanup. Активация строго по команде с раздельными
  подкомандами на фазу. Гейты подтверждения перед Pilot и перед Rollout.
  Предусловие: компонент должен иметь утверждённую спеку
  (`ds-component-spec`). Разграничение с `ds-component-audit`/
  `ds-component-spec` — не смешивать вердикт/спеку с миграцией. Кэш
  Discovery по `scope_signature` — без повторных full-repo сканов при
  неизменном скоупе. Compact output по умолчанию; полные before/after
  только для pilot-файлов. Вопросы по mapping — максимум 3, формат A/B/C.
  Push — только с явным подтверждением, `git pull --rebase` обязателен.
