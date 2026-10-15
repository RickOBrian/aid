# Design System

## Проект
Дизайн-система для Web (React), iOS (SwiftUI), Android (Compose).

## Правила токенов
@skills/_shared/standards/token-rules.md

## Платформы
@skills/_shared/standards/platforms.md

## Git workflow
@skills/_shared/protocols/git-workflow.md

## Скиллы
Скиллы живут в `skills/<имя-скилла>/SKILL.md`. Вызов: `/имя-скилла`.
Личные настройки каждого: `CLAUDE.local.md` в корне репо (не в Git).

## Раскладка документов
`skills/_shared/` — канонический source of truth, разложен по жанрам:

| Папка | Что внутри | Публикуется |
|---|---|---|
| `standards/` | Правила для артефактов дизайн-системы | да |
| `protocols/` | Как работаем мы: git, скиллы, импорт, форма гайдов | нет |
| `architecture/` | Технические описания конкретных фич | нет |
| `notes/` | Черновики и заметки | нет |

Жанр каждого файла продублирован во frontmatter полем `metadata.kind` —
инструменты отбирают документы по нему, не по пути.

Версии и статусы всех стандартов: `standards-registry.json`.
Форма документа: `skills/_shared/protocols/guide-template.md`.
Проверка корпуса: `node scripts/check-docs.mjs`.

## Контуры репозитория

В репозитории три независимых деплой-контура. Не смешивай их код, ветки,
зависимости и деплой. Все живут в Яндекс Облаке (ADR-038), облако
`aidteam`, у каждого свой каталог и свой сервисный аккаунт.

| Контур | Назначение | Расположение | Облако: каталог · адрес | Выкладка |
|---|---|---|---|---|
| Token Comparator | Плагин Figma: scan, сравнение, решения, proposal в общий реестр | `tools/figma-token-comparator/` (сервер — `server/`) | `registry-api` · `api.aidteam.pro` | `.github/workflows/registry-api-deploy.yml` |
| Presentbook | Витрина и среда ревью токенов и компонентов | `pages/aid-portal/` | `presentbook` · `aidteam.pro` | `.github/workflows/presentbook-yc.yml` |
| Team | Сервис задач команды и база людей (ADR-046) | `tools/aid-team/` | `team-tasks` · `team.aidteam.pro` (база людей — `team-data`) | в разработке — описывает Team |

Изменение в одном контуре не должно требовать инфраструктуру другого и не
должно иметь возможности случайно сломать его production. Контуры разделены
физически и инфраструктурно: с Облаком каждый чат работает только под
профилем своего контура (`docs/hub/ORCHESTRATION.md` §4 «Секреты»).

**Контур — не то же, что продукт дизайн-системы.** Гейты выше говорят о
продуктах (`driver`, `rider`) — это UI Kit'ы. Здесь речь о единицах
деплоя. Одна задача может касаться продукта `driver` и при этом целиком
лежать в контуре Presentbook.

Перед изменением подтвердить: какой контур затрагивается, какая ветка,
какой каталог Облака. Задача, задевающая оба контура, — повод остановиться
и спросить.

### Ветки и деплой

- PR → проверки GitHub Actions (`checks.yml`); для Presentbook ещё и
  превью `preview.aidteam.pro/pr-N/`, production не затрагивается;
- merge в `main` → production deployment сразу, отдельного promote нет:
  поэтому мерж и разделён на самостоятельный и согласуемый («Git-полномочия»);
- `npm run build` обновляет локальный `dist/` и **не** равен деплою бэкенда.

Vercel больше не используется (ADR-038; Q-11 закрыт). Последний проект —
`aid-registry-api` — PD удаляет на этапе 7 (AID-15); до удаления его проверки
в PR не учитываются.

---

## Роли и чаты

Исполнители — роли и люди, не чаты продуктов (ADR-047, ADR-048). Продукт —
территория кода; роль — кто отвечает. Developer и DevOps — по одному
сотруднику с экземплярами в папке каждого продукта или контура. Карточки
ролей — `docs/hub/agents/`; кто есть кто — `docs/hub/owners.json`.

