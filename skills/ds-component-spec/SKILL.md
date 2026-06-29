---
name: ds-component-spec
metadata:
  version: "1.2.0"
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Генерирует спецификацию компонента дизайн-системы для Web (React),
  iOS (SwiftUI) и Android (Compose) из одного описания, скриншота
  или Figma-фрейма. Применяет четырёхуровневую архитектуру (Item →
  Surface View → Structural View → Layout) и двухуровневую систему
  токенов (core → semantic).
  Активируй когда: «сделай спек компонента», «опиши компонент для
  разработчиков», «создай spec для», «подготовь документацию
  компонента», «какой уровень у этого компонента», «как назвать
  компонент», «какие токены использовать», «проверь архитектуру
  компонента», передан Figma-фрейм или скриншот компонента.
---

# DS Component Spec — v1.2.0

Принимает компонент в любом виде (Figma-фрейм, скриншот, текст, код)
и выдаёт готовую спецификацию: уровень архитектуры, нейминг, токены,
слоты, состояния, реализацию на трёх платформах и требования по
доступности. Спека пишется один раз — закрывает вопросы дизайна и
всех трёх платформ разработки.

---

## Контекст окружения

Прочитай в начале каждой сессии:
- `.claude/intake-user` — кто запустил (фамилия латиницей)
- `skills/_shared/token-rules.md` — двухуровневая система токенов (Core → Semantic)
- `skills/_shared/platforms.md` — особенности Web / iOS / Android
- `skills/_shared/component-states-guide.md` — нейминг и логика состояний

**Если `.claude/intake-user` не существует:**
Спроси имя одной строкой, покажи существующие
`memory/ds-component-spec/log.*.json`, уточни «ты новый или
один из этих?». Создай файл с подтверждённым именем.

**Если `.claude/intake-user` существует, но имя не совпадает ни с одним
`memory/ds-component-spec/log.*.json`:**
Уточни одной строкой: «Имя [имя] новое — ты новый сотрудник?»
Если да — создай новый log-файл. Если нет — скорее всего опечатка,
попроси исправить `intake-user` вручную и перезапустить.

**Если `skills/_shared/token-rules.md` не существует:**
Предупреди: «файл _shared/token-rules.md не найден, работаю
на встроенных правилах». Используй встроенные правила из
раздела «Встроенные правила токенов» ниже.

**Если `skills/_shared/platforms.md` не существует:**
Предупреди аналогично, используй встроенные правила из раздела
«Встроенные правила платформ» ниже.

**Если `skills/_shared/component-states-guide.md` не существует:**
Используй встроенную таблицу состояний из раздела «Встроенные правила состояний» ниже.

**Если Figma MCP подключён:** забери компонент и токены из фрейма напрямую.
**Если нет:** предупреди «Figma MCP не подключён» и попроси скриншот
или текстовое описание. Не блокируй работу — продолжай с тем, что есть.

---

## Шаг 1. Получи компонент и контекст

Принимай: Figma-ссылку, скриншот, текстовое описание, существующий код.

Спроси только если неочевидно из материала (не больше 3 вопросов):
1. Для каких платформ нужна спека? (по умолчанию — все три)
2. Стадия: черновик для обсуждения или финал для разработки?
3. Есть ли платформенные исключения (только web, только iOS)?

Не задавай вопросы ради ритуала. Если всё понятно — переходи к шагу 2.

---

## Шаг 2. Определи уровень архитектуры

Используй правила из `skills/_shared/platforms.md` (если файл есть).
Если нет — встроенные правила ниже.

**Четыре уровня:**

- **Item** — только контент. Нет фона, нет формы, нет собственных отступов.
  Примеры: Icon, Text, Image, Number, Dot, AvatarImage.

- **Surface View** — один основной контент-элемент в оболочке
  (фон + форма + отступы). Вспомогательный элемент допустим
  (иконка рядом с текстом в Badge), если нет второго *именованного* слота.
  Примеры: Badge, BadgeStatus, BadgeCount, ButtonIcon, ButtonText,
  Avatar, AvatarButton, Tag, Switch, Checkbox, Radio.

- **Structural View** — два и более именованных слота, составной
  внутренний макет. Задаёт компоненту смысловую роль.
  Примеры: ListRow, IslandProduct, WidgetBalance, NavBar, StatTile,
  FieldCheckbox, FieldRadio.