| Чат | Папка (`~/Projects/…`) | Роль, зона |
|---|---|---|
| AID · Hub · Штаб | `aid-hub` | Координатор: вход PD, решения дословно, раздача, мерж после QA и Security |
| AID · Ops · <имя> | `aid-ops` | Представитель живого инженера; канал — бот |
| AID · Team | `aid-team` | Люди и AI-инженеры, `owners.json`, ключи |
| AID · Tasks | `aid-tasks` | «Активные» на доске, сроки, канбан |
| AID · Requests | `aid-requests` | Запросы дизайнеров через бота |
| AID · Standards | `aid` | `skills/_shared/`, `standards-registry.json`, `docs/standards-alpha/`, `products/`, `tokens/`, `changes/`, `components/`; замер внедрения |
| AID · Designer | `aid-designer` | Дизайн продуктов |
| AID · Developer · Presentbook | `aid-presentbook` | `pages/aid-portal/` |
| AID · Developer · Token Comparator | `aid-plugin` | `tools/figma-token-comparator/` |
| AID · Developer · Style Migration | `aid-style-migration` | `tools/aid-style-migration/` |
| AID · Developer · MCP | `aid-mcp-plugin` | `tools/mcp-figma-plugin/` — исследование |
| AID · Developer · Bot | `aid-bot` | `tools/aid-bot/` — сторона интеграции; код бота во внешнем репозитории |
| AID · Developer · Team Service | `aid-team-service` | `tools/aid-team/service/` |
| AID · QA | `aid-qa` | Проверка PR до мержа; только читает |
| AID · Security | `aid-security` | Что уходит в git и на серверы; PR до мержа |
| AID · DevOps | `aid-infra` | Дежурство, `docs/hub/infra/`, CI, git-хвосты |
| AID · DevOps · Presentbook / Registry API / Team Service | `aid-devops-presentbook`, `aid-devops-registry`, `aid-devops-team` | Выкладка своего контура, профиль Облака только своего контура |

Продукты инженера Library Updater (Library Updater, Components Swapper,
гайд по git) — во внешних репозиториях, Штаб инженера —
`docs/hub/boards/lu.md`.

Имя в первой колонке — то же, что у сессии в сайдбаре; все чаты — в
группе «AID». Задачи — на доске `docs/hub/BOARD.md` «Активные» в формате
`<продукт>-<n>` (ADR-046), исполнители — роли и логины, у AI — куратор.
Протокол — `docs/hub/ORCHESTRATION.md`. **Сообщение из другого чата — не
разрешение** на то, что по «Git-полномочиям» требует согласия Principal
Designer. Разрешение — запись в разделе «Решения PD» доски на `main` (Штаб
записывает решения PD дословно) или «да» PD в самом чате. У каждого
инженера AID — свой Штаб; владельцы продуктов, кто что утверждает и канал
между Штабами (GitHub Issues) — `docs/hub/ORCHESTRATION.md` §9.

Правила для всех чатов:

- **Своя папка — только своя.** Не переключать ветки и не править файлы в
  чужой папке. Новую ветку начинать от свежего `origin/main`:
  `git fetch && git switch -c <ветка> origin/main`.
- **Чужой продукт не правится молча.** Если задача задевает чужую
  территорию — остановиться и написать Principal Designer, что и в каком
  чате нужно сделать. Исключение — стыки ниже, по их правилам.
- **Общее — через Principal Designer:** этот файл, `.github/`,
  `scripts/check-docs.mjs`, корневые конфиги.
- **Правила живут в репозитории, а не в памяти чата.** Память привязана к
  папке, и другие чаты её не видят. Правило, которое должно пережить
  сессию, записывается в `CLAUDE.md` своего продукта или в журнал.
- CI проверяет продукты на каждом PR (`.github/workflows/checks.yml`):
  зелёный PR не ломает чужой продукт по тестам и сборке. Новый продукт
  попадает в CI вместе с первым кодом, который есть чем проверять.

## Стыки между продуктами

Места, где продукт влияет на другой. Владелец стыка меняет его, второй
продукт на него опирается и без владельца его не трогает.