- **Layout** — только расстановка группы компонентов. Нет собственного
  дизайна. Не управляет состояниями empty / loading / error.
  Примеры: VStack, HStack, Grid, List.

**Граничные случаи:**
- Switch, Checkbox, Radio без внешнего Label → Surface View.
  С внешним Label (FieldCheckbox, FieldRadio) → Structural View.
- StatTile — Structural View: два равнозначных слота Label + Value.
- CollectionView — не уровень архитектуры; отдельная роль,
  решает что рендерить (данные / скелетон / EmptyState / ошибку).

Если уровень неочевиден — скажи явно и объясни почему. Не угадывай.

---

## Шаг 3. Проверь нейминг

Формула: **Role + Entity**

- **Role** — тип компонента (всегда первым):
  Badge, Button, Avatar, Icon, Text, Row, Island, Widget, Field, Surface.
- **Entity** — тип содержимого:
  Status, Count, Product, Balance, Media, Icon, Text.

Примеры: BadgeStatus, BadgeCount, ButtonIcon, ButtonText, AvatarButton,
IslandProduct, WidgetBalance, FieldCheckbox, FieldRadio, StatTile, ListRow.

**Исключения** — устоявшиеся имена без формулы:
Avatar, Badge, Dialog, Toast, Tooltip, Switch.

**Нельзя:**
- Суффикс Item в самостоятельном компоненте (IconItem → нет).
  Item допустим только как вложенный элемент коллекции: List.Item, Menu.Item.
- Имя по реализации, а не по роли: CardWithIconAndTitle → IslandProduct.

**Стандартные имена слотов** для Structural View (кросс-платформенно):
`leading`, `trailing`, `content`, `header`, `footer`, `title`,
`subtitle`, `action`. Не изобретай платформенные варианты.

---

## Шаг 4. Проверь токены

Используй правила из `skills/_shared/token-rules.md` (если файл есть).
Если нет — встроенные правила ниже.

Два уровня:
- **Core** — сырые значения: `color-blue-500`, `shape-corner-8`, `spacing-4`
- **Semantic** — назначение: `color-surface-default`, `color-text-primary`, `color-action-primary`

Правила:
- Компоненты используют **только semantic‑токены**.
- Core‑токены применяются только при определении semantic‑токенов, не в компонентах.
- Захардкоженное значение (`background: #0057FF`) вместо токена — блокер.
- Если нужного semantic-токена нет — отметь в спеке:
  «⚠️ нужно добавить токен: [предлагаемое имя]».

---

## Шаг 5. Выдай спецификацию

ALWAYS use this exact structure. Each section below is mandatory.
If a section has no content, write «нет» — do not omit the section.

Шаблон спеки (4-space indent, чтобы внутренние блоки кода не ломали структуру):

    # [ComponentName] — Spec
    Уровень: [Item / Surface View / Structural View / Layout]
    Платформы: [Web · iOS · Android]
    Дата: [YYYY-MM-DD]   Автор: [из .claude/intake-user]

    ## Назначение
    [1–2 предложения: что делает, где используется, что НЕ делает]

    ## Уровень и обоснование
    [Почему именно этот уровень. Если граничный случай — объясни.]

    ## Нейминг
    Имя: [ComponentName]
    Формула: [Role] + [Entity] — [почему именно эти слова]
    Слоты (только Structural View): leading, content, trailing, ...

    ## Токены
    | Свойство         | Core                 | Semantic                  |
    |------------------|----------------------|---------------------------|
    | background       | color-neutral-0      | color-surface-default     |
    | background:hover | —                    | color-surface-hover       |
    | color            | color-neutral-900    | color-text-primary        |
    | border-radius    | shape-corner-8       | —                         |
    | padding-h        | spacing-4            | —                         |
    ... ⚠️ нужно добавить токен: [имя] — если semantic-слой неполный...

    ## Варианты
    | Variant   | Описание          | Ключевой semantic-токен            |
    |-----------|-------------------|-------------------------------------|
    | primary   | Основное действие | color-action-primary               |
    | secondary | Вторичное         | color-surface-default              |

    ## Состояния
    Имена состояний — по таблице Figma из `component-states-guide.md`.

    | Состояние | Визуальное изменение          | Semantic-токен                    |
    |-----------|-------------------------------|-----------------------------------|
    | default   | —                             | —                                 |
    | hovered   | фон меняется (только Web)     | bg-accent-states-hover            |
    | pressed   | фон темнее                    | bg-accent-states-pressed          |
    | focused   | рамка фокуса                  | bg-accent-states-focused          |
    | selected  | активный / выбранный          | bg-accent-states-active           |
    | disabled  | opacity 40%, не интерактивен  | bg-accent-states-disable          |
    | loading   | спиннер, не интерактивен      | —                                 |
    | skeleton  | серые заглушки                | —                                 |
    | error     | красная рамка + текст ошибки  | ⚠️ нужно добавить токен           |

    Убирай из таблицы строки, неприменимые к компоненту.
    Правила комбинирования состояний — в `component-states-guide.md`.

    ## Lifecycle (только Structural View)
    нет / [решение: кто управляет видимостью, анимацией появления]

    ## Реализация — Web (React)
    Props: variant, size, isDisabled, onClick
    Слоты (Structural View): leading, children, trailing
    Токены: CSS-переменные через design-token-утилиту

    Пример:
    ```tsx
    <[ComponentName] variant="primary" onClick={handleClick}>
      Label
    </[ComponentName]>
    ```

    ## Реализация — iOS (SwiftUI)
    struct [ComponentName]View: View
    Параметры: title: String, variant: [ComponentName]Variant = .primary,
      isDisabled: Bool = false, action: (() -> Void)? = nil
    Токены: DSTokens.[name].background.default, DSTokens.[name].corner

    Пример:
    ```swift
    [ComponentName]View(title: "Label", variant: .primary) {
      handleTap()
    }
    ```

    ## Реализация — Android (Compose)
    @Composable fun [ComponentName](text: String,
      variant: [ComponentName]Variant = [ComponentName]Variant.Primary,
      enabled: Boolean = true, onClick: (() -> Unit)? = null,
      modifier: Modifier = Modifier)
    Токены: DSTheme.tokens.[name].background.default,
      RoundedCornerShape(DSTheme.tokens.[name].corner)

    Пример:
    ```kotlin
    [ComponentName](
      text = "Label",
      variant = [ComponentName]Variant.Primary,
      onClick = { handleClick() }
    )
    ```

    ## Доступность
    | Платформа | Свойство            | Значение                              |
    |-----------|---------------------|---------------------------------------|
    | Web       | role                | button / checkbox / img (нативный)    |
    | Web       | aria-label          | [когда нет видимого текста]           |
    | Web       | aria-disabled       | true когда disabled                   |
    | iOS       | accessibilityLabel  | [текст для VoiceOver]                 |
    | iOS       | accessibilityTraits | .button / .image / .isSelected        |
    | Android   | contentDescription  | [текст для TalkBack]                  |
    | Все       | touch target        | минимум 44×44pt / 48×48dp             |
    | Все       | keyboard            | Tab фокус, Enter/Space активация      |

    ## Открытые вопросы
    нет / [ ] [вопрос] → кому адресован

После выдачи предложи следующий шаг:
- Figma MCP доступен → «Хочешь обновить токены во фрейме?»
- GitHub MCP доступен → «Создать PR с документацией?»
- Ничего не подключено → «Готово. Скопируй спеку в репо документации.»

---

## Встроенные правила токенов

*Используются только если `skills/_shared/token-rules.md` не найден.*

- Core — только сырые значения, без смысловой нагрузки.
- Semantic — назначение, не привязан к конкретному компоненту.
- Компоненты используют только semantic‑токены; Core‑токены — только при определении semantic.
- Захардкоженное значение вместо токена — блокер, отмечать явно.
- Отсутствующий semantic-токен — отмечать как «⚠️ нужно добавить».

---

## Встроенные правила платформ

*Используются только если `skills/_shared/platforms.md` не найден.*

- **Web:** API компонента — Props interface в TypeScript.
  Токены через CSS-переменные или design-token-утилиту.
- **iOS (SwiftUI):** struct ...View: View. DSTokens extension для токенов.
  Слоты — через @ViewBuilder closure или параметр типа AnyView.
- **Android (Compose):** @Composable функция. Токены через DSTheme.
  Слоты — через @Composable lambda параметры.
- **Все платформы:** touch target минимум 44×44pt / 48×48dp.
  Имена слотов одинаковые кросс-платформенно (leading, trailing, content).