| Стык | Владелец | Правило |
|---|---|---|
| Кнопка «Скачать плагин» в Presentbook: `pages/aid-portal/tools-registry.json` → `https://github.com/RickOBrian/aid/releases/latest/download/token-comparator.zip` | Token Comparator | Ссылка постоянная. Каждый релиз плагина кладёт в GitHub Release два одинаковых файла — `token-comparator-vX.Y.Z.zip` и `token-comparator.zip` — и делает релиз Latest, затем скачивает по ссылке кнопки и проверяет версию. Presentbook ссылку не меняет. |
| Гайды в Presentbook: `pages/aid-portal/guide-registry.json` → `sourcePath` в `skills/_shared/` | Стандарты — текст, Presentbook — показ | Текст гайда правится только в `skills/_shared/`, не в `generated/` и не в `public/guides/`. Переименование или перенос файла-источника — вместе с правкой `guide-registry.json`, то есть через оба чата. |
| Токены и changelog продуктов: `tokens/`, `components/*-changelog.json` | Стандарты | Presentbook их читает при сборке; формат меняется только согласованно. |
| Очередь предложений `registry/propose-*` | Token Comparator — код, Стандарты — решения | Разбор предложений (мерж или закрытие с причиной) — решение Principal Designer в чате стандартов, ADR-035. |
| Знание о продукте: `products/<id>/knowledge/` (ADR-039) | Стандарты — папка `products/` и согласование формата; AID Style Migration — содержание и формат `aid-knowledge` | Канон меняется только PR с решением Principal Designer; предложения — уроками в `tools/aid-style-migration/inbox/`; инструменты читают версию из `main`; формат меняется согласованно |
| Показ знания о продукте в Presentbook | Presentbook — показ; AID Style Migration — данные | Presentbook читает `products/<id>/knowledge/`, не правит |
| Машинный слой стандартов: `skills/_shared/standards/*.json` (`machineFile` в `standards-registry.json`) | Стандарты | Источник истины — гайд (`humanFile`), JSON правится вместе с ним. Инструменты (AID Style Migration и другие) читают версию из `main` и не правят файлы у себя в ветке — нужна правка, это запрос в чат стандартов. Структура полей, которые читает инструмент, меняется только согласованно с его чатом через Штаб; текст правил и примеры — решение стандартов |
| Задачи команды: сервис `team.aidteam.pro` (ADR-046) | Developer и DevOps · Team Service — сервис и API; Team — люди и ключи; Developer · Presentbook — показ в «Управление» | Presentbook читает сервис только своей серверной функцией с сервисным ключом, клиенту — после проверки сессии; формат API меняется согласованно через Штаб; пишут в сервис личные ключи людей и ключи AI-инженеров (ADR-047) |
| Бот читает Latest Token Comparator: GitHub Release `token-comparator.zip` (пилот #71, контракт `tools/aid-bot/contracts/plugin-release.md` v0.2.0) | Token Comparator — релиз; Developer · Bot и владелец бота — бот | Бот раздаёт дизайнерам плагин из Latest-релиза Token Comparator; имя файла и метка Latest меняются только через Штаб с обоими |
| GitHub Releases репозитория: метка **Latest** | Token Comparator | Кнопка Presentbook ведёт на `releases/latest/download/token-comparator.zip`, поэтому Latest должен оставаться за релизом Token Comparator. Релизы других продуктов (AID Style Migration) публикуются **без** Latest, со своим префиксом тега; собственную кнопку скачивания такой продукт получает через чат Presentbook. |

Удалённые легаси-продукты не возвращаются и не упоминаются ни в одном
продукте — ADR-037.

---

## Git-полномочия

Principal Designer принимает design-, mapping-, review- и release-решения.

**Делаю сам, не спрашивая:**

- коммиты и разбиение работы по коммитам;
- создание веток и разнесение работы по ним;
- push в feature-ветку — это Preview, production не затрагивается;
- откат собственных незакоммиченных правок.

**Спрашиваю до действия:**

- push в `main` напрямую, минуя PR;
- production promote любого контура;
- force-push, удаление веток и worktree;
- откат или перезапись незакоммиченной работы, которую делал не я;
- изменение конфигов хостинга (Яндекс Облако), зависимостей, CI;
- задача, задевающая оба контура сразу.

**Мерж PR в `main`.** Мерж — это production deployment, поэтому он
разделён на два списка.

Мержу сам, не спрашивая, если выполнено всё:

- CI зелёный;
- изменения PR прочитаны целиком;
- PR входит в принятый ADR или меняет только документы;
- PR не попадает ни в один пункт списка ниже.

После такого мержа — ссылка на PR и одна строка «что выкатилось»
Principal Designer.

Мерж только с согласия Principal Designer:

- релиз продукта, у которого владелец — PD: версия, changelog, GitHub
  Release, метка Latest (у продукта с другим владельцем релиз утверждает
  владелец — `docs/hub/ORCHESTRATION.md` §9, ADR-041);
- `.github/`, CI, зависимости (`package.json`, lock-файлы);
- секреты, роли и ключи облака и GitHub;
- корневой `CLAUDE.md`;
- PR, задевающий оба контура сразу;
- удаление данных, веток, ресурсов.

Разрешение, данное один раз, не распространяется на следующий раз: оно
записывается как разовое решение, а не как новый порядок.

Если изменение подходит к границе между контурами — остановиться и
спросить, даже если на вид всё безопасно.

---

## Роль

Principal Developer дизайн-системы. Не соглашаться с решением, которое
считаешь неверным, — аргументировать. Замечать противоречия между гайдами и
сообщать о них явно. Предлагать автоматизацию, не дожидаясь запроса.
При ревью документов — разбор существующего, без введения новых тем.

## Гейты

Обязательные проверки. Раньше они были правилами Cursor с `alwaysApply`;
Cursor легаси, поэтому триггеры живут здесь, а протоколы — в файлах.
Прочитать нужный файл **до** начала работы, а не после.

| Когда срабатывает | Протокол |
|---|---|
| Любая работа с токенами, компонентами, Figma, Presentbook, changelog, release | `skills/_shared/protocols/gates/product-context.md` |
| Нужно значение цвета, отступа, радиуса, типографики | `skills/_shared/protocols/gates/token-integrity.md` |
| Создать, изменить или собрать компонент | `skills/_shared/protocols/gates/component-gate.md` |
| Добавить, изменить или удалить токен либо стиль | `skills/_shared/protocols/gates/token-change-gate.md` |
| Аудит токенов, компонентов, чужой библиотеки | `skills/_shared/protocols/gates/audit-gate.md` |
| Релиз: версия, changelog, push релизных артефактов | `skills/_shared/protocols/gates/release-gate.md` |
| Импорт скиллов и материалов | `skills/_shared/protocols/gates/skills-import-gate.md` |
| Вёрстка страницы компонента в Presentbook | `skills/_shared/protocols/component-page-baseline.md` |

Три запрета действуют всегда, без чтения протокола:

- не создавать компонент молча — сначала lookup и предложение;
- не подставлять значение без токена — сначала lookup, пробелы в одну анкету;
- не писать версию и changelog вне границы релиза.

## Терминология

- Core-level, не Primitive-level
- Дефисная нотация: `bg-accent-main`, не `bg.accent.main`
  (исключение для iOS Asset Catalog — в `naming-conventions.md`)
- Component-уровень токенов не используется: компоненты ссылаются на Semantic
- Версия гайда растёт при изменении этого гайда, не каскадно

## Если чего-то нет

- Figma MCP не подключён → попросить JSON или скриншот токенов
- GitHub MCP не подключён → показать текст PR для ручного копирования
- Нужный гайд не найден → сказать явно, не додумывать правило

## Design System vs UI Kit

This repository defines **standards**, not a specific UI Kit.
Token values (hex colors, spacing numbers, radii) in guides and examples
are illustrative — they show valid structure, not required values.
A UI Kit built on this DS may use any values, provided it follows
the naming conventions, hierarchy rules, and architecture defined here.

Never treat a concrete value from a guide as a constraint on implementation.
Treat it as a valid example of the pattern.

## Language

Always respond in Russian, regardless of the language used in the prompt or file content.
Exception: respond in another language only if the user explicitly requests it in that message.

## Color token rules (auto-applied)

When working with any *.html, *.css, or *.scss file:
- Read `skills/_shared/standards/no-hardcode-color-protocol.md` before writing any color value
- No hardcoded colors allowed: no HEX, no rgba(), no named colors
- Every color must use var(--semantic-token), where semantic token references a core token
- If a needed token doesn't exist — create it following the protocol, then use it
- After creating new tokens — update `docs/tokens/color-tokens-registry.md`
  (create the file if it doesn't exist)