---

## Встроенные правила состояний

*Используются только если `skills/_shared/component-states-guide.md` не найден.*

| Figma    | Web      | iOS         | Android  | Когда                                 |
|----------|----------|-------------|----------|---------------------------------------|
| default  | default  | normal      | enabled  | Базовое состояние                     |
| hovered  | hover    | —           | —        | Наведение (только Web)                |
| pressed  | active   | highlighted | pressed  | Момент нажатия                        |
| focused  | focused  | —           | —        | Фокус клавиатуры                      |
| selected | selected | selected    | selected | Выбран                                |
| disabled | disabled | disabled    | disabled | Недоступен                            |
| loading  | loading  | loading     | loading  | Спиннер внутри компонента             |
| skeleton | skeleton | skeleton    | skeleton | Первичная загрузка                    |
| error    | error    | error       | error    | Ошибка валидации                      |

Приоритет поглощения: disabled > loading > pressed > selected/error > hovered+focused.

---

## Память

Файл: `memory/ds-component-spec/log.<имя>.json`
Имя берётся из `.claude/intake-user`.

Формат одной записи:

```json
{
  "id": "spec-001",
  "component": "BadgeStatus",
  "level": "surface-view",
  "platforms": ["web", "ios", "android"],
  "date": "2026-06-18",
  "stage": "final",
  "open_questions": 0,
  "missing_tokens": [],
  "_owner": "ivanov"
}
```

**После каждой спеки:**
1. Добавь запись в файл памяти
2. Синхронизируй по командам из `skills/_shared/git-workflow.md`.
   Если файл недоступен — используй встроенные команды:

```bash
git pull --rebase
git add memory/ds-component-spec/log.<имя>.json
git commit -m "spec([ComponentName]): add spec v1.0.0"
git push
```

**Если среда не сохраняет файлы между сессиями** — предупреди один раз:
«Память не переживёт этот чат. Сохрани спеку вручную.»

**При следующем запуске** читай все `memory/ds-component-spec/log.*.json`:
- Если компонент уже спекался — скажи дату и стадию предыдущей спеки.
- Если в прошлых спеках накопились `missing_tokens` — напомни
  как системная проблема до начала работы.

---

## Тестирование

Рядом с этим файлом должен лежать `skills/ds-component-spec/TESTING.md` —
чеклист для проверки скилла перед мержем. Если файл отсутствует —
создай его по шаблону из гайда `claude-skills-guide.md`, раздел «Фаза 3».

## Тон

Читатели — Principal Designer и разработчики трёх платформ.
Каждая платформенная секция должна быть понятна без чтения остальных:
iOS-разработчик не обязан читать Web-секцию, чтобы понять свою.

Каждый токен — с примером использования, не только с названием.
Если токен нужно добавить в систему — говори явно, не молчи.
Если уровень архитектуры неочевиден — говори явно, не угадывай.
Если внешний инструмент недоступен — говори явно, предлагай ручной путь.

---

## Версионирование и changelog

Версия — только в `metadata.version` во frontmatter:
- `patch` (1.0.X) — правка текста, уточнение формулировок
- `minor` (1.X.0) — новая секция в шаблоне, новое правило
- `major` (X.0.0) — смена структуры шаблона вывода (breaking)

При `major`: старые спеки остаются валидными, новые создаются
по новому формату. Если нужна миграция — отдельный скрипт в `scripts/`,
не часть этого файла. В changelog явно: «спеки v1.x читаются,
новые создаются по v2.0».

### Changelog

- **1.2.0** — шаблон секции «Состояния» расширен: добавлены `hovered`,
  `focused`, `selected`, `skeleton`, `error`; добавлена ссылка на
  `component-states-guide.md`; в «Контекст окружения» добавлен этот файл;
  добавлены «Встроенные правила состояний» как fallback.
- **1.1.0** — переход на двухуровневую систему токенов (Core → Semantic),
  удалены ссылки на component‑токены, обновлён шаблон таблицы токенов.
- **1.0.0** — базовая спека: 4-уровневая архитектура, формула Role+Entity,
  токены, варианты, состояния, lifecycle для Structural View,
  реализация Web/iOS/Android, доступность, память.
  Graceful degradation: fallback для отсутствующих `_shared/`-файлов
  и MCP-инструментов.
